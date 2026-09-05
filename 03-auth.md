# Authentication (Better Auth)

## 1. Providers

- **Email/Password** — with email verification enabled.
- **Google OAuth** — for sign-in only (this is separate from "connect Gmail integration" in `05-integrations.md`; do not reuse the sign-in Google token for Gmail API access — request integration-specific scopes separately when the user connects Gmail).
- **Microsoft OAuth** — for sign-in only (same note: separate from connecting Outlook integration).

> **Important distinction**: Sign-in OAuth (Google/Microsoft via Better Auth) only needs basic identity scopes (email, profile). Integration OAuth (Gmail/Outlook connect flow) needs elevated scopes (`gmail.readonly`, `Mail.Read`, etc.) and is a separate, later user action from Settings → Integrations. Keep these two OAuth flows and token stores completely separate.

## 2. Better Auth Configuration Checklist

- Configure `emailAndPassword: { enabled: true, requireEmailVerification: true }`.
- Configure `socialProviders: { google: {...}, microsoft: {...} }` with client id/secret from environment variables.
- Set the Better Auth database adapter to point at the Supabase Postgres connection string (Better Auth can use its own tables in the same Postgres instance as Supabase — confirm this is set up so `user_id` foreign keys in `02-database-schema.md` resolve correctly).
- Session strategy: use Better Auth's default secure, httpOnly cookie session.
- Set `baseURL` and `trustedOrigins` correctly for both local dev and the AWS-hosted production domain.

## 3. Post-Signup Flow

1. On successful sign-up (any method), Better Auth creates the user record.
2. A `profiles` row is created for the user (via a server-side hook/callback on user creation) with `role = null`, `onboarding_completed = false`.
3. Middleware checks: if authenticated and `profiles.onboarding_completed = false`, force-redirect to `/onboarding/role` regardless of what route was requested.
4. On role selection, update `profiles.role` and set `onboarding_completed = true`, then redirect to `/dashboard/[role]`.

## 4. Role Selection Screen (`/onboarding/role`)

- Show 4 cards: **Developer**, **Content Creator**, **Employee**, **Business** — each with a short one-line description matching `04-roles-and-features.md`.
- Selecting one is a single click → immediately saves and redirects (no separate "confirm" step needed, but show a brief loading state).
- Role can be changed later from `/settings` (out of scope to lock it permanently — allow switching, which just changes which dashboard route the user lands on; it does not delete any historical data like `code_reviews` or `content_generations`).

## 5. Route Protection

- All `/dashboard/*`, `/settings/*`, `/api/ai/*`, `/api/integrations/*`, `/api/billing/*` routes require an authenticated session — enforce via Next.js middleware checking the Better Auth session cookie.
- `/`, `/sign-in`, `/sign-up` remain public.

## 6. Server-Side Session Access Pattern

Every route handler/server action that touches Supabase must:
1. Read the Better Auth session server-side to get `user_id`.
2. Use a Supabase **service-role** client (never expose the service role key to the client).
3. Explicitly filter/write queries with `user_id` from the session — since RLS via `auth.uid()` won't apply automatically (see note in `02-database-schema.md` §11), the route handler itself is the security boundary. Be strict about this: never trust a `user_id` passed from the client body/query params — always derive it from the verified session.
