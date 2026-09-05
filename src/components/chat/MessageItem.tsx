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
          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 text-neutral-900 dark:text-neutral-100 shadow-xs ${
            isRtl ? "text-right" : "text-left"
          }`}
        >
          {/* Attachments if any */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200"
                >
                  <FileText className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="truncate max-w-[140px] font-medium">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          <p className="whitespace-pre-wrap text-sm sm:text-[15px] leading-relaxed select-text m-0 font-normal">
            {message.content}
          </p>

          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-neutral-400 select-none">
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
        className={`flex-1 min-w-0 rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-neutral-700/80 shadow-xs text-neutral-900 dark:text-neutral-100 ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        {/* Header: Identity & Model Indicator */}
        <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
              ARFA AI
            </span>
            {message.model && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                <Sparkles className="w-2.5 h-2.5 text-neutral-500" />
                {message.model}
              </span>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleSpeak}
              title={speaking ? "Stop speaking" : "Listen to response"}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {speaking ? <VolumeX className="w-3.5 h-3.5 text-neutral-900 dark:text-white" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              title={copied ? "Copied!" : "Copy response"}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                title="Regenerate response"
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Markdown Content with pristine readability */}
        <div className="markdown-body text-sm sm:text-[15px] leading-relaxed text-neutral-900 dark:text-neutral-100 min-h-[28px] flex flex-col justify-center">
          {isStreaming && (!message.content || message.content.trim().length === 0) ? (
            <div className="flex items-center gap-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-400 select-none">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 dark:bg-neutral-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neutral-900 dark:bg-neutral-100"></span>
              </span>
              <span className="font-semibold text-xs tracking-tight animate-pulse text-neutral-700 dark:text-neutral-300">
                Loading...
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
                <span className="inline-block w-2 h-4 ml-1 bg-neutral-800 dark:bg-neutral-200 animate-pulse align-middle" />
              )}
            </>
          )}

          {/* Generated Multimodal Media (Images, Videos) */}
          {message.media && message.media.length > 0 && (
            <MediaDisplay media={message.media} onPromptAction={onPromptAction} />
          )}
        </div>

        {/* Timestamp */}
        <div className="flex items-center justify-end mt-2 pt-1 text-[10px] text-neutral-400 select-none">
          <span>{messageTime}</span>
        </div>
      </div>
    </div>
  );
};
