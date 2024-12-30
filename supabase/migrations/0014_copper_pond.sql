/*
  # Update User Schema and Niche Selection

  1. Changes
    - Add trigger to handle niche selection updates
    - Add function to sync user_niches with user_profiles
    - Add indexes for better query performance

  2. Security
    - Enable RLS for all new tables
    - Add policies for user access
*/

-- Create function to sync niche selection
CREATE OR REPLACE FUNCTION sync_user_niche()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user_profiles when user_niches changes
  UPDATE user_profiles
  SET niche_id = NEW.niche_id
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for niche synchronization
DROP TRIGGER IF EXISTS on_user_niche_change ON user_niches;
CREATE TRIGGER on_user_niche_change
  AFTER INSERT OR UPDATE ON user_niches
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_niche();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_niche_id ON user_profiles(niche_id);
CREATE INDEX IF NOT EXISTS idx_user_niches_composite ON user_niches(user_id, niche_id);

-- Update RLS policies
CREATE POLICY "Users can update their own niches"
  ON user_niches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure existing users have proper niche relationships
INSERT INTO user_niches (user_id, niche_id)
SELECT id, niche_id
FROM user_profiles
WHERE niche_id IS NOT NULL
  AND id NOT IN (SELECT user_id FROM user_niches)
ON CONFLICT (user_id, niche_id) DO NOTHING;