import React, { useState } from "react";
import {
  SquarePen,
  Search,
  MessageSquare,
  Settings,
  MoreVertical,
  Trash2,
  Edit2,
  X,
  HelpCircle,
  SlidersHorizontal,
  PanelLeftClose,
  ChevronDown,
} from "lucide-react";
import { Conversation, User } from "../../types.ts";
import { ArfaLogo } from "../ui/ArfaLogo.tsx";

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (conv: Conversation) => void;
  onDeleteConversation: (conv: Conversation) => void;
  onOpenSettings: () => void;
  onOpenHelp?: () => void;
  onOpenAuth: () => void;
  currentUser: User | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onOpenSettings,
  onOpenHelp,
  onOpenAuth,
  currentUser,
  searchQuery,
  onSearchChange,
  isOpen,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Format relative timestamp
  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const time = d.getTime();

    if (time >= startOfToday) {
      return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } else if (time >= startOfYesterday) {
      return "Yesterday";
    } else {
      const diffDays = Math.floor((now.getTime() - time) / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays < 7 ? `${diffDays}d ago` : d.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Categorize conversation history: Today, Yesterday, Earlier
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

  const todayConvs: Conversation[] = [];
  const yesterdayConvs: Conversation[] = [];
  const earlierConvs: Conversation[] = [];

  conversations.forEach((conv) => {
    const convTime = new Date(conv.updatedAt || conv.createdAt).getTime();
    if (convTime >= startOfToday) {
      todayConvs.push(conv);
    } else if (convTime >= startOfYesterday) {
      yesterdayConvs.push(conv);
    } else {
      earlierConvs.push(conv);
    }
  });

  const renderGroup = (label: string, items: Conversation[]) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="text-[11px] uppercase tracking-wider text-[#7A6250] dark:text-[#A89584] font-bold px-3 pt-2 pb-1.5 select-none">
          {label}
        </div>
        <div className="space-y-1">
          {items.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isMenuOpen = menuOpenId === conv.id;
            const timeLabel = formatTimestamp(conv.updatedAt || conv.createdAt);

            return (
              <div
                key={conv.id}
                id={`conversation-item-${conv.id}`}
                className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "tactile-card text-[#1F130B] dark:text-[#FAF6F0] font-semibold ring-1 ring-[#D6C8BB] dark:ring-[#4D3322]"
                    : "text-[#543D2B] dark:text-[#D8C9BC] hover:bg-[#EFE8DF] dark:hover:bg-[#261A12] hover:text-[#1F130B] dark:hover:text-[#FAF6F0]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onCloseMobile();
                  }}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left truncate cursor-pointer"
                >
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-[#2E1B10] dark:text-[#FAF6F0]" : "text-[#8C7563] dark:text-[#A89584]"
                    }`}
                  />
                  <span className="truncate text-xs sm:text-[13px]">{conv.title}</span>
                </button>

                {/* Right side: Timestamp or Menu Toggle */}
                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  {timeLabel && !isMenuOpen && (
                    <span className="text-[10px] text-[#8C7563] dark:text-[#A89584] group-hover:hidden transition-opacity font-medium">
                      {timeLabel}
                    </span>
                  )}

                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(isMenuOpen ? null : conv.id);
                      }}
                      className={`p-1 rounded-lg text-[#7A6250] hover:text-[#1F130B] dark:text-[#A89584] dark:hover:text-[#FAF6F0] transition-opacity cursor-pointer ${
                        isMenuOpen ? "opacity-100" : "hidden group-hover:block"
                      }`}
                      aria-label="Conversation options"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Context menu */}
                    {isMenuOpen && (
                      <div
                        className="absolute right-0 top-6 z-30 w-32 rounded-xl bg-[#FCFAF7] dark:bg-[#1E140C] border border-[#DDD1C2] dark:border-[#3E291C] py-1 shadow-xl text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpenId(null);
                            onRenameConversation(conv);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#EFE8DF] dark:hover:bg-[#261A12] text-[#1F130B] dark:text-[#FAF6F0] transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#7A6250]" />
                          <span>Rename</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpenId(null);
                            onDeleteConversation(conv);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#EFE8DF] dark:hover:bg-[#261A12] text-[#9E3624] dark:text-[#F0806E] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          id="sidebar-mobile-backdrop"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Tactile Sidebar Container */}
      <aside
        id="arfa-sidebar"
        className={`tactile-sidebar fixed md:static inset-y-0 left-0 z-40 flex flex-col w-72 h-full select-none transition-all duration-250 ease-in-out ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        } ${isCollapsed ? "md:-ml-72" : "md:ml-0"}`}
      >
        {/* Top Header: Brand & Collapse / Close */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="cursor-pointer" onClick={onNewChat}>
            <ArfaLogo size="md" subtitle="Your intelligent companion" />
          </div>
          <div className="flex items-center gap-1">
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Collapse sidebar"
                className="hidden md:flex p-1.5 rounded-xl text-[#7A6250] hover:text-[#1F130B] dark:text-[#A89584] dark:hover:text-[#FAF6F0] hover:bg-[#EFE8DF] dark:hover:bg-[#261A12] transition-colors cursor-pointer"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-xl text-[#543D2B] hover:text-[#1F130B] hover:bg-[#EFE8DF] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tactile New Chat Action: SquarePen Written Symbol like ChatGPT in Image 2 */}
        <div className="px-4 pb-3">
          <button
            id="sidebar-new-chat-btn"
            type="button"
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="tactile-espresso w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-transform active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <SquarePen className="w-4 h-4 text-inherit" />
              <span className="text-inherit text-sm font-semibold tracking-wide">New chat</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono text-inherit">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Tactile Search Bar with Filter Sliders Icon from Image 1 */}
        <div className="px-4 pb-2">
          <div className="tactile-recessed relative rounded-xl flex items-center px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-[#8C7563] shrink-0 mr-2" />
            <input
              id="sidebar-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-transparent border-none outline-none text-xs text-[#1F130B] dark:text-[#FAF6F0] placeholder-[#8C7563] dark:placeholder-[#A89584]"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="text-[#8C7563] hover:text-[#1F130B] dark:hover:text-[#FAF6F0] ml-1 p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8C7563] shrink-0 ml-1 opacity-60" />
            )}
          </div>
        </div>

        {/* Conversation History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {conversations.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#8C7563] dark:text-[#A89584] font-medium">
              {searchQuery ? "No matching conversations" : "No conversations yet"}
            </div>
          ) : (
            <>
              {renderGroup("Today", todayConvs)}
              {renderGroup("Yesterday", yesterdayConvs)}
              {renderGroup("Earlier", earlierConvs)}
            </>
          )}
        </div>

        {/* Sidebar Footer: Settings, Help & Profile (Matching Image 1) */}
        <div className="p-3 border-t border-[#E5DDD3] dark:border-[#332217] space-y-1 bg-[#F5EFEB]/90 dark:bg-[#19100A]/90">
          {/* Settings Button */}
          <button
            id="sidebar-settings-btn"
            type="button"
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#543D2B] dark:text-[#D8C9BC] hover:text-[#1F130B] dark:hover:text-[#FAF6F0] hover:bg-[#EFE8DF] dark:hover:bg-[#261A12] transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-[#543D2B] dark:text-[#D8C9BC]" />
            <span>Settings</span>
          </button>

          {/* Help & Support Button */}
          <button
            id="sidebar-help-btn"
            type="button"
            onClick={() => {
              if (onOpenHelp) onOpenHelp();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#543D2B] dark:text-[#D8C9BC] hover:text-[#1F130B] dark:hover:text-[#FAF6F0] hover:bg-[#EFE8DF] dark:hover:bg-[#261A12] transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-[#543D2B] dark:text-[#D8C9BC]" />
            <span>Help & Support</span>
          </button>

          {/* User Profile Card like Image 1 */}
          <button
            id="sidebar-profile-btn"
            type="button"
            onClick={onOpenAuth}
            className="tactile-raised w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all cursor-pointer mt-1"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2E1B10] to-[#170D07] text-[#FAF6F0] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border border-[#3E2517]">
                {currentUser && !currentUser.isGuest && currentUser.name
                  ? currentUser.name.charAt(0).toUpperCase()
                  : "E"}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-xs font-bold truncate text-[#1F130B] dark:text-[#FAF6F0]">
                  {currentUser?.isGuest ? "Explorer" : currentUser?.name || "Explorer"}
                </p>
                <p className="text-[10px] text-[#7A6250] dark:text-[#A89584] truncate font-medium">
                  {currentUser?.isGuest ? "Free Plan" : "Premium Plan"}
                </p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#7A6250] dark:text-[#A89584] shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
};
