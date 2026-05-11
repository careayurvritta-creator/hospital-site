import React, { useState } from 'react';
import { useIntersectionObserver } from '../hooks';

// Simple inline components for the tool - no external dependencies
const ToolCard: React.FC<{
  title: string;
  desc: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, desc, icon, onClick }) => (
  <button 
    onClick={onClick} 
    className="group relative flex flex-col items-start text-left bg-white p-6 md:p-8 rounded-3xl border-2 border-ayur-subtle hover:border-transparent shadow-sm hover:shadow-2xl hover:shadow-ayur-green/20 hover:-translate-y-3 transition-all duration-500 h-full relative overflow-hidden w-full min-h-[240px]"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-ayur-green/5 to-ayur-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
    <div className="relative z-10 w-16 h-16 bg-ayur-cream rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-all duration-500">
      {icon}
    </div>
    <h3 className="relative z-10 font-serif text-xl md:text-2xl font-bold text-ayur-green mb-3">{title}</h3>
    <p className="relative z-10 text-ayur-gray text-sm leading-relaxed mb-6">{desc}</p>
  </button>
);

const SimpleTool: React.FC<{ title: string; onBack: () => void; content: React.ReactNode }> = ({ title, onBack, content }) => (
  <div className="p-8">
    <div className="flex items-center gap-4 mb-8">
      <button onClick={onBack} className="p-2 hover:bg-ayur-cream rounded-lg transition-colors">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
      </button>
      <h2 className="font-serif text-2xl font-bold text-ayur-green">{title}</h2>
    </div>
    {content}
  </div>
);

const LifestyleRiskContent = () => (
  <div className="space-y-6">
    <div className="bg-ayur-cream p-6 rounded-2xl">
      <h3 className="font-bold text-ayur-green mb-4">Lifestyle Risk Assessment</h3>
      <p className="text-ayur-gray mb-4">This tool helps evaluate your metabolic risk based on daily habits.</p>
      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-ayur-green/5">
          <input type="radio" name="exercise" className="w-4 h-4 text-ayur-green" />
          <span>Regular exercise (30+ min/day)</span>
        </label>
        <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-ayur-green/5">
          <input type="radio" name="exercise" className="w-4 h-4 text-ayur-green" />
          <span>Minimal physical activity</span>
        </label>
        <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-ayur-green/5">
          <input type="radio" name="exercise" className="w-4 h-4 text-ayur-green" />
          <span>Sedentary lifestyle</span>
        </label>
      </div>
    </div>
    <button className="w-full bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white py-4 rounded-full font-bold">
      Calculate Risk Score
    </button>
  </div>
);

const PanchakarmaContent = () => (
  <div className="space-y-6">
    <div className="bg-ayur-cream p-6 rounded-2xl">
      <h3 className="font-bold text-ayur-green mb-4">Panchakarma Eligibility</h3>
      <p className="text-ayur-gray mb-4">Check if you're ready for detoxification therapies.</p>
      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer">
          <input type="radio" name="strength" className="w-4 h-4 text-ayur-green" />
          <span>Good - Can tolerate intensive therapies</span>
        </label>
        <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer">
          <input type="radio" name="strength" className="w-4 h-4 text-ayur-green" />
          <span>Moderate - Requires preparatory treatments</span>
        </label>
        <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer">
          <input type="radio" name="strength" className="w-4 h-4 text-ayur-green" />
          <span>Low - Not ready for Panchakarma</span>
        </label>
      </div>
    </div>
    <button className="w-full bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white py-4 rounded-full font-bold">
      Check Eligibility
    </button>
  </div>
);

const MedaContent = () => (
  <div className="space-y-6">
    <div className="bg-ayur-cream p-6 rounded-2xl">
      <h3 className="font-bold text-ayur-green mb-4">BMI & Body Composition</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-ayur-gray mb-2">Height (cm)</label>
          <input type="number" className="w-full p-4 bg-white border border-ayur-subtle rounded-xl" placeholder="170" />
        </div>
        <div>
          <label className="block text-sm font-bold text-ayur-gray mb-2">Weight (kg)</label>
          <input type="number" className="w-full p-4 bg-white border border-ayur-subtle rounded-xl" placeholder="70" />
        </div>
      </div>
    </div>
    <button className="w-full bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white py-4 rounded-full font-bold">
      Calculate BMI
    </button>
  </div>
);

const SaaraContent = () => (
  <div className="space-y-6">
    <div className="bg-ayur-cream p-6 rounded-2xl">
      <h3 className="font-bold text-ayur-green mb-4">Tissue Health Assessment</h3>
      <p className="text-ayur-gray mb-4">Evaluate the quality of your 7 body tissues (Dhatus).</p>
      <div className="space-y-3">
        <div className="p-3 bg-white rounded-lg">
          <span className="font-medium text-ayur-green">Rasa (Plasma)</span>
          <input type="range" className="w-full mt-2" min="1" max="10" defaultValue="7" />
        </div>
        <div className="p-3 bg-white rounded-lg">
          <span className="font-medium text-ayur-green">Rakta (Blood)</span>
          <input type="range" className="w-full mt-2" min="1" max="10" defaultValue="6" />
        </div>
        <div className="p-3 bg-white rounded-lg">
          <span className="font-medium text-ayur-green">Mamsa (Muscle)</span>
          <input type="range" className="w-full mt-2" min="1" max="10" defaultValue="5" />
        </div>
      </div>
    </div>
    <button className="w-full bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white py-4 rounded-full font-bold">
      Analyze Tissue Status
    </button>
  </div>
);

const AlertIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);

const ShieldIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5 1.5 6 4.5 1.5-3 4-4.5 6-4.5a1 1 0 0 1 1 1z"/></svg>
);

const ScaleIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
);

const LayersIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
);

const Tools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  const headerObserver = useIntersectionObserver({ threshold: 0.2, rootMargin: '-50px' });
  const cardsObserver = useIntersectionObserver({ threshold: 0.1, rootMargin: '-50px' });

  const toolsData = [
    { 
      id: 'risk',
      title: "Lifestyle Risk Audit", 
      desc: "Don't wait for symptoms. Evaluate your daily habits against clinical parameters to calculate your risk for Diabetes and metabolic disorders.",
      icon: <AlertIcon />,
      content: <LifestyleRiskContent />
    },
    { 
      id: 'panchakarma',
      title: "Panchakarma Check", 
      desc: "Are you ready for detox? Check your eligibility for intense purification therapies like Vamana & Virechana based on your strength (Bala).",
      icon: <ShieldIcon />,
      content: <PanchakarmaContent />
    },
    { 
      id: 'meda',
      title: "BMI & Meda Dhatu", 
      desc: "Go beyond the weighing scale. Analyze your visceral fat and adipose tissue quality to distinguish between healthy weight and metabolic stress.",
      icon: <ScaleIcon />,
      content: <MedaContent />
    },
    { 
      id: 'saara',
      title: "Saara Pariksha", 
      desc: "How strong is your foundation? Assess the biological excellence of your 7 tissues (Dhatus) to understand your natural immunity and vitality.",
      icon: <LayersIcon />,
      content: <SaaraContent />
    }
  ];

  const activeToolData = toolsData.find(t => t.id === activeTool);

  return (
    <div className="min-h-screen bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/30 pb-24">
      <section className="bg-gradient-to-br from-ayur-green via-[#0a6b5a] to-ayur-green-dark pt-24 pb-20 md:pt-36 md:pb-40 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-ayur-accent/30 to-transparent rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2" className="animate-pulse"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            <span className="text-sm font-semibold uppercase tracking-wider">Interactive Assessments</span>
          </div>
          
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight">
            Ayurveda <span className="text-transparent bg-clip-text bg-gradient-to-r from-ayur-accent to-yellow-300">Health Tools</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
            Ancient wisdom meets modern algorithms. Use these interactive assessments to understand your body type, risks, and therapeutic needs.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-ayur-cream to-transparent"></div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        {!activeTool ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolsData.map((tool, index) => (
              <div key={tool.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
                <ToolCard 
                  title={tool.title}
                  desc={tool.desc}
                  icon={tool.icon}
                  onClick={() => setActiveTool(tool.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] border-2 border-ayur-subtle hover:border-ayur-green/30 transition-all duration-500 animate-fadeInUp">
             <div className="md:hidden p-4 border-b border-gray-100 flex items-center text-ayur-green font-bold gap-2 hover:bg-ayur-cream/30 transition-colors cursor-pointer" onClick={() => setActiveTool(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                Back to Tools
             </div>
             {activeToolData && (
               <SimpleTool 
                 title={activeToolData.title} 
                 onBack={() => setActiveTool(null)} 
                 content={activeToolData.content}
               />
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;