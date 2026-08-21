"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { User } from "@/types";
import { api } from "@/lib/api";
import { Search, Loader2, MessageSquare, Phone } from "lucide-react";

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
    }, searchQuery.trim() ? 250 : 0);

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
      title="Start New Conversation"
      description="Search for registered users by their name or phone number."
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name (e.g. Ada) or phone (+1555...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full bg-secondary/70 border border-border/70 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div className="min-h-[220px] max-h-[300px] overflow-y-auto space-y-1.5 pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-44 text-muted-foreground gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs">Searching directory...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-44 text-muted-foreground text-center p-4">
              <Phone className="w-8 h-8 opacity-40 mb-2" />
              <p className="text-sm font-medium text-foreground">No users found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try searching with a different name or phone number
              </p>
            </div>
          ) : (
            results.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/80 transition-all border border-transparent hover:border-border/50 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={user.name} size="md" />
                  <div className="truncate">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.phone}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleStart(user)}
                  disabled={isStarting === user._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-medium shadow-sm transition-all disabled:opacity-50 shrink-0"
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
