"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { User, Conversation } from "@/types";
import { api } from "@/lib/api";
import { Search, Loader2, Users, X, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (group: Conversation) => void;
  currentUserId?: string;
}

export function NewGroupModal({
  isOpen,
  onClose,
  onGroupCreated,
  currentUserId,
}: NewGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setGroupName("");
      setSearchQuery("");
      setSearchResults([]);
      setSelectedUsers([]);
      setError(null);
    }
  }, [isOpen]);

  // Load directory and filter
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingUsers(true);

    const timer = setTimeout(async () => {
      const res = await api.searchUsers(searchQuery.trim());
      if (!isMounted) return;
      if (res.data) {
        // Filter out current user and already selected users
        const filtered = res.data.filter(
          (u) => u._id !== currentUserId && !selectedUsers.some((sel) => sel._id === u._id)
        );
        setSearchResults(filtered);
      } else {
        setSearchResults([]);
      }
      setIsLoadingUsers(false);
    }, searchQuery.trim() ? 200 : 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, isOpen, currentUserId, selectedUsers]);

  const handleSelectUser = (user: User) => {
    setSelectedUsers((prev) => [...prev, user]);
    setSearchResults((prev) => prev.filter((u) => u._id !== user._id));
    setSearchQuery("");
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError("Please enter a group name");
      return;
    }

    if (selectedUsers.length < 2) {
      setError("A group requires at least 3 members (you + at least 2 other members)");
      return;
    }

    setIsCreating(true);
    setError(null);

    const participantIds = selectedUsers.map((u) => u._id);
    const res = await api.createGroup(groupName.trim(), participantIds);

    if (res.data) {
      toast.success(`Group "${groupName.trim()}" created successfully!`);
      onGroupCreated(res.data);
      onClose();
    } else {
      setError(res.error || "Failed to create group");
    }
    setIsCreating(false);
  };

  const totalMembers = selectedUsers.length + 1; // Including creator
  const isValidSize = selectedUsers.length >= 2;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Group"
      description="Create a multi-member channel for team conversations."
      maxWidth="lg"
    >
      <form onSubmit={handleCreate} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Group Name */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Group Name
          </label>
          <div className="relative">
            <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="e.g. Design & Engineering Team"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                if (error) setError(null);
              }}
              autoFocus
              className="w-full bg-secondary/60 border border-border/70 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Selected Participants Chips */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Selected Members ({totalMembers} total)
            </label>
            <span
              className={`text-xs font-semibold ${
                isValidSize ? "text-emerald-500" : "text-amber-500"
              }`}
            >
              {isValidSize
                ? "✓ Valid group size (3+)"
                : `Need ${2 - selectedUsers.length} more member${2 - selectedUsers.length > 1 ? "s" : ""}`}
            </span>
          </div>

          <div className="min-h-[44px] max-h-28 overflow-y-auto p-2 rounded-xl bg-secondary/40 border border-border/60 flex flex-wrap gap-1.5 items-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/15 text-primary border border-primary/25 text-xs font-medium">
              <span>You (Creator)</span>
            </div>

            {selectedUsers.map((user) => (
              <div
                key={user._id}
                className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-secondary text-foreground border border-border/80 text-xs font-medium animate-fade-in shadow-sm"
              >
                <span>{user.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveUser(user._id)}
                  className="rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive text-muted-foreground transition-colors"
                  aria-label={`Remove ${user.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Add Member */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Search & Add Members
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or phone to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/60 border border-border/70 rounded-xl pl-10 pr-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown / Results */}
          <div className="mt-2 max-h-36 overflow-y-auto rounded-xl bg-card border border-border/80 p-1 space-y-1 shadow-inner">
            {isLoadingUsers ? (
              <div className="flex items-center justify-center p-3 text-muted-foreground gap-2 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Searching users...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center p-3">
                {searchQuery ? "No matching users found" : "Type above to search more team members"}
              </p>
            ) : (
              searchResults.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-secondary text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <Avatar name={user.name} size="sm" />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono truncate">{user.phone}</p>
                    </div>
                  </div>
                  <span className="text-xs text-primary font-semibold px-2 py-0.5 rounded-md bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                    + Add
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating || !isValidSize || !groupName.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating group...</span>
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                <span>Create Group</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
