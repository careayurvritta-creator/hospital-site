import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { PRAKRITI_SECTIONS, DOSHA_ADVICE } from '../../constants';
import { ArrowRight, Check, Download, Loader2, Sparkles, AlertCircle, Wind, Flame, Droplets, Utensils, Coffee, Sun, Moon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import ShareResults from '../ShareResults';

interface PrakritiToolProps {
  onBack: () => void;
}

const PrakritiTool: React.FC<PrakritiToolProps> = ({ onBack }) => {
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<any>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const activeSection = PRAKRITI_SECTIONS[activeSectionIdx];

  const handleOptionSelect = (qId: number, dosha: string) => {
    setAnswers(prev => ({ ...prev, [qId]: dosha }));
  };

  const isSectionComplete = activeSection.questions.every(q => answers[q.id]);

  const nextSection = () => {
    if (activeSectionIdx < PRAKRITI_SECTIONS.length - 1) {
      setActiveSectionIdx(prev => prev + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    const scores = { Vata: 0, Pitta: 0, Kapha: 0 };
    Object.values(answers).forEach((dosha: string) => {
      // @ts-ignore
      if (scores[dosha] !== undefined) scores[dosha]++;
    });

    const total = Object.keys(answers).length;
    const vataPct = Math.round((scores.Vata / total) * 100);
    const pittaPct = Math.round((scores.Pitta / total) * 100);
    const kaphaPct = Math.round((scores.Kapha / total) * 100);

    let dominant = "Tridoshic";
    if (vataPct >= 45) dominant = "Vata Dominant";
    else if (pittaPct >= 45) dominant = "Pitta Dominant";
    else if (kaphaPct >= 45) dominant = "Kapha Dominant";
    else if (vataPct > 30 && pittaPct > 30) dominant = "Vata-Pitta";
    else if (pittaPct > 30 && kaphaPct > 30) dominant = "Pitta-Kapha";
    else if (vataPct > 30 && kaphaPct > 30) dominant = "Vata-Kapha";

    setResult({ scores: { Vata: vataPct, Pitta: pittaPct, Kapha: kaphaPct }, dominant });
    generateHealthAvatar(dominant, vataPct, pittaPct, kaphaPct);
  };

  const generateHealthAvatar = async (type: string, v: number, p: number, k: number) => {
    setGeneratingImage(true);
    setImageError(null);
    try {
      const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
      if (!apiKey) throw new Error("API Key missing");
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `A beautiful, artistic, abstract circular mandala illustration representing Ayurveda constitution: ${type}. 
      Composition: ${v}% Blue (Air/Space), ${p}% Red (Fire), ${k}% Green (Earth/Water). 
      Style: Watercolor, spiritual, healing, high quality, white background. 
      Symbolizing balance and health.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt,
      });
      
      const candidates = response.candidates;
      if (candidates && candidates[0].content.parts) {
         let found = false;
         for (const part of candidates[0].content.parts) {
            if (part.inlineData) {
               const base64Str = part.inlineData.data;
               setAvatarUrl(`data:image/png;base64,${base64Str}`);
               found = true;
               break;
            }
         }
         if (!found) {
           setImageError("Could not generate image visualization.");
         }
      } else {
        setImageError("No image generated.");
      }

    } catch (e) {
      console.error("Avatar gen failed", e);
      setImageError("Generation service unavailable.");
    } finally {
      setGeneratingImage(false);
    }
  };

  const getDoshaIcon = (dosha?: string) => {
    switch(dosha) {
      case 'Vata': return <Wind className="text-blue-400" size={32} />;
      case 'Pitta': return <Flame className="text-red-400" size={32} />;
      case 'Kapha': return <Droplets className="text-green-500" size={32} />;
      default: return <Sparkles className="text-ayur-gold" size={32} />;
    }
  };

  const getDoshaColor = (dosha?: string) => {
    switch(dosha) {
      case 'Vata': return 'border-blue-200 bg-blue-50/50 hover:border-blue-400 hover:bg-blue-50';
      case 'Pitta': return 'border-red-200 bg-red-50/50 hover:border-red-400 hover:bg-red-50';
      case 'Kapha': return 'border-green-200 bg-green-50/50 hover:border-green-400 hover:bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (result) {
    const data = [
      { name: 'Vata', value: result.scores.Vata, color: '#60A5FA' },
      { name: 'Pitta', value: result.scores.Pitta, color: '#EF4444' },
      { name: 'Kapha', value: result.scores.Kapha, color: '#10B981' },
    ];

    const advice = DOSHA_ADVICE[result.dominant] || DOSHA_ADVICE["Tridoshic"];

    return (
      <div className="animate-fadeIn max-w-5xl mx-auto p-4 md:p-8">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl font-bold text-ayur-green mb-2">Your Prakriti Report</h2>
          <p className="text-ayur-gold font-bold uppercase tracking-widest">Analysis Complete</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Left: Chart */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-ayur-subtle flex flex-col items-center">
            <h3 className="text-2xl font-serif font-bold text-center mb-6">{result.dominant}</h3>
            <div className="h-64 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                     {data.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                 <span className="text-xs text-gray-400 uppercase">Primary</span>
                 <span className="text-xl font-bold text-ayur-green">{result.dominant.split(' ')[0]}</span>
               </div>
            </div>
            
            <div className="flex justify-center gap-6 mt-6 w-full">
              {data.map(d => (
                <div key={d.name} className="text-center">
                  <div className="text-xs font-bold text-gray-500 mb-1">{d.name}</div>
                  <div className="w-12 h-1 rounded-full mx-auto mb-2" style={{backgroundColor: d.color}}></div>
                  <div className="font-bold text-lg">{d.value}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: AI Avatar */}
          <div className="bg-gradient-to-br from-ayur-green/5 to-ayur-gold/10 p-8 rounded-3xl border border-ayur-green/20 flex flex-col items-center justify-center relative overflow-hidden">
             <h3 className="font-serif text-xl font-bold text-ayur-green mb-4 flex items-center gap-2">
               <Sparkles size={20} className="text-ayur-gold" />
               Your Energy Avatar
             </h3>
             
             {generatingImage ? (
               <div className="flex flex-col items-center justify-center h-64 text-ayur-green">
                 <Loader2 size={40} className="animate-spin mb-4" />
                 <p className="text-sm font-medium animate-pulse">Designing your mandala...</p>
               </div>
             ) : avatarUrl ? (
               <div className="relative group animate-fadeIn">
                 <img src={avatarUrl} alt="Dosha Avatar" className="w-64 h-64 rounded-full shadow-2xl border-4 border-white object-cover" />
                 <a href={avatarUrl} download="my-prakriti-avatar.png" className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg hover:bg-ayur-gold hover:text-white transition-colors">
                   <Download size={20} />
                 </a>
               </div>
             ) : (
               <div className="w-64 h-64 rounded-full bg-white flex flex-col items-center justify-center text-gray-400 text-sm p-4 text-center border-2 border-dashed border-gray-300">
                 <AlertCircle size={32} className="mb-2 opacity-50"/>
                 {imageError || "Visual generation failed"}
               </div>
             )}
             
             <p className="text-center text-xs text-ayur-gray mt-6 max-w-xs italic opacity-80">
               "A visual representation of the elements balancing within you."
             </p>
          </div>
        </div>

        {/* Reward Section: Advice */}
        {advice && (
          <div className="bg-ayur-cream/30 rounded-3xl p-8 md:p-10 border border-ayur-subtle animate-fadeIn">
            <h3 className="font-serif text-3xl font-bold text-ayur-green mb-8 text-center">Your Personalized Wellness Plan</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Diet Column */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                    <Utensils size={20} />
                  </div>
                  <h4 className="font-bold text-xl text-ayur-gray">Dietary Guidelines (Ahara)</h4>
                </div>
                <ul className="space-y-4">
                  {advice.diet.map((tip, idx) => (
                    <li key={idx} className="flex items-start bg-white p-4 rounded-xl shadow-sm border border-ayur-subtle">
                      <Check size={18} className="text-green-500 mt-0.5 mr-3 shrink-0" />
                      <span className="text-sm text-gray-700 leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lifestyle Column */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700">
                    <Sun size={20} />
                  </div>
                  <h4 className="font-bold text-xl text-ayur-gray">Lifestyle Habits (Vihara)</h4>
                </div>
                <ul className="space-y-4">
                  {advice.lifestyle.map((tip, idx) => (
                    <li key={idx} className="flex items-start bg-white p-4 rounded-xl shadow-sm border border-ayur-subtle">
                      <Check size={18} className="text-orange-500 mt-0.5 mr-3 shrink-0" />
                      <span className="text-sm text-gray-700 leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Share Section */}
        <div className="mt-8 flex justify-center animate-fadeIn">
           <ShareResults 
             title="My Prakriti Assessment" 
             text={`I just discovered my Ayurveda Body Type at Ayurvritta Hospital! \n\nMy Constitution: ${result.dominant}\n(Vata: ${result.scores.Vata}%, Pitta: ${result.scores.Pitta}%, Kapha: ${result.scores.Kapha}%)`} 
           />
        </div>

        <div className="mt-12 flex justify-center gap-4">
          <button onClick={onBack} className="px-6 py-3 rounded-full border border-ayur-subtle hover:bg-gray-50 transition-colors">
            Back to Tools
          </button>
          <a href="/booking" className="px-8 py-3 rounded-full bg-ayur-green text-white font-bold hover:bg-ayur-gold transition-colors shadow-lg">
            Consult Dr. Sharma
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-ayur-green text-white p-6 md:p-8 flex justify-between items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
        <div className="relative z-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold">{activeSection.title}</h2>
          <p className="text-white/70 text-sm mt-1">{activeSection.description}</p>
        </div>
        <div className="text-right hidden sm:block relative z-10">
           <span className="text-3xl font-bold text-ayur-gold">0{activeSectionIdx + 1}</span>
           <span className="opacity-50 text-sm">/0{PRAKRITI_SECTIONS.length}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 w-full bg-gray-100">
        <div 
          className="h-full bg-ayur-gold transition-all duration-500 ease-out" 
          style={{width: `${((activeSectionIdx + 1) / PRAKRITI_SECTIONS.length) * 100}%`}}
        ></div>
      </div>

      {/* Questions */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full">
        <div className="space-y-10">
          {activeSection.questions.map((q) => (
            <div key={q.id} className="animate-fadeIn">
              <h3 className="font-medium text-xl text-ayur-green mb-6 flex items-center">
                 <span className="w-6 h-6 rounded-full bg-ayur-green/10 text-ayur-green text-xs flex items-center justify-center mr-3 font-bold">
                   {q.id}
                 </span>
                 {q.text}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {q.options.map((opt, idx) => {
                  const isSelected = answers[q.id] === opt.dosha;
                  const cardStyle = getDoshaColor(opt.dosha);
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(q.id, opt.dosha!)}
                      className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[140px] active:scale-95 ${
                        isSelected 
                        ? 'border-ayur-gold bg-ayur-gold/10 shadow-md ring-2 ring-ayur-gold' 
                        : cardStyle
                      }`}
                    >
                      {/* Background Icon Watermark */}
                      <div className={`absolute -bottom-4 -right-4 opacity-10 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12 ${isSelected ? 'opacity-20 scale-110' : ''}`}>
                         {getDoshaIcon(opt.dosha)}
                      </div>

                      <span className={`relative z-10 font-medium text-sm leading-relaxed ${isSelected ? 'text-ayur-green font-bold' : 'text-gray-700'}`}>
                        {opt.label}
                      </span>

                      {/* Selection Indicator */}
                      <div className="flex justify-between items-end mt-4 relative z-10">
                        <div className="opacity-80 scale-75 origin-bottom-left">
                            {getDoshaIcon(opt.dosha)}
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-ayur-gold rounded-full flex items-center justify-center shadow-sm animate-fadeIn">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Nav */}
      <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={onBack}
          className="text-gray-500 font-medium hover:text-ayur-green transition-colors px-4 py-2"
        >
          Cancel
        </button>
        <button
          onClick={nextSection}
          disabled={!isSectionComplete}
          className="flex items-center gap-2 bg-ayur-green text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-ayur-gold hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
        >
          {activeSectionIdx === PRAKRITI_SECTIONS.length - 1 ? 'Reveal My Prakriti' : 'Next Section'}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default PrakritiTool;