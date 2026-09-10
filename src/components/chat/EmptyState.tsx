import React, { useState, useRef } from "react";
import {
  Languages,
  PenTool,
  Sparkles,
  Lightbulb,
  FileText,
  MessageCircleHeart,
  ChevronRight,
  Heart,
  Camera,
  Upload,
  RotateCcw,
} from "lucide-react";
import { motion } from "motion/react";
import { User } from "../../types.ts";
import arfaHeroCompanion from "../../assets/images/arfa_hero_companion.png";

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
  variant: "pink" | "cream";
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onSelectPrompt,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [heroSrc, setHeroSrc] = useState<string>(() => {
    return localStorage.getItem("arfa_custom_hero_image") || arfaHeroCompanion;
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setHeroSrc(result);
      localStorage.setItem("arfa_custom_hero_image", result);
      // Also persist to server endpoint asynchronously
      fetch("/api/hero-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: result }),
      }).catch(() => {});
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefault = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeroSrc(arfaHeroCompanion);
    localStorage.removeItem("arfa_custom_hero_image");
  };

  // 6 Tactile Claymorphic & Handcrafted Actions
  const quickActions: QuickActionItem[] = [
    {
      id: "translate",
      title: "Translate",
      description: "Break language barriers",
      prompt: "Can you help me translate conversational dialogue fluently and naturally?",
      icon: Languages,
      variant: "pink",
    },
    {
      id: "write",
      title: "Write",
      description: "Ideas into words",
      prompt: "Help me review, refine, and polish my writing into clear, warm prose.",
      icon: PenTool,
      variant: "cream",
    },
    {
      id: "create",
      title: "Create",
      description: "Turn ideas into magic",
      prompt: "Let's create a cozy, imaginative story or creative concept together.",
      icon: Sparkles,
      variant: "pink",
    },
    {
      id: "brainstorm",
      title: "Brainstorm",
      description: "Explore new ideas",
      prompt: "Let's brainstorm fresh, innovative ideas and structure a thoughtful plan.",
      icon: Lightbulb,
      variant: "cream",
    },
    {
      id: "summarize",
      title: "Summarize",
      description: "Get the key points",
      prompt: "Summarize the key takeaways and main points from this text clearly.",
      icon: FileText,
      variant: "pink",
    },
    {
      id: "ask-arfa",
      title: "Ask ARFA",
      description: "Anything, anytime",
      prompt: "Hi Arfa! I have a question and would love your thoughtful advice.",
      icon: MessageCircleHeart,
      variant: "cream",
    },
  ];

  return (
    <div
      id="arfa-empty-state"
      className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center select-none px-3 sm:px-6 relative"
    >
      {/* 
        =======================================================================
        TOP CENTER HERO VISUAL:
        The exact handcrafted needle-felted character artwork (girl in knit sweater,
        bunny on pink books holding heart with bow, pink laptop with white ribbon bow,
        floating hearts, and soft feathered edges seamlessly blending into canvas).
        Includes proper top margin and generous clearance.
        =======================================================================
      */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full flex flex-col items-center justify-center pt-5 sm:pt-9 mb-6 sm:mb-8 relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files?.[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
          }
        }}
      >
        {/* Soft subtle warm blush ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-40 sm:h-52 rounded-full bg-radial from-[#FFB8D5]/35 to-transparent blur-3xl pointer-events-none" />

        {/* Hero Character Composition (Widescreen 16:9 with natural feathered edges) */}
        <div className="relative z-10 max-w-full flex flex-col items-center">
          <img
            src={heroSrc}
            alt="ARFA AI Handcrafted Companion"
            className="w-full max-w-[420px] xs:max-w-[480px] sm:max-w-[540px] md:max-w-[580px] h-auto object-contain select-none drop-shadow-[0_14px_28px_rgba(220,100,150,0.18)] transition-transform duration-300 rounded-3xl"
            referrerPolicy="no-referrer"
          />

          {/* Quick picture customization actions (appears smoothly) */}
          <div className="mt-3 flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold fluffy-btn-signin cursor-pointer shadow-xs text-[#523340] hover:text-[#D94680]"
              title="Upload your own picture or drop file here"
            >
              <Camera className="w-3.5 h-3.5 text-[#D94680]" />
              <span>Change Picture</span>
            </button>
            {heroSrc !== arfaHeroCompanion && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/80 border border-[#F3CBD7] text-[#7A5A68] hover:text-[#D94680] cursor-pointer shadow-2xs"
                title="Reset to default artwork"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* 
        =======================================================================
        "START BY" SECTION WITH 6 TACTILE CLAYMORPHIC BUTTONS
        Proper space from both the top hero picture and bottom message bar.
        =======================================================================
      */}
      <div className="w-full max-w-3xl z-10 flex flex-col items-center mb-8 sm:mb-12">
        {/* Section Header: ♥ Start by ♥ */}
        <div className="flex items-center justify-center gap-2 mb-3.5 sm:mb-4 select-none">
          <Heart className="w-3 h-3 fill-[#E95D95] text-[#E95D95]" />
          <h2 className="text-xs sm:text-[13px] font-black text-[#2B151F] tracking-widest uppercase">
            Start by
          </h2>
          <Heart className="w-3 h-3 fill-[#E95D95] text-[#E95D95]" />
        </div>

        {/* 3x2 Grid of Tactile Needle-Felted / Claymorphic Action Buttons */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            const isPink = action.variant === "pink";

            return (
              <motion.button
                key={action.id}
                id={`quick-action-${action.id}`}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.04 * idx }}
                onClick={() => onSelectPrompt?.(action.prompt)}
                className={`group px-3.5 py-3 sm:px-4 sm:py-3.5 flex items-center justify-between gap-3 text-left cursor-pointer select-none transition-all ${
                  isPink ? "felt-action-pink" : "felt-action-cream"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Circular Icon Badge */}
                  <div
                    className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 shadow-2xs border ${
                      isPink
                        ? "bg-[#FFF8F4] text-[#E95D95] border-white/90"
                        : "bg-[#E95D95] text-white border-[#FFAECB]/60"
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[2.4]" />
                  </div>

                  {/* Action Titles */}
                  <div className="min-w-0 flex-1">
                    <span className="text-[13px] sm:text-[13.5px] font-black text-[#2B151F] truncate block">
                      {action.title}
                    </span>
                    <p
                      className={`text-[11px] sm:text-[11.5px] font-semibold truncate ${
                        isPink ? "text-[#4A2433]" : "text-[#7A5A68]"
                      }`}
                    >
                      {action.description}
                    </p>
                  </div>
                </div>

                {/* Right Arrow Chevron */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5 ${
                    isPink
                      ? "text-[#4A2433] group-hover:text-black"
                      : "text-[#7A5A68] group-hover:text-[#E95D95]"
                  }`}
                >
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.6]" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
