import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Palette,
  Cpu,
  Brain,
  Sparkles,
  Shield,
  Command,
  Info,
  Plus,
  Trash2,
  Download,
  Check,
} from "lucide-react";
import { api } from "../../lib/api.ts";
import { User as UserType, UserSettings, MemoryItem, ArfaKnowledgeProfile } from "../../types.ts";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onThemeChange?: (theme: "light" | "dark" | "system") => void;
  onClearConversations: () => void;
}

type TabKey =
  | "account"
  | "appearance"
  | "ai"
  | "memory"
  | "arfaProfile"
  | "privacy"
  | "shortcuts"
  | "about";

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  onLogout,
  onThemeChange,
  onClearConversations,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>("appearance");
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [knowledge, setKnowledge] = useState<ArfaKnowledgeProfile | null>(null);
  const [newMemoryCategory, setNewMemoryCategory] = useState<MemoryItem["category"]>("preference");
  const [newMemoryContent, setNewMemoryContent] = useState("");
  const [saveStatus, setSaveStatus] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    api.getSettings().then(setSettings).catch(console.error);
    api.getMemories().then(setMemories).catch(console.error);
    api.getKnowledge().then(setKnowledge).catch(console.error);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateSettings = async (updates: Partial<UserSettings>) => {
    if (!settings) return;
    try {
      const updated = await api.updateSettings(updates);
      setSettings(updated);
      if (updates.theme) {
        onThemeChange(updates.theme);
      }
      setSaveStatus(true);
      setTimeout(() => setSaveStatus(false), 2000);
    } catch (err) {
      console.error("Failed to update settings:", err);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryContent.trim()) return;
    try {
      const item = await api.addMemory(newMemoryCategory, newMemoryContent.trim());
      setMemories((prev) => [item, ...prev]);
      setNewMemoryContent("");
    } catch (err) {
      console.error("Failed to add memory:", err);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await api.deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to delete memory:", err);
    }
  };

  const handleClearMemories = async () => {
    if (!confirm("Clear all explicit AI memory entries?")) return;
    try {
      await api.clearMemories();
      setMemories([]);
    } catch (err) {
      console.error("Failed to clear memories:", err);
    }
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "appearance", label: "Appearance", icon: <Palette className="w-4 h-4" /> },
    { key: "ai", label: "AI Engine", icon: <Cpu className="w-4 h-4" /> },
    { key: "memory", label: "Memory", icon: <Brain className="w-4 h-4" /> },
    { key: "arfaProfile", label: "Persona", icon: <Sparkles className="w-4 h-4" /> },
    { key: "account", label: "Account", icon: <User className="w-4 h-4" /> },
    { key: "privacy", label: "Data & Privacy", icon: <Shield className="w-4 h-4" /> },
    { key: "shortcuts", label: "Shortcuts", icon: <Command className="w-4 h-4" /> },
    { key: "about", label: "About", icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#32121E]/30 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl felt-card-marshmallow shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[85vh] text-[#32121E]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-2xl felt-btn-marshmallow text-[#8E6F7A] hover:text-[#EC4899] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Tabs Nav */}
        <div className="w-full md:w-52 shrink-0 border-b md:border-b-0 md:border-r border-[#EFE6DC] bg-[#FFF5F7] p-3 flex md:flex-col gap-1.5 overflow-x-auto select-none">
          <div className="hidden md:block px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-[#B298A1]">
            Settings
          </div>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#FFDFE8] text-[#EC4899] font-extrabold border border-[#FBCFE8] shadow-xs"
                  : "text-[#8E6F7A] hover:text-[#32121E] hover:bg-[#FFEBF0]"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-white text-[#32121E]">
          {saveStatus && (
            <div className="flex items-center gap-2 p-2.5 mb-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>Settings saved successfully.</span>
            </div>
          )}

          {/* APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold mb-1 text-[#32121E]">Appearance</h3>
                <p className="text-xs text-[#8E6F7A] font-medium">
                  ARFA AI uses a calibrated tactile needle-felted design system.
                </p>
              </div>

              <div className="p-4 rounded-3xl felt-card-marshmallow space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#EC4899] ring-4 ring-[#FCE7F3]" />
                    <span className="text-sm font-extrabold text-[#32121E]">
                      Cozy Knitcore & Needle-Felt
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FFDFE8] text-[#EC4899] border border-[#FBCFE8]">
                    Active Theme
                  </span>
                </div>
                <p className="text-xs text-[#8E6F7A] leading-relaxed font-medium">
                  A high-contrast, tactile interface featuring plush marshmallow cards, strawberry candy pink accents, and deep berry typography. Built for supreme readability across every language.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#FFFBF8] border border-[#EFE6DC] text-[#32121E]">
                    Canvas: Cable-Knit Ivory
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#FFFBF8] border border-[#EFE6DC] text-[#32121E]">
                    Text: Deep Berry Espresso
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#FFDFE8] border border-[#FBCFE8] text-[#EC4899]">
                    Accent: Strawberry Candy Pink
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* AI MODEL */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-1 text-[#1A1718]">AI Engine & Model</h3>
                <p className="text-xs text-[#5A5456]">
                  Configure server-side AI model routing and response behavior.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1718] mb-2">
                    Model Selection
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() =>
                        handleUpdateSettings({
                          preferredProvider: "gemini",
                          preferredModel: "gemini-3.8-flash",
                        })
                      }
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        settings?.preferredProvider === "gemini" && settings?.preferredModel !== "gemini-3.1-flash-lite"
                          ? "border-[#D84A70] bg-[#FDF2F5] ring-1 ring-[#D84A70]"
                          : "border-[#EFE9E6] bg-white hover:border-[#D84A70]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs sm:text-sm text-[#1A1718]">Gemini 3.8 Flash</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F6F3F1] text-[#5A5456]">
                          Default
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5A5456] mt-1">
                        Ultra-fast streaming intelligence and complex reasoning.
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        handleUpdateSettings({
                          preferredProvider: "gemini",
                          preferredModel: "gemini-3.1-flash-lite",
                        })
                      }
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        settings?.preferredProvider === "gemini" && settings?.preferredModel === "gemini-3.1-flash-lite"
                          ? "border-[#D84A70] bg-[#FDF2F5] ring-1 ring-[#D84A70]"
                          : "border-[#EFE9E6] bg-white hover:border-[#D84A70]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs sm:text-sm text-[#1A1718]">Flash Lite</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FDF2F5] text-[#D84A70]">
                          Sub-second
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5A5456] mt-1">
                        Zero-wait response time for instant typing.
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        handleUpdateSettings({
                          preferredProvider: "openai",
                          preferredModel: "gpt-4o",
                        })
                      }
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        settings?.preferredProvider === "openai"
                          ? "border-[#D84A70] bg-[#FDF2F5] ring-1 ring-[#D84A70]"
                          : "border-[#EFE9E6] bg-white hover:border-[#D84A70]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs sm:text-sm text-[#1A1718]">OpenAI GPT-4o</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F6F3F1] text-[#5A5456]">
                          Fallback
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5A5456] mt-1">
                        High redundancy with automatic failover.
                      </p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1718] mb-1">
                    Custom System Instructions
                  </label>
                  <p className="text-[11px] text-[#5A5456] mb-2">
                    Personal guidance injected into every conversation with ARFA AI.
                  </p>
                  <div className="rounded-xl p-2 bg-[#F8F6F4] border border-[#EFE9E6]">
                    <textarea
                      rows={3}
                      value={settings?.customInstructions || ""}
                      onChange={(e) =>
                        setSettings((prev) => (prev ? { ...prev, customInstructions: e.target.value } : null))
                      }
                      onBlur={(e) => handleUpdateSettings({ customInstructions: e.target.value })}
                      placeholder="e.g. Always be concise, provide code examples with explanations..."
                      className="w-full bg-transparent border-none outline-none text-xs text-[#1A1718] placeholder-[#A39B9E]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MEMORY */}
          {activeTab === "memory" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold mb-0.5 text-[#1A1718]">Long-Term Memory</h3>
                  <p className="text-xs text-[#5A5456]">
                    Explicit facts, engineering preferences, and project context ARFA AI retains.
                  </p>
                </div>
                {memories.length > 0 && (
                  <button
                    onClick={handleClearMemories}
                    className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <form onSubmit={handleAddMemory} className="flex gap-2">
                <div className="rounded-xl px-2.5 py-1.5 flex-1 flex items-center bg-[#F8F6F4] border border-[#EFE9E6]">
                  <input
                    type="text"
                    value={newMemoryContent}
                    onChange={(e) => setNewMemoryContent(e.target.value)}
                    placeholder="Remember that my team uses TypeScript and React..."
                    className="w-full bg-transparent border-none outline-none text-xs text-[#1A1718] placeholder-[#A39B9E]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#D84A70] hover:bg-[#C0375D] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {memories.length === 0 ? (
                  <p className="text-xs text-[#A39B9E] italic py-3 text-center">
                    No custom memories stored yet.
                  </p>
                ) : (
                  memories.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#F8F6F4] border border-[#EFE9E6] text-xs"
                    >
                      <span className="text-[#1A1718]">{m.content}</span>
                      <button
                        onClick={() => handleDeleteMemory(m.id)}
                        className="text-[#A39B9E] hover:text-red-500 p-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* PERSONA */}
          {activeTab === "arfaProfile" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-1 text-[#1A1718]">ARFA AI Persona</h3>
                <p className="text-xs text-[#5A5456]">
                  Tailor ARFA AI's conversational style and response temperament.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "balanced", label: "Balanced & Direct", desc: "Equally analytical, articulate, and helpful." },
                  { id: "concise", label: "Concise & Fast", desc: "Brief, laser-focused answers without unnecessary filler." },
                  { id: "creative", label: "Creative & Visionary", desc: "Explores analogies, novel ideation, and expressive flow." },
                  { id: "technical", label: "Strictly Technical", desc: "Code-first, rigorous syntax, production-grade output." },
                ].map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => handleUpdateSettings({ responseStyle: persona.id as any })}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      (settings?.responseStyle || "balanced") === persona.id
                        ? "border-[#D84A70] bg-[#FDF2F5] ring-1 ring-[#D84A70]"
                        : "border-[#EFE9E6] bg-white hover:border-[#D84A70]/50"
                    }`}
                  >
                    <div className="font-semibold text-xs sm:text-sm mb-1 text-[#1A1718]">{persona.label}</div>
                    <div className="text-[11px] text-[#5A5456] leading-snug">{persona.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ACCOUNT */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-1 text-[#1A1718]">Account & Profile</h3>
                <p className="text-xs text-[#5A5456]">
                  Manage your active identity and session state.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F6F4] border border-[#EFE9E6] flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#1A1718]">
                    {currentUser?.name || "Not Signed In"}
                  </div>
                  <div className="text-xs text-[#5A5456]">
                    {currentUser?.email || "Create an account or sign in to sync your messages"}
                  </div>
                </div>

                {!currentUser ? (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#D94680] hover:bg-[#C0376D] transition-colors cursor-pointer shadow-xs"
                  >
                    Log In / Sign Up
                  </button>
                ) : (
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-[#EFE9E6] transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          )}

          {/* DATA & PRIVACY */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-1 text-[#1A1718]">Data & Privacy</h3>
                <p className="text-xs text-[#5A5456]">
                  You retain complete ownership over your conversation data and memory facts.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#EFE9E6]">
                  <div>
                    <div className="text-sm font-semibold text-[#1A1718]">Export All Data</div>
                    <div className="text-xs text-[#5A5456]">Download complete history, messages, and memories as JSON.</div>
                  </div>
                  <a
                    href="/api/export"
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer border border-[#EFE9E6] text-[#5A5456] hover:bg-[#F6F3F1]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </a>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-red-200 bg-red-50/50">
                  <div>
                    <div className="text-sm font-semibold text-red-600">Clear All Conversations</div>
                    <div className="text-xs text-[#5A5456]">Permanently delete all chat sessions and messages.</div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Permanently delete all your conversation history?")) {
                        onClearConversations();
                        onClose();
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
                  >
                    Delete All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* KEYBOARD SHORTCUTS */}
          {activeTab === "shortcuts" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-1 text-[#1A1718]">Keyboard Shortcuts</h3>
                <p className="text-xs text-[#5A5456]">
                  Speed up your workflow in ARFA AI.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { key: "Enter", desc: "Send message" },
                  { key: "Shift + Enter", desc: "Insert new line in composer" },
                  { key: "Esc", desc: "Close open modal or cancel input" },
                  { key: "Ctrl / Cmd + K", desc: "Focus search / New Chat" },
                ].map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-[#EFE9E6]">
                    <span className="text-[#5A5456] font-medium">{s.desc}</span>
                    <kbd className="px-2 py-0.5 rounded bg-[#F8F6F4] text-[#1A1718] font-mono font-medium border border-[#EFE9E6]">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABOUT */}
          {activeTab === "about" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold mb-1 text-[#32121E]">About ARFA AI</h3>
                <p className="text-xs text-[#8E6F7A] font-medium">
                  Multi-Language Supporter & Creative AI Companion
                </p>
              </div>

              <div className="text-xs leading-relaxed text-[#8E6F7A] space-y-3 font-medium">
                <p>
                  <strong className="text-[#32121E] font-extrabold">ARFA AI</strong> is a premium conversational intelligence companion featuring instant streaming responses, persistent memory, and universal multi-language support.
                </p>
                <p>
                  Styled in a cozy needle-felted wool & plush claymorphism aesthetic designed for maximum warmth, creative joy, and supreme legibility.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
