/*
  # Update Webhook Domain Configuration

  1. Updates
    - Set webhook domain for Stripe settings
    - Update webhook endpoint URLs
    - Add validation for domain format

  2. Security
    - Ensure proper domain format
    - Maintain environment separation
*/

-- Update webhook domain for production environment
DO $$
BEGIN
  -- Update or insert production settings
  INSERT INTO stripe_settings (
    environment,
    webhook_domain,
    webhook_endpoint_url
  )
  VALUES (
    'production',
    'instacraft.ai',
    'https://instacraft.ai/api/webhooks/stripe/production'
  )
  ON CONFLICT (environment)
  DO UPDATE SET
    webhook_domain = EXCLUDED.webhook_domain,
    webhook_endpoint_url = EXCLUDED.webhook_endpoint_url,
    updated_at = now();

  -- Update or insert development settings
  INSERT INTO stripe_settings (
    environment,
    webhook_domain,
    webhook_endpoint_url
  )
  VALUES (
    'development',
    'instacraft.ai',
    'https://instacraft.ai/api/webhooks/stripe/development'
  )
  ON CONFLICT (environment)
  DO UPDATE SET
    webhook_domain = EXCLUDED.webhook_domain,
    webhook_endpoint_url = EXCLUDED.webhook_endpoint_url,
    updated_at = now();
END $$;

-- Add domain format validation
ALTER TABLE stripe_settings
ADD CONSTRAINT webhook_domain_format
CHECK (webhook_domain ~ '^[a-zA-Z0-9][a-zA-Z0-9-\.]*[a-zA-Z0-9]$');

-- Update the generate_webhook_url function to handle subdomains
CREATE OR REPLACE FUNCTION generate_webhook_url(domain text, environment text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure domain doesn't include protocol
  domain := regexp_replace(domain, '^https?://', '');
  
  -- Generate webhook URL with environment path
  RETURN format(
    'https://%s/api/webhooks/stripe/%s',
    domain,
    environment
  );
END;
$$;