"use client";

import React from "react";
import { Conversation, GroupConversation, DirectConversation } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Info, Search, ChevronLeft, X } from "lucide-react";

interface ChatHeaderProps {
  conversation: Conversation;
  onOpenInfo: () => void;
  onBack?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSearching: boolean;
  onToggleSearch: () => void;
}

export function ChatHeader({
  conversation,
  onOpenInfo,
  onBack,
  searchQuery,
  onSearchChange,
  isSearching,
  onToggleSearch,
}: ChatHeaderProps) {
  const isGroup = conversation.type === "group";
  const groupConv = isGroup ? (conversation as GroupConversation) : null;
  const directConv = !isGroup ? (conversation as DirectConversation) : null;

  let otherUser = directConv?.participant;
  if (!otherUser && Array.isArray(directConv?.participants)) {
    const found = directConv.participants.find(
      (p) => typeof p === "object" && p !== null
    );
    if (found && typeof found === "object") otherUser = found as any;
  }

  const name = isGroup
    ? groupConv?.name || "Group Chat"
    : otherUser?.name || directConv?.participant?.name || "Direct Chat";

  const subtitle = isGroup
    ? `${groupConv?.participants?.length || 0} members`
    : otherUser?.phone || directConv?.participant?.phone || "Direct Message";

  return (
    <header className="h-16 px-3.5 sm:px-4 shrink-0 flex items-center justify-between border-b border-border/80 bg-card/90 glass select-none z-10 gap-2">
      {/* Left: Avatar & Meta (Hidden on small mobile if search is active) */}
      <div className={`flex items-center gap-2.5 sm:gap-3 min-w-0 ${isSearching ? "hidden sm:flex" : "flex"}`}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            className="md:hidden p-1.5 -ml-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <Avatar name={name} size="md" isGroup={isGroup} online={!isGroup} />

        <div className="min-w-0 truncate">
          <div className="flex items-center gap-1.5 truncate">
            <h2 className="text-sm font-bold text-foreground truncate">{name}</h2>
            {isGroup && (
              <Badge variant="admin" className="text-[9px] px-1.5 py-0 shrink-0">
                Group
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
      </div>

      {/* Right: Search & Group Info */}
      <div className={`flex items-center gap-1.5 ${isSearching ? "flex-1 sm:flex-initial justify-end" : "shrink-0"}`}>
        {isSearching ? (
          <div className="flex items-center gap-1.5 bg-secondary/80 rounded-xl px-2.5 py-1.5 border border-border w-full sm:w-64 animate-fade-in">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search in chat..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
              className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none flex-1 min-w-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={onToggleSearch}
              className="text-[11px] font-medium text-primary hover:underline pl-1 shrink-0"
            >
              Done
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggleSearch}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Search Messages"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {isGroup && (
          <button
            type="button"
            onClick={onOpenInfo}
            className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
            title="Group Info & Settings"
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
