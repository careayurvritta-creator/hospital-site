import React, { useState } from 'react';
import { useIntersectionObserver } from '../hooks';

const AlertIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/><path d="M12 17h.01"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5 1.5 6 4.5 1.5-3 4-4.5 6-4.5a1 1 0 0 1 1 1z"/>
  </svg>
);

const ScaleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
  </svg>
);

const LayersIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);

const ToolCard: React.FC<{
  title: string;
  desc: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, desc, icon, onClick }) => (
  <button 
    onClick={onClick} 
    className="bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-ayur-green shadow-md hover:shadow-xl hover:-translate-y-1 transition-all w-full text-left"
  >
    <div className="w-14 h-14 bg-ayur-cream rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="font-bold text-xl text-ayur-green mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{desc}</p>
  </button>
);

const LifestyleToolContent = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{score: number; level: string} | null>(null);

  const questions = [
    { id: 1, text: "Age Group", options: [
      { label: "Less than 35 years", value: 0 },
      { label: "35 - 49 years", value: 20 },
      { label: "50 years or above", value: 30 }
    ]},
    { id: 2, text: "Physical Activity", options: [
      { label: "Regular vigorous exercise", value: 0 },
      { label: "Regular moderate exercise", value: 10 },
      { label: "Sedentary / No exercise", value: 30 }
    ]},
    { id: 3, text: "Dietary Habits", options: [
      { label: "Rarely (Once a week or less)", value: 0 },
      { label: "Moderately (2-3 times a week)", value: 10 },
      { label: "Frequently (Daily)", value: 20 }
    ]},
    { id: 4, text: "Sleep Quality", options: [
      { label: "Sound sleep (6-8 hours)", value: 0 },
      { label: "Disturbed sleep (<6 hours)", value: 10 },
      { label: "Excessive sleep (>9 hours)", value: 10 }
    ]},
    { id: 5, text: "Stress Levels", options: [
      { label: "Low / Manageable", value: 0 },
      { label: "Moderate", value: 10 },
      { label: "High (Constant stress)", value: 20 }
    ]}
  ];

  const handleSelect = (qId: number, val: number) => {
    setAnswers(prev => ({...prev, [qId]: val}));
    if (step < questions.length - 1) {
      setTimeout(() => setStep(s => s + 1), 300);
    }
  };

  const showResult = () => {
    const score = Object.values(answers).reduce((a, b) => a + b, 0);
    let level = "Low Risk";
    if (score >= 40) level = "Moderate Risk";
    if (score >= 90) level = "High Risk";
    setResult({ score, level });
  };

  const progress = ((step + 1) / questions.length) * 100;

  if (result) {
    return (
      <div className="p-8 text-center">
        <h3 className="font-bold text-2xl text-ayur-green mb-4">Your Risk Score</h3>
        <div className="text-5xl font-bold text-ayur-accent mb-2">{result.score}</div>
        <p className={`text-xl font-bold mb-6 ${result.level === 'Low Risk' ? 'text-green-600' : result.level === 'Moderate Risk' ? 'text-yellow-600' : 'text-red-600'}`}>
          {result.level}
        </p>
        <button onClick={onBack} className="bg-ayur-green text-white px-6 py-3 rounded-full font-bold">
          Back to Tools
        </button>
      </div>
    );
  }

  const q = questions[step];
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="h-2 bg-gray-100 rounded-full">
          <div className="h-full bg-ayur-green rounded-full transition-all" style={{width: `${progress}%`}} />
        </div>
        <p className="text-sm text-gray-500 mt-2">Question {step + 1} of {questions.length}</p>
      </div>

      <h3 className="font-bold text-xl text-ayur-green mb-6">{q.text}</h3>

      <div className="space-y-3">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(q.id, opt.value)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              answers[q.id] === opt.value 
                ? 'border-ayur-green bg-ayur-green/5' 
                : 'border-gray-200 hover:border-ayur-green'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {allAnswered && (
        <button onClick={showResult} className="w-full mt-6 bg-ayur-green text-white py-4 rounded-full font-bold">
          See Results
        </button>
      )}
    </div>
  );
};

const Tools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const headerObserver = useIntersectionObserver({ threshold: 0.2 });

  const toolsData = [
    { id: 'lifestyle', title: "Lifestyle Risk Audit", desc: "Calculate your metabolic risk based on IDRS + Ayurvedic parameters.", icon: <AlertIcon /> },
    { id: 'panchakarma', title: "Panchakarma Check", desc: "Check your eligibility for detoxification therapies.", icon: <ShieldIcon /> },
    { id: 'meda', title: "BMI & Meda Dhatu", desc: "Analyze body composition and adipose tissue.", icon: <ScaleIcon /> },
    { id: 'saara', title: "Saara Pariksha", desc: "Assess the 7 tissues (Dhatus) for immunity.", icon: <LayersIcon /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-ayur-cream to-white pb-24">
      <section className="bg-gradient-to-br from-ayur-green to-ayur-green-dark pt-20 pb-16 text-white text-center px-4">
        <h1 className="font-serif text-4xl font-bold mb-2">Ayurveda <span className="text-ayur-accent">Health Tools</span></h1>
        <p className="text-white/80">Interactive assessments for your wellbeing</p>
      </section>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        {!activeTool ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toolsData.map(tool => (
              <ToolCard key={tool.id} {...tool} onClick={() => setActiveTool(tool.id)} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <button onClick={() => setActiveTool(null)} className="text-ayur-green font-bold mb-4 flex items-center gap-2">
              ← Back to Tools
            </button>
            {activeTool === 'lifestyle' && <LifestyleToolContent onBack={() => setActiveTool(null)} />}
            {activeTool !== 'lifestyle' && (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg font-medium">Coming Soon</p>
                <p>This tool is under development</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;