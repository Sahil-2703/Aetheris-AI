import Link from "next/link";
import { LandingNavbar } from "@/components/shared/navbar";
import { ShieldCheck, ArrowLeft, FileText, Lock, Scale, Mail, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions | Aetheris AI",
  description: "Terms and conditions, AI ethics, legal governance, and data storage policy for Aetheris AI.",
};

export default function TermsPage() {
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
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Terms and Conditions
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Last updated: September 27, 2026 &bull; Governance &amp; Legal Framework
              </p>
            </div>
          </div>
        </div>

        {/* Important Notice Callout */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 text-xs text-amber-200 leading-relaxed font-mono shadow-inner">
          <strong className="text-amber-100 uppercase tracking-wider block mb-1">
            Important Legal Notice
          </strong>
          Please read these Terms and Conditions thoroughly before accessing or using Aetheris AI services. By creating an account, logging in, or connecting third-party providers (such as Google Gmail), you acknowledge and agree to be bound by the terms outlined below.
        </div>

        {/* Terms Content Sections */}
        <div className="space-y-8 font-mono text-xs leading-relaxed text-slate-300">
          {/* Section 1 */}
          <section className="space-y-3 rounded-3xl border border-slate-800/80 bg-[#090c24]/70 p-6 sm:p-8 backdrop-blur-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-400" />
              1. Acceptance of Terms &amp; Service Scope
            </h2>
            <p>
              By accessing, registering for, or utilizing Aetheris AI (accessible via <strong>useaetheris.com</strong>), you agree to comply with these Terms and Conditions, as well as our{" "}
              <Link href="/privacy" className="text-purple-400 underline hover:text-purple-300">
                Privacy Policy
              </Link>
              .
            </p>
            <p>
              Aetheris AI provides autonomous email triage, intelligent summary generation, draft composition, and multimodal AI workflow execution powered by Google Gemini models and Supabase cloud database architecture.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 rounded-3xl border border-slate-800/80 bg-[#090c24]/70 p-6 sm:p-8 backdrop-blur-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-purple-400" />
              2. Account Responsibilities &amp; Credential Security
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your account authentication credentials. All actions performed under your authenticated session are your sole responsibility.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Passwords must meet strength standards and are stored using irreversible cryptographic hashes.</li>
              <li>You must notify us immediately at <strong>devd34427@gmail.com</strong> if you suspect unauthorized access to your account.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 rounded-3xl border border-slate-800/80 bg-[#090c24]/70 p-6 sm:p-8 backdrop-blur-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              3. AI Ethics &amp; Verification Responsibility
            </h2>
            <p>
              Aetheris AI is engineered adhering to principles of responsible artificial intelligence, fairness, and safety. All AI-generated email summaries, context insights, and reply drafts are recommendations provided to assist your workflow.
            </p>
            <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-4 text-[11px] text-purple-200">
              <strong>User Verification Requirement:</strong> As the user, you retain ultimate responsibility for reviewing, editing, and verifying the accuracy and appropriateness of any generated draft before sending it to third parties.
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 rounded-3xl border border-slate-800/80 bg-[#090c24]/70 p-6 sm:p-8 backdrop-blur-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-400" />
              4. Token Quotas &amp; Subscription Terms
            </h2>
            <p>
              All subscription tiers (Free, Premium, Premium Pro) include atomic AI token quotas that automatically replenish every 3 days (72 hours).
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Payments processed through Razorpay are subject to Razorpay&apos;s terms of service and security standards.</li>
              <li>You may manage or cancel your active subscription plan at any time through your billing settings dashboard.</li>
              <li>Token refill cycles operate asynchronously based on account creation and subscription upgrade timestamps.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 rounded-3xl border border-slate-800/80 bg-[#090c24]/70 p-6 sm:p-8 backdrop-blur-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="h-4 w-4 text-purple-400" />
              5. Google API Services Compliance
            </h2>
            <p className="text-slate-200 font-semibold">
              Aetheris AI&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 underline hover:text-purple-300"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
            <p className="text-slate-400 text-[11px]">
              Detailed information on how Google user data is protected, stored, and isolated is set forth in our{" "}
              <Link href="/privacy" className="text-purple-400 underline hover:text-purple-300">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 rounded-3xl border border-slate-800/80 bg-[#090c24]/70 p-6 sm:p-8 backdrop-blur-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="h-4 w-4 text-purple-400" />
              6. Disconnection &amp; Data Erasure Rights
            </h2>
            <p>
              You hold the complete right to disconnect your third-party integrations (Gmail, Outlook, Instagram) or request complete deletion of your account and associated stored data at any time.
            </p>
            <p className="text-slate-400">
              To request full account erasure, contact our data governance team at:{" "}
              <a href="mailto:devd34427@gmail.com" className="text-purple-400 underline font-semibold">
                devd34427@gmail.com
              </a>
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-400">
          <p>&copy; 2026 Aetheris AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-purple-400 transition-colors font-bold">
              Privacy Policy &rarr;
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
