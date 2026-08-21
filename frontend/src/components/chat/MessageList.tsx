"use client";

import React, { useEffect, useRef } from "react";
import { Message, User, Conversation, GroupConversation } from "@/types";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { formatDateSeparator } from "@/lib/utils";
import { useSmartScroll } from "@/hooks/useSmartScroll";
import { ChevronDown, Loader2, MessageSquare, Sparkles } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  currentUser: User | null;
  conversation: Conversation;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadOlder: () => void;
  searchHighlight?: string;
}

export function MessageList({
  messages,
  currentUser,
  conversation,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadOlder,
  searchHighlight = "",
}: MessageListProps) {
  const isGroup = conversation.type === "group";
  const groupConv = isGroup ? (conversation as GroupConversation) : null;

  const {
    containerRef,
    isAtBottom,
    hasScrolledUp,
    unreadBelowCount,
    scrollToBottom,
    handleScroll,
    handleNewMessage,
  } = useSmartScroll({
    onLoadMore: onLoadOlder,
    hasMore,
    isLoadingMore,
  });

  const lastMessageCountRef = useRef(messages.length);

  // Monitor messages change for smart scroll
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current) {
      const newestMsg = messages[messages.length - 1];
      const isSelf = newestMsg.sender === currentUser?._id;
      handleNewMessage(isSelf);
    }
    lastMessageCountRef.current = messages.length;
  }, [messages, currentUser, handleNewMessage]);

  // Initial scroll to bottom on conversation switch
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      scrollToBottom("auto");
    }
  }, [conversation._id, isLoading, scrollToBottom]);

  // Map participant objects for group sender names
  const participantMap = React.useMemo(() => {
    const map = new Map<string, User>();
    if (groupConv?.participants) {
      groupConv.participants.forEach((p) => {
        map.set(p._id, p as User);
      });
    }
    return map;
  }, [groupConv]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
        <p className="text-xs font-medium">Loading message history...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary/20 via-indigo-500/10 to-purple-500/20 flex items-center justify-center text-primary mb-3 shadow-inner border border-primary/20 animate-pulse-glow">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">No messages yet</h3>
        <p className="text-xs text-muted-foreground max-w-xs mt-1">
          Say hello! Start the conversation by sending a message below.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden flex flex-col">
      {/* Scrollable Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-1"
      >
        {/* Loading More Indicator at Top */}
        {isLoadingMore && (
          <div className="flex items-center justify-center py-2 text-xs text-muted-foreground gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Loading older messages...</span>
          </div>
        )}

        {/* Has older messages hint */}
        {!isLoadingMore && hasMore && (
          <div className="text-center py-1">
            <button
              onClick={onLoadOlder}
              className="text-[11px] text-muted-foreground hover:text-primary transition-colors bg-secondary/50 px-3 py-1 rounded-full border border-border/40"
            >
              ↑ Scroll up to load earlier history
            </button>
          </div>
        )}

        {/* Render Messages with Date Separators */}
        {messages.map((message, index) => {
          const isSelf = message.sender === currentUser?._id;
          const senderUser = participantMap.get(message.sender) || null;

          // Date Separator logic
          const currentDateStr = formatDateSeparator(message.createdAt);
          const prevDateStr =
            index > 0 ? formatDateSeparator(messages[index - 1].createdAt) : null;
          const showDateSeparator = index === 0 || currentDateStr !== prevDateStr;

          return (
            <React.Fragment key={message._id || message.tempId || index}>
              {showDateSeparator && (
                <div className="flex items-center justify-center my-4 select-none">
                  <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-secondary/80 text-muted-foreground border border-border/50 shadow-sm backdrop-blur-sm">
                    {currentDateStr}
                  </span>
                </div>
              )}

              <MessageBubble
                message={message}
                isSelf={isSelf}
                senderUser={senderUser}
                showSenderName={isGroup && !isSelf}
                searchHighlight={searchHighlight}
              />
            </React.Fragment>
          );
        })}
      </div>

      {/* Floating Smart Scroll-to-Bottom Pill */}
      {hasScrolledUp && (
        <div className="absolute bottom-4 right-6 z-20 animate-fade-in">
          <button
            onClick={() => scrollToBottom("smooth")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xl hover:shadow-primary/30 border border-white/20 transition-all active:scale-95 group"
          >
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            <span>{unreadBelowCount > 0 ? `${unreadBelowCount} new messages` : "Scroll to bottom"}</span>
            {unreadBelowCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
