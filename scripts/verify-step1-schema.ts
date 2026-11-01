import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

async function verifyDeployedSchema() {
  console.log('=============================================================================');
  console.log('KAARYAN LABS — STEP 1: DEPLOYED DATABASE SCHEMA VERIFICATION');
  console.log('=============================================================================\n');

  // 1. Verify Cities
  const { data: cities, error: citiesErr } = await supabase
    .from('cities')
    .select('id, name, state, brand_name, code, status');

  if (citiesErr) {
    console.error('❌ Failed to query cities:', citiesErr);
  } else {
    console.log(`✅ Cities verified (${cities.length} found):`);
    console.table(cities);
  }

  // 2. Verify Categories
  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('id, name, sort_order')
    .order('sort_order', { ascending: true });

  if (catErr) {
    console.error('❌ Failed to query categories:', catErr);
  } else {
    console.log(`✅ Categories verified (${categories.length} found):`);
    console.log(categories.map((c) => `${c.sort_order}. ${c.name} (${c.id})`).join(', '));
  }

  // 3. Verify Businesses (Reference migration must contain ZERO mock businesses)
  const { data: businesses, error: bizErr } = await supabase
    .from('businesses')
    .select('id, name, status, rating, reviews_count, is_verified');

  if (bizErr) {
    console.error('❌ Failed to query businesses:', bizErr);
  } else {
    console.log(`\n✅ Businesses table verified (${businesses.length} records found).`);
    if (businesses.length === 0) {
      console.log('✅ Clean baseline confirmed: Zero fabricated ratings or unearned verification records in database.');
    } else {
      console.log('⚠️ Existing records:', businesses);
    }
  }

  // 4. Verify RLS enforcement on private tables (e.g. user_profiles, user_roles, customer_enquiries)
  console.log('\n▶ Verifying Row Level Security on private tables (Anonymous access)...');

  const { data: enquiries, error: enqErr } = await supabase
    .from('customer_enquiries')
    .select('*');
  console.log('customer_enquiries anonymous select result:', {
    count: enquiries?.length,
    error: enqErr ? `${enqErr.message} (${enqErr.code})` : 'No error (unexpected)'
  });

  const { data: roles, error: rolesErr } = await supabase
    .from('user_roles')
    .select('*');
  console.log('user_roles anonymous select result:', {
    count: roles?.length,
    error: rolesErr ? `${rolesErr.message} (${rolesErr.code})` : 'No error'
  });

  // 5. Verify Storage Bucket & Privacy
  console.log('\n▶ Verifying Storage Bucket configuration...');
  const { data: storageList, error: storageErr } = await supabase.storage
    .from('business-images')
    .list();

  console.log('business-images bucket list result:', {
    data: storageList,
    error: storageErr ? `${storageErr.message}` : null
  });

  // Check public URL behavior: anonymous download of non-existent or unapproved object
  const publicUrlRes = supabase.storage.from('business-images').getPublicUrl('chittoor/new/test.jpg');
  console.log('Generated CDN URL format:', publicUrlRes.data.publicUrl);
}

verifyDeployedSchema().catch((err) => {
  console.error('Fatal error during schema verification:', err);
  process.exit(1);
});

