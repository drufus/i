-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read active subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admins can manage subscription plans" ON subscription_plans;

-- Create new, more permissive policies for admins
CREATE POLICY "Admins have full access to subscription plans"
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

-- Create read-only policy for non-admin users
CREATE POLICY "Users can read active subscription plans"
  ON subscription_plans
  FOR SELECT
  TO authenticated
  USING (active = true);

-- Ensure proper column names and constraints
DO $$ 
BEGIN
  -- Rename columns if they exist in camelCase
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' 
    AND column_name = 'postlimit'
  ) THEN
    ALTER TABLE subscription_plans RENAME COLUMN postlimit TO post_limit;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' 
    AND column_name = 'nichelimit'
  ) THEN
    ALTER TABLE subscription_plans RENAME COLUMN nichelimit TO niche_limit;
  END IF;

  -- Add columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' 
    AND column_name = 'post_limit'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN post_limit integer DEFAULT 10;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' 
    AND column_name = 'niche_limit'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN niche_limit integer DEFAULT 1;
  END IF;
END $$;

-- Set NOT NULL constraints
ALTER TABLE subscription_plans
  ALTER COLUMN post_limit SET NOT NULL,
  ALTER COLUMN niche_limit SET NOT NULL;

-- Add check constraints
ALTER TABLE subscription_plans
  DROP CONSTRAINT IF EXISTS check_positive_limits,
  ADD CONSTRAINT check_positive_limits 
    CHECK (post_limit > 0 AND niche_limit > 0);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_tier_active 
  ON subscription_plans(tier, active);