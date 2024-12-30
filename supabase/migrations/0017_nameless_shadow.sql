/*
  # Delete Admin User

  1. Changes
    - Remove admin@instacraft.ai user and associated data
  
  2. Security
    - Ensures clean removal of all related data
*/

DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = 'admin@instacraft.ai';

  -- Delete from user_niches first (due to foreign key constraints)
  DELETE FROM user_niches
  WHERE user_id = admin_id;

  -- Delete from user_profiles
  DELETE FROM user_profiles
  WHERE id = admin_id;

  -- Delete from auth.users
  DELETE FROM auth.users
  WHERE id = admin_id;
END $$;