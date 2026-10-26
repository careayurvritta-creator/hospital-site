/**
 * Regenerates SEO/AI-crawler files from the real content:
 *  - public/sitemap.xml      (all static routes, 11 services, every blog post)
 *  - public/llms-full.txt    (real blog article list + correct article count)
 *  - public/llms.txt         (correct article count)
 *
 * Run with: node tools/generate-seo-files.mjs
 * Re-run after publishing new posts (or wire into the auto-poster).
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://ayurvritta.com';
const today = new Date().toISOString().slice(0, 10);

const STATIC_PAGES = [
  ['/', 'weekly', '1.0'],
  ['/ayurveda-skin-care', 'weekly', '0.9'],
  ['/services', 'weekly', '0.9'],
  ['/programs', 'monthly', '0.8'],
  ['/about', 'monthly', '0.8'],
  ['/booking', 'monthly', '0.9'],
  ['/insurance', 'monthly', '0.7'],
  ['/tools', 'monthly', '0.7'],
  ['/blog', 'weekly', '0.8'],
  ['/privacy', 'yearly', '0.3'],
  ['/terms', 'yearly', '0.3'],
];

// ids from constants.ts SERVICES (in the same order)
const SERVICE_IDS = [
  'abhyanga', 'swedana', 'dhara', 'panchakarma', 'basti', 'netra',
  'nasya', 'oral', 'rakta', 'women', 'others',
];

function readPosts() {
  const dir = resolve(ROOT, 'data/blog/posts');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const text = readFileSync(resolve(dir, f), 'utf8');
      const slug = text.match(/^slug:\s*(.+)$/m)?.[1]?.trim();
      const date = text.match(/^date:\s*(\d{4}-\d{2}-\d{2})/m)?.[1];
      const title = text.match(/^title:\s*(.+)$/m)?.[1]?.trim();
      const excerpt = text.match(/^excerpt:\s*(.+)$/m)?.[1]?.trim();
      if (!slug) throw new Error(`Post without slug: ${f}`);
      return { slug, date: date || today, title: title || slug, excerpt: excerpt || '' };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

function urlEntry(path, lastmod, changefreq, priority) {
  return `  <url>\n    <loc>${BASE}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function main() {
  const posts = readPosts();
  console.log(`Found ${posts.length} published blog posts`);

  const entries = [
    ...STATIC_PAGES.map(([path, freq, priority]) => urlEntry(path, today, freq, priority)),
    ...SERVICE_IDS.map((id) => urlEntry(`/services/${id}`, today, 'monthly', id === 'panchakarma' ? '0.8' : '0.7')),
    ...posts.map((p) => urlEntry(`/blog/${p.slug}`, p.date, 'monthly', '0.6')),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
  writeFileSync(resolve(ROOT, 'public/sitemap.xml'), xml, 'utf8');
  console.log(`sitemap.xml regenerated with ${entries.length} URLs (previously 30, mostly stale)`);

  // Keep llms-full.txt's blog section truthful: replace the whole section with
  // the real posts, and fix the article count in both llms files.
  const blogSection = `## Blog articles\n\n${posts
    .map((p, i) => `${i + 1}. [${p.title}](${BASE}/blog/${p.slug})${p.excerpt ? `: ${p.excerpt}` : ''}`)
    .join('\n')}\n`;

  for (const name of ['llms.txt', 'llms-full.txt']) {
    const file = resolve(ROOT, 'public', name);
    let text = readFileSync(file, 'utf8');
    text = text.replace(/\d+ educational blog articles/g, `${posts.length} educational blog articles`);
    if (name === 'llms-full.txt') {
      if (!/## Blog articles/.test(text)) throw new Error('llms-full.txt: Blog articles section not found');
      text = text.replace(/## Blog articles[\s\S]*?(?=\n## )/, blogSection + '\n');
    }
    writeFileSync(file, text, 'utf8');
    console.log(`${name} updated`);
  }
}

main();
