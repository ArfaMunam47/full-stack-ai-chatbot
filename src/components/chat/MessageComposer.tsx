import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  SendHorizontal,
  Square,
  Paperclip,
  Mic,
  MicOff,
  X,
  FileText,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react";
import { MessageAttachment, ComposerMode } from "../../types.ts";
import { api } from "../../lib/api.ts";
import { useSpeechToText } from "../../hooks/useSpeechToText.ts";
import { TactileIconPad } from "../ui/TactileIconPad.tsx";

interface MessageComposerProps {
  onSend: (message: string, attachments?: MessageAttachment[], mode?: ComposerMode) => void;
  isStreaming: boolean;
  onStop: () => void;
  disabled?: boolean;
  activeMode?: ComposerMode;
  onModeChange?: (mode: ComposerMode) => void;
  statusText?: string | null;
  lightingTheme?: "sunlight" | "starlight" | "cyber" | "lunar";
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  isStreaming,
  onStop,
  disabled = false,
  activeMode = "chat",
  onModeChange,
  statusText,
  lightingTheme = "sunlight",
}) => {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const baseTextRef = useRef<string>("");

  const {
    isListening,
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
    onEnd: () => {
      // Stream cleanly ended
    },
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

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 160);
    el.style.height = `${Math.max(nextHeight, 38)}px`;
  }, [text]);

  useEffect(() => {
    const handleSetPrompt = (e: CustomEvent<string>) => {
      if (typeof e.detail === "string") {
        setText(e.detail);
        textareaRef.current?.focus();
      }
    };
    window.addEventListener("alpha:set-prompt" as any, handleSetPrompt);
    return () => window.removeEventListener("alpha:set-prompt" as any, handleSetPrompt);
  }, []);

  const handleSend = () => {
    const trimmed = text.trim();
    if ((!trimmed && attachments.length === 0) || isStreaming || disabled) return;

    onSend(trimmed, attachments.length > 0 ? attachments : undefined, activeMode);
    setText("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "38px";
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          const res = await api.uploadFile(file);
          const att: MessageAttachment = {
            id: res.id || `att-${Date.now()}-${Math.random()}`,
            name: file.name,
            type: file.type || "application/octet-stream",
            size: file.size,
            url: res.url,
            dataUrl: res.dataUrl,
          };
          return att;
        } catch {
          return new Promise<MessageAttachment>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                id: `att-local-${Date.now()}-${Math.random()}`,
                name: file.name,
                type: file.type || "application/octet-stream",
                size: file.size,
                dataUrl: reader.result as string,
              });
            };
            reader.readAsDataURL(file);
          });
        }
      });

      const newAtts = await Promise.all(uploadPromises);
      setAttachments((prev) => [...prev, ...newAtts]);
    } catch (err) {
      console.error("File upload error:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMicToggle = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      setMicNotice(null);
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const isRtlInput = /[\u0600-\u06FF]/.test(text.slice(0, 40));

  return (
    <div id="alpha-composer-root" className="w-full max-w-4xl mx-auto px-2 sm:px-4 pb-3 sm:pb-4 select-none">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Mic Warning Notice Toast */}
      {micNotice && (
        <div
          id="mic-permission-toast"
          className="mb-2.5 px-4 py-2.5 rounded-2xl bg-[#FDF0EC] border-t border-white border-b border-[#E0A795] text-xs text-[#9B3923] flex items-center justify-between gap-3 shadow-md"
        >
          <div className="flex items-center gap-2">
            <TactileIconPad icon={MicOff} variant="terracotta" size="xs" />
            <span className="font-semibold">{micNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setMicNotice(null)}
            className="text-[#9B3923] hover:text-[#5B1E10] p-1 cursor-pointer"
            aria-label="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Voice Dictation Banner */}
      {isListening && (
        <div
          id="active-speech-banner"
          className="mb-2.5 p-3 rounded-2xl plush-surface-navy text-white flex items-center justify-between gap-3 select-none"
        >
          <div className="flex items-center gap-3">
            <TactileIconPad icon={Mic} variant="navy" size="sm" />
            {/* Animated plush soundwave bars */}
            <div className="flex items-center gap-1 h-5 px-1">
              <span className="w-1 bg-[#F5EFE6] rounded-full plush-wave-1" />
              <span className="w-1 bg-[#F5EFE6] rounded-full plush-wave-2" />
              <span className="w-1 bg-[#F5EFE6] rounded-full plush-wave-3" />
              <span className="w-1 bg-[#F5EFE6] rounded-full plush-wave-4" />
              <span className="w-1 bg-[#F5EFE6] rounded-full plush-wave-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-wide">
                Listening... {formatTimer(recordingSeconds)}
              </span>
              <span className="text-[11px] text-white/70">
                Dictating in real-time. Click Done when finished.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopListening();
                setText(baseTextRef.current);
              }}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={stopListening}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-white text-[#111A29] text-xs font-extrabold shadow-sm active:scale-95 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}

      {/* Status Text (e.g., generating research, synthesizing) */}
      {statusText && (
        <div className="mb-2 px-3.5 py-2 rounded-xl bg-[#1A0E2E]/90 border border-white/15 text-xs text-[#E9D5FF] flex items-center gap-2 shadow-md">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F472B6]" />
          <span className="font-semibold">{statusText}</span>
        </div>
      )}

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2.5 px-1">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-sm text-xs text-white"
            >
              {att.type.startsWith("image/") ? (
                <img
                  src={att.dataUrl || ""}
                  alt={att.name}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-md object-cover"
                />
              ) : (
                <FileText className="w-4 h-4 text-pink-300" />
              )}
              <span className="max-w-[120px] truncate text-[11px] font-bold">{att.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(idx)}
                className="text-slate-400 hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                aria-label="Remove attachment"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lower Chat Box with Premium Rich Clean Lighting Effect */}
      <div
        id="arfa-composer-deck"
        className={`premium-neon-lighting-chatbox chatbox-${lightingTheme} relative p-2.5 sm:p-3 transition-all flex flex-col gap-1.5`}
      >
        {/* Top Specular Starlight Ray */}
        <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-pink-200 to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-6 rounded-full bg-pink-500/18 blur-lg pointer-events-none" />

        {/* Recessed Inset Jelly Deck for Typing */}
        <div className="flex items-center gap-2 w-full">
          {/* Attachment Jelly Button: 3D Candy Squishy Specular Finish */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading || isListening}
            className="jelly-spring group relative w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40 select-none transition-all"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(168, 85, 247, 0.35) 60%, rgba(124, 58, 237, 0.45) 100%)",
              border: "1.2px solid rgba(255, 255, 255, 0.65)",
              boxShadow: `
                inset 0 2px 2.5px rgba(255, 255, 255, 0.8),
                inset 0 -2px 2.5px rgba(0, 0, 0, 0.45),
                0 4px 12px rgba(0, 0, 0, 0.4)
              `,
            }}
            title="Attach file or image"
            aria-label="Attach file"
          >
            {/* Top Gloss Glaze */}
            <div className="absolute inset-x-1 top-0.5 h-[40%] rounded-t-xl bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none" />
            <Paperclip className="w-4.5 h-4.5 text-white/90 relative z-10 transition-transform duration-200 group-hover:rotate-12" />
          </button>

          {/* Embedded Input Textarea with High-Contrast Text */}
          <div className="flex-1 rounded-2xl px-3.5 py-2 flex items-center min-h-[46px] border border-white/15 bg-[#180E2E]/90 focus-within:bg-[#1E113A] focus-within:border-[#F472B6]/70 transition-all shadow-inner">
            <textarea
              ref={textareaRef}
              value={text}
              dir={isRtlInput ? "rtl" : "ltr"}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything, draft ideas, translate, or code..."
              disabled={disabled}
              rows={1}
              className={`w-full max-h-[160px] bg-transparent border-none outline-none resize-none text-white placeholder-slate-400 text-sm sm:text-[15px] font-semibold leading-relaxed ${
                isRtlInput ? "text-right" : "text-left"
              }`}
            />
          </div>

          {/* Voice Microphone Jelly Button: 3D Squishy Soundwave Gel */}
          <button
            type="button"
            onClick={handleMicToggle}
            disabled={disabled}
            className={`jelly-spring group relative w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer select-none transition-all ${
              isListening ? "animate-pulse" : ""
            }`}
            style={{
              background: isListening
                ? "linear-gradient(135deg, #F43F5E 0%, #E11D48 60%, #BE123C 100%)"
                : "linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(236, 72, 153, 0.35) 60%, rgba(168, 85, 247, 0.45) 100%)",
              border: isListening
                ? "1.5px solid rgba(255, 255, 255, 0.9)"
                : "1.2px solid rgba(255, 255, 255, 0.65)",
              boxShadow: isListening
                ? "inset 0 2px 3px rgba(255, 255, 255, 0.9), inset 0 -2px 3px rgba(0, 0, 0, 0.4), 0 0 18px rgba(244, 63, 94, 0.85)"
                : `
                  inset 0 2px 2.5px rgba(255, 255, 255, 0.8),
                  inset 0 -2px 2.5px rgba(0, 0, 0, 0.45),
                  0 4px 12px rgba(0, 0, 0, 0.4)
                `,
            }}
            title={isListening ? "Stop voice dictation" : "Dictate with voice"}
            aria-label={isListening ? "Stop voice dictation" : "Start voice dictation"}
          >
            {/* Top Gloss Glaze */}
            <div className="absolute inset-x-1 top-0.5 h-[40%] rounded-t-xl bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none" />
            {isListening ? (
              <MicOff className="w-4.5 h-4.5 text-white relative z-10" />
            ) : (
              <Mic className="w-4.5 h-4.5 text-white/95 relative z-10 transition-transform duration-200 group-hover:scale-110" />
            )}
          </button>

          {/* Send Button: SQUISHY 3D JELLY BUTTON with Spring Physics */}
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="jelly-spring w-11 h-11 rounded-2xl bg-rose-950/80 text-rose-300 border border-rose-500/50 flex items-center justify-center shrink-0 cursor-pointer"
              title="Stop response"
              aria-label="Stop response"
            >
              <Square className="w-4 h-4 fill-current text-white" />
            </button>
          ) : (
            <button
              id="composer-send-btn"
              type="button"
              onClick={handleSend}
              disabled={disabled || (!text.trim() && attachments.length === 0)}
              className="jelly-spring group relative w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none select-none"
              style={{
                background: "linear-gradient(135deg, #FF66A1 0%, #C04CF0 50%, #7C3AED 100%)",
                border: "1.4px solid rgba(255, 255, 255, 0.85)",
                boxShadow:
                  "inset 0 2.5px 3.5px rgba(255, 255, 255, 0.9), inset 0 -2.5px 3.5px rgba(0, 0, 0, 0.5), 0 4px 18px rgba(236, 72, 153, 0.45)",
              }}
              title="Send message"
              aria-label="Send message"
            >
              {/* Glossy top glaze */}
              <div className="absolute inset-x-1.5 top-0.5 h-[42%] rounded-t-xl bg-gradient-to-b from-white/85 via-white/30 to-transparent pointer-events-none" />
              <SendHorizontal className="w-5 h-5 text-white stroke-[2.6] relative z-10 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]" />
            </button>
          )}
        </div>

        {/* Clean, Non-Messy Helper Footer */}
        <div className="flex items-center justify-between px-2 pt-0.5 text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-1.5 text-[#F9A8D4] font-bold">
            <span role="img" aria-label="ribbon">🎀</span>
            <span>ARFA AI</span>
          </div>

          <span className="hidden sm:inline-block text-slate-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white font-bold border border-white/10">Enter ↵</kbd> to send
          </span>
        </div>
      </div>
    </div>
  );
};
