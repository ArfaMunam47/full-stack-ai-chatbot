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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#212121] border border-neutral-200 dark:border-neutral-700 relative w-full max-w-lg rounded-2xl p-6 sm:p-7 shadow-2xl text-neutral-900 dark:text-neutral-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <ArfaLogo size="sm" showText={false} />
          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Help & Guide
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Guide to getting the most out of ARFA AI
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          {/* Section: Voice interaction */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs text-neutral-900 dark:text-neutral-100">
              <Mic className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              <span>Voice Dictation</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Click the microphone button in the composer to dictate your messages directly with real-time speech recognition.
            </p>
          </div>

          {/* Section: Multilingual */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs text-neutral-900 dark:text-neutral-100">
              <Globe className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              <span>Multilingual & RTL Support</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              ARFA AI communicates naturally in English, Urdu, Arabic, Spanish, French, German, and more. Right-to-Left (RTL) text flow is applied automatically when writing in Arabic or Urdu.
            </p>
          </div>

          {/* Section: Keyboard Shortcuts */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-2 font-semibold text-xs text-neutral-900 dark:text-neutral-100">
              <Keyboard className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              <span>Keyboard Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <span className="text-neutral-600 dark:text-neutral-300 font-medium">New Chat</span>
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 text-[10px] font-mono text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-600">⌘K / Ctrl+K</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <span className="text-neutral-600 dark:text-neutral-300 font-medium">Send Message</span>
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 text-[10px] font-mono text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-600">Enter</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <span className="text-neutral-600 dark:text-neutral-300 font-medium">New Line</span>
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 text-[10px] font-mono text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-600">Shift + Enter</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <span className="text-neutral-600 dark:text-neutral-300 font-medium">Close Dialog</span>
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 text-[10px] font-mono text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-600">Esc</kbd>
              </div>
            </div>
          </div>

          {/* Section: Privacy & Security */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs text-neutral-900 dark:text-neutral-100">
              <Shield className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              <span>Privacy & Persistence</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Conversations are securely isolated to your account or guest session. You can rename, search, or purge chat histories at any time.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-neutral-900 hover:bg-black dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer transition-colors shadow-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
