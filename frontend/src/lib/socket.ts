import { io, Socket } from "socket.io-client";
import { Message, Conversation } from "@/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "https://frontend-task-chatapp.onrender.com";

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private messageListeners: Set<(message: Message) => void> = new Set();
  private conversationListeners: Set<(conversation: Conversation) => void> = new Set();
  private statusListeners: Set<(status: "connected" | "connecting" | "disconnected") => void> = new Set();
  private status: "connected" | "connecting" | "disconnected" = "disconnected";

  public connect(token: string) {
    if (this.socket && this.token === token && this.socket.connected) {
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.token = token;
    this.updateStatus("connecting");

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.socket.on("connect", () => {
      this.updateStatus("connected");
    });

    this.socket.on("disconnect", () => {
      this.updateStatus("disconnected");
    });

    this.socket.on("connect_error", () => {
      this.updateStatus("disconnected");
    });

    this.socket.on("message:new", (data: any) => {
      const normalizedMsg: Message = {
        ...data,
        _id: String(data._id || data.id || `msg_${Date.now()}_${Math.random()}`),
        createdAt:
          typeof data.createdAt === "number"
            ? new Date(data.createdAt).toISOString()
            : String(data.createdAt || new Date().toISOString()),
        status: "sent",
      };
      this.messageListeners.forEach((listener) => listener(normalizedMsg));
    });

    this.socket.on("conversation:updated", (data: Conversation) => {
      this.conversationListeners.forEach((listener) => listener(data));
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.token = null;
    this.updateStatus("disconnected");
  }

  public joinConversation(conversationId: string) {
    if (this.socket && this.socket.connected && conversationId) {
      this.socket.emit("conversation:join", conversationId);
    }
  }

  public leaveConversation(conversationId: string) {
    if (this.socket && this.socket.connected && conversationId) {
      this.socket.emit("conversation:leave", conversationId);
    }
  }

  public sendMessage(
    conversationId: string,
    text: string,
    callback?: (response: { status: "ok"; message: Message } | { error: string }) => void
  ) {
    if (!this.socket || !this.socket.connected) {
      return false;
    }

    this.socket.emit("message:send", { conversationId, text }, callback);
    return true;
  }

  public onMessage(callback: (message: Message) => void): () => void {
    this.messageListeners.add(callback);
    return () => {
      this.messageListeners.delete(callback);
    };
  }

  public onConversationUpdated(callback: (conversation: Conversation) => void): () => void {
    this.conversationListeners.add(callback);
    return () => {
      this.conversationListeners.delete(callback);
    };
  }

  public onStatusChange(callback: (status: "connected" | "connecting" | "disconnected") => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  public getStatus() {
    return this.status;
  }

  private updateStatus(newStatus: "connected" | "connecting" | "disconnected") {
    this.status = newStatus;
    this.statusListeners.forEach((listener) => listener(newStatus));
  }
}

export const socketService = new SocketService();
