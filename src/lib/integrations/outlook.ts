import { Client } from "@microsoft/microsoft-graph-client";

export const OUTLOOK_SCOPES = [
  "offline_access",
  "User.Read",
  "Mail.Read",
  "Mail.Send",
];

export function getOutlookAuthUrl(): string {
  const clientId = process.env.MICROSOFT_CLIENT_ID || "";
  const redirectUri = encodeURIComponent(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/integrations/outlook/connect`
  );
  const scope = encodeURIComponent(OUTLOOK_SCOPES.join(" "));

  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=${scope}&state=outlook_oauth`;
}

export function getOutlookGraphClient(accessToken: string) {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}
