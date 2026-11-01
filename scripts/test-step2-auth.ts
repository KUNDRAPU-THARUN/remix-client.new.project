import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(url, key);

async function testAuthFlows() {
  console.log('=============================================================================');
  console.log('KAARYAN LABS — STEP 2: REAL SUPABASE AUTHENTICATION TEST SUITE');
  console.log('=============================================================================\n');

  const timestamp = Date.now();
  const customerEmail = `dev.customer.${timestamp}@kaaryanlabs.com`;
  const ownerEmail = `dev.owner.${timestamp}@kaaryanlabs.com`;
  const securePassword = 'TestPassword123!#';

  // 1. Customer Signup
  console.log('▶ 1. Testing Customer Signup...');
  const { data: custSignupData, error: custSignupErr } = await supabase.auth.signUp({
    email: customerEmail,
    password: securePassword,
    options: {
      data: {
        display_name: 'Dev Customer One',
        phone: '+91 94401 23456',
        role: 'customer',
        city_id: 'chittoor'
      }
    }
  });

  if (custSignupErr) {
    console.error('❌ Customer signup failed:', custSignupErr.message);
  } else {
    console.log('✅ Customer signup initiated successfully:');
    console.log(`   User ID: ${custSignupData.user?.id}`);
    console.log(`   Email Confirmed: ${custSignupData.user?.confirmed_at ? 'YES' : 'PENDING CONFIRMATION'}`);
    console.log(`   Session Established: ${custSignupData.session ? 'YES' : 'NO (Email confirmation required)'}`);
    console.log(`   Assigned Metadata Role: ${custSignupData.user?.user_metadata?.role}`);
  }

  // 2. Business Owner Signup
  console.log('\n▶ 2. Testing Business Owner Signup...');
  const { data: ownerSignupData, error: ownerSignupErr } = await supabase.auth.signUp({
    email: ownerEmail,
    password: securePassword,
    options: {
      data: {
        display_name: 'Dev Business Owner',
        phone: '+91 98480 98765',
        role: 'business_owner',
        city_id: 'chittoor'
      }
    }
  });

  if (ownerSignupErr) {
    console.error('❌ Business Owner signup failed:', ownerSignupErr.message);
  } else {
    console.log('✅ Business Owner signup initiated successfully:');
    console.log(`   User ID: ${ownerSignupData.user?.id}`);
    console.log(`   Email Confirmed: ${ownerSignupData.user?.confirmed_at ? 'YES' : 'PENDING CONFIRMATION'}`);
    console.log(`   Session Established: ${ownerSignupData.session ? 'YES' : 'NO (Email confirmation required)'}`);
    console.log(`   Assigned Metadata Role: ${ownerSignupData.user?.user_metadata?.role}`);
  }

  // 3. Invalid Credentials Test
  console.log('\n▶ 3. Testing Login with Invalid Credentials...');
  const { data: badLoginData, error: badLoginErr } = await supabase.auth.signInWithPassword({
    email: customerEmail,
    password: 'CompletelyWrongPassword!999'
  });

  if (badLoginErr) {
    console.log(`✅ Invalid credentials properly rejected by Supabase Auth:`);
    console.log(`   Error: ${badLoginErr.message} (status: ${badLoginErr.status})`);
  } else {
    console.error('❌ Unexpected: Login succeeded with invalid password!');
  }

  // 4. Password Recovery Request
  console.log('\n▶ 4. Testing Password Recovery Trigger...');
  const { data: resetData, error: resetErr } = await supabase.auth.resetPasswordForEmail(customerEmail, {
    redirectTo: 'https://remix-client-new-project.vercel.app/reset-password'
  });

  if (resetErr) {
    console.log(`⚠️ Password recovery result: ${resetErr.message}`);
  } else {
    console.log('✅ Password recovery email successfully dispatched by Supabase Auth.');
  }

  // 5. Session Check & Logout
  console.log('\n▶ 5. Testing Session Restoration & Logout...');
  const { data: sessionData } = await supabase.auth.getSession();
  console.log(`   Current Active Session: ${sessionData.session ? 'ACTIVE' : 'NONE'}`);

  const { error: signOutErr } = await supabase.auth.signOut();
  if (signOutErr) {
    console.error('❌ Sign out failed:', signOutErr.message);
  } else {
    console.log('✅ Sign out completed successfully.');
  }
}

testAuthFlows().catch((err) => {
  console.error('Fatal auth test error:', err);
  process.exit(1);
});
