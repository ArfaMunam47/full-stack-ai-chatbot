import React, { useRef, useEffect, useState } from "react";
import { ArrowUp, Square, Paperclip, Mic, MicOff, X, FileText, Image as ImageIcon } from "lucide-react";
import { MessageAttachment } from "../../types.ts";
import { api } from "../../lib/api.ts";

interface MessageComposerProps {
  onSend: (message: string, attachments?: MessageAttachment[]) => void;
  isStreaming: boolean;
  onStop: () => void;
  disabled?: boolean;
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
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 180);
    el.style.height = `${Math.max(nextHeight, 48)}px`;
  }, [text]);

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      setVoiceNotice("Voice dictation is supported in modern browsers like Chrome and Safari.");
      setTimeout(() => setVoiceNotice(null), 3500);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech recognition error:", err);
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
      textareaRef.current.style.height = "48px";
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
      alert(msg);
    } finally {
      setIsUploading(false);
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl w-full mx-auto">
      {voiceNotice && (
        <div className="mb-2.5 text-xs text-[#C26767] dark:text-[#E59C9C] bg-[#FDF2F2] dark:bg-[#23191C] p-3 rounded-xl border border-[#E8D3D3] dark:border-[#4A3338] text-center">
          {voiceNotice}
        </div>
      )}

      {/* Main Soft Editorial Depth Composer Box */}
      <div
        className={`bg-white dark:bg-[#1A1517] border rounded-2xl p-3.5 sm:p-4 shadow-xs transition-all duration-200 ${
          isListening
            ? "border-[#C26767] dark:border-[#C87575] ring-2 ring-[#C87575]/20"
            : "border-[#E8D7D7] dark:border-[#33272A] focus-within:border-[#C26767] dark:focus-within:border-[#C87575] focus-within:ring-2 focus-within:ring-[#C87575]/20"
        }`}
      >
        {/* Attachment preview pills */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2.5">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#F6EEEE] dark:bg-[#23191C] border border-[#E8D7D7] dark:border-[#38282C] text-[#282122] dark:text-[#FAF4F4]"
              >
                <FileText className="w-3.5 h-3.5 text-[#C26767] dark:text-[#C87575]" />
                <span className="truncate max-w-[140px] font-medium">{att.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="text-[#786E70] dark:text-[#A3989A] hover:text-[#C26767] dark:hover:text-[#C87575] ml-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Area */}
        <textarea
          id="message-composer-input"
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening... speak now" : "Message Arfa AI..."}
          disabled={disabled || isStreaming}
          className="w-full bg-transparent resize-none border-none outline-none text-[#282122] dark:text-[#FAF4F4] placeholder-[#786E70] dark:placeholder-[#766B6D] text-[15px] min-h-[48px] leading-relaxed select-text"
        />

        {/* Action Controls & Send Button */}
        <div className="flex justify-between items-center pt-2.5 mt-1 border-t border-[#F6EEEE] dark:border-[#292023]">
          <div className="flex items-center gap-1 text-[#786E70] dark:text-[#A3989A]">
            {/* File Input */}
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
              title="Attach file (code, docs, txt)"
              className="p-2 hover:bg-[#FDF2F2] dark:hover:bg-[#23191C] hover:text-[#C26767] dark:hover:text-[#C87575] rounded-xl transition-colors cursor-pointer"
            >
              <Paperclip className="w-[18px] h-[18px]" />
            </button>

            {/* Voice Input Button */}
            <button
              id="composer-voice-btn"
              type="button"
              onClick={toggleVoice}
              disabled={isStreaming}
              title={isListening ? "Stop listening" : "Voice dictation"}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isListening
                  ? "text-white bg-[#C26767] dark:bg-[#C87575] animate-pulse"
                  : "hover:bg-[#FDF2F2] dark:hover:bg-[#23191C] hover:text-[#C26767] dark:hover:text-[#C87575]"
              }`}
            >
              {isListening ? <MicOff className="w-[18px] h-[18px]" /> : <Mic className="w-[18px] h-[18px]" />}
            </button>

            {/* Image Input Button */}
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              id="composer-image-btn"
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isUploading || isStreaming}
              title="Upload image"
              className="p-2 hover:bg-[#FDF2F2] dark:hover:bg-[#23191C] hover:text-[#C26767] dark:hover:text-[#C87575] rounded-xl transition-colors cursor-pointer"
            >
              <ImageIcon className="w-[18px] h-[18px]" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Stop generation button */}
            {isStreaming ? (
              <button
                id="composer-stop-btn"
                type="button"
                onClick={onStop}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#282122] text-white dark:bg-[#FAF4F4] dark:text-[#191416] text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              /* Send button with arrow */
              <button
                id="composer-send-btn"
                type="button"
                onClick={handleSubmit}
                disabled={(!text.trim() && attachments.length === 0) || disabled}
                aria-label="Send message"
                className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                  text.trim() || attachments.length > 0
                    ? "bg-[#C26767] dark:bg-[#C87575] text-white hover:bg-[#AA5454] dark:hover:bg-[#B66464] shadow-xs active:scale-95"
                    : "bg-[#F6EEEE] dark:bg-[#23191C] text-[#A39698] dark:text-[#554649] cursor-not-allowed opacity-70"
                }`}
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-center text-[#786E70] dark:text-[#766B6D] mt-3 select-none">
        Arfa AI is an intelligent assistant. Responses may occasionally need verification.
      </p>
    </div>
  );
};
