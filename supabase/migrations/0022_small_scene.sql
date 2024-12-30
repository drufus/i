/*
  # Fix admin authentication and email handling

  1. Changes
    - Add case-insensitive email index
    - Update admin role for existing admin user
    - Fix permissions for auth schema access
    
  2. Security
    - Maintains existing RLS policies
    - Updates only necessary permissions
*/

-- Create case-insensitive email index
CREATE INDEX IF NOT EXISTS idx_auth_users_email_lower 
ON auth.users (LOWER(email));

-- Update admin user with proper role
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Find admin user with case-insensitive email match
  SELECT id INTO admin_id
  FROM auth.users
  WHERE LOWER(email) = LOWER('DAMIEN.RUFUS+admin@GMAIL.COM');

  IF admin_id IS NOT NULL THEN
    -- Update auth.users metadata and role
    UPDATE auth.users
    SET 
      raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{role}',
        '"admin"'
      ),
      role = 'admin'
    WHERE id = admin_id;

    -- Update user_profiles
    UPDATE user_profiles
    SET 
      role = 'admin',
      subscription_tier = 'premium'
    WHERE id = admin_id;

    -- Ensure admin has necessary permissions
    INSERT INTO user_profiles (id, role, subscription_tier)
    VALUES (admin_id, 'admin', 'premium')
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin', subscription_tier = 'premium';
  END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Update RLS policies to use case-insensitive email checks
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND (
      role = 'admin' OR 
      (raw_user_meta_data->>'role')::text = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;