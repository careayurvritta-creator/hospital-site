import React, { useState } from 'react';
import { PK_ELIGIBILITY_SECTIONS } from '../../constants';
import { useIntersectionObserver } from '../../hooks';
import Icons from '../Icons';

const PanchakarmaTool: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const questions = PK_ELIGIBILITY_SECTIONS[0].questions;
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const resultObserver = useIntersectionObserver({ threshold: 0.1 });

  const handleSelect = (qId: number, val: string) => {
    setAnswers(prev => ({...prev, [qId]: val}));
  };

  const calculate = () => {
    if (answers[1] === 'unfit') {
      setResult("contraindicated");
    } else if (answers[2] === 'shaman' || answers[3] === 'shaman') {
      setResult("shaman");
    } else {
      setResult("shodhan");
    }
    setShowResult(true);
  };

  const isReady = answeredCount === totalQuestions;

  if (showResult && result) {
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
              <Icons.Shield className="w-4 h-4 text-ayur-green" />
              <span className="text-sm font-semibold text-ayur-green">Assessment Complete</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-ayur-green mb-2">Your Panchakarma Eligibility</h2>
            <p className="text-ayur-gray">Based on {totalQuestions} Ayurvedic readiness parameters</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
            {result === 'contraindicated' && (
              <>
                <div className="bg-gradient-to-r from-red-500 to-rose-600 p-8 text-white text-center">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Icons.XCircle className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold">Not Suitable for Panchakarma</h3>
                </div>
                <div className="p-8">
                  <p className="text-gray-600 mb-6 text-lg">
                    Based on your inputs, intense detoxification is currently <strong className="text-red-600">unsafe</strong> for you. We recommend <strong>"Shamana Chikitsa"</strong> (Palliative treatment with oral medication & external therapies) only.
                  </p>
                  <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl">
                    <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                      <Icons.AlertCircle className="w-5 h-5" />
                      Contraindications Detected
                    </h4>
                    <p className="text-red-700">Please consult our doctors for safe alternative treatments. Your body needs preparation before undergoing purification therapies.</p>
                  </div>
                </div>
              </>
            )}

            {result === 'shaman' && (
              <>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-8 text-white text-center">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Icons.AlertCircle className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold">Shamana (Palliative) Recommended</h3>
                </div>
                <div className="p-8">
                  <p className="text-gray-600 mb-6 text-lg">
                    Your digestive fire (Agni) or stamina may not support rigorous cleansing right now. Start with gentle oral corrections and external massages before attempting detox.
                  </p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-xl">
                    <h4 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
                      <Icons.Info className="w-5 h-5" />
                      Recommended Approach
                    </h4>
                    <ul className="space-y-3 text-yellow-700">
                      <li className="flex items-start gap-2">
                        <Icons.Check className="w-5 h-5 mt-0.5 shrink-0" />
                        <span><strong>Abhyanga</strong> - Therapeutic oil massage</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icons.Check className="w-5 h-5 mt-0.5 shrink-0" />
                        <span><strong>Swedana</strong> - Herbal steam therapy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icons.Check className="w-5 h-5 mt-0.5 shrink-0" />
                        <span><strong>Gentle herbal formulations</strong> to build up strength</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            )}

            {result === 'shodhan' && (
              <>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Icons.CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold">Eligible for Panchakarma</h3>
                </div>
                <div className="p-8">
                  <p className="text-gray-600 mb-6 text-lg">
                    You appear fit for <strong className="text-green-600">Shodhan therapy</strong> (Deep Cellular Detox). A doctor's consultation is mandatory to finalize the procedure.
                  </p>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-r-xl">
                    <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                      <Icons.ShieldCheck className="w-5 h-5" />
                      You Have Adequate Strength (Bala)
                    </h4>
                    <p className="text-green-700 mb-4">Our doctors will determine the best therapy for your constitution:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-green-200 text-center">
                        <span className="text-2xl mb-2 block">🤮</span>
                        <span className="font-semibold text-green-800">Vamana</span>
                        <p className="text-xs text-green-600">Therapeutic Emesis</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-green-200 text-center">
                        <span className="text-2xl mb-2 block">💊</span>
                        <span className="font-semibold text-green-800">Virechana</span>
                        <p className="text-xs text-green-600">Therapeutic Purgation</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-green-200 text-center">
                        <span className="text-2xl mb-2 block">🧘</span>
                        <span className="font-semibold text-green-800">Basti</span>
                        <p className="text-xs text-green-600">Medicated Enema</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => {
                setAnswers({});
                setResult(null);
                setShowResult(false);
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
          {answeredCount} of {totalQuestions} answered
        </div>
      </div>

      <div className="mb-10">
        <div className="flex justify-between text-xs text-ayur-gray mb-2">
          <span className="flex items-center gap-2">
            <Icons.Shield className="w-4 h-4" />
            Eligibility Progress
          </span>
          <span className="font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-ayur-accent to-orange-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-6 md:p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center">
            <Icons.Shield className="w-6 h-6 text-orange-600" />
          </div>
          <span className="text-orange-600 font-semibold text-sm uppercase tracking-wider">Panchakarma Readiness</span>
        </div>

        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="animate-fadeInUp">
              <p className="font-bold text-ayur-green mb-3 text-lg">{q.text}</p>
              <div className="space-y-3">
                {q.options.map((opt, idx) => {
                  const isSelected = answers[q.id] === opt.value;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(q.id, opt.value)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.01] ${
                        isSelected
                          ? 'border-ayur-accent bg-ayur-accent/5 shadow-md'
                          : 'border-gray-100 hover:border-ayur-green/30 hover:bg-ayur-cream/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-ayur-accent bg-ayur-accent'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M5 12l5 5L20 7"/>
                            </svg>
                          )}
                        </div>
                        <span className={`font-medium ${isSelected ? 'text-ayur-green' : 'text-gray-700'}`}>
                          {opt.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={calculate}
        disabled={!isReady}
        className={`w-full py-4 rounded-full font-bold text-lg transition-all ${
          !isReady
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white hover:shadow-lg hover:shadow-ayur-green/30 hover:scale-[1.02]'
        }`}
      >
        {isReady ? 'Check Eligibility' : `Answer all ${totalQuestions} questions`}
      </button>
    </div>
  );
};

export default PanchakarmaTool;