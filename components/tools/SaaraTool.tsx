import React, { useState, useEffect } from 'react';

interface DhatuQuestion {
  key: string;
  label: string;
  sanskrit: string;
}

interface DhatuData {
  name: string;
  sanskrit: string;
  icon: string;
  color: string;
  questions: DhatuQuestion[];
  description: string;
  excellent: string;
  moderate: string;
  poor: string;
}

const dhatuData: DhatuData[] = [
  {
    name: 'Skin',
    sanskrit: 'Twak Sara',
    icon: '✨',
    color: '#f59e0b',
    description: 'Twak (skin) reflects the quality of Rasa Dhatu. Clear, soft, glowing skin indicates excellent Rasa formation.',
    excellent: 'Soft, smooth, glowing, unblemished skin with natural lustre',
    moderate: 'Occasional dryness, minor blemishes, uneven tone',
    poor: 'Dry, rough, cracked, premature wrinkles, chronic skin issues'
  },
  {
    name: 'Plasma',
    sanskrit: 'Rasa Sara',
    icon: '💧',
    color: '#3b82f6',
    description: 'Rasa Dhatu is the first tissue formed from food essence. It nourishes all other Dhatus and governs hydration.',
    excellent: 'Well-hydrated, moist tissues, good circulation, calm mind',
    moderate: 'Occasional dryness, mild fatigue, slight dehydration',
    poor: 'Severe dryness, fatigue, palpitations, anxiety, dehydration'
  },
  {
    name: 'Blood',
    sanskrit: 'Rakta Sara',
    icon: '🩸',
    color: '#ef4444',
    description: 'Rakta Dhatu governs blood quality, liver function, and Pitta balance. Pure Rakta gives courage and vitality.',
    excellent: 'Good complexion, strong digestion, sharp intellect, courage',
    moderate: 'Occasional acidity, mild skin issues, moderate energy',
    poor: 'Anemia, chronic skin diseases, anger issues, liver disorders'
  },
  {
    name: 'Muscle',
    sanskrit: 'Mamsa Sara',
    icon: '💪',
    color: '#8b5cf6',
    description: 'Mamsa Dhatu provides physical strength and covers vital organs. Strong muscles indicate good nutrition.',
    excellent: 'Well-developed, firm muscles, strong, good endurance',
    moderate: 'Moderate muscle tone, some weakness, average strength',
    poor: 'Muscle wasting, weakness, poor stamina, frequent injuries'
  },
  {
    name: 'Fat',
    sanskrit: 'Meda Sara',
    icon: '⚖️',
    color: '#06b6d4',
    description: 'Meda Dhatu (adipose tissue) provides lubrication and energy reserve. Balanced Meda gives proper body contour.',
    excellent: 'Well-proportioned body, healthy weight, good energy reserve',
    moderate: 'Slight weight gain or loss, occasional fatigue',
    poor: 'Obesity or emaciation, excessive sweating, body odor'
  },
  {
    name: 'Bone',
    sanskrit: 'Asthi Sara',
    icon: '🦴',
    color: '#64748b',
    description: 'Asthi Dhatu provides structural support. Strong bones and teeth indicate excellent Asthi formation.',
    excellent: 'Strong bones, healthy teeth, good posture, large frame',
    moderate: 'Occasional joint pain, mild dental issues, average frame',
    poor: 'Osteoporosis, frequent fractures, dental problems, weak nails'
  },
  {
    name: 'Marrow',
    sanskrit: 'Majja Sara',
    icon: '🧠',
    color: '#a855f7',
    description: 'Majja Dhatu fills bones and governs nervous system. Healthy Majja gives mental clarity and strong nerves.',
    excellent: 'Sharp mind, strong nerves, good memory, unctuous eyes',
    moderate: 'Occasional brain fog, mild anxiety, average memory',
    poor: 'Neurological issues, severe anxiety, poor memory, tremors'
  },
  {
    name: 'Reproductive',
    sanskrit: 'Shukra Sara',
    icon: '🌟',
    color: '#ec4899',
    description: 'Shukra/Artava Dhatu is the essence of all 7 Dhatus. It governs fertility, vitality, and Ojas (immunity).',
    excellent: 'High vitality, strong immunity, healthy reproductive system',
    moderate: 'Moderate vitality, occasional reproductive issues',
    poor: 'Infertility, low immunity, sexual dysfunction, low Ojas'
  },
  {
    name: 'Mind',
    sanskrit: 'Satva Sara',
    icon: '🧘',
    color: '#10b981',
    description: 'Satva represents mental excellence. High Satva gives clarity, wisdom, compassion, and spiritual inclination.',
    excellent: 'Clear mind, wisdom, compassion, strong willpower, faith',
    moderate: 'Occasional confusion, moderate focus, average willpower',
    poor: 'Mental confusion, fear, anger, attachment, poor judgment'
  }
];

const getDhatuScore = (answers: Record<string, number>, dhatuKey: string): number => {
  const dhatu = dhatuData.find(d => d.name.toLowerCase() === dhatuKey.toLowerCase());
  if (!dhatu) return 0;
  
  let total = 0;
  let count = 0;
  dhatu.questions.forEach(q => {
    const key = `${dhatu.name}_${q.key}`;
    if (answers[key] !== undefined) {
      total += answers[key];
      count++;
    }
  });
  
  return count > 0 ? Math.round((total / (count * 2)) * 100) : 0;
};

const getOverallClassification = (overallScore: number): {classification: string; color: string; description: string} => {
  if (overallScore >= 80) {
    return {
      classification: 'Sara Deha (Excellent Constitution)',
      color: 'from-green-500 to-emerald-600',
      description: 'Per Charaka Samhita (Vimana Sthana 8), you possess Sara Deha - excellence of all tissues. Your Dhatus are well-formed, providing strong immunity (Ojas), longevity, and resistance to disease. You are an ideal candidate for Rasayana (rejuvenation) therapy.'
    };
  }
  if (overallScore >= 60) {
    return {
      classification: 'Madhyama Sara (Moderate Constitution)',
      color: 'from-amber-500 to-orange-500',
      description: 'Your tissue quality is moderate. Some Dhatus are strong while others need attention. According to Ashtanga Hridayam, this is the most common state. Targeted Rasayana therapy for weak Dhatus will improve your overall constitution.'
    };
  }
  if (overallScore >= 40) {
    return {
      classification: 'Asara Deha (Weak Constitution)',
      color: 'from-red-500 to-rose-600',
      description: 'Your assessment reveals Asara Deha - deficiency in multiple tissues. Per Charaka, this indicates poor Dhatu formation from childhood or chronic disease. Requires comprehensive Brimhana (nourishing) therapy and Rasayana treatment.'
    };
  }
  return {
    classification: 'Dhatu Kshaya (Severe Depletion)',
    color: 'from-red-700 to-red-900',
    description: 'Severe tissue depletion detected. Immediate medical attention required. According to Sushruta Samhita, this state requires gradual Dhatu building with milk, ghee, and specific Rasayana herbs under physician supervision.'
  };
};

const getRasayanaRecommendations = (weakestDhatu: string, overallScore: number): {title: string; description: string; herb: string; icon: string}[] => {
  const recs: {title: string; description: string; herb: string; icon: string}[] = [];

  if (weakestDhatu === 'Twak' || weakestDhatu === 'Rasa') {
    recs.push({
      title: 'Rasa Rasayana',
      description: 'Nourish Plasma and Skin tissues with Guduchi (Tinospora cordifolia). Take 1 tsp churna with warm water twice daily. Improves Rasa Dhatu quality and skin lustre.',
      herb: 'Guduchi (Giloy)',
      icon: '🌿'
    });
  }

  if (weakestDhatu === 'Rakta') {
    recs.push({
      title: 'Rakta Shodhana',
      description: 'Purify blood with Manjishtha (Rubia cordifolia) and Neem. Take Manjishtha Kwath 20ml twice daily. Clears Raktadushti and improves complexion.',
      herb: 'Manjishtha + Neem',
      icon: '🩸'
    });
  }

  if (weakestDhatu === 'Mamsa') {
    recs.push({
      title: 'Mamsa Brimhana',
      description: 'Build muscle tissue with Ashwagandha (Withania somnifera). Take 1 tsp with warm milk twice daily. Provides Bala (strength) and Mamsa Pusti.',
      herb: 'Ashwagandha',
      icon: '💪'
    });
  }

  if (weakestDhatu === 'Meda') {
    recs.push({
      title: 'Meda Samya',
      description: 'Balance adipose tissue with Triphala and Guggulu. Take Triphala Guggulu 2 tablets twice daily. Regulates Meda Dhatu and improves metabolism.',
      herb: 'Triphala Guggulu',
      icon: '⚖️'
    });
  }

  if (weakestDhatu === 'Asthi') {
    recs.push({
      title: 'Asthi Poshana',
      description: 'Nourish bone tissue with Laksha (Laccifer lacca) and Hadjod (Cissus quadrangularis). Take Hadjod churna 1 tsp with milk. Strengthens Asthi Dhatu.',
      herb: 'Hadjod + Laksha',
      icon: '🦴'
    });
  }

  if (weakestDhatu === 'Majja') {
    recs.push({
      title: 'Majja Rasayana',
      description: 'Nourish nervous system with Brahmi (Bacopa monnieri) and Shankhpushpi. Take Brahmi Ghrita 1 tsp twice daily. Improves Smriti (memory) and Medha (intelligence).',
      herb: 'Brahmi + Shankhpushpi',
      icon: '🧠'
    });
  }

  if (weakestDhatu === 'Shukra') {
    recs.push({
      title: 'Shukra Brimhana',
      description: 'Strengthen reproductive tissue with Shatavari (Asparagus racemosus) and Kapikacchu (Mucuna pruriens). Take Shatavari churna 1 tsp with milk.',
      herb: 'Shatavari + Kapikacchu',
      icon: '🌟'
    });
  }

  if (weakestDhatu === 'Satva') {
    recs.push({
      title: 'Sattvavajaya',
      description: 'Enhance mental excellence with Medhya Rasayana: Brahmi, Shankhpushpi, Jatamansi. Practice Dhyana (meditation) and Pranayama daily.',
      herb: 'Medhya Rasayana',
      icon: '🧘'
    });
  }

  recs.push({
    title: 'Chyawanprash',
    description: 'The premier Rasayana for all Dhatus. Take 2 tsp daily on empty stomach with warm milk. Contains 40+ herbs including Amalaki as the primary ingredient.',
    herb: 'Chyawanprash',
    icon: '🍯'
  });

  recs.push({
    title: 'Amalaki Rasayana',
    description: 'Per Charaka, Amalaki (Emblica officinalis) is the best Rasayana. Take 1 tsp churna with honey and ghee daily. Rejuvenates all Dhatus and enhances Ojas.',
    herb: 'Amalaki',
    icon: '🌱'
  });

  return recs;
};

interface Result {
  overallScore: number;
  dhatuScores: {name: string; sanskrit: string; icon: string; color: string; score: number}[];
  classification: string;
  color: string;
  description: string;
  weakestDhatu: string;
  strongestDhatu: string;
  rasayanaRecs: {title: string; description: string; herb: string; icon: string}[];
}

const SaaraTool: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [currentDhatuIndex, setCurrentDhatuIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  const currentDhatu = dhatuData[currentDhatuIndex];
  const progress = ((currentDhatuIndex + 1) / dhatuData.length) * 100;

  useEffect(() => {
    if (result && !isAnalyzing) {
      const timer = setTimeout(() => {
        let current = 0;
        const target = result.overallScore;
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

  const handleAnswer = (questionKey: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionKey]: value }));
  };

  const getCurrentDhatuAnswers = (): number => {
    let total = 0;
    let count = 0;
    currentDhatu.questions.forEach(q => {
      const key = `${currentDhatu.name}_${q.key}`;
      if (answers[key] !== undefined) {
        total += answers[key];
        count++;
      }
    });
    return count;
  };

  const handleNext = () => {
    if (getCurrentDhatuAnswers() < currentDhatu.questions.length) return;
    
    if (currentDhatuIndex < dhatuData.length - 1) {
      setCurrentDhatuIndex(currentDhatuIndex + 1);
    } else {
      calculateResult();
    }
  };

  const handlePrevious = () => {
    if (currentDhatuIndex > 0) {
      setCurrentDhatuIndex(currentDhatuIndex - 1);
    }
  };

  const calculateResult = () => {
    setIsAnalyzing(true);
    setResult(null);
    setShowDetails(false);
    
    setTimeout(() => {
      const dhatuScores = dhatuData.map(d => ({
        name: d.name,
        sanskrit: d.sanskrit,
        icon: d.icon,
        color: d.color,
        score: getDhatuScore(answers, d.name)
      }));

      const overallScore = Math.round(dhatuScores.reduce((sum, d) => sum + d.score, 0) / dhatuScores.length);
      
      let weakest = dhatuScores[0];
      let strongest = dhatuScores[0];
      dhatuScores.forEach(d => {
        if (d.score < weakest.score) weakest = d;
        if (d.score > strongest.score) strongest = d;
      });

      const classification = getOverallClassification(overallScore);
      const rasayanaRecs = getRasayanaRecommendations(weakest.name, overallScore);

      setResult({
        overallScore,
        dhatuScores,
        classification: classification.classification,
        color: classification.color,
        description: classification.description,
        weakestDhatu: weakest.name,
        strongestDhatu: strongest.name,
        rasayanaRecs
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const getAnswerValue = (questionKey: string): number | undefined => {
    return answers[questionKey];
  };

  if (isAnalyzing) {
    return (
      <div className="p-6 max-w-2xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 mb-6">
          <div className="absolute inset-0 border-4 border-ayur-green/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-ayur-green rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-0 border-4 border-transparent border-b-ayur-accent rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">🔬</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-ayur-green mb-2">Analyzing Tissue Excellence...</h3>
        <p className="text-gray-600 text-center max-w-xs">Evaluating all 9 Dhatus and generating your Saara Pariksha report.</p>
        
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
          {/* Overall Score Card */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
            <div className={`bg-gradient-to-r ${result.color} p-6 text-white text-center`}>
              <div className="text-5xl font-bold mb-1">{animatedScore}%</div>
              <div className="text-white/80 text-sm">Overall Tissue Excellence</div>
              <div className="mt-3 inline-block px-4 py-1.5 bg-white/20 rounded-full text-sm font-bold">
                {result.classification}
              </div>
            </div>
            <div className="p-5">
              <p className="text-gray-700 text-sm leading-relaxed">{result.description}</p>
            </div>
          </div>

          {/* Strongest & Weakest */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
              <div className="text-xs text-green-600 font-semibold uppercase mb-1">Strongest Dhatu</div>
              <div className="text-2xl mb-1">{result.dhatuScores.find(d => d.name === result.strongestDhatu)?.icon}</div>
              <div className="font-bold text-gray-900">{result.strongestDhatu}</div>
              <div className="text-lg font-bold text-green-600">{result.dhatuScores.find(d => d.name === result.strongestDhatu)?.score}%</div>
            </div>
            <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
              <div className="text-xs text-red-600 font-semibold uppercase mb-1">Weakest Dhatu</div>
              <div className="text-2xl mb-1">{result.dhatuScores.find(d => d.name === result.weakestDhatu)?.icon}</div>
              <div className="font-bold text-gray-900">{result.weakestDhatu}</div>
              <div className="text-lg font-bold text-red-600">{result.dhatuScores.find(d => d.name === result.weakestDhatu)?.score}%</div>
            </div>
          </div>

          {/* Dhatu Radar Bars */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h3 className="font-bold text-ayur-green mb-3">Dhatu Excellence Profile</h3>
            <div className="space-y-2">
              {result.dhatuScores.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-lg w-7 text-center">{d.icon}</span>
                  <span className="w-16 text-xs font-medium text-gray-600">{d.name}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${d.score}%`, backgroundColor: d.color }}
                    />
                  </div>
                  <span className="w-10 text-xs text-right font-medium">{d.score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Toggle Details */}
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="w-full py-4 bg-ayur-green text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:bg-ayur-green-dark transition-all"
          >
            <span>{showDetails ? '▼ Hide' : '▶ View'} Rasayana Recommendations</span>
          </button>

          {/* Rasayana Recommendations */}
          {showDetails && (
            <div className="space-y-3">
              <h3 className="font-bold text-ayur-green text-lg">Personalized Rasayana Therapy</h3>
              {result.rasayanaRecs.map((rec, idx) => (
                <div key={idx} className="bg-white rounded-xl border-2 border-gray-100 p-4 shadow-md">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-2xl">{rec.icon}</span>
                    <div>
                      <h4 className="font-bold text-gray-900">{rec.title}</h4>
                      <p className="text-xs text-ayur-accent font-medium">Recommended Herb: {rec.herb}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{rec.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => { setCurrentDhatuIndex(0); setAnswers({}); setResult(null); setShowDetails(false); setAnimatedScore(0); }}
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
          <span className="font-medium">{currentDhatu.sanskrit}</span>
          <span>{currentDhatuIndex + 1} / {dhatuData.length}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: currentDhatu.color }}
          />
        </div>
      </div>

      {/* Dhatu Card */}
      <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{currentDhatu.icon}</span>
          <div>
            <span className="text-ayur-accent text-xs font-semibold uppercase tracking-wider">Dhatu {currentDhatuIndex + 1}</span>
            <h2 className="font-serif text-xl font-bold text-ayur-green">{currentDhatu.name} Assessment</h2>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">{currentDhatu.description}</p>

        <div className="space-y-3">
          {currentDhatu.questions.map((q, i) => {
            const questionKey = `${currentDhatu.name}_${q.key}`;
            const selectedValue = getAnswerValue(questionKey);
            
            return (
              <div key={i} className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-800 mb-2">{q.label}</p>
                <div className="flex gap-2">
                  {[
                    { label: 'Agree', value: 2 },
                    { label: 'Neutral', value: 1 },
                    { label: 'Disagree', value: 0 }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(questionKey, opt.value)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        selectedValue === opt.value
                          ? 'bg-ayur-green text-white shadow-md'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-ayur-green/30'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dhatu Quality Guide */}
        <div className="mt-4 p-3 bg-ayur-cream rounded-xl">
          <div className="text-xs font-semibold text-ayur-green mb-2">Quality Indicators:</div>
          <div className="space-y-1 text-xs text-gray-600">
            <div><span className="text-green-600 font-medium">Excellent:</span> {currentDhatu.excellent}</div>
            <div><span className="text-amber-600 font-medium">Moderate:</span> {currentDhatu.moderate}</div>
            <div><span className="text-red-600 font-medium">Poor:</span> {currentDhatu.poor}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentDhatuIndex === 0}
          className={`px-5 py-2 rounded-full font-medium transition-all ${
            currentDhatuIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-ayur-green hover:bg-ayur-cream'
          }`}
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          disabled={getCurrentDhatuAnswers() < currentDhatu.questions.length}
          className={`px-6 py-2 rounded-full font-bold transition-all ${
            getCurrentDhatuAnswers() < currentDhatu.questions.length
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white hover:shadow-lg'
          }`}
        >
          {currentDhatuIndex === dhatuData.length - 1 ? 'Get Results →' : 'Next Dhatu →'}
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
        Based on Charaka Samhita Vimana Sthana 8 • 9 Dhatus Assessed
      </div>
    </div>
  );
};

export default SaaraTool;
