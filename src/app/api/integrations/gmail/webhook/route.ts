import { NextRequest, NextResponse } from "next/server";
import { recordInboxEvent } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Gmail Pub/Sub push notification handler
    if (body.message?.data) {
      const decodedData = Buffer.from(body.message.data, "base64").toString("utf-8");
      const data = JSON.parse(decodedData);
      
      const emailAddress = data.emailAddress || "user@gmail.com";
      const historyId = data.historyId || `${Date.now()}`;

      // Write push notification event into Supabase inbox_events table
      await recordInboxEvent({
        userId: emailAddress,
        provider: "gmail",
        providerMessageId: `msg_${historyId}`,
        fromAddress: "inbound@client.com",
        subject: "New Inbound Gmail Message Received",
        snippet: `Real-time push event for historyId: ${historyId}`,
      });

      console.log("Gmail push notification logged to inbox_events for:", emailAddress);
    }

    return NextResponse.json({ status: "acknowledged" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
