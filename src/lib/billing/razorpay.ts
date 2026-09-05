import Razorpay from "razorpay";
import crypto from "crypto";

export const PLAN_TIERS = {
  free: {
    id: "free",
    name: "Free Starter",
    tokens: 10000,
    priceInInr: 0,
    features: ["10,000 Gemini Tokens/month", "1 Email Account Sync", "Role Dashboards", "Standard Support"],
  },
  pro: {
    id: "pro",
    name: "Pro Creator & Dev",
    tokens: 250000,
    priceInInr: 799,
    features: ["250,000 Gemini Tokens/month", "Unlimited Gmail & Outlook Sync", "Instagram Integration", "Priority Realtime Sync"],
  },
  business: {
    id: "business",
    name: "Business Suite",
    tokens: 1000000,
    priceInInr: 2499,
    features: ["1,000,000 Gemini Tokens/month", "Team & Multi-Account Sync", "Advanced Lead & Ticket Analyzer", "Dedicated Support"],
  },
};

export function getRazorpay() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are missing");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}
