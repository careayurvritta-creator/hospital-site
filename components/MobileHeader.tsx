/**
 * Mobile Header Component
 * Optimized compact header for mobile devices
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, MessageCircle, ArrowLeft } from 'lucide-react';

interface MobileHeaderProps {
    showBackButton?: boolean;
    title?: string;
    transparent?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
    showBackButton = false,
    title,
    transparent = false,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    // Scroll detection
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Determine if we should show back button
    const canGoBack = showBackButton || (location.pathname !== '/' && window.history.length > 1);

    // Header background based on scroll and transparent prop
    const getHeaderBg = () => {
        if (scrolled) {
            return 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100';
        }
        if (transparent) {
            return 'bg-transparent';
        }
        return 'bg-ayur-cream';
    };

    // Text color based on state
    const getTextColor = () => {
        if (scrolled || !transparent) {
            return 'text-ayur-green';
        }
        return 'text-white';
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/');
        }
    };

    const handleCall = () => {
        window.location.href = 'tel:+919426684047';
    };

    const handleWhatsApp = () => {
        window.open('https://wa.me/919426684047', '_blank');
    };

    return (
        <>
            {/* Header */}
            <header
                className={`
          fixed top-0 left-0 right-0 z-50 md:hidden
          transition-all duration-300
          ${getHeaderBg()}
          safe-area-top
        `}
            >
                <div className="flex items-center justify-between h-14 px-4">
                    {/* Left: Back button or Logo */}
                    <div className="flex items-center gap-2 min-w-[80px]">
                        {canGoBack ? (
                            <button
                                onClick={handleBack}
                                className={`p-2 -ml-2 rounded-full touch-target ${getTextColor()} active:bg-black/5`}
                                aria-label="Go back"
                            >
                                <ArrowLeft size={24} />
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2"
                                aria-label="Go to home"
                            >
                                <img
                                    src="/images/logo-nobg.png"
                                    alt="Ayurvritta"
                                    className="h-8 w-8"
                                />
                                <span className={`font-serif font-bold text-lg ${getTextColor()}`}>
                                    AYURVRITTA
                                </span>
                            </button>
                        )}
                    </div>

                    {/* Center: Page title (if provided and back button shown) */}
                    {title && canGoBack && (
                        <h1 className={`font-serif font-bold text-base ${getTextColor()} truncate max-w-[150px]`}>
                            {title}
                        </h1>
                    )}

                    {/* Right: Quick action buttons */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleCall}
                            className={`p-2.5 rounded-full touch-target ${getTextColor()} active:bg-black/5 transition-colors`}
                            aria-label="Call us"
                        >
                            <Phone size={20} />
                        </button>
                        <button
                            onClick={handleWhatsApp}
                            className="p-2.5 rounded-full touch-target text-green-600 active:bg-green-50 transition-colors"
                            aria-label="WhatsApp us"
                        >
                            <MessageCircle size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Spacer for fixed header */}
            <div className="h-14 md:hidden" />
        </>
    );
};

export default MobileHeader;
