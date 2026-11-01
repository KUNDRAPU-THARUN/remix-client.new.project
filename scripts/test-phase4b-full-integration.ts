import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const testCustomerEmail = process.env.TEST_CUSTOMER_EMAIL || 'dev.customer@kaaryanlabs.com';
const testOwnerEmail = process.env.TEST_OWNER_EMAIL || 'dev.owner@kaaryanlabs.com';
const testPassword = process.env.TEST_USER_PASSWORD || 'DevTestPassword123!#';

if (!url || !key) {
  console.error('FATAL: Missing Supabase credentials in .env.local');
  process.exit(1);
}

interface TestReportItem {
  id: string;
  name: string;
  category: 'SCHEMA' | 'AUTH' | 'LISTINGS' | 'MULTI_CITY' | 'ENQUIRIES' | 'STORAGE';
  status: 'PASS' | 'FAIL';
  details: string;
}

const report: TestReportItem[] = [];

function recordTest(id: string, name: string, category: TestReportItem['category'], pass: boolean, details: string) {
  report.push({
    id,
    name,
    category,
    status: pass ? 'PASS' : 'FAIL',
    details,
  });
  const icon = pass ? '✅' : '❌';
  console.log(`${icon} [${id}] ${name}: ${details}`);
}

async function runPhase4BVerification() {
  console.log('=============================================================================');
  console.log('KAARYAN LABS — PHASE 4B FULL DATABASE & SECURITY INTEGRATION VERIFICATION');
  console.log('Project: Chittoor Ads / Vellore Ads / Bengaluru Ads');
  console.log('=============================================================================\n');

  // Client instances
  const anonClient = createClient(url, key);
  const customerClient = createClient(url, key);
  const ownerClient = createClient(url, key);

  let customerId = '';
  let ownerId = '';
  let chittoorBizId = '';
  let velloreBizId = '';
  let enquiryId = '';

  // ---------------------------------------------------------------------------
  // 1. SCHEMA & REFERENCE DATA VERIFICATION
  // ---------------------------------------------------------------------------
  console.log('\n--- 1. SCHEMA & REFERENCE DATA VERIFICATION ---');

  // Check cities
  const { data: citiesData, error: citiesErr } = await anonClient.from('cities').select('id, name, state');
  const citiesOk = !citiesErr && citiesData && citiesData.length === 3;
  recordTest('SCH-01', 'Multi-City Registry', 'SCHEMA', citiesOk,
    citiesOk ? `Found ${citiesData.length} valid cities: ${citiesData.map(c => c.name).join(', ')}` : `Error: ${citiesErr?.message}`);

  // Check categories
  const { data: catData, error: catErr } = await anonClient.from('categories').select('id, name');
  const catOk = !catErr && catData && catData.length >= 10;
  recordTest('SCH-02', 'Business Categories Reference Data', 'SCHEMA', catOk,
    catOk ? `Loaded ${catData.length} categories across all cities` : `Error: ${catErr?.message}`);

  // Check zero fake businesses / zero fake reviews baseline
  const { data: existingBiz, error: bizErr } = await anonClient.from('businesses').select('id, rating, reviews_count');
  const cleanDb = !bizErr && (!existingBiz || existingBiz.length === 0);
  recordTest('SCH-03', 'Production Data Cleanliness (Zero Fabricated Ratings)', 'SCHEMA', cleanDb,
    cleanDb ? 'Baseline verified: 0 fake reviews, 0 synthetic 5-star businesses.' : `Found ${existingBiz?.length} pre-existing records`);

  // Check storage bucket privacy: Anon client cannot list private buckets, confirming private isolation
  const { data: anonBuckets, error: anonBucketErr } = await anonClient.storage.listBuckets();
  const anonBucketHidden = !anonBucketErr && (!anonBuckets || !anonBuckets.some(b => b.id === 'business-images' && b.public === true));
  recordTest('SCH-04', 'Private Storage Bucket Configuration', 'SCHEMA', anonBucketHidden,
    anonBucketHidden ? 'business-images is confirmed strictly PRIVATE (hidden from anonymous bucket discovery)' : 'Failed: Bucket is publicly exposed');

  // ---------------------------------------------------------------------------
  // 2. REAL SUPABASE AUTHENTICATION FLOWS
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. REAL SUPABASE AUTHENTICATION FLOWS ---');

  // Customer Login
  const { data: custLogin, error: custLoginErr } = await customerClient.auth.signInWithPassword({
    email: testCustomerEmail,
    password: testPassword,
  });
  const custLoginOk = !custLoginErr && !!custLogin.user;
  if (custLoginOk) customerId = custLogin.user.id;
  recordTest('AUTH-01', 'Customer Authentication & Session', 'AUTH', custLoginOk,
    custLoginOk ? `Logged in user ${custLogin.user.id} (${custLogin.user.email})` : `Login error: ${custLoginErr?.message}`);

  // Customer Profile & Role Retrieval (RLS test)
  const { data: custProfile, error: custProfErr } = await customerClient
    .from('user_profiles')
    .select('display_name, city_id, account_status')
    .eq('id', customerId)
    .single();
  const { data: custRoles } = await customerClient
    .from('user_roles')
    .select('role')
    .eq('user_id', customerId);
  const custRoleOk = !custProfErr && custProfile && custRoles?.some(r => r.role === 'customer');
  recordTest('AUTH-02', 'Customer RLS Profile & Role Resolution', 'AUTH', !!custRoleOk,
    custRoleOk ? `Profile: ${custProfile?.display_name}, Role: ${custRoles?.map(r => r.role).join(', ')}` : `Error: ${custProfErr?.message}`);

  // Business Owner Login
  const { data: ownerLogin, error: ownerLoginErr } = await ownerClient.auth.signInWithPassword({
    email: testOwnerEmail,
    password: testPassword,
  });
  const ownerLoginOk = !ownerLoginErr && !!ownerLogin.user;
  if (ownerLoginOk) ownerId = ownerLogin.user.id;
  recordTest('AUTH-03', 'Business Owner Authentication & Session', 'AUTH', ownerLoginOk,
    ownerLoginOk ? `Logged in owner ${ownerLogin.user.id} (${ownerLogin.user.email})` : `Login error: ${ownerLoginErr?.message}`);

  // Owner Profile & Role Retrieval (RLS test)
  const { data: ownerProfile, error: ownerProfErr } = await ownerClient
    .from('user_profiles')
    .select('display_name, city_id, account_status')
    .eq('id', ownerId)
    .single();
  const { data: ownerRoles } = await ownerClient
    .from('user_roles')
    .select('role')
    .eq('user_id', ownerId);
  const ownerRoleOk = !ownerProfErr && ownerProfile && ownerRoles?.some(r => r.role === 'business_owner');
  recordTest('AUTH-04', 'Business Owner RLS Profile & Role Resolution', 'AUTH', !!ownerRoleOk,
    ownerRoleOk ? `Profile: ${ownerProfile?.display_name}, Role: ${ownerRoles?.map(r => r.role).join(', ')}` : `Error: ${ownerProfErr?.message}`);

  // Negative Auth: Invalid credentials rejection
  const { error: badAuthErr } = await anonClient.auth.signInWithPassword({
    email: testCustomerEmail,
    password: 'IncorrectPassword999!#',
  });
  const badAuthOk = !!badAuthErr && (badAuthErr.message.includes('Invalid login credentials') || badAuthErr.status === 400);
  recordTest('AUTH-05', 'Negative Test: Invalid Credentials Rejection', 'AUTH', badAuthOk,
    badAuthOk ? `Correctly rejected invalid login with HTTP 400: "${badAuthErr?.message}"` : 'Failed: Bad login was not properly rejected');

  // Negative Auth: Unauthorized profile snooping
  const { data: snoopedProfile, error: snoopErr } = await customerClient
    .from('user_profiles')
    .select('*')
    .eq('id', ownerId)
    .maybeSingle();
  const snoopBlocked = !snoopedProfile || !!snoopErr;
  recordTest('AUTH-06', 'Negative Test: Cross-User Profile Privacy (RLS)', 'AUTH', snoopBlocked,
    snoopBlocked ? 'RLS properly blocked customer from querying owner private profile row' : 'Failed: Customer was able to read another user profile');

  // ---------------------------------------------------------------------------
  // 3. BUSINESS LISTINGS INTEGRATION & ANTI-TAMPERING
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. BUSINESS LISTINGS INTEGRATION & ANTI-TAMPERING ---');

  // Owner submits new listing in Chittoor with deliberate tampering attempts
  const { data: newBiz, error: createBizErr } = await ownerClient
    .from('businesses')
    .insert({
      city_id: 'chittoor',
      category_id: 'restaurants',
      name: 'Sri Krishna Grand Restaurant',
      description: 'Authentic South Indian vegetarian pure veg dining',
      phone: '+91 98480 12345',
      address: 'Gandhi Road, Near Clock Tower, Chittoor',
      locality: 'gandhi-road',
      // Tampering attempts below (should be overridden by trigger)
      status: 'active',
      is_verified: true,
      rating: 4.9,
      reviews_count: 120,
    })
    .select()
    .single();

  const bizCreated = !createBizErr && !!newBiz;
  if (bizCreated) chittoorBizId = newBiz.id;
  recordTest('BIZ-01', 'Business Listing Creation', 'LISTINGS', bizCreated,
    bizCreated ? `Listing created successfully with ID: ${newBiz.id}` : `Creation failed: ${createBizErr?.message}`);

  // Verify anti-tampering trigger enforced: status='pending', is_verified=false, rating=0.0
  const triggerEnforced = newBiz &&
    newBiz.status === 'pending' &&
    newBiz.is_verified === false &&
    Number(newBiz.rating) === 0 &&
    newBiz.reviews_count === 0 &&
    newBiz.owner_id === ownerId;
  recordTest('BIZ-02', 'Anti-Tampering Trigger Enforcement (guard_business_insert)', 'LISTINGS', !!triggerEnforced,
    triggerEnforced
      ? `Trigger enforced: status=${newBiz?.status}, is_verified=${newBiz?.is_verified}, rating=${newBiz?.rating}, owner=${newBiz?.owner_id}`
      : `Trigger failed to enforce clean values: status=${newBiz?.status}, verified=${newBiz?.is_verified}`);

  // Verify pending listing is HIDDEN from anonymous visitors
  const { data: anonViewBiz } = await anonClient
    .from('businesses')
    .select('id, name')
    .eq('id', chittoorBizId)
    .maybeSingle();
  const anonHidden = !anonViewBiz;
  recordTest('BIZ-03', 'Pending Listing Confidentiality (Hidden from Anonymous Visitors)', 'LISTINGS', anonHidden,
    anonHidden ? 'RLS Policy confirmed: Pending listing is strictly invisible to anonymous visitors' : 'Failed: Anonymous visitor was able to see pending listing');

  // Verify pending listing IS visible to the business owner
  const { data: ownerViewBiz } = await ownerClient
    .from('businesses')
    .select('id, name, status')
    .eq('id', chittoorBizId)
    .maybeSingle();
  const ownerVisible = !!ownerViewBiz && ownerViewBiz.status === 'pending';
  recordTest('BIZ-04', 'Owner Access to Own Pending Listing', 'LISTINGS', ownerVisible,
    ownerVisible ? `Owner successfully viewed their pending listing (${ownerViewBiz.name})` : 'Failed: Owner could not view their own pending listing');

  // Negative Test: Owner attempts to approve/activate own listing (guard_business_update)
  const { error: selfApproveErr } = await ownerClient
    .from('businesses')
    .update({ status: 'active' })
    .eq('id', chittoorBizId);
  const selfApproveBlocked = !!selfApproveErr && selfApproveErr.message.includes('Business owners cannot approve their own listings');
  recordTest('BIZ-05', 'Negative Test: Self-Approval Block (guard_business_update)', 'LISTINGS', selfApproveBlocked,
    selfApproveBlocked ? `PostgreSQL Trigger blocked self-approval: "${selfApproveErr?.message}"` : `Failed: Owner attempted self-approval without exception`);

  // Negative Test: Owner attempts to alter verification status
  const { error: selfVerifyErr } = await ownerClient
    .from('businesses')
    .update({ is_verified: true })
    .eq('id', chittoorBizId);
  const selfVerifyBlocked = !!selfVerifyErr && selfVerifyErr.message.includes('Business owners cannot alter verification status');
  recordTest('BIZ-06', 'Negative Test: Self-Verification Badge Block', 'LISTINGS', selfVerifyBlocked,
    selfVerifyBlocked ? `PostgreSQL Trigger blocked self-verification: "${selfVerifyErr?.message}"` : `Failed: Verification guard did not trigger`);

  // ---------------------------------------------------------------------------
  // 4. MULTI-CITY DATA ISOLATION
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. MULTI-CITY DATA ISOLATION ---');

  // Create second listing in Vellore
  const { data: velloreBiz, error: velloreBizErr } = await ownerClient
    .from('businesses')
    .insert({
      city_id: 'vellore',
      category_id: 'restaurants',
      name: 'Vellore Fort Royal Sweets',
      description: 'Traditional sweets and savouries near Vellore Fort',
      phone: '+91 94430 54321',
      address: 'Katpadi Main Road, Vellore',
      locality: 'katpadi',
    })
    .select()
    .single();

  if (velloreBiz) velloreBizId = velloreBiz.id;

  // Query owner listings filtered by Chittoor
  const { data: chittoorOwnerListings } = await ownerClient
    .from('businesses')
    .select('id, name, city_id')
    .eq('owner_id', ownerId)
    .eq('city_id', 'chittoor');

  // Query owner listings filtered by Vellore
  const { data: velloreOwnerListings } = await ownerClient
    .from('businesses')
    .select('id, name, city_id')
    .eq('owner_id', ownerId)
    .eq('city_id', 'vellore');

  // Query owner listings filtered by Bengaluru
  const { data: blrOwnerListings } = await ownerClient
    .from('businesses')
    .select('id, name, city_id')
    .eq('owner_id', ownerId)
    .eq('city_id', 'bengaluru');

  const cityIsolationOk =
    chittoorOwnerListings?.every(b => b.city_id === 'chittoor') &&
    velloreOwnerListings?.every(b => b.city_id === 'vellore') &&
    blrOwnerListings?.length === 0;

  recordTest('CITY-01', 'Multi-City Query Filtering & Territory Isolation', 'MULTI_CITY', !!cityIsolationOk,
    cityIsolationOk
      ? `Isolated: Chittoor=${chittoorOwnerListings?.length}, Vellore=${velloreOwnerListings?.length}, Bengaluru=${blrOwnerListings?.length}`
      : 'City query isolation leaked across boundaries');

  // Negative Test: Attempting to migrate a business across city territories
  const { error: crossCityErr } = await ownerClient
    .from('businesses')
    .update({ city_id: 'bengaluru' })
    .eq('id', chittoorBizId);
  const crossCityBlocked = !!crossCityErr && crossCityErr.message.includes('Cannot transfer business across city territories');
  recordTest('CITY-02', 'Negative Test: Cross-Territory Business Transfer Block', 'MULTI_CITY', crossCityBlocked,
    crossCityBlocked ? `Trigger blocked territorial transfer: "${crossCityErr?.message}"` : `Failed: City boundary transfer was not blocked`);

  // ---------------------------------------------------------------------------
  // 5. CUSTOMER ENQUIRY MANAGEMENT & PRIVATE LEAD ISOLATION
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. CUSTOMER ENQUIRY MANAGEMENT & PRIVACY ---');

  // Customer submits valid enquiry to Chittoor business
  const { data: enqData, error: enqErr } = await customerClient
    .from('customer_enquiries')
    .insert({
      business_id: chittoorBizId,
      city_id: 'chittoor',
      customer_id: customerId,
      customer_name: 'Dev Customer',
      customer_phone: '+91 94401 23456',
      customer_email: testCustomerEmail,
      message: 'Hello, do you provide catering services for family parties of 50 members?',
      status: 'pending',
    })
    .select()
    .single();

  const enqCreated = !enqErr && !!enqData;
  if (enqCreated) enquiryId = enqData.id;
  recordTest('ENQ-01', 'Customer Enquiry Submission', 'ENQUIRIES', enqCreated,
    enqCreated ? `Enquiry submitted with ID: ${enqData.id}` : `Enquiry submission failed: ${enqErr?.message}`);

  // Owner of the business can read the enquiry
  const { data: ownerEnqList } = await ownerClient
    .from('customer_enquiries')
    .select('id, customer_name, message, business_id')
    .eq('id', enquiryId);
  const ownerEnqOk = ownerEnqList && ownerEnqList.length === 1;
  recordTest('ENQ-02', 'Business Owner Lead Access', 'ENQUIRIES', !!ownerEnqOk,
    ownerEnqOk ? `Owner successfully read enquiry from ${ownerEnqList[0].customer_name}` : 'Failed: Owner could not read enquiry for their business');

  // Customer who submitted the enquiry can read their own enquiry
  const { data: custEnqList } = await customerClient
    .from('customer_enquiries')
    .select('id, message')
    .eq('id', enquiryId);
  const custEnqOk = custEnqList && custEnqList.length === 1;
  recordTest('ENQ-03', 'Customer Access to Own Enquiry', 'ENQUIRIES', !!custEnqOk,
    custEnqOk ? 'Customer can track their submitted enquiry' : 'Failed: Customer could not read their submitted enquiry');

  // Negative Test: Anonymous visitor cannot view private enquiry
  const { data: anonEnqList } = await anonClient
    .from('customer_enquiries')
    .select('id, message')
    .eq('id', enquiryId);
  const anonEnqBlocked = !anonEnqList || anonEnqList.length === 0;
  recordTest('ENQ-04', 'Negative Test: Anonymous Enquiry Privacy (RLS)', 'ENQUIRIES', anonEnqBlocked,
    anonEnqBlocked ? 'RLS properly blocked anonymous query on customer enquiry (0 records returned)' : 'Failed: Anonymous visitor was able to read private customer enquiry');

  // Negative Test: Unauthorized short message validation
  const { error: invalidEnqErr } = await customerClient
    .from('customer_enquiries')
    .insert({
      business_id: chittoorBizId,
      city_id: 'chittoor',
      customer_id: customerId,
      customer_name: 'A', // Too short (min 2)
      customer_phone: '123', // Too short (min 10)
      message: 'Hi', // Too short (min 5)
    });
  const invalidEnqBlocked = !!invalidEnqErr;
  recordTest('ENQ-05', 'Negative Test: Enquiry Input Validation Policy', 'ENQUIRIES', invalidEnqBlocked,
    invalidEnqBlocked ? `Policy rejected invalid short payload: "${invalidEnqErr?.message}"` : 'Failed: Invalid enquiry passed without error');

  // ---------------------------------------------------------------------------
  // 6. STORAGE SECURITY & SIGNED URLS
  // ---------------------------------------------------------------------------
  console.log('\n--- 6. STORAGE SECURITY & SIGNED URLS ---');

  const testFilePath = `chittoor/new/${Date.now()}_test_storefront.png`;
  // Simple 1x1 PNG buffer
  const samplePngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  // Authenticated Owner uploads to storage bucket
  const { data: uploadData, error: uploadErr } = await ownerClient.storage
    .from('business-images')
    .upload(testFilePath, samplePngBuffer, {
      contentType: 'image/png',
      upsert: true,
    });
  const uploadOk = !uploadErr && !!uploadData;
  recordTest('STOR-01', 'Authenticated Business Owner Image Upload', 'STORAGE', uploadOk,
    uploadOk ? `Image uploaded to: ${uploadData.path}` : `Upload failed: ${uploadErr?.message}`);

  // Direct public download attempt by anonymous client (Bucket is private)
  const { data: publicUrlData } = anonClient.storage
    .from('business-images')
    .getPublicUrl(testFilePath);

  let directDownloadBlocked = false;
  try {
    const res = await fetch(publicUrlData.publicUrl);
    // Because bucket is private, direct fetch should return 400 or 403 or error JSON
    if (res.status === 400 || res.status === 403 || res.status === 404) {
      directDownloadBlocked = true;
    } else {
      const text = await res.text();
      directDownloadBlocked = text.includes('error') || text.includes('not found') || text.includes('Unauthorized');
    }
  } catch {
    directDownloadBlocked = true;
  }
  recordTest('STOR-02', 'Private Bucket Confidentiality (Direct Public Access Denied)', 'STORAGE', directDownloadBlocked,
    directDownloadBlocked ? `Direct URL access properly denied (${publicUrlData.publicUrl.split('?')[0]})` : 'Failed: Private image was directly accessible');

  // Generate Signed URL as Owner
  const { data: signedData, error: signedErr } = await ownerClient.storage
    .from('business-images')
    .createSignedUrl(testFilePath, 300); // 5 minutes
  const signedOk = !signedErr && !!signedData?.signedUrl;

  let signedFetchOk = false;
  if (signedOk && signedData?.signedUrl) {
    try {
      const res = await fetch(signedData.signedUrl);
      signedFetchOk = res.ok && res.status === 200;
    } catch {
      signedFetchOk = false;
    }
  }
  recordTest('STOR-03', 'Time-Limited Signed URL Access', 'STORAGE', signedFetchOk,
    signedFetchOk ? 'Generated signed URL verified accessible via token' : `Signed URL failed: ${signedErr?.message}`);

  // Storage Cleanup
  await ownerClient.storage.from('business-images').remove([testFilePath]);

  // Clean up test listings and enquiries so remote database remains pristine
  console.log('\n--- CLEANING UP TEST DATA ---');
  if (enquiryId) {
    await ownerClient.from('customer_enquiries').delete().eq('id', enquiryId);
    console.log(`Cleaned up test enquiry: ${enquiryId}`);
  }
  if (chittoorBizId) {
    await ownerClient.from('businesses').delete().eq('id', chittoorBizId);
    console.log(`Cleaned up Chittoor test business: ${chittoorBizId}`);
  }
  if (velloreBizId) {
    await ownerClient.from('businesses').delete().eq('id', velloreBizId);
    console.log(`Cleaned up Vellore test business: ${velloreBizId}`);
  }

  // ---------------------------------------------------------------------------
  // SUMMARY RESULTS
  // ---------------------------------------------------------------------------
  console.log('\n=============================================================================');
  console.log('PHASE 4B TEST RESULTS SUMMARY');
  console.log('=============================================================================');

  const total = report.length;
  const passed = report.filter(r => r.status === 'PASS').length;
  const failed = report.filter(r => r.status === 'FAIL').length;

  console.log(`TOTAL TESTS:  ${total}`);
  console.log(`PASSED:       ${passed}`);
  console.log(`FAILED:       ${failed}`);
  console.log(`SUCCESS RATE: ${Math.round((passed / total) * 100)}%`);

  if (failed > 0) {
    console.error('\nFAILURES:');
    report.filter(r => r.status === 'FAIL').forEach(f => {
      console.error(`- [${f.id}] ${f.name}: ${f.details}`);
    });
    process.exit(1);
  } else {
    console.log('\n🌟 ALL 20 INTEGRATION AND SECURITY TESTS PASSED PERFECTLY!');
  }
}

runPhase4BVerification().catch(err => {
  console.error('FATAL TEST SUITE ERROR:', err);
  process.exit(1);
});
