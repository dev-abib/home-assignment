"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/hooks/useChat";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { NewConversationModal } from "@/components/chat/NewConversationModal";
import { NewGroupModal } from "@/components/chat/NewGroupModal";
import { GroupInfoDrawer } from "@/components/chat/GroupInfoDrawer";
import { User, Conversation, GroupConversation } from "@/types";
import { api } from "@/lib/api";
import { Loader2, MessageSquare, Users, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();

  const {
    conversations,
    activeConversationId,
    activeConversation,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isLoadingMore,
    hasMore,
    socketStatus,
    error,
    selectConversation,
    sendMessage,
    loadOlderMessages,
    fetchConversations,
    setConversations,
  } = useChat({ currentUser: user });

  // Modal & Drawer states
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);

  // In-chat search filter
  const [isSearchingInChat, setIsSearchingInChat] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");

  // Responsive mobile sidebar view
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Authentication guard
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Handle selecting user to start 1-to-1 conversation
  const handleStartDirectChat = async (targetUser: User) => {
    const res = await api.startDirectConversation(targetUser._id);
    if (res.data) {
      await fetchConversations();
      selectConversation(res.data._id);
      setMobileShowChat(true);
      toast.success(`Conversation with ${targetUser.name} opened`);
    } else {
      toast.error(res.error || "Could not open conversation");
    }
  };

  // Handle group created
  const handleGroupCreated = async (group: Conversation) => {
    await fetchConversations();
    selectConversation(group._id);
    setMobileShowChat(true);
  };

  // Handle group updated (renamed, member added, admin promoted)
  const handleGroupUpdated = (updatedGroup: GroupConversation) => {
    setConversations((prev) =>
      prev.map((c) => (c._id === updatedGroup._id ? updatedGroup : c))
    );
  };

  // Handle left group
  const handleGroupLeft = (groupId: string) => {
    setConversations((prev) => prev.filter((c) => c._id !== groupId));
    selectConversation("");
    setMobileShowChat(false);
  };

  const handleSelectConv = (id: string) => {
    selectConversation(id);
    setMobileShowChat(true);
    setIsSearchingInChat(false);
    setChatSearchQuery("");
  };

  if (isAuthLoading || (!isAuthenticated && !user)) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Authenticating session...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      {/* 1. Sidebar (Visible on desktop or when no chat is open on mobile) */}
      <div
        className={`h-full shrink-0 ${
          mobileShowChat ? "hidden md:flex" : "flex w-full md:w-auto"
        }`}
      >
        <ConversationSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          currentUser={user}
          socketStatus={socketStatus}
          onSelectConversation={handleSelectConv}
          onOpenNewChat={() => setIsNewChatOpen(true)}
          onOpenNewGroup={() => setIsNewGroupOpen(true)}
          onLogout={logout}
        />
      </div>

      {/* 2. Main Chat Panel Area */}
      <main
        className={`h-full flex-1 flex flex-col bg-background/50 relative overflow-hidden ${
          !mobileShowChat ? "hidden md:flex" : "flex"
        }`}
      >
        {activeConversation ? (
          <>
            {/* Active Conversation Header */}
            <ChatHeader
              conversation={activeConversation}
              onOpenInfo={() => setIsGroupInfoOpen(true)}
              onBack={() => setMobileShowChat(false)}
              searchQuery={chatSearchQuery}
              onSearchChange={setChatSearchQuery}
              isSearching={isSearchingInChat}
              onToggleSearch={() => {
                setIsSearchingInChat(!isSearchingInChat);
                if (isSearchingInChat) setChatSearchQuery("");
              }}
            />

            {/* Message List */}
            <MessageList
              messages={messages}
              currentUser={user}
              conversation={activeConversation}
              isLoading={isLoadingMessages}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              onLoadOlder={loadOlderMessages}
              searchHighlight={chatSearchQuery}
            />

            {/* Message Input */}
            <ChatInput onSendMessage={sendMessage} />
          </>
        ) : (
          /* Empty / Welcome View */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-primary/30 animate-pulse-glow">
                <Sparkles className="w-10 h-10" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Welcome to PulseChat
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mt-2">
              Select an existing conversation from the sidebar, search for a team member, or create a group to start messaging.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 max-w-md w-full">
              <button
                onClick={() => setIsNewChatOpen(true)}
                className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/80 hover:border-primary/50 shadow-md text-left transition-all hover:scale-[1.02] group glass"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Direct Message</h4>
                  <p className="text-[11px] text-muted-foreground">Find a user by phone or name</p>
                </div>
              </button>

              <button
                onClick={() => setIsNewGroupOpen(true)}
                className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/80 hover:border-primary/50 shadow-md text-left transition-all hover:scale-[1.02] group glass"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Group Channel</h4>
                  <p className="text-[11px] text-muted-foreground">Create a multi-member room</p>
                </div>
              </button>
            </div>

            <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
              <Link href="/docs" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <BookOpen className="w-4 h-4" />
                <span>API Documentation</span>
              </Link>
              <span>·</span>
              <Link href="/" className="hover:text-primary transition-colors">
                Landing Page
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* 3. Group Info / Settings Drawer */}
      {activeConversation && activeConversation.type === "group" && (
        <GroupInfoDrawer
          isOpen={isGroupInfoOpen}
          onClose={() => setIsGroupInfoOpen(false)}
          group={activeConversation as GroupConversation}
          currentUser={user}
          onGroupUpdated={handleGroupUpdated}
          onGroupLeft={handleGroupLeft}
        />
      )}

      {/* 4. Modals */}
      <NewConversationModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onSelectUser={handleStartDirectChat}
        currentUserId={user?._id}
      />

      <NewGroupModal
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
        onGroupCreated={handleGroupCreated}
        currentUserId={user?._id}
      />
    </div>
  );
}
