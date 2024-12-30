-- Update webhook endpoints structure
DO $$
BEGIN
  -- Update production webhook endpoint
  UPDATE stripe_settings
  SET 
    webhook_domain = 'instacraft.ai',
    webhook_endpoint_url = 'https://instacraft.ai/api/webhooks/stripe/production'
  WHERE environment = 'production';

  -- Update development webhook endpoint
  UPDATE stripe_settings
  SET 
    webhook_domain = 'instacraft.ai',
    webhook_endpoint_url = 'https://instacraft.ai/api/webhooks/stripe/development'
  WHERE environment = 'development';

  -- Insert if not exists
  INSERT INTO stripe_settings (
    environment,
    webhook_domain,
    webhook_endpoint_url
  )
  SELECT 
    'production',
    'instacraft.ai',
    'https://instacraft.ai/api/webhooks/stripe/production'
  WHERE NOT EXISTS (
    SELECT 1 FROM stripe_settings WHERE environment = 'production'
  );

  INSERT INTO stripe_settings (
    environment,
    webhook_domain,
    webhook_endpoint_url
  )
  SELECT 
    'development',
    'instacraft.ai',
    'https://instacraft.ai/api/webhooks/stripe/development'
  WHERE NOT EXISTS (
    SELECT 1 FROM stripe_settings WHERE environment = 'development'
  );
END $$;

-- Add function to get webhook URL
CREATE OR REPLACE FUNCTION get_webhook_url(p_environment text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT webhook_endpoint_url 
    FROM stripe_settings 
    WHERE environment = p_environment
  );
END;
$$;