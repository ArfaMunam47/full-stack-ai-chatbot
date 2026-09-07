import React, { useState, useRef } from "react";
import {
  Sparkles,
  Plus,
  Mic,
  MicOff,
  ArrowUp,
  Brain,
  Film,
  Palette,
  Presentation,
  Languages,
} from "lucide-react";
import { User } from "../../types.ts";
import { ArfaLogo } from "../ui/ArfaLogo.tsx";

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
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const triggerPrompt = (text: string) => {
    if (onSendPrompt) onSendPrompt(text);
    else if (onSelectPrompt) onSelectPrompt(text);
  };

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = "Good morning";
    if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";
    else if (hour >= 17) timeGreeting = "Good evening";

    const name = currentUser && !currentUser.isGuest ? currentUser.name : "Arfa";
    return `${timeGreeting}, ${name}`;
  };

  // Speech Recognition with friendly permissions
  const handleMicToggle = () => {
    setVoiceNotice(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceNotice("Microphone recording is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
    } else {
      try {
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
        recognition.onerror = (e: any) => {
          setIsListening(false);
          if (e.error === "not-allowed") {
            setVoiceNotice("Microphone access is blocked. Allow microphone permission in your browser settings and try again.");
          }
        };
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    triggerPrompt(inputText);
    setInputText("");
  };

  // 4 Curated High-Value Prompt Suggestions showcasing $10,000 Capabilities
  const promptSuggestions = [
    {
      id: "urdu-chat",
      title: "اردو میں بات چیت",
      subtitle: "Full Urdu & bilingual fluency",
      prompt: "lets talk in urdu",
      icon: Languages,
      badge: "اردو / Urdu",
      highlight: true,
    },
    {
      id: "generate-presentation",
      title: "Interactive Presentation Deck",
      subtitle: "Executive slides & data breakdown",
      prompt: "Generate an executive presentation deck on the Future of Artificial Intelligence and its impact on global industries.",
      icon: Presentation,
      badge: "Slides Deck",
      highlight: true,
    },
    {
      id: "generate-image",
      title: "8K Photorealistic Studio Image",
      subtitle: "Photorealistic art & concept design",
      prompt: "Generate a photorealistic 8K image of a serene high-tech glass pavilion floating over a mist-covered mountain lake at dawn.",
      icon: Palette,
      badge: "8K Image",
      highlight: false,
    },
    {
      id: "generate-video",
      title: "Cinematic Video Clip",
      subtitle: "Motion synthesis & drone flow",
      prompt: "Generate a cinematic video of mountain mist slowly parting over a tranquil alpine lake at sunrise with smooth slow-motion camera movement.",
      icon: Film,
      badge: "Motion Video",
      highlight: false,
    },
  ];

  const isUrduInput = /[\u0600-\u06FF]/.test(inputText);

  return (
    <div
      id="arfa-empty-state"
      className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center flex-1 select-none animate-fadeIn"
    >
      {/* Official Geometric ARFA AI Emblem */}
      <div className="mb-4">
        <ArfaLogo size="lg" showText={false} />
      </div>

      {/* Dynamic Greeting */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1718] text-center mb-1">
        {getGreeting()}
      </h1>
      <p className="text-sm text-[#5A5456] text-center mb-4">
        The Next-Generation Intelligence Engine for Reasoning, Media & Creation
      </p>

      {/* Feature Capabilities Pill Showcase */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-[11px] font-medium text-[#5A5456]">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#EFE9E6] shadow-xs text-[#1A1718]">
          <Languages className="w-3.5 h-3.5 text-[#D84A70]" />
          <span>Multilingual (اردو / English)</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#EFE9E6] shadow-xs text-[#1A1718]">
          <Palette className="w-3.5 h-3.5 text-[#D84A70]" />
          <span>8K Studio Images</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#EFE9E6] shadow-xs text-[#1A1718]">
          <Film className="w-3.5 h-3.5 text-[#D84A70]" />
          <span>Cinematic Video</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#EFE9E6] shadow-xs text-[#1A1718]">
          <Presentation className="w-3.5 h-3.5 text-amber-600" />
          <span>Presentation Decks</span>
        </span>
      </div>

      {/* Central Floating Luxury Search / Prompt Box */}
      <form
        onSubmit={handleSubmit}
        className="w-full relative mb-6 rounded-2xl bg-white border border-[#EFE9E6] shadow-sm hover:shadow-md p-2.5 transition-all focus-within:border-[#D84A70] focus-within:ring-2 focus-within:ring-[#D84A70]/15"
      >
        <div className="flex items-center gap-2">
          {/* Plus Button for File Upload */}
          <button
            type="button"
            onClick={() => {
              const fileInput = document.getElementById("file-upload-input");
              if (fileInput) fileInput.click();
            }}
            className="w-8 h-8 rounded-xl bg-[#F6F3F1] text-[#5A5456] hover:text-[#1A1718] hover:bg-[#EFE9E6] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            title="Attach file or photo"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Main Prompt Input */}
          <input
            id="empty-state-prompt-input"
            type="text"
            dir={isUrduInput ? "rtl" : "ltr"}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask anything, talk in Urdu (اردو میں بات کریں), generate media or presentations..."
            className={`flex-1 text-sm bg-transparent outline-none text-[#1A1718] placeholder-[#A39B9E] px-2 py-1 font-normal ${
              isUrduInput ? "font-serif text-right" : "text-left"
            }`}
          />

          {/* Microphone Voice Button */}
          <button
            type="button"
            onClick={handleMicToggle}
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              isListening
                ? "bg-[#D84A70] text-white ring-2 ring-[#F7CDD8] animate-pulse shadow-xs"
                : "text-[#7E7779] hover:text-[#D84A70] hover:bg-[#FDF2F5]"
            }`}
            title={isListening ? "Listening... click to stop" : "Dictate with voice"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-8 h-8 rounded-xl bg-[#D84A70] hover:bg-[#C0375D] disabled:bg-[#EFE9E6] disabled:text-[#A39B9E] text-white disabled:cursor-not-allowed flex items-center justify-center shrink-0 transition-all shadow-xs cursor-pointer active:scale-95"
            title="Send prompt"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Voice Warning Banner */}
      {voiceNotice && (
        <div className="w-full mb-6 p-2.5 rounded-xl bg-[#FFF5F7] border border-[#F5C4D2] text-xs text-[#9B2A48] flex items-center justify-between shadow-xs">
          <span>{voiceNotice}</span>
          <button
            type="button"
            onClick={() => setVoiceNotice(null)}
            className="text-[#9B2A48] hover:opacity-80 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2x2 Grid of Prompt Suggestions */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
        {promptSuggestions.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => triggerPrompt(item.prompt)}
              className="p-3.5 rounded-2xl bg-white border border-[#EFE9E6] hover:border-[#D84A70] hover:bg-[#FDF2F5]/40 hover:shadow-xs transition-all flex items-start gap-3.5 text-left cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 bg-[#FDF2F5] text-[#D84A70]">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-bold text-[#1A1718] group-hover:text-[#D84A70] transition-colors truncate">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-[#F6F3F1] text-[#7E7779]">
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-[#5A5456] truncate">
                  {item.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
