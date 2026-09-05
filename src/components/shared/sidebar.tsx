"use client";

import { useState, useEffect } from "react";
import { Plus, MessageSquare, Zap, Trash2, Clock, Mail, Sparkles, ChevronRight, ChevronLeft, RefreshCw, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "@/lib/chat-context";
import Link from "next/link";

interface SidebarProps {
  isCollapsed?: boolean;
}

export interface SidebarEmailItem {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  content: string;
  date: string;
  unread: boolean;
}

const DEFAULT_SIDEBAR_EMAILS: SidebarEmailItem[] = [
  {
    id: "email-1",
    senderName: "Google",
    senderEmail: "no-reply@accounts.google.com",
    subject: "Security alert",
    snippet: "You allowed Aetheris AI access to some of your Google Account data...",
    content: "Hi Sahil,\n\nAetheris AI was granted access to your Google Account data. If you did not initiate this, please secure your account immediately.\n\nBest,\nGoogle Security Team",
    date: "06:13 pm",
    unread: true,
  },
  {
    id: "email-2",
    senderName: "Finlatics",
    senderEmail: "support@finlatics.com",
    subject: "Live Project - Investment Banking (PE ...",
    snippet: "Hi Sahil Singh, Please note that applications are open for the Finlatic...",
    content: "Hi Sahil Singh,\n\nPlease note that applications are open for the Finlatics Investment Banking Live Project.\n\nApply now to secure your slot.",
    date: "05:51 pm",
    unread: true,
  },
  {
    id: "email-3",
    senderName: "Indeed",
    senderEmail: "alert@indeed.com",
    subject: "MIS Executive at Rajlaxmi Solutions Pv...",
    snippet: "₹15000 - ₹18000 a month. *Required Skills* * Strong proficiency in *MS...",
    content: "Job Alert for Sahil Singh:\n\nMIS Executive position open at Rajlaxmi Solutions Pvt Ltd.\nSalary: ₹15,000 - ₹18,000 / month.\nRequired: MS Excel proficiency.",
    date: "04:25 pm",
    unread: false,
  },
  {
    id: "email-4",
    senderName: "GNC India",
    senderEmail: "orders@gncindia.in",
    subject: "Order GNCE2025745 confirmed",
    snippet: "Order GNCE2025745 Thank you for your purchase! Hi Sahil, we're getting...",
    content: "Thank you for your purchase!\n\nYour order GNCE2025745 has been confirmed and is being processed for shipping.",
    date: "01:06 pm",
    unread: false,
  },
  {
    id: "email-5",
    senderName: "Kotak Mid-Month Advance",
    senderEmail: "info@kotak.com",
    subject: "₹3,500 in just a few taps ⚡",
    snippet: "Instant funds. No wait. 100% digital, Sahil Singh",
    content: "Hi Sahil Singh,\n\nGet instant funds up to ₹3,500 in just a few taps with Kotak Mid-Month Advance. 100% digital process.",
    date: "12:55 pm",
    unread: false,
  },
  {
    id: "email-6",
    senderName: "Kotak",
    senderEmail: "transaction@kotak.com",
    subject: "Transaction Successful",
    snippet: "If you are unable to view the below e-mailer, please click here. Hello SAHIL...",
    content: "Hello SAHIL SINGH,\n\nYour recent transaction was successful. Thank you for banking with Kotak.",
    date: "12:01 pm",
    unread: false,
  },
];

export function Sidebar({ isCollapsed = true }: SidebarProps) {
  const { threads, activeThreadId, selectThread, createNewThread, deleteThread } = useChat();
  const [activeSection, setActiveSection] = useState<"inbox" | "ai_threads">("inbox");
  const [activeEmailId, setActiveEmailId] = useState<string>("email-1");
  const [gmailMessages, setGmailMessages] = useState<SidebarEmailItem[]>(DEFAULT_SIDEBAR_EMAILS);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Pagination state
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [prevTokensStack, setPrevTokensStack] = useState<string[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);

  // Fetch live Gmail messages (with optional pageToken and search query)
  const fetchGmailMessages = async (token?: string, query?: string) => {
    setLoadingMessages(true);
    try {
      const params = new URLSearchParams();
      if (token) params.set("pageToken", token);
      if (query) params.set("q", query);
      const url = `/api/integrations/gmail/messages${params.toString() ? `?${params.toString()}` : ""}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.nextPageToken !== undefined) {
          setNextPageToken(data.nextPageToken);
        }

        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setGmailMessages(data.messages);
          if (data.messages[0]?.id) {
            handleSelectEmail(data.messages[0]);
          }
        } else if (Array.isArray(data.messages) && data.messages.length === 0) {
          setGmailMessages([]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch Gmail messages for sidebar:", e);
    } finally {
      setLoadingMessages(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchGmailMessages();
  }, []);

  const handleSelectEmail = (mail: SidebarEmailItem) => {
    setActiveEmailId(mail.id);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("aetheris:select-email", { detail: mail }));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset pagination when searching
    setPrevTokensStack([]);
    setCurrentPageNum(1);
    setNextPageToken(null);
    setIsSearching(true);
    fetchGmailMessages(undefined, searchQuery.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPrevTokensStack([]);
    setCurrentPageNum(1);
    setNextPageToken(null);
    fetchGmailMessages();
  };

  const handleNextPage = () => {
    if (!nextPageToken) return;
    setPrevTokensStack((prev) => [...prev, nextPageToken]);
    setCurrentPageNum((prev) => prev + 1);
    fetchGmailMessages(nextPageToken, searchQuery.trim() || undefined);
  };

  const handlePrevPage = () => {
    if (currentPageNum <= 1) return;
    const newStack = [...prevTokensStack];
    newStack.pop();
    const prevToken = newStack[newStack.length - 1];
    setPrevTokensStack(newStack);
    setCurrentPageNum((prev) => Math.max(1, prev - 1));
    fetchGmailMessages(prevToken, searchQuery.trim() || undefined);
  };

  return (
    <aside
      className={cn(
        "shrink-0 border-r border-[#1b1c36] bg-[#050713]/95 flex flex-col justify-between p-3 transition-all duration-300 min-h-[calc(100vh-4rem)] z-30",
        isCollapsed ? "w-16 items-center" : "w-72"
      )}
    >
      <div className="space-y-4 w-full">
        {/* 1. TOP ACTION: NEW CHAT BUTTON (only when AI threads tab is active) */}
        {activeSection === "ai_threads" && (
          <button
            type="button"
            onClick={createNewThread}
            title={isCollapsed ? "New Chat" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border border-purple-500/40 bg-purple-950/40 py-2.5 text-xs font-mono font-bold text-purple-200 shadow-md shadow-purple-950/40 transition-all hover:bg-purple-900/60 hover:text-white w-full",
              isCollapsed ? "justify-center px-0" : "px-3"
            )}
          >
            <Plus className="h-4 w-4 shrink-0 text-purple-400" />
            {!isCollapsed && <span>New Chat</span>}
          </button>
        )}

        {/* 2. TAB SWITCHER: Gmail Inbox / AI Prompt History */}
        {!isCollapsed && (
          <div className="flex rounded-2xl bg-[#080a1e] p-1 border border-purple-500/30 text-xs font-mono shadow-inner">
            <button
              type="button"
              onClick={() => setActiveSection("inbox")}
              className={cn(
                "flex-1 py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5",
                activeSection === "inbox"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Gmail inbox</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("ai_threads")}
              className={cn(
                "flex-1 py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5",
                activeSection === "ai_threads"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>AI Prompt history</span>
            </button>
          </div>
        )}

        {/* 3. GMAIL INBOUND MAILS SIDEBAR */}
        {!isCollapsed && activeSection === "inbox" && (
          <div className="space-y-3 w-full">
            {/* Header: GMAIL INBOUND MAILS (count) */}
            <div className="flex items-center justify-between px-2 pt-1 font-mono text-[11px] font-bold tracking-widest text-slate-300 uppercase">
              <span>GMAIL INBOUND MAILS ({gmailMessages.length})</span>
              {loadingMessages && <RefreshCw className="h-3 w-3 animate-spin text-purple-400" />}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search keyword, from:, to:'
                  className="w-full rounded-xl border border-slate-800 bg-[#080a1e] py-2 pl-8 pr-7 text-[11px] font-mono text-slate-200 placeholder-slate-600 focus:border-purple-500/60 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loadingMessages || !searchQuery.trim()}
                className="shrink-0 flex items-center justify-center rounded-xl border border-purple-500/40 bg-purple-950/50 px-2.5 py-2 text-purple-300 hover:bg-purple-900/60 hover:text-white transition-all disabled:opacity-40"
                title="Search"
              >
                {isSearching ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5" />
                )}
              </button>
            </form>

            {/* Email Cards Container */}
            <div className="space-y-2.5 w-full max-h-[calc(100vh-26rem)] overflow-y-auto pr-0.5 custom-scrollbar font-mono">
              {gmailMessages.length === 0 && !loadingMessages && (
                <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                  <Search className="h-5 w-5 text-slate-600" />
                  <p className="text-[11px] font-mono text-slate-500">No emails found{searchQuery ? ` for "${searchQuery}"` : ""}.</p>
                </div>
              )}
              {gmailMessages.map((m) => {
                const isSelected = activeEmailId === m.id;

                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectEmail(m)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? "border-purple-500/60 bg-purple-950/40 text-purple-200 shadow-lg shadow-purple-950/50 ring-1 ring-purple-500/40"
                        : "border-slate-800/80 bg-[#080a1e]/80 text-slate-400 hover:border-purple-500/30 hover:bg-[#0c0f2f]"
                    }`}
                  >
                    {/* Top Row: Sender Name + Timestamp */}
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="truncate text-white max-w-[140px]">{m.senderName}</span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{m.date}</span>
                    </div>

                    {/* Middle Row: Subject Line */}
                    <p className="text-xs font-mono text-purple-300 font-semibold truncate">
                      {m.subject}
                    </p>

                    {/* Bottom Row: Snippet Preview */}
                    <p className="text-[10px] font-mono text-slate-400 line-clamp-2 leading-relaxed">
                      {m.snippet}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 4. PAGINATION NAVIGATION BUTTON */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 font-mono">
              {currentPageNum > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={loadingMessages}
                  className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-slate-800 bg-[#080a1e] py-2 text-[11px] font-bold text-slate-300 hover:border-purple-500/40 transition-all disabled:opacity-50"
                >
                  <ChevronLeft className="h-3.5 w-3.5 text-purple-400" />
                  <span>Previous</span>
                </button>
              ) : (
                <div className="text-[10px] text-slate-500 px-2">Page {currentPageNum}</div>
              )}

              <button
                type="button"
                onClick={handleNextPage}
                disabled={loadingMessages || !nextPageToken}
                className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-purple-500/40 bg-purple-950/50 py-2 text-[11px] font-bold text-purple-200 shadow-md shadow-purple-950/40 hover:bg-purple-900/60 hover:text-white transition-all disabled:opacity-40"
              >
                <span>Next 10 Mails</span>
                <ChevronRight className="h-3.5 w-3.5 text-purple-400" />
              </button>
            </div>
          </div>
        )}

        {/* 5. AI CHAT HISTORY THREADS */}
        {(isCollapsed || activeSection === "ai_threads") && (
          <div className="space-y-2 w-full">
            {!isCollapsed && (
              <div className="flex items-center justify-between px-2 pt-1 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="h-3 w-3" /> AI Prompt History
                </span>
                <span className="text-[9px] text-purple-400">{threads.length} Threads</span>
              </div>
            )}

            <div className="space-y-1 w-full max-h-[calc(100vh-16rem)] overflow-y-auto pr-0.5 custom-scrollbar">
              {threads.map((thread) => {
                const isActive = thread.id === activeThreadId;

                return (
                  <div
                    key={thread.id}
                    onClick={() => selectThread(thread.id)}
                    title={isCollapsed ? thread.title : undefined}
                    className={cn(
                      "group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-mono transition-all cursor-pointer w-full text-left",
                      isCollapsed ? "justify-center px-0 py-2.5" : "",
                      isActive
                        ? "bg-purple-600/20 text-purple-200 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.2)] font-semibold"
                        : "text-slate-400 hover:bg-[#0d102e] hover:text-slate-200 border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-colors",
                          isActive ? "text-purple-400" : "text-slate-500 group-hover:text-purple-300"
                        )}
                      />
                      {!isCollapsed && (
                        <div className="flex-1 truncate">
                          <p className="truncate text-xs">{thread.title}</p>
                          <span className="text-[9px] text-slate-500 block font-normal">{thread.updatedAt}</span>
                        </div>
                      )}
                    </div>

                    {/* Delete Thread Button */}
                    {!isCollapsed && threads.length > 1 && (
                      <button
                        type="button"
                        aria-label="Delete conversation thread"
                        onClick={(e) => deleteThread(thread.id, e)}
                        title="Delete AI prompt history thread"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER: Token Status */}
      {!isCollapsed && (
        <div className="rounded-2xl border border-purple-500/20 bg-[#090c24]/80 p-3 text-xs text-slate-400 shadow-md">
          <div className="flex items-center gap-2 text-purple-300 font-semibold mb-1">
            <Zap className="h-3.5 w-3.5 text-cyan-400" /> Neural Core Free
          </div>
          <p className="text-[11px] text-slate-400">5,000 tokens • Auto-refills every 3 days</p>
          <Link href="/settings/billing" className="mt-2 block text-[11px] font-bold text-purple-400 hover:underline">
            Upgrade with Stripe →
          </Link>
        </div>
      )}
    </aside>
  );
}
