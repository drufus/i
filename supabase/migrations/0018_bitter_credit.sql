/*
  # Verify Admin User Deletion
  
  1. Changes
    - Query to verify admin@instacraft.ai is removed from all tables
*/

DO $$
DECLARE
  auth_count integer;
  profile_count integer;
  niche_count integer;
BEGIN
  -- Check auth.users
  SELECT COUNT(*) INTO auth_count
  FROM auth.users
  WHERE email = 'admin@instacraft.ai';

  -- Check user_profiles
  SELECT COUNT(*) INTO profile_count
  FROM user_profiles
  WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'admin@instacraft.ai'
  );

  -- Check user_niches
  SELECT COUNT(*) INTO niche_count
  FROM user_niches
  WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'admin@instacraft.ai'
  );

  -- Raise notice with results
  RAISE NOTICE 'Verification Results:';
  RAISE NOTICE 'Users found in auth.users: %', auth_count;
  RAISE NOTICE 'Users found in user_profiles: %', profile_count;
  RAISE NOTICE 'Users found in user_niches: %', niche_count;

  -- Assert all counts are 0
  IF auth_count = 0 AND profile_count = 0 AND niche_count = 0 THEN
    RAISE NOTICE 'SUCCESS: admin@instacraft.ai has been completely removed from the system';
  ELSE
    RAISE EXCEPTION 'ERROR: admin@instacraft.ai still exists in some tables';
  END IF;
END $$;