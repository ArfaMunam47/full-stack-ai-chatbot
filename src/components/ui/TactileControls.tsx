import React from "react";
import { LucideIcon } from "lucide-react";
import { TactileVariant } from "./TactileIconPad.tsx";

// ==========================================
// 1. TactileButton: Inflated physical cushion button
// ==========================================
interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TactileVariant;
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  children?: React.ReactNode;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  variant = "ivory",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  children,
  className = "",
  disabled,
  ...props
}) => {
  const sizeMap = {
    sm: "px-3 py-1.5 text-xs rounded-xl gap-1.5",
    md: "px-4 py-2 text-sm rounded-2xl gap-2",
    lg: "px-5.5 py-3 text-base rounded-2xl gap-2.5",
  };

  const iconSizeMap = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const variantMap: Record<TactileVariant, string> = {
    navy: "bg-gradient-to-b from-[#223147] via-[#172336] to-[#0F1724] text-white border-t border-white/25 border-b border-black/50 shadow-[inset_0_2px_2px_rgba(255,255,255,0.22),inset_0_-2px_3px_rgba(0,0,0,0.45),0_6px_14px_-2px_rgba(15,23,36,0.32)] hover:from-[#293A54] hover:to-[#121B2B] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]",
    ivory: "bg-gradient-to-b from-[#FFFFFF] via-[#FAF6F0] to-[#EFE7DC] text-[#29221C] border-t border-white/90 border-b border-[#D8CFC3] shadow-[inset_0_2px_2px_rgba(255,255,255,0.95),inset_0_-2px_2px_rgba(180,165,150,0.25),0_6px_14px_-2px_rgba(50,40,30,0.08)] hover:from-[#FFFFFF] hover:to-[#F5ECE0] active:shadow-[inset_0_2px_4px_rgba(40,30,20,0.12)]",
    sage: "bg-gradient-to-b from-[#EAF4EE] via-[#DCEDE3] to-[#C9E1D3] text-[#1E4D34] border-t border-white/90 border-b border-[#A6CDB6] shadow-[inset_0_2px_2px_rgba(255,255,255,0.9),inset_0_-2px_2px_rgba(30,77,52,0.18),0_6px_14px_-2px_rgba(30,77,52,0.12)] hover:from-[#F0F8F3] hover:to-[#D4E8DD]",
    terracotta: "bg-gradient-to-b from-[#FDF0EC] via-[#FAE2D8] to-[#F2CCC0] text-[#9A3822] border-t border-white/90 border-b border-[#E0A795] shadow-[inset_0_2px_2px_rgba(255,255,255,0.9),inset_0_-2px_2px_rgba(154,56,34,0.18),0_6px_14px_-2px_rgba(154,56,34,0.12)] hover:from-[#FFF5F2] hover:to-[#F5D4CA]",
    amber: "bg-gradient-to-b from-[#FFF9EE] via-[#FDF0D5] to-[#F6E1B6] text-[#8C6212] border-t border-white/90 border-b border-[#DFC28B] shadow-[inset_0_2px_2px_rgba(255,255,255,0.9),inset_0_-2px_2px_rgba(140,98,18,0.18),0_6px_14px_-2px_rgba(140,98,18,0.12)] hover:from-[#FFFCF5] hover:to-[#F8E7C4]",
    violet: "bg-gradient-to-b from-[#F7F2FC] via-[#ECE0F7] to-[#DECBEF] text-[#5C3D7A] border-t border-white/90 border-b border-[#C6AEE3] shadow-[inset_0_2px_2px_rgba(255,255,255,0.9),inset_0_-2px_2px_rgba(92,61,122,0.18),0_6px_14px_-2px_rgba(92,61,122,0.12)] hover:from-[#FCF8FF] hover:to-[#E5D4F5]",
    charcoal: "bg-gradient-to-b from-[#343D4D] via-[#252C38] to-[#1A1F28] text-white border-t border-white/20 border-b border-black/50 shadow-[inset_0_2px_2px_rgba(255,255,255,0.2),inset_0_-2px_3px_rgba(0,0,0,0.45),0_6px_14px_-2px_rgba(10,12,16,0.3)] hover:from-[#3D485B] hover:to-[#202632]",
  };

  return (
    <button
      disabled={disabled}
      className={`relative inline-flex items-center justify-center font-semibold select-none cursor-pointer transition-all duration-150 ease-out active:scale-[0.97] active:translate-y-[1px] disabled:opacity-45 disabled:pointer-events-none ${sizeMap[size]} ${variantMap[variant]} ${className}`}
      {...props}
    >
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
      {Icon && iconPosition === "left" && (
        <Icon className={`${iconSizeMap[size]} shrink-0 stroke-[2.3]`} />
      )}
      <span className="relative z-10 leading-none">{children}</span>
      {Icon && iconPosition === "right" && (
        <Icon className={`${iconSizeMap[size]} shrink-0 stroke-[2.3]`} />
      )}
    </button>
  );
};

// ==========================================
// 2. TactileToggle: Recessed felt track + plush knob
// ==========================================
interface TactileToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  variant?: TactileVariant;
}

export const TactileToggle: React.FC<TactileToggleProps> = ({
  checked,
  onChange,
  label,
  variant = "navy",
}) => {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      {label && <span className="text-xs font-semibold text-[#3D332A]">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer border ${
          checked
            ? variant === "navy"
              ? "bg-[#1B273A] border-[#101824] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
              : "bg-[#2563EB] border-[#1D4ED8]"
            : "bg-[#E6DFD5] border-[#D6CEC2] shadow-[inset_0_2px_4px_rgba(40,30,20,0.12)]"
        }`}
      >
        <div
          className={`w-5.5 h-5.5 rounded-full bg-gradient-to-b from-[#FFFFFF] via-[#FAF6F0] to-[#EBE2D5] border-t border-white/95 border-b border-[#C8BFB2] shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),0_2px_5px_rgba(30,20,10,0.2)] transition-transform duration-200 ${
            checked ? "translate-x-5.5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
};

// ==========================================
// 3. TactileChip: Rounded pill with soft padded elevation
// ==========================================
interface TactileChipProps {
  label: string;
  icon?: LucideIcon;
  isActive?: boolean;
  onClick?: () => void;
  variant?: TactileVariant;
  badge?: string | number;
}

export const TactileChip: React.FC<TactileChipProps> = ({
  label,
  icon: Icon,
  isActive = false,
  onClick,
  variant = "navy",
  badge,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer select-none transition-all duration-150 active:scale-[0.97] ${
        isActive
          ? "bg-gradient-to-b from-[#223147] to-[#121B28] text-white border-t border-white/30 border-b border-black/50 shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.25),0_4px_10px_-2px_rgba(15,23,36,0.3)]"
          : "bg-gradient-to-b from-[#FFFFFF] via-[#FAF7F2] to-[#EFE8DD] text-[#4A3E34] border-t border-white/90 border-b border-[#D8CFC3] shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.95),0_3px_8px_-2px_rgba(50,40,30,0.06)] hover:to-[#F5ECE0]"
      }`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 stroke-[2.4]" />}
      <span>{label}</span>
      {badge !== undefined && (
        <span
          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            isActive ? "bg-white/20 text-white" : "bg-[#E5DCD0] text-[#55473B]"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
};
