import React, { useState, useEffect } from 'react';
import { LIFESTYLE_RISK_QUESTIONS } from '../../constants';
import { NavLink } from '../Layout';
import ShareResults from '../ShareResults';
import { useIntersectionObserver } from '../../hooks';
import { Insight } from '../../types/index';
import Icons from '../Icons';

const LifestyleTool: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  const resultObserver = useIntersectionObserver({ threshold: 0.1 });
  const questionsObserver = useIntersectionObserver({ threshold: 0.05, rootMargin: '-50px' });

  const handleSelect = (qId: number, val: number) => {
    setAnswers(prev => ({...prev, [qId]: val}));
  };

  const isComplete = LIFESTYLE_RISK_QUESTIONS[0].questions.every(q => answers[q.id] !== undefined);

  const calculate = () => {
    setShowResult(true);
  };

  useEffect(() => {
    if (showResult) {
      const finalScore = (Object.values(answers) as number[]).reduce((a, b) => Number(a) + Number(b), 0);
      const duration = 1500;
      const steps = 60;
      const increment = finalScore / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= finalScore) {
          setAnimatedScore(finalScore);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [showResult]);

  if (showResult) {
    const score = (Object.values(answers) as number[]).reduce((a, b) => Number(a) + Number(b), 0);
    
    let riskLevel = "Low Risk";
    let color = "text-green-600";
    let bg = "bg-green-50";
    let borderColor = "border-green-200";
    let gradient = "from-green-500 to-emerald-600";

    if (score >= 40 && score < 90) {
      riskLevel = "Moderate Risk";
      color = "text-yellow-600";
      bg = "bg-yellow-50";
      borderColor = "border-yellow-200";
      gradient = "from-yellow-500 to-orange-500";
    } else if (score >= 90) {
      riskLevel = "High Metabolic Risk";
      color = "text-red-600";
      bg = "bg-red-50";
      borderColor = "border-red-200";
      gradient = "from-red-500 to-rose-600";
    }

    const insights: Insight[] = [];

    if ((answers[3] || 0) >= 20) {
      insights.push({
        icon: Icons.Activity,
        text: "Sedentary Lifestyle: Lack of movement increases 'Kapha' and 'Meda Dhatu' (fat tissue), leading to insulin resistance.",
        color: "text-blue-500 bg-blue-100"
      });
    }

    if ((answers[5] || 0) >= 10) {
      insights.push({
        icon: Icons.Coffee,
        text: "Dietary Indiscipline: Excess sweets/fried foods creates 'Ama' (toxins) that block metabolic channels (Srotas).",
        color: "text-amber-500 bg-amber-100"
      });
    }

    if ((answers[6] || 0) >= 10) {
      insights.push({
        icon: Icons.Moon,
        text: "Poor Sleep Hygiene: Disturbed sleep aggravates 'Vata', leading to hormonal imbalance and stress accumulation.",
        color: "text-indigo-500 bg-indigo-100"
      });
    }

    if ((answers[7] || 0) >= 10) {
      insights.push({
        icon: Icons.ShieldAlert,
        text: "High Stress: Psychological stress (Manasika Roga) directly impairs digestion (Agni) and immunity (Ojas).",
        color: "text-red-500 bg-red-100"
      });
    }

    return (
      <div className="p-8 md:p-12 text-center max-w-4xl mx-auto animate-fadeIn">
        
        <div className="relative inline-block mb-8 animate-bounceIn">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-2xl bg-gradient-to-br ${gradient}`}>
            <Icons.AlertTriangle size={56} className="text-white" />
          </div>
          <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center animate-pulse`}>
            {score < 40 && <Icons.CheckCircle2 size={16} className="text-green-500" />}
            {score >= 40 && score < 90 && <Icons.AlertTriangle size={14} className="text-yellow-500" />}
            {score >= 90 && <Icons.ShieldAlert size={14} className="text-red-500" />}
          </div>
        </div>

        <h3 className="font-serif text-3xl font-bold text-ayur-green mb-2 animate-fadeInUp" style={{ animationDelay: '100ms' }}>Assessment Result</h3>
        <p className={`text-4xl md:text-5xl font-serif font-bold mb-4 animate-bounceIn ${color}`} style={{ animationDelay: '200ms' }}>{riskLevel}</p>
        <p className="text-xl font-bold text-gray-400 mb-8 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
          Composite Score: <span className={`text-2xl font-mono ${color}`}>{animatedScore}</span>
        </p>
        
        <div className={`bg-white p-8 rounded-3xl border-2 ${borderColor} shadow-lg text-left mb-10 relative overflow-hidden animate-fadeInUp ${resultObserver.isVisible ? '' : 'translate-y-8'}`} style={{ animationDelay: '400ms' }}>
           <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient}`}></div>
           <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-ayur-green to-transparent opacity-20"></div>
           <h4 className="font-bold text-ayur-green mb-4 flex items-center gap-2 text-xl">
             <Icons.Info size={24} className="text-ayur-accent" /> Clinical Interpretation
           </h4>
           <p className="text-ayur-gray text-lg leading-relaxed">
             {score < 40 ? "Your lifestyle is conducive to good health (Swasthya). Keep maintaining these habits." :
              score < 90 ? "Warning signs detected. Accumulation of Doshas (Chaya/Prakopa) has begun. Lifestyle correction is needed." :
              "Significant imbalance (Sthanasamsraya). You are at high risk for diabetes/hypertension. Immediate consultation recommended."}
           </p>
        </div>

        {insights.length > 0 && (
          <div className="mb-10 text-left">
            <h4 className="font-serif text-2xl font-bold text-ayur-green mb-6 text-center animate-fadeInUp" style={{ animationDelay: '500ms' }}>Root Cause Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="bg-ayur-cream/40 p-5 rounded-2xl border border-ayur-subtle flex items-start hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: `${600 + idx * 100}ms` }}>
                  <div className={`p-2 rounded-lg shadow-sm mr-4 ${insight.color}`}>
                    <insight.icon size={20} />
                  </div>
                  <p className="text-sm text-ayur-gray font-medium leading-relaxed">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-10 flex justify-center animate-fadeInUp" style={{ animationDelay: '700ms' }}>
           <ShareResults 
             title="My Lifestyle Risk Assessment" 
             text={`I just checked my metabolic health risk score at Ayurvritta Hospital!\n\nRisk Level: ${riskLevel}\nScore: ${score}`} 
           />
        </div>

        <div className="flex justify-center gap-4 animate-fadeInUp" style={{ animationDelay: '800ms' }}>
           <button onClick={onBack} className="px-6 py-3 text-gray-500 font-medium hover:text-ayur-green transition-colors hover:bg-ayur-cream/50 rounded-full">Retake Test</button>
           <NavLink to="/booking" className="px-10 py-4 bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white rounded-full font-bold shadow-xl hover:from-ayur-accent hover:to-amber-500 transition-all transform hover:-translate-y-1 hover:shadow-2xl">
             Book Corrective Consultation
           </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-gradient-to-br from-ayur-green via-[#0a6b5a] to-ayur-green-dark text-white p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-ayur-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h2 className="font-serif text-3xl font-bold">Comprehensive Lifestyle Audit</h2>
          <p className="opacity-80 mt-2">Integrating IDRS standards with Ayurvedic parameters (Nidra, Ahara, Vihara).</p>
        </div>
      </div>

      <div ref={questionsObserver.ref} className="flex-1 overflow-y-auto p-8 md:p-12 max-w-4xl mx-auto w-full space-y-8">
        {LIFESTYLE_RISK_QUESTIONS[0].questions.map((q, qIdx) => (
          <div key={q.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-ayur-accent/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fadeIn" style={{ animationDelay: `${qIdx * 100}ms` }}>
            <h3 className="font-bold text-ayur-green text-lg mb-4 flex items-center">
              <span className="bg-gradient-to-br from-ayur-green to-ayur-green-dark w-8 h-8 rounded-full flex items-center justify-center text-sm text-white mr-3 shadow-md">{q.id}</span>
              {q.text}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {q.options.map((opt, idx) => {
                const isSelected = answers[q.id] === opt.value;
                return (
                  <label 
                    key={idx} 
                    className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all duration-200 group ${
                      isSelected 
                      ? 'bg-gradient-to-br from-ayur-green to-ayur-green-dark text-white border-ayur-green shadow-lg transform scale-[1.02]' 
                      : 'bg-white border-gray-200 hover:border-ayur-green/50 text-gray-700 hover:bg-ayur-cream/30'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      <input 
                        type="radio" 
                        name={`q-${q.id}`} 
                        className="hidden"
                        onChange={() => handleSelect(q.id, Number(opt.value || 0))}
                      />
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${isSelected ? 'border-white bg-white' : 'border-gray-300 group-hover:border-ayur-green'}`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-ayur-accent" />}
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

      <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-end">
        <button 
          onClick={calculate}
          disabled={!isComplete}
          className="bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white px-10 py-4 rounded-full font-bold shadow-lg hover:from-ayur-accent hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 hover:scale-[1.02] hover:shadow-xl"
        >
          Generate Analysis <Icons.ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default LifestyleTool;