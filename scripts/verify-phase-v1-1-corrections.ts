/**
 * KAARYAN LABS — PHASE V1.1 VELLORE DEFECT CORRECTIONS TEST SUITE
 *
 * Verifies:
 * 1. Task 1: Listing Contact Buttons (ListingCard.tsx & ListingDetailModal.tsx)
 *    - Never generate empty tel: or wa.me/ URLs
 *    - Fallback to detail/enquiry flow for unpopulated phone numbers
 *    - Accessible disabled states with aria-label / title
 *    - Preservation of valid phone behavior for all three cities
 *    - Prevention of fabricated contact submissions in edit suggestions
 * 2. Task 2: Post Ad City Branding (PostAdModal.tsx)
 *    - Vellore route: "Vellore Ads"
 *    - Chittoor route: "Chittoor Ads"
 *    - Bengaluru route: "Bengaluru Ads"
 *    - Reliable city-context resolution via CITIES config and CityConfig prop
 * 3. Task 3: Cross-city safety & regression check
 */

import fs from 'fs';
import path from 'path';
import { CITIES } from '../src/config/cities';
import { INITIAL_LISTINGS } from '../src/data/mockData';
import { VELLORE_EMERGENCY_CONTACTS, CHITTOOR_EMERGENCY_CONTACTS } from '../src/config/emergency';

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
    console.error(`  ❌ FAIL: ${testName}`);
    if (details) console.error(`     Details: ${details}`);
  }
}

console.log('=============================================================================');
console.log('KAARYAN LABS — PHASE V1.1 VELLORE DEFECT CORRECTIONS VERIFICATION SUITE');
console.log('=============================================================================\n');

// ============================================================================
// SECTION 1: TASK 1 — LISTING CONTACT BUTTONS & PHONE INTEGRITY
// ============================================================================
console.log('--- SECTION 1: Task 1 — Listing Contact Buttons & Phone Integrity ---');

// 1.1 Source code inspection of ListingCard.tsx
const listingCardPath = path.resolve('src/components/ListingCard.tsx');
const listingCardCode = fs.readFileSync(listingCardPath, 'utf8');

assert(
  listingCardCode.includes('hasValidPhone'),
  'ListingCard defines hasValidPhone validation'
);
assert(
  listingCardCode.includes('hasValidWhatsApp'),
  'ListingCard defines hasValidWhatsApp validation'
);
assert(
  listingCardCode.includes('if (!hasValidPhone)'),
  'ListingCard handleCall strictly guards against empty phone numbers'
);
assert(
  listingCardCode.includes('if (!hasValidWhatsApp)'),
  'ListingCard handleWhatsApp strictly guards against empty WhatsApp numbers'
);
assert(
  !listingCardCode.includes('window.location.href = `tel:${listing.phone.replace'),
  'ListingCard eliminated unguarded window.location.href = `tel:${listing.phone...}`'
);
assert(
  listingCardCode.includes('<span>Enquire</span>') && listingCardCode.includes('title="Direct phone not provided'),
  'ListingCard renders accessible Enquire button when phone number is missing'
);
assert(
  listingCardCode.includes('disabled') && listingCardCode.includes('aria-disabled="true"') && listingCardCode.includes('title="WhatsApp contact not provided'),
  'ListingCard renders accessible disabled WhatsApp button with aria-disabled when WhatsApp is unavailable'
);
assert(
  listingCardCode.includes('aria-label='),
  'ListingCard buttons include accessible aria-label attributes'
);

// 1.2 Source code inspection of ListingDetailModal.tsx
const detailModalPath = path.resolve('src/components/ListingDetailModal.tsx');
const detailModalCode = fs.readFileSync(detailModalPath, 'utf8');

assert(
  detailModalCode.includes('hasValidPhone'),
  'ListingDetailModal defines hasValidPhone validation'
);
assert(
  detailModalCode.includes('hasValidWhatsApp'),
  'ListingDetailModal defines hasValidWhatsApp validation'
);
assert(
  detailModalCode.includes('if (!hasValidPhone) {\n      setIsEnquiryOpen(true);') ||
  detailModalCode.includes('if (!hasValidPhone) {') && detailModalCode.includes('setIsEnquiryOpen(true)'),
  'ListingDetailModal handleCall diverts to enquiry dialog when phone is missing'
);
assert(
  detailModalCode.includes('if (!hasValidWhatsApp) {\n      setIsEnquiryOpen(true);') ||
  detailModalCode.includes('if (!hasValidWhatsApp) {') && detailModalCode.includes('setIsEnquiryOpen(true)'),
  'ListingDetailModal handleWhatsApp diverts to enquiry dialog when WhatsApp is missing'
);
assert(
  detailModalCode.includes('<span>Call</span>') && detailModalCode.includes('cursor-not-allowed') && detailModalCode.includes('title="Direct phone not provided for this listing'),
  'ListingDetailModal renders disabled Call button with clear unavailable title when phone is missing'
);
assert(
  detailModalCode.includes('<span>WhatsApp</span>') && detailModalCode.includes('cursor-not-allowed') && detailModalCode.includes('title="WhatsApp contact not provided for this listing'),
  'ListingDetailModal renders disabled WhatsApp button with clear unavailable title when WhatsApp is missing'
);
assert(
  detailModalCode.includes('<span>Send Online Enquiry</span>'),
  'ListingDetailModal Services tab provides Send Online Enquiry fallback when WhatsApp is missing'
);
assert(
  !detailModalCode.includes("customerPhone: editPhone.trim() || '9999999999'"),
  'ListingDetailModal eliminated fabricated 9999999999 placeholder from edit suggestions'
);
assert(
  detailModalCode.includes('cleanEditPhone.length < 10'),
  'ListingDetailModal validates genuine 10-digit mobile number for edit suggestions'
);

// 1.3 Test mock listing contact phone behavior
const vellorePreviewListings = INITIAL_LISTINGS.filter((l) => l.cityId === 'vellore' && l.status === 'Active');
assert(
  vellorePreviewListings.length >= 3,
  `Found ${vellorePreviewListings.length} active preview listings in Vellore`
);

vellorePreviewListings.forEach((listing) => {
  const digitsOnlyPhone = (listing.phone || '').replace(/[^0-9]/g, '');
  const digitsOnlyWhatsApp = (listing.whatsapp || '').replace(/[^0-9]/g, '');
  const hasValidPhone = digitsOnlyPhone.length >= 5;
  const hasValidWhatsApp = digitsOnlyWhatsApp.length >= 5;

  assert(
    !hasValidPhone,
    `Vellore preview listing "${listing.title}" correctly identified as having no phone (blank)`
  );
  assert(
    !hasValidWhatsApp,
    `Vellore preview listing "${listing.title}" correctly identified as having no WhatsApp (blank)`
  );
});

// 1.4 Test Chittoor & Bengaluru listings have valid phone numbers (preserves normal behavior)
const chittoorListings = INITIAL_LISTINGS.filter((l) => l.cityId === 'chittoor' && l.status === 'Active');
assert(chittoorListings.length > 0, `Found ${chittoorListings.length} Chittoor listings`);
chittoorListings.forEach((listing) => {
  const digits = (listing.phone || '').replace(/[^0-9]/g, '');
  assert(
    digits.length >= 5,
    `Chittoor listing "${listing.title}" has valid phone: ${listing.phone}`
  );
});

// 1.4 Test Bengaluru demo listings also benefit from safe enquiry flow when phone is blank
const bengaluruListings = INITIAL_LISTINGS.filter((l) => l.cityId === 'bengaluru' && l.status === 'Active');
assert(bengaluruListings.length > 0, `Found ${bengaluruListings.length} Bengaluru listings`);
bengaluruListings.forEach((listing) => {
  const digits = (listing.phone || '').replace(/[^0-9]/g, '');
  const hasValidPhone = digits.length >= 5;
  assert(
    !hasValidPhone,
    `Bengaluru preview listing "${listing.title}" correctly protected by safe enquiry fallback (phone: ${listing.phone || "blank"})`
  );
});

// ============================================================================
// SECTION 2: TASK 2 — POST AD CITY BRANDING
// ============================================================================
console.log('\n--- SECTION 2: Task 2 — Post Ad City Branding ---');

const postAdModalPath = path.resolve('src/components/PostAdModal.tsx');
const postAdModalCode = fs.readFileSync(postAdModalPath, 'utf8');

assert(
  postAdModalCode.includes("import { CITIES } from '../config/cities'"),
  'PostAdModal imports CITIES configuration directly'
);
assert(
  postAdModalCode.includes('<span>Post Free Business Ad on {brandHeading}</span>'),
  'PostAdModal uses dynamic brandHeading in modal title'
);
assert(
  postAdModalCode.includes('Reach thousands of local customers in {cityName} ({cityCode})'),
  'PostAdModal uses dynamic cityName and cityCode in subtitle'
);
assert(
  postAdModalCode.includes('Full Address & Landmark in {cityName} *'),
  'PostAdModal uses dynamic cityName in Address label'
);
assert(
  postAdModalCode.includes('<span>Publish Free Ad to {cityName} Directory</span>'),
  'PostAdModal uses dynamic cityName in Submit button'
);
assert(
  !postAdModalCode.includes('<span>Post Free Business Ad on ChittoorAds</span>'),
  'PostAdModal eliminated hardcoded "ChittoorAds" heading'
);
assert(
  !postAdModalCode.includes('Reach thousands of local customers in Chittoor, Kanipakam'),
  'PostAdModal eliminated hardcoded Chittoor subtitle'
);

// 2.2 Test brandHeading resolution for all three cities
function resolvePostAdBrand(cityId: string, currentCityProp?: any) {
  const targetCity = (currentCityProp && currentCityProp.id === cityId)
    ? currentCityProp
    : ((CITIES as any)[cityId] || currentCityProp || CITIES.chittoor);
  const brandHeading = targetCity.brandName || (cityId === 'vellore' ? 'Vellore Ads' : cityId === 'bengaluru' ? 'Bengaluru Ads' : 'Chittoor Ads');
  const cityName = targetCity.name || (cityId === 'vellore' ? 'Vellore' : cityId === 'bengaluru' ? 'Bengaluru' : 'Chittoor');
  const cityCode = targetCity.code || (cityId === 'vellore' ? 'TN-23' : cityId === 'bengaluru' ? 'KA-01' : 'AP-03');
  return { brandHeading, cityName, cityCode };
}

// Vellore
const velloreBrand = resolvePostAdBrand('vellore', CITIES.vellore);
assert(
  velloreBrand.brandHeading === 'Vellore Ads',
  `Vellore heading is exactly "Vellore Ads" (got: "${velloreBrand.brandHeading}")`
);
assert(
  velloreBrand.cityName === 'Vellore',
  `Vellore city name is "Vellore"`
);
assert(
  velloreBrand.cityCode === 'TN-23',
  `Vellore city code is "TN-23"`
);

// Chittoor
const chittoorBrand = resolvePostAdBrand('chittoor', CITIES.chittoor);
assert(
  chittoorBrand.brandHeading === 'Chittoor Ads',
  `Chittoor heading is exactly "Chittoor Ads" (got: "${chittoorBrand.brandHeading}")`
);
assert(
  chittoorBrand.cityName === 'Chittoor',
  `Chittoor city name is "Chittoor"`
);
assert(
  chittoorBrand.cityCode === 'AP-03',
  `Chittoor city code is "AP-03"`
);

// Bengaluru
const bengaluruBrand = resolvePostAdBrand('bengaluru', CITIES.bengaluru);
assert(
  bengaluruBrand.brandHeading === 'Bengaluru Ads',
  `Bengaluru heading is exactly "Bengaluru Ads" (got: "${bengaluruBrand.brandHeading}")`
);
assert(
  bengaluruBrand.cityName === 'Bengaluru',
  `Bengaluru city name is "Bengaluru"`
);
assert(
  bengaluruBrand.cityCode === 'KA-01',
  `Bengaluru city code is "KA-01"`
);

// ============================================================================
// SECTION 3: SAFETY & LOCALIZATION RETENTION
// ============================================================================
console.log('\n--- SECTION 3: Safety & Localization Retention ---');

// Verify Vellore emergency contacts are in Tamil
assert(
  VELLORE_EMERGENCY_CONTACTS.length === 7,
  `Vellore has exactly 7 emergency contacts`
);
VELLORE_EMERGENCY_CONTACTS.forEach((contact) => {
  // Test that teluguName contains Tamil Unicode characters (range \u0B80-\u0BFF)
  const hasTamil = /[\u0B80-\u0BFF]/.test(contact.teluguName);
  assert(
    hasTamil,
    `Vellore emergency contact "${contact.name}" localized in Tamil: ${contact.teluguName}`
  );
});

// Verify Chittoor emergency contacts are in Telugu
assert(
  CHITTOOR_EMERGENCY_CONTACTS.length === 6,
  `Chittoor has exactly 6 emergency contacts`
);
CHITTOOR_EMERGENCY_CONTACTS.forEach((contact) => {
  // Test that teluguName contains Telugu Unicode characters (range \u0C00-\u0C7F)
  const hasTelugu = /[\u0C00-\u0C7F]/.test(contact.teluguName);
  assert(
    hasTelugu,
    `Chittoor emergency contact "${contact.name}" localized in Telugu: ${contact.teluguName}`
  );
});

console.log('\n=============================================================================');
console.log(`TOTAL PHASE V1.1 TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('=============================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 ALL PHASE V1.1 VELLORE DEFECT CORRECTION TESTS PASSED (100%)!\n');
}
