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
  async searchUsers(query: string = ""): Promise<{ data: User[] | null; error: string | null }> {
    const trimmed = (query || "").trim();
    const safeQuery = trimmed.replace(/^\+/, "");

    // 1. Attempt primary backend search
    const res = await this.request<User[]>(`/users/search?q=${encodeURIComponent(safeQuery)}`, {
      method: "GET",
    });

    let users: User[] = Array.isArray(res.data) ? res.data : [];

    // 2. Fetch full directory if searching by phone or if direct query had 0 results or failed
    // (Render backend only searches name with regex and fails on '+' or misses phone numbers)
    try {
      const dirRes = await this.request<User[]>("/users/search?q=", { method: "GET" });
      if (Array.isArray(dirRes.data) && dirRes.data.length > 0) {
        const userMap = new Map<string, User>();
        // Add direct results first
        users.forEach((u) => u && u._id && userMap.set(u._id, u));

        if (!trimmed) {
          // If query is empty, return all directory contacts
          dirRes.data.forEach((u) => u && u._id && userMap.set(u._id, u));
        } else {
          const lowerQuery = trimmed.toLowerCase();
          const cleanQuery = lowerQuery.replace(/[^a-z0-9]/g, "");
          const digitsOnly = trimmed.replace(/\D/g, "");

          dirRes.data.forEach((u) => {
            if (!u || !u._id) return;
            const uName = (u.name || "").toLowerCase();
            const uCleanName = uName.replace(/[^a-z0-9]/g, "");
            const uPhone = (u.phone || "").toLowerCase();
            const uDigits = (u.phone || "").replace(/\D/g, "");

            const matchName =
              uName.includes(lowerQuery) || (cleanQuery.length > 0 && uCleanName.includes(cleanQuery));
            const matchPhone =
              uPhone.includes(lowerQuery) ||
              (digitsOnly.length > 0 && uDigits.includes(digitsOnly)) ||
              (digitsOnly.length >= 3 && uDigits.endsWith(digitsOnly));

            if (matchName || matchPhone) {
              userMap.set(u._id, u);
            }
          });
        }
        users = Array.from(userMap.values());
      }
    } catch {
      // Fallback to primary results
    }

    return { data: users, error: null };
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
