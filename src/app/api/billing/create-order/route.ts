import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { getRazorpay, SUBSCRIPTION_PLANS } from "@/lib/billing/razorpay";

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

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes("your_key_id")) {
      return NextResponse.json(
        {
          error: "Razorpay credentials are not configured in .env. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
          isConfigError: true,
        },
        { status: 503 }
      );
    }

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: priceInInr * 100, // Amount in paise
      currency: "INR",
      receipt: `rcpt_${session.user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        userId: session.user.id,
        planId: plan.id,
        billingCycle,
        tokenAllocation: plan.tokens.toString(),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      planName: `Aetheris AI ${plan.name} (${isAnnual ? "Annual" : "Monthly"})`,
      user: {
        name: session.user.name || "Subscriber",
        email: session.user.email || "",
      },
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
