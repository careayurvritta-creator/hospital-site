import React, { useEffect, useRef, useState } from 'react';

interface SplitTextProps {
  text: string;
  className?: string;
  wordClassName?: string;
  charClassName?: string;
  delay?: number;
  staggerMs?: number;
  threshold?: number;
  as?: keyof React.JSX.IntrinsicElements;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  wordClassName = '',
  charClassName = '',
  delay = 0,
  staggerMs = 30,
  threshold = 0.3,
  as: Tag = 'span',
}) => {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  const prefersReduced =
    typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReduced) {
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, prefersReduced]);

  const words = text.split(' ');

  return React.createElement(
    Tag,
    { ref: ref as React.Ref<never>, className: `reactbits-split ${inView ? 'in-view' : ''} ${className}` },
    words.map((word, wi) => (
      <span key={wi} className={`reactbits-split-word ${wordClassName}`}>
        {Array.from(word).map((char, ci) => (
          <span
            key={ci}
            className={`reactbits-split-char ${charClassName}`}
            style={{ transitionDelay: `${delay + (wi * word.length + ci) * staggerMs}ms` }}
          >
            {char}
          </span>
        ))}
        {wi < words.length - 1 ? '\u00A0' : ''}
      </span>
    )),
    <span className="sr-only" key="sr">{text}</span>
  );
};

export default SplitText;
