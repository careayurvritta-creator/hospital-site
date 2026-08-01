import React from 'react';

interface BorderGlowProps {
  children?: React.ReactNode;
  className?: string;
  innerClassName?: string;
  radius?: string;
  backgroundColor?: string;
}

const BorderGlow: React.FC<BorderGlowProps> = ({
  children,
  className = '',
  innerClassName = '',
  radius = '1.5rem',
  backgroundColor = '#ffffff',
}) => {
  return (
    <div className={`reactbits-borderglow ${className}`} style={{ borderRadius: radius }}>
      <div
        className={`reactbits-borderglow-inner ${innerClassName}`}
        style={{ borderRadius: `calc(${radius} - 1.5px)`, backgroundColor }}
      >
        {children}
      </div>
    </div>
  );
};

export default BorderGlow;
