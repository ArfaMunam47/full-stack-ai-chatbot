import React, { useState, useRef, useEffect } from "react";
import {
  Sun,
  Sparkles,
  Moon,
  Gem,
  Plus,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  Check,
} from "lucide-react";
import { PookieJellyLogo } from "../ui/PookieJellyLogo.tsx";
import { User, Conversation } from "../../types.ts";
import { soundEffects } from "../../lib/sound.ts";

export type LightingTheme = "blush" | "sunlight" | "lunar" | "emerald";

interface TactileHeaderProps {
  onNewChat?: () => void;
  onToggleSidePreview?: () => void;
  isSidePreviewOpen?: boolean;
  lightingTheme?: LightingTheme;
  onCycleLighting?: () => void;
  onSelectLightingTheme?: (theme: LightingTheme) => void;
  onOpenAuth?: (mode?: "login" | "register") => void;
  onLogout?: () => void;
  currentUser?: User | null;
  activeConversation?: Conversation | null;
  conversations?: Conversation[];
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (conv: Conversation) => void;
  hasMessages?: boolean;
  selectedModel?: string;
  onSelectModel?: (modelId: string) => void;
  onOpenSettings?: () => void;
}

export const TactileHeader: React.FC<TactileHeaderProps> = ({
  onNewChat,
  lightingTheme = "blush",
  onCycleLighting,
  onSelectLightingTheme,
  onOpenAuth,
  onLogout,
  currentUser,
  selectedModel = "gemini-3.1-flash-lite",
  onSelectModel,
  onOpenSettings,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    soundEffects.initFromStorage();

    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeOptions: {
    id: LightingTheme;
    label: string;
    description: string;
    icon: React.ElementType;
    iconColor: string;
    dotColor: string;
    activeBorder: string;
  }[] = [
    {
      id: "blush",
      label: "Rose Quartz",
      description: "Blush rose & liquid glass",
      icon: Sparkles,
      iconColor: "text-rose-500",
      dotColor: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]",
      activeBorder: "border-rose-400 bg-rose-50/90 text-[#BE123C]",
    },
    {
      id: "sunlight",
      label: "Peach Satin",
      description: "Warm apricot & soft clay",
      icon: Sun,
      iconColor: "text-orange-500",
      dotColor: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]",
      activeBorder: "border-orange-400 bg-orange-50/90 text-[#C2410C]",
    },
    {
      id: "lunar",
      label: "Lavender Dream",
      description: "Pastel lilac & starlight pearl",
      icon: Moon,
      iconColor: "text-purple-500",
      dotColor: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]",
      activeBorder: "border-purple-400 bg-purple-50/90 text-[#7E22CE]",
    },
    {
      id: "emerald",
      label: "Mint Opal",
      description: "Crystalline jade & fresh seafoam",
      icon: Gem,
      iconColor: "text-emerald-500",
      dotColor: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
      activeBorder: "border-emerald-400 bg-emerald-50/90 text-[#047857]",
    },
  ];

  const currentTheme = themeOptions.find((t) => t.id === lightingTheme) || themeOptions[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <header className="shrink-0 w-full pt-2 sm:pt-3 px-2 sm:px-4 z-30">
      {/* Floating Soft 3D Double-Glass & Claymorphism Navbar */}
      <div
        id="arfa-floating-navbar"
        className="soft3d-navbar w-full px-3.5 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-3 relative overflow-visible"
      >
        {/* Specular Top Glaze */}
        <div className="specular-top-glaze" />

        {/* LEFT: 🎀 Soft 3D ARFA AI Logo with Theme-Adaptive Colors */}
        <div className="flex items-center gap-3 relative z-10">
          <PookieJellyLogo
            size="md"
            showText={true}
            lightingTheme={lightingTheme}
            onClick={() => {
              soundEffects.tap();
              onNewChat?.();
            }}
            className="cursor-pointer"
          />
        </div>

        {/* RIGHT: Soft 3D Controls (Interactive Theme Picker & Auth) */}
        <div className="flex items-center gap-2 sm:gap-2.5 relative z-10">
          {/* New Chat Instant Button */}
          <button
            type="button"
            onClick={() => {
              soundEffects.tap();
              onNewChat?.();
            }}
            className="soft3d-button-secondary px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs font-extrabold text-[#3D1429] flex items-center gap-1.5 cursor-pointer select-none"
            title="Start a fresh chat"
          >
            <div className="absolute inset-x-1 top-0.5 h-[40%] rounded-t-full bg-gradient-to-b from-white/95 to-transparent pointer-events-none" />
            <Plus className="w-3.5 h-3.5 text-rose-500 stroke-[2.5]" />
            <span className="hidden sm:inline-block font-extrabold text-[12px]">New Chat</span>
          </button>

          {/* Interactive 3D Theme Switcher Popover */}
          <div className="relative" ref={themeMenuRef}>
            <button
              type="button"
              onClick={() => {
                soundEffects.tap();
                setIsThemeMenuOpen((prev) => !prev);
              }}
              className="soft3d-button-secondary group relative flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-full text-xs font-extrabold text-[#2A081D] cursor-pointer select-none"
              title={`Active Theme: ${currentTheme.label} (Click to switch)`}
              aria-label={`Switch Theme. Current: ${currentTheme.label}`}
            >
              <div className="absolute inset-x-1 top-0.5 h-[40%] rounded-t-full bg-gradient-to-b from-white/95 to-transparent pointer-events-none" />

              {/* Glowing Color Dot */}
              <span className={`w-2 h-2 rounded-full shrink-0 ${currentTheme.dotColor}`} />

              <CurrentIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${currentTheme.iconColor} transition-transform duration-300 group-hover:rotate-12`} />

              <span className="hidden sm:inline-block font-extrabold text-[12.5px] tracking-tight">
                {currentTheme.label}
              </span>

              <ChevronDown className="w-3 h-3 text-rose-400/80 transition-transform duration-200 group-hover:translate-y-0.5" />
            </button>

            {/* Double-Glass 3D Theme Picker Dropdown Menu */}
            {isThemeMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-2xl p-2 z-50 animate-fadeIn border border-pink-200/90"
                style={{
                  boxShadow: "0 20px 48px -10px rgba(244, 63, 94, 0.22), 0 0 20px rgba(255, 255, 255, 0.9)",
                }}
              >
                <div className="px-3 py-1.5 text-[11px] font-extrabold tracking-wider text-[#8A4B6E] uppercase border-b border-pink-100 mb-1">
                  Choose Atmosphere
                </div>

                <div className="flex flex-col gap-1">
                  {themeOptions.map((opt) => {
                    const OptIcon = opt.icon;
                    const isSelected = opt.id === lightingTheme;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          soundEffects.glassChime();
                          if (onSelectLightingTheme) {
                            onSelectLightingTheme(opt.id);
                          } else if (onCycleLighting) {
                            onCycleLighting();
                          }
                          setIsThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? opt.activeBorder
                            : "border-transparent text-[#3D1429] hover:bg-pink-50/70"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${opt.dotColor}`} />
                          <OptIcon className={`w-3.5 h-3.5 ${opt.iconColor}`} />
                          <div className="text-left">
                            <div className="font-extrabold text-[12px]">{opt.label}</div>
                            <div className="text-[10px] text-gray-500 font-normal">{opt.description}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-rose-500 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth Action */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => {
                  soundEffects.tap();
                  setIsUserMenuOpen((prev) => !prev);
                }}
                className="soft3d-button-secondary w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-[#3D1429] cursor-pointer select-none"
                title={`Logged in as ${currentUser.name || currentUser.email}`}
              >
                <div className="absolute inset-0.5 rounded-full bg-gradient-to-b from-white/90 to-transparent pointer-events-none" />
                <span className="relative z-10">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "A"}
                </span>
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-2xl bg-white/95 backdrop-blur-2xl p-2 z-50 animate-fadeIn border border-pink-100/90"
                  style={{
                    boxShadow: "0 18px 45px -10px rgba(244, 63, 94, 0.2)",
                  }}
                >
                  <div className="px-3 py-2 border-b border-pink-100/80">
                    <div className="font-extrabold text-xs text-[#3D1429] truncate">
                      {currentUser.name || "User"}
                    </div>
                    <div className="text-[11px] text-[#8A4B6E] truncate">
                      {currentUser.email}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.tap();
                      setIsUserMenuOpen(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEffects.tap();
                  onOpenAuth?.("login");
                }}
                className="soft3d-button-secondary px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-extrabold text-[#3D1429] flex items-center gap-1.5 cursor-pointer select-none"
                title="Sign In to your account"
              >
                <div className="absolute inset-x-1 top-0.5 h-[38%] rounded-t-full bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />
                <LogIn className="w-3.5 h-3.5 text-rose-500 stroke-[2.4]" />
                <span className="font-extrabold">Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.tap();
                  onOpenAuth?.("register");
                }}
                className="soft3d-button-primary px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-black text-white flex items-center gap-1.5 cursor-pointer select-none"
                title="Create free account"
              >
                <div className="absolute inset-x-1 top-0.5 h-[40%] rounded-t-full bg-gradient-to-b from-white/70 to-transparent pointer-events-none" />
                <UserPlus className="w-3.5 h-3.5 text-white stroke-[2.4]" />
                <span className="font-black">Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
