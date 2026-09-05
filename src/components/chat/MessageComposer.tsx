import React, { useRef, useEffect, useState } from "react";
import {
  ArrowUp,
  Square,
  Plus,
  Mic,
  MicOff,
  X,
  FileText,
  Sparkles,
  Film,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { MessageAttachment } from "../../types.ts";
import { api } from "../../lib/api.ts";

interface MessageComposerProps {
  onSend: (message: string, attachments?: MessageAttachment[], mode?: "chat" | "image" | "video") => void;
  isStreaming: boolean;
  onStop: () => void;
  disabled?: boolean;
  activeMode?: "chat" | "image" | "video";
  onModeChange?: (mode: "chat" | "image" | "video") => void;
  statusText?: string | null;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  isStreaming,
  onStop,
  disabled = false,
  activeMode = "chat",
  onModeChange,
  statusText,
}) => {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [micNotice, setMicNotice] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const baseTextRef = useRef<string>("");

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

  // Web Speech API Initialization
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
          setMicNotice(null);
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const combinedSpoken = (finalTranscript || interimTranscript).trim();
          if (combinedSpoken) {
            const prefix = baseTextRef.current.trim();
            setText(prefix ? `${prefix} ${combinedSpoken}` : combinedSpoken);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("[SpeechRecognition Error]:", event.error);
          setIsListening(false);
          if (event.error === "not-allowed" || event.error === "permission-denied") {
            setMicNotice("Microphone permission was denied. Please allow microphone access in your browser.");
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn("SpeechRecognition init failed:", err);
      }
    }
  }, []);

  // Toggle Microphone (With Web Speech API and MediaRecorder Fallback)
  const handleMicToggle = async () => {
    setMicNotice(null);

    // If currently listening, stop
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    baseTextRef.current = text;

    // 1. Try Web Speech API first if supported
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        return;
      } catch (err) {
        console.warn("Web Speech API start error, trying fallback:", err);
      }
    }

    // 2. Fallback to MediaRecorder + Server-side Gemini transcription
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicNotice("Microphone recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (audioBlob.size === 0) return;

        setIsTranscribing(true);
        try {
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64Audio = reader.result as string;
              const transcribedText = await api.transcribeAudio(base64Audio, "audio/webm");
              if (transcribedText) {
                setText((prev) => (prev.trim() ? `${prev.trim()} ${transcribedText}` : transcribedText));
              }
            } catch (transcribeErr: any) {
              setMicNotice(transcribeErr.message || "Failed to transcribe audio.");
            } finally {
              setIsTranscribing(false);
            }
          };
          reader.readAsDataURL(audioBlob);
        } catch (readErr) {
          console.error("Audio conversion failed:", readErr);
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsListening(true);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setIsListening(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setMicNotice("Microphone permission was denied. Please allow microphone access.");
      } else {
        setMicNotice("Could not access microphone.");
      }
    }
  };

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

    onSend(text.trim(), attachments, activeMode);
    setText("");
    setAttachments([]);

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

  const getPlaceholder = () => {
    if (isListening) return "Listening... speak naturally to transcribe into composer";
    if (isTranscribing) return "Transcribing speech into text with Gemini...";
    if (activeMode === "image") return "Describe the image to generate or edit (Nano Banana)...";
    if (activeMode === "video") return "Describe the video to render (Veo 3.1)...";
    return "Ask ARFA AI anything, or ask to generate images & videos...";
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-3 sm:pb-5">
      {/* Hidden File Input */}
      <input
        id="file-upload-input"
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Mic Warning or Status Notice */}
      {micNotice && (
        <div className="mb-2 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
          <span>{micNotice}</span>
          <button
            type="button"
            onClick={() => setMicNotice(null)}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Streaming Status Banner (e.g. Generating image, Veo rendering) */}
      {statusText && (
        <div className="mb-2 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-600 dark:text-neutral-400" />
          <span className="font-medium">{statusText}</span>
        </div>
      )}

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 shadow-xs"
            >
              {att.type.startsWith("image/") ? (
                <img
                  src={att.dataUrl || ""}
                  alt={att.name}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded object-cover"
                />
              ) : (
                <FileText className="w-4 h-4 text-neutral-500" />
              )}
              <span className="max-w-[120px] truncate text-[11px] font-medium">{att.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(idx)}
                className="text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modality Mode Selector (Chat, Image, Video) */}
      <div className="flex items-center gap-1.5 mb-2 px-1 text-xs">
        <button
          type="button"
          onClick={() => onModeChange?.("chat")}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
            activeMode === "chat"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
              : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <MessageSquare className="w-3 h-3" />
          <span>Chat</span>
        </button>

        <button
          type="button"
          onClick={() => onModeChange?.("image")}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
            activeMode === "image"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
              : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Image</span>
        </button>

        <button
          type="button"
          onClick={() => onModeChange?.("video")}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
            activeMode === "video"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
              : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <Film className="w-3 h-3" />
          <span>Video</span>
        </button>
      </div>

      {/* Skeuomorphic Floating Composer Bar */}
      <div className="relative rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200 dark:border-neutral-700 shadow-md dark:shadow-none p-2 transition-all focus-within:border-neutral-400 dark:focus-within:border-neutral-500 flex items-end gap-2">
        {/* Plus Button for File Attachment */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer mb-0.5"
          title="Add photo or document"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          disabled={disabled}
          rows={1}
          className="flex-1 max-h-[180px] py-2 px-1 text-sm bg-transparent border-none outline-none resize-none text-neutral-900 dark:text-white placeholder-neutral-400 leading-relaxed"
        />

        {/* Action Controls: Mic + Send/Stop */}
        <div className="flex items-center gap-1.5 shrink-0 mb-0.5">
          {/* Tactile Listening Mic Button (Warm Ivory / Deep Coffee Theme, No Neon Colors) */}
          <button
            type="button"
            onClick={handleMicToggle}
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              isListening
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 ring-2 ring-neutral-400 dark:ring-neutral-500 animate-pulse shadow-sm"
                : isTranscribing
                ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
            title={isListening ? "Listening... click to stop" : isTranscribing ? "Transcribing..." : "Dictate with voice"}
          >
            {isTranscribing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="w-8 h-8 rounded-xl bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 flex items-center justify-center shrink-0 transition-all shadow-xs cursor-pointer"
              title="Stop generation"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={disabled || (!text.trim() && attachments.length === 0)}
              className="w-8 h-8 rounded-xl bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 disabled:opacity-30 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-white flex items-center justify-center shrink-0 transition-all shadow-xs cursor-pointer"
              title="Send message"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Subtle ChatGPT-style disclaimer below composer */}
      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 text-center mt-2">
        ARFA AI can make mistakes. Consider checking important information.
      </p>
    </div>
  );
};
