// Script to check and fix broken image URLs in Supabase
// Run: node scripts/fix_image_urls.cjs

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PLACEHOLDER_URL = '/placeholder.svg';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixBrokenImageUrls() {
  // Find images with missing or invalid URLs
  const { data, error } = await supabase
    .from('marketplace_images')
    .select('id, image_url')
    .or(`image_url.is.null,image_url.eq.${PLACEHOLDER_URL}`);

  if (error) {
    console.error('Error fetching images:', error);
    return;
  }

  for (const img of data) {
    // If image_url is missing or is placeholder, update to placeholder
    if (!img.image_url || img.image_url === PLACEHOLDER_URL) {
      await supabase
        .from('marketplace_images')
        .update({ image_url: PLACEHOLDER_URL })
        .eq('id', img.id);
      console.log(`Fixed image record ${img.id}`);
    }
  }
  console.log('Image URL check/fix complete.');
}

fixBrokenImageUrls();
