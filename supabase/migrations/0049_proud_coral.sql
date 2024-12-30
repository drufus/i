-- Add proper column names and constraints for subscription plans
ALTER TABLE subscription_plans
RENAME COLUMN IF EXISTS "postLimit" TO post_limit;

ALTER TABLE subscription_plans
RENAME COLUMN IF EXISTS "nicheLimit" TO niche_limit;

-- Ensure columns exist with proper defaults
ALTER TABLE subscription_plans
ADD COLUMN IF NOT EXISTS post_limit integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS niche_limit integer DEFAULT 1;

-- Add NOT NULL constraints if not present
ALTER TABLE subscription_plans
ALTER COLUMN post_limit SET NOT NULL,
ALTER COLUMN niche_limit SET NOT NULL;

-- Add check constraints
ALTER TABLE subscription_plans
DROP CONSTRAINT IF EXISTS subscription_plans_post_limit_check,
ADD CONSTRAINT subscription_plans_post_limit_check CHECK (post_limit > 0);

ALTER TABLE subscription_plans
DROP CONSTRAINT IF EXISTS subscription_plans_niche_limit_check,
ADD CONSTRAINT subscription_plans_niche_limit_check CHECK (niche_limit > 0);

-- Update existing plans with proper limits
UPDATE subscription_plans
SET 
  post_limit = CASE
    WHEN tier = 'basic' THEN 10
    WHEN tier = 'pro' THEN 50
    WHEN tier = 'premium' THEN 100
    ELSE 10
  END,
  niche_limit = CASE
    WHEN tier = 'basic' THEN 1
    WHEN tier = 'pro' THEN 3
    WHEN tier = 'premium' THEN 5
    ELSE 1
  END
WHERE post_limit IS NULL OR niche_limit IS NULL;