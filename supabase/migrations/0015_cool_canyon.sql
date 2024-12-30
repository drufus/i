/*
  # Reset User Niche Selections

  1. Changes
    - Remove all existing niche selections
    - Reset niche_id in user_profiles
    - Preserve admin user settings

  2. Security
    - Maintains existing RLS policies
    - Safe rollback capability
*/

-- First, backup existing selections (just in case)
CREATE TABLE IF NOT EXISTS user_niches_backup AS
SELECT * FROM user_niches;

-- Remove all non-admin niche selections
DELETE FROM user_niches
WHERE user_id NOT IN (
  SELECT id 
  FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'admin'
);

-- Reset niche_id in user_profiles
UPDATE user_profiles
SET niche_id = NULL
WHERE id NOT IN (
  SELECT id 
  FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'admin'
);

-- Add a function to restore backup if needed
CREATE OR REPLACE FUNCTION restore_user_niches()
RETURNS void AS $$
BEGIN
  INSERT INTO user_niches
  SELECT * FROM user_niches_backup
  ON CONFLICT (user_id, niche_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;