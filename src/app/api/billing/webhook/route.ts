import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/billing/stripe";
import { updateUserSubscription } from "@/lib/supabase/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    const stripe = getStripe();
    let event: Stripe.Event;

    if (secret && signature && !secret.includes("placeholder")) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, secret);
      } catch (err: any) {
        console.error("⚠️ Stripe Webhook signature verification failed:", err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
      }
    } else {
      // In development or demo mode without live webhook secret
      event = JSON.parse(rawBody) as Stripe.Event;
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId as "free" | "premium" | "premium_pro";
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        if (userId && planId) {
          console.log(`✅ Activating ${planId} plan for user ${userId} via Stripe`);
          await updateUserSubscription(
            userId,
            planId,
            "active",
            undefined,
            customerId,
            subscriptionId
          );
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const planId = subscription.metadata?.planId as "free" | "premium" | "premium_pro";
        const status = subscription.status === "active" ? "active" : subscription.status;

        if (userId && planId) {
          const periodEnd = (subscription as any).current_period_end
            ? new Date((subscription as any).current_period_end * 1000).toISOString()
            : undefined;

          await updateUserSubscription(
            userId,
            planId,
            status,
            periodEnd,
            typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id,
            subscription.id
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          console.log(`⚠️ Stripe subscription canceled for user ${userId}. Reverting to Free tier.`);
          await updateUserSubscription(userId, "free", "canceled");
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe Webhook handler error:", error);
    return NextResponse.json({ error: error.message || "Webhook handler failed" }, { status: 500 });
  }
}
