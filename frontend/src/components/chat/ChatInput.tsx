"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Smile, Mic, X, Square, Paperclip } from "lucide-react";
import { toast } from "sonner";

interface ChatInputProps {
  onSendMessage: (text: string) => Promise<boolean>;
  disabled?: boolean;
}

const COMMON_EMOJIS = [
  "😀", "😂", "🥰", "😎", "🔥", "👍", "🎉", "❤️",
  "🚀", "👏", "🙌", "✨", "💯", "🤔", "👀", "⚡"
];

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  // Voice note timer
  useEffect(() => {
    if (isRecording) {
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

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

  const handleSendVoiceNote = async () => {
    const durationStr = `0:${recordSeconds < 10 ? "0" : ""}${recordSeconds || 14}`;
    setIsRecording(false);
    await onSendMessage(`[Voice Note] ${durationStr}`);
  };

  const handleCancelVoiceNote = () => {
    setIsRecording(false);
    setRecordSeconds(0);
  };

  const handleAttachDemo = () => {
    toast.info("Attachment pipeline simulated — image/doc sharing ready");
  };

  return (
    <div className="p-3 md:p-4 bg-card border-t border-border/80 glass relative select-none">
      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-30 p-3 rounded-2xl bg-card border border-border shadow-2xl glass animate-fade-in">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Emojis</span>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-8 gap-1.5 w-64">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleInsertEmoji(emoji)}
                className="text-lg p-1.5 rounded-lg hover:bg-secondary transition-transform hover:scale-125 text-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Recorder Overlay Mode */}
      {isRecording ? (
        <div className="flex items-center justify-between p-2 rounded-2xl bg-secondary/80 border border-primary/40 animate-fade-in">
          <div className="flex items-center gap-3 pl-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-mono font-semibold text-foreground">
              Recording 0:{recordSeconds < 10 ? "0" : ""}{recordSeconds}
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              (Simulated Audio Note)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCancelVoiceNote}
              className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors text-xs font-medium flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSendVoiceNote}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Audio</span>
            </button>
          </div>
        </div>
      ) : (
        /* Regular Message Input */
        <div className="flex items-end gap-2">
          {/* Left Buttons: Attach & Emoji */}
          <div className="flex items-center gap-1 pb-1">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
              title="Add Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleAttachDemo}
              className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-secondary transition-colors hidden sm:flex"
              title="Attach File"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
              rows={1}
              className="w-full resize-none max-h-32 bg-secondary/70 border border-border/70 rounded-2xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all leading-relaxed"
            />
          </div>

          {/* Right Action: Send or Mic */}
          <div className="pb-1">
            {text.trim() ? (
              <button
                type="button"
                onClick={handleSend}
                disabled={!text.trim() || isSending || disabled}
                className="w-10 h-10 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-primary/25 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Send Message"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRecording(true)}
                className="w-10 h-10 rounded-2xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-primary border border-border/60 flex items-center justify-center transition-all active:scale-95"
                title="Record Voice Note"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
