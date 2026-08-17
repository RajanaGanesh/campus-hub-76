import React from 'react';

export const Illustration: React.FC = () => {
  return (
    <svg className="login-svg-artwork" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Base Isometric Plane */}
      <path d="M250 320 L420 230 L250 140 L80 230 Z" fill="rgba(124, 92, 255, 0.08)" />
      <path d="M250 310 L400 230 L250 150 L100 230 Z" fill="rgba(8, 185, 221, 0.06)" stroke="rgba(124, 92, 255, 0.2)" strokeWidth="2" />
      
      {/* Stylized Isometric College Building Block */}
      <g transform="translate(190, 110)">
        {/* Right Wall */}
        <path d="M60 120 L120 90 L120 30 L60 60 Z" fill="#442682" />
        {/* Left Wall */}
        <path d="M0 90 L60 120 L60 60 L0 30 Z" fill="#5c45b4" />
        {/* Top Roof */}
        <path d="M60 60 L120 30 L60 0 L0 30 Z" fill="#7c5cff" />
        {/* Roof details */}
        <path d="M40 30 L80 10 L60 0 Z" fill="#8c65ff" />
        {/* Building Windows (Left) */}
        <path d="M15 50 L25 55 L25 70 L15 65 Z" fill="#08b9dd" opacity="0.8" />
        <path d="M35 60 L45 65 L45 80 L35 75 Z" fill="#08b9dd" opacity="0.8" />
        {/* Building Windows (Right) */}
        <path d="M75 75 L85 70 L85 55 L75 60 Z" fill="#08b9dd" opacity="0.8" />
        <path d="M95 65 L105 60 L105 45 L95 50 Z" fill="#08b9dd" opacity="0.8" />
        {/* Door */}
        <path d="M25 90 L35 95 L35 112 L25 107 Z" fill="#080719" />
      </g>

      {/* Floating Graduation Cap */}
      <g transform="translate(100, 120)" style={{ animation: 'floatArt 4s ease-in-out infinite alternate' }}>
        <path d="M40 20 L70 30 L40 40 L10 30 Z" fill="#ff4564" />
        <path d="M25 35 L25 48 C25 52, 55 52, 55 48 L55 35" fill="#d92e4c" />
        <path d="M70 30 L80 45 L78 47 L68 32 Z" fill="#f7f7fb" />
        <circle cx="78" cy="47" r="3" fill="#ff4564" />
      </g>

      {/* Floating Laptop/Dashboard UI Element */}
      <g transform="translate(290, 200)" style={{ animation: 'floatArt 6s ease-in-out infinite alternate' }}>
        {/* Screen */}
        <path d="M10 50 L80 20 L80 60 L10 90 Z" fill="rgba(16, 12, 38, 0.9)" stroke="rgba(8, 185, 221, 0.4)" strokeWidth="1.5" />
        {/* Keyboard Base */}
        <path d="M10 90 L80 60 L120 75 L50 105 Z" fill="#302d4b" />
        {/* UI graph inside screen */}
        <path d="M20 75 L35 65 L50 55 L68 42" stroke="#00d89a" strokeWidth="2" fill="none" />
        <circle cx="68" cy="42" r="3" fill="#00d89a" />
      </g>

      {/* Isometric Book Blocks */}
      <g transform="translate(130, 240)">
        <path d="M0 20 L40 0 L60 10 L20 30 Z" fill="#08b9dd" />
        <path d="M0 20 L20 30 L20 36 L0 26 Z" fill="#069cb9" />
        <path d="M20 30 L60 10 L60 16 L20 36 Z" fill="#eceff1" />
      </g>
    </svg>
  );
};
