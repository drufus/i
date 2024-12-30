/*
  # Fix migration conflicts and combine changes

  1. Changes
    - Combines necessary changes from conflicting 0020 migrations
    - Ensures proper setup of text search capabilities
    - Updates admin user permissions
    
  2. Security
    - Maintains existing RLS policies
    - Preserves all security constraints
*/

-- Add text search capabilities if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Ensure proper foreign key relationship
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_id_fkey'
  ) THEN
    ALTER TABLE user_profiles
    DROP CONSTRAINT IF EXISTS user_profiles_id_fkey,
    ADD CONSTRAINT user_profiles_id_fkey 
      FOREIGN KEY (id) 
      REFERENCES auth.users(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- Create text search index if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_auth_users_email_trgm'
  ) THEN
    CREATE INDEX idx_auth_users_email_trgm 
    ON auth.users 
    USING gin (email gin_trgm_ops);
  END IF;
END $$;

-- Update admin permissions and roles
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Get the user ID for the admin
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE LOWER(email) = LOWER('DAMIEN.RUFUS+admin@GMAIL.COM');

  IF target_user_id IS NOT NULL THEN
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
  END IF;
END $$;