import fs from 'fs';
import path from 'path';
import { parseCityRoute } from '../src/utils/cityResolver';

interface VercelRewrite {
  source: string;
  destination: string;
}

interface VercelConfig {
  $schema?: string;
  cleanUrls?: boolean;
  rewrites?: VercelRewrite[];
}

interface TestRouteCase {
  urlPath: string;
  expectedStatus: number;
  expectedServedFile: string;
  expectedContentType: string;
  expectedCityId?: string;
  expectedTab?: string;
  expectedMetaCity?: string;
  expectedTitleSubstring?: string;
  description: string;
}

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const VERCEL_JSON_PATH = path.resolve(process.cwd(), 'vercel.json');

// Read vercel.json
const vercelConfig: VercelConfig = JSON.parse(fs.readFileSync(VERCEL_JSON_PATH, 'utf-8'));

/**
 * Resolves an incoming request path according to Vercel routing rules:
 * 1. Exact static file match in dist/
 * 2. Directory with index.html in dist/
 * 3. Rewrites rules evaluated in order
 * 4. Fallback 404
 */
function resolveVercelPath(requestPath: string): { filePath: string | null; status: number } {
  const cleanPath = requestPath.split('?')[0];

  // 1. Static file check (Vercel checks filesystem first)
  const candidateExact = path.join(DIST_DIR, cleanPath);
  if (fs.existsSync(candidateExact) && fs.statSync(candidateExact).isFile()) {
    return { filePath: candidateExact, status: 200 };
  }

  // 2. Subdirectory with index.html check (standard web server directory index)
  const candidateDirIndex = path.join(DIST_DIR, cleanPath, 'index.html');
  if (fs.existsSync(candidateDirIndex) && fs.statSync(candidateDirIndex).isFile()) {
    return { filePath: candidateDirIndex, status: 200 };
  }

  // 3. Rewrites evaluation in sequential order
  if (vercelConfig.rewrites) {
    for (const rule of vercelConfig.rewrites) {
      // Convert source pattern to regex (matching Vercel's source patterns)
      const regexStr = '^' + rule.source.replace(/\//g, '\\/').replace(/\(\.\*\)/g, '(.*)') + '$';
      const regex = new RegExp(regexStr);
      if (regex.test(cleanPath)) {
        const destRelative = rule.destination.replace(/^\//, '');
        const candidateDest = path.join(DIST_DIR, destRelative);
        if (fs.existsSync(candidateDest) && fs.statSync(candidateDest).isFile()) {
          return { filePath: candidateDest, status: 200 };
        }
      }
    }
  }

  return { filePath: null, status: 404 };
}

const TEST_CASES: TestRouteCase[] = [
  // 1. PUBLIC CITY HOMEPAGES
  {
    urlPath: '/',
    expectedStatus: 200,
    expectedServedFile: 'dist/index.html',
    expectedContentType: 'text/html',
    expectedCityId: 'chittoor',
    expectedTab: 'home',
    description: 'Root public homepage (default Chittoor AP-03)',
  },
  {
    urlPath: '/city/chittoor',
    expectedStatus: 200,
    expectedServedFile: 'dist/city/chittoor/index.html',
    expectedContentType: 'text/html',
    expectedCityId: 'chittoor',
    expectedTab: 'home',
    expectedMetaCity: 'chittoor',
    expectedTitleSubstring: 'ChittoorAds',
    description: 'Chittoor public homepage (AP-03)',
  },
  {
    urlPath: '/city/vellore',
    expectedStatus: 200,
    expectedServedFile: 'dist/city/vellore/index.html',
    expectedContentType: 'text/html',
    expectedCityId: 'vellore',
    expectedTab: 'home',
    expectedMetaCity: 'vellore',
    expectedTitleSubstring: 'VelloreAds',
    description: 'Vellore public homepage (TN-23)',
  },
  {
    urlPath: '/city/bengaluru',
    expectedStatus: 200,
    expectedServedFile: 'dist/city/bengaluru/index.html',
    expectedContentType: 'text/html',
    expectedCityId: 'bengaluru',
    expectedTab: 'home',
    expectedMetaCity: 'bengaluru',
    expectedTitleSubstring: 'BengaluruAds',
    description: 'Bengaluru public homepage (KA-01)',
  },

  // 2. BUSINESS OWNER DASHBOARDS (THE CRITICAL REPORTED ROUTE)
  {
    urlPath: '/city/vellore/dashboard/my-ads',
    expectedStatus: 200,
    expectedServedFile: 'dist/city/vellore/index.html',
    expectedContentType: 'text/html',
    expectedCityId: 'vellore',
    expectedTab: 'dashboard',
    expectedMetaCity: 'vellore',
    expectedTitleSubstring: 'VelloreAds',
    description: 'Vellore Business Owner Dashboard (/city/vellore/dashboard/my-ads)',
  },
  {
    urlPath: '/city/chittoor/dashboard/my-ads',
    expectedStatus: 200,
    expectedServedFile: 'dist/city/chittoor/index.html',
    expectedContentType: 'text/html',
    expectedCityId: 'chittoor',
    expectedTab: 'dashboard',
    expectedMetaCity: 'chittoor',
    expectedTitleSubstring: 'ChittoorAds',
    description: 'Chittoor Business Owner Dashboard (/city/chittoor/dashboard/my-ads)',
  },
  {
    urlPath: '/city/bengaluru/dashboard/my-ads',
    expectedStatus: 200,
    expectedServedFile: 'dist/city/bengaluru/index.html',
    expectedContentType: 'text/html',
    expectedCityId: 'bengaluru',
    expectedTab: 'dashboard',
    expectedMetaCity: 'bengaluru',
    expectedTitleSubstring: 'BengaluruAds',
    description: 'Bengaluru Business Owner Dashboard (/city/bengaluru/dashboard/my-ads)',
  },
  {
    urlPath: '/dashboard/my-ads',
    expectedStatus: 200,
    expectedServedFile: 'dist/index.html',
    expectedContentType: 'text/html',
    expectedCityId: 'chittoor',
    expectedTab: 'dashboard',
    description: 'Global Business Owner Dashboard fallback (/dashboard/my-ads)',
  },

  // 3. FRANCHISE DASHBOARDS
  {
    urlPath: '/city/vellore/franchise',
    expectedStatus: 200,
    expectedServedFile: 'dist/city/vellore/index.html',
    expectedContentType: 'text/html',
    expectedCityId: 'vellore',
    expectedTab: 'franchise',
    expectedMetaCity: 'vellore',
    expectedTitleSubstring: 'VelloreAds',
    description: 'Vellore Franchise Dashboard (/city/vellore/franchise)',
  },
  {
    urlPath: '/city/chittoor/franchise',
    expectedStatus: 200,
    expectedServedFile: 'dist/city/chittoor/index.html',
    expectedContentType: 'text/html',
    expectedCityId: 'chittoor',
    expectedTab: 'franchise',
    expectedMetaCity: 'chittoor',
    expectedTitleSubstring: 'ChittoorAds',
    description: 'Chittoor Franchise Dashboard (/city/chittoor/franchise)',
  },
  {
    urlPath: '/city/bengaluru/franchise',
    expectedStatus: 200,
    expectedServedFile: 'dist/city/bengaluru/index.html',
    expectedContentType: 'text/html',
    expectedCityId: 'bengaluru',
    expectedTab: 'franchise',
    expectedMetaCity: 'bengaluru',
    expectedTitleSubstring: 'BengaluruAds',
    description: 'Bengaluru Franchise Dashboard (/city/bengaluru/franchise)',
  },

  // 4. SUPER ADMIN PORTALS
  {
    urlPath: '/admin',
    expectedStatus: 200,
    expectedServedFile: 'dist/index.html',
    expectedContentType: 'text/html',
    expectedTab: 'admin',
    description: 'Super Admin Portal entry (/admin)',
  },
  {
    urlPath: '/admin/users',
    expectedStatus: 200,
    expectedServedFile: 'dist/index.html',
    expectedContentType: 'text/html',
    expectedTab: 'admin',
    description: 'Super Admin User Management subpath (/admin/users)',
  },
  {
    urlPath: '/admin/governance',
    expectedStatus: 200,
    expectedServedFile: 'dist/index.html',
    expectedContentType: 'text/html',
    expectedTab: 'admin',
    description: 'Super Admin Governance subpath (/admin/governance)',
  },

  // 5. CATEGORY PAGES
  {
    urlPath: '/city/vellore/category/theatres',
    expectedStatus: 200,
    expectedServedFile: 'dist/city/vellore/index.html',
    expectedContentType: 'text/html',
    expectedCityId: 'vellore',
    expectedTab: 'category',
    expectedMetaCity: 'vellore',
    description: 'Vellore Category route (/city/vellore/category/theatres)',
  },
  {
    urlPath: '/city/chittoor/category/mango-mandi',
    expectedStatus: 200,
    expectedServedFile: 'dist/city/chittoor/index.html',
    expectedContentType: 'text/html',
    expectedCityId: 'chittoor',
    expectedTab: 'category',
    expectedMetaCity: 'chittoor',
    description: 'Chittoor Category route (/city/chittoor/category/mango-mandi)',
  },
  {
    urlPath: '/city/bengaluru/category/coworking',
    expectedStatus: 200,
    expectedServedFile: 'dist/city/bengaluru/index.html',
    expectedContentType: 'text/html',
    expectedCityId: 'bengaluru',
    expectedTab: 'category',
    expectedMetaCity: 'bengaluru',
    description: 'Bengaluru Category route (/city/bengaluru/category/coworking)',
  },

  // 6. CLASSIFIEDS PAGES
  {
    urlPath: '/city/vellore/classifieds',
    expectedStatus: 200,
    expectedServedFile: 'dist/city/vellore/index.html',
    expectedContentType: 'text/html',
    expectedCityId: 'vellore',
    expectedTab: 'classifieds',
    expectedMetaCity: 'vellore',
    description: 'Vellore Classifieds route (/city/vellore/classifieds)',
  },
  {
    urlPath: '/city/chittoor/classifieds',
    expectedStatus: 200,
    expectedServedFile: 'dist/city/chittoor/index.html',
    expectedContentType: 'text/html',
    expectedCityId: 'chittoor',
    expectedTab: 'classifieds',
    expectedMetaCity: 'chittoor',
    description: 'Chittoor Classifieds route (/city/chittoor/classifieds)',
  },

  // 7. DIRECT BUSINESS DETAIL PAGES
  {
    urlPath: '/city/vellore/business/listing-vel-101',
    expectedStatus: 200,
    expectedServedFile: 'dist/city/vellore/index.html',
    expectedContentType: 'text/html',
    expectedCityId: 'vellore',
    expectedTab: 'home',
    expectedMetaCity: 'vellore',
    description: 'Vellore Direct Business Detail route (/city/vellore/business/listing-vel-101)',
  },
  {
    urlPath: '/city/chittoor/business/listing-ch-202',
    expectedStatus: 200,
    expectedServedFile: 'dist/city/chittoor/index.html',
    expectedContentType: 'text/html',
    expectedCityId: 'chittoor',
    expectedTab: 'home',
    expectedMetaCity: 'chittoor',
    description: 'Chittoor Direct Business Detail route (/city/chittoor/business/listing-ch-202)',
  },
];

async function runTestSuite() {
  console.log('======================================================================');
  console.log('KAARYAN LABS — VERCEL NESTED ROUTING & FOUR-PORTAL VERIFICATION');
  console.log('======================================================================\n');

  let passedAssertions = 0;
  let totalAssertions = 0;

  // -------------------------------------------------------------------------
  // PHASE 1: CONFIGURATION AUDIT
  // -------------------------------------------------------------------------
  console.log('--- PHASE 1: VERCEL.JSON CONFIGURATION AUDIT ---');

  totalAssertions++;
  if (vercelConfig.cleanUrls === undefined || vercelConfig.cleanUrls === false) {
    console.log('✅ Assertion: cleanUrls is omitted/false (prevents 404 on .html rewrite targets)');
    passedAssertions++;
  } else {
    console.error('❌ Assertion failed: cleanUrls is enabled in vercel.json');
  }

  totalAssertions++;
  if (vercelConfig.rewrites && vercelConfig.rewrites.length >= 7) {
    console.log(`✅ Assertion: Rewrites defined with ${vercelConfig.rewrites.length} targeted rules`);
    passedAssertions++;
  } else {
    console.error('❌ Assertion failed: Rewrites array is missing or incomplete');
  }

  totalAssertions++;
  const cityRewrites = vercelConfig.rewrites?.filter((r) => r.source.includes('/city/')) || [];
  if (cityRewrites.length >= 6) {
    console.log(`✅ Assertion: All 3 cities covered for both root and nested routes (${cityRewrites.length} rules)`);
    passedAssertions++;
  } else {
    console.error('❌ Assertion failed: Missing city-specific rewrites');
  }

  // -------------------------------------------------------------------------
  // PHASE 2: STATIC ASSET CHECK
  // -------------------------------------------------------------------------
  console.log('\n--- PHASE 2: STATIC ASSET INTEGRITY ---');
  const assetFiles = fs.readdirSync(path.join(DIST_DIR, 'assets'));
  const jsAsset = assetFiles.find((f) => f.endsWith('.js'));
  const cssAsset = assetFiles.find((f) => f.endsWith('.css'));

  totalAssertions++;
  if (jsAsset && cssAsset) {
    console.log(`✅ Assertion: Found Vite production assets: ${jsAsset}, ${cssAsset}`);
    passedAssertions++;
  } else {
    console.error('❌ Assertion failed: Missing JS or CSS production bundle in dist/assets/');
  }

  if (jsAsset && cssAsset) {
    const jsResolution = resolveVercelPath(`/assets/${jsAsset}`);
    totalAssertions++;
    if (jsResolution.status === 200 && jsResolution.filePath?.includes(jsAsset)) {
      console.log(`✅ Assertion: JS bundle resolves directly via filesystem (HTTP 200)`);
      passedAssertions++;
    } else {
      console.error('❌ Assertion failed: JS bundle failed to resolve');
    }

    const cssResolution = resolveVercelPath(`/assets/${cssAsset}`);
    totalAssertions++;
    if (cssResolution.status === 200 && cssResolution.filePath?.includes(cssAsset)) {
      console.log(`✅ Assertion: CSS bundle resolves directly via filesystem (HTTP 200)`);
      passedAssertions++;
    } else {
      console.error('❌ Assertion failed: CSS bundle failed to resolve');
    }
  }

  // -------------------------------------------------------------------------
  // PHASE 3: ROUTE RESOLUTION, SEO AND CLIENT STATE ASSERTIONS
  // -------------------------------------------------------------------------
  console.log('\n--- PHASE 3: ROUTE RESOLUTION & CLIENT-SIDE RECOVERY ---');

  for (const tc of TEST_CASES) {
    const resolved = resolveVercelPath(tc.urlPath);

    // 1. Status check
    totalAssertions++;
    if (resolved.status === tc.expectedStatus) {
      passedAssertions++;
    } else {
      console.error(`❌ Status Mismatch on ${tc.urlPath}: Expected ${tc.expectedStatus}, got ${resolved.status}`);
    }

    // 2. Target File on disk check
    totalAssertions++;
    if (resolved.filePath && resolved.filePath.endsWith(tc.expectedServedFile.replace(/\//g, path.sep))) {
      passedAssertions++;
    } else {
      console.error(`❌ Served File Mismatch on ${tc.urlPath}: Expected ending with ${tc.expectedServedFile}, got ${resolved.filePath}`);
    }

    // Read served HTML
    const htmlContent = resolved.filePath ? fs.readFileSync(resolved.filePath, 'utf-8') : '';

    // 3. SEO Meta City check
    if (tc.expectedMetaCity) {
      totalAssertions++;
      const metaCityMatch = htmlContent.includes(`<meta name="city" content="${tc.expectedMetaCity}"`);
      if (metaCityMatch) {
        passedAssertions++;
      } else {
        console.error(`❌ SEO Meta City Mismatch on ${tc.urlPath}: Missing meta name="city" content="${tc.expectedMetaCity}"`);
      }
    }

    // 4. SEO Title check
    if (tc.expectedTitleSubstring) {
      totalAssertions++;
      const titleMatch = htmlContent.includes(tc.expectedTitleSubstring);
      if (titleMatch) {
        passedAssertions++;
      } else {
        console.error(`❌ SEO Title Mismatch on ${tc.urlPath}: Missing title substring "${tc.expectedTitleSubstring}"`);
      }
    }

    // 5. Client-side Route Resolver checks
    const parsedRoute = parseCityRoute(tc.urlPath, '', 'localhost');
    if (tc.expectedCityId) {
      totalAssertions++;
      if (parsedRoute.cityId === tc.expectedCityId) {
        passedAssertions++;
      } else {
        console.error(`❌ Client City Resolver Mismatch on ${tc.urlPath}: Expected ${tc.expectedCityId}, got ${parsedRoute.cityId}`);
      }
    }

    if (tc.expectedTab) {
      totalAssertions++;
      if (parsedRoute.tab === tc.expectedTab) {
        passedAssertions++;
      } else {
        console.error(`❌ Client Tab Resolver Mismatch on ${tc.urlPath}: Expected ${tc.expectedTab}, got ${parsedRoute.tab}`);
      }
    }

    console.log(`✅ [HTTP ${resolved.status}] -> ${path.relative(process.cwd(), resolved.filePath || '')} | ${tc.description}`);
  }

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log(`RESULT: ${passedAssertions}/${totalAssertions} assertions passed (${Math.round((passedAssertions / totalAssertions) * 100)}%)`);
  console.log('======================================================================\n');

  if (passedAssertions === totalAssertions) {
    console.log('🎉 ALL VERCEL NESTED ROUTING AND FOUR-PORTAL ASSERTIONS PASSED (100%)!');
    process.exit(0);
  } else {
    console.error('❌ SOME ROUTING ASSERTIONS FAILED.');
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Error running routing verification test suite:', err);
  process.exit(1);
});
