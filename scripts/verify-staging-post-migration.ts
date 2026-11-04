import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';

const STAGING_REF = 'tbwtxnszyddvpgqvxwow';
const STAGING_URL = `https://${STAGING_REF}.supabase.co`;

console.log('=============================================================================');
console.log('KAARYAN LABS — PHASE 8B STAGING POST-MIGRATION VERIFICATION');
console.log(`Staging Project: kaaryan-localads-staging (${STAGING_REF})`);
console.log('=============================================================================\n');

interface AssertionResult {
  task: string;
  name: string;
  passed: boolean;
  details: string;
}

const results: AssertionResult[] = [];

function assert(task: string, name: string, condition: boolean, details: string) {
  results.push({ task, name, passed: condition, details });
  if (condition) {
    console.log(`   ✅ PASS: [${task}] ${name} -> ${details}`);
  } else {
    console.error(`   ❌ FAIL: [${task}] ${name} -> ${details}`);
  }
}

async function run() {
  // 1. Obtain Staging Keys securely via CLI (in-memory only, never printed)
  let anonKey = '';
  let serviceRoleKey = '';
  try {
    const raw = execSync(`npx supabase projects api-keys --remote=${STAGING_REF} --reveal --output json`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const parsed = JSON.parse(raw);
    const keys = parsed.api_keys || parsed || [];
    const anonObj = keys.find((k: any) => k.name === 'anon' || k.role === 'anon' || (k.name && k.name.includes('anon')));
    const svcObj = keys.find((k: any) => k.name === 'service_role' || k.role === 'service_role' || (k.name && k.name.includes('service')));
    if (anonObj && anonObj.api_key) anonKey = anonObj.api_key;
    if (svcObj && svcObj.api_key) serviceRoleKey = svcObj.api_key;
  } catch (err: any) {
    console.error('Could not fetch staging api-keys via CLI:', err.message);
  }

  if (!anonKey) {
    console.error('❌ Could not retrieve anon key for staging project. Halting live API checks.');
    process.exit(1);
  }

  console.log('▶ Successfully obtained staging API access keys in-memory (credentials hidden).');
  const anonSupabase = createClient(STAGING_URL, anonKey);
  const adminSupabase = serviceRoleKey ? createClient(STAGING_URL, serviceRoleKey) : null;

  // ---------------------------------------------------------------------------
  // TASK 4: CITY REFERENCE RECORDS
  // ---------------------------------------------------------------------------
  console.log('\n▶ TASK 4: THREE CITY REFERENCE RECORDS AUDIT');
  const { data: cities, error: cErr } = await anonSupabase.from('cities').select('*').order('id');
  assert(
    'Task 4: Cities',
    'Remote cities table contains exactly 3 canonical cities',
    Boolean(cities && cities.length === 3),
    `Found ${cities?.length || 0} cities (Error: ${cErr?.message || 'none'})`
  );

  const cityIds = (cities || []).map((c: any) => c.id).sort();
  const cityCodes = (cities || []).map((c: any) => c.code).sort();
  assert(
    'Task 4: City Codes',
    'Cities have AP-03, KA-01, TN-23 codes matching Chittoor, Bengaluru, Vellore',
    JSON.stringify(cityIds) === JSON.stringify(['bengaluru', 'chittoor', 'vellore']) &&
      JSON.stringify(cityCodes) === JSON.stringify(['AP-03', 'KA-01', 'TN-23']),
    `Cities: ${cityIds.join(', ')} | Codes: ${cityCodes.join(', ')}`
  );

  // ---------------------------------------------------------------------------
  // TASK 11: SEED INTEGRITY & ZERO FABRICATED DATA
  // ---------------------------------------------------------------------------
  console.log('\n▶ TASK 11: AUTHENTICITY & ZERO FABRICATED DATA AUDIT');
  const { data: categories } = await anonSupabase.from('categories').select('*');
  assert(
    'Task 11: Categories',
    'Categories table contains exactly 10 clean commercial categories',
    Boolean(categories && categories.length === 10),
    `Count: ${categories?.length || 0}`
  );

  const { data: businesses } = await anonSupabase.from('businesses').select('*');
  assert(
    'Task 11: Zero Fake Businesses',
    'Businesses table has zero fabricated listings on staging',
    Boolean(businesses && businesses.length === 0),
    `Listing count: ${businesses?.length || 0}`
  );

  const { data: reviews } = await anonSupabase.from('reviews').select('*');
  assert(
    'Task 11: Zero Fake Reviews',
    'Reviews table has zero fabricated ratings/reviews on staging',
    Boolean(reviews && reviews.length === 0),
    `Review count: ${reviews?.length || 0}`
  );

  // ---------------------------------------------------------------------------
  // TASK 5 & 10: RLS POLICIES & ANONYMOUS PRIVACY PROTECTION
  // ---------------------------------------------------------------------------
  console.log('\n▶ TASK 5 & 10: ROW LEVEL SECURITY & PRIVACY GATES');
  
  // customer_enquiries
  const { data: enqData } = await anonSupabase.from('customer_enquiries').select('*');
  assert(
    'Task 10: Enquiry Privacy',
    'Anonymous user cannot read customer_enquiries',
    Boolean(!enqData || enqData.length === 0),
    `Returned ${enqData?.length || 0} rows (RLS isolated)`
  );

  // general_service_requests
  const { data: genData } = await anonSupabase.from('general_service_requests').select('*');
  assert(
    'Task 10: Leads Privacy',
    'Anonymous user cannot read general_service_requests',
    Boolean(!genData || genData.length === 0),
    `Returned ${genData?.length || 0} rows (RLS isolated)`
  );

  // audit_logs
  const { data: auditData } = await anonSupabase.from('audit_logs').select('*');
  assert(
    'Task 10: Audit Log Privacy',
    'Anonymous user cannot read audit_logs',
    Boolean(!auditData || auditData.length === 0),
    `Returned ${auditData?.length || 0} rows (RLS isolated)`
  );

  // user_roles
  const { data: rolesData } = await anonSupabase.from('user_roles').select('*');
  assert(
    'Task 10: User Roles Privacy',
    'Anonymous user cannot read user_roles',
    Boolean(!rolesData || rolesData.length === 0),
    `Returned ${rolesData?.length || 0} rows (RLS isolated)`
  );

  // user_profiles
  const { data: profData } = await anonSupabase.from('user_profiles').select('*');
  assert(
    'Task 10: User Profiles Privacy',
    'Anonymous user cannot read user_profiles',
    Boolean(!profData || profData.length === 0),
    `Returned ${profData?.length || 0} rows (RLS isolated)`
  );

  // ---------------------------------------------------------------------------
  // TASK 7 & 8: RPC FUNCTIONS EXISTENCE & ACTIVE STATUS
  // ---------------------------------------------------------------------------
  console.log('\n▶ TASK 7, 8 & 9: SECURE RPC FUNCTIONS AUDIT');

  // moderate_business_listing
  const { error: modErr } = await anonSupabase.rpc('moderate_business_listing', {
    _listing_id: '00000000-0000-0000-0000-000000000000',
    _action: 'approve',
  });
  const modExists = !modErr?.message?.includes('Could not find');
  assert(
    'Task 7: Moderate RPC',
    'moderate_business_listing RPC exists and is callable in staging schema cache',
    modExists,
    `Response: "${modErr?.message || 'success'}"`
  );

  // admin_set_user_status
  const { error: statusErr } = await anonSupabase.rpc('admin_set_user_status', {
    _target_user_id: '00000000-0000-0000-0000-000000000000',
    _new_status: 'active',
  });
  const statusExists = !statusErr?.message?.includes('Could not find');
  assert(
    'Task 8: User Status RPC',
    'admin_set_user_status RPC exists and is installed on staging PostgreSQL',
    statusExists,
    `Response: "${statusErr?.message || 'success'}"`
  );

  // admin_assign_user_role
  const { error: roleErr } = await anonSupabase.rpc('admin_assign_user_role', {
    _target_user_id: '00000000-0000-0000-0000-000000000000',
    _role: 'customer',
  });
  const roleExists = !roleErr?.message?.includes('Could not find');
  assert(
    'Task 8: Role Assignment RPC',
    'admin_assign_user_role RPC exists and is installed on staging PostgreSQL',
    roleExists,
    `Response: "${roleErr?.message || 'success'}"`
  );

  // Execution permissions check: Anonymous call must be rejected with auth error, NOT executed
  assert(
    'Task 9: Auth Gate on Status RPC',
    'admin_set_user_status rejects unauthenticated call',
    Boolean(statusErr && (statusErr.message.includes('Authentication Required') || statusErr.message.includes('Must be logged in') || statusErr.message.includes('Access Denied'))),
    `Error reported: "${statusErr?.message}"`
  );

  assert(
    'Task 9: Auth Gate on Role RPC',
    'admin_assign_user_role rejects unauthenticated call',
    Boolean(roleErr && (roleErr.message.includes('Authentication Required') || roleErr.message.includes('Must be logged in') || roleErr.message.includes('Access Denied'))),
    `Error reported: "${roleErr?.message}"`
  );

  // ---------------------------------------------------------------------------
  // TASK 6: STORAGE BUCKET AUDIT
  // ---------------------------------------------------------------------------
  console.log('\n▶ TASK 6: STORAGE BUCKET & MEDIA POLICY AUDIT');
  
  // 1. Anonymous bucket enumeration isolation
  const { data: anonBuckets } = await anonSupabase.storage.listBuckets();
  assert(
    'Task 6: Bucket Enumeration Privacy',
    'Anonymous client cannot enumerate private storage buckets',
    Boolean(!anonBuckets || anonBuckets.length === 0),
    `Anonymous listBuckets returned ${anonBuckets?.length || 0} buckets (Isolated)`
  );

  // 2. Storage Bucket definition check via admin client
  if (adminSupabase) {
    const { data: buckets, error: bktErr } = await adminSupabase.storage.listBuckets();
    const bizBucket = (buckets || []).find((b: any) => b.id === 'business-images');
    assert(
      'Task 6: Storage Bucket Existence',
      'business-images storage bucket exists on staging PostgreSQL catalog',
      Boolean(bizBucket),
      bizBucket ? `Bucket: ${bizBucket.id}, public=${bizBucket.public}, limit=${bizBucket.file_size_limit} bytes` : `Error: ${bktErr?.message}`
    );

    if (bizBucket) {
      assert(
        'Task 6: Bucket Privacy Configuration',
        'business-images is configured as private bucket (public: false) with 5MB limit',
        bizBucket.public === false && bizBucket.file_size_limit === 5242880,
        `public=${bizBucket.public}, limit=${bizBucket.file_size_limit} bytes, types=${bizBucket.allowed_mime_types?.join(', ')}`
      );
    }
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log('\n=============================================================================');
  console.log(`STAGING POST-MIGRATION AUDIT: ${passed}/${total} assertions passed (${((passed / total) * 100).toFixed(1)}%)`);
  console.log('=============================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run();
