import React from "react";
import {
  Languages,
  PenTool,
  Sparkles,
  Lightbulb,
  FileText,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "motion/react";
import { User } from "../../types.ts";
import { FeltIconBadge } from "../ui/FeltIconBadge.tsx";
import clayGirlCutout from "../../assets/images/clay_girl_cutout_trimmed.png";

interface EmptyStateProps {
  currentUser?: User | null;
  onSelectPrompt?: (promptText: string) => void;
}

interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: any;
  badgeVariant: "pink" | "cream" | "mauve";
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  currentUser,
  onSelectPrompt,
}) => {
  // 6 Compact Handcrafted Features
  const quickActions: QuickActionItem[] = [
    {
      id: "translate",
      title: "Translate",
      description: "Translate & converse fluently",
      prompt: "Can you help me translate conversational dialogue fluently?",
      icon: Languages,
      badgeVariant: "pink",
    },
    {
      id: "write",
      title: "Write",
      description: "Draft emails, essays & refine tone",
      prompt: "Help me review and polish a friendly, professional email draft.",
      icon: PenTool,
      badgeVariant: "cream",
    },
    {
      id: "create",
      title: "Create",
      description: "Craft stories, poems & ideas",
      prompt: "Write a cozy, heartwarming story with rich, imaginative details.",
      icon: Sparkles,
      badgeVariant: "pink",
    },
    {
      id: "brainstorm",
      title: "Brainstorm",
      description: "Structure plans & solve problems",
      prompt: "Let's brainstorm a realistic and creative strategy roadmap.",
      icon: Lightbulb,
      badgeVariant: "mauve",
    },
    {
      id: "summarize",
      title: "Summarize",
      description: "Condense long text & documents",
      prompt: "Summarize the key takeaways and actionable bullet points from this text.",
      icon: FileText,
      badgeVariant: "cream",
    },
    {
      id: "ask-arfa",
      title: "Ask ARFA",
      description: "Ask questions & explore thoughts",
      prompt: "I have a curious question and need thoughtful guidance.",
      icon: MessageCircle,
      badgeVariant: "pink",
    },
  ];

  return (
    <div
      id="arfa-empty-state"
      className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center select-none text-center px-3 sm:px-4 py-3 sm:py-6"
    >
      {/* 
        =======================================================================
        TOP CENTER: SMALL 3D CLAYMORPHISM HANDCRAFTED CUTOUT (WITHOUT BACKGROUND)
        =======================================================================
        Background-free, isolated figurine cutout with 3D claymorphic drop shadow,
        tactile ground pedestal, and gentle floating animation
      */}
      <div className="relative flex flex-col items-center mb-8 sm:mb-10 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          whileHover={{ scale: 1.04, y: -4 }}
          className="relative cursor-pointer group"
        >
          {/* Subtle soft ambient warm-pink glow behind the figurine */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-[#FFB7D5]/35 via-[#FCE7F0]/25 to-[#F5D0DF]/35 blur-2xl pointer-events-none" />

          {/* Handcrafted 3D Claymorphism Character Cutout */}
          <div className="relative z-10 flex flex-col items-center">
            <img
              src={clayGirlCutout}
              alt="Small 3D Handcrafted Clay Figurine of Girl with Bunny and Laptop"
              className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 object-contain select-none clay-figure-shadow pointer-events-none transition-transform duration-300"
              referrerPolicy="no-referrer"
            />

            {/* 3D Tactile Clay Pedestal / Soft Oval Ground Shadow */}
            <div className="w-36 sm:w-44 h-4 rounded-full clay-soft-pedestal -mt-2.5 pointer-events-none" />
          </div>
        </motion.div>
      </div>

      {/* 
        =======================================================================
        6 HANDCRAFTED FEATURES WITH PROPER VERTICAL BREATHING ROOM
        =======================================================================
        Organized in a clean, balanced grid with zero overlap over the chat
      */}
      <div className="w-full max-w-2xl z-10 mb-2 sm:mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
          {quickActions.map((action) => (
            <button
              key={action.id}
              id={`quick-action-${action.id}`}
              type="button"
              onClick={() => onSelectPrompt?.(action.prompt)}
              className="group p-2.5 sm:p-3.5 rounded-[22px] felt-card-marshmallow flex items-center gap-2.5 text-left cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] border-2 border-white/95"
            >
              {/* Needle-Felted Handcrafted Icon Badge */}
              <FeltIconBadge
                icon={action.icon}
                variant={action.badgeVariant}
                size="sm"
              />

              {/* Title & Short Description */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[13px] sm:text-[14px] font-bold text-[#2B1E25] group-hover:text-[#E95D95] transition-colors truncate leading-tight">
                    {action.title}
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-[#8E7882] opacity-0 group-hover:opacity-100 group-hover:text-[#E95D95] transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
                </div>
                <p className="text-[11px] text-[#5A4750] leading-tight truncate mt-0.5 font-medium hidden xs:block">
                  {action.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
