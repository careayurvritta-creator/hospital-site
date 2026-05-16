import React, { useState, useEffect } from 'react';

interface Question {
  id: number;
  category: string;
  sanskrit: string;
  text: string;
  icon: string;
  options: { label: string; value: 'V' | 'P' | 'K'; effect: string }[];
}

const questions: Question[] = [
  {
    id: 1,
    category: 'Body Frame',
    sanskrit: 'Deha',
    text: 'How would you describe your body frame?',
    icon: '🦴',
    options: [
      { label: 'Thin, light, prominent joints', value: 'V', effect: 'Vata - Laghu (light), Ruksha (dry) body structure' },
      { label: 'Medium, well-proportioned, muscular', value: 'P', effect: 'Pitta - Madhyama (medium), Ushna (warm) build' },
      { label: 'Heavy, broad, well-developed', value: 'K', effect: 'Kapha - Guru (heavy), Sandra (dense) constitution' }
    ]
  },
  {
    id: 2,
    category: 'Weight Tendency',
    sanskrit: 'Sthula-Krisha',
    text: 'How does your weight behave?',
    icon: '⚖️',
    options: [
      { label: 'Hard to gain, always thin', value: 'V', effect: 'Vata - difficulty gaining weight despite eating' },
      { label: 'Maintains easily, moderate', value: 'P', effect: 'Pitta - stable weight, medium build' },
      { label: 'Gains easily, hard to lose', value: 'K', effect: 'Kapha - tendency to gain weight, heavy body' }
    ]
  },
  {
    id: 3,
    category: 'Skin Type',
    sanskrit: 'Twak',
    text: 'How would you describe your skin?',
    icon: '✨',
    options: [
      { label: 'Dry, rough, cool to touch, thin', value: 'V', effect: 'Vata Twak - dry, cold, thin, rough texture' },
      { label: 'Warm, oily T-zone, prone to moles', value: 'P', effect: 'Pitta Twak - warm, soft, reddish, prone to rashes' },
      { label: 'Smooth, oily, cool, thick, glowing', value: 'K', effect: 'Kapha Twak - smooth, oily, cool, thick, lustrous' }
    ]
  },
  {
    id: 4,
    category: 'Hair',
    sanskrit: 'Kesha',
    text: 'How would you describe your hair?',
    icon: '💇',
    options: [
      { label: 'Dry, frizzy, curly, thin, brittle', value: 'V', effect: 'Vata Kesha - dry, rough, scanty, premature graying' },
      { label: 'Fine, straight, early graying/balding', value: 'P', effect: 'Pitta Kesha - fine, soft, early graying, thinning' },
      { label: 'Thick, wavy, lustrous, abundant', value: 'K', effect: 'Kapha Kesha - thick, oily, wavy, lustrous, abundant' }
    ]
  },
  {
    id: 5,
    category: 'Eyes',
    sanskrit: 'Akshi',
    text: 'How would you describe your eyes?',
    icon: '👁️',
    options: [
      { label: 'Small, active, dry, darting', value: 'V', effect: 'Vata Akshi - small, dry, active, restless movement' },
      { label: 'Sharp, penetrating, light-sensitive', value: 'P', effect: 'Pitta Akshi - sharp, intense, sensitive to light' },
      { label: 'Large, calm, attractive, moist', value: 'K', effect: 'Kapha Akshi - large, calm, beautiful, moist' }
    ]
  },
  {
    id: 6,
    category: 'Appetite',
    sanskrit: 'Kshudha',
    text: 'How is your appetite?',
    icon: '🍽️',
    options: [
      { label: 'Irregular, forgets to eat, variable', value: 'V', effect: 'Vata Kshudha - irregular, sometimes hungry, sometimes not' },
      { label: 'Strong, gets irritable if delayed', value: 'P', effect: 'Pitta Kshudha - sharp, intense, cannot skip meals' },
      { label: 'Steady, can skip meals comfortably', value: 'K', effect: 'Kapha Kshudha - steady, moderate, can tolerate fasting' }
    ]
  },
  {
    id: 7,
    category: 'Digestion',
    sanskrit: 'Agni',
    text: 'How does your digestion behave?',
    icon: '🔥',
    options: [
      { label: 'Variable - sometimes good, sometimes bloated', value: 'V', effect: 'Vishama Agni - irregular digestion, gas, bloating' },
      { label: 'Sharp - digests quickly, acidic sometimes', value: 'P', effect: 'Tikshna Agni - strong digestion, prone to acidity' },
      { label: 'Slow - takes time, feels heavy after meals', value: 'K', effect: 'Manda Agni - slow digestion, heaviness after eating' }
    ]
  },
  {
    id: 8,
    category: 'Sleep Pattern',
    sanskrit: 'Nidra',
    text: 'How is your sleep?',
    icon: '🌙',
    options: [
      { label: 'Light, interrupted, less than 6 hours', value: 'V', effect: 'Vata Nidra - light sleep, easily disturbed, insomnia' },
      { label: 'Moderate, sound, 6-7 hours', value: 'P', effect: 'Pitta Nidra - moderate sleep, wakes up refreshed' },
      { label: 'Deep, long (8+ hours), hard to wake', value: 'K', effect: 'Kapha Nidra - deep, long, heavy sleep, difficulty waking' }
    ]
  },
  {
    id: 9,
    category: 'Memory',
    sanskrit: 'Smriti',
    text: 'How would you describe your memory?',
    icon: '🧠',
    options: [
      { label: 'Quick to learn, quick to forget', value: 'V', effect: 'Vata Smriti - fast learning but forgets easily' },
      { label: 'Sharp, precise, good recall', value: 'P', effect: 'Pitta Smriti - sharp memory, good retention' },
      { label: 'Slow to learn, but never forgets', value: 'K', effect: 'Kapha Smriti - slow learning but excellent long-term memory' }
    ]
  },
  {
    id: 10,
    category: 'Speech',
    sanskrit: 'Vak',
    text: 'How would you describe your speech?',
    icon: '🗣️',
    options: [
      { label: 'Fast, talks a lot, changes topics', value: 'V', effect: 'Vata Vak - rapid speech, rambling, variable tone' },
      { label: 'Clear, sharp, articulate, persuasive', value: 'P', effect: 'Pitta Vak - clear, sharp, commanding, articulate' },
      { label: 'Slow, melodious, deep, pleasant', value: 'K', effect: 'Kapha Vak - slow, sweet, deep, pleasant voice' }
    ]
  },
  {
    id: 11,
    category: 'Activity Level',
    sanskrit: 'Cheshta',
    text: 'How active are you naturally?',
    icon: '🏃',
    options: [
      { label: 'Very active, restless, always moving', value: 'V', effect: 'Vata Cheshta - restless, active, cannot sit still' },
      { label: 'Moderate, focused, goal-oriented', value: 'P', effect: 'Pitta Cheshta - moderate, purposeful, driven activity' },
      { label: 'Slow, steady, prefers rest', value: 'K', effect: 'Kapha Cheshta - slow, steady, prefers comfort and rest' }
  ]
  },
  {
    id: 12,
    category: 'Temperature Preference',
    sanskrit: 'Ushma',
    text: 'How do you handle temperature?',
    icon: '🌡️',
    options: [
      { label: 'Dislikes cold, prefers warmth', value: 'V', effect: 'Vata Ushma - cold intolerance, seeks warmth' },
      { label: 'Dislikes heat, prefers cool', value: 'P', effect: 'Pitta Ushma - heat intolerance, seeks coolness' },
      { label: 'Tolerates both, prefers moderate', value: 'K', effect: 'Kapha Ushma - good tolerance, moderate preference' }
    ]
  },
  {
    id: 13,
    category: 'Emotional Tendency',
    sanskrit: 'Manasika',
    text: 'What is your default emotional state?',
    icon: '😊',
    options: [
      { label: 'Anxious, worried, fearful, creative', value: 'V', effect: 'Vata Manasika - anxiety, fear, creativity, enthusiasm' },
      { label: 'Angry, ambitious, focused, irritable', value: 'P', effect: 'Pitta Manasika - anger, ambition, courage, irritability' },
      { label: 'Calm, loving, attached, content', value: 'K', effect: 'Kapha Manasika - calm, love, attachment, contentment' }
    ]
  },
  {
    id: 14,
    category: 'Dreams',
    sanskrit: 'Swapna',
    text: 'What kind of dreams do you have?',
    icon: '💭',
    options: [
      { label: 'Flying, running, anxious, chaotic', value: 'V', effect: 'Vata Swapna - flying, running, fear, chaos in dreams' },
      { label: 'Fire, fighting, adventure, intense', value: 'P', effect: 'Pitta Swapna - fire, conflict, adventure, intensity' },
      { label: 'Water, nature, romantic, peaceful', value: 'K', effect: 'Kapha Swapna - water, nature, romance, peace' }
    ]
  },
  {
    id: 15,
    category: 'Stool Pattern',
    sanskrit: 'Mala',
    text: 'How is your bowel movement?',
    icon: '🌊',
    options: [
      { label: 'Irregular, constipated, dry, hard', value: 'V', effect: 'Vata Mala - constipation, dry, hard, irregular' },
      { label: 'Soft, loose, frequent, burning', value: 'P', effect: 'Pitta Mala - soft, loose, frequent, burning sensation' },
      { label: 'Regular, formed, soft, easy', value: 'K', effect: 'Kapha Mala - regular, soft, well-formed, easy passage' }
    ]
  },
  {
    id: 16,
    category: 'Spending Habits',
    sanskrit: 'Artha',
    text: 'How do you handle money?',
    icon: '💰',
    options: [
      { label: 'Irregular spending, impulsive buys', value: 'V', effect: 'Vata Artha - irregular, impulsive, forgets finances' },
      { label: 'Planned, strategic, enjoys spending', value: 'P', effect: 'Pitta Artha - planned, strategic, enjoys quality' },
      { label: 'Saves, cautious, accumulates', value: 'K', effect: 'Kapha Artha - saving, cautious, accumulates wealth' }
    ]
  },
  {
    id: 17,
    category: 'Learning Style',
    sanskrit: 'Adhyayana',
    text: 'How do you prefer to learn?',
    icon: '📚',
    options: [
      { label: 'Quick grasp, enjoys variety, scattered', value: 'V', effect: 'Vata Adhyayana - quick learner, diverse interests, scattered' },
      { label: 'Focused, analytical, competitive', value: 'P', effect: 'Pitta Adhyayana - focused, analytical, competitive learner' },
      { label: 'Methodical, thorough, patient', value: 'K', effect: 'Kapha Adhyayana - methodical, thorough, patient learner' }
    ]
  },
  {
    id: 18,
    category: 'Seasonal Preference',
    sanskrit: 'Ritu',
    text: 'Which season do you feel best in?',
    icon: '🍂',
    options: [
      { label: 'Summer - warmth relieves me', value: 'V', effect: 'Vata prefers Grishma (summer) - warmth balances cold' },
      { label: 'Winter - cool weather feels great', value: 'P', effect: 'Pitta prefers Hemanta (winter) - cool balances heat' },
      { label: 'Spring/Fall - moderate is best', value: 'K', effect: 'Kapha prefers moderate seasons - dry, warm weather' }
    ]
  }
];

const getPrakritiResult = (vCount: number, pCount: number, kCount: number): {
  prakriti: string;
  primary: string;
  secondary: string | null;
  color: string;
  description: string;
  vPercent: number;
  pPercent: number;
  kPercent: number;
  strengths: string[];
  challenges: string[];
  diet: string[];
  lifestyle: string[];
  herbs: string[];
} => {
  const total = vCount + pCount + kCount;
  const vPercent = Math.round((vCount / total) * 100);
  const pPercent = Math.round((pCount / total) * 100);
  const kPercent = Math.round((kCount / total) * 100);

  let prakriti = '';
  let primary = '';
  let secondary: string | null = null;
  let color = '';
  let description = '';
  let strengths: string[] = [];
  let challenges: string[] = [];
  let diet: string[] = [];
  let lifestyle: string[] = [];
  let herbs: string[] = [];

  const sorted = [
    { dosha: 'Vata', count: vCount, percent: vPercent },
    { dosha: 'Pitta', count: pCount, percent: pPercent },
    { dosha: 'Kapha', count: kCount, percent: kPercent }
  ].sort((a, b) => b.count - a.count);

  primary = sorted[0].dosha;
  if (sorted[0].count - sorted[1].count <= 2) {
    secondary = sorted[1].dosha;
  }

  if (secondary) {
    prakriti = `${primary}-${secondary} Prakriti`;
  } else {
    prakriti = `${primary} Prakriti`;
  }

  if (primary === 'Vata') {
    color = 'from-amber-500 to-yellow-600';
    description = 'Per Charaka Samhita (Vimana Sthana 8), you are predominantly Vata Prakriti. Vata governs all movement in the body - breathing, circulation, nerve impulses, and elimination. Your constitution is characterized by the qualities of Laghu (light), Ruksha (dry), Sheeta (cold), and Chala (mobile).';
    strengths = ['Quick learning ability', 'Creative and imaginative mind', 'Adaptable to change', 'Enthusiastic and energetic', 'Excellent communication skills'];
    challenges = ['Irregular digestion (Vishama Agni)', 'Prone to anxiety and worry', 'Dry skin and constipation', 'Light, disturbed sleep', 'Difficulty gaining weight'];
    diet = ['Favor warm, cooked, oily foods', 'Sweet, sour, and salty tastes', 'Avoid cold, raw, dry foods', 'Regular meal times are essential', 'Ghee and warm milk are beneficial'];
    lifestyle = ['Strict daily routine (Dinacharya)', 'Oil massage (Abhyanga) with sesame oil', 'Avoid excessive travel and overexertion', 'Warm bath and steam therapy', 'Gentle yoga - Hatha, Restorative'];
    herbs = ['Ashwagandha - for strength and grounding', 'Bala - nervine tonic for Vata', 'Dashamoola - for Vata pacification', 'Shatavari - nourishing and calming', 'Brahmi - for mental clarity'];
  } else if (primary === 'Pitta') {
    color = 'from-red-500 to-rose-600';
    description = 'Per Charaka Samhita, you are predominantly Pitta Prakriti. Pitta governs all transformation in the body - digestion, metabolism, intelligence, and vision. Your constitution is characterized by Ushna (hot), Tikshna (sharp), Drava (liquid), and Sara (mobile) qualities.';
    strengths = ['Sharp intellect and memory', 'Strong digestion and appetite', 'Leadership and determination', 'Courageous and confident', 'Good physical endurance'];
    challenges = ['Prone to acidity and inflammation', 'Irritability and anger', 'Skin rashes and sensitivity', 'Premature graying or hair loss', 'Impatience and perfectionism'];
    diet = ['Favor cooling, sweet, bitter foods', 'Avoid spicy, sour, fermented foods', 'Coconut, ghee, milk are beneficial', 'Eat at moderate temperature', 'Avoid alcohol and caffeine'];
    lifestyle = ['Avoid excessive heat and sun exposure', 'Swimming and water activities', 'Moonlit walks (Chandrasnana)', 'Meditation and cooling Pranayama', 'Moderate exercise - avoid overheating'];
    herbs = ['Shatavari - cooling rejuvenative', 'Guduchi - Pitta pacifier', 'Amalaki - cooling antioxidant', 'Brahmi - cooling brain tonic', 'Sandalwood - external cooling'];
  } else {
    color = 'from-blue-500 to-cyan-600';
    description = 'Per Charaka Samhita, you are predominantly Kapha Prakriti. Kapha governs all structure and lubrication in the body - bones, muscles, fat, and joints. Your constitution is characterized by Guru (heavy), Snigdha (oily), Sheeta (cold), and Sthira (stable) qualities.';
    strengths = ['Strong immunity and stamina', 'Calm, stable, patient nature', 'Excellent long-term memory', 'Strong, well-developed body', 'Loving and compassionate'];
    challenges = ['Weight gain and obesity risk', 'Slow digestion (Mandagni)', 'Lethargy and oversleeping', 'Congestion and mucus accumulation', 'Attachment and resistance to change'];
    diet = ['Favor light, dry, warm foods', 'Pungent, bitter, astringent tastes', 'Barley, millet, honey are beneficial', 'Avoid heavy, oily, sweet foods', 'Eat only when truly hungry'];
    lifestyle = ['Vigorous daily exercise is essential', 'Avoid daytime sleep (Divasvapna)', 'Dry powder massage (Udvartana)', 'Wake before sunrise (Brahma Muhurta)', 'Stimulating yoga - Vinyasa, Power'];
    herbs = ['Trikatu - kindles digestion', 'Guggulu - scrapes excess Kapha', 'Pippali - respiratory support', 'Turmeric - anti-inflammatory', 'Honey (old) - Lekhana (scraping)'];
  }

  return { prakriti, primary, secondary, color, description, vPercent, pPercent, kPercent, strengths, challenges, diet, lifestyle, herbs };
};

interface AIAnalysis {
  loading: boolean;
  content: string;
  error: string | null;
}

const PrakritiTool: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'V' | 'P' | 'K'>>({});
  const [result, setResult] = useState<ReturnType<typeof getPrakritiResult> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [animatedV, setAnimatedV] = useState(0);
  const [animatedP, setAnimatedP] = useState(0);
  const [animatedK, setAnimatedK] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis>({ loading: false, content: '', error: null });
  const [aiExpanded, setAiExpanded] = useState(false);

  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  useEffect(() => {
    if (result && !isAnalyzing) {
      const timer = setTimeout(() => {
        const duration = 1500;
        const steps = 60;
        const vInc = result.vPercent / steps;
        const pInc = result.pPercent / steps;
        const kInc = result.kPercent / steps;
        let cv = 0, cp = 0, ck = 0;
        const animation = setInterval(() => {
          cv += vInc; cp += pInc; ck += kInc;
          if (cv >= result.vPercent && cp >= result.pPercent && ck >= result.kPercent) {
            setAnimatedV(result.vPercent);
            setAnimatedP(result.pPercent);
            setAnimatedK(result.kPercent);
            clearInterval(animation);
          } else {
            setAnimatedV(Math.floor(cv));
            setAnimatedP(Math.floor(cp));
            setAnimatedK(Math.floor(ck));
          }
        }, duration / steps);
        return () => clearInterval(animation);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [result, isAnalyzing]);

  const fetchAIAnalysis = async (prakritiResult: ReturnType<typeof getPrakritiResult>, userAnswers: Record<number, 'V' | 'P' | 'K'>) => {
    setAiAnalysis({ loading: true, content: '', error: null });
    
    const answerSummary = questions.map(q => {
      const ans = userAnswers[q.id];
      const opt = q.options.find(o => o.value === ans);
      return `${q.text}: ${opt?.label || 'Not answered'}`;
    }).join('\n');

    const prompt = `You are an expert Ayurvedic physician trained in Charaka Samhita, Sushruta Samhita, and Ashtanga Hridayam. 

A patient has been assessed as ${prakritiResult.prakriti} with the following distribution: Vata ${prakritiResult.vPercent}%, Pitta ${prakritiResult.pPercent}%, Kapha ${prakritiResult.kPercent}%.

Their answers to the 18-question Prakriti assessment are:
${answerSummary}

Provide a detailed, personalized analysis in the following format (use plain text, no markdown):

1. CONSTITUTION ANALYSIS: Explain what their specific ${prakritiResult.prakriti} means in practical terms. Reference the classical texts.

2. CURRENT IMBALANCE RISK: Based on their specific answers, identify which Vikriti (current imbalance) they are most at risk for. Explain why.

3. SEASONAL GUIDANCE: What specific Ritucharya (seasonal regimen) should they follow for the current season?

4. PERSONALIZED DAILY ROUTINE: Give them a specific Dinacharya (daily routine) tailored to their constitution, including wake time, meal times, exercise type, and sleep time.

5. WARNING SIGNS: List 5 specific warning signs they should watch for that indicate their Doshas are going out of balance.

Keep the response practical, actionable, and rooted in classical Ayurvedic principles. Be specific to their answers, not generic.`;

    try {
      const response = await fetch('/api/nvidia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'meta/llama-3.1-405b-instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || 'AI analysis could not be generated.';
      setAiAnalysis({ loading: false, content, error: null });
    } catch (err) {
      setAiAnalysis({ loading: false, content: '', error: err instanceof Error ? err.message : 'Failed to fetch AI analysis' });
    }
  };

  const handleSelect = (value: 'V' | 'P' | 'K', index: number) => {
    setSelectedOption(index);
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    if (step < questions.length - 1) {
      setStep(step + 1);
      setSelectedOption(null);
    } else {
      calculateResult();
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
      const prevQ = questions[step - 1];
      const prevAns = answers[prevQ.id];
      setSelectedOption(prevQ.options.findIndex(o => o.value === prevAns));
    }
  };

  const calculateResult = () => {
    setIsAnalyzing(true);
    setResult(null);
    setShowDetails(false);
    setAiAnalysis({ loading: false, content: '', error: null });
    setAiExpanded(false);
    
    setTimeout(() => {
      let vCount = 0, pCount = 0, kCount = 0;
      Object.values(answers).forEach(v => {
        if (v === 'V') vCount++;
        if (v === 'P') pCount++;
        if (v === 'K') kCount++;
      });

      const prakritiResult = getPrakritiResult(vCount, pCount, kCount);
      setResult(prakritiResult);
      setIsAnalyzing(false);
      
      fetchAIAnalysis(prakritiResult, answers);
    }, 1800);
  };

  if (isAnalyzing) {
    return (
      <div className="p-6 max-w-2xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 mb-6">
          <div className="absolute inset-0 border-4 border-ayur-green/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-ayur-green rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-0 border-4 border-transparent border-b-ayur-accent rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">🧬</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-ayur-green mb-2">Determining Your Prakriti...</h3>
        <p className="text-gray-600 text-center max-w-xs">Analyzing your constitution based on 18 classical parameters from Charaka Samhita.</p>
        <div className="mt-6 flex gap-1">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="w-2 h-2 bg-ayur-green rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-ayur-green font-semibold mb-4 hover:gap-3 transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
          </svg>
          Back to Tools
        </button>

        <div className="space-y-4">
          <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
            <div className={`bg-gradient-to-r ${result.color} p-6 text-white text-center`}>
              <div className="text-3xl font-bold mb-1">{result.prakriti}</div>
              <div className="text-white/80 text-sm">Your Innate Constitution (Prakriti)</div>
            </div>
            <div className="p-5">
              <p className="text-gray-700 text-sm leading-relaxed">{result.description}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h3 className="font-bold text-ayur-green mb-3">Dosha Distribution</h3>
            <div className="space-y-3">
              {[
                { name: 'Vata', value: animatedV, color: '#f59e0b', sanskrit: '(Motion & Air)' },
                { name: 'Pitta', value: animatedP, color: '#ef4444', sanskrit: '(Fire & Water)' },
                { name: 'Kapha', value: animatedK, color: '#3b82f6', sanskrit: '(Earth & Water)' }
              ].map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-14 text-sm font-medium">{d.name}</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${d.value}%`, backgroundColor: d.color }} />
                  </div>
                  <span className="w-10 text-sm text-right font-bold">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="w-full py-4 bg-ayur-green text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:bg-ayur-green-dark transition-all"
          >
            <span>{showDetails ? '▼ Hide' : '▶ View'} Complete Prakriti Analysis</span>
          </button>

          {showDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                  <h4 className="font-bold text-green-800 mb-2 text-sm">Your Strengths</h4>
                  <ul className="space-y-1">
                    {result.strengths.map((s, i) => <li key={i} className="text-xs text-green-700">✓ {s}</li>)}
                  </ul>
                </div>
                <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                  <h4 className="font-bold text-red-800 mb-2 text-sm">Your Challenges</h4>
                  <ul className="space-y-1">
                    {result.challenges.map((c, i) => <li key={i} className="text-xs text-red-700">⚠ {c}</li>)}
                  </ul>
                </div>
              </div>

              {[
                { title: 'Diet Guidelines', items: result.diet, color: 'amber' },
                { title: 'Lifestyle Guidelines', items: result.lifestyle, color: 'blue' },
                { title: 'Recommended Herbs', items: result.herbs, color: 'green' }
              ].map((section, idx) => (
                <div key={idx} className={`bg-white rounded-2xl shadow-lg p-4 border-l-4 ${
                  section.color === 'amber' ? 'border-amber-500' : section.color === 'blue' ? 'border-blue-500' : 'border-green-500'
                }`}>
                  <h4 className="font-bold text-gray-900 mb-2">{section.title}</h4>
                  <ul className="space-y-1">
                    {section.items.map((item, i) => <li key={i} className="text-sm text-gray-700">• {item}</li>)}
                  </ul>
                </div>
              ))}

              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-200">
                <button 
                  onClick={() => setAiExpanded(!aiExpanded)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <h4 className="font-bold text-purple-900">AI-Enhanced Analysis</h4>
                  </div>
                  <span className="text-purple-600 text-sm">{aiExpanded ? '▼' : '▶'}</span>
                </button>
                
                {aiExpanded && (
                  <div className="mt-3">
                    {aiAnalysis.loading ? (
                      <div className="flex items-center gap-2 text-purple-600">
                        <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                        <span className="text-sm">AI is analyzing your constitution...</span>
                      </div>
                    ) : aiAnalysis.error ? (
                      <p className="text-sm text-red-600">AI analysis unavailable: {aiAnalysis.error}</p>
                    ) : (
                      <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{aiAnalysis.content}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => { setStep(0); setAnswers({}); setResult(null); setShowDetails(false); setAnimatedV(0); setAnimatedP(0); setAnimatedK(0); setAiAnalysis({ loading: false, content: '', error: null }); }}
              className="flex-1 py-3 bg-ayur-cream text-ayur-green font-bold rounded-xl hover:bg-ayur-green/10 transition-all"
            >
              Retake Assessment
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

  return (
    <div className="p-4 max-w-lg mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-ayur-green font-semibold mb-4 hover:gap-3 transition-all">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
        </svg>
        Exit
      </button>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span className="font-medium">{currentQuestion.category}</span>
          <span>{step + 1} / {questions.length}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-ayur-green to-ayur-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{currentQuestion.icon}</span>
          <div>
            <span className="text-ayur-accent text-xs font-semibold uppercase tracking-wider">{currentQuestion.sanskrit}</span>
          </div>
        </div>
        <h2 className="font-serif text-xl font-bold text-ayur-green mb-4">{currentQuestion.text}</h2>

        <div className="space-y-2">
          {currentQuestion.options.map((opt, i) => (
            <button key={i} onClick={() => handleSelect(opt.value, i)} className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-200 ${
              selectedOption === i ? 'border-ayur-green bg-ayur-green/5 shadow-md' : 'border-gray-100 hover:border-ayur-green/30 hover:bg-ayur-cream/30'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedOption === i ? 'border-ayur-green bg-ayur-green' : 'border-gray-300'
                }`}>
                  {selectedOption === i && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12l5 5L20 7"/>
                    </svg>
                  )}
                </div>
                <div>
                  <span className={`text-sm font-medium ${selectedOption === i ? 'text-ayur-green' : 'text-gray-700'}`}>{opt.label}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{opt.effect}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={handlePrevious} disabled={step === 0} className={`px-5 py-2 rounded-full font-medium transition-all ${
          step === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-ayur-green hover:bg-ayur-cream'
        }`}>← Previous</button>
        <button onClick={handleNext} disabled={selectedOption === null} className={`px-6 py-2 rounded-full font-bold transition-all ${
          selectedOption === null ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white hover:shadow-lg'
        }`}>{step === questions.length - 1 ? 'Get Results →' : 'Next →'}</button>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
        Based on Charaka Samhita Vimana Sthana 8 • 18 Questions • AI-Enhanced
      </div>
    </div>
  );
};

export default PrakritiTool;
