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

  const cleanLang = language.replace(/^language-/, "") || "plaintext";

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-[#3D291C] bg-[#140D08] shadow-sm text-neutral-200">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#3D291C] bg-[#1C120B] text-xs">
        <span className="font-mono text-[#C8B8A8] font-medium lowercase">
          {cleanLang}
        </span>
        <button
          id={`copy-code-btn-${cleanLang}`}
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-[#FAF6F0] bg-[#2B1B11] hover:bg-[#3D2619] transition-colors cursor-pointer"
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
      <div className="overflow-x-auto p-4 text-[13px] font-mono leading-relaxed text-[#FAF6F0]">
        <pre className="m-0 p-0 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
