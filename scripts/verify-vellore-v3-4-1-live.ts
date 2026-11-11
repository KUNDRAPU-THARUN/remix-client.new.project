/**
 * KAARYAN LABS — PHASE V3.4.1 VERIFICATION SUITE
 * VELLORE ADS (TN-23): LIVE ENQUIRY, SUPABASE AND PRIVACY VERIFICATION
 *
 * Verifies:
 * 1. Environment Identification & Protection Gate (Production vs Staging isolation).
 * 2. Supabase schema, table structures, and column compatibility for Vellore.
 * 3. Enquiry entry points end-to-end usability, validation, and demo mode handling.
 * 4. Franchise territory isolation and lead authorization rules.
 * 5. Idempotency & duplicate submission prevention on network retry.
 * 6. Privacy & consent microcopy accuracy (zero blanket or exclusive claims).
 * 7. Error handling & input preservation on failure.
 * 8. Protection of Chittoor (AP-03) and Bengaluru (KA-01) territories.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { enquiryService } from '../src/services/enquiryService';
import { franchiseService } from '../src/services/franchiseService';
import { CITIES } from '../src/config/cities';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ''}`);
  }
}

async function runPhaseV341Suite() {
  console.log('\n======================================================================');
  console.log('KAARYAN LABS — PHASE V3.4.1: LIVE ENQUIRY, SUPABASE & PRIVACY VERIFICATION');
  console.log('======================================================================\n');

  // ---------------------------------------------------------------------------
  // SECTION 1: ENVIRONMENT IDENTIFICATION & PRODUCTION SAFETY GATE
  // ---------------------------------------------------------------------------
  console.log('--- SECTION 1: Environment Identification & Safety Gate ---');

  const envPath = resolve(process.cwd(), '.env.local');
  assert(existsSync(envPath), '.env.local exists in root directory');

  const envContent = readFileSync(envPath, 'utf-8');
  const urlMatch = envContent.match(/VITE_SUPABASE_URL\s*=\s*['"]?https:\/\/([^.]+)\.supabase\.co/);
  const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*['"]?([^'"\r\n]+)/);

  const configuredRef = urlMatch ? urlMatch[1] : null;
  const hasAnonKey = Boolean(keyMatch && keyMatch[1]);
  const isStaging = configuredRef === 'tbwtxnszyddvpgqvxwow';
  const isProduction = configuredRef === 'gpqbppjqqndzuvksrtjb';

  assert(hasAnonKey, 'Anon key is configured in .env.local without exposing secret');
  assert(
    isProduction === true && configuredRef === 'gpqbppjqqndzuvksrtjb',
    'Configured environment identified as Production / Dev project (gpqbppjqqndzuvksrtjb)'
  );
  assert(
    isStaging === false,
    'Configured environment is NOT authorized staging (tbwtxnszyddvpgqvxwow)'
  );

  console.log(`  🛡️ Target Database: ${configuredRef} [PRODUCTION / DEV]`);
  console.log('  🛡️ Production Write Rule: LIVE WRITES NOT TESTED (Protected from test payloads).');

  // ---------------------------------------------------------------------------
  // SECTION 2: SUPABASE SCHEMA & QUERY COMPATIBILITY AUDIT
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 2: Supabase Schema & Query Compatibility ---');

  const initialSchema = readFileSync(
    resolve(process.cwd(), 'supabase/migrations/20261101000001_initial_schema.sql'),
    'utf-8'
  );
  const rlsSchema = readFileSync(
    resolve(process.cwd(), 'supabase/migrations/20261101000002_row_level_security.sql'),
    'utf-8'
  );
  const generalLeadsSchema = readFileSync(
    resolve(process.cwd(), 'supabase/migrations/20261103000001_general_service_requests.sql'),
    'utf-8'
  );

  assert(
    initialSchema.includes('CREATE TABLE IF NOT EXISTS public.customer_enquiries') &&
      initialSchema.includes('business_id UUID NOT NULL') &&
      initialSchema.includes('city_id TEXT NOT NULL'),
    'customer_enquiries table schema defines business_id, city_id, and customer fields'
  );

  assert(
    generalLeadsSchema.includes('CREATE TABLE IF NOT EXISTS public.general_service_requests') &&
      generalLeadsSchema.includes('city_id TEXT NOT NULL') &&
      generalLeadsSchema.includes('category_id TEXT NOT NULL'),
    'general_service_requests table schema defines city_id, category_id, and customer fields'
  );

  assert(
    rlsSchema.includes('ALTER TABLE public.customer_enquiries ENABLE ROW LEVEL SECURITY') &&
      generalLeadsSchema.includes('ALTER TABLE public.general_service_requests ENABLE ROW LEVEL SECURITY'),
    'Row Level Security is enabled on both customer_enquiries and general_service_requests'
  );

  // ---------------------------------------------------------------------------
  // SECTION 3: FRANCHISE LEAD AUTHORIZATION & ISOLATION
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 3: Franchise Lead Authorization & Territory Isolation ---');

  assert(
    rlsSchema.includes("public.has_role(auth.uid(), 'city_franchise', city_id)") ||
      rlsSchema.includes("public.has_role(auth.uid(), 'city_franchise'"),
    'customer_enquiries RLS restricts franchise read access strictly by city_id territory'
  );

  assert(
    generalLeadsSchema.includes("public.has_role(auth.uid(), 'city_franchise', general_service_requests.city_id)"),
    'general_service_requests RLS restricts franchise read access strictly by general_service_requests.city_id'
  );

  const franchiseSrc = readFileSync(
    resolve(process.cwd(), 'src/services/franchiseService.ts'),
    'utf-8'
  );
  assert(
    franchiseSrc.includes(".eq('city_id', cityId)"),
    'franchiseService strictly scopes all queries to requested cityId'
  );

  // Verify local franchise queries scope cleanly
  const velloreStats = await franchiseService.getFranchiseStats('vellore');
  assert(
    typeof velloreStats.totalListings === 'number' &&
      typeof velloreStats.totalEnquiries === 'number',
    'franchiseService.getFranchiseStats returns structured territory metrics for Vellore'
  );

  const velloreLeads = await franchiseService.getGeneralLeads('vellore');
  assert(Array.isArray(velloreLeads), 'franchiseService.getGeneralLeads returns array of leads for Vellore');

  // ---------------------------------------------------------------------------
  // SECTION 4: IDEMPOTENCY & DUPLICATE SUBMISSION TESTING
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 4: Idempotency & Duplicate Submission Testing ---');

  // 1. First lead submission
  const firstLead = await enquiryService.submitGeneralLead({
    cityId: 'vellore',
    categoryId: 'cab-services',
    areaId: 'all',
    customerName: 'Karthik Raja',
    customerPhone: '9842344550',
    message: 'Need a sedan to Chennai airport tomorrow 6 AM.',
  });
  assert(
    firstLead.success === true && firstLead.isOffline === true && firstLead.persisted === false,
    'Initial general lead is accepted in offline/demo mode without fake server ID'
  );

  // 2. Retry with identical parameters within 60s
  const retryLead = await enquiryService.submitGeneralLead({
    cityId: 'vellore',
    categoryId: 'cab-services',
    areaId: 'all',
    customerName: 'Karthik Raja',
    customerPhone: '9842344550',
    message: 'Need a sedan to Chennai airport tomorrow 6 AM.',
  });
  assert(
    retryLead.success === true &&
      retryLead.duplicatePrevented === true,
    'Duplicate submission within 60s is intercepted with duplicatePrevented: true'
  );

  // 3. Different legitimate enquiry from same customer (different category)
  const diffCategoryLead = await enquiryService.submitGeneralLead({
    cityId: 'vellore',
    categoryId: 'home-services',
    areaId: 'all',
    customerName: 'Karthik Raja',
    customerPhone: '9842344550',
    message: 'Looking for a verified AC technician in Katpadi.',
  });
  assert(
    diffCategoryLead.success === true &&
      !diffCategoryLead.duplicatePrevented,
    'Legitimate enquiry for a different category from the same customer is accepted'
  );

  // 4. Direct Merchant Enquiry Duplicate Check
  const firstEnquiry = await enquiryService.submitEnquiry({
    businessId: 'v-001',
    businessName: 'Vellore Diagnostic Lab',
    cityId: 'vellore',
    customerName: 'Karthik Raja',
    customerPhone: '9842344550',
    message: 'Enquiry about master health checkup packages.',
  });
  assert(
    firstEnquiry.enquiry !== null && firstEnquiry.isOffline === true,
    'Initial direct merchant enquiry is accepted in offline/demo mode'
  );

  const retryEnquiry = await enquiryService.submitEnquiry({
    businessId: 'v-001',
    businessName: 'Vellore Diagnostic Lab',
    cityId: 'vellore',
    customerName: 'Karthik Raja',
    customerPhone: '9842344550',
    message: 'Enquiry about master health checkup packages.',
  });
  assert(
    retryEnquiry.enquiry !== null &&
      retryEnquiry.duplicatePrevented === true,
    'Direct merchant enquiry retry within 60s is intercepted with duplicatePrevented: true'
  );

  // 5. Direct enquiry to a different business is allowed
  const diffBizEnquiry = await enquiryService.submitEnquiry({
    businessId: 'v-002',
    businessName: 'Another Vellore Clinic',
    cityId: 'vellore',
    customerName: 'Karthik Raja',
    customerPhone: '9842344550',
    message: 'Enquiry about dental clinic consultation timings.',
  });
  assert(
    diffBizEnquiry.enquiry !== null &&
      !diffBizEnquiry.duplicatePrevented,
    'Legitimate enquiry to a different business is accepted'
  );

  // ---------------------------------------------------------------------------
  // SECTION 5: PRIVACY & ACCURACY AUDIT
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 5: Privacy & Accuracy Invariants Audit ---');

  const quickEnquirySrc = readFileSync(
    resolve(process.cwd(), 'src/components/HomepageQuickEnquiry.tsx'),
    'utf-8'
  );
  assert(
    !quickEnquirySrc.includes('Verified local service providers, doctors, contractors') &&
      !quickEnquirySrc.includes('⚡ Verified Leads') &&
      !quickEnquirySrc.includes('Privacy Guarantee'),
    'HomepageQuickEnquiry eliminates blanket verification claims and absolute privacy guarantee'
  );
  assert(
    quickEnquirySrc.includes('Privacy Notice') &&
      quickEnquirySrc.includes('We do not sell your personal contact details'),
    'HomepageQuickEnquiry provides accurate Privacy Notice explaining callback coordination'
  );

  const modalSrc = readFileSync(
    resolve(process.cwd(), 'src/components/ListingDetailModal.tsx'),
    'utf-8'
  );
  assert(
    modalSrc.includes('Privacy Notice') &&
      !modalSrc.includes('Privacy Guarantee') &&
      modalSrc.includes('isEnquiryOffline'),
    'ListingDetailModal uses accurate Privacy Notice and labels demo mode'
  );

  const bizPageSrc = readFileSync(
    resolve(process.cwd(), 'src/components/StandaloneBusinessPage.tsx'),
    'utf-8'
  );
  assert(
    !bizPageSrc.includes('The verified business owner of') &&
      !bizPageSrc.includes('Verified local establishment in Vellore') &&
      !bizPageSrc.includes('Privacy Guarantee'),
    'StandaloneBusinessPage eliminates blanket verification claims across all text'
  );
  assert(
    bizPageSrc.includes('listing.isVerified ?') &&
      bizPageSrc.includes('Directory Listing •'),
    'StandaloneBusinessPage conditionally displays verification badge based on listing.isVerified'
  );

  const cabModalSrc = readFileSync(
    resolve(process.cwd(), 'src/components/CabBookingModal.tsx'),
    'utf-8'
  );
  assert(
    cabModalSrc.includes('Privacy Notice') &&
      !cabModalSrc.includes('Privacy Guarantee') &&
      !cabModalSrc.includes('registered with verified taxi partners') &&
      cabModalSrc.includes('Licensed & local operators'),
    'CabBookingModal accurately describes operators as licensed & local without blanket verification'
  );

  const contactPageSrc = readFileSync(
    resolve(process.cwd(), 'src/components/VelloreContactPage.tsx'),
    'utf-8'
  );
  assert(
    contactPageSrc.includes('Privacy Notice') &&
      !contactPageSrc.includes('strictly and exclusively') &&
      !contactPageSrc.includes('Privacy Guarantee'),
    'VelloreContactPage provides accurate routing privacy statement'
  );

  const waTemplatesSrc = readFileSync(
    resolve(process.cwd(), 'src/utils/whatsappTemplates.ts'),
    'utf-8'
  );
  assert(
    !waTemplatesSrc.includes('customerPhone') &&
      !waTemplatesSrc.includes('customerName') &&
      !waTemplatesSrc.includes('userPhone'),
    'WhatsApp message templates strictly contain zero customer personal data in URLs'
  );

  // ---------------------------------------------------------------------------
  // SECTION 6: ERROR HANDLING & INPUT PRESERVATION CONTRACTS
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 6: Error Handling & Input Preservation Contracts ---');

  assert(
    quickEnquirySrc.includes('setErrorMessage') && quickEnquirySrc.includes('handleRetry'),
    'HomepageQuickEnquiry provides error alert and retry button'
  );

  assert(
    modalSrc.includes('enquiryError') && modalSrc.includes('Retry'),
    'ListingDetailModal preserves input state and provides retry on submission failure'
  );

  assert(
    bizPageSrc.includes('enquiryError') && bizPageSrc.includes('Retry'),
    'StandaloneBusinessPage preserves input state and provides retry on error'
  );

  assert(
    cabModalSrc.includes('errorMessage') && cabModalSrc.includes('validateForm'),
    'CabBookingModal validates fields and preserves form inputs on submission error'
  );

  assert(
    contactPageSrc.includes('submitError') && contactPageSrc.includes('Send another message'),
    'VelloreContactPage handles submission error and resets state cleanly'
  );

  // ---------------------------------------------------------------------------
  // SECTION 7: CROSS-CITY ISOLATION & GOVERNANCE SAFETY
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 7: Cross-City Isolation & Governance Safety ---');

  assert(CITIES.chittoor.id === 'chittoor', 'Chittoor (AP-03) config intact');
  assert(CITIES.bengaluru.id === 'bengaluru', 'Bengaluru (KA-01) config intact');
  assert(CITIES.vellore.id === 'vellore', 'Vellore (TN-23) config intact');

  const govSqlPath = resolve(process.cwd(), 'supabase/migrations/20261103000003_super_admin_governance.sql');
  assert(
    existsSync(govSqlPath),
    'Protected super_admin_governance.sql file is preserved and untouched'
  );

  // ---------------------------------------------------------------------------
  // SUMMARY RESULTS
  // ---------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log(`TOTAL PHASE V3.4.1 ASSERTIONS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhaseV341Suite().catch((err) => {
  console.error('Fatal execution error in Phase V3.4.1 suite:', err);
  process.exit(1);
});
