"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ChevronLeft,
  Terminal,
  Send,
  CheckCircle2,
  Copy,
  Check,
  Globe,
  Radio,
  Shield,
  Layers,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface EndpointDoc {
  id: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  category: "Auth" | "Users" | "Conversations" | "Groups" | "Messages" | "System";
  summary: string;
  description: string;
  authRequired: boolean;
  requestBodySample?: object;
  responseBodySample: object;
  defaultPayload?: string;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    id: "health",
    method: "GET",
    path: "/health",
    category: "System",
    summary: "Health check",
    description: "Check server status and connectivity (root origin).",
    authRequired: false,
    responseBodySample: { status: "ok" },
  },
  {
    id: "login",
    method: "POST",
    path: "/api/auth/login",
    category: "Auth",
    summary: "Log in or register",
    description: "Authenticates existing phone or creates account automatically if new.",
    authRequired: false,
    requestBodySample: { phone: "+15551234567", name: "Ada Lovelace" },
    defaultPayload: JSON.stringify({ phone: "+15551234567", name: "Ada Lovelace" }, null, 2),
    responseBodySample: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      user: {
        _id: "6a8883d9e5d6aac97523781a",
        name: "Ada Lovelace",
        phone: "+15551234567",
        createdAt: "2026-08-21T16:59:05.368Z",
      },
    },
  },
  {
    id: "me",
    method: "GET",
    path: "/api/auth/me",
    category: "Auth",
    summary: "Current user profile",
    description: "Returns profile for authenticated bearer token.",
    authRequired: true,
    responseBodySample: {
      user: {
        _id: "6a8883d9e5d6aac97523781a",
        name: "Ada Lovelace",
        phone: "+15551234567",
        createdAt: "2026-08-21T16:59:05.368Z",
      },
    },
  },
  {
    id: "search",
    method: "GET",
    path: "/api/users/search?q=Ada",
    category: "Users",
    summary: "Search users by name or phone",
    description: "Find other registered users to start conversations with.",
    authRequired: true,
    responseBodySample: [
      {
        _id: "6a8883dae5d6aac975237825",
        name: "Bob Tester",
        phone: "+15550007241",
      },
    ],
  },
  {
    id: "list-convs",
    method: "GET",
    path: "/api/conversations",
    category: "Conversations",
    summary: "List conversations",
    description: "Returns direct and group conversations for the authenticated user.",
    authRequired: true,
    responseBodySample: {
      data: [
        {
          _id: "6a8883dfe5d6aac97523786b",
          type: "group",
          name: "Design & Frontend Squad",
          createdBy: "6a8883d9e5d6aac97523781a",
          admins: ["6a8883d9e5d6aac97523781a"],
          participants: [
            { _id: "6a8883d9e5d6aac97523781a", name: "Ada Lovelace", phone: "+15551234567" },
          ],
          updatedAt: "2026-08-21T17:00:00.000Z",
        },
      ],
    },
  },
  {
    id: "create-group",
    method: "POST",
    path: "/api/conversations/group",
    category: "Groups",
    summary: "Create a group conversation",
    description: "Requires at least 3 total members (at least 2 IDs in participantIds).",
    authRequired: true,
    requestBodySample: {
      name: "Engineering Core",
      participantIds: ["6a8883dae5d6aac975237825", "6a8883dee5d6aac975237859"],
    },
    defaultPayload: JSON.stringify(
      {
        name: "Engineering Core",
        participantIds: ["6a8883dae5d6aac975237825", "6a8883dee5d6aac975237859"],
      },
      null,
      2
    ),
    responseBodySample: {
      _id: "6a8883dfe5d6aac97523786b",
      type: "group",
      name: "Engineering Core",
      createdBy: "6a8883d9e5d6aac97523781a",
      admins: ["6a8883d9e5d6aac97523781a"],
      participants: [
        { _id: "6a8883d9e5d6aac97523781a", name: "Ada Lovelace", phone: "+15551234567" },
      ],
      createdAt: "2026-08-21T16:59:11.226Z",
    },
  },
  {
    id: "send-msg",
    method: "POST",
    path: "/api/messages",
    category: "Messages",
    summary: "Send a message",
    description: "Sends message to direct or group conversation. Broadcasts via WebSocket.",
    authRequired: true,
    requestBodySample: {
      conversationId: "6a8883dbe5d6aac975237832",
      text: "Hello from API Explorer!",
    },
    defaultPayload: JSON.stringify(
      {
        conversationId: "6a8883dbe5d6aac975237832",
        text: "Hello from API Explorer!",
      },
      null,
      2
    ),
    responseBodySample: {
      _id: "6a8883dce5d6aac97523783f",
      conversation: "6a8883dbe5d6aac975237832",
      sender: "6a8883d9e5d6aac97523781a",
      text: "Hello from API Explorer!",
      createdAt: "2026-08-21T16:59:08.352Z",
    },
  },
];

export default function DocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDoc>(ENDPOINTS[1]);
  const [customPayload, setCustomPayload] = useState<string>(selectedEndpoint.defaultPayload || "");
  const [tokenOverride, setTokenOverride] = useState<string>("");
  const [liveResponse, setLiveResponse] = useState<any>(null);
  const [liveStatus, setLiveStatus] = useState<number | null>(null);
  const [liveLatency, setLiveLatency] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const handleSelectEndpoint = (ep: EndpointDoc) => {
    setSelectedEndpoint(ep);
    setCustomPayload(ep.defaultPayload || "");
    setLiveResponse(null);
    setLiveStatus(null);
    setLiveLatency(null);
  };

  const executeLiveRequest = async () => {
    setIsExecuting(true);
    setLiveResponse(null);
    setLiveStatus(null);

    const startTime = performance.now();
    const isRootHealth = selectedEndpoint.path === "/health";
    const fullUrl = isRootHealth
      ? `https://frontend-task-chatapp.onrender.com/health`
      : `https://frontend-task-chatapp.onrender.com${selectedEndpoint.path}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = tokenOverride || (typeof window !== "undefined" ? localStorage.getItem("chat_token") : null);
    if (selectedEndpoint.authRequired && token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method: selectedEndpoint.method,
      headers,
    };

    if (selectedEndpoint.method !== "GET" && customPayload.trim()) {
      options.body = customPayload.trim();
    }

    try {
      const res = await fetch(fullUrl, options);
      const latency = Math.round(performance.now() - startTime);
      setLiveLatency(latency);
      setLiveStatus(res.status);

      try {
        const json = await res.json();
        setLiveResponse(json);
      } catch {
        setLiveResponse({ status: "ok" });
      }
    } catch (err: any) {
      setLiveLatency(Math.round(performance.now() - startTime));
      setLiveStatus(0);
      setLiveResponse({ error: err.message || "Network request failed" });
    } finally {
      setIsExecuting(false);
    }
  };

  const copyCurl = () => {
    const isRootHealth = selectedEndpoint.path === "/health";
    const fullUrl = isRootHealth
      ? `https://frontend-task-chatapp.onrender.com/health`
      : `https://frontend-task-chatapp.onrender.com${selectedEndpoint.path}`;

    let curl = `curl -X ${selectedEndpoint.method} "${fullUrl}"`;
    if (selectedEndpoint.authRequired) {
      curl += ` \\\n  -H "Authorization: Bearer <TOKEN>"`;
    }
    if (selectedEndpoint.method !== "GET" && customPayload.trim()) {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${customPayload.replace(/\n/g, "")}'`;
    }

    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    toast.success("cURL command copied to clipboard");
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "POST":
        return "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
      case "PATCH":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "DELETE":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      default:
        return "bg-secondary text-foreground";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Header */}
      <header className="h-16 px-6 border-b border-border/80 bg-card/80 glass flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mr-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Chat</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white shadow-md shadow-primary/20">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground">
                PulseChat API Explorer
              </h1>
              <p className="text-[10px] text-muted-foreground">Interactive REST & Socket.io Spec</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover transition-all"
          >
            <span>Launch Chat App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar: Endpoints list */}
        <aside className="w-full md:w-72 shrink-0 border-r border-border/80 bg-card/40 p-4 space-y-4 overflow-y-auto">
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Endpoints ({ENDPOINTS.length})
            </span>
          </div>

          <div className="space-y-1">
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-primary/15 border border-primary/40 shadow-sm"
                      : "hover:bg-secondary/60 border border-transparent"
                  }`}
                >
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getMethodBadgeClass(
                      ep.method
                    )}`}
                  >
                    {ep.method}
                  </span>
                  <div className="truncate flex-1">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {ep.summary}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">{ep.path}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* WebSocket Reference Card */}
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <Radio className="w-4 h-4 text-indigo-400" />
              <span>WebSocket (Socket.io)</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Connected at root origin with token in handshake auth:
            </p>
            <div className="font-mono text-[10px] bg-background/80 p-2 rounded-lg border border-border">
              io(&apos;https://...&apos;, &#123; auth: &#123; token &#125; &#125;)
            </div>
            <div className="text-[10px] text-muted-foreground space-y-0.5">
              <p>• <strong>client →</strong> message:send</p>
              <p>• <strong>server →</strong> message:new</p>
              <p>• <strong>server →</strong> conversation:updated</p>
            </div>
          </div>
        </aside>

        {/* Right Content: Interactive Request & Response Console */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span
                  className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${getMethodBadgeClass(
                    selectedEndpoint.method
                  )}`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="text-base font-mono font-semibold text-foreground">
                  {selectedEndpoint.path}
                </span>
                {selectedEndpoint.authRequired && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium">
                    <Shield className="w-3 h-3" />
                    <span>Bearer Auth</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{selectedEndpoint.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyCurl}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-medium text-foreground transition-colors"
              >
                {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCurl ? "Copied" : "Copy cURL"}</span>
              </button>

              <button
                onClick={executeLiveRequest}
                disabled={isExecuting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isExecuting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send Live Request</span>
              </button>
            </div>
          </div>

          {/* Request Payload Editor (for POST/PATCH) */}
          {selectedEndpoint.method !== "GET" && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Request Body (JSON)
              </label>
              <textarea
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
                rows={5}
                className="w-full font-mono text-xs p-3.5 rounded-2xl bg-secondary/50 border border-border/80 text-foreground focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
              />
            </div>
          )}

          {/* Live Response Panel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span>Live Response</span>
                {liveStatus !== null && (
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      liveStatus >= 200 && liveStatus < 300
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {liveStatus} {liveStatus === 200 ? "OK" : liveStatus === 201 ? "CREATED" : "ERROR"}
                  </span>
                )}
                {liveLatency !== null && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {liveLatency}ms
                  </span>
                )}
              </label>
            </div>

            <div className="rounded-2xl bg-card border border-border/80 p-4 font-mono text-xs overflow-x-auto shadow-inner min-h-[160px] glass">
              {liveResponse ? (
                <pre className="text-foreground leading-relaxed">
                  {JSON.stringify(liveResponse, null, 2)}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-center">
                  <Terminal className="w-6 h-6 opacity-40 mb-2" />
                  <p className="text-xs">Click &quot;Send Live Request&quot; to test this endpoint against the live server.</p>
                </div>
              )}
            </div>
          </div>

          {/* Expected Response Schema Reference */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Documented Schema / Spec Sample
            </label>
            <div className="rounded-2xl bg-secondary/30 border border-border/60 p-4 font-mono text-xs overflow-x-auto">
              <pre className="text-muted-foreground leading-relaxed">
                {JSON.stringify(selectedEndpoint.responseBodySample, null, 2)}
              </pre>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
