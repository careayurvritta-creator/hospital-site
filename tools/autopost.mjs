#!/usr/bin/env node
/**
 * Ayurvritta blog auto-poster.
 *
 * Picks a topic from the researched topic list using seasonal (Ayurvedic
 * ritucharya) and occasion/observance context, writes a COMPLETE blog post in
 * the site's exact markdown/frontmatter conventions, attaches a Wikimedia
 * Commons image, validates the result, records every run in
 * data/blog/autopost-log.json, and (optionally) commits + pushes so Vercel
 * auto-deploys. The committed log is what surfaces in Vercel build output.
 *
 * Zero runtime dependencies — only Node >= 18 built-ins + global fetch, so the
 * GitHub Actions runner needs no `npm install`.
 *
 * Usage:
 *   node tools/autopost.mjs --list                          # show candidate topics + scores
 *   node tools/autopost.mjs --date 2026-08-11 --dry-run     # generate but do not write/commit
 *   node tools/autopost.mjs --date 2026-08-11 --commit      # write + commit + push (CI)
 *   node tools/autopost.mjs --topic giloy --commit          # force a specific topic
 *   node tools/autopost.mjs --date 2026-08-11 --no-image    # skip network image fetch
 *
 * Env:
 *   NVIDIA_API_KEY   — optional. When present, AI writes go directly to
 *                      https://integrate.api.nvidia.com/v1/chat/completions.
 *                      When absent, AI writes go through the site's deployed
 *                      /api/nvidia proxy (which reads the key server-side in
 *                      Vercel), so the CI runner needs no secret.
 *   NVIDIA_MODEL     model id for the direct path, default meta/llama-3.1-8b-instruct
 *   AUTO_POST_NVIDIA_URL  override the proxy endpoint (default https://ayurvrittaayurveda.in/api/nvidia)
 *   AUTO_POST_NO_AI=1     skip AI entirely and use the deterministic fallback writer
 *   AUTO_POST_NO_PUSH=1   commit but do not push
 */

import { execSync } from 'node:child_process';
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
  rmSync,
} from 'node:fs';
import { join, dirname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const POSTS_DIR = join(ROOT, 'data', 'blog', 'posts');
const DRAFTS_DIR = join(ROOT, 'data', 'blog', 'drafts');
const IMG_DIR = join(ROOT, 'public', 'images', 'blog', 'posts');
const TOPICS_FILE = join(ROOT, 'knowledge', 'top-60-ayurveda-topics.md');
const LOG_FILE = join(ROOT, 'data', 'blog', 'autopost-log.json');

const VALID_CATEGORIES = ['Ayurveda', 'Yoga', 'Nutrition', 'Lifestyle', 'Wellness'];
const CATEGORY_IMAGE = {
  Ayurveda: '/images/blog/ayurveda.svg',
  Yoga: '/images/blog/yoga.svg',
  Nutrition: '/images/blog/nutrition.svg',
  Lifestyle: '/images/blog/lifestyle.svg',
  Wellness: '/images/blog/wellness.svg',
};
const AUTHORS = { 'dr-gor': 'Dr. Gor', 'dr-sharma': 'Dr. Sharma' };

// ---------- generic words that carry no topic identity (mirrors scripts/generate-blog-stubs.mjs) ----------
const GENERIC_WORDS = new Set([
  'ayurveda', 'ayurvedic', 'treatment', 'treatments', 'remedies', 'remedy', 'natural',
  'naturally', 'diet', 'care', 'herbs', 'herbal', 'benefits', 'management', 'manage',
  'health', 'therapy', 'therapies', 'therapeutic', 'support', 'supportive', 'help', 'helps',
  'plan', 'plans', 'routine', 'food', 'foods', 'prevention', 'prevent', 'reverse', 'how',
  'to', 'and', 'the', 'for', 'with', 'what', 'it', 'is', 'long', 'term', 'avoid',
]);

// ---------- author assignment by specialty keywords (source of truth: data/blog/authors.ts) ----------
const DR_SHARMA_KEYS = ['panchakarma', 'virechana', 'basti', 'shirodhara', 'nasya', 'metabol', 'digest', 'liver', 'diabet', 'cholesterol', 'heart', 'blood pressure', 'joint', 'arthritis', 'asthma', 'kidney', 'uti', 'urine', 'sinus', 'constipation', 'ibs', 'acid', 'ama', 'agni', 'immunity', 'cold', 'cough', 'fever', 'anemia', 'iron', 'fat', 'weight', 'dosha', 'prakriti'];
const DR_GOR_KEYS = ['women', 'pregnancy', 'menstrual', 'period', 'menopause', 'fertility', 'yoga', 'stress', 'anxiety', 'depression', 'mood', 'sleep', 'insomnia', 'skin', 'hair', 'acne', 'pcos', 'migraine', 'headache', 'thyroid'];

// ---------- text helpers ----------
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function titleize(text) {
  const stop = new Set(['a', 'an', 'the', 'and', 'for', 'of', 'to', 'in', 'on', 'with', 'vs', '&']);
  return text
    .split(/[\s:\u2013\u2014-]+/)
    .filter(Boolean)
    .map((w) => (stop.has(w.toLowerCase()) && w.length > 1 ? w : w[0].toUpperCase() + w.slice(1)))
    .join(' ');
}

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function words(text) {
  return normalize(text).split(/\s+/).filter(Boolean);
}

function distinctiveWords(text) {
  return words(text).filter((w) => w.length > 3 && !GENERIC_WORDS.has(w));
}

function pickAuthor(topic) {
  const t = topic.toLowerCase();
  const sharma = DR_SHARMA_KEYS.filter((k) => t.includes(k)).length;
  const gor = DR_GOR_KEYS.filter((k) => t.includes(k)).length;
  return gor >= sharma ? 'dr-gor' : 'dr-sharma';
}

function parseArgs(argv) {
  const args = { date: null, topic: null, list: false, dryRun: false, commit: false, noImage: false, force: false, noFetch: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--list') args.list = true;
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--commit') args.commit = true;
    else if (a === '--no-image') args.noImage = true;
    else if (a === '--no-fetch') args.noFetch = true;
    else if (a === '--force') args.force = true;
    else if (a === '--date') args.date = argv[++i] || null;
    else if (a === '--topic') args.topic = argv[++i] || null;
  }
  return args;
}

// ---------- RITUCHARYA context ----------
// Windows use the classical mid-month boundaries (approximate).
const RITUS = [
  {
    key: 'shishira', name: 'Shishira', from: '01-15', to: '03-14',
    dosha: 'Kapha accumulates', agni: 'Moderate', season: 'late winter',
    description: 'late winter, when Kapha accumulates and cold dominates',
    themes: ['immun', 'cold', 'cough', 'respirator', 'winter', 'warming', 'kapha', 'joint', 'amla', 'honey'],
  },
  {
    key: 'vasant', name: 'Vasant', from: '03-15', to: '05-14',
    dosha: 'Kapha vitiated', agni: 'Weak', season: 'spring',
    description: 'spring, when Kapha vitiates and seasonal allergies surface',
    themes: ['detox', 'ama', 'allerg', 'sinus', 'weight', 'kapha', 'cleanse', 'digest', 'skin', 'respirator'],
  },
  {
    key: 'grishma', name: 'Grishma', from: '05-15', to: '07-14',
    dosha: 'Pitta accumulates', agni: 'High', season: 'summer',
    description: 'summer, when Pitta accumulates and heat stresses digestion',
    themes: ['cooling', 'hydrat', 'skin', 'pitta', 'digest', 'heat', 'water', 'coconut', 'sleep', 'sun'],
  },
  {
    key: 'varsha', name: 'Varsha', from: '07-15', to: '09-14',
    dosha: 'Vata vitiated, low Agni', agni: 'Weak', season: 'monsoon',
    description: 'monsoon, when Agni weakens, Vata rises and infections are common',
    themes: ['immun', 'fever', 'giloy', 'guduchi', 'digest', 'agni', 'respirator', 'cold', 'cough', 'sinus', 'hygiene', 'fungal', 'tulsi'],
  },
  {
    key: 'sharad', name: 'Sharad', from: '09-15', to: '11-14',
    dosha: 'Pitta vitiated', agni: 'Balanced', season: 'autumn',
    description: 'autumn, when Pitta vitiates and the liver needs protection',
    themes: ['liver', 'skin', 'pitta', 'cooling', 'digest', 'rakta', 'detox', 'amla'],
  },
  {
    key: 'hemanta', name: 'Hemanta', from: '11-15', to: '01-14',
    dosha: 'Vata vitiated, strong Agni', agni: 'Strong', season: 'early winter',
    description: 'early winter, when Agni is strongest and the body benefits from rejuvenation',
    themes: ['rasayan', 'rejuvenat', 'panchakarma', 'oil', 'vata', 'joint', 'nourish', 'winter', 'sleep', 'chavanprash', 'amla'],
  },
];

// ---------- occasion / observance calendar ----------
// fixed = Gregorian date; approx = lunar/observed date (nearest match within tolerance).
const OCCASIONS = [
  { name: 'New Year', month: 1, day: 1, approx: false, tolerance: 3, categories: ['Lifestyle'], themes: ['routine', 'dinacharya', 'detox', 'digest', 'sleep'] },
  { name: 'Makar Sankranti', month: 1, day: 14, approx: false, tolerance: 3, categories: ['Nutrition'], themes: ['sesame', 'til', 'winter', 'joint', 'oil', 'nourish'] },
  { name: "World Cancer Day", month: 2, day: 4, approx: false, tolerance: 4, categories: ['Ayurveda', 'Wellness'], themes: ['prevent', 'immun', 'rasayan', 'detox', 'lifestyle', 'antioxid'] },
  { name: 'Holi', month: 3, day: 4, approx: true, tolerance: 3, categories: ['Wellness', 'Ayurveda'], themes: ['skin', 'pitta', 'cooling', 'allerg', 'digest', 'sugar'] },
  { name: "International Women's Day", month: 3, day: 8, approx: false, tolerance: 3, categories: ['Ayurveda', 'Nutrition'], themes: ['women', 'menstrual', 'fertility', 'anemia', 'iron', 'hormone', 'pcos', 'menopause'] },
  { name: 'World Health Day', month: 4, day: 7, approx: false, tolerance: 4, categories: ['Lifestyle', 'Wellness'], themes: ['routine', 'dinacharya', 'prevent', 'immun', 'sleep', 'digest', 'stress'] },
  { name: 'International Yoga Day', month: 6, day: 21, approx: false, tolerance: 4, categories: ['Yoga'], themes: ['yoga', 'pranayama', 'stress', 'flexib', 'posture', 'breath', 'back', 'neck'] },
  { name: 'World Hepatitis Day', month: 7, day: 28, approx: false, tolerance: 4, categories: ['Ayurveda'], themes: ['liver', 'digest', 'detox', 'fat', 'jaundice', 'ama'] },
  { name: 'Independence Day', month: 8, day: 15, approx: false, tolerance: 4, categories: ['Ayurveda', 'Wellness'], themes: ['immun', 'rasayan', 'giloy', 'guduchi', 'health', 'vitamin', 'prevent', 'national'] },
  { name: 'Raksha Bandhan', month: 8, day: 28, approx: true, tolerance: 3, categories: ['Ayurveda', 'Nutrition'], themes: ['women', 'menstrual', 'anemia', 'immun', 'family', 'digest'] },
  { name: 'World Heart Day', month: 9, day: 29, approx: false, tolerance: 4, categories: ['Ayurveda'], themes: ['heart', 'cholesterol', 'hypertension', 'blood pressure', 'lipid', 'oil', 'obesity'] },
  { name: 'Gandhi Jayanti', month: 10, day: 2, approx: false, tolerance: 3, categories: ['Lifestyle', 'Wellness'], themes: ['cleanse', 'hygiene', 'routine', 'detox', 'digest'] },
  { name: 'World Mental Health Day', month: 10, day: 10, approx: false, tolerance: 4, categories: ['Lifestyle', 'Ayurveda'], themes: ['stress', 'anxiety', 'depression', 'mood', 'sleep', 'meditation', 'yoga', 'adaptogen'] },
  { name: 'Sharad Navratri', month: 10, day: 22, approx: true, tolerance: 3, categories: ['Ayurveda', 'Wellness'], themes: ['detox', 'seasonal', 'digest', 'fevast', 'skin', 'immun'] },
  { name: 'World Ayurveda Day', month: 11, day: 6, approx: true, tolerance: 3, categories: ['Ayurveda'], themes: ['panchakarma', 'rasayan', 'dosha', 'prakriti', 'agni', 'dinacharya'] },
  { name: 'Diwali', month: 11, day: 8, approx: true, tolerance: 3, categories: ['Ayurveda', 'Nutrition'], themes: ['detox', 'digest', 'sweet', 'sugar', 'liver', 'skin'] },
  { name: 'World Diabetes Day', month: 11, day: 14, approx: false, tolerance: 4, categories: ['Nutrition', 'Ayurveda'], themes: ['diabet', 'sugar', 'prediabet', 'weight', 'carb', 'fenugreek'] },
  { name: "Children's Day", month: 11, day: 14, approx: false, tolerance: 3, categories: ['Wellness'], themes: ['children', 'immun', 'nutrit', 'growth', 'kids'] },
  { name: 'World AIDS Day', month: 12, day: 1, approx: false, tolerance: 3, categories: ['Wellness', 'Ayurveda'], themes: ['immun', 'rasayan', 'prevent', 'health'] },
  { name: 'Winter Solstice', month: 12, day: 21, approx: false, tolerance: 3, categories: ['Ayurveda'], themes: ['rasayan', 'oil', 'winter', 'vata', 'joint', 'nourish'] },
];

function toMdDay(dateStr) {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  return { y, m, d };
}

function dayInRitu(dateStr) {
  const { m, d } = toMdDay(dateStr);
  const md = `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  for (const ritu of RITUS) {
    if (md >= ritu.from && md <= ritu.to) return ritu;
  }
  return RITUS[5]; // hemanta covers the year wrap
}

function daysUntil(targetDate, month, day) {
  const t = new Date(`${targetDate}T12:00:00`);
  let cand = new Date(t.getFullYear(), month - 1, day, 12, 0, 0);
  if (cand < t) cand = new Date(t.getFullYear() + 1, month - 1, day, 12, 0, 0);
  return Math.round((cand - t) / 86400000);
}

function nearestOccasion(dateStr) {
  let best = null;
  for (const occ of OCCASIONS) {
    const days = daysUntil(dateStr, occ.month, occ.day);
    if (days <= occ.tolerance) {
      if (!best || days < best.days || (days === best.days && !occ.approx && best.occ.approx)) {
        best = { occ, days };
      }
    }
  }
  return best;
}

function buildContext(dateStr) {
  const ritu = dayInRitu(dateStr);
  const occ = nearestOccasion(dateStr);
  return {
    date: dateStr,
    ritu,
    occasion: occ ? { name: occ.occ.name, days: occ.days, categories: occ.occ.categories, themes: occ.occ.themes } : null,
  };
}

// ---------- topic list parsing (mirrors scripts/generate-blog-stubs.mjs) ----------
function parseTopicRows(raw) {
  const rows = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.startsWith('|||')) continue;
    const parts = trimmed.split('|||').map((p) => p.trim());
    if (parts.length < 5) continue;
    rows.push({ topic: parts[1], category: parts[2], searchIntent: parts[3], angle: parts[4] });
  }
  return rows;
}

function readTopicRows() {
  return parseTopicRows(readFileSync(TOPICS_FILE, 'utf8'));
}

function existingSlugs(dir) {
  if (!existsSync(dir)) return new Set();
  return new Set(
    readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, '').toLowerCase())
  );
}

function topicCovered(row, postSlugs) {
  const topicWords = distinctiveWords(row.topic);
  for (const slug of postSlugs) {
    const slugWords = slug.split('-');
    const overlap = topicWords.filter((w) => slugWords.includes(w));
    if (overlap.length >= 2) return true;
    if (topicWords.some((w) => w.length >= 6 && slug.includes(w))) return true;
  }
  // Draft stubs in data/blog/drafts/ are quarantined placeholders — never served to readers and
  // never a blocker. The auto-poster may pick such a topic; posting it removes the stub.
  return false;
}

// ---------- EasyAyurveda fresh-topic source ----------
// The original topic research came from easyayurveda.com (see scripts/generate-blog-stubs.mjs).
// Each run we fetch the latest article titles from their blog index and use them as fresh
// topic candidates ("various other factors"). We only read TITLES for topic inspiration —
// all article text is written fresh by Gemini and never copied. One polite request per run.
const EASYAYURVEDA_BLOG_URL = 'https://www.easyayurveda.com/blog/';
const FETCH_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// Hospital service/skill vocabulary — fresh topics must be relevant to what we actually treat.
const SKILL_TERMS = [
  ...DR_SHARMA_KEYS, ...DR_GOR_KEYS,
  'panchakarma', 'detox', 'detoxif', 'skin', 'hair', 'digest', 'immunity', 'stress', 'sleep',
  'women', 'fertility', 'yoga', 'meditation', 'pranayama', 'herb', 'oil', 'massage', 'abhyanga',
  'shirodhara', 'nasya', 'basti', 'virechana', 'diet', 'food', 'gut', 'liver', 'kidney', 'heart',
  'joint', 'thyroid', 'diabet', 'weight', 'arthritis', 'acidity', 'constipation', 'piles', 'sinus',
  'migraine', 'headache', 'anemia', 'pcos', 'menopause', 'asthma', 'cough', 'cold', 'fever',
  'mouth', 'eye', 'scar', 'pregnancy', 'child', 'baby', 'insomnia', 'memory', 'anxiety',
  'depression', 'vitamin', 'cholesterol', 'blood pressure', 'urine', 'uti', 'stomach', 'gas',
];

// Academic/exam/classical-study articles are not patient content — skip them.
const ACADEMIC_BLOCK =
  /aiapget|neet|exam|question|mcq|special|samhita|charaka|sushruta|vagbhata|nighantu|commentar|gunaha|classification of|shloka|verse|vyakaran|ashtanga/i;

function mapEasyCategory(cat) {
  const c = (cat || '').toLowerCase();
  if (c.includes('yoga')) return 'Yoga';
  if (c.includes('nutri') || c.includes('diet') || c.includes('food') || c.includes('recipe')) return 'Nutrition';
  if (c.includes('lifestyle') || c.includes('routine') || c.includes('dinacharya') || c.includes('daily')) return 'Lifestyle';
  if (c.includes('wellness') || c.includes('rasayana') || c.includes('health')) return 'Wellness';
  return 'Ayurveda';
}

function parseEasyAyurvedaCards(html) {
  const cards = [];
  const articleRe = /<article[^>]*class="[^"]*elementor-post[^"]*"[^>]*>(.*?)<\/article>/gs;
  let m;
  while ((m = articleRe.exec(html)) !== null) {
    const block = m[1];
    const catMatch = block.match(/hentry\s+([a-z0-9-]+)/i) || block.match(/category-([a-z0-9-]+)/i);
    const titleMatch = block.match(/<h2[^>]*class="[^"]*elementor-post__title[^"]*"[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/s);
    if (!titleMatch) continue;
    const title = titleMatch[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (!title) continue;
    cards.push({ title, url: titleMatch[1], category: mapEasyCategory(catMatch ? catMatch[1] : '') });
  }
  return cards;
}

function deriveIntent(title) {
  return `Ayurveda perspective on ${title} — causes, signs, home remedies, diet and lifestyle guidance, and when to see a doctor`;
}

function deriveAngle() {
  return 'What it is,Common causes,Home remedies and daily care,Diet and lifestyle,When to see a doctor';
}

async function fetchEasyAyurvedaTopics() {
  // Primary: WordPress REST API (JSON). Fallback: parse the HTML index page.
  let cards = [];
  try {
    cards = await fetchEasyAyurvedaApi();
  } catch (e) {
    console.warn(`[fetch] REST API unavailable (${e.message}) — falling back to HTML index`);
    cards = await fetchEasyAyurvedaHtml();
  }
  const rows = [];
  for (const card of cards) {
    const lower = card.title.toLowerCase();
    if (ACADEMIC_BLOCK.test(lower)) continue;
    if (!SKILL_TERMS.some((t) => lower.includes(t))) continue;
    rows.push({
      topic: card.title,
      category: card.category,
      searchIntent: deriveIntent(card.title),
      angle: deriveAngle(),
      source: 'easyayurveda',
      url: card.url,
    });
  }
  return rows;
}

// WordPress REST API: https://developer.wordpress.org/rest-api/reference/posts/
// One lightweight JSON call, ~20 most recent posts.
async function fetchEasyAyurvedaApi() {
  const url = new URL('https://www.easyayurveda.com/wp-json/wp/v2/posts');
  url.search = new URLSearchParams({ per_page: '20', _fields: 'title,link,categories' });
  const res = await fetch(url, { headers: { 'User-Agent': FETCH_UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`REST API ${res.status}`);
  const posts = await res.json();
  if (!Array.isArray(posts)) throw new Error('REST API returned no list');
  const cards = [];
  for (const p of posts) {
    const title = p?.title?.rendered || '';
    if (!title) continue;
    cards.push({
      title: decodeHtmlEntities(title),
      url: p.link || `https://www.easyayurveda.com/blog/`,
      category: mapEasyCategory(''),
    });
  }
  return cards;
}

// Fallback: parse the Elementor post grid on the blog index page.
async function fetchEasyAyurvedaHtml() {
  const res = await fetch(EASYAYURVEDA_BLOG_URL, {
    headers: { 'User-Agent': FETCH_UA, Accept: 'text/html' },
  });
  if (!res.ok) throw new Error(`blog index ${res.status}`);
  const html = await res.text();
  return parseEasyAyurvedaCards(html);
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '-')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8230;/g, '...')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function loadLog() {
  if (!existsSync(LOG_FILE)) return [];
  try {
    const parsed = JSON.parse(readFileSync(LOG_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function lastCategory(log) {
  return log.length ? log[log.length - 1].category : null;
}

// ---------- topic scoring ----------
function scoreTopic(row, ctx, log) {
  const lower = row.topic.toLowerCase() + ' ' + (row.angle || '').toLowerCase();
  let score = 0;
  const hits = [];
  for (const kw of ctx.ritu.themes) {
    if (lower.includes(kw)) { score += 2; hits.push(`rittu:${kw}`); }
  }
  if (ctx.occasion) {
    for (const kw of ctx.occasion.themes) {
      if (lower.includes(kw)) { score += 3; hits.push(`occasion:${kw}`); }
    }
    if (ctx.occasion.categories.includes(row.category)) { score += 1.5; hits.push('occasion:category'); }
  }
  if (lastCategory(log) === row.category) score -= 1; // prefer category variety
  return { score, hits };
}

function selectTopic(ctx, rows, log) {
  const postSlugs = existingSlugs(POSTS_DIR);
  const candidates = rows.filter((r) => !topicCovered(r, postSlugs));
  if (!candidates.length) return { candidates: [], winner: null };

  const scored = candidates
    .map((r) => ({ row: r, ...scoreTopic(r, ctx, log) }))
    .sort((a, b) => b.score - a.score || a.row.topic.localeCompare(b.row.topic));

  // Strong context match required (>= 4); otherwise fall back to plain rotation.
  const strong = scored.filter((s) => s.score >= 4);
  const pool = strong.length ? strong : scored;
  // Rotation: pick the first pool entry whose category differs from the last posted one if possible.
  const lastCat = lastCategory(log);
  const winner =
    pool.find((s) => s.row.category !== lastCat) || pool[0] || null;

  return { candidates: scored, winner };
}

// ---------- NVIDIA NIM content generation ----------
// Two paths:
//   1. Direct: NVIDIA_API_KEY present -> call integrate.api.nvidia.com (OpenAI-compatible).
//   2. Proxy: no key -> call the site's deployed /api/nvidia function, which reads the
//      key server-side in Vercel. The proxy forces meta/llama-3.1-8b-instruct.
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_PROXY_URL = process.env.AUTO_POST_NVIDIA_URL || 'https://ayurvrittaayurveda.in/api/nvidia';

function loadNvidiaKey() {
  if (process.env.NVIDIA_API_KEY) return process.env.NVIDIA_API_KEY;
  const envLocal = join(ROOT, '.env.local');
  if (existsSync(envLocal)) {
    for (const line of readFileSync(envLocal, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*NVIDIA_API_KEY\s*=\s*(.+)\s*$/);
      if (m) return m[1].trim().replace(/^["']|["']$/g, '');
    }
  }
  return null;
}

const EXAMPLE_BODY = `Tulsi has been a fixture in Indian homes for thousands of years. At Ayurvritta Ayurveda Hospital in Udaipur, we see it as one of the most practical daily Rasayanas you can grow on your windowsill. **Tulsi (Holy Basil)** is an adaptogenic herb that supports immunity, calms the mind, and balances Kapha and Vata without aggravating Pitta.`;

function buildPrompt(row, ctx) {
  const sections = (row.angle || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const timing = [];
  timing.push(`- Season (Ritucharya): ${ctx.ritu.name} — ${ctx.ritu.description}. Dominant state: ${ctx.ritu.dosha}.`);
  if (ctx.occasion) {
    timing.push(`- Upcoming observance: ${ctx.occasion.name} (in ${ctx.occasion.days} day${ctx.occasion.days === 1 ? '' : 's'}).`);
  } else {
    timing.push('- No specific observance this week — keep the content seasonal only.');
  }
  return [
    `You are the content writer for Ayurvritta Ayurveda Hospital, an authentic Ayurveda hospital in Udaipur, Rajasthan, India.`,
    `Write ONE complete, publish-ready blog article in Markdown.`,
    ``,
    `TOPIC: ${row.topic}`,
    `CATEGORY: ${row.category}`,
    `SEO SEARCH INTENT (paraphrase this in your own words inside the opening so the article stays on-intent): ${row.searchIntent}`,
    ``,
    `RESEARCH OUTLINE — cover all of these themes (do not copy the headings verbatim; write natural section titles):`,
    ...sections.map((s) => `- ${s}`),
    ``,
    `TIMELINESS CONTEXT — reflect it in ONE natural sentence of the article (never say "this post was written because..."):`,
    ...timing,
    ``,
    `REQUIREMENTS (follow EXACTLY):`,
    `1. Respond with the article BODY ONLY. No H1 title, no YAML frontmatter, no code fences, no header line.`,
    `2. Opening paragraph: a strong hook that states the topic and notes the hospital's classical-Ayurveda approach.`,
    `3. Use \`## \` for main sections (5-8) and \`### \` for at most 2-3 subsections.`,
    `4. Use \`- \` bullet lists with a **bold** lead-in phrase for each key term, e.g. \`- **Agni (digestive fire):** ...\`.`,
    `5. Bold Sanskrit/Ayurveda terms with **bold** when you first introduce them.`,
    `6. Include a section titled \`## Who Should Use Care\` (safety caveats; when to see a doctor) and a closing section titled \`## The Bottom Line\`.`,
    `7. Plain, warm language for patients. Authentic classical-Ayurveda framing. NO invented studies, quotes, or citations.`,
    `8. NO tables, NO blockquotes (>), NO hyperlinks, NO *italic* emphasis, NO emojis. Numbered lists only for step-by-step instructions.`,
    `9. Target 950-1200 words. Vary section headings; do not literally copy the outline headings.`,
    `10. Always close with reassurance that care is personalised and consult an Ayurveda practitioner for an individual plan.`,
    ``,
    `STYLE EXAMPLE (mirror this tone and structure — an excerpt of an existing article):`,
    `---`,
    EXAMPLE_BODY,
    `---`,
  ].join('\n');
}

async function callNvidia(prompt) {
  const key = loadNvidiaKey();
  const messages = [{ role: 'system', content: 'You are an expert Ayurvedic content writer. Respond with clean Markdown only, matching the instructions exactly.' }, { role: 'user', content: prompt }];

  const maxRetries = 2;
  const baseDelayMs = 1500;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`[generate] retrying NVIDIA (attempt ${attempt + 1}/${maxRetries + 1}) after ${delay}ms`);
      await sleep(delay);
    }

    let res;
    try {
      if (key) {
        // Direct path: OpenAI-compatible chat completions endpoint.
        const model = process.env.NVIDIA_MODEL || 'meta/llama-3.1-8b-instruct';
        res = await fetch(NVIDIA_API_URL, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages, temperature: 0.8, max_tokens: 4096, top_p: 0.9, stream: false }),
        });
      } else {
        // Proxy path: the deployed function reads NVIDIA_API_KEY server-side (Vercel).
        res = await fetch(NVIDIA_PROXY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, temperature: 0.8, max_tokens: 4096, top_p: 0.9, stream: false }),
        });
      }
    } catch (e) {
      if (attempt < maxRetries) continue;
      throw new Error(`network: ${e.message}`);
    }

    if (!res.ok) {
      const err = await res.text();
      if (attempt < maxRetries && (res.status === 429 || res.status === 500 || res.status === 502 || res.status === 503 || res.status === 504)) {
        console.warn(`[generate] NVIDIA returned ${res.status}, will retry`);
        continue;
      }
      throw new Error(`NVIDIA ${res.status}: ${err.slice(0, 300)}`);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('NVIDIA returned an empty body');
    return text;
  }

  throw new Error('NVIDIA max retries exceeded');
}

// ---------- fallback writer (fully deterministic; guaranteed valid markdown) ----------
const CATEGORY_BANK = {
  Ayurveda: [
    'In classical Ayurveda, this is understood as a disturbance of the body-mind constitution rather than an isolated symptom. **Ayurveda** works by first identifying your unique **Prakriti (constitution)** and the current imbalance (**Vikriti**) in your **Vata, Pitta and Kapha** doshas.',
    'Treatment is always individualised. At Ayurvritta Ayurveda Hospital in Udaipur, our approach combines **Panchakarma (detoxification therapies)**, internal medicines prepared from whole herbs, and daily lifestyle guidance so that the root cause, not just the symptom, is addressed.',
  ],
  Yoga: [
    'Ayurveda and **Yoga** are sister sciences. Movement, **pranayama (breathing techniques)** and mindful posture help balance the doshas, calm the nervous system, and support the body\u2019s natural healing.',
    'At Ayurvritta Ayurveda Hospital in Udaipur, yoga is prescribed like medicine — the right practice at the right intensity for your constitution and current state of health.',
  ],
  Nutrition: [
    'In Ayurveda, **food is medicine**. What you eat becomes your tissues, your **Agni (digestive fire)** and your energy. Choosing the right foods for your constitution and the season is often the single most powerful daily intervention.',
    'At Ayurvritta Ayurveda Hospital in Udaipur, diet plans are built around your **Prakriti**, digestive capacity, and the current season so nutrition genuinely supports healing.',
  ],
  Lifestyle: [
    'Ayurveda teaches that daily routine — **Dinacharya** — shapes long-term health. Small, consistent habits around waking, meals, work and sleep do more for wellbeing than any single remedy.',
    'At Ayurvritta Ayurveda Hospital in Udaipur, we design simple, sustainable routines that fit real life and restore balance gradually.',
  ],
  Wellness: [
    'Prevention sits at the heart of Ayurveda. Supporting immunity, digestion and mental calm through **Rasayana (rejuvenation)** principles protects health before illness takes hold.',
    'At Ayurvritta Ayurveda Hospital in Udaipur, wellness is a daily practice of protecting **Ojas (vital energy)** — through herbs, food, sleep and movement.',
  ],
};

function fallbackWriter(row, ctx) {
  const title = row.topic.replace(/^.*?:\s*/, '');
  const sections = (row.angle || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const bank = CATEGORY_BANK[row.category] || CATEGORY_BANK.Ayurveda;

  const body = [];
  body.push(`${title} is a concern we see frequently at Ayurvritta Ayurveda Hospital in Udaipur. In Ayurveda, it is never treated as an isolated problem — it is read against your **doshas**, your **Agni (digestive fire)** and your daily routine. This guide looks at ${title.toLowerCase()} through a classical-Ayurveda lens: what is happening in the body, what to do at home, and when to seek expert care.`);
  body.push('');
  if (ctx.occasion) {
    body.push(`With **${ctx.occasion.name}** just around the corner and the **${ctx.ritu.name}** season upon us, this is a good moment to bring ${title.toLowerCase()} back into focus. ${ctx.ritu.description.charAt(0).toUpperCase() + ctx.ritu.description.slice(1)} — a practical reason to pay attention now.`);
    body.push('');
  } else {
    body.push(`The **${ctx.ritu.name}** season is upon us — ${ctx.ritu.description}. This makes the timing right to pay attention to ${title.toLowerCase()}.`);
    body.push('');
  }
  body.push('## Why Ayurveda Looks at the Root');
  body.push('');
  body.push(bank[0]);
  body.push('');
  body.push(bank[1]);
  body.push('');

  sections.forEach((section, i) => {
    const heading = section[0].toUpperCase() + section.slice(1);
    body.push(`## ${heading}`);
    body.push('');
    body.push(`- **Start with the basics:** bring daily routine back into rhythm — regular meals, adequate sleep and moderate movement form the foundation for ${title.toLowerCase()}.`);
    body.push('');
    body.push(`- **Support digestion first:** a calm **Agni** is the prerequisite for healthy tissues. Warm, cooked, seasonal food and mindful eating go a long way.`);
    body.push('');
    body.push(`- **Practise consistently:** herbal support works gradually. Expect steady improvement over weeks rather than overnight change, and review progress with a qualified practitioner.`);
    body.push('');
    if (i === 0 && ctx.ritu.key === 'varsha') {
      body.push(`- **Seasonal note:** during **${ctx.ritu.name}**, digestion is naturally weaker. This is the time to favour light, warm, easy-to-digest meals and protective herbs like **Giloy (Guduchi)** to support immunity.`);
      body.push('');
    }
  });

  body.push('## Who Should Use Care');
  body.push('');
  body.push(`- **Seek professional evaluation if** symptoms are severe, persistent, or worsening — for example, high fever, significant pain, or symptoms that disturb sleep or daily activity.`);
  body.push('');
  body.push('- **Tell your Ayurveda practitioner about** any long-term medicines or existing conditions, so herbs and therapies are chosen and timed safely.');
  body.push('');
  body.push(`- **Pregnancy, nursing, children and older adults** need especially careful dosing — always get a personalised plan rather than self-treating.`);
  body.push('');
  body.push('## The Bottom Line');
  body.push('');
  body.push(`${title} responds well to a consistent Ayurveda approach when the root imbalance is addressed. At **Ayurvritta Ayurveda Hospital** in Udaipur, every plan is individualised — your **Prakriti**, your current imbalance and your season all shape the treatment. Book a consultation to get a plan built for you.`);
  body.push('');
  return body.join('\n');
}

// ---------- content cleaning ----------
function cleanBody(raw, row, imagePath) {
  let text = raw.trim();
  // Strip any YAML frontmatter the model accidentally emits.
  text = text.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n?/, '');
  // Strip a stray leading H1 (title line).
  text = text.replace(/^#\s+.+\s*\r?\n?/, '');
  // Strip a stray markdown image embed (we attach the figure ourselves).
  text = text.replace(/!\[[^\]]*\]\([^)]*\)\s*\r?\n?/g, '');
  // Strip stray code fences.
  text = text.replace(/```[a-z]*\r?\n?/gi, '');
  // Collapse 3+ blank lines.
  text = text.replace(/\r?\n{3,}/g, '\n\n').trim();
  // The 8B NIM model often writes main sections as ### instead of ##.
  // Existing posts average ~7 ## and ~5 ###; promote extra ### up to a sane mix.
  return normalizeHeadings(text);
}

function normalizeHeadings(text) {
  const lines = text.split('\n');
  // The two required sections must always be ## regardless of what the model emitted.
  for (let i = 0; i < lines.length; i++) {
    if (/^#{1,4}\s+who should use care\s*$/i.test(lines[i])) lines[i] = lines[i].replace(/^#+\s+/, '## ');
    if (/^#{1,4}\s+the bottom line\s*$/i.test(lines[i])) lines[i] = lines[i].replace(/^#+\s+/, '## ');
  }
  let h2 = 0;
  for (const l of lines) if (/^##\s+/.test(l)) h2++;
  // Promote ### -> ## until we have at least 5 top-level sections.
  if (h2 < 5) {
    for (let i = 0; i < lines.length && h2 < 5; i++) {
      if (/^###\s+/.test(lines[i])) {
        lines[i] = lines[i].replace(/^###\s+/, '## ');
        h2++;
      }
    }
  }
  return lines.join('\n');
}

function bodyToMarkdown(title, body, imagePath) {
  return [
    `![${title}](${imagePath})`,
    '',
    body,
    '',
  ].join('\n');
}

// ---------- validation ----------
function validatePost({ slug, title, excerpt, category, authorId, date, readTime, image }, body, useImageFile) {
  const errors = [];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.push(`bad slug: ${slug}`);
  if (!title || title.length < 8) errors.push('title missing/too short');
  if (!excerpt || excerpt.length < 20) errors.push('excerpt missing/too short');
  if (!VALID_CATEGORIES.includes(category)) errors.push(`bad category: ${category}`);
  if (!AUTHORS[authorId]) errors.push(`bad authorId: ${authorId}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push(`bad date: ${date}`);
  if (!/^\d+ min read$/.test(readTime)) errors.push(`bad readTime: ${readTime}`);
  if (!image) errors.push('image missing');
  const h2 = (body.match(/^##\s+/gm) || []).length;
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  if (h2 < 3) errors.push(`too few sections (${h2} h2)`);
  if (wordCount < 350) errors.push(`too short (${wordCount} words)`);
  // Renderer-safe markdown: no tables/blockquotes/links/italic emphasis.
  if (/^\s*\|/.test(body)) errors.push('table row present');
  if (/^\s*>/m.test(body)) errors.push('blockquote present');
  if (/\[[^\]]+\]\(https?:\/\/[^)]+\)/.test(body)) errors.push('external link present');
  if (/[^\\*]\*[^*\s]/.test(body) || /[^*\s]\*[^\\*]/.test(body)) errors.push('stray *italic* emphasis present');
  if (useImageFile && image && !image.startsWith('/images/blog/') && !existsSync(join(ROOT, 'public', image.replace(/^\//, '')))) {
    errors.push(`image file missing: ${image}`);
  }
  return errors;
}

// ---------- image fetch (Wikimedia Commons) ----------
const UA = 'AyurBlogImageBot/1.0 (contact: admin@ayurvrittaayurveda.in)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isNonPhoto(title) {
  return /diagram|schematic|chart|graph|logo|cartoon|drawing|painting|portrait of|map of|flag of|coat of arms/i.test(title);
}

async function commonsSearch(query) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.search = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrnamespace: '6',
    gsrsearch: `filetype:bitmap ${query}`,
    gsrlimit: '6',
    prop: 'imageinfo',
    iiprop: 'url|size|mime|dimensions',
    iiurlwidth: '1920',
    format: 'json',
    origin: '*',
  }).toString();
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Commons ${res.status}`);
  return res.json();
}

// Mirrors scripts/fetch-commons-images.mjs scoreCandidate: real photos only,
// landscape, and large enough to crop to 1600x900 cover.
function scoreCandidate(page, query) {
  const info = page.imageinfo?.[0];
  if (!info) return -1;
  const mime = (info.mime || '').toLowerCase();
  if (mime !== 'image/jpeg') return -1;               // match existing pipeline (JPEG photos only)
  if (isNonPhoto(page.title)) return -1;
  const w = info.width || 0;
  const h = info.height || 0;
  if (w < 900 || h < 600) return -1;                  // large enough to crop
  const aspect = w / h;
  if (aspect < 0.9) return -1;                        // no portraits
  let score = Math.min(w, h) / 1000;
  if (aspect >= 1.1 && aspect <= 2.4) score += 3;     // prefer comfortable landscapes
  const qTokens = new Set(normalize(query).split(' ').filter((t) => t.length > 2));
  const tTokens = new Set(normalize(page.title).split(' ').filter((t) => t.length > 2));
  if (qTokens.size) {
    let hits = 0;
    for (const t of tTokens) if (qTokens.has(t)) hits++;
    score += (hits / qTokens.size) * 8;
  }
  return score;
}

async function fetchImage(row, ctx) {
  const topicWords = distinctiveWords(row.topic).filter((w) => w.length > 4);
  const queries = [
    topicWords.length ? topicWords.slice(0, 3).join(' ') : normalize(row.topic).split(' ').slice(0, 3).join(' '),
    row.category,
  ];
  let best = null;
  for (const q of queries) {
    try {
      await sleep(300);
      const data = await commonsSearch(q);
      const pages = Object.values(data?.query?.pages || {});
      for (const page of pages) {
        const info = page.imageinfo?.[0];
        if (!info) continue;
        const score = scoreCandidate(page, q);
        if (score <= 0) continue;
        if ((info.size || 0) > 12 * 1024 * 1024) continue;
        if (!best || score > best.score) best = { title: page.title, url: info.thumburl || info.url, mime: info.mime, score };
      }
      if (best) break;
    } catch (e) {
      console.error(`  [image] query "${q}" failed: ${e.message}`);
    }
  }
  return best;
}

async function downloadImage(url) {
  await sleep(300);
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error('download too small');
  return buf;
}

// Convert the downloaded photo to the site's standard 1600x900 WebP (quality 82).
// sharp is optional: when unavailable, fall back to the original image bytes so the
// auto-poster keeps zero hard runtime dependencies.
async function toSiteWebp(buf) {
  try {
    const sharp = (await import('sharp')).default;
    return {
      data: await sharp(buf)
        .resize(1600, 900, { fit: 'cover', position: 'centre' })
        .webp({ quality: 82, effort: 4 })
        .toBuffer(),
      converted: true,
    };
  } catch {
    return { data: buf, converted: false };
  }
}

function extForMime(mime) {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

// ---------- post assembly ----------
function buildPost(row, ctx, body, image) {
  const title = row.topic.replace(/^.*?:\s*/, '').trim();
  const slug = slugify(title);
  const category = VALID_CATEGORIES.includes(row.category) ? row.category : 'Ayurveda';
  const excerpt = row.searchIntent.replace(/\s+/g, ' ').trim();
  const wordsInBody = body.split(/\s+/).filter(Boolean).length;
  const readTime = `${Math.max(4, Math.round(wordsInBody / 200))} min read`;

  const imagePath = image ? `/images/blog/posts/${slug}.${image.ext}` : CATEGORY_IMAGE[category];
  const frontmatterAuthorId = pickAuthor(title);
  const frontmatter = [
    '---',
    `slug: ${slug}`,
    `title: ${title}`,
    `excerpt: ${excerpt}`,
    `category: ${category}`,
    `authorId: ${frontmatterAuthorId}`,
    `date: ${ctx.date}`,
    `readTime: ${readTime}`,
    `image: ${imagePath}`,
    'featured: false',
    '---',
  ].join('\n');

  const markdown = `${frontmatter}\n\n${bodyToMarkdown(title, body, imagePath)}\n`;
  return {
    slug,
    title,
    excerpt,
    category,
    authorId: frontmatterAuthorId,
    date: ctx.date,
    readTime,
    image: imagePath,
    markdown,
    imagePath,
    imageSource: image?.title || null,
  };
}

function writeFiles(post, bodyText, imageBuf) {
  mkdirSync(POSTS_DIR, { recursive: true });
  mkdirSync(IMG_DIR, { recursive: true });
  mkdirSync(dirname(LOG_FILE), { recursive: true });

  const postFile = join(POSTS_DIR, `${post.slug}.md`);
  if (existsSync(postFile)) throw new Error(`post already exists: ${post.slug}`);

  if (imageBuf) {
    const imgFile = join(IMG_DIR, `${post.slug}.${imageBuf.ext}`);
    writeFileSync(imgFile, imageBuf.data);
  }
  writeFileSync(postFile, post.markdown);
  return { postFile };
}

function appendLog(entry) {
  const log = loadLog();
  log.push(entry);
  writeFileSync(LOG_FILE, `${JSON.stringify(log, null, 2)}\n`, 'utf8');
}

// ---------- git ----------
function git(...args) {
  execSync(`git ${args.join(' ')}`, { cwd: ROOT, stdio: ['ignore', 'inherit', 'inherit'] });
}

function commitAndPush(files, message) {
  const authorName = process.env.AUTO_POST_COMMIT_NAME || 'github-actions[bot]';
  const authorEmail = process.env.AUTO_POST_COMMIT_EMAIL || '41898282+github-actions[bot]@users.noreply.github.com';
  git('add', '--', ...files);
  git('-c', `user.name=${authorName}`, '-c', `user.email=${authorEmail}`, 'commit', '-m', message);
  if (process.env.AUTO_POST_NO_PUSH === '1') return;
  git('pull', '--rebase', 'origin', 'HEAD');
  git('push', 'origin', 'HEAD');
}

function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

// ---------- main ----------
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const ctx = buildContext(args.date || new Date().toISOString().slice(0, 10));
  const rows = readTopicRows();
  const log = loadLog();

  // Fresh topic candidates from the EasyAyurveda blog index (titles only).
  let freshRows = [];
  let freshFetched = 0;
  if (!args.noFetch && !process.env.AUTO_POST_NO_FETCH && !args.topic) {
    try {
      freshRows = await fetchEasyAyurvedaTopics();
      freshFetched = freshRows.length;
      console.log(`[fetch] EasyAyurveda blog: ${freshFetched} relevant fresh topic(s)`);
    } catch (e) {
      console.warn(`[fetch] EasyAyurveda blog unavailable (${e.message}) — using research list only`);
    }
  }

  if (args.list) {
    const { candidates } = selectTopic(ctx, [...rows, ...freshRows], log);
    console.log(`\nContext for ${ctx.date}: Ritu = ${ctx.ritu.name} (${ctx.ritu.description})` +
      (ctx.occasion ? ` | Occasion = ${ctx.occasion.name} (in ${ctx.occasion.days}d)` : ' | no occasion in window'));
    console.log(`Candidate topics: ${candidates.length} (research + ${freshFetched} fresh from EasyAyurveda)\n`);
    for (const c of candidates.slice(0, 30)) {
      const mark = c.score >= 4 ? '*' : ' ';
      const src = c.row.source === 'easyayurveda' ? ' [fresh]' : '';
      console.log(`${mark} ${c.score.toFixed(1).padStart(5)}  ${c.row.topic}${src}  [${c.row.category}]  ${c.hits.join(', ')}`);
    }
    console.log('');
    return;
  }

  if (args.topic) {
    const match = [...rows, ...freshRows].find((r) => slugify(r.topic).includes(slugify(args.topic)) || r.topic.toLowerCase().includes(args.topic.toLowerCase()));
    if (!match) {
      console.error(`No topic matches --topic "${args.topic}"`);
      process.exit(1);
    }
    rows.length = 0;
    rows.push(match);
  }

  const pool = [...rows, ...freshRows];
  const { candidates, winner } = selectTopic(ctx, pool, log);
  if (!winner) {
    const entry = {
      runDate: ctx.date, postedDate: null, status: 'no-op', reason: 'all candidate topics already published', slug: null,
    };
    appendLog(entry);
    console.log('Auto-poster: nothing to post — every candidate topic is already published.');
    console.log(`Log written: ${LOG_FILE}`);
    return;
  }

  const row = winner.row;
  console.log(`\n=== Auto-poster run for ${ctx.date} ===`);
  console.log(`Context: Ritu ${ctx.ritu.name} (${ctx.ritu.description})` + (ctx.occasion ? ` | Occasion ${ctx.occasion.name} (+${ctx.occasion.days}d)` : ''));
  console.log(`Selected: ${row.topic} [${row.category}]  (score ${winner.score.toFixed(1)}, ${winner.hits.join(', ')})`);

  // 1. Generate body.
  let body = null;
  let source = null;
  if (!process.env.AUTO_POST_NO_AI) {
    try {
      const prompt = buildPrompt(row, ctx);
      const raw = await callNvidia(prompt);
      const cleaned = cleanBody(raw, row, '');
      if (countWords(cleaned) >= 350) {
        body = cleaned;
        source = loadNvidiaKey() ? 'nvidia' : 'nvidia-proxy';
        console.log(`[generate] NVIDIA wrote ${countWords(body)} words`);
      } else {
        console.warn('[generate] NVIDIA body too short — using fallback writer');
      }
    } catch (e) {
      console.warn(`[generate] NVIDIA failed (${e.message}) — using fallback writer`);
    }
  }
  if (!body) {
    body = fallbackWriter(row, ctx);
    source = 'fallback';
    console.log(`[generate] fallback writer produced ${countWords(body)} words`);
  }

  // 2. Fetch image.
  let image = null;
  let imageBuf = null;
  if (!args.noImage) {
    try {
      const hit = await fetchImage(row, ctx);
      if (hit) {
        const raw = await downloadImage(hit.url);
        const { data, converted } = await toSiteWebp(raw);
        image = { ext: converted ? 'webp' : extForMime(hit.mime), title: hit.title };
        imageBuf = { data, ext: image.ext };
        console.log(`[image] downloaded "${hit.title}" (${hit.mime}${converted ? ' → webp 1600x900' : ''})`);
      } else {
        console.warn('[image] no suitable Commons image found — using category SVG fallback');
      }
    } catch (e) {
      console.warn(`[image] fetch failed (${e.message}) — using category SVG fallback`);
    }
  }

  const post = buildPost(row, ctx, body, image);
  const errors = validatePost(post, body, true);
  if (errors.length) {
    console.error(`[validate] FAILED:\n  ${errors.join('\n  ')}`);
    process.exit(2);
  }
  console.log('[validate] OK — frontmatter, markdown and image all pass');

  if (args.dryRun) {
    console.log(`\n[DRY RUN] would write data/blog/posts/${post.slug}.md\n`);
    console.log(post.markdown);
    return;
  }

  // 3. Write.
  const { postFile } = writeFiles(post, body, imageBuf);
  // If this topic had a quarantined draft stub, remove it — the full post supersedes it.
  let draftRemoved = false;
  const draftStub = join(DRAFTS_DIR, `${post.slug}.md`);
  if (existsSync(draftStub)) {
    rmSync(draftStub, { force: true });
    draftRemoved = true;
    console.log(`[draft] removed superseded stub data/blog/drafts/${post.slug}.md`);
  }
  const sha = existsSync(join(ROOT, '.git')) ? (() => { try { return execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(); } catch { return null; } })() : null;

  // 4. Log.
  const entry = {
    runDate: ctx.date,
    postedDate: ctx.date,
    status: 'posted',
    source,
    slug: post.slug,
    title: post.title,
    category: post.category,
    ritu: ctx.ritu.key,
    occasion: ctx.occasion?.name || null,
    topicSource: row.source || 'knowledge',
    url: row.url || null,
    freshFetched,
    image: post.imagePath,
    imageSource: post.imageSource,
    words: countWords(body),
    sha,
  };
  appendLog(entry);
  console.log(`[log] appended to ${LOG_FILE}`);

  // 5. Commit + push.
  if (args.commit) {
    const files = [postFile];
    if (imageBuf) files.push(join(IMG_DIR, `${post.slug}.${imageBuf.ext}`));
    if (draftRemoved) files.push(draftStub);
    files.push(LOG_FILE);
    const msg = `auto-post(blog): ${post.title} [${ctx.ritu.name}${ctx.occasion ? ' | ' + ctx.occasion.name : ''}]`;
    commitAndPush(files, msg);
    console.log(`[git] committed + pushed: ${msg}`);
  } else {
    console.log(`[git] skipped commit (run with --commit to publish)`);
  }

  console.log(`\n=== DONE: ${post.title} ===`);
}

main().catch((e) => {
  console.error(`Auto-poster failed: ${e.stack || e.message}`);
  process.exit(1);
});
