/**
 * Feedback Collection Component
 * Collects user feedback via micro-surveys
 */

import React, { useState, useEffect } from 'react';
import { Star, X, ThumbsUp, ThumbsDown, Send, MessageCircle } from 'lucide-react';
import { useAnalytics } from './AnalyticsProvider';
import { eventTracker } from '../analytics';

// Survey Types
type SurveyType = 'nps' | 'csat' | 'thumbs' | 'exit';

interface FeedbackCollectorProps {
    type?: SurveyType;
    trigger?: 'time' | 'scroll' | 'exit' | 'manual';
    triggerDelay?: number; // ms
    triggerScrollDepth?: number; // percentage
    question?: string;
    onComplete?: (score: number, comment?: string) => void;
}

const FeedbackCollector: React.FC<FeedbackCollectorProps> = ({
    type = 'nps',
    trigger = 'manual',
    triggerDelay = 30000, // 30 seconds
    triggerScrollDepth = 75,
    question,
    onComplete,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [comment, setComment] = useState('');
    const [step, setStep] = useState<'rating' | 'comment' | 'thanks'>('rating');
    const { trackEvent } = useAnalytics();

    // Check if already shown in this session
    const getStorageKey = () => `ayurvritta_feedback_${type}_shown`;

    const hasBeenShown = (): boolean => {
        return sessionStorage.getItem(getStorageKey()) === 'true';
    };

    const markAsShown = (): void => {
        sessionStorage.setItem(getStorageKey(), 'true');
    };

    // Handle trigger logic
    useEffect(() => {
        if (hasBeenShown()) return;

        if (trigger === 'time') {
            const timer = setTimeout(() => {
                setIsVisible(true);
                markAsShown();
                trackEvent('feedback', 'survey_shown', type);
            }, triggerDelay);
            return () => clearTimeout(timer);
        }

        if (trigger === 'scroll') {
            const handleScroll = () => {
                const scrollPercent = Math.round(
                    (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
                );
                if (scrollPercent >= triggerScrollDepth) {
                    setIsVisible(true);
                    markAsShown();
                    trackEvent('feedback', 'survey_shown', type);
                    window.removeEventListener('scroll', handleScroll);
                }
            };
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }

        if (trigger === 'exit') {
            const handleMouseLeave = (e: MouseEvent) => {
                if (e.clientY < 10) {
                    setIsVisible(true);
                    markAsShown();
                    trackEvent('feedback', 'survey_shown', type);
                    document.removeEventListener('mouseleave', handleMouseLeave);
                }
            };
            document.addEventListener('mouseleave', handleMouseLeave);
            return () => document.removeEventListener('mouseleave', handleMouseLeave);
        }
    }, [trigger, triggerDelay, triggerScrollDepth, type, trackEvent]);

    // Get question based on type
    const getQuestion = (): string => {
        if (question) return question;

        switch (type) {
            case 'nps':
                return 'How likely are you to recommend Ayurvritta to a friend?';
            case 'csat':
                return 'How satisfied are you with your experience today?';
            case 'thumbs':
                return 'Was this page helpful?';
            case 'exit':
                return 'Before you go, how was your experience?';
            default:
                return 'How was your experience?';
        }
    };

    // Handle submit
    const handleSubmit = () => {
        if (score === null) return;

        // Track feedback event
        eventTracker.trackEvent({
            category: 'feedback',
            action: 'submitted',
            label: type,
            value: score,
            timestamp: Date.now(),
            sessionId: '',
            metadata: {
                hasComment: comment.length > 0,
                page: window.location.pathname,
            },
        });

        onComplete?.(score, comment);
        setStep('thanks');

        // Auto close after thanks
        setTimeout(() => {
            setIsVisible(false);
        }, 2000);
    };

    const handleClose = () => {
        trackEvent('feedback', 'survey_dismissed', type);
        setIsVisible(false);
    };

    // Manual trigger
    const show = () => {
        if (!hasBeenShown()) {
            setIsVisible(true);
            markAsShown();
            trackEvent('feedback', 'survey_shown', type);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-20 right-4 z-50 animate-slideUp">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-80 border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0F3D3E] to-[#1a5a5c] px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-medium text-sm">Quick Feedback</span>
                    </div>
                    <button onClick={handleClose} className="text-white/70 hover:text-white" aria-label="Close feedback">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {step === 'rating' && (
                        <>
                            <p className="text-[#0F3D3E] font-medium text-sm mb-4">{getQuestion()}</p>

                            {/* NPS Scale */}
                            {type === 'nps' && (
                                <div className="mb-4">
                                    <div className="flex justify-between gap-1 mb-2">
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                            <button
                                                key={n}
                                                onClick={() => setScore(n)}
                                                className={`w-6 h-8 rounded text-xs font-medium transition-all ${score === n
                                                    ? 'bg-[#0F3D3E] text-white scale-110'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Not likely</span>
                                        <span>Very likely</span>
                                    </div>
                                </div>
                            )}

                            {/* Star Rating */}
                            {type === 'csat' && (
                                <div className="flex justify-center gap-2 mb-4">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <button
                                            key={n}
                                            onClick={() => setScore(n)}
                                            className="transition-transform hover:scale-110"
                                            aria-label={`Rate ${n} out of 5 stars`}
                                        >
                                            <Star
                                                className={`w-8 h-8 ${score && n <= score
                                                    ? 'text-[#C27A12] fill-[#C27A12]'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Thumbs */}
                            {(type === 'thumbs' || type === 'exit') && (
                                <div className="flex justify-center gap-6 mb-4">
                                    <button
                                        onClick={() => setScore(1)}
                                        className={`p-4 rounded-full transition-all ${score === 1
                                            ? 'bg-green-100 text-green-600 scale-110'
                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                            }`}
                                        aria-label="Yes, this was helpful"
                                    >
                                        <ThumbsUp className="w-8 h-8" />
                                    </button>
                                    <button
                                        onClick={() => setScore(0)}
                                        className={`p-4 rounded-full transition-all ${score === 0
                                            ? 'bg-red-100 text-red-600 scale-110'
                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                            }`}
                                        aria-label="No, this was not helpful"
                                    >
                                        <ThumbsDown className="w-8 h-8" />
                                    </button>
                                </div>
                            )}

                            {score !== null && (
                                <button
                                    onClick={() => setStep('comment')}
                                    className="w-full py-2 bg-[#0F3D3E] text-white rounded-xl text-sm font-medium hover:bg-[#0c3233] transition-colors"
                                >
                                    Next
                                </button>
                            )}
                        </>
                    )}

                    {step === 'comment' && (
                        <>
                            <p className="text-[#0F3D3E] font-medium text-sm mb-3">
                                {score && score >= 7 ? 'What did we do well?' : 'How could we improve?'}
                            </p>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Your feedback helps us improve..."
                                className="w-full p-3 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/20"
                                rows={3}
                            />
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 py-2 bg-[#0F3D3E] text-white rounded-xl text-sm font-medium hover:bg-[#0c3233] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Submit
                                </button>
                            </div>
                        </>
                    )}

                    {step === 'thanks' && (
                        <div className="text-center py-4">
                            <div className="text-4xl mb-2">🙏</div>
                            <p className="text-[#0F3D3E] font-medium">Thank you!</p>
                            <p className="text-sm text-gray-500">Your feedback is valuable to us</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
        </div>
    );
};

export default FeedbackCollector;
