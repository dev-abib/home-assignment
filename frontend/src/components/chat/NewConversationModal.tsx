"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { User } from "@/types";
import { api } from "@/lib/api";
import { Search, Loader2, MessageSquare, X, Users } from "lucide-react";

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => Promise<void>;
  currentUserId?: string;
}

export function NewConversationModal({
  isOpen,
  onClose,
  onSelectUser,
  currentUserId,
}: NewConversationModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState<string | null>(null);

  // Load directory on open and filter on search
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setResults([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      const res = await api.searchUsers(searchQuery.trim());
      if (!isMounted) return;
      if (res.data) {
        // Exclude current user from search results
        const filtered = res.data.filter((u) => u._id !== currentUserId);
        setResults(filtered);
      } else {
        setResults([]);
      }
      setIsLoading(false);
    }, searchQuery.trim() ? 200 : 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, isOpen, currentUserId]);

  const handleStart = async (user: User) => {
    try {
      setIsStarting(user._id);
      await onSelectUser(user);
      onClose();
    } finally {
      setIsStarting(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Direct Message"
      description="Select a team member to start a one-on-one conversation."
      maxWidth="md"
    >
      <div className="space-y-3.5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full bg-secondary/60 border border-border/70 rounded-xl pl-10 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Directory List */}
        <div className="min-h-[200px] max-h-[320px] overflow-y-auto space-y-1.5 pr-0.5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-xs">Searching users...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-center p-4">
              <div className="w-10 h-10 rounded-2xl bg-secondary/80 flex items-center justify-center text-muted-foreground mb-2">
                <Users className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-sm font-semibold text-foreground">No users found</p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
                {searchQuery
                  ? "Try searching with a different name or phone number"
                  : "No other registered users found in the system"}
              </p>
            </div>
          ) : (
            results.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-card/60 hover:bg-secondary/70 border border-border/40 hover:border-border/80 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <Avatar name={user.name} size="md" />
                  <div className="truncate">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{user.phone}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStart(user)}
                  disabled={isStarting === user._id}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 shrink-0 active:scale-95"
                >
                  {isStarting === user._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
