import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "../../types.ts";
import { ArfaLogo } from "../ui/ArfaLogo.tsx";
import { CodeBlock } from "./CodeBlock.tsx";
import { MediaDisplay } from "./MediaDisplay.tsx";
import { Copy, Check, Volume2, VolumeX, RotateCcw, FileText, Sparkles } from "lucide-react";

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onPromptAction?: (text: string) => void;
}

// RTL character detection for Arabic, Urdu, Hebrew, Persian
const isRTLText = (str: string): boolean => {
  return /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(str);
};

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isStreaming = false,
  onRegenerate,
  onPromptAction,
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
        className="group w-full max-w-3xl mx-auto flex justify-end py-2 px-4 select-text"
      >
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 bg-[#F6F3F1] border border-[#EFE9E6] text-[#1A1718] shadow-xs ${
            isRtl ? "text-right" : "text-left"
          }`}
        >
          {/* Attachments if any */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white border border-[#EFE9E6] text-[#5A5456]"
                >
                  <FileText className="w-3.5 h-3.5 text-[#7E7779]" />
                  <span className="truncate max-w-[140px] font-medium">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          <p className="whitespace-pre-wrap text-sm sm:text-[15px] leading-relaxed select-text m-0 font-normal text-[#1A1718]">
            {message.content}
          </p>

          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#A39B9E] select-none">
            <span>{messageTime}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`message-assistant-${message.id}`}
      className="group w-full max-w-3xl mx-auto flex items-start gap-3 py-3 sm:py-4 px-4 select-text"
    >
      {/* Brand Emblem */}
      <div className="shrink-0 mt-0.5">
        <ArfaLogo size="sm" showText={false} />
      </div>

      {/* Assistant Message Body */}
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className={`flex-1 min-w-0 rounded-2xl p-4 sm:p-5 bg-white border border-[#EFE9E6] shadow-xs text-[#1A1718] ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        {/* Header: Identity & Model Indicator */}
        <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-[#EFE9E6]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-tight text-[#1A1718]">
              ARFA AI
            </span>
            {message.model && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FDF2F5] text-[#D84A70] border border-[#F7CDD8]">
                <Sparkles className="w-2.5 h-2.5 text-[#D84A70]" />
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
              className="p-1.5 rounded-lg text-[#7E7779] hover:text-[#D84A70] hover:bg-[#FDF2F5] transition-colors cursor-pointer"
            >
              {speaking ? <VolumeX className="w-3.5 h-3.5 text-[#D84A70]" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              title={copied ? "Copied!" : "Copy response"}
              className="p-1.5 rounded-lg text-[#7E7779] hover:text-[#1A1718] hover:bg-[#F6F3F1] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                title="Regenerate response"
                className="p-1.5 rounded-lg text-[#7E7779] hover:text-[#D84A70] hover:bg-[#FDF2F5] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Markdown Content with pristine readability */}
        <div className="markdown-body text-sm sm:text-[15px] leading-relaxed text-[#1A1718] min-h-[28px] flex flex-col justify-center">
          {isStreaming && (!message.content || message.content.trim().length === 0) ? (
            <div className="flex items-center gap-2.5 py-1.5 text-xs text-[#5A5456] select-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D84A70] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D84A70]"></span>
              </span>
              <span className="font-semibold text-xs tracking-tight text-[#5A5456] animate-pulse">
                AI is thinking...
              </span>
            </div>
          ) : (
            <>
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
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-[#D84A70] animate-pulse align-middle rounded-full" />
              )}
            </>
          )}

          {/* Generated Multimodal Media (Images, Videos) */}
          {message.media && message.media.length > 0 && (
            <MediaDisplay media={message.media} onPromptAction={onPromptAction} />
          )}
        </div>

        {/* Timestamp */}
        <div className="flex items-center justify-end mt-2 pt-1 text-[10px] text-[#A39B9E] select-none">
          <span>{messageTime}</span>
        </div>
      </div>
    </div>
  );
};
