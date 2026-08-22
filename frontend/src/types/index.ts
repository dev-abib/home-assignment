export interface User {
  _id: string;
  name: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: string | User | { _id: string; name?: string; phone?: string };
  text: string;
  createdAt: string;
  // Client-side UI enhancements
  status?: "sending" | "sent" | "error";
  tempId?: string;
  senderName?: string;
}

export interface ConversationParticipant {
  _id: string;
  name: string;
  phone: string;
}

export interface DirectConversation {
  _id: string;
  type: "direct";
  participants?: (string | ConversationParticipant)[];
  participant?: ConversationParticipant;
  lastMessage?: {
    text?: string;
    sender?: string;
    createdAt?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  unreadCount?: number;
}

export interface GroupConversation {
  _id: string;
  type: "group";
  name: string;
  createdBy: string;
  admins: string[];
  participants: ConversationParticipant[];
  lastMessage?: {
    text?: string;
    sender?: string;
    createdAt?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  unreadCount?: number;
}

export type Conversation = DirectConversation | GroupConversation;

export interface GetMessagesResponse {
  messages: Message[];
  hasMore: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Array<{
    path?: string;
    message: string;
  }>;
}
