import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  User as UserIcon,
  ShieldCheck,
  Calendar,
  Settings,
  LogOut,
  Globe,
  Sparkles,
  Check,
} from "lucide-react";
import { User } from "../../types.ts";
import { UserAvatar } from "../ui/UserAvatar.tsx";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onOpenSettings: () => void;
  onLogout: () => void;
  preferredLanguage?: string;
  onLanguageChange?: (lang: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenSettings,
  onLogout,
  preferredLanguage = "auto",
  onLanguageChange,
}) => {
  const [selectedLang, setSelectedLang] = useState(preferredLanguage);
  const [langSaved, setLangSaved] = useState(false);

  useEffect(() => {
    setSelectedLang(preferredLanguage);
  }, [preferredLanguage]);

  if (!isOpen || !currentUser) return null;

  const languages = [
    { code: "auto", name: "Auto Detect (Recommended)", native: "Universal Multi-Language" },
    { code: "en", name: "English", native: "English" },
    { code: "es", name: "Spanish", native: "Español" },
    { code: "fr", name: "French", native: "Français" },
    { code: "de", name: "German", native: "Deutsch" },
    { code: "ar", name: "Arabic", native: "العربية" },
    { code: "zh", name: "Chinese", native: "中文" },
    { code: "ja", name: "Japanese", native: "日本語" },
  ];

  const handleLanguageSelect = (code: string) => {
    setSelectedLang(code);
    localStorage.setItem("arfa_preferred_lang", code);
    onLanguageChange?.(code);
    setLangSaved(true);
    setTimeout(() => setLangSaved(false), 2000);
  };

  const formattedJoinDate = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Active Member";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fadeIn">
      <div
        id="user-profile-modal-card"
        className="relative w-full max-w-md rounded-3xl bg-white border border-[#F5C4D2] shadow-[0_20px_60px_-15px_rgba(216,74,112,0.18)] overflow-hidden text-[#1A1718]"
      >
        {/* Soft Shimmer Ambient Glow Banner */}
        <div className="relative h-28 w-full bg-gradient-to-r from-[#FFF0F4] via-[#FCE4EC] to-[#F8D7E0] overflow-hidden border-b border-[#F7CDD8]">
          {/* Subtle micro-shimmer line */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.7),_transparent_70%)]" />
          <div className="absolute top-2 right-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/80 hover:bg-white text-[#5A5456] hover:text-[#1A1718] transition-colors cursor-pointer shadow-xs"
              aria-label="Close profile"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar with soft glow & small shimmer */}
          <div className="-mt-14 mb-3 flex items-end justify-between">
            <div className="relative p-1 rounded-full bg-white shadow-md">
              <UserAvatar user={currentUser} size="xl" showGlow={true} />
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF2F5] border border-[#F7CDD8] text-[#D84A70] text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentUser.plan || "Pro Member"}</span>
            </div>
          </div>

          {/* User Name & Status */}
          <div className="mb-5">
            <h2 className="text-xl font-bold tracking-tight text-[#1A1718] flex items-center gap-2">
              <span>{currentUser.name || "Explorer"}</span>
              <span title="Verified Account" className="inline-flex items-center">
                <ShieldCheck className="w-4 h-4 text-[#D84A70]" />
              </span>
            </h2>
            <p className="text-xs text-[#7E7779] mt-0.5 flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-[#A39B9E]" />
              <span>{currentUser.email || "Registered account"}</span>
            </p>
          </div>

          {/* Account Details Box */}
          <div className="rounded-2xl bg-[#FFFBF8] border border-[#F5C4D2]/70 p-4 space-y-3 mb-5 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#7E7779] flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D84A70]" />
                Account Status
              </span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {currentUser.status || "Active & Verified"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F2E8E5]">
              <span className="text-[#7E7779] flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#A39B9E]" />
                Member Since
              </span>
              <span className="font-medium text-[#1A1718]">{formattedJoinDate}</span>
            </div>
          </div>

          {/* Multilingual AI Language Preference */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#1A1718] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#D84A70]" />
                <span>Conversational Language</span>
              </label>
              {langSaved && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 animate-fadeIn">
                  <Check className="w-3 h-3" />
                  <span>Saved</span>
                </span>
              )}
            </div>

            <div className="relative">
              <select
                value={selectedLang}
                onChange={(e) => handleLanguageSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF8] border border-[#EFE9E6] hover:border-[#D84A70] text-xs font-medium text-[#1A1718] outline-none transition-colors cursor-pointer shadow-2xs focus:ring-1 focus:ring-[#D84A70]"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name} {l.native !== l.name ? `(${l.native})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-[#8E6F7A] mt-1.5 font-medium">
              Auto Detect lets you seamlessly converse in any world language with intelligent script recognition.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#EFE9E6]">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-[#1A1718] bg-[#F6F3F1] hover:bg-[#EFE9E6] border border-[#EFE9E6] transition-colors cursor-pointer shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5 text-[#7E7779]" />
              <span>Settings</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100/70 border border-red-100 transition-colors cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
