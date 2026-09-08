import Razorpay from "razorpay";
import crypto from "crypto";
import { SubscriptionTier, BillingCycle } from "@/types";

export interface PlanConfig {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  priceMonthly: number; // In INR
  priceAnnually: number; // In INR
  annualSavingsPercent: number;
  tokens: number;
  refillDays: number;
  features: string[];
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: Record<"free" | "premium" | "premium_pro", PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "Essential AI tools for individuals starting out",
    priceMonthly: 0,
    priceAnnually: 0,
    annualSavingsPercent: 0,
    tokens: 5000,
    refillDays: 3,
    features: [
      "5,000 AI tokens quota",
      "Auto-refills every 3 days",
      "1 Connected Gmail inbox",
      "AI Email summarization & reply drafting",
      "Standard response speed",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    tagline: "For freelancers and active professionals",
    priceMonthly: 199,
    priceAnnually: 1964,
    annualSavingsPercent: 18,
    tokens: 125000,
    refillDays: 3,
    popular: true,
    features: [
      "125,000 AI tokens quota",
      "Auto-refills every 3 days",
      "Priority AI neural processing",
      "Full Gmail inbox search & pagination",
      "Real-time incoming email sync",
      "Custom tone & refinement adjustments",
    ],
  },
  premium_pro: {
    id: "premium_pro",
    name: "Premium Pro",
    tagline: "For high-volume power users & executives",
    priceMonthly: 499,
    priceAnnually: 4910,
    annualSavingsPercent: 18,
    tokens: 500000,
    refillDays: 3,
    features: [
      "500,000 AI tokens quota",
      "Auto-refills every 3 days",
      "Maximum speed & VIP AI processing lane",
      "Multi-account management",
      "Deep email context extraction",
      "24/7 Priority developer support",
    ],
  },
};

export function getRazorpay() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

  if (!keyId || !keySecret || keyId.includes("placeholder") || keyId.includes("your_key_id")) {
    console.warn("Razorpay credentials are not fully configured in environment variables.");
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
