import React, { useState } from "react";
import {
  X,
  MessageSquare,
  Sparkles,
  Clock,
  Layers,
  FileText,
  ChevronRight,
  TrendingUp,
  Hash,
  Share2,
  Check,
} from "lucide-react";
import { Conversation, Message } from "../../types.ts";
import { LightingTheme } from "./TactileHeader.tsx";

interface SidePreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeConversation: Conversation | null;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  lightingTheme: LightingTheme;
}

export const SidePreviewDrawer: React.FC<SidePreviewDrawerProps> = ({
  isOpen,
  onClose,
  activeConversation,
  conversations,
  onSelectConversation,
  lightingTheme,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const messages: Message[] = activeConversation?.messages || [];
  const userMessages = messages.filter((m) => m.role === "user");
  const assistantMessages = messages.filter((m) => m.role === "assistant");
  const totalWords = messages.reduce((acc, m) => acc + (m.content ? m.content.split(/\s+/).length : 0), 0);
  const estimatedReadingTime = Math.ceil(totalWords / 200);

  const handleShareSummary = () => {
    if (activeConversation) {
      const text = `ARFA AI Chat: ${activeConversation.title}\nMessages: ${messages.length}\nWords: ${totalWords}`;
      navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const themeBorderMap = {
    sunlight: "border-amber-400/40 shadow-[0_0_30px_rgba(245,158,11,0.25)]",
    starlight: "border-pink-400/40 shadow-[0_0_30px_rgba(236,72,153,0.25)]",
    cyber: "border-purple-400/40 shadow-[0_0_30px_rgba(168,85,247,0.25)]",
    lunar: "border-sky-300/40 shadow-[0_0_30px_rgba(186,230,253,0.25)]",
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-auto">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Side Drawer */}
      <aside
        className={`relative z-10 w-full sm:w-[380px] md:w-[420px] h-full bg-[#100722]/95 backdrop-blur-2xl border-l flex flex-col transition-all duration-300 ${themeBorderMap[lightingTheme]}`}
      >
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Side Preview</h3>
              <p className="text-[11px] text-slate-400">Real-time chat insights & stream metrics</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="jelly-spring w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title="Close Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-3 pb-2 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`jelly-spring flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-white/20 text-white border border-white/30 shadow-xs"
                : "bg-white/5 text-slate-400 hover:text-white border border-white/5"
            }`}
          >
            Active Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`jelly-spring flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-white/20 text-white border border-white/30 shadow-xs"
                : "bg-white/5 text-slate-400 hover:text-white border border-white/5"
            }`}
          >
            All Threads ({conversations.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {activeTab === "overview" ? (
            <>
              {/* Active Conversation Title Card */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>CURRENT SESSION</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Online
                  </span>
                </div>
                <h4 className="text-base font-bold text-white leading-snug">
                  {activeConversation?.title || "Fresh Untitled Conversation"}
                </h4>
                <p className="text-xs text-slate-400">
                  Model: <span className="text-pink-300 font-bold">ARFA-3.5 Ultra</span> • Multimodal Ready
                </p>
              </div>

              {/* Metric Counters Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>Total Prompts</span>
                  </div>
                  <p className="text-xl font-black text-white">{userMessages.length}</p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    <span>AI Replies</span>
                  </div>
                  <p className="text-xl font-black text-white">{assistantMessages.length}</p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Hash className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Est. Words</span>
                  </div>
                  <p className="text-xl font-black text-white">{totalWords}</p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Read Time</span>
                  </div>
                  <p className="text-xl font-black text-white">~{estimatedReadingTime} min</p>
                </div>
              </div>

              {/* Message Outline / Key Highlights */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-pink-400" />
                    Key Exchanges ({messages.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleShareSummary}
                    className="jelly-spring text-[11px] text-pink-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Share"}</span>
                  </button>
                </div>

                {messages.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No messages yet in this session. Ask any question to start!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {messages.slice(-5).map((m, idx) => (
                      <div
                        key={m.id || idx}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300"
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 mr-2">
                          {m.role === "user" ? "You" : "ARFA"}
                        </span>
                        <p className="line-clamp-2 mt-0.5 text-slate-200">
                          {m.content || "..."}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Threads list */
            <div className="space-y-2">
              <p className="text-xs text-slate-400 mb-2">Switch instantly between previous dialogues:</p>
              {conversations.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No conversation history yet.</p>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelectConversation(c.id);
                      onClose();
                    }}
                    className={`jelly-spring w-full text-left p-3 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      c.id === activeConversation?.id
                        ? "bg-white/15 border-pink-400/50 text-white"
                        : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{c.title || "Untitled Chat"}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {c.messages?.length || 0} messages • {new Date(c.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/10 text-center">
          <p className="text-[11px] text-slate-400">
            Powered by <span className="font-bold text-pink-300">🎀 ARFA AI Engine</span>
          </p>
        </div>
      </aside>
    </div>
  );
};
