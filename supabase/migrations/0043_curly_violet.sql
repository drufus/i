-- Create API keys table if it doesn't exist
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  value text NOT NULL,
  environment text NOT NULL CHECK (environment IN ('development', 'production')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, environment)
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admin full access to api_keys"
  ON api_keys
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Function to update API keys
CREATE OR REPLACE FUNCTION update_api_keys(
  p_environment text,
  p_public_key text,
  p_secret_key text,
  p_webhook_secret text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify admin access
  IF NOT (auth.jwt() ->> 'role' = 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Update public key
  INSERT INTO api_keys (name, value, environment)
  VALUES ('stripe_public_key', p_public_key, p_environment)
  ON CONFLICT (name, environment) 
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();

  -- Update secret key
  INSERT INTO api_keys (name, value, environment)
  VALUES ('stripe_secret_key', p_secret_key, p_environment)
  ON CONFLICT (name, environment) 
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();

  -- Update webhook secret
  INSERT INTO api_keys (name, value, environment)
  VALUES ('stripe_webhook_secret', p_webhook_secret, p_environment)
  ON CONFLICT (name, environment) 
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();
END;
$$;

-- Function to get API keys
CREATE OR REPLACE FUNCTION get_api_keys(p_environment text)
RETURNS TABLE (
  name text,
  value text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify admin access
  IF NOT (auth.jwt() ->> 'role' = 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT k.name, k.value
  FROM api_keys k
  WHERE k.environment = p_environment;
END;
$$;

-- Insert default API keys if they don't exist
INSERT INTO api_keys (name, value, environment)
VALUES 
  ('stripe_public_key', '', 'production'),
  ('stripe_secret_key', '', 'production'),
  ('stripe_webhook_secret', '', 'production')
ON CONFLICT (name, environment) DO NOTHING;