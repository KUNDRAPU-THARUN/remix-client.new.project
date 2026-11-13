/**
 * KAARYAN LABS — PHASE V3.6.2 TOURISM DATA MODEL & SERVICE LAYER VERIFICATION SUITE
 * Targets:
 * 1. Correct tourism types
 * 2. Six existing destination records
 * 3. Unique slug validation
 * 4. City isolation (strict Vellore TN-23 confinement)
 * 5. Category filtering
 * 6. Keyword search
 * 7. Empty result handling
 * 8. Unknown slug handling
 * 9. Featured attraction selection
 * 10. Unpublished-content exclusion
 * 11. Invalid location handling
 * 12. Verification metadata integrity
 * 13. Existing attractions compatibility
 */

import { tourismService } from '../src/services/tourismService';
import {
  PUBLISHED_VELLORE_ATTRACTIONS,
  VELLORE_TOURISM_CATEGORIES,
  VELLORE_TOURISM_RESEARCH_BACKLOG,
  ALL_VELLORE_ATTRACTIONS,
} from '../src/data/velloreTourismData';
import {
  TourismAttraction,
  TourismCategory,
  TourismCategoryDefinition,
} from '../src/types/tourism';

let testCount = 0;
let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(`  ✅ PASS [${testCount}]: ${testName}`);
  } else {
    failCount++;
    console.error(`  ❌ FAIL [${testCount}]: ${testName}${detail ? ` -> ${detail}` : ''}`);
  }
}

async function runTestSuite() {
  console.log('======================================================================');
  console.log('KAARYAN LABS — PHASE V3.6.2 VELLORE TOURISM DATA & SERVICE TEST SUITE');
  console.log('======================================================================\n');

  // --- SECTION 1: TYPESCRIPT TOURISM TYPE CONFORMANCE ---
  console.log('--- SECTION 1: TypeScript Tourism Type Conformance ---');
  assert(
    Array.isArray(VELLORE_TOURISM_CATEGORIES) && VELLORE_TOURISM_CATEGORIES.length >= 5,
    'VELLORE_TOURISM_CATEGORIES is an array with at least 5 standard categories',
    `Found ${VELLORE_TOURISM_CATEGORIES.length}`
  );

  const categoryIds = VELLORE_TOURISM_CATEGORIES.map((c) => c.id);
  const requiredCategories: TourismCategory[] = [
    'historic_fort',
    'pilgrimage_temple',
    'nature_hills',
    'colonial_heritage',
    'museums_culture',
  ];
  for (const rc of requiredCategories) {
    assert(categoryIds.includes(rc), `Category definition exists for "${rc}"`);
  }

  // --- SECTION 2: SIX EXISTING DESTINATION RECORDS ---
  console.log('\n--- SECTION 2: Six Existing Destination Records ---');
  const published = await tourismService.getTourismAttractions('vellore');
  assert(
    published.length === 6,
    `Published attractions count equals exactly 6 (found ${published.length})`
  );

  const expectedSlugs = [
    'vellore-fort-and-moat',
    'sripuram-golden-temple',
    'jalakandeswarar-temple',
    'cmc-heritage-campus',
    'palamathi-hills-otteri-viewpoint',
    'st-johns-church-fort',
  ];
  for (const expSlug of expectedSlugs) {
    const found = published.find((a) => a.slug === expSlug);
    assert(Boolean(found), `Baseline attraction with slug "${expSlug}" exists in published data`);
    if (found) {
      assert(found.cityId === 'vellore', `Attraction "${expSlug}" has cityId === "vellore"`);
      assert(found.title.trim().length > 3, `Attraction "${expSlug}" has valid title: ${found.title}`);
      assert(found.nameNative.trim().length > 2, `Attraction "${expSlug}" has native Tamil title: ${found.nameNative}`);
      assert(found.heroImage.startsWith('http'), `Attraction "${expSlug}" has valid heroImage URL`);
      assert(found.location.directionsUrl.includes('maps.google.com'), `Attraction "${expSlug}" has valid Google Maps URL`);
    }
  }

  // --- SECTION 3: UNIQUE SLUG & ID VALIDATION ---
  console.log('\n--- SECTION 3: Unique Slug & ID Validation ---');
  const allIds = ALL_VELLORE_ATTRACTIONS.map((a) => a.id);
  const uniqueIds = new Set(allIds);
  assert(allIds.length === uniqueIds.size, 'All attraction IDs across entire dataset are unique', `Count: ${allIds.length}`);

  const allSlugs = ALL_VELLORE_ATTRACTIONS.map((a) => a.slug);
  const uniqueSlugs = new Set(allSlugs);
  assert(allSlugs.length === uniqueSlugs.size, 'All attraction slugs across entire dataset are unique', `Count: ${allSlugs.length}`);

  // URL safety check for slugs (lowercase letters, numbers, hyphens only)
  const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  let allSlugsValid = true;
  for (const slug of allSlugs) {
    if (!slugRegex.test(slug)) {
      allSlugsValid = false;
      console.error(`Invalid slug format: ${slug}`);
    }
  }
  assert(allSlugsValid, 'All slugs match URL-safe kebab-case regex format');

  // --- SECTION 4: STRICT CITY CONFINEMENT & ISOLATION ---
  console.log('\n--- SECTION 4: Strict City Confinement & Isolation ---');
  // Chittoor isolation
  const chittoorAttractions = await tourismService.getTourismAttractions('chittoor');
  assert(
    chittoorAttractions.length === 0,
    'tourismService.getTourismAttractions("chittoor") returns empty array [] (isolated)'
  );

  // Bengaluru isolation
  const bengaluruAttractions = await tourismService.getTourismAttractions('bengaluru');
  assert(
    bengaluruAttractions.length === 0,
    'tourismService.getTourismAttractions("bengaluru") returns empty array [] (isolated)'
  );

  // Cross-city slug lookup isolation
  const crossCitySlug = await tourismService.getTourismAttractionBySlug('vellore-fort-and-moat', 'chittoor');
  assert(
    crossCitySlug === null,
    'tourismService.getTourismAttractionBySlug for non-Vellore city returns null'
  );

  // Cross-city search isolation
  const crossCitySearch = await tourismService.searchTourismAttractions('temple', {}, 'bengaluru');
  assert(
    crossCitySearch.length === 0,
    'tourismService.searchTourismAttractions for non-Vellore city returns empty array []'
  );

  // --- SECTION 5: CATEGORY FILTERING & DYNAMIC COUNTS ---
  console.log('\n--- SECTION 5: Category Filtering & Dynamic Counts ---');
  const categoriesWithCounts = await tourismService.getTourismCategories('vellore');
  assert(
    categoriesWithCounts.length === VELLORE_TOURISM_CATEGORIES.length,
    `getTourismCategories returns all ${VELLORE_TOURISM_CATEGORIES.length} category metadata definitions`
  );

  let totalComputedCount = 0;
  for (const cat of categoriesWithCounts) {
    totalComputedCount += cat.count;
    // Check filter method matches the count
    const filtered = await tourismService.searchTourismAttractions('', { category: cat.category.id }, 'vellore');
    assert(
      filtered.length === cat.count,
      `Category "${cat.category.label}" computed count (${cat.count}) matches filtered query count (${filtered.length})`
    );
  }
  assert(
    totalComputedCount === published.length,
    `Sum of dynamic category counts (${totalComputedCount}) equals total published count (${published.length})`
  );

  // --- SECTION 6: KEYWORD SEARCH ---
  console.log('\n--- SECTION 6: Keyword Search ---');
  // Exact name search
  const fortSearch = await tourismService.searchTourismAttractions('Vellore Fort', {}, 'vellore');
  assert(
    fortSearch.length >= 1 && fortSearch[0].slug === 'vellore-fort-and-moat',
    'Search for "Vellore Fort" finds Vellore Fort as primary result'
  );

  // Tamil native name search
  const tamilSearch = await tourismService.searchTourismAttractions('பொற்கோயில்', {}, 'vellore');
  assert(
    tamilSearch.length >= 1 && tamilSearch[0].slug === 'sripuram-golden-temple',
    'Search by native Tamil keyword "பொற்கோயில்" successfully matches Sripuram Golden Temple'
  );

  // Substring / descriptive token search ("moat")
  const moatSearch = await tourismService.searchTourismAttractions('moat', {}, 'vellore');
  assert(
    moatSearch.length >= 1 && moatSearch.some((a) => a.slug === 'vellore-fort-and-moat'),
    'Search for "moat" matches Vellore Fort & Moat'
  );

  // Highlight keyword search ("100-pillar")
  const pillarSearch = await tourismService.searchTourismAttractions('100-pillar', {}, 'vellore');
  assert(
    pillarSearch.length >= 1 && pillarSearch[0].slug === 'jalakandeswarar-temple',
    'Search for highlight "100-pillar" matches Jalakandeswarar Temple'
  );

  // Mixed-case and whitespace trimming
  const trimSearch = await tourismService.searchTourismAttractions('   PALAMATHI    ', {}, 'vellore');
  assert(
    trimSearch.length >= 1 && trimSearch[0].slug === 'palamathi-hills-otteri-viewpoint',
    'Search query with excessive whitespace and uppercase normalizes and matches Palamathi Hills'
  );

  // --- SECTION 7: EMPTY & NO-MATCH SEARCH HANDLING ---
  console.log('\n--- SECTION 7: Empty & No-Match Search Handling ---');
  const emptyQuery = await tourismService.searchTourismAttractions('', {}, 'vellore');
  assert(
    emptyQuery.length === published.length,
    'Empty query string returns all published attractions'
  );

  const noMatch = await tourismService.searchTourismAttractions('nonexistentlandxyz12345', {}, 'vellore');
  assert(
    noMatch.length === 0,
    'Non-matching query returns clean empty array []'
  );

  // --- SECTION 8: UNKNOWN & INVALID SLUG HANDLING ---
  console.log('\n--- SECTION 8: Unknown & Invalid Slug Handling ---');
  const unknownSlug = await tourismService.getTourismAttractionBySlug('unknown-fake-monument', 'vellore');
  assert(unknownSlug === null, 'Query for unknown slug returns null');

  const emptySlug = await tourismService.getTourismAttractionBySlug('', 'vellore');
  assert(emptySlug === null, 'Query for empty slug returns null');

  // --- SECTION 9: FEATURED ATTRACTIONS SELECTION ---
  console.log('\n--- SECTION 9: Featured Attractions Selection ---');
  const featured = await tourismService.getFeaturedTourismAttractions('vellore');
  assert(featured.length > 0, `getFeaturedTourismAttractions returns featured attractions (found ${featured.length})`);
  assert(
    featured.every((a) => a.isFeatured === true && a.publicationStatus === 'published'),
    'All returned featured attractions have isFeatured === true and publicationStatus === "published"'
  );

  // --- SECTION 10: UNPUBLISHED & DRAFT EXCLUSION ---
  console.log('\n--- SECTION 10: Unpublished & Draft Content Exclusion ---');
  assert(
    VELLORE_TOURISM_RESEARCH_BACKLOG.length >= 4,
    `Research backlog contains at least 4 draft attractions (found ${VELLORE_TOURISM_RESEARCH_BACKLOG.length})`
  );
  assert(
    VELLORE_TOURISM_RESEARCH_BACKLOG.every((a) => a.publicationStatus === 'draft'),
    'All items in research backlog are marked as publicationStatus === "draft"'
  );

  // Verify no draft items appear in public getTourismAttractions
  const draftSlugs = VELLORE_TOURISM_RESEARCH_BACKLOG.map((a) => a.slug);
  const leakedDrafts = published.filter((a) => draftSlugs.includes(a.slug));
  assert(
    leakedDrafts.length === 0,
    'Zero draft research backlog items appear in public getTourismAttractions()'
  );

  // Verify looking up a draft slug via getTourismAttractionBySlug returns null
  const draftLookup = await tourismService.getTourismAttractionBySlug(draftSlugs[0], 'vellore');
  assert(
    draftLookup === null,
    `Draft attraction slug "${draftSlugs[0]}" cannot be accessed via public getTourismAttractionBySlug()`
  );

  // --- SECTION 11: INVALID LOCATION HANDLING ---
  console.log('\n--- SECTION 11: Invalid Location Handling ---');
  const invalidLocalityFilter = await tourismService.searchTourismAttractions(
    '',
    { locality: 'NonexistentLocality99' },
    'vellore'
  );
  assert(
    invalidLocalityFilter.length === 0,
    'Filtering by nonexistent locality returns clean empty array []'
  );

  // --- SECTION 12: VERIFICATION METADATA INTEGRITY ---
  console.log('\n--- SECTION 12: Verification Metadata Integrity ---');
  for (const att of published) {
    assert(
      att.contentVerificationStatus === 'verified' || att.contentVerificationStatus === 'partially_verified',
      `Attraction "${att.title}" has explicit verification status ("${att.contentVerificationStatus}")`
    );
    assert(
      Array.isArray(att.sourceReferences) && att.sourceReferences.length > 0,
      `Attraction "${att.title}" cites authoritative source references (${att.sourceReferences.join(', ')})`
    );
    assert(
      att.visitorInformation.timings.trim().length > 0,
      `Attraction "${att.title}" has non-empty visitor timings`
    );
    assert(
      ['free', 'paid', 'partially_paid', 'unverified'].includes(att.visitorInformation.entryFeeType),
      `Attraction "${att.title}" has typed entryFeeType: "${att.visitorInformation.entryFeeType}"`
    );
    assert(
      att.images.every((img) => typeof img.isStockPhoto === 'boolean'),
      `Attraction "${att.title}" images explicitly declare isStockPhoto boolean`
    );
  }

  // Specific check for CMC Hospital (must not be presented as open tourist facility without disclaimer)
  const cmc = published.find((a) => a.slug === 'cmc-heritage-campus');
  assert(Boolean(cmc), 'CMC Heritage Campus record exists');
  if (cmc) {
    assert(
      Boolean(cmc.fullDescription.includes('VISITOR NOTICE') || cmc.visitorInformation.visitorNotes?.includes('clinical')),
      'CMC Hospital has explicit clinical visitor notice clarifying public heritage access is limited to memorial/chapel'
    );
  }

  // --- SECTION 13: RELATED ATTRACTIONS LOGIC ---
  console.log('\n--- SECTION 13: Related Attractions Logic ---');
  const relatedToFort = await tourismService.getRelatedTourismAttractions('vel-att-001', 3, 'vellore');
  assert(
    relatedToFort.length > 0 && relatedToFort.length <= 3,
    `getRelatedTourismAttractions returns up to 3 related attractions (found ${relatedToFort.length})`
  );
  assert(
    !relatedToFort.some((a) => a.id === 'vel-att-001'),
    'Related attractions list excludes the target attraction itself'
  );

  // Summary
  console.log('\n======================================================================');
  console.log(`TOTAL TOURISM CHECKS: ${testCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log('======================================================================\n');

  if (failCount > 0) {
    process.exitCode = 1;
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite failed with unhandled error:', err);
  process.exit(1);
});
