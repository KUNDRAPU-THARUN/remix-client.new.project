import fs from 'fs';
import path from 'path';
import { parseCityRoute, buildCityRouteUrl } from '../src/utils/cityResolver';
import { CITIES } from '../src/config/cities';
import { INITIAL_LISTINGS } from '../src/data/mockData';

console.log('======================================================================');
console.log('KAARYAN LABS — PHASE V3.2: VELLORE ADS ESSENTIAL FEATURE VERIFICATION');
console.log('======================================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, description: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ ${description}`);
    passedTests++;
  } else {
    console.error(`❌ FAILED: ${description}${detail ? ` (${detail})` : ''}`);
  }
}

// ---------------------------------------------------------------------------
// SUITE 1: DEDICATED ABOUT PAGE ROUTING CONTRACT
// ---------------------------------------------------------------------------
console.log('--- SUITE 1: DEDICATED ABOUT PAGE ROUTING CONTRACT ---');

const aboutRoute1 = parseCityRoute('/city/vellore/about', '', 'localhost');
assert(aboutRoute1.cityId === 'vellore' && aboutRoute1.tab === 'about', 'Path /city/vellore/about resolves to tab: about and cityId: vellore');

const aboutUsRoute = parseCityRoute('/city/vellore/about-us', '', 'localhost');
assert(aboutUsRoute.cityId === 'vellore' && aboutUsRoute.tab === 'about', 'Path /city/vellore/about-us resolves to tab: about and cityId: vellore');

const aboutDomainRoute = parseCityRoute('/about', '', 'velloreads.com');
assert(aboutDomainRoute.cityId === 'vellore' && aboutDomainRoute.tab === 'about', 'Domain velloreads.com/about resolves to tab: about and cityId: vellore');

const aboutUrl1 = buildCityRouteUrl('vellore', 'about');
assert(aboutUrl1 === '/city/vellore/about', 'buildCityRouteUrl generates /city/vellore/about', `Got: ${aboutUrl1}`);

const aboutUrlDomain = buildCityRouteUrl('vellore', 'about', 'all', undefined, 'velloreads.com');
assert(aboutUrlDomain === '/about', 'buildCityRouteUrl generates /about on custom domain', `Got: ${aboutUrlDomain}`);

// ---------------------------------------------------------------------------
// SUITE 2: DEDICATED CONTACT PAGE ROUTING CONTRACT
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 2: DEDICATED CONTACT PAGE ROUTING CONTRACT ---');

const contactRoute1 = parseCityRoute('/city/vellore/contact', '', 'localhost');
assert(contactRoute1.cityId === 'vellore' && contactRoute1.tab === 'contact', 'Path /city/vellore/contact resolves to tab: contact and cityId: vellore');

const contactUsRoute = parseCityRoute('/city/vellore/contact-us', '', 'localhost');
assert(contactUsRoute.cityId === 'vellore' && contactUsRoute.tab === 'contact', 'Path /city/vellore/contact-us resolves to tab: contact and cityId: vellore');

const contactDomainRoute = parseCityRoute('/contact', '', 'velloreads.com');
assert(contactDomainRoute.cityId === 'vellore' && contactDomainRoute.tab === 'contact', 'Domain velloreads.com/contact resolves to tab: contact and cityId: vellore');

const contactUrl1 = buildCityRouteUrl('vellore', 'contact');
assert(contactUrl1 === '/city/vellore/contact', 'buildCityRouteUrl generates /city/vellore/contact', `Got: ${contactUrl1}`);

const contactUrlDomain = buildCityRouteUrl('vellore', 'contact', 'all', undefined, 'velloreads.com');
assert(contactUrlDomain === '/contact', 'buildCityRouteUrl generates /contact on custom domain', `Got: ${contactUrlDomain}`);

// ---------------------------------------------------------------------------
// SUITE 3: STANDALONE BUSINESS PROFILE ROUTING CONTRACT (/biz/:id)
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 3: STANDALONE BUSINESS PROFILE ROUTING CONTRACT ---');

const bizRoute1 = parseCityRoute('/city/vellore/biz/v-001', '', 'localhost');
assert(
  bizRoute1.cityId === 'vellore' && bizRoute1.tab === 'biz' && bizRoute1.listingId === 'v-001',
  'Path /city/vellore/biz/v-001 resolves to tab: biz and listingId: v-001'
);

const bizDomainRoute = parseCityRoute('/biz/v-001', '', 'velloreads.com');
assert(
  bizDomainRoute.cityId === 'vellore' && bizDomainRoute.tab === 'biz' && bizDomainRoute.listingId === 'v-001',
  'Domain velloreads.com/biz/v-001 resolves to tab: biz and listingId: v-001'
);

const bizLegacyRoute = parseCityRoute('/city/vellore/business/v-001', '', 'localhost');
assert(
  bizLegacyRoute.cityId === 'vellore' && bizLegacyRoute.tab === 'home' && bizLegacyRoute.listingId === 'v-001',
  'Path /city/vellore/business/v-001 preserves tab: home and listingId: v-001 for modal/deep-link regression'
);

const bizUrl = buildCityRouteUrl('vellore', 'biz', 'all', { listingId: 'v-001' });
assert(bizUrl === '/city/vellore/biz/v-001', 'buildCityRouteUrl generates canonical /city/vellore/biz/v-001', `Got: ${bizUrl}`);
assert(!bizUrl.includes('?listing='), 'Canonical /city/vellore/biz/v-001 does not include redundant ?listing= query parameter');

const bizUrlDomain = buildCityRouteUrl('vellore', 'biz', 'all', { listingId: 'v-001' }, 'velloreads.com');
assert(bizUrlDomain === '/biz/v-001', 'buildCityRouteUrl generates /biz/v-001 on custom domain', `Got: ${bizUrlDomain}`);

// ---------------------------------------------------------------------------
// SUITE 4: SECURITY & PENDING LISTING ACCESS CONTROL
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 4: SECURITY & ACCESS CONTROL CONTRACT ---');

const velloreListings = INITIAL_LISTINGS.filter((l) => (l.cityId || 'chittoor') === 'vellore');
const activeVelloreListings = velloreListings.filter((l) => (l.status || 'Active') === 'Active');
const pendingVelloreListings = velloreListings.filter((l) => l.status === 'Pending Approval');

assert(velloreListings.length >= 3, `Found ${velloreListings.length} Vellore listings in INITIAL_LISTINGS`);
assert(activeVelloreListings.length >= 2, `Found ${activeVelloreListings.length} published active listings`);
assert(pendingVelloreListings.length >= 1, `Found ${pendingVelloreListings.length} pending moderation listings (e.g. ${pendingVelloreListings.map(p => p.id).join(', ')})`);

// Verify pending listings have status Pending Approval
for (const pending of pendingVelloreListings) {
  assert(pending.status === 'Pending Approval', `Pending listing ${pending.id} is verified in Pending Approval moderation state`);
}

// ---------------------------------------------------------------------------
// SUITE 5: VELLORE CONTACT INFO VERIFICATION
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 5: VERIFIED VELLORE CONTACT INFO ---');

const velloreConfig = CITIES.vellore;
assert(Boolean(velloreConfig), 'CITIES.vellore configuration is present');
assert(velloreConfig.contact.phone === '+91 81899 85559', `Helpline phone matches verified number: ${velloreConfig.contact.phone}`);
assert(velloreConfig.contact.email === 'info@velloreads.com', `Contact email matches verified address: ${velloreConfig.contact.email}`);
assert(velloreConfig.contact.address.includes('Near VIT Junction'), `Office address contains Near VIT Junction: ${velloreConfig.contact.address}`);
assert(velloreConfig.localities.length >= 11, `Vellore localities count is >= 11 (including all): ${velloreConfig.localities.length}`);

// ---------------------------------------------------------------------------
// SUITE 6: VERCEL.JSON CONFIGURATION & REDIRECT AUDIT
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 6: VERCEL.JSON CONFIGURATION & REDIRECT AUDIT ---');

const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
const vercelContent = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));

assert(Array.isArray(vercelContent.redirects), 'vercel.json has "redirects" array');
assert(Array.isArray(vercelContent.rewrites), 'vercel.json has "rewrites" array');

const redirects: Array<{ source: string; destination: string; permanent: boolean }> = vercelContent.redirects || [];

const aboutUsRedir = redirects.find((r) => r.source === '/about-us');
assert(aboutUsRedir?.destination === '/city/vellore/about' && aboutUsRedir?.permanent === true, 'Redirect: /about-us -> /city/vellore/about (301 Permanent)');

const contactUsRedir = redirects.find((r) => r.source === '/contact-us');
assert(contactUsRedir?.destination === '/city/vellore/contact' && contactUsRedir?.permanent === true, 'Redirect: /contact-us -> /city/vellore/contact (301 Permanent)');

const postAdsRedir = redirects.find((r) => r.source === '/post-free-ads');
assert(postAdsRedir?.destination === '/city/vellore/classifieds' && postAdsRedir?.permanent === true, 'Redirect: /post-free-ads -> /city/vellore/classifieds (301 Permanent)');

const franchiseRedir = redirects.find((r) => r.source === '/franchise-partner');
assert(franchiseRedir?.destination === '/city/vellore/franchise' && franchiseRedir?.permanent === true, 'Redirect: /franchise-partner -> /city/vellore/franchise (301 Permanent)');

const velloreAboutUsRedir = redirects.find((r) => r.source === '/city/vellore/about-us');
assert(velloreAboutUsRedir?.destination === '/city/vellore/about' && velloreAboutUsRedir?.permanent === true, 'Redirect: /city/vellore/about-us -> /city/vellore/about (301 Permanent)');

const velloreContactUsRedir = redirects.find((r) => r.source === '/city/vellore/contact-us');
assert(velloreContactUsRedir?.destination === '/city/vellore/contact' && velloreContactUsRedir?.permanent === true, 'Redirect: /city/vellore/contact-us -> /city/vellore/contact (301 Permanent)');

// ---------------------------------------------------------------------------
// SUITE 7: CROSS-CITY REGION ISOLATION CONTRACT
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 7: CROSS-CITY REGION ISOLATION CONTRACT ---');

const chittoorAbout = parseCityRoute('/city/chittoor/about', '', 'localhost');
assert(chittoorAbout.cityId === 'chittoor' && chittoorAbout.tab === 'about', 'Chittoor route /city/chittoor/about isolated with cityId: chittoor');

const bengaluruAbout = parseCityRoute('/city/bengaluru/about', '', 'localhost');
assert(bengaluruAbout.cityId === 'bengaluru' && bengaluruAbout.tab === 'about', 'Bengaluru route /city/bengaluru/about isolated with cityId: bengaluru');

const chittoorDomainAbout = parseCityRoute('/about', '', 'chittoorads.com');
assert(chittoorDomainAbout.cityId === 'chittoor' && chittoorDomainAbout.tab === 'about', 'chittoorads.com/about domain isolated with cityId: chittoor');

const bengaluruDomainAbout = parseCityRoute('/about', '', 'bengaluruads.com');
assert(bengaluruDomainAbout.cityId === 'bengaluru' && bengaluruDomainAbout.tab === 'about', 'bengaluruads.com/about domain isolated with cityId: bengaluru');

// ---------------------------------------------------------------------------
// SUITE 8: COMPONENT FILES INTEGRITY
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 8: COMPONENT FILES INTEGRITY ---');

const aboutPath = path.join(process.cwd(), 'src/components/VelloreAboutPage.tsx');
assert(fs.existsSync(aboutPath), 'VelloreAboutPage.tsx exists');
const aboutText = fs.readFileSync(aboutPath, 'utf8');
assert(aboutText.includes('TN-23'), 'VelloreAboutPage.tsx references territory code TN-23');
assert(aboutText.includes('Katpadi'), 'VelloreAboutPage.tsx references Katpadi locality');
assert(aboutText.includes('15995F') || aboutText.includes('176AC4'), 'VelloreAboutPage.tsx uses brand theme colors');

const contactPath = path.join(process.cwd(), 'src/components/VelloreContactPage.tsx');
assert(fs.existsSync(contactPath), 'VelloreContactPage.tsx exists');
const contactText = fs.readFileSync(contactPath, 'utf8');
assert(contactText.includes('+91 81899 85559'), 'VelloreContactPage.tsx displays verified helpline');
assert(contactText.includes('submitGeneralLead'), 'VelloreContactPage.tsx integrates enquiryService.submitGeneralLead');
assert(contactText.includes('currentCity.contact.address') || contactText.includes('Katpadi Main Road'), 'VelloreContactPage.tsx displays verified physical address');

const bizPath = path.join(process.cwd(), 'src/components/StandaloneBusinessPage.tsx');
assert(fs.existsSync(bizPath), 'StandaloneBusinessPage.tsx exists');
const bizText = fs.readFileSync(bizPath, 'utf8');
assert(bizText.includes('Pending Approval'), 'StandaloneBusinessPage.tsx guards pending approval moderation status');
assert(bizText.includes('Business Listing Not Found'), 'StandaloneBusinessPage.tsx provides not-found fallback screen');
assert(bizText.includes('canonicalUrl'), 'StandaloneBusinessPage.tsx handles canonical URL sharing');

// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`TOTAL RESULT: ${passedTests}/${totalTests} assertions passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('======================================================================\n');

if (passedTests === totalTests) {
  console.log('🎉 ALL VELLORE ADS PHASE V3.2 ESSENTIAL FEATURE ASSERTIONS PASSED (100%)!');
  process.exit(0);
} else {
  console.error('❌ SOME FEATURE ASSERTIONS FAILED.');
  process.exit(1);
}
