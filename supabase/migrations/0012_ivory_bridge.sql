DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Check if admin user exists
  SELECT id INTO admin_id
  FROM auth.users 
  WHERE email = 'admin@instacraft.ai';

  -- If admin doesn't exist, create one
  IF admin_id IS NULL THEN
    -- Insert admin user
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role
    ) VALUES (
      gen_random_uuid(),
      'admin@instacraft.ai',
      crypt('admin123', gen_salt('bf')), -- Password: admin123
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"admin"}',
      now(),
      now(),
      'admin'
    )
    RETURNING id INTO admin_id;
  END IF;

  -- Ensure admin has a user profile
  INSERT INTO user_profiles (id, subscription_tier)
  VALUES (admin_id, 'premium')
  ON CONFLICT (id) DO UPDATE SET subscription_tier = 'premium';
END $$;