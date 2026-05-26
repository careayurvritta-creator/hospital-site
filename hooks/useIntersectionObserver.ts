/**
 * useIntersectionObserver Hook
 * Tracks when elements enter/exit viewport for scroll-triggered animations
 * UI-UX Pro Max - Aurora UI Enhanced
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  freezeOnceVisible?: boolean;
}

interface UseIntersectionObserverReturn {
  ref: import('react').RefObject<HTMLElement>;
  isVisible: boolean;
  hasBeenVisible: boolean;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn => {
  const {
    threshold = 0.1,
    rootMargin = '-50px',
    triggerOnce = true,
    freezeOnceVisible = true,
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting;
          
          if (visible) {
            setIsVisible(true);
            setHasBeenVisible(true);
            
            if (triggerOnce && freezeOnceVisible) {
              observerRef.current?.unobserve(element);
            }
          } else {
            if (!triggerOnce) {
              setIsVisible(false);
            }
          }
        });
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, triggerOnce, freezeOnceVisible]);

  return { ref, isVisible, hasBeenVisible };
};

/**
 * useIntersectionObserverMultiple
 * Tracks multiple elements for staggered animations
 */
export const useIntersectionObserverMultiple = (
  count: number,
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn[] => {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [visibilityStates, setVisibilityStates] = useState<boolean[]>(
    new Array(count).fill(false)
  );
  const [hasBeenVisibleStates, setHasBeenVisibleStates] = useState<boolean[]>(
    new Array(count).fill(false)
  );

  useEffect(() => {
    const elements = refs.current.filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = elements.indexOf(entry.target as HTMLElement);
          if (index !== -1) {
            const visible = entry.isIntersecting;
            
            setVisibilityStates((prev) => {
              const newState = [...prev];
              newState[index] = visible;
              return newState;
            });

            if (visible) {
              setHasBeenVisibleStates((prev) => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
              });
            }
          }
        });
      },
      { threshold: options.threshold ?? 0.1, rootMargin: options.rootMargin ?? '-50px' }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [count, options.threshold, options.rootMargin]);

  return refs.current.map((_, index) => ({
    ref: { current: refs.current[index] } as import('react').RefObject<HTMLElement>,
    isVisible: visibilityStates[index],
    hasBeenVisible: hasBeenVisibleStates[index],
  }));
};

export default useIntersectionObserver;
