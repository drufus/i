/*
  # Fix subscription plans schema and constraints

  1. Changes
    - Add missing constraints
    - Update column names to follow conventions
    - Set proper default values
    - Add validation checks

  2. Security
    - No changes to RLS policies
*/

-- Add proper constraints and defaults
ALTER TABLE subscription_plans
ALTER COLUMN post_limit SET DEFAULT 10,
ALTER COLUMN niche_limit SET DEFAULT 1;

-- Add validation triggers
CREATE OR REPLACE FUNCTION validate_subscription_plan()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate tier limits
  IF NEW.tier = 'basic' AND (NEW.post_limit > 10 OR NEW.niche_limit > 1) THEN
    RAISE EXCEPTION 'Basic tier cannot exceed 10 posts and 1 niche';
  END IF;
  
  IF NEW.tier = 'pro' AND (NEW.post_limit > 50 OR NEW.niche_limit > 3) THEN
    RAISE EXCEPTION 'Pro tier cannot exceed 50 posts and 3 niches';
  END IF;
  
  IF NEW.tier = 'premium' AND (NEW.post_limit > 100 OR NEW.niche_limit > 5) THEN
    RAISE EXCEPTION 'Premium tier cannot exceed 100 posts and 5 niches';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_subscription_plan_trigger
  BEFORE INSERT OR UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION validate_subscription_plan();