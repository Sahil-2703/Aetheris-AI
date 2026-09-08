import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { updateUserSubscription } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    if (secret && signature && !secret.includes("your_razorpay_webhook_secret")) {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.error("⚠️ Razorpay Webhook signature mismatch");
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    console.log("Razorpay Webhook Event Received:", event.event);

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity || {};
      const orderEntity = event.payload?.order?.entity || {};
      const notes = paymentEntity.notes || orderEntity.notes || {};

      const userId = notes.userId;
      const planId = notes.planId as "free" | "premium" | "premium_pro";

      if (userId && planId) {
        console.log(`✅ Activating ${planId} plan for user ${userId} via Razorpay Webhook`);
        await updateUserSubscription(
          userId,
          planId,
          "active",
          undefined,
          paymentEntity.id,
          orderEntity.id || paymentEntity.order_id
        );
      }
    } else if (event.event === "subscription.cancelled" || event.event === "subscription.halted") {
      const subEntity = event.payload?.subscription?.entity || {};
      const notes = subEntity.notes || {};
      const userId = notes.userId;

      if (userId) {
        console.log(`⚠️ Subscription ended for user ${userId}. Reverting to Free tier.`);
        await updateUserSubscription(userId, "free", "canceled");
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Razorpay Webhook error:", error);
    return NextResponse.json({ error: error.message || "Webhook handler failed" }, { status: 500 });
  }
}
