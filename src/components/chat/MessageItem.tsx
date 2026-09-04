import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "../../types.ts";
import { ArfaLogo } from "../ui/ArfaLogo.tsx";
import { CodeBlock } from "./CodeBlock.tsx";
import { Copy, Check, Volume2, VolumeX, RotateCcw, FileText, Sparkles, CheckCheck } from "lucide-react";

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => void;
}

// RTL character detection for Arabic, Urdu, Hebrew, Persian
const isRTLText = (str: string): boolean => {
  return /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(str);
};

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isStreaming = false,
  onRegenerate,
}) => {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const isUser = message.role === "user";
  const isRtl = isRTLText(message.content);

  const messageTime = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for speech synthesis
    const cleanText = message.content.replace(/```[\s\S]*?```/g, "code block").replace(/[#*`_]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (isUser) {
    return (
      <div
        id={`message-user-${message.id}`}
        className="group w-full max-w-4xl mx-auto flex justify-end py-2 px-3 sm:px-5"
      >
        {/* Luxury Deep Espresso Tactile Treatment for User Message */}
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className={`max-w-[88%] md:max-w-[78%] rounded-2xl sm:rounded-3xl px-5 py-3.5 tactile-user-bubble select-text ${
            isRtl ? "text-right" : "text-left"
          }`}
        >
          {/* Attachments if any */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2.5">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white/10 border border-white/20 text-[#FAF6F0]"
                >
                  <FileText className="w-3.5 h-3.5 text-[#FAF6F0]/90" />
                  <span className="truncate max-w-[140px] font-medium">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          <p className="whitespace-pre-wrap text-[15px] sm:text-[15.5px] leading-relaxed select-text m-0 text-[#FAF6F0] font-normal">
            {message.content}
          </p>

          {/* Timestamp & Double Checkmarks (from Image 1) */}
          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#FAF6F0]/70 select-none">
            <span>{messageTime}</span>
            <CheckCheck className="w-3.5 h-3.5 text-[#FAF6F0]/80" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`message-assistant-${message.id}`}
      className="group w-full max-w-4xl mx-auto flex items-start gap-3 sm:gap-4 py-2.5 sm:py-3.5 px-3 sm:px-5"
    >
      {/* Original ARFA Emblem */}
      <div className="shrink-0 mt-1">
        <ArfaLogo size="sm" showText={false} />
      </div>

      {/* Warm Ivory Surface for Assistant Message */}
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className={`flex-1 min-w-0 tactile-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        {/* Header: Identity & Model Indicator */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#E5DDD3] dark:border-[#332217]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-tight text-[#1F130B] dark:text-[#FAF6F0]">
              Arfa AI
            </span>
            {message.model && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EFE8DF] dark:bg-[#261A12] text-[#543D2B] dark:text-[#D8C9BC] border border-[#E5DDD3] dark:border-[#332217]">
                <Sparkles className="w-2.5 h-2.5 text-[#543D2B] dark:text-[#D8C9BC]" />
                {message.model}
              </span>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleSpeak}
              title={speaking ? "Stop speaking" : "Listen to response"}
              className="p-1.5 rounded-lg text-[#7A6250] hover:text-[#1F130B] dark:text-[#A89584] dark:hover:text-[#FAF6F0] hover:bg-[#EFE8DF] dark:hover:bg-[#261A12] transition-colors cursor-pointer"
            >
              {speaking ? <VolumeX className="w-3.5 h-3.5 text-[#2E1B10] dark:text-[#FAF6F0]" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              title={copied ? "Copied!" : "Copy response"}
              className="p-1.5 rounded-lg text-[#7A6250] hover:text-[#1F130B] dark:text-[#A89584] dark:hover:text-[#FAF6F0] hover:bg-[#EFE8DF] dark:hover:bg-[#261A12] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                title="Regenerate response"
                className="p-1.5 rounded-lg text-[#7A6250] hover:text-[#1F130B] dark:text-[#A89584] dark:hover:text-[#FAF6F0] hover:bg-[#EFE8DF] dark:hover:bg-[#261A12] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Markdown Content */}
        <div className="markdown-content text-[15px] sm:text-[15.5px] leading-relaxed text-[#1F130B] dark:text-[#FAF6F0]">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              code(props) {
                const { className, children, ...rest } = props;
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match && !String(children).includes("\n");

                if (isInline) {
                  return (
                    <code className={className} {...rest}>
                      {children}
                    </code>
                  );
                }

                return (
                  <CodeBlock
                    language={match ? match[1] : "plaintext"}
                    code={String(children).replace(/\n$/, "")}
                  />
                );
              },
            }}
          >
            {message.content}
          </Markdown>

          {/* Streaming Cursor */}
          {isStreaming && <span className="streaming-cursor" />}
        </div>

        {/* Card Footer: Timestamp & Double Checkmarks (from Image 1) */}
        <div className="flex items-center justify-end gap-1.5 mt-2 pt-2 border-t border-[#E5DDD3]/60 dark:border-[#332217]/60 text-[10px] text-[#8C7563] dark:text-[#A89584] select-none">
          <span>{messageTime}</span>
          <CheckCheck className="w-3.5 h-3.5 text-[#543D2B] dark:text-[#D8C9BC]" />
        </div>
      </div>
    </div>
  );
};
