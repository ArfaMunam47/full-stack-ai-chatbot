import React from "react";
import { ArfaLogo } from "../ui/ArfaLogo.tsx";
import { Sparkles, Terminal, ShieldCheck, ArrowRight, Brain, Zap, Layers } from "lucide-react";

interface LandingViewProps {
  onStartChat: () => void;
  onOpenSettings: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStartChat, onOpenSettings }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#FFF9F9] dark:bg-[#161213] text-[#2D2626] dark:text-[#F9F4F4]">
      {/* Navigation */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-[#1E1819]/80 border-b border-[#F5E1E1] dark:border-[#35292B] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <ArfaLogo size="md" />
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="text-xs sm:text-sm font-medium text-[#8E8787] hover:text-[#2D2626] dark:hover:text-[#F9F4F4] px-3 py-1.5 rounded-xl hover:bg-[#FFF5F5] dark:hover:bg-[#261F21] transition-colors"
          >
            Arfa Knowledge
          </button>
          <button
            id="landing-start-chat-nav"
            onClick={onStartChat}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#D17A7A] hover:bg-[#c26d6d] dark:bg-[#E28E8E] dark:text-[#1E1819] dark:hover:bg-[#d67e7e] transition-colors shadow-2xs"
          >
            <span>Start chatting</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-16 pb-20 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF5F5] dark:bg-[#2D1C1E] border border-[#F5E1E1] dark:border-[#5C353A] text-[#D17A7A] dark:text-[#E28E8E] text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#D17A7A] dark:text-[#E28E8E]" />
          <span>Geometric Balance • Production AI Companion</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#2D2626] dark:text-[#F9F4F4] mb-6 leading-[1.15]">
          Meet <span className="text-[#D17A7A] dark:text-[#E28E8E]">Arfa AI</span>.
        </h1>

        <p className="text-base sm:text-xl text-[#8E8787] dark:text-[#BDB0B0] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          A personal AI companion designed for ideas, learning, building, and creating things that matter — powered by modern intelligence and crafted with aesthetic equilibrium.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            id="landing-hero-cta"
            onClick={onStartChat}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-[#D17A7A] hover:bg-[#c26d6d] dark:bg-[#E28E8E] dark:text-[#1E1819] dark:hover:bg-[#d67e7e] transition-all shadow-md hover:shadow-lg"
          >
            <span>Start chatting</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSettings}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-[#2D2626] dark:text-[#F9F4F4] bg-white dark:bg-[#1E1819] border border-[#F5E1E1] dark:border-[#35292B] hover:bg-[#FFF5F5] dark:hover:bg-[#261F21] transition-colors"
          >
            <span>Explore Knowledge</span>
          </button>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="px-6 py-14 max-w-5xl mx-auto border-t border-[#F5E1E1] dark:border-[#35292B]">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Engineered with Purpose</h2>
          <p className="text-sm text-[#8E8787]">
            A clean, balanced interface that prioritizes speed, clarity, and depth over noise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1819] border border-[#F5E1E1] dark:border-[#35292B] shadow-2xs">
            <div className="p-2.5 rounded-xl bg-[#FFF5F5] dark:bg-[#2D1C1E] text-[#D17A7A] dark:text-[#E28E8E] w-fit mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold mb-2">Real-Time Streaming SSE</h3>
            <p className="text-xs text-[#8E8787] dark:text-[#A89F9F] leading-relaxed">
              Progressive token rendering with immediate feedback, cancellation support, and auto-reconnection.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1819] border border-[#F5E1E1] dark:border-[#35292B] shadow-2xs">
            <div className="p-2.5 rounded-xl bg-[#FFF5F5] dark:bg-[#2D1C1E] text-[#D17A7A] dark:text-[#E28E8E] w-fit mb-4">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold mb-2">Curated Knowledge & Memory</h3>
            <p className="text-xs text-[#8E8787] dark:text-[#A89F9F] leading-relaxed">
              Retain project context, coding preferences, and custom instructions through an explicit memory engine.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1819] border border-[#F5E1E1] dark:border-[#35292B] shadow-2xs">
            <div className="p-2.5 rounded-xl bg-[#FFF5F5] dark:bg-[#2D1C1E] text-[#D17A7A] dark:text-[#E28E8E] w-fit mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold mb-2">Secure Server-Side Architecture</h3>
            <p className="text-xs text-[#8E8787] dark:text-[#A89F9F] leading-relaxed">
              All AI keys and logic remain server-side. Zero sensitive tokens exposed to the browser.
            </p>
          </div>
        </div>
      </section>

      {/* Technology & Privacy Highlights */}
      <section className="px-6 py-14 max-w-5xl mx-auto border-t border-[#F5E1E1] dark:border-[#35292B]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#D17A7A] dark:text-[#E28E8E] mb-2">
              Technology Stack
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-4">
              Multi-Model AI with Modern Web Standards
            </h3>
            <p className="text-sm text-[#8E8787] dark:text-[#BDB0B0] leading-relaxed mb-4">
              Powered by Google GenAI SDK (Gemini 3.8 Flash) with native streaming response handling. Built on React 19, TypeScript, Tailwind CSS, and Express.
            </p>
            <ul className="space-y-2 text-xs text-[#8E8787] dark:text-[#BDB0B0]">
              <li className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#D17A7A]" />
                <span>Syntax-highlighted code blocks with 1-click copy</span>
              </li>
              <li className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D17A7A]" />
                <span>Multi-turn context management & token estimation</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D17A7A]" />
                <span>Per-user data isolation and full JSON export</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl border border-[#F5E1E1] dark:border-[#35292B] bg-white dark:bg-[#1E1819] shadow-2xs">
            <h4 className="text-sm font-semibold mb-3">Arfa AI Ethos</h4>
            <blockquote className="text-xs italic text-[#8E8787] dark:text-[#BDB0B0] leading-relaxed border-l-2 border-[#D17A7A] pl-3">
              "Technology is at its most powerful when it amplifies human curiosity, empowers independent creators, and solves real problems with craftsmanship and humility."
            </blockquote>
            <div className="mt-4 text-right">
              <span className="text-[11px] font-semibold text-[#D17A7A] dark:text-[#E28E8E]">
                — Arfa Knowledge Principles
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Footer */}
      <footer className="border-t border-[#F5E1E1] dark:border-[#35292B] px-6 py-8 text-center text-xs text-[#8E8787]">
        <p>© 2026 Arfa AI. Built with intelligence, precision, and geometric balance.</p>
      </footer>
    </div>
  );
};
