
-- Add missing location fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location_country text DEFAULT 'Canada',
ADD COLUMN IF NOT EXISTS location_state text,
ADD COLUMN IF NOT EXISTS location_city text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS street_address text;

-- Add missing location fields to marketplace_listings table
ALTER TABLE public.marketplace_listings 
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS street_address text;
