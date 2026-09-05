"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, User, ArrowRight, Chrome } from "lucide-react";
import { signUp, signIn } from "@/lib/auth/client";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signUp.email(
        {
          name,
          email,
          password,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Failed to create account. Please check your credentials.");
          },
        }
      );
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    try {
      const checkRes = await fetch("/api/auth/providers");
      if (checkRes.ok) {
        const providers = await checkRes.json();
        if (!providers.google) {
          setError(
            "Google OAuth is not configured yet. Please add your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET into the .env file, or use Email & Password sign-up."
          );
          return;
        }
      }

      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err: any) {
      setError("Failed to sign up with Google.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050713] px-6 py-12 text-slate-100 selection:bg-purple-600 selection:text-white">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-purple-500/30 bg-[#090c24]/90 p-8 shadow-2xl shadow-purple-950/40 backdrop-blur-xl">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-800 shadow-md shadow-purple-600/30 border border-purple-400/30">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <span className="text-xl font-extrabold tracking-widest text-white uppercase group-hover:text-purple-300 transition-colors">
              AETHERIS <span className="text-purple-400">AI</span>
            </span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">Create your account</h2>
          <p className="mt-1 text-xs text-slate-400">Get started with 10,000 free Gemini AI tokens</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-center text-xs text-amber-300 leading-relaxed">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-colors hover:border-purple-500/40 hover:bg-slate-700"
        >
          <Chrome className="h-4 w-4 text-purple-400" />
          Continue with Google
        </button>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-800" />
          <span className="absolute bg-[#090c24] px-3 text-[11px] uppercase tracking-wider text-slate-500">
            or register with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300">Full Name</label>
            <div className="relative mt-1">
              <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full rounded-xl border border-slate-800 bg-[#050713] py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">Email Address</label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full rounded-xl border border-slate-800 bg-[#050713] py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">Password</label>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-[#050713] py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-purple-600/30 border border-purple-400/30 transition-all hover:scale-102 hover:shadow-purple-600/50 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Initiate Workspace"} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-purple-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
