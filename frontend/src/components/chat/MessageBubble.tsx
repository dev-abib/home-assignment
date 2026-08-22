"use client";

import React from "react";
import { Message, User } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { formatMessageTime } from "@/lib/utils";
import { Check, CheckCheck, Loader2, AlertCircle } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isSelf: boolean;
  senderUser?: User | null;
  showSenderName?: boolean;
  searchHighlight?: string;
  onRetry?: (msg: Message) => void;
}

export function MessageBubble({
  message,
  isSelf,
  senderUser,
  showSenderName = false,
  searchHighlight = "",
  onRetry,
}: MessageBubbleProps) {
  // Helper to render text with search highlight
  const renderHighlightedText = (text: string) => {
    if (!searchHighlight.trim()) return text;
    const parts = text.split(new RegExp(`(${searchHighlight})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === searchHighlight.toLowerCase() ? (
        <span key={i} className="bg-amber-400 text-black font-semibold rounded px-0.5">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div
      className={`group relative flex gap-2 sm:gap-2.5 my-1.5 transition-all ${
        isSelf ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Sender Avatar (only for others in groups) */}
      {!isSelf && (
        <div className="shrink-0 self-end mb-0.5">
          <Avatar
            name={senderUser?.name || message.senderName || "Member"}
            size="sm"
          />
        </div>
      )}

      {/* Main Bubble Content */}
      <div className={`relative max-w-[85%] sm:max-w-[70%] md:max-w-[65%] flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
        {/* Sender Name in group */}
        {!isSelf && showSenderName && (
          <span className="text-[11px] font-semibold text-primary mb-1 ml-1 truncate max-w-full">
            {senderUser?.name || message.senderName || "Member"}
          </span>
        )}

        {/* Bubble container */}
        <div
          className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all break-words ${
            isSelf
              ? message.status === "error"
                ? "bg-rose-950/40 text-rose-100 border border-rose-500/50 shadow-rose-900/10"
                : "bubble-self shadow-primary/10"
              : "bubble-other border border-border/40 shadow-black/5"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{renderHighlightedText(message.text)}</p>

          {/* Timestamp & Delivery Status */}
          <div
            className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
              isSelf
                ? message.status === "error"
                  ? "text-rose-300"
                  : "text-white/80"
                : "text-muted-foreground"
            }`}
          >
            <span>{formatMessageTime(message.createdAt)}</span>

            {isSelf && (
              <span className="shrink-0 ml-0.5">
                {message.status === "sending" && message._id.startsWith("temp_") ? (
                  <Loader2 className="w-3 h-3 animate-spin text-white/80" />
                ) : message.status === "error" ? (
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5 text-white/90" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Failed Message Retry Action */}
        {isSelf && message.status === "error" && (
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-rose-400 select-none">
            <span>Failed to send.</span>
            {onRetry && (
              <button
                type="button"
                onClick={() => onRetry(message)}
                className="font-semibold underline hover:text-rose-300 transition-colors ml-0.5 cursor-pointer"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
