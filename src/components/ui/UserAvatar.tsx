import React from "react";
import { User } from "../../types.ts";
import { Sparkles } from "lucide-react";

interface UserAvatarProps {
  user?: User | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showGlow?: boolean;
  className?: string;
  onClick?: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = "md",
  showGlow = false,
  className = "",
  onClick,
}) => {
  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base font-bold",
    xl: "w-16 h-16 text-xl font-bold",
  };

  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "";

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
        onClick ? "cursor-pointer hover:scale-105 active:scale-95" : ""
      } ${className}`}
    >
      {/* Outer subtle luminous halo / glow for premium beauty-tech feel */}
      {showGlow && (
        <span
          className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-[#F9D0DC] via-[#F4A7BA] to-[#E8618C] opacity-40 blur-[3px] pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Main Avatar Body */}
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.name || "User Avatar"}
          referrerPolicy="no-referrer"
          className={`${sizeClasses[size]} relative rounded-full object-cover border border-[#F5C4D2] ring-1 ring-white/80 shadow-xs`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} relative rounded-full flex items-center justify-center font-bold text-white shadow-xs select-none border border-[#F7CDD8] ring-1 ring-white/60 bg-gradient-to-tr from-[#F28DA7] via-[#E8618C] to-[#C93B66]`}
        >
          {/* Subtle micro-shimmer highlight across top curve */}
          <span
            className="absolute inset-x-1 top-0.5 h-[35%] rounded-t-full bg-gradient-to-b from-white/35 to-transparent pointer-events-none"
            aria-hidden="true"
          />

          {initial ? (
            <span className="relative drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)] font-semibold tracking-tight">
              {initial}
            </span>
          ) : (
            <Sparkles className="w-4 h-4 text-white/90 drop-shadow-xs" />
          )}
        </div>
      )}
    </div>
  );
};
