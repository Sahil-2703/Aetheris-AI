import Link from "next/link";
import { LandingNavbar } from "@/components/shared/navbar";
import { ShieldCheck, ArrowLeft, Lock, Key, Database, Cpu, EyeOff, Mail, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Aetheris AI",
  description: "Privacy policy, credential protection, token database storage, and Google API User Data Policy compliance for Aetheris AI.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050713] text-slate-100 selection:bg-purple-600 selection:text-white">
      <LandingNavbar />

      <main className="mx-auto max-w-4xl px-6 py-12 lg:py-16 space-y-10">
        {/* Header Breadcrumb & Title */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-950/50">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Privacy Policy
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Last updated: September 27, 2026 &bull; Data Protection &amp; Google API Policy Compliance
              </p>
            </div>
          </div>
        </div>

        {/* Highlight Callout Box: Google Compliance & AI Training Exclusion */}
        <div className="rounded-3xl border border-purple-500/40 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-purple-950/40 p-6 sm:p-8 backdrop-blur-xl space-y-4 shadow-2xl shadow-purple-950/40">
          <div className="flex items-center gap-2.5 text-purple-300 font-mono text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-purple-400" />
            <span>Google API User Data Policy &amp; Limited Use Commitment</span>
          </div>

          <p className="font-mono text-xs sm:text-sm text-slate-100 font-semibold leading-relaxed">
            &ldquo;useaetheris.com&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy?utm_source=gemini&authuser=1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-300 underline hover:text-white"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.&rdquo;
          </p>

          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-xs font-mono text-emerald-200 leading-relaxed space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Explicit AI Model Training Exclusion &amp; Zero Data Sale Guarantee</span>
            </div>
            <p className="text-slate-200">
              <strong>Google user data is NOT used for training AI models, sold, or transferred to third parties for advertising.</strong>
            </p>
            <p className="text-slate-300 text-[11px]">
              Your Gmail messages, email headers, metadata, sender information, and prompts processed by Aetheris AI are used exclusively to render real-time inbox summaries and draft responses directly for your account session. They are never ingested, leased, or disclosed to train foundation AI models or build marketing profiles.
            </p>
          </div>
        </div>

        {/* Detailed Policy Content Sections */}
        <div className="space-y-8 font-mono text-xs leading-relaxed text-slate-300">

          {/* Section 1: Credential Protection */}
          <section className="space-y-3 rounded-3xl border border-slate-800/80 bg-[#090c24]/70 p-6 sm:p-8 backdrop-blur-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-purple-400" />
              1. Credential Security &amp; Data Privacy After Submission
            </h2>
            <p>
              When you create an account or submit credentials on Aetheris AI, your data is safeguarded using multi-layer cryptographic protection:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>
                <strong className="text-slate-200">Irreversible Password Hashing:</strong> Passwords entered during sign-up or sign-in are never stored in plain text. Authentication handlers utilize irreversible cryptographic hashing algorithms (Argon2 / bcrypt) before saving authentication states.
              </li>
              <li>
                <strong className="text-slate-200">Database Row Level Security (RLS):</strong> User profiles and private workspace records are stored in Supabase PostgreSQL tables enforced with strict Row Level Security (RLS) policies. Every database operation isolates records so that only your authenticated session can access your information.
              </li>
              <li>
                <strong className="text-slate-200">HTTPS / TLS 1.3 Transport Security:</strong> All data transmitted between your browser, our Next.js backend, and database servers is encrypted in transit using mandatory HTTPS / TLS 1.3 encryption.
              </li>
            </ul>
          </section>

          {/* Section 2: Token Database Storage */}
          <section className="space-y-3 rounded-3xl border border-slate-800/80 bg-[#090c24]/70 p-6 sm:p-8 backdrop-blur-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-purple-400" />
              2. How Tokens Are Stored in the Database
            </h2>
            <p>
              Aetheris AI manages two categories of tokens: <strong>OAuth Integration Tokens</strong> (Google OAuth access &amp; refresh tokens) and <strong>AI Credit Usage Tokens</strong>. Both are stored with high-security safeguards:
            </p>
            <div className="space-y-4 pt-2">
              <div className="rounded-2xl border border-slate-800 bg-[#050713]/80 p-4 space-y-2">
                <h3 className="font-bold text-white text-xs flex items-center gap-2">
                  <Database className="h-3.5 w-3.5 text-purple-400" />
                  Google OAuth Access &amp; Refresh Tokens
                </h3>
                <p className="text-slate-400 text-[11px]">
                  When you grant Gmail access via Google OAuth 2.0, the returned OAuth access tokens and refresh tokens are encrypted at rest using server-side AES encryption and stored in isolated Supabase PostgreSQL database tables. Tokens are accessible strictly by authorized server-side integration APIs to fetch email threads or send approved drafts on your request. Third parties and unauthorized users cannot read or extract token credentials.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#050713]/80 p-4 space-y-2">
                <h3 className="font-bold text-white text-xs flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-purple-400" />
                  AI Credit Tokens &amp; Refill Cycles
                </h3>
                <p className="text-slate-400 text-[11px]">
                  AI usage tokens (e.g. 5,000 / 125,000 / 500,000 credit allocations) represent atomic quantitative usage counters stored in your user record. Every prompt execution estimates token consumption and atomically updates your balance in Supabase. Token tracking stores numerical counter metrics only and does not expose your raw credentials or private data.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Google OAuth Scopes & Usage */}
          <section className="space-y-3 rounded-3xl border border-slate-800/80 bg-[#090c24]/70 p-6 sm:p-8 backdrop-blur-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-purple-400" />
              3. Google Workspace / Gmail Scope Permissions
            </h2>
            <p>
              Aetheris AI requests only the minimum necessary Google API permissions to provide autonomous email triage:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400 text-[11px]">
              <li>
                <strong className="text-slate-200">https://www.googleapis.com/auth/gmail.readonly:</strong> Used strictly to fetch incoming email messages and headers so our Google Gemini multimodal engine can generate context summaries and intent classification highlights in your private workspace.
              </li>
              <li>
                <strong className="text-slate-200">https://www.googleapis.com/auth/gmail.send:</strong> Used strictly to dispatch drafted email replies when you explicitly initiate or confirm a response action.
              </li>
              <li>
                <strong className="text-slate-200">userinfo.email &amp; profile:</strong> Used strictly to identify your account session and display your primary Gmail address in your dashboard settings.
              </li>
            </ul>
          </section>

          {/* Section 4: Data Retention & User Rights */}
          <section className="space-y-3 rounded-3xl border border-slate-800/80 bg-[#090c24]/70 p-6 sm:p-8 backdrop-blur-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="h-4 w-4 text-purple-400" />
              4. Data Deletion, Revocation &amp; Contact Support
            </h2>
            <p>
              You maintain total control over your connected accounts and stored data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>You can disconnect your Gmail or Microsoft integration at any time from your settings page.</li>
              <li>You can revoke Aetheris AI permissions directly from your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">Google Account Permissions page</a>.</li>
              <li>You can request complete account deletion and database record erasure by emailing our data protection team at: <a href="mailto:devd34427@gmail.com" className="text-purple-400 font-bold underline">devd34427@gmail.com</a>.</li>
            </ul>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-400">
          <p>&copy; 2026 Aetheris AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-purple-400 transition-colors font-bold">
              Terms &amp; Conditions &rarr;
            </Link>
            <Link href="/" className="hover:text-purple-400 transition-colors">
              Home Page
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
