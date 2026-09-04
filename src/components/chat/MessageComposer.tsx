import React, { useRef, useEffect, useState } from "react";
import {
  ArrowUp,
  Square,
  Paperclip,
  Mic,
  MicOff,
  X,
  FileText,
  Languages,
  AlertCircle,
  Check,
} from "lucide-react";
import { MessageAttachment } from "../../types.ts";
import { api } from "../../lib/api.ts";

interface MessageComposerProps {
  onSend: (message: string, attachments?: MessageAttachment[]) => void;
  isStreaming: boolean;
  onStop: () => void;
  disabled?: boolean;
}

type MicState = "idle" | "listening" | "processing" | "error";

// Detect Arabic/Urdu/Hebrew/Persian for natural RTL flow
export function isRTLText(text: string): boolean {
  const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlRegex.test(text);
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  isStreaming,
  onStop,
  disabled = false,
}) => {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [micState, setMicState] = useState<MicState>("idle");
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("auto");
  const [showLangMenu, setShowLangMenu] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const languages = [
    { code: "auto", label: "Auto Detect", flag: "🌐" },
    { code: "en-US", label: "English", flag: "🇺🇸" },
    { code: "ur-PK", label: "Urdu (اردو)", flag: "🇵🇰" },
    { code: "ar-SA", label: "Arabic (العربية)", flag: "🇸🇦" },
    { code: "es-ES", label: "Spanish (Español)", flag: "🇪🇸" },
    { code: "fr-FR", label: "French (Français)", flag: "🇫🇷" },
    { code: "de-DE", label: "German (Deutsch)", flag: "🇩🇪" },
  ];

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 180);
    el.style.height = `${Math.max(nextHeight, 44)}px`;
  }, [text]);

  // Speech recognition initialization
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage === "auto" ? "en-US" : selectedLanguage;

      recognition.onstart = () => {
        setMicState("listening");
        setMicNotice(null);
      };

      recognition.onresult = (event: any) => {
        setMicState("processing");
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setText((prev) => (prev ? `${prev.trim()} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setMicState("error");
        setMicNotice(event.error === "not-allowed" ? "Microphone permission was denied." : "Voice error occurred.");
        setTimeout(() => {
          setMicState("idle");
          setMicNotice(null);
        }, 4000);
      };

      recognition.onend = () => {
        setMicState("idle");
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLanguage]);

  const handleMicToggle = () => {
    if (!recognitionRef.current) {
      setMicNotice("Speech recognition is supported in modern browsers like Chrome, Edge, and Safari.");
      setTimeout(() => setMicNotice(null), 4000);
      return;
    }

    if (micState === "listening") {
      recognitionRef.current.stop();
      setMicState("idle");
    } else {
      try {
        if (selectedLanguage !== "auto" && recognitionRef.current) {
          recognitionRef.current.lang = selectedLanguage;
        }
        recognitionRef.current.start();
        setMicState("listening");
      } catch (err) {
        console.error("Mic start error:", err);
        setMicState("error");
        setTimeout(() => setMicState("idle"), 2500);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if ((!text.trim() && attachments.length === 0) || isStreaming || disabled) return;
    const msgToSend = text.trim();
    const attToSend = [...attachments];
    setText("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
    onSend(msgToSend, attToSend);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploaded = await api.uploadFile(file);
        setAttachments((prev) => [...prev, uploaded]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "File upload failed";
      setMicNotice(msg);
      setTimeout(() => setMicNotice(null), 4000);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const isRtl = isRTLText(text);

  return (
    <div className="p-3 sm:p-4 max-w-4xl w-full mx-auto select-none">
      {/* Alert or Notice Banner */}
      {micNotice && (
        <div className="mb-2 text-xs text-[#1F130B] dark:text-[#FAF6F0] bg-[#F5EFEB] dark:bg-[#1E140C] p-2.5 rounded-xl border border-[#DDD1C2] dark:border-[#3E291C] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-[#543D2B] dark:text-[#D8C9BC] shrink-0" />
            <span className="font-medium">{micNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setMicNotice(null)}
            className="text-[#7A6250] hover:text-[#1F130B] dark:text-[#A89584] p-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Tactile Stitched Composer Container from Image 1 */}
      <div
        id="arfa-tactile-composer"
        className="tactile-composer-bar rounded-3xl p-2 sm:p-2.5 transition-all duration-200 shadow-md"
      >
        {/* Attachment Pills */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2 px-1">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-[#FCFAF7] dark:bg-[#261A12] border border-[#DDD1C2] dark:border-[#3E291C] text-[#1F130B] dark:text-[#FAF6F0]"
              >
                <FileText className="w-3.5 h-3.5 text-[#543D2B] dark:text-[#D8C9BC]" />
                <span className="truncate max-w-[150px] font-medium">{att.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="text-[#7A6250] hover:text-[#1F130B] dark:text-[#A89584] ml-1 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Inner Controls Row */}
        <div className="flex items-end gap-2">
          {/* File Attachment Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
          />
          <button
            id="composer-attachment-btn"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isStreaming}
            title="Attach file"
            className="tactile-raised h-11 w-11 rounded-2xl text-[#543D2B] hover:text-[#1F130B] dark:text-[#D8C9BC] dark:hover:text-[#FAF6F0] cursor-pointer flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-xs"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Center: Recessed Input Well */}
          <div className="tactile-recessed flex-1 rounded-2xl px-3.5 py-2 flex flex-col justify-center min-h-[44px] transition-all">
            <textarea
              id="message-composer-input"
              ref={textareaRef}
              dir={isRtl ? "rtl" : "ltr"}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                micState === "listening"
                  ? "Listening... speak clearly"
                  : micState === "processing"
                  ? "Transcribing voice..."
                  : "Message Arfa AI..."
              }
              disabled={disabled || isStreaming}
              className={`w-full bg-transparent resize-none border-none outline-none text-[#1F130B] dark:text-[#FAF6F0] placeholder-[#8C7563] dark:placeholder-[#A89584] text-[15px] sm:text-[15.5px] leading-relaxed select-text font-normal ${
                isRtl ? "text-right font-sans" : "text-left"
              }`}
            />
          </div>

          {/* Right Controls: Waveform, Golden Bronze Mic Dial, Send/Stop */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Active Voice Waveform */}
            {micState === "listening" && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#EFE8DF] dark:bg-[#261A12] border border-[#DDD1C2] dark:border-[#3E291C]">
                <div className="flex items-center gap-0.5 h-4 px-1">
                  <span className="w-1 bg-[#2E1B10] dark:bg-[#FAF6F0] rounded-full waveform-bar-1" />
                  <span className="w-1 bg-[#2E1B10] dark:bg-[#FAF6F0] rounded-full waveform-bar-2" />
                  <span className="w-1 bg-[#2E1B10] dark:bg-[#FAF6F0] rounded-full waveform-bar-3" />
                  <span className="w-1 bg-[#2E1B10] dark:bg-[#FAF6F0] rounded-full waveform-bar-4" />
                  <span className="w-1 bg-[#2E1B10] dark:bg-[#FAF6F0] rounded-full waveform-bar-5" />
                </div>
              </div>
            )}

            {/* Tactile Microphone Dial from Image 1 */}
            <button
              id="composer-tactile-mic-btn"
              type="button"
              onClick={handleMicToggle}
              disabled={isStreaming}
              title={
                micState === "listening"
                  ? "Click to finish voice input"
                  : "Click to speak with Arfa AI"
              }
              className={`tactile-mic-dial ${
                micState === "listening" ? "is-listening" : ""
              }`}
              aria-label="Voice input"
            >
              {micState === "listening" ? (
                <MicOff className="w-4 h-4 text-[#FAF6F0] animate-pulse" />
              ) : (
                <Mic className="w-4 h-4 text-[#FAF6F0]" />
              )}
            </button>

            {/* Stop Generation or Send Button */}
            {isStreaming ? (
              <button
                id="composer-stop-btn"
                type="button"
                onClick={onStop}
                className="tactile-espresso h-11 px-3.5 rounded-2xl text-xs font-semibold text-[#FAF6F0] flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                title="Stop generating"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              (text.trim() || attachments.length > 0) && (
                <button
                  id="composer-send-btn"
                  type="button"
                  onClick={handleSubmit}
                  disabled={(!text.trim() && attachments.length === 0) || disabled}
                  aria-label="Send message"
                  className="tactile-espresso h-11 w-11 rounded-2xl text-[#FAF6F0] transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-sm animate-fadeIn"
                >
                  <ArrowUp className="w-4 h-4 text-inherit" />
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Clean Disclaimer from Image 1 & ChatGPT */}
      <p className="text-[11px] text-center text-[#7A6250] dark:text-[#A89584] mt-2 select-none tracking-tight font-medium">
        Arfa AI can make mistakes. Consider checking important information.
      </p>
    </div>
  );
};
