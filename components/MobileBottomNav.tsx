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
    labelKey: string; // Changed from label to labelKey
    icon: React.FC<{ className?: string; size?: number }>;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
    onMenuToggle,
    isMenuOpen = false
}) => {
    const { t, language } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    // Moved inside component to access 't' if I wanted to translate here, 
    // but better to keep data static and translate in render.
    // Actually, distinct keys are needed.
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

            {/* Bottom Navigation Bar */}
            <nav
                className="bottom-nav md:hidden"
                role="navigation"
                aria-label="Main mobile navigation"
            >
                <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
                    {/* Main nav items */}
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        // Translate label
                        const label = (t.nav as any)[item.labelKey] || item.labelKey;

                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNavClick(item.path)}
                                className={`bottom-nav-item ${active ? 'active' : ''}`}
                                aria-label={label}
                                aria-current={active ? 'page' : undefined}
                            >
                                <Icon
                                    size={22}
                                    className={`mb-0.5 transition-transform ${active ? 'scale-110' : ''}`}
                                />
                                <span className="text-[10px] font-medium tracking-wide">
                                    {label}
                                </span>
                                {/* Active indicator dot */}
                                {active && (
                                    <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-ayur-green" />
                                )}
                            </button>
                        );
                    })}

                    {/* Menu toggle button */}
                    <button
                        onClick={onMenuToggle}
                        className={`bottom-nav-item ${isMenuOpen ? 'active' : ''}`}
                        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isMenuOpen}
                    >
                        {isMenuOpen ? (
                            <X size={22} className="mb-0.5" />
                        ) : (
                            <Menu size={22} className="mb-0.5" />
                        )}
                        <span className="text-[10px] font-medium tracking-wide">
                            {isMenuOpen ? (language === 'en' ? 'Close' : language === 'hi' ? 'बंद' : 'બંધ') : (language === 'en' ? 'More' : language === 'hi' ? 'अधिक' : 'વધુ')}
                        </span>
                    </button>
                </div>
            </nav>
        </>
    );
};


export default MobileBottomNav;
