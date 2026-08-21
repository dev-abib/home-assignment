"use client";

import React from "react";
import { Conversation, GroupConversation, DirectConversation } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  Info,
  Search,
  Phone,
  Video,
  ChevronLeft,
  X,
} from "lucide-react";
import { toast } from "sonner";

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
    ? `${groupConv?.participants?.length || 0} participants`
    : otherUser?.phone || directConv?.participant?.phone || "1-to-1 conversation";

  const handleCallDemo = () => {
    toast.info("Audio call feature simulated — active direct session");
  };

  const handleVideoDemo = () => {
    toast.info("Video call feature simulated — HD connection ready");
  };

  return (
    <header className="h-16 px-4 shrink-0 flex items-center justify-between border-b border-border/80 bg-card/90 glass select-none z-10">
      {/* Left: Avatar & Meta */}
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-1.5 -ml-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <Avatar name={name} size="md" isGroup={isGroup} online={!isGroup} />

        <div className="min-w-0 truncate">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground truncate">{name}</h2>
            {isGroup ? (
              <Badge variant="admin" className="text-[9px] px-1.5 py-0">
                Group
              </Badge>
            ) : (
              <span className="text-[10px] text-emerald-500 font-medium">● Online</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
      </div>

      {/* Right: Search & Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isSearching ? (
          <div className="flex items-center gap-1 bg-secondary/80 rounded-xl px-2.5 py-1 border border-border animate-fade-in">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search in chat..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
              className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-32 md:w-48"
            />
            <button
              onClick={onToggleSearch}
              className="p-0.5 text-muted-foreground hover:text-foreground rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onToggleSearch}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Search Messages"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={handleCallDemo}
          className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-secondary transition-colors hidden sm:flex"
          title="Voice Call"
        >
          <Phone className="w-4 h-4" />
        </button>

        <button
          onClick={handleVideoDemo}
          className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-secondary transition-colors hidden sm:flex"
          title="Video Call"
        >
          <Video className="w-4 h-4" />
        </button>

        {isGroup && (
          <button
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
