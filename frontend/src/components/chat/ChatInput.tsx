"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Smile, X } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (text: string) => Promise<boolean>;
  disabled?: boolean;
}

const COMMON_EMOJIS = [
  "😀", "😂", "🥰", "😎", "🔥", "👍", "🎉", "❤️",
  "🚀", "👏", "🙌", "✨", "💯", "🤔", "👀", "⚡",
  "🤝", "🙏", "💡", "💪", "🤩", "🥳", "✅", "☕"
];

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  // Click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending || disabled) return;

    try {
      setIsSending(true);
      const success = await onSendMessage(trimmed);
      if (success) {
        setText("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
        setShowEmojiPicker(false);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-card border-t border-border/80 glass relative select-none">
      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-20 left-4 z-30 p-3 rounded-2xl bg-card border border-border shadow-2xl glass animate-fade-in max-w-[280px]"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Emoji Reactions
            </span>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(false)}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleInsertEmoji(emoji)}
                className="text-lg p-1.5 rounded-xl hover:bg-secondary transition-all hover:scale-125 text-center flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input Container */}
      <div className="flex items-end gap-2">
        {/* Emoji Button */}
        <div className="pb-1 shrink-0">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-xl transition-colors ${
              showEmojiPicker
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-primary hover:bg-secondary"
            }`}
            title="Add Emoji"
            aria-label="Add Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Textarea */}
        <div className="flex-1 relative min-w-0">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
            rows={1}
            className="w-full resize-none max-h-32 bg-secondary/60 border border-border/70 rounded-2xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all leading-relaxed"
          />
        </div>

        {/* Send Button */}
        <div className="pb-1 shrink-0">
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || isSending || disabled}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
              text.trim()
                ? "bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 text-white shadow-lg shadow-primary/25 cursor-pointer"
                : "bg-secondary text-muted-foreground opacity-50 cursor-not-allowed border border-border/50"
            }`}
            title="Send Message"
            aria-label="Send Message"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
