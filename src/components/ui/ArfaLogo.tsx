import React from "react";

interface ArfaLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  subtitle?: string;
}

export const ArfaLogo: React.FC<ArfaLogoProps> = ({
  size = "md",
  className = "",
  showText = true,
  subtitle = "Your intelligent companion",
}) => {
  const sizeMap = {
    sm: { text: "text-sm", box: "w-6 h-6", rounded: "rounded-lg", iconSize: "w-3.5 h-3.5" },
    md: { text: "text-base font-semibold", box: "w-8 h-8", rounded: "rounded-xl", iconSize: "w-4.5 h-4.5" },
    lg: { text: "text-xl font-semibold", box: "w-12 h-12", rounded: "rounded-2xl", iconSize: "w-7 h-7" },
    xl: { text: "text-2xl font-bold", box: "w-16 h-16", rounded: "rounded-3xl", iconSize: "w-9 h-9" },
  };

  const { text, box, rounded, iconSize } = sizeMap[size];

  return (
    <div id="arfa-brand-logo" className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Tactile Skeuomorphic Medallion (Deep Roasted Espresso Medallion) */}
      <div
        className={`${box} ${rounded} relative flex items-center justify-center bg-gradient-to-b from-[#2E1B10] to-[#170D07] text-[#FAF6F0] border border-[#3E2517] shadow-[0_2px_6px_rgba(23,13,7,0.35),inset_0_1px_0_rgba(255,245,235,0.22),inset_0_-1px_0_rgba(0,0,0,0.3)] shrink-0 transition-transform duration-200`}
      >
        {/* Bespoke Geometric ARFA Convergence Apex Symbol */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconSize}`}
        >
          <defs>
            <linearGradient id="arfaLogoGrad" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FAF6F0" />
              <stop offset="0.6" stopColor="#EBDBC9" />
              <stop offset="1" stopColor="#D9C3AE" />
            </linearGradient>
            <linearGradient id="arfaCoreGrad" x1="12" y1="9" x2="12" y2="17" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#EAD8C7" />
            </linearGradient>
          </defs>
          {/* Architectural Apex Frame */}
          <path
            d="M12 3.2L20.2 19.8H3.8L12 3.2Z"
            stroke="url(#arfaLogoGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Internal Geometric Diamond Convergence Core */}
          <path
            d="M12 8.5L16.2 16.5H7.8L12 8.5Z"
            fill="url(#arfaCoreGrad)"
            fillOpacity="0.95"
          />
          {/* Precision Horizontal Cross-Bridge */}
          <path
            d="M7 16.5H17"
            stroke="#FAF6F0"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Radiating Focal Node */}
          <circle cx="12" cy="12" r="1.3" fill="#FAF6F0" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className={`tracking-tight text-[#1F130B] dark:text-[#FAF6F0] leading-none font-bold ${text}`}>
            Arfa AI
          </span>
          {subtitle && (
            <span className="text-[11px] text-[#7A6250] dark:text-[#A89584] font-medium mt-1 leading-tight">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
