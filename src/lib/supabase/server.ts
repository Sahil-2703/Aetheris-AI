import { createClient } from "@supabase/supabase-js";

// Polyfill globalThis.WebSocket for Node < 22 server environments to prevent Supabase JS SDK initialization error
if (typeof globalThis !== "undefined" && typeof globalThis.WebSocket === "undefined") {
  (globalThis as any).WebSocket = class {
    constructor() {}
    on() {}
    send() {}
    close() {}
  };
}

function sanitizeUrl(url?: string): string {
  if (!url) return "";
  let clean = url.trim().replace(/\/+$/, "");
  clean = clean.replace(/\/rest\/v1\/?$/, "");
  return clean;
}

function getSanitizedConfig() {
  const url = sanitizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  return { url, serviceKey };
}

export function createAdminSupabaseClient() {
  const { url, serviceKey } = getSanitizedConfig();
  if (!serviceKey || !url) {
    return createClient(url || "https://placeholder.supabase.co", serviceKey || "placeholder_key", {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Ensures user record in "user" table exists first to satisfy foreign keys
 */
export async function ensureUserRecord(user: {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}) {
  const supabase = createAdminSupabaseClient();
  const userName = user.name || user.email?.split("@")[0] || "Aetheris User";
  const userEmail = user.email || `${user.id}@aetheris.ai`;

  const { error } = await supabase.from("user").upsert(
    {
      id: user.id,
      name: userName,
      email: userEmail,
      emailVerified: true,
      image: user.image || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("Warning: Failed to ensure user record in 'user' table:", error);
  }
}

/**
 * Ensures user profile, starter subscription, and token balance are initialized
 */
export async function ensureUserProfile(user: {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}) {
  const supabase = createAdminSupabaseClient();

  // 0. Ensure base "user" record exists first
  await ensureUserRecord(user);

  // 1. Check/Upsert Profile
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!existingProfile) {
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        user_id: user.id,
        full_name: user.name || "",
        avatar_url: user.image || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  }

  // 2. Check/Insert Free Subscription
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!existingSub) {
    await supabase.from("subscriptions").upsert(
      {
        user_id: user.id,
        plan: "free",
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: "user_id" }
    );
  }

  // 3. Check/Insert Starter Token Balance (5,000 free tokens, 3-day refill cycle)
  const { data: existingBalance } = await supabase
    .from("token_balances")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!existingBalance) {
    await supabase.from("token_balances").upsert(
      {
        user_id: user.id,
        period_start: new Date().toISOString(),
        period_end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        tokens_used: 0,
        tokens_limit: 5000,
      },
      { onConflict: "user_id" }
    );
  }

  return existingProfile;
}

/**
 * Get profile details for a user
 */
export async function getUserProfile(userId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching user profile:", error);
  }
  return data;
}


const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Get user token balance with automatic 3-day refill engine.
 * If 3 days (72 hours) have elapsed since period_start (or now >= period_end),
 * used tokens are automatically reset to 0 even if tokens remain in the bucket,
 * and a new 3-day refill period is started.
 */
export async function getUserTokenBalance(userId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("token_balances")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return { tokens_used: 0, tokens_limit: 5000 };
  }

  // Check if 3 days have elapsed since period_start or period_end has passed
  const now = Date.now();
  const periodStart = data.period_start ? new Date(data.period_start).getTime() : 0;
  const periodEnd = data.period_end ? new Date(data.period_end).getTime() : 0;
  const hasElapsedThreeDays = (periodStart > 0 && now - periodStart >= THREE_DAYS_MS) || (periodEnd > 0 && now >= periodEnd);

  if (hasElapsedThreeDays) {
    const newPeriodStart = new Date().toISOString();
    const newPeriodEnd = new Date(now + THREE_DAYS_MS).toISOString();

    const { data: refreshed, error: updateErr } = await supabase
      .from("token_balances")
      .update({
        tokens_used: 0,
        period_start: newPeriodStart,
        period_end: newPeriodEnd,
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (!updateErr && refreshed) {
      return refreshed;
    }

    return {
      ...data,
      tokens_used: 0,
      period_start: newPeriodStart,
      period_end: newPeriodEnd,
    };
  }

  return data;
}

/**
 * Logs token usage to token_usage table and updates token_balances (refills if 3 days passed first)
 */
export async function recordTokenUsage(
  userId: string,
  feature: string,
  inputTokens: number,
  outputTokens: number
) {
  const supabase = createAdminSupabaseClient();
  const totalTokens = inputTokens + outputTokens;

  // 1. Ensure token balance is fresh and refilled if 3 days passed
  await getUserTokenBalance(userId);

  // 2. Insert ledger entry
  await supabase.from("token_usage").insert({
    user_id: userId,
    feature,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: totalTokens,
    created_at: new Date().toISOString(),
  });

  // 3. Increment token_balances
  const { data: balance } = await supabase
    .from("token_balances")
    .select("tokens_used")
    .eq("user_id", userId)
    .single();

  if (balance) {
    await supabase
      .from("token_balances")
      .update({ tokens_used: balance.tokens_used + totalTokens })
      .eq("user_id", userId);
  }
}

/**
 * Get active subscription for a user
 */
export async function getUserSubscription(userId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching user subscription:", error);
  }
  return data;
}

/**
 * Update user subscription plan and set corresponding token allocation with 3-day refill window
 */
export async function updateUserSubscription(
  userId: string,
  plan: "free" | "premium" | "premium_pro",
  status: string = "active",
  periodEnd?: string,
  paymentId?: string,
  orderId?: string
) {
  const supabase = createAdminSupabaseClient();

  // 1. Upsert subscription record
  const subscriptionPayload: any = {
    user_id: userId,
    plan,
    status,
    updated_at: new Date().toISOString(),
  };

  if (periodEnd) {
    subscriptionPayload.current_period_end = periodEnd;
  }
  if (paymentId) {
    subscriptionPayload.payment_id = paymentId;
  }
  if (orderId) {
    subscriptionPayload.order_id = orderId;
  }

  await supabase
    .from("subscriptions")
    .upsert(subscriptionPayload, { onConflict: "user_id" });

  // 2. Determine token limit based on plan (50% reduction: Free=5k, Premium=125k, Premium Pro=500k)
  const tokenLimits: Record<string, number> = {
    free: 5000,
    premium: 125000,
    premium_pro: 500000,
  };

  const tokensLimit = tokenLimits[plan] || 5000;
  const now = Date.now();

  // Reset tokens used and start fresh 3-day refill window upon upgrade
  await supabase.from("token_balances").upsert(
    {
      user_id: userId,
      tokens_limit: tokensLimit,
      tokens_used: 0,
      period_start: new Date().toISOString(),
      period_end: new Date(now + THREE_DAYS_MS).toISOString(),
    },
    { onConflict: "user_id" }
  );

  return { plan, status, tokensLimit };
}

/**
 * Records a completed code review in Supabase
 */
export async function recordCodeReview(
  userId: string,
  inputCode: string,
  suggestedFix: string,
  issueDescription?: string
) {
  const supabase = createAdminSupabaseClient();
  await ensureUserRecord({ id: userId });
  return supabase.from("code_reviews").insert({
    user_id: userId,
    input_code: inputCode,
    issue_description: issueDescription || null,
    suggested_fix: suggestedFix,
    created_at: new Date().toISOString(),
  });
}

/**
 * Records a completed content generation in Supabase across all roles (Employee, Business, Creator, Developer)
 */
export async function recordContentGeneration(
  userId: string,
  type: string,
  promptInput: string,
  output: string,
  conversationId?: string
) {
  const supabase = createAdminSupabaseClient();
  await ensureUserRecord({ id: userId });

  const reqType = type || "general";
  
  // Format prompt_input with [THREAD:conversationId] metadata prefix if provided
  let formattedPrompt = promptInput;
  if (conversationId && !formattedPrompt.includes("[THREAD:")) {
    formattedPrompt = `[THREAD:${conversationId}] ${formattedPrompt.startsWith("[MODE:") ? formattedPrompt : `[MODE:${reqType}] ${formattedPrompt}`}`;
  } else if (!formattedPrompt.startsWith("[MODE:") && !formattedPrompt.includes("[THREAD:")) {
    formattedPrompt = `[MODE:${reqType}] ${formattedPrompt}`;
  }
  
  // Attempt 1: Try inserting with requested type
  let res = await supabase.from("content_generations").insert({
    user_id: userId,
    type: reqType,
    prompt_input: formattedPrompt,
    output,
    created_at: new Date().toISOString(),
  });

  // Attempt 2: Fallback if Postgres database enforces content_generations_type_check (code 23514)
  if (res.error && (res.error.code === "23514" || res.error.message?.includes("check constraint"))) {
    const safeType = reqType === "caption" ? "caption" : "script";
    res = await supabase.from("content_generations").insert({
      user_id: userId,
      type: safeType,
      prompt_input: formattedPrompt,
      output,
      created_at: new Date().toISOString(),
    });
  }

  if (res.error) {
    console.error("Failed to record content generation in Supabase:", res.error);
  }
  return res;
}

/**
 * Fetches stored conversation / content generations history for a given user from Supabase
 */
export async function getUserContentGenerations(userId: string, limit = 100, conversationId?: string) {
  const supabase = createAdminSupabaseClient();
  let query = supabase
    .from("content_generations")
    .select("*")
    .eq("user_id", userId);

  if (conversationId) {
    query = query.ilike("prompt_input", `%[THREAD:${conversationId}]%`);
  }

  const { data, error } = await query
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching user content generations:", error);
    return [];
  }
  return data || [];
}

/**
 * Fetch connected accounts for a given user
 */
export async function getConnectedAccounts(userId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("connected_accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    console.error("Error fetching connected accounts:", error);
    return [];
  }
  return data || [];
}

/**
 * Upsert a third-party connected account row (Gmail, Outlook, Instagram)
 */
export async function upsertConnectedAccount(
  userId: string,
  data: {
    provider: "gmail" | "outlook" | "instagram";
    provider_account_id: string;
    access_token: string;
    refresh_token?: string;
    token_expires_at?: string;
    scopes?: string[];
    watch_expiration?: string;
    status?: "active" | "expired" | "revoked";
  }
) {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("connected_accounts").upsert(
    {
      user_id: userId,
      provider: data.provider,
      provider_account_id: data.provider_account_id,
      access_token: data.access_token,
      refresh_token: data.refresh_token || null,
      token_expires_at: data.token_expires_at || null,
      scopes: data.scopes || [],
      watch_expiration: data.watch_expiration || null,
      status: data.status || "active",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider,provider_account_id" }
  );

  if (error) {
    console.error("Error upserting connected account:", error);
    throw new Error(`Failed to save connected account: ${error.message}`);
  }
}

/**
 * Revoke/disconnect a connected account
 */
export async function disconnectAccount(userId: string, provider: "gmail" | "outlook" | "instagram") {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("connected_accounts")
    .update({ status: "revoked", updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("provider", provider);

  if (error) {
    console.error(`Error disconnecting ${provider} account:`, error);
  }
}

/**
 * Record a new inbox event (Gmail / Outlook email)
 */
export async function recordInboxEvent(data: {
  userId: string;
  connectedAccountId?: string;
  provider: "gmail" | "outlook";
  providerMessageId: string;
  fromAddress: string;
  subject: string;
  snippet: string;
  receivedAt?: string;
}) {
  const supabase = createAdminSupabaseClient();
  return supabase.from("inbox_events").insert({
    user_id: data.userId,
    connected_account_id: data.connectedAccountId || null,
    provider: data.provider,
    provider_message_id: data.providerMessageId,
    from_address: data.fromAddress,
    subject: data.subject,
    snippet: data.snippet,
    received_at: data.receivedAt || new Date().toISOString(),
    created_at: new Date().toISOString(),
  });
}

/**
 * Record a new Instagram event
 */
export async function recordInstagramEvent(data: {
  userId: string;
  connectedAccountId?: string;
  mediaId: string;
  mediaType: string;
  caption?: string;
  permalink?: string;
  postedAt?: string;
}) {
  const supabase = createAdminSupabaseClient();
  return supabase.from("instagram_events").insert({
    user_id: data.userId,
    connected_account_id: data.connectedAccountId || null,
    media_id: data.mediaId,
    media_type: data.mediaType,
    caption: data.caption || null,
    permalink: data.permalink || null,
    posted_at: data.postedAt || new Date().toISOString(),
    created_at: new Date().toISOString(),
  });
}
