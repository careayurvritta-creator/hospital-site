/**
 * Tool Error Fallback Component
 * On-brand error UI for individual health tools and chat tool cards
 * Smaller and more contextual than the root ErrorFallback
 */
import React from 'react';
import { RotateCcw, AlertCircle, ChevronLeft } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface ToolErrorFallbackProps {
  error: unknown;
  resetError: () => void;
  onBack?: () => void;
  toolName?: string;
}

const ToolErrorFallback: React.FC<ToolErrorFallbackProps> = ({
  error,
  resetError,
  onBack,
  toolName = 'tool',
}) => {
  const { t } = useLanguage();

  const isDevelopment = import.meta.env.DEV;
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[300px] p-6 bg-white rounded-2xl border border-ayur-subtle shadow-lg"
      role="alert"
      aria-live="assertive"
    >
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle size={32} className="text-red-500" aria-hidden="true" />
      </div>

      <h3 className="font-serif text-lg font-bold text-ayur-green mb-2 text-center">
        {t('tools.errorTitle') || `Something went wrong with the ${toolName}`}
      </h3>

      <p className="text-sm text-ayur-gray text-center mb-4 max-w-md">
        {t('tools.errorMessage') ||
          'This tool encountered an error and couldn\'t complete your request. Your previous answers are preserved.'}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={resetError}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-ayur-green text-white font-semibold rounded-lg hover:bg-ayur-green-dark transition-colors min-h-[48px]"
          aria-label={t('tools.tryAgain') || 'Try again'}
        >
          <RotateCcw size={18} />
          <span>{t('tools.tryAgain') || 'Try Again'}</span>
        </button>

        {onBack && (
          <button
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-ayur-subtle text-ayur-green font-semibold rounded-lg hover:bg-ayur-green-light/30 transition-colors min-h-[48px]"
            aria-label={t('tools.goBack') || 'Go back'}
          >
            <ChevronLeft size={18} />
            <span>{t('tools.goBack') || 'Go Back'}</span>
          </button>
        )}
      </div>

      {isDevelopment && errorMessage && (
        <details className="mt-6 w-full max-w-md text-xs text-red-600 bg-red-50 p-3 rounded-lg">
          <summary className="cursor-pointer font-medium mb-2">
            {t('tools.errorDetails') || 'Error Details (Development)'}
          </summary>
          <pre className="whitespace-pre-wrap font-mono text-[10px] overflow-auto max-h-40">
            {errorMessage}
            {errorStack && `\n\n${errorStack}`}
          </pre>
        </details>
      )}
    </div>
  );
};

export default ToolErrorFallback;