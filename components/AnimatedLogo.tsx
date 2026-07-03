// components/AnimatedLogo.tsx — Cross Border Cart globe logo
// Amber gold globe with UAE→Africa mint route arc + spinning rings
// Usage: <AnimatedLogo size={44} /> — size controls the outer SVG dimensions

import React from "react";

interface Props {
  size?: number;   // outer px size, default 44
  showRings?: boolean; // outer spin rings, default true
}

export function AnimatedLogo({ size = 44, showRings = true }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const R  = size * 0.318;  // globe radius  (~14 at 44px)
  const r1 = size * 0.454;  // ring1 radius  (~20 at 44px)
  const r2 = size * 0.386;  // ring2 radius  (~17 at 44px)

  // Latitude ellipse radii (rx = globe R, ry = fraction of R)
  const lat1ry = R * 0.39;
  const lat2ry = R * 0.68;
  const longRx = R * 0.36;

  // Route: UAE dot (right-upper) → Africa dot (left-lower) — normalised to size
  const uaeX  = cx + R * 0.36;
  const uaeY  = cy - R * 0.36;
  const afX   = cx - R * 0.14;
  const afY   = cy + R * 0.43;
  const cpX   = cx + R * 0.14;
  const cpY   = cy;

  // Tiny plane triangle midpoint along arc
  const plX = cpX + R * 0.07;
  const plY = cpY - R * 0.07;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Cross Border Cart — globe logo"
      role="img"
      style={{ overflow: "visible", flexShrink: 0 }}
    >
      <style>{`
        @keyframes cbc-spin  { to { transform: rotate(360deg);  transform-origin: ${cx}px ${cy}px; } }
        @keyframes cbc-spinr { to { transform: rotate(-360deg); transform-origin: ${cx}px ${cy}px; } }
        @keyframes cbc-glow  {
          0%,100% { filter: drop-shadow(0 0 ${size * 0.18}px rgba(251,191,36,0.45)); }
          50%      { filter: drop-shadow(0 0 ${size * 0.45}px rgba(251,191,36,0.8)); }
        }
        @keyframes cbc-lat {
          0%,100% { opacity: .48; }
          50%      { opacity: .9; }
        }
        .cbc-ring1 { animation: cbc-spin  9s linear infinite; transform-origin: ${cx}px ${cy}px; }
        .cbc-ring2 { animation: cbc-spinr 14s linear infinite; transform-origin: ${cx}px ${cy}px; }
        .cbc-globe { animation: cbc-glow 3s ease-in-out infinite; }
        .cbc-lat   { animation: cbc-lat  4s ease-in-out infinite; }
      `}</style>

      <g className="cbc-globe">
        {/* ── spinning outer rings ── */}
        {showRings && (
          <>
            <circle
              className="cbc-ring1"
              cx={cx} cy={cy} r={r1}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={size * 0.027}
              strokeDasharray={`${size * 0.09} ${size * 0.068}`}
              opacity={.52}
            />
            <circle
              className="cbc-ring2"
              cx={cx} cy={cy} r={r2}
              fill="none"
              stroke="#38BDF8"
              strokeWidth={size * 0.016}
              strokeDasharray={`${size * 0.045} ${size * 0.09}`}
              opacity={.28}
            />
          </>
        )}

        {/* ── globe body ── */}
        <circle cx={cx} cy={cy} r={R} fill="#0f1e38" stroke="#fbbf24" strokeWidth={size * 0.027} />

        {/* ── latitude lines ── */}
        <ellipse className="cbc-lat" cx={cx} cy={cy} rx={R} ry={lat1ry} fill="none" stroke="#fbbf24" strokeWidth={size * 0.016} opacity={.48} />
        <ellipse className="cbc-lat" cx={cx} cy={cy} rx={R} ry={lat2ry} fill="none" stroke="#fbbf24" strokeWidth={size * 0.011} opacity={.28} />

        {/* ── prime meridian ── */}
        <ellipse cx={cx} cy={cy} rx={longRx} ry={R} fill="none" stroke="#fbbf24" strokeWidth={size * 0.016} opacity={.42} />

        {/* ── equator ── */}
        <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke="#fbbf24" strokeWidth={size * 0.013} opacity={.38} />

        {/* ── UAE → Africa route arc ── */}
        <path
          d={`M${uaeX} ${uaeY} Q${cpX} ${cpY} ${afX} ${afY}`}
          fill="none"
          stroke="#00E5A0"
          strokeWidth={size * 0.032}
          strokeLinecap="round"
        />

        {/* ── UAE dot (amber) ── */}
        <circle cx={uaeX} cy={uaeY} r={size * 0.041} fill="#fbbf24" />

        {/* ── Africa dot (mint) ── */}
        <circle cx={afX} cy={afY} r={size * 0.041} fill="#00E5A0" />

        {/* ── tiny plane triangle at arc midpoint ── */}
        {size >= 36 && (
          <polygon
            points={`${plX},${plY - size*0.02} ${plX + size*0.038},${plY + size*0.016} ${plX - size*0.014},${plY + size*0.027}`}
            fill="#fbbf24"
            opacity={.95}
          />
        )}
      </g>
    </svg>
  );
}

export default AnimatedLogo;