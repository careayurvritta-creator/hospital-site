import React, { useState } from 'react';
import { useIntersectionObserver } from '../hooks';

const SimpleToolCard: React.FC<{
  title: string;
  desc: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, desc, icon, onClick }) => (
  <button 
    onClick={onClick} 
    className="bg-white p-6 rounded-2xl border shadow-md hover:shadow-lg transition-all w-full text-left"
  >
    <div className="w-12 h-12 bg-ayur-cream rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="font-bold text-ayur-green text-xl mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{desc}</p>
  </button>
);

const Tools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  const headerObserver = useIntersectionObserver({ threshold: 0.2 });

  const toolsData = [
    { id: 'lifestyle', title: "Lifestyle Risk Audit", desc: "Evaluate your metabolic risk based on IDRS and Ayurvedic lifestyle parameters.", icon: "⚠️" },
    { id: 'panchakarma', title: "Panchakarma Check", desc: "Check your eligibility for deep detoxification therapies based on Bala and Agni.", icon: "🛡️" },
    { id: 'meda', title: "BMI & Meda Dhatu", desc: "Analyze your body composition and adipose tissue quality using Indian-specific standards.", icon: "⚖️" },
    { id: 'saara', title: "Saara Pariksha", desc: "Assess the biological excellence of your 7 tissues (Dhatus) to understand your natural immunity.", icon: "🔮" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-ayur-cream via-white to-ayur-cream/30 pb-24">
      <section className="bg-gradient-to-br from-ayur-green to-ayur-green-dark pt-24 pb-20 text-white text-center p-8">
        <h1 className="font-serif text-4xl font-bold mb-4">
          Ayurveda <span className="text-ayur-accent">Health Tools</span>
        </h1>
        <p className="text-white/80">Interactive assessments for your wellbeing</p>
      </section>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {toolsData.map((tool) => (
            <SimpleToolCard 
              key={tool.id}
              title={tool.title}
              desc={tool.desc}
              icon={<span className="text-2xl">{tool.icon}</span>}
              onClick={() => setActiveTool(tool.id)}
            />
          ))}
        </div>

        {activeTool && (
          <div className="mt-8 p-8 bg-white rounded-2xl shadow-lg text-center">
            <h3 className="font-bold text-2xl text-ayur-green mb-4">Coming Soon</h3>
            <p className="text-gray-600 mb-6">This tool is under development.</p>
            <button 
              onClick={() => setActiveTool(null)}
              className="px-6 py-3 bg-ayur-green text-white rounded-full font-bold"
            >
              Back to Tools
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;