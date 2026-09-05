# Database Schema (Supabase / Postgres)

> All tables use `uuid` primary keys (`default gen_random_uuid()`), `created_at`/`updated_at` timestamps (`default now()`), and **Row Level Security (RLS) enabled** with a policy restricting access to `auth.uid() = user_id` unless noted otherwise. Better Auth manages its own `user`/`session`/`account` tables — the tables below reference Better Auth's user id as `user_id`.

## 1. `profiles`
Extends the Better Auth user with product-specific data.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, references Better Auth user id |
| user_id | uuid | FK → Better Auth user, unique |
| role | text | enum: `developer` \| `content_creator` \| `employee` \| `business` |
| full_name | text | |
| avatar_url | text | nullable |
| onboarding_completed | boolean | default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## 2. `subscriptions`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK, unique (one active subscription per user) |
| plan | text | enum: `free` \| `pro` \| `business` |
| status | text | enum: `active` \| `past_due` \| `cancelled` \| `trialing` |
| razorpay_customer_id | text | nullable |
| razorpay_subscription_id | text | nullable |
| current_period_start | timestamptz | |
| current_period_end | timestamptz | |
| cancel_at_period_end | boolean | default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## 3. `token_usage`
Append-only ledger of Gemini token consumption. See `07-ai-token-usage.md` for quota logic.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK |
| feature | text | e.g. `chat`, `draft_email`, `generate_script`, `generate_caption`, `code_review` |
| input_tokens | int | |
| output_tokens | int | |
| total_tokens | int | generated column: input_tokens + output_tokens |
| created_at | timestamptz | |

## 4. `token_balances`
Fast-lookup current balance (denormalized, updated via trigger/RPC on every `token_usage` insert).

| Column | Type | Notes |
|---|---|---|
| user_id | uuid | PK, FK |
| period_start | timestamptz | start of current billing/quota period |
| period_end | timestamptz | end of current billing/quota period |
| tokens_used | int | default 0 |
| tokens_limit | int | derived from plan at period start |
| updated_at | timestamptz | |

## 5. `connected_accounts`
One row per third-party integration a user has connected.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK |
| provider | text | enum: `gmail` \| `outlook` \| `instagram` |
| provider_account_id | text | external account id/email |
| access_token | text | **encrypted at rest** |
| refresh_token | text | **encrypted at rest**, nullable (Instagram long-lived tokens may not have one) |
| token_expires_at | timestamptz | nullable |
| scopes | text[] | granted OAuth scopes |
| watch_expiration | timestamptz | nullable — for Gmail watch / MS Graph subscription renewal tracking |
| status | text | enum: `active` \| `expired` \| `revoked` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

> Unique constraint: (`user_id`, `provider`, `provider_account_id`) — a user can connect multiple accounts of the same provider if needed later, but v1 UI assumes one per provider.

## 6. `inbox_events`
Normalized new-email events from Gmail/Outlook, used to drive Realtime + the Employee dashboard's "recent emails" feed.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK |
| connected_account_id | uuid | FK → connected_accounts |
| provider | text | `gmail` \| `outlook` |
| provider_message_id | text | |
| from_address | text | |
| subject | text | |
| snippet | text | |
| received_at | timestamptz | |
| is_read_in_app | boolean | default false |
| created_at | timestamptz | |

## 7. `instagram_events`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK |
| connected_account_id | uuid | FK → connected_accounts |
| media_id | text | |
| media_type | text | `image` \| `video` \| `carousel` |
| caption | text | nullable |
| permalink | text | |
| posted_at | timestamptz | |
| created_at | timestamptz | |

## 8. `escalations`
Employee role feature — tracks delayed processes flagged for escalation.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK |
| related_inbox_event_id | uuid | FK → inbox_events, nullable |
| subject | text | |
| description | text | |
| due_at | timestamptz | expected resolution time |
| status | text | enum: `open` \| `escalated` \| `resolved` |
| escalated_at | timestamptz | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## 9. `content_generations`
Content Creator role — history of generated scripts/captions.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK |
| type | text | `script` \| `caption` |
| prompt_input | text | user's description |
| reference_image_url | text | nullable — uploaded reference image/post |
| output | text | generated result |
| created_at | timestamptz | |

## 10. `code_reviews`
Developer role — history of error-solving / optimization requests.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK |
| input_code | text | |
| language | text | nullable |
| issue_description | text | nullable — user-reported error |
| suggested_fix | text | |
| suggested_optimization | text | nullable |
| created_at | timestamptz | |

## 11. RLS Policy Pattern

Apply this pattern to every table above:

```sql
alter table <table_name> enable row level security;

create policy "Users can read own rows"
  on <table_name> for select
  using (auth.uid() = user_id);

create policy "Users can insert own rows"
  on <table_name> for insert
  with check (auth.uid() = user_id);

create policy "Users can update own rows"
  on <table_name> for update
  using (auth.uid() = user_id);
```

> Note: since Better Auth (not Supabase Auth) manages sessions, `auth.uid()` will NOT be populated automatically. Use a Supabase service-role client for all server-side writes (route handlers), and pass `user_id` explicitly from the Better Auth session — do not rely on Supabase's built-in `auth.uid()` unless Better Auth is configured to sync into Supabase's auth schema. Document the exact approach chosen in `03-auth.md` before implementing RLS.

## 12. Realtime Publication

Enable Realtime on tables clients need to subscribe to directly:

```sql
alter publication supabase_realtime add table inbox_events;
alter publication supabase_realtime add table instagram_events;
alter publication supabase_realtime add table escalations;
alter publication supabase_realtime add table token_balances;
```
