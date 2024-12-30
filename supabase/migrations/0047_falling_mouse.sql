/*
  # Fix subscription plans schema

  1. Changes
    - Rename nicheLimit to niche_limit for consistency
    - Rename postLimit to post_limit for consistency
    - Add missing columns if they don't exist
    - Update existing data

  2. Security
    - No changes to RLS policies needed
*/

-- Rename columns to follow snake_case convention
DO $$
BEGIN
  -- Rename nicheLimit to niche_limit if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' AND column_name = 'nichelimit'
  ) THEN
    ALTER TABLE subscription_plans RENAME COLUMN nichelimit TO niche_limit;
  END IF;

  -- Rename postLimit to post_limit if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' AND column_name = 'postlimit'
  ) THEN
    ALTER TABLE subscription_plans RENAME COLUMN postlimit TO post_limit;
  END IF;
END $$;

-- Add columns if they don't exist
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS niche_limit integer,
ADD COLUMN IF NOT EXISTS post_limit integer;

-- Update existing plans with default values
UPDATE subscription_plans
SET 
  niche_limit = CASE
    WHEN tier = 'basic' THEN 1
    WHEN tier = 'pro' THEN 3
    WHEN tier = 'premium' THEN 5
    ELSE 1
  END,
  post_limit = CASE
    WHEN tier = 'basic' THEN 10
    WHEN tier = 'pro' THEN 50
    WHEN tier = 'premium' THEN 100
    ELSE 10
  END
WHERE niche_limit IS NULL OR post_limit IS NULL;

-- Add NOT NULL constraints
ALTER TABLE subscription_plans
ALTER COLUMN niche_limit SET NOT NULL,
ALTER COLUMN post_limit SET NOT NULL;

-- Add check constraints
ALTER TABLE subscription_plans
ADD CONSTRAINT subscription_plans_niche_limit_check CHECK (niche_limit > 0),
ADD CONSTRAINT subscription_plans_post_limit_check CHECK (post_limit > 0);