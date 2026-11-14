/**
 * KAARYAN LABS — PHASE V3.7.2B
 * VELLORE COMMUNITY NOTICEBOARD PRODUCTION API QUERY & PRIVACY VERIFICATION SUITE
 *
 * Scope: Vellore Ads (TN-23) exclusively
 * Governance: STRICTLY READ-ONLY (Zero writes, zero mutations)
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import {
  communityService,
  PUBLIC_COMMUNITY_NOTICE_COLUMNS,
} from '../src/services/communityService';
import { CITIES } from '../src/config/cities';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    if (detail) console.error(`     Detail: ${detail}`);
    failed++;
  }
}

async function runCommunityApiTestSuite() {
  console.log('========================================================================');
  console.log('KAARYAN LABS — PHASE V3.7.2B COMMUNITY NOTICEBOARD API & PRIVACY SUITE');
  console.log('Target: Vellore Ads (TN-23) | Mode: READ-ONLY');
  console.log('========================================================================\n');

  // Load environments safely
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envStagingPath = path.join(process.cwd(), '.env.staging.local');

  const envLocal = fs.existsSync(envLocalPath) ? dotenv.parse(fs.readFileSync(envLocalPath)) : {};
  const envStaging = fs.existsSync(envStagingPath) ? dotenv.parse(fs.readFileSync(envStagingPath)) : {};

  const prodUrl = envLocal.VITE_SUPABASE_URL || '';
  const prodAnonKey = envLocal.VITE_SUPABASE_ANON_KEY || '';
  const stagingUrl = envStaging.VITE_SUPABASE_URL || '';
  const stagingAnonKey = envStaging.VITE_SUPABASE_ANON_KEY || '';

  // ---------------------------------------------------------------------------
  // SECTION 1: STATIC SOURCE CODE & PROJECTION ASSERTIONS
  // ---------------------------------------------------------------------------
  console.log('--- SECTION 1: Static Code & Column Projection Assertions ---');

  // Assertion 1: Public column constant exists and is non-empty
  assert(
    typeof PUBLIC_COMMUNITY_NOTICE_COLUMNS === 'string' && PUBLIC_COMMUNITY_NOTICE_COLUMNS.length > 50,
    'Assertion 1: PUBLIC_COMMUNITY_NOTICE_COLUMNS constant defined and exported'
  );

  const projectedCols = PUBLIC_COMMUNITY_NOTICE_COLUMNS.split(',').map((c) => c.trim());

  // Assertion 2: All required public display columns are present
  const requiredPublicCols = [
    'id',
    'city_id',
    'title',
    'category',
    'content',
    'locality',
    'organizer_name',
    'contact_phone',
    'contact_email',
    'show_contact',
    'status',
    'priority',
    'publish_date',
    'expiry_date',
    'created_at',
    'updated_at',
  ];
  const allRequiredPresent = requiredPublicCols.every((col) => projectedCols.includes(col));
  assert(
    allRequiredPresent,
    'Assertion 2: All 16 required public display columns included in projection'
  );

  // Assertion 3: Private submitter PII columns strictly excluded
  const privatePiiCols = ['submitter_phone', 'submitter_email'];
  const piiExcluded = privatePiiCols.every((col) => !projectedCols.includes(col));
  assert(
    piiExcluded,
    'Assertion 3: Private submitter PII (submitter_phone, submitter_email) strictly excluded'
  );

  // Assertion 4: Internal moderation columns strictly excluded from public projection
  const internalModerationCols = ['moderated_by', 'moderated_at', 'rejection_reason'];
  const moderationExcluded = internalModerationCols.every((col) => !projectedCols.includes(col));
  assert(
    moderationExcluded,
    'Assertion 4: Internal moderation columns strictly excluded from public projection'
  );

  // Assertion 5: Verify communityService.ts does NOT perform select('*') on community_notices for public queries
  const serviceCode = fs.readFileSync(path.join(process.cwd(), 'src', 'services', 'communityService.ts'), 'utf8');
  const publicQuerySnippet = serviceCode.slice(serviceCode.indexOf('getNotices('), serviceCode.indexOf('getNoticeById('));
  assert(
    !publicQuerySnippet.includes(".select('*')") && !publicQuerySnippet.includes('.select("*")'),
    'Assertion 5: public getNotices() does not use wildcard select("*")'
  );
  assert(
    publicQuerySnippet.includes('PUBLIC_COMMUNITY_NOTICE_COLUMNS'),
    'Assertion 5b: public getNotices() explicitly uses PUBLIC_COMMUNITY_NOTICE_COLUMNS'
  );

  // ---------------------------------------------------------------------------
  // SECTION 2: PRODUCTION READ-ONLY POSTGREST API ASSERTIONS
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 2: Production Read-Only PostgREST API Checks ---');

  if (prodUrl && prodAnonKey) {
    // Assertion 6: Public query with authorized columns returns HTTP 200 OK
    try {
      const publicUrl = `${prodUrl}/rest/v1/community_notices?select=${encodeURIComponent(
        PUBLIC_COMMUNITY_NOTICE_COLUMNS
      )}&city_id=eq.vellore&status=eq.published`;
      const res = await fetch(publicUrl, {
        headers: { apikey: prodAnonKey, Authorization: `Bearer ${prodAnonKey}` },
      });
      const data = await res.json();
      assert(
        res.status === 200 && Array.isArray(data),
        `Assertion 6: Production public notices query returns HTTP 200 OK (returned ${Array.isArray(data) ? data.length : 0} rows)`
      );
    } catch (err: any) {
      assert(false, 'Assertion 6: Production public notices query failed', err.message);
    }

    // Assertion 7: Query requesting restricted submitter_phone returns HTTP 401/403
    try {
      const restrictedUrl = `${prodUrl}/rest/v1/community_notices?select=id,title,submitter_phone`;
      const res = await fetch(restrictedUrl, {
        headers: { apikey: prodAnonKey, Authorization: `Bearer ${prodAnonKey}` },
      });
      const data = await res.json();
      const isDenied = res.status === 401 || res.status === 403;
      assert(
        isDenied && (data.code === '42501' || String(data.message).includes('permission denied')),
        `Assertion 7: Anonymous query for submitter_phone is denied with HTTP ${res.status} (code 42501)`
      );
    } catch (err: any) {
      assert(false, 'Assertion 7: Check failed', err.message);
    }

    // Assertion 8: Query requesting restricted submitter_email returns HTTP 401/403
    try {
      const restrictedUrl = `${prodUrl}/rest/v1/community_notices?select=id,title,submitter_email`;
      const res = await fetch(restrictedUrl, {
        headers: { apikey: prodAnonKey, Authorization: `Bearer ${prodAnonKey}` },
      });
      const data = await res.json();
      const isDenied = res.status === 401 || res.status === 403;
      assert(
        isDenied && (data.code === '42501' || String(data.message).includes('permission denied')),
        `Assertion 8: Anonymous query for submitter_email is denied with HTTP ${res.status} (code 42501)`
      );
    } catch (err: any) {
      assert(false, 'Assertion 8: Check failed', err.message);
    }

    // Assertion 9: Anonymous attempt to query pending notices returns 0 rows (RLS guard)
    try {
      const pendingUrl = `${prodUrl}/rest/v1/community_notices?select=${encodeURIComponent(
        PUBLIC_COMMUNITY_NOTICE_COLUMNS
      )}&city_id=eq.vellore&status=eq.pending`;
      const res = await fetch(pendingUrl, {
        headers: { apikey: prodAnonKey, Authorization: `Bearer ${prodAnonKey}` },
      });
      const data = await res.json();
      assert(
        res.status === 200 && Array.isArray(data) && data.length === 0,
        'Assertion 9: Anonymous query for pending notices returns 0 rows via RLS guard'
      );
    } catch (err: any) {
      assert(false, 'Assertion 9: Check failed', err.message);
    }

    // Assertion 10: Anonymous attempt to access franchise moderation view is denied
    try {
      const modViewUrl = `${prodUrl}/rest/v1/franchise_community_notices?select=*`;
      const res = await fetch(modViewUrl, {
        headers: { apikey: prodAnonKey, Authorization: `Bearer ${prodAnonKey}` },
      });
      const isDenied = res.status === 401 || res.status === 403;
      assert(
        isDenied,
        `Assertion 10: Anonymous access to franchise_community_notices view is denied (HTTP ${res.status})`
      );
    } catch (err: any) {
      assert(false, 'Assertion 10: Check failed', err.message);
    }
  } else {
    console.log('  ⚠️ Skipping production network checks (credentials not provided in environment)');
  }

  // ---------------------------------------------------------------------------
  // SECTION 3: STAGING POSTGREST API PARITY ASSERTIONS
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 3: Staging Read-Only PostgREST API Checks ---');

  if (stagingUrl && stagingAnonKey) {
    try {
      const publicUrl = `${stagingUrl}/rest/v1/community_notices?select=${encodeURIComponent(
        PUBLIC_COMMUNITY_NOTICE_COLUMNS
      )}&city_id=eq.vellore&status=eq.published`;
      const res = await fetch(publicUrl, {
        headers: { apikey: stagingAnonKey, Authorization: `Bearer ${stagingAnonKey}` },
      });
      const data = await res.json();
      assert(
        res.status === 200 && Array.isArray(data),
        `Assertion 11: Staging public notices query returns HTTP 200 OK (${Array.isArray(data) ? data.length : 0} rows)`
      );
    } catch (err: any) {
      assert(false, 'Assertion 11: Staging check failed', err.message);
    }
  }

  // ---------------------------------------------------------------------------
  // SECTION 4: ERROR HANDLING & EMPTY DATASET BEHAVIOR
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 4: Service Layer Empty Dataset & Error Handling ---');

  // Assertion 12: communityService.getNotices returns Array without throwing
  try {
    const notices = await communityService.getNotices('vellore');
    assert(
      Array.isArray(notices),
      `Assertion 12: communityService.getNotices('vellore') returns Array (length: ${notices.length})`
    );
    // Assertion 13: Returned notices are strictly published (no pending notices in public feed)
    const hasUnpublished = notices.some((n) => n.status !== 'published');
    assert(
      !hasUnpublished,
      'Assertion 13: Zero unpublished notices returned in public feed'
    );
  } catch (err: any) {
    assert(false, 'Assertion 12/13: getNotices failed', err.message);
  }

  // ---------------------------------------------------------------------------
  // SECTION 5: TERRITORIAL ISOLATION (CHITTOOR & BENGALURU)
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 5: Cross-City Territorial Isolation ---');

  const chittoorNotices = await communityService.getNotices('chittoor');
  assert(
    chittoorNotices.length === 0,
    'Assertion 14: Chittoor public notices query returns 0 items (strictly isolated)'
  );

  const bengaluruNotices = await communityService.getNotices('bengaluru');
  assert(
    bengaluruNotices.length === 0,
    'Assertion 15: Bengaluru public notices query returns 0 items (strictly isolated)'
  );

  assert(
    CITIES.chittoor.features.hasCommunityNoticeboard === false,
    'Assertion 16: Chittoor hasCommunityNoticeboard feature flag is FALSE'
  );

  assert(
    CITIES.bengaluru.features.hasCommunityNoticeboard === false,
    'Assertion 17: Bengaluru hasCommunityNoticeboard feature flag is FALSE'
  );

  console.log('\n========================================================================');
  console.log(`TOTAL PHASE V3.7.2B CHECKS: ${passed + failed}`);
  console.log(`PASSED: ${passed} | FAILED: ${failed}`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runCommunityApiTestSuite();
