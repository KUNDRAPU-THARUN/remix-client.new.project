import { CITIES } from '../src/config/cities';
import {
  communityService,
  isValidWebUrl,
  validateNoticePayload,
  validateEventPayload,
} from '../src/services/communityService';
import { getSupabaseClient, isSupabaseConfigured } from '../src/lib/supabase';
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

async function runStagingVerification() {
  console.log('========================================================================');
  console.log('KAARYAN LABS — PHASE V3.5.1 STAGING & DATABASE VERIFICATION SUITE');
  console.log('========================================================================\n');

  // SECTION 1: Environment & Migration Audit
  console.log('--- SECTION 1: Environment & Migration Audit ---');
  const envPath = path.join(process.cwd(), '.env.local');
  assert(fs.existsSync(envPath), '.env.local exists on local disk');

  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  }

  const isStagingEnv = envContent.includes('tbwtxnszyddvpgqvxwow');
  const isProdEnv = envContent.includes('gpqbppjqqndzuvksrtjb');
  console.log(`  ℹ️ Configured Supabase Target: ${isStagingEnv ? 'STAGING (tbwtxnszyddvpgqvxwow)' : isProdEnv ? 'PRODUCTION/DEV (gpqbppjqqndzuvksrtjb)' : 'UNKNOWN'}`);
  
  if (isProdEnv) {
    console.log('  🛡️ Production Write Rule: Live remote write tests blocked in local audit.');
  }

  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20261112000001_community_notices_and_events.sql');
  assert(fs.existsSync(migrationPath), 'Migration 20261112000001_community_notices_and_events.sql exists');

  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
  assert(
    migrationSql.includes('CREATE TABLE IF NOT EXISTS public.community_notices'),
    'Migration defines public.community_notices table'
  );
  assert(
    migrationSql.includes('CREATE TABLE IF NOT EXISTS public.local_events'),
    'Migration defines public.local_events table'
  );
  assert(
    migrationSql.includes('REFERENCES public.cities(id) ON DELETE RESTRICT'),
    'Migration enforces foreign key integrity to public.cities(id)'
  );
  assert(
    migrationSql.includes('GRANT INSERT ON TABLE public.community_notices TO anon') ||
    migrationSql.includes('GRANT SELECT, INSERT ON TABLE public.community_notices TO anon'),
    'Migration specifies PostgREST API role grants for notices'
  );
  assert(
    migrationSql.includes('GRANT SELECT, INSERT ON TABLE public.local_events TO anon'),
    'Migration specifies PostgREST API role grants for events'
  );
  assert(
    migrationSql.includes('ALTER TABLE public.community_notices ENABLE ROW LEVEL SECURITY;'),
    'Row Level Security enabled on public.community_notices'
  );
  assert(
    migrationSql.includes('ALTER TABLE public.local_events ENABLE ROW LEVEL SECURITY;'),
    'Row Level Security enabled on public.local_events'
  );
  assert(
    migrationSql.includes('public.has_role(auth.uid(), \'super_admin\')'),
    'RLS policy references server-side public.has_role for Super Admin'
  );
  assert(
    migrationSql.includes('public.is_vellore_franchise') ||
    migrationSql.includes('public.has_role(auth.uid(), \'city_franchise\', city_id)'),
    'RLS policy references territory-scoped franchise validation'
  );

  // SECTION 2: Complete Notice Lifecycle Simulation
  console.log('\n--- SECTION 2: Notice Lifecycle Simulation (Create -> Moderate -> Publish) ---');
  const testNoticePayload = {
    cityId: 'vellore' as const,
    title: 'Staging Test Blood Donation Drive Announcement',
    category: 'community' as const,
    content: 'Comprehensive blood donation drive for CMC and Government Medical College hospitals in Vellore.',
    locality: 'Bagayam',
    organizerName: 'Red Cross Youth Wing Vellore',
    contactPhone: '+91 81899 85559',
    contactEmail: 'info@velloreads.com',
    showContact: true,
  };

  // Step A: Submission
  const submitNoticeRes = await communityService.submitNotice(testNoticePayload);
  assert(submitNoticeRes.success === true, 'Notice submission succeeded');
  assert(submitNoticeRes.notice?.status === 'pending', 'Notice starts in pending moderation status');
  const noticeId = submitNoticeRes.notice?.id || '';

  // Step B: Public Query Check (must not appear)
  const initialPublicNotices = await communityService.getNotices('vellore');
  const isPendingVisiblePublicly = initialPublicNotices.some((n) => n.id === noticeId);
  assert(!isPendingVisiblePublicly, 'Pending notice is NOT visible in public directory queries');

  // Step C: Franchise Queue Check (must appear in moderation)
  const franchiseNotices = await communityService.getAllNoticesForFranchise('vellore');
  const isFoundInFranchise = franchiseNotices.some((n) => n.id === noticeId);
  assert(isFoundInFranchise, 'Pending notice is present in Franchise moderation queue');

  // Step D: Franchise Approval
  const approveNoticeRes = await communityService.moderateNotice(noticeId, 'published', undefined, 'franchise-vellore-01');
  assert(approveNoticeRes.success === true, 'Franchise operator successfully approved notice');

  // Step E: Published Visibility Check
  const updatedPublicNotices = await communityService.getNotices('vellore');
  const isNowVisiblePublicly = updatedPublicNotices.some((n) => n.id === noticeId && n.status === 'published');
  assert(isNowVisiblePublicly, 'Approved notice is immediately visible in public queries');

  // Step F: Rejection Lifecycle
  const rejectNoticePayload = {
    cityId: 'vellore' as const,
    title: 'Spam Commercial Notice That Should Be Rejected',
    category: 'other' as const,
    content: 'Commercial spam advert attempting to bypass post-ad fee structure.',
    locality: 'Katpadi',
    organizerName: 'Spam Advertiser',
    showContact: false,
  };
  const submitSpamRes = await communityService.submitNotice(rejectNoticePayload);
  const spamNoticeId = submitSpamRes.notice?.id || '';
  const rejectRes = await communityService.moderateNotice(spamNoticeId, 'rejected', 'Commercial ads must use business directory or classifieds.', 'franchise-vellore-01');
  assert(rejectRes.success === true, 'Franchise operator successfully rejected notice with reason');

  const publicNoticesAfterReject = await communityService.getNotices('vellore');
  const isSpamVisible = publicNoticesAfterReject.some((n) => n.id === spamNoticeId);
  assert(!isSpamVisible, 'Rejected notice is excluded from public directory');

  // SECTION 3: Complete Event Lifecycle Simulation
  console.log('\n--- SECTION 3: Event Lifecycle Simulation (Create -> Moderate -> Publish) ---');
  const testEventPayload = {
    cityId: 'vellore' as const,
    title: 'Staging Test Annual VIT Robotics Symposium 2026',
    category: 'education' as const,
    description: 'National robotics convention featuring university and engineering college teams across Tamil Nadu.',
    venueName: 'Technology Tower Auditorium',
    venueAddress: 'VIT University Campus, Katpadi Main Road, Vellore - 632014',
    locality: 'Katpadi',
    startDate: '2026-12-18T09:00:00+05:30',
    endDate: '2026-12-19T17:00:00+05:30',
    timeDisplay: '09:00 AM – 05:00 PM IST (2 Days)',
    organizerName: 'VIT Robotics & Automation Society',
    organizerContact: '+91 81899 85559',
    registrationUrl: 'https://velloreads.com/contact',
    isFree: true,
  };

  // Step A: Submission
  const submitEventRes = await communityService.submitEvent(testEventPayload);
  assert(submitEventRes.success === true, 'Event submission succeeded');
  assert(submitEventRes.event?.status === 'pending', 'Event starts in pending moderation status');
  const eventId = submitEventRes.event?.id || '';

  // Step B: Public Query Check (must not appear)
  const initialPublicEvents = await communityService.getEvents('vellore');
  const isPendingEventVisiblePublicly = initialPublicEvents.some((e) => e.id === eventId);
  assert(!isPendingEventVisiblePublicly, 'Pending event is NOT visible in public calendar queries');

  // Step C: Franchise Moderation Queue Check
  const franchiseEvents = await communityService.getAllEventsForFranchise('vellore');
  const isEventFoundInFranchise = franchiseEvents.some((e) => e.id === eventId);
  assert(isEventFoundInFranchise, 'Pending event is present in Franchise moderation queue');

  // Step D: Franchise Approval
  const approveEventRes = await communityService.moderateEvent(eventId, 'published', 'franchise-vellore-01');
  assert(approveEventRes.success === true, 'Franchise operator successfully approved event');

  // Step E: Published Visibility Check
  const updatedPublicEvents = await communityService.getEvents('vellore');
  const isEventNowVisible = updatedPublicEvents.some((e) => e.id === eventId && e.status === 'published');
  assert(isEventNowVisible, 'Approved event is immediately visible in public calendar queries');

  // SECTION 4: Cross-City Territorial Isolation
  console.log('\n--- SECTION 4: Cross-City Territorial Isolation ---');
  const chittoorNotices = await communityService.getNotices('chittoor');
  assert(chittoorNotices.length === 0, 'Chittoor notices query returns 0 notices (isolated)');

  const bengaluruNotices = await communityService.getNotices('bengaluru');
  assert(bengaluruNotices.length === 0, 'Bengaluru notices query returns 0 notices (isolated)');

  const chittoorEvents = await communityService.getEvents('chittoor');
  assert(chittoorEvents.length === 0, 'Chittoor events query returns 0 events (isolated)');

  const bengaluruEvents = await communityService.getEvents('bengaluru');
  assert(bengaluruEvents.length === 0, 'Bengaluru events query returns 0 events (isolated)');

  // SECTION 5: Negative Security & Anti-Abuse Guards
  console.log('\n--- SECTION 5: Negative Security & Anti-Abuse Guards ---');
  const titleTooShort = validateNoticePayload({
    cityId: 'vellore',
    title: 'Bad',
    category: 'community',
    content: 'Valid content description with sufficient length for testing.',
    locality: 'Katpadi',
    organizerName: 'Test Desk',
    showContact: true,
  });
  assert(titleTooShort.valid === false, 'Notice validation rejects title shorter than 5 chars');

  const contentTooShort = validateNoticePayload({
    cityId: 'vellore',
    title: 'Valid Long Title for Community Announcement',
    category: 'community',
    content: 'Too short',
    locality: 'Katpadi',
    organizerName: 'Test Desk',
    showContact: true,
  });
  assert(contentTooShort.valid === false, 'Notice validation rejects content shorter than 10 chars');

  const invalidUrl = validateEventPayload({
    cityId: 'vellore',
    title: 'Valid Event Title',
    category: 'sports',
    description: 'Valid event description with sufficient length for testing.',
    venueName: 'Katpadi Complex',
    venueAddress: 'Near Station',
    locality: 'Katpadi',
    startDate: '2026-12-10T10:00:00Z',
    timeDisplay: '10:00 AM',
    organizerName: 'Sports Council',
    isFree: true,
    registrationUrl: 'javascript:alert("XSS")',
  });
  assert(invalidUrl.valid === false, 'Event validation rejects javascript: URL scheme');

  const dataUrl = validateEventPayload({
    cityId: 'vellore',
    title: 'Valid Event Title',
    category: 'sports',
    description: 'Valid event description with sufficient length for testing.',
    venueName: 'Katpadi Complex',
    venueAddress: 'Near Station',
    locality: 'Katpadi',
    startDate: '2026-12-10T10:00:00Z',
    timeDisplay: '10:00 AM',
    organizerName: 'Sports Council',
    isFree: true,
    registrationUrl: 'data:text/html,<script>alert(1)</script>',
  });
  assert(dataUrl.valid === false, 'Event validation rejects data: URL scheme');

  const duplicateEvent = await communityService.submitEvent(testEventPayload);
  assert(duplicateEvent.isDuplicate === true, 'Duplicate event submission within 5 mins is intercepted');

  console.log('\n========================================================================');
  console.log(`STAGING VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runStagingVerification();
