import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { verifyRazorpaySignature } from "@/lib/billing/razorpay";
import { updateUserSubscription } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing Razorpay payment parameters" }, { status: 400 });
    }

    // Verify HMAC-SHA256 signature
    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature verification" }, { status: 400 });
    }

    // Activate subscription & refill tokens in Supabase
    await updateUserSubscription(
      session.user.id,
      planId || "premium",
      "active",
      undefined,
      razorpay_payment_id,
      razorpay_order_id
    );

    return NextResponse.json({
      success: true,
      message: "Subscription successfully verified and activated.",
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}

