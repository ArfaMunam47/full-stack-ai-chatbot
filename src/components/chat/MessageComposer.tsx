import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  ArrowUp,
  Square,
  Plus,
  Mic,
  MicOff,
  X,
  FileText,
  Loader2,
  Check,
} from "lucide-react";
import { MessageAttachment, ComposerMode } from "../../types.ts";
import { api } from "../../lib/api.ts";
import { NeedleFeltBow } from "../ui/NeedleFeltBow.tsx";
import { useSpeechToText } from "../../hooks/useSpeechToText.ts";

interface MessageComposerProps {
  onSend: (message: string, attachments?: MessageAttachment[], mode?: ComposerMode) => void;
  isStreaming: boolean;
  onStop: () => void;
  disabled?: boolean;
  activeMode?: ComposerMode;
  onModeChange?: (mode: ComposerMode) => void;
  statusText?: string | null;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  isStreaming,
  onStop,
  disabled = false,
  activeMode = "chat",
  statusText,
}) => {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const baseTextRef = useRef<string>("");

  // Production-grade speech-to-text hook with cross-browser support & explicit permissions
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
      // Audio transcription session concluded cleanly
    },
  });

  // Auto-resize textarea smoothly
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 180);
    el.style.height = `${Math.max(nextHeight, 40)}px`;
  }, [text]);

  // Expose helper to parent via custom event for quick actions
  useEffect(() => {
    const handleSetPrompt = (e: CustomEvent<string>) => {
      if (typeof e.detail === "string") {
        setText(e.detail);
        textareaRef.current?.focus();
      }
    };
    window.addEventListener("arfa:set-prompt" as any, handleSetPrompt);
    return () => window.removeEventListener("arfa:set-prompt" as any, handleSetPrompt);
  }, []);

  // Timer effect during active recording
  useEffect(() => {
    if (isListening) {
      setRecordingSeconds(0);
      const interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isListening]);

  // Toggle Microphone
  const handleMicToggle = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      setMicNotice(null);
      baseTextRef.current = text.trim();
      await startListening();
    }
  }, [isListening, stopListening, startListening, text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (disabled) return;
    if (isStreaming) {
      onStop();
      return;
    }

    if (!text.trim() && attachments.length === 0) return;

    // If recording while sending, stop recording
    if (isListening) {
      stopListening();
    }

    onSend(text.trim(), attachments, activeMode);
    setText("");
    setAttachments([]);
    baseTextRef.current = "";

    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} exceeds 10MB limit.`);
          continue;
        }
        const uploaded = await api.uploadFile(file);
        setAttachments((prev) => [...prev, uploaded]);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getPlaceholder = () => {
    if (isListening) return "Listening to your voice... (speak now)";
    return "Message ARFA AI...";
  };

  const isRtlInput = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);

  return (
    <div className="w-full">
      {/* Hidden File Input */}
      <input
        id="file-upload-input"
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Mic Warning or Status Fallback Toast Notification */}
      {micNotice && (
        <div
          id="mic-permission-toast"
          className="mb-2 px-3.5 py-2.5 rounded-2xl bg-[#FFF0F4] border-2 border-[#FFCCD9] text-xs text-[#9B2A48] flex items-center justify-between gap-3 shadow-md animate-fadeIn"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#FFE0E8] flex items-center justify-center shrink-0 text-[#E95D95]">
              <MicOff className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="font-semibold leading-relaxed">{micNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setMicNotice(null)}
            className="text-[#EC4899] hover:text-[#9B2A48] p-1 rounded-lg hover:bg-white/60 cursor-pointer shrink-0 transition-colors"
            title="Dismiss notice"
            aria-label="Dismiss notice"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Active Voice Recording Live Banner */}
      {isListening && (
        <div
          id="active-speech-recording-banner"
          className="mb-2 p-3 rounded-3xl felt-card-pink text-white flex items-center justify-between gap-3 shadow-md animate-fadeIn select-none"
        >
          <div className="flex items-center gap-2.5">
            <NeedleFeltBow color="white" size="xs" />
            <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center mic-pulse-glow">
              <Mic className="w-4 h-4 text-white animate-pulse" />
            </div>

            {/* Animated Wool Soundwave Bars */}
            <div className="flex items-center gap-1 h-5 px-1">
              <span className="w-1 bg-white rounded-full animate-wave-1" />
              <span className="w-1 bg-white rounded-full animate-wave-2" />
              <span className="w-1 bg-white rounded-full animate-wave-3" />
              <span className="w-1 bg-white rounded-full animate-wave-4" />
              <span className="w-1 bg-white rounded-full animate-wave-5" />
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-extrabold tracking-wide">
                Listening... {formatTimer(recordingSeconds)}
              </span>
              <span className="text-[10px] text-white/80 font-medium">
                Transcribing in real-time • Click mic or Done when finished
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
              className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer"
              title="Cancel voice input"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={stopListening}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-white text-[#EC4899] hover:bg-[#FFF5F8] text-xs font-extrabold shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="Done speaking"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}

      {/* Streaming Status Banner (e.g. Generating image, Veo rendering) */}
      {statusText && (
        <div className="mb-2 px-3.5 py-2 rounded-2xl bg-[#FDF2F6] border border-[#F9A8D4] text-xs text-[#EC4899] flex items-center gap-2 shadow-xs">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#EC4899]" />
          <span className="font-semibold">{statusText}</span>
        </div>
      )}

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl felt-btn-marshmallow text-xs text-[#32121E] shadow-xs"
            >
              {att.type.startsWith("image/") ? (
                <img
                  src={att.dataUrl || ""}
                  alt={att.name}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-lg object-cover"
                />
              ) : (
                <FileText className="w-4 h-4 text-[#8E6F7A]" />
              )}
              <span className="max-w-[120px] truncate text-[11px] font-bold">{att.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(idx)}
                className="text-[#B298A1] hover:text-[#EC4899] transition-colors p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3D Needle-Felted Marshmallow Floating Composer Bar */}
      <div
        id="floating-prompt-input-bar"
        className="relative rounded-[32px] felt-card-marshmallow p-2 sm:p-2.5 transition-all flex items-end gap-2 border-2 border-white/90 shadow-xl"
        style={{
          boxShadow:
            "inset 0px 2px 4px rgba(255, 255, 255, 0.95), 0px 12px 28px rgba(220, 100, 150, 0.16)",
        }}
      >
        {/* Left: Plus / Attach Button (Circular Plush Pill) */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading || isListening}
          className="w-10 h-10 rounded-full felt-btn-marshmallow text-[#5A4750] hover:text-[#E95D95] flex items-center justify-center shrink-0 cursor-pointer mb-0.5 border border-[#FFB7D5]/40 transition-transform active:scale-95"
          title="Add photo or document"
          aria-label="Add attachment"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Central: Auto-expanding Textarea (Strict line-height: 1.3, no text overlap) */}
        <textarea
          ref={textareaRef}
          value={text}
          dir={isRtlInput ? "rtl" : "ltr"}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          disabled={disabled}
          rows={1}
          className={`flex-1 max-h-[180px] py-2.5 px-2 text-sm sm:text-[15px] bg-transparent border-none outline-none resize-none text-[#2B1E25] placeholder-[#B8A3AD] leading-[1.3] font-medium ${
            isRtlInput ? "text-right" : "text-left"
          }`}
        />

        {/* Right Action Controls: Functional Microphone + Circular Pink Send Button */}
        <div className="flex items-center gap-2 shrink-0 mb-0.5">
          {/* Functional Needle-Felted Microphone Button with Pulsing Glow Animation */}
          <button
            id="composer-mic-toggle-btn"
            type="button"
            onClick={handleMicToggle}
            disabled={disabled}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95 border ${
              isListening
                ? "felt-btn-pink text-white mic-pulse-glow border-white/80 shadow-lg"
                : "felt-btn-marshmallow text-[#8E7882] hover:text-[#E95D95] border-[#FFB7D5]/40"
            }`}
            title={
              isListening
                ? "Listening... Click to stop recording"
                : "Dictate message with voice"
            }
            aria-label={isListening ? "Stop voice recording" : "Start voice recording"}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 text-white" />
            ) : (
              <Mic className="w-4 h-4 stroke-[2.3]" />
            )}
          </button>

          {/* Send or Stop Button (Pink Circular Send Button) */}
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="w-10 h-10 rounded-full bg-[#2B1E25] hover:bg-black text-white flex items-center justify-center shrink-0 transition-all shadow-md cursor-pointer active:scale-95 border-2 border-white/60"
              title="Stop generation"
              aria-label="Stop generation"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              id="composer-send-btn"
              type="button"
              onClick={handleSend}
              disabled={disabled || (!text.trim() && attachments.length === 0)}
              className="w-10 h-10 rounded-full felt-btn-pink disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 cursor-pointer active:scale-95 shadow-md border-2 border-white/60"
              title="Send message"
              aria-label="Send message"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.7]" />
            </button>
          )}
        </div>
      </div>

      {/* Subtle supporting line below composer */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5 select-none">
        <NeedleFeltBow color="pink" size="xs" />
        <p className="text-[11px] text-[#8E7882] font-semibold text-center leading-[1.3]">
          ARFA AI • Thoughts made easier
        </p>
      </div>
    </div>
  );
};
