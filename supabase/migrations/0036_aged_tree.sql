/*
  # API Keys Management

  1. New Tables
    - `api_keys`
      - `id` (uuid, primary key)
      - `name` (text)
      - `value` (text, encrypted)
      - `environment` (text)
      - `last_updated` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for admin access only
*/

-- Create API keys table with encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  value text NOT NULL,
  environment text CHECK (environment IN ('development', 'production')),
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admin full access to api_keys"
  ON api_keys
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Function to encrypt API key values
CREATE OR REPLACE FUNCTION encrypt_api_key(key_value text)
RETURNS text AS $$
BEGIN
  RETURN encode(encrypt(
    key_value::bytea,
    current_setting('app.encryption_key')::bytea,
    'aes'
  ), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt API key values
CREATE OR REPLACE FUNCTION decrypt_api_key(encrypted_value text)
RETURNS text AS $$
BEGIN
  RETURN convert_from(
    decrypt(
      decode(encrypted_value, 'base64'),
      current_setting('app.encryption_key')::bytea,
      'aes'
    ),
    'utf8'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically encrypt API key values
CREATE OR REPLACE FUNCTION encrypt_api_key_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.value = encrypt_api_key(NEW.value);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER encrypt_api_key_on_insert
  BEFORE INSERT OR UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION encrypt_api_key_trigger();