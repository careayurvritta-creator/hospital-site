/**
 * Diet Chart Data Generator Script
 * 
 * This script helps generate structured diet chart data from markdown files.
 * Run with: node scripts/generate-diet-chart-data.js
 */

const fs = require('fs');
const path = require('path');

const dietChartsDir = path.join(__dirname, '..', 'knowledge', 'diet-charts');
const outputDir = path.join(__dirname, '..', 'src', 'data');

// Read all markdown files
const markdownFiles = fs.readdirSync(dietChartsDir).filter(file => file.endsWith('.md'));

console.log(`Found ${markdownFiles.length} diet chart files`);

const dietCharts = [];

markdownFiles.forEach(file => {
  const content = fs.readFileSync(path.join(dietChartsDir, file), 'utf-8');
  const slug = file.replace('.md', '');
  
  // Extract title from first line or filename
  const titleMatch = content.match(/^#\s+(.*)$/m);
  const title = titleMatch ? titleMatch[1] : slugToTitle(slug);
  
  // Extract category (you can customize this based on your content)
  const category = extractCategory(content);
  
  // Extract description
  const description = extractDescription(content);
  
  dietCharts.push({
    id: generateId(),
    slug: slug,
    title: title,
    category: category,
    description: description,
    image: '/images/diet-charts/' + slug + '.jpg',
    foodsToConsume: {
      'Grains': ['Whole grains', 'Brown rice'],
      'Vegetables': ['Fresh vegetables', 'Leafy greens'],
      'Fruits': ['Seasonal fruits']
    },
    foodsToAvoid: {
      'Processed Foods': ['Packaged foods', 'Junk food'],
      'Beverages': ['Alcohol', 'Sugary drinks']
    },
    dietSchedule: {
      '7:00 AM': 'Warm water with lemon',
      '8:00 AM': 'Breakfast - Fruits and nuts',
      '12:00 PM': 'Lunch - Balanced meal',
      '6:00 PM': 'Dinner - Light meal'
    },
    lifestyleTips: [
      'Drink plenty of water',
      'Exercise regularly',
      'Get adequate sleep'
    ],
    foodGroups: [
      { name: 'Grains', percentage: 30, color: '#0d8770' },
      { name: 'Vegetables', percentage: 35, percentage: 35, color: '#10b981' },
      { name: 'Fruits', percentage: 20, color: '#f59e0b' },
      { name: 'Protein', percentage: 15, color: '#3b82f6' }
    ]
  });
});

// Generate TypeScript file
const tsContent = `
// Auto-generated diet chart data
// Generated on: ${new Date().toISOString()}

export interface FoodCategory {
  [category: string]: string[];
}

export interface DietSchedule {
  [time: string]: string;
}

export interface DietChart {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  foodsToConsume: FoodCategory;
  foodsToAvoid: FoodCategory;
  dietSchedule: DietSchedule;
  lifestyleTips: string[];
  foodGroups?: {
    name: string;
    percentage: number;
    color: string;
  }[];
}

export const dietCharts: DietChart[] = ${JSON.stringify(dietCharts, null, 2)};

export const getAllDietCharts = () => dietCharts;

export const getDietChartBySlug = (slug: string): DietChart | undefined => {
  return dietCharts.find(chart => chart.slug === slug);
};

export const getDietChartsByCategory = (category: string): DietChart[] => {
  return dietCharts.filter(chart => chart.category === category);
};

export const getAllCategories = (): string[] => {
  const categories = dietCharts.map(chart => chart.category);
  return Array.from(new Set(categories));
};
`;

fs.writeFileSync(path.join(outputDir, 'dietCharts-generated.ts'), tsContent);
console.log('Generated dietCharts-generated.ts with', dietCharts.length, 'charts');

// Helper functions
function slugToTitle(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function extractCategory(content) {
  // Simple extraction - you can enhance this
  if (content.toLowerCase().includes('digestive')) return 'Digestive Health';
  if (content.toLowerCase().includes('weight') || content.toLowerCase().includes('obesity')) return 'Weight Management';
  if (content.toLowerCase().includes('pregnancy') || content.toLowerCase().includes('pregnant')) return 'Pregnancy';
  if (content.toLowerCase().includes('diabetes') || content.toLowerCase().includes('sugar')) return 'Metabolic Health';
  if (content.toLowerCase().includes('kidney')) return 'Kidney Health';
  return 'General Health';
}

function extractDescription(content) {
  // Extract first paragraph as description
  const match = content.match(/^#+\s+(.*?)(?:\n|$)/s);
  return match ? match[1].trim().substring(0, 200) : 'Complete diet plan for better health';
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}
