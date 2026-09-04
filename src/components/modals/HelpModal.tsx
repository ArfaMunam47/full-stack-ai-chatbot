import React from "react";
import { X, Mic, Globe, MessageSquare, Sparkles, Keyboard, Shield } from "lucide-react";
import { ArfaLogo } from "../ui/ArfaLogo.tsx";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="tactile-card relative w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl text-[#1F130B] dark:text-[#FAF6F0] border border-[#DDD1C2] dark:border-[#3E291C] max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-[#7A6250] hover:text-[#1F130B] dark:text-[#A89584] dark:hover:text-[#FAF6F0] hover:bg-[#EFE8DF] dark:hover:bg-[#261A12] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <ArfaLogo size="sm" showText={false} />
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#1F130B] dark:text-[#FAF6F0]">
              Help & Guide
            </h2>
            <p className="text-xs text-[#543D2B] dark:text-[#D8C9BC]">
              Guide to getting the most out of Arfa AI
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          {/* Section: Voice interaction */}
          <div className="p-3.5 rounded-2xl bg-[#EFE8DF] dark:bg-[#261A12] border border-[#E5DDD3] dark:border-[#332217]">
            <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs text-[#1F130B] dark:text-[#FAF6F0]">
              <Mic className="w-4 h-4 text-[#2E1B10] dark:text-[#FAF6F0]" />
              <span>Tactile Voice Input</span>
            </div>
            <p className="text-xs text-[#543D2B] dark:text-[#D8C9BC] leading-relaxed">
              Click the embedded tactile microphone button in the composer to dictate messages directly. The microphone animates into an active listening state with dynamic audio waveforms.
            </p>
          </div>

          {/* Section: Multilingual */}
          <div className="p-3.5 rounded-2xl bg-[#EFE8DF] dark:bg-[#261A12] border border-[#E5DDD3] dark:border-[#332217]">
            <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs text-[#1F130B] dark:text-[#FAF6F0]">
              <Globe className="w-4 h-4 text-[#2E1B10] dark:text-[#FAF6F0]" />
              <span>Multilingual & RTL Support</span>
            </div>
            <p className="text-xs text-[#543D2B] dark:text-[#D8C9BC] leading-relaxed">
              Arfa AI communicates naturally in English, Urdu, Arabic, Spanish, French, German, and more. Right-to-Left (RTL) text flow is applied automatically when writing in Arabic or Urdu.
            </p>
          </div>

          {/* Section: Keyboard Shortcuts */}
          <div className="p-3.5 rounded-2xl bg-[#EFE8DF] dark:bg-[#261A12] border border-[#E5DDD3] dark:border-[#332217]">
            <div className="flex items-center gap-2 mb-2 font-semibold text-xs text-[#1F130B] dark:text-[#FAF6F0]">
              <Keyboard className="w-4 h-4 text-[#2E1B10] dark:text-[#FAF6F0]" />
              <span>Keyboard Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#FCFAF7] dark:bg-[#1E140C] border border-[#E5DDD3] dark:border-[#332217]">
                <span className="text-[#543D2B] dark:text-[#D8C9BC] font-medium">New Chat</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#EFE8DF] dark:bg-[#261A12] text-[10px] font-mono text-[#1F130B] dark:text-[#FAF6F0] border border-[#DDD1C2] dark:border-[#3E291C]">⌘K / Ctrl+K</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#FCFAF7] dark:bg-[#1E140C] border border-[#E5DDD3] dark:border-[#332217]">
                <span className="text-[#543D2B] dark:text-[#D8C9BC] font-medium">Send Message</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#EFE8DF] dark:bg-[#261A12] text-[10px] font-mono text-[#1F130B] dark:text-[#FAF6F0] border border-[#DDD1C2] dark:border-[#3E291C]">Enter</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#FCFAF7] dark:bg-[#1E140C] border border-[#E5DDD3] dark:border-[#332217]">
                <span className="text-[#543D2B] dark:text-[#D8C9BC] font-medium">New Line</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#EFE8DF] dark:bg-[#261A12] text-[10px] font-mono text-[#1F130B] dark:text-[#FAF6F0] border border-[#DDD1C2] dark:border-[#3E291C]">Shift + Enter</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#FCFAF7] dark:bg-[#1E140C] border border-[#E5DDD3] dark:border-[#332217]">
                <span className="text-[#543D2B] dark:text-[#D8C9BC] font-medium">Close Dialog</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#EFE8DF] dark:bg-[#261A12] text-[10px] font-mono text-[#1F130B] dark:text-[#FAF6F0] border border-[#DDD1C2] dark:border-[#3E291C]">Esc</kbd>
              </div>
            </div>
          </div>

          {/* Section: Privacy & Security */}
          <div className="p-3.5 rounded-2xl bg-[#EFE8DF] dark:bg-[#261A12] border border-[#E5DDD3] dark:border-[#332217]">
            <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs text-[#1F130B] dark:text-[#FAF6F0]">
              <Shield className="w-4 h-4 text-[#2E1B10] dark:text-[#FAF6F0]" />
              <span>Privacy & Persistence</span>
            </div>
            <p className="text-xs text-[#543D2B] dark:text-[#D8C9BC] leading-relaxed">
              Conversations are securely isolated to your account or guest session. You can rename, search, or purge chat histories at any time.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="tactile-espresso px-5 py-2.5 rounded-xl font-semibold text-xs text-[#FAF6F0] cursor-pointer active:scale-95 shadow-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
