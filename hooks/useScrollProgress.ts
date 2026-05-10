/**
 * useScrollProgress Hook
 * Tracks scroll position for progress bars and parallax effects
 * UI-UX Pro Max - Aurora UI Enhanced
 */

import { useEffect, useState, useRef, useCallback } from 'react';

interface UseScrollProgressReturn {
  progress: number; // 0-1 scroll progress
  scrollY: number; // Current scroll Y position
  scrollDirection: 'up' | 'down' | null;
  isScrolled: boolean; // True if scrolled past top
}

export const useScrollProgress = (): UseScrollProgressReturn => {
  const [progress, setProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Calculate progress (0-1)
      const newProgress = scrollHeight > 0 ? currentScrollY / scrollHeight : 0;
      setProgress(Math.min(1, Math.max(0, newProgress)));
      
      // Track scroll Y
      setScrollY(currentScrollY);
      
      // Track scroll direction
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up');
      }
      
      lastScrollY.current = currentScrollY;
      
      // Track if scrolled past top
      setIsScrolled(currentScrollY > 50);
    };

    // Initial call
    handleScroll();

    // Throttled scroll listener
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  return { progress, scrollY, scrollDirection, isScrolled };
};

/**
 * useScrollProgressElement
 * Tracks scroll progress relative to a specific element
 */
export const useScrollProgressElement = (
  elementRef: React.RefObject<HTMLElement>,
  options: { offset?: number; triggerOnTop?: boolean } = {}
): { progress: number; isVisible: boolean; isFullyVisible: boolean } => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isFullyVisible, setIsFullyVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const { offset = 0, triggerOnTop = false } = options;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementHeight = rect.height;

      // Calculate visibility
      const isElementVisible = rect.top < windowHeight && rect.bottom > 0;
      setIsVisible(isElementVisible);

      // Calculate full visibility
      const fullyVisible = rect.top >= 0 && rect.bottom <= windowHeight;
      setIsFullyVisible(fullyVisible);

      // Calculate progress through element
      let elementProgress = 0;
      if (triggerOnTop) {
        // Progress starts when top of element reaches top of viewport
        elementProgress = Math.max(0, Math.min(1, 1 - rect.top / windowHeight));
      } else {
        // Progress based on element entering viewport
        const start = windowHeight;
        const end = -elementHeight;
        elementProgress = 1 - (rect.top - end) / (start - end);
      }

      setProgress(Math.min(1, Math.max(0, elementProgress - offset)));
    };

    handleScroll();

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [elementRef, options.offset, options.triggerOnTop]);

  return { progress, isVisible, isFullyVisible };
};

/**
 * useParallax
 * Creates parallax scrolling effect
 */
export const useParallax = (
  speed: number = 0.5
): { transform: string } => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * speed);
    };

    handleScroll();

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [speed]);

  return { transform: `translateY(${offset}px)` };
};

export default useScrollProgress;
