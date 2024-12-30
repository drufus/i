-- Update RLS policies for subscription_plans
DROP POLICY IF EXISTS "Admin full access to subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Public read access to subscription plans" ON subscription_plans;

-- Create more specific policies
CREATE POLICY "Anyone can read active subscription plans"
  ON subscription_plans
  FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Admins can manage subscription plans"
  ON subscription_plans
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Ensure proper column names
ALTER TABLE subscription_plans
RENAME COLUMN IF EXISTS "postLimit" TO post_limit;

ALTER TABLE subscription_plans
RENAME COLUMN IF EXISTS "nicheLimit" TO niche_limit;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_tier ON subscription_plans(tier);

-- Grant necessary permissions
GRANT SELECT ON subscription_plans TO authenticated;
GRANT INSERT, UPDATE, DELETE ON subscription_plans TO authenticated;