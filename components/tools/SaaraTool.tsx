import React, { useState } from 'react';
import { SAARA_DOMAINS } from '../../constants';
import { Layers, ArrowRight, RotateCw, CheckCircle2, Droplet, Activity, Brain, Heart, Bone, Smile, Zap, Eye, Check, Minus, X } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { NavLink } from '../Layout';
import ShareResults from '../ShareResults';

const SaaraTool: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  const currentDomain = SAARA_DOMAINS[activeStep];

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

  // Helper to get icon for specific domain
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
      default: return <Layers size={28} className="text-ayur-gold" />;
    }
  };

  if (showResult) {
    // Calculate Score Per Domain (Normalized to 100)
    const data = SAARA_DOMAINS.map(domain => {
      let domainScore = 0;
      let maxDomainScore = domain.questions.length * 2; // Max value per question is 2
      
      domain.questions.forEach(q => {
        domainScore += answers[q.id] || 0;
      });
      
      return {
        subject: domain.title.split(" ")[0], // e.g. "Twak"
        A: Math.round((domainScore / maxDomainScore) * 100),
        fullMark: 100
      };
    });

    // Identify Saara (Excellence) vs Asara (Deficiency)
    const strongTissues = data.filter(d => d.A >= 75).map(d => d.subject);
    const weakTissues = data.filter(d => d.A <= 40).map(d => d.subject);
    
    // Calculate Average
    const avgScore = data.reduce((acc, curr) => acc + curr.A, 0) / data.length;
    let overallStatus = "Madhyama Saara (Moderate)";
    if (avgScore > 75) overallStatus = "Pravara Saara (Excellent Tissue Quality)";
    if (avgScore < 40) overallStatus = "Avara Saara (Depleted Tissue Quality)";

    return (
      <div className="p-4 md:p-12 animate-fadeIn max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-ayur-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 text-ayur-gold border-2 border-ayur-gold shadow-lg">
            <Layers size={40} />
          </div>
          <h3 className="font-serif text-3xl font-bold text-ayur-green mb-2">Saara Pariksha Profile</h3>
          <p className="text-xl font-medium text-ayur-gray">{overallStatus}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-12">
           <div className="bg-white p-6 rounded-3xl shadow-lg border border-ayur-subtle h-[400px] w-full flex flex-col justify-center">
             <h4 className="text-center font-bold text-ayur-green mb-4 flex items-center justify-center gap-2">
               <Activity size={18} /> Tissue Strength Web
             </h4>
             <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                 <PolarGrid stroke="#e5e7eb" />
                 <PolarAngleAxis dataKey="subject" tick={{ fill: '#0F3D3E', fontSize: 12, fontWeight: 'bold' }} />
                 <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                 <Radar name="Tissue Quality" dataKey="A" stroke="#C27A12" fill="#C27A12" fillOpacity={0.4} />
                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
               </RadarChart>
             </ResponsiveContainer>
           </div>

           <div className="space-y-6">
              <div className="bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm">
                 <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                   <CheckCircle2 size={18} /> Strong Tissues (Saara)
                 </h4>
                 {strongTissues.length > 0 ? (
                   <div className="flex flex-wrap gap-2">
                     {strongTissues.map(t => (
                       <span key={t} className="bg-white px-3 py-1 rounded-full text-sm font-bold text-green-700 shadow-sm border border-green-100 flex items-center gap-1">
                         <Check size={12} /> {t}
                       </span>
                     ))}
                   </div>
                 ) : (
                   <p className="text-sm text-green-700 italic">No tissues showing high excellence. Rasayana therapy recommended.</p>
                 )}
              </div>

              <div className="bg-red-50 p-6 rounded-2xl border border-red-100 shadow-sm">
                 <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                   <Activity size={18} /> Tissues Needing Nourishment
                 </h4>
                 {weakTissues.length > 0 ? (
                   <div className="flex flex-wrap gap-2">
                     {weakTissues.map(t => (
                       <span key={t} className="bg-white px-3 py-1 rounded-full text-sm font-bold text-red-700 shadow-sm border border-red-100 flex items-center gap-1">
                         <Minus size={12} /> {t}
                       </span>
                     ))}
                   </div>
                 ) : (
                   <p className="text-sm text-red-700 italic">All tissues appear stable.</p>
                 )}
              </div>

              <p className="text-sm text-ayur-gray italic bg-ayur-cream p-4 rounded-xl border border-ayur-subtle">
                 "Saara reflects the essence and immunity of the body. Ideally, all 8 tissues should be balanced for optimal health."
              </p>
           </div>
        </div>

        {/* Share Section */}
        <div className="mb-8 flex justify-center">
            <ShareResults 
              title="My Saara Pariksha Result" 
              text={`I evaluated my Tissue Excellence (Saara) at Ayurvritta Hospital.\n\nOverall Status: ${overallStatus}\nAvg Score: ${Math.round(avgScore)}/100`} 
            />
        </div>

        <div className="flex justify-center gap-4 pb-8">
           <button onClick={() => {setActiveStep(0); setAnswers({}); setShowResult(false);}} className="px-6 py-3 rounded-full border border-gray-200 text-gray-500 hover:text-ayur-green flex items-center gap-2 hover:bg-gray-50 transition-colors">
             <RotateCw size={16} /> Retake
           </button>
           <NavLink to="/booking" className="px-8 py-3 rounded-full bg-ayur-green text-white font-bold hover:bg-ayur-gold transition-colors shadow-lg">
             Consult for Rasayana
           </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-ayur-green text-white p-8 relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
        <div className="relative z-10 flex justify-between items-center">
           <div>
              <h2 className="font-serif text-3xl font-bold flex items-center gap-3">
                 <Layers className="text-ayur-gold" /> Saara Pariksha
              </h2>
              <p className="opacity-80 mt-2">Evaluation of Tissue Excellence (Dhatu Saara)</p>
           </div>
           <div className="hidden sm:block text-right">
              <span className="text-3xl font-bold text-ayur-gold">0{activeStep + 1}</span>
              <span className="opacity-50 text-sm">/0{SAARA_DOMAINS.length}</span>
           </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-gray-100 flex-shrink-0">
        <div 
          className="h-full bg-ayur-gold transition-all duration-500 ease-out" 
          style={{width: `${((activeStep + 1) / SAARA_DOMAINS.length) * 100}%`}}
        ></div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full">
         <div className="animate-fadeIn pb-20">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-ayur-green/10 rounded-xl text-ayur-green">
                    {getDomainIcon(currentDomain.id)}
                </div>
                <div>
                    <h3 className="text-2xl font-serif font-bold text-ayur-green">{currentDomain.title}</h3>
                    <p className="text-gray-500 text-sm">{currentDomain.description}</p>
                </div>
            </div>
            
            <div className="space-y-10 mt-8">
               {currentDomain.questions.map((q, qIdx) => (
                  <div key={q.id} className="animate-fadeIn" style={{animationDelay: `${qIdx * 100}ms`}}>
                     <p className="font-bold text-ayur-green mb-4 text-lg flex items-start gap-3">
                        <span className="bg-ayur-gold/10 text-ayur-green text-xs rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {qIdx + 1}
                        </span>
                        {q.text}
                     </p>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {q.options.map((opt, idx) => {
                           const isSelected = answers[q.id] === opt.value;
                           // Generic Card Styling for 3 options
                           let icon = <Minus size={20} />;
                           let colorClass = "border-gray-200 text-gray-600 hover:border-gray-300";
                           let selectedClass = "";

                           if (opt.label === "Agree") {
                               icon = <CheckCircle2 size={24} />;
                               if (isSelected) selectedClass = "bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500";
                               else colorClass = "border-gray-200 hover:border-green-300 hover:bg-green-50/30";
                           } else if (opt.label === "Disagree") {
                               icon = <X size={24} />;
                               if (isSelected) selectedClass = "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500";
                               else colorClass = "border-gray-200 hover:border-red-300 hover:bg-red-50/30";
                           } else {
                               // Neutral
                               icon = <Minus size={24} />;
                               if (isSelected) selectedClass = "bg-yellow-50 border-yellow-500 text-yellow-700 ring-1 ring-yellow-500";
                               else colorClass = "border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/30";
                           }

                           return (
                              <button
                                 key={idx}
                                 onClick={() => handleSelect(q.id, Number(opt.value))}
                                 className={`group relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3 min-h-[100px] ${isSelected ? selectedClass : `bg-white ${colorClass}`}`}
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

      <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center flex-shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button onClick={onBack} className="text-gray-500 hover:text-ayur-green font-medium px-4">Cancel</button>
        <button 
           onClick={handleNext}
           disabled={!isStepComplete}
           className="bg-ayur-green text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-ayur-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {activeStep === SAARA_DOMAINS.length - 1 ? "View Profile" : "Next Domain"} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default SaaraTool;