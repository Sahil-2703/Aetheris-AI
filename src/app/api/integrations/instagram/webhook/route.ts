import { NextRequest, NextResponse } from "next/server";
import { recordInstagramEvent } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  // Meta Instagram Webhook Hub Verification Challenge
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  const verifyToken = process.env.INSTAGRAM_CLIENT_SECRET || "instagram_verify_token";

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        if (Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            const mediaId = change.value?.media_id || `media_${Date.now()}`;
            await recordInstagramEvent({
              userId: entry.id || "instagram_user",
              mediaId,
              mediaType: change.value?.media_type || "image",
              caption: change.value?.caption || "New Instagram media post received",
              permalink: `https://instagram.com/p/${mediaId}`,
            });
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
