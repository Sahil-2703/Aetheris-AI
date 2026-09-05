# Project Overview — AI Workspace SaaS

> **Read this file first.** This is the entry point for all AI coding assistants (Cursor, Antigravity, etc.) working on this project. It links to every other spec file. Always cross-check `04-roles-and-features.md`, `05-integrations.md`, and `02-database-schema.md` before implementing any feature — do not guess at schema, roles, or API contracts.

## 1. What This Product Is

A multi-tenant SaaS platform where a user:

1. Lands on a **public marketing dashboard** that explains what the product does (no login required).
2. Clicks **Login / Sign Up**.
3. After authenticating, is asked to **select a role**: `developer`, `content_creator`, `employee`, or `business`.
4. Based on the role, is routed to a **role-specific dashboard** with distinct tools (see `04-roles-and-features.md`).
5. Can **connect third-party accounts** (Gmail, Outlook, Instagram) or use the platform as a **generic AI assistant** without connecting anything.
6. Gets a **limited free token quota** (Gemini API tokens) and can **upgrade to a paid plan** (Razorpay) for more usage.
7. Receives **real-time updates** (no manual refresh) when a new email arrives in Gmail/Outlook or a new post appears on connected Instagram accounts.

## 2. Confirmed Tech Stack

| Layer | Choice |
|---|---|
| Frontend + Backend | **Next.js** (App Router, SSR + client rendering, API routes / route handlers for backend logic) |
| Styling | **Tailwind CSS** (UI already built by the user — reuse existing components, don't rebuild from scratch) |
| Database | **Supabase** (Postgres) |
| Realtime | **Supabase Realtime** (Postgres change data capture + broadcast channels) |
| Auth | **Better Auth** — Email/Password + Google OAuth + Microsoft OAuth |
| AI | **Google Gemini API** |
| Payments / Subscriptions | **Razorpay** |
| Hosting | **AWS** (see `09-deployment.md` for the specific architecture) |

This stack is final. Do not suggest or silently switch to Vercel, Firebase, Clerk, Auth0, Stripe, OpenAI, etc.

## 3. Document Index

| File | Purpose |
|---|---|
| `00-overview.md` | This file — product summary, stack, index |
| `01-architecture.md` | System architecture, folder structure, request flow diagrams |
| `02-database-schema.md` | Full Supabase Postgres schema (tables, columns, RLS policies) |
| `03-auth.md` | Better Auth configuration, session handling, role selection flow |
| `04-roles-and-features.md` | Per-role dashboard features in detail (Developer/Content Creator/Employee/Business) |
| `05-integrations.md` | Gmail, Outlook, Instagram OAuth + webhook + polling implementation |
| `06-realtime.md` | Supabase Realtime channels, event contracts, frontend subscription pattern |
| `07-ai-token-usage.md` | Gemini API integration, token counting/metering, quota enforcement |
| `08-subscription-billing.md` | Razorpay integration, plan tiers, upgrade/downgrade/webhook handling |
| `09-deployment.md` | AWS deployment architecture (hosting + background jobs) |

## 4. Core Product Principles (apply everywhere)

- **Multi-tenant by user, not by organization** (v1) — every row of user-owned data is scoped by `user_id`. Org/team accounts are out of scope for v1 unless explicitly added later.
- **Role is a user attribute, not a permission system** — a user picks one role at onboarding, which determines default dashboard and available AI tools. It is not a security boundary; use Supabase RLS (`user_id`) for actual data access control, not role.
- **Free tier is token-metered**, not feature-gated — free users can access every role's tools, but are limited by Gemini token consumption (see `07-ai-token-usage.md`). Paid tiers primarily raise token limits and add integration limits (see `08-subscription-billing.md`).
- **No page refresh required** for new-email/new-post updates — always implemented via Supabase Realtime pushing to the client (see `06-realtime.md`), never client-side polling of the DB.
- **All secrets (API keys, OAuth client secrets, Razorpay keys, Gemini key) live server-side only** — never exposed to the client bundle. Use Next.js server actions / route handlers as the boundary.

## 5. Out of Scope for V1 (do not build unless asked)

- Team/organization multi-seat accounts
- Mobile apps (web-responsive only, Tailwind UI already handles this)
- Additional integrations beyond Gmail, Outlook, Instagram
- White-labeling / custom domains for customers
- Admin analytics dashboard (internal, for the SaaS owner) — separate future spec
