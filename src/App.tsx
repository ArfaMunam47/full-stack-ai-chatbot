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
import { NeedleFeltBow } from "./components/ui/NeedleFeltBow.tsx";
import { UserAvatar } from "./components/ui/UserAvatar.tsx";
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
  // Hide chat history sidebar on open so it starts fresh from start
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);

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
    <div
      className="flex flex-row h-screen w-screen overflow-hidden bg-[#FDF8F5] text-[#2B1E25] select-none"
      style={{ height: "100vh", display: "flex", flexDirection: "row", overflow: "hidden" }}
    >
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
      <main className="flex-1 flex flex-col min-w-0 h-full max-h-[100dvh] overflow-hidden relative cozy-felt-bg">
        {/* Simple Professional Needle-Felted Navigation Bar */}
        <header
          id="main-chat-header"
          className="shrink-0 flex items-center justify-between px-3.5 sm:px-6 h-16 sm:h-20 border-b border-[#E95D95]/12 bg-[#FFFDFB]/90 backdrop-blur-md z-20 select-none"
        >
          {/* LEFT SIDE: small sidebar/menu toggle + ARFA AI logo + ARFA AI wordmark + subtle "Online" status */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            {/* Mobile Hamburger Toggle */}
            <button
              id="mobile-sidebar-toggle-btn"
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2.5 rounded-2xl felt-btn-marshmallow text-[#8E7882] hover:text-[#E95D95] transition-colors cursor-pointer"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              id="desktop-sidebar-toggle-btn"
              type="button"
              onClick={() => {
                const next = !isSidebarCollapsed;
                setIsSidebarCollapsed(next);
                localStorage.setItem("arfa_sidebar_collapsed", String(next));
              }}
              title={isSidebarCollapsed ? "Open past chats" : "Collapse sidebar"}
              className="hidden md:inline-flex p-2.5 rounded-2xl felt-btn-marshmallow text-[#8E7882] hover:text-[#E95D95] transition-colors cursor-pointer"
              aria-label={isSidebarCollapsed ? "Open past chats" : "Collapse sidebar"}
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* ARFA AI Logo & Wordmark */}
            <div className="flex items-center gap-2">
              <ArfaLogo size="sm" showText={true} />
            </div>

            {/* Small Subtle Status Indicator: "● Online" */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF8F2] border border-[#A7E3C7]/80 text-[11.5px] font-bold text-[#1E7750] shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>Online</span>
            </div>
          </div>

          {/* CENTER: Keep mostly empty. No unnecessary text or decorative cards. */}
          <div className="flex-1" />

          {/* RIGHT SIDE: Fluffy 3D Authentication actions [Sign in] [Sign up] + Optional Settings */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {currentUser ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full felt-btn-marshmallow text-xs sm:text-sm font-bold text-[#2B1E25] cursor-pointer"
                  title="Account Settings"
                >
                  <UserAvatar user={currentUser} size="xs" />
                  <span className="hidden sm:inline max-w-[120px] truncate">{currentUser.name}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 rounded-full fluffy-btn-signin text-xs sm:text-sm font-bold text-[#8E7882] hover:text-[#9B2A48] cursor-pointer transition-colors"
                  title="Log out"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                {/* [Sign in] = Fluffy 3D tactile marshmallow needle-felted pill button */}
                <button
                  id="header-signin-btn"
                  type="button"
                  onClick={() => {
                    setAuthInitialMode("login");
                    setIsAuthOpen(true);
                  }}
                  className="px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-bold fluffy-btn-signin cursor-pointer shadow-sm"
                >
                  Sign in
                </button>

                {/* [Sign up] = Fluffy 3D primary plush pink needle-felted pill button */}
                <button
                  id="header-signup-btn"
                  type="button"
                  onClick={() => {
                    setAuthInitialMode("register");
                    setIsAuthOpen(true);
                  }}
                  className="px-4 sm:px-6 py-2 text-xs sm:text-sm font-extrabold text-white fluffy-btn-signup cursor-pointer shadow-md"
                >
                  Sign up
                </button>
              </>
            )}

            {/* Subtle Settings Icon beside actions */}
            <button
              id="header-settings-btn"
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 sm:p-2.5 rounded-full felt-btn-marshmallow text-[#8E7882] hover:text-[#E95D95] cursor-pointer transition-colors"
              title="Settings"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Error Notification Banner */}
        {errorBanner && (
          <div className="shrink-0 mx-4 sm:mx-6 mt-3 flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#FFF5F7] border border-[#F5C4D2] text-xs text-[#9B2A48] shadow-xs animate-fadeIn z-10">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D84A70]" />
              <span className="font-medium text-xs leading-relaxed line-clamp-2">{errorBanner}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="chat-error-retry-btn"
                onClick={handleRegenerate}
                className="text-white bg-[#D84A70] hover:bg-[#C0375D] inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors active:scale-95"
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

        {/* Main Conversation Container & Docked Chat Bar (Zero Overlap, Clean Flow) */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {/* Main Chat Stream: Smooth vertical scroll container with zero element overlap */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative flex flex-col">
            {messages.length === 0 && !isStreaming ? (
              <div className="flex-1 min-h-0 flex flex-col justify-center items-center px-3 sm:px-4 py-4 sm:py-6 my-auto">
                <EmptyState
                  currentUser={currentUser}
                  onSelectPrompt={(prompt) => handleSendMessage(prompt)}
                />
              </div>
            ) : (
              <div className="w-full max-w-3xl mx-auto px-4 pt-4 pb-4 space-y-3 sm:space-y-4">
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
          </div>

          {/* Clean Docked Bottom Composer Area (Zero Overlap, Clean Padding) */}
          <div className="shrink-0 w-full px-3 sm:px-6 pt-1 pb-3 sm:pb-5 bg-gradient-to-t from-[#FBF8F5] via-[#FBF8F5]/95 to-transparent z-20">
            <div className="w-full max-w-3xl mx-auto">
              <MessageComposer
                onSend={handleSendMessage}
                isStreaming={isStreaming}
                onStop={handleStopGeneration}
                activeMode={activeMode}
                onModeChange={setActiveMode}
                statusText={streamingStatusText}
              />
            </div>
          </div>
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
