/*
  # Add Post Analytics and Platform Integration

  1. New Tables
    - `post_analytics`: Track post performance metrics
    - `platform_connections`: Store user's social media platform credentials
    - `post_media`: Store media attachments for posts

  2. Changes
    - Add media_type column to posts table
    - Add platform_post_id to posts table for tracking

  3. Security
    - Enable RLS on new tables
    - Add policies for user data access
*/

-- Create post_analytics table
CREATE TABLE IF NOT EXISTS post_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  platform text NOT NULL,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  clicks integer DEFAULT 0,
  reach integer DEFAULT 0,
  engagement_rate decimal(5,2),
  measured_at timestamptz DEFAULT now()
);

-- Create platform_connections table
CREATE TABLE IF NOT EXISTS platform_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  platform_user_id text,
  platform_username text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Create post_media table
CREATE TABLE IF NOT EXISTS post_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  url text NOT NULL,
  type text CHECK (type IN ('image', 'video', 'gif')),
  alt_text text,
  created_at timestamptz DEFAULT now()
);

-- Add new columns to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS media_type text CHECK (media_type IN ('text', 'image', 'video', 'carousel')),
ADD COLUMN IF NOT EXISTS platform_post_id text,
ADD COLUMN IF NOT EXISTS error_message text;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_analytics_post_id ON post_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_platform_connections_user_platform ON platform_connections(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_post_media_post_id ON post_media(post_id);
CREATE INDEX IF NOT EXISTS idx_posts_platform_post_id ON posts(platform_post_id);

-- Enable RLS on new tables
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for post_analytics
CREATE POLICY "Users can view their own post analytics"
  ON post_analytics FOR SELECT
  TO authenticated
  USING (
    post_id IN (
      SELECT id FROM posts WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for platform_connections
CREATE POLICY "Users can manage their own platform connections"
  ON platform_connections FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create RLS policies for post_media
CREATE POLICY "Users can manage their own post media"
  ON post_media FOR ALL
  TO authenticated
  USING (
    post_id IN (
      SELECT id FROM posts WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    post_id IN (
      SELECT id FROM posts WHERE user_id = auth.uid()
    )
  );

-- Add function to update platform_connections updated_at
CREATE OR REPLACE FUNCTION update_platform_connection_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for platform_connections timestamp
CREATE TRIGGER update_platform_connections_timestamp
  BEFORE UPDATE ON platform_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_connection_timestamp();