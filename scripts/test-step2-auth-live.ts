import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!url || !key) {
  console.error('Missing Supabase configuration in .env.local');
  process.exit(1);
}

async function testLiveAuth() {
  console.log('=============================================================================');
  console.log('KAARYAN LABS — STEP 2: REAL SUPABASE AUTHENTICATION TEST SUITE');
  console.log('=============================================================================\n');

  const customerClient = createClient(url, key);
  const ownerClient = createClient(url, key);

  // 1. Customer Login
  console.log('▶ 1. Testing Customer Login (dev.customer@kaaryanlabs.com)...');
  const { data: custAuth, error: custErr } = await customerClient.auth.signInWithPassword({
    email: 'dev.customer@kaaryanlabs.com',
    password: 'DevTestPassword123!#'
  });

  if (custErr) {
    console.error('❌ Customer login failed:', custErr.message);
  } else {
    console.log('✅ Customer login successful!');
    console.log(`   User ID: ${custAuth.user.id}`);
    console.log(`   Email: ${custAuth.user.email}`);
    console.log(`   Audience: ${custAuth.user.aud}`);

    // Verify RLS access to own profile
    const { data: custProfile, error: profileErr } = await customerClient
      .from('user_profiles')
      .select('*')
      .eq('id', custAuth.user.id)
      .single();

    if (profileErr) {
      console.error('❌ Could not fetch customer profile via RLS:', profileErr.message);
    } else {
      console.log('✅ Customer profile retrieved through RLS:');
      console.log(`   Name: ${custProfile.display_name}, City: ${custProfile.city_id}`);
    }

    // Verify RLS access to own role
    const { data: custRoles, error: rolesErr } = await customerClient
      .from('user_roles')
      .select('*')
      .eq('user_id', custAuth.user.id);

    if (rolesErr) {
      console.error('❌ Could not fetch customer roles via RLS:', rolesErr.message);
    } else {
      console.log(`✅ Customer roles retrieved through RLS: ${custRoles.map(r => r.role).join(', ')}`);
    }
  }

  // 2. Business Owner Login
  console.log('\n▶ 2. Testing Business Owner Login (dev.owner@kaaryanlabs.com)...');
  const { data: ownerAuth, error: ownerErr } = await ownerClient.auth.signInWithPassword({
    email: 'dev.owner@kaaryanlabs.com',
    password: 'DevTestPassword123!#'
  });

  if (ownerErr) {
    console.error('❌ Business Owner login failed:', ownerErr.message);
  } else {
    console.log('✅ Business Owner login successful!');
    console.log(`   User ID: ${ownerAuth.user.id}`);
    console.log(`   Email: ${ownerAuth.user.email}`);

    // Verify RLS access to own profile
    const { data: ownerProfile, error: profileErr } = await ownerClient
      .from('user_profiles')
      .select('*')
      .eq('id', ownerAuth.user.id)
      .single();

    if (profileErr) {
      console.error('❌ Could not fetch owner profile via RLS:', profileErr.message);
    } else {
      console.log('✅ Owner profile retrieved through RLS:');
      console.log(`   Name: ${ownerProfile.display_name}, City: ${ownerProfile.city_id}`);
    }

    // Verify RLS access to own role
    const { data: ownerRoles, error: rolesErr } = await ownerClient
      .from('user_roles')
      .select('*')
      .eq('user_id', ownerAuth.user.id);

    if (rolesErr) {
      console.error('❌ Could not fetch owner roles via RLS:', rolesErr.message);
    } else {
      console.log(`✅ Owner roles retrieved through RLS: ${ownerRoles.map(r => r.role).join(', ')}`);
    }
  }

  // 3. Negative Auth Test - Invalid Password
  console.log('\n▶ 3. Testing Login with Invalid Credentials...');
  const { error: badAuthErr } = await customerClient.auth.signInWithPassword({
    email: 'dev.customer@kaaryanlabs.com',
    password: 'WrongPassword456!#'
  });

  if (badAuthErr) {
    console.log(`✅ Invalid credentials properly rejected by Supabase Auth: ${badAuthErr.message} (status: ${badAuthErr.status})`);
  } else {
    console.error('❌ Unexpected: Login succeeded with invalid password!');
  }

  // 4. Session & Sign Out
  console.log('\n▶ 4. Testing Sign Out...');
  await customerClient.auth.signOut();
  await ownerClient.auth.signOut();
  console.log('✅ Both client sessions successfully terminated.');
}

testLiveAuth().catch(err => {
  console.error('Fatal live auth test error:', err);
  process.exit(1);
});

