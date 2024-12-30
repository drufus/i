/*
  # Add multi-niche support

  1. New Tables
    - `user_niches`: Junction table for user-niche relationships
      - `user_id` (uuid, references user_profiles)
      - `niche_id` (uuid, references niches)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `user_niches` table
    - Add policies for users to manage their niches
*/

-- Create junction table for user-niche relationships
CREATE TABLE IF NOT EXISTS user_niches (
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  niche_id uuid REFERENCES niches(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, niche_id)
);

-- Enable RLS
ALTER TABLE user_niches ENABLE ROW LEVEL SECURITY;

-- Users can read their own niche selections
CREATE POLICY "Users can read own niches"
  ON user_niches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can add niches
CREATE POLICY "Users can add niches"
  ON user_niches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can remove niches
CREATE POLICY "Users can remove own niches"
  ON user_niches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update articles policy to allow access to content from any of user's niches
DROP POLICY IF EXISTS "Users can read articles in their niche" ON articles;
CREATE POLICY "Users can read articles in their niches"
  ON articles FOR SELECT
  TO authenticated
  USING (
    niche_id IN (
      SELECT niche_id FROM user_niches WHERE user_id = auth.uid()
    )
  );