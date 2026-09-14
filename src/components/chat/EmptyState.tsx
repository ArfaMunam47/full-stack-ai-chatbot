import React from "react";
import {
  Lightbulb,
  PenTool,
  Code2,
  FileText,
  Languages,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "motion/react";

interface EmptyStateProps {
  onSelectPrompt?: (promptText: string) => void;
}

interface JellyFeature {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  gradient: string;
  border: string;
  iconBg: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  // 6 Compact, Gelatinous / Gel Features with Pure Spring-Based Physics Animation & Deep Squishy Gel Texture
  const features: JellyFeature[] = [
    {
      id: "creative-brainstorming",
      title: "Smart Ideas",
      subtitle: "Viral concepts & roadmaps",
      prompt: "Brainstorm 5 innovative product concepts that combine AI, tactile interfaces, and pastel galaxy design.",
      icon: Lightbulb,
      badge: "Ideate",
      gradient:
        "linear-gradient(145deg, rgba(245, 158, 11, 0.38) 0%, rgba(217, 70, 239, 0.32) 55%, rgba(124, 58, 237, 0.38) 100%)",
      border: "rgba(251, 191, 36, 0.55)",
      iconBg:
        "radial-gradient(circle at 35% 30%, #FDE68A 0%, #F59E0B 75%, #92400E 100%)",
    },
    {
      id: "editorial-studio",
      title: "Writing Lab",
      subtitle: "Poetic prose & essays",
      prompt: "Write a captivating, beautifully paced short story exploring the journey of a creative thinker in a futuristic galaxy.",
      icon: PenTool,
      badge: "Write",
      gradient:
        "linear-gradient(145deg, rgba(236, 72, 153, 0.42) 0%, rgba(168, 85, 247, 0.35) 55%, rgba(99, 102, 241, 0.38) 100%)",
      border: "rgba(244, 114, 182, 0.55)",
      iconBg:
        "radial-gradient(circle at 35% 30%, #FBCFE8 0%, #EC4899 75%, #831843 100%)",
    },
    {
      id: "nuanced-translation",
      title: "Urdu & Poetry",
      subtitle: "Nastaliq & cultural nuances",
      prompt: "Translate this thought into elegant, culturally rich Urdu poetry (اردو شاعری) and explain its subtle nuances.",
      icon: Languages,
      badge: "Urdu",
      gradient:
        "linear-gradient(145deg, rgba(244, 63, 94, 0.4) 0%, rgba(225, 29, 72, 0.35) 55%, rgba(147, 51, 234, 0.38) 100%)",
      border: "rgba(251, 113, 133, 0.55)",
      iconBg:
        "radial-gradient(circle at 35% 30%, #FECDD3 0%, #F43F5E 75%, #881337 100%)",
    },
    {
      id: "systems-code",
      title: "Code & Build",
      subtitle: "TypeScript & React systems",
      prompt: "Show me a clean TypeScript architecture for a reactive client-side store with undo/redo capabilities.",
      icon: Code2,
      badge: "Code",
      gradient:
        "linear-gradient(145deg, rgba(6, 182, 212, 0.4) 0%, rgba(59, 130, 246, 0.35) 55%, rgba(139, 92, 246, 0.38) 100%)",
      border: "rgba(56, 189, 248, 0.55)",
      iconBg:
        "radial-gradient(circle at 35% 30%, #BAE6FD 0%, #0284C7 75%, #075985 100%)",
    },
    {
      id: "document-synthesis",
      title: "Doc Synthesis",
      subtitle: "Checklists & key summaries",
      prompt: "Summarize the key principles of effective human-AI interaction design into 5 actionable, clear pillars.",
      icon: FileText,
      badge: "Analyze",
      gradient:
        "linear-gradient(145deg, rgba(16, 185, 129, 0.4) 0%, rgba(20, 184, 166, 0.35) 55%, rgba(99, 102, 241, 0.38) 100%)",
      border: "rgba(52, 211, 153, 0.55)",
      iconBg:
        "radial-gradient(circle at 35% 30%, #A7F3D0 0%, #059669 75%, #064E3B 100%)",
    },
    {
      id: "ask-anything",
      title: "Ask Anything",
      subtitle: "Curiosity, logic & wisdom",
      prompt: "Ask me anything! From science, space, and math to deep reasoning, coding, and creative problem solving.",
      icon: Sparkles,
      badge: "Ask",
      gradient:
        "linear-gradient(145deg, rgba(245, 158, 11, 0.42) 0%, rgba(244, 63, 94, 0.38) 55%, rgba(168, 85, 247, 0.42) 100%)",
      border: "rgba(251, 191, 36, 0.65)",
      iconBg:
        "radial-gradient(circle at 35% 30%, #FEF08A 0%, #F59E0B 65%, #B45309 100%)",
    },
  ];

  return (
    <div
      id="arfa-empty-state"
      className="w-full flex flex-col items-center justify-center select-none py-1 sm:py-2 px-2 sm:px-4 max-w-4xl mx-auto"
    >
      {/* 6 SMALL GELATINOUS SQUISHY FEATURE CARDS (COMPACT & BEAUTIFULLY CENTERED) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5"
      >
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <button
              key={feat.id}
              type="button"
              onClick={() => onSelectPrompt?.(feat.prompt)}
              className="jelly-feature-card group relative text-left p-2.5 sm:p-3 cursor-pointer flex items-center justify-between gap-2.5 min-h-[64px] sm:min-h-[68px]"
              style={{
                background: feat.gradient,
                border: `1.2px solid ${feat.border}`,
                boxShadow: `
                  inset 0 2px 3px rgba(255, 255, 255, 0.7),
                  inset 0 -2px 3px rgba(0, 0, 0, 0.45),
                  0 4px 14px -2px rgba(0, 0, 0, 0.5)
                `,
              }}
            >
              {/* Gelatinous Curved Specular Glaze Across the Top */}
              <div
                className="absolute inset-x-1.5 top-0.5 h-[42%] rounded-t-xl pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.12) 65%, transparent 100%)",
                }}
              />

              {/* 3D Jelly Icon Orb: Pure Candy Jelly Refraction (NO outer glowing halo) */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-active:scale-90 relative z-10"
                style={{
                  background: feat.iconBg,
                  border: "1.2px solid rgba(255, 255, 255, 0.8)",
                  boxShadow: `
                    inset 0 2px 2.5px rgba(255, 255, 255, 0.85),
                    inset 0 -1.5px 2px rgba(0, 0, 0, 0.5),
                    0 2px 6px rgba(0, 0, 0, 0.35)
                  `,
                }}
              >
                <Icon className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] stroke-[2.5]" />
              </div>

              {/* Compact Title & Subtitle */}
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-[13px] font-black text-white tracking-tight leading-tight truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    {feat.title}
                  </h3>
                  <span
                    className="px-1.5 py-0.2 rounded-full text-[9px] font-black tracking-wider uppercase backdrop-blur-md shrink-0"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.22)",
                      color: "#FFFFFF",
                      border: "0.8px solid rgba(255, 255, 255, 0.4)",
                    }}
                  >
                    {feat.badge}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-200/90 leading-tight truncate mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                  {feat.subtitle}
                </p>
              </div>

              {/* Mini Arrow Pill with Jelly Physics */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-110 relative z-10"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.22)",
                  border: "1px solid rgba(255, 255, 255, 0.45)",
                }}
              >
                <ArrowUpRight className="w-3 h-3 text-white stroke-[2.6]" />
              </div>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
};
