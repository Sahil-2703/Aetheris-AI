"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/shared/header";
import { Sidebar } from "@/components/shared/sidebar";
import { Mail, Instagram, CheckCircle2, Plus, Shield, Check, AlertCircle, Trash2, ArrowLeft, LayoutDashboard } from "lucide-react";

export default function IntegrationsPage() {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [userRole, setUserRole] = useState<string>("employee");
  const [accountDetails, setAccountDetails] = useState<{
    gmail?: string;
    outlook?: string;
    instagram?: string;
  }>({});
  const [loading, setLoading] = useState(true);
  const [bannerMessage, setBannerMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Check URL parameters for OAuth redirect notices
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const success = params.get("success");
      const error = params.get("error");

      if (success) {
        const providerName = success.replace("_connected", "").toUpperCase();
        setBannerMessage({
          type: "success",
          text: `Successfully connected ${providerName} integration account. Push webhook listeners are active.`,
        });
      } else if (error) {
        setBannerMessage({
          type: "error",
          text: `Failed to complete OAuth handshake (${error}). Please verify credentials and try again.`,
        });
      }
    }
  }, []);

  // 2. Fetch user profile and real-time connected integration status
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch profile role
        const profileRes = await fetch("/api/user/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.profile?.role) {
            setUserRole(profileData.profile.role);
          }
        }

        // Fetch integration status
        const statusRes = await fetch("/api/integrations/status");
        if (statusRes.ok) {
          const data = await statusRes.json();
          setGmailConnected(!!data.gmail);
          setOutlookConnected(!!data.outlook);
          setInstagramConnected(!!data.instagram);
          setAccountDetails({
            gmail: data.accounts?.gmail?.email,
            outlook: data.accounts?.outlook?.email,
            instagram: data.accounts?.instagram?.name,
          });
        }
      } catch (err) {
        console.error("Failed to load integrations data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 3. Handle Disconnect Account Action
  const handleDisconnect = async (provider: "gmail" | "outlook" | "instagram") => {
    try {
      const res = await fetch("/api/integrations/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      if (res.ok) {
        if (provider === "gmail") setGmailConnected(false);
        if (provider === "outlook") setOutlookConnected(false);
        if (provider === "instagram") setInstagramConnected(false);

        setBannerMessage({
          type: "success",
          text: `${provider.toUpperCase()} account disconnected successfully. Push notifications paused.`,
        });
      }
    } catch (err) {
      console.error("Failed to disconnect account:", err);
    }
  };

  const roleSlug = userRole === "content_creator" ? "content-creator" : userRole;

  return (
    <div className="min-h-screen bg-[#050713] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      <Header 
        title="Account Integrations" 
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      <div className="flex flex-1 relative">
        <Sidebar isCollapsed={isSidebarCollapsed} />
        <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/20 via-[#050713] to-[#050713]">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Top Navigation Action to Return to AI Workspace Dashboard */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide">Connected Accounts &amp; Channels</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Connect third-party communication channels for real-time push events, automated inbox triage, and AI script generation.
                </p>
              </div>

              <Link
                href={`/dashboard/${roleSlug}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 px-5 py-2.5 text-xs font-mono font-bold text-white shadow-lg shadow-purple-600/30 border border-purple-400/40 hover:scale-105 transition-all shrink-0"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Return to AI Workspace →</span>
              </Link>
            </div>

            {/* Success / Error Banner */}
            {bannerMessage && (
              <div
                className={`rounded-2xl border p-4 text-xs font-mono flex items-center justify-between gap-3 ${
                  bannerMessage.type === "success"
                    ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
                    : "border-red-500/40 bg-red-950/30 text-red-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {bannerMessage.type === "success" ? (
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  )}
                  <span>{bannerMessage.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBannerMessage(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Gmail Card */}
              <div className="flex flex-col justify-between rounded-3xl border border-purple-500/30 bg-[#080a1e]/90 p-6 shadow-xl backdrop-blur-xl transition-all">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
                      <Mail className="h-6 w-6" />
                    </div>
                    {gmailConnected ? (
                      <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-slate-500">Not Connected</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Gmail</h3>
                    {accountDetails.gmail && (
                      <p className="text-[11px] font-mono text-purple-300 mt-0.5 truncate">{accountDetails.gmail}</p>
                    )}
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                      Watch for new inbox messages in real-time via Google Pub/Sub push notifications, auto-categorize inquiries, and generate draft replies.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  {gmailConnected ? (
                    <button
                      type="button"
                      onClick={() => handleDisconnect("gmail")}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-950/30 py-2.5 text-xs font-mono font-bold text-red-300 hover:bg-red-900/50 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Disconnect Gmail
                    </button>
                  ) : (
                    <a
                      href="/api/integrations/gmail/connect"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-2.5 text-xs font-mono font-bold text-white shadow-md shadow-purple-600/30 hover:scale-102 transition-all border border-purple-400/30"
                    >
                      <Plus className="h-4 w-4" /> Connect Gmail
                    </a>
                  )}
                </div>
              </div>

              {/* Outlook Card */}
              <div className="flex flex-col justify-between rounded-3xl border border-purple-500/30 bg-[#080a1e]/90 p-6 shadow-xl backdrop-blur-xl transition-all">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      <Mail className="h-6 w-6" />
                    </div>
                    {outlookConnected ? (
                      <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-slate-500">Not Connected</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Microsoft Outlook</h3>
                    {accountDetails.outlook && (
                      <p className="text-[11px] font-mono text-purple-300 mt-0.5 truncate">{accountDetails.outlook}</p>
                    )}
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                      Sync corporate Exchange &amp; Outlook 365 inboxes with Microsoft Graph webhook event subscriptions and push notification handlers.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  {outlookConnected ? (
                    <button
                      type="button"
                      onClick={() => handleDisconnect("outlook")}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-950/30 py-2.5 text-xs font-mono font-bold text-red-300 hover:bg-red-900/50 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Disconnect Outlook
                    </button>
                  ) : (
                    <a
                      href="/api/integrations/outlook/connect"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 py-2.5 text-xs font-mono font-bold text-white shadow-md shadow-sky-600/30 hover:scale-102 transition-all border border-sky-400/30"
                    >
                      <Plus className="h-4 w-4" /> Connect Outlook
                    </a>
                  )}
                </div>
              </div>

              {/* Instagram Card */}
              <div className="flex flex-col justify-between rounded-3xl border border-purple-500/30 bg-[#080a1e]/90 p-6 shadow-xl backdrop-blur-xl transition-all">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/20">
                      <Instagram className="h-6 w-6" />
                    </div>
                    {instagramConnected ? (
                      <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-slate-500">Not Connected</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Instagram Business</h3>
                    {accountDetails.instagram && (
                      <p className="text-[11px] font-mono text-purple-300 mt-0.5 truncate">{accountDetails.instagram}</p>
                    )}
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                      Track media comments, monitor post engagement, and auto-generate captions using Instagram Meta Graph API webhooks.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  {instagramConnected ? (
                    <button
                      type="button"
                      onClick={() => handleDisconnect("instagram")}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-950/30 py-2.5 text-xs font-mono font-bold text-red-300 hover:bg-red-900/50 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Disconnect Instagram
                    </button>
                  ) : (
                    <a
                      href="/api/integrations/instagram/connect"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 py-2.5 text-xs font-mono font-bold text-white shadow-md shadow-pink-600/30 hover:scale-102 transition-all border border-pink-400/30"
                    >
                      <Plus className="h-4 w-4" /> Connect Instagram
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Return Action & Security Notice */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
              <div className="rounded-2xl border border-purple-500/20 bg-[#080a1e]/80 p-4 flex items-center gap-3 shadow-lg backdrop-blur-xl flex-1">
                <Shield className="h-5 w-5 text-cyan-400 shrink-0" />
                <p className="text-xs font-mono text-slate-400 leading-relaxed">
                  All third-party OAuth tokens are stored encrypted at rest in server-side Supabase database rows.
                </p>
              </div>

              <Link
                href={`/dashboard/${roleSlug}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 px-6 py-3 text-xs font-mono font-bold text-white shadow-lg shadow-purple-600/30 border border-purple-400/40 hover:scale-105 transition-all shrink-0"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Return to AI Workspace →</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
