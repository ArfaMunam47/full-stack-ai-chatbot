import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  language?: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = "plaintext", code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const cleanLang = language.replace(/^language-/, "") || "code";

  return (
    <div className="relative my-3 rounded-2xl overflow-hidden border border-[#2B2527] bg-[#161314] shadow-sm text-neutral-100">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2B2527] bg-[#1E1A1B] text-xs">
        <span className="font-mono text-[#D4C8C5] font-medium text-[11px] lowercase tracking-wider">
          {cleanLang}
        </span>
        <button
          id={`copy-code-btn-${cleanLang}`}
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-white/90 bg-[#2B2527] hover:bg-[#3B3437] transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <div className="overflow-x-auto p-4 text-[13.5px] font-mono leading-relaxed text-[#FAF8F7]">
        <pre className="m-0 p-0 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
