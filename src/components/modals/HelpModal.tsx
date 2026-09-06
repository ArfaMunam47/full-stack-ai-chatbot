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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-[#EFE9E6] relative w-full max-w-lg rounded-2xl p-6 sm:p-7 shadow-2xl text-[#1A1718] max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-[#7E7779] hover:text-[#1A1718] hover:bg-[#EFE9E6] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <ArfaLogo size="sm" showText={false} />
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#1A1718]">
              Help & Guide
            </h2>
            <p className="text-xs text-[#5A5456]">
              Guide to getting the most out of ARFA AI
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          {/* Section: Voice interaction */}
          <div className="p-3.5 rounded-xl bg-[#F8F6F4] border border-[#EFE9E6]">
            <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs text-[#1A1718]">
              <Mic className="w-4 h-4 text-[#D84A70]" />
              <span>Voice Dictation</span>
            </div>
            <p className="text-xs text-[#5A5456] leading-relaxed">
              Click the microphone button in the composer to dictate your messages directly with real-time speech recognition.
            </p>
          </div>

          {/* Section: Multilingual */}
          <div className="p-3.5 rounded-xl bg-[#F8F6F4] border border-[#EFE9E6]">
            <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs text-[#1A1718]">
              <Globe className="w-4 h-4 text-[#D84A70]" />
              <span>Multilingual & RTL Support</span>
            </div>
            <p className="text-xs text-[#5A5456] leading-relaxed">
              ARFA AI communicates naturally in English, Urdu, Arabic, Spanish, French, German, and more. Right-to-Left (RTL) text flow is applied automatically when writing in Arabic or Urdu.
            </p>
          </div>

          {/* Section: Keyboard Shortcuts */}
          <div className="p-3.5 rounded-xl bg-[#F8F6F4] border border-[#EFE9E6]">
            <div className="flex items-center gap-2 mb-2 font-semibold text-xs text-[#1A1718]">
              <Keyboard className="w-4 h-4 text-[#D84A70]" />
              <span>Keyboard Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#EFE9E6]">
                <span className="text-[#5A5456] font-medium">New Chat</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#F8F6F4] text-[10px] font-mono text-[#1A1718] border border-[#EFE9E6]">⌘K / Ctrl+K</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#EFE9E6]">
                <span className="text-[#5A5456] font-medium">Send Message</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#F8F6F4] text-[10px] font-mono text-[#1A1718] border border-[#EFE9E6]">Enter</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#EFE9E6]">
                <span className="text-[#5A5456] font-medium">New Line</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#F8F6F4] text-[10px] font-mono text-[#1A1718] border border-[#EFE9E6]">Shift + Enter</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#EFE9E6]">
                <span className="text-[#5A5456] font-medium">Close Dialog</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#F8F6F4] text-[10px] font-mono text-[#1A1718] border border-[#EFE9E6]">Esc</kbd>
              </div>
            </div>
          </div>

          {/* Section: Privacy & Security */}
          <div className="p-3.5 rounded-xl bg-[#F8F6F4] border border-[#EFE9E6]">
            <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs text-[#1A1718]">
              <Shield className="w-4 h-4 text-[#D84A70]" />
              <span>Privacy & Persistence</span>
            </div>
            <p className="text-xs text-[#5A5456] leading-relaxed">
              Conversations are securely isolated to your account or guest session. You can rename, search, or purge chat histories at any time.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#D84A70] hover:bg-[#C0375D] cursor-pointer transition-colors shadow-xs active:scale-[0.99]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
