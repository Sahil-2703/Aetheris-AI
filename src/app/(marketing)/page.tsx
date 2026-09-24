"use client";

import { useState, useEffect } from "react";
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
  Share2,
  X,
  ExternalLink,
  Briefcase,
  ShieldCheck,
  Copy,
  Check,
  HelpCircle,
  Info,
  Terminal,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Bot
} from "lucide-react";
import { LandingNavbar } from "@/components/shared/navbar";

const CAPACITIES = [
  {
    icon: Mail,
    tag: "GMAIL AI & AUTO MAIL",
    title: "Real-Time Gmail AI & Auto Mail Response",
    desc: "Instant Gmail and Outlook ingestion with autonomous thread summaries, priority categorization, and context-aware auto mail response generation.",
  },
  {
    icon: Workflow,
    tag: "AI WORKFLOW ENGINE",
    title: "Autonomous AI Workflow Automation",
    desc: "Chain email triage, code diagnosis, AST reviews, PR descriptions, and social intelligence into unified automated AI workflows.",
  },
  {
    icon: Bot,
    tag: "GEMINI CHATBOT COGNITION",
    title: "Google Gemini Multimodal AI Assistant",
    desc: "Harness Google Gemini multimodal models for sub-second intelligence, outperforming standard ChatGPT chatbots with native inbox thread context.",
  },
  {
    icon: Zap,
    tag: "LOW COST SCALE",
    title: "Low Cost AI with 3-Day Refill",
    desc: "Affordable productivity starting at ₹0, with premium plans (₹199 & ₹499) backed by our signature 3-day automatic token refill engine.",
  },
  {
    icon: Lock,
    tag: "SECURE POSTGRES RLS",
    title: "Enterprise Multi-Tenant Security",
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
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Essential AI tools for individuals exploring intelligent email automation.",
    tokens: "5,000 Tokens • Auto-refills every 3 days",
    features: [
      "5,000 Gemini AI Tokens quota",
      "Automatic full refill every 3 days",
      "1 Connected Gmail Inbox",
      "Instant Email Summaries & Drafts",
      "Standard Response Speed",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Premium",
    price: "₹199",
    period: "month (or ₹1,964/yr • Save ~18%)",
    description: "Designed for active freelancers and professionals needing higher throughput.",
    tokens: "125,000 Tokens • Auto-refills every 3 days",
    features: [
      "125,000 Gemini AI Tokens quota",
      "Automatic full refill every 3 days",
      "Full Gmail Inbox Search & Pagination",
      "Priority Real-Time Event Sync",
      "Interactive Multi-Turn Prompt Refinements",
      "Razorpay Instant UPI & Card Checkout",
    ],
    cta: "Upgrade to Premium",
    popular: true,
  },
  {
    name: "Premium Pro",
    price: "₹499",
    period: "month (or ₹4,910/yr • Save ~18%)",
    description: "Complete high-throughput AI workspace for founders, executives, and power users.",
    tokens: "500,000 Tokens • Auto-refills every 3 days",
    features: [
      "500,000 Gemini AI Tokens quota",
      "Automatic full refill every 3 days",
      "VIP Fast-Lane AI Processing",
      "Deep Context Thread Extraction",
      "Custom Tone & Persona Adaptation",
      "Dedicated 24/7 SLA Priority Support",
    ],
    cta: "Upgrade to Pro",
    popular: false,
  },
];

const FAQS = [
  {
    question: "How does Aetheris AI work as a low cost Gmail AI for auto mail response?",
    answer: "Aetheris AI integrates directly with your Gmail inbox via secure Google OAuth2. When an email arrives, our smart mail AI engine analyzes the thread history, extracts key sender intent, and drafts a contextually accurate auto mail response in under 800ms. All plans offer an automatic token refill every 3 days, making it the most reliable, ultra low cost AI email solution available.",
    category: "Gmail AI & Auto Mail"
  },
  {
    question: "How does Aetheris AI workflow compare to ChatGPT and generic chatbots?",
    answer: "Standard chatbots like ChatGPT require tedious manual copying and pasting of long email threads back and forth into an external window, losing formatting, timestamps, and thread context. Aetheris AI is a dedicated AI workflow platform that synchronizes directly with your inbox. It understands Gmail search filters (from:, to:, keywords), retains continuous multi-turn thread history, and costs far less than a standard ChatGPT Plus subscription.",
    category: "AI Workflow vs ChatGPT"
  },
  {
    question: "Which AI models power Aetheris AI? Why Google Gemini?",
    answer: "Aetheris AI is powered by Google DeepMind's flagship Gemini multimodal models (Gemini 2.5 & 1.5 Flash / Pro). Gemini was natively trained for multimodal context ingestion, meaning it excels at extracting subtle nuances, business commitments, and action items in email threads with sub-second execution speeds.",
    category: "Google Gemini Intelligence"
  },
  {
    question: "Why is Aetheris AI considered the best low cost AI platform?",
    answer: "Unlike traditional AI tools that charge ₹1,600+ ($20+/month) with rigid token caps, Aetheris AI provides a 100% Free plan (5,000 tokens), Premium at just ₹199/month, and Premium Pro at ₹499/month. Crucially, all tiers feature an automated 3-day token refill engine that replenishes your used tokens every 72 hours even if you still have tokens remaining.",
    category: "Low Cost AI Pricing"
  },
  {
    question: "Can I refine the auto mail response using the AI chatbot workspace?",
    answer: "Yes! Once Aetheris AI generates an email summary and draft response, you can use the built-in multi-turn prompt box to chat with the AI assistant. Type instructions like 'make it more formal', 'offer an alternative meeting time on Wednesday', or 'ask for project documentation' to immediately refine the draft without losing thread context.",
    category: "Chatbot & Multi-Turn Refinement"
  },
  {
    question: "Is my Gmail inbox data safe, isolated, and private?",
    answer: "Yes, privacy and security are foundational. All user communications, prompts, and metadata are cryptographically isolated using Supabase PostgreSQL Row Level Security (RLS). We fully comply with the Google API Services User Data Policy (including Limited Use requirements) and never sell user data to third parties.",
    category: "Security & Privacy"
  }
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function MarketingLandingPage() {
  const [activeModal, setActiveModal] = useState<"about" | "terms" | "career" | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [aboutTab, setAboutTab] = useState<"workflow" | "structure" | "how_to_use" | "ai_engine" | "why_better">("workflow");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleCopyEmail = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText("devd34427@gmail.com");
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#050713] text-slate-100 selection:bg-purple-600 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Schema.org FAQPage Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

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
                <span>Low Cost Gmail AI &amp; Autonomous AI Workflow</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
                Autonomous AI Workflow <br />
                <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-300 bg-clip-text text-transparent drop-shadow-sm">
                  &amp; Smart Gmail AI
                </span>
              </h1>

              {/* Subtitle describing what the SaaS does */}
              <p className="max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
                Transform your inbox with instant <strong className="text-slate-200">auto mail response</strong>, smart <strong className="text-slate-200">Gmail AI triage</strong>, and multimodal <strong className="text-slate-200">Gemini chatbot</strong> automation. Outperform ChatGPT workflows at an unbeatable <strong className="text-slate-200">low cost</strong> with automatic 3-day token refills.
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
                  <span>Low Cost AI • 3-Day Auto Refill</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400" />
                  <span>Auto Mail Response &amp; Triage</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400" />
                  <span>Google Gemini Multimodal Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400" />
                  <span>5,000 Free Starter Tokens</span>
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

      {/* SEO & User FAQ Section */}
      <section id="faq" className="relative border-t border-slate-800/80 px-6 py-24 bg-[#040612]">
        <div className="pointer-events-none absolute left-1/3 top-10 h-72 w-72 bg-purple-600/10 blur-[110px]" />

        <div className="mx-auto max-w-4xl">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/40 px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-purple-300">
              <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
              <span>Knowledge Base &amp; FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-400">
              Clear answers about our <strong>low cost Gmail AI</strong>, <strong>auto mail response</strong> engine, and autonomous <strong>AI workflow</strong> capabilities powered by Google Gemini.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? "border-purple-500/50 bg-gradient-to-b from-[#090b22] to-[#060817] shadow-lg shadow-purple-950/40"
                      : "border-slate-800/80 bg-[#060817]/60 hover:border-slate-700"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pr-4">
                      <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-[10px] font-mono text-purple-300 w-fit shrink-0">
                        {faq.category}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                        {faq.question}
                      </h3>
                    </div>
                    <div className="shrink-0 text-purple-400 p-1 rounded-lg bg-slate-900/60 border border-slate-800">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-purple-500/20 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center text-xs text-slate-400">
            Have a custom workflow or enterprise question?{" "}
            <a
              href="mailto:devd34427@gmail.com"
              className="font-bold text-purple-400 hover:underline"
            >
              Contact our team at devd34427@gmail.com
            </a>
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

      {/* Comprehensive Footer Section */}
      <footer className="border-t border-purple-500/20 bg-[#03050c] px-6 pt-16 pb-12 text-slate-400 font-mono">
        <div className="mx-auto max-w-7xl">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
            {/* Col 1: Brand & Overview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-800 shadow-md shadow-purple-600/30 border border-purple-400/30">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-extrabold tracking-widest text-white uppercase">
                  AETHERIS <span className="text-purple-400">AI</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Next-generation autonomous intelligence ecosystem. Ingesting communication streams, synthesizing multimodal context with Google Gemini, and accelerating execution across your inbox and workflows.
              </p>
              <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Systems Operational
                </span>
                <span>Gemini Multimodal AI</span>
              </div>
            </div>

            {/* Col 2: About & Platform */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-purple-400" />
                <span>Architecture</span>
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button 
                    type="button"
                    onClick={() => { setActiveModal("about"); setAboutTab("workflow"); }}
                    className="hover:text-purple-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>About Aetheris AI</span>
                    <span className="rounded bg-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.5 font-bold">Deep Dive</span>
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => { setActiveModal("about"); setAboutTab("workflow"); }}
                    className="hover:text-purple-400 transition-colors text-left cursor-pointer"
                  >
                    AI Workflow Pipeline
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => { setActiveModal("about"); setAboutTab("ai_engine"); }}
                    className="hover:text-purple-400 transition-colors text-left cursor-pointer"
                  >
                    Gemini AI Engine
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => { setActiveModal("about"); setAboutTab("why_better"); }}
                    className="hover:text-purple-400 transition-colors text-left cursor-pointer text-purple-300"
                  >
                    Why We Are Better →
                  </button>
                </li>
                <li>
                  <a 
                    href="#faq"
                    className="hover:text-purple-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer text-slate-300"
                  >
                    <span>FAQ &amp; Knowledge Base</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Company & Connect */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-purple-400" />
                <span>Company</span>
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#pricing" className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
                    <span>Pricing Plans</span>
                    <span className="rounded bg-cyan-500/20 text-cyan-300 text-[9px] px-1.5 py-0.5 font-bold">3-Day Refill</span>
                  </a>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => setActiveModal("career")}
                    className="hover:text-purple-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Careers</span>
                    <span className="rounded bg-emerald-500/20 text-emerald-300 text-[9px] px-1.5 py-0.5 font-bold">We&apos;re Hiring</span>
                  </button>
                </li>
                <li>
                  <a
                    href="https://forms.gle/umDB4sQT1VzcVEXV7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-purple-400 transition-colors inline-flex items-center gap-1.5 text-purple-300 font-bold"
                  >
                    <span>Feedback Form</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li className="pt-1">
                  <div className="flex items-center gap-2">
                    <a 
                      href="mailto:devd34427@gmail.com" 
                      className="hover:text-purple-400 transition-colors flex items-center gap-1.5 text-slate-300"
                    >
                      <Mail className="h-3.5 w-3.5 text-purple-400" />
                      <span>devd34427@gmail.com</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      title="Copy email to clipboard"
                      className="text-slate-500 hover:text-white p-1 transition-colors"
                    >
                      {copiedEmail ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </li>
              </ul>
            </div>

            {/* Col 4: Trust, Ethics & Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                <span>Governance</span>
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button 
                    type="button"
                    onClick={() => setActiveModal("terms")}
                    className="hover:text-purple-400 transition-colors text-left cursor-pointer font-bold text-slate-300"
                  >
                    Terms and Condition
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => setActiveModal("terms")}
                    className="hover:text-purple-400 transition-colors text-left cursor-pointer"
                  >
                    AI Ethics & Legal Notice
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => setActiveModal("terms")}
                    className="hover:text-purple-400 transition-colors text-left cursor-pointer text-slate-400"
                  >
                    Data Storage & Knowledge Building
                  </button>
                </li>
                <li className="pt-1">
                  <span className="text-[10px] text-slate-500 leading-normal block border-l-2 border-purple-500/30 pl-2">
                    User data is stored securely in Supabase with RLS &amp; utilized for continuous knowledge building.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Middle and Bottom Copyright Section */}
          <div className="pt-8 flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-xs text-slate-300 font-medium">
              © 2026 Aetheris AI Technologies Inc. All rights reserved.
            </p>
            <p className="text-[11px] text-slate-500 max-w-md">
              Aetheris AI is an advanced agentic intelligence platform engineered with Google Gemini Multimodal Models and Supabase Realtime Architecture.
            </p>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL 1: ABOUT AETHERIS AI (Workflow, Structure, How to use, AI models) */}
      {/* ========================================================================= */}
      {activeModal === "about" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-purple-500/40 bg-[#080a1e] text-slate-200 shadow-2xl shadow-purple-950/60 overflow-hidden font-mono text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-[#050713]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">About Aetheris AI</h3>
                  <p className="text-[11px] text-slate-400">Architecture, Pipeline Workflow, AI Engine &amp; Strategic Superiority</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="flex border-b border-slate-800 bg-[#060817] px-4 overflow-x-auto">
              {[
                { id: "workflow", label: "1. The Workflow" },
                { id: "structure", label: "2. Structure & Tech Stack" },
                { id: "how_to_use", label: "3. How to Use" },
                { id: "ai_engine", label: "4. Which AI is Used" },
                { id: "why_better", label: "5. Why It's Stronger & Better" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAboutTab(tab.id as any)}
                  className={`py-3 px-4 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                    aboutTab === tab.id
                      ? "border-purple-500 text-purple-300 bg-purple-950/30"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 max-h-[65vh] leading-relaxed">
              {aboutTab === "workflow" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Workflow className="h-4 w-4 text-purple-400" />
                    <span>The Autonomous End-to-End Workflow</span>
                  </div>
                  <p className="text-slate-300">
                    Aetheris AI operates as an intelligent connective tissue between your primary communication protocols and deep generative intelligence. Here is how the end-to-end data pipeline functions:
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="rounded-2xl border border-purple-500/20 bg-[#050713] p-4 space-y-1">
                      <div className="flex items-center gap-2 text-purple-400 font-bold">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-[10px]">1</span>
                        <span>Inbound Event Ingestion</span>
                      </div>
                      <p className="text-slate-400 pl-7 text-[11px]">
                        Emails from your connected Gmail inbox are securely ingested via Google OAuth2. Cloud REST endpoints continuously fetch active threads, message bodies, headers, sender addresses, and timestamps.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-purple-500/20 bg-[#050713] p-4 space-y-1">
                      <div className="flex items-center gap-2 text-purple-400 font-bold">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-[10px]">2</span>
                        <span>Thread Tokenization &amp; Context Assembly</span>
                      </div>
                      <p className="text-slate-400 pl-7 text-[11px]">
                        Message bodies are cleaned, parsed, and tokenized. Previous thread replies and context snippets are combined with the inbound query to construct high-fidelity contextual prompts.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-purple-500/20 bg-[#050713] p-4 space-y-1">
                      <div className="flex items-center gap-2 text-purple-400 font-bold">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-[10px]">3</span>
                        <span>Neural Gemini Inference</span>
                      </div>
                      <p className="text-slate-400 pl-7 text-[11px]">
                        Google Gemini models analyze the sender&apos;s intent, urgency level, questions asked, and tone. Gemini outputs: (a) an executive two-bullet summary, and (b) a complete, polite, and assertively structured response draft.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-purple-500/20 bg-[#050713] p-4 space-y-1">
                      <div className="flex items-center gap-2 text-purple-400 font-bold">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-[10px]">4</span>
                        <span>Interactive Multi-Turn Prompt Refinement</span>
                      </div>
                      <p className="text-slate-400 pl-7 text-[11px]">
                        Users can review the draft in the workspace, input direct natural language instructions (&quot;make it more formal&quot;, &quot;offer a 10% discount&quot;, &quot;schedule meeting for Tuesday&quot;), and regenerate the draft instantly without losing thread context.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {aboutTab === "structure" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Layers className="h-4 w-4 text-purple-400" />
                    <span>System Structure &amp; Technical Architecture</span>
                  </div>
                  <p className="text-slate-300">
                    Aetheris AI is architected with modern, enterprise-grade, high-concurrency cloud technologies:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="rounded-2xl border border-slate-800 bg-[#050713] p-4 space-y-2">
                      <span className="font-bold text-purple-300">Frontend Application</span>
                      <p className="text-slate-400 text-[11px]">
                        Built on <strong>Next.js 15 App Router</strong> with React 19, Tailwind CSS, and Lucide Icons. Features dark-themed glassmorphism, responsive cyber aesthetics, and zero-polling reactive UI.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-[#050713] p-4 space-y-2">
                      <span className="font-bold text-purple-300">Database &amp; Security Layer</span>
                      <p className="text-slate-400 text-[11px]">
                        <strong>Supabase PostgreSQL</strong> with Row Level Security (RLS). Every query is strictly isolated to the authenticated user ID, preventing cross-tenant leakage.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-[#050713] p-4 space-y-2">
                      <span className="font-bold text-purple-300">Session &amp; Identity</span>
                      <p className="text-slate-400 text-[11px]">
                        <strong>Better Auth</strong> session infrastructure managing encrypted cookies, OAuth2 token rotation, and Google identity verification with zero client-side credential exposure.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-[#050713] p-4 space-y-2">
                      <span className="font-bold text-purple-300">Payment Gateway</span>
                      <p className="text-slate-400 text-[11px]">
                        Integrated with <strong>Razorpay</strong>, supporting domestic and international transactions via UPI (GPay, PhonePe), Credit/Debit Cards, NetBanking, and Wallets with SHA-256 HMAC verification.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {aboutTab === "how_to_use" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <HelpCircle className="h-4 w-4 text-purple-400" />
                    <span>How to Use Aetheris AI — 3 Step Quickstart</span>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="rounded-2xl border border-slate-800 bg-[#050713] p-4 flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white font-bold text-xs">
                        1
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-white">Sign In / Register with Google</h4>
                        <p className="text-slate-400 text-[11px]">
                          Click &quot;Initiate&quot; or &quot;Sign In&quot; and authenticate with your Google account in seconds. You instantly receive 5,000 free Gemini AI tokens.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-[#050713] p-4 flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white font-bold text-xs">
                        2
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-white">Sync Your Live Gmail Inbox</h4>
                        <p className="text-slate-400 text-[11px]">
                          Click &quot;Authenticate Gmail&quot; in your dashboard banner. Approve Google Cloud read/compose permissions to immediately load your inbound inbox messages into the sidebar.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-[#050713] p-4 flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white font-bold text-xs">
                        3
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-white">Select Any Email &amp; Generate Neural Replies</h4>
                        <p className="text-slate-400 text-[11px]">
                          Click any email from the sidebar (or search by keyword, from:, or to:). The workspace will automatically extract the sender intent, summarize it, and generate a draft reply. Type custom instructions to refine it anytime!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {aboutTab === "ai_engine" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Cpu className="h-4 w-4 text-purple-400" />
                    <span>Which AI is Used: Google Gemini Multimodal Engine</span>
                  </div>
                  <p className="text-slate-300">
                    Aetheris AI is powered by <strong>Google DeepMind&apos;s Gemini AI Models</strong> (Gemini 2.5 &amp; 1.5 Flash / Pro):
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="rounded-2xl border border-purple-500/20 bg-[#050713] p-4 space-y-1">
                      <span className="font-bold text-purple-300">Multimodal Context Processing</span>
                      <p className="text-slate-400 text-[11px]">
                        Gemini was trained from the ground up to understand text, documents, and structured communication natively, making it superior at extracting subtle tone, hidden commitments, and implicit requests.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-purple-500/20 bg-[#050713] p-4 space-y-1">
                      <span className="font-bold text-purple-300">Fine-Tuned Temperature &amp; System Directives</span>
                      <p className="text-slate-400 text-[11px]">
                        We configure Gemini with deterministic low-temperature settings for objective email summarization, and balanced adaptive temperatures for conversational, polite, and assertive reply generation.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-purple-500/20 bg-[#050713] p-4 space-y-1">
                      <span className="font-bold text-purple-300">Token Efficiency &amp; Safety Filters</span>
                      <p className="text-slate-400 text-[11px]">
                        Rigorous safety guardrails prevent hallucination and unauthorized data disclosure, while server-side token quota meters prevent runaway API costs.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {aboutTab === "why_better" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span>Why Aetheris AI is Stronger &amp; Better Than Other Solutions</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="rounded-2xl border border-slate-800 bg-[#050713] p-4 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>Native Contextual Grounding</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Unlike generic chatbots where you must manually copy-paste parts of emails, Aetheris AI automatically accesses the full thread sender identity, recipient details, and message chain.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-[#050713] p-4 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>Sub-Second Inference Speed</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Optimized model pipelines generate concise bullet points and complete reply drafts in under 800ms, eliminating workflow friction.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-[#050713] p-4 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>Automatic 3-Day Refill Engine</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Your used tokens automatically reset to 0 every 72 hours even if unused tokens remain in your bucket! No other AI SaaS refills your bucket every 3 days automatically.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-[#050713] p-4 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>Integrated Gmail Search Syntax</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Supports native Gmail query filters (`from:`, `to:`, keywords) directly inside the AI sidebar, letting you triage specific stakeholders in seconds.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-800 p-4 bg-[#050713] flex justify-end gap-3">
              <Link
                href="/sign-up"
                className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white hover:scale-105 transition-all shadow-md shadow-purple-600/30"
              >
                Experience Aetheris AI →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TERMS AND CONDITIONS (Ethics, Legal & Data Storing Disclosure) */}
      {/* ========================================================================= */}
      {activeModal === "terms" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-purple-500/40 bg-[#080a1e] text-slate-200 shadow-2xl shadow-purple-950/60 overflow-hidden font-mono text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-[#050713]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Terms &amp; Conditions and Privacy Policy</h3>
                  <p className="text-[11px] text-slate-400">AI Ethics, Legal Governance, and Data Storage Disclosure</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 max-h-[65vh] leading-relaxed">
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-[11px] text-amber-200 leading-relaxed">
                <strong>Important Legal Notice:</strong> Please read these Terms and Conditions thoroughly before accessing or using Aetheris AI services. By creating an account or syncing third-party providers, you acknowledge and agree to the terms below.
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">1. AI Ethics &amp; Responsible Deployment</h4>
                <p className="text-slate-300">
                  Aetheris AI is engineered adhering to principles of responsible artificial intelligence, fairness, and safety. All AI-generated email summaries, analysis points, and draft replies are recommendations provided to assist your workflow. You, as the user, retain ultimate responsibility for reviewing, editing, and verifying the accuracy and appropriateness of any generated draft before sending it to third parties.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">2. Data Storage &amp; Knowledge Building Disclosure</h4>
                <p className="text-slate-300">
                  By connecting your communication accounts (including Google Gmail) and using Aetheris AI, you explicitly acknowledge, consent, and agree that:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-400 text-[11px]">
                  <li>
                    <strong>Secure User Isolation:</strong> Your account profile, synced email metadata (headers, subject, sender, date), content bodies, and user prompts are stored in encrypted Supabase PostgreSQL database tables protected by Row Level Security (RLS).
                  </li>
                  <li>
                    <strong>Knowledge Building &amp; Optimization:</strong> You consent and authorize Aetheris AI to store, process, index, and analyze user interaction telemetry, prompts, and contextual workflow data. This data is utilized for continuous machine learning model improvement, internal knowledge building, retrieval-augmented generation (RAG) fine-tuning, and performance optimization to deliver superior automated email triage.
                  </li>
                  <li>
                    <strong>No Unauthorized Sale:</strong> Aetheris AI will never sell your personal contact information or raw emails to external data brokers or advertisers.
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">3. Google API Services User Data Policy</h4>
                <p className="text-slate-300">
                  Aetheris AI&apos;s use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">4. Token Quotas &amp; Subscription Terms</h4>
                <p className="text-slate-300">
                  All subscriptions (Free, Premium, Premium Pro) include atomic token quotas that automatically replenish every 3 days (72 hours). Payments processed through Razorpay are subject to Razorpay&apos;s terms of service. You may cancel your subscription at any time through the billing dashboard.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">5. Account Termination &amp; Data Deletion</h4>
                <p className="text-slate-300">
                  You hold the complete right to disconnect your Gmail integration or request full deletion of your user account and associated stored data at any time by contacting our support team at <strong>devd34427@gmail.com</strong>.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-800 p-4 bg-[#050713] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full bg-slate-800 hover:bg-slate-700 px-6 py-2 text-xs font-bold text-white transition-all cursor-pointer"
              >
                I Understand &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CAREERS AT AETHERIS AI */}
      {/* ========================================================================= */}
      {activeModal === "career" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-purple-500/40 bg-[#080a1e] text-slate-200 shadow-2xl shadow-purple-950/60 overflow-hidden font-mono text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-[#050713]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Careers at Aetheris AI</h3>
                  <p className="text-[11px] text-slate-400">Join our engineering team building next-generation agentic workflows</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 max-h-[65vh] leading-relaxed">
              <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-4 text-slate-300">
                <p>
                  At Aetheris AI, we are reimagining how humans and artificial intelligence collaborate across communication protocols. We are seeking passionate builders, systems engineers, and AI researchers.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white text-sm">Open Positions</h4>

                <div className="rounded-2xl border border-slate-800 bg-[#050713] p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Senior Full-Stack AI Engineer</span>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">Remote • Full Time</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Experience with Next.js 15, TypeScript, Supabase PostgreSQL, LLM prompt engineering, and Google Gemini APIs.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#050713] p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Distributed Systems &amp; Security Architect</span>
                    <span className="rounded-full bg-purple-500/20 text-purple-300 px-2 py-0.5 text-[10px] font-bold">Remote • Full Time</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Deep knowledge of OAuth 2.0 flows, PostgreSQL Row Level Security, Redis caching, and low-latency webhook ingestion.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#050713] p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">AI Product &amp; Developer Relations Lead</span>
                    <span className="rounded-full bg-cyan-500/20 text-cyan-300 px-2 py-0.5 text-[10px] font-bold">Remote • Full Time</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Passionate about developer advocacy, technical documentation, community building, and SaaS product-led growth.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#050713] p-4 space-y-2">
                <h4 className="font-bold text-white">How to Apply</h4>
                <p className="text-slate-400 text-[11px]">
                  Send your GitHub profile, portfolio, resume, and a brief description of the most interesting AI system you&apos;ve built to:
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href="mailto:devd34427@gmail.com?subject=[Career%20Application]%20Software%20Engineer"
                    className="font-bold text-purple-400 hover:underline flex items-center gap-1.5 text-xs"
                  >
                    <Mail className="h-4 w-4" />
                    devd34427@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-800 p-4 bg-[#050713] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full bg-slate-800 hover:bg-slate-700 px-6 py-2 text-xs font-bold text-white transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
