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
  onThemeChange: (theme: "light" | "dark" | "system") => void;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="tactile-card relative w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[85vh] text-[#1F130B] dark:text-[#FAF6F0] border border-[#DDD1C2] dark:border-[#3E291C]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-1.5 rounded-xl text-[#7A6250] hover:text-[#1F130B] dark:text-[#A89584] dark:hover:text-[#FAF6F0] hover:bg-[#EFE8DF] dark:hover:bg-[#261A12] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Tabs Nav */}
        <div className="w-full md:w-52 shrink-0 border-b md:border-b-0 md:border-r border-[#E5DDD3] dark:border-[#332217] bg-[#F5EFEB] dark:bg-[#19100A] p-3 flex md:flex-col gap-1 overflow-x-auto select-none">
          <div className="hidden md:block px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#2E1B10] dark:text-[#FAF6F0]">
            Settings
          </div>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? "tactile-espresso font-semibold text-[#FAF6F0] shadow-xs"
                  : "text-[#543D2B] dark:text-[#D8C9BC] hover:text-[#1F130B] dark:hover:text-[#FAF6F0] hover:bg-[#EFE8DF] dark:hover:bg-[#261A12]"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto">
          {saveStatus && (
            <div className="flex items-center gap-2 p-2.5 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs border border-emerald-200 dark:border-emerald-800/50 animate-fade-in font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>Settings saved successfully.</span>
            </div>
          )}

          {/* APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-1 text-[#1F130B] dark:text-[#FAF6F0]">Appearance</h3>
                <p className="text-xs text-[#543D2B] dark:text-[#D8C9BC]">
                  Select your preferred aesthetic mode for Arfa AI.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "light", label: "Warm Ivory (Light)", desc: "Luminous warm ivory, creamy beige & espresso" },
                  { id: "dark", label: "Espresso (Dark)", desc: "Deep roast coffee, cacao & warm ivory" },
                  { id: "system", label: "System Sync", desc: "Adapts automatically to OS settings" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleUpdateSettings({ theme: mode.id as any })}
                    className={`tactile-raised p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                      settings?.theme === mode.id
                        ? "border-[#2E1B10] dark:border-[#FAF6F0] ring-2 ring-[#2E1B10]/20 dark:ring-[#FAF6F0]/20"
                        : ""
                    }`}
                  >
                    <div className="font-semibold text-xs sm:text-sm mb-1 text-[#1F130B] dark:text-[#FAF6F0]">{mode.label}</div>
                    <div className="text-[11px] text-[#543D2B] dark:text-[#D8C9BC] leading-snug">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI MODEL */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-1 text-[#1F130B] dark:text-[#FAF6F0]">AI Engine & Model</h3>
                <p className="text-xs text-[#543D2B] dark:text-[#D8C9BC]">
                  Configure server-side AI model routing and response behavior.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F130B] dark:text-[#FAF6F0] mb-2">
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
                      className={`tactile-raised p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                        settings?.preferredProvider === "gemini" && settings?.preferredModel !== "gemini-3.1-flash-lite"
                          ? "border-[#2E1B10] dark:border-[#FAF6F0] ring-2 ring-[#2E1B10]/20 dark:ring-[#FAF6F0]/20"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs sm:text-sm text-[#1F130B] dark:text-[#FAF6F0]">Gemini 3.8 Flash</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EFE8DF] dark:bg-[#261A12] text-[#2E1B10] dark:text-[#FAF6F0] border border-[#DDD1C2] dark:border-[#3E291C]">
                          Default
                        </span>
                      </div>
                      <p className="text-[11px] text-[#543D2B] dark:text-[#D8C9BC] mt-1">
                        High intelligence and reasoning with multi-turn streaming.
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        handleUpdateSettings({
                          preferredProvider: "gemini",
                          preferredModel: "gemini-3.1-flash-lite",
                        })
                      }
                      className={`tactile-raised p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                        settings?.preferredProvider === "gemini" && settings?.preferredModel === "gemini-3.1-flash-lite"
                          ? "border-[#2E1B10] dark:border-[#FAF6F0] ring-2 ring-[#2E1B10]/20 dark:ring-[#FAF6F0]/20"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs sm:text-sm text-[#1F130B] dark:text-[#FAF6F0]">Gemini 3.1 Flash Lite</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EFE8DF] dark:bg-[#261A12] text-[#543D2B] dark:text-[#D8C9BC]">
                          Fast
                        </span>
                      </div>
                      <p className="text-[11px] text-[#543D2B] dark:text-[#D8C9BC] mt-1">
                        Ultra-low latency, high throughput during peak load times.
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        handleUpdateSettings({
                          preferredProvider: "openai",
                          preferredModel: "gpt-4o",
                        })
                      }
                      className={`tactile-raised p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                        settings?.preferredProvider === "openai"
                          ? "border-[#2E1B10] dark:border-[#FAF6F0] ring-2 ring-[#2E1B10]/20 dark:ring-[#FAF6F0]/20"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs sm:text-sm text-[#1F130B] dark:text-[#FAF6F0]">OpenAI GPT-4o</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EFE8DF] dark:bg-[#261A12] text-[#543D2B] dark:text-[#D8C9BC]">
                          Fallback
                        </span>
                      </div>
                      <p className="text-[11px] text-[#543D2B] dark:text-[#D8C9BC] mt-1">
                        Bidirectional resilience with automatic failover.
                      </p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F130B] dark:text-[#FAF6F0] mb-1">
                    Custom AI Instructions
                  </label>
                  <p className="text-[11px] text-[#543D2B] dark:text-[#D8C9BC] mb-2">
                    Personal guidance injected into every conversation with Arfa AI.
                  </p>
                  <div className="tactile-recessed rounded-xl p-2.5">
                    <textarea
                      rows={3}
                      value={settings?.customInstructions || ""}
                      onChange={(e) =>
                        setSettings((prev) => (prev ? { ...prev, customInstructions: e.target.value } : null))
                      }
                      onBlur={(e) => handleUpdateSettings({ customInstructions: e.target.value })}
                      placeholder="e.g. Always be concise, provide code examples with explanations..."
                      className="w-full bg-transparent border-none outline-none text-xs text-[#1F130B] dark:text-[#FAF6F0] placeholder-[#8C7563] dark:placeholder-[#A89584]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MEMORY ARCHITECTURE */}
          {activeTab === "memory" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold mb-0.5 text-[#1F130B] dark:text-[#FAF6F0]">Long-Term Memory</h3>
                  <p className="text-xs text-[#543D2B] dark:text-[#D8C9BC]">
                    Explicit facts, engineering preferences, and project context Arfa AI retains.
                  </p>
                </div>
                {memories.length > 0 && (
                  <button
                    onClick={handleClearMemories}
                    className="text-xs text-[#9E3624] dark:text-[#F0806E] hover:underline font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <form onSubmit={handleAddMemory} className="flex gap-2">
                <div className="tactile-recessed rounded-xl px-2.5 py-1.5 flex-1 flex items-center">
                  <input
                    type="text"
                    value={newMemoryContent}
                    onChange={(e) => setNewMemoryContent(e.target.value)}
                    placeholder="Remember that my team uses Python 3.12..."
                    className="w-full bg-transparent border-none outline-none text-xs text-[#1F130B] dark:text-[#FAF6F0] placeholder-[#8C7563] dark:placeholder-[#A89584]"
                  />
                </div>
                <button
                  type="submit"
                  className="tactile-espresso px-3.5 py-2 rounded-xl text-xs font-semibold text-[#FAF6F0] flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {memories.length === 0 ? (
                  <p className="text-xs text-[#543D2B] dark:text-[#D8C9BC] italic py-3 text-center">
                    No custom memories stored yet.
                  </p>
                ) : (
                  memories.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#EFE8DF] dark:bg-[#261A12] border border-[#E5DDD3] dark:border-[#332217] text-xs"
                    >
                      <span className="text-[#1F130B] dark:text-[#FAF6F0]">{m.content}</span>
                      <button
                        onClick={() => handleDeleteMemory(m.id)}
                        className="text-[#7A6250] hover:text-[#9E3624] dark:hover:text-[#F0806E] p-1 cursor-pointer transition-colors"
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
                <h3 className="text-base font-semibold mb-1 text-[#1F130B] dark:text-[#FAF6F0]">Arfa AI Persona</h3>
                <p className="text-xs text-[#543D2B] dark:text-[#D8C9BC]">
                  Tailor Arfa AI's conversational style and response temperament.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "balanced", label: "Balanced & Thoughtful", desc: "Equally analytical, articulate, and friendly." },
                  { id: "concise", label: "Concise & Direct", desc: "Brief, laser-focused answers without unnecessary filler." },
                  { id: "creative", label: "Creative & Visionary", desc: "Explores analogies, novel ideation, and expressive flow." },
                  { id: "technical", label: "Strictly Technical", desc: "Code-first, rigorous syntax, zero fluff." },
                ].map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => handleUpdateSettings({ responseStyle: persona.id as any })}
                    className={`tactile-raised p-3.5 rounded-2xl text-left cursor-pointer transition-all ${
                      (settings?.responseStyle || "balanced") === persona.id
                        ? "border-[#2E1B10] dark:border-[#FAF6F0] ring-2 ring-[#2E1B10]/20 dark:ring-[#FAF6F0]/20"
                        : ""
                    }`}
                  >
                    <div className="font-semibold text-xs sm:text-sm mb-1 text-[#1F130B] dark:text-[#FAF6F0]">{persona.label}</div>
                    <div className="text-[11px] text-[#543D2B] dark:text-[#D8C9BC] leading-snug">{persona.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ACCOUNT */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-1 text-[#1F130B] dark:text-[#FAF6F0]">Account & Profile</h3>
                <p className="text-xs text-[#543D2B] dark:text-[#D8C9BC]">
                  Manage your active identity and session state.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#EFE8DF] dark:bg-[#261A12] border border-[#E5DDD3] dark:border-[#332217] flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#1F130B] dark:text-[#FAF6F0]">
                    {currentUser?.name || "Guest Explorer"}
                  </div>
                  <div className="text-xs text-[#543D2B] dark:text-[#D8C9BC]">
                    {currentUser?.isGuest ? "Temporary guest session" : currentUser?.email}
                  </div>
                </div>

                {currentUser?.isGuest ? (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="tactile-espresso px-4 py-2 rounded-xl text-xs font-semibold text-[#FAF6F0] cursor-pointer shadow-xs"
                  >
                    Sign In
                  </button>
                ) : (
                  <button
                    onClick={onLogout}
                    className="tactile-raised px-4 py-2 rounded-xl text-xs font-semibold text-[#9E3624] dark:text-[#F0806E] cursor-pointer"
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
                <h3 className="text-base font-semibold mb-1 text-[#1F130B] dark:text-[#FAF6F0]">Data & Privacy</h3>
                <p className="text-xs text-[#543D2B] dark:text-[#D8C9BC]">
                  You retain complete ownership over your conversation data and memory facts.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-[#E5DDD3] dark:border-[#332217]">
                  <div>
                    <div className="text-sm font-semibold text-[#1F130B] dark:text-[#FAF6F0]">Export All Data</div>
                    <div className="text-xs text-[#543D2B] dark:text-[#D8C9BC]">Download complete history, messages, and memories as JSON.</div>
                  </div>
                  <a
                    href="/api/export"
                    download
                    className="tactile-raised inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer text-[#1F130B] dark:text-[#FAF6F0]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </a>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-[#DDD1C2] dark:border-[#3E291C] bg-[#F5EFEB] dark:bg-[#1E140C]">
                  <div>
                    <div className="text-sm font-semibold text-[#9E3624] dark:text-[#F0806E]">Clear All Conversations</div>
                    <div className="text-xs text-[#543D2B] dark:text-[#D8C9BC]">Permanently delete all chat sessions and messages.</div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Permanently delete all your conversation history?")) {
                        onClearConversations();
                        onClose();
                      }
                    }}
                    className="tactile-espresso px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#FAF6F0] transition-all shadow-xs cursor-pointer active:scale-95"
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
                <h3 className="text-base font-semibold mb-1 text-[#1F130B] dark:text-[#FAF6F0]">Keyboard Shortcuts</h3>
                <p className="text-xs text-[#543D2B] dark:text-[#D8C9BC]">
                  Speed up your workflow in Arfa AI.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { key: "Enter", desc: "Send message" },
                  { key: "Shift + Enter", desc: "Insert new line in composer" },
                  { key: "Esc", desc: "Close open modal or cancel input" },
                  { key: "Ctrl / Cmd + K", desc: "Focus search / New Chat" },
                ].map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-[#E5DDD3] dark:border-[#332217]">
                    <span className="text-[#543D2B] dark:text-[#D8C9BC] font-medium">{s.desc}</span>
                    <kbd className="px-2 py-0.5 rounded bg-[#EFE8DF] dark:bg-[#261A12] text-[#1F130B] dark:text-[#FAF6F0] font-mono font-medium border border-[#E5DDD3] dark:border-[#332217]">
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
                <h3 className="text-base font-semibold mb-1 text-[#1F130B] dark:text-[#FAF6F0]">About Arfa AI</h3>
                <p className="text-xs text-[#543D2B] dark:text-[#D8C9BC]">
                  Version 2.5 — Tactile Warm Ivory & Deep Coffee Edition
                </p>
              </div>

              <div className="text-xs leading-relaxed text-[#543D2B] dark:text-[#D8C9BC] space-y-3 font-normal">
                <p>
                  <strong className="text-[#1F130B] dark:text-[#FAF6F0]">ARFA AI</strong> is a production-ready conversational intelligence platform crafted with tactile physical materials, refined warm ivory surfaces, deep coffee typography, and responsive voice dictation.
                </p>
                <p>
                  Built with React 19, TypeScript, Tailwind CSS, Express, and resilient multi-model AI routing with automatic fallback.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
