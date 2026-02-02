import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Briefcase, Calendar, Stethoscope, Menu, X } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface MobileBottomNavProps {
    onMenuToggle?: () => void;
    isMenuOpen?: boolean;
}

interface NavItem {
    path: string;
    labelKey: string;
    icon: React.FC<{ className?: string; size?: number }>;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
    onMenuToggle,
    isMenuOpen = false
}) => {
    const { t, language } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    const NAV_ITEMS: NavItem[] = [
        { path: '/', labelKey: 'home', icon: Home },
        { path: '/services', labelKey: 'services', icon: Briefcase },
        { path: '/booking', labelKey: 'book', icon: Calendar },
        { path: '/tools', labelKey: 'tools', icon: Stethoscope },
    ];

    const handleNavClick = (path: string) => {
        if (isMenuOpen && onMenuToggle) {
            onMenuToggle();
        }
        navigate(path);
        window.scrollTo(0, 0);
    };

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Spacer to prevent content from being hidden behind nav */}
            <div className="h-16 md:hidden" />

            {/* Bottom Navigation Bar - Enhanced with blur and better styling */}
            <nav
                className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                role="navigation"
                aria-label="Main mobile navigation"
            >
                <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
                    {/* Main nav items */}
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        const label = (t.nav as any)[item.labelKey] || item.labelKey;

                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNavClick(item.path)}
                                className={`
                                    relative flex flex-col items-center justify-center 
                                    py-2 px-4 min-h-[48px] min-w-[56px]
                                    transition-all duration-200 ease-out
                                    active:scale-90 touch-manipulation
                                    ${active
                                        ? 'text-ayur-green'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }
                                `}
                                aria-label={label}
                                aria-current={active ? 'page' : undefined}
                            >
                                {/* Icon with scale animation */}
                                <Icon
                                    size={active ? 24 : 22}
                                    className={`mb-0.5 transition-all duration-200 ${active ? 'drop-shadow-sm' : ''
                                        }`}
                                />

                                {/* Label with improved contrast */}
                                <span className={`text-[10px] font-semibold tracking-wide transition-all ${active ? 'opacity-100' : 'opacity-75'
                                    }`}>
                                    {label}
                                </span>

                                {/* Active indicator bar */}
                                {active && (
                                    <span
                                        className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-ayur-green animate-fadeIn"
                                    />
                                )}
                            </button>
                        );
                    })}

                    {/* Menu toggle button */}
                    <button
                        onClick={onMenuToggle}
                        className={`
                            relative flex flex-col items-center justify-center 
                            py-2 px-4 min-h-[48px] min-w-[56px]
                            transition-all duration-200 ease-out
                            active:scale-90 touch-manipulation
                            ${isMenuOpen
                                ? 'text-ayur-green'
                                : 'text-gray-500 hover:text-gray-700'
                            }
                        `}
                        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isMenuOpen}
                    >
                        {isMenuOpen ? (
                            <X size={24} className="mb-0.5 transition-transform duration-200 rotate-0" />
                        ) : (
                            <Menu size={22} className="mb-0.5 transition-transform duration-200" />
                        )}
                        <span className={`text-[10px] font-semibold tracking-wide ${isMenuOpen ? 'opacity-100' : 'opacity-75'}`}>
                            {isMenuOpen
                                ? (language === 'en' ? 'Close' : language === 'hi' ? 'बंद' : 'બંધ')
                                : (language === 'en' ? 'More' : language === 'hi' ? 'अधिक' : 'વધુ')
                            }
                        </span>

                        {/* Active indicator for menu */}
                        {isMenuOpen && (
                            <span className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-ayur-green animate-fadeIn" />
                        )}
                    </button>
                </div>
            </nav>
        </>
    );
};

export default MobileBottomNav;

