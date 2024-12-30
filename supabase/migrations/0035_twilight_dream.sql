/*
  # Add niche limit to subscription plans

  1. Changes
    - Add nicheLimit column to subscription_plans table
    - Update existing plans with default niche limits
    - Add NOT NULL constraint to ensure all plans have a niche limit
*/

-- Add nicheLimit column if it doesn't exist
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS niche_limit integer;

-- Update existing plans with default niche limits
UPDATE subscription_plans
SET niche_limit = CASE
  WHEN tier = 'basic' THEN 1
  WHEN tier = 'pro' THEN 3
  WHEN tier = 'premium' THEN 5
  ELSE 1
END
WHERE niche_limit IS NULL;

-- Make the column required
ALTER TABLE subscription_plans
ALTER COLUMN niche_limit SET NOT NULL;

-- Add check constraint to ensure positive values
ALTER TABLE subscription_plans
ADD CONSTRAINT subscription_plans_niche_limit_check 
CHECK (niche_limit > 0);