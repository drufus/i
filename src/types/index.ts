export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  first_name?: string;
  last_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  subscription_tier: 'basic' | 'pro' | 'premium';
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  currency: string;
  features: PlanFeature[];
  post_limit: number;
  niche_limit: number;
  stripe_price_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PlanFeature {
  id: string;
  plan_id: string;
  name: string;
  description: string;
  included: boolean;
}

export interface Niche {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  niche_id: string;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key: string;
  last_used_at?: string;
  created_at: string;
  expires_at?: string;
}

export interface Integration {
  id: string;
  name: string;
  type: 'stripe' | 'social' | 'analytics';
  status: 'active' | 'inactive' | 'pending';
  config: Record<string, any>;
}

export interface AnalyticsData {
  period: 'day' | 'week' | 'month' | 'year';
  metrics: {
    views: number;
    engagement: number;
    conversions: number;
  };
  trends: {
    date: string;
    value: number;
  }[];
}

export interface ErrorResponse {
  message: string;
  code: string;
  details?: Record<string, any>;
}

export interface PaginationParams {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}