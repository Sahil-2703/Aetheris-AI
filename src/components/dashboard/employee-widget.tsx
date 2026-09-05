"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Mail, 
  FileText, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Terminal,
  RotateCcw,
  Plus,
  ExternalLink
} from "lucide-react";
import { NeuralWorkspace, PersonaMode } from "./neural-workspace";

const EMPLOYEE_MODES: PersonaMode[] = [
  {
    id: "general",
    name: "General Assistance",
    icon: Sparkles,
    placeholder: "Enter custom parameters for ⚙ General Assistance...",
    defaultPrompt: "Draft a polite and assertive project timeline update for stakeholders",
    apiEndpoint: "/api/ai/chat",
  },
  {
    id: "reply",
    name: "Email Thread Triage & Reply",
    icon: Mail,
    placeholder: "Paste inbound email or thread snippet to draft a structured response...",
    defaultPrompt: "Client asking for contract renewal terms and 10% discount on annual plan",
    apiEndpoint: "/api/ai/draft-email",
  },
  {
    id: "meeting",
    name: "Meeting Note Extractor",
    icon: FileText,
    placeholder: "Paste rough meeting transcript or raw notes to extract action items and owners...",
    defaultPrompt: "Marketing and Engineering sync: discussed Q3 product launch, API freeze on Friday",
    apiEndpoint: "/api/ai/draft-email",
  },
  {
    id: "standup",
    name: "Daily Standup Writer",
    icon: Clock,
    placeholder: "List your tasks to generate formatted Slack/Teams daily standup updates...",
    defaultPrompt: "Completed Supabase OAuth fix, working on dashboard widgets, blocked on Figma export",
    apiEndpoint: "/api/ai/draft-email",
  },
];

export interface GmailEmailItem {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  content: string;
  date: string;
  unread: boolean;
}

const DEFAULT_SELECTED_EMAIL: GmailEmailItem = {
  id: "email-1",
  senderName: "Google",
  senderEmail: "no-reply@accounts.google.com",
  subject: "Security alert",
  snippet: "You allowed Aetheris AI access to some of your Google Account data...",
  content: "Hi Sahil,\n\nAetheris AI was granted access to your Google Account data. If you did not initiate this, please secure your account immediately.\n\nBest,\nGoogle Security Team",
  date: "06:13 pm",
  unread: true,
};

export function EmployeeWidget() {
  const [activeTab, setActiveTab] = useState<"email_workspace" | "productivity_hub">("email_workspace");
  const [selectedEmail, setSelectedEmail] = useState<GmailEmailItem>(DEFAULT_SELECTED_EMAIL);
  
  // AI Refinement State
  const [aiSummary, setAiSummary] = useState<string>("Analyzing incoming email summary & intent...");
  const [suggestedReply, setSuggestedReply] = useState<string>("");
  const [revisedReply, setRevisedReply] = useState<string>("");
  const [userPromptInstruction, setUserPromptInstruction] = useState<string>("");

  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [refiningReply, setRefiningReply] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectedAccountEmail, setConnectedAccountEmail] = useState<string | null>(null);
  const [apiDisabled, setApiDisabled] = useState<boolean>(false);
  const [enableUrl, setEnableUrl] = useState<string>("https://console.developers.google.com/apis/api/gmail.googleapis.com/overview?project=151333311311");
  const [syncingInbox, setSyncingInbox] = useState<boolean>(false);

  // Listen to Sidebar Email Selection Custom Event
  useEffect(() => {
    const handleEmailSelected = (e: Event) => {
      const customEvt = e as CustomEvent<GmailEmailItem>;
      if (customEvt.detail) {
        setSelectedEmail(customEvt.detail);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("aetheris:select-email", handleEmailSelected);
      return () => {
        window.removeEventListener("aetheris:select-email", handleEmailSelected);
      };
    }
  }, []);

  // Fetch Live Gmail Status from /api/integrations/gmail/messages
  const fetchLiveGmailMessages = async () => {
    setSyncingInbox(true);
    try {
      const res = await fetch("/api/integrations/gmail/messages");
      if (res.ok) {
        const data = await res.json();
        setIsConnected(!!data.isConnected);
        if (data.emailAddress) {
          setConnectedAccountEmail(data.emailAddress);
        }

        if (data.apiDisabled) {
          setApiDisabled(true);
          if (data.enableUrl) setEnableUrl(data.enableUrl);
        } else {
          setApiDisabled(false);
        }

        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setSelectedEmail(data.messages[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch live Gmail messages:", err);
    } finally {
      setSyncingInbox(false);
    }
  };

  useEffect(() => {
    fetchLiveGmailMessages();
  }, []);

  // Trigger initial AI summary & reply when email is selected
  useEffect(() => {
    if (!selectedEmail) return;

    async function analyzeEmail() {
      setLoadingSummary(true);
      try {
        const res = await fetch("/api/ai/draft-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `Sender: ${selectedEmail.senderName} (${selectedEmail.senderEmail})\nSubject: ${selectedEmail.subject}\nBody: ${selectedEmail.content}`,
            mode: "reply",
            instructions: "Summarize this email in 2 bullet points and draft a direct, professional reply addressing all questions.",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const draftText = data.draft || data.output || "Thank you for your email. We are reviewing your request.";
          setAiSummary(`Summary: ${selectedEmail.senderName} sent notification regarding "${selectedEmail.subject}".`);
          setSuggestedReply(draftText);
          setRevisedReply(draftText);
        } else {
          setAiSummary(`Summary: Inbound query regarding ${selectedEmail.subject}`);
          const fallback = `Hi ${selectedEmail.senderName.split(" ")[0]},\n\nThank you for reaching out regarding ${selectedEmail.subject}. We have received your email and are reviewing the details.\n\nBest regards,`;
          setSuggestedReply(fallback);
          setRevisedReply(fallback);
        }
      } catch (err) {
        setAiSummary(`Summary: Email inquiry from ${selectedEmail.senderName}`);
        const fallback = `Hi ${selectedEmail.senderName.split(" ")[0]},\n\nThank you for your email. I will follow up shortly.\n\nBest regards,`;
        setSuggestedReply(fallback);
        setRevisedReply(fallback);
      } finally {
        setLoadingSummary(false);
      }
    }

    analyzeEmail();
  }, [selectedEmail]);

  // Refine reply based on user prompt instruction
  const handleRefineReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userPromptInstruction.trim()) return;

    setRefiningReply(true);
    try {
      const res = await fetch("/api/ai/draft-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `Original Email Subject: ${selectedEmail.subject}\nBody: ${selectedEmail.content}\n\nCurrent Draft: ${suggestedReply}`,
          mode: "reply",
          instructions: `User modification instruction: "${userPromptInstruction}". Rewrite the email reply accordingly.`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newReply = data.draft || data.output || suggestedReply;
        setRevisedReply(newReply);
      }
    } catch (err) {
      console.error("Failed to refine reply:", err);
    } finally {
      setRefiningReply(false);
      setUserPromptInstruction("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar & Sub-navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("email_workspace")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition-all ${
              activeTab === "email_workspace"
                ? "border border-purple-500/40 bg-purple-950/50 text-purple-300 shadow-md shadow-purple-950/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#090c24]"
            }`}
          >
            <Mail className="h-4 w-4 text-purple-400" />
            <span>Gmail AI Workspace (Freelancer)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("productivity_hub")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition-all ${
              activeTab === "productivity_hub"
                ? "border border-indigo-500/40 bg-indigo-950/50 text-indigo-300 shadow-md shadow-indigo-950/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#090c24]"
            }`}
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Productivity Tools</span>
          </button>
        </div>

        {/* Integration Status & Sync Button */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="h-3.5 w-3.5" /> Gmail Connected ({connectedAccountEmail || "Active"})
            </span>
          ) : (
            <a
              href="/api/integrations/gmail/connect"
              className="flex items-center gap-1.5 text-xs font-mono font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-400/40 px-3.5 py-1.5 rounded-xl shadow-md hover:scale-102 transition-all"
            >
              <Plus className="h-3.5 w-3.5" /> Connect Gmail Account
            </a>
          )}

          <button
            type="button"
            onClick={fetchLiveGmailMessages}
            disabled={syncingInbox}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#080a1e] px-3.5 py-1.5 text-xs font-mono text-slate-300 hover:border-purple-500/40 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-purple-400 ${syncingInbox ? "animate-spin" : ""}`} />
            <span>{syncingInbox ? "Syncing..." : "Sync Inbox"}</span>
          </button>
        </div>
      </div>

      {activeTab === "email_workspace" && (
        <div className="space-y-6">
          {/* Gmail API Disabled Warning Banner in Google Cloud Project */}
          {apiDisabled && (
            <div className="rounded-3xl border border-amber-500/40 bg-amber-950/30 p-5 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-amber-300">Action Required: Enable Gmail API in Google Cloud Console</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Gmail API is currently disabled in your Google Cloud Project (151333311311). Click the button to enable it.
                  </p>
                </div>
              </div>

              <a
                href={enableUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-amber-500 text-black px-5 py-2.5 text-xs font-bold shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
              >
                <span>Enable Gmail API →</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          {/* Gmail Unconnected Banner Prompt */}
          {!isConnected && (
            <div className="rounded-3xl border border-purple-500/30 bg-[#080a1e]/90 p-5 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-mono font-bold text-white">Connect Live Gmail Account</h4>
                  <p className="text-xs font-mono text-slate-400">
                    Connect your Google account to automatically analyze real-time inbound emails and generate instant AI replies.
                  </p>
                </div>
              </div>

              <a
                href="/api/integrations/gmail/connect"
                className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-mono font-bold text-white shadow-lg shadow-purple-600/30 border border-purple-400/40 hover:scale-105 transition-all"
              >
                <span>Authenticate Gmail →</span>
              </a>
            </div>
          )}


          {/* 2. FULL WIDTH EMAIL WORKSPACE DETAIL & AI ASSISTANT PANEL */}
          {selectedEmail && (
            <div className="space-y-5 rounded-3xl border border-purple-500/30 bg-[#080a1e]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              {/* Header Details */}
              <div className="pb-4 border-b border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                    EMAIL WORKSPACE DETAIL
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{selectedEmail.date}</span>
                </div>
                <h3 className="text-lg font-mono font-bold text-white">{selectedEmail.subject}</h3>
                <p className="text-xs font-mono text-slate-400">
                  From: <span className="text-slate-200 font-bold">{selectedEmail.senderName}</span> &lt;{selectedEmail.senderEmail}&gt;
                </p>
              </div>

              {/* Email Content Body */}
              <div className="bg-[#050713]/90 rounded-2xl p-5 border border-slate-800 max-h-48 overflow-y-auto custom-scrollbar font-mono text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {selectedEmail.content}
              </div>

              {/* AI Summary & Intent Analysis Box */}
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 space-y-1 font-mono">
                <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span>AI SUMMARY &amp; INTENT ANALYSIS</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {loadingSummary ? "Analyzing email summary..." : aiSummary}
                </p>
              </div>

              {/* Suggested / Revised Reply Output Box */}
              <div className="rounded-2xl border border-slate-800 bg-[#050713]/95 p-5 space-y-2 relative">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    <span>SUGGESTED EMAIL AI RESPONSE</span>
                  </div>
                  {refiningReply && <span className="text-purple-400 animate-pulse">Refining draft...</span>}
                </div>

                <div className="text-xs sm:text-sm font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {revisedReply || suggestedReply || "Generating email draft..."}
                </div>
              </div>

              {/* Refinement Input Panel (Flow: Gmail Email -> AI Summary/Analysis -> Suggested Reply -> User Prompt -> Revised Reply) */}
              <form onSubmit={handleRefineReply} className="space-y-2">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  REFINE RESPONSE WITH CUSTOM INSTRUCTIONS
                </div>
                <div className="relative flex items-center rounded-2xl border border-purple-500/40 bg-[#050713]/95 shadow-inner focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-400/30">
                  <input
                    type="text"
                    value={userPromptInstruction}
                    onChange={(e) => setUserPromptInstruction(e.target.value)}
                    placeholder="e.g. 'Make this email more professional', 'Make it shorter', 'Accept proposal but ask for higher budget'..."
                    className="w-full bg-transparent px-4 py-4 text-xs sm:text-sm font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none pr-14"
                  />

                  <button
                    type="submit"
                    disabled={refiningReply}
                    className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/40 border border-purple-400/40 transition-all hover:scale-105 disabled:opacity-50"
                  >
                    {refiningReply ? (
                      <RotateCcw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === "productivity_hub" && (
        <NeuralWorkspace
          roleTitle="FREELANCER & EMPLOYEE"
          modes={EMPLOYEE_MODES}
          initialPrompt="Client asking for contract renewal terms and 10% discount on annual plan"
        />
      )}
    </div>
  );
}
