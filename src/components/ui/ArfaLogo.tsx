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
    xs: { text: "text-xs", box: "w-5 h-5", rounded: "rounded-md", iconSize: "w-3 h-3" },
    sm: { text: "text-sm", box: "w-7 h-7", rounded: "rounded-lg", iconSize: "w-4 h-4" },
    md: { text: "text-base font-bold", box: "w-9 h-9", rounded: "rounded-xl", iconSize: "w-5 h-5" },
    lg: { text: "text-xl font-bold", box: "w-11 h-11", rounded: "rounded-2xl", iconSize: "w-6 h-6" },
    xl: { text: "text-2xl font-extrabold tracking-tight", box: "w-14 h-14", rounded: "rounded-2xl", iconSize: "w-8 h-8" },
  };

  const { text, box, rounded, iconSize } = sizeMap[size];

  return (
    <div id="arfa-brand-logo" className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Bespoke Luxury Emblem Mark */}
      <div
        className={`${box} ${rounded} relative flex items-center justify-center bg-gradient-to-br from-[#2D1B22] to-[#1A1718] text-white shadow-xs shrink-0 transition-transform duration-200 hover:scale-105 border border-[#4A2D37]/30`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconSize} ${isAnimated ? "animate-pulse" : ""}`}
        >
          {/* Outer Monolith Prism: Structural Apex */}
          <path
            d="M12 2.5L20.5 19.5H3.5L12 2.5Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Inner Radiant Facet with Subtle Rose Hue */}
          <path
            d="M12 7.5L16.5 16.5H7.5L12 7.5Z"
            fill="#E8618C"
          />
          {/* Central Precision Core Light */}
          <circle cx="12" cy="13.2" r="1.2" fill="#FFFFFF" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`tracking-tight text-[#1A1718] font-bold uppercase ${text}`}>
              ARFA AI
            </span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#D84A70]" />
          </div>
          {subtitle && (
            <span className="text-[10px] text-[#7E7779] font-medium tracking-normal mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
