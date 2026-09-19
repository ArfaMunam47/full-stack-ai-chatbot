import React, { useEffect, useState, useRef } from "react";

export type LightingTheme = "blush" | "sunlight" | "lunar" | "emerald";

interface Soft3DBackgroundProps {
  lightingTheme?: LightingTheme;
}

interface BalloonOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  alpha: number;
  phase: number;
  pulseSpeed: number;
  swayAmp: number;
  color: string;
  hasKnot: boolean;
  depth: "foreground" | "mid" | "ambient";
}

interface GalaxyStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
  twinkleSpeed: number;
  isDiamondStar: boolean;
  color: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  if (clean.length === 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16) || 255,
      g: parseInt(clean.substring(2, 4), 16) || 105,
      b: parseInt(clean.substring(4, 6), 16) || 180,
    };
  }
  return { r: 255, g: 105, b: 180 };
}

/**
 * Living Galaxy & Glass Balloon Canvas
 * - Floating 3D translucent glass balloons with soft specular crescents & gentle buoyancy
 * - Cosmic galaxy stardust with gentle twinkle rhythms and faceted diamond stars
 * - Interactive cursor buoyancy: balloons softly float away when cursor glides near
 * - Zero visual clutter or messy lines - pure luxury celestial ambiance
 */
const LivingGalaxyBalloonCanvas: React.FC<{
  primaryColor: string;
  secondaryColor: string;
}> = ({ primaryColor, secondaryColor }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    const primRgb = hexToRgb(primaryColor);
    const secRgb = hexToRgb(secondaryColor);

    // 1. Generate ~20 Floating 3D Glass Balloons
    const balloonCount = Math.min(22, Math.max(14, Math.floor((width * height) / 48000)));
    const balloons: BalloonOrb[] = [];

    for (let i = 0; i < balloonCount; i++) {
      const isAmbient = i < 4; // Large soft background ambient balloons
      const isForeground = !isAmbient && Math.random() > 0.6;
      const baseRadius = isAmbient
        ? 28 + Math.random() * 14
        : isForeground
        ? 16 + Math.random() * 9
        : 8 + Math.random() * 7;

      balloons.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: isAmbient
          ? -0.09 - Math.random() * 0.12
          : -0.22 - Math.random() * 0.26, // gentle buoyant upward float
        baseRadius,
        alpha: isAmbient
          ? 0.12 + Math.random() * 0.08
          : 0.22 + Math.random() * 0.18,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.012 + Math.random() * 0.016,
        swayAmp: 0.35 + Math.random() * 0.45,
        color: Math.random() > 0.45 ? primaryColor : secondaryColor,
        hasKnot: !isAmbient && Math.random() > 0.35,
        depth: isAmbient ? "ambient" : isForeground ? "foreground" : "mid",
      });
    }

    // 2. Generate ~50 Galaxy Stardust Particles
    const starCount = Math.min(54, Math.max(28, Math.floor((width * height) / 22000)));
    const stars: GalaxyStar[] = [];

    for (let i = 0; i < starCount; i++) {
      const isDiamond = i % 7 === 0;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.06 - Math.random() * 0.12,
        size: isDiamond ? 1.8 + Math.random() * 1.2 : 0.7 + Math.random() * 1.3,
        alpha: 0.25 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.018 + Math.random() * 0.028,
        isDiamondStar: isDiamond,
        color: Math.random() > 0.5 ? primaryColor : secondaryColor,
      });
    }

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseActive = mouseRef.current.active;

      // 🌌 1. Draw Galaxy Stardust Motes
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.phase += s.twinkleSpeed;
        s.x += s.vx;
        s.y += s.vy;

        // Wrap around screen edges
        if (s.y < -10) s.y = height + 10;
        if (s.y > height + 10) s.y = -10;
        if (s.x < -10) s.x = width + 10;
        if (s.x > width + 10) s.x = -10;

        const twinkle = Math.max(0.1, Math.min(0.85, s.alpha + Math.sin(s.phase) * 0.28));

        if (s.isDiamondStar) {
          // Faceted 4-point diamond star
          const starRadius = s.size * 3.2;
          ctx.save();
          ctx.globalAlpha = twinkle;
          ctx.fillStyle = s.color;
          ctx.shadowColor = s.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y - starRadius);
          ctx.lineTo(s.x + starRadius * 0.25, s.y - starRadius * 0.25);
          ctx.lineTo(s.x + starRadius, s.y);
          ctx.lineTo(s.x + starRadius * 0.25, s.y + starRadius * 0.25);
          ctx.lineTo(s.x, s.y + starRadius);
          ctx.lineTo(s.x - starRadius * 0.25, s.y + starRadius * 0.25);
          ctx.lineTo(s.x - starRadius, s.y);
          ctx.lineTo(s.x - starRadius * 0.25, s.y - starRadius * 0.25);
          ctx.closePath();
          ctx.fill();

          // Brilliant white core sparkle
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.arc(s.x, s.y, Math.max(0.6, s.size * 0.5), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          // Micro glowing cosmic dust
          ctx.save();
          ctx.globalAlpha = twinkle;
          ctx.fillStyle = s.color;
          ctx.shadowColor = s.color;
          ctx.shadowBlur = s.size * 2.2;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();

          // White center specular point
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // 🎈 2. Draw Floating 3D Glass Balloons
      for (let i = 0; i < balloons.length; i++) {
        const b = balloons[i];
        b.phase += b.pulseSpeed;

        // Buoyant sway & drift
        b.x += b.vx + Math.sin(b.phase) * b.swayAmp;
        b.y += b.vy;

        // Interactive mouse deflection (like floating balloons in air)
        if (mouseActive) {
          const dx = b.x - mx;
          const dy = b.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repelRadius = b.baseRadius > 25 ? 160 : 120;
          if (dist < repelRadius && dist > 0) {
            const force = (1 - dist / repelRadius) * 0.75;
            b.x += (dx / dist) * force;
            b.y += (dy / dist) * force;
          }
        }

        // Screen boundary wrap-around
        const margin = b.baseRadius * 2 + 10;
        if (b.y < -margin) {
          b.y = height + margin;
          b.x = Math.random() * width;
        } else if (b.y > height + margin) {
          b.y = -margin;
        }
        if (b.x < -margin) {
          b.x = width + margin;
        } else if (b.x > width + margin) {
          b.x = -margin;
        }

        // Breathing size & opacity pulse
        const r = b.baseRadius + Math.sin(b.phase * 1.5) * (b.baseRadius * 0.06);
        const curAlpha = Math.max(0.1, Math.min(0.55, b.alpha + Math.sin(b.phase) * 0.08));

        const rgb = b.color === primaryColor ? primRgb : secRgb;

        ctx.save();
        // 3D Glass Balloon Body (Translucent Radial Gradient)
        const grad = ctx.createRadialGradient(
          b.x - r * 0.32,
          b.y - r * 0.32,
          r * 0.05,
          b.x,
          b.y,
          r
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${(curAlpha * 1.6).toFixed(3)})`);
        grad.addColorStop(0.35, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(curAlpha * 0.55).toFixed(3)})`);
        grad.addColorStop(0.82, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(curAlpha * 0.85).toFixed(3)})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${(curAlpha * 0.7).toFixed(3)})`);

        ctx.fillStyle = grad;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = r * 0.85;
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.fill();

        // 🌟 Specular Glass Gleam (Top-Left Curved Highlight)
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(255, 255, 255, ${(curAlpha * 1.8).toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(
          b.x - r * 0.32,
          b.y - r * 0.35,
          Math.max(1.5, r * 0.35),
          Math.max(0.8, r * 0.18),
          -Math.PI / 4,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Secondary Soft Counter-Reflection (Bottom-Right Rim)
        ctx.fillStyle = `rgba(255, 255, 255, ${(curAlpha * 0.45).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(b.x + r * 0.28, b.y + r * 0.28, Math.max(1, r * 0.16), 0, Math.PI * 2);
        ctx.fill();

        // 🎈 Tiny Balloon Tied Knot at Base
        if (b.hasKnot) {
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(curAlpha * 0.95).toFixed(3)})`;
          ctx.beginPath();
          ctx.ellipse(
            b.x,
            b.y + r + 1.2,
            Math.max(1, r * 0.14),
            Math.max(0.8, r * 0.09),
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [primaryColor, secondaryColor]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.92 }}
    />
  );
};

// 4-point Faceted Diamond Star Sparkle
const DiamondSparkle: React.FC<{
  size: number;
  color: string;
  top: string;
  left: string;
  delay: string;
  duration?: string;
}> = ({ size, color, top, left, delay, duration = "3.2s" }) => (
  <div
    className="absolute pointer-events-none select-none z-0"
    style={{
      top,
      left,
      width: size,
      height: size,
      animation: `glitter-twinkle ${duration} ease-in-out infinite`,
      animationDelay: delay,
    }}
  >
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className="drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
    >
      <path
        d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z"
        fill={color}
      />
      <circle cx="12" cy="12" r="2.2" fill="#FFFFFF" opacity="0.95" />
    </svg>
  </div>
);

// Micro Stardust Shimmer Dot
const ShimmerDust: React.FC<{
  size: number;
  color: string;
  top: string;
  left: string;
  delay: string;
  duration?: string;
}> = ({ size, color, top, left, delay, duration = "2.8s" }) => (
  <div
    className="absolute rounded-full pointer-events-none select-none z-0"
    style={{
      top,
      left,
      width: size,
      height: size,
      backgroundColor: color,
      boxShadow: `0 0 ${size * 2.5}px ${color}, 0 0 ${size * 4}px rgba(255,255,255,0.9)`,
      animation: `glitter-pulse ${duration} ease-in-out infinite`,
      animationDelay: delay,
    }}
  />
);

export const Soft3DBackground: React.FC<Soft3DBackgroundProps> = ({
  lightingTheme = "blush",
}) => {
  // Interactive Ambient Cursor Light Track
  const [mousePos, setMousePos] = useState({ x: 50, y: 35 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 4 Studio-Grade 2026 Material Environments (Exact original user color palette)
  const themes = {
    blush: {
      name: "Rose Quartz & Liquid Glass",
      baseBg: "#FFF1F6",
      radial:
        "radial-gradient(ellipse at 50% 20%, #FFFFFF 0%, #FFF2F7 35%, #FFE5EE 70%, #FFD6E4 100%)",
      caustic1: "rgba(255, 105, 180, 0.16)",
      caustic2: "rgba(251, 113, 133, 0.14)",
      sparkleMain: "#FF6584",
      sparkleSoft: "#FFB6CE",
      glowRing: "rgba(244, 63, 94, 0.12)",
    },
    sunlight: {
      name: "Peach Satin & Warm Clay",
      baseBg: "#FFF8F2",
      radial:
        "radial-gradient(ellipse at 50% 20%, #FFFFFF 0%, #FFF7F0 35%, #FFEDD5 70%, #FED7AA 100%)",
      caustic1: "rgba(249, 115, 22, 0.15)",
      caustic2: "rgba(251, 146, 60, 0.12)",
      sparkleMain: "#FB923C",
      sparkleSoft: "#FED7AA",
      glowRing: "rgba(249, 115, 22, 0.12)",
    },
    lunar: {
      name: "Lavender Obsidian & Starlight",
      baseBg: "#FAF5FF",
      radial:
        "radial-gradient(ellipse at 50% 20%, #FFFFFF 0%, #F9F2FF 35%, #F3E8FF 70%, #E9D5FF 100%)",
      caustic1: "rgba(168, 85, 247, 0.16)",
      caustic2: "rgba(192, 132, 252, 0.13)",
      sparkleMain: "#C084FC",
      sparkleSoft: "#E9D5FF",
      glowRing: "rgba(168, 85, 247, 0.12)",
    },
    emerald: {
      name: "Mint Opal & Cyber Jade",
      baseBg: "#F0FDF8",
      radial:
        "radial-gradient(ellipse at 50% 20%, #FFFFFF 0%, #E6FCF5 35%, #CCFBF1 70%, #A7F3D0 100%)",
      caustic1: "rgba(16, 185, 129, 0.15)",
      caustic2: "rgba(45, 212, 191, 0.12)",
      sparkleMain: "#10B981",
      sparkleSoft: "#6EE7B7",
      glowRing: "rgba(16, 185, 129, 0.12)",
    },
  }[lightingTheme || "blush"];

  return (
    <div
      id="arfa-studio-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden select-none -z-10 transition-colors duration-700 ease-out"
      style={{ backgroundColor: themes.baseBg }}
      aria-hidden="true"
    >
      {/* 1. Luminous Studio Radial Base */}
      <div
        className="absolute inset-0 w-full h-full transition-all duration-700"
        style={{ background: themes.radial }}
      />

      {/* 2. Interactive Ambient Cursor Spotlight (Gently illuminates around mouse cursor) */}
      <div
        className="absolute w-[65vw] h-[60vh] rounded-full blur-3xl pointer-events-none transition-all duration-300 ease-out opacity-70"
        style={{
          background: `radial-gradient(circle, ${themes.glowRing} 0%, transparent 70%)`,
          left: `calc(${mousePos.x}% - 32.5vw)`,
          top: `calc(${mousePos.y}% - 30vh)`,
        }}
      />

      {/* 3. Living Dynamic Atmospheric Aurora Orbs (Bioluminescent, Breathing, Floating Elegantly) */}
      <div
        className="absolute -top-[12%] -left-[5%] w-[58vw] h-[54vh] rounded-full blur-[95px] pointer-events-none transition-all duration-700"
        style={{
          background: themes.caustic1,
          animation: "living-aurora-1 18s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-[16%] -right-[5%] w-[62vw] h-[58vh] rounded-full blur-[105px] pointer-events-none transition-all duration-700"
        style={{
          background: themes.caustic2,
          animation: "living-aurora-2 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-[35%] right-[15%] w-[45vw] h-[40vh] rounded-full blur-[85px] pointer-events-none transition-all duration-700"
        style={{
          background: themes.glowRing,
          animation: "living-aurora-3 26s ease-in-out infinite",
        }}
      />

      {/* 4. Living Galaxy & 3D Glass Balloon Canvas (Alive, Floating, Premium, Non-Overlapping) */}
      <LivingGalaxyBalloonCanvas
        primaryColor={themes.sparkleMain}
        secondaryColor={themes.sparkleSoft}
      />

      {/* 5. ✨ Subtle Stardust Glimmer Points (Deep Edge Periphery - Zero Collision) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Top-Left Sparkles */}
        <DiamondSparkle size={16} color={themes.sparkleMain} top="5%" left="4%" delay="0s" duration="3.2s" />
        <DiamondSparkle size={10} color="#FFFFFF" top="10%" left="8%" delay="1.1s" duration="2.7s" />
        <ShimmerDust size={4} color={themes.sparkleSoft} top="8%" left="6%" delay="0.5s" />

        {/* Top-Right Sparkles */}
        <DiamondSparkle size={16} color={themes.sparkleMain} top="5%" left="94%" delay="0.7s" duration="3.5s" />
        <DiamondSparkle size={10} color="#FFFFFF" top="11%" left="90%" delay="2.0s" duration="2.9s" />
        <ShimmerDust size={4} color={themes.sparkleSoft} top="7%" left="92%" delay="1.3s" />

        {/* Lower Periphery Sparkles */}
        <DiamondSparkle size={12} color={themes.sparkleMain} top="88%" left="4%" delay="2.4s" duration="3.0s" />
        <DiamondSparkle size={12} color="#FFFFFF" top="86%" left="94%" delay="0.6s" duration="3.3s" />
      </div>

      {/* 6. Ultra-Crisp Central Reading Shield (100% Contrast & Text Legibility) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 72% 88% at 50% 50%, rgba(255, 255, 255, 0.76) 0%, rgba(255, 255, 255, 0.22) 65%, transparent 100%)",
        }}
      />
    </div>
  );
};
