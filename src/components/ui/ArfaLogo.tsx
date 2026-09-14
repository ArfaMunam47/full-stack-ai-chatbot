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
    xs: { text: "text-xs font-bold", box: "w-6 h-6", rounded: "rounded-lg", glyph: "w-3.5 h-3.5" },
    sm: { text: "text-sm font-bold", box: "w-8 h-8", rounded: "rounded-xl", glyph: "w-4.5 h-4.5" },
    md: { text: "text-base font-extrabold", box: "w-10 h-10", rounded: "rounded-2xl", glyph: "w-6 h-6" },
    lg: { text: "text-lg font-extrabold", box: "w-12 h-12", rounded: "rounded-2xl", glyph: "w-7 h-7" },
    xl: { text: "text-2xl font-black tracking-tight", box: "w-16 h-16", rounded: "rounded-3xl", glyph: "w-10 h-10" },
  };

  const { text, box, rounded, glyph } = sizeMap[size];

  return (
    <div id="arfa-brand-identity" className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Faceted Pastel Glass Monogram Emblem */}
      <div
        className={`${box} ${rounded} relative flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105 overflow-hidden group cursor-pointer bg-gradient-to-br from-[#FFF5F8] via-[#FAF0F7] to-[#F1E8F6] border-t border-white border-b border-[#D8C7D8] shadow-[inset_0_1.5px_2px_rgba(255,255,255,1),inset_0_-1.5px_2px_rgba(180,140,170,0.18),0_4px_12px_-2px_rgba(100,50,80,0.1)]`}
      >
        {/* Soft internal luster highlight */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-white pointer-events-none" />

        {/* Precision Architectural Geometric "A" Glyph with Pastel Facets */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${glyph} relative z-10 drop-shadow-[0_1px_2px_rgba(80,30,60,0.12)] ${
            isAnimated ? "animate-pulse" : ""
          }`}
        >
          <defs>
            {/* Rose quartz facet */}
            <linearGradient id="arfaRoseFacet" x1="6" y1="26" x2="16" y2="6" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#DF92A8" />
              <stop offset="100%" stopColor="#F4CBD6" />
            </linearGradient>

            {/* Lilac lavender facet */}
            <linearGradient id="arfaLilacFacet" x1="26" y1="26" x2="16" y2="6" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#AC91CE" />
              <stop offset="100%" stopColor="#D5C5EC" />
            </linearGradient>

            {/* Champagne center bar facet */}
            <linearGradient id="arfaGoldFacet" x1="10" y1="18" x2="22" y2="18" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F2D8B3" />
              <stop offset="50%" stopColor="#FFF1DB" />
              <stop offset="100%" stopColor="#E5C79E" />
            </linearGradient>
          </defs>

          {/* Left Arch Facet */}
          <path
            d="M16 5.5L7 26H11.5L14.2 19.5H16L16 5.5Z"
            fill="url(#arfaRoseFacet)"
          />

          {/* Right Arch Facet */}
          <path
            d="M16 5.5L25 26H20.5L17.8 19.5H16L16 5.5Z"
            fill="url(#arfaLilacFacet)"
          />

          {/* Crossbar Diamond Nexus */}
          <path
            d="M12.5 17.5L16 14L19.5 17.5L16 20.5L12.5 17.5Z"
            fill="url(#arfaGoldFacet)"
            stroke="#FFFFFF"
            strokeWidth="0.75"
          />

          {/* Apex Light Highlight Pinpoint */}
          <circle cx="16" cy="5.5" r="1.2" fill="#FFFFFF" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`tracking-tight text-[#221323] ${text}`}>
              ARFA AI
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#DF8CA2] shadow-[0_0_6px_rgba(223,140,162,0.6)]" />
          </div>
          {subtitle && (
            <span className="text-[10.5px] text-[#7A677B] font-semibold tracking-normal mt-1">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
