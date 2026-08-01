import React, { useState, Children, useEffect, useRef } from 'react';

interface StepperProps {
  children: React.ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  backButtonText?: string;
  nextButtonText?: string;
  completeButtonText?: string;
  disableStepIndicators?: boolean;
  stepCircleClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  nextButtonClassName?: string;
  backButtonClassName?: string;
}

interface StepProps {
  children?: React.ReactNode;
}

export function Step({ children }: StepProps) {
  return <div>{children}</div>;
}

const Stepper: React.FC<StepperProps> = ({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  completeButtonText = 'Complete',
  disableStepIndicators = false,
  stepCircleClassName = '',
  contentClassName = '',
  footerClassName = '',
  nextButtonClassName = '',
  backButtonClassName = '',
}) => {
  const handleStepChange = onStepChange as (step: number) => void;
  const steps = Children.toArray(children);
  const totalSteps = steps.length;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [contentKey, setContentKey] = useState(initialStep);
  const contentRef = useRef<HTMLDivElement>(null);

  const isLastStep = currentStep === totalSteps;
  const isCompleted = currentStep > totalSteps;

  const updateStep = (next: number) => {
    setContentKey(next);
    setCurrentStep(next);
    if (next > totalSteps) {
      onFinalStepCompleted();
    } else {
      handleStepChange(next);
    }
  };

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
    }
  }, [contentKey]);

  const renderIndicator = (step: number) => {
    const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete';
    const base = `reactbits-stepper-dot flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
      stepCircleClassName
    }`;
    if (status === 'complete') {
      return (
        <button
          type="button"
          onClick={() => !disableStepIndicators && updateStep(step)}
          className={`${base} bg-ayur-green border-ayur-green text-white ${disableStepIndicators ? 'cursor-default' : 'cursor-pointer'}`}
          aria-label={`Go to step ${step}`}
          aria-current={undefined}
        >
          <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      );
    }
    if (status === 'active') {
      return (
        <button
          type="button"
          onClick={() => !disableStepIndicators && updateStep(step)}
          className={`${base} bg-ayur-green/10 border-ayur-green text-ayur-green shadow-[0_0_0_5px_rgba(13,135,112,0.15)] ${disableStepIndicators ? 'cursor-default' : 'cursor-pointer'}`}
          aria-current="step"
        >
          <span className="w-3 h-3 rounded-full bg-ayur-green animate-pulse" />
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => !disableStepIndicators && updateStep(step)}
        className={`${base} bg-white border-ayur-light text-ayur-text/50 ${disableStepIndicators ? 'cursor-default' : 'cursor-pointer'}`}
        aria-label={`Go to step ${step}`}
      >
        {step}
      </button>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((_, index) => {
          const step = index + 1;
          const isNotLast = index < totalSteps - 1;
          return (
            <React.Fragment key={step}>
              {renderIndicator(step)}
              {isNotLast && (
                <div className="flex-1 h-1 mx-1 rounded-full bg-ayur-light overflow-hidden">
                  <div
                    className={`reactbits-stepper-line h-full rounded-full bg-ayur-green transition-all duration-500 ${
                      currentStep > step ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className={`relative overflow-hidden mt-6 ${contentClassName}`} ref={contentRef}>
        <div key={contentKey} className={isCompleted ? 'opacity-0' : 'stepper-slide-in'}>
          {isCompleted ? null : steps[currentStep - 1]}
        </div>
      </div>

      {!isCompleted && (
        <div className={`mt-6 flex ${currentStep !== 1 ? 'justify-between' : 'justify-end'} gap-3 ${footerClassName}`}>
          {currentStep !== 1 && (
            <button
              type="button"
              onClick={() => updateStep(currentStep - 1)}
              className={`px-6 py-3 rounded-full font-semibold border-2 border-ayur-light text-ayur-green hover:border-ayur-green transition-colors min-h-[48px] ${backButtonClassName}`}
            >
              {backButtonText}
            </button>
          )}
          <button
            type="button"
            onClick={() => updateStep(isLastStep ? totalSteps + 1 : currentStep + 1)}
            className={`px-6 py-3 rounded-full font-semibold bg-ayur-green text-white hover:bg-ayur-green-dark shadow-lg shadow-ayur-green/25 transition-colors min-h-[48px] ${nextButtonClassName}`}
          >
            {isLastStep ? completeButtonText : nextButtonText}
          </button>
        </div>
      )}
    </div>
  );
};

export default Stepper;
