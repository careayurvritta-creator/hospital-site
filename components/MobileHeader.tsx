/**
 * Mobile Header Component
 * Optimized compact header for mobile devices with auto-hide on scroll
 */

import React, { useState, useEffect, useRef } from 'react';
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
    const [hidden, setHidden] = useState(false);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    // Scroll detection with auto-hide behavior
    useEffect(() => {
        const handleScroll = () => {
            if (!ticking.current) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;

                    // Update scrolled state
                    setScrolled(currentScrollY > 20);

                    // Auto-hide logic: hide when scrolling down, show when scrolling up
                    if (currentScrollY > 100) {
                        if (currentScrollY > lastScrollY.current && currentScrollY - lastScrollY.current > 5) {
                            // Scrolling down - hide header
                            setHidden(true);
                        } else if (lastScrollY.current - currentScrollY > 5) {
                            // Scrolling up - show header
                            setHidden(false);
                        }
                    } else {
                        // Near top - always show
                        setHidden(false);
                    }

                    lastScrollY.current = currentScrollY;
                    ticking.current = false;
                });
                ticking.current = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Determine if we should show back button
    const canGoBack = showBackButton || (location.pathname !== '/' && window.history.length > 1);

    // Header background based on scroll and transparent prop
    const getHeaderBg = () => {
        if (scrolled) {
            return 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100/50';
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
            {/* Header with auto-hide */}
            <header
                className={`
                    fixed top-0 left-0 right-0 z-50 md:hidden
                    transition-all duration-300 ease-out
                    ${getHeaderBg()}
                    ${hidden ? '-translate-y-full' : 'translate-y-0'}
                `}
                style={{ paddingTop: 'env(safe-area-inset-top)' }}
            >
                <div className="flex items-center justify-between h-14 px-4">
                    {/* Left: Back button or Logo */}
                    <div className="flex items-center gap-2 min-w-[80px]">
                        {canGoBack ? (
                            <button
                                onClick={handleBack}
                                className={`
                                    p-2.5 -ml-2 rounded-full min-h-[48px] min-w-[48px]
                                    flex items-center justify-center
                                    ${getTextColor()} 
                                    active:bg-black/5 active:scale-95
                                    transition-all duration-150 touch-manipulation
                                `}
                                aria-label="Go back"
                            >
                                <ArrowLeft size={24} />
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 min-h-[48px] active:scale-95 transition-transform touch-manipulation"
                                aria-label="Go to home"
                            >
                                <img
                                    src="/images/logo-nobg.png"
                                    alt="Ayurvritta"
                                    className="h-8 w-8"
                                />
                                <span className={`font-serif font-bold text-lg ${getTextColor()} transition-colors`}>
                                    AYURVRITTA
                                </span>
                            </button>
                        )}
                    </div>

                    {/* Center: Page title (if provided and back button shown) */}
                    {title && canGoBack && (
                        <h1 className={`font-serif font-bold text-base ${getTextColor()} truncate max-w-[150px] transition-colors`}>
                            {title}
                        </h1>
                    )}

                    {/* Right: Quick action buttons */}
                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={handleCall}
                            className={`
                                p-3 rounded-full min-h-[48px] min-w-[48px]
                                flex items-center justify-center
                                ${getTextColor()} 
                                active:bg-black/5 active:scale-95
                                transition-all duration-150 touch-manipulation
                            `}
                            aria-label="Call us"
                        >
                            <Phone size={20} />
                        </button>
                        <button
                            onClick={handleWhatsApp}
                            className="
                                p-3 rounded-full min-h-[48px] min-w-[48px]
                                flex items-center justify-center
                                text-green-600 
                                active:bg-green-50 active:scale-95
                                transition-all duration-150 touch-manipulation
                            "
                            aria-label="WhatsApp us"
                        >
                            <MessageCircle size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Spacer for fixed header - adjusts based on safe area */}
            <div
                className="md:hidden"
                style={{ height: 'calc(56px + env(safe-area-inset-top))' }}
            />
        </>
    );
};

export default MobileHeader;

