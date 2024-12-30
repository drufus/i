/*
  # Add Post Metrics Table

  1. New Tables
    - `post_metrics` - Stores engagement metrics for posts
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `likes` (integer)
      - `comments` (integer)
      - `shares` (integer)
      - `clicks` (integer)
      - `impressions` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policy for users to read their own post metrics
*/

-- Create post metrics table
CREATE TABLE IF NOT EXISTS post_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  clicks integer DEFAULT 0,
  impressions integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE post_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for reading metrics
CREATE POLICY "Users can read own post metrics"
  ON post_metrics FOR SELECT
  TO authenticated
  USING (
    post_id IN (
      SELECT id FROM posts WHERE user_id = auth.uid()
    )
  );

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_post_metrics_post_id ON post_metrics(post_id);