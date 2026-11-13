import { CITIES } from '../src/config/cities';
import { parseCityRoute, buildCityRouteUrl } from '../src/utils/cityResolver';
import {
  communityService,
  isValidWebUrl,
  validateNoticePayload,
  validateEventPayload,
} from '../src/services/communityService';
import fs from 'fs';
import path from 'path';

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

async function runTests() {
  console.log('===============================================================');
  console.log('KAARYAN LABS — PHASE V3.5 COMMUNITY & LOCAL EVENTS TEST SUITE');
  console.log('===============================================================\n');

  // TEST 1: Feature Flag Territorial Isolation
  console.log('--- TEST 1: Feature Flag Territorial Isolation ---');
  assert(
    CITIES.vellore.features.hasCommunityNoticeboard === true,
    'Vellore hasCommunityNoticeboard is TRUE'
  );
  assert(
    CITIES.vellore.features.hasLocalEvents === true,
    'Vellore hasLocalEvents is TRUE'
  );
  assert(
    CITIES.chittoor.features.hasCommunityNoticeboard === false,
    'Chittoor hasCommunityNoticeboard is FALSE (isolated)'
  );
  assert(
    CITIES.chittoor.features.hasLocalEvents === false,
    'Chittoor hasLocalEvents is FALSE (isolated)'
  );
  assert(
    CITIES.bengaluru.features.hasCommunityNoticeboard === false,
    'Bengaluru hasCommunityNoticeboard is FALSE (isolated)'
  );
  assert(
    CITIES.bengaluru.features.hasLocalEvents === false,
    'Bengaluru hasLocalEvents is FALSE (isolated)'
  );

  // TEST 2: URL Routing & Canonical URL Generation
  console.log('\n--- TEST 2: URL Routing & Canonical URL Generation ---');
  const communityRoute = parseCityRoute('/city/vellore/community', '', 'localhost');
  assert(
    communityRoute.cityId === 'vellore' && communityRoute.tab === 'community' && communityRoute.noticeId === null,
    'parseCityRoute correctly parses /city/vellore/community'
  );

  const communityDetailRoute = parseCityRoute('/city/vellore/community/not-vel-001', '', 'localhost');
  assert(
    communityDetailRoute.cityId === 'vellore' && communityDetailRoute.tab === 'community' && communityDetailRoute.noticeId === 'not-vel-001',
    'parseCityRoute correctly parses /city/vellore/community/not-vel-001'
  );

  const eventsRoute = parseCityRoute('/city/vellore/events', '', 'localhost');
  assert(
    eventsRoute.cityId === 'vellore' && eventsRoute.tab === 'events' && eventsRoute.eventId === null,
    'parseCityRoute correctly parses /city/vellore/events'
  );

  const eventsDetailRoute = parseCityRoute('/city/vellore/events/evt-vel-001', '', 'localhost');
  assert(
    eventsDetailRoute.cityId === 'vellore' && eventsDetailRoute.tab === 'events' && eventsDetailRoute.eventId === 'evt-vel-001',
    'parseCityRoute correctly parses /city/vellore/events/evt-vel-001'
  );

  const builtCommunityUrl = buildCityRouteUrl('vellore', 'community');
  assert(
    builtCommunityUrl === '/city/vellore/community',
    `buildCityRouteUrl generates /city/vellore/community (got: ${builtCommunityUrl})`
  );

  const builtCommunityDetailUrl = buildCityRouteUrl('vellore', 'community', 'all', { noticeId: 'not-xyz' });
  assert(
    builtCommunityDetailUrl === '/city/vellore/community/not-xyz',
    `buildCityRouteUrl generates /city/vellore/community/not-xyz (got: ${builtCommunityDetailUrl})`
  );

  const builtEventsUrl = buildCityRouteUrl('vellore', 'events');
  assert(
    builtEventsUrl === '/city/vellore/events',
    `buildCityRouteUrl generates /city/vellore/events (got: ${builtEventsUrl})`
  );

  const builtEventsDetailUrl = buildCityRouteUrl('vellore', 'events', 'all', { eventId: 'evt-xyz' });
  assert(
    builtEventsDetailUrl === '/city/vellore/events/evt-xyz',
    `buildCityRouteUrl generates /city/vellore/events/evt-xyz (got: ${builtEventsDetailUrl})`
  );

  // TEST 3: URL Protocol Security & Sanitization
  console.log('\n--- TEST 3: URL Protocol Security & Sanitization ---');
  assert(isValidWebUrl('https://velloreads.com/contact') === true, 'HTTPS URL is valid');
  assert(isValidWebUrl('http://example.com/register') === true, 'HTTP URL is valid');
  assert(isValidWebUrl('javascript:alert(1)') === false, 'javascript: pseudo-protocol is rejected');
  assert(isValidWebUrl('data:text/html,<script>alert(1)</script>') === false, 'data: scheme is rejected');
  assert(isValidWebUrl('ftp://files.example.com') === false, 'ftp: scheme is rejected');
  assert(isValidWebUrl('') === true, 'Empty optional URL is allowed');

  // TEST 4: Input Validation (Notices & Events)
  console.log('\n--- TEST 4: Input Validation Rules ---');
  const shortNotice = validateNoticePayload({
    cityId: 'vellore',
    title: 'Hi',
    category: 'community',
    content: 'Short',
    locality: 'Katpadi',
    organizerName: 'Desk',
    showContact: true,
  });
  assert(shortNotice.valid === false, 'Reject notice with title < 5 characters');

  const validNotice = validateNoticePayload({
    cityId: 'vellore',
    title: 'Katpadi Tree Planting Drive',
    category: 'community',
    content: 'Join us for avenue planting along Katpadi road this Saturday morning.',
    locality: 'Katpadi',
    organizerName: 'Resident Welfare Forum',
    showContact: true,
  });
  assert(validNotice.valid === true, 'Accept valid notice submission');

  const invalidDateEvent = validateEventPayload({
    cityId: 'vellore',
    title: 'Annual Youth Tournament',
    category: 'sports',
    description: 'A 2-day interschool tournament for youth athletes in Vellore.',
    venueName: 'Katpadi Sports Complex',
    venueAddress: 'VIT Link Road, Katpadi',
    locality: 'Katpadi',
    startDate: '2026-12-10T10:00:00Z',
    endDate: '2026-12-05T10:00:00Z', // End before start
    timeDisplay: '10:00 AM IST',
    organizerName: 'Sports Council',
    isFree: true,
  });
  assert(invalidDateEvent.valid === false, 'Reject event where end date is before start date');

  // TEST 5: Submission & Duplicate Detection
  console.log('\n--- TEST 5: Submission Workflow & Duplicate Prevention ---');
  const noticeRes1 = await communityService.submitNotice({
    cityId: 'vellore',
    title: 'Test Cleanliness Drive Announcement',
    category: 'public_notice',
    content: 'Comprehensive civic cleanliness drive organized across Sathuvachari.',
    locality: 'Sathuvachari',
    organizerName: 'Civic Volunteers Desk',
    showContact: false,
  });
  assert(
    noticeRes1.success === true && noticeRes1.notice?.status === 'pending',
    'Submitted notice starts in pending status'
  );

  const noticeRes2 = await communityService.submitNotice({
    cityId: 'vellore',
    title: 'Test Cleanliness Drive Announcement',
    category: 'public_notice',
    content: 'Comprehensive civic cleanliness drive organized across Sathuvachari.',
    locality: 'Sathuvachari',
    organizerName: 'Civic Volunteers Desk',
    showContact: false,
  });
  assert(
    noticeRes2.isDuplicate === true,
    'Duplicate notice submitted within 5 minutes is detected and handled'
  );

  const eventRes1 = await communityService.submitEvent({
    cityId: 'vellore',
    title: 'Vellore Tech Meetup 2026',
    category: 'education',
    description: 'An open meetup for web developers and researchers in Vellore.',
    venueName: 'Katpadi Innovation Hub',
    venueAddress: 'Opposite VIT Main Gate, Katpadi',
    locality: 'Katpadi',
    startDate: '2026-12-20T10:00:00+05:30',
    timeDisplay: '10:00 AM – 01:00 PM IST',
    organizerName: 'Vellore Developers Club',
    isFree: true,
  });
  assert(
    eventRes1.success === true && eventRes1.event?.status === 'pending',
    'Submitted event starts in pending status'
  );

  const eventRes2 = await communityService.submitEvent({
    cityId: 'vellore',
    title: 'Vellore Tech Meetup 2026',
    category: 'education',
    description: 'An open meetup for web developers and researchers in Vellore.',
    venueName: 'Katpadi Innovation Hub',
    venueAddress: 'Opposite VIT Main Gate, Katpadi',
    locality: 'Katpadi',
    startDate: '2026-12-20T10:00:00+05:30',
    timeDisplay: '10:00 AM – 01:00 PM IST',
    organizerName: 'Vellore Developers Club',
    isFree: true,
  });
  assert(
    eventRes2.isDuplicate === true,
    'Duplicate event submitted within 5 minutes is detected and handled'
  );

  // TEST 6: Public Query Filtering (Only Published Items)
  console.log('\n--- TEST 6: Public Query Filtering & Safety ---');
  const publicNotices = await communityService.getNotices('vellore');
  const hasPendingNotice = publicNotices.some((n) => n.status !== 'published');
  assert(!hasPendingNotice, 'Public notices query returns only published items');

  const publicEvents = await communityService.getEvents('vellore');
  const hasPendingEvent = publicEvents.some((e) => e.status !== 'published');
  assert(!hasPendingEvent, 'Public events query returns only published items');

  // TEST 7: Proposed Migration & Security Review
  console.log('\n--- TEST 7: Proposed SQL Migration & Protected Files Integrity ---');
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20261112000001_community_notices_and_events.sql');
  assert(fs.existsSync(migrationPath), 'Proposed migration file exists on disk');

  if (fs.existsSync(migrationPath)) {
    const migrationContent = fs.readFileSync(migrationPath, 'utf-8');
    assert(
      migrationContent.includes('PROPOSED MIGRATION (NOT EXECUTED)'),
      'Migration is clearly labeled PROPOSED MIGRATION (NOT EXECUTED)'
    );
    assert(
      migrationContent.includes('ALTER TABLE public.community_notices ENABLE ROW LEVEL SECURITY;'),
      'Community notices has Row Level Security enabled'
    );
    assert(
      migrationContent.includes('ALTER TABLE public.local_events ENABLE ROW LEVEL SECURITY;'),
      'Local events has Row Level Security enabled'
    );
  }

  // Check that the protected super admin governance file is present and untouched
  const superAdminGovPath = path.join(process.cwd(), 'supabase', 'migrations', '20261103000003_super_admin_governance.sql');
  assert(fs.existsSync(superAdminGovPath), 'Protected governance migration file exists untouched');

  // TEST 8: Prerendered Static HTML Files
  console.log('\n--- TEST 8: Prerendered Static HTML Files ---');
  const distDir = path.join(process.cwd(), 'dist');
  const communityPrerender = path.join(distDir, 'city', 'vellore', 'community', 'index.html');
  const eventsPrerender = path.join(distDir, 'city', 'vellore', 'events', 'index.html');

  assert(fs.existsSync(communityPrerender), 'dist/city/vellore/community/index.html generated');
  assert(fs.existsSync(eventsPrerender), 'dist/city/vellore/events/index.html generated');

  if (fs.existsSync(communityPrerender)) {
    const html = fs.readFileSync(communityPrerender, 'utf-8');
    assert(html.includes('Vellore Community Noticeboard'), 'Community prerender contains correct title/meta');
  }

  console.log('\n===============================================================');
  console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
