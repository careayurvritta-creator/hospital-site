import React, { useState, useEffect } from 'react';

interface Symptoms {
  excessiveHunger: number;
  excessiveThirst: number;
  heaviness: number;
  sweating: number;
  badOdor: number;
  fatigue: number;
  flabbiness: number;
  breathlessness: number;
}

const getMedaClassification = (bmi: number, whr: number, symptomScore: number): {classification: string; color: string; description: string; risk: string} => {
  let classification = 'Samyak Meda (Normal)';
  let color = 'from-green-500 to-emerald-600';
  let description = 'Your Meda Dhatu is in balance. According to Charaka Samhita, this indicates proper formation of adipose tissue from the essence of food (Ahara Rasa). Maintain your current lifestyle.';
  let risk = 'Low Risk';

  if (bmi >= 30 || (symptomScore >= 20 && bmi >= 25)) {
    classification = 'Sthaulya (Obesity)';
    color = 'from-red-500 to-rose-600';
    description = 'Per Charaka Samhita (Sutrasthana 21), you exhibit signs of Sthaulya (obesity). Excessive Meda Dhatu has accumulated in abdomen, buttocks, and breasts. This blocks Srotas (channels) and aggravates Vata. Immediate intervention required.';
    risk = 'High Risk';
  } else if (bmi >= 25 || symptomScore >= 15) {
    classification = 'Meda Vriddhi (Excess Adipose)';
    color = 'from-amber-500 to-orange-500';
    description = 'Your assessment shows Meda Vriddhi (increased adipose tissue). According to Ashtanga Hridayam, this is the stage before full obesity. Eight signs of Meda Vriddhi may be present: excessive hunger, thirst, sweating, heaviness, fatigue, flabbiness, bad body odor, and breathlessness.';
    risk = 'Moderate Risk';
  } else if (bmi < 18.5) {
    classification = 'Meda Kshaya (Deficient Adipose)';
    color = 'from-blue-500 to-cyan-600';
    description = 'Your Meda Dhatu is deficient. Per Charaka, this leads to emaciation, weakness, and reduced Ojas. Requires Brimhana (nourishing) therapy with Ghrita (ghee), milk, and meat soups.';
    risk = 'Moderate Risk';
  }

  if (whr > 0.9) {
    risk = 'High Risk';
    description += ' Your Waist-Hip Ratio indicates central (visceral) obesity, which Charaka describes as "Udara Pradesha Meda" - abdominal fat accumulation. This is the most dangerous type as it blocks vital Srotas.';
  }

  return { classification, color, description, risk };
};

const getRecommendations = (bmi: number, whr: number, symptomScore: number, classification: string): {priority: string; title: string; description: string; category: string; icon: string}[] => {
  const recs: {priority: string; title: string; description: string; category: string; icon: string}[] = [];

  if (bmi >= 25) {
    recs.push({
      priority: 'high',
      title: 'Udvartana (Dry Powder Massage)',
      description: 'Per Charaka Samhita, daily Udvartana with Triphala, Haridra, or Musta churna is the primary treatment for Meda Vriddhi. Massage in upward direction for 15 minutes before bath. This is Lekhana (scraping) therapy that reduces adipose tissue.',
      category: 'Treatment',
      icon: '🫙'
    });
    recs.push({
      priority: 'high',
      title: 'Lekhana Basti (Medicated Enema)',
      description: 'For stubborn Meda accumulation, Lekhana Basti with honey, rock salt, and Triphala decoction is indicated. This directly targets Meda Dhatu through the colon, the seat of Kapha.',
      category: 'Treatment',
      icon: '🌿'
    });
    recs.push({
      priority: 'medium',
      title: 'Vyayama (Exercise Prescription)',
      description: 'Charaka emphasizes daily Vyayama for Meda reduction. Start with 30 minutes of brisk walking, gradually increase to Surya Namaskar. Exercise to half your capacity (Ardha Shakti) - when sweating begins on forehead and back.',
      category: 'Lifestyle',
      icon: '🏃'
    });
  }

  if (bmi >= 30) {
    recs.push({
      priority: 'high',
      title: 'Vamana (Therapeutic Emesis)',
      description: 'For Sthaulya (obesity), Vamana is the first-line Panchakarma therapy. Performed in spring (Vasanta) when Kapha naturally rises. Uses Madanaphala or Yashtimadhu. Removes excess Kapha and Meda from upper GI tract.',
      category: 'Treatment',
      icon: '🫧'
    });
  }

  if (whr > 0.9) {
    recs.push({
      priority: 'high',
      title: 'Abdominal Fat Reduction Protocol',
      description: 'Central obesity (Udara Meda) requires specific intervention: Udvartana on abdomen, Agni Deepana herbs (Trikatu, Chitrak), and avoidance of daytime sleep (Divasvapna) which Charaka identifies as a primary cause.',
      category: 'Treatment',
      icon: '⚡'
    });
  }

  if (bmi < 18.5) {
    recs.push({
      priority: 'high',
      title: 'Brimhana Therapy (Nourishing)',
      description: 'For Meda Kshaya: Increase Ghrita (ghee), milk, rice, sugar, and meat soups. Take Ashwagandha and Shatavari Rasayana. Avoid excessive exercise and fasting.',
      category: 'Treatment',
      icon: '🥛'
    });
  }

  recs.push({
    priority: 'medium',
    title: 'Ahara Correction - Meda Diet',
    description: bmi >= 25 
      ? 'Per Ashtanga Hridayam: Favor Yava (barley), Godhuma (wheat), Mudga (green gram), honey (not heated). Avoid: Guru (heavy), Snigdha (oily), sweet foods. Eat only when hungry. No snacking.'
      : 'Favor Ghrita (ghee), milk, rice, dates, almonds. Take warm, nourishing foods. Avoid dry, light, cold foods that further deplete Meda.',
    category: 'Diet',
    icon: '🍽️'
  });

  recs.push({
    priority: 'medium',
    title: 'Agni Deepana (Digestive Fire)',
    description: 'Take Trikatu Churna (ginger, black pepper, long pepper) 1 tsp with honey before meals. This kindles Agni and prevents Ama formation, which is the root of Meda Vriddhi.',
    category: 'Treatment',
    icon: '🔥'
  });

  if (symptomScore >= 10) {
    recs.push({
      priority: 'medium',
      title: 'Triphala for Meda Shodhana',
      description: 'Take Triphala Churna 1 tsp with warm water at bedtime. Triphala (Amalaki, Bibhitaki, Haritaki) is a tridoshic rasayana that gently cleanses Meda Dhatu and improves metabolism.',
      category: 'Treatment',
      icon: '🌱'
    });
  }

  recs.push({
    priority: 'low',
    title: 'Avoid Divasvapna (Day Sleep)',
    description: 'Charaka Samhita identifies daytime sleep as a primary cause of Meda Vriddhi. It aggravates Kapha and blocks Srotas. If you must rest, lie on your left side for 15 minutes only.',
    category: 'Lifestyle',
    icon: '☀️'
  });

  recs.push({
    priority: 'low',
    title: 'Honey & Warm Water Protocol',
    description: 'Per classical texts, take 1 tsp old honey (not heated) mixed with warm water every morning on empty stomach. This is a powerful Lekhana (scraping) agent for Meda reduction.',
    category: 'Diet',
    icon: '🍯'
  });

  return recs.sort((a, b) => {
    const order = {high: 0, medium: 1, low: 2};
    return order[a.priority as keyof typeof order] - order[b.priority as keyof typeof order];
  }).slice(0, 12);
};

const getBMIGaugePosition = (bmi: number): {percent: number; zone: string; color: string} => {
  if (bmi < 18.5) return { percent: 15, zone: 'Underweight', color: 'text-blue-500' };
  if (bmi < 25) return { percent: 40, zone: 'Normal', color: 'text-green-500' };
  if (bmi < 30) return { percent: 65, zone: 'Overweight', color: 'text-amber-500' };
  if (bmi < 35) return { percent: 80, zone: 'Obese Class I', color: 'text-orange-500' };
  return { percent: 95, zone: 'Obese Class II+', color: 'text-red-500' };
};

const getWHRClassification = (whr: number, gender: string): {status: string; risk: string; description: string} => {
  const isMale = gender === 'male';
  if ((isMale && whr < 0.9) || (!isMale && whr < 0.85)) {
    return { status: 'Low Risk', risk: 'low', description: 'Healthy fat distribution. No central obesity.' };
  }
  if ((isMale && whr < 1.0) || (!isMale && whr < 0.9)) {
    return { status: 'Moderate Risk', risk: 'moderate', description: 'Moderate central obesity. Increased metabolic risk.' };
  }
  return { status: 'High Risk', risk: 'high', description: 'Central (visceral) obesity. High risk for metabolic disorders.' };
};

interface Result {
  bmi: number;
  whr: number;
  symptomScore: number;
  maxSymptomScore: number;
  classification: string;
  color: string;
  description: string;
  risk: string;
  bmiGauge: {percent: number; zone: string; color: string};
  whrClassification: {status: string; risk: string; description: string};
  recommendations: {priority: string; title: string; description: string; category: string; icon: string}[];
}

const MedaTool: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [mode, setMode] = useState<'input' | 'symptoms' | 'analyzing' | 'result'>('input');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [symptoms, setSymptoms] = useState<Symptoms>({
    excessiveHunger: 0, excessiveThirst: 0, heaviness: 0, sweating: 0,
    badOdor: 0, fatigue: 0, flabbiness: 0, breathlessness: 0
  });
  const [result, setResult] = useState<Result | null>(null);
  const [animatedBMI, setAnimatedBMI] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const symptomQuestions: {key: keyof Symptoms; label: string; sanskrit: string}[] = [
    { key: 'excessiveHunger', label: 'Excessive hunger or appetite', sanskrit: 'Ati Kshudha' },
    { key: 'excessiveThirst', label: 'Excessive thirst', sanskrit: 'Ati Trishna' },
    { key: 'heaviness', label: 'Feeling of heaviness in body', sanskrit: 'Gaurava' },
    { key: 'sweating', label: 'Excessive sweating', sanskrit: 'Ati Sweda' },
    { key: 'badOdor', label: 'Foul body odor', sanskrit: 'Durgandha' },
    { key: 'fatigue', label: 'Chronic fatigue or lethargy', sanskrit: 'Shrama' },
    { key: 'flabbiness', label: 'Flabby abdomen, buttocks, or breasts', sanskrit: 'Sthula Udara' },
    { key: 'breathlessness', label: 'Breathlessness on exertion', sanskrit: 'Shvasa' }
  ];

  useEffect(() => {
    if (result && mode === 'result') {
      const timer = setTimeout(() => {
        let current = 0;
        const target = result.bmi;
        const duration = 1500;
        const steps = 60;
        const increment = target / steps;
        const animation = setInterval(() => {
          current += increment;
          if (current >= target) {
            setAnimatedBMI(parseFloat(target.toFixed(1)));
            clearInterval(animation);
          } else {
            setAnimatedBMI(parseFloat(current.toFixed(1)));
          }
        }, duration / steps);
        return () => clearInterval(animation);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [result, mode]);

  const handleCalculateMetrics = () => {
    if (!height || !weight) return;
    setMode('symptoms');
  };

  const handleSymptomToggle = (key: keyof Symptoms) => {
    setSymptoms(prev => ({ ...prev, [key]: prev[key] === 0 ? 1 : 0 }));
  };

  const handleAnalyze = () => {
    setMode('analyzing');
    
    setTimeout(() => {
      const heightM = parseFloat(height) / 100;
      const bmi = parseFloat(weight) / (heightM * heightM);
      const whrVal = waist && hip ? parseFloat(waist) / parseFloat(hip) : 0;
      const symptomScore = (Object.values(symptoms) as number[]).reduce((a, b) => a + b, 0);
      
      const medaClass = getMedaClassification(bmi, whrVal, symptomScore);
      const bmiGauge = getBMIGaugePosition(bmi);
      const whrClass = whrVal > 0 ? getWHRClassification(whrVal, gender) : { status: 'N/A', risk: 'low', description: 'Waist and hip measurements not provided.' };
      const recommendations = getRecommendations(bmi, whrVal, symptomScore, medaClass.classification);
      
      setResult({
        bmi: parseFloat(bmi.toFixed(1)),
        whr: parseFloat(whrVal.toFixed(2)),
        symptomScore,
        maxSymptomScore: 8,
        classification: medaClass.classification,
        color: medaClass.color,
        description: medaClass.description,
        risk: medaClass.risk,
        bmiGauge,
        whrClassification: whrClass,
        recommendations
      });
      setMode('result');
    }, 1800);
  };

  if (mode === 'analyzing') {
    return (
      <div className="p-6 max-w-2xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 mb-6">
          <div className="absolute inset-0 border-4 border-ayur-green/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-ayur-green rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-0 border-4 border-transparent border-b-ayur-accent rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">⚖️</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-ayur-green mb-2">Analyzing Body Composition...</h3>
        <p className="text-gray-600 text-center max-w-xs">Calculating BMI, WHR, and Meda Dhatu status based on Charaka's 8 signs.</p>
        
        <div className="mt-6 flex gap-1">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="w-2 h-2 bg-ayur-green rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'result' && result) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-ayur-green font-semibold mb-4 hover:gap-3 transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
          </svg>
          Back to Tools
        </button>

        <div className="space-y-4">
          {/* Classification Card */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
            <div className={`bg-gradient-to-r ${result.color} p-6 text-white text-center`}>
              <div className="text-5xl font-bold mb-1">{animatedBMI}</div>
              <div className="text-white/80 text-sm">BMI (Body Mass Index)</div>
              <div className="mt-3 inline-block px-4 py-1.5 bg-white/20 rounded-full text-sm font-bold">
                {result.classification}
              </div>
            </div>
            <div className="p-5">
              <p className="text-gray-700 text-sm leading-relaxed">{result.description}</p>
            </div>
          </div>

          {/* BMI Gauge */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h3 className="font-bold text-ayur-green mb-3">BMI Scale (Indian Standards)</h3>
            <div className="relative h-4 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 via-orange-400 to-red-500 rounded-full mb-2">
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 w-4 h-6 bg-white border-2 border-gray-800 rounded shadow-md transition-all duration-1000"
                style={{ left: `${Math.min(Math.max(result.bmiGauge.percent - 2, 0), 96)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Underweight</span>
              <span>Normal</span>
              <span>Overweight</span>
              <span>Obese</span>
            </div>
            <div className="text-center mt-2">
              <span className={`font-bold ${result.bmiGauge.color}`}>{result.bmiGauge.zone}</span>
            </div>
          </div>

          {/* WHR & Symptoms */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <h3 className="font-bold text-ayur-green text-sm mb-2">Waist-Hip Ratio</h3>
              <div className="text-2xl font-bold text-gray-900">{result.whr > 0 ? result.whr : 'N/A'}</div>
              <div className={`text-xs font-medium mt-1 ${
                result.whrClassification.risk === 'high' ? 'text-red-500' :
                result.whrClassification.risk === 'moderate' ? 'text-amber-500' : 'text-green-500'
              }`}>
                {result.whrClassification.status}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <h3 className="font-bold text-ayur-green text-sm mb-2">Meda Vriddhi Signs</h3>
              <div className="text-2xl font-bold text-gray-900">{result.symptomScore}/8</div>
              <div className="text-xs text-gray-500 mt-1">
                {result.symptomScore >= 5 ? 'Multiple signs present' : result.symptomScore >= 2 ? 'Some signs present' : 'Minimal signs'}
              </div>
            </div>
          </div>

          {/* Toggle Details */}
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="w-full py-4 bg-ayur-green text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:bg-ayur-green-dark transition-all"
          >
            <span>{showDetails ? '▼ Hide' : '▶ View'} Treatment Recommendations</span>
          </button>

          {/* Recommendations */}
          {showDetails && (
            <div className="space-y-3">
              {result.recommendations.map((rec, idx) => (
                <div key={idx} className={`p-4 rounded-xl border-2 ${
                  rec.priority === 'high' ? 'bg-red-50 border-red-200' :
                  rec.priority === 'medium' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{rec.icon}</span>
                      <h4 className="font-bold text-gray-900">{rec.title}</h4>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      rec.priority === 'high' ? 'bg-red-200 text-red-800' :
                      rec.priority === 'medium' ? 'bg-amber-200 text-amber-800' : 'bg-green-200 text-green-800'
                    }`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{rec.description}</p>
                  <p className="text-xs text-ayur-accent mt-2 font-medium">Category: {rec.category}</p>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => { setMode('input'); setHeight(''); setWeight(''); setWaist(''); setHip(''); setResult(null); setShowDetails(false); setSymptoms({excessiveHunger: 0, excessiveThirst: 0, heaviness: 0, sweating: 0, badOdor: 0, fatigue: 0, flabbiness: 0, breathlessness: 0}); }}
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

  if (mode === 'symptoms') {
    const symptomCount = Object.values(symptoms).filter(v => v === 1).length;
    
    return (
      <div className="p-4 max-w-lg mx-auto">
        <button onClick={() => setMode('input')} className="flex items-center gap-2 text-ayur-green font-semibold mb-4 hover:gap-3 transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
          </svg>
          Back to Metrics
        </button>

        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">📋</span>
            <div>
              <span className="text-ayur-accent text-xs font-semibold uppercase tracking-wider">Ashtavidha Pariksha</span>
              <h2 className="font-serif text-xl font-bold text-ayur-green">8 Signs of Meda Vriddhi</h2>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">Select all symptoms you experience. Based on Charaka Samhita Sutrasthana 21.</p>

          <div className="space-y-2">
            {symptomQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleSymptomToggle(sq.key)}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                  symptoms[sq.key] === 1
                    ? 'border-ayur-green bg-ayur-green/5 shadow-md'
                    : 'border-gray-100 hover:border-ayur-green/30 hover:bg-ayur-cream/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-sm font-medium ${symptoms[sq.key] === 1 ? 'text-ayur-green' : 'text-gray-700'}`}>
                      {sq.label}
                    </span>
                    <span className="block text-xs text-gray-400 italic">{sq.sanskrit}</span>
                  </div>
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                    symptoms[sq.key] === 1
                      ? 'border-ayur-green bg-ayur-green'
                      : 'border-gray-300'
                  }`}>
                    {symptoms[sq.key] === 1 && (
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 12l5 5L20 7"/>
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-ayur-cream rounded-xl text-center">
            <span className="text-sm font-medium text-ayur-green">{symptomCount} of 8 symptoms selected</span>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          className="w-full py-3 bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white font-bold rounded-xl hover:shadow-lg transition-all"
        >
          Analyze Meda Dhatu →
        </button>
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

      <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">⚖️</span>
          <div>
            <span className="text-ayur-accent text-xs font-semibold uppercase tracking-wider">Deha Pariksha</span>
            <h2 className="font-serif text-xl font-bold text-ayur-green">Body Metrics</h2>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <div className="flex gap-2">
              <button
                onClick={() => setGender('male')}
                className={`flex-1 py-2 rounded-xl border-2 font-medium transition-all ${
                  gender === 'male' ? 'border-ayur-green bg-ayur-green/5 text-ayur-green' : 'border-gray-200 text-gray-600'
                }`}
              >
                Male
              </button>
              <button
                onClick={() => setGender('female')}
                className={`flex-1 py-2 rounded-xl border-2 font-medium transition-all ${
                  gender === 'female' ? 'border-ayur-green bg-ayur-green/5 text-ayur-green' : 'border-gray-200 text-gray-600'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g., 170"
                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-ayur-green focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g., 70"
                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-ayur-green focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waist (cm)</label>
              <input
                type="number"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder="e.g., 85"
                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-ayur-green focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hip (cm)</label>
              <input
                type="number"
                value={hip}
                onChange={(e) => setHip(e.target.value)}
                placeholder="e.g., 100"
                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-ayur-green focus:outline-none transition-all"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">Waist & Hip measurements are optional but recommended for visceral fat assessment.</p>
        </div>
      </div>

      <button
        onClick={handleCalculateMetrics}
        disabled={!height || !weight}
        className={`w-full py-3 rounded-xl font-bold transition-all ${
          !height || !weight
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white hover:shadow-lg'
        }`}
      >
        Continue to Symptoms →
      </button>

      <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
        Based on Charaka Samhita Sutrasthana 21 • Indian BMI Standards
      </div>
    </div>
  );
};

export default MedaTool;
