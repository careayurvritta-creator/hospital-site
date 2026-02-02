/**
 * Mobile CTA Bar Component
 * Fixed bottom bar with click-to-call and WhatsApp CTAs (priority for mobile)
 */

import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Calendar, X } from 'lucide-react';
import { mobileDeviceDetector } from '../analytics/mobileDeviceDetector';
import { useAnalytics } from './AnalyticsProvider';

interface MobileCTABarProps {
    phoneNumber?: string;
    whatsappNumber?: string;
    showBooking?: boolean;
    className?: string;
}

const MobileCTABar: React.FC<MobileCTABarProps> = ({
    phoneNumber = '+919426684047',
    whatsappNumber = '919426684047',
    showBooking = false,
    className = '',
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const { trackEvent } = useAnalytics();

    // Only show on mobile devices
    useEffect(() => {
        const checkDevice = () => {
            const isMobile = mobileDeviceDetector.isMobile();
            setIsVisible(isMobile && !isDismissed);
        };

        checkDevice();

        // Listen for device changes (e.g., resize)
        const unsubscribe = mobileDeviceDetector.subscribe(() => {
            checkDevice();
        });

        return () => unsubscribe();
    }, [isDismissed]);

    // Check if during business hours (9 AM - 9 PM IST)
    const isBusinessHours = (): boolean => {
        const now = new Date();
        const hours = now.getHours();
        return hours >= 9 && hours < 21;
    };

    const handleCall = () => {
        trackEvent('conversion', 'click_to_call', 'mobile_cta_bar');
        window.location.href = `tel:${phoneNumber}`;
    };

    const handleWhatsApp = () => {
        trackEvent('conversion', 'whatsapp_click', 'mobile_cta_bar');
        const message = encodeURIComponent('Hi, I would like to enquire about your services.');
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    };

    const handleBooking = () => {
        trackEvent('conversion', 'booking_click', 'mobile_cta_bar');
        window.location.href = '#/booking';
    };

    const handleDismiss = () => {
        setIsDismissed(true);
        trackEvent('engagement', 'cta_bar_dismissed', 'mobile');
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Spacer to prevent content overlap */}
            <div className="h-16 md:hidden" />

            {/* Fixed bottom bar */}
            <div className={`fixed bottom-0 left-0 right-0 z-50 md:hidden ${className}`}>
                {/* Main CTA Bar */}
                <div className="bg-white border-t border-gray-200 shadow-lg safe-area-bottom">
                    <div className="flex items-center justify-around p-2">
                        {/* Call Button - Primary when in business hours */}
                        <button
                            onClick={handleCall}
                            className={`flex-1 mx-1 flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all ${isBusinessHours()
                                    ? 'bg-gradient-to-r from-[#0F3D3E] to-[#1a5a5c] text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                            aria-label="Call us"
                        >
                            <Phone className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium">Call Now</span>
                            {isBusinessHours() && (
                                <span className="text-[10px] opacity-80">Open Now</span>
                            )}
                        </button>

                        {/* WhatsApp Button - Primary when outside business hours */}
                        <button
                            onClick={handleWhatsApp}
                            className={`flex-1 mx-1 flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all ${!isBusinessHours()
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                                    : 'bg-green-50 text-green-700 border border-green-200'
                                }`}
                            aria-label="WhatsApp us"
                        >
                            <MessageCircle className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium">WhatsApp</span>
                            {!isBusinessHours() && (
                                <span className="text-[10px] opacity-80">24/7</span>
                            )}
                        </button>

                        {/* Booking Button - Optional */}
                        {showBooking && (
                            <button
                                onClick={handleBooking}
                                className="flex-1 mx-1 flex flex-col items-center justify-center py-2 px-3 rounded-xl bg-[#C27A12]/10 text-[#C27A12] border border-[#C27A12]/20 transition-all"
                                aria-label="Book appointment"
                            >
                                <Calendar className="w-5 h-5 mb-1" />
                                <span className="text-xs font-medium">Book</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Dismiss button (small, top-right) */}
                <button
                    onClick={handleDismiss}
                    className="absolute -top-8 right-2 p-1.5 bg-white rounded-full shadow-md border border-gray-200 text-gray-400 hover:text-gray-600"
                    aria-label="Dismiss CTA bar"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>

            <style>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
      `}</style>
        </>
    );
};

export default MobileCTABar;
