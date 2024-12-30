/*
  # Fix user signup and profile creation

  1. Changes
    - Drop and recreate user setup trigger with better error handling
    - Add constraints to ensure data integrity
    - Fix profile creation timing

  2. Security
    - Maintain RLS policies
    - Use SECURITY DEFINER for trigger function
*/

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user_setup()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.user_profiles (id, subscription_tier)
  VALUES (NEW.id, 'basic')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_setup();

-- Ensure user_profiles has proper constraints
ALTER TABLE public.user_profiles
  ALTER COLUMN subscription_tier SET DEFAULT 'basic',
  ALTER COLUMN subscription_tier SET NOT NULL;

-- Add missing profiles for existing users
INSERT INTO public.user_profiles (id, subscription_tier)
SELECT id, 'basic'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;