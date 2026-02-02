/**
 * Mobile Consent Component
 * Mobile-optimized bottom sheet consent UI
 */

import React, { useState, useEffect } from 'react';
import { Shield, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { consentManager } from '../analytics';

interface LocalConsentState {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
}

const MobileConsent: React.FC = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [consent, setConsent] = useState<LocalConsentState>({
        essential: true,
        analytics: false,
        marketing: false,
        personalization: false,
    });

    useEffect(() => {
        // Check if consent already given
        if (!consentManager.hasConsented()) {
            // Delay showing to avoid layout shift
            setTimeout(() => setShowBanner(true), 1000);
        }
    }, []);

    const handleAcceptAll = () => {
        consentManager.acceptAll();
        setShowBanner(false);
    };

    const handleAcceptEssential = () => {
        consentManager.acceptEssentialOnly();
        setShowBanner(false);
    };

    const handleSavePreferences = () => {
        consentManager.updateConsent({
            analytics: consent.analytics,
            marketing: consent.marketing,
            personalization: consent.personalization,
        });
        setShowBanner(false);
    };

    const toggleOption = (key: keyof LocalConsentState) => {
        if (key === 'essential') return; // Can't toggle essential
        setConsent(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (!showBanner) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 z-[9998] md:hidden"
                onClick={() => setShowDetails(false)}
            />

            {/* Bottom Sheet */}
            <div className="fixed bottom-0 left-0 right-0 z-[9999] md:hidden animate-slideUp">
                <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden safe-area-bottom">
                    {/* Handle */}
                    <div className="flex justify-center py-2">
                        <div className="w-10 h-1 bg-gray-300 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="px-5 pb-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-[#0F3D3E]/10 rounded-full flex items-center justify-center">
                                <Shield className="w-5 h-5 text-[#0F3D3E]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#0F3D3E] text-base">Your Privacy</h3>
                                <p className="text-xs text-gray-500">We respect your choices</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            We use cookies to improve your experience. You can customize your preferences.
                        </p>

                        {/* Quick Actions */}
                        {!showDetails && (
                            <div className="space-y-2">
                                <button
                                    onClick={handleAcceptAll}
                                    className="w-full py-3.5 bg-gradient-to-r from-[#0F3D3E] to-[#1a5a5c] text-white rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition-transform"
                                >
                                    Accept All
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAcceptEssential}
                                        className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm active:bg-gray-50 transition-colors"
                                    >
                                        Essential Only
                                    </button>
                                    <button
                                        onClick={() => setShowDetails(true)}
                                        className="flex-1 py-3 border border-[#0F3D3E] text-[#0F3D3E] rounded-xl font-medium text-sm active:bg-[#0F3D3E]/5 transition-colors flex items-center justify-center gap-1"
                                    >
                                        Customize
                                        <ChevronUp className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Detailed Options */}
                        {showDetails && (
                            <div className="space-y-3">
                                {/* Essential - Always On */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex-1">
                                        <span className="font-medium text-[#0F3D3E] text-sm">Essential</span>
                                        <p className="text-xs text-gray-500">Required for site function</p>
                                    </div>
                                    <div className="w-12 h-6 bg-[#0F3D3E] rounded-full flex items-center justify-end px-1">
                                        <div className="w-4 h-4 bg-white rounded-full shadow" />
                                    </div>
                                </div>

                                {/* Analytics Toggle */}
                                <button
                                    onClick={() => toggleOption('analytics')}
                                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors"
                                >
                                    <div className="flex-1 text-left">
                                        <span className="font-medium text-[#0F3D3E] text-sm">Analytics</span>
                                        <p className="text-xs text-gray-500">Help us improve</p>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${consent.analytics ? 'bg-[#0F3D3E] justify-end' : 'bg-gray-300 justify-start'
                                        }`}>
                                        <div className="w-4 h-4 bg-white rounded-full shadow" />
                                    </div>
                                </button>

                                {/* Marketing Toggle */}
                                <button
                                    onClick={() => toggleOption('marketing')}
                                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors"
                                >
                                    <div className="flex-1 text-left">
                                        <span className="font-medium text-[#0F3D3E] text-sm">Marketing</span>
                                        <p className="text-xs text-gray-500">Personalized offers</p>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${consent.marketing ? 'bg-[#0F3D3E] justify-end' : 'bg-gray-300 justify-start'
                                        }`}>
                                        <div className="w-4 h-4 bg-white rounded-full shadow" />
                                    </div>
                                </button>

                                {/* Personalization Toggle */}
                                <button
                                    onClick={() => toggleOption('personalization')}
                                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors"
                                >
                                    <div className="flex-1 text-left">
                                        <span className="font-medium text-[#0F3D3E] text-sm">Personalization</span>
                                        <p className="text-xs text-gray-500">Tailored experience</p>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${consent.personalization ? 'bg-[#0F3D3E] justify-end' : 'bg-gray-300 justify-start'
                                        }`}>
                                        <div className="w-4 h-4 bg-white rounded-full shadow" />
                                    </div>
                                </button>

                                {/* Save Button */}
                                <button
                                    onClick={handleSavePreferences}
                                    className="w-full py-3.5 bg-[#0F3D3E] text-white rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    Save Preferences
                                </button>

                                {/* Collapse */}
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="w-full py-2 text-gray-500 text-sm flex items-center justify-center gap-1"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                    Less Options
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Privacy Link */}
                    <div className="px-5 pb-4 pt-2 border-t border-gray-100">
                        <a
                            href="#/privacy"
                            className="text-xs text-gray-500 underline"
                        >
                            Privacy Policy
                        </a>
                    </div>
                </div>
            </div>

            <style>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
        </>
    );
};

export default MobileConsent;
