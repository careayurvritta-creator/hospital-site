import React, { useState } from 'react';
import { Activity, AlertTriangle, Shield, Scale, ChevronRight, Utensils, Layers, ArrowLeft, Sparkles } from 'lucide-react';
import { useIntersectionObserver } from '../hooks';
import LifestyleTool from '../components/tools/LifestyleTool';
import MedaTool from '../components/tools/MedaTool';
import SaaraTool from '../components/tools/SaaraTool';
import PanchakarmaTool from '../components/tools/PanchakarmaTool';

const ToolCard: React.FC<{
  title: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  iconBg: string;
  onClick: () => void;
  delay: string;
  gradient: string;
}> = ({ title, desc, icon: Icon, color, iconBg, onClick, delay, gradient }) => (
  <button 
    onClick={onClick} 
    style={{ animationDelay: delay }}
    className={`group relative flex flex-col items-start text-left bg-white p-6 md:p-8 rounded-3xl border-2 border-ayur-subtle hover:border-transparent shadow-sm hover:shadow-2xl hover:shadow-ayur-green/20 hover:-translate-y-3 transition-all duration-500 h-full relative overflow-hidden animate-fadeInUp opacity-0 w-full min-h-[240px]`}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
      <Icon size={140} />
    </div>
    <div className={`relative z-10 w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
      <Icon size={30} className={color} />
    </div>
    <h3 className="relative z-10 font-serif text-xl md:text-2xl font-bold text-ayur-green mb-3 group-hover:text-white transition-colors duration-300">{title}</h3>
    <p className="relative z-10 text-ayur-gray text-sm leading-relaxed mb-6 group-hover:text-white/90 transition-colors duration-300">{desc}</p>
    <div className="mt-auto flex items-center text-xs font-bold uppercase tracking-widest text-ayur-green group-hover:text-white bg-ayur-cream/50 px-4 py-2 rounded-full md:bg-transparent md:px-0 md:py-0 group-hover:bg-white/20">
      Start Tool <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
    </div>
  </button>
);

const Tools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  const headerObserver = useIntersectionObserver({ threshold: 0.2, rootMargin: '-50px' });
  const cardsObserver = useIntersectionObserver({ threshold: 0.1, rootMargin: '-50px' });

  const renderTool = () => {
    switch (activeTool) {
      case 'risk':
        return <LifestyleTool onBack={() => setActiveTool(null)} />;
      case 'meda':
        return <MedaTool onBack={() => setActiveTool(null)} />;
      case 'saara':
        return <SaaraTool onBack={() => setActiveTool(null)} />;
      case 'panchakarma':
        return <PanchakarmaTool onBack={() => setActiveTool(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/30 pb-24">
      <section ref={headerObserver.ref} className="bg-gradient-to-br from-ayur-green via-[#0a6b5a] to-ayur-green-dark pt-24 pb-20 md:pt-36 md:pb-40 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-ayur-accent/30 to-transparent rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-white/5 to-transparent rounded-full"></div>
        
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0c-5 0-10 5-10 15s5 15 10 15 10 15 10-5 10-15-5-15-10-15zm0 40c-5 0-10 5-10 15s5 15 10 15 10-5 10-15-5-15-10-15z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>

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
            <ToolCard 
              title="Lifestyle Risk Audit" 
              desc="Don't wait for symptoms. Evaluate your daily habits against clinical parameters to calculate your risk for Diabetes and metabolic disorders."
              icon={AlertTriangle}
              color="text-red-500"
              iconBg="bg-red-100"
              gradient="from-red-500 to-rose-500"
              onClick={() => setActiveTool('risk')}
              delay="0ms"
            />
            <ToolCard 
              title="Panchakarma Check" 
              desc="Are you ready for detox? Check your eligibility for intense purification therapies like Vamana & Virechana based on your strength (Bala)."
              icon={Shield}
              color="text-orange-600"
              iconBg="bg-orange-100"
              gradient="from-orange-500 to-amber-500"
              onClick={() => setActiveTool('panchakarma')}
              delay="100ms"
            />
            <ToolCard 
              title="BMI & Meda Dhatu" 
              desc="Go beyond the weighing scale. Analyze your visceral fat and adipose tissue quality to distinguish between healthy weight and metabolic stress."
              icon={Scale}
              color="text-blue-600"
              iconBg="bg-blue-100"
              gradient="from-blue-500 to-cyan-500"
              onClick={() => setActiveTool('meda')}
              delay="150ms"
            />
            <ToolCard 
              title="Saara Pariksha" 
              desc="How strong is your foundation? Assess the biological excellence of your 7 tissues (Dhatus) to understand your natural immunity and vitality."
              icon={Layers}
              color="text-purple-600"
              iconBg="bg-purple-100"
              gradient="from-purple-500 to-violet-600"
              onClick={() => setActiveTool('saara')}
              delay="200ms"
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] border-2 border-ayur-subtle hover:border-ayur-green/30 transition-all duration-500 animate-fadeInUp">
             <div className="md:hidden p-4 border-b border-gray-100 flex items-center text-ayur-green font-bold gap-2 hover:bg-ayur-cream/30 transition-colors cursor-pointer" onClick={() => setActiveTool(null)}>
                <ArrowLeft size={20}/> Back to Tools
             </div>
             {renderTool()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;