import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "./components/sidebar/Sidebar.tsx";
import { MessageItem } from "./components/chat/MessageItem.tsx";
import { EmptyState } from "./components/chat/EmptyState.tsx";
import { MessageComposer } from "./components/chat/MessageComposer.tsx";
import { SettingsModal } from "./components/modals/SettingsModal.tsx";
import { AuthModal } from "./components/modals/AuthModal.tsx";
import { ConfirmDeleteModal } from "./components/modals/ConfirmDeleteModal.tsx";
import { RenameModal } from "./components/modals/RenameModal.tsx";
import { ArfaLogo } from "./components/ui/ArfaLogo.tsx";
import { api } from "./lib/api.ts";
import { Conversation, Message, User, MessageAttachment } from "./types.ts";
import { Menu, Plus, AlertCircle, RefreshCw, LogIn } from "lucide-react";

export default function App() {
  // State
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    return (localStorage.getItem("arfa_theme") as any) || "dark";
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Modals & Drawers
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Conversation | "all" | null>(null);
  const [renameTarget, setRenameTarget] = useState<Conversation | null>(null);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Theme Sync
  useEffect(() => {
    localStorage.setItem("arfa_theme", theme);
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme]);

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
  };

  // Sending Messages & Streaming Responses
  const handleSendMessage = async (
    userPrompt: string,
    attachments?: MessageAttachment[],
    isRetry: boolean = false
  ) => {
    if (!userPrompt.trim() && (!attachments || attachments.length === 0)) return;

    setErrorBanner(null);

    // Optimistic user message
    if (!isRetry) {
      const tempUserMsg: Message = {
        id: `temp_user_${Date.now()}`,
        conversationId: activeConversationId || "new",
        role: "user",
        content: userPrompt,
        createdAt: new Date().toISOString(),
        attachments,
      };
      setMessages((prev) => [...prev, tempUserMsg]);
    }
    setIsStreaming(true);
    setStreamingContent("");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let targetConvId = activeConversationId;
    let accumulatedText = "";

    try {
      await api.streamChat(
        {
          conversationId: targetConvId || undefined,
          message: userPrompt,
          attachments,
        },
        {
          signal: controller.signal,
          onInit: (initData) => {
            targetConvId = initData.conversationId;
            setActiveConversationId(initData.conversationId);
            if (initData.isNewConversation) {
              loadConversations();
            }
          },
          onChunk: (chunk: string) => {
            accumulatedText += chunk;
            setStreamingContent(accumulatedText);
          },
          onError: (_errMsg: string) => {
            setErrorBanner("Arfa AI couldn't complete that response.");
            setIsStreaming(false);
          },
          onDone: (doneData) => {
            const assistantMsg: Message = {
              id: doneData.messageId,
              conversationId: targetConvId || "conv",
              role: "assistant",
              content: doneData.fullText || accumulatedText,
              createdAt: new Date().toISOString(),
              model: doneData.model,
            };
            setMessages((prev) => [...prev, assistantMsg]);
            setStreamingContent("");
            setIsStreaming(false);
            abortControllerRef.current = null;
            loadConversations();
          },
        }
      );
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        // User clicked stop
        if (accumulatedText) {
          const partialMsg: Message = {
            id: `partial_${Date.now()}`,
            conversationId: targetConvId || "conv",
            role: "assistant",
            content: accumulatedText,
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, partialMsg]);
        }
      } else {
        setErrorBanner("Arfa AI couldn't complete that response.");
      }
      setIsStreaming(false);
      setStreamingContent("");
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content, lastUserMsg.attachments, true);
    }
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
      const updated = await api.updateConversation(renameTarget.id, newTitle);
      setConversations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setRenameTarget(null);
    } catch (err) {
      console.error("Failed to rename conversation:", err);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    await loadUser();
    await loadConversations();
    handleNewChat();
  };

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  return (
    <div
      id="arfa-app-root"
      className="flex h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#FAF7F7] dark:bg-[#131011] text-[#282122] dark:text-[#FAF4F4] antialiased selection:bg-[#C87575]/20"
    >
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
        onNewChat={handleNewChat}
        onRenameConversation={(conv) => setRenameTarget(conv)}
        onDeleteConversation={(conv) => setDeleteTarget(conv)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area: 100dvh flex-col, overflow-hidden */}
      <main className="flex-1 flex flex-col min-w-0 h-full max-h-[100dvh] overflow-hidden relative">
        {/* Top Navbar: shrink-0 */}
        <header className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#E8D7D7] dark:border-[#302427] bg-white dark:bg-[#191416] z-10 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="mobile-sidebar-toggle-btn"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-[#786E70] dark:text-[#A3989A] hover:text-[#282122] dark:hover:text-[#FAF4F4] hover:bg-[#F6EEEE] dark:hover:bg-[#201A1D] transition-colors cursor-pointer"
              aria-label="Toggle sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <ArfaLogo size="sm" showText={false} />
              <div className="min-w-0">
                <h2 className="text-sm font-semibold truncate text-[#282122] dark:text-[#FAF4F4]">
                  {activeConv ? activeConv.title : "Arfa AI"}
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-[#786E70] dark:text-[#A3989A]">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C26767] dark:bg-[#C87575]" />
                  <span className="truncate">{activeConv ? "Active conversation" : "Ready"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentUser?.isGuest ? (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#C26767] dark:border-[#C87575] text-xs font-medium text-[#C26767] dark:text-[#C87575] hover:bg-[#FDF2F2] dark:hover:bg-[#23191C] transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in</span>
              </button>
            ) : (
              <button
                id="header-new-chat-btn"
                onClick={handleNewChat}
                title="New Chat (⌘K)"
                className="md:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#E8D7D7] dark:border-[#302427] text-xs font-medium text-[#786E70] dark:text-[#A3989A] hover:text-[#C26767] dark:hover:text-[#C87575] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            )}
          </div>
        </header>

        {/* Error Notification Banner: "Arfa AI couldn't complete that response." with "Try again" */}
        {errorBanner && (
          <div className="shrink-0 mx-4 sm:mx-6 mt-3 flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#23191C] border border-[#4A3338] text-xs text-[#FAF4F4] shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#E59C9C]" />
              <span className="font-medium truncate">{errorBanner}</span>
            </div>
            <button
              id="chat-error-retry-btn"
              onClick={handleRegenerate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C87575] hover:bg-[#B66464] text-white transition-colors font-medium shrink-0 ml-3 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Try again</span>
            </button>
          </div>
        )}

        {/* Main Conversation Container: fills available space */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {messages.length === 0 && !isStreaming ? (
            /* Empty state: perfectly contained inside viewport without triggering scroll */
            <div className="flex-1 min-h-0 flex flex-col justify-center items-center overflow-hidden">
              <EmptyState onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
            </div>
          ) : (
            /* Conversation messages: only this region scrolls vertically */
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
                    model: "Arfa AI",
                  }}
                  isStreaming={true}
                />
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Bottom Message Composer: shrink-0 */}
          <div className="shrink-0 border-t border-transparent">
            <MessageComposer
              onSend={handleSendMessage}
              isStreaming={isStreaming}
              onStop={handleStopGeneration}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onThemeChange={(newTheme) => setTheme(newTheme)}
        onClearConversations={() => setDeleteTarget("all")}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          loadConversations();
        }}
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
