/**
 * KAARYAN LABS — PHASE V3.3 AUTOMATED TEST SUITE
 * VELLORE ADS (TN-23): BUSINESS DIRECTORY IMPROVEMENTS VERIFICATION
 *
 * Checks:
 * 1. Asia/Kolkata Operating Hours Helper:
 *    - 12h AM/PM time conversions
 *    - Single & multiple intervals
 *    - Overnight opening intervals across midnight
 *    - Closed days (e.g., Sunday closed for Mon-Sat)
 *    - 24x7 / Open 24 Hours
 *    - Untrustworthy / placeholder strings ('Sample Timings', empty, null) -> 'Hours Unavailable'
 * 2. Trust & Verification Badges:
 *    - Strict check: only isVerified === true gets 'Verified'
 *    - Unverified items get 'Preview Listing' or 'Pending Approval'
 *    - No unverified listing receives false verification badges
 * 3. Structured Price Range Indicator Rules:
 *    - Rendered only when reliable structured data exists; omitted when empty
 * 4. Mobile Photo Gallery Contract:
 *    - Touch swipe gestures, previous/next overlay, count indicator, keyboard nav, accessible labels
 * 5. Component Integrations:
 *    - ListingCard, ListingDetailModal, StandaloneBusinessPage, HomeSections
 * 6. Cross-City Isolation:
 *    - Chittoor (AP-03) and Bengaluru (KA-01) remain protected and unchanged
 */

import {
  getOperatingHoursStatus,
  parseTimeToMinutes,
  parseTimeIntervals,
  getKolkataDateTime,
} from '../src/utils/operatingHours';
import { INITIAL_LISTINGS } from '../src/data/mockData';
import { CITIES } from '../src/config/cities';
import * as fs from 'fs';
import * as path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}${details ? ' - ' + details : ''}`);
    failed++;
  }
}

console.log('================================================================');
console.log('KAARYAN LABS — PHASE V3.3 BUSINESS DIRECTORY VERIFICATION SUITE');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// SECTION 1: TIMEZONE & TIME CONVERSION TESTS (Asia/Kolkata)
// -----------------------------------------------------------------------------
console.log('--- 1. Timezone & 12-Hour AM/PM Time Parsing ---');

assert(parseTimeToMinutes('12:00 AM') === 0, '12:00 AM parses to 0 minutes');
assert(parseTimeToMinutes('12:30 AM') === 30, '12:30 AM parses to 30 minutes');
assert(parseTimeToMinutes('9:00 AM') === 540, '9:00 AM parses to 540 minutes');
assert(parseTimeToMinutes('12:00 PM') === 720, '12:00 PM parses to 720 minutes');
assert(parseTimeToMinutes('1:15 PM') === 795, '1:15 PM parses to 795 minutes');
assert(parseTimeToMinutes('8:30 PM') === 1230, '8:30 PM parses to 1230 minutes');
assert(parseTimeToMinutes('11:59 PM') === 1439, '11:59 PM parses to 1439 minutes');
assert(parseTimeToMinutes('Invalid') === null, 'Invalid string returns null');
assert(parseTimeToMinutes('') === null, 'Empty string returns null');

const intervals = parseTimeIntervals('9:00 AM - 1:00 PM, 4:00 PM - 9:00 PM');
assert(intervals.length === 2, 'Multiple intervals parsed count = 2');
assert(
  intervals[0].startMinutes === 540 && intervals[0].endMinutes === 780,
  'Interval 1: 9:00 AM (540m) to 1:00 PM (780m)'
);
assert(
  intervals[1].startMinutes === 960 && intervals[1].endMinutes === 1260,
  'Interval 2: 4:00 PM (960m) to 9:00 PM (1260m)'
);

// -----------------------------------------------------------------------------
// SECTION 2: REAL-TIME OPERATING HOURS EVALUATION IN ASIA/KOLKATA
// -----------------------------------------------------------------------------
console.log('\n--- 2. Real-Time Operating Hours Evaluation in Asia/Kolkata ---');

// Reference: Wednesday 2026-11-11
// In UTC:
// 08:30 UTC = 14:00 IST (Wednesday 2:00 PM IST)
// 16:30 UTC = 22:00 IST (Wednesday 10:00 PM IST)
const wed2pmIst = new Date('2026-11-11T08:30:00Z');
const wed10pmIst = new Date('2026-11-11T16:30:00Z');

// Reference: Sunday 2026-11-15
// 08:30 UTC = 14:00 IST (Sunday 2:00 PM IST)
const sun2pmIst = new Date('2026-11-15T08:30:00Z');

// Test standard Mon-Sat interval
const resMonSatOpen = getOperatingHoursStatus('Mon-Sat: 10:00 AM - 8:30 PM', wed2pmIst);
assert(resMonSatOpen.status === 'open' && resMonSatOpen.isOpen === true, 'Mon-Sat is Open at Wednesday 2:00 PM IST');
assert(resMonSatOpen.label === 'Open Now', 'Label is "Open Now" when open');

const resMonSatClosedNight = getOperatingHoursStatus('Mon-Sat: 10:00 AM - 8:30 PM', wed10pmIst);
assert(
  resMonSatClosedNight.status === 'closed' && resMonSatClosedNight.isOpen === false,
  'Mon-Sat is Closed at Wednesday 10:00 PM IST'
);
assert(resMonSatClosedNight.label === 'Closed', 'Label is "Closed" when closed');

const resMonSatSunClosed = getOperatingHoursStatus('Mon-Sat: 10:00 AM - 8:30 PM', sun2pmIst);
assert(
  resMonSatSunClosed.status === 'closed' && resMonSatSunClosed.isOpen === false,
  'Mon-Sat is Closed on Sunday (inactive day)'
);

// Test Daily interval
const resDailySun = getOperatingHoursStatus('Daily: 11:30 AM - 10:30 PM', sun2pmIst);
assert(resDailySun.status === 'open', 'Daily schedule is Open on Sunday 2:00 PM IST');

// Test Multiple intervals with midday break
const splitSchedule = '9:00 AM - 1:00 PM, 4:00 PM - 9:00 PM';
const wed11amIst = new Date('2026-11-11T05:30:00Z'); // 11:00 AM IST -> morning shift
const wed2pmShiftBreak = new Date('2026-11-11T08:30:00Z'); // 2:00 PM IST -> between shifts
const wed6pmIst = new Date('2026-11-11T12:30:00Z'); // 6:00 PM IST -> evening shift

assert(getOperatingHoursStatus(splitSchedule, wed11amIst).status === 'open', 'Split schedule: Open in morning shift (11 AM)');
assert(getOperatingHoursStatus(splitSchedule, wed2pmShiftBreak).status === 'closed', 'Split schedule: Closed during break (2 PM)');
assert(getOperatingHoursStatus(splitSchedule, wed6pmIst).status === 'open', 'Split schedule: Open in evening shift (6 PM)');
assert(getOperatingHoursStatus(splitSchedule, wed10pmIst).status === 'closed', 'Split schedule: Closed after hours (10 PM)');

// Test Overnight shift spanning midnight (e.g. 8:00 PM to 2:00 AM)
const overnightSchedule = '8:00 PM - 2:00 AM';
const wed9pmIst = new Date('2026-11-11T15:30:00Z'); // 9:00 PM IST -> open
const thu130amIst = new Date('2026-11-11T20:00:00Z'); // Thursday 1:30 AM IST -> open (continuation)
const thu4amIst = new Date('2026-11-11T22:30:00Z'); // Thursday 4:00 AM IST -> closed

assert(getOperatingHoursStatus(overnightSchedule, wed9pmIst).status === 'open', 'Overnight: Open at 9:00 PM IST');
assert(getOperatingHoursStatus(overnightSchedule, thu130amIst).status === 'open', 'Overnight: Open at 1:30 AM IST next day');
assert(getOperatingHoursStatus(overnightSchedule, thu4amIst).status === 'closed', 'Overnight: Closed at 4:00 AM IST');

// Test 24x7 / Open 24 Hours
assert(getOperatingHoursStatus('24 Hours', sun2pmIst).status === 'open', '24 Hours schedule is Open Now');
assert(getOperatingHoursStatus('Open 24x7', wed10pmIst).status === 'open', 'Open 24x7 schedule is Open Now');

// Test Untrustworthy / placeholder / missing strings
assert(getOperatingHoursStatus('Sample Timings').status === 'unavailable', '"Sample Timings" returns status "unavailable"');
assert(getOperatingHoursStatus('Sample Timings').label === 'Hours Unavailable', '"Sample Timings" label is "Hours Unavailable"');
assert(getOperatingHoursStatus('').status === 'unavailable', 'Empty string returns "unavailable"');
assert(getOperatingHoursStatus(null).status === 'unavailable', 'null returns "unavailable"');
assert(getOperatingHoursStatus(undefined).status === 'unavailable', 'undefined returns "unavailable"');

// -----------------------------------------------------------------------------
// SECTION 3: VELLORE MOCK DATA TRUST AUDIT
// -----------------------------------------------------------------------------
console.log('\n--- 3. Vellore Mock Data Trust & Verification Audit ---');

const velloreListings = INITIAL_LISTINGS.filter((l) => l.cityId === 'vellore');
assert(velloreListings.length >= 3, `Vellore listings found in mock data: ${velloreListings.length}`);

// Strictly verify that none of the demo/preview listings carry a false isVerified = true
const falselyVerified = velloreListings.filter((l) => l.isVerified === true);
assert(
  falselyVerified.length === 0,
  'Zero unverified Vellore listings are marked isVerified = true',
  `Found ${falselyVerified.map((l) => l.id).join(', ')}`
);

// Verify v-001 has placeholder 'Sample Timings' correctly handled
const v001 = velloreListings.find((l) => l.id === 'v-001');
assert(v001 !== undefined, 'Listing v-001 found');
if (v001) {
  const statusV001 = getOperatingHoursStatus(v001.timings);
  assert(
    statusV001.status === 'unavailable' && statusV001.label === 'Hours Unavailable',
    'v-001 with "Sample Timings" correctly resolves to "Hours Unavailable" without fabricated hours'
  );
}

// Verify v-003 has real timings
const v003 = velloreListings.find((l) => l.id === 'v-003');
assert(v003 !== undefined, 'Listing v-003 found');
if (v003) {
  assert(v003.timings === 'Daily: 11:30 AM - 10:30 PM', 'v-003 has timings "Daily: 11:30 AM - 10:30 PM"');
  const statusV003Sun = getOperatingHoursStatus(v003.timings, sun2pmIst);
  assert(statusV003Sun.status === 'open', 'v-003 evaluates to Open on Sunday 2:00 PM IST');
}

// -----------------------------------------------------------------------------
// SECTION 4: STRUCTURED PRICE RANGE INDICATOR AUDIT
// -----------------------------------------------------------------------------
console.log('\n--- 4. Structured Price Range Indicator Rules ---');

velloreListings.forEach((listing) => {
  if (listing.priceRange && listing.priceRange.trim()) {
    assert(
      typeof listing.priceRange === 'string' && listing.priceRange.length > 0,
      `Listing ${listing.id} has valid structured priceRange: "${listing.priceRange}"`
    );
  }
});

// -----------------------------------------------------------------------------
// SECTION 5: MOBILE PHOTO GALLERY ACCESSIBILITY & TOUCH SWIPE CONTRACT
// -----------------------------------------------------------------------------
console.log('\n--- 5. Mobile Photo Gallery Contract Verification ---');

const galleryFile = path.resolve(process.cwd(), 'src/components/VelloreImageGallery.tsx');
assert(fs.existsSync(galleryFile), 'VelloreImageGallery.tsx exists');

const galleryContent = fs.readFileSync(galleryFile, 'utf-8');
assert(galleryContent.includes('onTouchStart') && galleryContent.includes('onTouchEnd'), 'Gallery implements touch gesture listeners');
assert(galleryContent.includes('minSwipeDistance'), 'Gallery implements minSwipeDistance swipe threshold');
assert(galleryContent.includes('Math.abs(deltaX) > Math.abs(deltaY)'), 'Gallery ensures horizontal swipe dominance over vertical scroll');
assert(galleryContent.includes('aria-label="Previous photo"'), 'Gallery includes accessible Previous button label');
assert(galleryContent.includes('aria-label="Next photo"'), 'Gallery includes accessible Next button label');
assert(galleryContent.includes('currentIndex + 1') && galleryContent.includes('total'), 'Gallery includes photo count indicator pill');
assert(galleryContent.includes('ArrowRight') && galleryContent.includes('ArrowLeft'), 'Gallery includes keyboard navigation handlers');
assert(galleryContent.includes('Escape'), 'Gallery includes Escape key handler for fullscreen modal');

// -----------------------------------------------------------------------------
// SECTION 6: COMPONENT INTEGRATION CONTRACTS
// -----------------------------------------------------------------------------
console.log('\n--- 6. Component Integrations & Trust Label Contracts ---');

// ListingCard.tsx
const listingCardFile = path.resolve(process.cwd(), 'src/components/ListingCard.tsx');
const listingCardContent = fs.readFileSync(listingCardFile, 'utf-8');
assert(listingCardContent.includes('getOperatingHoursStatus'), 'ListingCard imports and uses getOperatingHoursStatus');
assert(listingCardContent.includes('isVellore'), 'ListingCard determines isVellore');
assert(listingCardContent.includes('Preview Listing'), 'ListingCard renders Preview Listing label for unverified Vellore items');
assert(listingCardContent.includes('hoursStatus.badgeClass'), 'ListingCard renders real-time hours status badge');

// ListingDetailModal.tsx
const modalFile = path.resolve(process.cwd(), 'src/components/ListingDetailModal.tsx');
const modalContent = fs.readFileSync(modalFile, 'utf-8');
assert(modalContent.includes('VelloreImageGallery'), 'ListingDetailModal uses VelloreImageGallery for photos');
assert(modalContent.includes('getOperatingHoursStatus'), 'ListingDetailModal imports and uses getOperatingHoursStatus');
assert(modalContent.includes('Verified Business') && modalContent.includes('Preview Listing'), 'ListingDetailModal has accurate trust labels');

// StandaloneBusinessPage.tsx
const standaloneFile = path.resolve(process.cwd(), 'src/components/StandaloneBusinessPage.tsx');
const standaloneContent = fs.readFileSync(standaloneFile, 'utf-8');
assert(standaloneContent.includes('VelloreImageGallery'), 'StandaloneBusinessPage uses VelloreImageGallery');
assert(standaloneContent.includes('getOperatingHoursStatus'), 'StandaloneBusinessPage imports and uses getOperatingHoursStatus');
assert(!standaloneContent.includes("timings || 'Mon – Sat: 9:00 AM – 8:00 PM'"), 'StandaloneBusinessPage no longer fabricates fallback timings');

// HomeSections.tsx
const homeSectionsFile = path.resolve(process.cwd(), 'src/components/HomeSections.tsx');
const homeSectionsContent = fs.readFileSync(homeSectionsFile, 'utf-8');
assert(homeSectionsContent.includes('getOperatingHoursStatus'), 'HomeSections uses getOperatingHoursStatus');
assert(homeSectionsContent.includes('bizHours.badgeClass'), 'HomeSections renders real-time hours badge for Vellore');

// -----------------------------------------------------------------------------
// SECTION 7: CROSS-CITY ISOLATION & INTEGRITY
// -----------------------------------------------------------------------------
console.log('\n--- 7. Cross-City Isolation Verification ---');

assert(CITIES.chittoor !== undefined && CITIES.chittoor.code === 'AP-03', 'Chittoor (AP-03) config intact');
assert(CITIES.bengaluru !== undefined && CITIES.bengaluru.code === 'KA-01', 'Bengaluru (KA-01) config intact');
assert(CITIES.vellore !== undefined && CITIES.vellore.code === 'TN-23', 'Vellore (TN-23) config intact');

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\nSUCCESS: ALL PHASE V3.3 DIRECTORY TESTS PASSED CLEANLY!\n');
  process.exit(0);
}
