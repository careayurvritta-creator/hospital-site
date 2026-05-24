import { DietChart, dietCharts } from '../../data/dietCharts';
import { parseMarkdown, parsedToDietChart, ParsedDietChart } from './parser';

const rawModules = import.meta.glob('./knowledge/diet-charts/*.md', { eager: true }) as Record<string, string>;

const rawModulesList = Object.entries(rawModules)
  .map(([path, content]) => {
    const filename = path.split('/').pop() || 'unknown.md';
    try {
      return parseMarkdown(content, filename);
    } catch (e) {
      console.error('[DietCharts] Parse error:', filename, e);
      return null;
    }
  })
  .filter((c): c is ParsedDietChart => c !== null)
  .sort((a, b) => a.title.localeCompare(b.title));

export const parsedDietCharts: ParsedDietChart[] = rawModulesList;
export const dietChartsFromKnowledge: DietChart[] = rawModulesList.map(parsedToDietChart);

export const getAllParsedDietCharts = () =>
  dietChartsFromKnowledge.length > 0 ? dietChartsFromKnowledge : dietCharts;

export const getDietChartsFromKnowledgeBySlug = (slug: string): DietChart | undefined =>
  dietChartsFromKnowledge.find(chart => chart.slug === slug) ||
  dietCharts.find(chart => chart.slug === slug);

export const getParsedDietChartBySlug = (slug: string) =>
  parsedDietCharts.find(chart => chart.slug === slug);

export const getDietChartCategories = (): string[] => {
  const charts = getAllParsedDietCharts();
  return Array.from(new Set(charts.map(c => c.category))).sort();
};

export const searchDietCharts = (query: string): DietChart[] => {
  const q = query.toLowerCase();
  return getAllParsedDietCharts().filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q)
  );
};