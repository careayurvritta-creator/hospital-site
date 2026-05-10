import React, { useState, useEffect } from 'react';
import { SAARA_DOMAINS } from '../../constants';
import { Layers, ArrowRight, RotateCw, CheckCircle2, Droplet, Activity, Brain, Heart, Bone, Smile, Zap, Eye, Check, Minus, X } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { NavLink } from '../Layout';
import ShareResults from '../ShareResults';

const SaaraTool: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [radarAnimation, setRadarAnimation] = useState(0);

  const currentDomain = SAARA_DOMAINS[activeStep];

  useEffect(() => {
    if (showResult) {
      const duration = 1500;
      const steps = 60;
      const increment = 100 / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= 100) {
          setRadarAnimation(100);
          clearInterval(timer);
        } else {
          setRadarAnimation(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [showResult]);

  const handleSelect = (qId: number, val: number) => {
    setAnswers(prev => ({...prev, [qId]: val}));
  };

  const isStepComplete = currentDomain.questions.every(q => answers[q.id] !== undefined);

  const handleNext = () => {
    if (activeStep < SAARA_DOMAINS.length - 1) {
      setActiveStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowResult(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getDomainIcon = (id: string) => {
    switch(id) {
      case 'twak': return <Smile size={28} className="text-pink-500" />;
      case 'rakta': return <Droplet size={28} className="text-red-500" />;
      case 'mamsa': return <Activity size={28} className="text-orange-600" />;
      case 'meda': return <Layers size={28} className="text-yellow-500" />;
      case 'asthi': return <Bone size={28} className="text-gray-500" />;
      case 'majja': return <Brain size={28} className="text-purple-500" />;
      case 'shukra': return <Heart size={28} className="text-pink-600" />;
      case 'satva': return <Zap size={28} className="text-blue-500" />;
      default: return <Layers size={28} className="text-ayur-accent" />;
    }
  };

  if (showResult) {
    const data = SAARA_DOMAINS.map(domain => {
      let domainScore = 0;
      let maxDomainScore = domain.questions.length * 2;
      
      domain.questions.forEach(q => {
        domainScore += answers[q.id] || 0;
      });
      
      return {
        subject: domain.title.split(" ")[0],
        A: Math.round((domainScore / maxDomainScore) * 100),
        fullMark: 100
      };
    });

    const strongTissues = data.filter(d => d.A >= 75).map(d => d.subject);
    const weakTissues = data.filter(d => d.A <= 40).map(d => d.subject);
    
    const avgScore = data.reduce((acc, curr) => acc + curr.A, 0) / data.length;
    let overallStatus = "Madhyama Saara (Moderate)";
    let statusGradient = "from-purple-500 to-violet-600";
    if (avgScore > 75) {
      overallStatus = "Pravara Saara (Excellent Tissue Quality)";
      statusGradient = "from-green-500 to-emerald-600";
    }
    if (avgScore < 40) {
      overallStatus = "Avara Saara (Depleted Tissue Quality)";
      statusGradient = "from-red-500 to-rose-600";
    }

    return (
      <div className="p-4 md:p-12 max-w-5xl mx-auto animate-fadeIn">
        <div className="text-center mb-8">
          <div className={`w-24 h-24 bg-gradient-to-br ${statusGradient} rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-2xl animate-bounceIn`}>
            <Layers size={48} />
          </div>
          <h3 className="font-serif text-3xl md:text-4xl font-bold text-ayur-green mb-2">Saara Pariksha Profile</h3>
          <p className={`text-xl font-medium bg-gradient-to-r ${statusGradient} bg-clip-text text-transparent`}>{overallStatus}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-12">
           <div className="bg-white p-6 rounded-3xl shadow-lg border border-ayur-subtle h-[400px] w-full flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-full blur-2xl"></div>
             <h4 className="text-center font-bold text-ayur-green mb-4 flex items-center justify-center gap-2">
               <Activity size={18} className="text-ayur-accent" /> Tissue Strength Web
             </h4>
             <ResponsiveContainer width="100%" height="85%">
               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                 <PolarGrid stroke="#e5e7eb" />
                 <PolarAngleAxis dataKey="subject" tick={{ fill: '#0F3D3E', fontSize: 11, fontWeight: 'bold' }} />
                 <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                 <Radar name="Tissue Quality" dataKey="A" stroke="#0D8784" fill="#0D8784" fillOpacity={radarAnimation / 200} animationDuration={1500} animationBegin={200} />
                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
               </RadarChart>
             </ResponsiveContainer>
           </div>

           <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                 <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                   <CheckCircle2 size={18} className="text-green-500" /> Strong Tissues (Saara)
                 </h4>
                 {strongTissues.length > 0 ? (
                   <div className="flex flex-wrap gap-2">
                     {strongTissues.map((t, i) => (
                       <span key={t} className="bg-white px-4 py-2 rounded-full text-sm font-bold text-green-700 shadow-sm border border-green-100 flex items-center gap-1.5">
                         <Check size={14} /> {t}
                       </span>
                     ))}
                   </div>
                 ) : (
                   <p className="text-sm text-green-700 italic">No tissues showing high excellence. Rasayana therapy recommended.</p>
                 )}
              </div>

              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border border-red-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                 <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                   <Activity size={18} className="text-red-500" /> Tissues Needing Nourishment
                 </h4>
                 {weakTissues.length > 0 ? (
                   <div className="flex flex-wrap gap-2">
                     {weakTissues.map((t, i) => (
                       <span key={t} className="bg-white px-4 py-2 rounded-full text-sm font-bold text-red-700 shadow-sm border border-red-100 flex items-center gap-1.5">
                         <Minus size={14} /> {t}
                       </span>
                     ))}
                   </div>
                 ) : (
                   <p className="text-sm text-red-700 italic">All tissues appear stable.</p>
                 )}
              </div>

              <p className="text-sm text-ayur-gray italic bg-gradient-to-br from-ayur-cream/50 to-white p-4 rounded-xl border border-ayur-subtle hover:shadow-md transition-shadow">
                 "Saara reflects the essence and immunity of the body. Ideally, all 8 tissues should be balanced for optimal health."
              </p>
           </div>
        </div>

        <div className="mb-8 flex justify-center">
            <ShareResults 
              title="My Saara Pariksha Result" 
              text={`I evaluated my Tissue Excellence (Saara) at Ayurvritta Hospital.\n\nOverall Status: ${overallStatus}\nAvg Score: ${Math.round(avgScore)}/100`} 
            />
        </div>

        <div className="flex justify-center gap-4 pb-8">
           <button onClick={() => {setActiveStep(0); setAnswers({}); setShowResult(false);}} className="px-6 py-3 rounded-full border border-gray-200 text-gray-500 hover:text-ayur-green flex items-center gap-2 hover:bg-gray-50 transition-all hover:scale-105">
             <RotateCw size={16} /> Retake
           </button>
           <NavLink to="/booking" className="px-8 py-3 rounded-full bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white font-bold hover:from-ayur-accent hover:to-amber-500 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]">
             Consult for Rasayana
           </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-gradient-to-br from-purple-600 via-ayur-green to-ayur-green-dark text-white p-8 relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 w-40 h-40 bg-ayur-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex justify-between items-center">
           <div>
              <h2 className="font-serif text-3xl font-bold flex items-center gap-3">
                 <Layers className="text-ayur-accent" /> Saara Pariksha
              </h2>
              <p className="opacity-80 mt-2">Evaluation of Tissue Excellence (Dhatu Saara)</p>
           </div>
           <div className="hidden sm:block text-right">
              <span className="text-3xl font-bold text-ayur-accent">0{activeStep + 1}</span>
              <span className="opacity-50 text-sm">/0{SAARA_DOMAINS.length}</span>
           </div>
        </div>
      </div>

      <div className="h-2 w-full bg-gray-100 flex-shrink-0 relative overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-ayur-accent to-amber-400 transition-all duration-700 ease-out relative" 
          style={{width: `${((activeStep + 1) / SAARA_DOMAINS.length) * 100}%`}}
        ></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full">
         <div className="pb-20 animate-fadeIn">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-gradient-to-br from-ayur-green/10 to-ayur-accent/10 rounded-xl text-ayur-green shadow-md">
                    {getDomainIcon(currentDomain.id)}
                </div>
                <div>
                    <h3 className="text-2xl font-serif font-bold text-ayur-green">{currentDomain.title}</h3>
                    <p className="text-gray-500 text-sm">{currentDomain.description}</p>
                </div>
            </div>
            
            <div className="space-y-10 mt-8">
               {currentDomain.questions.map((q, qIdx) => (
                 <div key={q.id} className="animate-slideInRight" style={{ transitionDelay: `${qIdx * 100}ms` }}>
                    <p className="font-bold text-ayur-green mb-4 text-lg flex items-start gap-3">
                       <span className="bg-gradient-to-br from-ayur-accent to-amber-400 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold shadow-md">
                           {qIdx + 1}
                       </span>
                       {q.text}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       {q.options.map((opt, idx) => {
                          const isSelected = answers[q.id] === opt.value;
                          let icon = <Minus size={20} />;
                          let colorClass = "border-gray-200 text-gray-600 hover:border-gray-300";
                          let selectedClass = "";

                          if (opt.label === "Agree") {
                              icon = <CheckCircle2 size={24} />;
                              if (isSelected) selectedClass = "bg-gradient-to-br from-green-50 to-emerald-50 border-green-500 text-green-700 ring-2 ring-green-500/30";
                              else colorClass = "border-gray-200 hover:border-green-300 hover:bg-green-50/30 hover:-translate-y-1";
                          } else if (opt.label === "Disagree") {
                              icon = <X size={24} />;
                              if (isSelected) selectedClass = "bg-gradient-to-br from-red-50 to-orange-50 border-red-500 text-red-700 ring-2 ring-red-500/30";
                              else colorClass = "border-gray-200 hover:border-red-300 hover:bg-red-50/30 hover:-translate-y-1";
                          } else {
                              icon = <Minus size={24} />;
                              if (isSelected) selectedClass = "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-500 text-yellow-700 ring-2 ring-yellow-500/30";
                              else colorClass = "border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/30 hover:-translate-y-1";
                          }

                          return (
                             <button
                                key={idx}
                                onClick={() => handleSelect(q.id, Number(opt.value))}
                                className={`group relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3 min-h-[100px] shadow-sm hover:shadow-lg ${isSelected ? selectedClass : `bg-white ${colorClass}`}`}
                             >
                                <div className={`transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {icon}
                                </div>
                                <span className="font-bold text-sm">{opt.label}</span>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-current animate-pulse"></div>
                                )}
                             </button>
                          );
                       })}
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center flex-shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button onClick={onBack} className="text-gray-500 hover:text-ayur-green font-medium px-4 py-2 hover:bg-ayur-cream/50 rounded-lg transition-colors">Cancel</button>
        <button 
           onClick={handleNext}
           disabled={!isStepComplete}
           className="bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white px-8 py-3 rounded-full font-bold shadow-lg hover:from-ayur-accent hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 hover:scale-[1.02] hover:shadow-xl"
        >
          {activeStep === SAARA_DOMAINS.length - 1 ? "View Profile" : "Next Domain"} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default SaaraTool;