import React from "react";
import { ArfaLogo } from "../ui/ArfaLogo.tsx";
import { Mail, Atom, Briefcase, Languages, Sparkles, CheckCheck } from "lucide-react";

interface EmptyStateProps {
  onSelectPrompt: (promptText: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  const suggestions = [
    {
      title: "Help me write an email",
      prompt: "Help me write a professional, clear, and polite email requesting an update on an important project.",
      icon: Mail,
    },
    {
      title: "Explain quantum physics",
      prompt: "Explain quantum physics and quantum superposition in simple, intuitive terms with a clear real-world analogy.",
      icon: Atom,
    },
    {
      title: "Plan a 5-day trip",
      prompt: "Plan a detailed, exciting 5-day travel itinerary with daily morning and afternoon activities, local food, and travel tips.",
      icon: Briefcase,
    },
    {
      title: "Translate this to Spanish",
      prompt: "Translate the following message into natural, fluent Spanish with polite tone: 'Thank you so much for your support and collaboration today.'",
      icon: Languages,
    },
  ];

  const currentTime = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <div
      id="arfa-welcome-screen"
      className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center flex-1 select-none animate-fadeIn"
    >
      {/* Assistant Greeting Card from Image 1 */}
      <div className="flex items-start gap-3 sm:gap-4 mb-6">
        <div className="shrink-0 mt-1">
          <ArfaLogo size="sm" showText={false} />
        </div>

        <div className="flex-1 min-w-0 tactile-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#E5DDD3] dark:border-[#332217]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-[#1F130B] dark:text-[#FAF6F0]">
                Arfa AI
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EFE8DF] dark:bg-[#261A12] text-[#543D2B] dark:text-[#D8C9BC] border border-[#E5DDD3] dark:border-[#332217]">
                <Sparkles className="w-2.5 h-2.5 text-[#543D2B] dark:text-[#D8C9BC]" />
                Online
              </span>
            </div>
            <span className="text-[11px] text-[#7A6250] dark:text-[#A89584] font-medium">
              Assistant
            </span>
          </div>

          {/* Welcoming Message Copy from Image 1 */}
          <div className="text-[15px] sm:text-[16px] leading-relaxed text-[#1F130B] dark:text-[#FAF6F0] font-normal space-y-2">
            <p className="font-semibold text-lg text-[#1F130B] dark:text-[#FAF6F0]">
              Hello! ✨
            </p>
            <p className="text-[#3D291C] dark:text-[#E8DDD2]">
              I'm here to help you with anything you need. You can ask me questions, get ideas,
              translate languages, write content, solve problems, and much more.
            </p>
          </div>

          {/* Card Footer: Timestamp & Double Checkmarks */}
          <div className="flex items-center justify-end gap-1.5 mt-3 pt-2 text-[11px] text-[#8C7563] dark:text-[#A89584]">
            <span>{currentTime}</span>
            <CheckCheck className="w-3.5 h-3.5 text-[#543D2B] dark:text-[#D8C9BC]" />
          </div>
        </div>
      </div>

      {/* 4 Prompt Suggestions from Image 1 */}
      <div className="w-full pl-0 sm:pl-11">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6250] dark:text-[#A89584] mb-3 px-1">
          Suggested topics
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {suggestions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                id={`welcome-suggestion-${idx}`}
                type="button"
                onClick={() => onSelectPrompt(item.prompt)}
                className="tactile-raised group text-left px-4 py-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all duration-150 active:scale-98"
              >
                <div className="w-8 h-8 rounded-xl bg-[#EFE8DF] dark:bg-[#2A1D15] flex items-center justify-center text-[#543D2B] dark:text-[#D8C9BC] group-hover:text-[#1F130B] dark:group-hover:text-[#FAF6F0] group-hover:bg-[#E5DDD3] dark:group-hover:bg-[#38261C] transition-colors shrink-0 shadow-xs border border-[#DDD1C2] dark:border-[#3E291C]">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-[13px] font-semibold text-[#1F130B] dark:text-[#FAF6F0] block truncate">
                    {item.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
