import React, { useState } from "react";
import {
  X,
  Sparkles,
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
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const messages: Message[] = activeConversation?.messages || [];
  const totalWords = messages.reduce(
    (acc, m) => acc + (m.content ? m.content.split(/\s+/).length : 0),
    0
  );
  const estimatedReadingTime = Math.ceil(totalWords / 200);

  const handleShareSummary = () => {
    if (activeConversation) {
      const text = `ARFA AI Chat: ${activeConversation.title}\nMessages: ${messages.length}\nWords: ${totalWords}`;
      navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-auto">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-[#162716]/30 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Side Drawer: Soft 3D Frosted Glass Panel */}
      <aside
        className="relative z-10 w-full sm:w-[380px] md:w-[420px] h-full bg-[#FAFDF3]/95 backdrop-blur-2xl border-l border-white/95 flex flex-col transition-all duration-300 shadow-[0_0_40px_rgba(100,120,40,0.18)]"
      >
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-[#E6ECD4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E6F392] border border-[#BBD852] flex items-center justify-center text-[#3D5615] shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#142614]">Session Insights</h3>
              <p className="text-[11px] text-[#556F52]">Stream metrics & conversation flow</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white border border-[#D5E2BC] text-[#385038] hover:text-[#122412] flex items-center justify-center cursor-pointer transition-colors shadow-xs"
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
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-[#DDEFA0] text-[#1A2E12] border border-[#ABC837] shadow-xs font-black"
                : "bg-white/60 text-[#556E55] hover:text-[#1A2E12] border border-[#E0E8CA]"
            }`}
          >
            Active Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-[#DDEFA0] text-[#1A2E12] border border-[#ABC837] shadow-xs font-black"
                : "bg-white/60 text-[#556E55] hover:text-[#1A2E12] border border-[#E0E8CA]"
            }`}
          >
            All Threads ({conversations.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto themed-scrollbar px-5 py-3 space-y-4">
          {activeTab === "overview" ? (
            <>
              {/* Active Conversation Title Card */}
              <div className="p-4 rounded-2xl bg-white/80 border border-[#E2E8CE] space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-[11px] text-[#556E55] font-bold">
                  <span>CURRENT SESSION</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#EDF5D0] border border-[#C5DDA0] text-[10px] text-[#3D5615] font-extrabold">
                    ACTIVE
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-[#142614]">
                  {activeConversation?.title || "New Dialogue"}
                </h4>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-white/80 border border-[#E2E8CE] shadow-xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FEF08A] flex items-center justify-center text-amber-800">
                    <Hash className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-[#556E55] font-semibold">Messages</p>
                    <p className="text-sm font-black text-[#142614]">{messages.length}</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/80 border border-[#E2E8CE] shadow-xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#D9F99D] flex items-center justify-center text-lime-900">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-[#556E55] font-semibold">Words</p>
                    <p className="text-sm font-black text-[#142614]">{totalWords}</p>
                  </div>
                </div>
              </div>

              {/* Share Summary Button */}
              <button
                type="button"
                onClick={handleShareSummary}
                className="w-full py-2 px-3 rounded-xl bg-white/90 hover:bg-white border border-[#D0DEC0] text-xs font-extrabold text-[#233823] flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-[#445F22]" />}
                <span>{copied ? "Copied Summary!" : "Copy Session Summary"}</span>
              </button>

              {/* Recent Turns */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#445E44]">Recent Turns</p>
                {messages.length === 0 ? (
                  <p className="text-xs text-[#6B846B] py-4 text-center">No messages sent in this session yet.</p>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {messages.slice(-5).map((m, idx) => (
                      <div
                        key={m.id || idx}
                        className="p-2.5 rounded-xl bg-white/80 border border-[#E2E8CE] text-xs shadow-xs"
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#405915] mr-2">
                          {m.role === "user" ? "You" : "ARFA"}
                        </span>
                        <p className="line-clamp-2 mt-0.5 text-[#1A2D1A] font-medium">
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
              <p className="text-xs text-[#556E55] font-medium mb-2">Switch instantly between previous dialogues:</p>
              {conversations.length === 0 ? (
                <p className="text-xs text-[#6B846B] py-6 text-center">No conversation history yet.</p>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelectConversation(c.id);
                      onClose();
                    }}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer shadow-xs ${
                      c.id === activeConversation?.id
                        ? "bg-[#DDEFA0] border-[#B8D74C] text-[#142614]"
                        : "bg-white/80 border-[#E2E8CE] text-[#223522] hover:bg-white"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold truncate">{c.title || "Untitled Chat"}</p>
                      <p className="text-[10px] text-[#556F52] mt-0.5">
                        {c.messages?.length || 0} messages • {new Date(c.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#607960] shrink-0" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#E6ECD4] text-center bg-white/40">
          <p className="text-[11px] text-[#556E55]">
            Powered by <span className="font-bold text-[#354E18]">ARFA AI Core</span>
          </p>
        </div>
      </aside>
    </div>
  );
};
