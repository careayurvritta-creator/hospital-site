import React, { useRef, useCallback, useEffect, useState } from 'react';

interface SpotlightCardProps {
  children?: React.ReactNode;
  className?: string;
  spotColor?: string;
  as?: keyof React.JSX.IntrinsicElements;
  interactive?: boolean;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotColor = 'rgba(13, 135, 112, 0.14)',
  as: Tag = 'div',
  interactive = true,
}) => {
  const ref = useRef<HTMLElement>(null);
  const [isCoarse, setIsCoarse] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    setIsCoarse(window.matchMedia('(pointer: coarse)').matches);
    setPrefersReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || isCoarse || prefersReduced) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--spot-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty('--spot-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
    },
    [interactive, isCoarse, prefersReduced]
  );

  return React.createElement(
    Tag,
    {
      ref: ref as React.Ref<never>,
      className: `reactbits-spotlight ${className}`,
      onPointerMove: handlePointerMove,
      style: { '--spot-color': spotColor } as React.CSSProperties,
    },
    children
  );
};

export default SpotlightCard;
