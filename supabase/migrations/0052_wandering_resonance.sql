```sql
-- Function to clear Stripe API keys
CREATE OR REPLACE FUNCTION clear_stripe_keys()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify admin access
  IF NOT (auth.jwt() ->> 'role' = 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Clear all Stripe keys
  UPDATE api_keys
  SET value = ''
  WHERE name LIKE 'stripe_%'
    AND environment = 'production';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION clear_stripe_keys() TO authenticated;
```