/*
  # Add image support for niches

  1. Changes
    - Add image_url column to niches table
    - Update existing niches with relevant images
*/

-- Add image_url column to niches table
ALTER TABLE niches ADD COLUMN IF NOT EXISTS image_url text;

-- Update existing niches with images
UPDATE niches SET image_url = CASE name
  WHEN 'residential_cleaning' THEN 'https://images.unsplash.com/photo-1581578731548-c64695cc6952'
  WHEN 'commercial_cleaning' THEN 'https://images.unsplash.com/photo-1521791136064-7986c2920216'
  WHEN 'side_hustles' THEN 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85'
  WHEN 'digital_marketing' THEN 'https://images.unsplash.com/photo-1460925895917-afdab827c52f'
  END;