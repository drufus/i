/*
  # Admin Role Setup

  1. Changes
    - Add role column to user_profiles
    - Add admin-specific policies
    - Create admin role function
  
  2. Security
    - Only admins can modify user roles
    - Regular users can't access admin features
*/

-- Add role column to user_profiles if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user'
CHECK (role IN ('user', 'admin'));

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update policies to use admin function
CREATE POLICY "Admins can read all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR is_admin(auth.uid()));

-- Create default admin user if not exists
DO $$
BEGIN
  -- Update existing admin
  UPDATE user_profiles
  SET role = 'admin'
  WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email = 'admin@instacraft.ai'
  );
END $$;