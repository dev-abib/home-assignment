"use client";

import React, { useState } from "react";
import { Conversation, User, DirectConversation, GroupConversation } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatConversationDate } from "@/lib/utils";
import { sounds } from "@/lib/sound";
import { useTheme } from "@/context/ThemeContext";
import {
  MessageSquarePlus,
  Users,
  Search,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  LogOut,
  MessageSquare,
  Radio,
} from "lucide-react";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  currentUser: User | null;
  socketStatus: "connected" | "connecting" | "disconnected";
  onSelectConversation: (id: string) => void;
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
  onLogout: () => void;
}

export function ConversationSidebar({
  conversations,
  activeConversationId,
  currentUser,
  socketStatus,
  onSelectConversation,
  onOpenNewChat,
  onOpenNewGroup,
  onLogout,
}: ConversationSidebarProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const [isMuted, setIsMuted] = useState(sounds.getIsMuted());
  const { theme, toggleTheme } = useTheme();

  const handleToggleSound = () => {
    const updated = sounds.toggleMute();
    setIsMuted(updated);
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (!filterQuery.trim()) return true;
    const query = filterQuery.toLowerCase();

    if (c.type === "group") {
      const grp = c as GroupConversation;
      return (
        grp.name?.toLowerCase().includes(query) ||
        grp.participants?.some((p) => p.name?.toLowerCase().includes(query))
      );
    } else {
      const direct = c as DirectConversation;
      let otherUser = direct.participant;
      if (!otherUser && Array.isArray(direct.participants)) {
        const found = direct.participants.find(
          (p) => typeof p === "object" && p !== null && (p as User)._id !== currentUser?._id
        );
        if (found && typeof found === "object") otherUser = found as User;
      }
      return (
        otherUser?.name?.toLowerCase().includes(query) ||
        otherUser?.phone?.toLowerCase().includes(query) ||
        direct.participant?.name?.toLowerCase().includes(query) ||
        direct.participant?.phone?.toLowerCase().includes(query)
      );
    }
  });

  return (
    <aside className="w-80 md:w-88 shrink-0 h-full flex flex-col bg-card border-r border-border/80 glass select-none">
      {/* 1. Brand & Profile Header */}
      <div className="p-4 border-b border-border/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white shadow-md shadow-primary/25">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground">PulseChat</h1>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    socketStatus === "connected"
                      ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                      : socketStatus === "connecting"
                      ? "bg-amber-500 animate-pulse"
                      : "bg-rose-500"
                  }`}
                />
                <span className="text-[10px] text-muted-foreground capitalize">
                  {socketStatus === "connected" ? "Live Real-Time" : socketStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleSound}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title={isMuted ? "Unmute Sounds" : "Mute Sounds"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-amber-500" />}
            </button>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current User Card */}
        {currentUser && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-secondary/50 border border-border/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={currentUser.name} size="sm" online={socketStatus === "connected"} />
              <div className="truncate">
                <p className="text-xs font-semibold text-foreground truncate">{currentUser.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{currentUser.phone}</p>
              </div>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/20 shrink-0">
              You
            </span>
          </div>
        )}
      </div>

      {/* 2. Action Buttons & Search */}
      <div className="p-3 space-y-2.5 border-b border-border/40">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenNewChat}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>

          <button
            onClick={onOpenNewGroup}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-semibold transition-all active:scale-[0.98]"
          >
            <Users className="w-3.5 h-3.5 text-primary" />
            <span>New Group</span>
          </button>
        </div>

        {/* Search Filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter conversations..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-secondary/60 border border-border/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* 3. Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-center p-4">
            <Radio className="w-8 h-8 opacity-30 mb-2 text-primary" />
            <p className="text-xs font-semibold text-foreground">No conversations</p>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-[180px]">
              Start a new 1-to-1 conversation or create a group to start messaging.
            </p>
            <button
              onClick={onOpenNewChat}
              className="mt-3 text-xs text-primary font-medium hover:underline"
            >
              Search users →
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isGroup = conv.type === "group";
            const groupConv = isGroup ? (conv as GroupConversation) : null;
            const directConv = !isGroup ? (conv as DirectConversation) : null;

            let otherUser = directConv?.participant;
            if (!otherUser && Array.isArray(directConv?.participants)) {
              const found = directConv.participants.find(
                (p) => typeof p === "object" && p !== null && (p as User)._id !== currentUser?._id
              );
              if (found && typeof found === "object") otherUser = found as User;
            }

            const name = isGroup
              ? groupConv?.name || "Unnamed Group"
              : otherUser?.name || directConv?.participant?.name || "Direct Chat";

            const phone = !isGroup ? otherUser?.phone || directConv?.participant?.phone : null;
            const isSelected = activeConversationId === conv._id;
            const unread = conv.unreadCount || 0;

            const lastMessageTime = formatConversationDate(
              conv.lastMessage?.createdAt || conv.updatedAt || conv.createdAt
            );

            return (
              <div
                key={conv._id}
                onClick={() => onSelectConversation(conv._id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? "bg-gradient-to-r from-primary/15 via-primary/10 to-transparent border border-primary/30 shadow-sm"
                    : "hover:bg-secondary/70 border border-transparent"
                }`}
              >
                {/* Avatar */}
                <Avatar name={name} size="md" isGroup={isGroup} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className={`text-xs font-semibold truncate ${
                          isSelected ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {name}
                      </span>
                      {isGroup && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                          Group
                        </Badge>
                      )}
                    </div>
                    {lastMessageTime && (
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-1">
                        {lastMessageTime}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground truncate max-w-[170px]">
                      {conv.lastMessage?.text ? (
                        conv.lastMessage.text
                      ) : phone ? (
                        phone
                      ) : (
                        <span className="italic">No messages yet</span>
                      )}
                    </p>

                    {unread > 0 && (
                      <span className="shrink-0 ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
