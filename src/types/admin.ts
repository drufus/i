export interface AdminUser {
  user_id: string;
  user_email: string;
  user_role: string;
  user_subscription_tier: string;
  user_created_at: string;
  user_niche_id: string | null;
}