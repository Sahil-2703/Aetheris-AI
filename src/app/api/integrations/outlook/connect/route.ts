import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { getOutlookAuthUrl } from "@/lib/integrations/outlook";
import { upsertConnectedAccount, getUserProfile } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    const authUrl = getOutlookAuthUrl();
    return NextResponse.redirect(authUrl);
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id || "demo_user_id";

    const clientId = process.env.MICROSOFT_CLIENT_ID || "";
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET || "";
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/integrations/outlook/connect`;

    // MS Graph Token Exchange
    const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      throw new Error("Failed to exchange MS Graph authorization code");
    }

    const tokenData = await tokenRes.json();

    // Fetch Outlook profile
    const profileRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    let email = "outlook_user@outlook.com";
    if (profileRes.ok) {
      const profile = await profileRes.json();
      email = profile.mail || profile.userPrincipalName || email;
    }

    const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString();

    await upsertConnectedAccount(userId, {
      provider: "outlook",
      provider_account_id: email,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || undefined,
      token_expires_at: expiresAt,
      scopes: tokenData.scope ? tokenData.scope.split(" ") : [],
      status: "active",
    });

    // Fetch user profile role for seamless redirect to role dashboard
    const profile = await getUserProfile(userId);
    const roleSlug = profile?.role === "content_creator" ? "content-creator" : (profile?.role || "employee");

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/${roleSlug}?success=outlook_connected`
    );
  } catch (error: any) {
    console.error("Outlook OAuth error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings/integrations?error=outlook_auth_failed`
    );
  }
}
