import React, { useState, useEffect } from 'react';
import LifestyleTool from '../components/tools/LifestyleTool';
import PanchakarmaTool from '../components/tools/PanchakarmaTool';
import MedaTool from '../components/tools/MedaTool';
import SaaraTool from '../components/tools/SaaraTool';
import PrakritiTool from '../components/tools/PrakritiTool';
import DietChartTool from '../components/tools/DietChartTool';

const AlertIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/><path d="M12 17h.01"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5 1.5 6 4.5 1.5-3 4-4.5 6-4.5a1 1 0 0 1 1 1z"/>
  </svg>
);

const ScaleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
  </svg>
);

const LayersIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);

const DNAIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 15c6.667-6 13.333 0 20-6"/>
    <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/>
    <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/>
    <path d="m17 6-2.5-2.5"/>
    <path d="m14 8-1-1"/>
    <path d="m7 18 2.5 2.5"/>
    <path d="m3.5 14.5.5.5"/>
    <path d="m20 9 .5.5"/>
    <path d="m6.5 12.5 1 1"/>
    <path d="m16.5 10.5 1 1"/>
    <path d="m10 16 1.5 1.5"/>
  </svg>
);

const UtensilsIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
    <path d="M7 2v20"/>
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
  </svg>
);

const ToolCard: React.FC<{
  title: string;
  desc: string;
  icon: React.ReactNode;
  badge?: string;
  onClick: () => void;
  index: number;
}> = ({ title, desc, icon, badge, onClick, index }) => (
  <button 
    onClick={onClick} 
    className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-500 w-full text-left shadow-lg hover:shadow-2xl hover:shadow-ayur-green/15 hover:-translate-y-2"
    style={{ animationDelay: `${index * 150}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-ayur-green/5 via-transparent to-ayur-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    {badge && (
      <div className="absolute top-4 right-4 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-ayur-accent to-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          {badge}
        </span>
      </div>
    )}
    <div className="relative z-10 p-4 sm:p-6">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl">
        {icon}
      </div>
      <h3 className="font-serif text-lg sm:text-xl font-bold text-ayur-green mb-2 group-hover:text-ayur-green-dark transition-colors">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">{desc}</p>
      <div className="flex items-center gap-2 text-ayur-green font-semibold text-sm group-hover:gap-3 transition-all duration-300">
        <span>Start Assessment</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform">
          <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
        </svg>
      </div>
    </div>
    <div className="h-1 bg-gradient-to-r from-ayur-green via-ayur-accent to-ayur-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
  </button>
);

const Tools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toolsData = [
    { 
      id: 'lifestyle', 
      title: "Lifestyle Risk Audit", 
      desc: "Comprehensive 15-question assessment with Ayurvedic analysis of your constitution and health risks based on classical texts.",
      icon: <AlertIcon />,
      badge: "Active"
    },
    { 
      id: 'panchakarma', 
      title: "Panchakarma Check", 
      desc: "Check your eligibility for detoxification therapies (Vamana, Virechana, Basti) based on strength (Bala) and digestive fire (Agni).",
      icon: <ShieldIcon />,
      badge: "Active"
    },
    { 
      id: 'meda', 
      title: "BMI & Meda Dhatu", 
      desc: "Analyze body composition and adipose tissue quality using Indian standards and Charaka's 8 signs of Meda Vriddhi.",
      icon: <ScaleIcon />,
      badge: "Active"
    },
    { 
      id: 'saara', 
      title: "Saara Pariksha", 
      desc: "Assess the biological excellence of your 9 tissues (Dhatus) with scoring and personalized Rasayana recommendations.",
      icon: <LayersIcon />,
      badge: "Active"
    },
    { 
      id: 'prakriti', 
      title: "Prakriti Analysis", 
      desc: "Discover your innate constitution (Vata/Pitta/Kapha) with 18 classical parameters and AI-enhanced personalized analysis.",
      icon: <DNAIcon />,
      badge: "AI-Powered"
    },
    { 
      id: 'diet', 
      title: "Diet Chart Generator", 
      desc: "Generate a personalized daily Ayurvedic meal plan based on your Prakriti, health goals, season, and dietary preferences.",
      icon: <UtensilsIcon />,
      badge: "AI-Powered"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/30 pb-24">
      <section className="relative bg-gradient-to-br from-ayur-green via-[#0a6b5a] to-ayur-green-dark pt-24 pb-20 md:pt-32 md:pb-28 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-ayur-accent/30 to-transparent rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-ayur-green/10 to-ayur-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '0.7s' }}></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <div className={`inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2" className="animate-pulse">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">Interactive Assessments</span>
          </div>
          <h1 className={`font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Ayurveda <span className="text-transparent bg-clip-text bg-gradient-to-r from-ayur-accent to-yellow-300">Health Tools</span>
          </h1>
          <p className={`text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Ancient wisdom meets modern algorithms. Use these interactive assessments based on Charaka Samhita, Sushruta Samhita, and Ashtanga Hridayam to understand your body type, risks, and therapeutic needs.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-ayur-cream to-transparent"></div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        {!activeTool ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolsData.map((tool, index) => (
              <div 
                key={tool.id}
                className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${300 + index * 150}ms` }}
              >
                <ToolCard 
                  {...tool}
                  index={index}
                  onClick={() => setActiveTool(tool.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] border border-gray-100 transition-all duration-500 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="md:hidden p-4 border-b border-gray-100">
              <button 
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2 text-ayur-green font-bold text-sm hover:gap-3 transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
                </svg>
                Back to Tools
              </button>
            </div>
            {activeTool === 'lifestyle' && <LifestyleTool onBack={() => setActiveTool(null)} />}
            {activeTool === 'panchakarma' && <PanchakarmaTool onBack={() => setActiveTool(null)} />}
            {activeTool === 'meda' && <MedaTool onBack={() => setActiveTool(null)} />}
            {activeTool === 'saara' && <SaaraTool onBack={() => setActiveTool(null)} />}
            {activeTool === 'prakriti' && <PrakritiTool onBack={() => setActiveTool(null)} />}
            {activeTool === 'diet' && <DietChartTool onBack={() => setActiveTool(null)} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;
