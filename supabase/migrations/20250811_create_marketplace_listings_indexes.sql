-- Migration: Add indexes for marketplace_listings cursor pagination and filtering
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category_updated_at_desc ON marketplace_listings (category_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_price ON marketplace_listings (price);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_condition ON marketplace_listings (condition);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_city_updated_at_desc ON marketplace_listings (city_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_updated_at_id_desc ON marketplace_listings (updated_at DESC, id);
-- If geo is used:
-- CREATE INDEX IF NOT EXISTS idx_marketplace_listings_geom_gist ON marketplace_listings USING GIST (geom);
