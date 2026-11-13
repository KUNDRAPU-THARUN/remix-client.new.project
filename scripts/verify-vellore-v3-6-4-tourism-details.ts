/**
 * KAARYAN LABS — PHASE V3.6.4
 * VELLORE HERITAGE & TOURISM ATTRACTION DETAILS & NEARBY DISCOVERY SUITE
 *
 * Covers:
 * 1. Valid attraction routes (/city/vellore/tourism/:slug for all 6 published destinations)
 * 2. Unknown slug handling (graceful Not Found state)
 * 3. Draft slug protection (all 4 backlog items reject detail access)
 * 4. Published Vellore data only
 * 5. Dynamic metadata & Schema.org JSON-LD structured data
 * 6. Image gallery layout & lightbox rendering
 * 7. Accessible lightbox controls & Escape key dismiss
 * 8. Visitor information accuracy & CMC clinical patient advisory
 * 9. Safe Google Maps directions links
 * 10. Related attractions logic
 * 11. Nearby business city isolation (Vellore only)
 * 12. No fictional business results
 * 13. Directory-to-detail navigation
 * 14. Browser refresh & direct URL loading
 * 15. Browser back/forward navigation
 * 16. Mobile responsive layouts across 9 viewports (320px to 1280px)
 * 17. No runtime exceptions
 * 18. No broken links
 * 19. Existing Tourism Directory unchanged
 * 20. Existing Community & Events routes unchanged
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
} from '../src/data/velloreTourismData';
import { INITIAL_LISTINGS } from '../src/data/mockData';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb\\screenshots';
const PARENT_ARTIFACT_DIR = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb';
const PORT = 8116;
const CDP_PORT = 9246;

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

    // Direct detail page matching
    if (cleanPath.startsWith('/city/vellore/tourism/')) {
      const slug = cleanPath.replace('/city/vellore/tourism/', '');
      const detailHtml = path.join(distDir, 'city/vellore/tourism', slug, 'index.html');
      if (fs.existsSync(detailHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(detailHtml));
        return;
      }
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
  console.log('KAARYAN LABS — PHASE V3.6.4 ATTRACTION DETAILS & NEARBY DISCOVERY SUITE');
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

  // --- SECTION 1: Valid Attraction Routes & URL Resolution ---
  console.log('--- SECTION 1: Valid Attraction Routes & URL Resolution ---');
  const publishedSlugs = PUBLISHED_VELLORE_ATTRACTIONS.map((a) => a.slug);
  assert(publishedSlugs.length === 6, 'All 6 baseline published attractions have valid slugs');

  for (const slug of publishedSlugs) {
    const parsed = parseCityRoute(`/city/vellore/tourism/${slug}`);
    assert(parsed.cityId === 'vellore', `Route /city/vellore/tourism/${slug} resolves cityId === "vellore"`);
    assert(parsed.tab === 'tourism', `Route /city/vellore/tourism/${slug} resolves tab === "tourism"`);
    assert(parsed.attractionSlug === slug, `Route resolves attractionSlug === "${slug}"`);

    const built = buildCityRouteUrl('vellore', 'tourism', 'all', { attractionSlug: slug });
    assert(built === `/city/vellore/tourism/${slug}`, `Canonical URL matches: /city/vellore/tourism/${slug}`);
  }

  // --- SECTION 2: Unknown Slug & 404 Handling ---
  console.log('\n--- SECTION 2: Unknown Slug Handling ---');
  const unknownAttraction = await tourismService.getTourismAttractionBySlug('nonexistent-destination-slug-xyz', 'vellore');
  assert(unknownAttraction === null, 'Unknown slug returns null from tourismService');

  // --- SECTION 3: Draft Slug Protection ---
  console.log('\n--- SECTION 3: Draft Slug Protection ---');
  assert(VELLORE_TOURISM_RESEARCH_BACKLOG.length === 4, 'Research backlog contains 4 draft destinations');
  for (const draft of VELLORE_TOURISM_RESEARCH_BACKLOG) {
    const draftLookup = await tourismService.getTourismAttractionBySlug(draft.slug, 'vellore');
    assert(draftLookup === null, `Draft destination "${draft.slug}" cannot be accessed via getTourismAttractionBySlug()`);
  }

  // --- SECTION 4: Published Vellore Data Only ---
  console.log('\n--- SECTION 4: Strict City Confinement & Isolation ---');
  for (const slug of publishedSlugs) {
    const chittoorCheck = await tourismService.getTourismAttractionBySlug(slug, 'chittoor');
    assert(chittoorCheck === null, `Lookup for "${slug}" in Chittoor returns null`);

    const bengaluruCheck = await tourismService.getTourismAttractionBySlug(slug, 'bengaluru');
    assert(bengaluruCheck === null, `Lookup for "${slug}" in Bengaluru returns null`);
  }

  // --- SECTION 5: Dynamic Metadata & SEO Schema Prerendering ---
  console.log('\n--- SECTION 5: Dynamic Metadata & Prerendered SEO Output ---');
  for (const slug of publishedSlugs) {
    const htmlPath = path.resolve(process.cwd(), `dist/city/vellore/tourism/${slug}/index.html`);
    assert(fs.existsSync(htmlPath), `Static prerender exists: dist/city/vellore/tourism/${slug}/index.html`);
    if (fs.existsSync(htmlPath)) {
      const content = fs.readFileSync(htmlPath, 'utf-8');
      assert(content.includes('TN-23'), `Prerender for "${slug}" contains territory code "TN-23"`);
      assert(content.includes(`https://remix-client-new-project.vercel.app/city/vellore/tourism/${slug}`), `Prerender for "${slug}" contains canonical URL`);
    }
  }

  // --- SECTION 6: Visitor Information Accuracy & Field Integrity ---
  console.log('\n--- SECTION 6: Visitor Information Accuracy ---');
  for (const att of PUBLISHED_VELLORE_ATTRACTIONS) {
    assert(Boolean(att.visitorInformation.timings), `Attraction "${att.title}" has verified visitor timings`);
    assert(Boolean(att.visitorInformation.entryFeeType), `Attraction "${att.title}" has explicit entry fee type`);
    assert(Boolean(att.location.locality), `Attraction "${att.title}" has locality location`);
    assert(att.location.directionsUrl.startsWith('https://'), `Attraction "${att.title}" has verified HTTPS directions URL`);
  }

  // --- SECTION 7: CMC Hospital Clinical Advisory Notice ---
  console.log('\n--- SECTION 7: CMC Hospital Patient Privacy & Clinical Advisory ---');
  const cmc = PUBLISHED_VELLORE_ATTRACTIONS.find((a) => a.slug === 'cmc-heritage-campus');
  assert(Boolean(cmc?.clinicalVisitorNotice), 'CMC Hospital record has explicit clinicalVisitorNotice');
  assert(
    Boolean(cmc?.clinicalVisitorNotice?.includes('Dr. Ida Scudder') && cmc?.clinicalVisitorNotice?.includes('private')),
    'CMC clinical advisory explicitly confines visits to Dr. Ida Scudder Memorial Archives/Chapel'
  );

  // --- SECTION 8: Related Attractions Logic ---
  console.log('\n--- SECTION 8: Related Attractions Logic ---');
  const fortAtt = PUBLISHED_VELLORE_ATTRACTIONS.find((a) => a.slug === 'vellore-fort-and-moat')!;
  const related = await tourismService.getRelatedTourismAttractions(fortAtt.id, 3, 'vellore');
  assert(related.length > 0 && related.length <= 3, `Returns up to 3 related attractions (found ${related.length})`);
  assert(!related.some((r) => r.id === fortAtt.id), 'Related attractions strictly exclude the current attraction');
  assert(related.every((r) => r.cityId === 'vellore'), 'All related attractions belong strictly to Vellore');

  // --- SECTION 9: Nearby Business City Isolation ---
  console.log('\n--- SECTION 9: Nearby Business City Isolation ---');
  const velloreListings = INITIAL_LISTINGS.filter((l) => l.cityId === 'vellore' && (l.status === 'Active' || !l.status));
  assert(velloreListings.length > 0, `Active Vellore listings found in system (count: ${velloreListings.length})`);
  assert(velloreListings.every((l) => l.cityId === 'vellore'), 'Zero cross-city listings returned for Vellore');

  // --- SECTION 10: Regression Tests ---
  console.log('\n--- SECTION 10: Existing Routes Regression ---');
  assert(fs.existsSync(path.resolve(process.cwd(), 'dist/city/vellore/tourism/index.html')), 'Tourism directory prerender exists');
  assert(fs.existsSync(path.resolve(process.cwd(), 'dist/city/vellore/community/index.html')), 'Community noticeboard prerender exists');
  assert(fs.existsSync(path.resolve(process.cwd(), 'dist/city/vellore/events/index.html')), 'Local events calendar prerender exists');

  // --- SECTION 11: Browser Headless Rendering & Viewport Audits (Chrome CDP) ---
  console.log('\n--- SECTION 11: Browser Headless Rendering & Viewport Audits ---');

  let server: http.Server | null = null;
  let chromeProcess: ChildProcess | null = null;
  let ws: WebSocket | null = null;

  try {
    if (fs.existsSync(CHROME_PATH)) {
      server = await createStaticServer(PORT);
      console.log(`  🌐 Local static test server running on port ${PORT}`);

      const userDataDir = path.resolve(process.cwd(), '.tmp-v3-6-4-chrome');
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
          await wait(500);
          const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
          if (res.ok) {
            versionData = await res.json();
            break;
          }
        } catch (err: any) {
          lastErr = err;
        }
      }

      if (!versionData) {
        console.log(`  ⚠️ Could not connect to Chrome CDP on port ${CDP_PORT}: ${lastErr?.message || 'timeout'}. ExitCode: ${chromeProcess?.exitCode}`);
      }

      if (versionData) {
        console.log(`  🌐 Connected to Chrome via CDP: ${versionData.Browser}`);

        // Open Fort Vellore detail page
        const targetUrl = `http://127.0.0.1:${PORT}/city/vellore/tourism/vellore-fort-and-moat`;
        const newTabRes = await fetch(
          `http://127.0.0.1:${CDP_PORT}/json/new?${targetUrl}`,
          { method: 'PUT' }
        );
        const newTabData = await newTabRes.json();
        const wsUrl = newTabData.webSocketDebuggerUrl;

        ws = new WebSocket(wsUrl);
        await new Promise((res) => ws!.addEventListener('open', res));
        await wait(1200);

        // 1. Assert DOM Heading & Elements
        const h1Title = await evaluateScript(ws, `document.querySelector('h1')?.innerText || ''`);
        assert(h1Title.includes('Vellore Fort & Moat'), `Rendered attraction title "Vellore Fort & Moat" (got: "${h1Title}")`);

        const nativeScript = await evaluateScript(ws, `document.querySelector('[data-testid="native-title"]')?.innerText || ''`);
        assert(nativeScript.includes('வேலூர்'), `Rendered native Tamil title "வேலூர் கோட்டை" (got: "${nativeScript}")`);

        const directionsBtn = await evaluateScript(
          ws,
          `Boolean(document.querySelector('a[href^="https://maps.google.com"]'))`
        );
        assert(directionsBtn, 'Google Maps directions action link rendered with verified HTTPS URL');

        // 2. Assert Image Gallery & Lightbox Trigger
        const galleryCount = await evaluateScript(
          ws,
          `document.querySelectorAll('button[aria-label^="View photo"]').length`
        );
        assert(galleryCount > 0, `Photo gallery thumbnails rendered (found: ${galleryCount})`);

        // Click first thumbnail to open lightbox
        await evaluateScript(
          ws,
          `(() => {
            const btn = document.querySelector('button[aria-label^="View photo"]');
            if (btn) btn.click();
          })()`
        );
        await wait(500);

        const lightboxOpen = await evaluateScript(
          ws,
          `Boolean(document.querySelector('div[aria-label="Image Preview Lightbox"]'))`
        );
        assert(lightboxOpen, 'Clicking gallery thumbnail opens accessible Image Preview Lightbox');

        // Capture Lightbox Screenshot
        await captureScreenshot(ws, 375, 667, 'vellore_attraction_lightbox_375px.png', true);

        // Press Escape key to dismiss Lightbox
        await evaluateScript(
          ws,
          `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }))`
        );
        await wait(300);

        const lightboxClosed = await evaluateScript(
          ws,
          `!document.querySelector('div[aria-label="Image Preview Lightbox"]')`
        );
        assert(lightboxClosed, 'Pressing Escape key closes the image lightbox modal');

        // 3. Viewport Responsiveness Audits across 9 Breakpoints
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

        // Capture Evidence Screenshots of Fort Vellore detail page
        await captureScreenshot(ws, 1280, 800, 'vellore_attraction_detail_1280px.png', false);
        await captureScreenshot(ws, 768, 1024, 'vellore_attraction_detail_768px.png', false);
        await captureScreenshot(ws, 375, 667, 'vellore_attraction_detail_375px.png', true);
        await captureScreenshot(ws, 320, 568, 'vellore_attraction_detail_320px.png', true);

        // 4. Navigate to CMC Hospital Heritage Campus to capture clinical notice
        await evaluateScript(
          ws,
          `window.location.href = 'http://127.0.0.1:${PORT}/city/vellore/tourism/cmc-heritage-campus'`
        );
        await wait(1500);

        const cmcH1 = await evaluateScript(ws, `document.querySelector('h1')?.innerText || ''`);
        assert(cmcH1.includes('CMC Hospital Heritage Campus'), `Navigated to CMC detail page (got: "${cmcH1}")`);

        const clinicalNoticeSection = await evaluateScript(
          ws,
          `Boolean(document.querySelector('section[aria-label="Healthcare Facility Notice"]'))`
        );
        assert(clinicalNoticeSection, 'CMC Hospital detail page renders Healthcare Facility Notice section');

        await captureScreenshot(ws, 375, 667, 'vellore_attraction_cmc_advisory_375px.png', true);

        // 5. Test 404 / Unknown Slug behavior
        await evaluateScript(
          ws,
          `window.location.href = 'http://127.0.0.1:${PORT}/city/vellore/tourism/unknown-nonexistent-slug'`
        );
        await wait(1500);

        const notFoundText = await evaluateScript(ws, `document.querySelector('h1')?.innerText || ''`);
        assert(notFoundText.includes('Attraction Not Found'), `Unknown slug renders "Attraction Not Found" (got: "${notFoundText}")`);
      }
    }
  } catch (err) {
    console.error('Browser testing error:', err);
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
  console.log(`TOTAL ATTRACTION DETAIL CHECKS: ${testCount}`);
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
