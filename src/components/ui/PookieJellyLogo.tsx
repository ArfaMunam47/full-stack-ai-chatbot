import React from "react";

export type LightingTheme = "blush" | "sunlight" | "lunar" | "emerald";

interface PookieJellyLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  subtitle?: string;
  isAnimated?: boolean;
  onClick?: () => void;
  lightingTheme?: LightingTheme;
}

/**
 * 🎀 Theme-Adaptive 3D Claymorphic Jelly Ribbon Bow:
 * Seamlessly matches the active theme:
 * - Blush: Candy Rose & Strawberry Magenta
 * - Sunlight: Warm Peach & Tangerine Amber
 * - Lunar: Pastel Lilac & Celestial Amethyst
 * - Emerald: Fresh Seafoam & Jade Emerald
 */
const RibbonBowIcon: React.FC<{
  className?: string;
  lightingTheme?: LightingTheme;
}> = ({ className = "w-5 h-5", lightingTheme = "blush" }) => {
  // Theme gradients for SVG ribbon bow
  const themes = {
    blush: {
      leftLoopStart: "#FFA4BA",
      leftLoopMid: "#FF6584",
      leftLoopDeep: "#F43F5E",
      leftLoopEnd: "#BE123C",
      knotTop: "#FFF0F5",
      knotMid: "#FF85A1",
      knotDeep: "#F43F5E",
      knotBase: "#9F1239",
      tailStart: "#FF758F",
      tailMid: "#F43F5E",
      tailEnd: "#BE123C",
      dropShadow: "rgba(225, 29, 72, 0.45)",
    },
    sunlight: {
      leftLoopStart: "#FFD8BE",
      leftLoopMid: "#FB923C",
      leftLoopDeep: "#F97316",
      leftLoopEnd: "#EA580C",
      knotTop: "#FFF7ED",
      knotMid: "#FDBA74",
      knotDeep: "#F97316",
      knotBase: "#C2410C",
      tailStart: "#FB923C",
      tailMid: "#F97316",
      tailEnd: "#C2410C",
      dropShadow: "rgba(234, 88, 12, 0.45)",
    },
    lunar: {
      leftLoopStart: "#F3E8FF",
      leftLoopMid: "#C084FC",
      leftLoopDeep: "#A855F7",
      leftLoopEnd: "#9333EA",
      knotTop: "#FAF5FF",
      knotMid: "#D8B4FE",
      knotDeep: "#A855F7",
      knotBase: "#7E22CE",
      tailStart: "#C084FC",
      tailMid: "#A855F7",
      tailEnd: "#7E22CE",
      dropShadow: "rgba(147, 51, 234, 0.45)",
    },
    emerald: {
      leftLoopStart: "#D1FAE5",
      leftLoopMid: "#34D399",
      leftLoopDeep: "#10B981",
      leftLoopEnd: "#059669",
      knotTop: "#ECFDF5",
      knotMid: "#6EE7B7",
      knotDeep: "#10B981",
      knotBase: "#047857",
      tailStart: "#34D399",
      tailMid: "#10B981",
      tailEnd: "#047857",
      dropShadow: "rgba(16, 185, 129, 0.45)",
    },
  }[lightingTheme || "blush"];

  const gradPrefix = `ribbon-${lightingTheme || "blush"}`;

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0`}
      style={{ filter: `drop-shadow(0 2px 6px ${themes.dropShadow})` }}
      aria-label="ARFA AI Ribbon Bow Logo"
    >
      <defs>
        {/* Left Bow Loop */}
        <linearGradient id={`${gradPrefix}-loopLeft`} x1="2" y1="6" x2="16" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={themes.leftLoopStart} />
          <stop offset="35%" stopColor={themes.leftLoopMid} />
          <stop offset="75%" stopColor={themes.leftLoopDeep} />
          <stop offset="100%" stopColor={themes.leftLoopEnd} />
        </linearGradient>

        {/* Right Bow Loop */}
        <linearGradient id={`${gradPrefix}-loopRight`} x1="30" y1="6" x2="16" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={themes.leftLoopStart} />
          <stop offset="35%" stopColor={themes.leftLoopMid} />
          <stop offset="75%" stopColor={themes.leftLoopDeep} />
          <stop offset="100%" stopColor={themes.leftLoopEnd} />
        </linearGradient>

        {/* Center 3D Knot */}
        <linearGradient id={`${gradPrefix}-knot`} x1="13" y1="11" x2="19" y2="19" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={themes.knotTop} />
          <stop offset="30%" stopColor={themes.knotMid} />
          <stop offset="75%" stopColor={themes.knotDeep} />
          <stop offset="100%" stopColor={themes.knotBase} />
        </linearGradient>

        {/* Left Tail */}
        <linearGradient id={`${gradPrefix}-tailLeft`} x1="14" y1="16" x2="6" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={themes.tailStart} />
          <stop offset="50%" stopColor={themes.tailMid} />
          <stop offset="100%" stopColor={themes.tailEnd} />
        </linearGradient>

        {/* Right Tail */}
        <linearGradient id={`${gradPrefix}-tailRight`} x1="18" y1="16" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={themes.tailStart} />
          <stop offset="50%" stopColor={themes.tailMid} />
          <stop offset="100%" stopColor={themes.tailEnd} />
        </linearGradient>
      </defs>

      {/* Ribbon Tails */}
      <path
        d="M14 17 C13 21, 9 24, 7 28 C9 26.5, 11 26, 12 26.5 C13 27, 14 28, 14.5 28 C14.5 25, 15 20, 15 17 Z"
        fill={`url(#${gradPrefix}-tailLeft)`}
      />
      <path
        d="M18 17 C19 21, 23 24, 25 28 C23 26.5, 21 26, 20 26.5 C19 27, 18 28, 17.5 28 C17.5 25, 17 20, 17 17 Z"
        fill={`url(#${gradPrefix}-tailRight)`}
      />

      {/* Left Loop */}
      <path
        d="M16 15 C13 9, 5 7, 4 12 C3 16, 11 18, 16 15 Z"
        fill={`url(#${gradPrefix}-loopLeft)`}
      />
      {/* Left Loop Specular Reflection */}
      <path
        d="M14 14.5 C11 10.5, 6 9.5, 5.5 12.5 C5 15, 10 16.5, 14 14.5 Z"
        fill="#FFFFFF"
        opacity="0.5"
      />

      {/* Right Loop */}
      <path
        d="M16 15 C19 9, 27 7, 28 12 C29 16, 21 18, 16 15 Z"
        fill={`url(#${gradPrefix}-loopRight)`}
      />
      {/* Right Loop Specular Reflection */}
      <path
        d="M18 14.5 C21 10.5, 26 9.5, 26.5 12.5 C27 15, 22 16.5, 18 14.5 Z"
        fill="#FFFFFF"
        opacity="0.5"
      />

      {/* Center 3D Knot */}
      <ellipse cx="16" cy="15" rx="3.3" ry="3.6" fill={`url(#${gradPrefix}-knot)`} />
      {/* Center Gloss Highlight */}
      <ellipse cx="15.2" cy="13.7" rx="1.6" ry="1.2" fill="#FFFFFF" opacity="0.95" />
    </svg>
  );
};

export const PookieJellyLogo: React.FC<PookieJellyLogoProps> = ({
  size = "md",
  className = "",
  showText = true,
  onClick,
  lightingTheme = "blush",
}) => {
  const sizeMap = {
    xs: { box: "w-7.5 h-7.5", text: "text-sm font-black", icon: "w-4.5 h-4.5" },
    sm: { box: "w-8.5 h-8.5", text: "text-base font-black", icon: "w-5 h-5" },
    md: { box: "w-9.5 h-9.5", text: "text-lg font-black", icon: "w-6 h-6" },
    lg: { box: "w-11 h-11", text: "text-xl font-black", icon: "w-7 h-7" },
    xl: { box: "w-13 h-13", text: "text-2xl font-black", icon: "w-8.5 h-8.5" },
  };

  const { box, text, icon } = sizeMap[size];

  // Theme-adaptive medallion styles
  const medallionStyles = {
    blush: {
      bg: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 228, 238, 0.95) 45%, rgba(255, 101, 132, 0.5) 100%)",
      shadow: "inset 0 2.5px 4px rgba(255, 255, 255, 1), inset 0 -2px 3px rgba(225, 29, 72, 0.25), 0 10px 24px -4px rgba(244, 63, 94, 0.3), 0 0 14px rgba(255, 182, 193, 0.4)",
      textColor: "text-[#240A18] group-hover:text-[#BE123C]",
      aiPillBg: "linear-gradient(135deg, #FF6584 0%, #F43F5E 55%, #BE123C 100%)",
      aiPillGlow: "0 2px 10px -1px rgba(244, 63, 94, 0.5)",
      accentColor: "#F43F5E",
    },
    sunlight: {
      bg: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 237, 224, 0.95) 45%, rgba(251, 146, 60, 0.5) 100%)",
      shadow: "inset 0 2.5px 4px rgba(255, 255, 255, 1), inset 0 -2px 3px rgba(234, 88, 12, 0.25), 0 10px 24px -4px rgba(249, 115, 22, 0.3), 0 0 14px rgba(254, 215, 170, 0.4)",
      textColor: "text-[#2A1205] group-hover:text-[#C2410C]",
      aiPillBg: "linear-gradient(135deg, #FB923C 0%, #F97316 55%, #EA580C 100%)",
      aiPillGlow: "0 2px 10px -1px rgba(249, 115, 22, 0.5)",
      accentColor: "#EA580C",
    },
    lunar: {
      bg: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(243, 232, 255, 0.95) 45%, rgba(192, 132, 252, 0.5) 100%)",
      shadow: "inset 0 2.5px 4px rgba(255, 255, 255, 1), inset 0 -2px 3px rgba(147, 51, 234, 0.25), 0 10px 24px -4px rgba(168, 85, 247, 0.3), 0 0 14px rgba(233, 213, 255, 0.4)",
      textColor: "text-[#200A2C] group-hover:text-[#7E22CE]",
      aiPillBg: "linear-gradient(135deg, #C084FC 0%, #A855F7 55%, #9333EA 100%)",
      aiPillGlow: "0 2px 10px -1px rgba(168, 85, 247, 0.5)",
      accentColor: "#9333EA",
    },
    emerald: {
      bg: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(209, 250, 229, 0.95) 45%, rgba(52, 211, 153, 0.5) 100%)",
      shadow: "inset 0 2.5px 4px rgba(255, 255, 255, 1), inset 0 -2px 3px rgba(5, 150, 105, 0.25), 0 10px 24px -4px rgba(16, 185, 129, 0.3), 0 0 14px rgba(167, 243, 208, 0.4)",
      textColor: "text-[#062419] group-hover:text-[#047857]",
      aiPillBg: "linear-gradient(135deg, #34D399 0%, #10B981 55%, #047857 100%)",
      aiPillGlow: "0 2px 10px -1px rgba(16, 185, 129, 0.5)",
      accentColor: "#059669",
    },
  }[lightingTheme || "blush"];

  return (
    <div
      id="arfa-ribbon-brand"
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none group ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* Theme-Adaptive 3D Double-Glass & Jelly Medallion with Elastic Physics */}
      <div
        className={`${box} jelly-squish-hover jelly-press relative flex items-center justify-center shrink-0 rounded-[14px] sm:rounded-[16px] transition-all duration-300`}
        style={{
          background: medallionStyles.bg,
          backdropFilter: "blur(28px) saturate(220%)",
          WebkitBackdropFilter: "blur(28px) saturate(220%)",
          border: "1.5px solid rgba(255, 255, 255, 0.98)",
          boxShadow: medallionStyles.shadow,
        }}
      >
        {/* Specular Top Glaze */}
        <div className="absolute inset-x-1 top-0.5 h-[40%] rounded-t-[12px] bg-gradient-to-b from-white/95 via-white/40 to-transparent pointer-events-none z-10" />

        {/* 🎀 Theme-Colored Ribbon Icon */}
        <RibbonBowIcon
          lightingTheme={lightingTheme}
          className={`${icon} relative z-10 transition-transform duration-300 group-hover:rotate-6`}
        />
      </div>

      {/* Eye-Grabbing Premium ARFA AI Wordmark */}
      {showText && (
        <div className="flex items-center gap-1.5 leading-none">
          {/* Sculpted Luxury ARFA Wordmark */}
          <span
            className="tracking-tight font-black text-[17px] sm:text-[18px] text-[#240A18] transition-colors group-hover:text-black"
            style={{
              letterSpacing: "-0.03em",
              textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)",
            }}
          >
            ARFA
          </span>

          {/* Eye-Catching 3D Jelly Pill Badge for "AI" */}
          <span
            className="relative px-1.5 py-0.5 rounded-[7px] text-[10px] font-black uppercase tracking-wider text-white select-none flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
            style={{
              background: medallionStyles.aiPillBg,
              boxShadow: `
                inset 0 1px 1px rgba(255, 255, 255, 0.85),
                inset 0 -1px 1.5px rgba(0, 0, 0, 0.2),
                ${medallionStyles.aiPillGlow}
              `,
              border: "1px solid rgba(255, 255, 255, 0.65)",
            }}
          >
            <span className="absolute inset-x-0.5 top-0.5 h-[38%] rounded-t-[5px] bg-gradient-to-b from-white/70 to-transparent pointer-events-none" />
            <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">AI</span>
          </span>
        </div>
      )}
    </div>
  );
};
