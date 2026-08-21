"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Phone, User, ArrowRight, Loader2, MessageSquare, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/chat");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !name.trim()) {
      setError("Please provide both your phone number and your name.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await login(phone.trim(), name.trim());
    if (result.success) {
      toast.success(`Welcome to PulseChat, ${name.trim()}!`);
      router.push("/chat");
    } else {
      setError(result.error || "Login failed. Please check your network connection.");
    }
    setIsSubmitting(false);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background p-4 md:p-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Bar */}
      <header className="flex items-center justify-between max-w-6xl mx-auto w-full z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-primary/25">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-base font-bold text-foreground tracking-tight">PulseChat</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/docs"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
          >
            API Specification
          </Link>
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-xl bg-secondary/80 hover:bg-secondary border border-border text-xs font-semibold text-foreground transition-all"
          >
            Landing Page
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto py-10 z-10">
        <div className="rounded-3xl bg-card/80 border border-border/80 p-6 md:p-8 shadow-2xl glass animate-fade-in relative">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 text-primary mb-3 border border-primary/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Sign In to PulseChat
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto">
              Enter your phone and name. If your number is new, your account will be registered automatically.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Number Input */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="+15551234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-secondary/70 border border-border/70 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono"
                />
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Include country code (e.g. +1 for US, +44 for UK, +880 for BD)
              </span>
            </div>

            {/* Display Name Input */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Your Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g. Ada Lovelace"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-secondary/70 border border-border/70 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !phone.trim() || !name.trim()}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 text-white text-sm font-semibold shadow-lg shadow-primary/25 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>Continue to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-border/50 text-center">
            <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-friction automatic registration enabled</span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground max-w-6xl mx-auto w-full z-10">
        <p>© 2026 PulseChat Platform · Built with Next.js, TypeScript & Socket.io</p>
      </footer>
    </div>
  );
}
