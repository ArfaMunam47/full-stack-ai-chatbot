import React, { useState, useRef } from "react";
import {
  Sparkles,
  Plus,
  Mic,
  ArrowUp,
  Brain,
  Code,
  GraduationCap,
  Lightbulb,
} from "lucide-react";
import { User } from "../../types.ts";

interface EmptyStateProps {
  currentUser?: User | null;
  onSendPrompt?: (promptText: string) => void;
  onSelectPrompt?: (promptText: string) => void;
  onOpenAttachment?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  currentUser,
  onSendPrompt,
  onSelectPrompt,
}) => {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const triggerPrompt = (text: string) => {
    if (onSendPrompt) onSendPrompt(text);
    else if (onSelectPrompt) onSelectPrompt(text);
  };

  // Time-of-day greeting (Matching reference image)
  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = "Good morning";
    if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";
    else if (hour >= 17) timeGreeting = "Good evening";

    const name = currentUser && !currentUser.isGuest ? currentUser.name : "Arfa";
    return `${timeGreeting}, ${name} 👋`;
  };

  // Speech Recognition
  const handleMicToggle = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText((prev) => (prev ? `${prev.trim()} ${transcript}` : transcript));
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    triggerPrompt(inputText.trim());
    setInputText("");
  };

  // 4 Prompt Cards from Reference Image
  const promptSuggestions = [
    {
      id: "explain-ai",
      title: "Explain AI in simple terms",
      prompt: "Explain artificial intelligence in simple terms that anyone can easily understand, with a relatable everyday analogy.",
      icon: Brain,
      color: "text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800",
    },
    {
      id: "coding-practices",
      title: "Best practices for coding",
      prompt: "What are the most essential modern best practices for clean code, maintainability, and scalable software architecture?",
      icon: Code,
      color: "text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800",
    },
    {
      id: "study-plan",
      title: "Make a study plan",
      prompt: "Create a focused, realistic study plan for mastering a new subject in 30 days, with structured daily and weekly milestones.",
      icon: GraduationCap,
      color: "text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800",
    },
    {
      id: "motivational-quote",
      title: "Write a motivational quote",
      prompt: "Share an inspiring, deeply motivational quote accompanied by a brief thought on overcoming obstacles and staying persistent.",
      icon: Lightbulb,
      color: "text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800",
    },
  ];

  return (
    <div
      id="arfa-empty-state"
      className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center flex-1 select-none animate-fadeIn"
    >
      {/* Top Neutral Emblem */}
      <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-sm mb-4 transition-transform hover:scale-105">
        <Sparkles className="w-6 h-6" />
      </div>

      {/* Dynamic Headline */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white text-center mb-1">
        {getGreeting()}
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center mb-8">
        How can I help you today?
      </p>

      {/* Central Floating Search / Prompt Box */}
      <form
        onSubmit={handleSubmit}
        className="w-full relative mb-8 rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200 dark:border-neutral-700 shadow-md dark:shadow-none p-2.5 transition-all focus-within:border-neutral-400 dark:focus-within:border-neutral-500"
      >
        <div className="flex items-center gap-2">
          {/* Plus Button for File Upload */}
          <button
            type="button"
            onClick={() => {
              const fileInput = document.getElementById("file-upload-input");
              if (fileInput) fileInput.click();
            }}
            className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            title="Attach file or photo"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Main Prompt Input */}
          <input
            id="empty-state-prompt-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask ARFA AI anything..."
            className="flex-1 text-sm bg-transparent outline-none text-neutral-900 dark:text-white placeholder-neutral-400 px-2 py-1"
          />

          {/* Microphone Voice Button */}
          <button
            type="button"
            onClick={handleMicToggle}
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
            title={isListening ? "Listening..." : "Dictate with voice"}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Send Button (Solid Black in Light Mode, Solid White in Dark Mode - ChatGPT style) */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-8 h-8 rounded-xl bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 disabled:opacity-30 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-white flex items-center justify-center shrink-0 transition-all shadow-xs cursor-pointer"
            title="Send prompt"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* 2x2 Grid of Prompt Suggestions */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
        {promptSuggestions.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => triggerPrompt(item.prompt)}
              className="p-3.5 rounded-xl bg-white dark:bg-[#212121] border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/70 hover:shadow-xs transition-all flex items-center gap-3 text-left cursor-pointer group"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${item.color}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-neutral-900 dark:group-hover:text-white truncate">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
