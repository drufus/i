/*
  # Fix user profiles permissions and search

  1. Changes
    - Add text search capabilities for email lookups
    - Update RLS policies for proper access control
    - Add necessary indexes for performance
    - Grant required permissions for auth schema access
*/

-- Add text search capabilities
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Ensure user_profiles has proper foreign key relationship
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_id_fkey,
ADD CONSTRAINT user_profiles_id_fkey 
  FOREIGN KEY (id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Create index for text search on email
CREATE INDEX IF NOT EXISTS idx_auth_users_email_trgm 
ON auth.users 
USING gin (email gin_trgm_ops);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Create helper function for email search
CREATE OR REPLACE FUNCTION search_users_by_email(search_query text)
RETURNS TABLE (
  user_id uuid,
  email text,
  profile_data jsonb
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email,
    jsonb_build_object(
      'subscription_tier', up.subscription_tier,
      'role', up.role,
      'created_at', up.created_at
    ) as profile_data
  FROM auth.users au
  JOIN user_profiles up ON au.id = up.id
  WHERE au.email ILIKE '%' || search_query || '%';
END;
$$ LANGUAGE plpgsql;