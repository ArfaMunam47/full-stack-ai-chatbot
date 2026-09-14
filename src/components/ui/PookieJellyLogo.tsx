import React from "react";

interface PookieJellyLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  subtitle?: string;
  isAnimated?: boolean;
  onClick?: () => void;
}

export const PookieJellyLogo: React.FC<PookieJellyLogoProps> = ({
  size = "md",
  className = "",
  showText = true,
  subtitle,
  onClick,
}) => {
  const sizeMap = {
    xs: { box: "w-8 h-8", text: "text-sm font-black", ribbon: "text-lg" },
    sm: { box: "w-9.5 h-9.5", text: "text-base font-black", ribbon: "text-xl" },
    md: { box: "w-11 h-11", text: "text-lg sm:text-xl font-black", ribbon: "text-2xl" },
    lg: { box: "w-13 h-13", text: "text-xl font-black", ribbon: "text-3xl" },
    xl: { box: "w-16 h-16", text: "text-2xl font-black", ribbon: "text-4xl" },
  };

  const { box, text, ribbon } = sizeMap[size];

  return (
    <div
      id="arfa-ribbon-brand"
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none group ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* 🎀 3D Ultra-Visible Squishy Gelatinous Ribbon Emblem */}
      <div
        className={`${box} relative flex items-center justify-center shrink-0 rounded-2xl jelly-spring transition-all cursor-pointer`}
        style={{
          background:
            "radial-gradient(circle at 35% 25%, #FF7EB6 0%, #F43F5E 40%, #D946EF 75%, #7C3AED 100%)",
          border: "2px solid rgba(255, 255, 255, 0.9)",
          boxShadow: `
            inset 0 3px 4px rgba(255, 255, 255, 0.95),
            inset 0 -2.5px 4px rgba(0, 0, 0, 0.5),
            0 0 20px rgba(244, 63, 94, 0.6),
            0 4px 16px rgba(0, 0, 0, 0.8)
          `,
        }}
      >
        {/* Curved Top Specular Gloss Highlight */}
        <div className="absolute inset-x-1.5 top-0.5 h-[42%] rounded-t-xl bg-gradient-to-b from-white/90 via-white/40 to-transparent pointer-events-none z-10" />

        {/* The 🎀 Ribbon Emoji with spring physics and strong drop shadow */}
        <span
          className={`${ribbon} relative z-10 select-none transform transition-transform duration-300 group-hover:scale-125 group-active:scale-90 group-hover:rotate-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]`}
          role="img"
          aria-label="Ribbon logo"
        >
          🎀
        </span>
      </div>

      {showText && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-2">
            <span
              className={`tracking-tight font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] ${text}`}
              style={{
                textShadow: "0 0 16px rgba(244, 114, 182, 0.8), 0 2px 4px rgba(0,0,0,0.9)",
              }}
            >
              ARFA AI
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-pink-500/30 border border-pink-400/50 text-[10px] font-black text-pink-200 uppercase tracking-wider">
              PRO
            </span>
          </div>
          {subtitle ? (
            <span className="text-[11px] text-pink-200 font-semibold tracking-normal mt-1">
              {subtitle}
            </span>
          ) : (
            <span className="text-[11px] text-purple-200/90 font-semibold tracking-normal mt-0.5">
              Tactile Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
};

