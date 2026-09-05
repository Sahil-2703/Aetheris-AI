import { NextResponse } from "next/server";

export async function GET() {
  const googleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    !process.env.GOOGLE_CLIENT_ID.includes("placeholder") &&
    process.env.GOOGLE_CLIENT_SECRET &&
    !process.env.GOOGLE_CLIENT_SECRET.includes("placeholder")
  );

  const microsoftConfigured = Boolean(
    process.env.MICROSOFT_CLIENT_ID &&
    !process.env.MICROSOFT_CLIENT_ID.includes("placeholder") &&
    process.env.MICROSOFT_CLIENT_SECRET &&
    !process.env.MICROSOFT_CLIENT_SECRET.includes("placeholder")
  );

  return NextResponse.json({
    google: googleConfigured,
    microsoft: microsoftConfigured,
  });
}
