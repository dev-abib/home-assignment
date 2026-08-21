"use client";

import React, { useState } from "react";
import { Message, User } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { formatMessageTime } from "@/lib/utils";
import { Check, CheckCheck, Loader2, Play, Pause, AlertCircle, Smile } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isSelf: boolean;
  senderUser?: User | null;
  showSenderName?: boolean;
  searchHighlight?: string;
}

export function MessageBubble({
  message,
  isSelf,
  senderUser,
  showSenderName = false,
  searchHighlight = "",
}: MessageBubbleProps) {
  const [reactions, setReactions] = useState<{ [emoji: string]: number }>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const isVoiceNote = message.text.startsWith("[Voice Note]");
  const voiceNoteDuration = isVoiceNote ? message.text.replace("[Voice Note]", "").trim() || "0:14" : null;

  const handleAddReaction = (emoji: string) => {
    setReactions((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }));
    setShowReactionPicker(false);
  };

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
      className={`group relative flex gap-2.5 my-1.5 transition-all ${
        isSelf ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Sender Avatar (only for others in groups) */}
      {!isSelf && (
        <div className="shrink-0 self-end">
          <Avatar
            name={senderUser?.name || message.senderName || "Member"}
            size="sm"
          />
        </div>
      )}

      {/* Main Bubble Content */}
      <div className={`relative max-w-[78%] md:max-w-[65%] flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
        {/* Sender Name in group */}
        {!isSelf && showSenderName && (
          <span className="text-[11px] font-semibold text-primary mb-1 ml-1">
            {senderUser?.name || message.senderName || "Member"}
          </span>
        )}

        {/* Bubble container */}
        <div
          className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${
            isSelf
              ? "bubble-self shadow-primary/10"
              : "bubble-other border border-border/40 shadow-black/5"
          }`}
        >
          {/* Voice note simulation */}
          {isVoiceNote ? (
            <div className="flex items-center gap-3 min-w-[200px] py-1">
              <button
                type="button"
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-95 ${
                  isSelf ? "bg-white text-primary" : "bg-primary text-white"
                }`}
              >
                {isPlayingAudio ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              {/* Simulated Waveform */}
              <div className="flex-1 flex items-center gap-0.5 h-6">
                {[12, 24, 18, 28, 14, 22, 30, 16, 20, 26, 12, 18, 24, 14].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}px` }}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      isPlayingAudio && i % 3 === 0 ? "animate-pulse scale-y-125" : ""
                    } ${isSelf ? "bg-white/80" : "bg-primary/70"}`}
                  />
                ))}
              </div>

              <span className={`text-xs font-mono font-medium ${isSelf ? "text-white/90" : "text-muted-foreground"}`}>
                {voiceNoteDuration}
              </span>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{renderHighlightedText(message.text)}</p>
          )}

          {/* Timestamp & Delivery Status */}
          <div
            className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
              isSelf ? "text-white/75" : "text-muted-foreground"
            }`}
          >
            <span>{formatMessageTime(message.createdAt)}</span>

            {isSelf && (
              <span className="shrink-0 ml-0.5">
                {message.status === "sending" ? (
                  <Loader2 className="w-3 h-3 animate-spin text-white/70" />
                ) : message.status === "error" ? (
                  <AlertCircle className="w-3 h-3 text-rose-300" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5 text-white/90" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Reaction Badges */}
        {Object.keys(reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 -mb-1 animate-fade-in">
            {Object.entries(reactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleAddReaction(emoji)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-secondary/90 border border-border/80 text-xs shadow-sm hover:scale-105 transition-transform"
              >
                <span>{emoji}</span>
                {count > 1 && <span className="text-[10px] font-semibold text-muted-foreground">{count}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Floating Quick Reaction Trigger (hover) */}
        <div
          className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 p-1 rounded-full bg-card/90 border border-border shadow-lg z-20 ${
            isSelf ? "-left-20" : "-right-20"
          }`}
        >
          {["❤️", "👍", "🔥", "😂"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleAddReaction(emoji)}
              className="hover:scale-125 transition-transform text-xs p-1"
            >
              {emoji}
            </button>
          ))}
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="text-muted-foreground hover:text-foreground p-1 text-xs"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Full Emoji Picker Popup */}
        {showReactionPicker && (
          <div className="absolute top-8 z-30 p-2 rounded-xl bg-card border border-border shadow-2xl flex gap-1 animate-fade-in glass">
            {["🎉", "🚀", "🙌", "👀", "💯", "✨", "👏", "⚡"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleAddReaction(emoji)}
                className="hover:scale-125 transition-transform text-base p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
