import React, { useState, useRef, useEffect } from "react";
import {
  Sun,
  Sparkles,
  Moon,
  Zap,
  LogIn,
  UserPlus,
} from "lucide-react";
import { PookieJellyLogo } from "../ui/PookieJellyLogo.tsx";
import { User, Conversation } from "../../types.ts";

export type LightingTheme = "sunlight" | "starlight" | "cyber" | "lunar";

interface TactileHeaderProps {
  onNewChat?: () => void;
  lightingTheme?: LightingTheme;
  onCycleLighting?: () => void;
  onOpenAuth?: (mode?: "login" | "register") => void;
  onLogout?: () => void;
  currentUser?: User | null;
  activeConversation?: Conversation | null;
  conversations?: Conversation[];
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (conv: Conversation) => void;
  hasMessages?: boolean;
}

export const TactileHeader: React.FC<TactileHeaderProps> = ({
  onNewChat,
  lightingTheme = "sunlight",
  onCycleLighting,
  onOpenAuth,
  onLogout,
  currentUser,
  activeConversation,
  hasMessages,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lighting theme icon & metadata
  const lightingInfo = {
    sunlight: {
      label: "Sunlight",
      icon: Sun,
      color: "text-amber-300",
      glow: "rgba(245, 158, 11, 0.4)",
      bg: "linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.45) 100%)",
      border: "rgba(254, 240, 138, 0.75)",
    },
    starlight: {
      label: "Starlight",
      icon: Sparkles,
      color: "text-pink-300",
      glow: "rgba(244, 114, 182, 0.4)",
      bg: "linear-gradient(135deg, rgba(244, 114, 182, 0.3) 0%, rgba(217, 70, 239, 0.45) 100%)",
      border: "rgba(244, 114, 182, 0.75)",
    },
    cyber: {
      label: "Cyber",
      icon: Zap,
      color: "text-cyan-300",
      glow: "rgba(56, 189, 248, 0.4)",
      bg: "linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(56, 189, 248, 0.45) 100%)",
      border: "rgba(192, 132, 252, 0.75)",
    },
    lunar: {
      label: "Lunar",
      icon: Moon,
      color: "text-sky-200",
      glow: "rgba(255, 255, 255, 0.4)",
      bg: "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(186, 230, 253, 0.4) 100%)",
      border: "rgba(255, 255, 255, 0.8)",
    },
  }[lightingTheme];

  const CurrentLightingIcon = lightingInfo.icon;

  return (
    <header className="shrink-0 w-full pt-2 sm:pt-3 px-2 sm:px-4 z-30">
      {/* Floating Pill Navbar: Synchronized with Active Lighting Theme */}
      <div
        id="arfa-floating-navbar"
        className={`premium-neon-lighting-navbar navbar-${lightingTheme} w-full px-3.5 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 transition-all relative overflow-hidden`}
      >
        {/* Top Specular Starlight Ray */}
        <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-20" />

        {/* LEFT: 🎀 Ultra-Visible Jelly Logo & Brand */}
        <div className="flex items-center gap-3">
          <PookieJellyLogo
            size="md"
            showText={true}
            onClick={onNewChat}
            className="cursor-pointer"
          />

          {/* Active Conversation Pill */}
          {activeConversation && activeConversation.title && hasMessages && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-xs font-bold text-white max-w-[200px] truncate shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="truncate">{activeConversation.title}</span>
            </div>
          )}
        </div>

        {/* RIGHT: Clean Navigation Elements - Lighting Theme Switcher & Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 1. One-Click Lighting Mode Changer */}
          {onCycleLighting && (
            <button
              type="button"
              onClick={onCycleLighting}
              className="jelly-spring group relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-black text-white cursor-pointer select-none"
              style={{
                background: lightingInfo.bg,
                border: `1.2px solid ${lightingInfo.border}`,
                boxShadow: `
                  inset 0 1.5px 2px rgba(255, 255, 255, 0.8),
                  inset 0 -1.5px 2px rgba(0, 0, 0, 0.4),
                  0 4px 12px ${lightingInfo.glow}
                `,
              }}
              title={`Lighting: ${lightingInfo.label} (Click to switch)`}
              aria-label={`Lighting theme: ${lightingInfo.label}`}
            >
              <div className="absolute inset-x-1 top-0.5 h-[40%] rounded-t-lg bg-gradient-to-b from-white/70 to-transparent pointer-events-none" />
              <CurrentLightingIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${lightingInfo.color} relative z-10 transition-transform duration-300 group-hover:rotate-45`} />
              <span className="relative z-10 font-black hidden xs:inline-block">
                {lightingInfo.label}
              </span>
            </button>
          )}

          {/* 2. Auth: SIGN IN and SIGN UP JELLY BUTTONS (Or Profile when logged in) */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="jelly-spring group relative w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-xl flex items-center justify-center text-xs sm:text-sm font-black text-white cursor-pointer select-none"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, #F472B6 0%, #A855F7 70%, #6D28D9 100%)",
                  border: "1.4px solid rgba(255, 255, 255, 0.85)",
                  boxShadow: `
                    inset 0 1.5px 2.5px rgba(255, 255, 255, 0.85),
                    inset 0 -1.5px 2.5px rgba(0, 0, 0, 0.45),
                    0 4px 14px rgba(168, 85, 247, 0.4)
                  `,
                }}
                title={currentUser.name || "Account"}
              >
                <div className="absolute inset-x-1 top-0.5 h-[40%] rounded-t-lg bg-gradient-to-b from-white/70 to-transparent pointer-events-none" />
                <span className="relative z-10">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "A"}
                </span>
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#130B24]/95 backdrop-blur-2xl p-2 z-50 animate-fadeIn"
                  style={{
                    border: "1.2px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.8)",
                  }}
                >
                  <div className="px-3 py-2 border-b border-white/10 text-left">
                    <p className="text-xs font-bold text-white truncate">
                      {currentUser.name || "Pookie User"}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {currentUser.email || "Free Tier"}
                    </p>
                  </div>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left mt-1 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Sign In Button */}
              {onOpenAuth && (
                <button
                  type="button"
                  onClick={() => onOpenAuth("login")}
                  className="jelly-spring group relative flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-black text-white cursor-pointer select-none"
                  style={{
                    background:
                      "linear-gradient(140deg, rgba(255, 255, 255, 0.18) 0%, rgba(168, 85, 247, 0.35) 100%)",
                    border: "1.2px solid rgba(255, 255, 255, 0.65)",
                    boxShadow: `
                      inset 0 1.5px 2px rgba(255, 255, 255, 0.75),
                      inset 0 -1.5px 2px rgba(0, 0, 0, 0.4),
                      0 4px 10px rgba(0, 0, 0, 0.3)
                    `,
                  }}
                  title="Sign In"
                >
                  <div className="absolute inset-x-1 top-0.5 h-[40%] rounded-t-lg bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
                  <LogIn className="w-3.5 h-3.5 text-white/90 relative z-10" />
                  <span className="relative z-10 font-bold">Sign In</span>
                </button>
              )}

              {/* Sign Up Button */}
              {onOpenAuth && (
                <button
                  type="button"
                  onClick={() => onOpenAuth("register")}
                  className="jelly-spring group relative flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-black text-white cursor-pointer select-none"
                  style={{
                    background:
                      "linear-gradient(135deg, #F43F5E 0%, #EC4899 50%, #9333EA 100%)",
                    border: "1.2px solid rgba(255, 255, 255, 0.85)",
                    boxShadow: `
                      inset 0 2px 3px rgba(255, 255, 255, 0.85),
                      inset 0 -2px 3px rgba(0, 0, 0, 0.4),
                      0 4px 14px rgba(236, 72, 153, 0.4)
                    `,
                  }}
                  title="Sign Up for Free"
                >
                  <div className="absolute inset-x-1 top-0.5 h-[40%] rounded-t-lg bg-gradient-to-b from-white/75 to-transparent pointer-events-none" />
                  <UserPlus className="w-3.5 h-3.5 text-white stroke-[2.5] relative z-10" />
                  <span className="relative z-10 font-black">Sign Up</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
