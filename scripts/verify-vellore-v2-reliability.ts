/**
 * KAARYAN LABS — PHASE V2 VERIFICATION SUITE
 * VELLORE ADS (TN-23): BUSINESS LISTINGS, REVIEWS & ENQUIRY RELIABILITY
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import {
  validateIndianMobile,
  validateIndianLandline,
  validateHelpline,
  validateInternational,
  parseContactPhone,
  resolveListingContact
} from '../src/utils/contactValidation';
import { INITIAL_LISTINGS, INITIAL_CLASSIFIEDS } from '../src/data/mockData';
import { CITIES } from '../src/config/cities';
import { businessService } from '../src/services/businessService';
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

console.log('=============================================================================');
console.log('KAARYAN LABS — PHASE V2 VELLORE DATA RELIABILITY VERIFICATION SUITE');
console.log('=============================================================================\n');

// ---------------------------------------------------------------------------
// SECTION 1: Contact Validation Engine (Indian Mobile, Landline, Helpline)
// ---------------------------------------------------------------------------
console.log('--- SECTION 1: Contact Validation Engine (Phone & WhatsApp) ---');

// Indian Mobile Tests
const validMobiles = [
  '9842344550',
  '+91 98423 44550',
  '+91-98423-44550',
  '09842344550',
  '919842344550',
  '+91 94432 11223',
  '+91 81899 85559',
  '6381234567',
  '7358123456',
  '8939123456',
];

for (const mob of validMobiles) {
  const res = validateIndianMobile(mob);
  assert(res.isValid, `Valid Indian mobile detected: ${mob}`);
  assert(res.whatsappDigits?.startsWith('91') ?? false, `WhatsApp digits formatted with 91: ${res.whatsappDigits}`);
}

// Indian Landlines (STD) - Must be dialable via tel:, but NOT valid for WhatsApp
const validLandlines = [
  '0416-2281000', // CMC Hospital Vellore
  '0416 2260900', // Vellore Govt Medical College
  '0416-2222100', // Vellore Police Control Room
  '0416-2220101', // Vellore Fire Station
  '0416-2220578', // Vellore Municipal Corp
  '08572-231980', // Chittoor Landline
];

for (const landline of validLandlines) {
  const lRes = validateIndianLandline(landline);
  assert(lRes.isValid, `Valid Indian landline with STD detected: ${landline}`);

  const parsed = parseContactPhone(landline);
  assert(parsed.isValidForTel, `Landline is dialable via tel: ${landline}`);
  assert(parsed.type === 'landline', `Landline correctly typed as landline: ${landline}`);

  const resolved = resolveListingContact(landline);
  assert(resolved.hasValidPhone, `resolveListingContact confirms phone valid for landline: ${landline}`);
  assert(!resolved.hasValidWhatsApp, `resolveListingContact strictly REJECTS landline for WhatsApp: ${landline}`);
}

// Emergency / Helplines - Dialable via tel:, strictly excluded from WhatsApp
const helplines = ['108', '100', '101', '1912', '1800-425-1000'];
for (const h of helplines) {
  const hRes = validateHelpline(h);
  assert(hRes.isValid, `Civic helpline or toll-free detected: ${h}`);
  const resolved = resolveListingContact(h);
  assert(resolved.hasValidPhone, `Helpline is dialable via tel: ${h}`);
  assert(!resolved.hasValidWhatsApp, `Helpline strictly REJECTS WhatsApp: ${h}`);
}

// Invalid Numbers - Must be rejected for BOTH tel: and WhatsApp
const invalidNumbers = [
  '',
  '   ',
  '12345', // 5 digits - MUST NOT be treated as valid mobile
  '9876',  // 4 digits not a helpline
  'abcde',
  'phone-number',
  '0000000000', // Dummy 0s
];

for (const inv of invalidNumbers) {
  const resolved = resolveListingContact(inv);
  assert(!resolved.hasValidPhone, `Invalid number rejected for phone: "${inv}"`);
  assert(!resolved.hasValidWhatsApp, `Invalid number rejected for WhatsApp: "${inv}"`);
}

// Dual contact resolution (separate landline for call + mobile for WhatsApp)
const dualContact = resolveListingContact('0416-2281000', '+91 98423 44550');
assert(dualContact.hasValidPhone, 'Dual contact: Landline resolved for phone');
assert(dualContact.hasValidWhatsApp, 'Dual contact: Separate mobile resolved for WhatsApp');
assert(dualContact.whatsappNumber === '919842344550', 'Dual contact: WhatsApp formatted cleanly as 919842344550');

// ---------------------------------------------------------------------------
// SECTION 2: Vellore Business Listing Data Audit
// ---------------------------------------------------------------------------
console.log('\n--- SECTION 2: Vellore Business Listing Audit ---');

const velloreListings = INITIAL_LISTINGS.filter((l) => l.cityId === 'vellore');
assert(velloreListings.length === 5, `Found exactly 5 Vellore listings in INITIAL_LISTINGS (got: ${velloreListings.length})`);

const activeVellore = velloreListings.filter((l) => l.status === 'Active');
assert(activeVellore.length === 3, `Found exactly 3 active Vellore listings (got: ${activeVellore.length})`);

const pendingVellore = velloreListings.filter((l) => l.status === 'Pending Approval');
assert(pendingVellore.length === 2, `Found exactly 2 pending Vellore listings (got: ${pendingVellore.length})`);

// Audit active preview listings for data honesty
for (const listing of activeVellore) {
  assert(listing.rating === 0, `Active preview listing "${listing.title}" has 0 rating (unrated)`);
  assert(listing.reviewsCount === 0, `Active preview listing "${listing.title}" has 0 reviewsCount`);
  assert(Array.isArray(listing.reviews) && listing.reviews.length === 0, `Active preview listing "${listing.title}" has empty reviews array`);
  assert(!listing.isVerified, `Active preview listing "${listing.title}" isVerified is false`);
  assert(Boolean(listing.badge?.includes('Preview')), `Active preview listing "${listing.title}" carries clear Preview badge`);

  // Contact resolution for preview listings
  const contact = resolveListingContact(listing.phone, listing.whatsapp);
  assert(!contact.hasValidPhone, `Preview listing "${listing.title}" has no valid phone (avoids broken tel:)`);
  assert(!contact.hasValidWhatsApp, `Preview listing "${listing.title}" has no valid WhatsApp (avoids broken wa.me/)`);
}

// Audit pending listings (v-pending-01, v-pending-02)
for (const listing of pendingVellore) {
  assert(listing.status === 'Pending Approval', `Pending listing "${listing.title}" has status "Pending Approval"`);
  assert(listing.rating === 0 && listing.reviewsCount === 0, `Pending listing "${listing.title}" has 0 rating and 0 reviews`);
  assert(listing.phone.length >= 10, `Pending listing "${listing.title}" has phone recorded`);
  const contact = resolveListingContact(listing.phone, listing.whatsapp);
  assert(contact.hasValidPhone, `Pending listing "${listing.title}" has valid phone`);
}

// Audit Vellore Classifieds
const velloreClassifieds = INITIAL_CLASSIFIEDS.filter((c) => c.cityId === 'vellore');
assert(velloreClassifieds.length === 2, `Found exactly 2 Vellore classifieds (got: ${velloreClassifieds.length})`);
for (const item of velloreClassifieds) {
  const contact = resolveListingContact(item.phone, item.whatsapp);
  assert(contact.hasValidPhone, `Classified "${item.title}" has valid phone: ${item.phone}`);
  assert(contact.hasValidWhatsApp, `Classified "${item.title}" has valid WhatsApp: ${item.whatsapp}`);
}

// ---------------------------------------------------------------------------
// SECTION 3: Reviews & Ratings Integrity & Retrieval
// ---------------------------------------------------------------------------
console.log('\n--- SECTION 3: Reviews & Ratings Integrity ---');

// Check that businessService exports getListingReviews
assert(typeof businessService.getListingReviews === 'function', 'businessService exports getListingReviews function');
assert(typeof businessService.addReview === 'function', 'businessService exports addReview function');

// Component reviews check in ListingCard and ListingDetailModal
const listingCardSrc = readFileSync(resolve('src/components/ListingCard.tsx'), 'utf-8');
assert(
  listingCardSrc.includes('New Listing • Unrated'),
  'ListingCard explicitly renders "New Listing • Unrated" for unrated businesses'
);

const listingDetailSrc = readFileSync(resolve('src/components/ListingDetailModal.tsx'), 'utf-8');
assert(
  listingDetailSrc.includes('New Listing • Unrated'),
  'ListingDetailModal explicitly renders "New Listing • Unrated" in hero header'
);
assert(
  listingDetailSrc.includes('No community reviews recorded yet'),
  'ListingDetailModal explicitly displays "No community reviews recorded yet"'
);
assert(
  listingDetailSrc.includes('resolveListingContact'),
  'ListingDetailModal imports and uses resolveListingContact'
);

// ---------------------------------------------------------------------------
// SECTION 4: Customer Enquiry & Lead Workflows
// ---------------------------------------------------------------------------
console.log('\n--- SECTION 4: Customer Enquiry & Lead Workflows ---');

assert(typeof enquiryService.submitEnquiry === 'function', 'enquiryService exports submitEnquiry');
assert(typeof enquiryService.submitGeneralLead === 'function', 'enquiryService exports submitGeneralLead');
assert(typeof enquiryService.getGeneralServiceRequests === 'function', 'enquiryService exports getGeneralServiceRequests');
assert(typeof enquiryService.getOwnerEnquiries === 'function', 'enquiryService exports getOwnerEnquiries');

// Test input validation on submitEnquiry
async function testEnquiryValidation() {
  const invalidNameRes = await enquiryService.submitEnquiry({
    businessId: 'v-001',
    cityId: 'vellore',
    customerName: 'A', // too short
    customerPhone: '9842344550',
    message: 'Testing enquiry',
  });
  assert(invalidNameRes.error !== undefined, 'submitEnquiry rejects name shorter than 2 characters');

  const invalidPhoneRes = await enquiryService.submitEnquiry({
    businessId: 'v-001',
    cityId: 'vellore',
    customerName: 'Karthik',
    customerPhone: '12345', // invalid phone
    message: 'Testing enquiry',
  });
  assert(invalidPhoneRes.error !== undefined, 'submitEnquiry rejects invalid short phone number');

  const invalidMsgRes = await enquiryService.submitEnquiry({
    businessId: 'v-001',
    cityId: 'vellore',
    customerName: 'Karthik',
    customerPhone: '9842344550',
    message: 'Hi', // too short
  });
  assert(invalidMsgRes.error !== undefined, 'submitEnquiry rejects message shorter than 5 characters');
}

await testEnquiryValidation();

// Test general lead submission validation
async function testGeneralLeadValidation() {
  const invalidPhone = await enquiryService.submitGeneralLead({
    cityId: 'vellore',
    categoryId: 'healthcare',
    areaId: 'bagayam',
    customerName: 'Karthik',
    customerPhone: '123', // invalid
    message: 'Requirement for diagnostic service',
  });
  assert(!invalidPhone.success && Boolean(invalidPhone.error), 'submitGeneralLead rejects invalid phone number');
}

await testGeneralLeadValidation();

// ---------------------------------------------------------------------------
// SECTION 5: Classifieds Contact Guarding
// ---------------------------------------------------------------------------
console.log('\n--- SECTION 5: Classifieds Contact Guarding ---');

const classifiedsSrc = readFileSync(resolve('src/components/ClassifiedsSection.tsx'), 'utf-8');
assert(
  classifiedsSrc.includes('resolveListingContact'),
  'ClassifiedsSection imports and uses resolveListingContact'
);
assert(
  classifiedsSrc.includes('contact.hasValidWhatsApp') && classifiedsSrc.includes('contact.hasValidPhone'),
  'ClassifiedsSection guards Call and WhatsApp handlers using contact validation'
);

// ---------------------------------------------------------------------------
// SECTION 6: Cross-City Scope Isolation
// ---------------------------------------------------------------------------
console.log('\n--- SECTION 6: Cross-City Scope Isolation ---');

const chittoorListings = INITIAL_LISTINGS.filter((l) => l.cityId === 'chittoor');
assert(chittoorListings.length === 10, `Chittoor has 10 listings (got: ${chittoorListings.length})`);
for (const cl of chittoorListings) {
  const c = resolveListingContact(cl.phone, cl.whatsapp);
  assert(c.hasValidPhone, `Chittoor listing "${cl.title}" retains valid phone`);
}

const bengaluruListings = INITIAL_LISTINGS.filter((l) => l.cityId === 'bengaluru');
assert(bengaluruListings.length === 3, `Bengaluru has 3 listings (got: ${bengaluruListings.length})`);
for (const bl of bengaluruListings) {
  const c = resolveListingContact(bl.phone, bl.whatsapp);
  assert(!c.hasValidPhone, `Bengaluru preview listing "${bl.title}" protected by enquiry fallback`);
}

console.log('\n=============================================================================');
console.log(`TOTAL PHASE V2 TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('=============================================================================');

if (failedTests === 0) {
  console.log('\n🎉 ALL PHASE V2 VELLORE DATA RELIABILITY TESTS PASSED (100%)!\n');
  process.exit(0);
} else {
  console.error(`\n❌ ${failedTests} test(s) failed.`);
  process.exit(1);
}

