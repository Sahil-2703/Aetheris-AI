import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { getInstagramAuthUrl, fetchInstagramUserData } from "@/lib/integrations/instagram";
import { upsertConnectedAccount, getUserProfile } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    const authUrl = getInstagramAuthUrl();
    return NextResponse.redirect(authUrl);
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id || "demo_user_id";

    const clientId = process.env.INSTAGRAM_CLIENT_ID || "";
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET || "";
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/integrations/instagram/connect`;

    // Instagram OAuth Code Exchange
    const tokenRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&client_secret=${clientSecret}&code=${code}`
    );

    if (!tokenRes.ok) {
      throw new Error("Failed to exchange Instagram OAuth authorization code");
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    let accountName = "instagram_creator_account";
    try {
      const igUser = await fetchInstagramUserData(accessToken);
      accountName = igUser.name || igUser.id || accountName;
    } catch (e) {
      // Fallback
    }

    const expiresAt = new Date(Date.now() + (tokenData.expires_in || 60 * 24 * 3600) * 1000).toISOString();

    await upsertConnectedAccount(userId, {
      provider: "instagram",
      provider_account_id: accountName,
      access_token: accessToken,
      token_expires_at: expiresAt,
      status: "active",
    });

    // Fetch user profile role for seamless redirect to role dashboard
    const profile = await getUserProfile(userId);
    const roleSlug = profile?.role === "content_creator" ? "content-creator" : (profile?.role || "content-creator");

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/${roleSlug}?success=instagram_connected`
    );
  } catch (error: any) {
    console.error("Instagram OAuth error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings/integrations?error=instagram_auth_failed`
    );
  }
}
