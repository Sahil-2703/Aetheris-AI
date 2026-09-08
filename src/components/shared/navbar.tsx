"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#060814]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* Left: Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 shadow-lg shadow-purple-600/30 border border-purple-400/30 group-hover:scale-105 transition-all">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <span className="text-xl font-extrabold tracking-widest text-white uppercase group-hover:text-purple-300 transition-colors">
            AETHERIS <span className="text-purple-400">AI</span>
          </span>
        </Link>

        {/* Center / Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-slate-400">
          <Link href="#overview" className="hover:text-purple-400 transition-colors">
            Overview
          </Link>
          <Link href="#how-it-works" className="hover:text-purple-400 transition-colors">
            How It Works
          </Link>
          <Link href="#capabilities" className="hover:text-purple-400 transition-colors">
            Capacities
          </Link>
          <Link href="#pricing" className="hover:text-purple-400 transition-colors">
            Pricing
          </Link>
          <Link href="#faq" className="hover:text-purple-400 transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Right Corner: Pricing & Login/Signup */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/settings/billing"
            className="text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors"
          >
            Pricing
          </Link>

          <Link
            href="/sign-in"
            className="hidden sm:inline-block text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>

          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-purple-600/30 border border-purple-400/30 transition-all hover:scale-105 hover:shadow-purple-600/50"
          >
            Initiate
          </Link>
        </div>
      </div>
    </header>
  );
}

export const Navbar = LandingNavbar;
