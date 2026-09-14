import React, { memo } from "react";

export const GalaxyGlitterBackground: React.FC = memo(() => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      style={{
        backgroundColor: "#030107",
      }}
    >
      {/* 1. Deep Cosmic Void Base */}
      <div className="absolute inset-0 bg-[#030107]" />

      {/* 2. LIVING MOVING SPIRAL GALAXY 1 (Primary Rotating Majestic Spiral Core) */}
      <div className="absolute top-[18%] left-[62%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] md:w-[950px] md:h-[950px] pointer-events-none opacity-75 mix-blend-screen animate-galaxy-spin">
        <svg
          viewBox="0 0 800 800"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="spiralCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="12%" stopColor="#FDE047" stopOpacity="0.8" />
              <stop offset="28%" stopColor="#F472B6" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#9333EA" stopOpacity="0.3" />
              <stop offset="78%" stopColor="#3B82F6" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="spiralArm1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" stopOpacity="0.6" />
              <stop offset="40%" stopColor="#A855F7" stopOpacity="0.4" />
              <stop offset="75%" stopColor="#38BDF8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="spiralArm2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.65" />
              <stop offset="45%" stopColor="#D946EF" stopOpacity="0.4" />
              <stop offset="80%" stopColor="#6366F1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>

            <filter id="cosmicBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="12" />
            </filter>
          </defs>

          {/* Galaxy Luminous Nucleus */}
          <circle cx="400" cy="400" r="140" fill="url(#spiralCoreGlow)" filter="url(#cosmicBlur)" />
          <circle cx="400" cy="400" r="45" fill="#FFFFFF" opacity="0.95" filter="url(#cosmicBlur)" />

          {/* Swirling Spiral Arm Alpha */}
          <path
            d="M 400,400 
               Q 480,340 560,370 
               T 680,470 
               T 650,620 
               T 480,710 
               T 300,680"
            fill="none"
            stroke="url(#spiralArm1)"
            strokeWidth="55"
            strokeLinecap="round"
            filter="url(#cosmicBlur)"
            opacity="0.8"
          />

          {/* Swirling Spiral Arm Beta */}
          <path
            d="M 400,400 
               Q 320,460 240,430 
               T 120,330 
               T 150,180 
               T 320,90 
               T 500,120"
            fill="none"
            stroke="url(#spiralArm2)"
            strokeWidth="50"
            strokeLinecap="round"
            filter="url(#cosmicBlur)"
            opacity="0.75"
          />

          {/* Inner Swirl Filaments */}
          <path
            d="M 400,400 Q 450,380 490,420 T 470,510 T 380,520 T 320,440"
            fill="none"
            stroke="#FDE047"
            strokeWidth="24"
            strokeLinecap="round"
            filter="url(#cosmicBlur)"
            opacity="0.6"
          />

          {/* Star Clusters along the arms */}
          <circle cx="560" cy="380" r="3.5" fill="#FFFFFF" opacity="0.95" />
          <circle cx="620" cy="450" r="2.8" fill="#FDE047" opacity="0.9" />
          <circle cx="480" cy="650" r="3.2" fill="#BAE6FD" opacity="0.95" />
          <circle cx="230" cy="420" r="3.5" fill="#FFFFFF" opacity="0.95" />
          <circle cx="160" cy="270" r="2.5" fill="#F472B6" opacity="0.9" />
          <circle cx="340" cy="110" r="3" fill="#FFFFFF" opacity="0.95" />
        </svg>
      </div>

      {/* 3. LIVING MOVING ELLIPTICAL GALAXY 2 (Secondary Drifting Distant Galaxy) */}
      <div className="absolute top-[68%] left-[18%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] md:w-[700px] md:h-[480px] pointer-events-none opacity-60 mix-blend-screen animate-galaxy-drift">
        <svg
          viewBox="0 0 600 400"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="ellipticalCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="20%" stopColor="#38BDF8" stopOpacity="0.65" />
              <stop offset="48%" stopColor="#818CF8" stopOpacity="0.4" />
              <stop offset="75%" stopColor="#4F46E5" stopOpacity="0.15" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="ellipticalDisk" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#A855F7" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Angled Elliptical Galaxy Body */}
          <g transform="rotate(-32 300 200)">
            <ellipse cx="300" cy="200" rx="260" ry="70" fill="url(#ellipticalDisk)" filter="url(#cosmicBlur)" />
            <ellipse cx="300" cy="200" rx="140" ry="40" fill="url(#ellipticalCore)" filter="url(#cosmicBlur)" />
            <circle cx="300" cy="200" r="18" fill="#FFFFFF" opacity="0.9" />
          </g>
        </svg>
      </div>

      {/* 4. LIVING INTERSTELLAR COSMIC NEBULAR CLOUDS (Organic Breathing Waves) */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] rounded-full pointer-events-none opacity-30 blur-[120px] mix-blend-screen"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(236, 72, 153, 0.28) 0%, rgba(168, 85, 247, 0.22) 40%, rgba(56, 189, 248, 0.12) 70%, transparent 85%)",
          animation: "cosmicAuraBreathe 16s ease-in-out infinite alternate",
        }}
      />

      {/* 5. PASSING SHOOTING STARS / METEOR TRAILS */}
      <div className="meteor-streak-1" />
      <div className="meteor-streak-2" />

      {/* 6. TWINKLING CELESTIAL STARS (Curated, Deep Space Shimmer) */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { x: "8%", y: "12%", size: 14, dur: "3.2s", delay: "0s", color: "#FFFFFF", glow: "rgba(254, 240, 138, 0.8)" },
          { x: "24%", y: "8%", size: 12, dur: "4.1s", delay: "1.2s", color: "#BAE6FD", glow: "rgba(56, 189, 248, 0.8)" },
          { x: "46%", y: "15%", size: 16, dur: "3.5s", delay: "0.5s", color: "#FFFFFF", glow: "rgba(244, 114, 182, 0.85)" },
          { x: "78%", y: "10%", size: 13, dur: "3.8s", delay: "2.1s", color: "#FEF08A", glow: "rgba(245, 158, 11, 0.8)" },
          { x: "92%", y: "18%", size: 15, dur: "2.9s", delay: "0.8s", color: "#FFFFFF", glow: "rgba(168, 85, 247, 0.85)" },

          { x: "5%", y: "45%", size: 13, dur: "3.9s", delay: "1.5s", color: "#BAE6FD", glow: "rgba(14, 165, 233, 0.8)" },
          { x: "94%", y: "52%", size: 15, dur: "3.3s", delay: "0.3s", color: "#FFFFFF", glow: "rgba(236, 72, 153, 0.85)" },
          { x: "12%", y: "82%", size: 14, dur: "4.0s", delay: "1.9s", color: "#FEF08A", glow: "rgba(245, 158, 11, 0.8)" },
          { x: "82%", y: "88%", size: 13, dur: "3.6s", delay: "0.7s", color: "#FFFFFF", glow: "rgba(192, 132, 252, 0.85)" },
        ].map((star, idx) => (
          <div
            key={`star-${idx}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: star.x,
              top: star.y,
              animation: `galaxyStarTwinkle ${star.dur} ease-in-out infinite`,
              animationDelay: star.delay,
            }}
          >
            <svg
              width={star.size}
              height={star.size}
              viewBox="0 0 24 24"
              fill="none"
              style={{
                filter: `drop-shadow(0 0 6px ${star.glow})`,
              }}
            >
              <path
                d="M 12,0 Q 12,12 24,12 Q 12,12 12,24 Q 12,12 0,12 Q 12,12 12,0 Z"
                fill={star.color}
              />
              <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
            </svg>
          </div>
        ))}
      </div>

      {/* Animations for Galaxy Rotation and Breathing */}
      <style>{`
        @keyframes galaxySpin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        .animate-galaxy-spin {
          animation: galaxySpin 90s linear infinite;
          will-change: transform;
        }

        @keyframes galaxyDrift {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(0.95);
          }
          50% {
            transform: translate(-46%, -53%) rotate(8deg) scale(1.04);
          }
          100% {
            transform: translate(-50%, -50%) rotate(0deg) scale(0.95);
          }
        }
        .animate-galaxy-drift {
          animation: galaxyDrift 36s ease-in-out infinite alternate;
          will-change: transform;
        }

        @keyframes cosmicAuraBreathe {
          0% {
            transform: translate(-50%, 0) scale(0.92);
            opacity: 0.22;
          }
          100% {
            transform: translate(-50%, -24px) scale(1.08);
            opacity: 0.38;
          }
        }

        @keyframes galaxyStarTwinkle {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.8) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.25) rotate(45deg);
          }
        }

        .meteor-streak-1 {
          position: absolute;
          top: 18%;
          left: -160px;
          width: 150px;
          height: 1.5px;
          background: linear-gradient(90deg, transparent, rgba(254, 240, 138, 0.85), #FFFFFF);
          transform: rotate(-25deg);
          box-shadow: 0 0 10px rgba(251, 191, 36, 0.85);
          animation: meteorFlight 14s ease-in-out infinite;
          opacity: 0;
          pointer-events: none;
        }

        .meteor-streak-2 {
          position: absolute;
          top: 50%;
          left: -190px;
          width: 190px;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(244, 114, 182, 0.9), #FFFFFF);
          transform: rotate(-28deg);
          box-shadow: 0 0 12px rgba(244, 63, 94, 0.9);
          animation: meteorFlight 18s ease-in-out infinite 7s;
          opacity: 0;
          pointer-events: none;
        }

        @keyframes meteorFlight {
          0% {
            transform: translate(0, 0) rotate(-25deg);
            opacity: 0;
          }
          3% {
            opacity: 1;
          }
          8% {
            transform: translate(120vw, 60vh) rotate(-25deg);
            opacity: 0;
          }
          100% {
            transform: translate(120vw, 60vh) rotate(-25deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
});

GalaxyGlitterBackground.displayName = "GalaxyGlitterBackground";
