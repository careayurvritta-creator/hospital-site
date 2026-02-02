/**
 * Chat Tool Card Component
 * Renders interactive tool cards within the chat interface
 */

import React, { useState } from 'react';
import { ArrowRight, CheckCircle, X } from 'lucide-react';
import { ChatTool } from './ChatToolRegistry';

interface ChatToolCardProps {
    tool: ChatTool;
    onStart: () => void;
    onDismiss: () => void;
    isActive?: boolean;
}

const ChatToolCard: React.FC<ChatToolCardProps> = ({
    tool,
    onStart,
    onDismiss,
    isActive = false
}) => {
    const Icon = tool.icon;

    return (
        <div className={`
      my-3 p-4 rounded-2xl border-2 transition-all
      ${isActive
                ? 'border-ayur-green bg-ayur-green-light/30'
                : 'border-ayur-subtle bg-white hover:border-ayur-green/50'
            }
    `}>
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          ${isActive ? 'bg-ayur-green text-white' : 'bg-ayur-green-light text-ayur-green'}
        `}>
                    <Icon size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-ayur-green text-sm">{tool.name}</h4>
                    <p className="text-xs text-ayur-gray mt-0.5">{tool.description}</p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-3">
                        <button
                            onClick={onStart}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-ayur-green text-white text-xs font-semibold rounded-lg hover:bg-ayur-green-dark transition-colors"
                        >
                            {isActive ? (
                                <>
                                    <CheckCircle size={14} />
                                    Continue
                                </>
                            ) : (
                                <>
                                    Start Now
                                    <ArrowRight size={14} />
                                </>
                            )}
                        </button>

                        {!isActive && (
                            <button
                                onClick={onDismiss}
                                className="p-1.5 text-ayur-gray/50 hover:text-ayur-gray transition-colors"
                                aria-label="Dismiss"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Mini Prakriti Quiz for inline chat
 */
interface InlinePrakritiQuizProps {
    onComplete: (result: { vata: number; pitta: number; kapha: number }) => void;
    onCancel: () => void;
}

export const InlinePrakritiQuiz: React.FC<InlinePrakritiQuizProps> = ({
    onComplete,
    onCancel
}) => {
    const [step, setStep] = useState(0);
    const [scores, setScores] = useState({ vata: 0, pitta: 0, kapha: 0 });

    const questions = [
        {
            question: "What is your body frame?",
            options: [
                { label: "Thin, light, bony", dosha: 'vata' as const },
                { label: "Medium, muscular", dosha: 'pitta' as const },
                { label: "Large, sturdy, heavy", dosha: 'kapha' as const }
            ]
        },
        {
            question: "How is your appetite?",
            options: [
                { label: "Variable, irregular", dosha: 'vata' as const },
                { label: "Strong, can't skip meals", dosha: 'pitta' as const },
                { label: "Slow, steady", dosha: 'kapha' as const }
            ]
        },
        {
            question: "How do you handle stress?",
            options: [
                { label: "Anxiety, worry, fear", dosha: 'vata' as const },
                { label: "Anger, irritability", dosha: 'pitta' as const },
                { label: "Withdrawal, depression", dosha: 'kapha' as const }
            ]
        }
    ];

    const handleSelect = (dosha: 'vata' | 'pitta' | 'kapha') => {
        const newScores = { ...scores, [dosha]: scores[dosha] + 1 };
        setScores(newScores);

        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            onComplete(newScores);
        }
    };

    const currentQ = questions[step];

    return (
        <div className="my-3 p-4 rounded-2xl border-2 border-ayur-accent bg-ayur-accent/5">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-ayur-accent uppercase tracking-wider">
                    Quick Prakriti Check ({step + 1}/{questions.length})
                </span>
                <button onClick={onCancel} className="text-ayur-gray/50 hover:text-ayur-gray" aria-label="Cancel quiz">
                    <X size={16} />
                </button>
            </div>

            <p className="text-sm font-medium text-ayur-green mb-3">{currentQ.question}</p>

            <div className="space-y-2">
                {currentQ.options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => handleSelect(opt.dosha)}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg border border-ayur-subtle hover:border-ayur-green hover:bg-ayur-green-light/30 transition-all"
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

/**
 * Prakriti Result Display
 */
interface PrakritiResultProps {
    scores: { vata: number; pitta: number; kapha: number };
}

export const PrakritiResult: React.FC<PrakritiResultProps> = ({ scores }) => {
    const total = scores.vata + scores.pitta + scores.kapha;
    const percentages = {
        vata: Math.round((scores.vata / total) * 100),
        pitta: Math.round((scores.pitta / total) * 100),
        kapha: Math.round((scores.kapha / total) * 100)
    };

    const dominant = Object.entries(percentages).sort((a, b) => b[1] - a[1])[0];

    const doshaColors = {
        vata: 'bg-blue-500',
        pitta: 'bg-orange-500',
        kapha: 'bg-green-500'
    };

    return (
        <div className="my-3 p-4 rounded-2xl border-2 border-ayur-green bg-ayur-green-light/20">
            <h4 className="font-bold text-ayur-green text-sm mb-2">Your Quick Prakriti Result</h4>

            <div className="space-y-2 mb-3">
                {(['vata', 'pitta', 'kapha'] as const).map(dosha => (
                    <div key={dosha} className="flex items-center gap-2">
                        <span className="text-xs w-12 capitalize">{dosha}</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${doshaColors[dosha]} transition-all`}
                                style={{ width: `${percentages[dosha]}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold w-8">{percentages[dosha]}%</span>
                    </div>
                ))}
            </div>

            <p className="text-xs text-ayur-gray">
                Based on this quick assessment, you appear to be <strong className="text-ayur-green capitalize">{dominant[0]}</strong> dominant.
                For a complete analysis, try our full Prakriti Quiz or consult with Dr. Sharma.
            </p>
        </div>
    );
};

export default ChatToolCard;
