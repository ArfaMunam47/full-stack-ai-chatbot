import React, { useState } from "react";
import {
  Zap,
  Palette,
  Code2,
  BrainCircuit,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { soundEffects } from "../../lib/sound.ts";
import { PookieJellyLogo, LightingTheme } from "../ui/PookieJellyLogo.tsx";

interface EmptyStateProps {
  onSelectPrompt?: (promptText: string) => void;
  lightingTheme?: LightingTheme;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onSelectPrompt,
  lightingTheme = "blush",
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Theme-aware tokens for badges, highlights, and accent colors
  const themeTokens = {
    blush: {
      accentColor: "#F43F5E",
      badgeText: "#BE123C",
      glowRing: "rgba(244, 63, 94, 0.28)",
      gradientIcon: "linear-gradient(135deg, #FF758F 0%, #F43F5E 55%, #BE123C 100%)",
      pillHover: "group-hover:bg-[#F43F5E] group-hover:text-white group-hover:border-rose-400",
      pillBg: "bg-white/90",
      brandGlow: "0 0 32px rgba(244, 63, 94, 0.22)",
      cardHoverGlow: "rgba(244, 63, 94, 0.2)",
    },
    sunlight: {
      accentColor: "#EA580C",
      badgeText: "#C2410C",
      glowRing: "rgba(249, 115, 22, 0.28)",
      gradientIcon: "linear-gradient(135deg, #FDBA74 0%, #FB923C 55%, #EA580C 100%)",
      pillHover: "group-hover:bg-[#EA580C] group-hover:text-white group-hover:border-orange-400",
      pillBg: "bg-white/90",
      brandGlow: "0 0 32px rgba(249, 115, 22, 0.22)",
      cardHoverGlow: "rgba(249, 115, 22, 0.2)",
    },
    lunar: {
      accentColor: "#9333EA",
      badgeText: "#7E22CE",
      glowRing: "rgba(168, 85, 247, 0.28)",
      gradientIcon: "linear-gradient(135deg, #D8B4FE 0%, #A855F7 55%, #7E22CE 100%)",
      pillHover: "group-hover:bg-[#9333EA] group-hover:text-white group-hover:border-purple-400",
      pillBg: "bg-white/90",
      brandGlow: "0 0 32px rgba(168, 85, 247, 0.22)",
      cardHoverGlow: "rgba(168, 85, 247, 0.2)",
    },
    emerald: {
      accentColor: "#059669",
      badgeText: "#047857",
      glowRing: "rgba(16, 185, 129, 0.28)",
      gradientIcon: "linear-gradient(135deg, #6EE7B7 0%, #10B981 55%, #047857 100%)",
      pillHover: "group-hover:bg-[#10B981] group-hover:text-white group-hover:border-emerald-400",
      pillBg: "bg-white/90",
      brandGlow: "0 0 32px rgba(16, 185, 129, 0.22)",
      cardHoverGlow: "rgba(16, 185, 129, 0.2)",
    },
  }[lightingTheme || "blush"];

  // 4 Streamlined, Compact Feature Tiles with Liquid Glassmorphism & Jelly micro-actions
  const features = [
    {
      id: "friendly-chat",
      title: "Best Friend Chat",
      subtitle: "Caring & supportive (<3s)",
      prompt: "Hey Arfa! Can we chat like best friends? Tell me something uplifting to brighten my day.",
      icon: Sparkles,
    },
    {
      id: "doc-reader",
      title: "📎 File & Doc Reader",
      subtitle: "Attach & ask questions",
      prompt: "How can I attach documents, notes, or code files for you to analyze and answer questions?",
      icon: Code2,
    },
    {
      id: "deep-analysis",
      title: "🧠 Deep Analysis",
      subtitle: "Accurate problem solving",
      prompt: "Help me analyze a complex problem and break it down into clean, actionable steps.",
      icon: Zap,
    },
    {
      id: "fast-intelligence",
      title: "⚡ Instant Ideas (<3s)",
      subtitle: "Sub-second smart advice",
      prompt: "Give me 3 clever productivity life-hacks that take less than 2 minutes each.",
      icon: Zap,
    },
  ];

  const handleFeatureClick = (prompt: string) => {
    soundEffects.tap();
    onSelectPrompt?.(prompt);
  };

  return (
    <div
      id="arfa-empty-state"
      className="w-full flex flex-col items-center justify-center select-none py-3 px-2 sm:px-4 max-w-xl mx-auto z-10"
    >
      {/* 1. CREATIVE ARFA AI BRANDING & WELCOMING GREETING */}
      {/* Expanded generous padding between greeting and the 4 features */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col items-center text-center mb-6 sm:mb-8"
      >
        {/* Creative Theme-Adaptive 3D Jelly Ribbon Medallion with Squishy Hover Physics */}
        <div className="mb-3 relative group">
          <PookieJellyLogo
            size="lg"
            showText={false}
            lightingTheme={lightingTheme}
            className="cursor-pointer"
            onClick={() => soundEffects.tap()}
          />
          {/* Ambient Glow Aura */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none -z-10 transition-all duration-500 group-hover:scale-125"
            style={{ boxShadow: themeTokens.brandGlow }}
          />
        </div>

        {/* Premium Eye-Grabbing ARFA AI Typography */}
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight text-[#240A18] flex items-center gap-2"
            style={{ letterSpacing: "-0.03em" }}
          >
            <span className="drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">ARFA</span>
            {/* Themed Jelly AI Badge */}
            <span
              className="relative px-2 py-0.5 rounded-lg text-white text-xs sm:text-sm font-black uppercase tracking-wider inline-flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-105"
              style={{
                background: themeTokens.gradientIcon,
                boxShadow: `
                  inset 0 1px 1px rgba(255, 255, 255, 0.9),
                  inset 0 -1px 2px rgba(0, 0, 0, 0.25),
                  0 4px 12px -2px ${themeTokens.glowRing}
                `,
                border: "1px solid rgba(255, 255, 255, 0.75)",
              }}
            >
              <span className="absolute inset-x-1 top-0.5 h-[38%] rounded-t-[6px] bg-gradient-to-b from-white/75 to-transparent pointer-events-none" />
              <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">AI</span>
            </span>
          </h1>
          <Sparkles
            className="w-4 h-4 transition-colors duration-300 animate-pulse shrink-0"
            style={{ color: themeTokens.accentColor }}
          />
        </div>

        {/* Warm, Natural Welcoming Question */}
        <p className="text-sm sm:text-base font-extrabold text-[#320F22] mb-1">
          Your AI Best Friend & Intelligent Companion
        </p>
        <p className="text-[12px] sm:text-[12.5px] text-[#8A4B6E] font-medium max-w-xs sm:max-w-sm mx-auto leading-relaxed">
          Chat freely with sub-3s instant replies, attach any document or file for instant Q&A, and brainstorm ideas together! ✨
        </p>
      </motion.div>

      {/* 2. FOUR COMPACT FEATURE TILES WITH ENHANCED GLASSMORPHISM & JELLY MICRO-ACTIONS */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
        className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3"
      >
        {features.map((item) => {
          const Icon = item.icon;
          const isHovered = hoveredCard === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleFeatureClick(item.prompt)}
              className="liquid-jelly-card group relative text-left px-3.5 py-2.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer min-h-[50px] select-none"
              style={{
                boxShadow: isHovered
                  ? `
                      inset 0 2px 3px rgba(255, 255, 255, 1),
                      inset 0 -2px 3px rgba(0, 0, 0, 0.04),
                      0 14px 28px -6px ${themeTokens.cardHoverGlow},
                      0 2px 6px rgba(0, 0, 0, 0.03)
                    `
                  : undefined,
              }}
            >
              {/* Specular Curved Highlight Glaze for Liquid Depth */}
              <div className="specular-top-glaze" />

              {/* Left: 3D Squishy Jelly Icon Pad + Typography */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1 relative z-10">
                {/* 3D Jelly Elastic Squish Capsule */}
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 relative transition-transform duration-200 group-hover:scale-110 group-active:scale-90 shadow-2xs"
                  style={{
                    background: themeTokens.gradientIcon,
                    border: "1.2px solid rgba(255, 255, 255, 0.9)",
                    boxShadow: `
                      inset 0 1.5px 2px rgba(255, 255, 255, 0.85),
                      inset 0 -1.5px 2px rgba(0, 0, 0, 0.25),
                      0 4px 10px -2px ${themeTokens.glowRing}
                    `,
                  }}
                >
                  <div className="absolute inset-x-0.5 top-0.5 h-[40%] rounded-t-[8px] bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />
                  <Icon className="w-3.5 h-3.5 text-white relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]" />
                </div>

                {/* Title & Micro Subtitle */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-extrabold text-[12.5px] sm:text-[13px] text-[#240A18] tracking-tight truncate group-hover:text-black transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[10.5px] text-[#8A4B6E] font-medium truncate leading-tight">
                    {item.subtitle}
                  </span>
                </div>
              </div>

              {/* Right: Small Tactile Arrow Pill with Jelly Flex */}
              <div
                className={`w-5.5 h-5.5 rounded-full flex items-center justify-center shrink-0 border border-pink-200/80 bg-white/95 text-[#361427] transition-all relative z-10 shadow-2xs group-hover:scale-110 ${themeTokens.pillHover}`}
              >
                <ArrowUpRight className="w-3 h-3 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
};
