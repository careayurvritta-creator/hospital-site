import React, { useEffect, useState } from 'react';

interface RotatingTextProps {
  texts: string[];
  interval?: number;
  transitionMs?: number;
  className?: string;
  wordClassName?: string;
}

const RotatingText: React.FC<RotatingTextProps> = ({
  texts,
  interval = 2600,
  transitionMs = 400,
  className = '',
  wordClassName = '',
}) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  const prefersReduced =
    typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReduced || texts.length <= 1 || paused) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % texts.length);
        setVisible(true);
      }, transitionMs);
    }, interval);
    return () => clearInterval(id);
  }, [interval, transitionMs, texts.length, paused, prefersReduced]);

  const current = texts[index];

  return (
    <span
      className={`reactbits-rotating ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className="reactbits-rotating-sr" aria-hidden="true">
        {texts.join(' / ')}
      </span>
      <span
        key={`${index}-${current}`}
        className={`reactbits-rotating-word ${visible ? 'enter' : 'exit'} ${wordClassName}`}
        style={{ transitionDuration: `${transitionMs}ms` }}
        aria-hidden="true"
      >
        {current}
      </span>
    </span>
  );
};

export default RotatingText;
