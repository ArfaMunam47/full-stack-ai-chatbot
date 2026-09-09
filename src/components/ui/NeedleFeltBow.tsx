import React from "react";

interface NeedleFeltBowProps {
  color?: "pink" | "cream" | "white" | "rose";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export const NeedleFeltBow: React.FC<NeedleFeltBowProps> = ({
  color = "pink",
  size = "md",
  className = "",
}) => {
  const sizeMap = {
    xs: { w: 20, h: 16 },
    sm: { w: 28, h: 22 },
    md: { w: 38, h: 30 },
    lg: { w: 54, h: 42 },
  };

  const { w, h } = sizeMap[size];

  const isPink = color === "pink" || color === "rose";

  // Palette definitions matching 3D needle-felted wool
  const mainGradStart = isPink ? "#F472B6" : "#FFFFFF";
  const mainGradMid = isPink ? "#EC4899" : "#FFF5F8";
  const mainGradEnd = isPink ? "#DB2777" : "#F9E4EB";
  const knotGradStart = isPink ? "#FB7185" : "#FFFFFF";
  const knotGradEnd = isPink ? "#BE185D" : "#F3D2DC";
  const highlightStroke = isPink ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 255, 255, 0.95)";
  const shadowFilter = isPink ? "drop-shadow(0 3px 5px rgba(219, 39, 119, 0.35))" : "drop-shadow(0 2px 4px rgba(210, 160, 180, 0.3))";

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 64 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none shrink-0 transition-transform ${className}`}
      style={{ filter: shadowFilter }}
    >
      <defs>
        {/* Left Loop Gradient */}
        <linearGradient id={`bowLoopL-${color}-${size}`} x1="12" y1="6" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={mainGradStart} />
          <stop offset="60%" stopColor={mainGradMid} />
          <stop offset="100%" stopColor={mainGradEnd} />
        </linearGradient>

        {/* Right Loop Gradient */}
        <linearGradient id={`bowLoopR-${color}-${size}`} x1="52" y1="6" x2="36" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={mainGradStart} />
          <stop offset="60%" stopColor={mainGradMid} />
          <stop offset="100%" stopColor={mainGradEnd} />
        </linearGradient>

        {/* Center Knot Gradient */}
        <linearGradient id={`bowKnot-${color}-${size}`} x1="32" y1="14" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={knotGradStart} />
          <stop offset="100%" stopColor={knotGradEnd} />
        </linearGradient>

        {/* Tails Gradient */}
        <linearGradient id={`bowTail-${color}-${size}`} x1="32" y1="26" x2="32" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={mainGradMid} />
          <stop offset="100%" stopColor={mainGradEnd} />
        </linearGradient>
      </defs>

      {/* Left Tail */}
      <path
        d="M27 27 C24 34 19 41 15 48 C20 46 25 47 28 49 C29 42 30 35 31 29 Z"
        fill={`url(#bowTail-${color}-${size})`}
        stroke={highlightStroke}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Right Tail */}
      <path
        d="M37 27 C40 34 45 41 49 48 C44 46 39 47 36 49 C35 42 34 35 33 29 Z"
        fill={`url(#bowTail-${color}-${size})`}
        stroke={highlightStroke}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Left Plush Loop */}
      <path
        d="M30 23 C22 14 7 10 7 21 C7 29 20 31 29 25 Z"
        fill={`url(#bowLoopL-${color}-${size})`}
        stroke={highlightStroke}
        strokeWidth="1.5"
      />
      {/* Left Loop Inner Fold Dimple */}
      <path
        d="M17 19 C14 21 14 24 18 24"
        stroke={isPink ? "#BE185D" : "#E5B6C5"}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Right Plush Loop */}
      <path
        d="M34 23 C42 14 57 10 57 21 C57 29 44 31 35 25 Z"
        fill={`url(#bowLoopR-${color}-${size})`}
        stroke={highlightStroke}
        strokeWidth="1.5"
      />
      {/* Right Loop Inner Fold Dimple */}
      <path
        d="M47 19 C50 21 50 24 46 24"
        stroke={isPink ? "#BE185D" : "#E5B6C5"}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Fluffy Center Knot */}
      <ellipse
        cx="32"
        cy="24"
        rx="6.5"
        ry="7.5"
        fill={`url(#bowKnot-${color}-${size})`}
        stroke={highlightStroke}
        strokeWidth="1.6"
      />
      {/* Center Knot Stitch highlight */}
      <path
        d="M30.5 20 C32 19 33.5 19 34 20"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
};
