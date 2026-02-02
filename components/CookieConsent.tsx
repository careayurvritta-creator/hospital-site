/**
 * CookieConsent Component
 * GDPR/DPDP compliant cookie consent banner
 */

import React, { useState, useEffect } from 'react';
import { Shield, Settings, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { consentManager } from '../analytics';
import type { ConsentState } from '../analytics';

interface CookieConsentProps {
    onConsentChange?: (consent: ConsentState) => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onConsentChange }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [consent, setConsent] = useState({
        analytics: false,
        marketing: false,
        personalization: false,
    });

    useEffect(() => {
        // Show banner if user hasn't consented yet
        if (!consentManager.hasConsented()) {
            // Small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        consentManager.acceptAll();
        setIsVisible(false);
        onConsentChange?.(consentManager.getConsent());
    };

    const handleRejectAll = () => {
        consentManager.rejectAll();
        setIsVisible(false);
        onConsentChange?.(consentManager.getConsent());
    };

    const handleSavePreferences = () => {
        consentManager.updateConsent(consent);
        setIsVisible(false);
        onConsentChange?.(consentManager.getConsent());
    };

    const handleToggle = (type: keyof typeof consent) => {
        setConsent(prev => ({ ...prev, [type]: !prev[type] }));
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transform animate-slideUp">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0F3D3E] to-[#1a5a5c] p-5 text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold font-serif">Your Privacy Matters</h2>
                            <p className="text-sm text-white/80">We respect your data choices</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <p className="text-[#4A4A4A] text-sm leading-relaxed mb-4">
                        We use cookies to enhance your experience, analyze site traffic, and personalize content.
                        You can choose which cookies you'd like to allow.
                    </p>

                    {/* Cookie Categories */}
                    <div className="space-y-3 mb-5">
                        {/* Essential - Always On */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#0F3D3E]/10 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-[#0F3D3E]" />
                                </div>
                                <div>
                                    <span className="font-medium text-[#0F3D3E] text-sm">Essential</span>
                                    <p className="text-xs text-gray-500">Required for site functionality</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Always on</span>
                                <div className="w-10 h-6 bg-[#0F3D3E] rounded-full flex items-center justify-end px-1">
                                    <div className="w-4 h-4 bg-white rounded-full" />
                                </div>
                            </div>
                        </div>

                        {/* Expandable Details */}
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="flex items-center gap-2 text-[#0F3D3E] text-sm font-medium hover:underline"
                        >
                            <Settings className="w-4 h-4" />
                            Customize preferences
                            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {showDetails && (
                            <div className="space-y-3 animate-fadeIn">
                                {/* Analytics */}
                                <div
                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-[#0F3D3E]/30 transition-colors"
                                    onClick={() => handleToggle('analytics')}
                                >
                                    <div>
                                        <span className="font-medium text-[#0F3D3E] text-sm">Analytics</span>
                                        <p className="text-xs text-gray-500">Help us understand how you use our site</p>
                                    </div>
                                    <div className={`w-10 h-6 rounded-full flex items-center transition-colors px-1 ${consent.analytics ? 'bg-[#0F3D3E] justify-end' : 'bg-gray-300 justify-start'
                                        }`}>
                                        <div className="w-4 h-4 bg-white rounded-full shadow" />
                                    </div>
                                </div>

                                {/* Personalization */}
                                <div
                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-[#0F3D3E]/30 transition-colors"
                                    onClick={() => handleToggle('personalization')}
                                >
                                    <div>
                                        <span className="font-medium text-[#0F3D3E] text-sm">Personalization</span>
                                        <p className="text-xs text-gray-500">Remember your preferences & show relevant content</p>
                                    </div>
                                    <div className={`w-10 h-6 rounded-full flex items-center transition-colors px-1 ${consent.personalization ? 'bg-[#0F3D3E] justify-end' : 'bg-gray-300 justify-start'
                                        }`}>
                                        <div className="w-4 h-4 bg-white rounded-full shadow" />
                                    </div>
                                </div>

                                {/* Marketing */}
                                <div
                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-[#0F3D3E]/30 transition-colors"
                                    onClick={() => handleToggle('marketing')}
                                >
                                    <div>
                                        <span className="font-medium text-[#0F3D3E] text-sm">Marketing</span>
                                        <p className="text-xs text-gray-500">Show you relevant ads on other platforms</p>
                                    </div>
                                    <div className={`w-10 h-6 rounded-full flex items-center transition-colors px-1 ${consent.marketing ? 'bg-[#0F3D3E] justify-end' : 'bg-gray-300 justify-start'
                                        }`}>
                                        <div className="w-4 h-4 bg-white rounded-full shadow" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {showDetails ? (
                            <>
                                <button
                                    onClick={handleRejectAll}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Reject All
                                </button>
                                <button
                                    onClick={handleSavePreferences}
                                    className="flex-1 px-4 py-2.5 bg-[#0F3D3E] text-white rounded-xl text-sm font-medium hover:bg-[#0c3233] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    Save Preferences
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleRejectAll}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Essential Only
                                </button>
                                <button
                                    onClick={handleAcceptAll}
                                    className="flex-1 px-4 py-2.5 bg-[#0F3D3E] text-white rounded-xl text-sm font-medium hover:bg-[#0c3233] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    Accept All
                                </button>
                            </>
                        )}
                    </div>

                    {/* Privacy Policy Link */}
                    <p className="text-center text-xs text-gray-500 mt-4">
                        Learn more in our{' '}
                        <a href="#/privacy" className="text-[#0F3D3E] underline hover:no-underline">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>

            {/* Animation Styles */}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
      `}</style>
        </div>
    );
};

export default CookieConsent;
