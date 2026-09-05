"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  ChevronDown, 
  LogOut, 
  Settings, 
  CreditCard,
  Sparkles,
  Menu,
  Crown
} from "lucide-react";
import { TokenMeter } from "./token-meter";
import { signOut } from "@/lib/auth/client";

interface HeaderProps {
  title?: string;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export function Header({ 
  title = "Dashboard", 
  onToggleSidebar,
  isSidebarCollapsed
}: HeaderProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    tokensUsed: number;
    tokensLimit: number;
  }>({
    name: "Architect",
    email: "user@aetheris.ai",
    tokensUsed: 0,
    tokensLimit: 5000,
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch live user profile and token balance
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setUserData({
            name: data.profile?.full_name || data.user?.name || "Architect",
            email: data.user?.email || "user@aetheris.ai",
            tokensUsed: data.tokenBalance?.tokens_used || 0,
            tokensLimit: data.tokenBalance?.tokens_limit || 5000,
          });
        }
      } catch (err) {
        console.error("Failed to load user profile in header:", err);
      }
    }
    fetchUserProfile();
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/sign-in");
          },
        },
      });
    } catch (err) {
      console.error("Logout error:", err);
      router.push("/sign-in");
    } finally {
      setLoggingOut(false);
      setDropdownOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#1b1c36] bg-[#050713]/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Hamburger + Logo */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-500/30 bg-[#0d102e]/80 text-purple-300 hover:border-purple-400 hover:bg-purple-950/50 hover:text-white transition-all"
        >
          <Menu className="h-4 w-4" />
        </button>

        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-800 shadow-md shadow-purple-600/30 border border-purple-400/40">
            <Sparkles className="h-4 w-4 text-white animate-pulse" />
          </div>
          <span className="hidden sm:inline-block text-sm font-extrabold tracking-widest text-white uppercase group-hover:text-purple-300 transition-colors">
            AETHERIS <span className="text-purple-400">AI</span>
          </span>
        </Link>
      </div>

      {/* Center: AI Workflow Operations Pill (From Reference Image) */}
      <div className="hidden md:flex items-center gap-2 rounded-full border border-purple-500/30 bg-[#0a0d2a]/80 px-4 py-1 shadow-[0_0_15px_rgba(147,51,234,0.15)] backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-[10px] font-mono tracking-widest uppercase text-slate-300 font-bold">
          AI WORKFLOW OPERATIONS
        </span>
      </div>

      {/* Right: Upgrade Button + Token Meter + Account Dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        <div className="hidden lg:block">
          <TokenMeter usedTokens={userData.tokensUsed} totalTokens={userData.tokensLimit} />
        </div>

        {/* Upgrade CTA (From Reference Image) */}
        <Link
          href="/settings/billing"
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-md shadow-purple-600/30 border border-purple-400/40 transition-all hover:scale-105 hover:shadow-purple-600/50"
        >
          <Crown className="h-3 w-3 text-amber-300" />
          <span>UPGRADE</span>
        </Link>

        <button
          type="button"
          aria-label="Notifications"
          className="hidden sm:flex rounded-xl border border-slate-800 bg-[#090c24] p-2 text-slate-400 hover:border-purple-500/40 hover:text-slate-200 transition-colors"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* User Account Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            className={`flex items-center gap-2 rounded-full border px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${
              dropdownOpen
                ? "border-purple-500/60 bg-purple-950/40 text-white ring-2 ring-purple-500/20 shadow-lg shadow-purple-900/30"
                : "border-slate-800 bg-[#090c24] text-slate-200 hover:border-purple-500/40 hover:bg-[#0d102e]"
            }`}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-[11px] font-bold text-white shadow-inner">
              {userData.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline font-medium text-slate-200 max-w-[100px] truncate">
              {userData.name}
            </span>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180 text-purple-400" : ""}`} />
          </button>

          {/* Dropdown Menu Box */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-purple-500/30 bg-[#090c24]/95 p-2.5 shadow-2xl shadow-purple-950/50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User Header Summary */}
              <div className="rounded-xl bg-[#050713]/80 p-3 border border-slate-800/80 mb-2">
                <p className="text-xs font-bold text-white truncate">{userData.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{userData.email}</p>
              </div>

              {/* Action Links */}
              <div className="space-y-1">
                <Link
                  href="/settings/integrations"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:bg-purple-950/40 hover:text-purple-300 transition-colors"
                >
                  <Settings className="h-4 w-4 text-purple-400" />
                  <span>Integrations & Keys</span>
                </Link>

                <Link
                  href="/settings/billing"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:bg-purple-950/40 hover:text-purple-300 transition-colors"
                >
                  <CreditCard className="h-4 w-4 text-purple-400" />
                  <span>Billing & Subscription</span>
                </Link>
              </div>

              <div className="my-1.5 border-t border-slate-800" />

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                <span>{loggingOut ? "Signing Out..." : "Log Out"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
