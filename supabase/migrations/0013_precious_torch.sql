/*
  # Add User Profile Fields

  1. Changes
    - Add first_name, last_name, phone, and address fields to user_profiles table
    - Add validation for phone numbers
    - Add address-related fields for proper address storage
    - Add indexes for improved query performance

  2. Security
    - Maintain existing RLS policies
    - Add validation constraints for data integrity
*/

-- Add new columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address_line1 text,
ADD COLUMN IF NOT EXISTS address_line2 text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS country text;

-- Add phone number format validation
ALTER TABLE user_profiles
ADD CONSTRAINT phone_format CHECK (
  phone IS NULL OR 
  phone ~ '^\+?[1-9]\d{1,14}$'
);

-- Add postal code format validation
ALTER TABLE user_profiles
ADD CONSTRAINT postal_code_format CHECK (
  postal_code IS NULL OR 
  postal_code ~ '^\d{5}(-\d{4})?$'
);

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_user_profiles_name 
ON user_profiles(last_name, first_name);

CREATE INDEX IF NOT EXISTS idx_user_profiles_city_state 
ON user_profiles(city, state);

-- Update existing admin user with sample data
UPDATE user_profiles
SET 
  first_name = 'Admin',
  last_name = 'User',
  phone = '+1234567890',
  address_line1 = '123 Admin Street',
  city = 'San Francisco',
  state = 'CA',
  postal_code = '94105',
  country = 'USA'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@instacraft.ai'
);