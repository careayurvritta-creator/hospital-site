import React, { useState } from 'react';
import LifestyleTool from '../components/tools/LifestyleTool';

const AlertIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/><path d="M12 17h.01"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5 1.5 6 4.5 1.5-3 4-4.5 6-4.5a1 1 0 0 1 1 1z"/>
  </svg>
);

const ScaleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
  </svg>
);

const LayersIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);

const ToolCard: React.FC<{
  title: string;
  desc: string;
  icon: React.ReactNode;
  badge?: string;
  onClick: () => void;
}> = ({ title, desc, icon, badge, onClick }) => (
  <button 
    onClick={onClick} 
    className="group relative bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-ayur-green shadow-md hover:shadow-xl hover:-translate-y-1 transition-all w-full text-left"
  >
    {badge && (
      <span className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-ayur-accent to-amber-400 text-white text-xs font-bold rounded-full">
        {badge}
      </span>
    )}
    <div className="w-12 h-12 bg-ayur-cream rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="font-bold text-xl text-ayur-green mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{desc}</p>
  </button>
);

const Tools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const toolsData = [
    { 
      id: 'lifestyle', 
      title: "Lifestyle Risk Audit", 
      desc: "Comprehensive 15-question assessment with AI-powered analysis of your Ayurvedic constitution and health risks.",
      icon: <AlertIcon />,
      badge: "AI Enhanced"
    },
    { id: 'panchakarma', title: "Panchakarma Check", desc: "Check your eligibility for detoxification therapies.", icon: <ShieldIcon /> },
    { id: 'meda', title: "BMI & Meda Dhatu", desc: "Analyze body composition and adipose tissue.", icon: <ScaleIcon /> },
    { id: 'saara', title: "Saara Pariksha", desc: "Assess the 7 tissues (Dhatus) for immunity.", icon: <LayersIcon /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-ayur-cream to-white pb-24">
      <section className="bg-gradient-to-br from-ayur-green to-ayur-green-dark pt-20 pb-16 text-white text-center px-4">
        <h1 className="font-serif text-4xl font-bold mb-2">Ayurveda <span className="text-ayur-accent">Health Tools</span></h1>
        <p className="text-white/80">Interactive AI-powered assessments for your wellbeing</p>
      </section>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        {!activeTool ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toolsData.map(tool => (
              <ToolCard key={tool.id} {...tool} onClick={() => setActiveTool(tool.id)} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg">
            {activeTool === 'lifestyle' && <LifestyleTool onBack={() => setActiveTool(null)} />}
            {activeTool !== 'lifestyle' && (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg font-medium mb-2">Coming Soon</p>
                <p className="text-sm">This tool is under development</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;