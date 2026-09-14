import React from "react";
import { LucideIcon } from "lucide-react";

export type TactileVariant =
  | "navy"        // Primary AI action
  | "ivory"       // Neutral action
  | "sage"        // Connected / success
  | "terracotta"  // Warning / delete
  | "amber"       // Special / intelligence
  | "violet"      // Creative / multimodal
  | "charcoal";   // Structural

export type TactileSize = "xs" | "sm" | "md" | "lg" | "xl";

interface TactileIconPadProps {
  icon: LucideIcon;
  variant?: TactileVariant;
  size?: TactileSize;
  className?: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => void;
  title?: string;
  ariaLabel?: string;
  asDiv?: boolean;
}

export const TactileIconPad: React.FC<TactileIconPadProps> = ({
  icon: Icon,
  variant = "ivory",
  size = "md",
  className = "",
  isActive = false,
  disabled = false,
  onClick,
  title,
  ariaLabel,
  asDiv = false,
}) => {
  const sizeStyles: Record<TactileSize, { pad: string; icon: string; rounded: string; stroke: number }> = {
    xs: { pad: "w-7 h-7", icon: "w-3.5 h-3.5", rounded: "rounded-lg", stroke: 2.5 },
    sm: { pad: "w-8.5 h-8.5", icon: "w-4 h-4", rounded: "rounded-xl", stroke: 2.4 },
    md: { pad: "w-10 h-10", icon: "w-5 h-5", rounded: "rounded-2xl", stroke: 2.3 },
    lg: { pad: "w-12 h-12", icon: "w-6 h-6", rounded: "rounded-2xl", stroke: 2.3 },
    xl: { pad: "w-14 h-14", icon: "w-7 h-7", rounded: "rounded-3xl", stroke: 2.2 },
  };

  const variantStyles: Record<TactileVariant, { base: string; active: string; iconColor: string }> = {
    navy: {
      base: "bg-gradient-to-b from-[#223147] via-[#172336] to-[#0F1724] text-white border-t border-white/25 border-b border-black/50 shadow-[inset_0_2px_2px_rgba(255,255,255,0.22),inset_0_-2px_3px_rgba(0,0,0,0.45),0_6px_14px_-2px_rgba(15,23,36,0.32)]",
      active: "bg-gradient-to-b from-[#172336] to-[#0A101A] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_2px_4px_rgba(0,0,0,0.2)]",
      iconColor: "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
    },
    ivory: {
      base: "bg-gradient-to-b from-[#FFFFFF] via-[#FAF6F0] to-[#F1EAE0] text-[#29221C] border-t border-white/90 border-b border-[#D8CFC3] shadow-[inset_0_2px_2px_rgba(255,255,255,0.95),inset_0_-2px_2px_rgba(180,165,150,0.25),0_6px_14px_-2px_rgba(50,40,30,0.08)]",
      active: "bg-gradient-to-b from-[#ECE3D6] to-[#F5EFE6] shadow-[inset_0_2px_4px_rgba(40,30,20,0.12),0_1px_2px_rgba(0,0,0,0.03)]",
      iconColor: "text-[#3D332A] drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]",
    },
    sage: {
      base: "bg-gradient-to-b from-[#EAF4EE] via-[#DCEDE3] to-[#C9E1D3] text-[#1E4D34] border-t border-white/90 border-b border-[#A6CDB6] shadow-[inset_0_2px_2px_rgba(255,255,255,0.9),inset_0_-2px_2px_rgba(30,77,52,0.18),0_6px_14px_-2px_rgba(30,77,52,0.12)]",
      active: "bg-gradient-to-b from-[#C3DCCF] to-[#D5E8DE] shadow-[inset_0_2px_4px_rgba(20,60,40,0.2)]",
      iconColor: "text-[#18452E] drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]",
    },
    terracotta: {
      base: "bg-gradient-to-b from-[#FDF0EC] via-[#FAE2D8] to-[#F2CCC0] text-[#9A3822] border-t border-white/90 border-b border-[#E0A795] shadow-[inset_0_2px_2px_rgba(255,255,255,0.9),inset_0_-2px_2px_rgba(154,56,34,0.18),0_6px_14px_-2px_rgba(154,56,34,0.12)]",
      active: "bg-gradient-to-b from-[#E8BDB1] to-[#F3CCC2] shadow-[inset_0_2px_4px_rgba(120,40,20,0.22)]",
      iconColor: "text-[#872D19] drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]",
    },
    amber: {
      base: "bg-gradient-to-b from-[#FFF9EE] via-[#FDF0D5] to-[#F6E1B6] text-[#8C6212] border-t border-white/90 border-b border-[#DFC28B] shadow-[inset_0_2px_2px_rgba(255,255,255,0.9),inset_0_-2px_2px_rgba(140,98,18,0.18),0_6px_14px_-2px_rgba(140,98,18,0.12)]",
      active: "bg-gradient-to-b from-[#EBD19D] to-[#F4DDB0] shadow-[inset_0_2px_4px_rgba(100,70,10,0.2)]",
      iconColor: "text-[#7B530A] drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]",
    },
    violet: {
      base: "bg-gradient-to-b from-[#F7F2FC] via-[#ECE0F7] to-[#DECBEF] text-[#5C3D7A] border-t border-white/90 border-b border-[#C6AEE3] shadow-[inset_0_2px_2px_rgba(255,255,255,0.9),inset_0_-2px_2px_rgba(92,61,122,0.18),0_6px_14px_-2px_rgba(92,61,122,0.12)]",
      active: "bg-gradient-to-b from-[#D2BCE9] to-[#E3D1F3] shadow-[inset_0_2px_4px_rgba(70,40,100,0.2)]",
      iconColor: "text-[#4D2F6B] drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]",
    },
    charcoal: {
      base: "bg-gradient-to-b from-[#343D4D] via-[#252C38] to-[#1A1F28] text-white border-t border-white/20 border-b border-black/50 shadow-[inset_0_2px_2px_rgba(255,255,255,0.2),inset_0_-2px_3px_rgba(0,0,0,0.45),0_6px_14px_-2px_rgba(10,12,16,0.3)]",
      active: "bg-gradient-to-b from-[#1C212B] to-[#12161D] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]",
      iconColor: "text-[#E6ECF5] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
    },
  };

  const { pad, icon, rounded, stroke } = sizeStyles[size];
  const { base, active, iconColor } = variantStyles[variant];

  const commonClasses = `group relative inline-flex items-center justify-center shrink-0 select-none transition-all duration-150 ease-out ${pad} ${rounded} ${
    isActive ? active : base
  } ${disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : onClick ? "cursor-pointer active:scale-[0.96] active:translate-y-[1px]" : ""} ${className}`;

  if (asDiv) {
    return (
      <div
        title={title}
        aria-label={ariaLabel || title}
        onClick={onClick as any}
        className={commonClasses}
      >
        <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
        <Icon
          className={`${icon} ${iconColor} relative z-10 transition-transform duration-150 group-hover:scale-105`}
          strokeWidth={stroke}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel || title}
      className={commonClasses}
    >
      {/* Soft edge highlight */}
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />

      {/* Bold tactile icon */}
      <Icon
        className={`${icon} ${iconColor} relative z-10 transition-transform duration-150 group-hover:scale-105 group-active:scale-95`}
        strokeWidth={stroke}
      />
    </button>
  );
};
