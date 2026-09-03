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
    if (confirm("Are you sure you want to clear all personal memories?")) {
      await api.clearMemories();
      setMemories([]);
    }
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "appearance", label: "Appearance", icon: <Palette className="w-4 h-4" /> },
    { key: "ai", label: "AI Model", icon: <Cpu className="w-4 h-4" /> },
    { key: "memory", label: "Memory", icon: <Brain className="w-4 h-4" /> },
    { key: "arfaProfile", label: "Arfa Knowledge", icon: <Sparkles className="w-4 h-4" /> },
    { key: "account", label: "Account", icon: <User className="w-4 h-4" /> },
    { key: "privacy", label: "Privacy & Data", icon: <Shield className="w-4 h-4" /> },
    { key: "shortcuts", label: "Shortcuts", icon: <Command className="w-4 h-4" /> },
    { key: "about", label: "About", icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 animate-fade-in">
      <div className="relative flex flex-col md:flex-row w-full max-w-4xl h-[85vh] max-h-[680px] rounded-2xl bg-white dark:bg-[#181315] border border-[#E8D7D7] dark:border-[#302427] shadow-2xl overflow-hidden text-[#282122] dark:text-[#FAF4F4]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-[#786E70] hover:text-[#282122] dark:hover:text-[#FAF4F4] hover:bg-[#F6EEEE] dark:hover:bg-[#20181A] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Tabs Nav */}
        <div className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-[#E8D7D7] dark:border-[#302427] bg-[#FAF7F7] dark:bg-[#141012] p-3 flex md:flex-col gap-1 overflow-x-auto">
          <div className="hidden md:block px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#C26767] dark:text-[#C87575]">
            Settings
          </div>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#C26767] dark:bg-[#C87575] text-white shadow-2xs"
                  : "text-[#786E70] hover:text-[#282122] dark:hover:text-[#FAF4F4] hover:bg-[#F6EEEE] dark:hover:bg-[#20181A]"
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
            <div className="flex items-center gap-2 p-2.5 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-200 dark:border-emerald-800/50 animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Settings saved successfully.</span>
            </div>
          )}

          {/* APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-1">Appearance</h3>
                <p className="text-xs text-[#786E70] dark:text-[#A3989A]">
                  Select your preferred aesthetic mode for Arfa AI.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "light", label: "Light", desc: "Warm rose, charcoal & soft ivory" },
                  { id: "dark", label: "Dark", desc: "Refined dark rose with warm accents" },
                  { id: "system", label: "System", desc: "Adapts to OS settings" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleUpdateSettings({ theme: mode.id as any })}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      settings?.theme === mode.id
                        ? "border-[#C26767] dark:border-[#C87575] bg-[#FDF2F2] dark:bg-[#23191C] ring-1 ring-[#C87575]"
                        : "border-[#E8D7D7] dark:border-[#302427] hover:border-[#C26767] dark:hover:border-[#C87575]"
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">{mode.label}</div>
                    <div className="text-[11px] text-[#786E70] dark:text-[#A3989A] leading-snug">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI MODEL */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-1">AI Engine & Model</h3>
                <p className="text-xs text-[#786E70] dark:text-[#A3989A]">
                  Configure server-side AI model routing and response behavior.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#282122] dark:text-[#FAF4F4] mb-2">
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
                          ? "border-[#C26767] dark:border-[#C87575] bg-[#FDF2F2] dark:bg-[#23191C] ring-1 ring-[#C87575]"
                          : "border-[#E8D7D7] dark:border-[#302427] hover:border-[#C26767] dark:hover:border-[#C87575]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">Gemini 3.8 Flash</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FDF2F2] dark:bg-[#23191C] text-[#C26767] dark:text-[#E59C9C] border border-[#E8D3D3] dark:border-[#3D2B30]">
                          Standard
                        </span>
                      </div>
                      <p className="text-[11px] text-[#786E70] dark:text-[#A3989A] mt-1">
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
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        settings?.preferredProvider === "gemini" && settings?.preferredModel === "gemini-3.1-flash-lite"
                          ? "border-[#C26767] dark:border-[#C87575] bg-[#FDF2F2] dark:bg-[#23191C] ring-1 ring-[#C87575]"
                          : "border-[#E8D7D7] dark:border-[#302427] hover:border-[#C26767] dark:hover:border-[#C87575]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">Gemini 3.1 Flash Lite</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF7F7] dark:bg-[#141012] text-[#786E70] dark:text-[#A3989A] border border-[#E8D7D7] dark:border-[#302427]">
                          Fast
                        </span>
                      </div>
                      <p className="text-[11px] text-[#786E70] dark:text-[#A3989A] mt-1">
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
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        settings?.preferredProvider === "openai"
                          ? "border-[#C26767] dark:border-[#C87575] bg-[#FDF2F2] dark:bg-[#23191C] ring-1 ring-[#C87575]"
                          : "border-[#E8D7D7] dark:border-[#302427] hover:border-[#C26767] dark:hover:border-[#C87575]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">OpenAI GPT-4o</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF7F7] dark:bg-[#141012] text-[#786E70] dark:text-[#A3989A] border border-[#E8D7D7] dark:border-[#302427]">
                          Optional
                        </span>
                      </div>
                      <p className="text-[11px] text-[#786E70] dark:text-[#A3989A] mt-1">
                        Automatic seamless Gemini fallback if billing limit reached.
                      </p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#282122] dark:text-[#FAF4F4] mb-1">
                    Custom AI Instructions
                  </label>
                  <p className="text-[11px] text-[#786E70] dark:text-[#A3989A] mb-2">
                    Personal guidance injected into every conversation with Arfa AI.
                  </p>
                  <textarea
                    rows={3}
                    value={settings?.customInstructions || ""}
                    onChange={(e) =>
                      setSettings((prev) => (prev ? { ...prev, customInstructions: e.target.value } : null))
                    }
                    onBlur={(e) => handleUpdateSettings({ customInstructions: e.target.value })}
                    placeholder="e.g. Always include type definitions when writing TypeScript, or focus on micro-interactions..."
                    className="w-full p-3 rounded-xl border border-[#E8D7D7] dark:border-[#302427] bg-[#FAF7F7] dark:bg-[#141012] text-xs focus:outline-none focus:border-[#C26767] dark:focus:border-[#C87575] text-[#282122] dark:text-[#FAF4F4]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* MEMORY ARCHITECTURE */}
          {activeTab === "memory" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold mb-0.5">Long-Term Memory</h3>
                  <p className="text-xs text-[#786E70] dark:text-[#A3989A]">
                    Explicit facts, engineering preferences, and project context Arfa AI retains.
                  </p>
                </div>
                {memories.length > 0 && (
                  <button
                    onClick={handleClearMemories}
                    className="text-xs text-[#C26767] dark:text-[#C87575] hover:opacity-80 font-medium cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Add Memory Form */}
              <form onSubmit={handleAddMemory} className="p-3.5 rounded-xl bg-[#FDF2F2] dark:bg-[#23191C] border border-[#E8D3D3] dark:border-[#3D2B30] space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={newMemoryCategory}
                    onChange={(e) => setNewMemoryCategory(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg border border-[#E8D7D7] dark:border-[#302427] bg-white dark:bg-[#181315] text-xs focus:outline-none text-[#282122] dark:text-[#FAF4F4]"
                  >
                    <option value="preference">Preference</option>
                    <option value="fact">Fact</option>
                    <option value="project">Project Context</option>
                    <option value="instruction">Instruction</option>
                  </select>
                  <input
                    type="text"
                    value={newMemoryContent}
                    onChange={(e) => setNewMemoryContent(e.target.value)}
                    placeholder="Add a permanent memory (e.g. 'I work primarily with React and Vite')"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#E8D7D7] dark:border-[#302427] bg-white dark:bg-[#181315] text-xs focus:outline-none focus:border-[#C26767] dark:focus:border-[#C87575] text-[#282122] dark:text-[#FAF4F4]"
                  />
                  <button
                    type="submit"
                    disabled={!newMemoryContent.trim()}
                    className="inline-flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-[#C26767] hover:bg-[#AA5454] dark:bg-[#C87575] dark:hover:bg-[#B66464] disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </form>

              {/* Memory List */}
              <div className="space-y-2">
                {memories.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#786E70] dark:text-[#A3989A]">
                    No memories saved yet. Add preferences or instructions above.
                  </div>
                ) : (
                  memories.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-[#E8D7D7] dark:border-[#302427] bg-white dark:bg-[#181315] text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#FDF2F2] dark:bg-[#23191C] text-[#C26767] dark:text-[#E59C9C] border border-[#E8D3D3] dark:border-[#3D2B30]">
                          {m.category}
                        </span>
                        <span className="truncate">{m.content}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteMemory(m.id)}
                        className="p-1 rounded text-[#786E70] hover:text-[#C26767] dark:hover:text-[#C87575] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ARFA KNOWLEDGE EXPLORER */}
          {activeTab === "arfaProfile" && knowledge && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-1">Arfa Knowledge Base</h3>
                <p className="text-xs text-[#786E70] dark:text-[#A3989A]">
                  Extensible personal profile and technical philosophies inspiring Arfa AI.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#E8D7D7] dark:border-[#302427] bg-[#FDF2F2] dark:bg-[#23191C]">
                <h4 className="text-sm font-semibold text-[#C26767] dark:text-[#E59C9C] mb-1">
                  {knowledge.aiIdentity} — {knowledge.tagline}
                </h4>
                <p className="text-xs text-[#786E70] dark:text-[#A3989A] leading-relaxed">
                  {knowledge.summary}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#786E70] dark:text-[#A3989A] mb-2">
                  Core Engineering Values
                </h4>
                <ul className="space-y-1 text-xs text-[#282122] dark:text-[#FAF4F4]">
                  {knowledge.coreValues.map((v, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#C26767] dark:text-[#C87575] font-bold">•</span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#786E70] dark:text-[#A3989A] mb-2">
                  Featured Projects & Architectures
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {knowledge.featuredProjects.map((p, i) => (
                    <div key={i} className="p-3 rounded-xl border border-[#E8D7D7] dark:border-[#302427] bg-white dark:bg-[#181315] text-xs">
                      <div className="font-semibold mb-0.5">{p.title}</div>
                      <div className="text-[10px] text-[#C26767] dark:text-[#E59C9C] font-medium mb-1">
                        {p.category}
                      </div>
                      <p className="text-[#786E70] dark:text-[#A3989A] mb-2 leading-relaxed">
                        {p.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {p.techStack.map((tech, ti) => (
                          <span key={ti} className="text-[9px] px-1.5 py-0.5 rounded bg-[#FDF2F2] dark:bg-[#23191C] text-[#C26767] dark:text-[#E59C9C] border border-[#E8D3D3] dark:border-[#3D2B30]">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNT */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-1">Account & Identity</h3>
                <p className="text-xs text-[#786E70] dark:text-[#A3989A]">
                  Manage your active identity and session synchronization.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#E8D7D7] dark:border-[#302427] bg-[#FAF7F7] dark:bg-[#141012] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{currentUser?.name || "Guest"}</div>
                  <div className="text-xs text-[#786E70] dark:text-[#A3989A]">{currentUser?.email || "guest@arfa.ai"}</div>
                  {currentUser?.isGuest && (
                    <div className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FDF2F2] dark:bg-[#23191C] text-[#C26767] dark:text-[#E59C9C] border border-[#E8D3D3] dark:border-[#3D2B30]">
                      Guest Session
                    </div>
                  )}
                </div>

                {currentUser?.isGuest ? (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#C26767] hover:bg-[#AA5454] dark:bg-[#C87575] dark:hover:bg-[#B66464] transition-colors shadow-2xs cursor-pointer"
                  >
                    Sign In / Register
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#C26767] dark:text-[#C87575] hover:bg-[#FDF2F2] dark:hover:bg-[#23191C] border border-[#E8D7D7] dark:border-[#302427] cursor-pointer"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PRIVACY & DATA */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-1">Privacy & Data Control</h3>
                <p className="text-xs text-[#786E70] dark:text-[#A3989A]">
                  You retain complete ownership over your conversation data and memory facts.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E8D7D7] dark:border-[#302427]">
                  <div>
                    <div className="text-sm font-medium">Export All Data</div>
                    <div className="text-xs text-[#786E70] dark:text-[#A3989A]">Download complete history, messages, and memories as JSON.</div>
                  </div>
                  <a
                    href="/api/export"
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#282122] dark:text-[#FAF4F4] bg-[#FDF2F2] dark:bg-[#23191C] border border-[#E8D7D7] dark:border-[#302427] hover:bg-[#F6EEEE] dark:hover:bg-[#2D1F23] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </a>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E8D3D3] dark:border-[#4A3338] bg-[#FDF2F2] dark:bg-[#23191C]">
                  <div>
                    <div className="text-sm font-medium text-[#C26767] dark:text-[#E59C9C]">Clear All Conversations</div>
                    <div className="text-xs text-[#786E70] dark:text-[#A3989A]">Permanently delete all chat sessions and messages.</div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Permanently delete all your conversation history?")) {
                        onClearConversations();
                        onClose();
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-white bg-[#C26767] hover:bg-[#AA5454] dark:bg-[#C87575] dark:hover:bg-[#B66464] transition-colors shadow-2xs cursor-pointer"
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
                <h3 className="text-base font-semibold mb-1">Keyboard Shortcuts</h3>
                <p className="text-xs text-[#786E70] dark:text-[#A3989A]">
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
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-[#E8D7D7] dark:border-[#302427]">
                    <span className="text-[#786E70] dark:text-[#A3989A]">{s.desc}</span>
                    <kbd className="px-2 py-0.5 rounded bg-[#FDF2F2] dark:bg-[#23191C] text-[#C26767] dark:text-[#E59C9C] font-mono font-medium border border-[#E8D3D3] dark:border-[#3D2B30]">
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
                <h3 className="text-base font-semibold mb-1">About Arfa AI</h3>
                <p className="text-xs text-[#786E70] dark:text-[#A3989A]">
                  Version 2.0.0 — Soft Editorial Depth Edition
                </p>
              </div>

              <div className="text-xs leading-relaxed text-[#786E70] dark:text-[#A3989A] space-y-3">
                <p>
                  <strong className="text-[#282122] dark:text-[#FAF4F4]">Arfa AI</strong> is an intelligent AI chatbot engineered with reliability, progressive token streaming, persistent memory, and a calm, editorial aesthetic.
                </p>
                <p>
                  Engineered with React 19, TypeScript, Tailwind CSS, Express, and resilient server-side model orchestration.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
