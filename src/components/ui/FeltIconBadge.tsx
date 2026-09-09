import React from "react";
import { LucideIcon } from "lucide-react";

interface FeltIconBadgeProps {
  icon: LucideIcon;
  variant?: "pink" | "cream" | "mauve";
  size?: "sm" | "md" | "lg";
  className?: string;
  hasStitches?: boolean;
}

export const FeltIconBadge: React.FC<FeltIconBadgeProps> = ({
  icon: Icon,
  variant = "pink",
  size = "md",
  className = "",
  hasStitches = true,
}) => {
  const sizeMap = {
    sm: {
      box: "w-8 h-8 rounded-xl",
      icon: "w-4 h-4 stroke-[2.4]",
      stitchInset: "inset-[2px] rounded-[10px]",
    },
    md: {
      box: "w-11 h-11 rounded-2xl",
      icon: "w-5 h-5 stroke-[2.3]",
      stitchInset: "inset-[3px] rounded-[13px]",
    },
    lg: {
      box: "w-14 h-14 rounded-3xl",
      icon: "w-6 h-6 stroke-[2.4]",
      stitchInset: "inset-[4px] rounded-[20px]",
    },
  };

  const styleMap = {
    pink: {
      container:
        "bg-gradient-to-br from-[#FF88B4] via-[#E95D95] to-[#D84581] text-white border-2 border-white/70 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_6px_14px_rgba(220,100,150,0.24)]",
      stitch: "border border-dashed border-white/50",
      iconShadow: "drop-shadow-[0_1px_1px_rgba(160,30,80,0.4)]",
    },
    cream: {
      container:
        "bg-gradient-to-br from-[#FFFFFF] via-[#FFF8FA] to-[#FDF0F5] text-[#E95D95] border-2 border-white/90 shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),0_6px_14px_rgba(220,100,150,0.12)]",
      stitch: "border border-dashed border-[#FFB7D5]/60",
      iconShadow: "drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]",
    },
    mauve: {
      container:
        "bg-gradient-to-br from-[#FFF5F8] via-[#FCE7F0] to-[#F5D0DF] text-[#A63A68] border-2 border-white/80 shadow-[inset_0_2px_3px_rgba(255,255,255,0.9),0_6px_12px_rgba(180,120,140,0.12)]",
      stitch: "border border-dashed border-[#E95D95]/40",
      iconShadow: "drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]",
    },
  };

  const currentSize = sizeMap[size];
  const currentStyle = styleMap[variant];

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 select-none ${currentSize.box} ${currentStyle.container} ${className}`}
    >
      {/* Handcrafted Embossed Stitches Ring */}
      {hasStitches && (
        <div
          className={`absolute pointer-events-none ${currentSize.stitchInset} ${currentStyle.stitch}`}
        />
      )}

      {/* Embroidered / Molded Felt Icon */}
      <Icon className={`${currentSize.icon} relative z-10 ${currentStyle.iconShadow}`} />
    </div>
  );
};
