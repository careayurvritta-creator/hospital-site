import { DietChart } from '../../data/dietCharts';
import { parseMarkdown, parsedToDietChart, ParsedDietChart } from './parser';

const rawModules = import.meta.glob('./knowledge/diet-charts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const moduleCount = Object.keys(rawModules).length;
if (moduleCount === 0) {
  console.error('[DietCharts] CRITICAL: No markdown files found via glob! Check path.');
} else {
  console.log('[DietCharts] Glob found', moduleCount, 'files, first key:', Object.keys(rawModules)[0]);
}

const rawModulesList = Object.entries(rawModules).map(([path, content]) => {
  const filename = path.split('/').pop() || 'unknown.md';
  try {
    const parsed = parseMarkdown(content as string, filename);
    return parsed;
  } catch (e) {
    console.error('[DietCharts] Parse error for', filename, e);
    return null;
  }
}).filter((c): c is ParsedDietChart => c !== null).sort((a, b) => a.title.localeCompare(b.title));

console.log('[DietCharts] Parsed', rawModulesList.length, 'charts');
console.log('[DietCharts] Sample:', rawModulesList[0]?.title, '| cats:', rawModulesList.slice(0,3).map(c=>c.category));

export const parsedDietCharts: ParsedDietChart[] = rawModulesList;
export const dietChartsFromKnowledge: DietChart[] = rawModulesList.map(parsedToDietChart);

export const getAllParsedDietCharts = () => dietChartsFromKnowledge;

export const getParsedDietChartBySlug = (slug: string): ParsedDietChart | undefined => {
  return parsedDietCharts.find(chart => chart.slug === slug);
};

export const getDietChartsFromKnowledgeBySlug = (slug: string): DietChart | undefined => {
  return dietChartsFromKnowledge.find(chart => chart.slug === slug);
};

export const getDietChartCategories = (): string[] => {
  const cats = dietChartsFromKnowledge.map(c => c.category);
  return Array.from(new Set(cats)).sort();
};

export const searchDietCharts = (query: string): DietChart[] => {
  const q = query.toLowerCase();
  return dietChartsFromKnowledge.filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q)
  );
};