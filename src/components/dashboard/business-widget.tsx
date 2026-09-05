"use client";

import { useState } from "react";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Code2, 
  Sparkles, 
  Mail, 
  BarChart3, 
  CheckCircle,
  FileCheck,
  ShieldCheck
} from "lucide-react";
import { NeuralWorkspace, PersonaMode } from "./neural-workspace";
import { DeveloperWidget } from "./developer-widget";
import { ContentCreatorWidget } from "./content-creator-widget";
import { EmployeeWidget } from "./employee-widget";

const BUSINESS_MODES: PersonaMode[] = [
  {
    id: "general",
    name: "Executive Summary AI",
    icon: Building2,
    placeholder: "Enter company metrics, weekly notes, or goals to generate an executive briefing...",
    defaultPrompt: "Summarize Q3 SaaS MRR growth, churn rates, and engineering throughput for the executive board",
    apiEndpoint: "/api/ai/chat",
  },
  {
    id: "lead",
    name: "Inbound Lead Qualifier",
    icon: Users,
    placeholder: "Paste customer lead form or inquiry to calculate qualification score and deal potential...",
    defaultPrompt: "Inbound inquiry from 500-employee fintech asking for custom SSO and SOC2 compliance report",
    apiEndpoint: "/api/ai/chat",
  },
  {
    id: "sentiment",
    name: "Customer Sentiment Radar",
    icon: TrendingUp,
    placeholder: "Paste feedback batch, reviews, or support notes to compute Net Sentiment Index...",
    defaultPrompt: "Analyze 20 recent customer support tickets regarding billing onboarding and API rate limits",
    apiEndpoint: "/api/ai/chat",
  },
];

const LEADS = [
  {
    id: "l1",
    company: "Fintech Global Inc.",
    contact: "elena.vp@fintechglobal.com",
    teamSize: "250-500",
    budget: "$45,000 / yr",
    fitScore: 98,
    status: "QUALIFIED - HIGH TIER",
  },
  {
    id: "l2",
    company: "AeroGrowth Agency",
    contact: "marcus@aerogrowth.io",
    teamSize: "25-50",
    budget: "$12,000 / yr",
    fitScore: 89,
    status: "QUALIFIED - STANDARD",
  },
  {
    id: "l3",
    company: "Independent Blog",
    contact: "info@solocreator.blog",
    teamSize: "1",
    budget: "< $500",
    fitScore: 42,
    status: "NURTURE - SELF SERVE",
  },
];

export function BusinessWidget() {
  const [activeTab, setActiveTab] = useState<"executive" | "leads" | "dev_hub" | "creator_hub" | "ops_hub">("executive");

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tab Selector */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("executive")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition-all ${
            activeTab === "executive"
              ? "border border-purple-500/40 bg-purple-950/50 text-purple-300 shadow-md shadow-purple-950/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#090c24]"
          }`}
        >
          <Building2 className="h-4 w-4 text-purple-400" />
          <span>Executive Intelligence Hub</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("leads")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition-all ${
            activeTab === "leads"
              ? "border border-cyan-500/40 bg-cyan-950/50 text-cyan-300 shadow-md shadow-cyan-950/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#090c24]"
          }`}
        >
          <Users className="h-4 w-4 text-cyan-400" />
          <span>Inbound Lead Qualifier</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dev_hub")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition-all ${
            activeTab === "dev_hub"
              ? "border border-indigo-500/40 bg-indigo-950/50 text-indigo-300 shadow-md shadow-indigo-950/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#090c24]"
          }`}
        >
          <Code2 className="h-4 w-4 text-indigo-400" />
          <span>Developer Tools</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("creator_hub")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition-all ${
            activeTab === "creator_hub"
              ? "border border-pink-500/40 bg-pink-950/50 text-pink-300 shadow-md shadow-pink-950/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#090c24]"
          }`}
        >
          <Sparkles className="h-4 w-4 text-pink-400" />
          <span>Content Studio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ops_hub")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition-all ${
            activeTab === "ops_hub"
              ? "border border-emerald-500/40 bg-emerald-950/50 text-emerald-300 shadow-md shadow-emerald-950/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#090c24]"
          }`}
        >
          <Mail className="h-4 w-4 text-emerald-400" />
          <span>Email &amp; Ops</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "executive" && (
        <NeuralWorkspace
          roleTitle="BUSINESS & EXECUTIVE"
          modes={BUSINESS_MODES}
          initialPrompt="Summarize Q3 SaaS MRR growth, churn rates, and engineering throughput for the executive board"
          initialOutput={`📊 EXECUTIVE BRIEFING - Q3 PERFORMANCE & REVENUE METRICS

1. REVENUE TRAJECTORY:
   - MRR grew +24.6% to $148,500 with zero net retention drag.
   - Enterprise conversion velocity shortened from 18 to 9 days.

2. OPERATIONAL HEALTH:
   - Customer Sentiment Index: 92/100 (Up +8 points QoQ).
   - Inbound lead qualification efficiency improved by 64% via autonomous pipeline triage.

3. STRATEGIC RECOMMENDATIONS:
   - Finalize SOC2 compliance pack to unlock 3 enterprise deals pending in pipeline ($120k ARR).`}
        />
      )}

      {activeTab === "leads" && (
        <div className="rounded-3xl border border-purple-500/30 bg-[#080a1e]/90 p-6 shadow-2xl shadow-purple-950/40 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                LEAD QUALIFICATION PIPELINE
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">Automated Client Triage &amp; Deal Fit Scoring</h3>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {LEADS.map((lead) => (
              <div
                key={lead.id}
                className="rounded-2xl border border-slate-800 bg-[#050713]/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{lead.company}</span>
                    <span className="text-xs text-slate-400">({lead.contact})</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>Team: {lead.teamSize}</span>
                    <span>•</span>
                    <span>Budget: {lead.budget}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase text-slate-500">AI Fit Score</div>
                    <div className="text-sm font-bold text-emerald-400">{lead.fitScore}% Match</div>
                  </div>
                  <span
                    className={`rounded-xl px-3 py-1 text-xs font-mono font-bold ${
                      lead.status.includes("HIGH")
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : lead.status.includes("STANDARD")
                        ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "dev_hub" && <DeveloperWidget />}
      {activeTab === "creator_hub" && <ContentCreatorWidget />}
      {activeTab === "ops_hub" && <EmployeeWidget />}
    </div>
  );
}
