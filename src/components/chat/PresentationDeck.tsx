import React, { useState, useEffect, useCallback } from "react";
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Download,
  LayoutGrid,
  Tv,
  FileText,
  Sparkles,
  Share2,
} from "lucide-react";
import type { PresentationDeckData, PresentationSlide } from "../../types.ts";

interface PresentationDeckProps {
  presentation: PresentationDeckData;
}

type ThemeType = "midnight" | "rose" | "emerald" | "ivory";

export const PresentationDeck: React.FC<PresentationDeckProps> = ({ presentation }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<ThemeType>(
    (presentation.theme as ThemeType) || "midnight"
  );

  const slides = presentation.slides || [];
  const currentSlide: PresentationSlide | undefined = slides[currentSlideIndex];
  const isUrdu =
    presentation.language === "ur" ||
    /[\u0600-\u06FF]/.test(presentation.title) ||
    /[\u0600-\u06FF]/.test(currentSlide?.title || "");

  const handleNext = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  }, [slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, isFullscreen]);

  const handleCopyMarkdown = async () => {
    let md = `# ${presentation.title}\n**Topic:** ${presentation.topic}\n\n---\n\n`;
    slides.forEach((slide, idx) => {
      md += `## Slide ${idx + 1}: ${slide.title}\n`;
      if (slide.subtitle) md += `*${slide.subtitle}*\n\n`;
      slide.bulletPoints.forEach((pt) => {
        md += `- ${pt}\n`;
      });
      if (slide.metric) {
        md += `\n> **Key Metric:** ${slide.metric.value} — ${slide.metric.label}\n`;
      }
      if (slide.speakerNotes) {
        md += `\n*Speaker Notes:* ${slide.speakerNotes}\n`;
      }
      md += `\n---\n\n`;
    });

    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy presentation markdown:", err);
    }
  };

  const handleDownloadHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="${isUrdu ? "ur" : "en"}" dir="${isUrdu ? "rtl" : "ltr"}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${presentation.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
    body { font-family: ${isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Plus Jakarta Sans', sans-serif"}; background: #0c0f17; color: #f8fafc; margin: 0; }
    .slide { display: none; }
    .slide.active { display: flex; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between p-6 md:p-12">
  <header class="flex justify-between items-center pb-6 border-b border-white/10">
    <div>
      <span class="text-xs uppercase tracking-widest text-amber-400 font-semibold">ARFA Executive Presentation</span>
      <h1 class="text-xl md:text-2xl font-bold">${presentation.title}</h1>
    </div>
    <div id="slideCounter" class="text-sm text-slate-400 font-mono">1 / ${slides.length}</div>
  </header>

  <main class="my-auto max-w-4xl mx-auto w-full py-8">
    ${slides
      .map(
        (s, idx) => `
      <div class="slide ${idx === 0 ? "active" : ""} flex-col gap-6" id="slide-${idx}">
        ${s.badge ? `<span class="self-start px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">${s.badge}</span>` : ""}
        <h2 class="text-3xl md:text-5xl font-extrabold tracking-tight">${s.title}</h2>
        ${s.subtitle ? `<p class="text-lg md:text-xl text-slate-400">${s.subtitle}</p>` : ""}
        
        <div class="grid md:grid-cols-2 gap-4 mt-6">
          <ul class="space-y-3">
            ${s.bulletPoints.map((pt) => `<li class="flex items-start gap-3 text-base text-slate-200"><span class="text-amber-400 mt-1">✦</span><span>${pt}</span></li>`).join("")}
          </ul>
          ${
            s.metric
              ? `<div class="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                   <div class="text-4xl md:text-6xl font-black text-amber-400">${s.metric.value}</div>
                   <div class="text-sm uppercase tracking-wider text-slate-300 mt-2 font-semibold">${s.metric.label}</div>
                 </div>`
              : ""
          }
        </div>
      </div>
    `
      )
      .join("")}
  </main>

  <footer class="flex justify-between items-center pt-6 border-t border-white/10 text-xs text-slate-400">
    <div>Use Arrow Keys (← / →) or Spacebar to navigate</div>
    <div class="flex gap-2">
      <button onclick="prevSlide()" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium">Previous</button>
      <button onclick="nextSlide()" class="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">Next</button>
    </div>
  </footer>

  <script>
    let current = 0;
    const total = ${slides.length};
    function showSlide(idx) {
      document.querySelectorAll('.slide').forEach((el, i) => {
        el.classList.toggle('active', i === idx);
      });
      document.getElementById('slideCounter').innerText = (idx + 1) + ' / ' + total;
      current = idx;
    }
    function nextSlide() { showSlide((current + 1) % total); }
    function prevSlide() { showSlide((current - 1 + total) % total); }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextSlide(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide(); }
    });
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${presentation.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-deck.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getThemeClasses = () => {
    switch (theme) {
      case "rose":
        return {
          container: "bg-[#1E1116] border-[#3B1F2D] text-[#FFF0F5]",
          badge: "bg-[#D84A70]/20 border-[#D84A70]/40 text-[#FFAEC3]",
          accent: "text-[#FF80A2]",
          card: "bg-white/5 border-white/10",
          metricBox: "bg-[#2D1621] border-[#D84A70]/30 text-[#FFAEC3]",
          buttonActive: "bg-[#D84A70] text-white",
        };
      case "emerald":
        return {
          container: "bg-[#0B1A16] border-[#16362C] text-[#E6FAF2]",
          badge: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
          accent: "text-emerald-400",
          card: "bg-white/5 border-white/10",
          metricBox: "bg-[#122A22] border-emerald-500/30 text-emerald-300",
          buttonActive: "bg-emerald-600 text-white",
        };
      case "ivory":
        return {
          container: "bg-[#FBF9F6] border-[#E8E2D9] text-[#1F1E1D]",
          badge: "bg-[#8C7A6B]/15 border-[#8C7A6B]/30 text-[#5C4F43]",
          accent: "text-[#8C7A6B]",
          card: "bg-white border-[#E8E2D9] shadow-xs",
          metricBox: "bg-[#F3EFE9] border-[#D6CEC4] text-[#1F1E1D]",
          buttonActive: "bg-[#3D3732] text-white",
        };
      case "midnight":
      default:
        return {
          container: "bg-[#0D1117] border-[#21262D] text-[#F0F6FC]",
          badge: "bg-amber-400/15 border-amber-400/30 text-amber-300",
          accent: "text-amber-400",
          card: "bg-white/5 border-white/10",
          metricBox: "bg-[#161B22] border-amber-400/30 text-amber-300",
          buttonActive: "bg-amber-500 text-slate-950 font-bold",
        };
    }
  };

  const currentTheme = getThemeClasses();

  if (!slides || slides.length === 0) return null;

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all shadow-xl my-4 ${
        currentTheme.container
      } ${
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none border-none p-6 md:p-12 flex flex-col justify-between"
          : "w-full"
      } ${isUrdu ? "font-serif" : ""}`}
      dir={isUrdu ? "rtl" : "ltr"}
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-current/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold tracking-wide">
            <Presentation className={`w-4 h-4 ${currentTheme.accent}`} />
            <span>{presentation.title}</span>
          </div>
          {isUrdu && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              اردو پریزنٹیشن
            </span>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5">
          {/* Theme Switcher */}
          <div className="flex items-center gap-1 bg-current/5 p-0.5 rounded-lg border border-current/10">
            {(["midnight", "rose", "emerald", "ivory"] as ThemeType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                title={`Theme: ${t}`}
                className={`w-3.5 h-3.5 rounded-full transition-transform ${
                  theme === t ? "scale-125 ring-2 ring-current" : "opacity-60 hover:opacity-100"
                } ${
                  t === "midnight"
                    ? "bg-slate-900"
                    : t === "rose"
                    ? "bg-pink-600"
                    : t === "emerald"
                    ? "bg-emerald-600"
                    : "bg-stone-200"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowOverview(!showOverview)}
            title={showOverview ? "Slide view" : "Overview grid"}
            className="p-1.5 rounded-md hover:bg-current/10 transition-colors cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            title={copied ? "Copied Markdown" : "Copy as Markdown"}
            className="p-1.5 rounded-md hover:bg-current/10 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleDownloadHtml}
            title="Download Standalone HTML Presentation"
            className="p-1.5 rounded-md hover:bg-current/10 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Presentation"}
            className="p-1.5 rounded-md hover:bg-current/10 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Slide Stage */}
      {showOverview ? (
        /* Overview Grid View */
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
          {slides.map((s, idx) => (
            <div
              key={s.id || idx}
              onClick={() => {
                setCurrentSlideIndex(idx);
                setShowOverview(false);
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                idx === currentSlideIndex ? "ring-2 ring-amber-400" : "opacity-80 hover:opacity-100"
              } ${currentTheme.card}`}
            >
              <div className="flex justify-between items-center text-xs mb-2 opacity-70 font-mono">
                <span>SLIDE {idx + 1}</span>
                {s.badge && <span className="px-2 py-0.5 rounded bg-white/10">{s.badge}</span>}
              </div>
              <h3 className="font-bold text-base mb-1 truncate">{s.title}</h3>
              {s.subtitle && <p className="text-xs opacity-75 mb-2 truncate">{s.subtitle}</p>}
              <div className="text-xs opacity-60 line-clamp-2">
                {s.bulletPoints.slice(0, 2).join(" · ")}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Single Slide Active Stage */
        <div className="p-6 md:p-10 flex flex-col justify-between min-h-[360px] md:min-h-[420px]">
          <div>
            {/* Badge & Category */}
            {currentSlide?.badge && (
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide border mb-4 ${currentTheme.badge}`}
              >
                {currentSlide.badge}
              </span>
            )}

            {/* Slide Title */}
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-snug mb-2">
              {currentSlide?.title}
            </h2>

            {/* Subtitle */}
            {currentSlide?.subtitle && (
              <p className="text-base md:text-lg opacity-80 mb-6 font-medium">
                {currentSlide.subtitle}
              </p>
            )}

            {/* Slide Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mt-4">
              {/* Bullet Points */}
              <div className={currentSlide?.metric ? "md:col-span-8" : "md:col-span-12"}>
                <ul className="space-y-3.5">
                  {currentSlide?.bulletPoints.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-3 text-sm md:text-base leading-relaxed">
                      <span className={`mt-1 font-bold text-sm ${currentTheme.accent}`}>✦</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Metric Card if present */}
              {currentSlide?.metric && (
                <div
                  className={`md:col-span-4 p-5 rounded-2xl border text-center flex flex-col justify-center items-center shadow-inner ${currentTheme.metricBox}`}
                >
                  <div className="text-3xl md:text-5xl font-black tracking-tight">
                    {currentSlide.metric.value}
                  </div>
                  <div className="text-xs uppercase tracking-wider font-semibold opacity-90 mt-1.5">
                    {currentSlide.metric.label}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Speaker Notes Drawer */}
          {currentSlide?.speakerNotes && (
            <div className="mt-6 pt-4 border-t border-current/10">
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center gap-1.5 text-xs opacity-70 hover:opacity-100 transition-opacity font-medium cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{showNotes ? "Hide Speaker Notes" : "Show Speaker Notes"}</span>
              </button>
              {showNotes && (
                <p className="mt-2 text-xs italic opacity-80 bg-current/5 p-3 rounded-lg border border-current/10">
                  {currentSlide.speakerNotes}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation Controls & Progress */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-current/10 text-xs">
        {/* Progress pills */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-1.5 transition-all rounded-full ${
                idx === currentSlideIndex
                  ? "w-6 bg-current"
                  : "w-2 bg-current/25 hover:bg-current/50"
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
          <span className="ml-2 font-mono text-[11px] opacity-70">
            {currentSlideIndex + 1} / {slides.length}
          </span>
        </div>

        {/* Previous / Next Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-current/15 hover:bg-current/10 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>
          <button
            type="button"
            onClick={handleNext}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${currentTheme.buttonActive}`}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
