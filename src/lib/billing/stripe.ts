import Stripe from "stripe";
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

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY || "";
    if (!secretKey) {
      console.warn("STRIPE_SECRET_KEY is not configured in environment variables.");
    }
    stripeInstance = new Stripe(secretKey || "sk_test_placeholder", {
      apiVersion: "2025-02-24.acacia" as any,
      typescript: true,
    });
  }
  return stripeInstance;
}

