import React, { useState, useEffect } from 'react';

interface Question {
  id: number;
  category: string;
  sanskrit: string;
  text: string;
  icon: string;
  options: { label: string; value: number; dosha: string[] }[];
}

const questions: Question[] = [
  {
    id: 1,
    category: "Age & Constitution",
    sanskrit: "Vaya",
    text: "What is your age group?",
    icon: "🕐",
    options: [
      { label: "Below 25 years", value: 0, dosha: ["Kapha"] },
      { label: "25-40 years", value: 10, dosha: ["Vata", "Pitta"] },
      { label: "40-55 years", value: 20, dosha: ["Vata"] },
      { label: "55+ years", value: 30, dosha: ["Vata", "Ama"] }
    ]
  },
  {
    id: 2,
    category: "Body Composition",
    sanskrit: "Meda Dhatu",
    text: "How would you describe your body build?",
    icon: "⚖️",
    options: [
      { label: "Lean, thin, often cold", value: 15, dosha: ["Vata"] },
      { label: "Medium, muscular", value: 5, dosha: ["Pitta"] },
      { label: "Stocky, heavy, gains easily", value: 20, dosha: ["Kapha", "Meda"] },
      { label: "Variable, depends on season", value: 10, dosha: ["Vata", "Kapha"] }
    ]
  },
  {
    id: 3,
    category: "Digestive Fire",
    sanskrit: "Agni",
    text: "How would you rate your digestive strength?",
    icon: "🔥",
    options: [
      { label: "Strong - Digest heavy meals easily", value: 0, dosha: ["Agni"] },
      { label: "Moderate - Digest normal meals", value: 5, dosha: ["Sama Agni"] },
      { label: "Weak - Often feel heavy/indigestion", value: 15, dosha: ["Mandagni"] },
      { label: "Variable - Depends on food/season", value: 10, dosha: ["Vishama Agni"] }
    ]
  },
  {
    id: 4,
    category: "Elimination",
    sanskrit: "Kostha",
    text: "Describe your bowel movement pattern:",
    icon: "🌊",
    options: [
      { label: "Regular, formed, daily", value: 0, dosha: ["Sama"] },
      { label: "Sometimes constipated, sometimes loose", value: 10, dosha: ["Vata"] },
      { label: "Often loose, acidic", value: 15, dosha: ["Pitta", "Ama"] },
      { label: "Always constipated, dry", value: 20, dosha: ["Vata", "Kostha"] }
    ]
  },
  {
    id: 5,
    category: "Energy",
    sanskrit: "Ojas",
    text: "How would you describe your energy levels?",
    icon: "⚡",
    options: [
      { label: "High - Energetic all day", value: 0, dosha: ["Ojas"] },
      { label: "Good - Stable, occasional dips", value: 5, dosha: ["Prana"] },
      { label: "Low - Fatigue by afternoon", value: 15, dosha: ["Ojas", "Bala"] },
      { label: "Exhausted - Need naps often", value: 25, dosha: ["Dhatu", "Ojas"] }
    ]
  },
  {
    id: 6,
    category: "Sleep",
    sanskrit: "Nidra",
    text: "How is your sleep quality?",
    icon: "🌙",
    options: [
      { label: "Sound sleep, 7-8 hours", value: 0, dosha: ["Tamas", "Sattva"] },
      { label: "Light sleep, frequent waking", value: 10, dosha: ["Vata"] },
      { label: "Difficulty falling asleep", value: 15, dosha: ["Vata", "Manasika"] },
      { label: "Disturbed, frequent nightmares", value: 20, dosha: ["Tamas", "Ama"] }
    ]
  },
  {
    id: 7,
    category: "Mental Clarity",
    sanskrit: "Sattva",
    text: "How would you rate your mental clarity?",
    icon: "🧠",
    options: [
      { label: "Sharp, focused, clear", value: 0, dosha: ["Sattva"] },
      { label: "Occasional brain fog", value: 5, dosha: ["Tamas"] },
      { label: "Often confused, poor memory", value: 15, dosha: ["Ama", "Srotas"] },
      { label: "Difficulty concentrating", value: 20, dosha: ["Manasika", "Raja"] }
    ]
  },
  {
    id: 8,
    category: "Stress Response",
    sanskrit: "Manasika",
    text: "How do you typically handle stress?",
    icon: "🌀",
    options: [
      { label: "Calm, composed, adapt easily", value: 0, dosha: ["Sattva"] },
      { label: "Mild anxiety, manageable", value: 10, dosha: ["Raja"] },
      { label: "High anxiety, worry often", value: 15, dosha: ["Vata", "Raja"] },
      { label: "Overwhelmed, frequent burnout", value: 25, dosha: ["Tamas", "Ojas"] }
    ]
  },
  {
    id: 9,
    category: "Physical Activity",
    sanskrit: "Vyayama",
    text: "What describes your physical activity?",
    icon: "🏃",
    options: [
      { label: "Daily exercise, very active", value: 0, dosha: ["Kapha"] },
      { label: "Regular 3-4 times/week", value: 5, dosha: ["Balanced"] },
      { label: "Occasional, inconsistent", value: 15, dosha: ["Kapha", "Meda"] },
      { label: "Sedentary, minimal movement", value: 25, dosha: ["Meda", "Srotas"] }
    ]
  },
  {
    id: 10,
    category: "Dietary Pattern",
    sanskrit: "Ahara",
    text: "Which best describes your diet?",
    icon: "🍽️",
    options: [
      { label: "Balanced, home-cooked, regular", value: 0, dosha: ["Sattva"] },
      { label: "Mixed, some processed", value: 10, dosha: ["Ama"] },
      { label: "Irregular timing, heavy meals", value: 15, dosha: ["Agni", "Ama"] },
      { label: "Fast food, fried, late nights", value: 25, dosha: ["Ama", "Meda"] }
    ]
  },
  {
    id: 11,
    category: "Food Cravings",
    sanskrit: "Rasa",
    text: "What foods do you commonly crave?",
    icon: "🍭",
    options: [
      { label: "No strong cravings", value: 0, dosha: ["Balanced"] },
      { label: "Sweet, salty (comfort food)", value: 10, dosha: ["Kapha", "Tamas"] },
      { label: "Spicy, sour, fermented", value: 15, dosha: ["Pitta", "Ama"] },
      { label: "Cold, raw, ice drinks", value: 20, dosha: ["Vata", "Ama"] }
    ]
  },
  {
    id: 12,
    category: "Skin Health",
    sanskrit: "Twak",
    text: "How would you describe your skin?",
    icon: "✨",
    options: [
      { label: "Clear, glowing, soft", value: 0, dosha: ["Rasa", "Rakta"] },
      { label: "Occasional issues, oily T-zone", value: 10, dosha: ["Kapha"] },
      { label: "Acne-prone, inflammation", value: 15, dosha: ["Pitta", "Ama"] },
      { label: "Dry, itchy, premature aging", value: 20, dosha: ["Vata", "Rasa"] }
    ]
  },
  {
    id: 13,
    category: "Temperature",
    sanskrit: "Ushma",
    text: "How do you react to heat?",
    icon: "🌡️",
    options: [
      { label: "Comfortable in most temperatures", value: 0, dosha: ["Balanced"] },
      { label: "Feel cold easily, prefer warmth", value: 15, dosha: ["Vata"] },
      { label: "Feel hot easily, sweat a lot", value: 15, dosha: ["Pitta"] },
      { label: "Variable - depends on season", value: 10, dosha: ["Vata", "Kapha"] }
    ]
  },
  {
    id: 14,
    category: "Seasonal Adaptation",
    sanskrit: "Ritu",
    text: "How do you adapt to seasonal changes?",
    icon: "🍂",
    options: [
      { label: "Smooth adaptation", value: 0, dosha: ["Balanced"] },
      { label: "Mild issues, recover quickly", value: 10, dosha: ["Prana"] },
      { label: "Frequent imbalances per season", value: 20, dosha: ["Vata", "Ama"] },
      { label: "Significant distress each season", value: 25, dosha: ["Dhatu", "Ojas"] }
    ]
  },
  {
    id: 15,
    category: "Daily Routine",
    sanskrit: "Dinacharya",
    text: "How consistent is your daily routine?",
    icon: "📅",
    options: [
      { label: "Very consistent (sleep/wake/eat)", value: 0, dosha: ["Sattva"] },
      { label: "Mostly consistent", value: 5, dosha: ["Sattva"] },
      { label: "Irregular, depends on mood/work", value: 15, dosha: ["Vata", "Raja"] },
      { label: "No routine, chaotic schedule", value: 25, dosha: ["Vata", "Tamas"] }
    ]
  }
];

interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

interface AnalysisResult {
  score: number;
  maxScore: number;
  riskLevel: string;
  doshaProfile: { vata: number; pitta: number; kapha: number };
  dominantDosha: string;
  recommendations: Recommendation[];
  summary: string;
}

// Generate recommendations based on score and dosha
const generateRecommendations = (score: number, doshaProfile: { vata: number; pitta: number; kapha: number }, answers: Record<number, number>): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  // Based on risk level
  if (score >= 90) {
    recommendations.push({
      title: "Consult Ayurvedic Doctor",
      description: "Your score indicates high risk. Book appointment at +91 94266 84047 for personalized assessment.",
      priority: 'high',
      icon: "👨‍⚕️"
    });
    recommendations.push({
      title: "Consider Panchakarma",
      description: "You may benefit from supervised detoxification. Vamana/Virechana therapy recommended.",
      priority: 'high',
      icon: "🧘"
    });
  } else if (score >= 40) {
    recommendations.push({
      title: "Lifestyle Modification",
      description: "Start with dietary adjustments and daily routine (Dinacharya) to prevent progression.",
      priority: 'high',
      icon: "📋"
    });
  }
  
  // Based on dominant dosha
  if (doshaProfile.vata > 40) {
    recommendations.push({
      title: "Balance Vata (Motion)",
      description: "Favor warm, moist, oily foods. Maintain consistent routine. Practice Abhyanga daily.",
      priority: doshaProfile.vata > 60 ? 'high' : 'medium',
      icon: "🫁"
    });
  }
  
  if (doshaProfile.pitta > 40) {
    recommendations.push({
      title: "Balance Pitta (Heat)",
      description: "Avoid spicy/fried foods. Cool your body with coconut water, ghee, and meditation.",
      priority: doshaProfile.pitta > 60 ? 'high' : 'medium',
      icon: "❄️"
    });
  }
  
  if (doshaProfile.kapha > 40) {
    recommendations.push({
      title: "Balance Kapha (Structure)",
      description: "Light, dry, warm foods. Regular exercise (30 min daily). Avoid daytime sleeping.",
      priority: doshaProfile.kapha > 60 ? 'high' : 'medium',
      icon: "🏃"
    });
  }
  
  // Based on specific answers
  if ((answers[3] || 0) >= 15) {
    recommendations.push({
      title: "Improve Digestion (Agni)",
      description: "Take ginger tea before meals. Avoid overeating. Eat your largest meal at midday.",
      priority: 'medium',
      icon: "🍵"
    });
  }
  
  if ((answers[6] || 0) >= 10) {
    recommendations.push({
      title: "Mental Clarity",
      description: "Practice Nasya (oil in nose). Avoid screen time after 8 PM. Try yoga Nidra.",
      priority: 'medium',
      icon: "🧘"
    });
  }
  
  if ((answers[9] || 0) >= 15) {
    recommendations.push({
      title: "Dietary Correction",
      description: "Reduce processed foods. Add warm cooked meals. Stop eating 3 hours before sleep.",
      priority: 'medium',
      icon: "🥗"
    });
  }
  
  if ((answers[14] || 0) >= 15) {
    recommendations.push({
      title: "Establish Routine",
      description: "Wake up before 6 AM. Sleep by 10 PM. Eat meals at fixed times daily.",
      priority: 'medium',
      icon: "⏰"
    });
  }
  
  // General recommendations for all
  recommendations.push({
    title: "Daily Abhyanga",
    description: "Self-massage with warm sesame oil for 5-10 minutes before bathing.",
    priority: 'low',
    icon: "🛁"
  });
  
  recommendations.push({
    title: "Seasonal Detox",
    description: "Consider Virechana (therapeutic purgation) during spring (Vasanta Ritu).",
    priority: 'low',
    icon: "🌸"
  });
  
  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return recommendations.slice(0, 12); // Max 12 recommendations
};

const LifestyleTool: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

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
    
    // Simulate loading for AI effect
    setTimeout(() => {
      const score = Object.values(answers).reduce((a, b) => a + b, 0);
      const maxScore = 375;
      
      // Calculate dosha profile
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

      // Determine dominant dosha
      let dominantDosha = "Balanced";
      if (doshaProfile.vata > doshaProfile.pitta && doshaProfile.vata > doshaProfile.kapha) {
        dominantDosha = "Vata Dominant";
      } else if (doshaProfile.pitta > doshaProfile.vata && doshaProfile.pitta > doshaProfile.kapha) {
        dominantDosha = "Pitta Dominant";
      } else if (doshaProfile.kapha > doshaProfile.vata && doshaProfile.kapha > doshaProfile.pitta) {
        dominantDosha = "Kapha Dominant";
      }

      let riskLevel = "Low Risk";
      if (score >= 90) riskLevel = "High Risk";
      else if (score >= 40) riskLevel = "Moderate Risk";

      const recommendations = generateRecommendations(score, doshaProfile, answers);

      let summary = "";
      if (score < 40) {
        summary = "Your lifestyle shows good balance. Continue your current practices and focus on preventive care through Swasthavritta.";
      } else if (score < 90) {
        summary = "You show signs of early imbalance. Early intervention through diet and lifestyle modifications can restore balance.";
      } else {
        summary = "Your assessment indicates significant imbalance. Professional consultation recommended for personalized treatment.";
      }

      setResult({
        score,
        maxScore,
        riskLevel,
        doshaProfile,
        dominantDosha,
        recommendations,
        summary
      });
      setIsAnalyzing(false);
    }, 2000); // 2 second "AI processing" simulation
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

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'bg-red-100 text-red-700 border-red-200';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  // Results View
  if (result) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-ayur-green font-semibold mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
          </svg>
          Back to Tools
        </button>

        {isAnalyzing ? (
          <div className="text-center py-16">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-ayur-green/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-ayur-green rounded-full animate-spin"></div>
              <span className="absolute inset-0 flex items-center justify-center text-3xl">🧠</span>
            </div>
            <h3 className="text-xl font-bold text-ayur-green mb-2">Analyzing Your Profile...</h3>
            <p className="text-gray-600">Generating personalized Ayurvedic recommendations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Score Card */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
              <div className={`bg-gradient-to-r ${getRiskGradient()} p-6 text-white text-center`}>
                <div className="text-5xl font-bold mb-1">{result.score}</div>
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
              <h3 className="font-bold text-ayur-green mb-3">Your Doshic Profile</h3>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{width: `${result.doshaProfile.vata}%`}} />
                </div>
                <span className="text-sm font-medium w-16">Vata {result.doshaProfile.vata}%</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{width: `${result.doshaProfile.pitta}%`}} />
                </div>
                <span className="text-sm font-medium w-16">Pitta {result.doshaProfile.pitta}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{width: `${result.doshaProfile.kapha}%`}} />
                </div>
                <span className="text-sm font-medium w-16">Kapha {result.doshaProfile.kapha}%</span>
              </div>
              <p className="text-center text-sm text-gray-500 mt-3">{result.dominantDosha}</p>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-ayur-cream to-white rounded-2xl p-4 border border-ayur-subtle">
              <h3 className="font-bold text-ayur-green mb-2">Summary</h3>
              <p className="text-gray-700 text-sm">{result.summary}</p>
            </div>

            {/* Recommendations Toggle */}
            <button 
              onClick={() => setShowReport(!showReport)}
              className="w-full py-3 bg-ayur-green text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <span>{showReport ? 'Hide' : 'View'} Actionable Recommendations</span>
              <svg className={`transition-transform ${showReport ? 'rotate-180' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>

            {/* Recommendations List */}
            {showReport && (
              <div className="space-y-3">
                {result.recommendations.map((rec, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl border-2 ${getPriorityColor(rec.priority)}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{rec.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-1">{rec.title}</h4>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => { setStep(0); setAnswers({}); setResult(null); setShowReport(false); }}
                className="flex-1 py-3 bg-ayur-cream text-ayur-green font-bold rounded-xl"
              >
                Retake
              </button>
              <button 
                onClick={onBack}
                className="flex-1 py-3 bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white font-bold rounded-xl"
              >
                More Tools
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Question View
  return (
    <div className="p-4 max-w-lg mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-ayur-green font-semibold mb-4">
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
        Based on IDRS + Ayurvedic Parameters • 15 Questions
      </div>
    </div>
  );
};

export default LifestyleTool;