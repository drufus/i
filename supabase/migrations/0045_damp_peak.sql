-- Seed data for development
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
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin"}',
  now(),
  now(),
  'admin'
);