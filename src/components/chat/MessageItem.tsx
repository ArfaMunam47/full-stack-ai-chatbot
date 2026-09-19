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
        className="group w-full flex justify-end py-1.5 px-1 sm:px-2 select-text"
      >
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className={`relative max-w-[82%] sm:max-w-[72%] rounded-[22px] px-4 sm:px-5 pt-3 sm:pt-3.5 pb-2.5 sm:pb-3 soft3d-user-bubble shadow-md overflow-hidden ${
            isRtl ? "text-right urdu-font text-[16px] leading-[2.1]" : "text-left text-[13.5px] sm:text-[14px] leading-relaxed font-medium"
          }`}
        >
          {/* 3D Glass Specular Curved Lens (Liquid Glass Claymorphism) */}
          <div className="absolute inset-x-1.5 top-0.5 h-[38%] rounded-t-[20px] bg-gradient-to-b from-white/55 via-white/15 to-transparent pointer-events-none" />
          <div className="absolute top-1 left-3.5 w-12 h-1.5 rounded-full bg-white/45 blur-[0.6px] pointer-events-none" />

          {/* Attached Files */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2 relative z-10">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] bg-white/20 text-white border border-white/30 font-bold shadow-2xs"
                >
                  <FileText className="w-3 h-3 text-rose-200" />
                  <span className="truncate max-w-[120px]">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          <p className="whitespace-pre-wrap select-text m-0 text-white font-medium tracking-tight relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.38)]">
            {message.content}
          </p>

          <div className="flex items-center justify-end gap-1 mt-1 text-[9.5px] text-white/90 select-none font-semibold relative z-10">
            <span>{messageTime}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`message-assistant-${message.id}`}
      className="group w-full flex items-start gap-2.5 py-2 px-1 sm:px-2 select-text"
    >
      {/* 3D Soft Emblem Avatar */}
      <div className="shrink-0 mt-0.5">
        <PookieJellyLogo size="xs" showText={false} isAnimated={isStreaming} />
      </div>

      {/* Assistant Message: 3D Frosted Liquid-Glass Chassis Container */}
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className={`soft3d-ai-container flex-1 min-w-0 p-3.5 sm:p-4 relative overflow-hidden ${
          isRtl ? "text-right urdu-font" : "text-left"
        }`}
      >
        {/* 3D Frosted Glass Specular Curved Lens (Claymorphism Sheen) */}
        <div className="absolute inset-x-2 top-0.5 h-[32%] rounded-t-[22px] bg-gradient-to-b from-white/80 via-white/20 to-transparent pointer-events-none" />
        <div className="absolute top-1 left-4 w-16 h-1.5 rounded-full bg-white/60 blur-[0.8px] pointer-events-none" />

        {/* Markdown Content with Crystal-Clear Editorial Typography */}
        <div className="markdown-body min-h-[26px] text-[13.5px] sm:text-[14px] leading-relaxed font-normal text-[#3D1429] relative z-10">
          {isStreaming && (!message.content || message.content.trim().length === 0) ? (
            /* Thinking State: Luminous amber-rose pulse */
            <div className="flex items-center gap-2.5 py-1.5 text-xs select-none">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FB7185] animate-ping" />
                <span className="w-2 h-2 rounded-full bg-[#F472B6] shadow-[0_0_8px_rgba(244,114,182,0.8)] animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E] animate-bounce" />
              </div>
              <span className="font-bold text-[11.5px] tracking-tight text-rose-500 animate-pulse flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#FB7185]" />
                ARFA AI is thinking... 💕
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
                        <code className="px-1.5 py-0.5 rounded-md bg-pink-100/90 text-[#BE123C] font-mono text-xs border border-pink-200" {...rest}>
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
                <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#F472B6] animate-pulse align-middle rounded-full" />
              )}
            </>
          )}

          {/* Multimodal Media if generated */}
          {message.media && message.media.length > 0 && (
            <MediaDisplay media={message.media} onPromptAction={onPromptAction} />
          )}
        </div>

        {/* Action Toolbar - Floating Minimalist Bar */}
        {!isStreaming && (
          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-pink-100 text-[#8A4B6E] relative z-10">
            {message.content && message.content.trim().length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleCopy}
                  title={copied ? "Copied to clipboard" : "Copy response"}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-pink-50 hover:bg-pink-100 text-[#3D1429] hover:text-[#BE123C] border border-pink-200/80 cursor-pointer transition-all active:scale-95 shadow-2xs"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" /> : <Copy className="w-3 h-3 text-rose-500" />}
                  <span className="text-[10.5px] font-bold">{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSpeak}
                  title={speaking ? "Stop reading aloud" : "Read response aloud"}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-pink-50 hover:bg-pink-100 text-[#3D1429] hover:text-[#BE123C] border border-pink-200/80 cursor-pointer transition-all active:scale-95 shadow-2xs"
                >
                  {speaking ? <VolumeX className="w-3 h-3 text-rose-600" /> : <Volume2 className="w-3 h-3 text-rose-500" />}
                  <span className="text-[10.5px] font-bold">{speaking ? "Stop" : "Listen"}</span>
                </button>
              </>
            )}
            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                title="Regenerate response"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-pink-50 hover:bg-pink-100 text-[#3D1429] hover:text-[#BE123C] border border-pink-200/80 cursor-pointer transition-all active:scale-95 shadow-2xs"
              >
                <RotateCcw className="w-3 h-3 text-rose-500" />
                <span className="text-[10.5px] font-bold">Retry</span>
              </button>
            )}
            <span className="ml-auto text-[10px] text-[#8A4B6E] select-none font-semibold">
              {messageTime}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
