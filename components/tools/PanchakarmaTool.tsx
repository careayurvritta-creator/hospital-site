import React, { useState } from 'react';
import { PK_ELIGIBILITY_SECTIONS } from '../../constants';
import { Shield, Check, XCircle, AlertCircle, ArrowRight, Activity } from 'lucide-react';
import { NavLink } from '../Layout';
import { useIntersectionObserver } from '../../hooks';

const PanchakarmaTool: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<string | null>(null);

  const questionsObserver = useIntersectionObserver({ threshold: 0.1 });
  const resultObserver = useIntersectionObserver({ threshold: 0.1 });

  const handleSelect = (qId: number, val: string) => {
    setAnswers(prev => ({...prev, [qId]: val}));
  };

  const calculate = () => {
    if (answers[1] === 'unfit') {
      setResult("contraindicated");
      return;
    }

    if (answers[2] === 'shaman' || answers[3] === 'shaman') {
      setResult("shaman");
      return;
    }

    setResult("shodhan");
  };

  if (result) {
    return (
      <div className="p-8 md:p-16 text-center max-w-3xl mx-auto animate-fadeIn">
        {result === 'contraindicated' && (
          <>
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 shadow-xl animate-bounceIn">
              <XCircle size={48} />
            </div>
            <h3 className="font-serif text-3xl md:text-4xl font-bold text-ayur-green mb-4 animate-fadeInUp" style={{ animationDelay: '100ms' }}>Not Suitable for Panchakarma</h3>
            <p className="text-lg text-gray-600 mb-8 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              Based on your inputs, intense detoxification is currently <strong className="text-red-600">unsafe</strong> for you. We recommend "Shamana Chikitsa" (Oral medication & external therapies) only.
            </p>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg text-left mb-8 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
              <p className="text-red-800 font-medium">Contraindications detected. Please consult our doctors for safe alternative treatments.</p>
            </div>
          </>
        )}

        {result === 'shaman' && (
          <>
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600 shadow-xl animate-bounceIn">
              <AlertCircle size={48} />
            </div>
            <h3 className="font-serif text-3xl md:text-4xl font-bold text-ayur-green mb-4 animate-fadeInUp" style={{ animationDelay: '100ms' }}>Shamana (Palliative) Recommended</h3>
            <p className="text-lg text-gray-600 mb-8 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              Your digestive fire (Agni) or stamina may not support rigorous cleansing right now. Start with gentle oral corrections and external massages before attempting detox.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg text-left mb-8 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
              <p className="text-yellow-800 font-medium">Recommended: Abhyanga (oil massage), Swedana (herbal steam), and gentle herbal formulations to build up strength.</p>
            </div>
          </>
        )}

        {result === 'shodhan' && (
          <>
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-xl animate-bounceIn">
              <Check size={48} />
            </div>
            <h3 className="font-serif text-3xl md:text-4xl font-bold text-ayur-green mb-4 animate-fadeInUp" style={{ animationDelay: '100ms' }}>Eligible for Panchakarma</h3>
            <p className="text-lg text-gray-600 mb-8 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              You appear fit for <strong className="text-green-600">Shodhan therapy</strong> (Deep Cellular Detox). A doctor's consultation is mandatory to finalize the procedure (Vaman/Virechan/Basti).
            </p>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-r-lg text-left mb-8 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
              <p className="text-green-800 font-medium">You have adequate strength (Bala) for deep purification. Our doctors will determine the best therapy for your constitution.</p>
            </div>
          </>
        )}

        <div className="animate-fadeInUp" style={{ animationDelay: '400ms' }}>
          <NavLink to="/booking" className="inline-block bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white px-10 py-4 rounded-full font-bold shadow-lg hover:from-ayur-accent hover:to-amber-500 transition-all hover:scale-[1.02] hover:shadow-xl">
            Book Doctor Assessment <ArrowRight size={18} className="inline ml-2" />
          </NavLink>
        </div>
        <div className="mt-6 animate-fadeInUp" style={{ animationDelay: '500ms' }}>
            <button onClick={onBack} className="text-sm text-gray-500 hover:text-ayur-green transition-colors hover:underline">Back to Tools</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-gradient-to-br from-orange-500 via-ayur-green to-ayur-green-dark text-white p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-ayur-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h2 className="font-serif text-3xl font-bold flex items-center gap-3">
            <Shield className="text-ayur-accent" /> Panchakarma Eligibility
          </h2>
          <p className="opacity-80 mt-2">Safety first. Check if you are ready for deep detox.</p>
        </div>
      </div>

      <div ref={questionsObserver.ref} className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full space-y-8">
        {PK_ELIGIBILITY_SECTIONS.map((section, sIdx) => (
          <div key={section.id} className="space-y-6 animate-fadeIn" style={{ animationDelay: `${sIdx * 150}ms` }}>
             <h3 className="font-bold text-ayur-accent uppercase tracking-widest text-xs border-b border-gray-100 pb-2 flex items-center gap-2">
               <Activity size={14} /> {section.title}
             </h3>
             {section.questions.map(q => (
               <div key={q.id} className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:border-ayur-accent/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                 <p className="font-bold text-ayur-green mb-4 text-lg">{q.text}</p>
                 <div className="space-y-3">
                   {q.options.map((opt, idx) => {
                     const isSelected = answers[q.id] === opt.value;
                     return (
                       <label key={idx} className={`flex items-center p-4 bg-white border-2 rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? 'border-ayur-accent bg-ayur-accent/5 shadow-md' : 'border-gray-200 hover:border-ayur-green hover:bg-ayur-cream/30'}`}>
                         <input 
                           type="radio" 
                           name={`pk-q-${q.id}`} 
                           className="w-5 h-5 text-ayur-accent focus:ring-ayur-accent"
                           onChange={() => handleSelect(q.id, String(opt.value))}
                         />
                         <span className={`ml-3 font-medium ${isSelected ? 'text-ayur-green' : 'text-gray-700'}`}>{opt.label}</span>
                       </label>
                     );
                   })}
                 </div>
               </div>
             ))}
          </div>
        ))}
      </div>

      <div className="p-6 bg-white border-t border-gray-100 text-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
           onClick={calculate}
           disabled={Object.keys(answers).length < 3}
           className="bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white px-10 py-4 rounded-full font-bold shadow-lg hover:from-ayur-accent hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] hover:shadow-xl flex items-center gap-2 mx-auto"
        >
           Check Eligibility <Shield size={18} />
        </button>
      </div>
    </div>
  );
};

export default PanchakarmaTool;