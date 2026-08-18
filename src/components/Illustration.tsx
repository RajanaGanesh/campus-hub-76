import React from 'react';

export const Illustration: React.FC = () => {
  return (
    <svg
      className="login-svg-artwork"
      viewBox="0 0 540 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="CampusOne intelligent campus visualization"
    >
      <defs>
        {/* Glow Filters */}
        <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="purple-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="pink-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Gradients */}
        <linearGradient id="platformGrad" x1="270" y1="120" x2="270" y2="380" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#080b1f" stopOpacity="0.02" />
        </linearGradient>

        <linearGradient id="platformStroke" x1="100" y1="240" x2="440" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
        </linearGradient>

        <linearGradient id="buildingRoofGrad" x1="260" y1="220" x2="360" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        <linearGradient id="buildingLeftGrad" x1="220" y1="270" x2="300" y2="360" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#3730a3" />
        </linearGradient>

        <linearGradient id="buildingRightGrad" x1="300" y1="270" x2="380" y2="360" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3730a3" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>

        <linearGradient id="windowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        <linearGradient id="capGrad" x1="80" y1="130" x2="160" y2="190" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>

      {/* Ambient background aura */}
      <circle cx="280" cy="270" r="140" fill="#6366f1" opacity="0.12" filter="url(#purple-glow)" />

      {/* Isometric Grid Platform */}
      <g className="isometric-platform">
        {/* Outer Glow Plane */}
        <polygon
          points="270,390 480,270 270,150 60,270"
          fill="url(#platformGrad)"
          stroke="url(#platformStroke)"
          strokeWidth="1.5"
        />

        {/* Inner Isometric Grid Lines */}
        <path
          d="M165,210 L375,330 M217.5,180 L427.5,300 M322.5,180 L112.5,300 M375,210 L165,330"
          stroke="rgba(99, 102, 241, 0.2)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Grid Corner Glowing Nodes */}
        <circle cx="270" cy="390" r="3" fill="#38bdf8" filter="url(#cyan-glow)" />
        <circle cx="480" cy="270" r="3" fill="#6366f1" filter="url(#cyan-glow)" />
        <circle cx="270" cy="150" r="3" fill="#818cf8" filter="url(#cyan-glow)" />
        <circle cx="60" cy="270" r="3" fill="#38bdf8" filter="url(#cyan-glow)" />
      </g>

      {/* Isometric Academic Building Structure */}
      <g className="isometric-building" transform="translate(20, 0)">
        {/* Building Shadow on platform */}
        <polygon
          points="250,335 345,390 380,370 285,315"
          fill="rgba(5, 6, 18, 0.6)"
        />

        {/* Roof (Top Diamond) */}
        <polygon
          points="285,225 355,265 285,305 215,265"
          fill="url(#buildingRoofGrad)"
        />
        <polygon
          points="285,225 355,265 285,305 215,265"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
        />

        {/* Left Wall (Facing South-West) */}
        <polygon
          points="215,265 285,305 285,385 215,345"
          fill="url(#buildingLeftGrad)"
        />

        {/* Right Wall (Facing South-East) */}
        <polygon
          points="285,305 355,265 355,345 285,385"
          fill="url(#buildingRightGrad)"
        />

        {/* Left Wall Windows (Glowing Cyan Rectangles in Isometric Angle) */}
        <polygon points="230,285 245,293 245,310 230,302" fill="url(#windowGrad)" filter="url(#cyan-glow)" />
        <polygon points="255,299 270,307 270,324 255,316" fill="url(#windowGrad)" filter="url(#cyan-glow)" />
        <polygon points="230,317 245,325 245,342 230,334" fill="url(#windowGrad)" filter="url(#cyan-glow)" />

        {/* Right Wall Windows */}
        <polygon points="300,307 315,299 315,316 300,324" fill="url(#windowGrad)" filter="url(#cyan-glow)" />
        <polygon points="325,293 340,285 340,302 325,310" fill="url(#windowGrad)" filter="url(#cyan-glow)" />

        {/* Building Entrance Door */}
        <polygon points="275,348 285,354 285,385 275,379" fill="#0b0c1e" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" />
      </g>

      {/* Floating Graduation Cap (Top Left Neon Highlight) */}
      <g className="floating-cap" style={{ animation: 'floatCap 4.5s ease-in-out infinite' }}>
        {/* Cap Shadow */}
        <ellipse cx="120" cy="225" rx="35" ry="12" fill="rgba(0,0,0,0.3)" filter="blur(6px)" />

        {/* Neon Wireframe Diamond Top */}
        <polygon
          points="120,135 165,158 120,180 75,158"
          fill="rgba(244, 63, 94, 0.2)"
          stroke="#f43f5e"
          strokeWidth="2.5"
          filter="url(#pink-glow)"
        />
        <polygon
          points="120,138 160,158 120,177 80,158"
          fill="url(#capGrad)"
          opacity="0.85"
        />

        {/* Cap Base Skullcap */}
        <path
          d="M95,170 L95,188 C95,200 145,200 145,188 L145,170"
          fill="#be123c"
          stroke="#f43f5e"
          strokeWidth="1.5"
        />

        {/* Neon Cyan Tassel & Cord */}
        <path
          d="M120,158 Q150,165 155,188 L157,208"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          filter="url(#cyan-glow)"
        />
        <circle cx="157" cy="209" r="3.5" fill="#38bdf8" filter="url(#cyan-glow)" />
      </g>

      {/* Floating Isometric Book / Digital Module (Lower Left Foreground) */}
      <g className="floating-book" style={{ animation: 'floatBook 5s ease-in-out infinite 0.5s' }}>
        {/* Book Top Page */}
        <polygon
          points="140,325 180,305 210,320 170,340"
          fill="#38bdf8"
          stroke="#7dd3fc"
          strokeWidth="1"
          filter="url(#cyan-glow)"
        />
        {/* Book Spine / Left Side */}
        <polygon
          points="140,325 170,340 170,348 140,333"
          fill="#0284c7"
        />
        {/* Book Pages Edge (Right Side) */}
        <polygon
          points="170,340 210,320 210,328 170,348"
          fill="#f8fafc"
        />
      </g>

      {/* Floating Data Card / Sparkle Nodes */}
      <g className="sparkle-nodes">
        <circle cx="430" cy="180" r="2.5" fill="#38bdf8" filter="url(#cyan-glow)">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="180" cy="110" r="2" fill="#818cf8" filter="url(#cyan-glow)">
          <animate attributeName="opacity" values="1;0.3;1" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="390" cy="310" r="2" fill="#f43f5e" filter="url(#pink-glow)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="4s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
};
