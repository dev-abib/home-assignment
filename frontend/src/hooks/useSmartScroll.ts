"use client";

import { useRef, useState, useCallback, useEffect, useLayoutEffect } from "react";

interface SmartScrollOptions {
  threshold?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function useSmartScroll({
  threshold = 120,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: SmartScrollOptions = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [hasScrolledUp, setHasScrolledUp] = useState<boolean>(false);
  const [unreadBelowCount, setUnreadBelowCount] = useState<number>(0);

  // Keep track of scroll height before prepending older messages
  const previousScrollHeightRef = useRef<number>(0);
  const previousScrollTopRef = useRef<number>(0);
  const isPrependingRef = useRef<boolean>(false);

  const checkIsAtBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceFromBottom <= threshold;
  }, [threshold]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const atBottom = checkIsAtBottom();
    setIsAtBottom(atBottom);

    if (atBottom) {
      setHasScrolledUp(false);
      setUnreadBelowCount(0);
    } else {
      setHasScrolledUp(true);
    }

    // Trigger load older messages when scrolled near top
    if (el.scrollTop <= 40 && hasMore && !isLoadingMore && onLoadMore) {
      // Record height before loading older messages
      previousScrollHeightRef.current = el.scrollHeight;
      previousScrollTopRef.current = el.scrollTop;
      isPrependingRef.current = true;
      onLoadMore();
    }
  }, [checkIsAtBottom, hasMore, isLoadingMore, onLoadMore]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior,
    });
    setIsAtBottom(true);
    setHasScrolledUp(false);
    setUnreadBelowCount(0);
  }, []);

  // Preserve scroll position when older messages are loaded into the top
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || !isPrependingRef.current) return;

    const heightDifference = el.scrollHeight - previousScrollHeightRef.current;
    if (heightDifference > 0) {
      el.scrollTop = previousScrollTopRef.current + heightDifference;
    }
    isPrependingRef.current = false;
  });

  // Called when a new message is added
  const handleNewMessage = useCallback((isSelf: boolean = false) => {
    if (isSelf || isAtBottom) {
      // Auto-scroll for outgoing messages or if user is already at bottom
      requestAnimationFrame(() => {
        scrollToBottom("smooth");
      });
    } else {
      // User is scrolled up reviewing history — do not force scroll!
      setUnreadBelowCount((prev) => prev + 1);
    }
  }, [isAtBottom, scrollToBottom]);

  return {
    containerRef,
    isAtBottom,
    hasScrolledUp,
    unreadBelowCount,
    scrollToBottom,
    handleScroll,
    handleNewMessage,
  };
}
