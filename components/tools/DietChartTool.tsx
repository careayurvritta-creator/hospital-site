import React, { useState, useEffect } from 'react';

interface DietInputs {
  prakriti: string;
  healthGoal: string;
  season: string;
  dietaryPreference: string;
  allergies: string[];
  ageGroup: string;
  activityLevel: string;
  digestiveStrength: string;
}

const dietDatabase: Record<string, Record<string, {meal: string; food: string; reasoning: string; time: string}[]>> = {
  Vata: {
    breakfast: [
      { meal: 'Warm Oatmeal', food: 'Cooked oats with ghee, cinnamon, cardamom, dates, and warm milk', reasoning: 'Per EasyAyurveda: Warm, moist, grounding breakfast pacifies Vata. Oats are Guru (heavy) and Snigdha (oily).', time: '7:00 - 8:00 AM' },
      { meal: 'Rice Kheer', food: 'Rice cooked in milk with cardamom, saffron, and jaggery', reasoning: 'PlanetAyurveda: Sweet, warm, nourishing. Milk and rice balance Vata. Saffron enhances Ojas.', time: '7:00 - 8:00 AM' },
      { meal: 'Stewed Apples', food: 'Apples stewed with ghee, cinnamon, and raisins + warm almond milk', reasoning: 'EasyAyurveda: Cooked fruits are easier to digest than raw. Ghee provides Snigdha quality for Vata.', time: '7:00 - 8:00 AM' }
    ],
    midMorning: [
      { meal: 'Warm Milk', food: 'Warm milk with a pinch of nutmeg and cardamom', reasoning: 'PlanetAyurveda: Warm milk is Vata-pacifying. Nutmeg calms the nervous system.', time: '10:00 - 10:30 AM' },
      { meal: 'Soaked Almonds', food: '5-6 soaked almonds (peeled) with 1 tsp ghee', reasoning: 'EasyAyurveda: Soaked almonds are easier to digest. Ghee adds Snigdha quality.', time: '10:00 - 10:30 AM' }
    ],
    lunch: [
      { meal: 'Khichdi', food: 'Rice + Moong Dal cooked with cumin, ginger, ghee, and seasonal vegetables', reasoning: 'PlanetAyurveda: Khichdi is the most balanced Ayurvedic meal. Tridoshic, easy to digest, nourishing.', time: '12:30 - 1:30 PM' },
      { meal: 'Rice + Dal + Sabzi', food: 'Basmati rice, Masoor Dal, cooked root vegetables (carrot, sweet potato) with ghee', reasoning: 'EasyAyurveda: Root vegetables are grounding for Vata. Ghee is essential for Vata digestion.', time: '12:30 - 1:30 PM' },
      { meal: 'Wheat Roti + Paneer', food: 'Whole wheat roti, paneer curry with mild spices, cooked spinach', reasoning: 'PlanetAyurveda: Wheat is Guru (heavy) and balances Vata. Paneer provides building nutrition.', time: '12:30 - 1:30 PM' }
    ],
    snack: [
      { meal: 'Date & Nut Mix', food: '2 dates + 5 almonds + 2 walnuts, soaked overnight', reasoning: 'EasyAyurveda: Dates are sweet and nourishing. Nuts provide healthy fats for Vata.', time: '4:00 - 4:30 PM' },
      { meal: 'Warm Soup', food: 'Vegetable soup with ginger, cumin, and a dash of ghee', reasoning: 'PlanetAyurveda: Warm soup is grounding and easy to digest. Ginger kindles Agni.', time: '4:00 - 4:30 PM' }
    ],
    dinner: [
      { meal: 'Light Khichdi', food: 'Moong Dal Khichdi with ghee, cumin, and cooked vegetables', reasoning: 'EasyAyurveda: Light dinner is essential. Khichdi is easy to digest before sleep.', time: '7:00 - 7:30 PM' },
      { meal: 'Vegetable Soup + Roti', food: 'Warm vegetable soup with 1-2 wheat rotis and ghee', reasoning: 'PlanetAyurveda: Warm, cooked, and light. Avoid heavy proteins at dinner for Vata.', time: '7:00 - 7:30 PM' }
    ],
    bedtime: [
      { meal: 'Golden Milk', food: 'Warm milk with turmeric, cardamom, and a pinch of saffron', reasoning: 'EasyAyurveda: Golden milk promotes sleep, reduces Vata, and builds Ojas overnight.', time: '9:30 - 10:00 PM' }
    ]
  },
  Pitta: {
    breakfast: [
      { meal: 'Fruit Bowl', food: 'Sweet fruits (mango, melon, grapes, pears) with coconut flakes', reasoning: 'EasyAyurveda: Sweet, cooling fruits pacify Pitta. Avoid sour fruits like citrus on empty stomach.', time: '7:00 - 8:00 AM' },
      { meal: 'Coconut Porridge', food: 'Rice porridge with coconut milk, cardamom, and jaggery', reasoning: 'PlanetAyurveda: Coconut is Sheetala (cooling) and Pitta-pacifying. Rice is sweet and cooling.', time: '7:00 - 8:00 AM' },
      { meal: 'Cooling Smoothie', food: 'Banana, dates, fennel seeds, and cold milk blended', reasoning: 'EasyAyurveda: Banana is sweet and cooling. Fennel aids digestion without heating.', time: '7:00 - 8:00 AM' }
    ],
    midMorning: [
      { meal: 'Coconut Water', food: 'Fresh coconut water with a pinch of rock salt', reasoning: 'PlanetAyurveda: Coconut water is the best Pitta pacifier. Cooling and hydrating.', time: '10:00 - 10:30 AM' },
      { meal: 'Fennel Tea', food: 'Fennel seed tea (Saunf) with a little jaggery', reasoning: 'EasyAyurveda: Fennel is cooling and aids digestion. Reduces Pitta-related acidity.', time: '10:00 - 10:30 AM' }
    ],
    lunch: [
      { meal: 'Rice + Moong Dal', food: 'Basmati rice, Moong Dal, cucumber raita, ghee, mild curry', reasoning: 'PlanetAyurveda: Basmati rice is cooling. Moong Dal is tridoshic. Cucumber raita cools Pitta.', time: '12:30 - 1:30 PM' },
      { meal: 'Vegetable Pulao', food: 'Rice with cooling vegetables (zucchini, green beans, cauliflower), ghee', reasoning: 'EasyAyurveda: Cooling vegetables with rice provide balanced nutrition for Pitta.', time: '12:30 - 1:30 PM' },
      { meal: 'Rice + Fish Curry', food: 'Basmati rice, mild fish curry with coconut, coriander, and fennel', reasoning: 'PlanetAyurveda: Fish in coconut-based curry is cooling. Avoid spicy fish preparations.', time: '12:30 - 1:30 PM' }
    ],
    snack: [
      { meal: 'Cucumber Sticks', food: 'Fresh cucumber with a pinch of rock salt and lime', reasoning: 'EasyAyurveda: Cucumber is extremely cooling for Pitta. Hydrating and refreshing.', time: '4:00 - 4:30 PM' },
      { meal: 'Sweet Lassi', food: 'Fresh yogurt blended with water, cardamom, and a little sugar', reasoning: 'PlanetAyurveda: Sweet lassi is cooling and probiotic. Avoid sour yogurt for Pitta.', time: '4:00 - 4:30 PM' }
    ],
    dinner: [
      { meal: 'Light Rice + Dal', food: 'Small portion of rice, Moong Dal, cooked greens, ghee', reasoning: 'EasyAyurveda: Light, cooling dinner. Avoid heavy, spicy, or sour foods at night.', time: '7:00 - 7:30 PM' },
      { meal: 'Vegetable Stew', food: 'Coconut-based vegetable stew with rice or bread', reasoning: 'PlanetAyurveda: Coconut-based stew is cooling and nourishing for Pitta at dinner.', time: '7:00 - 7:30 PM' }
    ],
    bedtime: [
      { meal: 'Cooling Milk', food: 'Warm (not hot) milk with cardamom and a tsp of ghee', reasoning: 'EasyAyurveda: Warm milk with ghee cools Pitta and promotes restful sleep.', time: '9:30 - 10:00 PM' }
    ]
  },
  Kapha: {
    breakfast: [
      { meal: 'Barley Porridge', food: 'Barley cooked with honey, ginger, and a pinch of black pepper', reasoning: 'EasyAyurveda: Barley is the best grain for Kapha - light, dry, and scraping (Lekhana).', time: '7:00 - 8:00 AM' },
      { meal: 'Honey & Warm Water', food: '1 tsp old honey in warm water + light fruit (apple, pear)', reasoning: 'PlanetAyurveda: Honey is Lekhana (scraping) for Kapha. Never heat honey. Warm water kindles Agni.', time: '7:00 - 8:00 AM' },
      { meal: 'Millet Upma', food: 'Millet cooked with mustard seeds, curry leaves, ginger, and vegetables', reasoning: 'EasyAyurveda: Millet is light and dry. Mustard and ginger stimulate Kapha digestion.', time: '7:00 - 8:00 AM' }
    ],
    midMorning: [
      { meal: 'Ginger Tea', food: 'Fresh ginger tea with a pinch of black pepper and honey', reasoning: 'PlanetAyurveda: Ginger is the best herb for Kapha. Kindles Agni and reduces Ama.', time: '10:00 - 10:30 AM' },
      { meal: 'Warm Water', food: 'Sip warm water with lemon (if no acidity) throughout', reasoning: 'EasyAyurveda: Warm water stimulates metabolism and reduces Kapha accumulation.', time: '10:00 - 10:30 AM' }
    ],
    lunch: [
      { meal: 'Barley + Vegetables', food: 'Barley or millet, steamed vegetables (bitter gourd, leafy greens), light dal', reasoning: 'PlanetAyurveda: Barley and bitter vegetables are Lekhana for Kapha. Light dal provides protein.', time: '12:30 - 1:30 PM' },
      { meal: 'Quinoa Salad', food: 'Quinoa with roasted vegetables, lemon dressing, and herbs', reasoning: 'EasyAyurveda: Quinoa is light and dry. Lemon is stimulating for Kapha digestion.', time: '12:30 - 1:30 PM' },
      { meal: 'Ragi Roti + Sambar', food: 'Ragi (finger millet) roti, light sambar with drumstick and vegetables', reasoning: 'PlanetAyurveda: Ragi is light and warming. Sambar with tamarind stimulates Kapha.', time: '12:30 - 1:30 PM' }
    ],
    snack: [
      { meal: 'Roasted Chana', food: 'Roasted chickpeas with a pinch of rock salt and pepper', reasoning: 'EasyAyurveda: Roasted (not fried) chickpeas are light and dry. Good for Kapha.', time: '4:00 - 4:30 PM' },
      { meal: 'Spiced Buttermilk', food: 'Buttermilk with cumin, ginger, and asafoetida (Hing)', reasoning: 'PlanetAyurveda: Buttermilk is lighter than yogurt. Cumin and ginger aid Kapha digestion.', time: '4:00 - 4:30 PM' }
    ],
    dinner: [
      { meal: 'Light Soup', food: 'Vegetable soup with barley, ginger, and black pepper', reasoning: 'EasyAyurveda: Very light dinner for Kapha. Soup is easy to digest and warming.', time: '6:30 - 7:00 PM' },
      { meal: 'Steamed Vegetables', food: 'Steamed vegetables with a light dal and minimal rice', reasoning: 'PlanetAyurveda: Minimal grains at dinner. Steamed vegetables are light for Kapha.', time: '6:30 - 7:00 PM' }
    ],
    bedtime: [
      { meal: 'Herbal Tea', food: 'Tulsi (Holy Basil) tea with a pinch of dry ginger powder', reasoning: 'EasyAyurveda: Tulsi is Kapha-reducing. Avoid milk at bedtime for Kapha types.', time: '9:00 - 9:30 PM' }
    ]
  }
};

const getSeasonalModifications = (season: string, prakriti: string): string[] => {
  const mods: string[] = [];
  
  if (season === 'summer') {
    mods.push('Increase cooling foods: cucumber, watermelon, coconut water');
    mods.push('Reduce spicy, sour, and fermented foods');
    mods.push('Drink room temperature water, avoid ice');
    if (prakriti === 'Pitta') mods.push('Pitta season! Be extra careful with heat. Favor ghee and milk.');
  } else if (season === 'winter') {
    mods.push('Increase warm, cooked, oily foods');
    mods.push('Add ginger, black pepper, and cinnamon to meals');
    mods.push('Drink warm water throughout the day');
    if (prakriti === 'Vata') mods.push('Vata season! Extra Abhyanga (oil massage) and warm foods essential.');
  } else if (season === 'monsoon') {
    mods.push('Eat light, warm, freshly cooked foods');
    mods.push('Avoid raw salads and outside food');
    mods.push('Add Trikatu (ginger, pepper, long pepper) to meals');
    if (prakriti === 'Kapha') mods.push('Kapha season! Strictly avoid heavy, oily, sweet foods.');
  } else {
    mods.push('Transition season: gradually adjust diet');
    mods.push('Favor seasonal, local, freshly cooked foods');
    mods.push('Maintain regular meal times');
  }
  
  return mods;
};

const getHealthGoalModifications = (goal: string, prakriti: string): string[] => {
  const mods: string[] = [];
  
  if (goal === 'weight-loss') {
    mods.push('Eat only when truly hungry - no snacking between meals');
    mods.push('Favor bitter, astringent, and pungent tastes');
    mods.push('Avoid daytime sleep (Divasvapna) - Charaka identifies this as primary cause of obesity');
    mods.push('Take 1 tsp honey (not heated) in warm water every morning');
    if (prakriti === 'Kapha') mods.push('Kapha weight gain: Udvartana (dry powder massage) before bath daily.');
  } else if (goal === 'weight-gain') {
    mods.push('Increase Ghrita (ghee), milk, rice, and dates');
    mods.push('Eat Ashwagandha 1 tsp with warm milk twice daily');
    mods.push('Take Chyawanprash 2 tsp daily');
    if (prakriti === 'Vata') mods.push('Vata difficulty gaining: focus on regular meal times and warm, oily foods.');
  } else if (goal === 'digestion') {
    mods.push('Take Trikatu Churna 1/2 tsp before meals with warm water');
    mods.push('Eat only when previous meal is fully digested');
    mods.push('Fill stomach: 1/2 food, 1/4 water, 1/4 air (Charaka)');
    mods.push('Avoid incompatible food combinations (Viruddha Ahara)');
  } else if (goal === 'energy') {
    mods.push('Take Chyawanprash 2 tsp every morning');
    mods.push('Eat seasonal fruits and fresh vegetables');
    mods.push('Avoid heavy, processed, and leftover foods');
    mods.push('Practice Pranayama (Nadi Shodhana) daily for Prana balance');
  } else if (goal === 'stress') {
    mods.push('Favor Sattvic foods: fresh, warm, simple, home-cooked');
    mods.push('Take Brahmi or Ashwagandha with warm milk at bedtime');
    mods.push('Avoid caffeine, alcohol, and stimulants');
    mods.push('Eat in a calm environment - no screens during meals');
  } else if (goal === 'immunity') {
    mods.push('Take Chyawanprash daily - the premier Rasayana');
    mods.push('Include Turmeric in cooking daily');
    mods.push('Take Guduchi (Giloy) Kwath 20ml twice daily');
    mods.push('Eat Amalaki (Indian Gooseberry) regularly');
  }
  
  return mods;
};

const ALLERGIES_LIST = ['Dairy', 'Gluten', 'Nuts', 'Eggs', 'Soy', 'Seafood', 'Nightshades', 'Legumes'];

const getFilteredMeals = (meals: {meal: string; food: string; reasoning: string; time: string}[], allergies: string[]): {meal: string; food: string; reasoning: string; time: string}[] => {
  return meals.filter(m => {
    const food = m.food.toLowerCase();
    if (allergies.includes('Dairy') && (food.includes('milk') || food.includes('ghee') || food.includes('paneer') || food.includes('yogurt') || food.includes('butter') || food.includes('cheese') || food.includes('lassi') || food.includes('raita') || food.includes('buttermilk'))) return false;
    if (allergies.includes('Gluten') && (food.includes('wheat') || food.includes('roti') || food.includes('oats') || food.includes('barley'))) return false;
    if (allergies.includes('Nuts') && (food.includes('almond') || food.includes('walnut') || food.includes('cashew') || food.includes('nut'))) return false;
    if (allergies.includes('Eggs') && food.includes('egg')) return false;
    if (allergies.includes('Soy') && (food.includes('soy') || food.includes('tofu'))) return false;
    if (allergies.includes('Seafood') && food.includes('fish')) return false;
    if (allergies.includes('Nightshades') && (food.includes('tomato') || food.includes('potato') || food.includes('eggplant'))) return false;
    if (allergies.includes('Legumes') && (food.includes('dal') || food.includes('chickpea') || food.includes('bean') || food.includes('lentil') || food.includes('moong') || food.includes('masoor'))) return false;
    return true;
  });
};

interface DietResult {
  prakriti: string;
  healthGoal: string;
  season: string;
  dailyPlan: Record<string, {meal: string; food: string; reasoning: string; time: string}[]>;
  seasonalMods: string[];
  goalMods: string[];
  generalRules: string[];
}

interface AIAnalysis {
  loading: boolean;
  content: string;
  isLocal: boolean;
}

const DietChartTool: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<DietInputs>({
    prakriti: '',
    healthGoal: '',
    season: '',
    dietaryPreference: '',
    allergies: [],
    ageGroup: '',
    activityLevel: '',
    digestiveStrength: ''
  });
  const [result, setResult] = useState<DietResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis>({ loading: false, content: '', isLocal: false });
  const [aiExpanded, setAiExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const steps = [
    { title: 'Constitution', icon: '🧬' },
    { title: 'Health Goal', icon: '🎯' },
    { title: 'Lifestyle', icon: '🌿' },
    { title: 'Preferences', icon: '🍽️' }
  ];

  useEffect(() => {
    if (result && !isAnalyzing) {
      fetchAIDietAnalysis(result);
    }
  }, [result]);

  const generateLocalDietAnalysis = (dietResult: DietResult): string => {
    const prakritiKey = dietResult.prakriti.includes('Vata') ? 'Vata' : dietResult.prakriti.includes('Pitta') ? 'Pitta' : 'Kapha';
    
    let analysis = '';
    
    analysis += `WHY THIS DIET WORKS\n`;
    if (prakritiKey === 'Vata') {
      analysis += `Your Vata constitution requires warm, moist, grounding foods. Every meal in your plan emphasizes Guru (heavy), Snigdha (oily), and Ushna (warm) qualities to counter Vata's Laghu, Ruksha, Sheeta nature. Ghee is used throughout as it is the best Anupana (vehicle) for Vata. Regular meal times stabilize Vishama Agni (irregular digestion).`;
    } else if (prakritiKey === 'Pitta') {
      analysis += `Your Pitta constitution requires cooling, sweet, and calming foods. Every meal emphasizes Sheetala (cooling), Madhura (sweet), and Snigdha (oily) qualities to counter Pitta's Ushna, Tikshna, Ruksha nature. Coconut, cucumber, and sweet fruits are emphasized. Spicy, sour, and fermented foods are avoided.`;
    } else {
      analysis += `Your Kapha constitution requires light, dry, and stimulating foods. Every meal emphasizes Laghu (light), Ruksha (dry), and Ushna (warm) qualities to counter Kapha's Guru, Snigdha, Sheeta nature. Barley, honey, and ginger are emphasized. Heavy, oily, and sweet foods are minimized.`;
    }
    analysis += `\n\n`;

    analysis += `FOOD COMBINATIONS TO AVOID (Viruddha Ahara)\n`;
    analysis += `Per Charaka Samhita, these incompatible combinations create Ama (toxins):\n`;
    analysis += `1. Milk + Fish: Opposite energies create skin diseases and blood disorders\n`;
    analysis += `2. Milk + Sour fruits: Curdles in stomach, creates blockages in Srotas\n`;
    analysis += `3. Honey + Ghee in equal amounts: Creates toxic compounds per classical texts\n`;
    analysis += `4. Hot honey: Heating honey above 60C makes it toxic (Ama-producing)\n`;
    analysis += `5. Fruit + Dairy: Different digestion times cause fermentation and Ama`;
    analysis += `\n\n`;

    analysis += `COOKING METHODS\n`;
    if (prakritiKey === 'Vata') {
      analysis += `• Boiling and steaming: Best for Vata - adds moisture and softness\n• Slow cooking: Stews, soups, and khichdi are ideal\n• Use ghee generously in all cooking\n• Avoid raw, dry, or fried foods\n• Pressure cooking dal and grains makes them more digestible`;
    } else if (prakritiKey === 'Pitta') {
      analysis += `• Steaming and light sauteing: Best for Pitta - preserves cooling qualities\n• Avoid deep frying and charring\n• Cook at moderate temperatures\n• Use coconut oil or ghee (not sesame for Pitta)\n• Fresh is best - avoid leftovers and reheated food`;
    } else {
      analysis += `• Dry roasting and grilling: Best for Kapha - adds dryness\n• Light sauteing with minimal oil\n• Use mustard oil or minimal ghee\n• Avoid heavy, creamy preparations\n• Spices should be dry-roasted before adding`;
    }
    analysis += `\n\n`;

    analysis += `SPICE GUIDE\n`;
    if (prakritiKey === 'Vata') {
      analysis += `1. Cumin (Jeera): Add to dal and rice - aids Vata digestion\n2. Asafoetida (Hing): Add to dal - reduces gas and bloating\n3. Ginger (fresh): Add to vegetables - kindles Agni without overheating\n4. Cardamom: Add to milk and desserts - calms Vata, adds flavor\n5. Cinnamon: Add to warm drinks - warming and grounding`;
    } else if (prakritiKey === 'Pitta') {
      analysis += `1. Fennel (Saunf): Add to rice and desserts - cooling and digestive\n2. Coriander: Add to curries and chutneys - Sheetala (cooling)\n3. Cardamom: Add to milk and tea - sweet and cooling\n4. Turmeric: Add to all cooking - anti-inflammatory, Pitta-friendly\n5. Saffron: Add to milk - cooling and enhances Ojas`;
    } else {
      analysis += `1. Ginger (dry): Add to all meals - kindles Mandagni (slow digestion)\n2. Black pepper: Add to soups and dal - Lekhana (scraping) for Kapha\n3. Mustard seeds: Temper vegetables - heating and stimulating\n4. Turmeric: Add to all cooking - anti-inflammatory and drying\n5. Long pepper (Pippali): Add to honey (not heated) - respiratory support`;
    }
    analysis += `\n\n`;

    analysis += `HYDRATION PLAN\n`;
    if (prakritiKey === 'Vata') {
      analysis += `• Morning: Warm water with lemon upon waking\n• Throughout day: Sip warm water (not cold)\n• With meals: Small sips of warm water only\n• Evening: Warm milk with nutmeg before bed\n• Avoid: Ice water, cold drinks, excessive fluids during meals`;
    } else if (prakritiKey === 'Pitta') {
      analysis += `• Morning: Room temperature water with a little lime\n• Throughout day: Coconut water, room temp water\n• With meals: Moderate room temperature water\n• Evening: Cool (not cold) milk with cardamom\n• Avoid: Hot drinks, alcohol, excessive caffeine`;
    } else {
      analysis += `• Morning: Warm water with 1 tsp honey (never heat honey)\n• Throughout day: Sip warm water with ginger\n• With meals: Minimal water - Kapha already has excess moisture\n• Evening: Tulsi tea or warm water\n• Avoid: Cold drinks, excess fluids, smoothies`;
    }
    analysis += `\n\n`;

    analysis += `WEEKLY VARIATION TIPS\n`;
    analysis += `• Rotate between the 2-3 options provided for each meal slot\n`;
    analysis += `• Change vegetables based on what is seasonal and local\n`;
    if (prakritiKey === 'Vata') {
      analysis += `• Vary your grains: rice, wheat, oats, quinoa (all cooked warm)\n`;
      analysis += `• Rotate oils: ghee, sesame oil, olive oil\n`;
    } else if (prakritiKey === 'Pitta') {
      analysis += `• Vary your fruits: seasonal sweet fruits only\n`;
      analysis += `• Rotate cooling grains: rice, barley, wheat\n`;
    } else {
      analysis += `• Vary your grains: barley, millet, quinoa, ragi (all light)\n`;
      analysis += `• Rotate between dry and light preparations\n`;
    }
    analysis += `• Keep the timing and structure consistent - only rotate the specific foods\n`;
    analysis += `• One meal per week can be a "treat" but stay within your Dosha guidelines`;

    return analysis;
  };

  const fetchAIDietAnalysis = async (dietResult: DietResult) => {
    setAiAnalysis({ loading: true, content: '', isLocal: false });
    
    const planSummary = Object.entries(dietResult.dailyPlan).map(([time, meals]) => {
      const mealList = meals.map(m => `${m.meal}: ${m.food}`).join('; ');
      return `${time}: ${mealList}`;
    }).join('\n');

    const prompt = `You are an expert Ayurvedic nutritionist trained in classical texts (Charaka Samhita, Ashtanga Hridayam) and modern Ayurvedic resources like EasyAyurveda.com and PlanetAyurveda.com.

Create a detailed, personalized dietary analysis for this patient:

CONSTITUTION: ${dietResult.prakriti}
HEALTH GOAL: ${dietResult.healthGoal}
SEASON: ${dietResult.season}

DAILY MEAL PLAN:
${planSummary}

SEASONAL MODIFICATIONS:
${dietResult.seasonalMods.join('\n')}

GOAL-SPECIFIC MODIFICATIONS:
${dietResult.goalMods.join('\n')}

Provide a comprehensive analysis in plain text (no markdown):

1. WHY THIS DIET WORKS: Explain the Ayurvedic logic behind each meal choice based on their Prakriti and health goal. Reference classical principles (Rasa, Guna, Virya, Vipaka).

2. FOOD COMBINATIONS TO AVOID: List 3-5 specific Viruddha Ahara (incompatible food combinations) they should avoid based on their constitution.

3. COOKING METHODS: Recommend specific cooking methods (boiling, steaming, sauteing) that best suit their constitution.

4. SPICE GUIDE: Recommend 5 specific spices and how to use them in cooking for their constitution.

5. HYDRATION PLAN: When and what to drink throughout the day based on their Prakriti.

6. WEEKLY VARIATION TIPS: How to rotate foods through the week while staying within their dietary guidelines.

Be specific, practical, and rooted in authentic Ayurvedic principles. Reference EasyAyurveda and PlanetAyurveda recommendations where applicable.`;

    try {
      const response = await fetch('/api/nvidia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'meta/llama-3.1-70b-instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2500,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      if (content) {
        setAiAnalysis({ loading: false, content, isLocal: false });
      } else {
        throw new Error('Empty response');
      }
    } catch (err) {
      const localAnalysis = generateLocalDietAnalysis(dietResult);
      setAiAnalysis({ loading: false, content: localAnalysis, isLocal: true });
    }
  };

  const handleNext = () => {
    if (step === 0 && !inputs.prakriti) return;
    if (step === 1 && !inputs.healthGoal) return;
    if (step === 2 && (!inputs.season || !inputs.ageGroup || !inputs.activityLevel || !inputs.digestiveStrength)) return;
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      generateDietChart();
    }
  };

  const handlePrevious = () => {
    if (step > 0) setStep(step - 1);
  };

  const toggleAllergy = (allergy: string) => {
    setInputs(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }));
  };

  const generateDietChart = () => {
    setIsAnalyzing(true);
    setResult(null);
    setShowDetails(false);
    setAiAnalysis({ loading: false, content: '', isLocal: false });
    setAiExpanded(false);

    setTimeout(() => {
      const prakritiKey = inputs.prakriti.includes('Vata') ? 'Vata' : inputs.prakriti.includes('Pitta') ? 'Pitta' : 'Kapha';
      const db = dietDatabase[prakritiKey];
      
      const dailyPlan: Record<string, {meal: string; food: string; reasoning: string; time: string}[]> = {};
      
      const mealKeys = ['breakfast', 'midMorning', 'lunch', 'snack', 'dinner', 'bedtime'];
      const mealLabels = ['breakfast', 'midMorning', 'lunch', 'snack', 'dinner', 'bedtime'];
      
      mealKeys.forEach((key, idx) => {
        const filtered = getFilteredMeals(db[key], inputs.allergies);
        dailyPlan[mealLabels[idx]] = filtered.length > 0 ? filtered : db[key];
      });

      const seasonalMods = getSeasonalModifications(inputs.season, prakritiKey);
      const goalMods = getHealthGoalModifications(inputs.healthGoal, prakritiKey);
      
      const generalRules = [
        'Eat only when hungry - do not eat out of habit or emotion',
        'Sit down to eat - never eat while standing, walking, or working',
        'Chew food thoroughly - digestion begins in the mouth',
        'Eat the largest meal at lunch when Agni (digestive fire) is strongest',
        'Avoid drinking large amounts of water during meals - sip warm water',
        'Wait at least 3 hours between meals for proper digestion',
        'Eat fresh, warm, freshly cooked food - avoid leftovers and refrigerated food',
        'Follow the 1/2-1/4-1/4 rule: half stomach for food, quarter for water, quarter for air',
        'Avoid incompatible food combinations (Viruddha Ahara): milk + fish, honey + ghee in equal amounts, fruit + dairy'
      ];

      setResult({
        prakriti: inputs.prakriti,
        healthGoal: inputs.healthGoal,
        season: inputs.season,
        dailyPlan,
        seasonalMods,
        goalMods,
        generalRules
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  if (isAnalyzing) {
    return (
      <div className="p-6 max-w-2xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 mb-6">
          <div className="absolute inset-0 border-4 border-ayur-green/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-ayur-green rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-0 border-4 border-transparent border-b-ayur-accent rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-ayur-green mb-2">Generating Your Diet Chart...</h3>
        <p className="text-gray-600 text-center max-w-xs">Creating a personalized Ayurvedic meal plan based on your constitution, goals, and season.</p>
        <div className="mt-6 flex gap-1">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="w-2 h-2 bg-ayur-green rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (result) {
    const mealEmojis: Record<string, string> = {
      breakfast: '🌅',
      midMorning: '☀️',
      lunch: '🍛',
      snack: '🍵',
      dinner: '🌙',
      bedtime: '🌜'
    };

    const mealLabels: Record<string, string> = {
      breakfast: 'Breakfast',
      midMorning: 'Mid-Morning',
      lunch: 'Lunch',
      snack: 'Afternoon Snack',
      dinner: 'Dinner',
      bedtime: 'Bedtime'
    };

    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-ayur-green font-semibold mb-4 hover:gap-3 transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
          </svg>
          Back to Tools
        </button>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-ayur-green to-ayur-green-dark rounded-3xl p-6 text-white text-center">
            <div className="text-3xl font-bold mb-1">Your Personalized Ayurvedic Diet Chart</div>
            <div className="text-white/80 text-sm">
              {result.prakriti} • {result.healthGoal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {result.season.charAt(0).toUpperCase() + result.season.slice(1)}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h3 className="font-bold text-ayur-green mb-3">Daily Meal Plan</h3>
            <div className="space-y-4">
              {Object.entries(result.dailyPlan).map(([key, meals]) => (
                <div key={key} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{mealEmojis[key]}</span>
                    <span className="font-bold text-gray-900">{mealLabels[key]}</span>
                  </div>
                  <div className="space-y-2 ml-7">
                    {meals.map((m, i) => (
                      <div key={i} className="bg-ayur-cream/50 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-gray-900">{m.meal}</span>
                          <span className="text-xs text-ayur-accent font-medium">{m.time}</span>
                        </div>
                        <p className="text-sm text-gray-700">{m.food}</p>
                        <p className="text-xs text-gray-500 mt-1 italic">{m.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="w-full py-4 bg-ayur-green text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:bg-ayur-green-dark transition-all"
          >
            <span>{showDetails ? '▼ Hide' : '▶ View'} Seasonal & Goal Modifications</span>
          </button>

          {showDetails && (
            <div className="space-y-4">
              {result.seasonalMods.length > 0 && (
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-2">🌤️ Seasonal Modifications ({result.season})</h4>
                  <ul className="space-y-1">
                    {result.seasonalMods.map((m, i) => <li key={i} className="text-sm text-blue-700">• {m}</li>)}
                  </ul>
                </div>
              )}

              {result.goalMods.length > 0 && (
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                  <h4 className="font-bold text-amber-800 mb-2">🎯 Health Goal Modifications</h4>
                  <ul className="space-y-1">
                    {result.goalMods.map((m, i) => <li key={i} className="text-sm text-amber-700">• {m}</li>)}
                  </ul>
                </div>
              )}

              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <h4 className="font-bold text-green-800 mb-2">📜 General Ayurvedic Eating Rules</h4>
                <ul className="space-y-1">
                  {result.generalRules.map((r, i) => <li key={i} className="text-sm text-green-700">• {r}</li>)}
                </ul>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-200">
                <button 
                  onClick={() => setAiExpanded(!aiExpanded)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <h4 className="font-bold text-purple-900">AI-Enhanced Diet Analysis</h4>
                  </div>
                  <span className="text-purple-600 text-sm">{aiExpanded ? '▼' : '▶'}</span>
                </button>
                
                {aiExpanded && (
                  <div className="mt-3">
                    {aiAnalysis.loading ? (
                      <div className="flex items-center gap-2 text-purple-600">
                        <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                        <span className="text-sm">AI is analyzing your diet plan...</span>
                      </div>
                    ) : (
                      <div>
                        {aiAnalysis.isLocal && (
                          <div className="mb-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 inline-block">
                            Based on classical Ayurvedic dietetics (EasyAyurveda, PlanetAyurveda, Charaka Samhita). Configure NVIDIA_API_KEY in Vercel for AI-enhanced insights.
                          </div>
                        )}
                        <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{aiAnalysis.content}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => { setStep(0); setResult(null); setShowDetails(false); setAiAnalysis({ loading: false, content: '', isLocal: false }); setAiExpanded(false); }}
              className="flex-1 py-3 bg-ayur-cream text-ayur-green font-bold rounded-xl hover:bg-ayur-green/10 transition-all"
            >
              Regenerate
            </button>
            <button 
              onClick={onBack}
              className="flex-1 py-3 bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              More Tools
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Constitution (Prakriti)</label>
              <div className="space-y-2">
                {['Vata Prakriti', 'Pitta Prakriti', 'Kapha Prakriti', 'Vata-Pitta Prakriti', 'Pitta-Kapha Prakriti', 'Vata-Kapha Prakriti', 'Not Sure - Balanced'].map(p => (
                  <button key={p} onClick={() => setInputs(prev => ({ ...prev, prakriti: p }))} className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                    inputs.prakriti === p ? 'border-ayur-green bg-ayur-green/5 shadow-md' : 'border-gray-100 hover:border-ayur-green/30'
                  }`}>
                    <span className={`text-sm font-medium ${inputs.prakriti === p ? 'text-ayur-green' : 'text-gray-700'}`}>{p}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Health Goal</label>
              <div className="space-y-2">
                {[
                  { value: 'weight-loss', label: 'Weight Loss', icon: '⚖️' },
                  { value: 'weight-gain', label: 'Weight Gain', icon: '💪' },
                  { value: 'digestion', label: 'Improve Digestion', icon: '🔥' },
                  { value: 'energy', label: 'Boost Energy & Vitality', icon: '⚡' },
                  { value: 'stress', label: 'Reduce Stress & Anxiety', icon: '🧘' },
                  { value: 'immunity', label: 'Build Immunity', icon: '🛡️' }
                ].map(g => (
                  <button key={g.value} onClick={() => setInputs(prev => ({ ...prev, healthGoal: g.value }))} className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                    inputs.healthGoal === g.value ? 'border-ayur-green bg-ayur-green/5 shadow-md' : 'border-gray-100 hover:border-ayur-green/30'
                  }`}>
                    <span className="text-xl">{g.icon}</span>
                    <span className={`text-sm font-medium ${inputs.healthGoal === g.value ? 'text-ayur-green' : 'text-gray-700'}`}>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Season</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'summer', label: 'Summer', icon: '☀️' },
                  { value: 'monsoon', label: 'Monsoon', icon: '🌧️' },
                  { value: 'winter', label: 'Winter', icon: '❄️' },
                  { value: 'spring', label: 'Spring/Fall', icon: '🌸' }
                ].map(s => (
                  <button key={s.value} onClick={() => setInputs(prev => ({ ...prev, season: s.value }))} className={`p-3 rounded-xl border-2 text-center transition-all ${
                    inputs.season === s.value ? 'border-ayur-green bg-ayur-green/5' : 'border-gray-100 hover:border-ayur-green/30'
                  }`}>
                    <span className="text-2xl block mb-1">{s.icon}</span>
                    <span className={`text-xs font-medium ${inputs.season === s.value ? 'text-ayur-green' : 'text-gray-700'}`}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'young', label: '16-30' },
                  { value: 'middle', label: '30-50' },
                  { value: 'senior', label: '50+' }
                ].map(a => (
                  <button key={a.value} onClick={() => setInputs(prev => ({ ...prev, ageGroup: a.value }))} className={`p-2 rounded-xl border-2 text-center text-sm transition-all ${
                    inputs.ageGroup === a.value ? 'border-ayur-green bg-ayur-green/5 text-ayur-green font-medium' : 'border-gray-100 text-gray-600'
                  }`}>{a.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'sedentary', label: 'Sedentary' },
                  { value: 'moderate', label: 'Moderate' },
                  { value: 'active', label: 'Active' }
                ].map(a => (
                  <button key={a.value} onClick={() => setInputs(prev => ({ ...prev, activityLevel: a.value }))} className={`p-2 rounded-xl border-2 text-center text-sm transition-all ${
                    inputs.activityLevel === a.value ? 'border-ayur-green bg-ayur-green/5 text-ayur-green font-medium' : 'border-gray-100 text-gray-600'
                  }`}>{a.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Digestive Strength</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'weak', label: 'Weak (Mandagni)' },
                  { value: 'moderate', label: 'Moderate (Sama)' },
                  { value: 'strong', label: 'Strong (Tikshna)' }
                ].map(a => (
                  <button key={a.value} onClick={() => setInputs(prev => ({ ...prev, digestiveStrength: a.value }))} className={`p-2 rounded-xl border-2 text-center text-sm transition-all ${
                    inputs.digestiveStrength === a.value ? 'border-ayur-green bg-ayur-green/5 text-ayur-green font-medium' : 'border-gray-100 text-gray-600'
                  }`}>{a.label}</button>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preference</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
                  { value: 'vegan', label: 'Vegan', icon: '🌱' },
                  { value: 'non-vegetarian', label: 'Non-Vegetarian', icon: '🍗' },
                  { value: 'eggetarian', label: 'Eggetarian', icon: '🥚' }
                ].map(d => (
                  <button key={d.value} onClick={() => setInputs(prev => ({ ...prev, dietaryPreference: d.value }))} className={`p-3 rounded-xl border-2 text-center transition-all ${
                    inputs.dietaryPreference === d.value ? 'border-ayur-green bg-ayur-green/5' : 'border-gray-100 hover:border-ayur-green/30'
                  }`}>
                    <span className="text-2xl block mb-1">{d.icon}</span>
                    <span className={`text-xs font-medium ${inputs.dietaryPreference === d.value ? 'text-ayur-green' : 'text-gray-700'}`}>{d.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allergies / Restrictions</label>
              <div className="flex flex-wrap gap-2">
                {ALLERGIES_LIST.map(a => (
                  <button key={a} onClick={() => toggleAllergy(a)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    inputs.allergies.includes(a)
                      ? 'bg-red-100 border-red-300 text-red-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-red-300'
                  }`}>{a}</button>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-ayur-green font-semibold mb-4 hover:gap-3 transition-all">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
        </svg>
        Exit
      </button>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-1">
            {steps.map((s, i) => (
              <div key={i} className={`flex items-center gap-1 ${i <= step ? 'text-ayur-green' : 'text-gray-300'}`}>
                <span className="text-sm">{s.icon}</span>
                <span className="text-xs font-medium hidden sm:inline">{s.title}</span>
                {i < steps.length - 1 && <div className={`w-4 h-0.5 ${i < step ? 'bg-ayur-green' : 'bg-gray-200'}`}></div>}
              </div>
            ))}
          </div>
          <span className="text-xs text-gray-500">{step + 1}/{steps.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-5 mb-4">
        <h2 className="font-serif text-xl font-bold text-ayur-green mb-4">{steps[step].icon} {steps[step].title}</h2>
        {stepContent()}
      </div>

      <div className="flex justify-between">
        <button onClick={handlePrevious} disabled={step === 0} className={`px-5 py-2 rounded-full font-medium transition-all ${
          step === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-ayur-green hover:bg-ayur-cream'
        }`}>← Previous</button>
        <button onClick={handleNext} disabled={
          (step === 0 && !inputs.prakriti) ||
          (step === 1 && !inputs.healthGoal) ||
          (step === 2 && (!inputs.season || !inputs.ageGroup || !inputs.activityLevel || !inputs.digestiveStrength))
        } className={`px-6 py-2 rounded-full font-bold transition-all ${
          (step === 0 && !inputs.prakriti) ||
          (step === 1 && !inputs.healthGoal) ||
          (step === 2 && (!inputs.season || !inputs.ageGroup || !inputs.activityLevel || !inputs.digestiveStrength))
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white hover:shadow-lg'
        }`}>{step === 3 ? 'Generate Diet Chart →' : 'Next →'}</button>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
        Based on EasyAyurveda.com, PlanetAyurveda.com, Charaka Samhita • AI-Enhanced
      </div>
    </div>
  );
};

export default DietChartTool;
