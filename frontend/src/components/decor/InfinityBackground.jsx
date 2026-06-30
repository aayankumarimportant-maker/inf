import React from 'react';

/**
 * Futuristic infinity-pattern background.
 * Used as a decorative absolute overlay inside positioned containers.
 * Props:
 *   variant: 'soft' | 'bold' | 'hero'
 *   className: extra classes
 */
export default function InfinityBackground({ variant = 'soft', className = '' }) {
  const stroke = variant === 'bold' ? 1.5 : 1.1;
  const op = variant === 'hero' ? 0.7 : variant === 'bold' ? 0.55 : 0.4;
  return (
    <div className={`infinity-bg ${className}`} aria-hidden="true">
      {/* color dots */}
      <span className="inf-dot" style={{ top: '8%', left: '10%', width: 240, height: 240, background: 'radial-gradient(circle, rgba(124,58,237,0.45), transparent 70%)' }} />
      <span className="inf-dot" style={{ top: '55%', right: '8%', width: 260, height: 260, background: 'radial-gradient(circle, rgba(37,99,235,0.42), transparent 70%)' }} />
      <span className="inf-dot" style={{ bottom: '6%', left: '40%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(6,182,212,0.38), transparent 70%)' }} />

      <InfSvg className="inf-1" size={420} stroke={stroke} colorFrom="#7c3aed" colorTo="#2563eb" opacity={op} />
      <InfSvg className="inf-2" size={520} stroke={stroke} colorFrom="#2563eb" colorTo="#06b6d4" opacity={op * 0.9} />
      <InfSvg className="inf-3" size={380} stroke={stroke} colorFrom="#06b6d4" colorTo="#7c3aed" opacity={op * 0.85} />
      <InfSvg className="inf-4" size={300} stroke={stroke} colorFrom="#a78bfa" colorTo="#22d3ee" opacity={op * 0.7} />
    </div>
  );
}

function InfSvg({ size, stroke, colorFrom, colorTo, opacity, className }) {
  const id = `g-${colorFrom.replace('#', '')}-${colorTo.replace('#', '')}`;
  return (
    <svg className={className} width={size} height={size * 0.5} viewBox="0 0 200 100" style={{ opacity }}>
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={colorFrom} />
          <stop offset="100%" stopColor={colorTo} />
        </linearGradient>
      </defs>
      {/* infinity path drawn as two lobes */}
      <path
        d="M30,50 C30,20 70,20 100,50 C130,80 170,80 170,50 C170,20 130,20 100,50 C70,80 30,80 30,50 Z"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  );
}
