import React, { useRef, useCallback, useEffect, useState } from 'react';

interface TiltedCardProps {
  children?: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  glow?: boolean;
  disabled?: boolean;
}

const TiltedCard: React.FC<TiltedCardProps> = ({
  children,
  className = '',
  maxTilt = 8,
  scale = 1.02,
  glow = true,
  disabled = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    setIsCoarse(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || isCoarse) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * maxTilt * 2;
      const rotateX = -(py - 0.5) * maxTilt * 2;
      el.style.setProperty('--spot-x', `${px * 100}%`);
      el.style.setProperty('--spot-y', `${py * 100}%`);
      const inner = el.firstElementChild as HTMLElement | null;
      if (inner) {
        inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
      }
    },
    [disabled, isCoarse, maxTilt, scale]
  );

  const handlePointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const inner = el.firstElementChild as HTMLElement | null;
    if (inner) {
      inner.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    }
  }, []);

  return (
    <div
      ref={ref}
      className={`reactbits-tilt ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="reactbits-tilt-inner">
        {children}
      {glow && <div className="reactbits-tilt-glow" aria-hidden="true" />}
      </div>
    </div>
  );
};

export default TiltedCard;
