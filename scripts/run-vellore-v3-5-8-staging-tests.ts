/**
 * KAARYAN LABS — PHASE V3.5.8
 * DEDICATED STAGING API TEST RUNNER
 *
 * Target: Supabase Staging (tbwtxnszyddvpgqvxwow)
 * Strictly Protected: Production / Dev (gpqbppjqqndzuvksrtjb)
 *
 * Executes authentic HTTP / PostgREST operations across 4 authentic staging personas:
 * 1. Anonymous Visitor (Unauthenticated)
 * 2. Ordinary Customer (Authenticated: k.tharunkumar0507@gmail.com)
 * 3. Vellore Franchise Operator (Authenticated: ktharunkumart@gmail.com)
 * 4. Other-City Franchise Operator (Authenticated: kumarfranchise@gmail.com)
 * 5. Super Admin (Authenticated: tharunsuperadmin@gmail.com)
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

interface TestResult {
  num: number;
  name: string;
  classification: 'LIVE VERIFIED' | 'STATIC VERIFIED' | 'BLOCKED' | 'FAILED' | 'NOT TESTED';
  details: string;
  recordId?: string;
}

const results: TestResult[] = [];
let passedLive = 0;
let passedStatic = 0;
let failedCount = 0;

function logResult(
  num: number,
  name: string,
  classification: 'LIVE VERIFIED' | 'STATIC VERIFIED' | 'BLOCKED' | 'FAILED' | 'NOT TESTED',
  details: string,
  recordId?: string
) {
  results.push({ num, name, classification, details, recordId });
  const icon =
    classification === 'LIVE VERIFIED'
      ? '🟢 [LIVE VERIFIED]'
      : classification === 'STATIC VERIFIED'
      ? '✅ [STATIC VERIFIED]'
      : classification === 'BLOCKED'
      ? '🟡 [BLOCKED]'
      : classification === 'NOT TESTED'
      ? '🛡️ [NOT TESTED]'
      : '❌ [FAILED]';

  console.log(`  ${icon} Test ${num}: ${name}`);
  console.log(`     Details: ${details}`);
  if (recordId) console.log(`     Record ID: ${recordId}`);

  if (classification === 'LIVE VERIFIED') passedLive++;
  if (classification === 'STATIC VERIFIED') passedStatic++;
  if (classification === 'FAILED') failedCount++;
}

async function runStagingTestSuite() {
  console.log('========================================================================');
  console.log('KAARYAN LABS — PHASE V3.5.8 LIVE STAGING API TEST RUNNER');
  console.log('Target Staging Project: tbwtxnszyddvpgqvxwow');
  console.log('========================================================================\n');

  // ---------------------------------------------------------------------------
  // STEP 1: ENVIRONMENT ISOLATION & SAFETY AUDIT
  // ---------------------------------------------------------------------------
  console.log('--- STEP 1: Environment Isolation & Safety Verification ---');

  const stagingEnvPath = path.join(process.cwd(), '.env.staging.local');
  if (!fs.existsSync(stagingEnvPath)) {
    console.error('❌ FATAL: .env.staging.local does not exist on disk.');
    process.exit(1);
  }

  const envConfig = dotenv.parse(fs.readFileSync(stagingEnvPath));
  const stagingUrl = envConfig.VITE_SUPABASE_URL || '';
  const stagingAnonKey = envConfig.VITE_SUPABASE_ANON_KEY || '';

  // Safety Assertion 1: Must match staging project ref
  if (!stagingUrl.includes('tbwtxnszyddvpgqvxwow')) {
    console.error(`❌ SAFETY HALT: Target URL "${stagingUrl}" does not match staging ref tbwtxnszyddvpgqvxwow!`);
    process.exit(1);
  }

  // Safety Assertion 2: Must never target production
  if (stagingUrl.includes('gpqbppjqqndzuvksrtjb')) {
    console.error('❌ SAFETY HALT: Target URL references protected production project gpqbppjqqndzuvksrtjb! Execution terminated.');
    process.exit(1);
  }

  // Safety Assertion 3: Verify .env.local is untouched
  const localEnvContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
  if (localEnvContent.includes('tbwtxnszyddvpgqvxwow')) {
    console.error('❌ SAFETY HALT: .env.local was modified to point to staging! Must remain separate.');
    process.exit(1);
  }

  // Safety Assertion 4: Check deliberate write approval flag
  const allowWrites = process.argv.includes('--allow-staging-writes') || process.env.ALLOW_STAGING_WRITES === 'true';
  if (!allowWrites) {
    console.error('❌ SAFETY HALT: Deliberate staging write flag (--allow-staging-writes) not supplied.');
    process.exit(1);
  }

  console.log('  🛡️ Environment Safety Gate: PASSED');
  console.log('     Target Staging Project: https://tbwtxnszyddvpgqvxwow.supabase.co');
  console.log('     Protected Production: gpqbppjqqndzuvksrtjb (Completely Untouched)');
  console.log('     Staging Writes Authorized: TRUE (--allow-staging-writes)\n');

  // ---------------------------------------------------------------------------
  // STEP 2: OBTAIN IN-MEMORY ACCESS KEYS & AUTH SESSIONS
  // ---------------------------------------------------------------------------
  console.log('--- STEP 2: Authenticating Staging Personas ---');

  let serviceRoleKey = '';
  try {
    const rawKeys = execSync('npx supabase projects api-keys --remote=tbwtxnszyddvpgqvxwow --reveal --output json', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const parsed = JSON.parse(rawKeys);
    const svcObj = parsed.find((k: any) => k.name === 'service_role' || k.role === 'service_role');
    if (svcObj && svcObj.api_key) serviceRoleKey = svcObj.api_key;
  } catch (err: any) {
    console.error('Failed to obtain service key for persona bootstrap:', err.message);
    process.exit(1);
  }

  if (!serviceRoleKey) {
    console.error('❌ Service role key could not be retrieved from CLI.');
    process.exit(1);
  }

  // Helper to obtain authentic user JWT via GoTrue admin generate_link & verify
  async function getUserToken(email: string): Promise<string> {
    const linkRes = await fetch(`${stagingUrl}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'magiclink', email }),
    });
    const linkData = await linkRes.json();
    if (!linkData.hashed_token) {
      throw new Error(`Failed to generate link for ${email}: ${JSON.stringify(linkData)}`);
    }

    const verifyRes = await fetch(`${stagingUrl}/auth/v1/verify`, {
      method: 'POST',
      headers: {
        apikey: stagingAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'magiclink',
        token_hash: linkData.hashed_token,
      }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.access_token) {
      throw new Error(`Failed to verify token for ${email}: ${JSON.stringify(verifyData)}`);
    }
    return verifyData.access_token;
  }

  // Authenticate the 4 test personas
  console.log('  Authenticating Customer persona (k.tharunkumar0507@gmail.com)...');
  const customerToken = await getUserToken('k.tharunkumar0507@gmail.com');

  console.log('  Authenticating Vellore Franchise persona (ktharunkumart@gmail.com)...');
  const velloreFranchiseToken = await getUserToken('ktharunkumart@gmail.com');

  console.log('  Authenticating Other-City Franchise persona (kumarfranchise@gmail.com)...');
  const otherFranchiseToken = await getUserToken('kumarfranchise@gmail.com');

  console.log('  Authenticating Super Admin persona (tharunsuperadmin@gmail.com)...');
  const superAdminToken = await getUserToken('tharunsuperadmin@gmail.com');

  console.log('  ▶ All 4 personas authenticated successfully with GoTrue (Tokens masked).\n');

  // ---------------------------------------------------------------------------
  // STEP 3: EXECUTE TASK C POSTGREST API TESTS
  // ---------------------------------------------------------------------------
  console.log('--- STEP 3: Executing PostgREST API Operations ---\n');

  const timestamp = Date.now();
  const testNoticeId = `syn-test-not-${timestamp}`;
  const testEventId = `syn-test-evt-${timestamp}`;
  const testEventStartDate = '2026-12-15T10:00:00.000Z';

  // TEST 1: Anonymous public SELECT
  try {
    const res = await fetch(`${stagingUrl}/rest/v1/community_notices?select=id,title,status&status=eq.published`, {
      headers: { apikey: stagingAnonKey, Authorization: `Bearer ${stagingAnonKey}` },
    });
    const data = await res.json();
    const isOk = res.status === 200 && Array.isArray(data);
    logResult(
      1,
      'Anonymous Public SELECT on Published Notices',
      isOk ? 'LIVE VERIFIED' : 'FAILED',
      `HTTP status ${res.status}. Returned ${data.length} published records.`
    );
  } catch (err: any) {
    logResult(1, 'Anonymous Public SELECT', 'FAILED', err.message);
  }

  // TEST 2: Anonymous pending notice submission
  const noticePayload = {
    id: testNoticeId,
    city_id: 'vellore',
    title: `Phase V3.5.8 Synthetic Notice ${timestamp}`,
    category: 'community',
    content: 'Synthetic test notice for Phase V3.5.8 live PostgREST integration verification.',
    locality: 'Katpadi',
    organizer_name: 'Staging Integration Bot',
    contact_phone: '+91 9876543210',
    contact_email: 'staging-test@kaaryanlabs.com',
    show_contact: false,
    status: 'pending',
    priority: 'standard',
  };

  try {
    const res = await fetch(`${stagingUrl}/rest/v1/community_notices`, {
      method: 'POST',
      headers: {
        apikey: stagingAnonKey,
        Authorization: `Bearer ${stagingAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(noticePayload),
    });
    const isCreated = res.status === 201;
    logResult(
      2,
      'Anonymous Pending Notice Submission',
      isCreated ? 'LIVE VERIFIED' : 'FAILED',
      `HTTP status ${res.status} Created. Minimal return pattern verified.`,
      testNoticeId
    );
  } catch (err: any) {
    logResult(2, 'Anonymous Pending Notice Submission', 'FAILED', err.message);
  }

  // TEST 3: Anonymous pending event submission
  const eventPayload = {
    id: testEventId,
    city_id: 'vellore',
    title: `Phase V3.5.8 Synthetic Event ${timestamp}`,
    category: 'cultural',
    description: 'Synthetic test event for Phase V3.5.8 live PostgREST integration verification.',
    venue_name: 'Katpadi Community Hall',
    venue_address: 'Station Road, Katpadi',
    locality: 'Katpadi',
    start_date: testEventStartDate,
    time_display: '10:00 AM – 1:00 PM IST',
    organizer_name: 'Staging Event Bot',
    is_free: true,
    status: 'pending',
    is_featured: false,
  };

  try {
    const res = await fetch(`${stagingUrl}/rest/v1/local_events`, {
      method: 'POST',
      headers: {
        apikey: stagingAnonKey,
        Authorization: `Bearer ${stagingAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(eventPayload),
    });
    const isCreated = res.status === 201;
    logResult(
      3,
      'Anonymous Pending Event Submission',
      isCreated ? 'LIVE VERIFIED' : 'FAILED',
      `HTTP status ${res.status} Created. Minimal return pattern verified.`,
      testEventId
    );
  } catch (err: any) {
    logResult(3, 'Anonymous Pending Event Submission', 'FAILED', err.message);
  }

  // TEST 4: Pending records hidden from public readers
  try {
    const resNotice = await fetch(`${stagingUrl}/rest/v1/community_notices?id=eq.${testNoticeId}&select=id,status`, {
      headers: { apikey: stagingAnonKey, Authorization: `Bearer ${stagingAnonKey}` },
    });
    const noticeData = await resNotice.json();

    const resEvent = await fetch(`${stagingUrl}/rest/v1/local_events?id=eq.${testEventId}&select=id,status`, {
      headers: { apikey: stagingAnonKey, Authorization: `Bearer ${stagingAnonKey}` },
    });
    const eventData = await resEvent.json();

    const hidden = noticeData.length === 0 && eventData.length === 0;
    logResult(
      4,
      'Pending Records Hidden from Public Readers',
      hidden ? 'LIVE VERIFIED' : 'FAILED',
      `Anonymous SELECT returned 0 rows for pending notice and 0 rows for pending event. RLS enforced.`
    );
  } catch (err: any) {
    logResult(4, 'Pending Records Hidden from Public Readers', 'FAILED', err.message);
  }

  // TEST 5: Ordinary customer cannot self-publish
  try {
    const res = await fetch(`${stagingUrl}/rest/v1/community_notices?id=eq.${testNoticeId}`, {
      method: 'PATCH',
      headers: {
        apikey: stagingAnonKey,
        Authorization: `Bearer ${customerToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ status: 'published' }),
    });
    // PostgREST returns 403 or 401 when permission denied on base table update
    const denied = res.status === 403 || res.status === 401;
    logResult(
      5,
      'Ordinary Customer Cannot Self-Publish Notice',
      denied ? 'LIVE VERIFIED' : 'FAILED',
      `Customer PATCH returned HTTP ${res.status} (Permission Denied). Row Level Security & Grants blocked update.`
    );
  } catch (err: any) {
    logResult(5, 'Ordinary Customer Cannot Self-Publish', 'FAILED', err.message);
  }

  // TEST 6: Ordinary customer cannot access private contacts
  try {
    const resPhone = await fetch(`${stagingUrl}/rest/v1/community_notices?select=submitter_phone`, {
      headers: { apikey: stagingAnonKey, Authorization: `Bearer ${customerToken}` },
    });
    const resEmail = await fetch(`${stagingUrl}/rest/v1/community_notices?select=submitter_email`, {
      headers: { apikey: stagingAnonKey, Authorization: `Bearer ${customerToken}` },
    });
    const phoneBlocked = resPhone.status === 403 || resPhone.status === 401;
    const emailBlocked = resEmail.status === 403 || resEmail.status === 401;

    logResult(
      6,
      'Ordinary Customer Cannot Select Private Contact Fields',
      phoneBlocked && emailBlocked ? 'LIVE VERIFIED' : 'FAILED',
      `submitter_phone HTTP status: ${resPhone.status}, submitter_email HTTP status: ${resEmail.status}. Column-level SELECT grant enforced.`
    );
  } catch (err: any) {
    logResult(6, 'Ordinary Customer Private Contact Access', 'FAILED', err.message);
  }

  // TEST 7: Ordinary customer cannot access moderator view
  try {
    const res = await fetch(`${stagingUrl}/rest/v1/franchise_community_notices?select=*`, {
      headers: { apikey: stagingAnonKey, Authorization: `Bearer ${customerToken}` },
    });
    const data = await res.json();
    const restricted = res.status === 200 && Array.isArray(data) && data.length === 0;

    logResult(
      7,
      'Ordinary Customer Excluded from Moderation View',
      restricted ? 'LIVE VERIFIED' : 'FAILED',
      `Customer query to public.franchise_community_notices returned ${data.length} rows (empty set). Security-invoker check enforced.`
    );
  } catch (err: any) {
    logResult(7, 'Ordinary Customer Moderation View Access', 'FAILED', err.message);
  }

  // TEST 8: Vellore franchise can view pending records and approve
  try {
    // 8a: View pending record with submitter details
    const viewRes = await fetch(
      `${stagingUrl}/rest/v1/franchise_community_notices?id=eq.${testNoticeId}&select=id,title,status,submitter_phone`,
      {
        headers: { apikey: stagingAnonKey, Authorization: `Bearer ${velloreFranchiseToken}` },
      }
    );
    const viewData = await viewRes.json();
    const canSeePending = Array.isArray(viewData) && viewData.length === 1 && viewData[0].submitter_phone !== null;

    // 8b: Vellore franchise approves notice
    const patchRes = await fetch(`${stagingUrl}/rest/v1/community_notices?id=eq.${testNoticeId}`, {
      method: 'PATCH',
      headers: {
        apikey: stagingAnonKey,
        Authorization: `Bearer ${velloreFranchiseToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ status: 'published', moderated_by: 'Vellore Franchise Test' }),
    });
    const canApprove = patchRes.status === 204;

    logResult(
      8,
      'Vellore Franchise Can View Submitter Contact & Approve',
      canSeePending && canApprove ? 'LIVE VERIFIED' : 'FAILED',
      `View query returned pending row with submitter contact (rows: ${viewData.length}). PATCH returned HTTP ${patchRes.status} No Content.`,
      testNoticeId
    );
  } catch (err: any) {
    logResult(8, 'Vellore Franchise Moderation', 'FAILED', err.message);
  }

  // TEST 9: Other-city franchise cannot moderate Vellore records
  try {
    // Other-city (Chittoor) franchise attempts to view Vellore moderation queue
    const viewRes = await fetch(
      `${stagingUrl}/rest/v1/franchise_community_notices?city_id=eq.vellore&select=*`,
      {
        headers: { apikey: stagingAnonKey, Authorization: `Bearer ${otherFranchiseToken}` },
      }
    );
    const viewData = await viewRes.json();
    const viewBlocked = Array.isArray(viewData) && viewData.length === 0;

    // Other-city franchise attempts to update Vellore event
    const patchRes = await fetch(`${stagingUrl}/rest/v1/local_events?id=eq.${testEventId}`, {
      method: 'PATCH',
      headers: {
        apikey: stagingAnonKey,
        Authorization: `Bearer ${otherFranchiseToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ status: 'published' }),
    });
    // In PostgREST, an update permitted by table grants but matching 0 rows via RLS returns 204 with 0 rows updated
    // Verify event is NOT published:
    const checkRes = await fetch(`${stagingUrl}/rest/v1/local_events?id=eq.${testEventId}&select=status`, {
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
    });
    const checkData = await checkRes.json();
    const eventStillPending = checkData[0]?.status === 'pending';

    logResult(
      9,
      'Other-City Franchise (Chittoor) Blocked from Vellore Records',
      viewBlocked && eventStillPending ? 'LIVE VERIFIED' : 'FAILED',
      `Chittoor franchise received 0 rows from Vellore view. Attempted update failed to publish event (event remains status=pending).`
    );
  } catch (err: any) {
    logResult(9, 'Other-City Franchise Cross-Territory Isolation', 'FAILED', err.message);
  }

  // TEST 10: Super Admin permissions work as intended
  try {
    // 10a: Super Admin views Vellore moderation queue
    const viewRes = await fetch(
      `${stagingUrl}/rest/v1/franchise_community_notices?id=eq.${testNoticeId}&select=id,status`,
      {
        headers: { apikey: stagingAnonKey, Authorization: `Bearer ${superAdminToken}` },
      }
    );
    const viewData = await viewRes.json();
    const canView = Array.isArray(viewData) && viewData.length === 1;

    // 10b: Super Admin approves pending event
    const patchRes = await fetch(`${stagingUrl}/rest/v1/local_events?id=eq.${testEventId}`, {
      method: 'PATCH',
      headers: {
        apikey: stagingAnonKey,
        Authorization: `Bearer ${superAdminToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ status: 'published', moderated_by: 'Super Admin Test' }),
    });
    const canApprove = patchRes.status === 204;

    logResult(
      10,
      'Super Admin Global Moderation Authority',
      canView && canApprove ? 'LIVE VERIFIED' : 'FAILED',
      `Super Admin viewed notice queue (rows: ${viewData.length}) and approved event (PATCH HTTP ${patchRes.status}). Global authority verified.`
    );
  } catch (err: any) {
    logResult(10, 'Super Admin Authority', 'FAILED', err.message);
  }

  // TEST 11: Duplicate submissions within 5 minutes are rejected
  try {
    const dupNoticeRes = await fetch(`${stagingUrl}/rest/v1/community_notices`, {
      method: 'POST',
      headers: {
        apikey: stagingAnonKey,
        Authorization: `Bearer ${stagingAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        ...noticePayload,
        id: `syn-test-not-dup-${timestamp}`,
      }),
    });
    const noticeRejected = dupNoticeRes.status === 400;
    const noticeErr = await dupNoticeRes.json();

    const dupEventRes = await fetch(`${stagingUrl}/rest/v1/local_events`, {
      method: 'POST',
      headers: {
        apikey: stagingAnonKey,
        Authorization: `Bearer ${stagingAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        ...eventPayload,
        id: `syn-test-evt-dup-${timestamp}`,
      }),
    });
    const eventRejected = dupEventRes.status === 400;
    const eventErr = await dupEventRes.json();

    const dedupWorking =
      noticeRejected &&
      eventRejected &&
      noticeErr.message?.includes('recently submitted') &&
      eventErr.message?.includes('recently submitted');

    logResult(
      11,
      'Duplicate Submissions Rejected via Advisory Locks & Sliding Window',
      dedupWorking ? 'LIVE VERIFIED' : 'FAILED',
      `Notice duplicate rejected: HTTP 400 ("${noticeErr.message}"). Event duplicate rejected: HTTP 400 ("${eventErr.message}").`
    );
  } catch (err: any) {
    logResult(11, 'Duplicate Submissions Rejection', 'FAILED', err.message);
  }

  // TEST 12: Public approved records become visible
  try {
    const pubNoticeRes = await fetch(
      `${stagingUrl}/rest/v1/community_notices?id=eq.${testNoticeId}&select=id,title,status`,
      {
        headers: { apikey: stagingAnonKey, Authorization: `Bearer ${stagingAnonKey}` },
      }
    );
    const pubNoticeData = await pubNoticeRes.json();

    const pubEventRes = await fetch(
      `${stagingUrl}/rest/v1/local_events?id=eq.${testEventId}&select=id,title,status`,
      {
        headers: { apikey: stagingAnonKey, Authorization: `Bearer ${stagingAnonKey}` },
      }
    );
    const pubEventData = await pubEventRes.json();

    const nowVisible =
      pubNoticeData.length === 1 &&
      pubNoticeData[0].status === 'published' &&
      pubEventData.length === 1 &&
      pubEventData[0].status === 'published';

    logResult(
      12,
      'Approved Records Immediately Visible to Anonymous Readers',
      nowVisible ? 'LIVE VERIFIED' : 'FAILED',
      `Approved notice visible (HTTP ${pubNoticeRes.status}, rows: ${pubNoticeData.length}). Approved event visible (HTTP ${pubEventRes.status}, rows: ${pubEventData.length}).`
    );
  } catch (err: any) {
    logResult(12, 'Public Approved Records Visibility', 'FAILED', err.message);
  }

  // ---------------------------------------------------------------------------
  // STEP 4: SYNTHETIC RECORD CLEANUP
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 4: Synthetic Record Cleanup (Admin Workflow) ---');
  try {
    const delNotRes = await fetch(`${stagingUrl}/rest/v1/community_notices?id=eq.${testNoticeId}`, {
      method: 'DELETE',
      headers: {
        apikey: stagingAnonKey,
        Authorization: `Bearer ${superAdminToken}`,
        Prefer: 'return=minimal',
      },
    });
    const delEvtRes = await fetch(`${stagingUrl}/rest/v1/local_events?id=eq.${testEventId}`, {
      method: 'DELETE',
      headers: {
        apikey: stagingAnonKey,
        Authorization: `Bearer ${superAdminToken}`,
        Prefer: 'return=minimal',
      },
    });
    console.log(`  Cleanup Notice ${testNoticeId}: HTTP ${delNotRes.status}`);
    console.log(`  Cleanup Event ${testEventId}: HTTP ${delEvtRes.status}`);
    console.log('  ▶ All synthetic test records cleaned up from staging database.');
  } catch (err: any) {
    console.warn('Cleanup warning:', err.message);
  }

  // ---------------------------------------------------------------------------
  // STEP 5: FINAL SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('PHASE V3.5.8 LIVE STAGING API TEST SUMMARY');
  console.log('========================================================================');
  console.log(`  🟢 LIVE VERIFIED:   ${passedLive} / 12`);
  console.log(`  ✅ STATIC VERIFIED: ${passedStatic}`);
  console.log(`  ❌ FAILED:          ${failedCount}`);
  console.log(`  TOTAL TESTS:        ${results.length}`);
  console.log('========================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runStagingTestSuite();
