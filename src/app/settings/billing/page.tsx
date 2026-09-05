"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/shared/header";
import { Sidebar } from "@/components/shared/sidebar";
import { SUBSCRIPTION_PLANS, PlanConfig } from "@/lib/billing/stripe";
import { Check, Zap, CreditCard, Sparkles, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { BillingCycle } from "@/types";

function BillingContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  const [currentTier, setCurrentTier] = useState<string>("free");
  const [tokensUsed, setTokensUsed] = useState<number>(0);
  const [tokensLimit, setTokensLimit] = useState<number>(5000);
  const [nextRefillDate, setNextRefillDate] = useState<string>("");
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Per-card billing cycle selections (default: monthly)
  const [cardCycles, setCardCycles] = useState<Record<string, BillingCycle>>({
    free: "monthly",
    premium: "monthly",
    premium_pro: "monthly",
  });

  // Fetch current user subscription & token status
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.subscription?.plan) {
            setCurrentTier(data.subscription.plan);
          }
          if (data.tokenBalance) {
            setTokensUsed(data.tokenBalance.tokens_used || 0);
            setTokensLimit(data.tokenBalance.tokens_limit || 5000);
            if (data.tokenBalance.period_end) {
              const diffMs = new Date(data.tokenBalance.period_end).getTime() - Date.now();
              if (diffMs > 0) {
                const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                setNextRefillDate(`${days}d ${hours}h remaining in 3-day cycle`);
              } else {
                setNextRefillDate("Refill ready on next action");
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user billing profile:", err);
      }
    }
    loadProfile();
  }, [success]);

  const handleCycleChange = (planId: string, cycle: BillingCycle) => {
    setCardCycles((prev) => ({
      ...prev,
      [planId]: cycle,
    }));
  };

  const handleUpgrade = async (planKey: string) => {
    if (planKey === "free") return;
    setLoadingTier(planKey);
    setErrorMessage(null);

    const billingCycle = cardCycles[planKey] || "monthly";

    try {
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: planKey,
          billingCycle,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.isConfigError) {
          setErrorMessage("Stripe API key is not yet configured in .env. Please set STRIPE_SECRET_KEY to enable live checkout.");
        } else {
          setErrorMessage(data.error || "Failed to initialize payment checkout session.");
        }
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initialize Stripe checkout session.");
    } finally {
      setLoadingTier(null);
    }
  };

  const planList = [
    SUBSCRIPTION_PLANS.free,
    SUBSCRIPTION_PLANS.premium,
    SUBSCRIPTION_PLANS.premium_pro,
  ];

  return (
    <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/20 via-[#050713] to-[#050713]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Alerts for Stripe Checkout Callback */}
        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs font-mono text-emerald-300 shadow-xl backdrop-blur-xl">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Payment Successful!</p>
              <p className="text-emerald-300/80">Your subscription has been upgraded and your token balance has been refilled.</p>
            </div>
          </div>
        )}

        {canceled && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-500/40 bg-amber-950/40 p-4 text-xs font-mono text-amber-300 shadow-xl backdrop-blur-xl">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Checkout Canceled</p>
              <p className="text-amber-300/80">Payment was not completed. You can try again whenever you are ready.</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-xs font-mono text-red-300 shadow-xl backdrop-blur-xl">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Header Title & 3-Day Refill Guarantee Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-500/20 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h2 className="text-2xl font-mono font-bold text-white tracking-wide">
                Subscription & Token Economy
              </h2>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-1">
              All plans feature automatic 3-day token replenishment — even with tokens remaining in your bucket.
            </p>
          </div>

          {/* Current Active Plan Pill */}
          <div className="flex items-center gap-3 rounded-2xl border border-purple-500/30 bg-[#090c24]/90 px-4 py-2.5 font-mono text-xs shadow-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-bold">Active Plan</div>
              <div className="text-white font-bold capitalize">
                {currentTier.replace("_", " ")} ({tokensUsed.toLocaleString()} / {tokensLimit.toLocaleString()} tokens)
              </div>
              {nextRefillDate && (
                <div className="text-[10px] text-cyan-400 font-semibold mt-0.5">
                  ? {nextRefillDate}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3-Day Auto Refill Banner */}
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-[#090c24] to-purple-950/30 p-4 font-mono text-xs text-slate-300 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold text-white">3-Day Auto-Refill Guarantee:</span>
            <span className="text-slate-300">
              Used tokens are automatically reset to 0 every 72 hours even if unused tokens remain in your bucket.
            </span>
          </div>
          <div className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-0.5 text-[10px] font-bold text-cyan-300">
            Automated Engine Active
          </div>
        </div>

        {/* Subscription Plan Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 font-mono">
          {planList.map((plan) => {
            const isCurrent = currentTier === plan.id;
            const isPopular = plan.popular;
            const cycle = cardCycles[plan.id] || "monthly";
            const isAnnual = cycle === "annually";
            const displayPrice = isAnnual ? plan.priceAnnually : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl border p-6 transition-all backdrop-blur-xl ${
                  isPopular
                    ? "border-purple-500/60 bg-gradient-to-b from-[#0e1138]/95 to-[#080a1e]/95 shadow-2xl shadow-purple-950/60 ring-1 ring-purple-500/30"
                    : "border-slate-800/90 bg-[#080a1e]/80 shadow-xl hover:border-purple-500/40"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg border border-purple-400/40">
                    Most Popular
                  </span>
                )}

                <div className="space-y-5">
                  {/* TOP OF CARD: MONTHLY / ANNUALLY TOGGLE SELECTOR */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Billing Cycle</span>
                      {isAnnual && plan.annualSavingsPercent > 0 && (
                        <span className="text-emerald-400 text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                          Save {plan.annualSavingsPercent}%
                        </span>
                      )}
                    </div>

                    <div className="flex rounded-xl bg-[#050713] p-1 border border-slate-800 text-xs shadow-inner">
                      <button
                        type="button"
                        onClick={() => handleCycleChange(plan.id, "monthly")}
                        className={`flex-1 py-1.5 rounded-lg text-center font-bold text-[11px] transition-all ${
                          cycle === "monthly"
                            ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Monthly
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCycleChange(plan.id, "annually")}
                        className={`flex-1 py-1.5 rounded-lg text-center font-bold text-[11px] transition-all flex items-center justify-center gap-1 ${
                          cycle === "annually"
                            ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span>Annually</span>
                      </button>
                    </div>
                  </div>

                  {/* Plan Name & Tagline */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Zap className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{plan.tagline}</p>
                  </div>

                  {/* Dynamic Price Display in INR */}
                  <div className="rounded-2xl bg-[#050713]/80 p-4 border border-slate-800/80">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-white">
                        {displayPrice === 0 ? "?0" : `?${displayPrice.toLocaleString()}`}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        / {isAnnual ? "year" : "month"}
                      </span>
                    </div>

                    {isAnnual && plan.priceAnnually > 0 && (
                      <p className="text-[10px] text-purple-300 font-semibold mt-1">
                        ˜ ?{Math.round(plan.priceAnnually / 12)} / month (billed annually)
                      </p>
                    )}

                    {/* Token Quota & Refill Highlight */}
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Tokens Quota:</span>
                      <span className="font-bold text-purple-300">
                        {plan.tokens.toLocaleString()} tokens
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Refill Cadence:</span>
                      <span className="font-bold text-cyan-400 flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" /> Every 3 days
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-2.5 pt-1">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                        <span className="leading-relaxed">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom CTA Action Button */}
                <div className="mt-8 border-t border-slate-800/80 pt-4">
                  {isCurrent ? (
                    <div className="flex items-center justify-center gap-2 rounded-2xl border border-purple-500/40 bg-purple-950/30 py-2.5 text-xs font-bold text-purple-300 shadow-inner">
                      <ShieldCheck className="h-4 w-4 text-purple-400" />
                      <span>Current Active Plan</span>
                    </div>
                  ) : plan.id === "free" ? (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-2xl border border-slate-800 bg-[#050713] py-2.5 text-xs font-bold text-slate-500"
                    >
                      Included by Default
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loadingTier === plan.id}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-600/30 border border-purple-400/40 hover:scale-102 hover:shadow-purple-600/50 transition-all disabled:opacity-50"
                    >
                      {loadingTier === plan.id ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin text-purple-300" />
                          <span>Connecting Stripe...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 text-purple-200" />
                          <span>Pay with Stripe ?</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Payment Notes */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#080a1e]/60 p-5 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-white">Stripe 256-Bit Encrypted Payments</p>
              <p className="text-[11px] text-slate-400">Your card and credentials are securely processed directly by Stripe.</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span>Return to Workspace</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function BillingPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#050713] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      <Header
        title="Billing & Subscription Plans"
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      <div className="flex flex-1 relative">
        <Sidebar isCollapsed={isSidebarCollapsed} />
        <Suspense fallback={<div className="flex-1 p-8 font-mono text-slate-400 text-xs">Loading billing options...</div>}>
          <BillingContent />
        </Suspense>
      </div>
    </div>
  );
}

