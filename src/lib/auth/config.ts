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

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || "aetheris_development_secret_key_123456789",
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
