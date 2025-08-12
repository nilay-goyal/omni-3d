-- Migration: Denormalize hot fields on marketplace_listings
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS quality_score INT NOT NULL DEFAULT 0;
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS photo_count INT NOT NULL DEFAULT 0;
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS city_id TEXT;

-- Backfill photo_count and city_id for existing rows
UPDATE marketplace_listings SET photo_count = (
  SELECT COUNT(*) FROM marketplace_images WHERE marketplace_images.listing_id = marketplace_listings.id
);
UPDATE marketplace_listings SET city_id = location_city;

-- Backfill quality_score for existing rows (simple version)
UPDATE marketplace_listings SET quality_score = (
  (CASE WHEN description IS NOT NULL AND description <> '' THEN 1 ELSE 0 END) +
  (CASE WHEN price > 0 THEN 1 ELSE 0 END) +
  (SELECT COUNT(*) FROM marketplace_images WHERE marketplace_images.listing_id = marketplace_listings.id) +
  (SELECT COALESCE(AVG(rating), 0) FROM profiles WHERE profiles.id = marketplace_listings.seller_id)
);
