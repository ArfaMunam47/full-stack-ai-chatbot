import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "../../types.ts";
import { ArfaLogo } from "../ui/ArfaLogo.tsx";
import { CodeBlock } from "./CodeBlock.tsx";
import { Copy, Check, Volume2, VolumeX, RotateCcw, FileText, Sparkles } from "lucide-react";

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isStreaming = false,
  onRegenerate,
}) => {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const isUser = message.role === "user";

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
    // Clean markdown syntax for speech
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
      <div id={`message-user-${message.id}`} className="group w-full max-w-4xl mx-auto flex justify-end py-2.5 px-3 sm:px-4">
        <div className="max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 bg-[#F6EEEE] dark:bg-[#20181A] text-[#282122] dark:text-[#FAF4F4] border border-[#E8D7D7] dark:border-[#38272C] shadow-2xs">
          {/* Attachments if present */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2.5">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-[#191416] border border-[#E8D7D7] dark:border-[#38272C] text-[#282122] dark:text-[#FAF4F4]"
                >
                  <FileText className="w-3.5 h-3.5 text-[#C26767] dark:text-[#C87575]" />
                  <span className="truncate max-w-[140px] font-medium">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          <p className="whitespace-pre-wrap text-[15px] leading-relaxed select-text m-0">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id={`message-assistant-${message.id}`} className="group w-full max-w-4xl mx-auto flex items-start gap-3.5 py-3.5 px-3 sm:px-4">
      {/* Arfa Avatar */}
      <div className="shrink-0 mt-0.5">
        <ArfaLogo size="sm" showText={false} />
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        {/* Model info & header */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-semibold text-[#282122] dark:text-[#FAF4F4]">
            Arfa AI
          </span>
          {message.model && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FDF2F2] dark:bg-[#23191C] text-[#C26767] dark:text-[#E59C9C] border border-[#E8D3D3] dark:border-[#3D2B30]">
              <Sparkles className="w-2.5 h-2.5" />
              {message.model}
            </span>
          )}
        </div>

        {/* Markdown Content */}
        <div className="markdown-content text-[15px] leading-relaxed text-[#282122] dark:text-[#FAF4F4]">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom code block renderer
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

        {/* Action bar below finished message */}
        {!isStreaming && message.content && (
          <div className="flex items-center gap-1.5 mt-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              id={`copy-msg-btn-${message.id}`}
              onClick={handleCopy}
              title="Copy message"
              className="p-1.5 rounded-lg text-[#786E70] dark:text-[#A3989A] hover:text-[#C26767] dark:hover:text-[#C87575] hover:bg-[#FDF2F2] dark:hover:bg-[#23191C] transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              id={`speak-msg-btn-${message.id}`}
              onClick={handleSpeak}
              title={speaking ? "Stop reading" : "Read aloud"}
              className={`p-1.5 rounded-lg text-[#786E70] dark:text-[#A3989A] hover:text-[#C26767] dark:hover:text-[#C87575] hover:bg-[#FDF2F2] dark:hover:bg-[#23191C] transition-colors cursor-pointer ${
                speaking ? "text-[#C26767] dark:text-[#C87575]" : ""
              }`}
            >
              {speaking ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>

            {onRegenerate && (
              <button
                id={`regen-msg-btn-${message.id}`}
                onClick={onRegenerate}
                title="Regenerate response"
                className="p-1.5 rounded-lg text-[#786E70] dark:text-[#A3989A] hover:text-[#C26767] dark:hover:text-[#C87575] hover:bg-[#FDF2F2] dark:hover:bg-[#23191C] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
