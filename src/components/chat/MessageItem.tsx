import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "../../types.ts";
import { PookieJellyLogo } from "../ui/PookieJellyLogo.tsx";
import { CodeBlock } from "./CodeBlock.tsx";
import { MediaDisplay } from "./MediaDisplay.tsx";
import { PresentationDeck } from "./PresentationDeck.tsx";
import { Copy, Check, Volume2, VolumeX, RotateCcw, FileText, Sparkles } from "lucide-react";

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onPromptAction?: (text: string) => void;
}

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
      const rtlVoice = voices.find(
        (v) =>
          v.lang.startsWith("ur") ||
          v.lang.startsWith("ar") ||
          v.lang.startsWith("fa") ||
          v.name.toLowerCase().includes("multilingual")
      );
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
        className="group w-full flex justify-end py-2 px-1 sm:px-2 select-text"
      >
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className={`max-w-[85%] sm:max-w-[76%] rounded-[24px] px-4.5 py-3.5 plush-bubble-user text-white shadow-md ${
            isRtl ? "text-right urdu-font text-[17px] leading-[2.2]" : "text-left text-sm sm:text-[15px] leading-relaxed font-medium"
          }`}
        >
          {/* Attached Files */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2.5">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-white/15 text-white border border-white/20"
                >
                  <FileText className="w-3.5 h-3.5 text-white/90" />
                  <span className="truncate max-w-[140px] font-semibold">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          <p className="whitespace-pre-wrap select-text m-0 text-white/95 font-medium tracking-tight">
            {message.content}
          </p>

          <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] text-white/70 select-none font-medium">
            <span>{messageTime}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`message-assistant-${message.id}`}
      className="group w-full flex items-start gap-3 sm:gap-3.5 py-3 px-1 sm:px-2 select-text"
    >
      {/* 3D Pookie Jelly Avatar Emblem */}
      <div className="shrink-0 mt-0.5">
        <PookieJellyLogo size="sm" showText={false} isAnimated={isStreaming} />
      </div>

      {/* Assistant Message: Open Natural Flow (No Enclosing Box, exactly like ChatGPT) */}
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className={`flex-1 min-w-0 text-[#F8FAFC] pt-0.5 ${
          isRtl ? "text-right urdu-font" : "text-left"
        }`}
      >
        {/* Markdown Content with Clean Editorial Typography */}
        <div className="markdown-body min-h-[28px] text-[15px] leading-relaxed font-normal text-[#F1F5F9]">
          {isStreaming && (!message.content || message.content.trim().length === 0) ? (
            /* Thinking State: Luminous stardust dots + pulse */
            <div className="flex items-center gap-3 py-2 text-xs select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-ping" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] shadow-[0_0_12px_rgba(168,85,247,0.8)] animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-bounce" />
              </div>
              <span className="font-bold text-xs tracking-tight text-[#E9D5FF] animate-pulse flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F472B6]" />
                ARFA AI is synthesizing through the cosmos...
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
                        <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-pink-300 font-mono text-xs border border-white/20" {...rest}>
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
                <span className="inline-block w-2 h-4.5 ml-1 bg-[#EC4899] animate-pulse align-middle rounded-full" />
              )}
            </>
          )}

          {/* Multimodal Media if generated */}
          {message.media && message.media.length > 0 && (
            <MediaDisplay media={message.media} onPromptAction={onPromptAction} />
          )}
        </div>

        {/* Action Toolbar - Minimalist ChatGPT style */}
        {!isStreaming && (
          <div className="flex items-center gap-1.5 mt-2.5 text-slate-400">
            <button
              type="button"
              onClick={handleCopy}
              title={copied ? "Copied to clipboard" : "Copy response"}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-medium">{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              type="button"
              onClick={handleSpeak}
              title={speaking ? "Stop reading aloud" : "Read response aloud"}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-all active:scale-95"
            >
              {speaking ? <VolumeX className="w-3.5 h-3.5 text-[#F472B6]" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-medium">{speaking ? "Stop" : "Listen"}</span>
            </button>
            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                title="Regenerate response"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-all active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Retry</span>
              </button>
            )}
            <span className="ml-auto text-[10.5px] text-slate-500 select-none font-medium">
              {messageTime}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
