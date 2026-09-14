import React, { useState } from "react";
import {
  SquarePen,
  MessageSquare,
  Settings,
  MoreVertical,
  Trash2,
  Edit2,
  PanelLeftClose,
  Search,
  X,
  Compass,
  FolderGit2,
  BookOpen,
  Home,
  User as UserIcon,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Conversation, User } from "../../types.ts";
import { ArfaLogo } from "../ui/ArfaLogo.tsx";
import { TactileIconPad } from "../ui/TactileIconPad.tsx";
import { TactileButton } from "../ui/TactileControls.tsx";

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
  onOpenKnowledge,
  onOpenTemplates,
  onOpenAuth,
  onLogout,
  currentUser,
  isOpen,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [activeNavTab, setActiveNavTab] = useState<string>("chats");

  const filteredConversations = searchQuery.trim()
    ? conversations.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : conversations;

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

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "chats", label: "Chats", icon: MessageSquare },
    { id: "discover", label: "Explore", icon: Compass },
    { id: "projects", label: "Projects", icon: FolderGit2 },
    { id: "library", label: "Library", icon: BookOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    setActiveNavTab(id);
    if (id === "settings") {
      onOpenSettings();
    } else if (id === "discover" && onOpenTemplates) {
      onOpenTemplates();
    } else if (id === "library" && onOpenKnowledge) {
      onOpenKnowledge();
    } else if (id === "home") {
      onNewChat();
      if (window.innerWidth < 1024) onCloseMobile();
    }
  };

  const renderGroup = (label: string, items: Conversation[]) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-3.5">
        <div className="text-[10.5px] uppercase tracking-wider text-[#8A768C] font-bold px-3 py-1 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-[#553658] font-extrabold">{items.length}</span>
        </div>
        <div className="space-y-1">
          {items.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isMenuOpen = menuOpenId === conv.id;

            return (
              <div
                key={conv.id}
                className={`group relative rounded-2xl transition-all duration-150 ${
                  isActive
                    ? "bg-gradient-to-r from-white via-[#FBF5FA] to-[#F5EBF5] border-t border-white border-b border-[#D8C6D8] shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.95),0_4px_12px_-2px_rgba(70,30,65,0.08)]"
                    : "hover:bg-white/60 active:scale-[0.99]"
                }`}
              >
                <div
                  onClick={() => {
                    onSelectConversation(conv.id);
                    if (window.innerWidth < 1024) onCloseMobile();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer select-none"
                >
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 transition-colors stroke-[2.2] ${
                      isActive ? "text-[#221323]" : "text-[#856F88] group-hover:text-[#221323]"
                    }`}
                  />
                  <span
                    className={`flex-1 text-xs truncate transition-colors leading-tight ${
                      isActive ? "font-bold text-[#221323]" : "font-semibold text-[#5B475D] group-hover:text-[#221323]"
                    }`}
                  >
                    {conv.title || "Untitled conversation"}
                  </span>

                  {/* More Actions Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(isMenuOpen ? null : conv.id);
                    }}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-opacity cursor-pointer ${
                      isMenuOpen
                        ? "opacity-100 bg-white/90 text-[#221323] shadow-xs"
                        : "opacity-0 group-hover:opacity-100 text-[#8C768E] hover:text-[#221323]"
                    }`}
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-2 top-9 z-50 w-36 rounded-2xl bg-white/95 backdrop-blur-md p-1.5 shadow-lg flex flex-col gap-1 border border-white/90"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onRenameConversation(conv);
                        setMenuOpenId(null);
                      }}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-semibold text-[#3C273E] hover:bg-black/5 rounded-xl transition-colors text-left"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Rename</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteConversation(conv);
                        setMenuOpenId(null);
                      }}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-semibold text-[#B33951] hover:bg-[#FDF0F3] rounded-xl transition-colors text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
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
          className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Drawer */}
      <aside
        id="arfa-tactile-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-50 w-[290px] h-full flex flex-col glass-surface border-r border-[#E0D0E0] shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header: ARFA AI Brand Identity + Mobile Close Button */}
        <div className="p-3.5 pb-2.5 flex items-center justify-between border-b border-[#ECE0EC]">
          <div className="flex items-center gap-2.5 select-none">
            <ArfaLogo size="sm" showText={true} />
          </div>

          <TactileIconPad
            icon={PanelLeftClose}
            variant="ivory"
            size="sm"
            onClick={onCloseMobile}
            className="lg:hidden"
            title="Close sidebar"
            ariaLabel="Close sidebar"
          />
        </div>

        {/* Primary Navigation Buttons */}
        <div className="px-3 pt-3 pb-2 select-none">
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {navItems.map((item) => {
              const isSelected = activeNavTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl cursor-pointer transition-all duration-150 active:scale-[0.96] ${
                    isSelected
                      ? "bg-gradient-to-b from-[#2A162B] to-[#180C19] text-white border-t border-white/30 border-b border-black/50 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.25),0_4px_10px_-2px_rgba(40,15,38,0.35)]"
                      : "bg-gradient-to-b from-white via-[#FAF4F9] to-[#F1E5F1] text-[#4A324C] border-t border-white/90 border-b border-[#D8C7D8] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_2px_4px_rgba(60,20,50,0.04)] hover:to-[#EBDCEB]"
                  }`}
                >
                  <Icon className={`w-4 h-4 stroke-[2.3] mb-1 ${isSelected ? "text-white" : "text-[#6B536D]"}`} />
                  <span className="text-[11px] font-bold leading-none">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* New Chat Primary Button */}
          <TactileButton
            variant="navy"
            size="md"
            icon={SquarePen}
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onCloseMobile();
            }}
            className="w-full justify-center shadow-md py-2.5"
          >
            New Conversation
          </TactileButton>

          {/* Search Field */}
          <div className="mt-2.5 plush-inset-groove rounded-2xl px-2.5 py-1.5 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#8C768E] shrink-0 stroke-[2.3]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-transparent border-none outline-none text-xs text-[#221323] placeholder-[#8C768E] font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[#8C768E] hover:text-[#221323] p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List Scroll Area */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="py-8 text-center px-4 select-none">
              <Sparkles className="w-5 h-5 text-[#BBA6BD] mx-auto mb-2" />
              <p className="text-xs font-bold text-[#553658]">No conversations found</p>
              <p className="text-[11px] text-[#8C768E] mt-0.5">
                {searchQuery ? "Try another search term" : "Start a new conversation"}
              </p>
            </div>
          ) : (
            <>
              {renderGroup("Today", todayConvs)}
              {renderGroup("Yesterday", yesterdayConvs)}
              {renderGroup("Earlier", earlierConvs)}
            </>
          )}
        </div>

        {/* Footer: User Profile / Auth Control */}
        <div className="p-3 border-t border-[#ECE0EC] select-none">
          {currentUser ? (
            <div className="flex items-center justify-between p-2 rounded-2xl bg-white/80 border-t border-white border-b border-[#D8C7D8] shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#2A162B] to-[#180C19] text-white flex items-center justify-center text-xs font-bold shrink-0 border border-white/30 shadow-xs">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#221323] truncate">
                    {currentUser.name || "ARFA Member"}
                  </span>
                  <span className="text-[10px] text-[#7A647D] truncate">
                    {currentUser.email}
                  </span>
                </div>
              </div>
              <TactileIconPad
                icon={LogOut}
                variant="ivory"
                size="xs"
                onClick={onLogout}
                title="Sign out"
                ariaLabel="Sign out"
              />
            </div>
          ) : (
            <TactileButton
              variant="ivory"
              size="sm"
              icon={UserIcon}
              onClick={() => onOpenAuth("login")}
              className="w-full justify-center"
            >
              Sign In to ARFA AI
            </TactileButton>
          )}
        </div>
      </aside>
    </>
  );
};
