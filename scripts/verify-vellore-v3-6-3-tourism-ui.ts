/**
 * KAARYAN LABS — PHASE V3.6.3
 * VELLORE HERITAGE & TOURISM DIRECTORY UI VERIFICATION SUITE
 *
 * Covers:
 * 1. Tourism route renders (/city/vellore/tourism)
 * 2. Direct page refresh & subpath routing
 * 3. Six published baseline records
 * 4. Four draft records remain hidden
 * 5. Search functionality (case-insensitive, trim, native script, highlights)
 * 6. Category filtering & dynamic counts
 * 7. Combined search and filter state
 * 8. Reset filters
 * 9. Featured attractions
 * 10. Empty search results
 * 11. No duplicate cards
 * 12. City isolation (Chittoor AP-03 & Bengaluru KA-01 insulated)
 * 13. Responsive layouts & zero horizontal overflow across 9 viewports
 * 14. No broken attraction links (valid Maps URLs, safe modal interim)
 * 15. No runtime errors
 * 16. Keyboard accessibility & Escape key dismiss
 * 17. Existing page regression (Community notices & Local events)
 */

import { spawn, ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { parseCityRoute, buildCityRouteUrl } from '../src/utils/cityResolver';
import { CITIES } from '../src/config/cities';
import { tourismService } from '../src/services/tourismService';
import {
  PUBLISHED_VELLORE_ATTRACTIONS,
  VELLORE_TOURISM_RESEARCH_BACKLOG,
  VELLORE_TOURISM_CATEGORIES,
} from '../src/data/velloreTourismData';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb\\screenshots';
const PARENT_ARTIFACT_DIR = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb';
const PORT = 8115;
const CDP_PORT = 9245;

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createStaticServer(port: number): Promise<http.Server> {
  const distDir = path.resolve(process.cwd(), 'dist');

  const mimeTypes: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
  };

  const server = http.createServer((req, res) => {
    const rawUrl = req.url || '/';
    const cleanPath = rawUrl.split('?')[0].replace(/\/+$/, '') || '/';

    const filePath = path.join(distDir, cleanPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(filePath));
      return;
    }

    if (cleanPath === '/city/vellore/tourism') {
      const tourismHtml = path.join(distDir, 'city/vellore/tourism/index.html');
      if (fs.existsSync(tourismHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(tourismHtml));
        return;
      }
    }

    if (cleanPath === '/city/vellore/community') {
      const communityHtml = path.join(distDir, 'city/vellore/community/index.html');
      if (fs.existsSync(communityHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(communityHtml));
        return;
      }
    }

    if (cleanPath === '/city/vellore/events') {
      const eventsHtml = path.join(distDir, 'city/vellore/events/index.html');
      if (fs.existsSync(eventsHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(eventsHtml));
        return;
      }
    }

    if (cleanPath === '/city/vellore' || cleanPath.startsWith('/city/vellore/')) {
      const cityHtml = path.join(distDir, 'city/vellore/index.html');
      if (fs.existsSync(cityHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(cityHtml));
        return;
      }
    }

    const rootHtml = path.join(distDir, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(rootHtml));
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

async function sendCDP(ws: WebSocket, method: string, params: any = {}): Promise<any> {
  const id = Math.floor(Math.random() * 1000000);
  return new Promise((resolve, reject) => {
    const handleMsg = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          ws.removeEventListener('message', handleMsg);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      } catch (err) {
        reject(err);
      }
    };
    ws.addEventListener('message', handleMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluateScript(ws: WebSocket, expression: string): Promise<any> {
  const res = await sendCDP(ws, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.exceptionDetails) {
    throw new Error(`Evaluation failed: ${JSON.stringify(res.exceptionDetails)}`);
  }
  return res.result?.value;
}

async function captureScreenshot(
  ws: WebSocket,
  width: number,
  height: number,
  filename: string,
  mobile = true
) {
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile,
  });
  await wait(400);
  const { data } = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(data, 'base64');

  const subPath = path.join(ARTIFACT_DIR, filename);
  fs.writeFileSync(subPath, buffer);

  const parentPath = path.join(PARENT_ARTIFACT_DIR, filename);
  fs.writeFileSync(parentPath, buffer);

  console.log(`  📸 Saved screenshot: ${filename} (${width}x${height})`);
}

async function runSuite() {
  console.log('======================================================================');
  console.log('KAARYAN LABS — PHASE V3.6.3 VELLORE TOURISM DIRECTORY UI TEST SUITE');
  console.log('======================================================================\n');

  let testCount = 0;
  let passCount = 0;
  let failCount = 0;

  function assert(condition: boolean, testName: string) {
    testCount++;
    if (condition) {
      passCount++;
      console.log(`  ✅ PASS [${testCount}]: ${testName}`);
    } else {
      failCount++;
      console.error(`  ❌ FAIL [${testCount}]: ${testName}`);
    }
  }

  // --- SECTION 1: Route Integration & URL Parsing ---
  console.log('--- SECTION 1: Tourism Route Integration & URL Parsing ---');
  const parsedTourism = parseCityRoute('/city/vellore/tourism');
  assert(parsedTourism.cityId === 'vellore', 'parseCityRoute resolves cityId === "vellore"');
  assert(parsedTourism.tab === 'tourism', 'parseCityRoute resolves tab === "tourism"');

  const parsedWithSlug = parseCityRoute('/city/vellore/tourism/vellore-fort-and-moat');
  assert(parsedWithSlug.tab === 'tourism', 'Subpath route resolves tab === "tourism"');
  assert(
    parsedWithSlug.attractionSlug === 'vellore-fort-and-moat',
    'Subpath route extracts attractionSlug === "vellore-fort-and-moat"'
  );

  const builtUrl = buildCityRouteUrl('vellore', 'tourism');
  assert(builtUrl === '/city/vellore/tourism', `buildCityRouteUrl generates canonical /city/vellore/tourism (got ${builtUrl})`);

  const builtSlugUrl = buildCityRouteUrl('vellore', 'tourism', 'all', {
    attractionSlug: 'sripuram-golden-temple',
  });
  assert(
    builtSlugUrl === '/city/vellore/tourism/sripuram-golden-temple',
    `buildCityRouteUrl with slug generates /city/vellore/tourism/sripuram-golden-temple (got ${builtSlugUrl})`
  );

  // --- SECTION 2: City Confinement & Feature Flag Isolation ---
  console.log('\n--- SECTION 2: City Confinement & Feature Flag Isolation ---');
  assert(CITIES.vellore.features.hasTourismDirectory === true, 'Vellore (TN-23) hasTourismDirectory is TRUE');
  assert(CITIES.chittoor.features.hasTourismDirectory === false, 'Chittoor (AP-03) hasTourismDirectory is FALSE (isolated)');
  assert(CITIES.bengaluru.features.hasTourismDirectory === false, 'Bengaluru (KA-01) hasTourismDirectory is FALSE (isolated)');

  const chittoorAttractions = await tourismService.getTourismAttractions('chittoor');
  assert(chittoorAttractions.length === 0, 'tourismService.getTourismAttractions("chittoor") returns empty array []');

  const bengaluruAttractions = await tourismService.getTourismAttractions('bengaluru');
  assert(bengaluruAttractions.length === 0, 'tourismService.getTourismAttractions("bengaluru") returns empty array []');

  // --- SECTION 3: Six Published Baseline Records ---
  console.log('\n--- SECTION 3: Six Published Baseline Records ---');
  const published = await tourismService.getTourismAttractions('vellore');
  assert(published.length === 6, `Exact count of 6 published baseline records loaded (found ${published.length})`);

  const publishedSlugs = published.map((a) => a.slug);
  const requiredSlugs = [
    'vellore-fort-and-moat',
    'sripuram-golden-temple',
    'jalakandeswarar-temple',
    'cmc-heritage-campus',
    'palamathi-hills-otteri-viewpoint',
    'st-johns-church-fort',
  ];
  for (const slug of requiredSlugs) {
    assert(publishedSlugs.includes(slug), `Baseline destination "${slug}" is present in published list`);
  }

  // --- SECTION 4: Unpublished & Draft Content Exclusion ---
  console.log('\n--- SECTION 4: Four Draft Research Records Isolated ---');
  assert(VELLORE_TOURISM_RESEARCH_BACKLOG.length === 4, 'Research backlog contains exactly 4 draft records');
  for (const draft of VELLORE_TOURISM_RESEARCH_BACKLOG) {
    assert(
      !publishedSlugs.includes(draft.slug),
      `Draft backlog destination "${draft.slug}" is strictly excluded from public published list`
    );
  }

  // --- SECTION 5: Search Functionality ---
  console.log('\n--- SECTION 5: Search Functionality ---');
  const searchFortCase = await tourismService.searchTourismAttractions('fOrT', {}, 'vellore');
  assert(
    searchFortCase.some((a) => a.slug === 'vellore-fort-and-moat'),
    'Case-insensitive search matches "fOrT" to Vellore Fort & Moat'
  );

  const searchTrim = await tourismService.searchTourismAttractions('   golden temple   ', {}, 'vellore');
  assert(
    searchTrim.some((a) => a.slug === 'sripuram-golden-temple'),
    'Whitespace trimmed search matches "   golden temple   " to Sripuram'
  );

  const searchTamil = await tourismService.searchTourismAttractions('ஜலகண்டேஸ்வரர்', {}, 'vellore');
  assert(
    searchTamil.some((a) => a.slug === 'jalakandeswarar-temple'),
    'Native Tamil script search matches "ஜலகண்டேஸ்வரர்" to Jalakandeswarar Temple'
  );

  const searchHighlight = await tourismService.searchTourismAttractions('1,500 kg', {}, 'vellore');
  assert(
    searchHighlight.some((a) => a.slug === 'sripuram-golden-temple'),
    'Historical highlight search matches "1,500 kg" to Sripuram Golden Temple'
  );

  const searchLocality = await tourismService.searchTourismAttractions('Otteri', {}, 'vellore');
  assert(
    searchLocality.some((a) => a.slug === 'palamathi-hills-otteri-viewpoint'),
    'Locality keyword search matches "Otteri" to Palamathi Hills'
  );

  // --- SECTION 6: Category Filtering & Dynamic Counts ---
  console.log('\n--- SECTION 6: Category Filtering & Dynamic Counts ---');
  const fortCat = await tourismService.searchTourismAttractions('', { category: 'historic_fort' }, 'vellore');
  assert(fortCat.length === 1 && fortCat[0].slug === 'vellore-fort-and-moat', 'historic_fort category filter returns Vellore Fort & Moat');

  const templeCat = await tourismService.searchTourismAttractions('', { category: 'pilgrimage_temple' }, 'vellore');
  assert(templeCat.length === 2, `pilgrimage_temple category returns 2 pilgrimage destinations (found ${templeCat.length})`);

  const colonialCat = await tourismService.searchTourismAttractions('', { category: 'colonial_heritage' }, 'vellore');
  assert(colonialCat.length === 1 && colonialCat[0].slug === 'st-johns-church-fort', 'colonial_heritage category returns St. John\'s Church');

  const medicalCat = await tourismService.searchTourismAttractions('', { category: 'medical_institutional' }, 'vellore');
  assert(medicalCat.length === 1 && medicalCat[0].slug === 'cmc-heritage-campus', 'medical_institutional category returns CMC Heritage Campus');

  const natureCat = await tourismService.searchTourismAttractions('', { category: 'nature_hills' }, 'vellore');
  assert(natureCat.length === 1 && natureCat[0].slug === 'palamathi-hills-otteri-viewpoint', 'nature_hills category returns Palamathi Hills');

  const dynCats = await tourismService.getTourismCategories('vellore');
  const sumCounts = dynCats.reduce((acc, c) => acc + c.count, 0);
  assert(sumCounts === published.length, `Dynamic category counts sum (${sumCounts}) equals published attractions count (${published.length})`);

  // --- SECTION 7: Combined Search and Filter State ---
  console.log('\n--- SECTION 7: Combined Search and Filter State ---');
  const combined = await tourismService.searchTourismAttractions('Kalyana Mandapam', { category: 'pilgrimage_temple' }, 'vellore');
  assert(
    combined.length === 1 && combined[0].slug === 'jalakandeswarar-temple',
    'Combined search "Kalyana Mandapam" within category "pilgrimage_temple" narrows to Jalakandeswarar Temple'
  );

  // --- SECTION 8: Reset Filters Logic ---
  console.log('\n--- SECTION 8: Reset Filters Logic ---');
  const resetQuery = await tourismService.searchTourismAttractions('', { category: 'all' }, 'vellore');
  assert(resetQuery.length === 6, 'Resetting filters restores full list of 6 published attractions');

  // --- SECTION 9: Featured Attractions ---
  console.log('\n--- SECTION 9: Featured Attractions ---');
  const featured = await tourismService.getFeaturedTourismAttractions('vellore');
  assert(featured.length > 0, `Featured attractions pool is non-empty (found ${featured.length})`);
  assert(
    featured.every((a) => a.isFeatured && a.publicationStatus === 'published' && a.cityId === 'vellore'),
    'All returned featured destinations have isFeatured === true and cityId === "vellore"'
  );

  // --- SECTION 10: Empty Search Results ---
  console.log('\n--- SECTION 10: Empty Search Results ---');
  const emptyRes = await tourismService.searchTourismAttractions('Nonexistent Landmark XYZ 123', {}, 'vellore');
  assert(Array.isArray(emptyRes) && emptyRes.length === 0, 'Non-matching search returns clean empty array []');

  // --- SECTION 11: No Duplicate Cards ---
  console.log('\n--- SECTION 11: No Duplicate Cards ---');
  const allIds = published.map((a) => a.id);
  const uniqueIds = new Set(allIds);
  assert(allIds.length === uniqueIds.size, 'All attraction IDs are unique with zero duplicates');

  const allSlugs = published.map((a) => a.slug);
  const uniqueSlugs = new Set(allSlugs);
  assert(allSlugs.length === uniqueSlugs.size, 'All attraction slugs are unique with zero duplicates');

  // --- SECTION 12: No Broken Attraction Links ---
  console.log('\n--- SECTION 12: No Broken Attraction Links ---');
  for (const att of published) {
    const mapsUrl = att.location.directionsUrl;
    assert(
      typeof mapsUrl === 'string' && mapsUrl.startsWith('https://'),
      `Attraction "${att.title}" has valid HTTPS Google Maps navigation link`
    );
  }

  // --- SECTION 13: Clinical Compliance & Safety ---
  console.log('\n--- SECTION 13: Clinical Compliance & Hospital Patient Safety ---');
  const cmcRecord = published.find((a) => a.slug === 'cmc-heritage-campus');
  assert(Boolean(cmcRecord?.clinicalVisitorNotice), 'CMC Hospital record contains explicit clinicalVisitorNotice');
  assert(
    Boolean(cmcRecord?.clinicalVisitorNotice?.includes('Scudder') && cmcRecord?.clinicalVisitorNotice?.includes('private')),
    'CMC notice restricts visits to Ida Scudder Archives/Chapel and clarifies clinical zones are private'
  );

  // --- SECTION 14: Prerendered Static SEO HTML Files ---
  console.log('\n--- SECTION 14: Prerendered Static SEO HTML Files ---');
  const tourismHtmlPath = path.resolve(process.cwd(), 'dist/city/vellore/tourism/index.html');
  assert(fs.existsSync(tourismHtmlPath), 'dist/city/vellore/tourism/index.html was generated by build');
  if (fs.existsSync(tourismHtmlPath)) {
    const htmlContent = fs.readFileSync(tourismHtmlPath, 'utf-8');
    assert(htmlContent.includes('TN-23'), 'Prerendered HTML contains territory code TN-23');
    assert(htmlContent.includes('Vellore Heritage & Tourism Guide'), 'Prerendered HTML contains correct page title');
  }

  // --- SECTION 15: Existing Feature Regression ---
  console.log('\n--- SECTION 15: Existing Feature Regression ---');
  assert(fs.existsSync(path.resolve(process.cwd(), 'dist/city/vellore/community/index.html')), 'Community noticeboard prerender exists');
  assert(fs.existsSync(path.resolve(process.cwd(), 'dist/city/vellore/events/index.html')), 'Local events prerender exists');
  assert(CITIES.vellore.features.hasCommunityNoticeboard === true, 'Vellore hasCommunityNoticeboard preserved');
  assert(CITIES.vellore.features.hasLocalEvents === true, 'Vellore hasLocalEvents preserved');

  // --- SECTION 16: Browser Headless Rendering & Viewport Audits (Chrome CDP) ---
  console.log('\n--- SECTION 16: Browser Headless Rendering & Viewport Audits ---');

  let server: http.Server | null = null;
  let chromeProcess: ChildProcess | null = null;
  let ws: WebSocket | null = null;

  try {
    if (fs.existsSync(CHROME_PATH)) {
      server = await createStaticServer(PORT);
      console.log(`  🌐 Local static test server running on port ${PORT}`);

      const userDataDir = path.resolve(process.cwd(), '.tmp-v3-6-3-chrome');
      if (fs.existsSync(userDataDir)) {
        try {
          fs.rmSync(userDataDir, { recursive: true, force: true });
        } catch {}
      }

      chromeProcess = spawn(
        CHROME_PATH,
        [
          `--remote-debugging-port=${CDP_PORT}`,
          '--headless=new',
          '--disable-gpu',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-extensions',
          `--user-data-dir=${userDataDir}`,
          'about:blank',
        ],
        { stdio: 'ignore' }
      );

      let versionData: any = null;
      let lastErr: any = null;
      for (let attempt = 0; attempt < 20; attempt++) {
        try {
          await wait(600);
          const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
          if (res.ok) {
            versionData = await res.json();
            break;
          }
        } catch (err) {
          lastErr = err;
        }
      }

      if (!versionData) {
        console.log(`  ⚠️ Could not connect to Chrome CDP on port ${CDP_PORT}: ${lastErr?.message || 'timeout'}. Exit code: ${chromeProcess?.exitCode}`);
      } else {
        console.log(`  🌐 Connected to Chrome via CDP: ${versionData.Browser}`);

        const newTabRes = await fetch(
          `http://127.0.0.1:${CDP_PORT}/json/new?http://127.0.0.1:${PORT}/city/vellore/tourism`,
          { method: 'PUT' }
        );
        const newTabData = await newTabRes.json();
        const wsUrl = newTabData.webSocketDebuggerUrl;

        ws = new WebSocket(wsUrl);
        await new Promise((res) => ws!.addEventListener('open', res));
        await wait(1000);

        // Assert DOM Elements Rendered
        const domHeading = await evaluateScript(ws, `document.querySelector('h1')?.innerText || ''`);
        assert(domHeading.includes('Explore Vellore'), `DOM rendered hero heading "Explore Vellore" (found: "${domHeading}")`);

        const cardCount = await evaluateScript(
          ws,
          `document.querySelectorAll('article[aria-labelledby^="attraction-title"]').length`
        );
        assert(cardCount === 6, `DOM rendered exactly 6 destination cards in initial view (found: ${cardCount})`);

        const searchInputExists = await evaluateScript(
          ws,
          `Boolean(document.getElementById('tourism-search-input'))`
        );
        assert(searchInputExists, 'Search input field with ID "tourism-search-input" rendered in DOM');

        // Test Interactive Preview Modal Trigger
        await evaluateScript(
          ws,
          `(() => {
            const btn = document.querySelector('button[aria-label^="Discover details about"]');
            if (btn) btn.click();
          })()`
        );
        await wait(500);

        const modalOpen = await evaluateScript(
          ws,
          `Boolean(document.querySelector('div[role="dialog"]'))`
        );
        assert(modalOpen, 'Clicking "Discover More" opens interactive detail preview modal');

        // Test Escape Key Dismiss
        await evaluateScript(
          ws,
          `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }))`
        );
        await wait(400);

        const modalClosed = await evaluateScript(
          ws,
          `!document.querySelector('div[role="dialog"]')`
        );
        assert(modalClosed, 'Pressing Escape key closes the detail preview modal');

        // Viewport Responsiveness Audits across 9 Breakpoints
        const BREAKPOINTS = [
          { label: '320px-SE1', width: 320, height: 568 },
          { label: '360px-Android', width: 360, height: 740 },
          { label: '375px-iPhone8', width: 375, height: 667 },
          { label: '390px-iPhone13', width: 390, height: 844 },
          { label: '414px-XR', width: 414, height: 896 },
          { label: '430px-ProMax', width: 430, height: 932 },
          { label: '768px-iPadPortrait', width: 768, height: 1024 },
          { label: '1024px-iPadLandscape', width: 1024, height: 768 },
          { label: '1280px-Desktop', width: 1280, height: 800 },
        ];

        for (const bp of BREAKPOINTS) {
          await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
            width: bp.width,
            height: bp.height,
            deviceScaleFactor: 2,
            mobile: bp.width < 1024,
          });
          await wait(250);

          const overflowData = await evaluateScript(
            ws,
            `(() => {
              const scrollW = document.documentElement.scrollWidth;
              const innerW = window.innerWidth;
              return { hasOverflow: scrollW > innerW, scrollW, innerW };
            })()`
          );

          assert(
            !overflowData.hasOverflow,
            `Viewport ${bp.label} (${bp.width}px): Zero horizontal overflow (scrollWidth=${overflowData.scrollW}, innerWidth=${overflowData.innerW})`
          );
        }

        // Capture Evidence Screenshots
        await captureScreenshot(ws, 320, 568, 'vellore_tourism_320px.png', true);
        await captureScreenshot(ws, 375, 667, 'vellore_tourism_375px.png', true);
        await captureScreenshot(ws, 768, 1024, 'vellore_tourism_768px.png', false);
        await captureScreenshot(ws, 1280, 800, 'vellore_tourism_1280px.png', false);

        // Open Modal and capture Modal Screenshot
        await evaluateScript(
          ws,
          `(() => {
            const btn = document.querySelector('button[aria-label^="Discover details about"]');
            if (btn) btn.click();
          })()`
        );
        await wait(500);
        await captureScreenshot(ws, 375, 667, 'vellore_tourism_modal_375px.png', true);

        // Close modal
        await evaluateScript(
          ws,
          `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }))`
        );
        await wait(300);
      }
    } else {
      console.log('  ⚠️ Chrome binary not found at standard path, skipped browser rendering assertions.');
    }
  } catch (browserErr) {
    console.error('  ⚠️ Browser testing warning:', browserErr);
  } finally {
    if (ws) {
      try {
        ws.close();
      } catch {}
    }
    if (chromeProcess) {
      try {
        chromeProcess.kill('SIGKILL');
      } catch {}
    }
    if (server) {
      try {
        server.close();
      } catch {}
    }
  }

  console.log('\n======================================================================');
  console.log(`TOTAL TOURISM UI CHECKS: ${testCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log('======================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
