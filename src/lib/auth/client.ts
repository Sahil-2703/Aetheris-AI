import { createAuthClient } from "better-auth/react";

function getClientBaseUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "";
  return envUrl ? envUrl.replace(/\/+$/, "") : "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getClientBaseUrl(),
});

export const { signIn, signUp, useSession, signOut } = authClient;
