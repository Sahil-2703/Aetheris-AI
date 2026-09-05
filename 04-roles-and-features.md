# Roles & Dashboard Features

Each role gets a **distinct dashboard route and feature set** (`/dashboard/developer`, `/dashboard/content-creator`, `/dashboard/employee`, `/dashboard/business`). All AI-powered actions route through Gemini (see `07-ai-token-usage.md`) and consume from the same per-user token pool regardless of role.

---

## 1. Developer (`/dashboard/developer`)

**Purpose**: A code-focused workspace for debugging and improving code.

### Features
1. **Codebase view** — a panel/area where the user can paste in or upload code (single file or snippet to start; multi-file optional stretch goal).
2. **Error solving** — user pastes code + describes the error (or pastes an error/stack trace) → Gemini analyzes and returns:
   - Root cause explanation
   - A corrected code snippet
3. **Optimized code suggestions** — user submits working code → Gemini returns:
   - Suggested optimized version
   - Explanation of what changed and why (performance, readability, best practices)

### Data model
Uses `code_reviews` table (`02-database-schema.md` §10). Each submission (error-solve or optimization) is logged with `input_code`, optional `issue_description`, and the resulting `suggested_fix` / `suggested_optimization`.

### API endpoint
`POST /api/ai/code-review`
```
Request:  { code: string, language?: string, issueDescription?: string, mode: "error_fix" | "optimize" }
Response: { explanation: string, output: string }
```

### UI notes
- Code input/output should use a code editor component with syntax highlighting (e.g. Monaco or CodeMirror) — check if the existing Tailwind UI already has one before adding a new dependency.
- Show a history list of past submissions (from `code_reviews`) in a sidebar.

---

## 2. Content Creator (`/dashboard/content-creator`)

**Purpose**: Generate scripts and captions from a description or a reference image/post.

### Features
1. **Generate Script** — user provides detailed info about what they want (topic, tone, length, platform) → Gemini returns a full script.
2. **Generate Caption** — user either:
   - (a) types a detailed description of the content, or
   - (b) uploads a reference image/post (or pastes a URL to an existing Instagram post if connected)
   → Gemini returns a caption (optionally with hashtag suggestions).

### Data model
Uses `content_generations` table (`02-database-schema.md` §9). `type` distinguishes `script` vs `caption`; `reference_image_url` stores the uploaded reference file (use Supabase Storage for the actual file, store the resulting public/signed URL here).

### API endpoints
`POST /api/ai/generate-script`
```
Request:  { topic: string, tone?: string, platform?: string, lengthPreference?: string, details: string }
Response: { script: string }
```

`POST /api/ai/generate-caption`
```
Request:  { details?: string, referenceImageUrl?: string }
Response: { caption: string, hashtags?: string[] }
```

### UI notes
- Image upload uses Supabase Storage (a `content-references` bucket, private, signed URLs, user-scoped folder path `user_id/...`).
- If Instagram is connected, allow picking an existing post from `instagram_events` as the reference instead of uploading.
- Show generation history from `content_generations`.

---

## 3. Employee (`/dashboard/employee`)

**Purpose**: Help manage inbound email communication and flag delays.

### Features
1. **Draft a reply** — for any email in `inbox_events` (from connected Gmail/Outlook), user clicks "Draft Reply" → Gemini reads the email content (subject/snippet, and full body fetched on-demand from the provider API) and generates a suggested reply the user can edit and send.
2. **Escalation management** — the system (or the user manually) flags a thread/task as at risk of delay:
   - A row is created in `escalations` with a `due_at` timestamp.
   - A scheduled background check (see `09-deployment.md`) looks for `escalations` where `due_at < now()` and `status = 'open'` → marks them `escalated`, triggers a Realtime update and (optionally) a notification.
   - User can manually mark items resolved.

### Data model
Uses `inbox_events` (read, from `05-integrations.md`) and `escalations` (`02-database-schema.md` §8).

### API endpoints
`POST /api/ai/draft-email`
```
Request:  { inboxEventId: string, instructions?: string }
Response: { draft: string }
```

`POST /api/escalations` — create
`PATCH /api/escalations/:id` — update status
`GET /api/escalations` — list, filterable by status

### UI notes
- Main view: a live-updating inbox feed (Realtime-driven, see `06-realtime.md`) pulled from `inbox_events`, newest first.
- Each email row has a "Draft Reply" button and a "Flag for escalation" button.
- Separate "Escalations" panel/tab showing open/escalated items sorted by `due_at`.

---

## 4. Business (`/dashboard/business`)

**Purpose**: A superset dashboard for managing the whole company's use of the tool — includes **everything from Developer, Content Creator, and Employee**, unified in one place.

### Features
- All Developer tools (code error-solving, optimization)
- All Content Creator tools (script + caption generation)
- All Employee tools (email drafting, escalation management)
- Combined activity feed showing recent activity across all categories (recent code reviews, content generations, drafted emails, escalations) — pulls from all four tables joined/queried by `user_id`, ordered by `created_at desc`.

### UI notes
- Use a tabbed or sectioned layout (e.g. tabs: Overview / Code / Content / Email) rather than cramming everything onto one screen — reuse the same sub-components built for the other three role dashboards rather than duplicating code.
- This is the only role where all integrations (Gmail, Outlook, Instagram) and all AI tools are relevant simultaneously — make sure the "Connect Account" settings surface all three options prominently.

---

## 5. Shared "Generic AI Assistant" Mode

Regardless of role, if a user has **not connected any integration**, every dashboard should also expose a simple generic chat interface (`/api/ai/chat`) so the product is useful immediately without any setup — a general-purpose Gemini chat scoped to that role's context (e.g., Developer's generic chat leans toward code questions via system prompt, Content Creator's leans toward content questions, etc.). This does not require its own DB table beyond `token_usage` logging; conversation history can be kept client-side/in-session for v1 unless persistent chat history is explicitly requested later.
