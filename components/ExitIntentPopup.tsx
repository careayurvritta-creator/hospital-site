/**
 * Exit Intent Popup Component
 * Shown when user is about to leave the page
 */

import React, { useState } from 'react';
import { X, Gift, Calendar, ArrowRight } from 'lucide-react';
import { useExitIntent } from '../hooks/useExitIntent';
import { useAnalytics } from './AnalyticsProvider';

interface ExitIntentPopupProps {
    enabled?: boolean;
    offerTitle?: string;
    offerDescription?: string;
    ctaText?: string;
    ctaLink?: string;
}

const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({
    enabled = true,
    offerTitle = 'Wait! Before You Go...',
    offerDescription = 'Book your first consultation and get a free Prakriti assessment worth ₹500!',
    ctaText = 'Claim Offer Now',
    ctaLink = '/booking',
}) => {
    const { isVisible, close } = useExitIntent({
        threshold: 20,
        timeout: 300000, // 5 minutes between triggers
        onExitIntent: () => {
            // Track exit intent trigger
        },
    });
    const { trackEvent } = useAnalytics();
    const [email, setEmail] = useState('');

    if (!enabled || !isVisible) return null;

    const handleCTAClick = () => {
        trackEvent('conversion', 'exit_intent_cta_click', ctaLink);
        window.location.href = `#${ctaLink}`;
        close();
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            trackEvent('conversion', 'exit_intent_email_capture', email.includes('@') ? 'valid' : 'invalid');
            // Here you would send this to your backend
            console.log('Email captured:', email);
            close();
        }
    };

    const handleClose = () => {
        trackEvent('engagement', 'exit_intent_dismissed', 'manual');
        close();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transform animate-scaleIn">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close popup"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Decorative Header */}
                <div className="bg-gradient-to-br from-[#0F3D3E] via-[#1a5a5c] to-[#0F3D3E] p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 animate-bounce">
                        <Gift className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white font-serif mb-2">
                        {offerTitle}
                    </h2>
                    <p className="text-white/90 text-sm">
                        {offerDescription}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Benefits */}
                    <div className="space-y-3 mb-6">
                        {[
                            'Expert Ayurvedic consultation',
                            'Personalized wellness plan',
                            'Dosha-specific recommendations',
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
                                <div className="w-5 h-5 rounded-full bg-[#0F3D3E]/10 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3 h-3 text-[#0F3D3E]" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                {benefit}
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={handleCTAClick}
                        className="w-full py-4 bg-gradient-to-r from-[#C27A12] to-[#d4922e] text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                        <Calendar className="w-5 h-5" />
                        {ctaText}
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    {/* Or Email Capture */}
                    <div className="mt-4">
                        <p className="text-center text-sm text-gray-500 mb-3">
                            Or get offer details via email
                        </p>
                        <form onSubmit={handleEmailSubmit} className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email address"
                                className="flex-1 px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/20"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#0F3D3E] text-white rounded-xl text-sm font-medium hover:bg-[#0c3233] transition-colors"
                            >
                                Send
                            </button>
                        </form>
                    </div>

                    {/* No Thanks */}
                    <button
                        onClick={handleClose}
                        className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700"
                    >
                        No thanks, I'll pay full price
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
      `}</style>
        </div>
    );
};

export default ExitIntentPopup;
