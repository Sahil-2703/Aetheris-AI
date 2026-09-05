import { createAdminSupabaseClient } from "@/lib/supabase/server";

export interface ConnectedAccountRow {
  id: string;
  user_id: string;
  provider: "gmail" | "outlook" | "instagram";
  provider_account_id: string;
  access_token: string;
  refresh_token?: string | null;
  token_expires_at?: string | null;
  status: "active" | "expired" | "revoked";
}

/**
 * Ensures access token is fresh before making API calls to Gmail, MS Graph, or Instagram.
 * If expired, uses refresh token to fetch new credentials and updates Supabase.
 */
export async function ensureFreshToken(connectedAccount: ConnectedAccountRow): Promise<string> {
  const { id, provider, access_token, refresh_token, token_expires_at } = connectedAccount;

  // 1. Check if token is still valid (buffer of 5 minutes)
  if (token_expires_at) {
    const expiresAt = new Date(token_expires_at).getTime();
    const now = Date.now();
    if (expiresAt > now + 5 * 60 * 1000) {
      return access_token;
    }
  }

  // 2. If expired and no refresh token available, mark as expired
  if (!refresh_token) {
    const supabase = createAdminSupabaseClient();
    await supabase.from("connected_accounts").update({ status: "expired" }).eq("id", id);
    throw new Error(`Integration token for ${provider} is expired. Please reconnect.`);
  }

  try {
    let newAccessToken = access_token;
    let newExpiresAt: string | null = null;

    if (provider === "gmail") {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId || "",
          client_secret: clientSecret || "",
          refresh_token,
          grant_type: "refresh_token",
        }),
      });

      if (!res.ok) throw new Error("Failed to refresh Gmail access token");
      const data = await res.json();
      newAccessToken = data.access_token;
      newExpiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString();
    } else if (provider === "outlook") {
      const clientId = process.env.MICROSOFT_CLIENT_ID;
      const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

      const res = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId || "",
          client_secret: clientSecret || "",
          refresh_token,
          grant_type: "refresh_token",
          scope: "offline_access User.Read Mail.Read Mail.Send",
        }),
      });

      if (!res.ok) throw new Error("Failed to refresh Outlook access token");
      const data = await res.json();
      newAccessToken = data.access_token;
      newExpiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString();
    } else if (provider === "instagram") {
      const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
      const res = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.INSTAGRAM_CLIENT_ID}&client_secret=${clientSecret}&fb_exchange_token=${access_token}`
      );

      if (!res.ok) throw new Error("Failed to refresh Instagram long-lived access token");
      const data = await res.json();
      newAccessToken = data.access_token;
      newExpiresAt = new Date(Date.now() + (data.expires_in || 60 * 24 * 3600) * 1000).toISOString();
    }

    // 3. Update Supabase with fresh token
    const supabase = createAdminSupabaseClient();
    await supabase
      .from("connected_accounts")
      .update({
        access_token: newAccessToken,
        token_expires_at: newExpiresAt,
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return newAccessToken;
  } catch (err: any) {
    const supabase = createAdminSupabaseClient();
    await supabase.from("connected_accounts").update({ status: "revoked" }).eq("id", id);
    throw new Error(`Token refresh failed for ${provider}: ${err.message}`);
  }
}
