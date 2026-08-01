import React from 'react';

interface AuroraProps {
  className?: string;
  colors?: string[];
  speed?: 'slow' | 'normal' | 'fast';
}

const Aurora: React.FC<AuroraProps> = ({
  className = '',
  colors = ['#0d8770', '#6bb7a0', '#c9a227'],
  speed = 'normal',
}) => {
  const duration = speed === 'slow' ? 18 : speed === 'fast' ? 8 : 12;
  const [c1, c2, c3] = colors;

  return (
    <div className={`reactbits-aurora ${className}`} aria-hidden="true">
      <div
        className="absolute rounded-full blur-[80px] opacity-60"
        style={{
          width: '60%',
          aspectRatio: '1',
          top: '-20%',
          left: '-10%',
          background: c1,
          animation: `reactbits-aurora-a ${duration}s ease-in-out infinite`,
        }}
      />
      <div
        className="absolute rounded-full blur-[90px] opacity-50"
        style={{
          width: '55%',
          aspectRatio: '1',
          top: '10%',
          right: '-15%',
          background: c2,
          animation: `reactbits-aurora-b ${duration}s ease-in-out infinite`,
        }}
      />
      <div
        className="absolute rounded-full blur-[70px] opacity-40"
        style={{
          width: '50%',
          aspectRatio: '1',
          bottom: '-25%',
          left: '20%',
          background: c3,
          animation: `reactbits-aurora-c ${duration}s ease-in-out infinite`,
        }}
      />
    </div>
  );
};

export default Aurora;
