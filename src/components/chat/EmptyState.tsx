import React from "react";
import { ArfaLogo } from "../ui/ArfaLogo.tsx";

interface EmptyStateProps {
  onSelectPrompt: (promptText: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  const suggestions = [
    "Explain distributed consensus algorithms simply",
    "Review TypeScript code for performance bottlenecks",
    "Draft a scalable system design document",
    "Brainstorm product features for an AI assistant",
  ];

  return (
    <div
      id="arfa-empty-state"
      className="flex-1 flex flex-col items-center justify-center px-4 py-6 text-center max-w-xl mx-auto w-full select-none"
    >
      <div className="mb-4">
        <ArfaLogo size="lg" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#FAF4F4] mb-2">
        How can I help you today?
      </h1>
      <p className="text-[#A3989A] text-sm max-w-md mb-6">
        Ask a question, brainstorm new concepts, or write and debug code.
      </p>

      {/* Subtle compact suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
        {suggestions.map((promptText, idx) => (
          <button
            key={idx}
            id={`suggestion-chip-${idx}`}
            type="button"
            onClick={() => onSelectPrompt(promptText)}
            className="text-left px-3.5 py-2.5 rounded-xl border border-[#302427] hover:border-[#453438] bg-[#1C1618] hover:bg-[#231C1E] text-xs sm:text-sm text-[#A3989A] hover:text-[#FAF4F4] transition-all cursor-pointer truncate"
          >
            {promptText}
          </button>
        ))}
      </div>
    </div>
  );
};
