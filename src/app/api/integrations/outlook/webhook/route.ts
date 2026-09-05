import { NextRequest, NextResponse } from "next/server";
import { recordInboxEvent } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const validationToken = req.nextUrl.searchParams.get("validationToken");

  // MS Graph webhook handshake verification
  if (validationToken) {
    return new NextResponse(validationToken, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  try {
    const body = await req.json();

    if (Array.isArray(body.value)) {
      for (const notification of body.value) {
        const messageId = notification.resourceData?.id || `msg_${Date.now()}`;
        await recordInboxEvent({
          userId: notification.clientState || "outlook_user",
          provider: "outlook",
          providerMessageId: messageId,
          fromAddress: "inbound@enterprise.com",
          subject: "New Inbound Outlook Message Received",
          snippet: `MS Graph notification for resource: ${notification.resource || "Inbox"}`,
        });
      }
    }

    return NextResponse.json({ status: "acknowledged" }, { status: 202 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
