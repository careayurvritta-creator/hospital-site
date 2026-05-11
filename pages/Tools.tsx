import React, { useState, Suspense, lazy } from 'react';
import { ChevronRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useIntersectionObserver } from '../hooks';

const LifestyleTool = lazy(() => import('../components/tools/LifestyleTool'));
const MedaTool = lazy(() => import('../components/tools/MedaTool'));
const SaaraTool = lazy(() => import('../components/tools/SaaraTool'));
const PanchakarmaTool = lazy(() => import('../components/tools/PanchakarmaTool'));

const toolComponents: Record<string, React.ComponentType<{ onBack: () => void }>> = {
  'risk': LifestyleTool,
  'meda': MedaTool,
  'saara': SaaraTool,
  'panchakarma': PanchakarmaTool,
};

const AlertTriangleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5 1.5 6 4.5 1.5-3 4-4.5 6-4.5a1 1 0 0 1 1 1z"/></svg>
);

const ScaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
);

const LayersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
);

const AlertTriangleIconLarge = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 opacity-20"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);

const ShieldIconLarge = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600 opacity-20"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5 1.5 6 4.5 1.5-3 4-4.5 6-4.5a1 1 0 0 1 1 1z"/></svg>
);

const ScaleIconLarge = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 opacity-20"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
);

const LayersIconLarge = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 opacity-20"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
);

const toolsData = [
  { 
    id: 'risk',
    title: "Lifestyle Risk Audit", 
    desc: "Don't wait for symptoms. Evaluate your daily habits against clinical parameters to calculate your risk for Diabetes and metabolic disorders.",
    icon: AlertTriangleIcon,
    iconLarge: AlertTriangleIconLarge,
    color: "text-red-500",
    iconBg: "bg-red-100",
    gradient: "from-red-500 to-rose-500"
  },
  { 
    id: 'panchakarma',
    title: "Panchakarma Check", 
    desc: "Are you ready for detox? Check your eligibility for intense purification therapies like Vamana & Virechana based on your strength (Bala).",
    icon: ShieldIcon,
    iconLarge: ShieldIconLarge,
    color: "text-orange-600",
    iconBg: "bg-orange-100",
    gradient: "from-orange-500 to-amber-500"
  },
  { 
    id: 'meda',
    title: "BMI & Meda Dhatu", 
    desc: "Go beyond the weighing scale. Analyze your visceral fat and adipose tissue quality to distinguish between healthy weight and metabolic stress.",
    icon: ScaleIcon,
    iconLarge: ScaleIconLarge,
    color: "text-blue-600",
    iconBg: "bg-blue-100",
    gradient: "from-blue-500 to-cyan-500"
  },
  { 
    id: 'saara',
    title: "Saara Pariksha", 
    desc: "How strong is your foundation? Assess the biological excellence of your 7 tissues (Dhatus) to understand your natural immunity and vitality.",
    icon: LayersIcon,
    iconLarge: LayersIconLarge,
    color: "text-purple-600",
    iconBg: "bg-purple-100",
    gradient: "from-purple-500 to-violet-600"
  }
];

const ToolCard: React.FC<{
  title: string;
  desc: string;
  IconComponent: React.ComponentType;
  IconLargeComponent: React.ComponentType;
  color: string;
  iconBg: string;
  onClick: () => void;
  delay: string;
  gradient: string;
}> = ({ title, desc, IconComponent, IconLargeComponent, color, iconBg, onClick, delay, gradient }) => {
  return (
    <button 
      onClick={onClick} 
      style={{ animationDelay: delay }}
      className={`group relative flex flex-col items-start text-left bg-white p-6 md:p-8 rounded-3xl border-2 border-ayur-subtle hover:border-transparent shadow-sm hover:shadow-2xl hover:shadow-ayur-green/20 hover:-translate-y-3 transition-all duration-500 h-full relative overflow-hidden animate-fadeInUp opacity-0 w-full min-h-[240px]`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
        <IconLargeComponent />
      </div>
      <div className={`relative z-10 w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
        <IconComponent />
      </div>
      <h3 className="relative z-10 font-serif text-xl md:text-2xl font-bold text-ayur-green mb-3 group-hover:text-white transition-colors duration-300">{title}</h3>
      <p className="relative z-10 text-ayur-gray text-sm leading-relaxed mb-6 group-hover:text-white/90 transition-colors duration-300">{desc}</p>
      <div className="mt-auto flex items-center text-xs font-bold uppercase tracking-widest text-ayur-green group-hover:text-white bg-ayur-cream/50 px-4 py-2 rounded-full md:bg-transparent md:px-0 md:py-0 group-hover:bg-white/20">
        Start Tool <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

const ToolLoader = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-[#009688]/20 border-t-[#009688] rounded-full animate-spin"></div>
      <p className="text-[#1A3C34]/70 font-medium">Loading tool...</p>
    </div>
  </div>
);

const Tools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  const headerObserver = useIntersectionObserver({ threshold: 0.2, rootMargin: '-50px' });
  const cardsObserver = useIntersectionObserver({ threshold: 0.1, rootMargin: '-50px' });

  const ActiveToolComponent = activeTool ? toolComponents[activeTool] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/30 pb-24">
      <section ref={headerObserver.ref} className="bg-gradient-to-br from-ayur-green via-[#0a6b5a] to-ayur-green-dark pt-24 pb-20 md:pt-36 md:pb-40 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-ayur-accent/30 to-transparent rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        <div className={`max-w-4xl mx-auto px-4 relative z-10 text-center ${headerObserver.isVisible ? 'animate-fadeInUp' : ''}`}>
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
            <Sparkles size={18} className="text-ayur-accent animate-pulse" />
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

      <div ref={cardsObserver.ref} className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        {!activeTool ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolsData.map((tool, index) => (
              <ToolCard 
                key={tool.id}
                title={tool.title}
                desc={tool.desc}
                IconComponent={tool.icon}
                IconLargeComponent={tool.iconLarge}
                color={tool.color}
                iconBg={tool.iconBg}
                onClick={() => setActiveTool(tool.id)}
                delay={`${index * 100}ms`}
                gradient={tool.gradient}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] border-2 border-ayur-subtle hover:border-ayur-green/30 transition-all duration-500 animate-fadeInUp">
             <div className="md:hidden p-4 border-b border-gray-100 flex items-center text-ayur-green font-bold gap-2 hover:bg-ayur-cream/30 transition-colors cursor-pointer" onClick={() => setActiveTool(null)}>
                <ArrowLeft size={20}/> Back to Tools
             </div>
             <Suspense fallback={<ToolLoader />}>
               {ActiveToolComponent && <ActiveToolComponent onBack={() => setActiveTool(null)} />}
             </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;