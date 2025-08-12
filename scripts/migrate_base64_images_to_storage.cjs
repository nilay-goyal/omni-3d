// migrate_base64_images_to_storage.cjs
// Migrates legacy base64 images in marketplace_images to Supabase Storage and updates image_url to public URL

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://vliuwkgsezxfwdgdlkuw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsaXV3a2dzZXp4ZndkZ2Rsa3V3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTEzMzc5NCwiZXhwIjoyMDY0NzA5Nzk0fQ.KMBhtaQ0h6-ipqsggTPNf_en5WFKJ3_1GoqexRi-3RM';
const STORAGE_BUCKET = 'lovable-uploads';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrateImages() {
  let offset = 0;
  const batchSize = 10;
  let totalMigrated = 0;
  while (true) {
    const { data: images, error } = await supabase
      .from('marketplace_images')
      .select('id, listing_id, image_url')
      .like('image_url', 'data:image%')
      .range(offset, offset + batchSize - 1);

    if (error) {
      console.error('Error fetching images:', error);
      break;
    }
    if (!images || images.length === 0) break;

    for (const img of images) {
      try {
        // Parse base64 data
        const match = img.image_url.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
        if (!match) continue;
        const ext = match[1].split('/')[1];
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `${img.listing_id}_${img.id}_${Date.now()}.${ext}`;
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filename, buffer, {
            contentType: match[1],
            upsert: true,
          });
        if (uploadError) {
          console.error(`Upload failed for image ${img.id}:`, uploadError);
          continue;
        }
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filename);
        const publicUrl = publicUrlData.publicUrl;
        // Update image_url in DB
        const { error: updateError } = await supabase
          .from('marketplace_images')
          .update({ image_url: publicUrl })
          .eq('id', img.id);
        if (updateError) {
          console.error(`DB update failed for image ${img.id}:`, updateError);
          continue;
        }
        console.log(`Migrated image ${img.id} to ${publicUrl}`);
        totalMigrated++;
      } catch (e) {
        console.error(`Error processing image ${img.id}:`, e);
      }
    }
    offset += batchSize;
  }
  console.log(`Migration complete. Total images migrated: ${totalMigrated}`);
}

migrateImages();
