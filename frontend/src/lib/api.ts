import { User, Conversation, Message, GetMessagesResponse, AuthResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://frontend-task-chatapp.onrender.com/api";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("chat_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: string | null; status: number }> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const status = response.status;
      let json: any = null;

      try {
        json = await response.json();
      } catch {
        json = null;
      }

      if (!response.ok) {
        let errorMessage = `HTTP Error ${status}`;
        if (json?.error?.message) {
          errorMessage = json.error.message;
          if (json.error.details && Array.isArray(json.error.details)) {
            const detailMsgs = json.error.details.map((d: any) => d.message).join(", ");
            if (detailMsgs) errorMessage += `: ${detailMsgs}`;
          }
        } else if (json?.message) {
          errorMessage = json.message;
        }
        return { data: null, error: errorMessage, status };
      }

      return { data: json as T, error: null, status };
    } catch (err: any) {
      return {
        data: null,
        error: err.message || "Network error. Please check your internet connection.",
        status: 0,
      };
    }
  }

  // --- Auth ---
  async login(phone: string, name: string): Promise<{ data: AuthResponse | null; error: string | null }> {
    const res = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, name }),
    });
    return { data: res.data, error: res.error };
  }

  async getMe(): Promise<{ data: { user: User } | null; error: string | null }> {
    const res = await this.request<{ user: User }>("/auth/me", {
      method: "GET",
    });
    return { data: res.data, error: res.error };
  }

  // --- Users ---
  async searchUsers(query: string): Promise<{ data: User[] | null; error: string | null }> {
    const res = await this.request<User[]>(`/users/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
    });
    return { data: res.data, error: res.error };
  }

  // --- Conversations ---
  async getConversations(): Promise<{ data: Conversation[] | null; error: string | null }> {
    const res = await this.request<any>("/conversations", {
      method: "GET",
    });
    const list = Array.isArray(res.data) ? res.data : res.data?.data || null;
    return { data: list, error: res.error };
  }

  async startDirectConversation(userId: string): Promise<{ data: Conversation | null; error: string | null }> {
    const res = await this.request<Conversation>("/conversations", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
    return { data: res.data, error: res.error };
  }

  async createGroup(name: string, participantIds: string[]): Promise<{ data: Conversation | null; error: string | null }> {
    const res = await this.request<Conversation>("/conversations/group", {
      method: "POST",
      body: JSON.stringify({ name, participantIds }),
    });
    return { data: res.data, error: res.error };
  }

  async renameGroup(conversationId: string, name: string): Promise<{ data: Conversation | null; error: string | null }> {
    const res = await this.request<Conversation>(`/conversations/${conversationId}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
    return { data: res.data, error: res.error };
  }

  async promoteAdmin(conversationId: string, userId: string): Promise<{ data: Conversation | null; error: string | null }> {
    const res = await this.request<Conversation>(`/conversations/${conversationId}/admins`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
    return { data: res.data, error: res.error };
  }

  async addParticipants(conversationId: string, userIds: string[]): Promise<{ data: Conversation | null; error: string | null }> {
    const res = await this.request<Conversation>(`/conversations/${conversationId}/participants`, {
      method: "POST",
      body: JSON.stringify({ userIds }),
    });
    return { data: res.data, error: res.error };
  }

  async removeParticipant(conversationId: string, userId: string): Promise<{ data: Conversation | null; error: string | null }> {
    const res = await this.request<Conversation>(`/conversations/${conversationId}/participants/${userId}`, {
      method: "DELETE",
    });
    return { data: res.data, error: res.error };
  }

  // --- Messages ---
  async getMessages(
    conversationId: string,
    params?: { limit?: number; before?: string }
  ): Promise<{ data: GetMessagesResponse | null; error: string | null }> {
    const queryParts: string[] = [];
    if (params?.limit) queryParts.push(`limit=${params.limit}`);
    if (params?.before) queryParts.push(`before=${params.before}`);
    const qs = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";

    const res = await this.request<GetMessagesResponse>(`/conversations/${conversationId}/messages${qs}`, {
      method: "GET",
    });
    return { data: res.data, error: res.error };
  }

  async sendMessage(conversationId: string, text: string): Promise<{ data: Message | null; error: string | null }> {
    const res = await this.request<Message>("/messages", {
      method: "POST",
      body: JSON.stringify({ conversationId, text }),
    });
    return { data: res.data, error: res.error };
  }
}

export const api = new ApiClient();
