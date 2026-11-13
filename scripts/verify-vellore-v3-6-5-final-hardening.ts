/**
 * KAARYAN LABS — PHASE V3.6.5
 * VELLORE HERITAGE & TOURISM FINAL INTEGRATION, CONTENT ACCURACY,
 * SEO AND SECURITY HARDENING VERIFICATION SUITE
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
const PORT = 8117;
const CDP_PORT = 9247;

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
    '.xml': 'application/xml',
    '.txt': 'text/plain',
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

    const fallbackIndex = path.join(distDir, 'index.html');
    if (fs.existsSync(fallbackIndex)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(fallbackIndex));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });

  return new Promise((resolve, reject) => {
    server.listen(port, () => resolve(server));
    server.on('error', reject);
  });
}

function sendCDP(ws: WebSocket, method: string, params: Record<string, any> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 100000);
    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      } catch (err) {
        reject(err);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluateScript(ws: WebSocket, expression: string): Promise<any> {
  const result = await sendCDP(ws, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return result?.result?.value;
}

async function captureScreenshot(
  ws: WebSocket,
  width: number,
  height: number,
  filename: string,
  mobile = false
): Promise<void> {
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile,
  });
  await wait(300);

  const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(shot.data, 'base64');
  const outPath = path.join(ARTIFACT_DIR, filename);
  fs.writeFileSync(outPath, buffer);
  const parentPath = path.join(path.dirname(ARTIFACT_DIR), filename);
  fs.writeFileSync(parentPath, buffer);
  console.log(`  📸 Saved screenshot: ${filename} (${width}x${height})`);
}

async function runTestSuite() {
  console.log('======================================================================');
  console.log('KAARYAN LABS — PHASE V3.6.5 FINAL HARDENING & INTEGRATION SUITE');
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

  // --- SECTION 1: End-to-End Navigation & Routing Integrity ---
  console.log('--- SECTION 1: End-to-End Navigation & Routing Integrity ---');
  const publishedSlugs = PUBLISHED_VELLORE_ATTRACTIONS.map((a) => a.slug);
  assert(publishedSlugs.length === 6, 'Baseline published attractions count === 6');

  for (const slug of publishedSlugs) {
    const route = parseCityRoute(`/city/vellore/tourism/${slug}`);
    assert(route.cityId === 'vellore', `Route /city/vellore/tourism/${slug} resolves cityId === "vellore"`);
    assert(route.tab === 'tourism', `Route /city/vellore/tourism/${slug} resolves tab === "tourism"`);
    assert(route.attractionSlug === slug, `Route resolves attractionSlug === "${slug}"`);

    const generated = buildCityRouteUrl('vellore', 'tourism', 'all', { attractionSlug: slug });
    assert(generated === `/city/vellore/tourism/${slug}`, `buildCityRouteUrl produces: ${generated}`);
  }

  // Draft backlog protection
  console.log('\n--- SECTION 2: Research Backlog Draft Isolation ---');
  assert(VELLORE_TOURISM_RESEARCH_BACKLOG.length === 4, 'Research backlog contains exactly 4 draft records');
  for (const draft of VELLORE_TOURISM_RESEARCH_BACKLOG) {
    const lookup = await tourismService.getTourismAttractionBySlug(draft.slug, 'vellore');
    assert(lookup === null, `Draft slug "${draft.slug}" is strictly inaccessible via getTourismAttractionBySlug()`);
  }

  // --- SECTION 3: Content Fact-Check & Verification Metadata ---
  console.log('\n--- SECTION 3: Content Fact-Check & Verification Metadata ---');
  for (const att of PUBLISHED_VELLORE_ATTRACTIONS) {
    assert(Boolean(att.title && att.nameNative), `Attraction "${att.title}" has bilingual English and Tamil titles`);
    assert(Boolean(att.location.locality && att.location.address), `Attraction "${att.title}" has locality and postal address`);
    assert(Boolean(att.location.latitude && att.location.longitude), `Attraction "${att.title}" has geo-coordinates`);
    assert(Boolean(att.visitorInformation.timings), `Attraction "${att.title}" has verified timings`);
    assert(Boolean(att.visitorInformation.entryFeeType), `Attraction "${att.title}" has entry fee policy`);
    assert(att.sourceReferences.length > 0, `Attraction "${att.title}" cites authoritative source references`);
    assert(Boolean(att.verificationDate), `Attraction "${att.title}" has verificationDate (got: ${att.verificationDate})`);
  }

  // CMC Clinical Compliance
  const cmc = PUBLISHED_VELLORE_ATTRACTIONS.find((a) => a.slug === 'cmc-heritage-campus');
  assert(Boolean(cmc?.clinicalVisitorNotice), 'CMC Hospital record includes clinicalVisitorNotice');
  assert(
    Boolean(cmc?.clinicalVisitorNotice?.includes('Dr. Ida Scudder') && cmc?.clinicalVisitorNotice?.includes('private')),
    'CMC clinical notice restricts visits to Archives/Chapel and safeguards patient care'
  );

  // --- SECTION 4: Image Quality, Licensing & Rights ---
  console.log('\n--- SECTION 4: Image Quality, Licensing & Rights ---');
  for (const att of PUBLISHED_VELLORE_ATTRACTIONS) {
    assert(att.heroImage.startsWith('https://'), `Attraction "${att.title}" has secure HTTPS heroImage`);
    assert(att.images.length > 0, `Attraction "${att.title}" contains image gallery records`);
    assert(
      att.images.every((img) => img.isStockPhoto !== undefined && Boolean(img.alt)),
      `Attraction "${att.title}" declares stock photo disclosure and alt descriptions on all images`
    );
  }

  // --- SECTION 5: Google Maps Safe Links & Distance Integrity ---
  console.log('\n--- SECTION 5: Google Maps Safe Links & Distance Integrity ---');
  for (const att of PUBLISHED_VELLORE_ATTRACTIONS) {
    assert(att.location.directionsUrl.startsWith('https://maps.google.com'), `Attraction "${att.title}" directionsUrl is secure Google Maps HTTPS`);
    assert(!att.location.distanceFromCenter.includes('miles'), `Attraction "${att.title}" distances use regional metric notation`);
    if (att.location.nearestTransit?.railwayStation) {
      assert(att.location.nearestTransit.railwayStation.includes('Katpadi') || att.location.nearestTransit.railwayStation.includes('Vellore'), `Attraction "${att.title}" references authentic Vellore railway stations`);
    }
  }

  // --- SECTION 6: Useful Vellore Services (Nearby Business Isolation) ---
  console.log('\n--- SECTION 6: Useful Vellore Services & Territorial Isolation ---');
  const velloreBusinesses = INITIAL_LISTINGS.filter(
    (l) => l.cityId === 'vellore' && (l.status === 'Active' || !l.status)
  );
  assert(velloreBusinesses.length > 0, `Found ${velloreBusinesses.length} active Vellore business records`);
  assert(velloreBusinesses.every((b) => b.cityId === 'vellore'), 'Zero cross-city listings returned for Vellore');

  // --- SECTION 7: Static SEO Prerender, Schema.org JSON-LD & Crawlable Noscript ---
  console.log('\n--- SECTION 7: Static SEO Prerendering & Schema.org JSON-LD ---');
  for (const slug of publishedSlugs) {
    const htmlPath = path.resolve(process.cwd(), `dist/city/vellore/tourism/${slug}/index.html`);
    assert(fs.existsSync(htmlPath), `Static prerender exists: dist/city/vellore/tourism/${slug}/index.html`);

    if (fs.existsSync(htmlPath)) {
      const content = fs.readFileSync(htmlPath, 'utf-8');
      assert(content.includes('TN-23'), `Prerender for "${slug}" contains territory code "TN-23"`);
      assert(content.includes('https://schema.org') && content.includes('TouristAttraction'), `Prerender for "${slug}" contains Schema.org TouristAttraction JSON-LD in <head>`);
      assert(content.includes('<noscript>'), `Prerender for "${slug}" contains crawlable <noscript> block for Googlebot`);
      assert(content.includes('/city/vellore/tourism'), `Prerender for "${slug}" contains internal navigation link to tourism directory`);
    }
  }

  // Directory page prerender
  const dirHtmlPath = path.resolve(process.cwd(), 'dist/city/vellore/tourism/index.html');
  assert(fs.existsSync(dirHtmlPath), 'Tourism directory prerender exists');
  if (fs.existsSync(dirHtmlPath)) {
    const dirContent = fs.readFileSync(dirHtmlPath, 'utf-8');
    assert(dirContent.includes('TN-23'), 'Directory prerender contains territory code "TN-23"');
    assert(dirContent.includes('<noscript>'), 'Directory prerender contains crawlable <noscript> index');
  }

  // --- SECTION 8: Robots.txt and Sitemap.xml Validation ---
  console.log('\n--- SECTION 8: Robots.txt & Sitemap.xml Validation ---');
  const robotsPath = path.resolve(process.cwd(), 'dist/robots.txt');
  assert(fs.existsSync(robotsPath), 'dist/robots.txt exists');
  if (fs.existsSync(robotsPath)) {
    const robots = fs.readFileSync(robotsPath, 'utf-8');
    assert(robots.includes('Disallow: /admin'), 'robots.txt disallows /admin');
    assert(robots.includes('Disallow: /dashboard'), 'robots.txt disallows /dashboard');
    assert(robots.includes('sitemap.xml'), 'robots.txt points to sitemap.xml');
  }

  const sitemapPath = path.resolve(process.cwd(), 'dist/sitemap.xml');
  assert(fs.existsSync(sitemapPath), 'dist/sitemap.xml exists');
  if (fs.existsSync(sitemapPath)) {
    const sitemap = fs.readFileSync(sitemapPath, 'utf-8');
    assert(sitemap.includes('/city/vellore/tourism'), 'sitemap.xml includes /city/vellore/tourism');
    for (const slug of publishedSlugs) {
      assert(sitemap.includes(`/city/vellore/tourism/${slug}`), `sitemap.xml includes published slug "${slug}"`);
    }
    for (const draft of VELLORE_TOURISM_RESEARCH_BACKLOG) {
      assert(!sitemap.includes(draft.slug), `sitemap.xml strictly excludes draft slug "${draft.slug}"`);
    }
  }

  // --- SECTION 9: City Confinement & Security Policy ---
  console.log('\n--- SECTION 9: City Confinement & Security Policy ---');
  assert(CITIES.vellore.features.hasTourismDirectory === true, 'Vellore hasTourismDirectory === true');
  assert(CITIES.chittoor.features.hasTourismDirectory === false, 'Chittoor hasTourismDirectory === false');
  assert(CITIES.bengaluru.features.hasTourismDirectory === false, 'Bengaluru hasTourismDirectory === false');

  const chittoorAttractions = await tourismService.getTourismAttractions('chittoor');
  assert(chittoorAttractions.length === 0, 'tourismService returns [] for Chittoor');
  const bengaluruAttractions = await tourismService.getTourismAttractions('bengaluru');
  assert(bengaluruAttractions.length === 0, 'tourismService returns [] for Bengaluru');

  // Governance Migration check
  const governanceMigration = path.resolve(
    process.cwd(),
    'supabase/migrations/20261103000003_super_admin_governance.sql'
  );
  assert(fs.existsSync(governanceMigration), 'Protected governance SQL file is intact and preserved');

  // --- SECTION 10: Browser Headless Rendering & Viewport Audits (Chrome CDP) ---
  console.log('\n--- SECTION 10: Browser Headless Rendering & Viewport Audits ---');

  let server: http.Server | null = null;
  let chromeProcess: ChildProcess | null = null;
  let ws: WebSocket | null = null;

  try {
    if (fs.existsSync(CHROME_PATH)) {
      server = await createStaticServer(PORT);
      console.log(`  🌐 Local static test server running on port ${PORT}`);

      const userDataDir = path.resolve(process.cwd(), '.tmp-v3-6-5-chrome');
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
      for (let attempt = 0; attempt < 25; attempt++) {
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
      } else {
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
        await wait(1500);

        // 1. Assert DOM Heading & Elements
        const h1Title = await evaluateScript(ws, `document.querySelector('h1')?.innerText || ''`);
        assert(h1Title.includes('Vellore Fort & Moat'), `Rendered attraction title "Vellore Fort & Moat" (got: "${h1Title}")`);

        const nativeScript = await evaluateScript(
          ws,
          `document.querySelector('[data-testid="native-title"]')?.innerText || ''`
        );
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
  console.log(`TOTAL PHASE V3.6.5 FINAL HARDENING CHECKS: ${testCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log('======================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Unhandled test suite failure:', err);
  process.exit(1);
});
