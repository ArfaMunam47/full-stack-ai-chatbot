import React, { useState, useEffect, useRef } from "react";
import { MessageItem } from "./components/chat/MessageItem.tsx";
import { EmptyState } from "./components/chat/EmptyState.tsx";
import { MessageComposer } from "./components/chat/MessageComposer.tsx";
import { TactileHeader, LightingTheme } from "./components/chat/TactileHeader.tsx";
import { SidePreviewDrawer } from "./components/chat/SidePreviewDrawer.tsx";
import { SettingsModal } from "./components/modals/SettingsModal.tsx";
import { AuthModal } from "./components/modals/AuthModal.tsx";
import { ConfirmDeleteModal } from "./components/modals/ConfirmDeleteModal.tsx";
import { RenameModal } from "./components/modals/RenameModal.tsx";
import { TemplatesModal } from "./components/modals/TemplatesModal.tsx";
import { KnowledgeModal } from "./components/modals/KnowledgeModal.tsx";
import { Soft3DBackground } from "./components/ui/Soft3DBackground.tsx";
import { api } from "./lib/api.ts";
import { Conversation, Message, User, MessageAttachment, ComposerMode } from "./types.ts";
import { AlertCircle, RefreshCw, X } from "lucide-react";

export default function App() {
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidePreviewOpen, setIsSidePreviewOpen] = useState(false);
  const [lightingTheme, setLightingTheme] = useState<LightingTheme>("blush");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.1-flash-lite");

  // One-Click Lighting Theme Switcher (Rose Quartz, Peach Satin, Lavender Dream, Mint Opal)
  const cycleLightingTheme = () => {
    setLightingTheme((curr) => {
      if (curr === "blush") return "sunlight";
      if (curr === "sunlight") return "lunar";
      if (curr === "lunar") return "emerald";
      return "blush";
    });
  };

  const handleSelectModel = async (modelId: string) => {
    setSelectedModel(modelId);
    try {
      await api.updateSettings({
        preferredProvider: "gemini",
        preferredModel: modelId,
      });
    } catch (err) {
      console.error("Failed to update preferred model:", err);
    }
  };

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<"login" | "register">("login");
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Conversation | "all" | null>(null);
  const [renameTarget, setRenameTarget] = useState<Conversation | null>(null);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    loadUser();
    loadConversations();
    api.getSettings().then((s) => {
      if (s?.preferredModel) {
        setSelectedModel(s.preferredModel);
      }
    }).catch(() => {});
  }, []);

  // Search filter
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
        setIsTemplatesOpen(false);
        setIsKnowledgeOpen(false);
        setDeleteTarget(null);
        setRenameTarget(null);
        setIsSidebarOpen(false);
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
    mode?: ComposerMode,
    isRetry: boolean = false
  ) => {
    if (!userPrompt.trim() && (!attachments || attachments.length === 0)) return;

    setErrorBanner(null);
    setStreamingStatusText(null);

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
          modelName: selectedModel,
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
              model: data.model || "ARFA-3.5 Ultra",
              media: data.media,
            };

            setMessages((prev) => [...prev, finalAssistantMsg]);
            loadConversations();
          },
          onError: (errorMsg: string) => {
            console.error("Streaming error:", errorMsg);
            setIsStreaming(false);
            setStreamingStatusText(null);
            setErrorBanner(errorMsg || "An error occurred while generating the response.");
          },
          signal: abortControllerRef.current.signal,
        }
      );
    } catch (err: any) {
      if (err?.name === "AbortError") {
        console.log("Stream stopped by user");
      } else {
        console.error("Send message catch:", err);
        setErrorBanner(err?.message || "Failed to communicate with ARFA AI.");
      }
      setIsStreaming(false);
      setStreamingStatusText(null);
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
        model: "ARFA-3.5 Ultra",
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

  const activeConv = conversations.find((c) => c.id === activeConversationId) || null;

  return (
    <div
      id="arfa-root-app"
      data-theme={lightingTheme}
      className="flex h-screen w-screen overflow-hidden text-[#3D1429] relative select-none font-sans"
    >
      {/* 2026 Soft 3D Claymorphism & Frosted Glass Background with Non-Bright Eye-Safe Palette */}
      <Soft3DBackground lightingTheme={lightingTheme} />

      {/* Main Experience Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full z-10 p-2 sm:p-3 md:p-4">
        <div className="flex-1 min-h-0 w-full max-w-5xl mx-auto flex flex-col relative overflow-hidden">
          {/* 1. Integrated Double-Glass Navbar */}
          <TactileHeader
            onNewChat={handleNewChat}
            onToggleSidePreview={() => setIsSidePreviewOpen((prev) => !prev)}
            isSidePreviewOpen={isSidePreviewOpen}
            lightingTheme={lightingTheme}
            onCycleLighting={cycleLightingTheme}
            onSelectLightingTheme={setLightingTheme}
            selectedModel={selectedModel}
            onSelectModel={handleSelectModel}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAuth={(mode) => {
              setAuthInitialMode(mode || "login");
              setIsAuthOpen(true);
            }}
            onLogout={handleLogout}
            currentUser={currentUser}
            activeConversation={activeConv}
            conversations={conversations}
            onSelectConversation={selectConversation}
            onDeleteConversation={(c) => setDeleteTarget(c)}
            hasMessages={messages.length > 0}
          />

          {/* Error Notification Banner */}
          {errorBanner && (
            <div className="shrink-0 mx-2 mt-2 max-w-3xl w-full mx-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-200 shadow-xl z-20 animate-fadeIn backdrop-blur-md">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="font-semibold text-xs leading-relaxed line-clamp-2">
                  {errorBanner}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="text-white bg-rose-600 hover:bg-rose-500 inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
                <button
                  type="button"
                  onClick={() => setErrorBanner(null)}
                  className="text-rose-300 hover:text-white p-1 cursor-pointer transition-colors"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 2. Scrollable Conversation History or Tactile Empty State */}
          <div
            className={`flex-1 min-h-0 relative flex flex-col px-2 sm:px-4 pt-3.5 sm:pt-4.5 pb-2 ${
              messages.length === 0 && !isStreaming
                ? "overflow-hidden"
                : "overflow-y-auto chat-scroll-container"
            }`}
          >
            {messages.length === 0 && !isStreaming ? (
              <div className="w-full flex-1 flex flex-col justify-center items-center my-auto py-2 sm:py-3 max-w-2xl mx-auto">
                <EmptyState
                  onSelectPrompt={(prompt) => handleSendMessage(prompt)}
                  lightingTheme={lightingTheme}
                />
              </div>
            ) : (
              <div className="w-full space-y-2.5 sm:space-y-3 max-w-3xl mx-auto">
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
                      window.dispatchEvent(
                        new CustomEvent("alpha:set-prompt", { detail: promptText })
                      );
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
                      model: "ARFA-3.5 Ultra",
                    }}
                    isStreaming={true}
                  />
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* 3. Bottom Docked Tactile Composer Deck with Clean Compact Margin */}
          <div className="shrink-0 w-full pt-1 pb-1 px-2 sm:px-4 max-w-3xl mx-auto">
            <MessageComposer
              onSend={handleSendMessage}
              isStreaming={isStreaming}
              onStop={handleStopGeneration}
              activeMode={activeMode}
              onModeChange={setActiveMode}
              statusText={streamingStatusText}
              lightingTheme={lightingTheme}
            />
          </div>
        </div>
      </div>

      {/* Side Preview Drawer */}
      <SidePreviewDrawer
        isOpen={isSidePreviewOpen}
        onClose={() => setIsSidePreviewOpen(false)}
        activeConversation={activeConv}
        conversations={conversations}
        onSelectConversation={selectConversation}
        lightingTheme={lightingTheme}
      />

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => {
          setIsSettingsOpen(false);
          setAuthInitialMode("login");
          setIsAuthOpen(true);
        }}
        onLogout={() => {
          setIsSettingsOpen(false);
          handleLogout();
        }}
        onClearConversations={() => setDeleteTarget("all")}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authInitialMode}
        lightingTheme={lightingTheme}
        onSelectLightingTheme={setLightingTheme}
        onSuccess={() => {
          loadUser();
          loadConversations();
          setIsAuthOpen(false);
        }}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirmed}
        title={
          deleteTarget === "all"
            ? "Clear All History?"
            : `Delete "${deleteTarget?.title}"?`
        }
        description={
          deleteTarget === "all"
            ? "This will permanently remove all conversations from your ARFA AI library."
            : "This action cannot be undone and will permanently delete this conversation."
        }
      />

      <RenameModal
        isOpen={Boolean(renameTarget)}
        onCancel={() => setRenameTarget(null)}
        initialTitle={renameTarget?.title || ""}
        onSave={handleRenameSaved}
      />

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={(prompt) => {
          setIsTemplatesOpen(false);
          handleSendMessage(prompt);
        }}
      />

      <KnowledgeModal
        isOpen={isKnowledgeOpen}
        onClose={() => setIsKnowledgeOpen(false)}
      />
    </div>
  );
}
