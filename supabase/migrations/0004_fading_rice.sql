/*
  # Update niches with images and descriptions

  1. Changes
    - Updates existing niches with proper descriptions and high-quality images
    - Ensures all niches have meaningful descriptions
    - Adds professional Unsplash images for visual appeal
*/

UPDATE niches 
SET 
  description = CASE name
    WHEN 'residential_cleaning' THEN 'Expert tips and strategies for residential cleaning services, home organization, and maintaining a spotless living space'
    WHEN 'commercial_cleaning' THEN 'Professional insights into commercial cleaning operations, industrial maintenance, and building management'
    WHEN 'side_hustles' THEN 'Discover profitable side business opportunities, entrepreneurship tips, and strategies for growing additional income streams'
    WHEN 'digital_marketing' THEN 'Master digital marketing strategies, social media management, and online brand building techniques'
  END,
  image_url = CASE name
    WHEN 'residential_cleaning' THEN 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80'
    WHEN 'commercial_cleaning' THEN 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1000&q=80'
    WHEN 'side_hustles' THEN 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=80'
    WHEN 'digital_marketing' THEN 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80'
  END
WHERE name IN ('residential_cleaning', 'commercial_cleaning', 'side_hustles', 'digital_marketing');