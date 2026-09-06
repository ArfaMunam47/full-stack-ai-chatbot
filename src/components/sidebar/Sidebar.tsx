import React, { useState } from "react";
import {
  SquarePen,
  MessageSquare,
  BookOpen,
  LayoutTemplate,
  Settings,
  MoreVertical,
  Trash2,
  Edit2,
  PanelLeftClose,
  ChevronDown,
  LogOut,
  UserCheck,
  Sparkles,
  LogIn,
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
  onOpenKnowledge: () => void;
  onOpenTemplates: () => void;
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
  onOpenKnowledge,
  onOpenTemplates,
  onOpenAuth,
  onLogout,
  currentUser,
  isOpen,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Group conversations into Today, Yesterday, Earlier
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
        <div className="text-[11px] uppercase tracking-wider text-[#A39B9E] font-bold px-3 pt-2 pb-1.5 select-none">
          {label}
        </div>
        <div className="space-y-0.5">
          {items.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isMenuOpen = menuOpenId === conv.id;

            return (
              <div
                key={conv.id}
                id={`conversation-item-${conv.id}`}
                className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-[#FDF2F5] text-[#D84A70] font-semibold border border-[#F7CDD8] shadow-xs"
                    : "text-[#5A5456] hover:bg-[#F1ECE9] hover:text-[#1A1718]"
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
                      isActive ? "text-[#D84A70]" : "text-[#A39B9E]"
                    }`}
                  />
                  <span className="truncate">{conv.title}</span>
                </button>

                {/* More options button */}
                <div className="relative shrink-0 ml-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(isMenuOpen ? null : conv.id);
                    }}
                    className={`p-1 rounded-md text-[#A39B9E] hover:text-[#1A1718] hover:bg-[#EFE9E6] transition-opacity cursor-pointer ${
                      isMenuOpen ? "opacity-100 bg-[#EFE9E6]" : "opacity-0 group-hover:opacity-100"
                    }`}
                    title="Conversation options"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {isMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-1 w-32 rounded-xl bg-white border border-[#EFE9E6] shadow-xl py-1 z-30 animate-fadeIn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpenId(null);
                          onRenameConversation(conv);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#1A1718] hover:bg-[#F6F3F1] cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 text-[#7E7779]" />
                        <span>Rename</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpenId(null);
                          onDeleteConversation(conv);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 cursor-pointer"
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
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#F8F6F4] border-r border-[#EFE9E6] flex flex-col transition-all duration-200 ease-in-out select-none ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${isCollapsed ? "md:-translate-x-full md:w-0 md:border-none overflow-hidden" : ""}`}
      >
        {/* Top Header: Logo + Collapse Button */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#EFE9E6]">
          <ArfaLogo size="sm" showText={true} />
          <button
            type="button"
            onClick={() => {
              if (onToggleCollapse) onToggleCollapse();
              onCloseMobile();
            }}
            className="p-1.5 rounded-lg text-[#7E7779] hover:text-[#1A1718] hover:bg-[#EFE9E6] transition-colors cursor-pointer"
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
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white border border-[#EFE9E6] hover:border-[#D84A70] hover:bg-[#FDF2F5] hover:text-[#D84A70] shadow-xs text-[#1A1718] text-xs font-semibold cursor-pointer transition-all group active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <SquarePen className="w-4 h-4 text-[#D84A70] group-hover:scale-105 transition-transform" />
              <span className="font-semibold text-xs tracking-tight">New Chat</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#F6F3F1] text-[10px] font-mono text-[#5A5456] font-semibold border border-[#EFE9E6]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Main Navigation Items */}
        <div className="px-3 pb-2 space-y-0.5">
          <button
            type="button"
            onClick={() => {
              onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#5A5456] hover:bg-[#EFE9E6] hover:text-[#1A1718] transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-[#7E7779]" />
            <span>Chats</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenKnowledge();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#5A5456] hover:bg-[#EFE9E6] hover:text-[#1A1718] transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#7E7779]" />
            <span>Knowledge</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenTemplates();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#5A5456] hover:bg-[#EFE9E6] hover:text-[#1A1718] transition-colors cursor-pointer"
          >
            <LayoutTemplate className="w-4 h-4 text-[#7E7779]" />
            <span>Templates</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenSettings();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#5A5456] hover:bg-[#EFE9E6] hover:text-[#1A1718] transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-[#7E7779]" />
            <span>Settings</span>
          </button>
        </div>

        {/* Separator */}
        <div className="mx-3 my-1 border-t border-[#EFE9E6]" />

        {/* Conversation History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#A39B9E]">
              No previous chats
            </div>
          ) : (
            <>
              {renderGroup("Today", todayConvs)}
              {renderGroup("Yesterday", yesterdayConvs)}
              {renderGroup("Earlier", earlierConvs)}
            </>
          )}
        </div>

        {/* Bottom Profile Section */}
        <div className="p-3 border-t border-[#EFE9E6] bg-[#F8F6F4] relative">
          {currentUser && !currentUser.isGuest ? (
            <>
              <button
                id="sidebar-profile-card"
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#EFE9E6] text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#1A1718] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate text-[#1A1718]">
                      {currentUser.name || "User"}
                    </p>
                    <p className="text-[10px] text-[#D84A70] font-semibold">
                      Pro Plan
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#7E7779] transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Profile Popover Menu */}
              {isProfileMenuOpen && (
                <div className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl bg-white border border-[#EFE9E6] shadow-xl py-1.5 z-40 animate-fadeIn text-xs">
                  <div className="px-3 py-2 border-b border-[#EFE9E6]">
                    <p className="font-semibold text-[#1A1718] truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-[#7E7779] truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[#1A1718] hover:bg-[#F6F3F1] cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#7E7779]" />
                    <span>Settings & Preferences</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl p-2.5 bg-white border border-[#EFE9E6] space-y-2 shadow-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#FDF2F5] text-[#D84A70] flex items-center justify-center font-bold text-xs shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#1A1718] truncate">
                    Guest Account
                  </p>
                  <p className="text-[10px] text-[#7E7779] truncate">
                    Free Plan • Save chats
                  </p>
                </div>
              </div>

              {/* Login / Sign up Button */}
              <button
                id="sidebar-login-btn"
                type="button"
                onClick={() => onOpenAuth("login")}
                className="w-full py-2 px-3 rounded-lg bg-[#1A1718] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log in or Sign up</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
