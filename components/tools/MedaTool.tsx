import React, { useState, useEffect } from 'react';
import { MEDA_DHATU_QUESTIONS } from '../../constants';
import { Scale, Ruler, Activity, ArrowRight, AlertTriangle, CheckCircle2, RotateCw, Feather, Layers, Heart } from 'lucide-react';
import { NavLink } from '../Layout';
import ShareResults from '../ShareResults';
import { useIntersectionObserver } from '../../hooks';
import { MedaResult } from '../../types/index';

const MedaTool: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [metrics, setMetrics] = useState({
    height: '',
    weight: '',
    waist: '',
    hip: ''
  });
  const [symptoms, setSymptoms] = useState<Record<number, number>>({});
  const [result, setResult] = useState<MedaResult | null>(null);
  const [animatedBmi, setAnimatedBmi] = useState(0);

  const metricsObserver = useIntersectionObserver({ threshold: 0.1 });
  const symptomsObserver = useIntersectionObserver({ threshold: 0.1 });
  const resultObserver = useIntersectionObserver({ threshold: 0.1 });

  const handleMetricChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetrics({ ...metrics, [e.target.name]: e.target.value });
  };

  const handleSymptomSelect = (qId: number, val: number) => {
    setSymptoms(prev => ({ ...prev, [qId]: val }));
  };

  const calculate = () => {
    const hM = Number(metrics.height) / 100;
    const wKg = Number(metrics.weight);
    const waist = metrics.waist ? Number(metrics.waist) : 0;
    const hip = metrics.hip ? Number(metrics.hip) : 0;

    if (!hM || !wKg) return;

    const bmi = wKg / (hM * hM);
    let bmiCat = "Normal";
    if (bmi < 18.5) bmiCat = "Underweight";
    else if (bmi >= 25 && bmi < 30) bmiCat = "Overweight";
    else if (bmi >= 30) bmiCat = "Obese";

    let whr: number | null = null;
    let highVisceralFat = false;
    
    if (waist > 0 && hip > 0) {
        whr = waist / hip;
        highVisceralFat = whr > 0.9;
    }

    const symptomScore = (Object.values(symptoms) as number[]).reduce((a, b) => a + b, 0);
    
    let medaStatus = "Samyak (Balanced)";
    let recommendation = "Maintain your current healthy routine.";
    let color = "text-green-600";
    let bg = "bg-green-50";
    let gradient = "from-green-500 to-emerald-600";
    let borderColor = "border-green-200";

    if (bmiCat === "Underweight") {
      medaStatus = "Meda Kshaya (Depleted)";
      recommendation = "Brimhana (Nourishing) Therapy indicated. Focus on strengthening tissues.";
      color = "text-yellow-600";
      bg = "bg-yellow-50";
      gradient = "from-yellow-500 to-amber-500";
      borderColor = "border-yellow-200";
    } else if (bmiCat === "Obese" || (bmiCat === "Overweight" && symptomScore >= 2)) {
      medaStatus = "Meda Vriddhi (Pathological Increase)";
      recommendation = "Lekhana (Scraping) Therapy indicated. Need to clear obstruction (Srotorodha).";
      color = "text-red-600";
      bg = "bg-red-50";
      gradient = "from-red-500 to-rose-600";
      borderColor = "border-red-200";
    } else if (highVisceralFat && symptomScore >= 2) {
       medaStatus = "Sthaulya Risk (Central Obesity)";
       recommendation = "Specific abdominal fat reduction needed (Udvartana).";
       color = "text-orange-600";
       bg = "bg-orange-50";
       gradient = "from-orange-500 to-red-500";
       borderColor = "border-orange-200";
    }

    setResult({
      bmi: bmi.toFixed(1),
      bmiCat,
      whr: whr ? whr.toFixed(2) : "N/A",
      medaStatus,
      recommendation,
      color,
      bg,
      gradient,
      borderColor,
      symptomScore
    });
    setStep(3);
  };

  useEffect(() => {
    if (step === 3 && result) {
      const target = parseFloat(result.bmi);
      const duration = 1500;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedBmi(target);
          clearInterval(timer);
        } else {
          setAnimatedBmi(parseFloat(current.toFixed(1)));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [step, result]);

  const getMedaVisual = (status: string) => {
    if (status.includes("Kshaya")) return <Feather size={48} className="text-yellow-500" />;
    if (status.includes("Vriddhi") || status.includes("Risk")) return <Layers size={48} className="text-red-500" />;
    return <Scale size={48} className="text-green-500" />;
  };

  const inputStyle = "w-full pl-12 p-4 bg-white text-ayur-green placeholder-gray-400 border border-ayur-subtle rounded-xl focus:border-ayur-accent focus:ring-2 focus:ring-ayur-accent/20 outline-none transition-all shadow-sm hover:shadow-md";

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-gradient-to-br from-blue-500 via-ayur-green to-ayur-green-dark text-white p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-ayur-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h2 className="font-serif text-3xl font-bold flex items-center gap-3">
             <Scale className="text-ayur-accent" /> Meda Dhatu & BMI
           </h2>
          <p className="opacity-80 mt-2">Research-based assessment of Adipose Tissue & Metabolic Health.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-12 max-w-3xl mx-auto w-full">
        
        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <h3 className="text-xl font-bold text-ayur-green border-b border-gray-100 pb-2">Step 1: Anthropometric Measurements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <label className="block text-sm font-bold text-ayur-gray mb-2">Height (cm) <span className="text-red-500">*</span></label>
                <div className="relative">
                   <Ruler className="absolute top-4 left-3 text-ayur-accent group-focus-within:animate-pulse" size={20} />
                   <input 
                     type="number" 
                     name="height" 
                     value={metrics.height} 
                     onChange={handleMetricChange} 
                     className={inputStyle} 
                     placeholder="e.g. 170" 
                   />
                </div>
              </div>
              <div className="relative group">
                <label className="block text-sm font-bold text-ayur-gray mb-2">Weight (kg) <span className="text-red-500">*</span></label>
                <div className="relative">
                   <Scale className="absolute top-4 left-3 text-ayur-accent group-focus-within:animate-pulse" size={20} />
                   <input 
                     type="number" 
                     name="weight" 
                     value={metrics.weight} 
                     onChange={handleMetricChange} 
                     className={inputStyle} 
                     placeholder="e.g. 70" 
                   />
                </div>
              </div>
              <div className="relative group">
                <label className="block text-sm font-bold text-ayur-gray mb-2">Waist Circumference (cm) <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="relative">
                  <Activity className="absolute top-4 left-3 text-gray-400 group-focus-within:text-ayur-accent" size={20} />
                  <input 
                    type="number" 
                    name="waist" 
                    value={metrics.waist} 
                    onChange={handleMetricChange} 
                    className={inputStyle} 
                    placeholder="e.g. 90" 
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Measure at the navel level.</p>
              </div>
              <div className="relative group">
                <label className="block text-sm font-bold text-ayur-gray mb-2">Hip Circumference (cm) <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="relative">
                  <Activity className="absolute top-4 left-3 text-gray-400 group-focus-within:text-ayur-accent" size={20} />
                  <input 
                    type="number" 
                    name="hip" 
                    value={metrics.hip} 
                    onChange={handleMetricChange} 
                    className={inputStyle} 
                    placeholder="e.g. 100" 
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Measure at the widest part.</p>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setStep(2)} 
                disabled={!metrics.height || !metrics.weight}
                className="bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white px-8 py-3 rounded-full font-bold hover:from-ayur-accent hover:to-amber-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                Next <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
           <div className="space-y-8 animate-fadeIn">
             <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-xl font-bold text-ayur-green">Step 2: Clinical Signs</h3>
                <span className="text-xs font-bold text-ayur-accent uppercase tracking-widest">Ashtaau Dosha Check</span>
             </div>
             
             {MEDA_DHATU_QUESTIONS[0].questions.map((q, qIdx) => (
               <div key={q.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-ayur-accent/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fadeIn" style={{ animationDelay: `${qIdx * 100}ms` }}>
                 <p className="font-bold text-ayur-green mb-4 text-lg">{q.text}</p>
                 <div className="flex flex-wrap gap-4">
                   {q.options.map((opt, idx) => (
                     <label key={idx} className={`flex-1 min-w-[120px] p-4 rounded-xl border cursor-pointer text-center transition-all group ${symptoms[q.id] === opt.value ? 'bg-gradient-to-br from-ayur-green to-ayur-green-dark text-white border-ayur-green shadow-lg' : 'bg-white border-gray-300 text-gray-700 hover:border-ayur-accent hover:shadow-sm hover:-translate-y-0.5'}`}>
                       <input type="radio" name={`meda-q-${q.id}`} className="hidden" onChange={() => handleSymptomSelect(q.id, Number(opt.value))} />
                       {opt.label}
                     </label>
                   ))}
                 </div>
               </div>
             ))}

             <div className="flex justify-between pt-4">
               <button onClick={() => setStep(1)} className="text-gray-500 hover:text-ayur-green font-medium px-4 py-2 hover:bg-ayur-cream/50 rounded-lg transition-colors">Back</button>
               <button 
                 onClick={calculate} 
                 disabled={Object.keys(symptoms).length < 5}
                 className="bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white px-8 py-3 rounded-full font-bold hover:from-ayur-accent hover:to-amber-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02]"
               >
                 Analyze Tissue Status <Activity size={18} />
               </button>
             </div>
           </div>
        )}

        {step === 3 && result && (
          <div className="space-y-8 text-center animate-fadeIn">
             
             <div className={`p-8 rounded-3xl border-4 border-white shadow-xl ${result.bg} mb-8 relative overflow-hidden animate-bounceIn`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-2xl"></div>
                <div className={`w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-sm relative z-10`}>
                   {getMedaVisual(result.medaStatus)}
                </div>
                <h3 className="font-serif text-3xl font-bold text-ayur-green mb-2">{result.medaStatus}</h3>
                <p className={`text-lg font-medium ${result.color} max-w-lg mx-auto leading-relaxed`}>{result.recommendation}</p>
             </div>

             <div className="bg-white p-8 rounded-3xl border border-ayur-subtle shadow-lg mb-8 animate-fadeIn" style={{ animationDelay: '200ms' }}>
                 <div className="flex items-center justify-between mb-6">
                     <span className="font-bold text-ayur-green text-xl flex items-center gap-2">
                        <Activity className="text-ayur-accent" /> Body Mass Index
                     </span>
                     <span className="text-3xl font-serif font-bold text-ayur-green">{animatedBmi}</span>
                 </div>
                
                 <div className="relative h-6 w-full rounded-full flex overflow-hidden mb-8 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-blue-300 to-blue-400 w-[14%]" title="Underweight (<18.5)"></div>
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-500 w-[26%]" title="Normal (18.5-25)"></div>
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 w-[20%]" title="Overweight (25-30)"></div>
                    <div className="h-full bg-gradient-to-r from-red-400 to-red-500 flex-1" title="Obese (>30)"></div>
                    
                    <div 
                        className="absolute top-0 h-full w-1 bg-gradient-to-b from-ayur-green to-ayur-green-dark border-x border-white shadow-lg transition-all duration-1000 ease-out"
                        style={{ 
                            left: `${Math.min(Math.max(((parseFloat(result.bmi) - 15) / 25) * 100, 0), 100)}%` 
                        }}
                    ></div>
                    <div 
                        className="absolute -top-8 text-xs font-bold text-white bg-gradient-to-r from-ayur-green to-ayur-green-dark px-3 py-1.5 rounded-lg shadow-md -translate-x-1/2 transition-all duration-1000 animate-fadeInUp after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-ayur-green"
                        style={{ 
                            left: `${Math.min(Math.max(((parseFloat(result.bmi) - 15) / 25) * 100, 0), 100)}%` 
                        }}
                    >
                        You: {animatedBmi}
                    </div>
                 </div>
                 
                 <div className="flex justify-between text-xs text-gray-400 font-medium uppercase tracking-wider">
                   <span>Under</span>
                   <span>Normal</span>
                   <span>Over</span>
                   <span>Obese</span>
                 </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-ayur-subtle shadow-sm flex items-center justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '300ms' }}>
                    <div className="text-left">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-1">Waist-to-Hip Ratio</span>
                        <div className="text-3xl font-serif font-bold text-ayur-green">{result.whr}</div>
                        <p className="text-xs text-gray-500 mt-1">Visceral Fat Indicator</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-ayur-cream to-amber-100 rounded-full flex items-center justify-center text-ayur-accent shadow-md">
                        <Ruler size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-ayur-subtle shadow-sm flex items-center justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '400ms' }}>
                    <div className="text-left">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-1">Clinical Signs</span>
                        <div className="text-3xl font-serif font-bold text-ayur-green">{result.symptomScore}/5</div>
                        <p className="text-xs text-gray-500 mt-1">Symptom Severity</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-ayur-cream to-amber-100 rounded-full flex items-center justify-center text-ayur-accent shadow-md">
                       <Heart size={24} />
                    </div>
                </div>
            </div>
             
             <div className="text-left bg-gradient-to-br from-ayur-cream/30 to-white p-6 rounded-2xl border border-ayur-subtle hover:shadow-lg transition-shadow animate-fadeIn" style={{ animationDelay: '500ms' }}>
                <h4 className="font-bold text-ayur-green mb-2 flex items-center gap-2">
                  <Heart size={18} className="text-ayur-accent" /> Ayurvedic Clinical Note:
                </h4>
                <p className="text-ayur-gray text-sm leading-relaxed">
                  Even if BMI is normal, a high Waist-to-Hip ratio or presence of symptoms like excessive sweating (Ati Sweda) indicates <strong>"Sthaulya"</strong> (Metabolic Obesity). This requires correction of <em>Meda Dhatvagni</em> (Fat metabolism) rather than just calorie restriction.
                </p>
             </div>

             <div className="mt-4 flex justify-center animate-fadeInUp" style={{ animationDelay: '600ms' }}>
                 <ShareResults 
                   title="My Meda Dhatu & BMI Assessment" 
                   text={`I analyzed my body composition at Ayurvritta Hospital.\n\nBMI: ${result.bmi} (${result.bmiCat})\nMeda Status: ${result.medaStatus}`} 
                 />
             </div>

             <div className="flex justify-center gap-4 pt-4 animate-fadeInUp" style={{ animationDelay: '700ms' }}>
               <button onClick={() => {setStep(1); setSymptoms({}); setMetrics({height:'',weight:'',waist:'',hip:''});}} className="px-6 py-3 rounded-full border border-gray-200 text-gray-500 hover:text-ayur-green flex items-center gap-2 hover:bg-gray-50 transition-all hover:scale-105">
                 <RotateCw size={16} /> Reset
               </button>
               <NavLink to="/booking" className="px-8 py-3 rounded-full bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white font-bold hover:from-ayur-accent hover:to-amber-500 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]">
                 Book Consultation
               </NavLink>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedaTool;