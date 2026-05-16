import React, { useState, useEffect, useRef } from 'react';
import { aiService } from '../../lib/aiService';

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

interface AnalysisResult {
  score: number;
  riskLevel: string;
  doshaProfile: { vata: number; pitta: number; kapha: number };
  aiReport: string;
}

const LifestyleTool: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetailedResult, setShowDetailedResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${progress}%`;
    }
  }, [progress]);

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

  const calculateResult = async () => {
    setIsAnalyzing(true);
    
    const score = Object.values(answers).reduce((a, b) => a + b, 0);
    
    // Calculate dosha profile based on answers
    let vataScore = 0, pittaScore = 0, kaphaScore = 0;
    questions.forEach(q => {
      const answerValue = answers[q.id];
      if (answerValue !== undefined) {
        const selectedOption = q.options.find(opt => opt.value === answerValue);
        if (selectedOption) {
          selectedOption.dosha.forEach(d => {
            if (d === 'Vata' || d === 'Vata,') vataScore += answerValue;
            if (d === 'Pitta' || d === 'Pitta,') pittaScore += answerValue;
            if (d === 'Kapha' || d === 'Kapha,') kaphaScore += answerValue;
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

    let riskLevel = "Low Risk";
    if (score >= 40) riskLevel = "Moderate Risk";
    if (score >= 90) riskLevel = "High Risk";

    // Generate AI-powered personalized report
    let aiReport = "";
    try {
      const prompt = `You are a senior Ayurvedic doctor. Based on this patient assessment, provide a comprehensive analysis:

SCORE: ${score}/375 (Risk Level: ${riskLevel})
DOSHA PROFILE: Vata ${doshaProfile.vata}%, Pitta ${doshaProfile.pitta}%, Kapha ${doshaProfile.kapha}%

ANSWERS SUMMARY:
${questions.map(q => `${q.sanskrit} (${q.category}): ${q.options.find(o => o.value === answers[q.id])?.label || 'Not answered'}`).join('\n')}

Provide a detailed report with these sections (10-15 points):
1. DIAGNOSIS (Nidan) - Root cause based on Ayurvedic principles
2. DOSHA IMBALANCE - Which doshas are disturbed and why
3. DHATU AFFECTED - Which body tissues are impacted
4. SROTAS BLOCKED - Which channels are affected
5. DIETARY RECOMMENDATIONS (Ahara) - Specific foods to favor/avoid
6. LIFESTYLE CHANGES (Vihara) - Daily routine modifications
7. HERBAL SUPPORT - Specific herbs/formulations recommended
8. DETOX NEEDED - Whether Panchakarma is indicated
9. SEASONAL CARE - Current Ritu considerations
10. WARNING SIGNS - What symptoms need immediate attention
11. TREATMENT PRIORITY - Urgent/Moderate/Maintenance
12. NEXT STEPS - Immediate actions to take

Use Sanskrit terms where appropriate. Be specific and practical.`;

      aiReport = await aiService.generate(prompt, "You are an Ayurvedic expert providing detailed health analysis.", { max_tokens: 2048 });
    } catch (error) {
      console.error("AI analysis failed:", error);
      aiReport = generateFallbackReport(score, riskLevel, doshaProfile);
    }

    setResult({ score, riskLevel, doshaProfile, aiReport });
    setIsAnalyzing(false);
  };

  const generateFallbackReport = (score: number, riskLevel: string, doshaProfile: any): string => {
    return `
## Your Ayurvedic Assessment Report

### 1. DIAGNOSIS (Nidan)
Based on your score of ${score}, you show signs of ${riskLevel === 'High Risk' ? 'significant Ama (toxin) accumulation and Srotorodha (channel blockage)' : riskLevel === 'Moderate Risk' ? 'moderate Agni mandya (weak digestion) and early Ama formation' : 'balanced state with good Swasthavritta (wellness practices)'}.

### 2. DOSHA IMBALANCE
Your dominant imbalance appears to be:
${doshaProfile.vata > 40 ? '- Vata: Motion, dryness, anxiety patterns detected' : ''}
${doshaProfile.pitta > 40 ? '- Pitta: Heat, inflammation, sharpness patterns detected' : ''}
${doshaProfile.kapha > 40 ? '- Kapha: Heaviness, congestion, lethargy patterns detected' : ''}

### 3-12. RECOMMENDATIONS
Please consult our Ayurvedic physicians for personalized treatment protocol based on your assessment.`;
  };

  const getScoreColor = () => {
    if (!result) return 'text-ayur-green';
    if (result.riskLevel === 'Low Risk') return 'text-green-600';
    if (result.riskLevel === 'Moderate Risk') return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = () => {
    if (!result) return 'from-green-500 to-emerald-600';
    if (result.riskLevel === 'Low Risk') return 'from-green-500 to-emerald-600';
    if (result.riskLevel === 'Moderate Risk') return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-600';
  };

  // Results View
  if (result) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-ayur-green font-semibold mb-6">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
          </svg>
          Back to Tools
        </button>

        {isAnalyzing ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-ayur-green border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-ayur-green mb-2">Analyzing Your Profile...</h3>
            <p className="text-gray-600">Generating personalized Ayurvedic recommendations</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
              <div className={`bg-gradient-to-r ${getScoreGradient()} p-8 text-white text-center`}>
                <div className="text-6xl font-bold mb-2">{result.score}</div>
                <div className="text-xl font-semibold">out of 375</div>
              </div>
              <div className="p-6 text-center">
                <span className={`inline-block px-6 py-3 rounded-full font-bold text-lg ${getScoreColor()} bg-gray-50`}>
                  {result.riskLevel}
                </span>
              </div>
            </div>

            {/* Dosha Profile */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-ayur-green mb-4">Your Doshic Profile</h3>
              <div className="space-y-3">
                {[
                  { name: 'Vata', value: result.doshaProfile.vata, color: 'bg-yellow-500' },
                  { name: 'Pitta', value: result.doshaProfile.pitta, color: 'bg-red-500' },
                  { name: 'Kapha', value: result.doshaProfile.kapha, color: 'bg-blue-500' }
                ].map(d => (
                  <div key={d.name} className="flex items-center gap-3">
                    <span className="w-16 font-medium">{d.name}</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${d.color} rounded-full transition-all`} style={{ width: `${d.value}%` }} />
                    </div>
                    <span className="w-12 text-right">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Report Toggle */}
            <div className="bg-gradient-to-r from-ayur-cream to-white rounded-2xl p-6 border border-ayur-subtle">
              <h3 className="font-bold text-ayur-green mb-4 flex items-center gap-2">
                <span>🧠</span> AI-Powered Detailed Analysis
              </h3>
              {!showDetailedResult ? (
                <button 
                  onClick={() => setShowDetailedResult(true)}
                  className="w-full py-3 bg-ayur-green text-white rounded-xl font-bold hover:bg-ayur-green-dark transition-all"
                >
                  View Complete Report
                </button>
              ) : (
                <div className="prose prose-ayur max-w-none">
                  {result.aiReport.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) {
                      return <h4 key={i} className="text-lg font-bold text-ayur-green mt-4 mb-2">{line.replace('## ', '')}</h4>;
                    }
                    if (line.startsWith('### ')) {
                      return <h5 key={i} className="text-md font-semibold text-ayur-accent mt-3 mb-1">{line.replace('### ', '')}</h5>;
                    }
                    if (line.trim()) {
                      return <p key={i} className="text-gray-700 mb-2">{line}</p>;
                    }
                    return null;
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button 
                onClick={() => { setStep(0); setAnswers({}); setResult(null); setShowDetailedResult(false); }}
                className="flex-1 py-4 bg-ayur-cream text-ayur-green font-bold rounded-2xl"
              >
                Retake Assessment
              </button>
              <button 
                onClick={onBack}
                className="flex-1 py-4 bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white font-bold rounded-2xl"
              >
                Explore More Tools
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Question View
  return (
    <div className="p-6 max-w-xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-ayur-green font-semibold mb-6">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
        </svg>
        Exit
      </button>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span className="font-medium">{currentQuestion.category}</span>
          <span>{step + 1} / {questions.length}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            ref={progressRef}
            className="h-full bg-gradient-to-r from-ayur-green to-ayur-accent rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-10' : 'opacity-100'}`}>
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{currentQuestion.icon}</span>
            <div>
              <span className="text-ayur-accent text-xs font-semibold uppercase tracking-wider">{currentQuestion.sanskrit}</span>
            </div>
          </div>
          
          <h2 className="font-serif text-2xl font-bold text-ayur-green mb-6">{currentQuestion.text}</h2>

          <div className="space-y-3">
            {currentQuestion.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(opt.value)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-[1.01] ${
                  selectedOption === opt.value
                    ? 'border-ayur-green bg-ayur-green/5 shadow-md'
                    : 'border-gray-100 hover:border-ayur-green/30 hover:bg-ayur-cream/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedOption === opt.value
                      ? 'border-ayur-green bg-ayur-green'
                      : 'border-gray-300'
                  }`}>
                    {selectedOption === opt.value && (
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 12l5 5L20 7"/>
                      </svg>
                    )}
                  </div>
                  <span className={`font-medium ${selectedOption === opt.value ? 'text-ayur-green' : 'text-gray-700'}`}>
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
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              step === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-ayur-green hover:bg-ayur-cream'
            }`}
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            disabled={selectedOption === null}
            className={`px-8 py-3 rounded-full font-bold transition-all ${
              selectedOption === null
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white hover:shadow-lg hover:shadow-ayur-green/30 hover:scale-105'
            }`}
          >
            {step === questions.length - 1 ? 'Analyze Results →' : 'Next →'}
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
        Based on IDRS + Ayurvedic Lifestyle Parameters
      </div>
    </div>
  );
};

export default LifestyleTool;