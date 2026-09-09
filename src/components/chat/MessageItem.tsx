import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "../../types.ts";
import { ArfaLogo } from "../ui/ArfaLogo.tsx";
import { CodeBlock } from "./CodeBlock.tsx";
import { MediaDisplay } from "./MediaDisplay.tsx";
import { PresentationDeck } from "./PresentationDeck.tsx";
import { Copy, Check, Volume2, VolumeX, RotateCcw, FileText } from "lucide-react";

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
    if (isRtl) {
      const voices = window.speechSynthesis.getVoices();
      const rtlVoice = voices.find((v) => v.lang.startsWith("ur") || v.lang.startsWith("ar") || v.lang.startsWith("fa") || v.name.toLowerCase().includes("multilingual"));
      if (rtlVoice) {
        utterance.voice = rtlVoice;
        utterance.lang = rtlVoice.lang;
      }
    }
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
        className="group w-full max-w-3xl mx-auto flex justify-end py-2 px-3 sm:px-4 select-text"
      >
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className={`max-w-[85%] sm:max-w-[75%] rounded-[24px] px-4 sm:px-5 py-3.5 felt-bubble-user text-white shadow-md ${
            isRtl ? "text-right urdu-font text-[17px] leading-[2.2]" : "text-left text-sm sm:text-[15px] leading-relaxed font-medium"
          }`}
        >
          {/* Attachments if any */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2.5">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs bg-white/20 text-white border border-white/30"
                >
                  <FileText className="w-3.5 h-3.5 text-white" />
                  <span className="truncate max-w-[140px] font-bold">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          <p className="whitespace-pre-wrap select-text m-0 font-medium text-white">
            {message.content}
          </p>

          <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] text-white/80 select-none font-semibold">
            <span>{messageTime}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`message-assistant-${message.id}`}
      className="group w-full max-w-3xl mx-auto flex items-start gap-3 sm:gap-3.5 py-3 sm:py-4 px-3 sm:px-4 select-text"
    >
      {/* 3D Needle-Felted Brand Emblem */}
      <div className="shrink-0 mt-1">
        <ArfaLogo size="sm" showText={false} isAnimated={isStreaming} />
      </div>

      {/* Assistant Message Bubble in Warm Cream / Off-White Felt */}
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className={`flex-1 min-w-0 rounded-[26px] p-4 sm:p-5 felt-bubble-ai text-[#2B1E25] shadow-sm border border-white/95 ${
          isRtl ? "text-right urdu-font" : "text-left"
        }`}
      >
        {/* Markdown Content with pristine readability */}
        <div className="markdown-body min-h-[28px]">
          {isStreaming && (!message.content || message.content.trim().length === 0) ? (
            <div className="flex items-center gap-2.5 py-2 text-xs text-[#5A4750] select-none">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E95D95] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E95D95]"></span>
              </span>
              <span className="font-bold text-xs tracking-tight text-[#E95D95] animate-pulse">
                ARFA is crafting a response...
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
                    const lang = match ? match[1].toLowerCase() : "";
                    const rawContent = String(children).replace(/\n$/, "");

                    if (lang === "presentation") {
                      try {
                        const parsed = JSON.parse(rawContent);
                        if (parsed && parsed.slides && Array.isArray(parsed.slides)) {
                          return <PresentationDeck presentation={parsed} />;
                        }
                      } catch (e) {
                        console.warn("Could not parse presentation JSON block:", e);
                      }
                    }

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
                        code={rawContent}
                      />
                    );
                  },
                }}
              >
                {message.content}
              </Markdown>

              {/* Streaming Cursor */}
              {isStreaming && (
                <span className="inline-block w-2 h-4.5 ml-1 bg-[#E95D95] animate-pulse align-middle rounded-full shadow-xs" />
              )}
            </>
          )}

          {/* Generated Multimodal Media (Images, Videos) */}
          {message.media && message.media.length > 0 && (
            <MediaDisplay media={message.media} onPromptAction={onPromptAction} />
          )}
        </div>

        {/* Tactile Action Toolbar */}
        {!isStreaming && (
          <div className="flex items-center gap-2 mt-3 pt-1 text-[#8E7882]">
            <button
              type="button"
              onClick={handleCopy}
              title={copied ? "Copied!" : "Copy response"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs felt-btn-marshmallow hover:text-[#E95D95] cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-bold">{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              type="button"
              onClick={handleSpeak}
              title={speaking ? "Stop speaking" : "Listen to response"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs felt-btn-marshmallow hover:text-[#E95D95] cursor-pointer"
            >
              {speaking ? <VolumeX className="w-3.5 h-3.5 text-[#E95D95]" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-bold">{speaking ? "Stop" : "Read aloud"}</span>
            </button>
            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                title="Regenerate response"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs felt-btn-marshmallow hover:text-[#E95D95] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Retry</span>
              </button>
            )}
            <span className="ml-auto text-[10px] text-[#B8A3AD] select-none font-semibold">
              {messageTime}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
