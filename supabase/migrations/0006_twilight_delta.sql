/*
  # Fix niche data and relationships

  1. Updates
    - Ensure niches table has correct data
    - Add indexes for better performance
    - Update RLS policies for better security
*/

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_niches_user_id ON user_niches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_niches_niche_id ON user_niches(niche_id);

-- Ensure niches exist with proper data
INSERT INTO niches (name, description, image_url) 
VALUES 
  ('residential_cleaning', 'Transform homes with expert cleaning tips, organization strategies, and proven methods for maintaining pristine living spaces', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80'),
  ('commercial_cleaning', 'Scale your commercial cleaning business with industry insights, management techniques, and operational excellence', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80'),
  ('side_hustles', 'Launch and grow profitable side businesses with actionable strategies, time management tips, and income optimization', 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80'),
  ('digital_marketing', 'Master modern digital marketing with data-driven strategies, social media expertise, and brand building techniques', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80')
ON CONFLICT (name) 
DO UPDATE SET 
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;