import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, isThisYear } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMessageTime(isoString?: string): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return format(date, "h:mm a");
  } catch {
    return "";
  }
}

export function formatConversationDate(isoString?: string): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isToday(date)) {
      return format(date, "h:mm a");
    }
    if (isYesterday(date)) {
      return "Yesterday";
    }
    if (isThisYear(date)) {
      return format(date, "MMM d");
    }
    return format(date, "MM/dd/yy");
  } catch {
    return "";
  }
}

export function formatDateSeparator(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    if (isThisYear(date)) return format(date, "EEEE, MMMM d");
    return format(date, "MMMM d, yyyy");
  } catch {
    return "";
  }
}

export function getAvatarColor(name: string = ""): string {
  const colors = [
    "from-pink-500 to-rose-500",
    "from-purple-500 to-indigo-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-violet-500 to-purple-600",
    "from-rose-500 to-red-600",
    "from-cyan-500 to-blue-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getInitials(name: string = ""): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
