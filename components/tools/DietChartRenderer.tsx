import React, { useMemo } from 'react';

interface DietChartRendererProps {
  aiResult: string;
}

// ─── Section type definitions ───
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

interface Section {
  type:
    | 'header-info'
    | 'intro'
    | 'core-principles'
    | 'meal-table'
    | 'pathya-apathya'
    | 'dinacharya'
    | 'remedies'
    | 'lifestyle'
    | 'footer'
    | 'validation'
    | 'unknown';
  title?: string;
  content?: string;
  mealRows?: MealRow[];
  pathyaItems?: CategoryItems;
  apathyaItems?: CategoryItems;
  dinacharya?: DinacharyaItem[];
  remedies?: Remedy[];
  lifestyle?: { [section: string]: string[] };
  validationWarnings?: { issue: string; severity: 'error' | 'warning' }[];
}

function parseMarkdownTable(line: string): { time: string; recommended: string[]; avoid: string[] } | null {
  const parts = line.split('|').map(p => p.trim()).filter(p => p);
  if (parts.length < 3) return null;
  return {
    time: parts[0],
    recommended: parts[1].split(',').map(s => s.trim()),
    avoid: parts[2].split(',').map(s => s.trim()),
  };
}

function parseAIResult(text: string): Section[] {
  const sections: Section[] = [];
  const lines = text.split('\n');
  let i = 0;
  let currentSection: Partial<Section> = {};

  const flush = () => {
    if (currentSection.type) {
      sections.push(currentSection as Section);
    }
    currentSection = {};
  };

  while (i < lines.length) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      i++;
      continue;
    }

    // H1 - main title (Condition intro)
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      flush();
      currentSection = { type: 'header-info', content: line.replace(/^#\s*/, '') };
      sections.push(currentSection as Section);
      currentSection = {};
      i++;
      continue;
    }

    // H2 - section headers
    if (line.startsWith('## ')) {
      const title = line.replace(/^##\s*/, '').trim();
      flush();

      if (title.toLowerCase().includes('core dietary') || title.toLowerCase().includes('principle')) {
        currentSection = { type: 'core-principles', title };
        // Collect bullet points for core principles
        const items: string[] = [];
        i++;
        while (i < lines.length) {
          const nextLine = lines[i].trim();
          if (nextLine.startsWith('## ') || nextLine.startsWith('# ') || (!nextLine && items.length > 0)) break;
          if (nextLine.startsWith('- ')) items.push(nextLine.replace(/^-\s*/, ''));
          else if (nextLine) items.push(nextLine);
          i++;
        }
        (currentSection as any).principles = items;
        sections.push(currentSection as Section);
        currentSection = {};
        continue;
      }

      if (title.toLowerCase().includes('meal') || title.toLowerCase().includes('schedule')) {
        currentSection = { type: 'meal-table', title };
        const mealRows: MealRow[] = [];
        i++;
        while (i < lines.length) {
          const nextLine = lines[i].trim();
          if (nextLine.startsWith('## ') || nextLine.startsWith('# ')) break;
          if (nextLine.includes('|') && (nextLine.includes('TIME') || nextLine.match(/\d:\d\d/i) || nextLine.match(/\d{1,2}:\d{2}\s*(AM|PM)/i))) {
            const row = parseMarkdownTable(nextLine);
            if (row) mealRows.push(row);
          }
          i++;
        }
        (currentSection as any).mealRows = mealRows;
        sections.push(currentSection as Section);
        currentSection = {};
        continue;
      }

      if (title.toLowerCase().includes('pathya') || title.toLowerCase().includes('apathya') || title.toLowerCase().includes('avoid') || title.toLowerCase().includes('recommend')) {
        const isPathya = title.toLowerCase().includes('pathya') || (title.toLowerCase().includes('recommend') && !title.toLowerCase().includes('avoid'));
        currentSection = { type: 'pathya-apathya', title };
        const items: CategoryItems = {};
        let currentCategory = '';
        i++;
        while (i < lines.length) {
          const nextLine = lines[i].trim();
          if (nextLine.startsWith('## ') || nextLine.startsWith('# ')) break;
          if (nextLine.startsWith('**') && nextLine.endsWith('**')) {
            currentCategory = nextLine.replace(/\*\*/g, '');
            if (!items[currentCategory]) items[currentCategory] = [];
          } else if (currentCategory && (nextLine.startsWith('- ') || nextLine.startsWith('• '))) {
            items[currentCategory].push(nextLine.replace(/^[-•]\s*/, ''));
          } else if (currentCategory && nextLine && !nextLine.startsWith('**')) {
            // Continuation of previous category
          }
          i++;
        }
        if (isPathya) {
          (currentSection as any).pathyaItems = items;
        } else {
          (currentSection as any).apathyaItems = items;
        }
        sections.push(currentSection as Section);
        currentSection = {};
        continue;
      }

      if (title.toLowerCase().includes('dinacharya') || title.toLowerCase().includes('daily routine') || title.toLowerCase().includes('routine')) {
        currentSection = { type: 'dinacharya', title };
        const items: DinacharyaItem[] = [];
        i++;
        while (i < lines.length) {
          const nextLine = lines[i].trim();
          if (nextLine.startsWith('## ') || nextLine.startsWith('# ')) break;
          const match = nextLine.match(/^(\d+)[.\)]\s*(.+?)\s*[-–]\s*(.+?)(?:\s*[-–]\s*(.+))?$/);
          if (match) {
            items.push({ time: match[2], activity: match[3], benefit: match[4] || '' });
          } else if (nextLine.match(/^\d/) && nextLine.includes('-')) {
            const parts = nextLine.substring(nextLine.indexOf(' ') + 1).split('-').map(s => s.trim());
            if (parts.length >= 2) {
              items.push({ time: parts[0], activity: parts[1], benefit: parts[2] || '' });
            }
          }
          i++;
        }
        (currentSection as any).dinacharya = items;
        sections.push(currentSection as Section);
        currentSection = {};
        continue;
      }

      if (title.toLowerCase().includes('remedy') || title.toLowerCase().includes('home')) {
        currentSection = { type: 'remedies', title };
        const remedies: Remedy[] = [];
        i++;
        while (i < lines.length) {
          const nextLine = lines[i].trim();
          if (nextLine.startsWith('## ') || nextLine.startsWith('# ')) break;
          const match = nextLine.match(/^\d+[.\)]\s*\*\*(.+?)\*\*[:\s]*(.+)/);
          if (match) {
            const prepMatch = nextLine.match(/Preparation:([^|]+)/i);
            const whenMatch = nextLine.match(/When:([^|]+)/i);
            const benefitMatch = nextLine.match(/Benefit:([^|]+)/i);
            remedies.push({
              name: match[1],
              preparation: prepMatch ? prepMatch[1].trim() : '',
              when: whenMatch ? whenMatch[1].trim() : '',
              benefit: benefitMatch ? benefitMatch[1].trim() : match[2],
            });
          }
          i++;
        }
        (currentSection as any).remedies = remedies;
        sections.push(currentSection as Section);
        currentSection = {};
        continue;
      }

      if (title.toLowerCase().includes('lifestyle') || title.toLowerCase().includes('principle')) {
        currentSection = { type: 'lifestyle', title };
        const lifestyle: { [key: string]: string[] } = {};
        let currentCategory = '';
        i++;
        while (i < lines.length) {
          const nextLine = lines[i].trim();
          if (nextLine.startsWith('## ') || nextLine.startsWith('# ')) break;
          if (nextLine.startsWith('**') && nextLine.endsWith('**')) {
            currentCategory = nextLine.replace(/\*\*/g, '');
            if (!lifestyle[currentCategory]) lifestyle[currentCategory] = [];
          } else if (currentCategory && (nextLine.startsWith('- ') || nextLine.startsWith('• '))) {
            lifestyle[currentCategory].push(nextLine.replace(/^[-•]\s*/, ''));
          }
          i++;
        }
        (currentSection as any).lifestyle = lifestyle;
        sections.push(currentSection as Section);
        currentSection = {};
        continue;
      }

      if (title.toLowerCase().includes('validation') || title.toLowerCase().includes('note on healing')) {
        currentSection = { type: 'unknown', title, content: '' };
        i++;
        continue;
      }

      currentSection = { type: 'unknown', title };
      i++;
      continue;
    }

    // Plain text content for unknown sections
    if (currentSection.type === 'unknown' && line && !line.startsWith('- ')) {
      (currentSection as any).content = ((currentSection as any).content || '') + line + ' ';
    }

    // Footer
    if (line.includes('Dr. Jinendradutt') || line.includes('Ayurvritta')) {
      currentSection = { type: 'footer', content: line };
      sections.push(currentSection as Section);
      currentSection = {};
    }

    // Validation warnings
    if (line.includes('[BLOCKED]') || line.includes('[Note]') || line.includes('CRITICAL')) {
      const existing = (currentSection as any).validationWarnings || [];
      existing.push({
        issue: line,
        severity: line.includes('[BLOCKED]') ? 'error' : 'warning',
      });
      (currentSection as any).validationWarnings = existing;
    }

    i++;
  }

  flush();
  return sections;
}

// ─── Component ───
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
          case 'header-info':
            return (
              <div key={idx} className="bg-gradient-to-r from-ayur-green to-ayur-green-dark rounded-2xl p-4 text-white shadow-glow">
                <p className="text-sm leading-relaxed">{section.content}</p>
              </div>
            );

          case 'core-principles': {
            const principles = (section as any).principles || [];
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100">
                  <h3 className="font-serif font-bold text-emerald-800 text-base">Core Dietary Principles</h3>
                </div>
                <div className="p-4 space-y-2">
                  {principles.map((p: string, i: number) => {
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
            const mealRows = (section as any).mealRows || [];
            if (mealRows.length === 0) return null;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="bg-amber-50 px-4 py-3 border-b border-amber-100">
                  <h3 className="font-serif font-bold text-amber-800 text-base">Meal-by-Meal Guide (Daily Schedule)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2 font-bold text-gray-600 text-xs uppercase tracking-wider w-36">Time</th>
                        <th className="text-left px-4 py-2 font-bold text-green-700 text-xs uppercase tracking-wider">Recommended</th>
                        <th className="text-left px-4 py-2 font-bold text-red-700 text-xs uppercase tracking-wider">Avoid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mealRows.map((row: MealRow, i: number) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 font-medium text-gray-700 align-top">
                            <span className="text-xs text-gray-500">{row.time}</span>
                          </td>
                          <td className="px-4 py-3 align-top">
                            {row.recommended.map((item, j) => (
                              <div key={j} className="flex gap-2 items-start mb-1 last:mb-0">
                                <span className="text-green-500 mt-0.5">●</span>
                                <span className="text-gray-700 text-xs leading-relaxed">{item}</span>
                              </div>
                            ))}
                          </td>
                          <td className="px-4 py-3 align-top">
                            {row.avoid.map((item, j) => (
                              <div key={j} className="flex gap-2 items-start mb-1 last:mb-0">
                                <span className="text-red-400 mt-0.5">○</span>
                                <span className="text-gray-500 text-xs leading-relaxed">{item}</span>
                              </div>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          case 'pathya-apathya': {
            const pathyaItems = (section as any).pathyaItems || {};
            const apathyaItems = (section as any).apathyaItems || {};
            const hasPathya = Object.keys(pathyaItems).length > 0;
            const hasApathya = Object.keys(apathyaItems).length > 0;

            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                  <h3 className="font-serif font-bold text-blue-800 text-base">Pathya & Apathya Food Lists</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  {/* Pathya */}
                  {hasPathya && (
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                      <h4 className="font-serif font-bold text-emerald-800 text-sm mb-3 flex items-center gap-2">
                        <span className="text-lg">✅</span> Pathya - Eat Freely
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(pathyaItems).map(([category, items]) => (
                          <div key={category}>
                            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">{category}</div>
                            <div className="flex flex-wrap gap-1">
                              {(items as string[]).map((item, j) => (
                                <span key={j} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Apathya */}
                  {hasApathya && (
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                      <h4 className="font-serif font-bold text-red-800 text-sm mb-3 flex items-center gap-2">
                        <span className="text-lg">🚫</span> Apathya - Strictly Avoid
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(apathyaItems).map(([category, items]) => (
                          <div key={category}>
                            <div className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">{category}</div>
                            <div className="flex flex-wrap gap-1">
                              {(items as string[]).map((item, j) => (
                                <span key={j} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          case 'dinacharya': {
            const items = (section as any).dinacharya || [];
            if (items.length === 0) return null;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
                  <h3 className="font-serif font-bold text-indigo-800 text-base">Daily Routine (Dinacharya)</h3>
                </div>
                <div className="p-4 space-y-3">
                  {items.map((item: DinacharyaItem, i: number) => (
                    <div key={i} className="flex gap-4 items-start p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-indigo-600 mb-0.5">{item.time}</div>
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
            const remedies = (section as any).remedies || [];
            if (remedies.length === 0) return null;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="bg-amber-50 px-4 py-3 border-b border-amber-100">
                  <h3 className="font-serif font-bold text-amber-800 text-base">Classical Home Remedies</h3>
                </div>
                <div className="p-4 space-y-3">
                  {remedies.map((r: Remedy, i: number) => (
                    <div key={i} className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-serif font-bold text-amber-900 text-sm mb-2">{r.name}</div>
                          <div className="grid grid-cols-1 gap-1 text-xs">
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
            const lifestyle = (section as any).lifestyle || {};
            const categories = Object.keys(lifestyle);
            if (categories.length === 0) return null;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="bg-teal-50 px-4 py-3 border-b border-teal-100">
                  <h3 className="font-serif font-bold text-teal-800 text-base">Lifestyle Principles</h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <div key={cat} className="bg-teal-50 rounded-xl p-3 border border-teal-100">
                      <div className="font-serif font-bold text-teal-800 text-xs mb-2 uppercase tracking-wide">{cat}</div>
                      <div className="space-y-1">
                        {(lifestyle[cat] as string[]).map((item, j) => (
                          <div key={j} className="flex gap-2 items-start text-xs">
                            <span className="text-teal-500 mt-0.5">•</span>
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
              <div key={idx} className="bg-gray-100 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-600 italic">{section.content}</p>
              </div>
            );

          case 'unknown':
            if (section.title) {
              return (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4">
                  <h3 className="font-serif font-bold text-gray-800 text-sm mb-2">{section.title}</h3>
                  {section.content && (
                    <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
                  )}
                </div>
              );
            }
            return null;

          default:
            return null;
        }
      })}
    </div>
  );
};

export default DietChartRenderer;