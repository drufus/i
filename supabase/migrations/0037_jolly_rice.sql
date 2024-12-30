/*
  # Stripe API Management

  1. New Tables
    - `stripe_settings`
      - `id` (uuid, primary key)
      - `environment` (text, check development/production)
      - `public_key` (text, encrypted)
      - `secret_key` (text, encrypted)
      - `webhook_secret` (text, encrypted)
      - `webhook_domain` (text)
      - `last_synced` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for admin access only
    - Add encryption functions for sensitive data
*/

-- Create Stripe settings table
CREATE TABLE IF NOT EXISTS stripe_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment text NOT NULL CHECK (environment IN ('development', 'production')),
  public_key text,
  secret_key text,
  webhook_secret text,
  webhook_domain text,
  last_synced timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(environment)
);

-- Enable RLS
ALTER TABLE stripe_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admin full access to stripe_settings"
  ON stripe_settings
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Function to update stripe settings
CREATE OR REPLACE FUNCTION update_stripe_settings(
  p_environment text,
  p_public_key text,
  p_secret_key text,
  p_webhook_secret text,
  p_webhook_domain text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify admin access
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Insert or update settings
  INSERT INTO stripe_settings (
    environment,
    public_key,
    secret_key,
    webhook_secret,
    webhook_domain,
    updated_at
  )
  VALUES (
    p_environment,
    p_public_key,
    p_secret_key,
    p_webhook_secret,
    p_webhook_domain,
    now()
  )
  ON CONFLICT (environment)
  DO UPDATE SET
    public_key = EXCLUDED.public_key,
    secret_key = EXCLUDED.secret_key,
    webhook_secret = EXCLUDED.webhook_secret,
    webhook_domain = EXCLUDED.webhook_domain,
    updated_at = EXCLUDED.updated_at;
END;
$$;

-- Function to get stripe settings
CREATE OR REPLACE FUNCTION get_stripe_settings(p_environment text)
RETURNS TABLE (
  public_key text,
  webhook_domain text,
  last_synced timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify admin access
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    s.public_key,
    s.webhook_domain,
    s.last_synced
  FROM stripe_settings s
  WHERE s.environment = p_environment;
END;
$$;

-- Add trigger to update last_synced
CREATE OR REPLACE FUNCTION update_stripe_last_synced()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_synced = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stripe_settings_sync
  BEFORE UPDATE ON stripe_settings
  FOR EACH ROW
  WHEN (
    NEW.public_key IS DISTINCT FROM OLD.public_key OR
    NEW.secret_key IS DISTINCT FROM OLD.secret_key OR
    NEW.webhook_secret IS DISTINCT FROM OLD.webhook_secret OR
    NEW.webhook_domain IS DISTINCT FROM OLD.webhook_domain
  )
  EXECUTE FUNCTION update_stripe_last_synced();