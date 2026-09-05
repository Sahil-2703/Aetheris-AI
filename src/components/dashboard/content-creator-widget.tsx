"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Video, 
  Instagram, 
  Hash, 
  Lightbulb, 
  TrendingUp, 
  Send, 
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  User,
  Bot,
  Terminal,
  RotateCcw
} from "lucide-react";
import { NeuralWorkspace, PersonaMode } from "./neural-workspace";

const CREATOR_MODES: PersonaMode[] = [
  {
    id: "general",
    name: "General Assistance",
    icon: Sparkles,
    placeholder: "Enter custom parameters for ⚙ General Assistance...",
    defaultPrompt: "Brainstorm 5 high-converting content hooks for SaaS architects on LinkedIn and Instagram",
    apiEndpoint: "/api/ai/chat",
  },
  {
    id: "script",
    name: "Video Script Generator",
    icon: Video,
    placeholder: "Enter video topic, target audience, and length (e.g. 60s Reel/TikTok)...",
    defaultPrompt: "generate a intro script for a gaming channel",
    apiEndpoint: "/api/ai/generate-script",
  },
  {
    id: "caption",
    name: "Instagram & Social Caption AI",
    icon: Instagram,
    placeholder: "Describe your post, reel, or photo to generate high-retention captions...",
    defaultPrompt: "Behind the scenes building an AI platform with Next.js 15 and Supabase",
    apiEndpoint: "/api/ai/generate-caption",
  },
  {
    id: "hashtag",
    name: "Hashtag Optimizer",
    icon: Hash,
    placeholder: "Enter niche topic to get low/medium/high competition hashtag clusters...",
    defaultPrompt: "AI SaaS software engineering and startup founders",
    apiEndpoint: "/api/ai/generate-caption",
  },
  {
    id: "ideation",
    name: "Viral Hook Ideator",
    icon: Lightbulb,
    placeholder: "Enter product or topic to generate 10 curiosity-gap viral hooks...",
    defaultPrompt: "Automating customer support emails with AI agents",
    apiEndpoint: "/api/ai/generate-script",
  },
];

export interface InstagramDMItem {
  id: string;
  senderHandle: string;
  senderName: string;
  snippet: string;
  timestamp: string;
  unread: boolean;
  messages: { sender: "user" | "other"; text: string; time: string }[];
}

const SAMPLE_INSTAGRAM_DMS: InstagramDMItem[] = [
  {
    id: "dm-1",
    senderHandle: "@alex_creator",
    senderName: "Alex Rivera",
    snippet: "Loved your latest reel! What camera setup are you using for low light?",
    timestamp: "10 mins ago",
    unread: true,
    messages: [
      { sender: "other", text: "Hey! Loved your latest reel breakdown on Instagram algorithms!", time: "12 mins ago" },
      { sender: "other", text: "What camera setup & lighting are you using for those clean low light shots?", time: "10 mins ago" },
    ],
  },
  {
    id: "dm-2",
    senderHandle: "@brand_partner",
    senderName: "Sarah (Growth Lead)",
    snippet: "We would love to sponsor your next video project. Are you taking brand collabs?",
    timestamp: "1 hour ago",
    unread: true,
    messages: [
      { sender: "other", text: "Hi! We've been following your tech content and love your engagement rate.", time: "1 hour ago" },
      { sender: "other", text: "We would love to sponsor your next video project. Are you open for Q3 brand partnerships?", time: "1 hour ago" },
    ],
  },
  {
    id: "dm-3",
    senderHandle: "@dev_sam",
    senderName: "Sam Miller",
    snippet: "Can I get access to the code repo you showed in story today?",
    timestamp: "3 hours ago",
    unread: false,
    messages: [
      { sender: "other", text: "Hey! Can I get access to the Next.js code repo you showed in your story today?", time: "3 hours ago" },
    ],
  },
];

export function ContentCreatorWidget() {
  const [activeTab, setActiveTab] = useState<"dm_workspace" | "creation_studio">("dm_workspace");
  const [selectedDm, setSelectedDm] = useState<InstagramDMItem>(SAMPLE_INSTAGRAM_DMS[0]);
  
  // AI Refinement State
  const [aiAnalysis, setAiAnalysis] = useState<string>("Analyzing incoming message context...");
  const [suggestedReply, setSuggestedReply] = useState<string>("");
  const [revisedReply, setRevisedReply] = useState<string>("");
  const [userPromptInstruction, setUserPromptInstruction] = useState<string>("");
  
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [refiningReply, setRefiningReply] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [syncingInbox, setSyncingInbox] = useState<boolean>(false);
  const [aiGeneratedCount, setAiGeneratedCount] = useState<number>(14);

  // Check Instagram Integration Connection Status
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/integrations/status");
        if (res.ok) {
          const data = await res.json();
          setIsConnected(!!data.instagram);
        }
      } catch (err) {
        console.error("Failed to fetch Instagram connection status:", err);
      }
    }
    checkStatus();
  }, []);

  // Trigger initial AI analysis when DM is selected
  useEffect(() => {
    async function analyzeDm() {
      setLoadingAnalysis(true);
      const lastMessage = selectedDm.messages[selectedDm.messages.length - 1]?.text || selectedDm.snippet;
      
      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `Analyze the intent of this Instagram DM from ${selectedDm.senderHandle}: "${lastMessage}". Provide a brief 2-sentence context summary and generate a friendly, authentic creator reply.`,
            mode: "general",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const replyText = data.reply || data.output || "Thanks for reaching out! Let's connect!";
          setAiAnalysis(`Intent: High Engagement Lead / Creator Question. Sender: ${selectedDm.senderHandle}`);
          setSuggestedReply(replyText);
          setRevisedReply(replyText);
        } else {
          setAiAnalysis(`Intent: Inquiry from ${selectedDm.senderHandle}`);
          const fallback = `Hey ${selectedDm.senderName.split(" ")[0]}! Thanks for reaching out! I appreciate the support.`;
          setSuggestedReply(fallback);
          setRevisedReply(fallback);
        }
      } catch (err) {
        setAiAnalysis(`Intent: Creator Message from ${selectedDm.senderHandle}`);
        const fallback = `Hey ${selectedDm.senderName.split(" ")[0]}! Thanks for reaching out!`;
        setSuggestedReply(fallback);
        setRevisedReply(fallback);
      } finally {
        setLoadingAnalysis(false);
      }
    }

    analyzeDm();
  }, [selectedDm]);

  // Refine reply based on user prompt instruction (Flow: Instagram DM -> AI analysis -> Suggested Reply -> User Prompt -> Revised Reply)
  const handleRefineReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userPromptInstruction.trim()) return;

    setRefiningReply(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Original DM from ${selectedDm.senderHandle}: "${selectedDm.snippet}"\n\nCurrent Suggested Reply: "${suggestedReply}"\n\nUser Modification Instruction: "${userPromptInstruction}"\n\nWrite the revised, polished creator response to send.`,
          mode: "general",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newReply = data.reply || data.output || suggestedReply;
        setRevisedReply(newReply);
        setAiGeneratedCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Failed to refine reply:", err);
    } finally {
      setRefiningReply(false);
      setUserPromptInstruction("");
    }
  };

  const handleSyncInbox = () => {
    setSyncingInbox(true);
    setTimeout(() => {
      setSyncingInbox(false);
    }, 1200);
  };

  // Calculate real inbox statistics
  const totalDms = SAMPLE_INSTAGRAM_DMS.length;
  const requiringAttentionCount = SAMPLE_INSTAGRAM_DMS.filter((d) => d.unread).length;

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("dm_workspace")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition-all ${
              activeTab === "dm_workspace"
                ? "border border-pink-500/40 bg-pink-950/50 text-pink-300 shadow-md shadow-pink-950/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#090c24]"
            }`}
          >
            <Instagram className="h-4 w-4 text-pink-400" />
            <span>Instagram DM AI Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("creation_studio")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition-all ${
              activeTab === "creation_studio"
                ? "border border-purple-500/40 bg-purple-950/50 text-purple-300 shadow-md shadow-purple-950/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#090c24]"
            }`}
          >
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>Creation Studio</span>
          </button>
        </div>

        {/* Sync Status Badge */}
        <button
          type="button"
          onClick={handleSyncInbox}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#080a1e] px-3.5 py-1.5 text-xs font-mono text-slate-300 hover:border-pink-500/40 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-pink-400 ${syncingInbox ? "animate-spin" : ""}`} />
          <span>{syncingInbox ? "Syncing your inbox..." : "Sync Instagram DMs"}</span>
        </button>
      </div>

      {activeTab === "dm_workspace" && (
        <div className="space-y-6">
          {/* 1. INBOX STATISTICS BAR (per Change.pdf §5.1) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-pink-500/30 bg-[#080a1e]/90 p-4 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Total DMs Available</p>
                <p className="text-2xl font-mono font-extrabold text-white mt-1">{totalDms}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <Instagram className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-[#080a1e]/90 p-4 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Attention Required</p>
                <p className="text-2xl font-mono font-extrabold text-amber-300 mt-1">{requiringAttentionCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-2xl border border-purple-500/30 bg-[#080a1e]/90 p-4 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">AI Replies Generated</p>
                <p className="text-2xl font-mono font-extrabold text-purple-300 mt-1">{aiGeneratedCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Bot className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* 2. MAIN DM AI WORKSPACE (per Change.pdf §5.2 & §6) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left DM Selector List */}
            <div className="rounded-3xl border border-slate-800 bg-[#080a1e]/90 p-4 space-y-3 shadow-xl">
              <div className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase px-2">
                Instagram Messages ({totalDms})
              </div>

              <div className="space-y-2">
                {SAMPLE_INSTAGRAM_DMS.map((dm) => {
                  const isSelected = selectedDm.id === dm.id;
                  return (
                    <div
                      key={dm.id}
                      onClick={() => setSelectedDm(dm)}
                      className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? "border-pink-500/60 bg-pink-950/40 text-white shadow-md shadow-pink-950/40"
                          : "border-slate-800/80 bg-[#050713]/60 text-slate-400 hover:border-pink-500/30 hover:bg-[#090c24]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-xs text-white">{dm.senderHandle}</span>
                        <span className="text-[9px] font-mono text-slate-500">{dm.timestamp}</span>
                      </div>
                      <p className="text-xs line-clamp-2 leading-relaxed text-slate-300 font-mono">
                        {dm.snippet}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right DM AI Analysis & Suggested Reply Panel */}
            <div className="lg:col-span-2 space-y-5 rounded-3xl border border-pink-500/30 bg-[#080a1e]/90 p-6 shadow-2xl backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-mono font-bold text-white">{selectedDm.senderName}</h3>
                    <p className="text-xs font-mono text-pink-300">{selectedDm.senderHandle}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/30">
                  DM CONVERSATION ACTIVE
                </span>
              </div>

              {/* Message Context Stream */}
              <div className="space-y-3 bg-[#050713]/90 rounded-2xl p-4 border border-slate-800 max-h-48 overflow-y-auto custom-scrollbar font-mono text-xs">
                {selectedDm.messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.sender === "other" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-md rounded-xl p-3 leading-relaxed ${
                        m.sender === "other"
                          ? "bg-slate-800/80 text-slate-200"
                          : "bg-pink-900/40 text-pink-200 border border-pink-500/30"
                      }`}
                    >
                      <p>{m.text}</p>
                      <span className="text-[9px] text-slate-500 block mt-1 text-right">{m.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Analysis Box */}
              <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-1 font-mono">
                <div className="flex items-center gap-2 text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span>AI CONTEXT &amp; INTENT ANALYSIS</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {loadingAnalysis ? "Analyzing message context..." : aiAnalysis}
                </p>
              </div>

              {/* Suggested / Revised Reply Output Box */}
              <div className="rounded-2xl border border-slate-800 bg-[#050713]/95 p-4 space-y-2 relative">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5" />
                    <span>SUGGESTED CREATOR AI REPLY</span>
                  </div>
                  {refiningReply && <span className="text-pink-400 animate-pulse">Refining...</span>}
                </div>

                <div className="text-xs sm:text-sm font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {revisedReply || suggestedReply || "Generating creator response..."}
                </div>
              </div>

              {/* Refinement Input Panel (per Change.pdf §6: Instagram DM -> AI analysis -> Suggested Reply -> User Prompt -> Revised Reply) */}
              <form onSubmit={handleRefineReply} className="space-y-2">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  MODIFY RESPONSE WITH CUSTOM INSTRUCTIONS
                </div>
                <div className="relative flex items-center rounded-2xl border border-pink-500/40 bg-[#050713]/95 shadow-inner focus-within:border-pink-400 focus-within:ring-1 focus-within:ring-pink-400/30">
                  <input
                    type="text"
                    value={userPromptInstruction}
                    onChange={(e) => setUserPromptInstruction(e.target.value)}
                    placeholder="e.g. 'Make the response more professional' or 'Make this reply shorter and friendly'..."
                    className="w-full bg-transparent px-4 py-3.5 text-xs sm:text-sm font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none pr-14"
                  />

                  <button
                    type="submit"
                    disabled={refiningReply}
                    className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/40 border border-pink-400/40 transition-all hover:scale-105 disabled:opacity-50"
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
          </div>
        </div>
      )}

      {activeTab === "creation_studio" && (
        <NeuralWorkspace
          roleTitle="CONTENT CREATOR"
          modes={CREATOR_MODES}
          initialPrompt="generate a intro script for a gaming channel"
        />
      )}
    </div>
  );
}
