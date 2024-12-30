/*
  # Initial InstaCraft Schema

  1. New Tables
    - `users`: Extended user profile data
    - `niches`: Available content niches
    - `rss_feeds`: RSS feed sources for each niche
    - `articles`: Curated articles
    - `posts`: Social media posts
    - `post_schedules`: Scheduling configuration

  2. Security
    - RLS enabled on all tables
    - Policies for user-specific data access
    - Admin-only access for RSS feeds management
*/

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Niches table
CREATE TABLE IF NOT EXISTS niches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE niches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to niches"
  ON niches FOR SELECT
  TO authenticated
  USING (true);

-- RSS Feeds table
CREATE TABLE IF NOT EXISTS rss_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  niche_id uuid REFERENCES niches(id) ON DELETE CASCADE,
  url text NOT NULL,
  name text NOT NULL,
  active boolean DEFAULT true,
  last_fetched_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read access to RSS feeds"
  ON rss_feeds FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Extended user profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  niche_id uuid REFERENCES niches(id),
  subscription_tier text CHECK (subscription_tier IN ('basic', 'pro', 'premium')) DEFAULT 'basic',
  posts_remaining integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  link text NOT NULL,
  image_url text,
  niche_id uuid REFERENCES niches(id),
  user_id uuid REFERENCES auth.users(id),
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  source text CHECK (source IN ('rss', 'user_submitted')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read articles in their niche"
  ON articles FOR SELECT
  TO authenticated
  USING (
    niche_id IN (
      SELECT niche_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can submit articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    source = 'user_submitted'
  );

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  platform text CHECK (platform IN ('facebook', 'instagram', 'linkedin', 'twitter')),
  content text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  status text CHECK (status IN ('scheduled', 'posted', 'failed')) DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own posts"
  ON posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    (
      SELECT COUNT(*) FROM posts
      WHERE user_id = auth.uid()
      AND DATE_TRUNC('week', created_at) = DATE_TRUNC('week', CURRENT_TIMESTAMP)
    ) < (
      SELECT CASE subscription_tier
        WHEN 'basic' THEN 1
        WHEN 'pro' THEN 3
        WHEN 'premium' THEN 7
      END
      FROM user_profiles
      WHERE id = auth.uid()
    )
  );

-- Insert default niches
INSERT INTO niches (name, description) VALUES
  ('residential_cleaning', 'Content focused on residential cleaning services and tips'),
  ('commercial_cleaning', 'Content about commercial and industrial cleaning'),
  ('side_hustles', 'Content about starting and growing side businesses'),
  ('digital_marketing', 'Digital marketing strategies and tips')
ON CONFLICT (name) DO NOTHING;