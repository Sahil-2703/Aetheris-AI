import { betterAuth } from "better-auth";
import { Pool } from "pg";

const connectionString = (process.env.DATABASE_URL || "").trim();
const isLiveDb =
  Boolean(connectionString) &&
  !connectionString.includes("yourpassword") &&
  !connectionString.includes("placeholder") &&
  !connectionString.includes("[YOUR-SUPABASE-DB-PASSWORD]");

let pool: Pool | undefined = undefined;

if (isLiveDb) {
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes("supabase.co") || connectionString.includes("pooler.supabase.com")
      ? { rejectUnauthorized: false }
      : undefined,
  });
}

function getBaseUrl(): string {
  const raw = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "";
  if (raw && raw.trim().length > 0) {
    return raw.trim().replace(/\/+$/, "");
  }
  return "http://localhost:3000";
}

const rawOrigins = [
  "http://localhost:3000",
  process.env.BETTER_AUTH_URL,
  process.env.NEXT_PUBLIC_APP_URL,
  getBaseUrl(),
];

const trustedOrigins = Array.from(
  new Set(
    rawOrigins
      .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
      .map((u) => u.trim().replace(/\/+$/, ""))
  )
);

export const auth = betterAuth({
  database: pool,
  baseURL: getBaseUrl(),
  secret: process.env.BETTER_AUTH_SECRET || "aetheris_development_secret_key_123456789",
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder-google-client-secret",
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID || "placeholder-microsoft-client-id",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "placeholder-microsoft-client-secret",
    },
  },
});
