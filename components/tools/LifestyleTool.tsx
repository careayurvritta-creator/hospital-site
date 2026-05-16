import React, { useState } from 'react';

const LifestyleTool: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{score: number; level: string} | null>(null);

  const questions = [
    { text: "Age Group", options: ["Less than 35", "35-49", "50+"], values: [0, 20, 30] },
    { text: "Physical Activity", options: ["Regular exercise", "Moderate", "Sedentary"], values: [0, 10, 30] },
    { text: "Dietary Habits", options: ["Rarely", "Moderately", "Frequently"], values: [0, 10, 20] },
    { text: "Sleep Quality", options: ["Good (6-8hrs)", "Disturbed", "Excessive"], values: [0, 10, 10] },
    { text: "Stress Levels", options: ["Low", "Moderate", "High"], values: [0, 10, 20] }
  ];

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      const score = newAnswers.reduce((a, b) => a + b, 0);
      let level = "Low Risk";
      if (score >= 40) level = "Moderate Risk";
      if (score >= 90) level = "High Risk";
      setResult({ score, level });
    }
  };

  const q = questions[step];

  return (
    <div className="p-6 max-w-lg mx-auto">
      <button onClick={onBack} className="text-ayur-green font-semibold mb-6 flex items-center gap-2">
        ← Back
      </button>

      {!result ? (
        <>
          <div className="mb-6">
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-ayur-green rounded-full transition-all" style={{width: `${((step+1)/questions.length)*100}%`}} />
            </div>
            <p className="text-sm text-gray-500 mt-2">Question {step+1} of {questions.length}</p>
          </div>

          <h2 className="text-xl font-bold text-ayur-green mb-6">{q.text}</h2>

          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(q.values[i])}
                className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl text-left hover:border-ayur-green hover:bg-ayur-cream transition-all"
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-5xl font-bold text-ayur-accent mb-4">{result.score}</div>
          <p className={`text-xl font-bold mb-6 ${result.level === 'Low Risk' ? 'text-green-600' : result.level === 'Moderate Risk' ? 'text-yellow-600' : 'text-red-600'}`}>
            {result.level}
          </p>
          <button onClick={() => {setStep(0); setAnswers([]); setResult(null);}} className="bg-ayur-green text-white px-6 py-3 rounded-full font-bold">
            Retake
          </button>
        </div>
      )}
    </div>
  );
};

export default LifestyleTool;