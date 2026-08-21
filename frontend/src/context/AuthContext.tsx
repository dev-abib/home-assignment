"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, AuthResponse } from "@/types";
import { api } from "@/lib/api";
import { socketService } from "@/lib/socket";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    async function restoreSession() {
      if (typeof window === "undefined") return;

      const storedToken = localStorage.getItem("chat_token");
      const storedUser = localStorage.getItem("chat_user");

      if (storedToken) {
        setToken(storedToken);
        socketService.connect(storedToken);

        if (storedUser) {
          try {
            setUserState(JSON.parse(storedUser));
          } catch {
            // Ignore parse error
          }
        }

        // Verify with /auth/me
        try {
          const res = await api.getMe();
          if (res.data?.user) {
            setUserState(res.data.user);
            localStorage.setItem("chat_user", JSON.stringify(res.data.user));
          } else if (res.error && res.error.includes("401")) {
            // Invalid token
            logout();
          }
        } catch {
          // Network error, keep stored user
        }
      }
      setIsLoading(false);
    }

    restoreSession();
  }, []);

  const login = useCallback(async (phone: string, name: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const res = await api.login(phone, name);

    if (res.data) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUserState(newUser);

      if (typeof window !== "undefined") {
        localStorage.setItem("chat_token", newToken);
        localStorage.setItem("chat_user", JSON.stringify(newUser));
      }

      socketService.connect(newToken);
      setIsLoading(false);
      return { success: true };
    } else {
      setIsLoading(false);
      return { success: false, error: res.error || "Failed to log in" };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserState(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("chat_token");
      localStorage.removeItem("chat_user");
    }
    socketService.disconnect();
  }, []);

  const setUser = useCallback((updatedUser: User) => {
    setUserState(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("chat_user", JSON.stringify(updatedUser));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
