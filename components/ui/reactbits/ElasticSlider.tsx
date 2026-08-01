import React from 'react';

interface ElasticSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  ariaLabel?: string;
}

const ElasticSlider: React.FC<ElasticSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className = '',
  ariaLabel = 'Slider',
}) => {
  const fill = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <input
      type="range"
      className={`reactbits-slider ${className}`}
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={ariaLabel}
      style={{ '--fill': `${fill}%` } as React.CSSProperties}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
};

export default ElasticSlider;
