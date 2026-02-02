import React, { useState } from 'react';
import { LIFESTYLE_RISK_QUESTIONS } from '../../constants';
import { AlertTriangle, CheckCircle2, Info, ArrowRight, ShieldAlert, Activity, Coffee, Moon } from 'lucide-react';
import { NavLink } from '../Layout';
import ShareResults from '../ShareResults';

const LifestyleTool: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (qId: number, val: number) => {
    setAnswers(prev => ({...prev, [qId]: val}));
  };

  const isComplete = LIFESTYLE_RISK_QUESTIONS[0].questions.every(q => answers[q.id] !== undefined);

  const calculate = () => {
    setShowResult(true);
  };

  if (showResult) {
    // Recalculate for render
    // Max Score Calculation: 
    // IDRS Base (100) + Diet(20) + Sleep(10) + Stress(20) + Habits(20) = ~170 Total max
    const score = (Object.values(answers) as number[]).reduce((a, b) => Number(a) + Number(b), 0);
    
    // Risk Categories tailored for expanded score
    let riskLevel = "Low Risk";
    let color = "text-green-600";
    let bg = "bg-green-50";
    let advice = "Your lifestyle is conducive to good health (Swasthya). Keep maintaining these habits.";

    if (score >= 40 && score < 90) {
      riskLevel = "Moderate Risk";
      color = "text-yellow-600";
      bg = "bg-yellow-50";
      advice = "Warning signs detected. Accumulation of Doshas (Chaya/Prakopa) has begun. Lifestyle correction is needed.";
    } else if (score >= 90) {
      riskLevel = "High Metabolic Risk";
      color = "text-red-600";
      bg = "bg-red-50";
      advice = "Significant imbalance (Sthanasamsraya). You are at high risk for diabetes/hypertension. Immediate consultation recommended.";
    }

    // Generate Specific Insights (Root Cause Analysis)
    const insights: {icon: any, text: string}[] = [];

    // Check Physical Activity (Q3)
    if ((answers[3] || 0) >= 20) {
      insights.push({
        icon: Activity,
        text: "Sedentary Lifestyle: Lack of movement increases 'Kapha' and 'Meda Dhatu' (fat tissue), leading to insulin resistance."
      });
    }

    // Check Diet (Q5)
    if ((answers[5] || 0) >= 10) {
      insights.push({
        icon: Coffee,
        text: "Dietary Indiscipline: Excess sweets/fried foods creates 'Ama' (toxins) that block metabolic channels (Srotas)."
      });
    }

    // Check Sleep (Q6)
    if ((answers[6] || 0) >= 10) {
      insights.push({
        icon: Moon,
        text: "Poor Sleep Hygiene: Disturbed sleep aggravates 'Vata', leading to hormonal imbalance and stress accumulation."
      });
    }

    // Check Stress (Q7)
    if ((answers[7] || 0) >= 10) {
      insights.push({
        icon: ShieldAlert,
        text: "High Stress: Psychological stress (Manasika Roga) directly impairs digestion (Agni) and immunity (Ojas)."
      });
    }

    return (
      <div className="p-8 md:p-12 text-center max-w-4xl mx-auto animate-fadeIn">
        
        {/* Score Header */}
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl ${bg}`}>
          <AlertTriangle size={48} className={color} />
        </div>
        <h3 className="font-serif text-3xl font-bold text-ayur-green mb-2">Assessment Result</h3>
        <p className={`text-4xl md:text-5xl font-serif font-bold mb-4 ${color}`}>{riskLevel}</p>
        <p className="text-xl font-bold text-gray-400 mb-8">Composite Score: {score}</p>
        
        {/* Main Interpretation */}
        <div className="bg-white p-8 rounded-3xl border border-ayur-subtle shadow-lg text-left mb-10 relative overflow-hidden">
           <div className={`absolute top-0 left-0 w-2 h-full ${bg.replace('bg-', 'bg-opacity-50 bg-')}`}></div>
           <h4 className="font-bold text-ayur-green mb-4 flex items-center gap-2 text-xl">
             <Info size={24} /> Clinical Interpretation
           </h4>
           <p className="text-ayur-gray text-lg leading-relaxed">{advice}</p>
        </div>

        {/* Root Cause Analysis Grid */}
        {insights.length > 0 && (
          <div className="mb-10 text-left">
            <h4 className="font-serif text-2xl font-bold text-ayur-green mb-6 text-center">Root Cause Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="bg-ayur-cream/40 p-5 rounded-2xl border border-ayur-subtle flex items-start">
                  <div className="bg-white p-2 rounded-lg shadow-sm mr-4 text-ayur-gold">
                    <insight.icon size={20} />
                  </div>
                  <p className="text-sm text-ayur-gray font-medium leading-relaxed">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Section */}
        <div className="mb-10 flex justify-center">
           <ShareResults 
             title="My Lifestyle Risk Assessment" 
             text={`I just checked my metabolic health risk score at Ayurvritta Hospital!\n\nRisk Level: ${riskLevel}\nScore: ${score}`} 
           />
        </div>

        <div className="flex justify-center gap-4">
           <button onClick={onBack} className="px-6 py-3 text-gray-500 font-medium hover:text-ayur-green transition-colors">Retake Test</button>
           <NavLink to="/booking" className="px-10 py-4 bg-ayur-green text-white rounded-full font-bold shadow-xl hover:bg-ayur-gold transition-all transform hover:-translate-y-1">
             Book Corrective Consultation
           </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-ayur-green text-white p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
        <div className="relative z-10">
          <h2 className="font-serif text-3xl font-bold">Comprehensive Lifestyle Audit</h2>
          <p className="opacity-80 mt-2">Integrating IDRS standards with Ayurvedic parameters (Nidra, Ahara, Vihara).</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-12 max-w-4xl mx-auto w-full space-y-8">
        {LIFESTYLE_RISK_QUESTIONS[0].questions.map(q => (
          <div key={q.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-ayur-gold/30 transition-colors">
            <h3 className="font-bold text-ayur-green text-lg mb-4 flex items-center">
              <span className="bg-white w-8 h-8 rounded-full flex items-center justify-center text-sm border border-gray-200 mr-3 shadow-sm">{q.id}</span>
              {q.text}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {q.options.map((opt, idx) => {
                const isSelected = answers[q.id] === opt.value;
                return (
                  <label 
                    key={idx} 
                    className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                      isSelected 
                      ? 'bg-ayur-green text-white border-ayur-green shadow-md transform scale-[1.02]' 
                      : 'bg-white border-gray-200 hover:border-ayur-green/50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      <input 
                        type="radio" 
                        name={`q-${q.id}`} 
                        className="hidden" // Custom styling via parent
                        onChange={() => handleSelect(q.id, Number(opt.value || 0))}
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${isSelected ? 'border-white' : 'border-gray-300'}`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="font-bold text-sm">{opt.value === 0 ? "Low Risk" : opt.value === 10 ? "Moderate" : "High"}</span>
                    </div>
                    <span className={`text-sm ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
        <button 
          onClick={calculate}
          disabled={!isComplete}
          className="bg-ayur-green text-white px-10 py-4 rounded-full font-bold shadow-lg hover:bg-ayur-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          Generate Analysis <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default LifestyleTool;
