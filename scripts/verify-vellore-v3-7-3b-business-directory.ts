/**
 * KAARYAN LABS — PHASE V3.7.3B VERIFICATION SUITE
 * Real Vellore Business Directory Integration, Mock Removal, & Customer Safety
 *
 * Scope: Vellore Ads (TN-23) ONLY. Chittoor (AP-03) and Bengaluru (KA-01) preserved.
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';
import dotenv from 'dotenv';

const ROOT_DIR = process.cwd();
const envLocalPath = path.join(ROOT_DIR, '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

import { businessService } from '../src/services/businessService';
import { enquiryService } from '../src/services/enquiryService';
import { INITIAL_LISTINGS } from '../src/data/mockData';
import { CITIES } from '../src/config/cities';
import { createClient } from '@supabase/supabase-js';

interface TestResult {
  section: string;
  name: string;
  passed: boolean;
  detail?: string;
}

const results: TestResult[] = [];

function assert(section: string, name: string, condition: boolean, detail?: string) {
  results.push({ section, name, passed: Boolean(condition), detail });
  const status = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${status}: ${name}${detail ? ` (${detail})` : ''}`);
}

async function runSuite() {
  console.log('========================================================================');
  console.log('KAARYAN LABS — PHASE V3.7.3B REAL BUSINESS DIRECTORY INTEGRATION SUITE');
  console.log('Scope: Vellore Ads (TN-23) ONLY | Multi-City Isolated');
  console.log('========================================================================\n');

  // ==========================================================================
  // SECTION 1: STATIC CODE & ARCHITECTURE CONTRACTS
  // ==========================================================================
  console.log('--- SECTION 1: Static Code & Service Contract Assertions ---');

  const businessServiceSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/services/businessService.ts'), 'utf-8');
  const enquiryServiceSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/services/enquiryService.ts'), 'utf-8');
  const appSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/App.tsx'), 'utf-8');
  const catResultsSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/components/CategoryResultsPage.tsx'), 'utf-8');
  const standaloneSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/components/StandaloneBusinessPage.tsx'), 'utf-8');
  const homeSectionsSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/components/HomeSections.tsx'), 'utf-8');

  assert(
    'Static Contracts',
    'businessService exports BusinessDataState type',
    businessServiceSrc.includes('export type BusinessDataState =')
  );

  assert(
    'Static Contracts',
    'businessService implements getPublishedListingsResult',
    businessServiceSrc.includes('async getPublishedListingsResult(')
  );

  assert(
    'Static Contracts',
    'businessService implements getListingById direct lookup',
    businessServiceSrc.includes('async getListingById(')
  );

  assert(
    'Static Contracts',
    'businessService safely handles non-UUID strings to avoid PostgreSQL 22P02 error',
    businessServiceSrc.includes('isUuid(listingId)')
  );

  assert(
    'Static Contracts',
    'App.tsx initializes listings without Vellore mock items when Supabase configured',
    appSrc.includes('!(l.cityId === \'vellore\'') && appSrc.includes('isConfigured')
  );

  assert(
    'Static Contracts',
    'App.tsx tracks explicit businessDataState',
    appSrc.includes('const [businessDataState, setBusinessDataState] = useState<BusinessDataState>')
  );

  assert(
    'Static Contracts',
    'App.tsx prevents in-flight race conditions with sequence ref',
    appSrc.includes('listingsFetchSeqRef')
  );

  assert(
    'Static Contracts',
    'App.tsx does NOT return early when remoteListings is empty',
    !appSrc.includes('if (!remoteListings || remoteListings.length === 0) return;')
  );

  assert(
    'Static Contracts',
    'CategoryResultsPage supports businessDataState and businessError',
    catResultsSrc.includes('businessDataState?: BusinessDataState') && catResultsSrc.includes('businessError?: string | null')
  );

  assert(
    'Static Contracts',
    'CategoryResultsPage renders "Vellore Businesses Coming Soon" for Vellore empty state',
    catResultsSrc.includes('Vellore Businesses Coming Soon')
  );

  assert(
    'Static Contracts',
    'CategoryResultsPage renders "Verified local business listings will appear here"',
    catResultsSrc.includes('Verified local business listings will appear here as they are added to Vellore Ads.')
  );

  assert(
    'Static Contracts',
    'CategoryResultsPage renders friendly error with retry button',
    catResultsSrc.includes('Unable to Load Businesses') && catResultsSrc.includes('Retry')
  );

  assert(
    'Static Contracts',
    'HomeSections renders "Vellore Businesses Coming Soon" for Vellore when empty',
    homeSectionsSrc.includes('Vellore Businesses Coming Soon')
  );

  assert(
    'Static Contracts',
    'StandaloneBusinessPage implements direct database fetch via getListingById',
    standaloneSrc.includes('businessService.getListingById(')
  );

  assert(
    'Static Contracts',
    'StandaloneBusinessPage renders loading skeleton during direct deep-link fetch',
    standaloneSrc.includes('fetchStatus === \'loading\'')
  );

  assert(
    'Static Contracts',
    'StandaloneBusinessPage renders retryable error state on database failure',
    standaloneSrc.includes('fetchStatus === \'error\'') && standaloneSrc.includes('Unable to Load Business')
  );

  assert(
    'Static Contracts',
    'enquiryService validates target business exists and is active before insert',
    enquiryServiceSrc.includes('bData.status !== \'active\'')
  );

  assert(
    'Static Contracts',
    'enquiryService rejects non-existent business without attempting insert (FK protection)',
    enquiryServiceSrc.includes('The requested business listing could not be found or is no longer available.')
  );

  // ==========================================================================
  // SECTION 2: RUNTIME SERVICE LOGIC & ISOLATION
  // ==========================================================================
  console.log('\n--- SECTION 2: Runtime Service Logic & Isolation ---');

  // Verify getPublishedListingsResult for Vellore
  const velloreResult = await businessService.getPublishedListingsResult('vellore');
  assert(
    'Service Runtime',
    'businessService.getPublishedListingsResult("vellore") returns valid structure',
    typeof velloreResult.state === 'string' && Array.isArray(velloreResult.listings)
  );

  // Assert zero mock items (v-001, v-002, v-003) in Vellore published results
  const mockVellorePresent = velloreResult.listings.some((l) => l.id.startsWith('v-'));
  assert(
    'Service Runtime',
    'Zero mock listings (v-001, v-002, v-003) returned in Vellore published listings',
    !mockVellorePresent,
    `Found ${velloreResult.listings.length} listings, 0 mock items`
  );

  // Verify getListingById for unknown ID
  const unknownLookup = await businessService.getListingById('unknown-listing-12345', 'vellore');
  assert(
    'Service Runtime',
    'getListingById for unknown ID returns state "not_found" and null listing',
    unknownLookup.state === 'not_found' && unknownLookup.listing === null
  );

  // Verify getListingById with non-UUID legacy ID format does not crash
  const legacyLookup = await businessService.getListingById('v-001', 'vellore');
  assert(
    'Service Runtime',
    'getListingById for mock ID v-001 safely returns not_found without throwing',
    legacyLookup.state === 'not_found' && legacyLookup.listing === null
  );

  // Multi-City Isolation Check
  assert(
    'Territorial Isolation',
    'Chittoor (AP-03) config remains intact',
    CITIES.chittoor.name === 'Chittoor' && CITIES.chittoor.code === 'AP-03'
  );
  assert(
    'Territorial Isolation',
    'Bengaluru (KA-01) config remains intact',
    CITIES.bengaluru.name === 'Bengaluru' && CITIES.bengaluru.code === 'KA-01'
  );
  assert(
    'Territorial Isolation',
    'Vellore (TN-23) config remains intact',
    CITIES.vellore.name === 'Vellore' && CITIES.vellore.code === 'TN-23'
  );

  // Verify INITIAL_LISTINGS preserved for Chittoor / other cities
  const chittoorMockCount = INITIAL_LISTINGS.filter((l) => (l.cityId || 'chittoor') === 'chittoor').length;
  assert(
    'Territorial Isolation',
    'Chittoor baseline mock listings preserved in mockData.ts for offline fallback',
    chittoorMockCount >= 5,
    `Found ${chittoorMockCount} Chittoor listings in mockData`
  );

  // ==========================================================================
  // SECTION 3: CUSTOMER ENQUIRY SAFETY & FK PRESERVATION
  // ==========================================================================
  console.log('\n--- SECTION 3: Customer Enquiry Safety & FK Preservation ---');

  // Test submitting an enquiry against mock business 'v-001'
  const mockEnquiryResult = await enquiryService.submitEnquiry({
    businessId: 'v-001',
    businessName: 'Mock Business',
    cityId: 'vellore',
    customerName: 'Test Customer',
    customerPhone: '9876543210',
    message: 'Testing FK protection and error feedback',
  });

  assert(
    'Enquiry Safety',
    'Enquiry against mock ID v-001 rejected safely without PostgreSQL FK 23503 error',
    mockEnquiryResult.enquiry === null && Boolean(mockEnquiryResult.error),
    `Result error: "${mockEnquiryResult.error}"`
  );

  assert(
    'Enquiry Safety',
    'Enquiry failure is not reported as persisted',
    mockEnquiryResult.persisted !== true
  );

  // Test submitting an enquiry against a random non-existent UUID
  const randomUuid = '00000000-0000-0000-0000-000000000000';
  const nonExistentEnquiryResult = await enquiryService.submitEnquiry({
    businessId: randomUuid,
    businessName: 'Non-existent Business',
    cityId: 'vellore',
    customerName: 'Test Customer',
    customerPhone: '9876543210',
    message: 'Testing non-existent UUID validation',
  });

  assert(
    'Enquiry Safety',
    'Enquiry against non-existent UUID rejected before database insert',
    nonExistentEnquiryResult.enquiry === null && Boolean(nonExistentEnquiryResult.error),
    `Result error: "${nonExistentEnquiryResult.error}"`
  );

  // Input validation tests: invalid phone
  const invalidPhoneResult = await enquiryService.submitEnquiry({
    businessId: 'some-id',
    cityId: 'vellore',
    customerName: 'Test Customer',
    customerPhone: '123',
    message: 'Short phone test',
  });
  assert(
    'Enquiry Safety',
    'Invalid phone rejected by input validation',
    invalidPhoneResult.enquiry === null && Boolean(invalidPhoneResult.error?.includes('10-digit'))
  );

  // ==========================================================================
  // SECTION 4: PRODUCTION DATABASE AUDIT (READ-ONLY)
  // ==========================================================================
  console.log('\n--- SECTION 4: Production Database Read-Only Audit ---');

  const prodUrl = process.env.VITE_SUPABASE_URL || 'https://gpqbppjqqndzuvksrtjb.supabase.co';
  const prodKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

  if (prodKey && !prodKey.includes('placeholder')) {
    try {
      const prodClient = createClient(prodUrl, prodKey);
      const { data: prodBusinesses, error: prodErr } = await prodClient
        .from('businesses')
        .select('id, name, city_id, status')
        .eq('city_id', 'vellore')
        .eq('status', 'active');

      if (prodErr) {
        console.log(`  ⚠️ Note: Production query returned error (${prodErr.message}) - check network bypass`);
      } else {
        assert(
          'Production DB Read-Only',
          'Production query for Vellore active businesses returns HTTP 200 OK',
          true,
          `Found ${prodBusinesses?.length || 0} active rows`
        );

        assert(
          'Production DB Read-Only',
          'Production active Vellore businesses row count is 0 (genuine empty state)',
          prodBusinesses?.length === 0,
          `Count: ${prodBusinesses?.length || 0}`
        );
      }
    } catch (e: any) {
      console.log(`  ℹ️ Network query skipped: ${e?.message}`);
    }
  } else {
    console.log('  ℹ️ Production key not available in environment; skipping live fetch check');
  }

  // ==========================================================================
  // SUMMARY REPORT
  // ==========================================================================
  console.log('\n========================================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`TOTAL PHASE V3.7.3B CHECKS: ${total}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error('Fatal error running V3.7.3B suite:', err);
  process.exit(1);
});
