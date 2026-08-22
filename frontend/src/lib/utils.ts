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

export function getSenderId(sender: unknown): string {
  if (!sender) return "";
  if (typeof sender === "string") return sender;
  if (typeof sender === "object" && sender !== null && "_id" in sender) {
    return String((sender as { _id: string })._id);
  }
  return String(sender);
}

export function getSenderName(sender: unknown): string {
  if (!sender) return "";
  if (typeof sender === "object" && sender !== null && "name" in sender) {
    return String((sender as { name?: string }).name || "");
  }
  return "";
}

/**
 * Validates international and local phone numbers according to E.164 recommendation.
 * Requires 7-15 digits, allowing optional leading '+' and standard separators (spaces, dashes, parens).
 */
export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { isValid: false, error: "Phone number is required." };
  }

  // Must match phone character set (optional leading +, digits, spaces, dashes, parens)
  const phoneCharRegex = /^\+?[0-9\s\-\(\)\.]{7,25}$/;
  if (!phoneCharRegex.test(trimmed)) {
    return {
      isValid: false,
      error: "Phone number contains invalid characters.",
    };
  }

  // Extract raw digits
  const rawDigits = trimmed.replace(/\D/g, "");
  if (rawDigits.length < 7) {
    return {
      isValid: false,
      error: "Phone number is too short (must contain at least 7 digits).",
    };
  }

  if (rawDigits.length > 15) {
    return {
      isValid: false,
      error: "Phone number is too long (maximum 15 digits according to E.164).",
    };
  }

  return { isValid: true };
}

/**
 * Validates full name input (must be at least 2 non-whitespace characters).
 */
export function validateFullName(name: string): { isValid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: "Full name is required." };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters long." };
  }
  return { isValid: true };
}
