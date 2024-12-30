export type SubscriptionTier = 'basic' | 'pro' | 'premium';

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
}

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: SubscriptionFeature[];
  post_limit: number;
  niche_limit: number;
}

export interface CustomerSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}