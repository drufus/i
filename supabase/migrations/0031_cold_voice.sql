-- Update the get_user_profiles function to fix ambiguous id reference
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
    WHERE auth.users.id = auth.uid() 
    AND (
      auth.users.role = 'admin' OR 
      (auth.users.raw_user_meta_data->>'role')::text = 'admin'
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
  JOIN auth_user_details aud ON aud.id = up.id
  ORDER BY up.created_at DESC;
END;
$$ LANGUAGE plpgsql;