import React, { useEffect, useRef, useState } from 'react';

interface CounterProps {
  value: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  threshold?: number;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const Counter: React.FC<CounterProps> = ({
  value,
  duration = 1600,
  delay = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  threshold = 0.4,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const startedRef = useRef(false);
  const rafRef = useRef(0);
  const prefersReduced =
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || startedRef.current) return;
        startedRef.current = true;

        if (prefersReduced) {
          setDisplay(value);
          observer.disconnect();
          return;
        }

        const startTime = performance.now() + delay;
        const tick = (now: number) => {
          const elapsed = Math.max(0, now - startTime);
          const t = Math.min(elapsed / duration, 1);
          setDisplay(value * easeOutCubic(t));
          if (t < 1) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold }
    );

    observer.observe(el);
    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [value, duration, delay, threshold, prefersReduced]);

  const formatted = display.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${value.toLocaleString('en-IN')}${suffix}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export default Counter;
