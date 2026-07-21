import React, { useMemo } from 'react';

interface DietChartRendererProps {
  aiResult: string;
}

// ─── Typed section interfaces ───
interface MealRow {
  time: string;
  recommended: string[];
  avoid: string[];
}

interface CategoryItems {
  [category: string]: string[];
}

interface DinacharyaItem {
  time: string;
  activity: string;
  benefit: string;
}

interface Remedy {
  name: string;
  preparation: string;
  when: string;
  benefit: string;
}

type SectionType =
  | 'title'
  | 'intro'
  | 'core-principles'
  | 'ayurvedic-principles'
  | 'meal-block'
  | 'meal-table'
  | 'pathya'
  | 'apathya'
  | 'dinacharya'
  | 'remedies'
  | 'lifestyle'
  | 'footer'
  | 'validation'
  | 'unknown';

interface MealEntry {
  heading: string;
  time?: string;
  note?: string;
  recommended: string[];
  avoid: string[];
}

interface Section {
  type: SectionType;
  title?: string;
  rawLines: string[];
  mealRows?: MealRow[];
  mealEntries?: MealEntry[];
  pathyaItems?: CategoryItems;
  apathyaItems?: CategoryItems;
  dinacharya?: DinacharyaItem[];
  remedies?: Remedy[];
  lifestyle?: { [section: string]: string[] };
  principles?: string[];
  validationErrors?: string[];
  validationWarnings?: string[];
  introText?: string;
}

// ─── Robust helpers ───
function isHeading(line: string, level: 1 | 2 | 3): boolean {
  const pattern = level === 1 ? /^#\s+/ : level === 2 ? /^##\s+/ : /^###\s+/;
  return pattern.test(line.trim());
}

function getHeadingText(line: string): string {
  return line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
}

function isTableRow(line: string): boolean {
  const t = line.trim();
  return t.startsWith('|') && t.endsWith('|') && t.includes('---') === false;
}

function isBoldLine(line: string): boolean {
  const t = line.trim();
  return t.startsWith('**') && t.endsWith('**');
}

function stripBold(line: string): string {
  return line.replace(/\*\*/g, '').trim();
}

function isBullet(line: string): boolean {
  const t = line.trim();
  return t.startsWith('- ') || t.startsWith('* ') || t.startsWith('• ');
}

function stripBullet(line: string): string {
  return line.replace(/^[-*•]\s*/, '').trim();
}

function isNumberedItem(line: string): boolean {
  return /^\d+[.\)]\s*/.test(line.trim());
}

function classifySection(title: string): SectionType {
  const t = title.toLowerCase();
  if (t.includes('understanding') || t.includes('intro') || t.includes('about')) return 'intro';
  if (t.includes('core dietary') || t.includes('principle') || t.includes('guideline')) return 'core-principles';
  if (t.includes('ayurvedic principle') || t.includes('healing principle')) return 'ayurvedic-principles';
  if (t.includes('meal') || t.includes('schedule') || t.includes('diet schedule') || t.includes('daily diet') || /^\d+[.\)]\s*\w/.test(title)) return 'meal-block';
  if (t.includes('pathya') && !t.includes('apathya') && !t.includes('avoid')) return 'pathya';
  if (t.includes('apathya') || (t.includes('avoid') && !t.includes('meal'))) return 'apathya';
  if (t.includes('dinacharya') || t.includes('daily routine') || t.includes('daily schedule')) return 'dinacharya';
  if (t.includes('remedy') || t.includes('home')) return 'remedies';
  if (t.includes('lifestyle') || t.includes('life')) return 'lifestyle';
  if (t.includes('validation') || t.includes('viruddha') || t.includes('note on healing')) return 'validation';
  if (t.includes('dr.') || t.includes('ayurvritta') || t.includes('dietary guidance')) return 'footer';
  return 'unknown';
}

function extractConditionName(text: string): string {
  // Try to find condition from title lines
  const lines = text.split('\n');
  for (const line of lines) {
    if (isHeading(line, 1)) {
      const title = getHeadingText(line);
      // Extract text before "— Ayurvedic" or "Diet Chart"
      const match = title.match(/([^—|-]+)/);
      if (match) return match[1].trim();
    }
  }
  return 'Your Condition';
}

// ─── Core Principles Parser ───
function parseCorePrinciples(lines: string[]): string[] {
  const items: string[] = [];
  let current = '';

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      if (current) { items.push(current); current = ''; }
      continue;
    }
    if (isHeading(t, 1) || isHeading(t, 2) || isHeading(t, 3)) continue;

    if (isBoldLine(t)) {
      if (current) { items.push(current); current = ''; }
      items.push(stripBold(t));
    } else if (t.startsWith('- ') || t.startsWith('* ') || t.startsWith('• ')) {
      if (current) { items.push(current); current = ''; }
      items.push(stripBullet(t));
    } else if (t.match(/^\d+[.\)]\s/)) {
      if (current) { items.push(current); current = ''; }
      items.push(t.replace(/^\d+[.\)]\s*/, '').trim());
    } else if (t.length > 10) {
      if (current) current += ' ' + t;
      else current = t;
    }
    if (items.length >= 8) break;
  }
  if (current) items.push(current);
  return items.filter(Boolean);
}

// ─── Meal Block Parser (new format: ### 1. Breakfast with sub-sections) ───
function parseMealBlock(lines: string[]): MealEntry[] {
  const entries: MealEntry[] = [];
  let current: MealEntry | null = null;
  let currentList: 'recommended' | 'avoid' | null = null;

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      currentList = null;
      continue;
    }

    // Detect meal heading: `### 1. Breakfast` or `### Breakfast`
    const mealHeading = t.match(/^###\s*\d*[.\)]*\s*(.+)/i);
    if (mealHeading) {
      if (current) entries.push(current);
      current = { heading: mealHeading[1].trim(), recommended: [], avoid: [] };
      currentList = null;
      continue;
    }

    if (!current) continue;

    // **Time:** 7:00 – 8:00 AM
    const timeMatch = t.match(/^\*\*Time:\*\*\s*(.+)/i);
    if (timeMatch) {
      current.time = timeMatch[1].trim();
      continue;
    }

    // **Note:** ...
    const noteMatch = t.match(/^\*\*Note:\*\*\s*(.+)/i);
    if (noteMatch) {
      current.note = noteMatch[1].trim();
      continue;
    }

    // **Recommended Foods:** or **Recommended:**
    if (/^\*\*Recommended\s*(Foods)?:\*\*/i.test(t)) {
      currentList = 'recommended';
      continue;
    }

    // **Foods to Avoid:** or **Avoid:**
    if (/^\*\*Avoid:\*\*/i.test(t) || /^\*\*Foods to Avoid:\*\*/i.test(t)) {
      currentList = 'avoid';
      continue;
    }

    // Bullet items
    if ((t.startsWith('- ') || t.startsWith('* ') || t.startsWith('• '))) {
      const item = stripBullet(t);
      if (currentList === 'recommended') current.recommended.push(item);
      else if (currentList === 'avoid') current.avoid.push(item);
      continue;
    }

    // Plain comma/newline-separated items under current list
    if (currentList && !t.startsWith('#') && !t.startsWith('|')) {
      const items = t.split(/[,;]/).map(s => s.trim()).filter(Boolean);
      for (const item of items) {
        if (currentList === 'recommended') current.recommended.push(item);
        else current.avoid.push(item);
      }
    }
  }

  if (current) entries.push(current);
  return entries;
}

// ─── Meal Table Parser (legacy table format) ───
function parseMealTable(lines: string[]): MealRow[] {
  const rows: MealRow[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t || !t.startsWith('|') || !t.includes('|')) continue;
    if (t.includes('---')) continue;
    if (t.toLowerCase().includes('time') && t.toLowerCase().includes('recom')) continue; // header row

    const parts = t.split('|').map(p => p.trim()).filter(p => p);
    if (parts.length < 2) continue;

    // Detect time column — contains time pattern or is the first column and looks like a time
    let timeCol = 0;
    let recomCol = 1;
    let avoidCol = 2;

    if (parts.length >= 3) {
      // Header should be: TIME | RECOMMENDED | AVOID or similar
      const headerMatch = lines.find(l =>
        l.trim().startsWith('|') &&
        (l.toLowerCase().includes('time') || l.toLowerCase().includes('recom'))
      );
      if (headerMatch) {
        const hParts = headerMatch.split('|').map(p => p.trim().toLowerCase());
        for (let i = 0; i < hParts.length; i++) {
          if (hParts[i].includes('time')) timeCol = i;
          else if (hParts[i].includes('recom') || hParts[i].includes('food') || hParts[i].includes('eat')) recomCol = i;
          else if (hParts[i].includes('avoid') || hParts[i].includes('not')) avoidCol = i;
        }
      } else {
        // Fallback: first col is time if it has digits or AM/PM
        if (!/\d/.test(parts[0]) && !/am|pm/i.test(parts[0])) {
          continue; // skip this row, no time column detected
        }
      }
    } else if (parts.length < 2) {
      continue;
    }

    const time = parts[timeCol] || '';
    const recommended = parts[recomCol]
      ? parts[recomCol].split(/[,;]/).map(s => s.trim()).filter(Boolean)
      : [];
    const avoid = parts[avoidCol]
      ? parts[avoidCol].split(/[,;]/).map(s => s.trim()).filter(Boolean)
      : [];

    if (time && (recommended.length > 0 || avoid.length > 0)) {
      rows.push({ time, recommended, avoid });
    }
  }
  return rows;
}

// ─── Pathya / Apathya Parser ───
function parsePathyaApathya(lines: string[]): CategoryItems {
  const items: CategoryItems = {};
  let currentCategory = '';

  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;

    // Category header: **CEREALS** or ## CEREALS or just ALL CAPS word
    const boldMatch = t.match(/^\*\*(.+?)\*\*\s*$/);
    if (boldMatch) {
      currentCategory = boldMatch[1].toUpperCase();
      if (!items[currentCategory]) items[currentCategory] = [];
      continue;
    }

    // ALL CAPS header
    const capsMatch = t.match(/^[A-Z][A-Z\s&()\-:]+$/);
    if (capsMatch && t.length > 2 && t.length < 60 && !t.includes('.')) {
      currentCategory = t;
      if (!items[currentCategory]) items[currentCategory] = [];
      continue;
    }

    // Bullet items under current category
    if (currentCategory && (t.startsWith('- ') || t.startsWith('* ') || t.startsWith('• '))) {
      if (!items[currentCategory]) items[currentCategory] = [];
      items[currentCategory].push(stripBullet(t));
      continue;
    }

    // Continuation of previous item (no bullet, no header, just text)
    if (currentCategory && t && !t.startsWith('#') && !t.startsWith('-') && items[currentCategory].length > 0) {
      const last = items[currentCategory][items[currentCategory].length - 1];
      items[currentCategory][items[currentCategory].length - 1] = last + ' ' + t;
    }
  }
  return items;
}

// ─── Dinacharya Parser ───
function parseDinacharya(lines: string[]): DinacharyaItem[] {
  const items: DinacharyaItem[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;

    // Pattern: "1. 5:30 AM - Activity — benefit"
    const match1 = t.match(/^\d+[.\)]\s*(.+?)\s*[-–—]\s*(.+?)(?:[-–—]\s*(.+))?$/);
    if (match1) {
      const timePart = match1[1].trim();
      const actBenefit = match1[2].trim();
      const benefit = match1[3] ? match1[3].trim() : '';

      // Try to extract time from activity text (e.g., "5:30 AM - Wake up" or "Wake up at 5:30 AM")
      const timeMatch = timePart.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i) ||
        actBenefit.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i) ||
        [null, timePart];
      const activity = actBenefit.replace(/\d{1,2}:\d{2}\s*(?:AM|PM)?/i, '').trim() || timePart;

      items.push({
        time: timeMatch ? timeMatch[1] : timePart,
        activity: activity,
        benefit,
      });
      continue;
    }

    // Simple numbered: "1. Activity — benefit"
    const match2 = t.match(/^\d+[.\)]\s*(.+)/);
    if (match2) {
      const rest = match2[1].trim();
      const parts = rest.split(/[-–—]/).map(s => s.trim());
      if (parts.length >= 2) {
        items.push({
          time: '',
          activity: parts[0],
          benefit: parts.slice(1).join(' — '),
        });
      } else if (parts.length === 1) {
        items.push({ time: '', activity: parts[0], benefit: '' });
      }
    }
  }
  return items;
}

// ─── Remedies Parser ───
function parseRemedies(lines: string[]): Remedy[] {
  const remedies: Remedy[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;

    // Pattern: "1. **Name**: Preparation: X | When: Y | Benefit: Z"
    const match = t.match(/^\d+[.\)]\s*\*\*(.+?)\*\*[:\s]*(.+)/);
    if (match) {
      const name = match[1];
      const rest = match[2];

      const prep = (rest.match(/Preparation:([^|]+)/i) || [null, ''])[1].trim();
      const when = (rest.match(/When:([^|]+)/i) || [null, ''])[1].trim();
      const benefit = (rest.match(/Benefit:([^|]+)/i) || [null, rest])[1].trim();

      remedies.push({ name, preparation: prep, when, benefit });
    }
  }
  return remedies;
}

// ─── Lifestyle Parser ───
function parseLifestyle(lines: string[]): { [key: string]: string[] } {
  const lifestyle: { [key: string]: string[] } = {};
  let currentCategory = '';

  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;

    if (isBoldLine(t)) {
      currentCategory = stripBold(t);
      if (!lifestyle[currentCategory]) lifestyle[currentCategory] = [];
      continue;
    }

    const capsMatch = t.match(/^[A-Z][A-Z\s&()\-:]+$/);
    if (capsMatch && t.length > 2 && t.length < 60 && !t.includes('.')) {
      currentCategory = t;
      if (!lifestyle[currentCategory]) lifestyle[currentCategory] = [];
      continue;
    }

    if (currentCategory && (t.startsWith('- ') || t.startsWith('* ') || t.startsWith('• '))) {
      lifestyle[currentCategory].push(stripBullet(t));
    }
  }
  return lifestyle;
}

// ─── Main Parser ───
function parseAIResult(text: string): Section[] {
  const sections: Section[] = [];
  if (!text || !text.trim()) return sections;

  const lines = text.split('\n');
  let i = 0;
  let currentSection: Section | null = null;

  const flush = () => {
    if (!currentSection) return;

    // Post-parse content based on section type
    switch (currentSection.type) {
      case 'core-principles':
      case 'ayurvedic-principles':
        currentSection.principles = parseCorePrinciples(currentSection.rawLines);
        break;
      case 'meal-block':
        currentSection.mealEntries = parseMealBlock(currentSection.rawLines);
        break;
      case 'meal-table':
        currentSection.mealRows = parseMealTable(currentSection.rawLines);
        break;
      case 'pathya':
        currentSection.pathyaItems = parsePathyaApathya(currentSection.rawLines);
        break;
      case 'apathya':
        currentSection.apathyaItems = parsePathyaApathya(currentSection.rawLines);
        break;
      case 'dinacharya':
        currentSection.dinacharya = parseDinacharya(currentSection.rawLines);
        break;
      case 'remedies':
        currentSection.remedies = parseRemedies(currentSection.rawLines);
        break;
      case 'lifestyle':
        currentSection.lifestyle = parseLifestyle(currentSection.rawLines);
        break;
      case 'intro':
        currentSection.introText = currentSection.rawLines.join(' ').trim();
        break;
      case 'validation':
        currentSection.validationErrors = currentSection.rawLines.filter(l => l.includes('[BLOCKED]') || l.includes('CRITICAL'));
        currentSection.validationWarnings = currentSection.rawLines.filter(l => l.includes('[Note]') && !l.includes('[BLOCKED]'));
        break;
    }

    if (currentSection.rawLines.length > 0) {
      sections.push(currentSection);
    }
    currentSection = null;
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // ── H1: main title ──
    if (isHeading(line, 1)) {
      flush();
      currentSection = {
        type: 'title',
        title: getHeadingText(line),
        rawLines: [],
      };
      sections.push(currentSection);
      currentSection = null;
      i++;
      continue;
    }

    // ── H2 / H3: section headers ──
    if (isHeading(line, 2) || isHeading(line, 3)) {
      flush();
      const title = getHeadingText(line);
      const sectionType = classifySection(title);

      // Handle H2 that contains a nested H3 (e.g., "## Understanding Condition\n### Ayurveda View")
      currentSection = {
        type: sectionType,
        title,
        rawLines: [],
      };
      i++;
      continue;
    }

    // ── Content lines ──
    if (currentSection) {
      currentSection.rawLines.push(trimmed);
    }

    // ── Detect if next H2 starts a new section ──
    if (i + 1 < lines.length && (isHeading(lines[i + 1], 2) || isHeading(lines[i + 1], 3))) {
      flush();
    }

    i++;
  }

  flush();
  return sections;
}

// ─── Renderer Component ───
const DietChartRenderer: React.FC<DietChartRendererProps> = ({ aiResult }) => {
  const sections = useMemo(() => parseAIResult(aiResult), [aiResult]);

  if (!sections.length) {
    return (
      <div className="bg-white rounded-3xl p-6 text-center text-gray-500">
        No diet chart data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section, idx) => {
        switch (section.type) {
          case 'title':
            return (
              <div key={idx} className="bg-gradient-to-r from-ayur-green to-ayur-green-dark rounded-2xl p-5 text-white shadow-glow">
                <h2 className="font-serif text-xl font-bold mb-2">{section.title}</h2>
                <p className="text-white/80 text-sm">Personalized Ayurvedic Diet Chart</p>
              </div>
            );

          case 'intro':
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
                <h3 className="font-serif font-bold text-ayur-green text-base mb-3">
                  {section.title || 'Understanding Your Condition in Ayurveda'}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">{section.introText}</p>
              </div>
            );

          case 'core-principles':
          case 'ayurvedic-principles': {
            const principles = section.principles || [];
            if (!principles.length) return null;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100">
                  <h3 className="font-serif font-bold text-emerald-800 text-base">
                    {section.title || 'Core Dietary Principles'}
                  </h3>
                </div>
                <div className="p-4 space-y-2">
                  {principles.map((p, i) => {
                    const boldMatch = p.match(/^\*\*(.+?)\*\*[:\s]*(.+)/);
                    return (
                      <div key={i} className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
                        <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {boldMatch ? (
                          <>
                            <span className="font-bold text-ayur-green text-sm">{boldMatch[1]}:</span>
                            <span className="text-gray-600 text-sm">{boldMatch[2]}</span>
                          </>
                        ) : (
                          <span className="text-gray-700 text-sm">{p}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          case 'meal-table': {
            const rows = section.mealRows || [];
            if (!rows.length) {
              // Fallback: render raw lines as text
              return (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4">
                  <h3 className="font-serif font-bold text-amber-800 text-base mb-3">
                    {section.title || 'Meal-by-Meal Guide'}
                  </h3>
                  <div className="space-y-2">
                    {section.rawLines.filter(l => l.trim()).map((l, i) => (
                      <div key={i} className="text-sm text-gray-700">{l}</div>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="bg-amber-50 px-4 py-3 border-b border-amber-100">
                  <h3 className="font-serif font-bold text-amber-800 text-base">
                    {section.title || 'Daily Diet Schedule'}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2.5 font-bold text-gray-600 text-xs uppercase tracking-wider w-36">Time</th>
                        <th className="text-left px-4 py-2.5 font-bold text-green-700 text-xs uppercase tracking-wider">Recommended</th>
                        <th className="text-left px-4 py-2.5 font-bold text-red-700 text-xs uppercase tracking-wider">Avoid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 align-top">
                            <span className="text-xs font-medium text-gray-600">{row.time}</span>
                          </td>
                          <td className="px-4 py-3 align-top">
                            {row.recommended.map((item, j) => (
                              <div key={j} className="flex gap-2 items-start mb-1.5 last:mb-0">
                                <span className="text-green-500 mt-0.5 shrink-0">●</span>
                                <span className="text-gray-700 text-xs leading-relaxed">{item}</span>
                              </div>
                            ))}
                            {row.recommended.length === 0 && <span className="text-gray-400 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3 align-top">
                            {row.avoid.map((item, j) => (
                              <div key={j} className="flex gap-2 items-start mb-1.5 last:mb-0">
                                <span className="text-red-400 mt-0.5 shrink-0">○</span>
                                <span className="text-gray-500 text-xs leading-relaxed">{item}</span>
                              </div>
                            ))}
                            {row.avoid.length === 0 && <span className="text-gray-400 text-xs">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          case 'meal-block': {
            const entries = section.mealEntries || [];
            if (!entries.length) {
              return (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4">
                  <h3 className="font-serif font-bold text-amber-800 text-base mb-3">
                    {section.title || 'Meal-by-Meal Guide'}
                  </h3>
                  <div className="space-y-2">
                    {section.rawLines.filter(l => l.trim()).map((l, i) => (
                      <div key={i} className="text-sm text-gray-700 whitespace-pre-wrap">{l}</div>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="bg-amber-50 px-4 py-3 border-b border-amber-100">
                  <h3 className="font-serif font-bold text-amber-800 text-base">
                    {section.title || 'Daily Diet Schedule'}
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {entries.map((entry, ei) => (
                    <div key={ei} className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-7 h-7 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                          {ei + 1}
                        </span>
                        <h4 className="font-serif font-bold text-gray-800 text-base">{entry.heading}</h4>
                        {entry.time && (
                          <span className="ml-auto text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                            {entry.time}
                          </span>
                        )}
                      </div>
                      {entry.note && (
                        <p className="text-xs text-gray-500 italic mb-3 ml-9">{entry.note}</p>
                      )}
                      <div className="ml-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {entry.recommended.length > 0 && (
                          <div>
                            <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <span className="text-green-500">●</span> Recommended
                            </div>
                            <div className="space-y-1">
                              {entry.recommended.map((item, ji) => (
                                <div key={ji} className="flex gap-2 items-start">
                                  <span className="text-green-400 mt-0.5 shrink-0">•</span>
                                  <span className="text-gray-700 text-xs leading-relaxed">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {entry.avoid.length > 0 && (
                          <div>
                            <div className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <span className="text-red-400">○</span> Avoid
                            </div>
                            <div className="space-y-1">
                              {entry.avoid.map((item, ji) => (
                                <div key={ji} className="flex gap-2 items-start">
                                  <span className="text-red-300 mt-0.5 shrink-0">•</span>
                                  <span className="text-gray-500 text-xs leading-relaxed">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {entry.recommended.length === 0 && entry.avoid.length === 0 && (
                        <p className="ml-9 text-xs text-gray-400">No specific items listed.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          case 'pathya': {
            const items = section.pathyaItems || {};
            const categories = Object.keys(items).filter(k => items[k]?.length > 0);
            if (!categories.length) return null;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100">
                  <h3 className="font-serif font-bold text-emerald-800 text-base">
                    {section.title || 'Pathya — Eat Freely'}
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categories.map(cat => (
                      <div key={cat} className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                        <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">{cat}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {items[cat].map((item, j) => (
                            <span key={j} className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          case 'apathya': {
            const items = section.apathyaItems || {};
            const categories = Object.keys(items).filter(k => items[k]?.length > 0);
            if (!categories.length) return null;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="bg-red-50 px-4 py-3 border-b border-red-100">
                  <h3 className="font-serif font-bold text-red-800 text-base">
                    {section.title || 'Apathya — Strictly Avoid'}
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categories.map(cat => (
                      <div key={cat} className="bg-red-50 rounded-xl p-3 border border-red-100">
                        <div className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2">{cat}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {items[cat].map((item, j) => (
                            <span key={j} className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          case 'dinacharya': {
            const items = section.dinacharya || [];
            if (!items.length) return null;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
                  <h3 className="font-serif font-bold text-indigo-800 text-base">
                    {section.title || 'Daily Routine (Dinacharya)'}
                  </h3>
                </div>
                <div className="p-4 space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-4 items-start p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        {item.time && <div className="text-xs font-medium text-indigo-600 mb-0.5">{item.time}</div>}
                        <div className="font-medium text-gray-800 text-sm">{item.activity}</div>
                        {item.benefit && <div className="text-xs text-gray-500 mt-0.5">{item.benefit}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          case 'remedies': {
            const remedies = section.remedies || [];
            if (!remedies.length) {
              // Fallback: render raw lines
              return (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4">
                  <h3 className="font-serif font-bold text-amber-800 text-base mb-3">
                    {section.title || 'Classical Home Remedies'}
                  </h3>
                  <div className="space-y-2">
                    {section.rawLines.filter(l => l.trim() && !l.startsWith('#')).map((l, i) => (
                      <div key={i} className="text-sm text-gray-700">{l}</div>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="bg-amber-50 px-4 py-3 border-b border-amber-100">
                  <h3 className="font-serif font-bold text-amber-800 text-base">
                    {section.title || 'Classical Home Remedies'}
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {remedies.map((r, i) => (
                    <div key={i} className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-serif font-bold text-amber-900 text-sm mb-2">{r.name}</div>
                          <div className="space-y-1 text-xs">
                            {r.preparation && (
                              <div className="flex gap-2">
                                <span className="font-semibold text-amber-700 shrink-0">Preparation:</span>
                                <span className="text-gray-700">{r.preparation}</span>
                              </div>
                            )}
                            {r.when && (
                              <div className="flex gap-2">
                                <span className="font-semibold text-amber-700 shrink-0">When:</span>
                                <span className="text-gray-700">{r.when}</span>
                              </div>
                            )}
                            {r.benefit && (
                              <div className="flex gap-2">
                                <span className="font-semibold text-green-700 shrink-0">Benefit:</span>
                                <span className="text-gray-700">{r.benefit}</span>
                              </div>
                            )}
                            {!r.preparation && !r.when && !r.benefit && (
                              <span className="text-gray-600">{r.name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          case 'lifestyle': {
            const lifestyle = section.lifestyle || {};
            const categories = Object.keys(lifestyle).filter(k => lifestyle[k]?.length > 0);
            if (!categories.length) return null;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="bg-teal-50 px-4 py-3 border-b border-teal-100">
                  <h3 className="font-serif font-bold text-teal-800 text-base">
                    {section.title || 'Lifestyle Guidelines'}
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categories.map(cat => (
                    <div key={cat} className="bg-teal-50 rounded-xl p-3 border border-teal-100">
                      <div className="font-serif font-bold text-teal-800 text-xs mb-2 uppercase tracking-wide">{cat}</div>
                      <div className="space-y-1.5">
                        {lifestyle[cat].map((item, j) => (
                          <div key={j} className="flex gap-2 items-start text-xs">
                            <span className="text-teal-500 mt-0.5 shrink-0">•</span>
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          case 'footer':
            return (
              <div key={idx} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                <p className="text-xs text-gray-500 italic">
                  {section.title || section.rawLines?.join(' ') || 'Ayurvritta Ayurveda Hospital'}
                </p>
              </div>
            );

          case 'validation':
            return (
              <div key={idx}>
                {(section.validationErrors || []).map((err, i) => (
                  <div key={`err-${i}`} className="bg-red-50 border border-red-200 rounded-xl p-3 mb-2">
                    <span className="text-red-600 text-xs font-bold">[BLOCKED]</span>
                    <span className="text-red-700 text-xs ml-2">{err.replace('[BLOCKED]', '').trim()}</span>
                  </div>
                ))}
                {(section.validationWarnings || []).map((warn, i) => (
                  <div key={`warn-${i}`} className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-2">
                    <span className="text-amber-600 text-xs font-bold">[Note]</span>
                    <span className="text-amber-700 text-xs ml-2">{warn.replace('[Note]', '').trim()}</span>
                  </div>
                ))}
              </div>
            );

          case 'unknown':
          default: {
            if (!section.rawLines || section.rawLines.length === 0) return null;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4">
                {section.title && (
                  <h3 className="font-serif font-bold text-gray-800 text-sm mb-2">{section.title}</h3>
                )}
                <div className="space-y-1">
                  {section.rawLines.filter(l => l.trim()).map((l, i) => (
                    <p key={i} className="text-sm text-gray-600 leading-relaxed">{l}</p>
                  ))}
                </div>
              </div>
            );
          }
        }
      })}
    </div>
  );
};

export default DietChartRenderer;