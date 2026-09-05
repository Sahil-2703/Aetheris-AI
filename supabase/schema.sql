-- ==============================================================================
-- AI WORKSPACE SAAS — COMPLETE SUPABASE DATABASE RESET & FRESH SCHEMA
-- Based on: 00-overview.md, 02-database-schema.md, 03-auth.md
-- ==============================================================================

-- ==============================================================================
-- STEP 1: CLEANUP / DROP EXISTING TABLES, TRIGGERS & FUNCTIONS (SAFE RESET)
-- ==============================================================================

-- Drop triggers if they exist
drop trigger if exists on_new_user_provision on "user";
drop trigger if exists on_token_usage_inserted on token_usage;

-- Drop functions if they exist
drop function if exists public.handle_new_user_provisioning() cascade;
drop function if exists public.handle_token_usage_deduction() cascade;

-- Drop application tables with CASCADE in reverse dependency order
drop table if exists public.code_reviews cascade;
drop table if exists public.content_generations cascade;
drop table if exists public.escalations cascade;
drop table if exists public.instagram_events cascade;
drop table if exists public.inbox_events cascade;
drop table if exists public.connected_accounts cascade;
drop table if exists public.token_balances cascade;
drop table if exists public.token_usage cascade;
drop table if exists public.subscriptions cascade;
drop table if exists public.profiles cascade;

-- Drop auth tables if resetting auth
drop table if exists public.verification cascade;
drop table if exists public.account cascade;
drop table if exists public.session cascade;
drop table if exists public."user" cascade;

-- Ensure pgcrypto extension is active for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ==============================================================================
-- STEP 2: CORE AUTH TABLES (BETTER AUTH / APPLICATION USERS)
-- ==============================================================================

create table public."user" (
    id text primary key,
    name text not null,
    email text not null unique,
    "emailVerified" boolean not null default false,
    image text,
    "createdAt" timestamptz not null default now(),
    "updatedAt" timestamptz not null default now()
);

create table public."session" (
    id text primary key,
    "expiresAt" timestamptz not null,
    token text not null unique,
    "createdAt" timestamptz not null default now(),
    "updatedAt" timestamptz not null default now(),
    "ipAddress" text,
    "userAgent" text,
    "userId" text not null references public."user"(id) on delete cascade
);

create table public."account" (
    id text primary key,
    "accountId" text not null,
    "providerId" text not null,
    "userId" text not null references public."user"(id) on delete cascade,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamptz,
    "refreshTokenExpiresAt" timestamptz,
    scope text,
    password text,
    "createdAt" timestamptz not null default now(),
    "updatedAt" timestamptz not null default now()
);

create table public."verification" (
    id text primary key,
    identifier text not null,
    value text not null,
    "expiresAt" timestamptz not null,
    "createdAt" timestamptz default now(),
    "updatedAt" timestamptz default now()
);

-- ==============================================================================
-- STEP 3: APPLICATION PROFILES
-- ==============================================================================

create table public.profiles (
    id text primary key references public."user"(id) on delete cascade,
    user_id text not null unique references public."user"(id) on delete cascade,
    role text check (role in ('developer', 'content_creator', 'employee', 'business') or role is null),
    full_name text,
    avatar_url text,
    onboarding_completed boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ==============================================================================
-- STEP 4: SUBSCRIPTIONS & BILLING (RAZORPAY)
-- ==============================================================================

create table public.subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id text not null unique references public."user"(id) on delete cascade,
    plan text not null default 'free' check (plan in ('free', 'pro', 'business')),
    status text not null default 'active' check (status in ('active', 'past_due', 'cancelled', 'trialing')),
    razorpay_customer_id text,
    razorpay_subscription_id text,
    current_period_start timestamptz default now(),
    current_period_end timestamptz default (now() + interval '30 days'),
    cancel_at_period_end boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ==============================================================================
-- STEP 5: TOKEN USAGE LEDGER & TOKEN BALANCES (GOOGLE GEMINI API)
-- ==============================================================================

create table public.token_usage (
    id uuid primary key default gen_random_uuid(),
    user_id text not null references public."user"(id) on delete cascade,
    feature text not null, -- e.g. 'chat', 'draft_email', 'generate_script', 'generate_caption', 'code_review'
    input_tokens int not null default 0,
    output_tokens int not null default 0,
    total_tokens int generated always as (input_tokens + output_tokens) stored,
    created_at timestamptz default now()
);

create table public.token_balances (
    user_id text primary key references public."user"(id) on delete cascade,
    period_start timestamptz default now(),
    period_end timestamptz default (now() + interval '30 days'),
    tokens_used int not null default 0,
    tokens_limit int not null default 10000, -- Free tier starts with 10,000 tokens
    updated_at timestamptz default now()
);

-- ==============================================================================
-- STEP 6: CONNECTED THIRD-PARTY ACCOUNTS (GMAIL, OUTLOOK, INSTAGRAM)
-- ==============================================================================

create table public.connected_accounts (
    id uuid primary key default gen_random_uuid(),
    user_id text not null references public."user"(id) on delete cascade,
    provider text not null check (provider in ('gmail', 'outlook', 'instagram')),
    provider_account_id text not null,
    access_token text not null,
    refresh_token text,
    token_expires_at timestamptz,
    scopes text[],
    watch_expiration timestamptz,
    status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    constraint uq_user_provider_account unique(user_id, provider, provider_account_id)
);

-- ==============================================================================
-- STEP 7: INBOX EVENTS (REAL-TIME GMAIL & OUTLOOK SYNC)
-- ==============================================================================

create table public.inbox_events (
    id uuid primary key default gen_random_uuid(),
    user_id text not null references public."user"(id) on delete cascade,
    connected_account_id uuid references public.connected_accounts(id) on delete cascade,
    provider text not null check (provider in ('gmail', 'outlook')),
    provider_message_id text not null,
    from_address text not null,
    subject text,
    snippet text,
    received_at timestamptz default now(),
    is_read_in_app boolean default false,
    created_at timestamptz default now()
);

-- ==============================================================================
-- STEP 8: INSTAGRAM EVENTS (REAL-TIME INSTAGRAM POSTS & ENGAGEMENT)
-- ==============================================================================

create table public.instagram_events (
    id uuid primary key default gen_random_uuid(),
    user_id text not null references public."user"(id) on delete cascade,
    connected_account_id uuid references public.connected_accounts(id) on delete cascade,
    media_id text not null,
    media_type text not null check (media_type in ('image', 'video', 'carousel')),
    caption text,
    permalink text,
    posted_at timestamptz default now(),
    created_at timestamptz default now()
);

-- ==============================================================================
-- STEP 9: ESCALATIONS (EMPLOYEE ROLE WORKFLOW)
-- ==============================================================================

create table public.escalations (
    id uuid primary key default gen_random_uuid(),
    user_id text not null references public."user"(id) on delete cascade,
    related_inbox_event_id uuid references public.inbox_events(id) on delete set null,
    subject text not null,
    description text,
    due_at timestamptz not null,
    status text not null default 'open' check (status in ('open', 'escalated', 'resolved')),
    escalated_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ==============================================================================
-- STEP 10: CONTENT GENERATIONS (CONTENT CREATOR ROLE)
-- ==============================================================================

create table public.content_generations (
    id uuid primary key default gen_random_uuid(),
    user_id text not null references public."user"(id) on delete cascade,
    type text not null check (type in ('script', 'caption')),
    prompt_input text not null,
    reference_image_url text,
    output text not null,
    created_at timestamptz default now()
);

-- ==============================================================================
-- STEP 11: CODE REVIEWS (DEVELOPER ROLE)
-- ==============================================================================

create table public.code_reviews (
    id uuid primary key default gen_random_uuid(),
    user_id text not null references public."user"(id) on delete cascade,
    input_code text not null,
    language text,
    issue_description text,
    suggested_fix text not null,
    suggested_optimization text,
    created_at timestamptz default now()
);

-- ==============================================================================
-- STEP 12: OPTIMIZATION INDEXES
-- ==============================================================================

create index idx_profiles_user_id on public.profiles(user_id);
create index idx_token_usage_user_id on public.token_usage(user_id);
create index idx_inbox_events_user_id on public.inbox_events(user_id, received_at desc);
create index idx_instagram_events_user_id on public.instagram_events(user_id, posted_at desc);
create index idx_escalations_user_id on public.escalations(user_id, status);
create index idx_content_generations_user_id on public.content_generations(user_id);
create index idx_code_reviews_user_id on public.code_reviews(user_id);

-- ==============================================================================
-- STEP 13: AUTOMATIC USER INITIALIZATION TRIGGER
-- ==============================================================================

create or replace function public.handle_new_user_provisioning()
returns trigger as $$
begin
    -- 1. Insert Profile
    insert into public.profiles (id, user_id, full_name, avatar_url, onboarding_completed, role)
    values (new.id, new.id, new.name, new.image, false, null)
    on conflict (id) do nothing;

    -- 2. Insert Free Tier Subscription
    insert into public.subscriptions (user_id, plan, status, current_period_start, current_period_end)
    values (new.id, 'free', 'active', now(), now() + interval '30 days')
    on conflict (user_id) do nothing;

    -- 3. Provision Free 10,000 Starter Token Quota
    insert into public.token_balances (user_id, period_start, period_end, tokens_used, tokens_limit)
    values (new.id, now(), now() + interval '30 days', 0, 10000)
    on conflict (user_id) do nothing;

    return new;
end;
$$ language plpgsql security definer;

create trigger on_new_user_provision
after insert on public."user"
for each row execute function public.handle_new_user_provisioning();

-- ==============================================================================
-- STEP 14: ATOMIC TOKEN DEDUCTION TRIGGER
-- ==============================================================================

create or replace function public.handle_token_usage_deduction()
returns trigger as $$
begin
    update public.token_balances
    set tokens_used = tokens_used + new.total_tokens,
        updated_at = now()
    where user_id = new.user_id;

    return new;
end;
$$ language plpgsql security definer;

create trigger on_token_usage_inserted
after insert on public.token_usage
for each row execute function public.handle_token_usage_deduction();

-- ==============================================================================
-- STEP 15: ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.token_usage enable row level security;
alter table public.token_balances enable row level security;
alter table public.connected_accounts enable row level security;
alter table public.inbox_events enable row level security;
alter table public.instagram_events enable row level security;
alter table public.escalations enable row level security;
alter table public.content_generations enable row level security;
alter table public.code_reviews enable row level security;

-- Permissive service role access policies
create policy "Service role full access on profiles" on public.profiles for all using (true) with check (true);
create policy "Service role full access on subscriptions" on public.subscriptions for all using (true) with check (true);
create policy "Service role full access on token_usage" on public.token_usage for all using (true) with check (true);
create policy "Service role full access on token_balances" on public.token_balances for all using (true) with check (true);
create policy "Service role full access on connected_accounts" on public.connected_accounts for all using (true) with check (true);
create policy "Service role full access on inbox_events" on public.inbox_events for all using (true) with check (true);
create policy "Service role full access on instagram_events" on public.instagram_events for all using (true) with check (true);
create policy "Service role full access on escalations" on public.escalations for all using (true) with check (true);
create policy "Service role full access on content_generations" on public.content_generations for all using (true) with check (true);
create policy "Service role full access on code_reviews" on public.code_reviews for all using (true) with check (true);

-- ==============================================================================
-- STEP 16: SUPABASE REALTIME CONFIGURATION
-- ==============================================================================

do $$
begin
    if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
        create publication supabase_realtime;
    end if;
end $$;

alter publication supabase_realtime add table public.inbox_events;
alter publication supabase_realtime add table public.instagram_events;
alter publication supabase_realtime add table public.escalations;
alter publication supabase_realtime add table public.token_balances;
