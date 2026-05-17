import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Phone, MapPin, Facebook, Instagram, Twitter, Mail, Globe, ChevronUp } from 'lucide-react';
import { NavLink as RRDNavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';
import ChatBot from './ChatBot';
import WhatsAppBubble from './WhatsAppBubble';
import MobileBottomNav from './MobileBottomNav';
import { useLanguage } from './LanguageContext';
import { Language } from '../types';

// Wrapper for NavLink supporting className function and scroll reset
export const NavLink: React.FC<{
  to: string;
  className?: string | ((props: { isActive: boolean }) => string);
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ to, className, children, onClick }) => {
  return (
    <RRDNavLink
      to={to}
      onClick={(e) => {
        if (onClick) onClick();
        window.scrollTo(0, 0);
      }}
      className={({ isActive }) => {
        if (typeof className === 'function') {
          return className({ isActive });
        }
        return className || '';
      }}
    >
      {children}
    </RRDNavLink>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
 const { language, setLanguage, t } = useLanguage();
 const headerRef = useRef<HTMLElement>(null);
  // Determine page types for header styling
  const isGreenHeroPage = location.pathname !== '/';
  const isBookingPage = location.pathname === '/booking';

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMenuOpen]);

   // Scroll effect for navbar, progress bar, and scroll-to-top button
   useEffect(() => {
   const handleScroll = () => {
   const scrolled = window.scrollY > 20;
   setScrolled(scrolled);
   
   // Calculate scroll progress
   const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
   const progress = (window.scrollY / windowHeight) * 100;
   setScrollProgress(progress);
   
   // Show/hide scroll to top button
   setShowScrollTop(window.scrollY > 300);
   };
   
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Listen for chatbot open/close events
    useEffect(() => {
      const handleChatbotToggle = (e: Event) => {
        const customEvent = e as CustomEvent;
        setIsChatbotOpen(customEvent.detail.isOpen);
      };
      window.addEventListener('chatbot-toggle', handleChatbotToggle);
      return () => window.removeEventListener('chatbot-toggle', handleChatbotToggle);
    }, []);

    const changeLanguage = (lang: Language) => {
   setLanguage(lang);
   setIsLangMenuOpen(false);
   };
   
   // Smooth scroll to top
   const scrollToTop = () => {
   window.scrollTo({
   top: 0,
   behavior: 'smooth'
   });
   };
  // --- Dynamic Style Logic ---
  const getHeaderStyles = () => {
    // 1. If Menu is Open -> Background is Cream, Text must be Green
    if (isMenuOpen) {
      return {
        bg: 'bg-ayur-cream',
        text: 'text-ayur-green',
        logoSub: 'text-ayur-accent',
        glass: ''
      };
    }

    // 2. If Scrolled -> Refined Glassmorphism
    if (scrolled) {
      return {
        bg: 'bg-white/90 border-b border-ayur-subtle/50',
        text: 'text-ayur-green',
        logoSub: 'text-ayur-accent',
        glass: 'backdrop-blur-md shadow-sm'
      };
    }

    // 3. Booking Page Special Handling
    if (isBookingPage) {
      return {
        bg: 'bg-ayur-green border-b border-white/5',
        text: 'text-white',
        logoSub: 'text-ayur-accent',
        glass: 'shadow-md'
      };
    }

    // 4. Top of Page (Transparent Header)
    if (isGreenHeroPage) {
      return {
        bg: 'bg-transparent',
        text: 'text-white',
        logoSub: 'text-ayur-accent',
        glass: ''
      };
    } else {
      // Home Page (Cream Hero) -> Text Green
      return {
        bg: 'bg-transparent',
        text: 'text-ayur-green',
        logoSub: 'text-ayur-accent',
        glass: ''
      };
    }
  };

  const styles = getHeaderStyles();

   return (
   <div className="min-h-screen flex flex-col font-sans text-ayur-gray bg-ayur-cream selection:bg-ayur-accent selection:text-white relative">
   
   {/* Scroll Progress Bar */}
   <div 
   className="fixed top-0 left-0 h-1 bg-gradient-to-r from-ayur-green via-ayur-gold to-ayur-accent z-[60] transition-all duration-150 ease-out"
   style={{ width: `${scrollProgress}%` }}
   />
  
   {/* Skip to main content link for accessibility */}      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-ayur-green focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Navbar */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${styles.bg} ${styles.glass} ${isMenuOpen ? '' : 'py-3 md:py-4'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center z-50">
              <NavLink to="/" className={() => "flex items-center gap-3 group"} onClick={() => setIsMenuOpen(false)}>
                {/* Logo Image */}
                <img src="/images/logo-nobg.png" alt="Ayurvritta Logo" className="h-10 w-10 md:h-12 md:w-12 object-contain" />

                <div className="flex flex-col">
                  <span className={`font-serif text-xl md:text-3xl font-bold tracking-tight transition-colors ${styles.text}`}>
                    AYURVRITTA
                  </span>
                  <span className={`text-[0.7rem] sm:text-xs uppercase tracking-[0.2em] font-semibold transition-colors ${styles.logoSub}`}>
                    Ayurveda Hospital
                  </span>
                </div>
              </NavLink>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-6 items-center">
              {NAV_ITEMS.map((item) => {
                const keyMap: Record<string, string> = {
                  '/': 'home',
                  '/about': 'about',
                  '/services': 'services',
                  '/programs': 'programs',
                  '/tools': 'tools',
                  '/booking': 'contact',
                  '/insurance': 'insurance',
                  '/blog': 'blog'
                };
                const key = keyMap[item.path];
                const label = key ? (t.nav && (t.nav as Record<string, string>)[key]) || item.label : item.label;
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `text-sm font-medium tracking-wide transition-all duration-200 relative group ${isActive
                        ? `font-bold text-ayur-gold !text-[#BFA05A]`
                        : `${styles.text}`
                      }`
                    }
                    children={({ isActive }) => (
                      <span className="relative inline-block py-1">
                        {label}
                        <span className={`absolute bottom-0 left-0 h-0.5 bg-ayur-gold transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                      </span>
                    )}
                  />
                );
              })}

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className={`flex items-center gap-1 text-sm font-bold uppercase py-1 px-3 rounded-full border transition-all ${scrolled ? 'border-ayur-green text-ayur-green hover:bg-ayur-green/5' : 'border-white/30 text-white hover:bg-white/10'
                    } ${isBookingPage || isGreenHeroPage ? (scrolled ? '' : 'text-white border-white/30') : (scrolled ? '' : 'text-ayur-green border-ayur-green/30')}`}
                >
                  <Globe size={14} />
                  {language}
                </button>

                {isLangMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-ayur-subtle overflow-hidden w-36 py-1 flex flex-col animate-fadeIn">
                    <button onClick={() => changeLanguage('en')} className={`px-4 py-3 text-left text-sm hover:bg-ayur-green-light min-h-[44px] ${language === 'en' ? 'font-bold text-ayur-green' : 'text-ayur-gray'}`}>English</button>
                    <button onClick={() => changeLanguage('hi')} className={`px-4 py-3 text-left text-sm hover:bg-ayur-green-light min-h-[44px] ${language === 'hi' ? 'font-bold text-ayur-green' : 'text-ayur-gray'}`}>हिन्दी</button>
                    <button onClick={() => changeLanguage('gu')} className={`px-4 py-3 text-left text-sm hover:bg-ayur-green-light min-h-[44px] ${language === 'gu' ? 'font-bold text-ayur-green' : 'text-ayur-gray'}`}>ગુજરાતી</button>
                  </div>
                )}
              </div>

              <NavLink
                to="/booking"
                className={() => "bg-ayur-accent hover:bg-ayur-accent-hover text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-transparent"}
              >
                {t.nav.book}
              </NavLink>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 lg:hidden">
              {/* Mobile Lang Toggle */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'hi' : language === 'hi' ? 'gu' : 'en')}
                className={`text-xs font-bold uppercase py-1.5 px-2.5 rounded-lg border min-h-[40px] ${styles.text} border-current opacity-80`}
                aria-label="Change language"
              >
                {language}
              </button>

              {/* Hamburger Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${styles.text}`}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay - Full Screen with Enhanced Animations */}
        <div
          className={`lg:hidden fixed inset-0 z-40 bg-ayur-cream transition-all duration-300 ease-out flex flex-col ${isMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
            }`}
          style={{
            paddingTop: 'calc(96px + env(safe-area-inset-top))',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom))'
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] pointer-events-none"></div>

          {/* Swipe indicator at top */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-gray-300/50 opacity-0 transition-opacity" style={{ opacity: isMenuOpen ? 1 : 0 }} />

          <nav className="flex flex-col space-y-3 text-center relative z-10 h-full overflow-y-auto px-6">
            {NAV_ITEMS.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `py-4 px-6 rounded-2xl text-xl font-serif font-medium transition-all duration-300 min-h-[56px] flex items-center justify-center
                   ${isActive
                    ? 'text-white bg-ayur-green shadow-lg'
                    : 'text-ayur-gray hover:text-ayur-green hover:bg-ayur-green/5 active:scale-95'
                  }
                   ${isMenuOpen ? 'animate-fadeIn' : ''}
                  `
                }
                style={{
                  animationDelay: isMenuOpen ? `${index * 50}ms` : '0ms',
                  animationFillMode: 'both'
                }}
              >
                {/* Mobile Loop Map */}
                {(() => {
                  const keyMap: Record<string, string> = {
                    '/': 'home',
                    '/about': 'about',
                    '/services': 'services',
                    '/programs': 'programs',
                    '/tools': 'tools',
                    '/booking': 'contact',
                    '/insurance': 'insurance',
                    '/blog': 'blog'
                  };
                  const key = keyMap[item.path];
                  const navItem = t.nav as Record<string, string> | undefined;
                  return (key && navItem?.[key]) || item.label;
                })()}
              </NavLink>
            ))}

            {/* Primary CTA */}
            <div className="pt-4" style={{ animationDelay: isMenuOpen ? '300ms' : '0ms' }}>
              <NavLink
                to="/booking"
                onClick={() => setIsMenuOpen(false)}
                className={() => `
                  inline-flex items-center justify-center w-full 
                  bg-ayur-accent text-white text-lg py-5 rounded-2xl 
                  font-bold shadow-lg active:scale-95 
                  transition-all duration-200 min-h-[60px]
                  ${isMenuOpen ? 'animate-fadeIn' : ''}
                `}
              >
                {t.nav.book}
              </NavLink>
            </div>

            {/* Mobile Footer Links - Quick Actions */}
            <div
              className={`mt-auto pt-8 flex justify-center gap-6 ${isMenuOpen ? 'animate-fadeIn' : ''}`}
              style={{ animationDelay: isMenuOpen ? '350ms' : '0ms', animationFillMode: 'both' }}
            >
              <a
                href="tel:+919426684047"
                className="flex flex-col items-center gap-1 p-3 min-w-[64px] rounded-xl hover:bg-ayur-green/5 active:scale-95 transition-all"
                title="Call Us"
                aria-label="Call Ayurvritta"
              >
                <Phone size={24} className="text-ayur-green" />
                <span className="text-xs text-ayur-gray/70">Call</span>
              </a>
              <a
                href="mailto:care.ayurvritta@gmail.com"
                className="flex flex-col items-center gap-1 p-3 min-w-[64px] rounded-xl hover:bg-ayur-green/5 active:scale-95 transition-all"
                title="Email Us"
                aria-label="Email Ayurvritta"
              >
                <Mail size={24} className="text-ayur-green" />
                <span className="text-xs text-ayur-gray/70">Email</span>
              </a>
              <a
                href="https://maps.google.com/?q=Ayurvritta+Vadodara"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 p-3 min-w-[64px] rounded-xl hover:bg-ayur-green/5 active:scale-95 transition-all"
                title="Find Us"
                aria-label="View on Google Maps"
              >
                <MapPin size={24} className="text-ayur-green" />
                <span className="text-xs text-ayur-gray/70">Map</span>
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-grow pb-20 md:pb-0" tabIndex={-1}>
        {children}
      </main>

      {/* Mobile Bottom Navigation - Shows on mobile only */}
      <MobileBottomNav
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        isMenuOpen={isMenuOpen}
      />

      {/* Footer */}
      <footer className="bg-ayur-green-dark text-ayur-cream relative overflow-hidden pb-20 md:pb-0 border-t border-white/5">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Brand Column */}
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-white tracking-wide">AYURVRITTA</h3>
                <p className="text-ayur-accent-light text-xs uppercase tracking-widest font-semibold mt-1">Hospital & Panchakarma Center</p>
              </div>
              <p className="text-sm opacity-80 leading-relaxed">
                {t.footer.tagline}
              </p>
              <div className="flex space-x-4 pt-2">
                <a href="https://www.facebook.com/profile.php?id=61560024669845" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-ayur-accent hover:text-white transition-all min-h-[48px] min-w-[48px]" title="Facebook" aria-label="Ayurvritta on Facebook"><Facebook size={18} /></a>
                <a href="https://www.instagram.com/ayurvritta/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-ayur-accent hover:text-white transition-all min-h-[48px] min-w-[48px]" title="Instagram" aria-label="Ayurvritta on Instagram"><Instagram size={18} /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-ayur-accent hover:text-white transition-all min-h-[48px] min-w-[48px]" title="Twitter" aria-label="Ayurvritta on Twitter"><Twitter size={18} /></a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-4 md:block">
              <div className="md:mb-6">
                <h4 className="font-serif text-lg text-white mb-4 border-b border-white/20 pb-2 inline-block">Explore</h4>
                <ul className="space-y-3 text-sm">
                  <li><NavLink to="/services" className={() => "hover:text-ayur-accent-light transition-colors flex items-center"}><span className="w-1.5 h-1.5 bg-ayur-accent rounded-full mr-2"></span>Treatments</NavLink></li>
                  <li><NavLink to="/programs" className={() => "hover:text-ayur-accent-light transition-colors flex items-center"}><span className="w-1.5 h-1.5 bg-ayur-accent rounded-full mr-2"></span>Programs</NavLink></li>
                </ul>
              </div>
              <div>
                {/* Spacer for mobile grid alignment */}
                <div className="md:hidden h-[34px]"></div>
                <ul className="space-y-3 text-sm">
                  <li><NavLink to="/tools" className={() => "hover:text-ayur-accent-light transition-colors flex items-center"}><span className="w-1.5 h-1.5 bg-ayur-accent rounded-full mr-2"></span>Health Tools</NavLink></li>
                  <li><NavLink to="/about" className={() => "hover:text-ayur-accent-light transition-colors flex items-center"}><span className="w-1.5 h-1.5 bg-ayur-accent rounded-full mr-2"></span>About Us</NavLink></li>
                </ul>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-serif text-lg text-white mb-4 border-b border-white/20 pb-2 inline-block">Visit Us</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start">
                  <MapPin size={18} className="mt-1 mr-3 text-ayur-accent-light shrink-0" />
                  <span className="opacity-90 leading-relaxed">FF 104–107, Lotus Enora Complex,<br />Opp. Rutu Villa, New Alkapuri,<br />Vadodara – 390021</span>
                </li>
                <li className="flex items-center">
                  <Phone size={18} className="mr-3 text-ayur-accent-light shrink-0" />
                  <span className="opacity-90">+91 94266 84047</span>
                </li>
                <li className="flex items-center">
                  <Mail size={18} className="mr-3 text-ayur-accent-light shrink-0" />
                  <span className="opacity-90">care.ayurvritta@gmail.com</span>
                </li>
              </ul>
            </div>

            {/* Timings */}
            <div>
              <h4 className="font-serif text-lg text-white mb-4 border-b border-white/20 pb-2 inline-block">Hospital Hours</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="opacity-80">All Days</span>
                  <span className="font-medium text-white">Open 24 Hours</span>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10 hidden md:block backdrop-blur-sm">
                <p className="text-xs italic text-center opacity-80">
                  "Sharira madhyam khalu dharma sadhanam" <br />
                  The body is the means to fulfill all duties.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center text-xs opacity-60 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; {new Date().getFullYear()} Ayurvritta Ayurveda Hospital.</p>
            <div className="space-x-6">
              <NavLink to="/privacy" className={() => "hover:text-white transition-colors"}>Privacy</NavLink>
              <NavLink to="/terms" className={() => "hover:text-white transition-colors"}>Terms</NavLink>
            </div>
          </div>
        </div>
      </footer>

       {/* Floating Action Bubbles - Hidden when mobile menu is open */}
       <div className={`${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-200`}>
       {/* AI Chatbot Overlay */}
       <ChatBot />
      
       {/* WhatsApp Chat Bubble */}
       <WhatsAppBubble />
       
         {/* Scroll to Top Button */}
         <button
         onClick={scrollToTop}
         className={`fixed bottom-40 md:bottom-32 right-4 md:right-8 z-[70] p-3 rounded-full bg-ayur-green text-white shadow-lg hover:bg-ayur-green-dark transition-all duration-300 transform hover:scale-110 active:scale-95 ${
         showScrollTop && !isChatbotOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
         }`}
         aria-label="Scroll to top"
         title="Back to top"
         >
         <ChevronUp size={24} className="animate-bounce-short" />
         </button>
       </div>    </div>
  );
};

export default Layout;