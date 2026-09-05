import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { getStripe, SUBSCRIPTION_PLANS } from "@/lib/billing/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to upgrade." }, { status: 401 });
    }

    const { planId, billingCycle = "monthly" } = await req.json();

    if (planId !== "premium" && planId !== "premium_pro") {
      return NextResponse.json({ error: "Invalid paid subscription plan selected." }, { status: 400 });
    }

    const plan = SUBSCRIPTION_PLANS[planId as "premium" | "premium_pro"];
    if (!plan) {
      return NextResponse.json({ error: "Plan configuration not found." }, { status: 404 });
    }

    const isAnnual = billingCycle === "annually";
    const priceInInr = isAnnual ? plan.priceAnnually : plan.priceMonthly;

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
      return NextResponse.json(
        {
          error: "Stripe API is not configured yet. Please provide STRIPE_SECRET_KEY in your .env file.",
          isConfigError: true,
        },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: session.user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Aetheris AI ${plan.name}`,
              description: `${plan.tokens.toLocaleString()} tokens with 3-day automatic refill (${isAnnual ? "Annual" : "Monthly"} Billing)`,
            },
            unit_amount: priceInInr * 100, // Amount in paise
            recurring: {
              interval: isAnnual ? "year" : "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        planId: plan.id,
        billingCycle,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          planId: plan.id,
          billingCycle,
        },
      },
      success_url: `${appUrl}/settings/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/settings/billing?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Session error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Stripe Checkout session" },
      { status: 500 }
    );
  }
}

