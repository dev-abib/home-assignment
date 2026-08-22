"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Conversation, Message, User } from "@/types";
import { api } from "@/lib/api";
import { socketService } from "@/lib/socket";
import { sounds } from "@/lib/sound";
import { getSenderId } from "@/lib/utils";

interface UseChatProps {
  currentUser: User | null;
}

export function useChat({ currentUser }: UseChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [socketStatus, setSocketStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected");
  const [error, setError] = useState<string | null>(null);

  const activeConvRef = useRef<string | null>(null);
  activeConvRef.current = activeConversationId;

  // Active conversation object
  const activeConversation = conversations.find((c) => c._id === activeConversationId) || null;

  // 1. Fetch conversations list
  const fetchConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setError(null);
    const res = await api.getConversations();
    if (res.data) {
      // Sort conversations by updatedAt descending
      const sorted = [...res.data].sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      setConversations(sorted);
    } else {
      setError(res.error || "Failed to load conversations");
    }
    setIsLoadingConversations(false);
  }, []);

  // 2. Load messages for active conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    setIsLoadingMessages(true);
    setMessages([]);
    setHasMore(false);

    const res = await api.getMessages(conversationId, { limit: 30 });
    if (res.data) {
      // API returns messages in descending order (newest first). Reverse to ascending (oldest first).
      const sentList: Message[] = res.data.messages.map((m) => ({
        ...m,
        status: "sent" as const,
      }));
      const sorted = [...sentList].reverse();
      // Deduplicate by _id
      const uniqueMessages = Array.from(new Map(sorted.map((m) => [m._id, m])).values());
      setMessages(uniqueMessages);
      setHasMore(res.data.hasMore);
    } else {
      setError(res.error || "Failed to load messages");
    }
    setIsLoadingMessages(false);
  }, []);

  // 3. Load older messages (pagination)
  const loadOlderMessages = useCallback(async () => {
    if (!activeConversationId || isLoadingMore || !hasMore || messages.length === 0) return;

    setIsLoadingMore(true);
    const oldestMessage = messages[0];
    const beforeId = oldestMessage._id;

    const res = await api.getMessages(activeConversationId, { limit: 20, before: beforeId });
    if (res.data) {
      const olderSent: Message[] = res.data.messages.map((m) => ({
        ...m,
        status: "sent" as const,
      }));
      const olderMessages = [...olderSent].reverse();

      // Deduplicate against existing messages
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m._id));
        const newUnique = olderMessages.filter((m) => !existingIds.has(m._id));
        return [...newUnique, ...prev];
      });

      setHasMore(res.data.hasMore);
    }
    setIsLoadingMore(false);
  }, [activeConversationId, hasMore, isLoadingMore, messages]);

  // 4. Send a message
  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      const trimmed = text.trim();
      if (!trimmed || !activeConversationId || !currentUser) return false;

      const tempId = `temp_${Date.now()}_${Math.random()}`;
      const optimisticMsg: Message = {
        _id: tempId,
        conversation: activeConversationId,
        sender: currentUser._id,
        text: trimmed,
        createdAt: new Date().toISOString(),
        status: "sending",
        tempId,
      };

      // Add to messages immediately (optimistic UI)
      setMessages((prev) => [...prev, optimisticMsg]);
      sounds.playSend();

      // Update conversation list lastMessage preview
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConversationId
            ? {
                ...c,
                lastMessage: {
                  text: trimmed,
                  sender: currentUser._id,
                  createdAt: optimisticMsg.createdAt,
                },
                updatedAt: optimisticMsg.createdAt,
              }
            : c
        )
      );

      // Dispatch message to backend API (Render backend automatically broadcasts to Socket.io)
      const res = await api.sendMessage(activeConversationId, trimmed);
      if (res.data) {
        const realMsg = res.data;
        setMessages((prev) =>
          prev.map((m) =>
            m.tempId === tempId || m._id === tempId
              ? { ...realMsg, status: "sent" as const, tempId }
              : m
          )
        );
        return true;
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.tempId === tempId || m._id === tempId
              ? { ...m, status: "error" as const }
              : m
          )
        );
        return false;
      }

      return true;
    },
    [activeConversationId, currentUser]
  );

  // 4b. Retry failed message
  const retrySendMessage = useCallback(
    async (failedMsg: Message): Promise<boolean> => {
      const convId = failedMsg.conversation || activeConversationId;
      if (!convId || !currentUser || !failedMsg.text.trim()) return false;

      // Update status back to sending
      setMessages((prev) =>
        prev.map((m) =>
          m._id === failedMsg._id || m.tempId === failedMsg.tempId
            ? { ...m, status: "sending" as const }
            : m
        )
      );

      const res = await api.sendMessage(convId, failedMsg.text.trim());
      if (res.data) {
        const realMsg = res.data;
        setMessages((prev) =>
          prev.map((m) =>
            m._id === failedMsg._id || m.tempId === failedMsg.tempId
              ? { ...realMsg, status: "sent" as const, tempId: failedMsg.tempId }
              : m
          )
        );
        return true;
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === failedMsg._id || m.tempId === failedMsg.tempId
              ? { ...m, status: "error" as const }
              : m
          )
        );
        return false;
      }
    },
    [activeConversationId, currentUser]
  );

  // 5. Select a conversation
  const selectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
    if (conversationId) {
      socketService.joinConversation(conversationId);
    }
    // Clear unread count for this conversation
    setConversations((prev) =>
      prev.map((c) => (c._id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  // 6. Socket listeners & real-time setup
  useEffect(() => {
    const unsubStatus = socketService.onStatusChange(setSocketStatus);

    const unsubMessage = socketService.onMessage((incomingMsg: Message) => {
      const resolvedId = String(incomingMsg._id || incomingMsg.id || "");
      const normalizedIncoming: Message = {
        ...incomingMsg,
        _id: resolvedId || `msg_${Date.now()}_${Math.random()}`,
        status: "sent" as const,
      };

      const isForActive = normalizedIncoming.conversation === activeConvRef.current;
      const incomingSenderId = getSenderId(normalizedIncoming.sender);
      const isFromSelf = !!currentUser?._id && incomingSenderId === currentUser._id;

      if (isForActive) {
        setMessages((prev) => {
          // If this message is already rendered by exact valid _id, ignore or update status
          if (normalizedIncoming._id) {
            const hasExactId = prev.some((m) => !!m._id && m._id === normalizedIncoming._id);
            if (hasExactId) {
              return prev.map((m) => (m._id === normalizedIncoming._id ? { ...normalizedIncoming, status: "sent" as const } : m));
            }
          }

          // If there is a pending optimistic message matching text and sender, replace the first pending one
          let replacedPending = false;
          const updated = prev.map((m) => {
            const mSenderId = getSenderId(m.sender);
            if (
              !replacedPending &&
              m.tempId &&
              m.status === "sending" &&
              m.text === normalizedIncoming.text &&
              (mSenderId === incomingSenderId || !mSenderId || mSenderId === currentUser?._id)
            ) {
              replacedPending = true;
              return { ...normalizedIncoming, status: "sent" as const, tempId: m.tempId };
            }
            return m;
          });

          if (replacedPending) {
            return updated;
          }

          return [...prev, normalizedIncoming];
        });

        if (!isFromSelf) {
          sounds.playReceive();
        }
      } else {
        if (!isFromSelf) {
          sounds.playPop();
        }
      }

      // Update conversation list preview & unread count
      setConversations((prev) => {
        let found = false;
        const updated = prev.map((c) => {
          if (c._id === incomingMsg.conversation) {
            found = true;
            return {
              ...c,
              lastMessage: {
                text: incomingMsg.text,
                sender: incomingSenderId,
                createdAt: incomingMsg.createdAt,
              },
              updatedAt: incomingMsg.createdAt,
              unreadCount: isForActive ? 0 : (c.unreadCount || 0) + 1,
            };
          }
          return c;
        });

        if (!found) {
          // Refresh conversation list if brand new conversation
          fetchConversations();
          return prev;
        }

        // Re-sort with most active on top
        return updated.sort((a, b) => {
          const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return timeB - timeA;
        });
      });
    });

    const unsubConv = socketService.onConversationUpdated((updatedConv: Conversation) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => c._id === updatedConv._id);
        if (index >= 0) {
          const clone = [...prev];
          clone[index] = { ...clone[index], ...updatedConv };
          return clone;
        } else {
          return [updatedConv, ...prev];
        }
      });
    });

    return () => {
      unsubStatus();
      unsubMessage();
      unsubConv();
    };
  }, [currentUser, fetchConversations]);

  // Load initial conversations on mount
  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser, fetchConversations]);

  // Load messages whenever active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      socketService.joinConversation(activeConversationId);
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, loadMessages]);

  return {
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
    retrySendMessage,
    loadMessages,
    loadOlderMessages,
    fetchConversations,
    setConversations,
  };
}
