import React from "react";

interface NeedleFeltMascotProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  isFloating?: boolean;
}

export const NeedleFeltMascot: React.FC<NeedleFeltMascotProps> = ({
  size = "md",
  className = "",
  isFloating = true,
}) => {
  const sizeMap = {
    sm: { width: 64, height: 64, container: "w-16 h-16" },
    md: { width: 88, height: 88, container: "w-22 h-22" },
    lg: { width: 112, height: 112, container: "w-28 h-28" },
  };

  const { width, height, container } = sizeMap[size];

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center select-none ${container} ${className}`}
      aria-label="Needle-felted ARFA AI Companion"
    >
      {/* 3D Needle-Felted Wool Companion Sculpture */}
      <div
        className={`relative z-10 w-full h-full flex items-center justify-center ${
          isFloating ? "animate-felt-float" : ""
        }`}
      >
        <svg
          width={width}
          height={height}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_8px_16px_rgba(233,93,149,0.18)]"
        >
          <defs>
            {/* Wool Body Gradient: Creamy ivory with gentle peach/rose warmth */}
            <radialGradient
              id="feltMascotBody"
              cx="55%"
              cy="40%"
              r="60%"
              fx="48%"
              fy="32%"
            >
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#FFF9FB" />
              <stop offset="85%" stopColor="#FCE7F0" />
              <stop offset="100%" stopColor="#F5D0DF" />
            </radialGradient>

            {/* Needle-Felted Ear Inset */}
            <radialGradient
              id="feltEarInner"
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor="#FFB7D5" />
              <stop offset="70%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#E95D95" />
            </radialGradient>

            {/* Handcrafted Felt Bow Loop Left */}
            <linearGradient
              id="feltBowLeftGrad"
              x1="30"
              y1="26"
              x2="58"
              y2="42"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FF8FBA" />
              <stop offset="60%" stopColor="#E95D95" />
              <stop offset="100%" stopColor="#D84581" />
            </linearGradient>

            {/* Handcrafted Felt Bow Loop Right */}
            <linearGradient
              id="feltBowRightGrad"
              x1="88"
              y1="26"
              x2="60"
              y2="42"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FF8FBA" />
              <stop offset="60%" stopColor="#E95D95" />
              <stop offset="100%" stopColor="#D84581" />
            </linearGradient>

            {/* Soft contact shadow beneath bow */}
            <filter id="feltBowShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#8B2A52" floodOpacity="0.28" />
            </filter>

            {/* Felt Ribbon Tails */}
            <linearGradient
              id="feltBowTails"
              x1="60"
              y1="38"
              x2="60"
              y2="58"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#E95D95" />
              <stop offset="100%" stopColor="#C9326F" />
            </linearGradient>
          </defs>

          {/* Left Padded Felt Ear */}
          <g className="felt-ear-left">
            <ellipse
              cx="40"
              cy="28"
              rx="13"
              ry="19"
              transform="rotate(-18 40 28)"
              fill="url(#feltMascotBody)"
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth="2.5"
            />
            <ellipse
              cx="40"
              cy="30"
              rx="7"
              ry="11"
              transform="rotate(-18 40 30)"
              fill="url(#feltEarInner)"
              opacity="0.85"
            />
          </g>

          {/* Right Padded Felt Ear */}
          <g className="felt-ear-right">
            <ellipse
              cx="80"
              cy="28"
              rx="13"
              ry="19"
              transform="rotate(18 80 28)"
              fill="url(#feltMascotBody)"
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth="2.5"
            />
            <ellipse
              cx="80"
              cy="30"
              rx="7"
              ry="11"
              transform="rotate(18 80 30)"
              fill="url(#feltEarInner)"
              opacity="0.85"
            />
          </g>

          {/* Main Soft Needle-Felted Head / Body Sphere */}
          <circle
            cx="60"
            cy="66"
            r="42"
            fill="url(#feltMascotBody)"
            stroke="rgba(255, 255, 255, 0.95)"
            strokeWidth="3"
          />

          {/* Fine Wool Fiber Highlight Curves (simulating needle-punched wool texture) */}
          <path
            d="M34 52 C38 46, 52 42, 68 44 C82 46, 88 52, 90 56"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth="1.75"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M30 68 C28 78, 38 92, 54 98"
            stroke="rgba(244, 185, 206, 0.45)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Needle-Punched Rose Blush Cheeks */}
          <ellipse
            cx="38"
            cy="72"
            rx="7.5"
            ry="5"
            fill="#FFA6CA"
            opacity="0.65"
          />
          <ellipse
            cx="82"
            cy="72"
            rx="7.5"
            ry="5"
            fill="#FFA6CA"
            opacity="0.65"
          />

          {/* Handcrafted Embroidered Eyes (Intelligent, warm, cozy expression) */}
          {/* Left Eye */}
          <g>
            <ellipse
              cx="48"
              cy="63"
              rx="4"
              ry="5.5"
              fill="#2B1E25"
            />
            {/* Catchlight */}
            <circle
              cx="46.5"
              cy="61"
              r="1.75"
              fill="#FFFFFF"
            />
            <circle
              cx="49.5"
              cy="65"
              r="0.8"
              fill="#FFFFFF"
            />
          </g>

          {/* Right Eye */}
          <g>
            <ellipse
              cx="72"
              cy="63"
              rx="4"
              ry="5.5"
              fill="#2B1E25"
            />
            {/* Catchlight */}
            <circle
              cx="70.5"
              cy="61"
              r="1.75"
              fill="#FFFFFF"
            />
            <circle
              cx="73.5"
              cy="65"
              r="0.8"
              fill="#FFFFFF"
            />
          </g>

          {/* Needle-Felted Nose & Little Smile */}
          <path
            d="M57 69 C58.5 71, 61.5 71, 63 69"
            stroke="#C94A79"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M60 70.5 C57.5 74.5, 55 74.5, 53.5 73.5"
            stroke="#2B1E25"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M60 70.5 C62.5 74.5, 65 74.5, 66.5 73.5"
            stroke="#2B1E25"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Signature 3D Needle-Felted Wool Bow perched at top-center */}
          <g filter="url(#feltBowShadow)">
            {/* Ribbon Tails */}
            <path
              d="M56 36 L48 50 C46 54, 50 54, 53 51 L58 42 L60 38"
              fill="url(#feltBowTails)"
              opacity="0.95"
            />
            <path
              d="M64 36 L72 50 C74 54, 70 54, 67 51 L62 42 L60 38"
              fill="url(#feltBowTails)"
              opacity="0.95"
            />

            {/* Left Bow Loop */}
            <path
              d="M59 34.5 C52 24, 38 23, 37 32 C36 40, 48 41, 58 36.5 Z"
              fill="url(#feltBowLeftGrad)"
              stroke="rgba(255, 255, 255, 0.75)"
              strokeWidth="1.25"
            />

            {/* Right Bow Loop */}
            <path
              d="M61 34.5 C68 24, 82 23, 83 32 C84 40, 72 41, 62 36.5 Z"
              fill="url(#feltBowRightGrad)"
              stroke="rgba(255, 255, 255, 0.75)"
              strokeWidth="1.25"
            />

            {/* Center Bow Knot */}
            <ellipse
              cx="60"
              cy="35"
              rx="4.5"
              ry="4"
              fill="#FFFFFF"
              stroke="#E95D95"
              strokeWidth="2"
            />
            <circle
              cx="59"
              cy="34"
              r="1.5"
              fill="#FFFFFF"
            />
          </g>

          {/* Tiny Handcrafted Stitches around bottom rim */}
          <line x1="46" y1="94" x2="49" y2="92" stroke="#E95D95" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <line x1="58" y1="97" x2="62" y2="97" stroke="#E95D95" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <line x1="71" y1="94" x2="74" y2="92" stroke="#E95D95" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      </div>

      {/* Tactile Wool Contact Shadow on Pedestal */}
      <div
        className="w-16 h-3 rounded-full bg-[#8E7882]/15 blur-[3px] mt-[-6px] transition-transform duration-300"
        style={{ transform: isFloating ? "scale(0.9)" : "scale(1)" }}
      />
    </div>
  );
};
