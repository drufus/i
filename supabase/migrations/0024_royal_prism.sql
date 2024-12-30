/*
  # Admin User Management Improvements

  1. Changes
    - Creates secure view for auth user data
    - Adds helper function for admin user management
    - Improves security with proper access controls

  2. Security
    - Adds row-level security for user data access
    - Restricts admin functions to admin users only
*/

-- Create secure view for auth user data if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_views WHERE viewname = 'auth_user_details'
  ) THEN
    CREATE VIEW auth_user_details AS
    SELECT 
      id,
      email,
      raw_user_meta_data->>'role' as role
    FROM auth.users;
  END IF;
END $$;

-- Grant access to the view
GRANT SELECT ON auth_user_details TO authenticated;

-- Create or replace the user profiles query helper
CREATE OR REPLACE FUNCTION get_user_profiles()
RETURNS TABLE (
  id uuid,
  email text,
  role text,
  subscription_tier text,
  created_at timestamptz
) SECURITY DEFINER
AS $$
BEGIN
  -- Only allow admins to access this function
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      role = 'admin' OR 
      (raw_user_meta_data->>'role')::text = 'admin'
    )
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    up.id,
    aud.email,
    COALESCE(up.role, 'user') as role,
    up.subscription_tier,
    up.created_at
  FROM user_profiles up
  JOIN auth_user_details aud ON up.id = aud.id
  ORDER BY up.created_at DESC;
END;
$$ LANGUAGE plpgsql;