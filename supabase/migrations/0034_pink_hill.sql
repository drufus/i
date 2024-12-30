-- Drop existing function
DROP FUNCTION IF EXISTS get_user_profiles();

-- Recreate function with explicit column references and niche information
CREATE OR REPLACE FUNCTION get_user_profiles()
RETURNS TABLE (
  user_id uuid,
  user_email text,
  user_role text,
  user_subscription_tier text,
  user_created_at timestamptz,
  user_niche_id uuid
) SECURITY DEFINER
AS $$
BEGIN
  -- Only allow admins to access this function
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (
      auth.users.role = 'admin' OR 
      (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  WITH current_niches AS (
    SELECT DISTINCT ON (user_id) user_id, niche_id
    FROM user_niches
    ORDER BY user_id, created_at DESC
  )
  SELECT 
    up.id AS user_id,
    au.email AS user_email,
    COALESCE(up.role, 'user') AS user_role,
    up.subscription_tier AS user_subscription_tier,
    up.created_at AS user_created_at,
    cn.niche_id AS user_niche_id
  FROM user_profiles up
  JOIN auth.users au ON au.id = up.id
  LEFT JOIN current_niches cn ON cn.user_id = up.id
  ORDER BY up.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create index to improve query performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_niches_latest 
ON user_niches(user_id, created_at DESC);