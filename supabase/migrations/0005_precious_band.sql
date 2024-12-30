/*
  # Add niche images and update descriptions

  1. Updates
    - Add high-quality images for each niche
    - Update descriptions to be more engaging
    - Ensure all niches have proper metadata
*/

-- Update niches with high-quality images and improved descriptions
UPDATE niches 
SET 
  description = CASE name
    WHEN 'residential_cleaning' THEN 'Transform homes with expert cleaning tips, organization strategies, and proven methods for maintaining pristine living spaces'
    WHEN 'commercial_cleaning' THEN 'Scale your commercial cleaning business with industry insights, management techniques, and operational excellence'
    WHEN 'side_hustles' THEN 'Launch and grow profitable side businesses with actionable strategies, time management tips, and income optimization'
    WHEN 'digital_marketing' THEN 'Master modern digital marketing with data-driven strategies, social media expertise, and brand building techniques'
  END,
  image_url = CASE name
    WHEN 'residential_cleaning' THEN 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80'
    WHEN 'commercial_cleaning' THEN 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80'
    WHEN 'side_hustles' THEN 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80'
    WHEN 'digital_marketing' THEN 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
  END
WHERE name IN ('residential_cleaning', 'commercial_cleaning', 'side_hustles', 'digital_marketing');