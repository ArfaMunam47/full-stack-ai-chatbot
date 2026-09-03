import React from "react";

interface ArfaLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

export const ArfaLogo: React.FC<ArfaLogoProps> = ({
  size = "md",
  className = "",
  showText = true,
}) => {
  const sizeMap = {
    sm: { text: "text-base", box: "w-6 h-6", rounded: "rounded-md", iconSize: "w-3.5 h-3.5" },
    md: { text: "text-lg", box: "w-8 h-8", rounded: "rounded-lg", iconSize: "w-5 h-5" },
    lg: { text: "text-2xl", box: "w-12 h-12", rounded: "rounded-2xl", iconSize: "w-7 h-7" },
    xl: { text: "text-3xl", box: "w-16 h-16", rounded: "rounded-3xl", iconSize: "w-10 h-10" },
  };

  const { text, box, rounded, iconSize } = sizeMap[size];

  return (
    <div id="arfa-brand-logo" className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        className={`${box} ${rounded} relative flex items-center justify-center bg-[#D17A7A] dark:bg-[#E28E8E] text-white dark:text-[#1E1819] shadow-xs shrink-0 transition-transform duration-200`}
      >
        {/* Geometric Balance Delta Pyramid Mark */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={iconSize}
        >
          <path d="M12 2L2 22h20L12 2z" strokeLinejoin="round" />
          <path d="M12 18l-3-6h6l-3 6z" />
        </svg>
      </div>

      {showText && (
        <div className="flex items-center gap-1.5">
          <span className={`font-semibold tracking-tight text-[#2D2626] dark:text-[#F9F4F4] ${text}`}>
            Arfa AI
          </span>
        </div>
      )}
    </div>
  );
};
