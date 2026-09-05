export type SubscriptionTier = "free" | "premium" | "premium_pro" | "starter" | "pro" | "enterprise";
export type BillingCycle = "monthly" | "annually";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  subscriptionTier: SubscriptionTier;
  tokenBalance: number;
  tokenQuota: number;
  createdAt: string;
  updatedAt: string;
}

export type IntegrationProvider = "gmail" | "outlook" | "instagram";

export interface IntegrationAccount {
  id: string;
  userId: string;
  provider: IntegrationProvider;
  providerAccountId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
