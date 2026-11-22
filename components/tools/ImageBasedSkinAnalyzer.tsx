/**
 * AI-Powered Image-Based Skin Disease Recognition (Redesigned)
 * Analyzes skin condition images combined with Ayurvedic questionnaire
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Stethoscope, ShieldCheck, Clock, Sun, Moon, Heart, Sparkles, AlertCircle, Brain, Upload, X, Check, Loader2, Image as ImageIcon, RefreshCw, Calendar, Zap, User } from 'lucide-react';
import { Counter } from '../ui/reactbits';

interface QuestionnaireData {
  age: string;
  gender: string;
  duration: string;
  symptoms: string;
  triggers: string;
  currentTreatment: string;
  digestiveHealth: string;
  bodyType: string;
  sleepQuality: string;
  allergies: string;
}

interface AnalysisResult {
  condition: {
    identified: string;
    modernEquivalent: string;
    confidence: number;
    differentialDiagnoses: string[];
  };
  severity: {
    level: number;
    scale: string;
    description: string;
    urgency: string;
  };
  doshaAnalysis: {
    primary: string;
    secondary: string;
    explanation: string;
  };
  lifestyleRecommendation: string;
}

type Step = 'upload' | 'questionnaire' | 'analysis' | 'result';

const INITIAL_QUESTIONNAIRE: QuestionnaireData = {
  age: '',
  gender: '',
  duration: '',
  symptoms: '',
  triggers: '',
  currentTreatment: '',
  digestiveHealth: '',
  bodyType: '',
  sleepQuality: '',
  allergies: '',
};

export const ImageBasedSkinAnalyzer: React.FC = () => {
  const [step, setStep] = useState<Step>('upload');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>(INITIAL_QUESTIONNAIRE);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOverRef = useRef<HTMLDivElement>(null);
  const [showingResult, setShowingResult] = useState(false);

  // Questionnaire steps with Ayurvedic context
  const QUESTIONS = [
    {
      key: 'age',
      label: 'Age',
      type: 'number',
      icon: Clock,
      placeholder: 'Enter your age',
    },
    {
      key: 'gender',
      label: 'Gender',
      type: 'select',
      options: ['Male', 'Female', 'Other', 'Prefer not to say'],
      icon: Heart,
    },
    {
      key: 'duration',
      label: 'How long have you had this skin concern?',
      type: 'select',
      options: ['Less than 1 month', '1-3 months', '3-6 months', '6-12 months', 'More than 1 year'],
      icon: Calendar,
    },
    {
      key: 'symptoms',
      label: 'Primary symptoms',
      type: 'textarea',
      placeholder: 'Describe your main symptoms (itching, burning, scaling, etc.)',
      icon: AlertCircle,
    },
    {
      key: 'triggers',
      label: 'What triggers flare-ups?',
      type: 'textarea',
      placeholder: 'Sun, heat, stress, specific foods, etc.',
      icon: Zap,
    },
    {
      key: 'currentTreatment',
      label: 'Current treatments',
      type: 'textarea',
      placeholder: 'Topical creams, medications, herbal treatments',
      icon: ShieldCheck,
    },
    {
      key: 'digestiveHealth',
      label: 'Digestive health',
      type: 'select',
      options: ['Good', 'Occasional issues', 'Frequent issues', 'Poor'],
      icon: Brain,
    },
    {
      key: 'bodyType',
      label: 'Physical constitution',
      type: 'select',
      options: ['Energetic/Thin', 'Average build', 'Heavier build'],
      icon: User,
    },
  ];

  // Handle image upload
  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setError(null);
    setStep('questionnaire');
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragOverRef.current?.classList.add('bg-ayur-cream/50', 'border-2', 'border-dashed', 'border-ayur-green');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragOverRef.current?.classList.remove('bg-ayur-cream/50', 'border-2', 'border-dashed', 'border-ayur-green');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragOverRef.current?.classList.remove('bg-ayur-cream/50', 'border-2', 'border-dashed', 'border-ayur-green');
    
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  }, [handleImageUpload]);

  // Handle questionnaire navigation
  const updateAnswer = useCallback((key: string, value: string) => {
    setQuestionnaire(prev => {
      const updated = { ...prev, [key]: value };
      return updated;
    });
    setAnswers(prev => ({ ...prev, [key]: value }));
  }, []);

  const nextQuestion = useCallback(() => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [currentQuestion]);

  const prevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  const handleQuestionnaireComplete = useCallback(() => {
    setStep('analysis');
    runAnalysis();
  }, []);

  // Run the analysis
  const runAnalysis = useCallback(async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('analysis_type', 'skin_condition');
      formData.append('questionnaire_data', JSON.stringify(questionnaire));

      const response = await fetch('/api/skin-analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      setResult(data.result);
      setStep('result');
      
      // Trigger re animation for result display
      setTimeout(() => setShowingResult(true), 100);
    } catch (err: any) {
      setError(err.message || 'Unable to analyze image. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedImage, questionnaire]);

  // Reset the entire flow
  const resetFlow = useCallback(() => {
    setStep('upload');
    setSelectedImage(null);
    setQuestionnaire(INITIAL_QUESTIONNAIRE);
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setError(null);
    setShowingResult(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Progress indicator
  const progress = step === 'upload' ? 0 : step === 'result' ? 100 : step === 'analysis' ? 85 : 50;

  // Animation class based on step
  const getStepClass = () => {
    switch(step) {
      case 'upload': return 'opacity-100 translate-x-0';
      case 'questionnaire': return 'opacity-100 translate-x-0';
      case 'analysis': return 'opacity-100';
      case 'result': return 'opacity-100 -translate-x-0';
      default: return 'opacity-0';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-serif text-lg font-bold text-ayur-green">Skin Analysis</h3>
          <span className="text-sm text-ayur-gray">{step === 'result' ? 'Complete' : 'In Progress'}</span>
        </div>
        <div className="relative h-2 bg-ayur-subtle rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-ayur-green transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-ayur-gray/60 mt-2">
          <span>Upload</span>
          <span className="text-ayur-green">Diagnosis</span>
        </div>
      </div>

      {/* Step 1: Image Upload */}
      {step === 'upload' && (
        <div className={`bg-white rounded-2xl border-2 border-dashed border-ayur-subtle p-8 text-center transition-all duration-300 ${getStepClass()}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-ayur-cream/50 rounded-full mb-4">
            <Camera className="w-8 h-8 text-ayur-green" />
          </div>
          <h3 className="font-serif text-xl font-bold text-ayur-green mb-3">
            Upload Skin Image
          </h3>
          <p className="text-ayur-gray mb-6">
            Capture or upload a clear photo of the affected area. Ensure good lighting and focus.
          </p>
          
          <div
            ref={dragOverRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="border-2 border-dashed border-ayur-subtle rounded-2xl p-8 cursor-pointer hover:border-ayur-green/30 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-ayur-green/60 mx-auto mb-3" />
            <p className="font-semibold text-ayur-green mb-2">Click to upload</p>
            <p className="text-sm text-ayur-gray/60">or drag & drop here</p>
            <p className="text-xs text-ayur-gray/40 mt-2">PNG, JPG, WEBP up to 10MB</p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleImageUpload(e.target.files)}
          />
        </div>
      )}

      {/* Step 2: Questionnaire */}
      {step === 'questionnaire' && (
        <div className={`space-y-6 transition-all duration-300 ${getStepClass()}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-xl font-bold text-ayur-green">
              Health History ({currentQuestion + 1} of {QUESTIONS.length})
            </h3>
            <button
              onClick={resetFlow}
              className="text-sm text-ayur-gray hover:text-ayur-green transition-colors"
            >
              Start Over
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ayur-green mb-3">
              {QUESTIONS[currentQuestion].label}
            </label>
            
            {QUESTIONS[currentQuestion].type === 'number' && (
              <input
                type="number"
                placeholder={QUESTIONS[currentQuestion].placeholder}
                value={questionnaire[currentQuestion as keyof QuestionnaireData] as string}
                onChange={(e) => updateAnswer(QUESTIONS[currentQuestion].key, e.target.value)}
                className="w-full px-4 py-3 border-2 border-ayur-subtle rounded-xl focus:border-ayur-green focus:ring-0 transition-all"
                min="0"
                max="120"
              />
            )}

            {QUESTIONS[currentQuestion].type === 'select' && (
              <select
                value={questionnaire[currentQuestion as keyof QuestionnaireData] as string}
                onChange={(e) => updateAnswer(QUESTIONS[currentQuestion].key, e.target.value)}
                className="w-full px-4 py-3 border-2 border-ayur-subtle rounded-xl focus:border-ayur-green focus:ring-0 transition-all appearance-none"
              >
                <option value="">Select an option</option>
                {QUESTIONS[currentQuestion].options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {QUESTIONS[currentQuestion].type === 'textarea' && (
              <textarea
                placeholder={QUESTIONS[currentQuestion].placeholder}
                value={questionnaire[currentQuestion as keyof QuestionnaireData] as string}
                onChange={(e) => updateAnswer(QUESTIONS[currentQuestion].key, e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-ayur-subtle rounded-xl focus:border-ayur-green focus:ring-0 transition-all resize-none"
              />
            )}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="px-6 py-2 border-2 border-ayur-green text-ayur-green rounded-xl font-semibold hover:bg-ayur-green/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={currentQuestion === QUESTIONS.length - 1 ? handleQuestionnaireComplete : nextQuestion}
              className="px-6 py-2 bg-ayur-green text-white rounded-xl font-semibold hover:bg-ayur-green/90 transition-all"
            >
              {currentQuestion === QUESTIONS.length - 1 ? 'Analyze' : 'Next'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Analysis */}
      {step === 'analysis' && (
        <div className={`text-center py-12 transition-all duration-300 ${getStepClass()}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-ayur-cream/50 rounded-full mb-4">
            <Loader2 className="w-8 h-8 text-ayur-green animate-spin" />
          </div>
          <h3 className="font-serif text-xl font-bold text-ayur-green mb-3">
            Analyzing Your Skin Condition
          </h3>
          <p className="text-ayur-gray">
            Our AI is examining your image and questionnaire response...
          </p>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 'result' && result && (
        <div className={`space-y-6 transition-all duration-300 ${showingResult ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-gradient-to-r from-ayur-green to-ayur-green-dark rounded-2xl p-6 text-white">
            <h3 className="font-serif text-2xl font-bold mb-4 flex items-center gap-3">
              <Check className="w-8 h-8" />
              Analysis Complete
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-sm text-ayur-cream">Condition</p>
                <p className="font-bold text-lg">{result.condition.identified}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-sm text-ayur-cream">Confidence</p>
                <p className="font-bold text-lg">{result.condition.confidence}%</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-sm text-ayur-cream">Severity</p>
                <p className="font-bold text-lg">{result.severity.level}/5</p>
              </div>
            </div>

            <p className="text-sm text-ayur-cream/80">
              Modern classification: {result.condition.modernEquivalent}
            </p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-ayur-subtle p-6">
            <h4 className="font-serif text-lg font-bold text-ayur-green mb-4">Recommended Next Steps</h4>
            <div 
              className="prose prose-sm max-w-none text-ayur-gray" 
              dangerouslySetInnerHTML={{ __html: result.lifestyleRecommendation }} 
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={resetFlow}
              className="w-full sm:w-auto px-6 py-3 border-2 border-ayur-green text-ayur-green rounded-xl font-semibold hover:bg-ayur-green/10 transition-all"
            >
              Analyze Another Image
            </button>
            <a
              href="/booking"
              className="w-full sm:w-auto px-8 py-3 bg-ayur-accent text-white rounded-xl font-semibold hover:bg-ayur-accent/90 transition-all text-center"
            >
              Book Consultation
            </a>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4 animate-fadeIn">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
            <div>
              <p className="text-red-700 font-semibold">Error during analysis</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageBasedSkinAnalyzer;