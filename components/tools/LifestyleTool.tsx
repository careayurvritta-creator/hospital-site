import React, { useState, useEffect } from 'react';
import { aiService } from '../../lib/aiService';

interface Question {
  id: number;
  category: string;
  sanskrit: string;
  text: string;
  icon: string;
  options: { label: string; value: number; dosha: string[]; effect: string }[];
}

const questions: Question[] = [
  {
    id: 1,
    category: "Age & Constitution",
    sanskrit: "Vaya",
    text: "What is your age group?",
    icon: "🕐",
    options: [
      { label: "Below 25 years", value: 0, dosha: ["Kapha"], effect: "Kapha predominance - natural growth phase" },
      { label: "25-40 years", value: 10, dosha: ["Vata", "Pitta"], effect: "Transition phase - Pitta begins to develop" },
      { label: "40-55 years", value: 20, dosha: ["Vata"], effect: "Vata accumulation begins - aging of tissues" },
      { label: "55+ years", value: 30, dosha: ["Vata", "Ama"], effect: "Dhatukshaya - tissue degeneration, Vata Prakopa" }
    ]
  },
  {
    id: 2,
    category: "Body Composition",
    sanskrit: "Meda Dhatu",
    text: "How would you describe your body build?",
    icon: "⚖️",
    options: [
      { label: "Lean, thin, often cold", value: 15, dosha: ["Vata"], effect: "Vata Prakriti - Rikshta, Khara, Laghu" },
      { label: "Medium, muscular", value: 5, dosha: ["Pitta"], effect: "Pitta Prakriti - Snigdha, Ushna, Madhya" },
      { label: "Stocky, heavy, gains easily", value: 20, dosha: ["Kapha", "Meda"], effect: "Kapha Prakriti - Guru, Snigdha, Sandra" },
      { label: "Variable, depends on season", value: 10, dosha: ["Vata", "Kapha"], effect: "Mixed constitution - seasonal variation in Dhatu" }
    ]
  },
  {
    id: 3,
    category: "Digestive Fire",
    sanskrit: "Agni",
    text: "How would you rate your digestive strength?",
    icon: "🔥",
    options: [
      { label: "Strong - Digest heavy meals easily", value: 0, dosha: ["Agni"], effect: "Tikshna Agni - sharp digestion, Pitta predisposition" },
      { label: "Moderate - Digest normal meals", value: 5, dosha: ["Sama Agni"], effect: "Balanced Agni - optimal Rasa-Raktotpatti" },
      { label: "Weak - Often feel heavy/indigestion", value: 15, dosha: ["Mandagni"], effect: "Weak digestion - Ama formation, Kapha increase" },
      { label: "Variable - Depends on food/season", value: 10, dosha: ["Vishama Agni"], effect: "Irregular digestion - Vata disturbance, Srotorodha" }
    ]
  },
  {
    id: 4,
    category: "Elimination",
    sanskrit: "Kostha",
    text: "Describe your bowel movement pattern:",
    icon: "🌊",
    options: [
      { label: "Regular, formed, daily", value: 0, dosha: ["Sama"], effect: "Proper Purisha - healthy elimination, clear Srotas" },
      { label: "Sometimes constipated, sometimes loose", value: 10, dosha: ["Vata"], effect: "Vataja Kostha - dry, hard, irregular - Vata Prakopa" },
      { label: "Often loose, acidic", value: 15, dosha: ["Pitta", "Ama"], effect: "Pittaja Kostha - soft, yellow, burning - Pitta Prakopa, Pitta Dushti" },
      { label: "Always constipated, dry", value: 20, dosha: ["Vata", "Kostha"], effect: "Dry, hard, pellet-like - severe Vata, Malabandha, Srotorodha" }
    ]
  },
  {
    id: 5,
    category: "Energy",
    sanskrit: "Ojas",
    text: "How would you describe your energy levels?",
    icon: "⚡",
    options: [
      { label: "High - Energetic all day", value: 0, dosha: ["Ojas"], effect: "Purno Ojas - optimal Prana, Bala, Vyadhi-Kshamatva" },
      { label: "Good - Stable, occasional dips", value: 5, dosha: ["Prana"], effect: "Sama Ojas - good vitality, normal Dhatu strength" },
      { label: "Low - Fatigue by afternoon", value: 15, dosha: ["Ojas", "Bala"], effect: "Alpa Ojas - depleted Ojas, Dhatu Shosha, Kriya Hani" },
      { label: "Exhausted - Need naps often", value: 25, dosha: ["Dhatu", "Ojas"], effect: "Ojas Kshaya - severe depletion, Bhutatmaja Bala loss" }
    ]
  },
  {
    id: 6,
    category: "Sleep",
    sanskrit: "Nidra",
    text: "How is your sleep quality?",
    icon: "🌙",
    options: [
      { label: "Sound sleep, 7-8 hours", value: 0, dosha: ["Tamas", "Sattva"], effect: "Proper Nidra - refreshes Manas, Dhatu regeneration" },
      { label: "Light sleep, frequent waking", value: 10, dosha: ["Vata"], effect: "Vataja Nidra - disturbed, irregular - Manasika Vata" },
      { label: "Difficulty falling asleep", value: 15, dosha: ["Vata", "Manasika"], effect: "Anidra - sleeplessness, Rajaso Yogyata, Tamo Guna" },
      { label: "Disturbed, frequent nightmares", value: 20, dosha: ["Tamas", "Ama"], effect: "Dushta Nidra - unrestful, Tamoguna increase, Ama影响了Meda" }
    ]
  },
  {
    id: 7,
    category: "Mental Clarity",
    sanskrit: "Sattva",
    text: "How would you rate your mental clarity?",
    icon: "🧠",
    options: [
      { label: "Sharp, focused, clear", value: 0, dosha: ["Sattva"], effect: "Sattvika state - clear Manas, Dhi, Dhriti, Smriti" },
      { label: "Occasional brain fog", value: 5, dosha: ["Tamas"], effect: "Tamoguna increase - occasional mental dullness" },
      { label: "Often confused, poor memory", value: 15, dosha: ["Ama", "Srotas"], effect: "Srotorodha affecting Manas - blocked channels, Meda Dushti" },
      { label: "Difficulty concentrating", value: 20, dosha: ["Manasika", "Raja"], effect: "Manasika disturbance - Dhi Bhrashti, uncontrolled Rajoguna" }
    ]
  },
  {
    id: 8,
    category: "Stress Response",
    sanskrit: "Manasika",
    text: "How do you typically handle stress?",
    icon: "🌀",
    options: [
      { label: "Calm, composed, adapt easily", value: 0, dosha: ["Sattva"], effect: "Sattvika response - balanced Manas, Niyamaka control" },
      { label: "Mild anxiety, manageable", value: 10, dosha: ["Raja"], effect: "Slight Rajoguna - normal stress response" },
      { label: "High anxiety, worry often", value: 15, dosha: ["Vata", "Raja"], effect: "Chittodvega - worry, anxiety, Vata-Pitta aggravation" },
      { label: "Overwhelmed, frequent burnout", value: 25, dosha: ["Tamas", "Ojas"], effect: "Tamasi state - burnout, Ojas Kshaya, complete mental exhaustion" }
    ]
  },
  {
    id: 9,
    category: "Physical Activity",
    sanskrit: "Vyayama",
    text: "What describes your physical activity?",
    icon: "🏃",
    options: [
      { label: "Daily exercise, very active", value: 0, dosha: ["Kapha"], effect: "Optimal activity - balances Kapha, promotes Dhatu" },
      { label: "Regular 3-4 times/week", value: 5, dosha: ["Balanced"], effect: "Proper Vyayama - maintains Dhatu equilibrium" },
      { label: "Occasional, inconsistent", value: 15, dosha: ["Kapha", "Meda"], effect: "Meda Vriddhi - weight gain, Kapha accumulation" },
      { label: "Sedentary, minimal movement", value: 25, dosha: ["Meda", "Srotas"], effect: "Avasyana - total stagnation, Srotorodha, Kapha-Medha increase" }
    ]
  },
  {
    id: 10,
    category: "Dietary Pattern",
    sanskrit: "Ahara",
    text: "Which best describes your diet?",
    icon: "🍽️",
    options: [
      { label: "Balanced, home-cooked, regular", value: 0, dosha: ["Sattva"], effect: "Sattvika Ahara - promotes Ojas, clarity, health" },
      { label: "Mixed, some processed", value: 10, dosha: ["Ama"], effect: "Mixed diet - some Ama formation, Viruddha Ahara" },
      { label: "Irregular timing, heavy meals", value: 15, dosha: ["Agni", "Ama"], effect: "Asamta - irregular meals, heavy digestion causing Ama" },
      { label: "Fast food, fried, late nights", value: 25, dosha: ["Ama", "Meda"], effect: "Viruddha-Ahahara - contradictory foods, severe Ama, Meda accumulation" }
    ]
  },
  {
    id: 11,
    category: "Food Cravings",
    sanskrit: "Rasa",
    text: "What foods do you commonly crave?",
    icon: "🍭",
    options: [
      { label: "No strong cravings", value: 0, dosha: ["Balanced"], effect: "No specific Dosha provocation - balanced state" },
      { label: "Sweet, salty (comfort food)", value: 10, dosha: ["Kapha", "Tamas"], effect: "Kapha Tṛṣṇā - sugar/salt cravings, Tamo Guna" },
      { label: "Spicy, sour, fermented", value: 15, dosha: ["Pitta", "Ama"], effect: "Pitta Tṛṣṇā - spicy/sour, Pitta Prakopa, Amla Rasa" },
      { label: "Cold, raw, ice drinks", value: 20, dosha: ["Vata", "Ama"], effect: "Vata Tṛṣṇā - cold cravings, Vata aggravating, Srotorodha" }
    ]
  },
  {
    id: 12,
    category: "Skin Health",
    sanskrit: "Twak",
    text: "How would you describe your skin?",
    icon: "✨",
    options: [
      { label: "Clear, glowing, soft", value: 0, dosha: ["Rasa", "Rakta"], effect: "Rasa-Rakta Prasad - pure Dhatu, clear complexion, proper Twak" },
      { label: "Occasional issues, oily T-zone", value: 10, dosha: ["Kapha"], effect: "Slightly oily - Kapha affecting Twak, Meda Dushti" },
      { label: "Acne-prone, inflammation", value: 15, dosha: ["Pitta", "Ama"], effect: "Pittaja Twak - inflammation, eruptions, Raktadushti" },
      { label: "Dry, itchy, premature aging", value: 20, dosha: ["Vata", "Rasa"], effect: "Vataja Twak - dry, wrinkled, premature aging, Rasa Dhatu depletion" }
    ]
  },
  {
    id: 13,
    category: "Temperature",
    sanskrit: "Ushma",
    text: "How do you react to heat?",
    icon: "🌡️",
    options: [
      { label: "Comfortable in most temperatures", value: 0, dosha: ["Balanced"], effect: "Sama Deha - thermoregulated, balanced Doshas" },
      { label: "Feel cold easily, prefer warmth", value: 15, dosha: ["Vata"], effect: "Sheetapriya - Vata dominant, needs warmth, Sheeta Guna" },
      { label: "Feel hot easily, sweat a lot", value: 15, dosha: ["Pitta"], effect: "Ushmapriya - Pitta dominant, heat intolerance, Ushna Guna" },
      { label: "Variable - depends on season", value: 10, dosha: ["Vata", "Kapha"], effect: "Ritucharya affected - seasonal sensitivity, Vata-Kapha variation" }
    ]
  },
  {
    id: 14,
    category: "Seasonal Adaptation",
    sanskrit: "Ritu",
    text: "How do you adapt to seasonal changes?",
    icon: "🍂",
    options: [
      { label: "Smooth adaptation", value: 0, dosha: ["Balanced"], effect: "Proper Ritu-artha - follows seasonal regimen, balanced" },
      { label: "Mild issues, recover quickly", value: 10, dosha: ["Prana"], effect: "Mild variation - some Dosha fluctuation but recovers" },
      { label: "Frequent imbalances per season", value: 20, dosha: ["Vata", "Ama"], effect: "Ritucharj南山 - seasonal imbalance, Ritu Satmyata lost" },
      { label: "Significant distress each season", value: 25, dosha: ["Dhatu", "Ojas"], effect: "Severe seasonal distress - Dhatu imbalance, low Ojas, no Ritu Satmyata" }
    ]
  },
  {
    id: 15,
    category: "Daily Routine",
    sanskrit: "Dinacharya",
    text: "How consistent is your daily routine?",
    icon: "📅",
    options: [
      { label: "Very consistent (sleep/wake/eat)", value: 0, dosha: ["Sattva"], effect: "Niyata - proper Dinacharya, maintains Sattva, Vata balance" },
      { label: "Mostly consistent", value: 5, dosha: ["Sattva"], effect: "Mostly regular - good Vata stability, slight variation" },
      { label: "Irregular, depends on mood/work", value: 15, dosha: ["Vata", "Raja"], effect: "Aniyata - irregular routine, Vata Prakopa, Rajoguna" },
      { label: "No routine, chaotic schedule", value: 25, dosha: ["Vata", "Tamas"], effect: "Niyama Nashana - complete routine disruption, severe Vata, Tamo Guna" }
    ]
  }
];

const getAyurvedicRecommendations = (answers: Record<number, number>, score: number, doshaProfile: {vata: number; pitta: number; kapha: number}): {priority: string; title: string; description: string; category: string}[] => {
  const recommendations: {priority: string; title: string; description: string; category: string}[] = [];
  
  if (score >= 90) {
    recommendations.push({
      priority: 'high',
      title: 'Panchakarma Consultation Required',
      description: 'Your assessment indicates severe imbalance (Srotorodha). According to Charaka, at this stage Shodhana (purification) is essential. Visit our hospital for Vamana, Virechana, or Basti therapy.',
      category: 'Treatment'
    });
    recommendations.push({
      priority: 'high',
      title: 'Complete Fasting (Langhana)',
      description: 'Practice Langhana according to Ashtanga Hridayam - light diet or complete fast for 1-3 days to reduce Ama. Take only warm water or ginger-infused water.',
      category: 'Diet'
    });
  }
  
  if (score >= 40) {
    recommendations.push({
      priority: 'high',
      title: 'Deepana & Pachana Therapy',
      description: 'Begin with Deepana (appetite enhancer) and Pachana (digestive) herbs. Take Trikatu (ginger, black pepper, long pepper) before meals to kindle Agni.',
      category: 'Treatment'
    });
  }
  
  if (doshaProfile.vata > 40) {
    recommendations.push({
      priority: doshaProfile.vata > 60 ? 'high' : 'medium',
      title: 'Vata Pacification - Snehana & Swedana',
      description: 'Per Charaka Samhita, for Vata imbalance: Daily Abhyanga (oil massage) with Sesame oil (Taila). Follow with Swedana (steam therapy). This is Vata Shamaka.',
      category: 'Treatment'
    });
    recommendations.push({
      priority: 'medium',
      title: 'Vata Ahara - Oily & Warm Foods',
      description: 'According to Ashtanga Hridayam, favor Snigdha (oily), Ushna (warm), Guru (heavy) foods. Eat cooked rice, ghee, warm milk with cardamom, cooked vegetables. Avoid cold/raw foods.',
      category: 'Diet'
    });
    recommendations.push({
      priority: 'medium',
      title: 'Vata Vihara - Routine Maintenance',
      description: 'Follow strict Dinacharya: Wake before sunrise (Brahma Muhurta), sleep by 10 PM. Maintain regular meal times. Avoid excessive travel and overthinking.',
      category: 'Lifestyle'
    });
  }
  
  if (doshaProfile.pitta > 40) {
    recommendations.push({
      priority: doshaProfile.pitta > 60 ? 'high' : 'medium',
      title: 'Pitta Pacification - Cooling Therapies',
      description: 'According to Charaka, apply Sheeta (cooling) treatments. Take coconut water, rose water, ghee internally. Avoid direct sun, hot spices, fermented foods.',
      category: 'Treatment'
    });
    recommendations.push({
      priority: 'medium',
      title: 'Pitta Ahara - Cooling Foods',
      description: 'Per Ashtanga Hridayam, favor Sheetala (cooling) foods: ghee, milk, watermelon, cucumber, coconut, coriander. Avoid sour, spicy, fermented items. Eat at moderate temperature.',
      category: 'Diet'
    });
    recommendations.push({
      priority: 'low',
      title: 'Pitta Vihara - Stress Management',
      description: 'Practice Dhyana (meditation), deep breathing (Pranayama). Avoid intense exercise in heat. Take evening walks in moonlight (Chandrasnana).',
      category: 'Lifestyle'
    });
  }
  
  if (doshaProfile.kapha > 40) {
    recommendations.push({
      priority: doshaProfile.kapha > 60 ? 'high' : 'medium',
      title: 'Kapha Pacification - Lightening Therapies',
      description: 'According to Charaka Samhita, use Ruksha (dry) treatments. Udvartana (dry herbal powder massage) is excellent. Take light foods, exercise daily.',
      category: 'Treatment'
    });
    recommendations.push({
      priority: 'medium',
      title: 'Kapha Ahara - Light & Dry Foods',
      description: 'Per Ashtanga Hridayam, favor Laghu (light), Ruksha (dry) foods: barley, millet, leafy greens, honey (not cooked). Avoid heavy, oily, sweet foods. Eat only when hungry.',
      category: 'Diet'
    });
    recommendations.push({
      priority: 'medium',
      title: 'Kapha Vihara - Activity & Exertion',
      description: 'Vigorous daily exercise (Vyayama) is essential. Avoid daytime sleep. Wake early, stay active. Practice Kapahabheda - activities that reduce Kapha.',
      category: 'Lifestyle'
    });
  }
  
  const weakDigestion = answers[3] >= 10;
  const poorSleep = answers[6] >= 10;
  const poorDiet = answers[10] >= 10;
  const noRoutine = answers[15] >= 15;
  const lowEnergy = answers[5] >= 10;
  const stress = answers[8] >= 10;
  const constipation = answers[4] >= 10;
  
  if (weakDigestion) {
    recommendations.push({
      priority: 'high',
      title: 'Agni Deepana - Digestive Fire Kindling',
      description: 'Take 1 tsp Trikatu Churna before meals with warm water. Drink ginger tea (AdrakShaunti) 15 mins before meals. Avoid overeating - take half your stomach capacity.',
      category: 'Treatment'
    });
  }
  
  if (poorSleep) {
    recommendations.push({
      priority: 'medium',
      title: 'Nidra Pratyahara - Sleep Regulation',
      description: 'According to Charaka, proper sleep comes from routine: Sleep before 10 PM, avoid screens. Take warm milk with Brahmi or Ashwagandha at bedtime. Practice Yoga Nidra.',
      category: 'Lifestyle'
    });
  }
  
  if (constipation) {
    recommendations.push({
      priority: 'medium',
      title: 'Anuloma - Natural Bowel Movement',
      description: 'Take Isabgol (Psyllium husk) with warm water at bedtime. Drink warm water throughout day. Abhyanga with castor oil on abdomen in circular motion clockwise.',
      category: 'Treatment'
    });
  }
  
  if (lowEnergy) {
    recommendations.push({
      priority: 'medium',
      title: 'Rasayana - Tissue Rejuvenation',
      description: 'Take Chyawanprash (2 tsp daily) - the premier Rasayana for Ojas. Take Ashwagandha (Withania somnifera) 1 tsp with warm milk. Both regenerate Dhatu.',
      category: 'Treatment'
    });
  }
  
  if (stress) {
    recommendations.push({
      priority: 'medium',
      title: 'Sattvavajaya - Mind Therapy',
      description: 'Practice Pranayama: Nadi Shodhana (alternate nostril breathing) 10 mins daily. Take Brahmi (Bacopa monnieri) for mental clarity. Avoid stimulants.',
      category: 'Lifestyle'
    });
  }
  
  if (noRoutine) {
    recommendations.push({
      priority: 'high',
      title: 'Dinacharya - Establish Daily Routine',
      description: 'Per Charaka Samhita, routine is foundation of health: Wake 5 AM, eliminate, oil massage, bath, exercise, work, meal times fixed, sleep 10 PM. Start one change at a time.',
      category: 'Lifestyle'
    });
  }
  
  if (poorDiet) {
    recommendations.push({
      priority: 'medium',
      title: 'Ahara Parimarjana - Food Correction',
      description: 'Transition to Sattvic diet: Freshly cooked, warm, simple foods. Avoid: leftover, processed, fried, cold drinks. Eat only when Agni presents (hunger). No grazing between meals.',
      category: 'Diet'
    });
  }
  
  recommendations.push({
    priority: 'low',
    title: 'Daily Abhyanga - Self Massage',
    description: 'Per Charaka, daily oil massage (Abhyanga) prevents aging, improves circulation, calms mind. Use Sesame oil in winter, coconut in summer. 5-10 minutes before bath.',
    category: 'Treatment'
  });
  
  recommendations.push({
    priority: 'low',
    title: 'Seasonal Regimen - Ritucharya',
    description: 'Follow Ritucharya according to season. In current season, adjust diet and activities. This prevents seasonal imbalances (Ritukala disease).',
    category: 'Lifestyle'
  });
  
  return recommendations.sort((a, b) => {
    const order = {high: 0, medium: 1, low: 2};
    return order[a.priority as keyof typeof order] - order[b.priority as keyof typeof order];
  }).slice(0, 12);
};

interface Result {
  score: number;
  maxScore: number;
  riskLevel: string;
  doshaProfile: { vata: number; pitta: number; kapha: number };
  dominantDosha: string;
  recommendations: {priority: string; title: string; description: string; category: string}[];
  summary: string;
}

const LifestyleTool: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [aiRecommendation, setAiRecommendation] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  useEffect(() => {
    if (result && !isAnalyzing) {
      const timer = setTimeout(() => {
        let current = 0;
        const target = result.score;
        const duration = 1500;
        const steps = 60;
        const increment = target / steps;
        const animation = setInterval(() => {
          current += increment;
          if (current >= target) {
            setAnimatedScore(target);
            clearInterval(animation);
          } else {
            setAnimatedScore(Math.floor(current));
          }
        }, duration / steps);
        return () => clearInterval(animation);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [result, isAnalyzing]);

  const handleSelect = (value: number) => {
    setSelectedOption(value);
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    setIsTransitioning(true);
    setTimeout(() => {
      if (step < questions.length - 1) {
        setStep(step + 1);
        setSelectedOption(null);
      } else {
        calculateResult();
      }
      setIsTransitioning(false);
    }, 300);
  };

  const handlePrevious = () => {
    if (step > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setStep(step - 1);
        setSelectedOption(answers[questions[step - 1].id] || null);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const calculateResult = () => {
    setIsAnalyzing(true);
    setResult(null);
    setShowReport(false);
    
    setTimeout(async () => {
      const score = (Object.values(answers) as number[]).reduce((a, b) => a + b, 0);
      const maxScore = 375;
      
      let vataScore = 0, pittaScore = 0, kaphaScore = 0;
      questions.forEach(q => {
        const answerValue = answers[q.id];
        if (answerValue !== undefined) {
          const selectedOption = q.options.find(opt => opt.value === answerValue);
          if (selectedOption) {
            selectedOption.dosha.forEach(d => {
              if (d.includes('Vata')) vataScore += answerValue;
              if (d.includes('Pitta')) pittaScore += answerValue;
              if (d.includes('Kapha')) kaphaScore += answerValue;
            });
          }
        }
      });

      const total = vataScore + pittaScore + kaphaScore || 1;
      const doshaProfile = {
        vata: Math.round((vataScore / total) * 100),
        pitta: Math.round((pittaScore / total) * 100),
        kapha: Math.round((kaphaScore / total) * 100)
      };

      let dominantDosha = "Balanced";
      if (doshaProfile.vata > doshaProfile.pitta && doshaProfile.vata > doshaProfile.kapha) dominantDosha = "Vata Prakriti";
      else if (doshaProfile.pitta > doshaProfile.vata && doshaProfile.pitta > doshaProfile.kapha) dominantDosha = "Pitta Prakriti";
      else if (doshaProfile.kapha > doshaProfile.vata && doshaProfile.kapha > doshaProfile.pitta) dominantDosha = "Kapha Prakriti";

      let riskLevel = "Low Risk";
      let prakritiInsight = "";
      
      if (score >= 90) {
        riskLevel = "High Risk";
        prakritiInsight = "Your assessment shows significant accumulation of Ama (toxins) and severe Dhatu imbalance. According to Charaka Samhita, at this stage, Shodhana (purification) is your only solution. Seek immediate professional care.";
      } else if (score >= 40) {
        riskLevel = "Moderate Risk";
        prakritiInsight = "You show early signs of Ama formation and Dosha imbalance. According to Ashtanga Hridayam, this is the ideal time for Shamana (palliative) therapy and lifestyle correction before it progresses.";
      } else {
        prakritiInsight = "Your lifestyle shows good alignment with Swasthavritta (wellness principles). Continue your current practices. Regular seasonal detoxification (Ritukala) will maintain this balance.";
      }

      const recommendations = getAyurvedicRecommendations(answers, score, doshaProfile);

      setResult({
        score,
        maxScore,
        riskLevel,
        doshaProfile,
        dominantDosha,
        recommendations,
        summary: prakritiInsight
      });
      setIsAnalyzing(false);

      // AI-powered Dinacharya recommendation
      setAiLoading(true);
      setAiRecommendation('');
      const aiPrompt = `Based on this Ayurvedic lifestyle assessment, generate a personalized Dinacharya (daily routine) plan.

Dosha Profile: Vata ${doshaProfile.vata}%, Pitta ${doshaProfile.pitta}%, Kapha ${doshaProfile.kapha}%
Dominant Dosha: ${dominantDosha}
Lifestyle Score: ${score}/${maxScore} (Risk: ${riskLevel})
Key Issues: ${recommendations.slice(0, 4).map(r => r.title).join(', ')}

Provide a structured Dinacharya plan with:
1. **Brahma Muhurta (Early Morning)** - Wake time and morning ritual
2. **Morning Routine** - Abhyanga, Pranayama, exercise specifics
3. **Ahara (Meals)** - Ideal meal times and food suggestions for this dosha
4. **Afternoon** - Work/rest balance
5. **Evening Routine** - Wind-down practices
6. **Ratri Charya (Night)** - Sleep preparation

Keep it concise and practical. Use Sanskrit terms where appropriate with English translations. Focus on the dominant dosha's needs.`;

      const systemInstruction = "You are an expert Ayurvedic physician. Provide personalized daily routine (Dinacharya) recommendations based on the patient's dosha profile. Use classical Ayurvedic principles from Charaka Samhita and Ashtanga Hridayam. Be specific and actionable. Format with markdown headers and bullet points.";

      const generatePromise = aiService.generate(aiPrompt, systemInstruction, {
        temperature: 0.6,
        max_tokens: 800,
      });
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timed out')), 45000)
      );

      try {
        const content = await Promise.race([generatePromise, timeoutPromise]);
        setAiRecommendation(content);
      } catch (err) {
        console.error('[LifestyleTool] AI recommendation failed:', err);
        setAiRecommendation('AI_ENHANCEMENT_UNAVAILABLE');
      } finally {
        setAiLoading(false);
      }
    }, 1500);
  };

  const getRiskColor = () => {
    if (!result) return 'text-green-600';
    if (result.riskLevel === 'Low Risk') return 'text-green-600';
    if (result.riskLevel === 'Moderate Risk') return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskGradient = () => {
    if (!result) return 'from-green-500 to-emerald-600';
    if (result.riskLevel === 'Low Risk') return 'from-green-500 to-emerald-600';
    if (result.riskLevel === 'Moderate Risk') return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-600';
  };

  const getPriorityStyles = (priority: string) => {
    if (priority === 'high') return 'bg-red-50 border-red-200 text-red-800';
    if (priority === 'medium') return 'bg-amber-50 border-amber-200 text-amber-800';
    return 'bg-green-50 border-green-200 text-green-800';
  };

  // Loading screen
  if (isAnalyzing) {
    return (
      <div className="p-6 max-w-2xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 mb-6">
          <div className="absolute inset-0 border-4 border-ayur-green/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-ayur-green rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-0 border-4 border-transparent border-b-ayur-accent rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">🧘</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-ayur-green mb-2">Analyzing Your Ayurvedic Profile...</h3>
        <p className="text-gray-600 text-center max-w-xs">Calculating your Dosha balance and generating personalized recommendations based on classical texts.</p>
        
        <div className="mt-6 flex gap-1">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="w-2 h-2 bg-ayur-green rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
          ))}
        </div>
      </div>
    );
  }

  // Results View
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
          {/* Score Card */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
            <div className={`bg-gradient-to-r ${getRiskGradient()} p-6 text-white text-center`}>
              <div className="text-5xl font-bold mb-1">{animatedScore}</div>
              <div className="text-white/80 text-sm">out of {result.maxScore}</div>
            </div>
            <div className="p-4 text-center">
              <span className={`inline-block px-4 py-2 rounded-full font-bold ${getRiskColor()} bg-gray-50`}>
                {result.riskLevel}
              </span>
            </div>
          </div>

          {/* Doshic Profile */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h3 className="font-bold text-ayur-green mb-3">Your Doshic Assessment</h3>
            <div className="space-y-2">
              {[
                { name: 'Vata', value: result.doshaProfile.vata, color: 'bg-yellow-500', sanskrit: '(Motion)' },
                { name: 'Pitta', value: result.doshaProfile.pitta, color: 'bg-red-500', sanskrit: '(Transform)' },
                { name: 'Kapha', value: result.doshaProfile.kapha, color: 'bg-blue-500', sanskrit: '(Structure)' }
              ].map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-16 text-sm font-medium">{d.name} <span className="text-xs text-gray-400">{d.sanskrit}</span></span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${d.color} rounded-full transition-all`} style={{ width: `${d.value}%` }} />
                  </div>
                  <span className="w-10 text-sm text-right">{d.value}%</span>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600 mt-3 font-medium">{result.dominantDosha}</p>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-ayur-cream to-white rounded-2xl p-4 border border-ayur-subtle">
            <h3 className="font-bold text-ayur-green mb-2">Assessment Summary</h3>
            <p className="text-gray-700 text-sm">{result.summary}</p>
          </div>

          {/* Toggle Recommendations */}
          <button 
            onClick={() => setShowReport(!showReport)}
            className="w-full py-4 bg-ayur-green text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:bg-ayur-green-dark transition-all"
          >
            <span>{showReport ? '▼ Hide' : '▶ View'} Ayurvedic Recommendations</span>
          </button>

          {/* Recommendations */}
          {showReport && (
            <div className="space-y-3">
              {result.recommendations.map((rec, idx) => (
                <div key={idx} className={`p-4 rounded-xl border-2 ${getPriorityStyles(rec.priority)}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-bold text-gray-900">{rec.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${rec.priority === 'high' ? 'bg-red-200 text-red-800' : rec.priority === 'medium' ? 'bg-amber-200 text-amber-800' : 'bg-green-200 text-green-800'}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{rec.description}</p>
                  <p className="text-xs text-ayur-accent mt-2 font-medium">Category: {rec.category}</p>
                </div>
              ))}
            </div>
          )}

          {/* AI-Powered Dinacharya Recommendation */}
          {(aiLoading || aiRecommendation) && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-bold text-white">AI-Powered Dinacharya</h3>
                  <p className="text-purple-100 text-xs">Personalized daily routine by AI</p>
                </div>
              </div>
              <div className="p-4">
                {aiLoading ? (
                  <div className="flex flex-col items-center py-6 gap-3">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">Generating your personalized routine...</p>
                  </div>
                ) : aiRecommendation === 'AI_ENHANCEMENT_UNAVAILABLE' ? (
                  <div className="flex items-center gap-3 py-4 px-3 bg-gray-50 rounded-xl">
                    <span className="text-xl">⚠️</span>
                    <p className="text-sm text-gray-600">AI enhancement unavailable. The classical recommendations above are fully comprehensive for your needs.</p>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                    {aiRecommendation.split('\n').map((line, i) => {
                      const trimmed = line.trim();
                      if (!trimmed) return <div key={i} className="h-2" />;
                      if (trimmed.startsWith('### ')) return <h4 key={i} className="font-bold text-purple-700 mt-3 mb-1 text-sm">{trimmed.slice(4)}</h4>;
                      if (trimmed.startsWith('## ')) return <h3 key={i} className="font-bold text-purple-800 mt-4 mb-1">{trimmed.slice(3)}</h3>;
                      if (trimmed.startsWith('# ')) return <h2 key={i} className="font-bold text-purple-900 mt-4 mb-1">{trimmed.slice(2)}</h2>;
                      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) return <div key={i} className="flex gap-2 text-sm ml-2"><span className="text-purple-400 mt-0.5">•</span><span>{trimmed.slice(2)}</span></div>;
                      if (trimmed.startsWith('**') && trimmed.endsWith('**')) return <p key={i} className="font-semibold text-gray-800 mt-2">{trimmed.slice(2, -2)}</p>;
                      return <p key={i} className="text-sm">{trimmed}</p>;
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => { setStep(0); setAnswers({}); setResult(null); setShowReport(false); setAnimatedScore(0); setAiRecommendation(''); setAiLoading(false); }}
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

  // Question View
  return (
    <div className="p-4 max-w-lg mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-ayur-green font-semibold mb-4 hover:gap-3 transition-all">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
        </svg>
        Exit
      </button>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span className="font-medium">{currentQuestion.category}</span>
          <span>{step + 1} / {questions.length}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-ayur-green to-ayur-accent rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-10' : 'opacity-100'}`}>
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
              <button
                key={i}
                onClick={() => handleSelect(opt.value)}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                  selectedOption === opt.value
                    ? 'border-ayur-green bg-ayur-green/5 shadow-md'
                    : 'border-gray-100 hover:border-ayur-green/30 hover:bg-ayur-cream/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedOption === opt.value
                      ? 'border-ayur-green bg-ayur-green'
                      : 'border-gray-300'
                  }`}>
                    {selectedOption === opt.value && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 12l5 5L20 7"/>
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${selectedOption === opt.value ? 'text-ayur-green' : 'text-gray-700'}`}>
                    {opt.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={step === 0}
            className={`px-5 py-2 rounded-full font-medium transition-all ${
              step === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-ayur-green hover:bg-ayur-cream'
            }`}
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            disabled={selectedOption === null}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              selectedOption === null
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white hover:shadow-lg'
            }`}
          >
            {step === questions.length - 1 ? 'Get Results →' : 'Next →'}
          </button>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
        Based on Charaka Samhita, Sushruta, Ashtanga Hridayam • 15 Questions
      </div>
    </div>
  );
};

export default LifestyleTool;