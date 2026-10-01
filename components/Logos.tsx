import React from 'react';

// Top-Left: BEAVER SMASH text with paddle/ball icon - for navbar
export const BeaverSmashLogo = ({ className = "w-40 h-12" }: { className?: string }) => (
  <svg viewBox="0 0 240 50" className={className} xmlns="http://www.w3.org/2n000/svg">
    <text x="0" y="18" fontSize="16" fontWeight="700" fill="#000000" fontFamily="Arial, sans-serif" letterSpacing="1px">BEAVER</text>
    <text x="0" y="38" fontSize="16" fontWeight="700" fill="#7C3AED" fontFamily="Arial, sans-serif" letterSpacing="1px">SMASH</text>
    {/* Paddle and ball icon */}
    <g transform="translate(140, 10)">
      {/* Paddle handle pointing down and slightly left */}
      <rect x="8" y="18" width="2.5" height="12" fill="#7C3AED" rx="1.25" transform="rotate(-15 9.25 24)"/>
      {/* Paddle face */}
      <ellipse cx="10" cy="15" rx="6" ry="9" fill="#7C3AED" transform="rotate(-15 10 15)"/>
      {/* Ball above paddle */}
      <circle cx="10" cy="4" r="2.5" fill="#7C3AED"/>
    </g>
  </svg>
);

// Top-Right: Circular BS logo - for favicon/small spaces
export const BSLogo = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="2"/>
    {/* BS letters with motion effect, S slightly overlapping B */}
    <text x="35" y="58" fontSize="28" fontWeight="700" fill="#FFFFFF" fontFamily="Arial, sans-serif">B</text>
    <text x="42" y="62" fontSize="28" fontWeight="700" fill="#FFFFFF" fontFamily="Arial, sans-serif">S</text>
    {/* Curved line under S */}
    <path d="M 50 65 Q 55 70, 60 65" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round"/>
    {/* Ball with motion lines */}
    <circle cx="65" cy="25" r="2.5" fill="#FFFFFF"/>
    <line x1="60" y1="25" x2="62" y2="23" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="60" y1="27" x2="62" y2="25" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Bottom-Left: Circular badge with BEAVER SMASH and CCNY - for homepage hero
export const BeaverSmashBadge = ({ className = "w-64 h-64" }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Outer purple ring */}
    <circle cx="100" cy="100" r="95" fill="#7C3AED"/>
    {/* Black ring */}
    <circle cx="100" cy="100" r="80" fill="none" stroke="#000000" strokeWidth="3"/>
    {/* Inner black circle */}
    <circle cx="100" cy="100" r="65" fill="#000000"/>
    {/* Top text: BEAVER SMASH in arc along top of purple ring */}
    <text x="100" y="45" fontSize="12" fontWeight="700" fill="#FFFFFF" fontFamily="Arial, sans-serif" textAnchor="middle" letterSpacing="1px">BEAVER</text>
    <circle cx="88" cy="55" r="1" fill="#FFFFFF"/>
    <circle cx="112" cy="55" r="1" fill="#FFFFFF"/>
    <text x="100" y="70" fontSize="12" fontWeight="700" fill="#FFFFFF" fontFamily="Arial, sans-serif" textAnchor="middle" letterSpacing="1px">SMASH</text>
    {/* Bottom text: CCNY */}
    <text x="100" y="145" fontSize="12" fontWeight="700" fill="#FFFFFF" fontFamily="Arial, sans-serif" textAnchor="middle" letterSpacing="1px">CCNY</text>
    {/* Center paddle and ball */}
    <g transform="translate(100, 100)">
      {/* Paddle handle pointing down and slightly left */}
      <rect x="-1.5" y="8" width="2" height="10" fill="#FFFFFF" rx="1" transform="rotate(-20 -0.5 13)"/>
      {/* Paddle face */}
      <ellipse cx="0" cy="5" rx="5" ry="8" fill="#FFFFFF" transform="rotate(-20 0 5)"/>
      {/* Ball above paddle */}
      <circle cx="0" cy="-6" r="2" fill="#FFFFFF"/>
    </g>
  </svg>
);

// Bottom-Right: Simple circular icon with ball - for favicon/app icon
export const BallIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#7C3AED"/>
    {/* Ball */}
    <circle cx="60" cy="40" r="8" fill="#FFFFFF"/>
    {/* Motion lines */}
    <line x1="45" y1="40" x2="50" y2="38" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
    <line x1="45" y1="45" x2="50" y2="43" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
