import React, { useEffect, useRef } from 'react';

interface AnimatedListProps {
  items: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  staggerMs?: number;
  threshold?: number;
  as?: keyof React.JSX.IntrinsicElements;
}

const AnimatedList: React.FC<AnimatedListProps> = ({
  items,
  className = '',
  itemClassName = '',
  staggerMs = 90,
  threshold = 0.15,
  as: Tag = 'div',
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const prefersReduced =
    typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReduced) {
      itemRefs.current.forEach((el) => el?.classList.add('in-view'));
      return;
    }
    const els = itemRefs.current.filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [threshold, prefersReduced, items.length]);

  return React.createElement(
    Tag,
    { ref: containerRef as React.Ref<never>, className: `reactbits-list ${className}` },
    items.map((item, i) =>
      React.createElement(
        'div',
        {
          key: i,
          ref: (el: HTMLElement | null) => {
            itemRefs.current[i] = el;
          },
          className: `reactbits-list-item ${itemClassName}`,
          style: { transitionDelay: `${i * staggerMs}ms` },
        },
        item
      )
    )
  );
};

export default AnimatedList;
