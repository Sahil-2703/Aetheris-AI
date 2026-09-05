import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { getGmailAuthUrl, getGmailOAuthClient } from "@/lib/integrations/gmail";
import { upsertConnectedAccount } from "@/lib/supabase/server";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    try {
      const url = getGmailAuthUrl();
      return NextResponse.redirect(url);
    } catch (e: any) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings/integrations?error=oauth_init_failed`
      );
    }
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id || "demo_user_id";

    const oauth2Client = getGmailOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch Google User Profile Email
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userinfo = await oauth2.userinfo.get();
    const email = userinfo.data.email || "gmail_user@gmail.com";

    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date).toISOString()
      : new Date(Date.now() + 3600 * 1000).toISOString();

    await upsertConnectedAccount(userId, {
      provider: "gmail",
      provider_account_id: email,
      access_token: tokens.access_token || "sample_access_token",
      refresh_token: tokens.refresh_token || undefined,
      token_expires_at: expiresAt,
      scopes: tokens.scope ? tokens.scope.split(" ") : [],
      status: "active",
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?success=gmail_connected`
    );
  } catch (error: any) {
    console.error("Gmail OAuth error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings/integrations?error=gmail_auth_failed`
    );
  }
}
