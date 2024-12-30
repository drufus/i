/*
  # Update Admin Role
  
  1. Changes
    - Update existing user hello@instacraft.ai to have admin role
    - Ensure proper role assignment in both auth.users and user_profiles
*/

DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Get the user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'hello@instacraft.ai';

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User hello@instacraft.ai not found';
  END IF;

  -- Update auth.users metadata
  UPDATE auth.users
  SET 
    raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{role}',
      '"admin"'
    ),
    role = 'admin'
  WHERE id = target_user_id;

  -- Update user_profiles
  UPDATE user_profiles
  SET 
    role = 'admin',
    subscription_tier = 'premium'
  WHERE id = target_user_id;

  RAISE NOTICE 'User successfully updated to admin role with ID: %', target_user_id;
END $$;