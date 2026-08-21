"use client";

import React, { useState } from "react";
import { GroupConversation, User } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import {
  X,
  Users,
  ShieldCheck,
  UserPlus,
  Edit2,
  LogOut,
  UserMinus,
  Check,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "sonner";

interface GroupInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  group: GroupConversation;
  currentUser: User | null;
  onGroupUpdated: (updated: GroupConversation) => void;
  onGroupLeft: (groupId: string) => void;
}

export function GroupInfoDrawer({
  isOpen,
  onClose,
  group,
  currentUser,
  onGroupUpdated,
  onGroupLeft,
}: GroupInfoDrawerProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(group.name);
  const [isRenaming, setIsRenaming] = useState(false);

  // Add members
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [memberSearchResults, setMemberSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAdmin = currentUser ? group.admins.includes(currentUser._id) : false;

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newName.trim() === group.name) {
      setIsEditingName(false);
      return;
    }

    setIsRenaming(true);
    const res = await api.renameGroup(group._id, newName.trim());
    if (res.data) {
      toast.success("Group renamed successfully");
      onGroupUpdated(res.data as GroupConversation);
      setIsEditingName(false);
    } else {
      toast.error(res.error || "Failed to rename group");
    }
    setIsRenaming(false);
  };

  const handlePromoteAdmin = async (userId: string) => {
    setActionLoading(`promote_${userId}`);
    const res = await api.promoteAdmin(group._id, userId);
    if (res.data) {
      toast.success("Member promoted to admin");
      onGroupUpdated(res.data as GroupConversation);
    } else {
      toast.error(res.error || "Failed to promote member");
    }
    setActionLoading(null);
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    setActionLoading(`remove_${userId}`);
    const res = await api.removeParticipant(group._id, userId);
    if (res.data) {
      toast.success("Member removed from group");
      onGroupUpdated(res.data as GroupConversation);
    } else {
      toast.error(res.error || "Failed to remove member");
    }
    setActionLoading(null);
  };

  const handleLeaveGroup = async () => {
    if (!currentUser) return;
    if (!confirm("Are you sure you want to leave this group?")) return;

    setActionLoading("leave");
    const res = await api.removeParticipant(group._id, currentUser._id);
    if (res.data || !res.error) {
      toast.info("You left the group");
      onGroupLeft(group._id);
      onClose();
    } else {
      toast.error(res.error || "Failed to leave group");
    }
    setActionLoading(null);
  };

  // Search users to add
  const handleSearchUsers = async (q: string) => {
    setMemberSearchQuery(q);
    if (!q.trim()) {
      setMemberSearchResults([]);
      return;
    }

    setIsSearching(true);
    const res = await api.searchUsers(q.trim());
    if (res.data) {
      // Filter out users already in group
      const existingIds = new Set(group.participants.map((p) => p._id));
      const filtered = res.data.filter((u) => !existingIds.has(u._id));
      setMemberSearchResults(filtered);
    }
    setIsSearching(false);
  };

  const handleAddUser = async (user: User) => {
    setActionLoading(`add_${user._id}`);
    const res = await api.addParticipants(group._id, [user._id]);
    if (res.data) {
      toast.success(`Added ${user.name} to group`);
      onGroupUpdated(res.data as GroupConversation);
      setMemberSearchResults((prev) => prev.filter((u) => u._id !== user._id));
    } else {
      toast.error(res.error || "Failed to add member");
    }
    setActionLoading(null);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-card border-l border-border shadow-2xl flex flex-col animate-slide-in-right glass">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/60">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <span>Group Info</span>
        </h3>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Group Profile Card */}
        <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-secondary/40 border border-border/50">
          <Avatar name={group.name} size="xl" isGroup />
          
          {isEditingName ? (
            <form onSubmit={handleRename} className="w-full mt-3 flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                className="w-full bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={isRenaming}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                {isRenaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
            </form>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{group.name}</h2>
              {isAdmin && (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1 text-muted-foreground hover:text-primary transition-colors"
                  title="Rename Group"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            Group · {group.participants?.length || 0} participants
          </p>
        </div>

        {/* Add Members Section (Admin only) */}
        {isAdmin && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Add Participants
              </span>
              <button
                onClick={() => setIsAddingMembers(!isAddingMembers)}
                className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isAddingMembers ? "Close" : "Add Member"}</span>
              </button>
            </div>

            {isAddingMembers && (
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/70 space-y-2 animate-fade-in">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search name or phone..."
                    value={memberSearchQuery}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {isSearching ? (
                  <div className="flex items-center justify-center p-2 text-xs text-muted-foreground gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    <span>Searching...</span>
                  </div>
                ) : memberSearchResults.length > 0 ? (
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {memberSearchResults.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-card/60 border border-border/40 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Avatar name={user.name} size="sm" />
                          <span className="truncate font-medium">{user.name}</span>
                        </div>
                        <button
                          onClick={() => handleAddUser(user)}
                          disabled={actionLoading === `add_${user._id}`}
                          className="px-2 py-1 rounded bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary-hover transition-colors"
                        >
                          {actionLoading === `add_${user._id}` ? "Adding..." : "Add"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : memberSearchQuery.trim() ? (
                  <p className="text-[11px] text-muted-foreground text-center p-1">No users found</p>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* Participants List */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
            Members ({group.participants?.length || 0})
          </h4>

          <div className="space-y-1.5">
            {group.participants?.map((participant) => {
              const isUserAdmin = group.admins.includes(participant._id);
              const isSelf = participant._id === currentUser?._id;

              return (
                <div
                  key={participant._id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/30 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={participant.name} size="sm" />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-foreground truncate">
                          {participant.name}
                        </span>
                        {isSelf && <span className="text-[10px] text-muted-foreground">(You)</span>}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{participant.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isUserAdmin ? (
                      <Badge variant="admin" className="text-[10px]">
                        Admin
                      </Badge>
                    ) : (
                      isAdmin && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handlePromoteAdmin(participant._id)}
                            disabled={actionLoading === `promote_${participant._id}`}
                            className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                            title="Promote to Admin"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveMember(participant._id)}
                            disabled={actionLoading === `remove_${participant._id}`}
                            className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Remove Member"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leave Group Action */}
      <div className="p-4 border-t border-border/60 bg-secondary/20">
        <button
          onClick={handleLeaveGroup}
          disabled={actionLoading === "leave"}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-destructive/30 bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {actionLoading === "leave" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span>Leave Group</span>
        </button>
      </div>
    </div>
  );
}
