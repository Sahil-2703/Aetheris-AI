"use client";

import { useState } from "react";
import { 
  Code2, 
  Bug, 
  Zap, 
  GitCommit, 
  GitPullRequest, 
  Play, 
  RotateCcw, 
  Check, 
  Copy, 
  Sparkles,
  Terminal,
  FileCode,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { NeuralWorkspace, PersonaMode } from "./neural-workspace";

const DEVELOPER_MODES: PersonaMode[] = [
  {
    id: "general",
    name: "General Assistance",
    icon: Sparkles,
    placeholder: "Enter custom parameters for ⚙ General Assistance...",
    defaultPrompt: "Explain how to structure asynchronous database connection pools in Next.js 15 App Router",
    apiEndpoint: "/api/ai/chat",
  },
  {
    id: "debug",
    name: "Error & Bug Explainer",
    icon: Bug,
    placeholder: "Paste error log or stack trace with code to explain and fix...",
    defaultPrompt: "TypeError: Cannot read properties of undefined (reading 'user_id') in Next.js Server Action",
    apiEndpoint: "/api/ai/code-review",
  },
  {
    id: "optimize",
    name: "Code Optimization",
    icon: Zap,
    placeholder: "Paste working code snippet to refactor for performance and readability...",
    defaultPrompt: "Optimize this SQL query with joins and indexes for 1M+ rows",
    apiEndpoint: "/api/ai/code-review",
  },
  {
    id: "commit",
    name: "Conventional Commit Gen",
    icon: GitCommit,
    placeholder: "Paste code diff or feature summary to generate semantic commit messages...",
    defaultPrompt: "Added Supabase PostgreSQL connection pool with URL decoding and error handling",
    apiEndpoint: "/api/ai/code-review",
  },
  {
    id: "pr",
    name: "PR Summarizer",
    icon: GitPullRequest,
    placeholder: "Paste git diff or list of changes to draft an engineering Pull Request summary...",
    defaultPrompt: "feat(auth): integrate Better Auth with Supabase Postgres pool and role-based onboarding",
    apiEndpoint: "/api/ai/code-review",
  },
];

export function DeveloperWidget() {
  const [codeSnippet, setCodeSnippet] = useState(`// Example TypeScript Function
async function processEvent(event: any) {
  const result = await db.query("SELECT * FROM events WHERE id = " + event.id);
  return result;
}`);
  const [activeTab, setActiveTab] = useState<"workspace" | "self_healing" | "history">("workspace");
  const [healingStatus, setHealingStatus] = useState<{
    isRunning: boolean;
    step: number;
    logs: string[];
    success: boolean;
  }>({
    isRunning: false,
    step: 0,
    logs: [],
    success: false,
  });

  const handleRunSelfHealing = () => {
    setHealingStatus({
      isRunning: true,
      step: 1,
      logs: ["🔍 [Daemon]: Capturing modified code in virtual sandbox..."],
      success: false,
    });

    setTimeout(() => {
      setHealingStatus((prev) => ({
        ...prev,
        step: 2,
        logs: [
          ...prev.logs,
          "⚠️ [Test Runner]: Typecheck failure detected: TS2339 (property 'id' does not exist on type 'any')",
          "⚡ [LLM Reasoning]: Synthesizing strict interface definition & SQL parameterized query...",
        ],
      }));
    }, 1200);

    setTimeout(() => {
      setHealingStatus((prev) => ({
        ...prev,
        step: 3,
        logs: [
          ...prev.logs,
          "🔄 [Sandbox]: Re-running `npx tsc --noEmit` on patched AST...",
          "✅ [Self-Healing Engine]: Deterministic verification exited with code 0! Patch verified.",
        ],
        isRunning: false,
        success: true,
      }));
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tab Selector */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("workspace")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition-all ${
            activeTab === "workspace"
              ? "border border-purple-500/40 bg-purple-950/50 text-purple-300 shadow-md shadow-purple-950/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#090c24]"
          }`}
        >
          <Code2 className="h-4 w-4" />
          <span>Neural Workspace</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("self_healing")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition-all ${
            activeTab === "self_healing"
              ? "border border-cyan-500/40 bg-cyan-950/50 text-cyan-300 shadow-md shadow-cyan-950/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#090c24]"
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          <span>Self-Healing Daemon (BETA)</span>
        </button>
      </div>

      {activeTab === "workspace" && (
        <NeuralWorkspace
          roleTitle="DEVELOPER"
          modes={DEVELOPER_MODES}
          initialPrompt="generate a intro script for a gaming channel"
          initialOutput={`// Aetheris AI Developer Solution
import { Pool } from 'pg';

export function createDatabasePool(connectionString: string): Pool {
  const url = new URL(connectionString);
  return new Pool({
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    host: url.hostname,
    port: Number(url.port) || 5432,
    database: url.pathname.replace(/^\\//, ''),
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
  });
}`}
        />
      )}

      {activeTab === "self_healing" && (
        <div className="rounded-3xl border border-cyan-500/30 bg-[#080a1e]/90 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                AUTONOMOUS LOOP ENGINE (BETA)
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                Perceive → Reason → Act → Deterministic Verify
              </h3>
            </div>

            <button
              type="button"
              onClick={handleRunSelfHealing}
              disabled={healingStatus.isRunning}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-4 py-2.5 text-xs font-mono font-bold text-white shadow-lg shadow-cyan-600/30 border border-cyan-400/40 hover:scale-105 transition-all disabled:opacity-50"
            >
              {healingStatus.isRunning ? (
                <RotateCcw className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Play className="h-4 w-4 text-white" />
              )}
              <span>{healingStatus.isRunning ? "Executing Loop..." : "Run Self-Healing Sandbox"}</span>
            </button>
          </div>

          {/* Sandbox Live Log Terminal */}
          <div className="mt-5 rounded-2xl border border-slate-800 bg-[#050713] p-4 font-mono text-xs text-slate-300 min-h-[160px] space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[11px] pb-2 border-b border-slate-800/80">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Terminal className="h-3.5 w-3.5" /> DAEMON LOG STREAM
              </span>
              <span>Loop Attempts: N=8 Max</span>
            </div>

            {healingStatus.logs.length === 0 ? (
              <p className="text-slate-500 italic pt-4">
                Daemon idle. Click &quot;Run Self-Healing Sandbox&quot; to test autonomous test runner &amp; AST error patching loop.
              </p>
            ) : (
              healingStatus.logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed animate-in fade-in duration-200">
                  <span className="text-cyan-500 shrink-0">›</span>
                  <span className={log.includes("✅") ? "text-emerald-400 font-bold" : log.includes("⚠️") ? "text-amber-300" : "text-slate-300"}>
                    {log}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
