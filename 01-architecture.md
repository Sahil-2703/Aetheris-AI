# Architecture

## 1. High-Level System Diagram

```
                         ┌─────────────────────────────┐
                         │        Next.js App           │
                         │  (SSR pages + API routes)     │
                         │  Hosted on AWS (see 09)        │
                         └───────────┬─────────────────┘
                                     │
             ┌───────────────────────┼───────────────────────┐
             │                       │                       │
             ▼                       ▼                       ▼
     ┌───────────────┐      ┌───────────────┐       ┌────────────────┐
     │  Better Auth   │      │   Supabase     │       │   Gemini API    │
     │ (sessions,     │      │ (Postgres DB + │       │ (chat, script,  │
     │  OAuth)        │      │  Realtime +    │       │  caption, code) │
     │                │      │  RLS)          │       │                 │
     └───────────────┘      └───────┬───────┘       └────────────────┘
                                     │
                          ┌──────────┴──────────┐
                          │ Realtime broadcast    │
                          │ → subscribed clients   │
                          └──────────────────────┘

     ┌──────────────────────────────────────────────────────────┐
     │           Background / Async Layer (AWS Lambda)            │
     │  • Webhook receivers: Gmail Pub/Sub, MS Graph, Instagram    │
     │  • Scheduled poller (EventBridge) — fallback safety net    │
     │  • On new item → writes to Supabase → Realtime fires        │
     └──────────────────────────────────────────────────────────┘
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
        Gmail API   Microsoft Graph  Instagram
                        API          Graph API
```

## 2. Request Flow Examples

### 2.1 New user onboarding flow
1. User lands on `/` (public marketing dashboard, no auth).
2. Clicks "Get Started" → `/sign-up`.
3. Better Auth creates user → redirect to `/onboarding/role`.
4. User selects role → written to `profiles.role` in Supabase.
5. Redirect to `/dashboard/[role]`.
6. Dashboard shows prompt to "Connect an account" (optional) or "Continue with AI Assistant" (generic mode).

### 2.2 New Gmail email → realtime update
1. Gmail sends a Pub/Sub push notification to an AWS Lambda webhook endpoint (registered per user via Gmail watch API).
2. Lambda validates the notification, calls Gmail API to fetch the new message metadata.
3. Lambda writes a row into `inbox_events` table in Supabase (scoped to `user_id`).
4. Supabase Realtime automatically emits a Postgres change event on that table.
5. Any connected client with an active subscription on `inbox_events` for that `user_id` receives the update instantly and renders it — no refresh.

### 2.3 AI request (e.g., Employee drafts a reply)
1. Client calls a Next.js server action / route handler, e.g. `POST /api/ai/draft-email`.
2. Route handler checks the user's remaining token quota (`07-ai-token-usage.md`).
3. If within quota, route handler calls Gemini API server-side with the relevant email context.
4. Gemini response tokens (input + output) are logged to `token_usage` table.
5. Response streamed/returned to client.

## 3. Suggested Folder Structure (Next.js App Router)

```
/app
  /(marketing)
    page.tsx                  → public dashboard/landing page
  /(auth)
    /sign-in/page.tsx
    /sign-up/page.tsx
  /onboarding
    /role/page.tsx             → role selection screen
  /dashboard
    /developer/page.tsx
    /content-creator/page.tsx
    /employee/page.tsx
    /business/page.tsx
  /settings
    /integrations/page.tsx     → connect/disconnect Gmail/Outlook/Instagram
    /billing/page.tsx          → Razorpay plan management
  /api
    /auth/[...all]/route.ts    → Better Auth handler
    /ai/
      chat/route.ts
      draft-email/route.ts
      generate-script/route.ts
      generate-caption/route.ts
      code-review/route.ts
    /integrations/
      gmail/connect/route.ts
      gmail/webhook/route.ts   → (or lives in AWS Lambda, see 09)
      outlook/connect/route.ts
      outlook/webhook/route.ts
      instagram/connect/route.ts
      instagram/webhook/route.ts
    /billing/
      create-order/route.ts
      webhook/route.ts

/lib
  /supabase/client.ts
  /supabase/server.ts
  /auth/config.ts               → Better Auth config
  /ai/gemini.ts                 → Gemini client wrapper + token counting
  /integrations/gmail.ts
  /integrations/outlook.ts
  /integrations/instagram.ts
  /billing/razorpay.ts

/components
  /dashboard/...                → role-specific widgets
  /shared/...                   → existing Tailwind UI components
```

Adjust naming to match the existing Tailwind UI the user has already built — do not rename existing components/routes without checking first.

## 4. Key Non-Functional Requirements

- **Realtime latency**: updates should reach the client within a few seconds of the source event (webhook-driven, not the polling fallback).
- **Token accounting must be atomic**: use a Postgres transaction or RPC function when deducting/checking token balance to avoid race conditions on concurrent AI requests.
- **All third-party API calls (Gmail, Outlook, Instagram, Gemini, Razorpay) happen server-side only.**
- **RLS is mandatory** on every Supabase table containing user data — see `02-database-schema.md`.
