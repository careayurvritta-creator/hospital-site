import React, { useState, useEffect } from 'react';
import { LIFESTYLE_RISK_QUESTIONS } from '../../constants';
import { useIntersectionObserver } from '../../hooks';
import { Insight } from '../../types/index';
import Icons from '../Icons';

const LifestyleTool: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const questions = LIFESTYLE_RISK_QUESTIONS[0].questions;
  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const progressObserver = useIntersectionObserver({ threshold: 0.1 });
  const questionObserver = useIntersectionObserver({ threshold: 0.2 });
  const resultObserver = useIntersectionObserver({ threshold: 0.1 });

  const handleSelect = (questionId: number, value: number) => {
    setAnswers(prev => ({...prev, [questionId]: value}));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
        setIsTransitioning(false);
      }, 300);
    } else {
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestion(prev => prev - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const isCurrentQuestionAnswered = answers[questions[currentQuestion].id] !== undefined;

  useEffect(() => {
    if (showResult) {
      const finalScore = (Object.values(answers) as number[]).reduce((a, b) => Number(a) + Number(b), 0);
      const duration = 2000;
      const steps = 100;
      const increment = finalScore / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= finalScore) {
          setAnimatedScore(finalScore);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [showResult]);

  if (showResult) {
    const score = (Object.values(answers) as number[]).reduce((a, b) => Number(a) + Number(b), 0);
    
    let riskLevel = "Low Risk";
    let color = "text-green-600";
    let bg = "bg-green-50";
    let borderColor = "border-green-200";
    let gradient = "from-green-500 to-emerald-600";
    let iconBg = "from-green-100 to-green-200";
    let recommendation = "Maintain your current healthy lifestyle with regular exercise and balanced diet.";
    let dosha = "Kapha-Vata Balance";

    if (score >= 40 && score < 90) {
      riskLevel = "Moderate Risk";
      color = "text-yellow-600";
      bg = "bg-yellow-50";
      borderColor = "border-yellow-200";
      gradient = "from-yellow-500 to-orange-500";
      iconBg = "from-yellow-100 to-amber-200";
      dosha = "Kapha Predominance";
      recommendation = "Consider dietary modifications and increased physical activity. Early intervention can prevent progression.";
    } else if (score >= 90) {
      riskLevel = "High Metabolic Risk";
      color = "text-red-600";
      bg = "bg-red-50";
      borderColor = "border-red-200";
      gradient = "from-red-500 to-rose-600";
      iconBg = "from-red-100 to-rose-200";
      dosha = "Kapha-Medha Accumulation";
      recommendation = "Immediate lifestyle intervention recommended. Consult our specialists for personalized management.";
    }

    const insights: Insight[] = [];

    if ((answers[3] || 0) >= 20) {
      insights.push({
        icon: Icons.Activity,
        text: "Sedentary Lifestyle: Lack of movement increases 'Kapha' and 'Meda Dhatu' (fat tissue), leading to insulin resistance.",
        color: "text-blue-500 bg-blue-100"
      });
    }

    if ((answers[5] || 0) >= 10) {
      insights.push({
        icon: Icons.Coffee,
        text: "Dietary Indiscipline: Excess sweets/fried foods creates 'Ama' (toxins) that block metabolic channels (Srotas).",
        color: "text-amber-500 bg-amber-100"
      });
    }

    if ((answers[6] || 0) >= 10) {
      insights.push({
        icon: Icons.Moon,
        text: "Poor Sleep Hygiene: Disturbed sleep aggravates 'Vata', leading to hormonal imbalance and stress accumulation.",
        color: "text-indigo-500 bg-indigo-100"
      });
    }

    if ((answers[7] || 0) >= 10) {
      insights.push({
        icon: Icons.ShieldAlert,
        text: "High Stress: Psychological stress (Manasika Roga) directly impairs digestion (Agni) and immunity (Ojas).",
        color: "text-red-500 bg-red-100"
      });
    }

    if ((answers[2] || 0) >= 10) {
      insights.push({
        icon: Icons.AlertTriangle,
        text: "Abdominal Obesity: Central adiposity indicates 'Meda Dhatu' accumulation, causing Srotorodha (channel blockage).",
        color: "text-orange-500 bg-orange-100"
      });
    }

    if (insights.length === 0) {
      insights.push({
        icon: Icons.CheckCircle2,
        text: "Healthy Lifestyle: Your habits support proper Agni and balanced Doshas. Continue maintaining Swasthavritta.",
        color: "text-green-500 bg-green-100"
      });
    }

    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-ayur-green font-semibold mb-6 hover:gap-3 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
          </svg>
          Back to Tools
        </button>

        <div ref={resultObserver.ref} className={`space-y-8 ${resultObserver.isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-ayur-cream rounded-full mb-4">
              <Icons.Activity className="w-4 h-4 text-ayur-green" />
              <span className="text-sm font-semibold text-ayur-green">Assessment Complete</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-ayur-green mb-2">Your Risk Assessment</h2>
            <p className="text-ayur-gray">Based on {totalQuestions} clinical & Ayurvedic parameters</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
            <div className={`bg-gradient-to-r ${gradient} p-8 text-white text-center`}>
              <div className="relative inline-block">
                <svg className="w-48 h-48 md:w-56 md:h-56" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="12"/>
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="90" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(animatedScore / 150) * 565} 565`}
                    transform="rotate(-90 100 100)"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl md:text-6xl font-bold">{animatedScore}</span>
                  <span className="text-white/80 text-sm">out of 150</span>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className={`inline-flex items-center gap-3 px-6 py-3 ${bg} ${borderColor} border-2 rounded-2xl mb-6`}>
                <div className={`w-12 h-12 bg-gradient-to-br ${iconBg} rounded-full flex items-center justify-center`}>
                  {score < 40 ? (
                    <Icons.CheckCircle2 className={`w-6 h-6 ${color}`} />
                  ) : score < 90 ? (
                    <Icons.AlertTriangle className={`w-6 h-6 ${color}`} />
                  ) : (
                    <Icons.ShieldAlert className={`w-6 h-6 ${color}`} />
                  )}
                </div>
                <div>
                  <span className={`font-bold text-xl ${color}`}>{riskLevel}</span>
                  <p className="text-sm text-gray-600">{dosha}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-ayur-cream to-white p-6 rounded-2xl border border-ayur-subtle mb-8">
                <h4 className="font-bold text-ayur-green mb-2 flex items-center gap-2">
                  <Icons.Info className="w-5 h-5" />
                  Recommendation
                </h4>
                <p className="text-ayur-gray">{recommendation}</p>
              </div>

              <h4 className="font-bold text-ayur-green mb-4 text-lg">Ayurvedic Insights</h4>
              <div className="space-y-4">
                {insights.slice(0, 4).map((insight, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-start gap-4 p-4 rounded-xl animate-fadeInUp`}
                    style={{ 
                      backgroundColor: insight.color.replace('text-', '').replace('500', '50').replace('bg-', ''),
                      animationDelay: `${idx * 100}ms` 
                    }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${insight.color}`}>
                      {React.createElement(insight.icon, { className: "w-5 h-5" })}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{insight.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => {
                setAnswers({});
                setCurrentQuestion(0);
                setShowResult(false);
                setAnimatedScore(0);
              }}
              className="px-8 py-4 bg-ayur-cream text-ayur-green font-bold rounded-full hover:bg-ayur-green/10 transition-all hover:scale-105"
            >
              Retake Assessment
            </button>
            <button 
              onClick={onBack}
              className="px-8 py-4 bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white font-bold rounded-full hover:shadow-lg hover:shadow-ayur-green/30 transition-all hover:scale-105"
            >
              Explore Other Tools
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-ayur-green font-semibold hover:gap-3 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
          </svg>
          Exit
        </button>
        <div className="text-ayur-gray text-sm font-medium">
          Question {currentQuestion + 1} of {totalQuestions}
        </div>
      </div>

      <div ref={progressObserver.ref} className="mb-10">
        <div className="flex justify-between text-xs text-ayur-gray mb-2">
          <span>Progress</span>
          <span className="font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-ayur-green to-ayur-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div ref={questionObserver.ref}>
        <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-10' : 'opacity-100'}`}>
          <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-6 md:p-10 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-ayur-green/10 to-ayur-accent/10 rounded-2xl flex items-center justify-center">
                <Icons.Activity className="w-6 h-6 text-ayur-green" />
              </div>
              <span className="text-ayur-accent font-semibold text-sm uppercase tracking-wider">Assessment</span>
            </div>
            
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-ayur-green mb-3">
              {question.text}
            </h3>
            <p className="text-ayur-gray mb-8">
              Select the option that best describes you
            </p>

            <div className="space-y-4">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(question.id, option.value)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                    answers[question.id] === option.value
                      ? 'border-ayur-green bg-ayur-green/5 shadow-md'
                      : 'border-gray-100 hover:border-ayur-green/30 hover:bg-ayur-cream/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      answers[question.id] === option.value
                        ? 'border-ayur-green bg-ayur-green'
                        : 'border-gray-300'
                    }`}>
                      {answers[question.id] === option.value && (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 12l5 5L20 7"/>
                        </svg>
                      )}
                    </div>
                    <span className={`font-medium ${answers[question.id] === option.value ? 'text-ayur-green' : 'text-gray-700'}`}>
                      {option.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                currentQuestion === 0 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-ayur-green hover:bg-ayur-cream'
              }`}
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!isCurrentQuestionAnswered}
              className={`px-8 py-3 rounded-full font-bold transition-all ${
                !isCurrentQuestionAnswered
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white hover:shadow-lg hover:shadow-ayur-green/30 hover:scale-105'
              }`}
            >
              {currentQuestion === totalQuestions - 1 ? 'See Results →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-ayur-gray">
          <span className="flex items-center gap-1">
            <Icons.CheckCircle2 className="w-4 h-4 text-green-500" />
            Based on IDRS + Ayurveda
          </span>
          <span className="flex items-center gap-1">
            <Icons.Info className="w-4 h-4 text-ayur-accent" />
            {totalQuestions - Object.keys(answers).length} questions remaining
          </span>
        </div>
      </div>
    </div>
  );
};

export default LifestyleTool;