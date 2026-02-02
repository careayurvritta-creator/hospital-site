import React, { useState } from 'react';
import { PK_ELIGIBILITY_SECTIONS } from '../../constants';
import { Shield, Check, XCircle, AlertCircle } from 'lucide-react';
import { NavLink } from '../Layout';

const PanchakarmaTool: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<string | null>(null);

  const handleSelect = (qId: number, val: string) => {
    setAnswers(prev => ({...prev, [qId]: val}));
  };

  const calculate = () => {
    // Logic: If any 'unfit' in contraindications -> Unfit
    // If 'shodhan' -> Shodhan suitable
    // If 'shaman' -> Palliative only
    
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
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
              <XCircle size={40} />
            </div>
            <h3 className="font-serif text-3xl font-bold text-ayur-green mb-4">Not Suitable for Panchakarma</h3>
            <p className="text-lg text-gray-600 mb-8">
              Based on your inputs, intense detoxification is currently <strong>unsafe</strong> for you. We recommend "Shamana Chikitsa" (Oral medication & external therapies) only.
            </p>
          </>
        )}

        {result === 'shaman' && (
          <>
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600">
              <AlertCircle size={40} />
            </div>
            <h3 className="font-serif text-3xl font-bold text-ayur-green mb-4">Shamana (Palliative) Recommended</h3>
            <p className="text-lg text-gray-600 mb-8">
              Your digestive fire (Agni) or stamina may not support rigorous cleansing right now. Start with gentle oral corrections and external massages.
            </p>
          </>
        )}

        {result === 'shodhan' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
              <Check size={40} />
            </div>
            <h3 className="font-serif text-3xl font-bold text-ayur-green mb-4">Eligible for Panchakarma</h3>
            <p className="text-lg text-gray-600 mb-8">
              You appear fit for Shodhan therapy (Deep Cellular Detox). A doctor's consultation is mandatory to finalize the procedure (Vaman/Virechan/Basti).
            </p>
          </>
        )}

        <NavLink to="/booking" className="inline-block bg-ayur-green text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-ayur-gold transition-colors">
          Book Doctor Assessment
        </NavLink>
        <div className="mt-4">
            <button onClick={onBack} className="text-sm text-gray-500 hover:text-ayur-green">Back to Tools</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-ayur-green text-white p-8">
        <h2 className="font-serif text-3xl font-bold">Panchakarma Eligibility</h2>
        <p className="opacity-80 mt-2">Safety first. Check if you are ready for deep detox.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full space-y-8">
        {PK_ELIGIBILITY_SECTIONS.map((section) => (
          <div key={section.id} className="space-y-6">
             <h3 className="font-bold text-ayur-gold uppercase tracking-widest text-xs border-b border-gray-100 pb-2">{section.title}</h3>
             {section.questions.map(q => (
               <div key={q.id} className="bg-gray-50 p-6 rounded-xl">
                 <p className="font-bold text-ayur-green mb-4">{q.text}</p>
                 <div className="space-y-3">
                   {q.options.map((opt, idx) => (
                     <label key={idx} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-ayur-green">
                       <input 
                         type="radio" 
                         name={`pk-q-${q.id}`} 
                         className="w-4 h-4 text-ayur-green focus:ring-ayur-green"
                         onChange={() => handleSelect(q.id, String(opt.value))}
                       />
                       <span className="ml-3 text-gray-700">{opt.label}</span>
                     </label>
                   ))}
                 </div>
               </div>
             ))}
          </div>
        ))}
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
        <button 
           onClick={calculate}
           disabled={Object.keys(answers).length < 3}
           className="bg-ayur-green text-white px-10 py-4 rounded-full font-bold shadow-lg hover:bg-ayur-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Check Eligibility
        </button>
      </div>
    </div>
  );
};

export default PanchakarmaTool;