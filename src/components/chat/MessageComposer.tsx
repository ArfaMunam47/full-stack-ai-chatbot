import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  ArrowUp,
  Square,
  Paperclip,
  Mic,
  MicOff,
  X,
  FileText,
  Loader2,
  Check,
  Zap,
  BrainCircuit,
  Palette,
  Code2,
  Sparkles,
} from "lucide-react";
import { MessageAttachment, ComposerMode } from "../../types.ts";
import { api } from "../../lib/api.ts";
import { useSpeechToText } from "../../hooks/useSpeechToText.ts";
import { soundEffects } from "../../lib/sound.ts";

export type LightingTheme = "blush" | "sunlight" | "lunar" | "emerald";

interface MessageComposerProps {
  onSend: (message: string, attachments?: MessageAttachment[], mode?: ComposerMode) => void;
  isStreaming: boolean;
  onStop: () => void;
  disabled?: boolean;
  activeMode?: ComposerMode;
  onModeChange?: (mode: ComposerMode) => void;
  statusText?: string | null;
  lightingTheme?: LightingTheme;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  isStreaming,
  onStop,
  disabled = false,
  activeMode = "chat",
  onModeChange,
  statusText,
  lightingTheme = "blush",
}) => {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const baseTextRef = useRef<string>("");

  // Theme-adaptive accent colors for composer
  const themeAccents = {
    blush: {
      iconColor: "text-rose-500",
      iconHover: "group-hover:text-rose-600",
      micActive: "bg-rose-100 text-rose-600 border-rose-400 animate-pulse",
      sendBg: "linear-gradient(145deg, #FF6584 0%, #F43F5E 55%, #BE123C 100%)",
      sendShadow: "0 8px 18px -2px rgba(244, 63, 94, 0.45)",
      glowActive: "0 0 16px rgba(244, 63, 94, 0.4)",
      activeModePill: "bg-white text-[#BE123C] border-rose-200/90 shadow-xs",
    },
    sunlight: {
      iconColor: "text-orange-500",
      iconHover: "group-hover:text-orange-600",
      micActive: "bg-orange-100 text-orange-600 border-orange-400 animate-pulse",
      sendBg: "linear-gradient(145deg, #FB923C 0%, #F97316 55%, #EA580C 100%)",
      sendShadow: "0 8px 18px -2px rgba(234, 88, 12, 0.45)",
      glowActive: "0 0 16px rgba(249, 115, 22, 0.4)",
      activeModePill: "bg-white text-[#C2410C] border-orange-200/90 shadow-xs",
    },
    lunar: {
      iconColor: "text-purple-500",
      iconHover: "group-hover:text-purple-600",
      micActive: "bg-purple-100 text-purple-600 border-purple-400 animate-pulse",
      sendBg: "linear-gradient(145deg, #C084FC 0%, #A855F7 55%, #9333EA 100%)",
      sendShadow: "0 8px 18px -2px rgba(147, 51, 234, 0.45)",
      glowActive: "0 0 16px rgba(168, 85, 247, 0.4)",
      activeModePill: "bg-white text-[#7E22CE] border-purple-200/90 shadow-xs",
    },
    emerald: {
      iconColor: "text-emerald-500",
      iconHover: "group-hover:text-emerald-600",
      micActive: "bg-emerald-100 text-emerald-600 border-emerald-400 animate-pulse",
      sendBg: "linear-gradient(145deg, #34D399 0%, #10B981 55%, #059669 100%)",
      sendShadow: "0 8px 18px -2px rgba(16, 185, 129, 0.45)",
      glowActive: "0 0 16px rgba(16, 185, 129, 0.4)",
      activeModePill: "bg-white text-[#047857] border-emerald-200/90 shadow-xs",
    },
  }[lightingTheme || "blush"];

  // Available Composer Modes with physical icons
  const modes: { id: ComposerMode; label: string; icon: React.ElementType }[] = [
    { id: "chat", label: "⚡ Fast Chat (<3s)", icon: Zap },
    { id: "document", label: "📎 Doc Reader", icon: FileText },
    { id: "research", label: "🧠 Deep Think", icon: BrainCircuit },
    { id: "creative", label: "✨ Creative", icon: Sparkles },
  ];

  const {
    isListening,
    isTranscribing,
    startListening,
    stopListening,
  } = useSpeechToText({
    lang: "en-US",
    continuous: true,
    interimResults: true,
    onStart: () => {
      baseTextRef.current = text.trim();
      setMicNotice(null);
    },
    onTranscript: (chunk: string, isFinal: boolean) => {
      const base = baseTextRef.current;
      if (isFinal) {
        const nextFull = base ? `${base} ${chunk}` : chunk;
        baseTextRef.current = nextFull;
        setText(nextFull);
      } else {
        const display = base ? `${base} ${chunk}` : chunk;
        setText(display);
      }
    },
    onError: (errorMessage) => {
      if (errorMessage) {
        setMicNotice(errorMessage);
      }
    },
    onEnd: () => {},
  });

  useEffect(() => {
    let timer: any = null;
    if (isListening) {
      setRecordingSeconds(0);
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isListening]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;
    if (disabled || isStreaming) return;

    soundEffects.send();
    onSend(trimmed, attachments, activeMode);
    setText("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, attachments, disabled, isStreaming, onSend, activeMode]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicToggle = () => {
    soundEffects.tap();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    soundEffects.tap();
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploaded = await api.uploadFile(file);
        setAttachments((prev) => [...prev, uploaded]);
      }
    } catch {
      // Handled gracefully
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAttachment = (index: number) => {
    soundEffects.tap();
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const isRtlInput = /[\u0600-\u06FF]/.test(text);
  const hasContent = text.trim().length > 0 || attachments.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 pb-2 sm:pb-3 pt-1 relative z-20 select-none">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* 1. Skeuomorphic Mode Switcher Pill Bar (Physical Hardware Selector) */}
      <div className="flex items-center justify-between gap-2 px-1 mb-1.5">
        <div className="flex items-center gap-1 p-0.5 rounded-full skeuo-well">
          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = activeMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  soundEffects.tap();
                  onModeChange?.(m.id);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? themeAccents.activeModePill
                    : "text-[#8A4B6E] hover:text-[#361427] hover:bg-white/40"
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? themeAccents.iconColor : "text-[#A36287]"}`} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live latency chip */}
        <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-[#8A4B6E]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>2026 Engine</span>
        </div>
      </div>

      {/* Error / Mic Notice */}
      {micNotice && (
        <div className="mb-2 px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-xs text-amber-900 flex items-center justify-between shadow-xs">
          <span>{micNotice}</span>
          <button
            type="button"
            onClick={() => setMicNotice(null)}
            className="text-amber-800 hover:text-amber-950 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Live Voice Recording Status with Animated Dancing Soundwaves */}
      {isListening && (
        <div className="mb-2 p-2.5 sm:p-3 rounded-2xl bg-white/95 border border-white/95 text-[#162716] flex items-center justify-between gap-3 shadow-md backdrop-blur-xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Mic className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold tracking-tight text-[#162716]">
                  Listening ({formatTimer(recordingSeconds)})
                </span>
                {/* 5-Bar Dancing SVG Soundwave */}
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-0.5 h-full bg-rose-500 rounded-full animate-pulse" />
                  <span className="w-0.5 h-2 bg-rose-400 rounded-full animate-pulse delay-75" />
                  <span className="w-0.5 h-full bg-rose-600 rounded-full animate-pulse delay-150" />
                  <span className="w-0.5 h-1.5 bg-rose-400 rounded-full animate-pulse delay-100" />
                  <span className="w-0.5 h-2.5 bg-rose-500 rounded-full animate-pulse delay-200" />
                </div>
              </div>
              <span className="text-[11px] text-[#4A644A] font-medium">
                Speak freely. Click Done when finished.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundEffects.tap();
                stopListening();
                setText(baseTextRef.current);
              }}
              className="soft3d-button-secondary px-3 py-1 text-xs font-bold text-[#445E44]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.tap();
                stopListening();
              }}
              className="soft3d-button-primary inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-extrabold"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.8]" />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}

      {/* Status Text Indicator */}
      {statusText && (
        <div className="mb-2 px-3.5 py-2 rounded-xl bg-white/85 border border-[#CDE65E] text-xs text-[#2A401A] flex items-center gap-2 shadow-xs backdrop-blur-md">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6C8A18]" />
          <span className="font-bold">{statusText}</span>
        </div>
      )}

      {/* Voice Recording / Transcribing Indicator */}
      {isListening && (
        <div className="mb-2 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between shadow-2xs animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <span className="font-bold">Listening... (0:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds})</span>
          </div>
          <button
            type="button"
            onClick={stopListening}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer"
          >
            Tap to finish
          </button>
        </div>
      )}

      {isTranscribing && (
        <div className="mb-2 px-3.5 py-2 rounded-xl bg-pink-50 border border-pink-200 text-xs text-[#BE123C] flex items-center gap-2 shadow-2xs">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
          <span className="font-semibold">Transcribing your voice...</span>
        </div>
      )}

      {micNotice && !isListening && (
        <div className="mb-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between shadow-2xs">
          <span className="font-medium">{micNotice}</span>
          <button
            type="button"
            onClick={() => setMicNotice(null)}
            className="text-amber-600 hover:text-amber-900 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Attachment Chips */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-pink-200/80 shadow-xs text-xs text-[#3D1429]"
            >
              {att.type.startsWith("image/") ? (
                <img
                  src={att.dataUrl || ""}
                  alt={att.name}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-md object-cover border border-pink-200"
                />
              ) : (
                <FileText className="w-4 h-4 text-rose-500" />
              )}
              <span className="max-w-[120px] truncate text-[11.5px] font-bold text-[#3D1429]">
                {att.name}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(idx)}
                className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                aria-label="Remove attachment"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 2. Floating 3D Frosted Glass & Skeuomorphic One-Line Deck */}
      <div
        id="arfa-composer-deck"
        className="soft3d-chat-input-deck px-2.5 sm:px-3 py-1 transition-all flex items-center gap-2 relative overflow-hidden rounded-2xl shadow-md min-h-[46px] max-h-[46px]"
      >
        {/* Specular Top Highlight Glaze */}
        <div className="absolute inset-x-2 top-0.5 h-[36%] rounded-t-[14px] bg-gradient-to-b from-white/80 via-white/20 to-transparent pointer-events-none" />

        {/* Attachment Button: Tactile Clay Rounded-XL */}
        <button
          type="button"
          onClick={() => {
            soundEffects.tap();
            fileInputRef.current?.click();
          }}
          disabled={disabled || isUploading || isListening}
          className="soft3d-button-secondary w-8 h-8 rounded-xl flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40 select-none relative z-10 group"
          title="Attach file or image"
          aria-label="Attach file"
        >
          <div className="absolute inset-x-1 top-0.5 h-[36%] rounded-t-[10px] bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />
          <Paperclip className={`w-4 h-4 ${themeAccents.iconColor} stroke-[2.2] transition-transform duration-200 group-hover:rotate-12 ${themeAccents.iconHover}`} />
        </button>

        {/* Seamless One-Line Input Field */}
        <div className="flex-1 flex items-center min-h-[34px] max-h-[34px] relative z-10 px-1">
          <textarea
            ref={textareaRef}
            value={text}
            dir={isRtlInput ? "rtl" : "ltr"}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeMode === "document"
                ? "Ask anything about your attached document or file... 📎"
                : "Chat with your AI best friend, ask questions, or attach files... ✨"
            }
            disabled={disabled}
            rows={1}
            className={`w-full h-[34px] min-h-[34px] max-h-[34px] bg-transparent border-none outline-none resize-none text-[#3D1429] placeholder-[#A76E8E] text-xs sm:text-[13.5px] font-medium leading-[34px] py-0 overflow-hidden ${
              isRtlInput ? "text-right" : "text-left"
            }`}
          />
        </div>

        {/* Right Actions: Voice Mic & Send Button on the Same Line */}
        <div className="flex items-center gap-1.5 shrink-0 relative z-10">
          {/* Voice Dictation Button */}
          <button
            type="button"
            onClick={handleMicToggle}
            disabled={disabled}
            className={`soft3d-button-secondary w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer select-none relative group ${
              isListening ? themeAccents.micActive : ""
            }`}
            title={isListening ? "Stop voice dictation" : "Dictate with voice"}
            aria-label={isListening ? "Stop voice dictation" : "Start voice dictation"}
          >
            <div className="absolute inset-x-1 top-0.5 h-[36%] rounded-t-[10px] bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />
            {isListening ? (
              <MicOff className="w-4 h-4 text-rose-600 stroke-[2.4]" />
            ) : (
              <Mic className={`w-4 h-4 ${themeAccents.iconColor} stroke-[2.2] transition-transform duration-200 group-hover:scale-110 ${themeAccents.iconHover}`} />
            )}
          </button>

          {/* Send Button: Tactile 3D Clay Button (Themed) */}
          {isStreaming ? (
            <button
              type="button"
              onClick={() => {
                soundEffects.tap();
                onStop();
              }}
              className="w-8.5 h-8.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-md transition-all active:scale-95"
              title="Stop response"
              aria-label="Stop response"
            >
              <Square className="w-3.5 h-3.5 fill-current text-white" />
            </button>
          ) : (
            <button
              id="composer-send-btn"
              type="button"
              onClick={handleSend}
              disabled={disabled || !hasContent}
              className="w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none select-none relative transition-all active:scale-95 group cursor-pointer"
              style={{
                background: themeAccents.sendBg,
                boxShadow: hasContent
                  ? `inset 0 1.5px 2px rgba(255, 255, 255, 0.9), inset 0 -1.5px 2px rgba(0, 0, 0, 0.2), ${themeAccents.sendShadow}, ${themeAccents.glowActive}`
                  : `inset 0 1.5px 2px rgba(255, 255, 255, 0.9), inset 0 -1.5px 2px rgba(0, 0, 0, 0.2), ${themeAccents.sendShadow}`,
                border: "1px solid rgba(255, 255, 255, 0.75)",
              }}
              title="Send message"
              aria-label="Send message"
            >
              <div className="absolute inset-x-1 top-0.5 h-[38%] rounded-t-[10px] bg-gradient-to-b from-white/75 via-white/20 to-transparent pointer-events-none" />
              <ArrowUp className="w-4 h-4 text-white stroke-[2.8] transition-transform duration-200 group-hover:-translate-y-0.5 relative z-10" />
            </button>
          )}
        </div>
      </div>

      {/* Subtle, Clean Keyboard Shortcut Indicator */}
      <div className="flex items-center justify-between pt-1 px-1 text-[10px] text-[#8A4B6E]/70 select-none">
        <span>ARFA AI • 2026 Edition</span>
        <span>Press ↵ to send • Shift + ↵ for newline</span>
      </div>
    </div>
  );
};
