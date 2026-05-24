import { DietChart } from '../../data/dietCharts';

export interface ParsedDietChart {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  sourceUrl: string;
  author: string;
  publishedDate: string;
  updatedDate: string;
  foodsToConsume: Record<string, string[]>;
  foodsToAvoid: Record<string, string[]>;
  dietSchedule: Record<string, string>;
  lifestyleTips: string[];
  introduction: string;
  notes: string[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function extractCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('diabetes') || t.includes('blood sugar')) return 'Metabolic Health';
  if (t.includes('obesity') || t.includes('weight loss') || t.includes('weight-gain')) return 'Weight Management';
  if (t.includes('acidity') || t.includes('gerd') || t.includes('ibs') || t.includes('digestion') || t.includes('constipation') || t.includes('diarrhoea')) return 'Digestive Health';
  if (t.includes('pregnan')) return 'Pregnancy';
  if (t.includes('kidney') || t.includes('renal') || t.includes('nephrotic')) return 'Kidney Health';
  if (t.includes('liver') || t.includes('hepatic') || t.includes('jaundice') || t.includes('fatty liver') || t.includes('cirrhosis')) return 'Liver Health';
  if (t.includes('heart') || t.includes('cardio') || t.includes('hypertension') || t.includes('hypotension') || t.includes('cholesterol') || t.includes('triglyceride')) return 'Heart Health';
  if (t.includes('thyroid') || t.includes('hyperthyroid') || t.includes('hypothyroid')) return 'Thyroid Health';
  if (t.includes('skin') || t.includes('psoriasis') || t.includes('eczema') || t.includes('scleroderma')) return 'Skin Health';
  if (t.includes('arthritis') || t.includes('rheumatoid') || t.includes('gout') || t.includes('osteoporosis') || t.includes('fibromyalgia') || t.includes('back pain') || t.includes('slipped disc')) return 'Bone & Joint Health';
  if (t.includes('asthma') || t.includes('bronchitis') || t.includes('sinus')) return 'Respiratory Health';
  if (t.includes('menopause') || t.includes('pcos') || t.includes('ovarian') || t.includes('menstrual') || t.includes('menstru') || t.includes('endometrios') || t.includes('amenorrhe') || t.includes('infertility') || t.includes('prostate') || t.includes('oligosperm')) return 'Reproductive Health';
  if (t.includes('anemia') || t.includes('itp')) return 'Blood Health';
  if (t.includes('cancer') || t.includes('tumor')) return 'Cancer Support';
  if (t.includes('child') || t.includes('toddler') || t.includes('school') || t.includes('puberty')) return 'Child Health';
  if (t.includes('season') || t.includes(' monsoon') || t.includes('summer') || t.includes('winter') || t.includes('navratri')) return 'Seasonal Diet';
  if (t.includes('prakriti') || t.includes('vata') || t.includes('pitta') || t.includes('kapha')) return 'Ayurvedic Constitution';
  if (t.includes('brain') || t.includes('memory') || t.includes('depression') || t.includes('anxiety') || t.includes('stress') || t.includes('mental')) return 'Mental Health';
  if (t.includes('eye') || t.includes('cataract')) return 'Eye Health';
  if (t.includes('allergy')) return 'Allergy Care';
  if (t.includes('anal fistula') || t.includes('piles') || t.includes('hemorrhoid')) return 'GI Disorders';
  if (t.includes('ascites') || t.includes('edema') || t.includes('amyloidosis')) return 'Complex Conditions';
  if (t.includes(' Bells') || t.includes('paralys') || t.includes('hernia')) return 'Neurological & Surgical';
  if (t.includes('herpes') || t.includes('swollen lymph') || t.includes('henoch') || t.includes('crohn') || t.includes('colitis') || t.includes('fibroid')) return 'Immune & Chronic';
  if (t.includes(' Bells')) return 'Neurological';
  if (t.includes('breast') || t.includes('celiac')) return 'Specific Conditions';
  return 'General Health';
}

function parseTableToAVOID_ALLOWED(lines: string[], startIdx: number): { avoid: string[]; allowed: string[]; endIdx: number } {
  const avoid: string[] = [];
  const allowed: string[] = [];
  let endIdx = startIdx;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('### ') || line.startsWith('## ')) {
      endIdx = i;
      break;
    }

    if (line.startsWith('|') && line.includes('---')) continue;

    if (line.startsWith('|')) {
      const cols = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
      if (cols.length >= 2) {
        if (cols[0] && !cols[0].toUpperCase().includes('AVOID') && !cols[0].toUpperCase().includes('TO BE AVOIDED')) {
          avoid.push(...cols[0].split(',').map(s => s.trim()).filter(s => s.length > 2));
        }
        const lastCol = cols[cols.length - 1];
        if (lastCol && !lastCol.toUpperCase().includes('ALLOWED') && !lastCol.toUpperCase().includes('TO BE CONSUMED')) {
          allowed.push(...lastCol.split(',').map(s => s.trim()).filter(s => s.length > 2));
        }
      }
    } else if (line === '---' || line.startsWith('**Source') || line.startsWith('**NOTE') || line.startsWith('NOTE:')) {
      endIdx = i;
      break;
    } else if (line.length > 0 && !line.startsWith('|')) {
      endIdx = i;
      break;
    }

    if (i === lines.length - 1) endIdx = i + 1;
  }

  return { avoid: [...new Set(avoid)], allowed: [...new Set(allowed)], endIdx };
}

function parseTableToTwoColumn(lines: string[], startIdx: number): { consume: string[]; avoid: string[]; endIdx: number } {
  const consume: string[] = [];
  const avoid: string[] = [];
  let endIdx = startIdx;
  let mode: 'none' | 'consume' | 'avoid' = 'none';

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('### ') || line.startsWith('## ') || line === '---' || line.startsWith('**Source')) {
      endIdx = i;
      break;
    }

    if (line.startsWith('|') && line.includes('---')) continue;

    if (line.startsWith('|')) {
      const cols = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
      if (cols.length >= 2) {
        const firstCol = cols[0].toUpperCase();
        const lastCol = cols[cols.length - 1].toUpperCase();

        if (firstCol.includes('TO BE CONSUMED') || firstCol.includes('ALLOWED')) {
          mode = 'consume';
          if (cols.length >= 2 && !lastCol.includes('TO BE ') && !lastCol.includes('AVOID')) {
            consume.push(...cols[1].split(',').map(s => s.trim()).filter(s => s.length > 2));
          }
        } else if (firstCol.includes('TO BE AVOIDED') || firstCol.includes('AVOID')) {
          mode = 'avoid';
          if (cols.length >= 2 && !lastCol.includes('CONSUME') && !lastCol.includes('ALLOWED')) {
            avoid.push(...cols[1].split(',').map(s => s.trim()).filter(s => s.length > 2));
          }
        } else if (cols.length === 2) {
          const clean0 = cols[0].replace(/^-+$/, '');
          const clean1 = cols[1].replace(/^-+$/, '');
          if (clean0 && !clean0.includes('---')) {
            if (mode === 'consume') consume.push(...clean0.split(',').map(s => s.trim()).filter(s => s.length > 2));
            else if (mode === 'avoid') avoid.push(...clean0.split(',').map(s => s.trim()).filter(s => s.length > 2));
          }
          if (clean1 && !clean1.includes('---')) {
            if (mode === 'consume') consume.push(...clean1.split(',').map(s => s.trim()).filter(s => s.length > 2));
            else if (mode === 'avoid') avoid.push(...clean1.split(',').map(s => s.trim()).filter(s => s.length > 2));
          }
        }
      }
    } else if (line.length === 0 || line.startsWith('**')) {
      if (line.length > 0) endIdx = i;
      break;
    }

    if (i === lines.length - 1) endIdx = i + 1;
  }

  return { consume: [...new Set(consume)], avoid: [...new Set(avoid)], endIdx };
}

function parseDietSchedule(lines: string[], startIdx: number): { schedule: Record<string, string>; endIdx: number } {
  const schedule: Record<string, string> = {};
  let endIdx = startIdx;

  const timePatterns = [
    /^(EARLY-MORNING|EARLY MORNING|EARLYMORNING)/i,
    /^(MORNING|BREAKFAST)/i,
    /^(MID-MORNING|MID MORNING|MIDMORNING)/i,
    /^(LUNCH)/i,
    /^(AFTERNOON|EVENING|SNACK)/i,
    /^(PRE-DINNER|PRE DINNER|PREDINNER)/i,
    /^(DINNER)/i,
    /^(BEDTIME|LATE-NIGHT|LATE NIGHT|LATENIGHT)/i,
  ];

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('## ') || line.startsWith('### ') && !line.match(/^(EARLY|BREAKFAST|MID|LUNCH|EVENING|DINNER|BEDTIME|PRE)/i)) {
      endIdx = i;
      break;
    }

    if (line === '---' || line.startsWith('**Source') || line.startsWith('**NOTE')) {
      endIdx = i;
      break;
    }

    if (line.length > 0) {
      const timeMatch = line.match(/^([A-Z][A-Z-]+(?:\s+[A-Z]+)?)\s*[-–:]\s*(.+)/);
      if (timeMatch) {
        schedule[timeMatch[1]] = timeMatch[2];
      } else if (!line.startsWith('|') && !line.startsWith('#') && !line.startsWith('**')) {
        const parts = line.split(/\s*[-–:]\s*/);
        if (parts.length === 2 && parts[0].length < 30) {
          schedule[parts[0].trim()] = parts[1].trim();
        }
      }
    }

    if (i === lines.length - 1) endIdx = i + 1;
  }

  return { schedule, endIdx };
}

function generateFoodGroups(foodsToConsume: Record<string, string[]>): { name: string; percentage: number; color: string }[] {
  const colors = ['#0d8770', '#c9a227', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
  const entries = Object.entries(foodsToConsume);
  const total = entries.reduce((sum, [, items]) => sum + items.length, 0) || 1;
  return entries.map(([name, items], i) => ({
    name,
    percentage: Math.round((items.length / total) * 100),
    color: colors[i % colors.length]
  })).sort((a, b) => b.percentage - a.percentage);
}

export function parseMarkdown(content: string, filename: string): ParsedDietChart {
  const lines = content.split('\n');
  const title = lines.find(l => l.startsWith('# '))?.replace(/^#+\s*/, '').trim() || filename.replace('.md', '');

  let author = '';
  let publishedDate = '';
  let updatedDate = '';
  let introduction = '';
  const notes: string[] = [];
  const lifestyleTips: string[] = [];

  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('Written By') || line.startsWith('Author')) {
      author = line.replace(/^(Written By|Author)\s*/i, '').replace(/\(.*\)/, '').trim();
    }
    if (line.match(/^\d{1,2}\s+\w+\s+\d{4}$/)) {
      if (!publishedDate) publishedDate = line;
      else updatedDate = line;
    }
    if (line.match(/Published on:/i)) {
      const next = lines[i + 1]?.trim();
      if (next && next.match(/^\d+/)) publishedDate = next;
    }
    if (line.match(/Updated on:/i)) {
      const next = lines[i + 1]?.trim();
      if (next && next.match(/^\d+/)) updatedDate = next;
    }
    if (line.startsWith('## INTRODUCTION') || line.startsWith('## INTRODUCTION\n')) {
      const nextLines = lines.slice(i + 1).join('\n').split(/^##\s/m)[0].trim();
      introduction = nextLines.replace(/^#+\s/gm, '').replace(/\*\*/g, '').trim();
    }
    if (line.startsWith('## DIET TIPS') || line.startsWith('## IMPORTANT TIPS') || line.startsWith('### Diet Tips') || line.startsWith('## LIFESTYLE')) {
      const sectionLines = lines.slice(i).join('\n').split(/^##\s/m)[0].split('\n');
      sectionLines.forEach(l => {
        const t = l.replace(/^[-*]\s*/, '').trim().replace(/\*\*/g, '');
        if (t.length > 10 && !t.startsWith('#') && !t.startsWith('|')) {
          if (!lifestyleTips.includes(t)) lifestyleTips.push(t);
        }
      });
    }
    if (line.startsWith('- **') && !line.includes('Herbal Tea') && !line.includes('Walk') && !line.includes('Water') && !line.includes('Skipping') && !line.includes('Whole fruit')) {
      const tip = line.replace(/^[-*]\s*\*\*[^*]+\*\*\s*[-–:]\s*/, '').replace(/\*\*/g, '').trim();
      if (tip.length > 10 && !lifestyleTips.includes(tip)) lifestyleTips.push(tip);
    }
    if (line.startsWith('**Source:')) {
      const url = line.match(/\(https?:\/\/[^\)]+\)/)?.[0]?.replace(/[()]/g, '') || '';
      if (url) notes.push(`Source: ${url}`);
    }
    if (line.startsWith('**NOTE:') || line.startsWith('NOTE:')) {
      notes.push(line.replace(/\*\*/g, '').trim());
    }
  }

  const foodsToConsume: Record<string, string[]> = {};
  const foodsToAvoid: Record<string, string[]> = {};
  const dietSchedule: Record<string, string> = {};

  let section = '';
  let inSchedule = false;
  let scheduleSectionEnd = 0;

  for (let j = 0; j < lines.length; j++) {
    const line = lines[j].trim();

    if (inSchedule && j >= scheduleSectionEnd) {
      inSchedule = false;
    }

    if (line.startsWith('## DAILY DIET SCHEDULE') || line.startsWith('## DAILY SCHEDULE') || line.startsWith('### DAILY DIET SCHEDULE')) {
      inSchedule = true;
      const result = parseDietSchedule(lines, j + 1);
      Object.assign(dietSchedule, result.schedule);
      scheduleSectionEnd = result.endIdx;
      j = result.endIdx - 1;
      continue;
    }

    if (inSchedule) {
      const result = parseDietSchedule(lines, j);
      Object.assign(dietSchedule, result.schedule);
      if (result.endIdx > j) {
        j = result.endIdx - 1;
        inSchedule = false;
      }
      continue;
    }

    if (line.startsWith('### EARLY-MORNING') || line.startsWith('### BREAKFAST') || line.startsWith('### MID-MORNING') ||
        line.startsWith('### LUNCH') || line.startsWith('### EVENING') || line.startsWith('### DINNER') || line.startsWith('### PRE-DINNER') ||
        line.startsWith('### BEDTIME') || line.startsWith('### SNACK')) {
      const timeKey = line.replace(/^###\s*/, '').replace(/\s+/g, '-').toUpperCase();
      let food = '';
      for (let k = j + 1; k < lines.length; k++) {
        const foodLine = lines[k].trim();
        if (foodLine.startsWith('### ') || foodLine.startsWith('## ') || foodLine === '---' || foodLine.startsWith('**Source')) break;
        if (foodLine.length > 0 && !foodLine.startsWith('|') && !foodLine.startsWith('**')) {
          food = foodLine.replace(/\*\*/g, '').replace(/^[-*]\s*/, '').trim();
          break;
        }
      }
      if (food && !dietSchedule[timeKey]) {
        dietSchedule[timeKey] = food;
      }
      continue;
    }

    const sectionMatch = line.match(/^###\s+(.+)/);
    if (sectionMatch) {
      section = sectionMatch[1].toUpperCase().trim();
      continue;
    }

    if (line.startsWith('|') && line.includes('AVOID') && line.includes('ALLOWED')) {
      const { avoid, allowed, endIdx } = parseTableToAVOID_ALLOWED(lines, j);
      if (avoid.length > 0) {
        foodsToAvoid[section || 'Foods'] = [...(foodsToAvoid[section || 'Foods'] || []), ...avoid];
      }
      if (allowed.length > 0) {
        foodsToConsume[section || 'Foods'] = [...(foodsToConsume[section || 'Foods'] || []), ...allowed];
      }
      j = endIdx - 1;
      continue;
    }

    if (line.startsWith('|') && (line.includes('TO BE CONSUMED') || line.includes('TO BE AVOIDED') || line.includes('CONSUME'))) {
      const { consume, avoid: av, endIdx } = parseTableToTwoColumn(lines, j);
      if (consume.length > 0) {
        foodsToConsume[section || 'Foods'] = [...(foodsToConsume[section || 'Foods'] || []), ...consume];
      }
      if (av.length > 0) {
        foodsToAvoid[section || 'Foods'] = [...(foodsToAvoid[section || 'Foods'] || []), ...av];
      }
      j = endIdx - 1;
      continue;
    }

    if (line.startsWith('## FOODS TO CONSUME AND AVOID')) {
      section = '';
    }
  }

  const sourceLine = content.match(/\*\*Source:\*\*\s*(.+)/)?.[1] || '';
  const sourceUrl = sourceLine.match(/https?:\/\/[^\s]+/)?.[0] || '';

  const slug = filename.replace('.md', '').replace(/\\/g, '/').split('/').pop() || slugify(title);

  return {
    id: slugify(slug),
    slug,
    title,
    category: extractCategory(title),
    description: introduction.slice(0, 300) || `${title} - A comprehensive Ayurvedic diet plan for managing this condition.`,
    sourceUrl,
    author,
    publishedDate,
    updatedDate,
    foodsToConsume,
    foodsToAvoid,
    dietSchedule,
    lifestyleTips,
    introduction,
    notes
  };
}

export function parsedToDietChart(parsed: ParsedDietChart): DietChart {
  return {
    id: parsed.id,
    slug: parsed.slug,
    title: parsed.title,
    category: parsed.category,
    description: parsed.description,
    image: `https://images.unsplash.com/photo-1576001148957-4f4a4d3838b1?w=800&auto=format&fit=crop`,
    foodsToConsume: parsed.foodsToConsume,
    foodsToAvoid: parsed.foodsToAvoid,
    dietSchedule: parsed.dietSchedule,
    lifestyleTips: parsed.lifestyleTips,
    foodGroups: generateFoodGroups(parsed.foodsToConsume)
  };
}