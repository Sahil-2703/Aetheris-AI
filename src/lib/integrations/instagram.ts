export const INSTAGRAM_SCOPES = [
  "instagram_basic",
  "instagram_content_publish",
  "instagram_manage_comments",
  "instagram_manage_insights",
  "pages_show_list",
  "pages_read_engagement",
];

export function getInstagramAuthUrl(): string {
  const clientId = process.env.INSTAGRAM_CLIENT_ID || "";
  const redirectUri = encodeURIComponent(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/integrations/instagram/connect`
  );
  const scope = encodeURIComponent(INSTAGRAM_SCOPES.join(","));

  return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
}

export async function fetchInstagramUserData(accessToken: string) {
  const res = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,accounts{id,name,instagram_business_account}&access_token=${accessToken}`);
  if (!res.ok) {
    throw new Error("Failed to fetch Instagram account details");
  }
  return res.json();
}
