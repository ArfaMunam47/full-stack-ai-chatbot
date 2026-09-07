import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "./components/sidebar/Sidebar.tsx";
import { MessageItem } from "./components/chat/MessageItem.tsx";
import { EmptyState } from "./components/chat/EmptyState.tsx";
import { MessageComposer } from "./components/chat/MessageComposer.tsx";
import { SettingsModal } from "./components/modals/SettingsModal.tsx";
import { AuthModal } from "./components/modals/AuthModal.tsx";
import { ConfirmDeleteModal } from "./components/modals/ConfirmDeleteModal.tsx";
import { RenameModal } from "./components/modals/RenameModal.tsx";
import { HelpModal } from "./components/modals/HelpModal.tsx";
import { TemplatesModal } from "./components/modals/TemplatesModal.tsx";
import { KnowledgeModal } from "./components/modals/KnowledgeModal.tsx";
import { ArfaLogo } from "./components/ui/ArfaLogo.tsx";
import { api } from "./lib/api.ts";
import { Conversation, Message, User, MessageAttachment, ComposerMode } from "./types.ts";
import {
  Menu,
  AlertCircle,
  RefreshCw,
  LogIn,
  MoreVertical,
  Settings,
  HelpCircle,
  Trash2,
  SquarePen,
  PanelLeft,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

export default function App() {
  // Theme state: Enforce permanent single light luxury theme
  const [theme] = useState<"light">("light");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingStatusText, setStreamingStatusText] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<ComposerMode>("chat");
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [audioVoiceEnabled, setAudioVoiceEnabled] = useState<boolean>(() => {
    return localStorage.getItem("arfa_audio_voice") === "true";
  });
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("arfa_sidebar_collapsed") === "true";
  });

  // Modals & Drawers
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<"login" | "register">("login");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Conversation | "all" | null>(null);
  const [renameTarget, setRenameTarget] = useState<Conversation | null>(null);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  // Single Light Theme Enforcement (No dark mode)
  useEffect(() => {
    localStorage.setItem("arfa_theme", "light");
    const root = document.documentElement;
    root.classList.remove("dark");
  }, []);

  // Audio Voice preference sync
  useEffect(() => {
    localStorage.setItem("arfa_audio_voice", String(audioVoiceEnabled));
  }, [audioVoiceEnabled]);

  // Auto-dismiss error banner after 10s
  useEffect(() => {
    if (!errorBanner) return;
    const timer = setTimeout(() => setErrorBanner(null), 10000);
    return () => clearTimeout(timer);
  }, [errorBanner]);

  // Close header menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target as Node)) {
        setIsHeaderMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load User & Conversations on Mount
  useEffect(() => {
    loadUser();
    loadConversations();
  }, []);

  // Debounced Conversation Search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadConversations(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Scroll to bottom when messages or streaming update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleNewChat();
      }
      if (e.key === "Escape") {
        setIsSettingsOpen(false);
        setIsAuthOpen(false);
        setIsHelpOpen(false);
        setIsTemplatesOpen(false);
        setIsKnowledgeOpen(false);
        setIsHeaderMenuOpen(false);
        setDeleteTarget(null);
        setRenameTarget(null);
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const loadUser = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error("Error loading user:", err);
    }
  };

  const loadConversations = async (q?: string) => {
    try {
      const list = await api.getConversations(q);
      setConversations(list);
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  };

  const selectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    setErrorBanner(null);
    try {
      const conv = await api.getConversation(convId);
      setMessages(conv.messages || []);
    } catch (err) {
      console.error("Failed to load conversation:", err);
      setErrorBanner("Failed to load conversation messages.");
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setStreamingContent("");
    setErrorBanner(null);
    setIsMobileSidebarOpen(false);
  };

  // Optional voice playback helper for complete responses
  const speakTextIfEnabled = (text: string) => {
    if (!audioVoiceEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/```[\s\S]*?```/g, "code block").replace(/[#*`_]/g, "");
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Speech synthesis error:", err);
    }
  };

  // Sending Messages & Streaming Responses
  const handleSendMessage = async (
    userPrompt: string,
    attachments?: MessageAttachment[],
    mode?: ComposerMode,
    isRetry: boolean = false
  ) => {
    if (!userPrompt.trim() && (!attachments || attachments.length === 0)) return;

    setErrorBanner(null);
    setStreamingStatusText(null);

    // Build temporary user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      conversationId: activeConversationId || "temp",
      role: "user",
      content: userPrompt,
      createdAt: new Date().toISOString(),
      attachments: attachments || [],
    };

    let updatedHistory = isRetry ? [...messages] : [...messages, userMessage];
    if (!isRetry) {
      setMessages(updatedHistory);
    }

    setIsStreaming(true);
    setStreamingContent("");

    abortControllerRef.current = new AbortController();

    let fullAccumulatedResponse = "";
    let hasCompleted = false;

    try {
      await api.streamChat(
        {
          conversationId: activeConversationId || undefined,
          message: userPrompt,
          attachments,
          mode: mode || activeMode,
        },
        {
          onInit: (data) => {
            if (data.conversationId && !activeConversationId) {
              setActiveConversationId(data.conversationId);
              loadConversations();
            }
          },
          onStatus: (statusText: string) => {
            setStreamingStatusText(statusText);
          },
          onChunk: (chunk: string) => {
            if (hasCompleted) return;
            fullAccumulatedResponse += chunk;
            setStreamingContent((prev) => prev + chunk);
          },
          onDone: async (data) => {
            if (hasCompleted) return;
            hasCompleted = true;
            setIsStreaming(false);
            setStreamingContent("");
            setStreamingStatusText(null);

            const finalAssistantMsg: Message = {
              id: data.messageId || `assistant_${Date.now()}`,
              conversationId: activeConversationId || "active",
              role: "assistant",
              content: data.fullText || fullAccumulatedResponse,
              createdAt: new Date().toISOString(),
              model: data.model || "ARFA AI",
              media: data.media,
            };

            setMessages((prev) => [...prev, finalAssistantMsg]);
            loadConversations();

            // Voice audio read aloud if enabled
            speakTextIfEnabled(data.fullText || fullAccumulatedResponse);
          },
          onError: (errorMessage: string) => {
            if (hasCompleted) return;
            hasCompleted = true;
            setIsStreaming(false);
            setStreamingContent("");
            setStreamingStatusText(null);
            setErrorBanner(errorMessage || "Arfa AI couldn't complete that response.");
            console.error("Chat streaming error:", errorMessage);
          },
          signal: abortControllerRef.current?.signal,
        }
      );
    } catch (err: unknown) {
      if (!hasCompleted) {
        hasCompleted = true;
        if ((err as any)?.name === "AbortError") {
          console.log("User stopped generation.");
        } else {
          setErrorBanner("Arfa AI couldn't complete that response.");
        }
        setIsStreaming(false);
        setStreamingContent("");
        setStreamingStatusText(null);
      }
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStreamingStatusText(null);
    if (streamingContent.trim()) {
      const stoppedMsg: Message = {
        id: `assistant_${Date.now()}`,
        conversationId: activeConversationId || "active",
        role: "assistant",
        content: streamingContent,
        createdAt: new Date().toISOString(),
        model: "ARFA AI",
      };
      setMessages((prev) => [...prev, stoppedMsg]);
    }
    setIsStreaming(false);
    setStreamingContent("");
  };

  const handleRegenerate = () => {
    if (messages.length === 0) return;
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMessage) return;

    if (messages[messages.length - 1].role === "assistant") {
      setMessages((prev) => prev.slice(0, -1));
    }

    handleSendMessage(lastUserMessage.content, lastUserMessage.attachments, undefined, true);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;

    if (deleteTarget === "all") {
      await api.deleteAllConversations();
      setConversations([]);
      handleNewChat();
    } else {
      await api.deleteConversation(deleteTarget.id);
      setConversations((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      if (activeConversationId === deleteTarget.id) {
        handleNewChat();
      }
    }
    setDeleteTarget(null);
  };

  const handleRenameSaved = async (newTitle: string) => {
    if (!renameTarget) return;
    try {
      const updated = await api.renameConversation(renameTarget.id, newTitle);
      setConversations((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, title: updated.title } : c))
      );
    } catch (err) {
      console.error("Rename error:", err);
    } finally {
      setRenameTarget(null);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      loadUser();
      handleNewChat();
      loadConversations();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF6F0] text-[#1A1718] select-none">
      {/* Sidebar with Navigation, Conversation History, and Auth Options */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
        onNewChat={handleNewChat}
        onRenameConversation={(conv) => setRenameTarget(conv)}
        onDeleteConversation={(conv) => setDeleteTarget(conv)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenKnowledge={() => setIsKnowledgeOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenAuth={(mode) => {
          setAuthInitialMode(mode || "login");
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        currentUser={currentUser}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => {
          const next = !isSidebarCollapsed;
          setIsSidebarCollapsed(next);
          localStorage.setItem("arfa_sidebar_collapsed", String(next));
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full max-h-[100dvh] overflow-hidden relative bg-[#FAF8F7]">
        {/* Modern Pristine Header */}
        <header
          id="main-chat-header"
          className="shrink-0 flex items-center justify-between px-3 sm:px-6 h-14 border-b border-[#EFE9E6] bg-white/80 backdrop-blur-md z-10"
        >
          {/* Left: Mobile Menu Toggle, Desktop Expand, & Permanent ARFA AI Identity */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              id="mobile-sidebar-toggle-btn"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-[#5A5456] hover:text-[#1A1718] hover:bg-[#F6F3F1] transition-colors cursor-pointer"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {isSidebarCollapsed && (
              <button
                id="desktop-sidebar-expand-btn"
                onClick={() => {
                  setIsSidebarCollapsed(false);
                  localStorage.setItem("arfa_sidebar_collapsed", "false");
                }}
                title="Open sidebar"
                className="hidden md:flex p-2 rounded-xl text-[#5A5456] hover:text-[#1A1718] hover:bg-[#F6F3F1] transition-colors cursor-pointer"
                aria-label="Open sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            {/* Permanent ARFA AI Brand Identity - Header ALWAYS says ARFA AI */}
            <div className="flex items-center gap-2.5 min-w-0">
              <ArfaLogo size="sm" showText={true} />
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FDF2F5] text-[#D84A70] border border-[#F7CDD8]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D84A70] animate-pulse" />
                Online
              </span>
            </div>
          </div>

          {/* Right Controls: New Chat, Sign in & More Options */}
          <div className="flex items-center gap-2 shrink-0">
            {/* New Chat Button */}
            <button
              id="header-new-chat-btn"
              onClick={handleNewChat}
              title="New Chat (⌘K)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1A1718] bg-white border border-[#EFE9E6] hover:border-[#D84A70] hover:bg-[#FDF2F5] hover:text-[#D84A70] cursor-pointer shadow-xs transition-all duration-150 active:scale-95"
            >
              <SquarePen className="w-3.5 h-3.5 text-[#D84A70]" />
              <span className="hidden sm:inline font-semibold">New chat</span>
            </button>

            {/* Auth / Profile trigger */}
            {currentUser?.isGuest ? (
              <button
                type="button"
                onClick={() => {
                  setAuthInitialMode("login");
                  setIsAuthOpen(true);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer text-white bg-[#1A1718] hover:bg-black shadow-xs transition-colors active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in</span>
              </button>
            ) : null}

            {/* More Options Dropdown */}
            <div className="relative" ref={headerMenuRef}>
              <button
                id="header-more-options-btn"
                type="button"
                onClick={() => setIsHeaderMenuOpen((prev) => !prev)}
                title="More options"
                className="p-2 rounded-xl text-[#7E7779] hover:text-[#1A1718] hover:bg-[#F6F3F1] cursor-pointer transition-colors"
                aria-label="More options"
                aria-expanded={isHeaderMenuOpen}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {isHeaderMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white p-1.5 shadow-xl z-30 border border-[#EFE9E6] animate-fadeIn text-xs">
                  <button
                    onClick={() => {
                      setIsHeaderMenuOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-[#1A1718] hover:bg-[#F6F3F1] transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#7E7779]" />
                    <span>Settings & Models</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsHeaderMenuOpen(false);
                      setIsHelpOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-[#1A1718] hover:bg-[#F6F3F1] transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#7E7779]" />
                    <span>Voice & Guide</span>
                  </button>

                  {activeConv && (
                    <button
                      onClick={() => {
                        setIsHeaderMenuOpen(false);
                        setDeleteTarget(activeConv);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-t border-[#EFE9E6] mt-1 pt-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Conversation</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Error Notification Banner */}
        {errorBanner && (
          <div className="shrink-0 mx-4 sm:mx-6 mt-3 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#FFF5F7] border border-[#F5C4D2] text-xs text-[#9B2A48] shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D84A70]" />
              <span className="font-medium text-xs leading-relaxed line-clamp-2">{errorBanner}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="chat-error-retry-btn"
                onClick={handleRegenerate}
                className="text-white bg-[#D84A70] hover:bg-[#C0375D] inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors active:scale-95"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={() => setErrorBanner(null)}
                className="text-[#9B2A48] hover:text-[#D84A70] p-1 rounded-md transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Conversation Container */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {messages.length === 0 && !isStreaming ? (
            /* Empty state matching user's reference layout */
            <div className="flex-1 min-h-0 flex flex-col justify-center items-center overflow-y-auto">
              <EmptyState
                currentUser={currentUser}
                onSelectPrompt={(prompt) => handleSendMessage(prompt)}
              />
            </div>
          ) : (
            /* Conversation messages */
            <div className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-4 py-4 space-y-2">
              {messages.map((msg, index) => (
                <MessageItem
                  key={msg.id || index}
                  message={msg}
                  onRegenerate={
                    msg.role === "assistant" && index === messages.length - 1
                      ? handleRegenerate
                      : undefined
                  }
                  onPromptAction={(promptText) => {
                    window.dispatchEvent(new CustomEvent("arfa:set-prompt", { detail: promptText }));
                  }}
                />
              ))}

              {/* Progressive Live Streaming Message */}
              {isStreaming && (
                <MessageItem
                  message={{
                    id: "streaming_live_msg",
                    conversationId: activeConversationId || "active",
                    role: "assistant",
                    content: streamingContent || "",
                    createdAt: new Date().toISOString(),
                    model: "ARFA AI",
                  }}
                  isStreaming={true}
                />
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Bottom Message Composer ONLY when conversation is active or streaming */}
          {(messages.length > 0 || isStreaming) && (
            <div className="shrink-0 border-t border-transparent">
              <MessageComposer
                onSend={handleSendMessage}
                isStreaming={isStreaming}
                onStop={handleStopGeneration}
                activeMode={activeMode}
                onModeChange={setActiveMode}
                statusText={streamingStatusText}
              />
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthInitialMode("login");
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        onClearConversations={() => setDeleteTarget("all")}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authInitialMode}
        onSuccess={(user) => {
          setCurrentUser(user);
          loadConversations();
        }}
      />

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={(prompt) => handleSendMessage(prompt)}
      />

      <KnowledgeModal
        isOpen={isKnowledgeOpen}
        onClose={() => setIsKnowledgeOpen(false)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget === "all" ? "Delete All Conversations" : "Delete Conversation"}
        description={
          deleteTarget === "all"
            ? "Are you sure you want to delete all conversations? This action cannot be undone."
            : `Are you sure you want to delete "${(deleteTarget as Conversation)?.title}"? This cannot be undone.`
        }
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteTarget(null)}
      />

      <RenameModal
        isOpen={Boolean(renameTarget)}
        initialTitle={renameTarget?.title || ""}
        onSave={handleRenameSaved}
        onCancel={() => setRenameTarget(null)}
      />
    </div>
  );
}
