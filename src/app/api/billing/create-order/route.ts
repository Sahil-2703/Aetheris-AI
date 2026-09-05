import { NextRequest, NextResponse } from "next/server";
import { getRazorpay, PLAN_TIERS } from "@/lib/billing/razorpay";

export async function POST(req: NextRequest) {
  try {
    const { planId } = await req.json();

    const plan = PLAN_TIERS[planId as keyof typeof PLAN_TIERS];
    if (!plan || plan.priceInInr === 0) {
      return NextResponse.json({ error: "Invalid paid plan selected" }, { status: 400 });
    }

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: plan.priceInInr * 100, // Amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        planId: plan.id,
        planName: plan.name,
        tokenAllocation: plan.tokens.toString(),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
