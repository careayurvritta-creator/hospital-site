import React, { useState } from 'react';
import { Activity, AlertTriangle, Shield, Scale, Moon, ChevronRight, Utensils, Layers, ArrowLeft } from 'lucide-react';
import PrakritiTool from '../components/tools/PrakritiTool';
import LifestyleTool from '../components/tools/LifestyleTool';
import DietGenerator from '../components/tools/DietGenerator';
import MedaTool from '../components/tools/MedaTool';
import SaaraTool from '../components/tools/SaaraTool';
import PanchakarmaTool from '../components/tools/PanchakarmaTool';

// -- Component: Tool Card --
const ToolCard: React.FC<{
  title: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
  delay?: string;
}> = ({ title, desc, icon: Icon, color, onClick, delay = '0ms' }) => (
  <button 
    onClick={onClick} 
    style={{ animationDelay: delay }}
    className="group flex flex-col items-start text-left bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-ayur-subtle hover:shadow-xl hover:border-ayur-gold/50 transition-all duration-300 h-full relative overflow-hidden animate-fadeIn opacity-0 w-full min-h-[220px] active:scale-[0.98]"
  >
    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}>
      <Icon size={120} />
    </div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${color} bg-opacity-10 text-opacity-100`}>
      <Icon size={28} className={color.replace('bg-', 'text-').replace('/10', '')} />
    </div>
    <h3 className="font-serif text-xl md:text-2xl font-bold text-ayur-green mb-3 group-hover:text-ayur-gold transition-colors">{title}</h3>
    <p className="text-ayur-gray text-sm leading-relaxed mb-6">{desc}</p>
    <div className="mt-auto flex items-center text-xs font-bold uppercase tracking-widest text-ayur-green group-hover:text-ayur-gold bg-ayur-cream/50 px-4 py-2 rounded-full md:bg-transparent md:px-0 md:py-0">
      Start Tool <ChevronRight size={14} className="ml-1" />
    </div>
  </button>
);

// -- Main Hub Component --
const Tools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'prakriti': return <PrakritiTool onBack={() => setActiveTool(null)} />;
      case 'risk': return <LifestyleTool onBack={() => setActiveTool(null)} />;
      case 'diet': return <DietGenerator onBack={() => setActiveTool(null)} />;
      case 'meda': return <MedaTool onBack={() => setActiveTool(null)} />;
      case 'saara': return <SaaraTool onBack={() => setActiveTool(null)} />;
      case 'panchakarma': return <PanchakarmaTool onBack={() => setActiveTool(null)} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-ayur-cream pb-24">
      
      {/* Header */}
      <div className="bg-ayur-green pt-24 pb-16 md:pt-36 md:pb-32 text-center text-white relative overflow-hidden transition-all duration-500">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4 md:mb-6">Ayurveda Health Tools</h1>
          <p className="text-lg md:text-xl text-ayur-cream/80 leading-relaxed max-w-2xl mx-auto">
            Ancient wisdom meets modern algorithms. Use these interactive assessments to understand your body type, risks, and therapeutic needs.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 md:-mt-16 relative z-20">
        {!activeTool ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <ToolCard 
              title="Prakriti Assessment" 
              desc="Decode your DNA the Ayurvedic way. Discover your unique Dosha constitution and receive a personalized wellness roadmap plus an AI-generated energy avatar."
              icon={Activity}
              color="bg-ayur-gold"
              onClick={() => setActiveTool('prakriti')}
              delay="0ms"
            />
            <ToolCard 
              title="Lifestyle Risk Audit" 
              desc="Don't wait for symptoms. Evaluate your daily habits against clinical parameters to calculate your risk for Diabetes and metabolic disorders."
              icon={AlertTriangle}
              color="bg-red-500"
              onClick={() => setActiveTool('risk')}
              delay="100ms"
            />
             <ToolCard 
              title="Panchakarma Check" 
              desc="Are you ready for detox? Check your eligibility for intense purification therapies like Vamana & Virechana based on your strength (Bala)."
              icon={Shield}
              color="bg-orange-500"
              onClick={() => setActiveTool('panchakarma')}
              delay="150ms"
            />
            <ToolCard 
              title="BMI & Meda Dhatu" 
              desc="Go beyond the weighing scale. Analyze your visceral fat and adipose tissue quality to distinguish between healthy weight and metabolic stress."
              icon={Scale}
              color="bg-blue-500"
              onClick={() => setActiveTool('meda')}
              delay="200ms"
            />
             <ToolCard 
              title="Saara Pariksha" 
              desc="How strong is your foundation? Assess the biological excellence of your 7 tissues (Dhatus) to understand your natural immunity and vitality."
              icon={Layers}
              color="bg-purple-600"
              onClick={() => setActiveTool('saara')}
              delay="300ms"
            />
            <ToolCard 
              title="AI Diet Planner" 
              desc="Your food is your medicine. Generate a location-specific, season-adjusted daily menu and food guide tailored precisely to your health condition."
              icon={Utensils}
              color="bg-green-600"
              onClick={() => setActiveTool('diet')}
              delay="400ms"
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] border border-ayur-subtle animate-fadeIn transition-all duration-500 ease-in-out">
             {/* Mobile Back Button visible only when tool is active */}
             <div className="md:hidden p-4 border-b border-gray-100 flex items-center text-ayur-green font-bold" onClick={() => setActiveTool(null)}>
                <ArrowLeft size={20} className="mr-2"/> Back to Tools
             </div>
             {renderActiveTool()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;