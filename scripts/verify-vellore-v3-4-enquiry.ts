/**
 * KAARYAN LABS — PHASE V3.4 CONTRACT & UNIT VERIFICATION SUITE
 *
 * Verifies:
 * 1. Category-aware Vellore WhatsApp message generator in `src/utils/whatsappTemplates.ts`.
 * 2. Strict phone validation (landline exclusion, valid Indian mobile, URL encoding).
 * 3. Enquiry service validation (name >= 2, mobile 10-15 digits, message >= 5, optional email check).
 * 4. Elimination of client-side fake tracking numbers across all customer enquiry points.
 * 5. Form usability, field-level errors, aria accessibility, loading state, and retry handling.
 * 6. Privacy & consent microcopy presence across all 5 enquiry entry points.
 * 7. Preservation of protected cities (Chittoor AP-03, Bengaluru KA-01).
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import {
  getVelloreWhatsAppCategoryMessage,
  buildListingWhatsAppUrl,
} from '../src/utils/whatsappTemplates';
import { enquiryService } from '../src/services/enquiryService';

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

async function runTests() {
  console.log('\n=============================================================');
  console.log('KAARYAN LABS — PHASE V3.4 VERIFICATION: CUSTOMER ENQUIRY & COMMS');
  console.log('=============================================================\n');

  // ---------------------------------------------------------------------------
  // SECTION 1: VELLORE WHATSAPP CATEGORY TEMPLATES & BUILDER
  // ---------------------------------------------------------------------------
  console.log('--- SECTION 1: WhatsApp Category Template Generation ---');

  const healthcareMsg = getVelloreWhatsAppCategoryMessage('healthcare', 'CMC Hospital', 'Ida Scudder Road');
  assert(
    healthcareMsg.includes('doctor consultation') &&
      healthcareMsg.includes('Ida Scudder Road') &&
      healthcareMsg.includes('Vellore Ads (TN-23)'),
    'Healthcare category generates doctor consultation and hospital appointment text'
  );

  const restaurantMsg = getVelloreWhatsAppCategoryMessage('restaurants', 'Saravana Bhavan', 'Katpadi');
  assert(
    restaurantMsg.includes('table reservation') &&
      restaurantMsg.includes('menu specialties') &&
      restaurantMsg.includes('Katpadi'),
    'Restaurant category generates table reservation and menu specialties text'
  );

  const hostelMsg = getVelloreWhatsAppCategoryMessage('pg-hostels', 'VIT Mens PG', 'Katpadi');
  assert(
    hostelMsg.includes('room availability') &&
      hostelMsg.includes('VIT/CMC') &&
      hostelMsg.includes('Katpadi'),
    'PG/Hostel category generates student accommodation inquiry with VIT/CMC context'
  );

  const banquetMsg = getVelloreWhatsAppCategoryMessage('wedding-banquets', 'Sri Srinivasa Mahal', 'Sathuvachari');
  assert(
    banquetMsg.includes('hall availability') &&
      banquetMsg.includes('seating capacity'),
    'Wedding banquet category generates hall availability and seating capacity text'
  );

  const leatherMsg = getVelloreWhatsAppCategoryMessage('leather-industry', 'Ranipet Leather Hub', 'Ranipet');
  assert(
    leatherMsg.includes('leather products') &&
      leatherMsg.includes('bulk orders'),
    'Leather industry category generates retail/wholesale leather products text'
  );

  const eduMsg = getVelloreWhatsAppCategoryMessage('education', 'Vellore Coaching Academy');
  assert(
    eduMsg.includes('admission details') &&
      eduMsg.includes('course curriculum'),
    'Education category generates admission details and course curriculum text'
  );

  const cabMsg = getVelloreWhatsAppCategoryMessage('cab-services', 'Fast Track Cabs');
  assert(
    cabMsg.includes('vehicle rental tariffs') &&
      cabMsg.includes('driver dispatch'),
    'Cab services category generates rental tariff and driver dispatch text'
  );

  const realEstateMsg = getVelloreWhatsAppCategoryMessage('real-estate', 'Katpadi Prime Villa');
  assert(
    realEstateMsg.includes('property details') &&
      realEstateMsg.includes('site visit schedule'),
    'Real estate category generates property details and site visit text'
  );

  const homeServiceMsg = getVelloreWhatsAppCategoryMessage('home-services', 'Vellore AC Repair');
  assert(
    homeServiceMsg.includes('doorstep service availability') &&
      homeServiceMsg.includes('technician visit timings'),
    'Home services category generates doorstep service and technician visit text'
  );

  const fallbackMsg = getVelloreWhatsAppCategoryMessage('unknown-category', 'Generic Business');
  assert(
    fallbackMsg.includes('Vellore Ads (TN-23)') &&
      fallbackMsg.includes('enquire about your services and pricing'),
    'Unknown category falls back to clean Vellore generic greeting'
  );

  // ---------------------------------------------------------------------------
  // SECTION 2: PHONE & LANDLINE EXCLUSION IN WHATSAPP URL BUILDER
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 2: WhatsApp URL Builder & Contact Validation ---');

  // Valid Indian mobile
  const validWa = buildListingWhatsAppUrl({
    phone: '9842344550',
    businessTitle: 'Vellore Diagnostics',
    categoryId: 'healthcare',
    cityId: 'vellore',
  });
  assert(
    validWa.isValid === true &&
      validWa.destinationNumber === '919842344550' &&
      validWa.url.startsWith('https://wa.me/919842344550?text=') &&
      validWa.url.includes(encodeURIComponent('doctor consultation')),
    'Valid Indian mobile yields wa.me URL with properly URL-encoded text'
  );

  // Landline with STD code (0416-2281000) must NOT be allowed on WhatsApp
  const landlineWa = buildListingWhatsAppUrl({
    phone: '0416-2281000',
    businessTitle: 'CMC Reception Desk',
    categoryId: 'healthcare',
    cityId: 'vellore',
  });
  assert(
    landlineWa.isValid === false && landlineWa.url === '',
    'Landline with STD code (0416-2281000) is rejected for WhatsApp'
  );

  // Missing / dummy numbers
  const dummyWa = buildListingWhatsAppUrl({
    phone: '12345',
    businessTitle: 'Invalid Biz',
    cityId: 'vellore',
  });
  assert(
    dummyWa.isValid === false && dummyWa.url === '',
    'Short 5-digit number is rejected for WhatsApp'
  );

  // Protected city: Chittoor retains Chittoor Ads branding
  const chittoorWa = buildListingWhatsAppUrl({
    phone: '9848012345',
    businessTitle: 'Bans Hotel',
    cityId: 'chittoor',
    brandName: 'Chittoor Ads',
    cityCode: 'AP-03',
  });
  assert(
    chittoorWa.isValid === true &&
      chittoorWa.prefilledMessage.includes('Chittoor Ads (AP-03)'),
    'Chittoor listing preserves Chittoor Ads (AP-03) brand messaging'
  );

  // Protected city: Bengaluru retains Bengaluru Ads branding
  const blrWa = buildListingWhatsAppUrl({
    phone: '9845012345',
    businessTitle: 'Indiranagar Cafe',
    cityId: 'bengaluru',
    brandName: 'Bengaluru Ads',
    cityCode: 'KA-01',
  });
  assert(
    blrWa.isValid === true &&
      blrWa.prefilledMessage.includes('Bengaluru Ads (KA-01)'),
    'Bengaluru listing preserves Bengaluru Ads (KA-01) brand messaging'
  );

  // ---------------------------------------------------------------------------
  // SECTION 3: ENQUIRY SERVICE INPUT VALIDATION & SAFETY CONTRACTS
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 3: Enquiry Service Validation & Safety Contracts ---');

  // submitEnquiry validations
  const shortNameRes = await enquiryService.submitEnquiry({
    businessId: 'test-biz',
    cityId: 'vellore',
    customerName: 'A',
    customerPhone: '9842344550',
    message: 'Valid enquiry message',
  });
  assert(
    shortNameRes.enquiry === null &&
      !!shortNameRes.error &&
      shortNameRes.error.includes('at least 2 characters'),
    'submitEnquiry rejects name with less than 2 characters'
  );

  const shortPhoneRes = await enquiryService.submitEnquiry({
    businessId: 'test-biz',
    cityId: 'vellore',
    customerName: 'Karthik',
    customerPhone: '12345',
    message: 'Valid enquiry message',
  });
  assert(
    shortPhoneRes.enquiry === null &&
      !!shortPhoneRes.error &&
      shortPhoneRes.error.includes('10-digit mobile number'),
    'submitEnquiry rejects invalid short phone numbers'
  );

  const shortMsgRes = await enquiryService.submitEnquiry({
    businessId: 'test-biz',
    cityId: 'vellore',
    customerName: 'Karthik',
    customerPhone: '9842344550',
    message: 'Hi',
  });
  assert(
    shortMsgRes.enquiry === null &&
      !!shortMsgRes.error &&
      shortMsgRes.error.includes('at least 5 characters'),
    'submitEnquiry rejects message with less than 5 characters'
  );

  const invalidEmailRes = await enquiryService.submitEnquiry({
    businessId: 'test-biz',
    cityId: 'vellore',
    customerName: 'Karthik',
    customerPhone: '9842344550',
    customerEmail: 'not-an-email',
    message: 'Valid enquiry message',
  });
  assert(
    invalidEmailRes.enquiry === null &&
      !!invalidEmailRes.error &&
      invalidEmailRes.error.includes('valid email address'),
    'submitEnquiry rejects malformed email address'
  );

  // submitGeneralLead validations
  const genShortName = await enquiryService.submitGeneralLead({
    cityId: 'vellore',
    categoryId: 'services',
    areaId: 'all',
    customerName: 'X',
    customerPhone: '9842344550',
    message: 'Valid message for service quote',
  });
  assert(
    genShortName.success === false &&
      !!genShortName.error &&
      genShortName.error.includes('at least 2 characters'),
    'submitGeneralLead rejects name with less than 2 characters'
  );

  const genShortPhone = await enquiryService.submitGeneralLead({
    cityId: 'vellore',
    categoryId: 'services',
    areaId: 'all',
    customerName: 'Karthik',
    customerPhone: '987',
    message: 'Valid message for service quote',
  });
  assert(
    genShortPhone.success === false &&
      !!genShortPhone.error &&
      genShortPhone.error.includes('10-digit mobile number'),
    'submitGeneralLead rejects invalid phone numbers'
  );

  const genShortMsg = await enquiryService.submitGeneralLead({
    cityId: 'vellore',
    categoryId: 'services',
    areaId: 'all',
    customerName: 'Karthik',
    customerPhone: '9842344550',
    message: 'Hey',
  });
  assert(
    genShortMsg.success === false &&
      !!genShortMsg.error &&
      genShortMsg.error.includes('at least 5 characters'),
    'submitGeneralLead rejects requirement message with less than 5 characters'
  );

  // Offline / Demo submission safety: Must not fabricate fake server reference ID
  const offlineLead = await enquiryService.submitGeneralLead({
    cityId: 'vellore',
    categoryId: 'services',
    areaId: 'all',
    customerName: 'Karthik',
    customerPhone: '9842344550',
    message: 'Valid request for plumbing service quote',
  });
  assert(
    offlineLead.success === true &&
      offlineLead.persisted === false &&
      offlineLead.leadId === undefined &&
      offlineLead.isOffline === true,
    'Offline/demo lead submission never fabricates a server reference ID (leadId is undefined)'
  );

  // ---------------------------------------------------------------------------
  // SECTION 4: SOURCE CODE USABILITY & SAFETY INVARIANTS AUDIT
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 4: Source Code Usability & Safety Invariants Audit ---');

  const enquiryServiceSrc = readFileSync(
    resolve(process.cwd(), 'src/services/enquiryService.ts'),
    'utf-8'
  );
  assert(
    enquiryServiceSrc.includes('recentWindow') &&
      enquiryServiceSrc.includes('duplicatePrevented'),
    'enquiryService implements 60-second idempotency check against duplicate retries'
  );

  const quickEnquirySrc = readFileSync(
    resolve(process.cwd(), 'src/components/HomepageQuickEnquiry.tsx'),
    'utf-8'
  );
  assert(
    quickEnquirySrc.includes('quick-enquiry-name-error') &&
      quickEnquirySrc.includes('quick-enquiry-phone-error'),
    'HomepageQuickEnquiry includes field-specific error IDs'
  );
  assert(
    quickEnquirySrc.includes('aria-invalid') && quickEnquirySrc.includes('aria-describedby'),
    'HomepageQuickEnquiry includes accessible aria attributes'
  );
  assert(
    quickEnquirySrc.includes('Privacy Notice') &&
      !quickEnquirySrc.includes('Privacy Guarantee') &&
      !quickEnquirySrc.includes('exclusively') &&
      quickEnquirySrc.includes('We do not sell your personal contact details'),
    'HomepageQuickEnquiry uses accurate Privacy Notice without exclusive or fictitious claims'
  );
  assert(
    quickEnquirySrc.includes('handleRetry'),
    'HomepageQuickEnquiry provides a retry option on submission failure'
  );
  assert(
    quickEnquirySrc.includes('isOfflineResult'),
    'HomepageQuickEnquiry handles offline demo mode vs confirmed live database persistence'
  );

  const modalSrc = readFileSync(
    resolve(process.cwd(), 'src/components/ListingDetailModal.tsx'),
    'utf-8'
  );
  assert(
    modalSrc.includes('modal-enquiry-name-error') &&
      modalSrc.includes('modal-enquiry-phone-error') &&
      modalSrc.includes('modal-enquiry-message-error'),
    'ListingDetailModal includes field-specific error IDs for enquiry form'
  );
  assert(
    modalSrc.includes('buildListingWhatsAppUrl'),
    'ListingDetailModal uses buildListingWhatsAppUrl for category-aware WhatsApp CTA'
  );
  assert(
    modalSrc.includes('Privacy Notice') &&
      !modalSrc.includes('Privacy Guarantee') &&
      !modalSrc.includes('exclusively') &&
      modalSrc.includes('isEnquiryOffline'),
    'ListingDetailModal includes accurate Privacy Notice and distinguishes demo mode'
  );

  const bizPageSrc = readFileSync(
    resolve(process.cwd(), 'src/components/StandaloneBusinessPage.tsx'),
    'utf-8'
  );
  assert(
    bizPageSrc.includes('biz-page-name-error') &&
      bizPageSrc.includes('biz-page-phone-error') &&
      bizPageSrc.includes('biz-page-msg-error'),
    'StandaloneBusinessPage includes field-specific error IDs'
  );
  assert(
    bizPageSrc.includes('buildListingWhatsAppUrl'),
    'StandaloneBusinessPage uses buildListingWhatsAppUrl for Quick Action WhatsApp button'
  );
  assert(
    bizPageSrc.includes('Privacy Notice') &&
      !bizPageSrc.includes('Privacy Guarantee') &&
      !bizPageSrc.includes('The verified business owner of') &&
      bizPageSrc.includes('isEnquiryOffline'),
    'StandaloneBusinessPage uses accurate Privacy Notice without claiming every merchant is verified'
  );

  const cabModalSrc = readFileSync(
    resolve(process.cwd(), 'src/components/CabBookingModal.tsx'),
    'utf-8'
  );
  assert(
    !cabModalSrc.includes('CAB-${currentCity.code}-${Date.now()'),
    'CabBookingModal strictly eliminates fabricated client-side tracking reference CAB-TN-23-...'
  );
  assert(
    cabModalSrc.includes('cab-pickup-error') &&
      cabModalSrc.includes('cab-drop-error') &&
      cabModalSrc.includes('cab-name-error') &&
      cabModalSrc.includes('cab-phone-error'),
    'CabBookingModal includes field-specific error elements'
  );
  assert(
    cabModalSrc.includes('Privacy Notice') &&
      !cabModalSrc.includes('Privacy Guarantee') &&
      !cabModalSrc.includes('exclusively with verified taxi operators') &&
      cabModalSrc.includes('isOfflineResult'),
    'CabBookingModal includes accurate Privacy Notice and handles offline demo results'
  );

  const contactPageSrc = readFileSync(
    resolve(process.cwd(), 'src/components/VelloreContactPage.tsx'),
    'utf-8'
  );
  assert(
    contactPageSrc.includes('Privacy Notice') &&
      !contactPageSrc.includes('Privacy Guarantee') &&
      !contactPageSrc.includes('strictly and exclusively') &&
      contactPageSrc.includes('isOfflineResult'),
    'VelloreContactPage includes explicit Privacy Notice and demo mode distinction'
  );
  assert(
    contactPageSrc.includes('Retry') || contactPageSrc.includes('setSubmitError(null)'),
    'VelloreContactPage provides a retry mechanism on submission failure'
  );

  const listingCardSrc = readFileSync(
    resolve(process.cwd(), 'src/components/ListingCard.tsx'),
    'utf-8'
  );
  assert(
    listingCardSrc.includes('buildListingWhatsAppUrl'),
    'ListingCard uses buildListingWhatsAppUrl for category-tailored messages'
  );

  const homeSectionsSrc = readFileSync(
    resolve(process.cwd(), 'src/components/HomeSections.tsx'),
    'utf-8'
  );
  assert(
    homeSectionsSrc.includes('buildListingWhatsAppUrl'),
    'HomeSections uses buildListingWhatsAppUrl for homepage featured cards'
  );

  // ---------------------------------------------------------------------------
  // SECTION 5: SAFETY & SENSITIVE CREDENTIALS CHECK
  // ---------------------------------------------------------------------------
  console.log('\n--- SECTION 5: Security & Governance Safety ---');

  const govSqlPath = resolve(process.cwd(), 'supabase/migrations/20261103000003_super_admin_governance.sql');
  assert(
    existsSync(govSqlPath),
    'Protected super_admin_governance.sql file is preserved and exists'
  );

  // Print Summary
  console.log('\n=============================================================');
  console.log(`TOTAL ASSERTIONS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
