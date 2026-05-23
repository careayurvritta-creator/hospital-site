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

export const dietCharts: DietChart[] = [
  {
    id: '1',
    slug: 'diet-chart-for-acidity-gastroesophageal-reflux-disease',
    title: 'Acidity / GERD Diet Chart',
    category: 'Digestive Health',
    description: 'A comprehensive Ayurvedic diet plan for managing acidity and Gastroesophageal Reflux Disease (GERD). This diet focuses on cooling, alkaline foods that reduce stomach acid production and promote digestive healing.',
    image: 'https://images.unsplash.com/photo-1576001148957-4f4a4d3838b1?w=800&auto=format&fit=crop',
    foodsToConsume: {
      'Cereals & Grains': ['Old rice', 'Wheat', 'Barley (Yava)', 'Oats'],
      'Pulses': ['Green gram (Mudga)', 'Red gram (Tuvaram)', 'Bengal gram (Cana)'],
      'Vegetables': ['Bitter gourd', 'Snake gourd', 'Bottle gourd', 'Cucumber', 'Carrot', 'Beetroot'],
      'Fruits': ['Sweet grapes', 'Pomegranate', 'Coconut water', 'Ripe banana', 'Apple'],
      'Dairy': ['Cow ghee', 'Cow milk (warm)', 'Fresh butter'],
      'Spices': ['Cumin', 'Coriander', 'Fennel', 'Cardamom', 'Turmeric']
    },
    foodsToAvoid: {
      'Foods to Avoid': ['Spicy foods', 'Deep fried items', 'Citrus fruits', 'Tomatoes', 'Onion', 'Garlic'],
      'Beverages to Avoid': ['Coffee', 'Tea', 'Alcohol', 'Carbonated drinks', 'Packaged juices'],
      'Habits to Avoid': ['Overeating', 'Late night meals', 'Lying down after meals', 'Skipping meals']
    },
    dietSchedule: {
      '6:00 AM': '1 glass warm water with honey',
      '7:00 AM': 'Coconut water or herbal tea',
      '8:00 AM': 'Breakfast - Oatmeal with apple',
      '11:00 AM': 'Fresh fruit (sweet grapes/pomegranate)',
      '1:00 PM': 'Lunch - Rice, moong dal, gourd sabzi',
      '4:00 PM': 'Herbal tea with roasted fennel',
      '7:00 PM': 'Dinner - Wheat roti, vegetable curry',
      '9:00 PM': 'Warm cow milk with turmeric'
    },
    lifestyleTips: [
      'Eat meals at regular intervals',
      'Avoid lying down immediately after eating',
      'Practice Vajrasana after meals',
      'Drink coconut water daily',
      'Sleep with head elevated',
      'Practice stress management techniques',
      'Avoid tight clothing around waist'
    ],
    foodGroups: [
      { name: 'Grains & Cereals', percentage: 30, color: '#0d8770' },
      { name: 'Vegetables', percentage: 25, color: '#c9a227' },
      { name: 'Fruits', percentage: 20, color: '#f59e0b' },
      { name: 'Pulses', percentage: 15, color: '#10b981' },
      { name: 'Dairy', percentage: 10, color: '#3b82f6' }
    ]
  },
  {
    id: '2',
    slug: 'diet-plan-for-patients-of-obesity',
    title: 'Obesity Weight Loss Diet',
    category: 'Weight Management',
    description: 'An effective Ayurvedic weight management plan that balances Kapha and Meda dhatu. This diet emphasizes light, warming foods and proper meal timing to boost metabolism naturally.',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop',
    foodsToConsume: {
      'Cereals': ['Barley (Yava)', 'Millets', 'Quinoa', 'Old rice (limited)'],
      'Pulses': ['Green gram', 'Chickpeas', 'Lentils'],
      'Vegetables': ['Leafy greens', 'Bitter gourd', 'Drumstick', 'Cabbage', 'Cauliflower'],
      'Fruits': ['Apple', 'Papaya', 'Berries', 'Pear'],
      'Spices': ['Black pepper', 'Ginger', 'Turmeric', 'Cinnamon', 'Triphala']
    },
    foodsToAvoid: {
      'Foods to Limit': ['Heavy grains', 'Dairy products', 'Sweet fruits', 'Oily foods'],
      'Habits to Avoid': ['Daytime sleep', 'Cold beverages', 'Overeating', 'Sedentary lifestyle']
    },
    dietSchedule: {
      '6:00 AM': 'Warm water with honey & lemon',
      '7:00 AM': 'Triphala powder with warm water',
      '8:00 AM': 'Breakfast - Barley porridge',
      '11:00 AM': 'Green tea or herbal tea',
      '1:00 PM': 'Lunch - Millets, dal, sabzi',
      '4:00 PM': 'Fresh fruit salad',
      '7:00 PM': 'Dinner - Light vegetable soup',
      '8:30 PM': 'Warm water with ginger'
    },
    lifestyleTips: [
      'Practice Surya Namaskar daily',
      'Avoid daytime sleeping',
      'Eat only when hungry',
      'Take dinner before sunset',
      'Practice Pranayama regularly',
      'Maintain regular meal times',
      'Stay hydrated with warm water'
    ],
    foodGroups: [
      { name: 'Millets & Grains', percentage: 25, color: '#0d8770' },
      { name: 'Vegetables', percentage: 35, color: '#10b981' },
      { name: 'Pulses', percentage: 20, color: '#f59e0b' },
      { name: 'Fruits', percentage: 15, color: '#ef4444' },
      { name: 'Spices', percentage: 5, color: '#c9a227' }
    ]
  },
  {
    id: '3',
    slug: 'diet-plan-for-pregnant-women',
    title: 'Pregnancy Diet Plan',
    category: 'Pregnancy',
    description: 'Nourishing Ayurvedic diet for expecting mothers. This diet supports both maternal health and fetal development with nutrient-rich, easily digestible foods.',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&auto=format&fit=crop',
    foodsToConsume: {
      'Cereals': ['Rice', 'Wheat', 'Ragi', 'Oats'],
      'Pulses': ['Moong dal', 'Masoor dal', 'Chana dal'],
      'Vegetables': ['All seasonal vegetables', 'Leafy greens', 'Carrots', 'Beetroot'],
      'Fruits': ['Banana', 'Pomegranate', 'Dates', 'Figs', 'Mango'],
      'Dairy': ['Milk', 'Ghee', 'Butter', 'Paneer', 'Yogurt'],
      'Nuts': ['Almonds', 'Walnuts', 'Cashews', 'Pistachios']
    },
    foodsToAvoid: {
      'Foods to Avoid': ['Papaya (raw)', 'Pineapple', 'Eggplant', 'Bitter gourd'],
      'Beverages': ['Caffeine', 'Alcohol', 'Packaged juices'],
      'Other': ['Processed foods', 'Raw eggs', 'Unpasteurized dairy']
    },
    dietSchedule: {
      '7:00 AM': 'Soaked almonds & dates',
      '8:00 AM': 'Breakfast - Oats with milk & fruits',
      '10:00 AM': 'Fresh fruit juice',
      '11:00 AM': 'Coconut water',
      '1:00 PM': 'Lunch - Rice, dal, vegetables, curd',
      '4:00 PM': 'Dry fruits with milk',
      '7:00 PM': 'Dinner - Roti, sabzi, dal',
      '9:00 PM': 'Warm milk with turmeric'
    },
    lifestyleTips: [
      'Eat small frequent meals',
      'Stay well hydrated',
      'Practice prenatal yoga',
      'Get adequate rest',
      'Avoid stress',
      'Take regular walks',
      'Practice meditation'
    ],
    foodGroups: [
      { name: 'Grains', percentage: 25, color: '#0d8770' },
      { name: 'Vegetables', percentage: 25, color: '#10b981' },
      { name: 'Fruits', percentage: 20, color: '#f59e0b' },
      { name: 'Dairy', percentage: 15, color: '#3b82f6' },
      { name: 'Nuts & Pulses', percentage: 15, color: '#c9a227' }
    ]
  },
  {
    id: '4',
    slug: 'diet-chart-for-diabetes',
    title: 'Diabetes Management Diet',
    category: 'Metabolic Health',
    description: 'Ayurvedic diet plan for managing blood sugar levels naturally. Focuses on low glycemic index foods, bitter tastes, and proper meal timing.',
    image: 'https://images.unsplash.com/photo-1576001148957-4f4a4d3838b1?w=800&auto=format&fit=crop',
    foodsToConsume: {
      'Cereals': ['Barley', 'Millets', 'Whole wheat', 'Oats'],
      'Pulses': ['Green gram', 'Bengal gram', 'Black gram'],
      'Vegetables': ['Bitter gourd', 'Fenugreek', 'Spinach', 'Okra', 'Cabbage'],
      'Fruits': ['Guava', 'Apple', 'Pomegranate', 'Berries'],
      'Spices': ['Turmeric', 'Cinnamon', 'Fenugreek seeds', 'Neem']
    },
    foodsToAvoid: {
      'Foods to Avoid': ['Sugar', 'Jaggery', 'White rice', 'Maida products'],
      'Fruits to Limit': ['Banana', 'Mango', 'Chikoo', 'Grapes'],
      'Habits': ['Irregular meals', 'Overeating', 'Sedentary lifestyle']
    },
    dietSchedule: {
      '6:00 AM': 'Fenugreek water',
      '7:00 AM': 'Neem juice or Tulsi tea',
      '8:00 AM': 'Breakfast - Barley porridge',
      '11:00 AM': 'Green tea',
      '1:00 PM': 'Lunch - Millets, dal, bitter gourd sabzi',
      '4:00 PM': 'Sprouts salad',
      '7:00 PM': 'Dinner - Wheat roti, vegetable curry',
      '9:00 PM': 'Cinnamon tea'
    },
    lifestyleTips: [
      'Exercise daily for 30 minutes',
      'Practice yoga asanas',
      'Maintain healthy weight',
      'Monitor blood sugar regularly',
      'Avoid stress',
      'Get quality sleep',
      'Stay hydrated'
    ],
    foodGroups: [
      { name: 'Whole Grains', percentage: 30, color: '#0d8770' },
      { name: 'Vegetables', percentage: 30, color: '#10b981' },
      { name: 'Pulses', percentage: 20, color: '#f59e0b' },
      { name: 'Fruits', percentage: 10, color: '#ef4444' },
      { name: 'Spices', percentage: 10, color: '#c9a227' }
    ]
  },
  {
    id: '5',
    slug: 'diet-plan-for-kidney-stones',
    title: 'Kidney Stone Prevention Diet',
    category: 'Kidney Health',
    description: 'Preventive diet for kidney stone formation. Emphasizes hydration, low oxalate foods, and proper mineral balance.',
    image: 'https://images.unsplash.com/photo-1543362906-ac1b782b38f8?w=800&auto=format&fit=crop',
    foodsToConsume: {
      'Fluids': ['Water (3-4L)', 'Coconut water', 'Barley water', 'Lemon water'],
      'Cereals': ['Rice', 'Wheat', 'Barley'],
      'Vegetables': ['Cucumber', 'Bottle gourd', 'Carrot', 'Cabbage'],
      'Fruits': ['Watermelon', 'Papaya', 'Apple', 'Grapes']
    },
    foodsToAvoid: {
      'High Oxalate': ['Spinach', 'Beetroot', 'Tomato', 'Nuts'],
      'Other': ['Excess salt', 'Animal protein', 'Vitamin C supplements']
    },
    dietSchedule: {
      '6:00 AM': '2 glasses warm water',
      '7:00 AM': 'Coconut water',
      '8:00 AM': 'Breakfast - Rice porridge',
      '10:00 AM': 'Lemon water',
      '1:00 PM': 'Lunch - Rice, dal, gourd sabzi',
      '4:00 AM': 'Barley water',
      '7:00 PM': 'Dinner - Wheat roti, vegetables',
      '9:00 PM': 'Warm water'
    },
    lifestyleTips: [
      'Drink 3-4 liters water daily',
      'Reduce salt intake',
      'Limit animal protein',
      'Avoid vitamin C supplements',
      'Exercise regularly',
      'Maintain healthy weight'
    ],
    foodGroups: [
      { name: 'Fluids', percentage: 40, color: '#3b82f6' },
      { name: 'Grains', percentage: 30, color: '#0d8770' },
      { name: 'Vegetables', percentage: 20, color: '#10b981' },
      { name: 'Fruits', percentage: 10, color: '#f59e0b' }
    ]
  }
];

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
