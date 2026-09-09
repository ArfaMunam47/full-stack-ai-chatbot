import React from "react";

interface ArfaLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  subtitle?: string;
  isAnimated?: boolean;
}

export const ArfaLogo: React.FC<ArfaLogoProps> = ({
  size = "md",
  className = "",
  showText = true,
  subtitle,
  isAnimated = false,
}) => {
  const sizeMap = {
    xs: { text: "text-xs font-bold", box: "w-6 h-6", rounded: "rounded-xl", iconSize: "w-3.5 h-3.5" },
    sm: { text: "text-sm font-bold", box: "w-8 h-8", rounded: "rounded-2xl", iconSize: "w-5 h-5" },
    md: { text: "text-base font-bold", box: "w-10 h-10", rounded: "rounded-2xl", iconSize: "w-6 h-6" },
    lg: { text: "text-lg font-extrabold", box: "w-12 h-12", rounded: "rounded-3xl", iconSize: "w-7 h-7" },
    xl: { text: "text-2xl font-extrabold tracking-tight", box: "w-16 h-16", rounded: "rounded-3xl", iconSize: "w-10 h-10" },
  };

  const { text, box, rounded, iconSize } = sizeMap[size];

  return (
    <div id="arfa-brand-logo" className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* 3D Needle-Felted Pink Bow Medallion */}
      <div
        className={`${box} ${rounded} relative flex items-center justify-center felt-btn-pink shrink-0 transition-transform duration-200 hover:scale-105 overflow-hidden group cursor-pointer`}
      >
        {/* Soft inner wool highlight */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/40 pointer-events-none" />

        {/* 3D Needle-Felted Bow Emblem */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconSize} relative z-10 drop-shadow-sm ${isAnimated ? "animate-bounce" : ""}`}
        >
          <defs>
            {/* Soft plush wool gradients */}
            <linearGradient id="feltBowLeft" x1="4" y1="8" x2="16" y2="18" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#FDF2F6" />
              <stop offset="100%" stopColor="#FCE7F3" />
            </linearGradient>
            <linearGradient id="feltBowRight" x1="28" y1="8" x2="16" y2="18" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#FDF2F6" />
              <stop offset="100%" stopColor="#FCE7F3" />
            </linearGradient>
            <linearGradient id="feltRibbonTail" x1="16" y1="16" x2="16" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FBCFE8" />
            </linearGradient>
            <radialGradient id="feltKnotGrad" cx="16" cy="14" r="5" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#FDF2F6" />
              <stop offset="100%" stopColor="#F472B6" />
            </radialGradient>
          </defs>

          {/* Left Ribbon Tail */}
          <path
            d="M13.5 16L7.5 27C7 28 8.5 28.5 9.5 27.5L14.5 22.5L16 26.5C16.5 27.5 17.5 27 17.5 26L16 16"
            fill="url(#feltRibbonTail)"
            opacity="0.95"
          />

          {/* Right Ribbon Tail */}
          <path
            d="M18.5 16L24.5 27C25 28 23.5 28.5 22.5 27.5L17.5 22.5L16 26.5"
            fill="url(#feltRibbonTail)"
            opacity="0.95"
          />

          {/* Left Puffy Bow Loop */}
          <path
            d="M15 13.5C12.5 8 5 6.5 4 11.5C3 16 9.5 18 14.5 15.2L15 13.5Z"
            fill="url(#feltBowLeft)"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="0.75"
          />

          {/* Right Puffy Bow Loop */}
          <path
            d="M17 13.5C19.5 8 27 6.5 28 11.5C29 16 22.5 18 17.5 15.2L17 13.5Z"
            fill="url(#feltBowRight)"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="0.75"
          />

          {/* Center Plush Bow Knot */}
          <ellipse
            cx="16"
            cy="14"
            rx="3.5"
            ry="4"
            fill="url(#feltKnotGrad)"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="0.75"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`tracking-tight text-[#32121E] ${text}`}>
              ARFA AI
            </span>
            <span className="w-2 h-2 rounded-full bg-[#EC4899] shadow-xs" />
          </div>
          {subtitle && (
            <span className="text-[10px] text-[#8E6F7A] font-semibold tracking-normal mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
