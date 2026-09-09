import React, { useState } from "react";
import {
  SquarePen,
  MessageSquare,
  Settings,
  MoreVertical,
  Trash2,
  Edit2,
  PanelLeftClose,
  ChevronDown,
  LogOut,
  UserCheck,
  LogIn,
  Search,
  X,
  Sparkles,
} from "lucide-react";
import { Conversation, User } from "../../types.ts";
import { ArfaLogo } from "../ui/ArfaLogo.tsx";
import { NeedleFeltBow } from "../ui/NeedleFeltBow.tsx";

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (conv: Conversation) => void;
  onDeleteConversation: (conv: Conversation) => void;
  onOpenSettings: () => void;
  onOpenKnowledge?: () => void;
  onOpenTemplates?: () => void;
  onOpenAuth: (mode?: "login" | "register") => void;
  onLogout: () => void;
  currentUser: User | null;
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
  onOpenAuth,
  onLogout,
  currentUser,
  isOpen,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Filter conversations by search
  const filteredConversations = searchQuery.trim()
    ? conversations.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : conversations;

  // Group conversations into Today, Yesterday, Earlier
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

  const todayConvs: Conversation[] = [];
  const yesterdayConvs: Conversation[] = [];
  const earlierConvs: Conversation[] = [];

  filteredConversations.forEach((conv) => {
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
        <div className="text-[11px] uppercase tracking-wider text-[#8E7882] font-bold px-3 pt-2 pb-1.5 select-none flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-[#E95D95] font-semibold">{items.length}</span>
        </div>
        <div className="space-y-1">
          {items.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isMenuOpen = menuOpenId === conv.id;

            return (
              <div
                key={conv.id}
                id={`conversation-item-${conv.id}`}
                className={`group relative flex items-center justify-between rounded-2xl px-3 py-2 text-xs transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "felt-btn-pink text-white font-bold shadow-xs"
                    : "felt-btn-marshmallow text-[#2B1E25] hover:text-[#E95D95]"
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
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? "text-white" : "text-[#E95D95]"
                    }`}
                  />
                  <span className="truncate leading-normal">{conv.title}</span>
                </button>

                {/* More options button */}
                <div className="relative shrink-0 ml-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(isMenuOpen ? null : conv.id);
                    }}
                    className={`p-1 rounded-xl transition-opacity cursor-pointer ${
                      isActive
                        ? "text-white/80 hover:text-white hover:bg-white/20"
                        : "text-[#8E7882] hover:text-[#E95D95] hover:bg-[#FDF2F7]"
                    } ${
                      isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                    title="Conversation options"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {isMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-1 w-36 rounded-2xl bg-[#FFFDFB] border border-[#FFB7D5]/40 shadow-xl py-1.5 z-30 animate-fadeIn text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpenId(null);
                          onRenameConversation(conv);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#2B1E25] hover:bg-[#FDF2F7] hover:text-[#E95D95] font-medium cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 text-[#8E7882]" />
                        <span>Rename</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpenId(null);
                          onDeleteConversation(conv);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-medium cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
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
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-[#FAF4EE] border-r border-[#E95D95]/15 flex flex-col transition-all duration-200 ease-in-out select-none shrink-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${isCollapsed ? "md:-translate-x-full md:w-0 md:border-none overflow-hidden" : ""}`}
      >
        {/* Top Header: Logo + Past Chats label + Collapse Button */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#E95D95]/12 bg-[#FFFDFB]/60">
          <div className="flex items-center gap-2 min-w-0">
            <ArfaLogo size="sm" showText={true} subtitle="Past Chats" />
          </div>
          <button
            type="button"
            onClick={() => {
              if (onToggleCollapse) onToggleCollapse();
              onCloseMobile();
            }}
            className="p-1.5 rounded-xl felt-btn-marshmallow text-[#8E7882] hover:text-[#E95D95] transition-colors cursor-pointer"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            id="sidebar-new-chat-btn"
            type="button"
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl felt-btn-pink text-white text-xs font-bold cursor-pointer transition-all shadow-xs group active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <SquarePen className="w-4 h-4 group-hover:scale-110 transition-transform stroke-[2.2]" />
              <span className="font-extrabold text-xs tracking-tight">New Chat</span>
            </div>
            <div className="flex items-center gap-1">
              <NeedleFeltBow color="white" size="xs" />
              <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-lg bg-white/20 text-[10px] font-mono text-white font-bold border border-white/30">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>

        {/* Search Bar for Conversations */}
        <div className="px-3 pb-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3.5 text-[#B8A3AD] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past chats..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-2xl felt-card-marshmallow text-[#2B1E25] placeholder-[#B8A3AD] outline-none border border-[#FFB7D5]/40 focus:border-[#E95D95] transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 p-1 text-[#B8A3AD] hover:text-[#E95D95] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="mx-3 my-1 border-t border-[#E95D95]/12" />

        {/* Conversation History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#8E7882] font-medium flex flex-col items-center gap-2">
              <NeedleFeltBow color="pink" size="sm" />
              <p>{searchQuery ? "No matching chats" : "No past chats yet"}</p>
              <p className="text-[11px] text-[#B8A3AD]">Start a conversation to see it here</p>
            </div>
          ) : (
            <>
              {renderGroup("Today", todayConvs)}
              {renderGroup("Yesterday", yesterdayConvs)}
              {renderGroup("Earlier", earlierConvs)}
            </>
          )}
        </div>

        {/* Bottom User Settings & Account Management */}
        <div className="p-3 border-t border-[#E95D95]/12 bg-[#FAF4EE] relative space-y-2">
          {/* Quick Settings Action Button */}
          <button
            id="sidebar-open-settings-btn"
            type="button"
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl felt-btn-marshmallow text-xs text-[#2B1E25] hover:text-[#E95D95] transition-all cursor-pointer font-bold"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#E95D95]" />
              <span>Settings & Preferences</span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-[#FFB7D5]" />
          </button>

          {/* Account Profile Section */}
          {currentUser && !currentUser.isGuest ? (
            <>
              <button
                id="sidebar-profile-card"
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-full flex items-center justify-between p-2 rounded-2xl felt-card-marshmallow text-left transition-colors cursor-pointer border border-[#FFB7D5]/40"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl felt-btn-pink text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate text-[#2B1E25]">
                      {currentUser.name || "User"}
                    </p>
                    <p className="text-[10px] text-[#E95D95] font-bold">
                      Active Member
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#8E7882] transition-transform ${
                    isProfileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Popover Menu */}
              {isProfileMenuOpen && (
                <div className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl felt-card-marshmallow shadow-xl py-2 z-40 animate-fadeIn text-xs border border-[#FFB7D5]/40">
                  <div className="px-3.5 py-2 border-b border-[#E95D95]/12">
                    <p className="font-bold text-[#2B1E25] truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-[#8E7882] truncate font-medium">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-[#2B1E25] hover:bg-[#FDF2F7] hover:text-[#E95D95] font-medium cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#8E7882]" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl p-2.5 felt-card-marshmallow space-y-2 shadow-xs border border-[#FFB7D5]/40">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl felt-btn-marshmallow text-[#E95D95] flex items-center justify-center font-bold text-xs shrink-0">
                  <UserCheck className="w-3.5 h-3.5 text-[#E95D95]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#2B1E25] truncate">
                    Guest Account
                  </p>
                  <p className="text-[10px] text-[#8E7882] font-medium truncate">
                    Multi-Language Supporter
                  </p>
                </div>
              </div>

              {/* Login / Sign up Button */}
              <button
                id="sidebar-login-btn"
                type="button"
                onClick={() => onOpenAuth("login")}
                className="w-full py-2 px-3 rounded-xl felt-btn-pink text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-98"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log in / Sign up</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
