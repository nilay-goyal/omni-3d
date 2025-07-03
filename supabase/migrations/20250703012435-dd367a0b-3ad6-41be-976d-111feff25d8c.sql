-- Add latitude and longitude columns to profiles table for seller locations
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric;