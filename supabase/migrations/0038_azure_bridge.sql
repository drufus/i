/*
  # Stripe Webhook Configuration

  1. Updates
    - Add webhook_endpoint_url column to stripe_settings
    - Add function to generate webhook URL
    - Update existing functions to handle webhook URL

  2. Security
    - Ensure webhook URLs are properly formatted
    - Maintain environment separation
*/

-- Add webhook_endpoint_url column
ALTER TABLE stripe_settings
ADD COLUMN IF NOT EXISTS webhook_endpoint_url text;

-- Function to generate webhook URL
CREATE OR REPLACE FUNCTION generate_webhook_url(domain text, environment text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure domain doesn't include protocol
  domain := regexp_replace(domain, '^https?://', '');
  
  RETURN format(
    'https://%s/api/webhooks/stripe/%s',
    domain,
    environment
  );
END;
$$;

-- Update the stripe settings update function
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
    webhook_endpoint_url,
    updated_at
  )
  VALUES (
    p_environment,
    p_public_key,
    p_secret_key,
    p_webhook_secret,
    p_webhook_domain,
    generate_webhook_url(p_webhook_domain, p_environment),
    now()
  )
  ON CONFLICT (environment)
  DO UPDATE SET
    public_key = EXCLUDED.public_key,
    secret_key = EXCLUDED.secret_key,
    webhook_secret = EXCLUDED.webhook_secret,
    webhook_domain = EXCLUDED.webhook_domain,
    webhook_endpoint_url = generate_webhook_url(p_webhook_domain, p_environment),
    updated_at = EXCLUDED.updated_at;
END;
$$;

-- Update the get settings function to include webhook URL
CREATE OR REPLACE FUNCTION get_stripe_settings(p_environment text)
RETURNS TABLE (
  public_key text,
  webhook_domain text,
  webhook_endpoint_url text,
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
    s.webhook_endpoint_url,
    s.last_synced
  FROM stripe_settings s
  WHERE s.environment = p_environment;
END;
$$;