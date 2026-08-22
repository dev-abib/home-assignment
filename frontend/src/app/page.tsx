"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Users,
  MessageSquare,
  Radio,
  Send,
  Terminal,
  Lock,
  Layers,
  ChevronRight,
  Activity,
  Code2,
} from "lucide-react";

interface SimMessage {
  id: string;
  sender: "alex" | "taylor";
  text: string;
  time: string;
}

export default function LandingPage() {
  // Live Simulator State (Original Bonus Feature)
  const [simMessages, setSimMessages] = useState<SimMessage[]>([
    {
      id: "1",
      sender: "alex",
      text: "Hey Taylor! Real-time group governance and messaging are live 🚀",
      time: "10:42 AM",
    },
    {
      id: "2",
      sender: "taylor",
      text: "Awesome! Testing the smart scroll auto-continuity and instant WebSocket delivery.",
      time: "10:43 AM",
    },
    {
      id: "3",
      sender: "alex",
      text: "Notice how scrolling up pauses auto-scroll with a floating unread indicator?",
      time: "10:43 AM",
    },
  ]);
  const [activePersona, setActivePersona] = useState<"alex" | "taylor">("alex");
  const [simInput, setSimInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const simScrollRef = useRef<HTMLDivElement | null>(null);

  const handleSimSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!simInput.trim()) return;

    const newMsg: SimMessage = {
      id: String(Date.now()),
      sender: activePersona,
      text: simInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setSimMessages((prev) => [...prev, newMsg]);
    setSimInput("");

    // Auto reply simulation after 1s
    const replyingPersona = activePersona === "alex" ? "taylor" : "alex";
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const replyReplies = [
        "Instant delivery confirmed over Socket.io!",
        "The message deduplication boundary is rock solid.",
        "Smooth animations and zero scroll jumping ⚡",
        "Group admin promotion worked seamlessly!",
      ];
      const randomReply = replyReplies[Math.floor(Math.random() * replyReplies.length)];

      setSimMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: replyingPersona,
          text: randomReply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1000);
  };

  // Scroll simulator to bottom
  useEffect(() => {
    if (simScrollRef.current) {
      simScrollRef.current.scrollTop = simScrollRef.current.scrollHeight;
    }
  }, [simMessages, isTyping]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* 1. Dynamic Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-primary/20 via-indigo-600/15 to-purple-600/10 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-20 -right-40 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px]" />
      </div>

      {/* 2. Top Navigation */}
      <nav className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between relative z-20">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            PulseChat<span className="text-primary">.</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-muted-foreground">
          <a href="#simulator" className="hover:text-foreground transition-colors">
            Live Sandbox
          </a>
          <a href="#features" className="hover:text-foreground transition-colors">
            Core Features
          </a>
          <a href="#architecture" className="hover:text-foreground transition-colors">
            Architecture
          </a>
          <Link href="/docs" className="hover:text-foreground transition-colors flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5" />
            <span>API Docs</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold text-foreground hover:text-primary px-3 py-2 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-primary/20 transition-all active:scale-95"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* 3. Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold mb-6 shadow-sm animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-Time WebSocket & REST Architecture</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
          Real-time messaging, <br />
          <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            engineered with precision.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
          Instant 1-to-1 chats, multi-user group governance, non-intrusive smart auto-scroll continuity, and zero-friction phone onboarding.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/chat"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary via-indigo-600 to-purple-600 hover:from-primary-hover hover:to-purple-700 text-white text-sm font-bold shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open Chat Workspace</span>
          </Link>

          <Link
            href="/docs"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-secondary/80 hover:bg-secondary border border-border/80 text-foreground text-sm font-semibold transition-all hover:scale-105 active:scale-95 glass"
          >
            <Terminal className="w-4 h-4 text-primary" />
            <span>Interactive API Explorer</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto text-left">
          {[
            { label: "Real-time Latency", value: "< 24ms", desc: "Dual Socket.io & REST pipeline" },
            { label: "Group Governance", value: "3+ Members", desc: "Granular admin hierarchy" },
            { label: "Smart Scroll Continuity", value: "100%", desc: "No forced jumps while reading" },
            { label: "Frictionless Onboarding", value: "Instant", desc: "Auto-registers new numbers" },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-card/60 border border-border/60 glass shadow-sm hover:border-primary/40 transition-colors"
            >
              <p className="text-xl sm:text-2xl font-black text-foreground">{stat.value}</p>
              <p className="text-xs font-bold text-primary mt-0.5">{stat.label}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Live Interactive Simulator Sandbox */}
      <section id="simulator" className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4" />
            <span>Interactive Preview</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Try the Live Chat Sandbox
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
            Experience real-time messaging, simulated typing indicators, and seamless auto-scroll right on this page.
          </p>
        </div>

        {/* Simulator Card */}
        <div className="rounded-3xl bg-card border border-border shadow-2xl overflow-hidden glass max-w-3xl mx-auto">
          {/* Simulator Bar */}
          <div className="px-5 py-3.5 border-b border-border/80 bg-secondary/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-foreground ml-2">Sandbox Channel</span>
            </div>

            {/* Persona Switcher */}
            <div className="flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-border">
              <span className="text-[10px] text-muted-foreground px-2 font-medium">Send as:</span>
              <button
                type="button"
                onClick={() => setActivePersona("alex")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activePersona === "alex"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Alex
              </button>
              <button
                type="button"
                onClick={() => setActivePersona("taylor")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activePersona === "taylor"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Taylor
              </button>
            </div>
          </div>

          {/* Simulator Message Stream */}
          <div
            ref={simScrollRef}
            className="min-h-[260px] max-h-[340px] overflow-y-auto p-5 sm:p-6 space-y-3.5 bg-background/50"
          >
            {simMessages.map((msg) => {
              const isSelf = msg.sender === activePersona;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isSelf ? "flex-row-reverse" : "flex-row"} animate-fade-in`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 self-end ${
                      msg.sender === "alex"
                        ? "bg-gradient-to-tr from-primary to-indigo-500"
                        : "bg-gradient-to-tr from-indigo-600 to-purple-600"
                    }`}
                  >
                    {msg.sender === "alex" ? "AL" : "TS"}
                  </div>

                  <div className={`max-w-[75%] ${isSelf ? "items-end" : "items-start"}`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isSelf ? "bubble-self" : "bubble-other border border-border/40"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p
                        className={`text-[9px] sm:text-[10px] mt-1 text-right ${
                          isSelf ? "text-white/70" : "text-muted-foreground"
                        }`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Simulated Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs animate-fade-in">
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold">
                  {activePersona === "alex" ? "TS" : "AL"}
                </div>
                <div className="px-3 py-1.5 rounded-full bg-secondary flex items-center gap-1">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
          </div>

          {/* Simulator Input Footer */}
          <form onSubmit={handleSimSend} className="p-4 sm:p-4.5 border-t border-border/80 bg-card/90 flex items-center gap-2.5">
            <input
              type="text"
              placeholder={`Send message as ${activePersona === "alex" ? "Alex" : "Taylor"}...`}
              value={simInput}
              onChange={(e) => setSimInput(e.target.value)}
              className="flex-1 bg-secondary/80 border border-border/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />

            <button
              type="submit"
              disabled={!simInput.trim()}
              className="w-10 h-10 rounded-xl bg-primary hover:bg-primary-hover text-white disabled:opacity-40 transition-all active:scale-95 shadow-md shadow-primary/20 flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* 5. Feature Highlights Grid */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Engineered for Production Excellence
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mt-2">
            Every layer has been designed to solve real-world messaging challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-3xl bg-card border border-border/80 glass hover:border-primary/50 transition-all hover:scale-[1.02] shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Real-Time Synchronization</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Bi-directional Socket.io event loop with instantaneous delivery of incoming messages, background tab synchronization, and automatic fallback polling.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-3xl bg-card border border-border/80 glass hover:border-indigo-500/50 transition-all hover:scale-[1.02] shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Group Governance & Hierarchy</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Rich group rooms with 3+ member creation validation, creator-initiated admin rights, member promotions, room renames, and graceful member departure.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-3xl bg-card border border-border/80 glass hover:border-purple-500/50 transition-all hover:scale-[1.02] shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Smart Scroll Continuity</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Maintains scroll position when reading earlier history without forced snapping. Floating unread pill keeps users informed of new incoming traffic.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Architecture & Event Loop Showcase */}
      <section id="architecture" className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="rounded-3xl bg-card border border-border/80 p-8 glass shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-border">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Architecture</span>
              <h3 className="text-xl font-bold text-foreground mt-1">Dual-Engine Client Pipeline</h3>
            </div>
            <Link
              href="/docs"
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <span>View Full REST Spec</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/50">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-1">
                <Lock className="w-4 h-4 text-primary" />
                <span>Auth Handshake</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                POST /api/auth/login returns JWT bearer used in both REST headers and Socket.io handshake auth.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/50">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-1">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Socket.io Events</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                message:send, message:new, conversation:updated broadcast in real-time across connected clients.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/50">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-1">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Cursor Pagination</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                GET /api/conversations/:id/messages with `before` cursor and client-side message deduplication.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/50">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-1">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>Audio Engine</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Web Audio API synthesized chimes and simulated voice note player waveforms without asset dependencies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer CTA */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-foreground">PulseChat Platform</span>
          <span>· Candidate Assignment Deliverable</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/chat" className="hover:text-primary transition-colors">
            Chat App
          </Link>
          <Link href="/docs" className="hover:text-primary transition-colors">
            API Documentation
          </Link>
          <Link href="/login" className="hover:text-primary transition-colors">
            Sign In
          </Link>
        </div>
      </footer>
    </div>
  );
}
