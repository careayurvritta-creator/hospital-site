import React, { useState, useEffect } from 'react';

interface Question {
  id: number;
  category: string;
  sanskrit: string;
  text: string;
  icon: string;
  options: { label: string; value: number; effect: string; eligibility: string }[];
}

const questions: Question[] = [
  {
    id: 1,
    category: "Physical Strength",
    sanskrit: "Bala Pariksha",
    text: "How would you rate your overall physical strength and stamina?",
    icon: "💪",
    options: [
      { label: "Excellent - Can perform heavy exertion easily", value: 3, effect: "Pravara Bala - superior strength, ideal for Shodhana", eligibility: "Eligible" },
      { label: "Good - Moderate exercise, some fatigue", value: 2, effect: "Madhyama Bala - moderate strength, suitable for mild Shodhana", eligibility: "Eligible" },
      { label: "Average - Light activity only, tires quickly", value: 1, effect: "Avara Bala - low strength, Shamana preferred", eligibility: "Caution" },
      { label: "Very weak - Bedridden or minimal movement", value: 0, effect: "Ati Durbala - severe weakness, Shodhana contraindicated", eligibility: "Contraindicated" }
    ]
  },
  {
    id: 2,
    category: "Digestive Fire",
    sanskrit: "Agni Pariksha",
    text: "How strong is your digestive capacity?",
    icon: "🔥",
    options: [
      { label: "Very strong - Digest anything easily", value: 3, effect: "Tikshna Agni - sharp digestion, supports Shodhana therapy", eligibility: "Eligible" },
      { label: "Moderate - Normal digestion", value: 2, effect: "Sama Agni - balanced digestion, suitable for Panchakarma", eligibility: "Eligible" },
      { label: "Weak - Often feel heaviness, indigestion", value: 1, effect: "Mandagni - weak digestion, requires Deepana first", eligibility: "Caution" },
      { label: "Very weak - Cannot digest even light food", value: 0, effect: "Ati Mandagni - severe digestive weakness, Shodhana contraindicated", eligibility: "Contraindicated" }
    ]
  },
  {
    id: 3,
    category: "Body Constitution",
    sanskrit: "Deha Pariksha",
    text: "How would you describe your body build?",
    icon: "⚖️",
    options: [
      { label: "Heavy, stout, well-built", value: 3, effect: "Sthula Deha - ideal for Vamana, Kapha dominant constitution", eligibility: "Eligible" },
      { label: "Medium, proportionate", value: 2, effect: "Madhyama Deha - suitable for all Panchakarma procedures", eligibility: "Eligible" },
      { label: "Lean, thin, light", value: 1, effect: "Krisha Deha - caution for Vamana/Virechana, Basti preferred", eligibility: "Caution" },
      { label: "Emaciated, extremely thin", value: 0, effect: "Ati Krisha - Shodhana contraindicated, Brimhana needed first", eligibility: "Contraindicated" }
    ]
  },
  {
    id: 4,
    category: "Age",
    sanskrit: "Vaya Pariksha",
    text: "What is your age group?",
    icon: "🕐",
    options: [
      { label: "16-30 years (Young adult)", value: 3, effect: "Bala Vaya - strong, resilient, excellent for Shodhana", eligibility: "Eligible" },
      { label: "30-50 years (Middle age)", value: 2, effect: "Madhya Vaya - moderate strength, suitable with proper Snehana", eligibility: "Eligible" },
      { label: "50-70 years (Elderly)", value: 1, effect: "Jirna Vaya - reduced Dhatu, mild procedures only", eligibility: "Caution" },
      { label: "Below 16 or above 70 years", value: 0, effect: "Ati Bala or Ati Jirna - Shodhana contraindicated per Charaka", eligibility: "Contraindicated" }
    ]
  },
  {
    id: 5,
    category: "Contraindications",
    sanskrit: "Viruddha Laxana",
    text: "Do you have any of these conditions? (Select the most applicable)",
    icon: "⚠️",
    options: [
      { label: "None - I am healthy", value: 3, effect: "No contraindications - free to proceed with Panchakarma", eligibility: "Eligible" },
      { label: "Mild cold, cough, or seasonal allergy", value: 2, effect: "Minor Kapha vitiation - treat with Langhana first", eligibility: "Caution" },
      { label: "Pregnancy, severe weakness, or bleeding disorder", value: 0, effect: "Absolute contraindication - Shodhana prohibited per Sushruta", eligibility: "Contraindicated" },
      { label: "Chronic disease (diabetes, heart, TB)", value: 1, effect: "Relative contraindication - requires physician supervision", eligibility: "Contraindicated" }
    ]
  },
  {
    id: 6,
    category: "Mental State",
    sanskrit: "Manasika Bala",
    text: "How would you describe your mental and emotional state?",
    icon: "🧠",
    options: [
      { label: "Calm, focused, emotionally stable", value: 3, effect: "Sattvika Manas - ideal mental state for Panchakarma", eligibility: "Eligible" },
      { label: "Occasional stress, but manageable", value: 2, effect: "Sama Manas - acceptable, mild Rajoguna", eligibility: "Eligible" },
      { label: "High anxiety, depression, or emotional instability", value: 1, effect: "Rajasa/Tamasa Manas - requires Sattvavajaya first", eligibility: "Caution" },
      { label: "Severe mental distress, trauma, or psychosis", value: 0, effect: "Manasika Dushti - Shodhana contraindicated, Shamana only", eligibility: "Contraindicated" }
    ]
  },
  {
    id: 7,
    category: "Tissue Quality",
    sanskrit: "Dhatu Sara",
    text: "How would you rate your tissue quality (skin, muscles, bones)?",
    icon: "✨",
    options: [
      { label: "Excellent - Firm, glowing, well-nourished", value: 3, effect: "Sara Dhatu - tissue excellence, ideal for Shodhana", eligibility: "Eligible" },
      { label: "Good - Mostly healthy, minor issues", value: 2, effect: "Madhyama Dhatu - adequate for Panchakarma", eligibility: "Eligible" },
      { label: "Poor - Weak, dry, or flabby tissues", value: 1, effect: "Asara Dhatu - tissue deficiency, requires Brimhana first", eligibility: "Caution" },
      { label: "Very poor - Wasting, severe weakness", value: 0, effect: "Dhatu Kshaya - tissue depletion, Shodhana contraindicated", eligibility: "Contraindicated" }
    ]
  },
  {
    id: 8,
    category: "Elimination",
    sanskrit: "Mala Pariksha",
    text: "How is your natural elimination (bowel, urine, sweat)?",
    icon: "🌊",
    options: [
      { label: "Regular, complete, no issues", value: 3, effect: "Sama Mala - proper elimination, Srotas are clear", eligibility: "Eligible" },
      { label: "Occasional constipation or irregularity", value: 2, effect: "Mild Mala Dushti - manageable with Snehana-Swedana", eligibility: "Eligible" },
      { label: "Chronic constipation or urinary issues", value: 1, effect: "Mala Sanga - blocked channels, requires Lekhana first", eligibility: "Caution" },
      { label: "Severe elimination problems, retention", value: 0, effect: "Mala Avarodha - severe blockage, Shodhana contraindicated", eligibility: "Contraindicated" }
    ]
  },
  {
    id: 9,
    category: "Dosha Dominance",
    sanskrit: "Dosha Pariksha",
    text: "Which symptoms do you experience most often?",
    icon: "🌀",
    options: [
      { label: "Heaviness, congestion, excess mucus (Kapha)", value: 3, effect: "Kapha Prakopa - Vamana is the ideal therapy", eligibility: "Eligible" },
      { label: "Acidity, inflammation, skin issues (Pitta)", value: 3, effect: "Pitta Prakopa - Virechana is the ideal therapy", eligibility: "Eligible" },
      { label: "Pain, stiffness, dryness, anxiety (Vata)", value: 2, effect: "Vata Prakopa - Basti is the ideal therapy", eligibility: "Eligible" },
      { label: "Mixed symptoms, all three Doshas aggravated", value: 1, effect: "Sannipata - complex imbalance, requires expert assessment", eligibility: "Caution" }
    ]
  },
  {
    id: 10,
    category: "Seasonal Timing",
    sanskrit: "Ritu Pariksha",
    text: "What season are you currently in?",
    icon: "🍂",
    options: [
      { label: "Spring (Vasanta) - Kapha season", value: 3, effect: "Ideal for Vamana - Kapha naturally rises in spring", eligibility: "Eligible" },
      { label: "Autumn (Sharad) - Pitta season", value: 3, effect: "Ideal for Virechana - Pitta naturally rises in autumn", eligibility: "Eligible" },
      { label: "Monsoon/Rainy (Varsha) - Vata season", value: 2, effect: "Suitable for Basti - Vata accumulates in rainy season", eligibility: "Eligible" },
      { label: "Peak Summer or Winter", value: 1, effect: "Extreme seasons - mild procedures only, avoid strong Shodhana", eligibility: "Caution" }
    ]
  }
];

const getTherapyRecommendations = (score: number, doshaDominance: string, eligibility: string): {name: string; sanskrit: string; description: string; indication: string; icon: string; priority: string}[] => {
  const therapies: {name: string; sanskrit: string; description: string; indication: string; icon: string; priority: string}[] = [];

  if (eligibility === 'eligible') {
    if (doshaDominance === 'kapha' || doshaDominance === 'balanced') {
      therapies.push({
        name: 'Vamana',
        sanskrit: 'Therapeutic Emesis',
        description: 'Medicated emesis to expel accumulated Kapha and Ama from upper GI tract. Performed after proper Snehana and Swedana. Uses Madanaphala, Yashtimadhu, or Vacha.',
        indication: 'Kapha disorders: Asthma, obesity, diabetes, skin diseases, chronic cough',
        icon: '🫧',
        priority: 'primary'
      });
    }
    
    if (doshaDominance === 'pitta' || doshaDominance === 'balanced') {
      therapies.push({
        name: 'Virechana',
        sanskrit: 'Therapeutic Purgation',
        description: 'Medicated purgation to eliminate excess Pitta from lower GI tract. Uses Trivrit, Danti, or Aragvadha. Preceded by Snehana for 3-7 days.',
        indication: 'Pitta disorders: Jaundice, acne, eczema, hyperacidity, migraines',
        icon: '💧',
        priority: 'primary'
      });
    }
    
    if (doshaDominance === 'vata' || doshaDominance === 'balanced') {
      therapies.push({
        name: 'Basti',
        sanskrit: 'Medicated Enema',
        description: 'The most important Panchakarma therapy. Medicated decoction or oil administered rectally. Niruha (decoction) for cleansing, Anuvasana (oil) for nourishment.',
        indication: 'Vata disorders: Arthritis, constipation, neurological issues, infertility',
        icon: '🌿',
        priority: 'primary'
      });
    }
    
    therapies.push({
      name: 'Nasya',
      sanskrit: 'Nasal Administration',
      description: 'Medicated oils or powders administered through nostrils. Clears head and neck channels. Uses Anu Taila, Shadbindu Taila, or herbal powders.',
      indication: 'Head & neck disorders: Sinusitis, migraines, hair loss, facial paralysis',
      icon: '👃',
      priority: 'secondary'
    });
    
    therapies.push({
      name: 'Raktamokshana',
      sanskrit: 'Bloodletting',
      description: 'Controlled blood purification through leech therapy or venesection. Removes vitiated Rakta Dhatu. Performed when Raktadushti is confirmed.',
      indication: 'Blood disorders: Psoriasis, varicose veins, chronic skin diseases, gout',
      icon: '🩸',
      priority: 'secondary'
    });
  } else if (eligibility === 'caution') {
    therapies.push({
      name: 'Shamana Therapy',
      sanskrit: 'Palliative Treatment',
      description: 'Mild internal medications to pacify Doshas without purgation. Uses herbal decoctions, powders, and dietary modifications. Builds strength for future Shodhana.',
      indication: 'Pre-Panchakarma preparation for weak or moderate patients',
      icon: '🌱',
      priority: 'primary'
    });
    
    therapies.push({
      name: 'Snehana',
      sanskrit: 'Oleation Therapy',
      description: 'Internal and external oil application to soften tissues and mobilize Doshas. Internal: Ghee or oil ingestion. External: Abhyanga (oil massage).',
      indication: 'Preparatory therapy before any Panchakarma procedure',
      icon: '🫒',
      priority: 'primary'
    });
    
    therapies.push({
      name: 'Swedana',
      sanskrit: 'Sudation Therapy',
      description: 'Therapeutic sweating to liquefy and mobilize toxins. Types: Bashpa (steam), Nad (tube), Kumbhi (pot). Always follows Snehana.',
      indication: 'Preparatory therapy, Vata-Kapha disorders, stiffness, heaviness',
      icon: '♨️',
      priority: 'secondary'
    });
  } else {
    therapies.push({
      name: 'Brimhana',
      sanskrit: 'Nourishing Therapy',
      description: 'Tissue-building treatment for weak patients. Uses milk, ghee, meat soups, and Rasayana herbs. Must be completed before considering Shodhana.',
      indication: 'Emaciation, weakness, Dhatu Kshaya, post-illness recovery',
      icon: '🥛',
      priority: 'primary'
    });
    
    therapies.push({
      name: 'Langhana',
      sanskrit: 'Lightening Therapy',
      description: 'Mild fasting or light diet to reduce Ama and kindle Agni. Not for extremely weak patients. Uses warm water, herbal teas, and light gruels.',
      indication: 'Ama accumulation, weak digestion, Kapha disorders',
      icon: '🍵',
      priority: 'primary'
    });
    
    therapies.push({
      name: 'Sattvavajaya',
      sanskrit: 'Mind Therapy',
      description: 'Psychological treatment through Sattva enhancement. Uses meditation, counseling, Pranayama, and Sattvic diet. Essential for mental health conditions.',
      indication: 'Anxiety, depression, emotional instability, Manasika Roga',
      icon: '🧘',
      priority: 'secondary'
    });
  }
  
  return therapies;
};

const getPreparatorySteps = (eligibility: string): {step: number; title: string; description: string; duration: string}[] => {
  if (eligibility === 'eligible') {
    return [
      { step: 1, title: 'Deepana-Pachana', description: 'Kindle digestive fire and digest Ama with Trikatu, Chitrak, or Pippali.', duration: '3-5 days' },
      { step: 2, title: 'Snehana (Internal)', description: 'Ingest increasing quantities of Ghee or medicated oil daily.', duration: '3-7 days' },
      { step: 3, title: 'Snehana (External)', description: 'Daily Abhyanga (oil massage) with appropriate Taila.', duration: '3-7 days' },
      { step: 4, title: 'Swedana', description: 'Therapeutic steam therapy after oil massage to liquefy toxins.', duration: 'Daily' },
      { step: 5, title: 'Pradhana Karma', description: 'Main Panchakarma procedure (Vamana/Virechana/Basti) as indicated.', duration: '1-3 days' },
      { step: 6, title: 'Paschat Karma', description: 'Post-procedure diet (Samsarjana Krama) and Rasayana therapy.', duration: '7-14 days' }
    ];
  }
  return [
    { step: 1, title: 'Consultation Required', description: 'Visit our Ayurvedic physician for detailed Nadi Pariksha and assessment.', duration: 'Immediate' },
    { step: 2, title: 'Shamana Therapy', description: 'Mild internal medications to pacify Doshas and build strength.', duration: '2-4 weeks' },
    { step: 3, title: 'Reassessment', description: 'After Shamana, reassess eligibility for Panchakarma procedures.', duration: 'After 4 weeks' }
  ];
};

interface Result {
  score: number;
  maxScore: number;
  eligibility: string;
  eligibilityColor: string;
  eligibilityLabel: string;
  eligibilityDescription: string;
  doshaDominance: string;
  therapies: {name: string; sanskrit: string; description: string; indication: string; icon: string; priority: string}[];
  preparatorySteps: {step: number; title: string; description: string; duration: string}[];
}

const PanchakarmaTool: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

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
    setShowDetails(false);
    
    setTimeout(() => {
      const score = (Object.values(answers) as number[]).reduce((a, b) => a + b, 0);
      const maxScore = 30;
      
      let eligibility = 'eligible';
      let eligibilityColor = 'from-green-500 to-emerald-600';
      let eligibilityLabel = 'Eligible for Panchakarma';
      let eligibilityDescription = 'Your assessment indicates strong Bala (strength), balanced Agni (digestive fire), and no contraindications. You are an ideal candidate for Shodhana (purification) therapies as described in Charaka Samhita.';
      
      const contraindicationCount = [5, 6, 7, 8].filter(id => answers[id] === 0).length;
      
      if (contraindicationCount > 0 || score <= 10) {
        eligibility = 'contraindicated';
        eligibilityColor = 'from-red-500 to-rose-600';
        eligibilityLabel = 'Panchakarma Contraindicated';
        eligibilityDescription = 'Your assessment reveals absolute contraindications for Shodhana therapy. According to Sushruta Samhita, Panchakarma should not be performed on the very weak, emaciated, pregnant, or those with severe chronic diseases. Focus on Shamana (palliative) and Brimhana (nourishing) therapies first.';
      } else if (score <= 20) {
        eligibility = 'caution';
        eligibilityColor = 'from-yellow-500 to-amber-500';
        eligibilityLabel = 'Caution - Shamana First';
        eligibilityDescription = 'Your strength and constitution indicate moderate eligibility. Per Ashtanga Hridayam, patients with Madhyama Bala should undergo Shamana (palliative) therapy and Snehana-Swedana preparation before attempting full Panchakarma. Build your strength first.';
      }
      
      let doshaDominance = 'balanced';
      const q9Answer = answers[9];
      if (q9Answer !== undefined) {
        const q9 = questions.find(q => q.id === 9);
        if (q9) {
          const opt = q9.options.find(o => o.value === q9Answer);
          if (opt) {
            if (opt.label.includes('Kapha')) doshaDominance = 'kapha';
            else if (opt.label.includes('Pitta')) doshaDominance = 'pitta';
            else if (opt.label.includes('Vata')) doshaDominance = 'vata';
          }
        }
      }
      
      const therapies = getTherapyRecommendations(score, doshaDominance, eligibility);
      const preparatorySteps = getPreparatorySteps(eligibility);
      
      setResult({
        score,
        maxScore,
        eligibility,
        eligibilityColor,
        eligibilityLabel,
        eligibilityDescription,
        doshaDominance,
        therapies,
        preparatorySteps
      });
      setIsAnalyzing(false);
    }, 1800);
  };

  const getEligibilityIcon = () => {
    if (!result) return null;
    if (result.eligibility === 'eligible') {
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      );
    }
    if (result.eligibility === 'caution') {
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <path d="M12 9v4"/><path d="M12 17h.01"/>
        </svg>
      );
    }
    return (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>
      </svg>
    );
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'primary') return 'bg-ayur-green/10 text-ayur-green border-ayur-green/20';
    return 'bg-ayur-accent/10 text-ayur-accent border-ayur-accent/20';
  };

  const getPriorityLabel = (priority: string) => {
    if (priority === 'primary') return 'PRIMARY';
    return 'SECONDARY';
  };

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
        
        <h3 className="text-xl font-bold text-ayur-green mb-2">Assessing Panchakarma Eligibility...</h3>
        <p className="text-gray-600 text-center max-w-xs">Evaluating your Bala, Agni, and Dosha status based on classical Ayurvedic criteria.</p>
        
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
          {/* Eligibility Card */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
            <div className={`bg-gradient-to-r ${result.eligibilityColor} p-8 text-white text-center`}>
              <div className="flex justify-center mb-4">
                {getEligibilityIcon()}
              </div>
              <div className="text-2xl font-bold mb-1">{result.eligibilityLabel}</div>
              <div className="text-white/80 text-sm">Score: {animatedScore} / {result.maxScore}</div>
            </div>
            <div className="p-5">
              <p className="text-gray-700 text-sm leading-relaxed">{result.eligibilityDescription}</p>
            </div>
          </div>

          {/* Dosha Dominance */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h3 className="font-bold text-ayur-green mb-3">Your Dosha Indication</h3>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                result.doshaDominance === 'kapha' ? 'bg-blue-100' :
                result.doshaDominance === 'pitta' ? 'bg-red-100' :
                result.doshaDominance === 'vata' ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                {result.doshaDominance === 'kapha' ? '💧' :
                 result.doshaDominance === 'pitta' ? '🔥' :
                 result.doshaDominance === 'vata' ? '💨' : '⚖️'}
              </div>
              <div>
                <div className="font-bold text-gray-900 capitalize">{result.doshaDominance === 'balanced' ? 'Tridoshaja (Mixed)' : `${result.doshaDominance} Dominant`}</div>
                <div className="text-xs text-gray-500">
                  {result.doshaDominance === 'kapha' && 'Vamana therapy recommended'}
                  {result.doshaDominance === 'pitta' && 'Virechana therapy recommended'}
                  {result.doshaDominance === 'vata' && 'Basti therapy recommended'}
                  {result.doshaDominance === 'balanced' && 'All therapies may be beneficial'}
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Details */}
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="w-full py-4 bg-ayur-green text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:bg-ayur-green-dark transition-all"
          >
            <span>{showDetails ? '▼ Hide' : '▶ View'} Therapy Details & Pathway</span>
          </button>

          {/* Therapy Recommendations */}
          {showDetails && (
            <div className="space-y-4">
              <h3 className="font-bold text-ayur-green text-lg">Recommended Therapies</h3>
              {result.therapies.map((therapy, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{therapy.icon}</span>
                      <div>
                        <h4 className="font-bold text-gray-900">{therapy.name}</h4>
                        <p className="text-xs text-gray-500 italic">{therapy.sanskrit}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getPriorityBadge(therapy.priority)}`}>
                      {getPriorityLabel(therapy.priority)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{therapy.description}</p>
                  <p className="text-xs text-ayur-green font-medium">Indications: {therapy.indication}</p>
                </div>
              ))}

              {/* Preparatory Steps */}
              <h3 className="font-bold text-ayur-green text-lg mt-6">Treatment Pathway</h3>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                <div className="space-y-4">
                  {result.preparatorySteps.map((s, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-ayur-green text-white flex items-center justify-center font-bold text-sm">
                          {s.step}
                        </div>
                        {idx < result.preparatorySteps.length - 1 && (
                          <div className="w-0.5 h-full bg-ayur-green/20 mt-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-gray-900">{s.title}</h4>
                          <span className="text-xs text-ayur-accent font-medium">{s.duration}</span>
                        </div>
                        <p className="text-sm text-gray-600">{s.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => { setStep(0); setAnswers({}); setResult(null); setShowDetails(false); setAnimatedScore(0); }}
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
        Based on Charaka Samhita, Sushruta Samhita, Ashtanga Hridayam • 10 Questions
      </div>
    </div>
  );
};

export default PanchakarmaTool;
