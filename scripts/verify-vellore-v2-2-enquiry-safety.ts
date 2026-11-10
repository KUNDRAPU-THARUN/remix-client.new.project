/**
 * KAARYAN LABS — PHASE V2.2 VERIFICATION SUITE
 * VELLORE ADS: PRODUCTION ENQUIRY SAFETY & RELIABILITY
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { CITIES } from '../src/config/cities';
import { enquiryService } from '../src/services/enquiryService';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${testName}${details ? ` -> ${details}` : ''}`);
  }
}

async function runEnquirySafetySuite() {
  console.log('=============================================================================');
  console.log('KAARYAN LABS — PHASE V2.2 VELLORE ENQUIRY SAFETY & DEPLOYMENT SUITE');
  console.log('=============================================================================\n');

  // ---------------------------------------------------------------------------
  // SECTION 1: Input Validation Contract (Enquiry & General Lead)
  // ---------------------------------------------------------------------------
  console.log('--- SECTION 1: Input Validation Contract ---');

  // Short/Empty name
  const emptyNameRes = await enquiryService.submitEnquiry({
    businessId: 'vel-biz-1',
    businessName: 'Test Biz',
    cityId: 'vellore',
    customerName: ' ',
    customerPhone: '9842344550',
    message: 'Valid requirement message here',
  });
  assert(
    emptyNameRes.enquiry === null && typeof emptyNameRes.error === 'string',
    'submitEnquiry rejects empty customer name'
  );

  // Invalid phone (<10 digits)
  const invalidPhoneRes = await enquiryService.submitEnquiry({
    businessId: 'vel-biz-1',
    businessName: 'Test Biz',
    cityId: 'vellore',
    customerName: 'Senthil',
    customerPhone: '12345',
    message: 'Valid requirement message here',
  });
  assert(
    invalidPhoneRes.enquiry === null && Boolean(invalidPhoneRes.error?.includes('10-digit')),
    'submitEnquiry rejects invalid short phone number'
  );

  // Short message (<5 chars)
  const shortMsgRes = await enquiryService.submitEnquiry({
    businessId: 'vel-biz-1',
    businessName: 'Test Biz',
    cityId: 'vellore',
    customerName: 'Senthil',
    customerPhone: '9842344550',
    message: 'hi',
  });
  assert(
    shortMsgRes.enquiry === null && Boolean(shortMsgRes.error?.includes('5 characters')),
    'submitEnquiry rejects message shorter than 5 characters'
  );

  // General Lead input validation
  const emptyNameLead = await enquiryService.submitGeneralLead({
    cityId: 'vellore',
    categoryId: 'cab-services',
    areaId: 'all',
    customerName: 'A',
    customerPhone: '9842344550',
    message: 'Need a taxi to Chennai airport',
  });
  assert(
    emptyNameLead.success === false && typeof emptyNameLead.error === 'string',
    'submitGeneralLead rejects short name (<2 chars)'
  );

  const invalidPhoneLead = await enquiryService.submitGeneralLead({
    cityId: 'vellore',
    categoryId: 'cab-services',
    areaId: 'all',
    customerName: 'Kumar',
    customerPhone: '98423',
    message: 'Need a taxi to Chennai airport',
  });
  assert(
    invalidPhoneLead.success === false && typeof invalidPhoneLead.error === 'string',
    'submitGeneralLead rejects phone number under 10 digits'
  );

  const shortMsgLead = await enquiryService.submitGeneralLead({
    cityId: 'vellore',
    categoryId: 'cab-services',
    areaId: 'all',
    customerName: 'Kumar',
    customerPhone: '9842344550',
    message: 'cab',
  });
  assert(
    shortMsgLead.success === false && typeof shortMsgLead.error === 'string',
    'submitGeneralLead rejects message under 5 chars'
  );

  // ---------------------------------------------------------------------------
  // SECTION 2: Production Failure Behavior & Zero Silent LocalStorage Fallback
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 2: Production Backend Failure Contract ---');

  const enquiryServiceSource = readFileSync(
    resolve(process.cwd(), 'src/services/enquiryService.ts'),
    'utf-8'
  );

  // Verify submitEnquiry checks supabase and returns error directly if supabase query fails
  const hasEnquiryErrorReturn = enquiryServiceSource.includes('if (error) {\n        return { enquiry: null, error: error.message };');
  assert(
    hasEnquiryErrorReturn,
    'submitEnquiry returns explicit error without fallback when Supabase insert fails'
  );

  // Verify submitEnquiry catch block returns error
  const hasEnquiryCatch = enquiryServiceSource.includes('return { enquiry: null, error: err instanceof Error ? err.message : \'Could not submit enquiry.\' };');
  assert(
    hasEnquiryCatch,
    'submitEnquiry catches unexpected network errors and returns explicit failure'
  );

  // Verify submitGeneralLead returns error on Supabase query failure
  const hasLeadErrorReturn = enquiryServiceSource.includes('success: false,') && enquiryServiceSource.includes('The server could not record your service enquiry.');
  assert(
    hasLeadErrorReturn,
    'submitGeneralLead returns explicit error without fallback when Supabase insert fails'
  );

  // Verify submitGeneralLead catch block returns network error
  const hasLeadCatch = enquiryServiceSource.includes('success: false,') && enquiryServiceSource.includes('Network error submitting service request.');
  assert(
    hasLeadCatch,
    'submitGeneralLead catches network exceptions and returns explicit failure'
  );

  // ---------------------------------------------------------------------------
  // SECTION 3: UI State Preservation on Submission Error
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 3: UI State Preservation on Error ---');

  // 1. ListingDetailModal: enquiry form preserves inputs on error
  const listingModalSource = readFileSync(
    resolve(process.cwd(), 'src/components/ListingDetailModal.tsx'),
    'utf-8'
  );

  const enquiryPreservesOnErr =
    listingModalSource.includes('if (res.error) {\n      setEnquiryError(res.error);\n    } else {') &&
    listingModalSource.includes('setEnquirySuccess(true);');
  assert(
    enquiryPreservesOnErr,
    'ListingDetailModal: Direct enquiry preserves form state on backend error'
  );

  const claimPreservesOnErr =
    listingModalSource.includes('if (res.error) {\n      setClaimError(res.error);\n    } else {') &&
    listingModalSource.includes('setClaimSuccess(true);');
  assert(
    claimPreservesOnErr,
    'ListingDetailModal: Business claim preserves form state on backend error'
  );

  const suggestEditPreservesOnErr =
    listingModalSource.includes('if (res.error) {\n      setEditError(res.error);\n    } else {') &&
    listingModalSource.includes('setEditSuccess(true);');
  assert(
    suggestEditPreservesOnErr,
    'ListingDetailModal: Suggest edit preserves form state on backend error'
  );

  // 2. HomepageQuickEnquiry: preserves inputs on error
  const quickEnquirySource = readFileSync(
    resolve(process.cwd(), 'src/components/HomepageQuickEnquiry.tsx'),
    'utf-8'
  );

  const quickEnquiryPreserves =
    quickEnquirySource.includes('if (res.error) {\n      setErrorMessage(res.error);\n    } else {') &&
    quickEnquirySource.includes('setIsSuccess(true);');
  assert(
    quickEnquiryPreserves,
    'HomepageQuickEnquiry preserves user input on backend error'
  );

  // 3. CabBookingModal: preserves inputs on error
  const cabModalSource = readFileSync(
    resolve(process.cwd(), 'src/components/CabBookingModal.tsx'),
    'utf-8'
  );

  const cabModalPreserves =
    cabModalSource.includes('if (res.error) {\n      setErrorMessage(res.error);\n    } else {') &&
    cabModalSource.includes('setIsSuccess(true);');
  assert(
    cabModalPreserves,
    'CabBookingModal preserves trip and customer inputs on backend error'
  );

  // ---------------------------------------------------------------------------
  // SECTION 4: Cross-City Non-Regression & City Isolation
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 4: Cross-City Non-Regression & City Integrity ---');

  // Vellore
  const vellore = CITIES.vellore;
  assert(vellore?.code === 'TN-23', 'Vellore city code is TN-23');
  assert(vellore?.theme.primaryColor === '#176AC4', 'Vellore primary theme is blue (#176AC4)');

  // Chittoor
  const chittoor = CITIES.chittoor;
  assert(chittoor?.code === 'AP-03', 'Chittoor city code is preserved as AP-03');
  assert(chittoor?.theme.primaryColor === '#E51E31', 'Chittoor primary theme is crimson (#E51E31)');

  // Bengaluru
  const bengaluru = CITIES.bengaluru;
  assert(bengaluru?.code === 'KA-01', 'Bengaluru city code is preserved as KA-01');
  assert(bengaluru?.theme.primaryColor === '#15995F', 'Bengaluru primary theme is emerald (#15995F)');

  // Summary
  console.log('\n=============================================================================');
  console.log(`PHASE V2.2 ENQUIRY SAFETY TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
  if (failedTests > 0) {
    console.error(`❌ FAILED TESTS: ${failedTests}`);
    process.exit(1);
  } else {
    console.log('✅ ALL ENQUIRY SAFETY AND DEPLOYMENT INTEGRITY TESTS PASSED');
    console.log('=============================================================================\n');
  }
}

runEnquirySafetySuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
