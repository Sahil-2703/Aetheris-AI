import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { getUserContentGenerations } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    let session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      session = await auth.api.getSession({
        headers: await headers(),
      });
    }

    const userId = session?.user?.id || req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ generations: [] });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversation_id") || searchParams.get("thread_id") || undefined;

    const generations = await getUserContentGenerations(userId, 100, conversationId);
    return NextResponse.json({ generations });
  } catch (error: any) {
    console.error("Error fetching AI conversation history:", error);
    return NextResponse.json({ generations: [] });
  }
}
