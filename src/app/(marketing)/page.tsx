"use client";

import Link from "next/link";
import { 
  Code2, 
  Sparkles, 
  Mail, 
  Instagram, 
  Zap, 
  ArrowRight, 
  CheckCircle2,
  Cpu,
  BarChart3,
  Lock,
  Network,
  Workflow,
  Radio,
  Share2
} from "lucide-react";
import { LandingNavbar } from "@/components/shared/navbar";

const CAPACITIES = [
  {
    icon: Mail,
    tag: "NEURAL WRITING",
    title: "Real-Time Email Triage",
    desc: "Instant Gmail and Outlook event ingestion with autonomous thread summaries, priority categorization, and context-aware reply drafting.",
  },
  {
    icon: Code2,
    tag: "GHOST CODE",
    title: "Engineering AI Workspace",
    desc: "Syntax diagnosis, AST code review, automated PR descriptions, and conventional git commit message generation directly in your workflow.",
  },
  {
    icon: Instagram,
    tag: "SYNAPTIC SOCIAL",
    title: "Instagram Intelligence",
    desc: "Live comment tracking, high-retention video hooks, viral caption architecture, and algorithmic hashtag strategy.",
  },
  {
    icon: BarChart3,
    tag: "LEAD RADAR",
    title: "Business Intelligence",
    desc: "Inbound customer sentiment analysis, automated lead qualification, and executive operational briefing generators.",
  },
  {
    icon: Lock,
    tag: "PROTOCOL S",
    title: "Secure Multi-Tenancy",
    desc: "Strict user-scoped data isolation via Supabase Postgres RLS, server-side secret management, and zero client-side credential exposure.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Universal Account Ingestion",
    desc: "Connect your Gmail, Microsoft Outlook, and Instagram via secure OAuth2. Cloud Pub/Sub and MS Graph webhooks capture incoming events instantaneously.",
    icon: Share2,
  },
  {
    step: "02",
    title: "Supabase Realtime Pipeline",
    desc: "Events stream into encrypted Postgres rows. Supabase Realtime CDC pushes live updates over WebSockets directly to your client with zero manual refresh or polling.",
    icon: Radio,
  },
  {
    step: "03",
    title: "Google Gemini Multimodal AI",
    desc: "Requests are processed server-side through Gemini 1.5 Flash/Pro with sub-second execution, role-specific prompts, and atomic token quota tracking.",
    icon: Cpu,
  },
  {
    step: "04",
    title: "Intelligent AI Automation",
    desc: "Unlock dedicated automated drafts, code reviews, social content strategies, and operational intelligence pipelines in one unified interface.",
    icon: Workflow,
  },
];

const PRICING_PLANS = [
  {
    name: "Free Starter",
    price: "₹0",
    period: "forever",
    description: "Perfect for exploring AI workflows and testing realtime inbox sync.",
    tokens: "10,000 Gemini Tokens / mo",
    features: [
      "10,000 Gemini AI Tokens/month",
      "1 Connected Email Account (Gmail / Outlook)",
      "Real-Time Event Ingestion",
      "Standard Supabase Realtime Sync",
      "Community Support",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro Creator & Dev",
    price: "₹799",
    period: "per month",
    description: "Designed for power developers, creators, and professionals needing higher throughput.",
    tokens: "250,000 Gemini Tokens / mo",
    features: [
      "250,000 Gemini AI Tokens/month",
      "Unlimited Gmail & Outlook Inboxes",
      "Instagram Business Graph API Integration",
      "Priority Realtime WebSocket Stream",
      "Advanced Code Review & Scriptwriting Tools",
      "Razorpay Instant Quota Top-ups",
    ],
    cta: "Initiate Pro",
    popular: true,
  },
  {
    name: "Business Suite",
    price: "₹2,499",
    period: "per month",
    description: "Complete AI workspace for founders, teams, and high-volume business intelligence operations.",
    tokens: "1,000,000 Gemini Tokens / mo",
    features: [
      "1,000,000 Gemini AI Tokens/month",
      "Multi-Account Sync (Gmail, Outlook, Instagram)",
      "Customer Ticket Sentiment & Lead Qualification",
      "Custom Gemini System Directives",
      "Dedicated High-Throughput Token Quota",
      "Priority 24/7 SLA Support",
    ],
    cta: "Get Business Suite",
    popular: false,
  },
];

export default function MarketingLandingPage() {
  return (
    <div className="min-h-screen bg-[#050713] text-slate-100 selection:bg-purple-600 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Landing Navbar */}
      <LandingNavbar />

      {/* Hero Section */}
      <section id="overview" className="relative px-6 pt-16 pb-24 md:pt-24 md:pb-36">
        {/* Background glow effects */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[550px] w-[850px] bg-gradient-to-b from-purple-900/20 via-indigo-900/10 to-transparent blur-[120px]" />
        <div className="pointer-events-none absolute right-10 top-32 h-[350px] w-[350px] bg-purple-600/10 blur-[100px]" />

        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/40 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-purple-300 shadow-sm shadow-purple-500/20">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>Next Generation AI Connectome</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
                Build AI Workflows <br />
                <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-300 bg-clip-text text-transparent drop-shadow-sm">
                  Faster Than Ever
                </span>
              </h1>

              {/* Subtitle describing what the SaaS does */}
              <p className="max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
                Transform ideas into intelligent workflows with AI that understands documents, code, research, and communication across your entire digital ecosystem.
              </p>

              {/* Hero Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-purple-600/40 border border-purple-400/30 transition-all hover:scale-105 hover:shadow-purple-600/60"
                >
                  Enter Console <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/60 px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-slate-300 transition-all hover:border-purple-500/50 hover:bg-slate-800/80 hover:text-white"
                >
                  View Protocol
                </Link>
              </div>

              {/* Bottom Quick Metric Pills */}
              <div className="flex flex-wrap items-center gap-6 pt-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400" />
                  <span>Real-Time Supabase Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400" />
                  <span>10,000 Free Starter Tokens</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400" />
                  <span>Zero Polling Latency</span>
                </div>
              </div>
            </div>

            {/* Right Hero Interactive Visual Graphics */}
            <div className="lg:col-span-5 relative flex items-center justify-center min-h-[380px]">
              <div className="relative h-80 w-80 sm:h-96 sm:w-96 flex items-center justify-center">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-[spin_25s_linear_infinite]" />
                <div className="absolute inset-6 rounded-full border border-dashed border-indigo-500/30 animate-[spin_35s_linear_infinite_reverse]" />
                <div className="absolute inset-16 rounded-full border border-purple-400/20" />

                {/* Glowing Center Core */}
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-800 p-0.5 shadow-2xl shadow-purple-600/50 border border-purple-300/40">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#07091a]">
                    <Sparkles className="h-10 w-10 text-purple-300 animate-pulse" />
                  </div>
                </div>

                {/* Floating Metric Badge 1 */}
                <div className="absolute -top-4 right-0 rounded-2xl border border-purple-500/30 bg-[#0c0e24]/90 p-3.5 shadow-xl shadow-purple-950/40 backdrop-blur-md">
                  <div className="text-base font-extrabold text-white">500K+</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                    Active Architects
                  </div>
                </div>

                {/* Floating Metric Badge 2 */}
                <div className="absolute -bottom-4 left-0 rounded-2xl border border-indigo-500/30 bg-[#0c0e24]/90 p-3.5 shadow-xl shadow-purple-950/40 backdrop-blur-md">
                  <div className="text-base font-extrabold text-white">50M+</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Tokens Processed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capacities Section */}
      <section id="capabilities" className="relative border-t border-slate-800/80 bg-[#060817]/60 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-left mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Core Capacities
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Modular intelligence for every vertical of your enterprise.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {CAPACITIES.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div
                  key={idx}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[#090c22]/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/40 hover:bg-[#0c102e] hover:shadow-xl hover:shadow-purple-600/10"
                >
                  <div className="space-y-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-950/60 text-purple-400 border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                        {cap.tag}
                      </div>
                      <h3 className="mt-1 text-base font-bold text-white leading-snug">
                        {cap.title}
                      </h3>
                      <p className="mt-2.5 text-xs text-slate-400 leading-relaxed font-normal">
                        {cap.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Will Be Done — System Architecture & Workflow */}
      <section id="how-it-works" className="relative border-t border-slate-800/80 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-300 mb-4">
              <Network className="h-3.5 w-3.5 text-indigo-400" /> Pipeline & Execution
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              How It Works
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
              Engineered with an asynchronous event-driven architecture combining Google Cloud Pub/Sub, Supabase Realtime CDC, and Google Gemini multimodal reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-[#080b20]/60 p-6 backdrop-blur"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-2xl font-black text-slate-700">
                        {step.step}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{step.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing & Quota Section */}
      <section id="pricing" className="relative border-t border-slate-800/80 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/40 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-purple-300 mb-4">
              <Zap className="h-3.5 w-3.5 text-purple-400" /> Transparent Quotas
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Predictable Pricing & Plans
            </h2>
            <p className="mt-4 text-sm text-slate-400">
              Start with free Gemini API tokens. Upgrade seamlessly via Razorpay whenever you need more bandwidth.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {PRICING_PLANS.map((plan, idx) => (
              <div
                key={idx}
                className={`relative flex flex-col justify-between rounded-3xl border p-8 transition-all duration-300 ${
                  plan.popular
                    ? "border-purple-500/60 bg-[#0d102e]/90 shadow-2xl shadow-purple-600/20 ring-1 ring-purple-500/30"
                    : "border-slate-800/80 bg-[#080a1d]/80"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-md shadow-purple-600/40">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <div className="rounded-xl bg-purple-950/60 p-2 text-purple-400 border border-purple-500/20">
                      <Zap className="h-4 w-4" />
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">{plan.description}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-xs font-medium text-slate-400">/{plan.period}</span>
                  </div>

                  <div className="mt-2 text-xs font-bold text-purple-400">
                    {plan.tokens}
                  </div>

                  <div className="my-6 border-t border-slate-800/80" />

                  <ul className="space-y-3">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-purple-400 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <Link
                    href={plan.price === "₹0" ? "/sign-up" : "/settings/billing"}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-xs font-bold uppercase tracking-widest transition-all ${
                      plan.popular
                        ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-lg shadow-purple-600/30 hover:scale-102 hover:shadow-purple-600/50"
                        : "border border-slate-700 bg-slate-800 text-slate-200 hover:border-purple-500 hover:bg-purple-600 hover:text-white"
                    }`}
                  >
                    {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="relative border-t border-slate-800/80 px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-[#0c0e28] p-10 md:p-16 text-center relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.15),transparent_70%)]" />

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Supercharge Your AI Workflows?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-slate-300">
            Join thousands of developers, creators, and professionals using Aetheris AI to streamline their inboxes, codebases, and social channels.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-purple-600/40 border border-purple-400/40 transition-all hover:scale-105"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#04060f] px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-bold tracking-wider text-slate-400 uppercase">
            <Sparkles className="h-4 w-4 text-purple-400" /> AETHERIS AI
          </div>
          <p>© 2026 Aetheris AI Workspace SaaS. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/settings/billing" className="hover:text-slate-300 transition-colors">
              Pricing
            </Link>
            <Link href="/sign-in" className="hover:text-slate-300 transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="hover:text-slate-300 transition-colors">
              Initiate
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
