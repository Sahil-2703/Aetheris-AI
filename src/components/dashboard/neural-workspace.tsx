"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Cpu, 
  Terminal, 
  RotateCcw,
  User
} from "lucide-react";
import { useChat } from "@/lib/chat-context";

export interface PersonaMode {
  id: string;
  name: string;
  icon: any;
  placeholder: string;
  defaultPrompt?: string;
  systemInstruction?: string;
  apiEndpoint?: string;
}

interface NeuralWorkspaceProps {
  roleTitle: string; // e.g. "DEVELOPER", "CONTENT CREATOR", "EMPLOYEE", "BUSINESS"
  modes: PersonaMode[];
  initialPrompt?: string;
  initialOutput?: string;
  onExecute?: (modeId: string, input: string) => Promise<{ output: string; tokens?: { total: number } }>;
}

export function NeuralWorkspace({
  roleTitle,
  modes,
  onExecute,
}: NeuralWorkspaceProps) {
  const { activeThread, appendMessageToActiveThread } = useChat();

  const [activeMode, setActiveMode] = useState<PersonaMode>(modes[0]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [tokenUsage, setTokenUsage] = useState<{ used: number; limit: number }>({
    used: 1250,
    limit: 10000,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation stream when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages, loading]);

  const handleRunPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;
    const query = inputQuery.trim() || activeMode.defaultPrompt || "Execute operation";
    if (!query) return;

    setLoading(true);

    try {
      let outputText = "";
      if (onExecute) {
        const res = await onExecute(activeMode.id, query);
        outputText = res.output;
        if (res.tokens?.total) {
          setTokenUsage((prev) => ({
            ...prev,
            used: prev.used + (res.tokens?.total || 150),
          }));
        }
      } else {
        // Fallback default API execution
        const res = await fetch(activeMode.apiEndpoint || "/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: query,
            code: query,
            topic: query,
            content: query,
            mode: activeMode.id,
            conversationId: activeThread?.id,
            threadId: activeThread?.id,
          }),
        });

        const data = await res.json();
        outputText =
          data.reply ||
          data.output ||
          data.review ||
          data.script ||
          data.caption ||
          data.draft ||
          data.text ||
          data.error ||
          "Neural response generated successfully.";

        if (data.tokens?.total) {
          setTokenUsage((prev) => ({
            ...prev,
            used: prev.used + data.tokens.total,
          }));
        }
      }

      // Preserve conversation: append new turn to thread history
      appendMessageToActiveThread(query, outputText);
    } catch (err: any) {
      const errText = `⚠️ Operation error: ${err.message || "Failed to contact Gemini Decision Core."}`;
      appendMessageToActiveThread(query, errText);
    } finally {
      setLoading(false);
      setInputQuery("");
    }
  };

  const handleCopy = (id: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeMessages = (Array.isArray(activeThread?.messages) ? activeThread.messages : []).filter(
    (msg) =>
      !msg.content.includes("Aetheris AI Decision Core ready") &&
      !msg.content.includes("Neural Decision Core initialized")
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 relative pb-4">
      {/* 1. ACTIVE NEURAL RESPONDER & CONVERSATION HISTORY (Only displayed when there are messages or loading) */}
      {(activeMessages.length > 0 || loading) && (
        <div className="relative rounded-3xl border border-purple-500/30 bg-[#080a1e]/90 p-6 shadow-2xl shadow-purple-950/40 backdrop-blur-xl transition-all space-y-6">
          {/* Card Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div>
              <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                ACTIVE NEURAL RESPONDER
              </div>
              <h2 className="text-lg font-mono font-bold text-white tracking-wide truncate max-w-md mt-0.5">
                {activeThread?.title || "Active Session"}
              </h2>
            </div>

            {/* Core Badge */}
            <div className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/30 px-3.5 py-1.5 text-[11px] font-mono font-bold tracking-wider text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Cpu className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span>AETHERIS AI DECISION CORE (GEMINI-3.6-FLASH)</span>
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="space-y-6 max-h-[520px] overflow-y-auto pr-1.5 custom-scrollbar">
            {activeMessages.map((msg) => (
              <div key={msg.id} className="space-y-3">
                {msg.role === "user" ? (
                  /* User Prompt Box (Violet Glow Box) */
                  <div className="rounded-2xl border border-purple-500/30 bg-[#120f38]/70 p-4 shadow-inner">
                    <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider text-purple-400 font-semibold uppercase mb-1">
                      <User className="h-3 w-3" />
                      <span>USER PROMPT</span>
                    </div>
                    <p className="text-xs sm:text-sm font-mono text-purple-100 leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                ) : (
                  /* AI Output Stream Box */
                  <div className="rounded-2xl border border-slate-800/90 bg-[#050713]/90 p-4 relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider text-cyan-400 font-bold uppercase">
                        <Terminal className="h-3.5 w-3.5" />
                        <span>NEURAL COGNITION OUTPUT</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    <div className="text-xs sm:text-sm font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator for New Prompt Stream */}
            {loading && (
              <div className="rounded-2xl border border-slate-800/90 bg-[#050713]/90 p-4">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
                  <Terminal className="h-3.5 w-3.5 animate-spin" />
                  <span>Synthesizing response through Gemini Decision Core</span>
                  <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse">▌</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Card Footer Bar */}
          <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-slate-400 tracking-wider pt-2 border-t border-slate-800/60">
            <div>PLAN: <span className="text-purple-300 font-bold">FREE</span></div>
            <div>
              TOKEN USAGE: <span className="text-cyan-400 font-bold">{tokenUsage.used.toLocaleString()}</span> / {tokenUsage.limit.toLocaleString()} LIMIT
            </div>
          </div>
        </div>
      )}

      {/* 2. BOTTOM CARD: CONFIGURE ACTIVE PERSONA PROMPT OPTIONS (STATIC & PINNED AT BOTTOM) */}
      <div className="sticky bottom-2 sm:bottom-4 z-30 rounded-3xl border border-purple-500/40 bg-[#080a1e]/95 p-5 sm:p-6 shadow-[0_-10px_30px_rgba(5,7,19,0.9)] backdrop-blur-2xl overflow-hidden ring-1 ring-purple-500/30 transition-all">
        {/* Cyber Sparkle Decorative Watermark (Top Right) */}
        <div className="absolute top-4 right-5 pointer-events-none opacity-20 text-purple-400">
          <Sparkles className="h-16 w-16" />
        </div>

        <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400 mb-3">
          CONFIGURE ACTIVE PERSONA PROMPT OPTIONS ({roleTitle})
        </div>

        {/* Persona Mode Switcher Pills */}
        <div className="flex flex-wrap gap-2.5 mb-4">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = activeMode.id === mode.id;

            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  setActiveMode(mode);
                  if (mode.defaultPrompt) {
                    setInputQuery(mode.defaultPrompt);
                  }
                }}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-mono font-medium transition-all ${
                  isSelected
                    ? "border border-purple-400/80 bg-purple-950/60 text-purple-200 shadow-md shadow-purple-900/40 ring-1 ring-purple-400/40"
                    : "border border-slate-800 bg-[#050713]/80 text-slate-400 hover:border-purple-500/40 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-purple-300" : "text-slate-400"}`} />
                <span>{mode.name}</span>
              </button>
            );
          })}
        </div>

        {/* Input Bar Form */}
        <form onSubmit={handleRunPrompt} className="relative">
          <div className="relative flex items-center rounded-2xl border border-purple-500/40 bg-[#050713]/95 shadow-inner focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-400/30">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={activeMode.placeholder}
              className="w-full bg-transparent px-4 py-3.5 text-xs sm:text-sm font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none pr-14"
            />

            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-700 text-white shadow-md shadow-purple-600/40 border border-purple-400/40 transition-all hover:scale-105 hover:shadow-purple-600/60 disabled:opacity-50"
            >
              {loading ? (
                <RotateCcw className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Send className="h-4 w-4 text-white" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
