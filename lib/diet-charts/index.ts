import { DietChart, dietCharts } from '../../data/dietCharts';

export const getAllParsedDietCharts = () => dietCharts;

export const getDietChartsFromKnowledgeBySlug = (slug: string): DietChart | undefined =>
  dietCharts.find(chart => chart.slug === slug);

export const getParsedDietChartBySlug = () => undefined;

export const getDietChartCategories = (): string[] =>
  Array.from(new Set(dietCharts.map(c => c.category))).sort();

export const searchDietCharts = (query: string): DietChart[] => {
  const q = query.toLowerCase();
  return dietCharts.filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q)
  );
};