import React, { memo } from "react";

export const PastelGlitterBackground: React.FC = memo(() => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      style={{
        backgroundColor: "#FDF9F8",
      }}
    >
      {/* 1. Geometric SVG Layer reproducing the colorful layered facets of the pastel artwork */}
      <svg
        className="absolute inset-0 w-full h-full object-cover"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Vibrant Pastel Gradients */}
          {/* Saturated Rose Quartz / Sparkling Blush */}
          <linearGradient id="gradRoseSparkle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFC5D5" />
            <stop offset="45%" stopColor="#FA8FAE" />
            <stop offset="85%" stopColor="#E6658D" />
            <stop offset="100%" stopColor="#D44975" />
          </linearGradient>

          {/* Saturated Lavender & Lilac Amethyst */}
          <linearGradient id="gradLavenderSparkle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E3D0FD" />
            <stop offset="40%" stopColor="#C49FF8" />
            <stop offset="80%" stopColor="#A875F0" />
            <stop offset="100%" stopColor="#8F54E3" />
          </linearGradient>

          {/* Sparkling Baby Blue to Rose Satin */}
          <linearGradient id="gradBlueToRoseSparkle" x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#8AC6F8" />
            <stop offset="35%" stopColor="#A4B5F5" />
            <stop offset="68%" stopColor="#E39FD6" />
            <stop offset="100%" stopColor="#F98AB4" />
          </linearGradient>

          {/* Radiant Champagne Stardust Gold */}
          <linearGradient id="gradChampagneSparkle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF3E0" />
            <stop offset="45%" stopColor="#FDE0B6" />
            <stop offset="80%" stopColor="#F9C383" />
            <stop offset="100%" stopColor="#EEA351" />
          </linearGradient>

          {/* Sparkling Mint / Aqua Lagoon */}
          <linearGradient id="gradMintSparkle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A8F8E5" />
            <stop offset="45%" stopColor="#5FE3C2" />
            <stop offset="85%" stopColor="#2BC29C" />
            <stop offset="100%" stopColor="#179F7C" />
          </linearGradient>

          {/* Electric Periwinkle Orchid */}
          <linearGradient id="gradPeriwinkleOrchid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B3DCFB" />
            <stop offset="40%" stopColor="#A6B5F7" />
            <stop offset="80%" stopColor="#DC9AF5" />
            <stop offset="100%" stopColor="#F68CC9" />
          </linearGradient>

          {/* Facet Edge Highlights */}
          <linearGradient id="gradPrismGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="50%" stopColor="rgba(255,235,180,0.8)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.9)" />
          </linearGradient>

          {/* Realistic 3D Facet Shadows */}
          <filter id="facetShadowDeep" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="-10" dy="14" stdDeviation="18" floodColor="#3F1235" floodOpacity="0.22" />
          </filter>
          <filter id="facetShadowMed" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="8" dy="12" stdDeviation="14" floodColor="#3B1238" floodOpacity="0.18" />
          </filter>
          <filter id="facetShadowSoft" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="-4" dy="8" stdDeviation="10" floodColor="#220B23" floodOpacity="0.15" />
          </filter>

          {/* High-Density Sparkling Glitter Patterns */}
          {/* Glitter Grid: Golden & Diamond Stardust */}
          <pattern id="glitterStardustGold" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="15" cy="18" r="1.8" fill="#FFFFFF" />
            <circle cx="28" cy="12" r="1.1" fill="#FFF4B8" />
            <circle cx="48" cy="24" r="2.2" fill="#FFFFFF" />
            <circle cx="72" cy="14" r="1.2" fill="#FFE885" />
            <circle cx="90" cy="30" r="1.6" fill="#FFFFFF" />
            <circle cx="18" cy="45" r="1.4" fill="#FFFCE6" />
            <circle cx="36" cy="52" r="2.4" fill="#FFFFFF" />
            <circle cx="62" cy="40" r="1.1" fill="#FFEDB3" />
            <circle cx="82" cy="58" r="1.9" fill="#FFFFFF" />
            <circle cx="8" cy="74" r="2.0" fill="#FFFFFF" />
            <circle cx="28" cy="85" r="1.2" fill="#FFE394" />
            <circle cx="52" cy="76" r="1.7" fill="#FFFFFF" />
            <circle cx="75" cy="88" r="1.3" fill="#FFF9D6" />
            <circle cx="95" cy="70" r="2.1" fill="#FFFFFF" />
            <circle cx="42" cy="6" r="1.0" fill="#FFFFFF" />
            <circle cx="66" cy="68" r="1.5" fill="#FFEBA8" />
          </pattern>

          {/* Glitter Grid: Rose & Lilac Diamond Shimmer */}
          <pattern id="glitterStardustRose" width="90" height="90" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="16" r="1.7" fill="#FFFFFF" />
            <circle cx="32" cy="28" r="1.1" fill="#FFD5E5" />
            <circle cx="54" cy="18" r="2.3" fill="#FFFFFF" />
            <circle cx="78" cy="32" r="1.3" fill="#FFE0EF" />
            <circle cx="20" cy="58" r="1.5" fill="#FFFFFF" />
            <circle cx="44" cy="46" r="2.1" fill="#FFFFFF" />
            <circle cx="68" cy="62" r="1.2" fill="#FFD6EA" />
            <circle cx="88" cy="50" r="1.8" fill="#FFFFFF" />
            <circle cx="16" cy="82" r="1.1" fill="#FFEAF4" />
            <circle cx="38" cy="78" r="2.0" fill="#FFFFFF" />
            <circle cx="64" cy="86" r="1.4" fill="#FFFFFF" />
            <circle cx="84" cy="82" r="2.2" fill="#FFE2F2" />
          </pattern>

          {/* Glitter Grid: Mint Aqua Crystal */}
          <pattern id="glitterStardustMint" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="14" cy="18" r="1.9" fill="#FFFFFF" />
            <circle cx="35" cy="22" r="1.2" fill="#D2FFF3" />
            <circle cx="58" cy="14" r="2.1" fill="#FFFFFF" />
            <circle cx="74" cy="30" r="1.4" fill="#B8FFED" />
            <circle cx="22" cy="48" r="2.2" fill="#FFFFFF" />
            <circle cx="46" cy="55" r="1.1" fill="#D9FFF6" />
            <circle cx="68" cy="42" r="1.6" fill="#FFFFFF" />
            <circle cx="30" cy="72" r="1.4" fill="#C2FFEF" />
            <circle cx="58" cy="70" r="2.0" fill="#FFFFFF" />
            <circle cx="80" cy="65" r="1.2" fill="#FFFFFF" />
          </pattern>
        </defs>

        {/* --- 1. BASE BACKDROP (Warm Golden Champagne Velvet) --- */}
        <rect width="1440" height="900" fill="url(#gradChampagneSparkle)" />
        <rect width="1440" height="900" fill="url(#glitterStardustGold)" opacity="0.65" />

        {/* --- 2. VIBRANT GEOMETRIC FACETS --- */}

        {/* Facet A: Top-Left Radiant Lavender Lilac */}
        <polygon
          points="0,0 420,0 240,360 0,260"
          fill="url(#gradLavenderSparkle)"
          filter="url(#facetShadowMed)"
        />
        <polygon
          points="0,0 420,0 240,360 0,260"
          fill="url(#glitterStardustRose)"
          opacity="0.95"
        />

        {/* Facet B: Mid-Left Saturated Rose Pink */}
        <polygon
          points="0,260 240,360 410,760 0,680"
          fill="url(#gradRoseSparkle)"
          filter="url(#facetShadowDeep)"
        />
        <polygon
          points="0,260 240,360 410,760 0,680"
          fill="url(#glitterStardustRose)"
          opacity="0.9"
        />

        {/* Facet C: Bottom-Left Deep Violet Lavender */}
        <polygon
          points="0,680 410,760 340,900 0,900"
          fill="url(#gradLavenderSparkle)"
          filter="url(#facetShadowMed)"
        />
        <polygon
          points="0,680 410,760 340,900 0,900"
          fill="url(#glitterStardustGold)"
          opacity="0.85"
        />

        {/* Facet D: Top-Center Champagne Gold Wedge */}
        <polygon
          points="420,0 780,0 470,300 240,360"
          fill="url(#gradChampagneSparkle)"
          filter="url(#facetShadowSoft)"
        />
        <polygon
          points="420,0 780,0 470,300 240,360"
          fill="url(#glitterStardustGold)"
          opacity="0.8"
        />

        {/* Facet E: Big Vibrant Central Band (Baby Blue to Rose Pink) */}
        <polygon
          points="410,200 780,0 780,900 410,900"
          fill="url(#gradBlueToRoseSparkle)"
          filter="url(#facetShadowDeep)"
        />
        <polygon
          points="410,200 780,0 780,900 410,900"
          fill="url(#glitterStardustRose)"
          opacity="0.85"
        />

        {/* Facet F: Mid-Right Periwinkle to Electric Orchid */}
        <polygon
          points="780,0 1120,0 1120,900 780,900"
          fill="url(#gradPeriwinkleOrchid)"
          filter="url(#facetShadowDeep)"
        />
        <polygon
          points="780,0 1120,0 1120,900 780,900"
          fill="url(#glitterStardustRose)"
          opacity="0.9"
        />

        {/* Facet G: Top-Right Saturated Rose Panel */}
        <polygon
          points="1120,0 1440,0 1440,400 1120,260"
          fill="url(#gradRoseSparkle)"
          filter="url(#facetShadowSoft)"
        />
        <polygon
          points="1120,0 1440,0 1440,400 1120,260"
          fill="url(#glitterStardustRose)"
          opacity="0.85"
        />

        {/* Facet H: Right Vertical Lavender Amethyst Panel */}
        <polygon
          points="1120,260 1440,400 1440,800 1120,700"
          fill="url(#gradLavenderSparkle)"
          filter="url(#facetShadowDeep)"
        />
        <polygon
          points="1120,260 1440,400 1440,800 1120,700"
          fill="url(#glitterStardustRose)"
          opacity="0.95"
        />

        {/* Facet I: Bottom-Right Vivid Rose Quartz */}
        <polygon
          points="1120,700 1440,800 1440,900 1220,900"
          fill="url(#gradRoseSparkle)"
          filter="url(#facetShadowSoft)"
        />
        <polygon
          points="1120,700 1440,800 1440,900 1220,900"
          fill="url(#glitterStardustGold)"
          opacity="0.85"
        />

        {/* Facet J: Bottom-Center Sparkling Mint Aqua Wedge */}
        <polygon
          points="780,760 1220,900 780,900"
          fill="url(#gradMintSparkle)"
          filter="url(#facetShadowDeep)"
        />
        <polygon
          points="780,760 1220,900 780,900"
          fill="url(#glitterStardustMint)"
          opacity="0.95"
        />

        {/* Brilliant Crystalline Prism Light Lines */}
        <line x1="240" y1="360" x2="410" y2="760" stroke="url(#gradPrismGlow)" strokeWidth="2" />
        <line x1="420" y1="0" x2="240" y2="360" stroke="url(#gradPrismGlow)" strokeWidth="2.5" />
        <line x1="780" y1="0" x2="780" y2="900" stroke="url(#gradPrismGlow)" strokeWidth="2" />
        <line x1="1120" y1="0" x2="1120" y2="900" stroke="url(#gradPrismGlow)" strokeWidth="2" />
        <line x1="1120" y1="260" x2="1440" y2="400" stroke="url(#gradPrismGlow)" strokeWidth="2.2" />
        <line x1="780" y1="760" x2="1220" y2="900" stroke="url(#gradPrismGlow)" strokeWidth="2.5" />

        {/* --- 3. PROMINENT ANIMATED TWINKLE SPARKLE STARS (✦) --- */}
        {/* Star 1: Top Left */}
        <path
          d="M 120,80 Q 120,95 135,95 Q 120,95 120,110 Q 120,95 105,95 Q 120,95 120,80 Z"
          fill="#FFFFFF"
          className="animate-pulse"
        />
        <circle cx="120" cy="95" r="3" fill="#FFFCE6" />

        {/* Star 2: Top Center Left */}
        <path
          d="M 310,120 Q 310,132 322,132 Q 310,132 310,144 Q 310,132 298,132 Q 310,132 310,120 Z"
          fill="#FFFFFF"
        />

        {/* Star 3: Mid Left Rose Facet */}
        <path
          d="M 150,450 Q 150,470 170,470 Q 150,470 150,490 Q 150,470 130,470 Q 150,470 150,450 Z"
          fill="#FFFFFF"
          className="animate-pulse"
        />
        <circle cx="150" cy="470" r="4" fill="#FFE2EC" />

        {/* Star 4: Bottom Left */}
        <path
          d="M 80,780 Q 80,795 95,795 Q 80,795 80,810 Q 80,795 65,795 Q 80,795 80,780 Z"
          fill="#FFFFFF"
        />

        {/* Star 5: Top Right */}
        <path
          d="M 1280,100 Q 1280,118 1298,118 Q 1280,118 1280,136 Q 1280,118 1262,118 Q 1280,118 1280,100 Z"
          fill="#FFFFFF"
          className="animate-pulse"
        />
        <circle cx="1280" cy="118" r="3.5" fill="#FFF4BD" />

        {/* Star 6: Mid Right Lavender */}
        <path
          d="M 1320,520 Q 1320,538 1338,538 Q 1320,538 1320,556 Q 1320,538 1302,538 Q 1320,538 1320,520 Z"
          fill="#FFFFFF"
        />

        {/* Star 7: Center Right Orchid */}
        <path
          d="M 940,320 Q 940,336 956,336 Q 940,336 940,352 Q 940,336 924,336 Q 940,336 940,320 Z"
          fill="#FFFFFF"
          className="animate-pulse"
        />

        {/* Star 8: Bottom Mint Facet */}
        <path
          d="M 920,830 Q 920,845 935,845 Q 920,845 920,860 Q 920,845 905,845 Q 920,845 920,830 Z"
          fill="#FFFFFF"
          className="animate-pulse"
        />
        <circle cx="920" cy="845" r="3" fill="#D4FFF5" />

        {/* Star 9: Near Top Center */}
        <path
          d="M 640,60 Q 640,72 652,72 Q 640,72 640,84 Q 640,72 628,72 Q 640,72 640,60 Z"
          fill="#FFFFFF"
        />

        {/* Star 10: Near Bottom Center */}
        <path
          d="M 580,820 Q 580,834 594,834 Q 580,834 580,848 Q 580,834 566,834 Q 580,834 580,820 Z"
          fill="#FFFFFF"
          className="animate-pulse"
        />
      </svg>

      {/* 2. Floating Luminous Ambient Color Orbs */}
      {/* Top Left Rose Halo */}
      <div className="absolute -top-12 -left-12 w-[520px] h-[480px] bg-gradient-to-br from-[#FF96B6]/40 via-[#D69CF8]/25 to-transparent blur-3xl pointer-events-none" />
      {/* Top Right Gold & Lavender Halo */}
      <div className="absolute -top-12 -right-12 w-[550px] h-[460px] bg-gradient-to-bl from-[#FFC278]/40 via-[#F39AF8]/30 to-transparent blur-3xl pointer-events-none" />
      {/* Bottom Left Electric Violet Halo */}
      <div className="absolute -bottom-16 -left-16 w-[520px] h-[500px] bg-gradient-to-tr from-[#9AB4FB]/35 via-[#FF92BA]/30 to-transparent blur-3xl pointer-events-none" />
      {/* Bottom Right Sparkling Mint Halo */}
      <div className="absolute -bottom-16 -right-16 w-[560px] h-[500px] bg-gradient-to-tl from-[#50ECC6]/40 via-[#FCA1C5]/30 to-transparent blur-3xl pointer-events-none" />

      {/* 3. Ultra-Sheer Clarifying Center Layer: Leaves background rich & colorful while maintaining crystal-clear text readability */}
      <div
        className="absolute inset-0 bg-white/10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 60%, rgba(0,0,0,0.04) 100%)",
        }}
      />
    </div>
  );
});

PastelGlitterBackground.displayName = "PastelGlitterBackground";
