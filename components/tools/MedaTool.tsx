import React, { useState } from 'react';
import { MEDA_DHATU_QUESTIONS } from '../../constants';
import { Scale, Ruler, Activity, ArrowRight, AlertTriangle, CheckCircle2, RotateCw, Feather, Layers } from 'lucide-react';
import { NavLink } from '../Layout';
import ShareResults from '../ShareResults';

const MedaTool: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [metrics, setMetrics] = useState({
    height: '', // cm
    weight: '', // kg
    waist: '', // cm
    hip: '' // cm
  });
  const [symptoms, setSymptoms] = useState<Record<number, number>>({});
  const [result, setResult] = useState<any>(null);

  const handleMetricChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetrics({ ...metrics, [e.target.name]: e.target.value });
  };

  const handleSymptomSelect = (qId: number, val: number) => {
    setSymptoms(prev => ({ ...prev, [qId]: val }));
  };

  const calculate = () => {
    const hM = Number(metrics.height) / 100;
    const wKg = Number(metrics.weight);
    // Waist/Hip are now optional, default to 0 if missing
    const waist = metrics.waist ? Number(metrics.waist) : 0;
    const hip = metrics.hip ? Number(metrics.hip) : 0;

    if (!hM || !wKg) return;

    // 1. BMI Calculation
    const bmi = wKg / (hM * hM);
    let bmiCat = "Normal";
    if (bmi < 18.5) bmiCat = "Underweight";
    else if (bmi >= 25 && bmi < 30) bmiCat = "Overweight";
    else if (bmi >= 30) bmiCat = "Obese";

    // 2. WHR Calculation (Visceral Fat Indicator) - Only if provided
    let whr: number | null = null;
    let highVisceralFat = false;
    
    if (waist > 0 && hip > 0) {
        whr = waist / hip;
        // WHO Cutoffs: Men > 0.9, Women > 0.85 indicates central obesity. Using 0.9 as general flag.
        highVisceralFat = whr > 0.9;
    }

    // 3. Meda Symptom Score
    const symptomScore = (Object.values(symptoms) as number[]).reduce((a, b) => a + b, 0);
    
    // Ayurvedic Interpretation
    let medaStatus = "Samyak (Balanced)";
    let recommendation = "Maintain your current healthy routine.";
    let color = "text-green-600";
    let bg = "bg-green-50";

    if (bmiCat === "Underweight") {
      medaStatus = "Meda Kshaya (Depleted)";
      recommendation = "Brimhana (Nourishing) Therapy indicated. Focus on strengthening tissues.";
      color = "text-yellow-600";
      bg = "bg-yellow-50";
    } else if (bmiCat === "Obese" || (bmiCat === "Overweight" && symptomScore >= 2)) {
      medaStatus = "Meda Vriddhi (Pathological Increase)";
      recommendation = "Lekhana (Scraping) Therapy indicated. Need to clear obstruction (Srotorodha).";
      color = "text-red-600";
      bg = "bg-red-50";
    } else if (highVisceralFat && symptomScore >= 2) {
       // Hidden Obesity (Normal BMI but high fat/symptoms)
       medaStatus = "Sthaulya Risk (Central Obesity)";
       recommendation = "Specific abdominal fat reduction needed (Udvartana).";
       color = "text-orange-600";
       bg = "bg-orange-50";
    }

    setResult({
      bmi: bmi.toFixed(1),
      bmiCat,
      whr: whr ? whr.toFixed(2) : "N/A",
      medaStatus,
      recommendation,
      color,
      bg,
      symptomScore
    });
    setStep(3);
  };

  // Helper for visuals
  const getMedaVisual = (status: string) => {
    if (status.includes("Kshaya")) return <Feather size={48} className="text-yellow-500" />;
    if (status.includes("Vriddhi") || status.includes("Risk")) return <Layers size={48} className="text-red-500" />;
    return <Scale size={48} className="text-green-500" />;
  };

  // Common Input Style for consistency
  const inputStyle = "w-full pl-10 p-4 bg-white text-ayur-green placeholder-gray-400 border border-ayur-subtle rounded-xl focus:border-ayur-green focus:ring-1 focus:ring-ayur-green outline-none transition-all shadow-sm";

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-ayur-green text-white p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
        <div className="relative z-10">
          <h2 className="font-serif text-3xl font-bold flex items-center gap-3">
             <Scale className="text-ayur-gold" /> Meda Dhatu & BMI
          </h2>
          <p className="opacity-80 mt-2">Research-based assessment of Adipose Tissue & Metabolic Health.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-12 max-w-3xl mx-auto w-full">
        
        {/* STEP 1: METRICS */}
        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <h3 className="text-xl font-bold text-ayur-green border-b border-gray-100 pb-2">Step 1: Anthropometric Measurements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-ayur-gray mb-2">Height (cm) <span className="text-red-500">*</span></label>
                <div className="relative">
                   <Ruler className="absolute top-4 left-3 text-ayur-gold" size={20} />
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
              <div>
                <label className="block text-sm font-bold text-ayur-gray mb-2">Weight (kg) <span className="text-red-500">*</span></label>
                <div className="relative">
                   <Scale className="absolute top-4 left-3 text-ayur-gold" size={20} />
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
              <div>
                <label className="block text-sm font-bold text-ayur-gray mb-2">Waist Circumference (cm) <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="relative">
                  <Activity className="absolute top-4 left-3 text-gray-400" size={20} />
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
              <div>
                <label className="block text-sm font-bold text-ayur-gray mb-2">Hip Circumference (cm) <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="relative">
                  <Activity className="absolute top-4 left-3 text-gray-400" size={20} />
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
                className="bg-ayur-green text-white px-8 py-3 rounded-full font-bold hover:bg-ayur-gold disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg"
              >
                Next <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SYMPTOMS */}
        {step === 2 && (
           <div className="space-y-8 animate-fadeIn">
             <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-xl font-bold text-ayur-green">Step 2: Clinical Signs</h3>
                <span className="text-xs font-bold text-ayur-gold uppercase tracking-widest">Ashtaau Dosha Check</span>
             </div>
             
             {MEDA_DHATU_QUESTIONS[0].questions.map(q => (
               <div key={q.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                 <p className="font-bold text-ayur-green mb-4 text-lg">{q.text}</p>
                 <div className="flex flex-wrap gap-4">
                   {q.options.map((opt, idx) => (
                     <label key={idx} className={`flex-1 min-w-[120px] p-4 rounded-xl border cursor-pointer text-center transition-all ${symptoms[q.id] === opt.value ? 'bg-ayur-green text-white border-ayur-green shadow-md' : 'bg-white border-gray-300 text-gray-700 hover:border-ayur-green hover:shadow-sm'}`}>
                       <input type="radio" name={`meda-q-${q.id}`} className="hidden" onChange={() => handleSymptomSelect(q.id, Number(opt.value))} />
                       {opt.label}
                     </label>
                   ))}
                 </div>
               </div>
             ))}

             <div className="flex justify-between pt-4">
               <button onClick={() => setStep(1)} className="text-gray-500 hover:text-ayur-green font-medium px-4">Back</button>
               <button 
                 onClick={calculate} 
                 disabled={Object.keys(symptoms).length < 5}
                 className="bg-ayur-green text-white px-8 py-3 rounded-full font-bold hover:bg-ayur-gold disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg"
               >
                 Analyze Tissue Status <Activity size={18} />
               </button>
             </div>
           </div>
        )}

        {/* STEP 3: RESULTS */}
        {step === 3 && result && (
          <div className="animate-fadeIn space-y-8 text-center">
             
             {/* Meda Status Card */}
             <div className={`p-8 rounded-3xl border-4 border-white shadow-xl ${result.bg} mb-8`}>
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-sm">
                   {getMedaVisual(result.medaStatus)}
                </div>
                <h3 className="font-serif text-3xl font-bold text-ayur-green mb-2">{result.medaStatus}</h3>
                <p className={`text-lg font-medium ${result.color} max-w-lg mx-auto leading-relaxed`}>{result.recommendation}</p>
             </div>

             {/* BMI Visual Card */}
             <div className="bg-white p-8 rounded-3xl border border-ayur-subtle shadow-lg mb-8">
                 <div className="flex items-center justify-between mb-6">
                     <span className="font-bold text-ayur-green text-xl flex items-center gap-2">
                        <Activity className="text-ayur-gold" /> Body Mass Index
                     </span>
                     <span className="text-3xl font-serif font-bold text-ayur-green">{result.bmi}</span>
                 </div>
                 
                 {/* Visual BMI Bar */}
                 <div className="relative h-4 w-full rounded-full flex overflow-hidden mb-8">
                    <div className="h-full bg-blue-300 w-[14%]" title="Underweight (<18.5)"></div>
                    <div className="h-full bg-green-400 w-[26%]" title="Normal (18.5-25)"></div>
                    <div className="h-full bg-yellow-400 w-[20%]" title="Overweight (25-30)"></div>
                    <div className="h-full bg-red-400 flex-1" title="Obese (>30)"></div>
                    
                    {/* Marker */}
                    <div 
                        className="absolute top-0 h-full w-1 bg-ayur-green border-x border-white shadow-lg transition-all duration-1000"
                        style={{ 
                            left: `${Math.min(Math.max(((parseFloat(result.bmi) - 15) / 25) * 100, 0), 100)}%` 
                        }}
                    ></div>
                    <div 
                        className="absolute -top-7 text-xs font-bold text-white bg-ayur-green px-2 py-1 rounded shadow-sm -translate-x-1/2 transition-all duration-1000 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-ayur-green"
                        style={{ 
                            left: `${Math.min(Math.max(((parseFloat(result.bmi) - 15) / 25) * 100, 0), 100)}%` 
                        }}
                    >
                        You
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
                {/* WHR Card */}
                <div className="bg-white p-6 rounded-2xl border border-ayur-subtle shadow-sm flex items-center justify-between">
                    <div className="text-left">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-1">Waist-to-Hip Ratio</span>
                        <div className="text-3xl font-serif font-bold text-ayur-green">{result.whr}</div>
                        <p className="text-xs text-gray-500 mt-1">Visceral Fat Indicator</p>
                    </div>
                    <div className="w-12 h-12 bg-ayur-cream rounded-full flex items-center justify-center text-ayur-gold">
                        <Ruler size={24} />
                    </div>
                </div>
                {/* Symptom Score Card */}
                <div className="bg-white p-6 rounded-2xl border border-ayur-subtle shadow-sm flex items-center justify-between">
                    <div className="text-left">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-1">Clinical Signs</span>
                        <div className="text-3xl font-serif font-bold text-ayur-green">{result.symptomScore}/5</div>
                        <p className="text-xs text-gray-500 mt-1">Symptom Severity</p>
                    </div>
                     <div className="w-12 h-12 bg-ayur-cream rounded-full flex items-center justify-center text-ayur-gold">
                        <Activity size={24} />
                    </div>
                </div>
            </div>
             
             <div className="text-left bg-ayur-cream/30 p-6 rounded-2xl border border-ayur-subtle">
                <h4 className="font-bold text-ayur-green mb-2">Ayurvedic Clinical Note:</h4>
                <p className="text-ayur-gray text-sm leading-relaxed">
                  Even if BMI is normal, a high Waist-to-Hip ratio or presence of symptoms like excessive sweating (Ati Sweda) indicates <strong>"Sthaulya"</strong> (Metabolic Obesity). This requires correction of <em>Meda Dhatvagni</em> (Fat metabolism) rather than just calorie restriction.
                </p>
             </div>

             {/* Share Section */}
             <div className="mt-4 flex justify-center">
                <ShareResults 
                  title="My Meda Dhatu & BMI Assessment" 
                  text={`I analyzed my body composition at Ayurvritta Hospital.\n\nBMI: ${result.bmi} (${result.bmiCat})\nMeda Status: ${result.medaStatus}`} 
                />
             </div>

             <div className="flex justify-center gap-4 pt-4">
               <button onClick={() => {setStep(1); setSymptoms({}); setMetrics({height:'',weight:'',waist:'',hip:''});}} className="px-6 py-3 rounded-full border border-gray-200 text-gray-500 hover:text-ayur-green flex items-center gap-2 hover:bg-gray-50 transition-colors">
                 <RotateCw size={16} /> Reset
               </button>
               <NavLink to="/booking" className="px-8 py-3 rounded-full bg-ayur-green text-white font-bold hover:bg-ayur-gold transition-colors shadow-lg">
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