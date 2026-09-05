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
  subtitle,
}) => {
  const sizeMap = {
    sm: { text: "text-sm", box: "w-7 h-7", rounded: "rounded-lg", iconSize: "w-4 h-4" },
    md: { text: "text-base font-bold", box: "w-9 h-9", rounded: "rounded-xl", iconSize: "w-5 h-5" },
    lg: { text: "text-xl font-bold", box: "w-12 h-12", rounded: "rounded-2xl", iconSize: "w-7 h-7" },
    xl: { text: "text-3xl font-extrabold", box: "w-16 h-16", rounded: "rounded-2xl", iconSize: "w-9 h-9" },
  };

  const { text, box, rounded, iconSize } = sizeMap[size];

  return (
    <div id="arfa-brand-logo" className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Modern High-End Monochromatic Emblem */}
      <div
        className={`${box} ${rounded} relative flex items-center justify-center bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm shrink-0 transition-transform hover:scale-105`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconSize}`}
        >
          {/* Geometric Apex Structure */}
          <path
            d="M12 3L20 19H4L12 3Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner Light Beam Core */}
          <path
            d="M12 9L15.5 16H8.5L12 9Z"
            fill="currentColor"
            fillOpacity="0.9"
          />
          <circle cx="12" cy="12.5" r="1.2" fill="#FFFFFF" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className={`tracking-tight text-neutral-900 dark:text-neutral-50 leading-none font-bold uppercase ${text}`}>
            ARFA AI
          </span>
          {subtitle && (
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-1 leading-tight">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
