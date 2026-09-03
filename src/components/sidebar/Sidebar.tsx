import React, { useState } from "react";
import {
  Plus,
  Search,
  MessageSquare,
  Settings,
  MoreVertical,
  Trash2,
  Edit2,
  X,
  User as UserIcon,
  Sparkles,
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
  onOpenAuth: () => void;
  currentUser: User | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
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
  currentUser,
  searchQuery,
  onSearchChange,
  isOpen,
  onCloseMobile,
}) => {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Group conversations: Today, Previous 7 Days, Older
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfSevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;

  const todayConvs: Conversation[] = [];
  const sevenDaysConvs: Conversation[] = [];
  const olderConvs: Conversation[] = [];

  conversations.forEach((conv) => {
    const convTime = new Date(conv.updatedAt).getTime();
    if (convTime >= startOfToday) {
      todayConvs.push(conv);
    } else if (convTime >= startOfSevenDaysAgo) {
      sevenDaysConvs.push(conv);
    } else {
      olderConvs.push(conv);
    }
  });

  const renderGroup = (label: string, items: Conversation[]) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="text-[11px] uppercase tracking-widest text-[#C26767] dark:text-[#C87575] font-semibold px-3 pt-3 pb-1.5 select-none">
          {label}
        </div>
        <div className="space-y-1">
          {items.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isMenuOpen = menuOpenId === conv.id;

            return (
              <div
                key={conv.id}
                id={`conversation-item-${conv.id}`}
                className={`group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#F6EEEE] dark:bg-[#23191C] text-[#282122] dark:text-[#FAF4F4] font-medium border border-[#E8D7D7] dark:border-[#38272B]"
                    : "text-[#786E70] dark:text-[#A3989A] hover:bg-[#F6EEEE] dark:hover:bg-[#20181A] hover:text-[#282122] dark:hover:text-[#FAF4F4] border border-transparent"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onCloseMobile();
                  }}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left truncate"
                >
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-[#C26767] dark:text-[#C87575]" : "text-[#786E70] dark:text-[#A3989A]"
                    }`}
                  />
                  <span className="truncate">{conv.title}</span>
                </button>

                {/* Dropdown Menu Toggle */}
                <div className="relative shrink-0 ml-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(isMenuOpen ? null : conv.id);
                    }}
                    className={`p-1 rounded-md text-[#786E70] hover:text-[#282122] dark:hover:text-[#FAF4F4] transition-opacity ${
                      isActive || isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Context menu */}
                  {isMenuOpen && (
                    <div
                      className="absolute right-0 top-6 z-30 w-32 rounded-xl bg-white dark:bg-[#1C1618] border border-[#E8D7D7] dark:border-[#332528] py-1 shadow-lg text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpenId(null);
                          onRenameConversation(conv);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#FDF2F2] dark:hover:bg-[#23191C] text-[#282122] dark:text-[#FAF4F4] transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Rename</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpenId(null);
                          onDeleteConversation(conv);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#FDF2F2] dark:hover:bg-[#23191C] text-[#C26767] dark:text-[#E59C9C] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="arfa-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col w-72 sm:w-[280px] shrink-0 border-r border-[#E8D7D7] dark:border-[#2D2225] bg-white dark:bg-[#181315] transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-[#E8D7D7] dark:border-[#2D2225]">
          <ArfaLogo size="md" />
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-[#786E70] hover:text-[#282122] dark:hover:text-[#FAF4F4]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button: New Chat */}
        <div className="px-4 py-3">
          <button
            id="sidebar-new-chat-btn"
            type="button"
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full py-2.5 px-4 bg-white dark:bg-[#181315] border border-[#C26767] dark:border-[#C87575] text-[#C26767] dark:text-[#C87575] rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-[#FDF2F2] dark:hover:bg-[#23191C] transition-colors shadow-2xs group text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span>New Chat</span>
            <span className="text-[10px] font-mono opacity-70 ml-auto px-1.5 py-0.5 rounded border border-[#E8D7D7] dark:border-[#38272B]">
              ⌘K
            </span>
          </button>
        </div>

        {/* Search Conversations Input */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#786E70] dark:text-[#A3989A] absolute left-3 top-2.5" />
            <input
              type="text"
              id="sidebar-search-conversations"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search chats & messages..."
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs border border-[#E8D7D7] dark:border-[#2D2225] bg-[#FAF7F7] dark:bg-[#131011] text-[#282122] dark:text-[#FAF4F4] placeholder-[#786E70] focus:outline-none focus:border-[#C26767] dark:focus:border-[#C87575] transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#786E70] dark:text-[#A3989A]">
              {searchQuery ? "No matching conversations." : "No conversations yet"}
            </div>
          ) : (
            <>
              {renderGroup("Recent Chats", todayConvs.concat(sevenDaysConvs).length > 0 ? todayConvs : [])}
              {renderGroup("Previous 7 Days", sevenDaysConvs)}
              {renderGroup("Older", olderConvs)}
            </>
          )}
        </div>

        {/* Bottom Profile / Settings */}
        <div className="p-3.5 border-t border-[#E8D7D7] dark:border-[#2D2225] bg-[#FAF7F7] dark:bg-[#161113]">
          <div className="flex items-center justify-between gap-2">
            <button
              id="sidebar-profile-btn"
              type="button"
              onClick={currentUser?.isGuest ? onOpenAuth : onOpenSettings}
              className="flex items-center gap-3 flex-1 min-w-0 p-2 rounded-xl hover:bg-white dark:hover:bg-[#20181A] text-left transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[#F6EEEE] dark:bg-[#2D1F23] text-[#C26767] dark:text-[#C87575] flex items-center justify-center shrink-0 text-xs font-bold border border-[#E8D7D7] dark:border-[#3D2B30]">
                {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate text-[#282122] dark:text-[#FAF4F4]">
                  {currentUser?.isGuest ? "Guest" : currentUser?.name}
                </p>
                <p className="text-xs text-[#786E70] dark:text-[#A3989A] truncate">
                  {currentUser?.isGuest ? "Tap to Sign In" : (currentUser?.email || "Account")}
                </p>
              </div>
            </button>

            <button
              id="sidebar-settings-btn"
              type="button"
              onClick={onOpenSettings}
              title="Settings & Knowledge"
              className="p-2 rounded-xl text-[#786E70] hover:text-[#C26767] dark:hover:text-[#C87575] hover:bg-white dark:hover:bg-[#20181A] transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
