/*
  # Add Stripe Subscription System

  1. New Tables
    - `subscription_plans`: Stores available subscription tiers and their features
    - `customer_subscriptions`: Tracks user subscriptions and their status
    - `subscription_features`: Stores features for each plan
    
  2. Security
    - Enable RLS on all new tables
    - Add policies for secure access
    
  3. Changes
    - Add Stripe-related columns
    - Add subscription management capabilities
*/

-- Create subscription_plans table
CREATE TABLE subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_price_id text UNIQUE,
  tier text NOT NULL CHECK (tier IN ('basic', 'pro', 'premium')),
  name text NOT NULL,
  price numeric NOT NULL,
  interval text NOT NULL CHECK (interval IN ('month', 'year')),
  post_limit integer NOT NULL,
  niche_limit integer NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create subscription_features table
CREATE TABLE subscription_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES subscription_plans(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  included boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create customer_subscriptions table
CREATE TABLE customer_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES subscription_plans(id),
  stripe_subscription_id text UNIQUE,
  status text CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Public read access to subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Admin full access to subscription plans"
  ON subscription_plans
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Public read access to subscription features"
  ON subscription_features FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin full access to subscription features"
  ON subscription_features
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can read own subscriptions"
  ON customer_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin full access to customer subscriptions"
  ON customer_subscriptions
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Indexes
CREATE INDEX idx_customer_subscriptions_user_id ON customer_subscriptions(user_id);
CREATE INDEX idx_customer_subscriptions_plan_id ON customer_subscriptions(plan_id);
CREATE INDEX idx_subscription_features_plan_id ON subscription_features(plan_id);

-- Insert default plans
INSERT INTO subscription_plans (tier, name, price, interval, post_limit, niche_limit) VALUES
  ('basic', 'Basic Plan', 0, 'month', 1, 1),
  ('pro', 'Pro Plan', 29.99, 'month', 3, 1),
  ('premium', 'Premium Plan', 99.99, 'month', 7, 1);

-- Insert default features
INSERT INTO subscription_features (plan_id, name, description) 
SELECT 
  id,
  'Social Media Posts',
  'Schedule and automate social media posts'
FROM subscription_plans 
WHERE tier = 'basic';

INSERT INTO subscription_features (plan_id, name, description)
SELECT 
  id,
  unnest(ARRAY['Social Media Posts', 'Analytics Dashboard', 'Priority Support']),
  unnest(ARRAY[
    'Schedule and automate social media posts',
    'Access detailed analytics and insights',
    'Get priority customer support'
  ])
FROM subscription_plans 
WHERE tier = 'pro';

INSERT INTO subscription_features (plan_id, name, description)
SELECT 
  id,
  unnest(ARRAY['Social Media Posts', 'Analytics Dashboard', 'Priority Support', 'Custom Branding', 'API Access']),
  unnest(ARRAY[
    'Schedule and automate social media posts',
    'Access detailed analytics and insights',
    'Get priority customer support',
    'Add your own branding to posts',
    'Access our API for custom integrations'
  ])
FROM subscription_plans 
WHERE tier = 'premium';