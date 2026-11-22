/**
 * AI-Powered Skin Disease Second Opinion Tool (Redesigned)
 * Follows PrakritiTool.tsx pattern for AI integration with modern, accessible UI
 */

import React, { useState, useEffect, useRef } from 'react';
import { aiService } from '../../lib/aiService';
import { Counter } from '../ui/reactbits';
import { Leaf, Sparkles, ShieldCheck, Stethoscope, Heart, Brain, Sun, Moon, Clock, Thermometer, Check, AlertCircle, Loader2, RefreshCw, BookOpen, Calendar } from 'lucide-react';

interface SkinQuestion {
  id: number;
  category: string;
  sanskrit: string;
  text: string;
  icon: React.ElementType;
  options: { label: string; value: string; effect: string }[];
}

const questions: SkinQuestion[] = [
  {
    id: 1,
    category: 'Skin Condition Type',
    sanskrit: 'Tvak Vikara',
    text: 'What is your primary skin concern?',
    icon: ShieldCheck,
    options: [
      { label: 'Acne/Blemishes (Yauvan Pidika)', value: 'acne', effect: 'Pitta-Kapha imbalance affecting follicles' },
      { label: 'Eczema/Itchy Rash (Vicharchika)', value: 'eczema', effect: 'Vata-Pitta aggravation, skin barrier weakness' },
      { label: 'Dryness/Peeling (Rakta Rusya)', value: 'dry', effect: 'Vata disturbance, inadequate oil-sebum balance' },
      { label: 'Psoriasis/Patches (Kitibha)', value: 'psoriasis', effect: 'Kapha-Vata obstruction, Ama accumulation' },
      { label: 'Pigmentation (Vyanga)', value: 'pigmentation', effect: 'Pitta-Rakta vitiation, digestive influence' },
      { label: 'Other / General', value: 'other', effect: 'Complex presentation, needs detailed assessment' }
    ]
  },
  {
    id: 2,
    category: 'Symptom Severity',
    sanskrit: 'Kampa Vikara',
    text: 'How would you rate the severity of your symptoms?',
    icon: Thermometer,
    options: [
      { label: 'Mild - Occasional flaking or small blemishes', value: 'mild', effect: 'Early stage, manageable with lifestyle correction' },
      { label: 'Moderate - Regular flares, some discomfort', value: 'moderate', effect: 'Needs targeted Ayurvedic protocol, 2-4 weeks' },
      { label: 'Severe - Daily discomfort, visible inflammation', value: 'severe', effect: 'Requires physician supervision, possible Panchakarma' }
    ]
  },
  {
    id: 3,
    category: 'Duration',
    sanskrit: 'Kala',
    text: 'How long have you been experiencing these symptoms?',
    icon: Calendar,
    options: [
      { label: 'Less than 1 month (acute)', value: 'acute', effect: 'Recent onset, strong Agni (digestive fire) balance possible' },
      { label: '1-6 months (subacute)', value: 'subacute', effect: 'Established pattern, requires purification before treatment' },
      { label: 'More than 6 months (chronic)', value: 'chronic', effect: 'Deep tissue involvement, comprehensive detoxification needed' }
    ]
  },
  {
    id: 4,
    category: 'Triggers',
    sanskrit: 'Sambandha',
    text: 'What seems to trigger flare-ups?',
    icon: Sun,
    options: [
      { label: 'Dietary - spicy, fried, dairy-heavy foods', value: 'diet', effect: 'Pitta aggravation, requires diet correction (Viraha Ahara)' },
      { label: 'Stress or emotional factors', value: 'stress', effect: 'Vata disturbance, needs calming therapies (Shirodhara)' },
      { label: 'Weather changes (cold/dry or hot/humid)', value: 'weather', effect: 'Dosha imbalance due to external factors, seasonal care (Ritu Charya)' },
      { label: 'Menstrual cycle / hormonal changes', value: 'hormonal', effect: 'Rakta and Pitta involvement, liver support needed' },
      { label: 'Not sure / multiple factors', value: 'complex', effect: 'Multifactorial condition, requires detailed history' }
    ]
  },
  {
    id: 6,
    category: 'Digestive Health',
    sanskrit: 'Agni',
    text: 'How is your digestion and digestion-related health?',
    icon: Brain,
    options: [
      { label: 'Solid digestion, regular Bowels, no bloating', value: 'agni_strong', effect: 'Strong Agni supports healing, can fast for purification' },
      { label: 'Mild indigestion or occasional bloating', value: 'agni_mild', effect: 'Moderate Agni, needs gentle balance before skin treatment' },
      { label: 'Frequent bloating, gas, irregular Bowels', value: 'agni_weak', effect: 'Mandagni (weak digestion), Ama present, requires prior detox' },
      { label: 'Chronic digestive issues, acidity', value: 'agni_very_weak', effect: 'Severe Ama accumulation, comprehensive purification needed first' }
    ]
  },
  {
    id: 7,
    category: 'Body Type',
    sanskrit: 'Deha',
    text: 'How would you describe your body frame?',
    icon: Heart,
    options: [
      { label: 'Thin, light, prominent joints', value: 'vata', effect: 'Vata-type - needs grounding, nourishing care, avoid over-exfoliation' },
      { label: 'Medium, well-proportioned, muscular', value: 'pitta', effect: 'Pitta-type - cooling therapy, sunscreen, anti-inflammatory diet' },
      { label: 'Heavy, broad, well-developed', value: 'kapha', effect: 'Kapha-type - need stimulating herbs, light foods, regular routine' }
    ]
  },
  {
    id: 8,
    category: 'Sleep Pattern',
    sanskrit: 'Nidra',
    text: 'How would you describe your sleep quality?',
    icon: Moon,
    options: [
      { label: '6-8 hours restful sleep, wake refreshed', value: 'sleep_good', effect: 'Balanced constitution, healing potential is optimal' },
      { label: 'Light sleep, wake tired or 5-6 hours', value: 'sleep_light', effect: 'Vata imbalance, needs sleep regulation before skin improvement' },
      { label: 'Trouble falling/staying asleep', value: 'sleep_poor', effect: 'Pitta heat at night, stress factors, calming rituals needed' }
    ]
  }
];

const SKIN_SECOND_OPINION_SYSTEM_PROMPT = `
You are Dr. Jinendradutt Sharma's AI Ayurvedic Skin Specialist, an expert in Ayurvedic dermatology at Ayurvritta Ayurveda Hospital in Vadodara.

Provide a thoughtful second opinion analysis for skin disease based on Ayurvedic principles. 

ANALYSIS FRAMEWORK:
1. **Dosha Assessment**: Identify which dosha(s) are aggravated based on the case details
2. **Root Cause**: Explain the ahara (food) and vihara (lifestyle) factors contributing to the condition
3. **Agni Status**: Assess digestive fire and Ama (toxins) level
4. **Treatment Direction**: Recommend whether purification (Panchakarma), dietary correction, or direct treatment is primary
5. **Follow-up**: Suggest timeline for physician consultation and key questions to track progress

IMPORTANT:
- This is NOT a diagnosis, but an educational Ayurvedic perspective
- Always recommend seeing a qualified Ayurvedic physician for proper assessment
- Include the Ayurvedic name for the condition (e.g., Yauvan Pidika for acne)
- Suggest a specific diet and routine modification (Ritucharya)
- Recommend appropriate Panchakarma procedures when indicated
- Provide a gentle disclaimer about seeking emergency care if needed

Tone: Respectful, knowledgeable, empowering. Use medical disclaimer appropriately.
`;

const SkinSecondOpinion: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showingResult, setShowingResult] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Check if all previous questions are answered
  const isQuestionAnswered = (index: number): boolean => {
    return questions.slice(0, index).every(q => answers[q.id] !== undefined);
  };

  // Check if current question is answered
  const isCurrentAnswered = answers[questions[currentQuestion].id] !== undefined;

  const handleAnswer = (value: string) => {
    const questionId = questions[currentQuestion].id;
    setAnswers(prev => {
      const updated = { ...prev, [questionId]: value };
      return updated;
    });
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prevQuestion => prevQuestion + 1);
    }
  };

  const resetForm = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setAiResponse(null);
    setError(null);
    setIsLoading(false);
    setShowingResult(false);
  };

  const handleSubmit = async () => {
    if (!aiResponse) {
      setIsLoading(true);
      setError(null);
      setAiResponse(null);
      setShowingResult(false);

      try {
        const questionSummaries = questions.map(q => {
          const answer = answers[q.id];
          const option = q.options.find(o => o.value === answer);
          return `${q.category} (${q.sanskrit}): ${option?.label || answer}\n  Effect: ${option?.effect || 'N/A'}`;
        }).join('\n\n');

        const prompt = `
Based on the following case details about a skin condition, provide an Ayurvedic analysis:

Patient Responses:
${questionSummaries}

Please provide:
1. Likely Dosha imbalances (Vata, Pitta, Kapha)
2. Underlying cause (Agni, Ama, lifestyle factors)
3. Primary treatment direction (diet, routine, Panchakarma)
4. Timeline for seeing improvement
5. When to seek physician consultation

Be specific and actionable. Use the Ayurvedic names for conditions. Provide practical diet and routine recommendations.
`;

        const response = await aiService.generate(prompt, SKIN_SECOND_OPINION_SYSTEM_PROMPT, {
          temperature: 0.7,
          max_tokens: 1500
        });

        setAiResponse(response);
        
        // Trigger animation after result is set
        setTimeout(() => {
          setShowingResult(true);
          resultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch (err: any) {
        setError(err.message || 'Unable to process your second opinion request. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Scroll to top when question changes
  useEffect(() => {
    const container = document.querySelector(`[data-question-${currentQuestion}]`);
    container?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentQuestion]);

  if (aiResponse) {
    return (
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div 
          ref={resultRef}
          className={`bg-white rounded-3xl border-2 border-ayur-subtle p-6 md:p-10 shadow-lg transition-all duration-500 ${
            showingResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-ayur-green/10 text-ayur-green flex items-center justify-center flex-shrink-0">
              <Check className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-ayur-green mb-2">
                AI-Powered Second Opinion on Your Skin Concern
              </h3>
              <p className="text-sm text-ayur-gray/70">Based on your Ayurvedic assessment</p>
            </div>
          </div>
          
          <div className="prose prose-sm max-w-none text-ayur-gray" 
               dangerouslySetInnerHTML={{ __html: aiResponse.split('\n\n').filter(p => p.trim()).map(p => `<p class="mb-3">${p}</p>`).join('') }} />
          
          <div className="mt-8 p-4 bg-ayur-cream/50 rounded-2xl border border-ayur-subtle">
            <p className="text-xs text-ayur-gray">
              <strong>Disclaimer:</strong> This AI analysis provides educational Ayurvedic perspective only. 
              It is not a medical diagnosis and should not replace professional medical advice. 
              Please consult with a qualified Ayurvedic physician for proper assessment. 
              Seek immediate emergency care for severe symptoms or breathing difficulty.
            </p>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={resetForm}
              className="w-full sm:w-auto px-6 py-3 min-h-[48px] text-ayur-green border-2 border-ayur-green rounded-full font-semibold hover:bg-ayur-green/5 transition-all"
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" />
              Start Another Assessment
            </button>
            <a
              href="/booking"
              className="w-full sm:w-auto px-8 py-3 min-h-[48px] bg-ayur-accent text-white font-bold rounded-full hover:bg-ayur-accent/90 transition-all text-center"
            >
              Book Doctor Consultation
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16" data-question={currentQuestion}>
      <div className="bg-gradient-to-r from-ayur-cream/50 to-white rounded-3xl border-2 border-ayur-subtle p-6 md:p-10 shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-ayur-green/10 text-ayur-green rounded-full mb-4">
            <ShieldCheck size={20} className="text-ayur-accent" />
            <span className="font-semibold text-sm uppercase">AI Second Opinion</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-ayur-green mb-4">
            Get an Ayurvedic Perspective on Your Skin Concern
          </h3>
          <p className="text-sm sm:text-base text-ayur-gray max-w-2xl mx-auto">
            Answer 7 questions to receive a personalized Ayurvedic analysis. 
            Our AI assistant will provide insights on dosha balance, treatment direction, and lifestyle recommendations.
          </p>
        </div>

        {/* Question Navigation */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-ayur-gray">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <Counter value={currentQuestion + 1} max={questions.length} />
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-2 bg-ayur-subtle rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-ayur-green transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-fadeIn">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
              <div>
                <p className="text-red-700 font-semibold">Error during analysis</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white rounded-2xl border border-ayur-subtle p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-ayur-green/10 text-ayur-green flex items-center justify-center flex-shrink-0">
              {React.createElement(questions[currentQuestion].icon, { size: 20 })}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-base sm:text-lg text-ayur-green mb-1">
                {questions[currentQuestion].category}
                <span className="text-sm text-ayur-gray block mt-1">({questions[currentQuestion].sanskrit})</span>
              </h4>
              <p className="text-sm text-ayur-gray mb-4">{questions[currentQuestion].text}</p>
              
              <div className="grid grid-cols-1 gap-3">
                {questions[currentQuestion].options.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      answers[questions[currentQuestion].id] === option.value
                        ? 'bg-ayur-green/10 border-ayur-green/30 ring-2 ring-ayur-green/20'
                        : 'bg-white border-ayur-subtle hover:border-ayur-green/20 hover:bg-ayur-cream/30'
                    }`}
                    onClick={() => handleAnswer(option.value)}
                  >
                    <input
                      type="radio"
                      name={`question-${questions[currentQuestion].id}`}
                      value={option.value}
                      checked={answers[questions[currentQuestion].id] === option.value}
                      onChange={() => handleAnswer(option.value)}
                      className="w-5 h-5 mt-0.5 text-ayur-green border-ayur-gray rounded-full focus:ring-2 focus:ring-ayur-green focus:ring-offset-2"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-ayur-green">{option.label}</div>
                      <p className="text-xs text-ayur-gray mt-1">{option.effect}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          {currentQuestion > 0 && (
            <button
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              disabled={isLoading}
              className="px-5 py-2 min-h-[48px] text-ayur-green border-2 border-ayur-green rounded-full font-semibold hover:bg-ayur-green/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
          )}
          
          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={() => handleAnswer(answers[questions[currentQuestion].id] || '')}
              disabled={!isCurrentAnswered || isLoading}
              className={`px-8 py-2 min-h-[48px] font-semibold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isCurrentAnswered && !isLoading
                  ? 'bg-ayur-green text-white hover:bg-ayur-green/90'
                  : 'bg-ayur-green/30 text-ayur-green/70 cursor-not-allowed'
              }`}
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-3 min-h-[48px] bg-ayur-accent text-white font-bold rounded-full hover:bg-ayur-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Your Skin...
                </>
              ) : (
                <>
                  Get Second Opinion
                  <Sparkles size={18} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default SkinSecondOpinion;