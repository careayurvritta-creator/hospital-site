import { DietChart, dietCharts as hardcodedCharts } from '../../data/dietCharts';
import { parseMarkdown, parsedToDietChart, ParsedDietChart } from './parser';

// Vite glob import for all markdown diet charts
const markdownModules = import.meta.glob<{ default: string }>(
  '../../knowledge/diet-charts/*.md',
  { eager: true, query: '?raw' }
);

// Category-to-image mapping for visually distinct cards
const CATEGORY_IMAGES: Record<string, string[]> = {
  'Digestive Health': [
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop',
  ],
  'Weight Management': [
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543362906-ac1b782b38f8?w=800&auto=format&fit=crop',
  ],
  'Pregnancy': [
    'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&auto=format&fit=crop',
  ],
  'Metabolic Health': [
    'https://images.unsplash.com/photo-1576001148957-4f4a4d3838b1?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1505576399279-0d309dfdbc76?w=800&auto=format&fit=crop',
  ],
  'Kidney Health': [
    'https://images.unsplash.com/photo-1543362906-ac1b782b38f8?w=800&auto=format&fit=crop',
  ],
  'Liver Health': [
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop',
  ],
  'Heart Health': [
    'https://images.unsplash.com/photo-1505576399279-0d309dfdbc76?w=800&auto=format&fit=crop',
  ],
  'Thyroid Health': [
    'https://images.unsplash.com/photo-1576001148957-4f4a4d3838b1?w=800&auto=format&fit=crop',
  ],
  'Skin Health': [
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&auto=format&fit=crop',
  ],
  'Bone & Joint Health': [
    'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=800&auto=format&fit=crop',
  ],
  'Respiratory Health': [
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop',
  ],
  'Reproductive Health': [
    'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&auto=format&fit=crop',
  ],
  'Blood Health': [
    'https://images.unsplash.com/photo-1505576399279-0d309dfdbc76?w=800&auto=format&fit=crop',
  ],
  'Cancer Support': [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop',
  ],
  'Child Health': [
    'https://images.unsplash.com/photo-1543362906-ac1b782b38f8?w=800&auto=format&fit=crop',
  ],
  'Seasonal Diet': [
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop',
  ],
  'Ayurvedic Constitution': [
    'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=800&auto=format&fit=crop',
  ],
  'Mental Health': [
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop',
  ],
  'Eye Health': [
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&auto=format&fit=crop',
  ],
  'GI Disorders': [
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop',
  ],
  'Allergy Care': [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop',
  ],
  'default': [
    'https://images.unsplash.com/photo-1576001148957-4f4a4d3838b1?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543362906-ac1b782b38f8?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop',
  ],
};

let _allCharts: DietChart[] | null = null;
let _categories: string[] | null = null;
let _batchedCharts: DietChart[] | null = null;
let _batchCancel: (() => void) | null = null;

function getImageForCategory(category: string, index: number): string {
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['default'];
  return images[index % images.length];
}

/**
 * Parse a single markdown module entry into a DietChart, or null on failure.
 */
function parseOneMarkdown(filePath: string, module: unknown, existingSlugs: Set<string>, imageIndex: number): DietChart | null {
  try {
    const content = typeof module === 'string' ? module : (module as any).default;
    if (!content || content.length < 100) return null;

    const filename = filePath.split('/').pop() || '';
    if (filename === 'README.md') return null;

    const parsed = parseMarkdown(content, filename);
    const chart = parsedToDietChart(parsed);
    chart.image = getImageForCategory(chart.category, imageIndex);

    if (existingSlugs.has(chart.slug)) return null;
    existingSlugs.add(chart.slug);
    return chart;
  } catch (e) {
    console.warn(`Failed to parse diet chart: ${filePath}`, e);
    return null;
  }
}

function loadAllDietCharts(): DietChart[] {
  if (_allCharts) return _allCharts;

  // 1) Start with hardcoded charts (instant, high quality)
  const hardcodedSlugs = new Set(hardcodedCharts.map(c => c.slug));
  const merged: DietChart[] = [...hardcodedCharts];

  // 2) Parse all markdown charts synchronously
  const entries = Object.entries(markdownModules);

  for (const [filePath, module] of entries) {
    const chart = parseOneMarkdown(filePath, module, hardcodedSlugs, merged.length);
    if (chart) merged.push(chart);
  }

  // Deduplicate by slug
  const seen = new Set<string>();
  _allCharts = merged.filter(chart => {
    if (seen.has(chart.slug)) return false;
    seen.add(chart.slug);
    return true;
  });

  return _allCharts;
}

/**
 * Load diet charts in batches, yielding to the browser between each batch.
 * Calls `onBatch` with all charts loaded so far after each batch completes.
 * Returns a cancel function.
 */
export function loadDietChartsBatched(
  onBatch: (charts: DietChart[]) => void,
  batchSize: number = 10
): () => void {
  // If already fully cached, return everything immediately
  if (_allCharts) {
    onBatch(_allCharts);
    return () => {};
  }

  let cancelled = false;
  const slugs = new Set(hardcodedCharts.map(c => c.slug));
  const merged: DietChart[] = [...hardcodedCharts];
  const entries = Object.entries(markdownModules);
  let idx = 0;

  // Yield first batch of hardcoded charts immediately
  onBatch([...merged]);

  function parseNextBatch() {
    if (cancelled || idx >= entries.length) {
      // All done — cache the full result for sync callers
      if (!cancelled) {
        _allCharts = merged;
        _batchedCharts = null;
        _batchCancel = null;
      }
      return;
    }

    const end = Math.min(idx + batchSize, entries.length);
    for (let i = idx; i < end; i++) {
      const [filePath, module] = entries[i];
      const chart = parseOneMarkdown(filePath, module, slugs, merged.length);
      if (chart) merged.push(chart);
    }
    idx = end;

    onBatch([...merged]);

    if (idx < entries.length) {
      // Yield to browser before next batch
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => parseNextBatch(), { timeout: 150 });
      } else {
        setTimeout(parseNextBatch, 0);
      }
    } else {
      _allCharts = merged;
      _batchedCharts = null;
      _batchCancel = null;
    }
  }

  // Start first batch after a short delay to let initial render paint
  const timer = setTimeout(parseNextBatch, 80);
  _batchedCharts = merged;
  _batchCancel = () => { cancelled = true; clearTimeout(timer); };

  return () => {
    cancelled = true;
    clearTimeout(timer);
    _batchCancel = null;
  };
}

// Instant access to hardcoded charts only (no parsing)
export const getHardcodedDietCharts = (): DietChart[] => hardcodedCharts;

// Get categories from a pre-loaded chart array
export const getDietChartCategoriesFromAll = (charts: DietChart[]): string[] =>
  Array.from(new Set(charts.map(c => c.category))).sort();

export const getAllParsedDietCharts = (): DietChart[] => loadAllDietCharts();
export const getDietChartsFromKnowledge = (): DietChart[] => loadAllDietCharts();

export const getDietChartsFromKnowledgeBySlug = (slug: string): DietChart | undefined =>
  loadAllDietCharts().find(chart => chart.slug === slug);

export const getParsedDietChartBySlug = (slug: string): DietChart | undefined =>
  loadAllDietCharts().find(chart => chart.slug === slug);

export const getDietChartCategories = (): string[] => {
  if (!_categories) {
    _categories = Array.from(new Set(loadAllDietCharts().map(c => c.category))).sort();
  }
  return _categories;
};

export const getDietChartCount = (): number => loadAllDietCharts().length;

export const searchDietCharts = (query: string): DietChart[] => {
  const q = query.toLowerCase();
  return loadAllDietCharts().filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q)
  );
};

export const getDietChartsByCategory = (category: string): DietChart[] =>
  loadAllDietCharts().filter(c => c.category === category);

export const getFeaturedDietCharts = (): DietChart[] => {
  const all = loadAllDietCharts();
  const seen = new Set<string>();
  return all.filter(c => {
    if (seen.has(c.category)) return false;
    seen.add(c.category);
    return true;
  }).slice(0, 8);
};
