/*
  # Fix user profile initialization

  1. Updates
    - Add trigger to create user profile on signup
    - Set default subscription tier
    - Initialize basic tier niche selection
*/

-- Create function to handle new user setup
CREATE OR REPLACE FUNCTION handle_new_user_setup()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile with default subscription tier
  INSERT INTO user_profiles (id, subscription_tier)
  VALUES (NEW.id, 'basic');

  -- Select first available niche for basic tier users
  INSERT INTO user_niches (user_id, niche_id)
  SELECT NEW.id, id
  FROM niches
  ORDER BY name
  LIMIT 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user setup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_setup();

-- Fix existing users without profiles
INSERT INTO user_profiles (id, subscription_tier)
SELECT id, 'basic'
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles);

-- Ensure each basic tier user has at least one niche
INSERT INTO user_niches (user_id, niche_id)
SELECT up.id, (SELECT id FROM niches ORDER BY name LIMIT 1)
FROM user_profiles up
WHERE up.subscription_tier = 'basic'
  AND NOT EXISTS (
    SELECT 1 FROM user_niches un WHERE un.user_id = up.id
  );