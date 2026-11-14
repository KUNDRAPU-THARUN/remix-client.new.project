/**
 * KAARYAN LABS — PHASE V3.6.9
 * PRODUCTION TOURISM NAVIGATION VERIFICATION SUITE
 * 
 * Verifies that the Tourism navigation defect is permanently fixed across:
 * - Repeated desktop navbar transitions (Sequences A, B, C, D, E)
 * - Mobile navigation drawer across 320px, 375px, 390px, 430px, 768px, 1280px
 * - Homepage section CTA button ("Explore All Tourism Guide")
 * - Site footer link ("Heritage & Tourism Guide")
 * - Breadcrumbs and detail page navigation
 * - Browser Back and Forward history navigation
 * - Cross-city protection & regional isolation (Chittoor, Bengaluru)
 * - Zero console errors and zero React warnings
 */

import { spawn, ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb\\screenshots';
const PORT = 8121;
const CDP_PORT = 9248;

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
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
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

    const dirHtml = path.join(distDir, cleanPath, 'index.html');
    if (fs.existsSync(dirHtml)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(dirHtml));
      return;
    }

    if (cleanPath.startsWith('/city/vellore/tourism')) {
      const tourismHtml = path.join(distDir, 'city/vellore/tourism/index.html');
      if (fs.existsSync(tourismHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(tourismHtml));
        return;
      }
    }

    if (cleanPath.startsWith('/city/vellore')) {
      const velloreHtml = path.join(distDir, 'city/vellore/index.html');
      if (fs.existsSync(velloreHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(velloreHtml));
        return;
      }
    }

    if (cleanPath.startsWith('/city/chittoor')) {
      const chittoorHtml = path.join(distDir, 'city/chittoor/index.html');
      if (fs.existsSync(chittoorHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(chittoorHtml));
        return;
      }
    }

    if (cleanPath.startsWith('/city/bengaluru')) {
      const blrHtml = path.join(distDir, 'city/bengaluru/index.html');
      if (fs.existsSync(blrHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(blrHtml));
        return;
      }
    }

    const rootHtml = path.join(distDir, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(rootHtml));
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve(server));
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

async function setViewport(ws: WebSocket, width: number, height: number, mobile = false) {
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile,
  });
  await wait(300);
}

async function captureScreenshot(ws: WebSocket, filename: string) {
  const { data } = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(data, 'base64');
  fs.writeFileSync(path.join(ARTIFACT_DIR, filename), buffer);
  const parentPath = path.resolve(ARTIFACT_DIR, '..', filename);
  fs.writeFileSync(parentPath, buffer);
  console.log(`  📸 Screenshot saved: ${filename}`);
}

interface TestTracker {
  total: number;
  passed: number;
  failed: number;
}

const tracker: TestTracker = { total: 0, passed: 0, failed: 0 };

function assert(condition: boolean, desc: string) {
  tracker.total++;
  if (condition) {
    tracker.passed++;
    console.log(`  ✅ [PASS] ${desc}`);
  } else {
    tracker.failed++;
    console.error(`  ❌ [FAIL] ${desc}`);
  }
}

async function runNavigationVerification() {
  console.log('================================================================');
  console.log('KAARYAN LABS — PHASE V3.6.9 PRODUCTION NAVIGATION VERIFICATION');
  console.log('================================================================\n');

  let server: http.Server | null = null;
  let chromeProcess: ChildProcess | null = null;
  let ws: WebSocket | null = null;
  const consoleErrors: string[] = [];

  try {
    server = await createStaticServer(PORT);
    console.log(`[1] Static Test Server running at http://127.0.0.1:${PORT}`);

    chromeProcess = spawn(
      CHROME_PATH,
      [
        `--remote-debugging-port=${CDP_PORT}`,
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        'about:blank',
      ],
      { stdio: 'ignore' }
    );
    await wait(2000);

    const newTabRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?http://127.0.0.1:${PORT}/city/vellore/tourism`, {
      method: 'PUT',
    });
    const newTabData = await newTabRes.json();
    const wsUrl = newTabData.webSocketDebuggerUrl;

    ws = new WebSocket(wsUrl);
    await new Promise((res) => ws!.addEventListener('open', res));
    console.log('[2] CDP WebSocket connected successfully.\n');

    await sendCDP(ws, 'Page.enable');
    await sendCDP(ws, 'Runtime.enable');

    // Monitor console errors
    ws.addEventListener('message', (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
          consoleErrors.push(JSON.stringify(msg.params.args));
        }
        if (msg.method === 'Runtime.exceptionThrown') {
          consoleErrors.push(JSON.stringify(msg.params.exceptionDetails));
        }
      } catch {}
    });

    // Set Desktop Viewport
    await setViewport(ws, 1280, 800, false);
    await wait(2500);

    // ========================================================================
    // SUITE 1: REPEATED DESKTOP NAVBAR SEQUENCES
    // ========================================================================
    console.log('--- SUITE 1: REPEATED DESKTOP NAVBAR ROUTE SEQUENCES ---');

    // SEQUENCE A: Tourism -> Home -> Tourism
    console.log('\n[Sequence A: Tourism -> Home -> Tourism]');
    let url = await evaluateScript(ws, 'window.location.pathname');
    let hasTourismContent = await evaluateScript(ws, 'Boolean(document.querySelector("h1")?.textContent?.includes("Explore Vellore"))');
    assert(url === '/city/vellore/tourism', 'Step 1: Initial URL is /city/vellore/tourism');
    assert(hasTourismContent, 'Step 1: Initial page renders Explore Vellore heading');

    // Click Home
    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.trim() === 'Home')?.click();
      })()
    `);
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    let hasHomeContent = await evaluateScript(ws, 'Boolean(document.querySelector("h1")?.textContent?.includes("Vellore"))');
    assert(url === '/city/vellore', 'Step 2: URL after clicking Home is /city/vellore');
    assert(hasHomeContent, 'Step 2: Homepage content renders');

    // Click Tourism again
    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.trim() === 'Tourism')?.click();
      })()
    `);
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    hasTourismContent = await evaluateScript(ws, 'Boolean(document.querySelector("h1")?.textContent?.includes("Explore Vellore"))');
    assert(url === '/city/vellore/tourism', 'Step 3: URL after clicking Tourism is /city/vellore/tourism');
    assert(hasTourismContent, 'Step 3: Tourism page reliably renders after Home navigation');

    // SEQUENCE B: Tourism -> Businesses -> Tourism
    console.log('\n[Sequence B: Tourism -> Businesses -> Tourism]');
    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.trim() === 'Businesses')?.click();
      })()
    `);
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    assert(url === '/city/vellore/category/all', 'Step 1: URL after clicking Businesses is /city/vellore/category/all');

    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.trim() === 'Tourism')?.click();
      })()
    `);
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    hasTourismContent = await evaluateScript(ws, 'Boolean(document.querySelector("h1")?.textContent?.includes("Explore Vellore"))');
    assert(url === '/city/vellore/tourism', 'Step 2: URL after clicking Tourism from Businesses is /city/vellore/tourism');
    assert(hasTourismContent, 'Step 2: Tourism page reliably renders after Businesses navigation');

    // SEQUENCE C: Tourism -> Community -> Tourism
    console.log('\n[Sequence C: Tourism -> Community -> Tourism]');
    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.trim() === 'Community')?.click();
      })()
    `);
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    assert(url === '/city/vellore/community', 'Step 1: URL after clicking Community is /city/vellore/community');

    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.trim() === 'Tourism')?.click();
      })()
    `);
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    hasTourismContent = await evaluateScript(ws, 'Boolean(document.querySelector("h1")?.textContent?.includes("Explore Vellore"))');
    assert(url === '/city/vellore/tourism', 'Step 2: URL after clicking Tourism from Community is /city/vellore/tourism');
    assert(hasTourismContent, 'Step 2: Tourism page reliably renders after Community navigation');

    // SEQUENCE D: Tourism -> Events -> Tourism
    console.log('\n[Sequence D: Tourism -> Events -> Tourism]');
    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.trim() === 'Events')?.click();
      })()
    `);
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    assert(url === '/city/vellore/events', 'Step 1: URL after clicking Events is /city/vellore/events');

    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.trim() === 'Tourism')?.click();
      })()
    `);
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    hasTourismContent = await evaluateScript(ws, 'Boolean(document.querySelector("h1")?.textContent?.includes("Explore Vellore"))');
    assert(url === '/city/vellore/tourism', 'Step 2: URL after clicking Tourism from Events is /city/vellore/tourism');
    assert(hasTourismContent, 'Step 2: Tourism page reliably renders after Events navigation');

    // SEQUENCE E: Attraction Detail -> Home -> Tourism (Checking no stale attractionSlug)
    console.log('\n[Sequence E: Attraction Detail -> Home -> Tourism]');
    // Open modal preview via Discover More, then navigate to detail
    await evaluateScript(ws, `
      (() => {
        const discoverBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Discover More'));
        if (discoverBtn) discoverBtn.click();
      })()
    `);
    await wait(400);

    // Click "Full Guide & Discovery →" in modal
    await evaluateScript(ws, `
      (() => {
        const fullGuideBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Full Guide'));
        if (fullGuideBtn) fullGuideBtn.click();
      })()
    `);
    await wait(800);
    url = await evaluateScript(ws, 'window.location.pathname');
    assert(url.startsWith('/city/vellore/tourism/'), `Step 1: Detail page opened at ${url}`);

    // Click Home
    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.trim() === 'Home')?.click();
      })()
    `);
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    assert(url === '/city/vellore', 'Step 2: Home page reached from detail page');

    // Click Tourism in navbar: must open DIRECTORY (/city/vellore/tourism), NOT previous detail slug
    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.trim() === 'Tourism')?.click();
      })()
    `);
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    hasTourismContent = await evaluateScript(ws, 'Boolean(document.querySelector("h1")?.textContent?.includes("Explore Vellore"))');
    assert(url === '/city/vellore/tourism', 'Step 3: URL after clicking Tourism is /city/vellore/tourism (no stale slug)');
    assert(hasTourismContent, 'Step 3: Directory page renders rather than stale detail page');

    // SEQUENCE F: Home -> Tourism -> Home -> Tourism cycle
    console.log('\n[Sequence F: Repeated Rapid Navigation Cycle]');
    for (let cycle = 1; cycle <= 3; cycle++) {
      await evaluateScript(ws, `
        (() => {
          Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.trim() === 'Home')?.click();
        })()
      `);
      await wait(300);
      await evaluateScript(ws, `
        (() => {
          Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.trim() === 'Tourism')?.click();
        })()
      `);
      await wait(300);
      url = await evaluateScript(ws, 'window.location.pathname');
      assert(url === '/city/vellore/tourism', `Rapid cycle ${cycle}: URL is correctly /city/vellore/tourism`);
    }

    await captureScreenshot(ws, 'phase_v3_6_9_desktop_tourism_1280px.png');

    // ========================================================================
    // SUITE 2: HOMEPAGE SECTION CTA & FOOTER LINKS
    // ========================================================================
    console.log('\n--- SUITE 2: HOMEPAGE CTA & FOOTER NAVIGATION ---');

    // Navigate to Home
    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.trim() === 'Home')?.click();
      })()
    `);
    await wait(600);

    // Test Homepage Section CTA ("Explore All Tourism Guide")
    console.log('[Homepage Attractions CTA Button]');
    const ctaFound = await evaluateScript(ws, `
      (() => {
        return Boolean(Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Explore All Tourism Guide')));
      })()
    `);
    assert(ctaFound, 'Homepage CTA button "Explore All Tourism Guide" exists');

    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Explore All Tourism Guide'))?.click();
      })()
    `);
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    hasTourismContent = await evaluateScript(ws, 'Boolean(document.querySelector("h1")?.textContent?.includes("Explore Vellore"))');
    assert(url === '/city/vellore/tourism', 'CTA click navigates to /city/vellore/tourism');
    assert(hasTourismContent, 'CTA click renders Tourism directory');

    // Navigate to Home again
    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.trim() === 'Home')?.click();
      })()
    `);
    await wait(600);

    // Test Footer link ("Heritage & Tourism Guide")
    console.log('\n[Footer Tourism Link]');
    const footerLinkFound = await evaluateScript(ws, `
      (() => {
        return Boolean(Array.from(document.querySelectorAll('footer button')).find(b => b.textContent?.includes('Tourism Guide')));
      })()
    `);
    assert(footerLinkFound, 'Footer "Heritage & Tourism Guide" button exists');

    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('footer button')).find(b => b.textContent?.includes('Tourism Guide'))?.click();
      })()
    `);
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    hasTourismContent = await evaluateScript(ws, 'Boolean(document.querySelector("h1")?.textContent?.includes("Explore Vellore"))');
    assert(url === '/city/vellore/tourism', 'Footer click navigates to /city/vellore/tourism');
    assert(hasTourismContent, 'Footer click renders Tourism directory');

    // ========================================================================
    // SUITE 3: MOBILE DRAWER NAVIGATION ACROSS ALL VIEWPORTS
    // ========================================================================
    console.log('\n--- SUITE 3: MOBILE NAVIGATION DRAWER ACROSS MULTIPLE VIEWPORTS ---');

    const viewports = [
      { name: 'Tablet 768px', w: 768, h: 1024, mobile: true },
      { name: 'iPhone Large 430px', w: 430, h: 932, mobile: true },
      { name: 'iPhone Standard 390px', w: 390, h: 844, mobile: true },
      { name: 'Compact Mobile 375px', w: 375, h: 812, mobile: true },
      { name: 'Ultra Compact 320px', w: 320, h: 650, mobile: true },
    ];

    for (const vp of viewports) {
      console.log(`\n[Viewport: ${vp.name} (${vp.w}x${vp.h})]`);
      await setViewport(ws, vp.w, vp.h, vp.mobile);

      // Open mobile drawer
      await evaluateScript(ws, `
        (() => {
          const menuBtn = document.querySelector('button[aria-label="Toggle navigation menu"]');
          if (menuBtn) menuBtn.click();
        })()
      `);
      await wait(400);

      // Click Home in mobile drawer
      await evaluateScript(ws, `
        (() => {
          const drawer = document.getElementById('mobile-navigation-drawer');
          const homeBtn = Array.from(drawer?.querySelectorAll('button') || []).find(b => b.textContent?.trim() === 'Home');
          if (homeBtn) homeBtn.click();
        })()
      `);
      await wait(600);

      // Open mobile drawer again
      await evaluateScript(ws, `
        (() => {
          const menuBtn = document.querySelector('button[aria-label="Toggle navigation menu"]');
          if (menuBtn) menuBtn.click();
        })()
      `);
      await wait(400);

      let drawerVisible = await evaluateScript(ws, `Boolean(document.getElementById('mobile-navigation-drawer'))`);
      assert(drawerVisible, `${vp.name}: Mobile drawer opened successfully`);

      // Click "Heritage & Tourism"
      await evaluateScript(ws, `
        (() => {
          const drawer = document.getElementById('mobile-navigation-drawer');
          const tourismBtn = Array.from(drawer?.querySelectorAll('button') || []).find(b => b.textContent?.includes('Tourism'));
          if (tourismBtn) tourismBtn.click();
        })()
      `);
      await wait(600);

      url = await evaluateScript(ws, 'window.location.pathname');
      hasTourismContent = await evaluateScript(ws, 'Boolean(document.querySelector("h1")?.textContent?.includes("Explore Vellore"))');
      drawerVisible = await evaluateScript(ws, `Boolean(document.getElementById('mobile-navigation-drawer'))`);

      assert(url === '/city/vellore/tourism', `${vp.name}: Navigated to /city/vellore/tourism`);
      assert(hasTourismContent, `${vp.name}: Tourism page content rendered`);
      assert(!drawerVisible, `${vp.name}: Mobile drawer automatically closed after click`);

      // Verify no horizontal overflow
      const noOverflow = await evaluateScript(ws, 'document.documentElement.scrollWidth <= window.innerWidth + 1');
      assert(noOverflow, `${vp.name}: Zero horizontal overflow`);

      if (vp.w === 375 || vp.w === 320) {
        await captureScreenshot(ws, `phase_v3_6_9_mobile_${vp.w}px.png`);
      }
    }

    // Reset to Desktop Viewport
    await setViewport(ws, 1280, 800, false);
    await wait(300);

    // ========================================================================
    // SUITE 4: BROWSER HISTORY BACK / FORWARD CONTROLS
    // ========================================================================
    console.log('\n--- SUITE 4: BROWSER BACK & FORWARD HISTORY NAVIGATION ---');

    // Start at Home
    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.trim() === 'Home')?.click();
      })()
    `);
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    assert(url === '/city/vellore', 'Base: At Home /city/vellore');

    // Click Tourism
    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.trim() === 'Tourism')?.click();
      })()
    `);
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    assert(url === '/city/vellore/tourism', 'Step 1: Navigated to /city/vellore/tourism');

    // Click an attraction to enter detail page
    await evaluateScript(ws, `
      (() => {
        const discoverBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Discover More'));
        if (discoverBtn) discoverBtn.click();
      })()
    `);
    await wait(400);
    await evaluateScript(ws, `
      (() => {
        const fullGuideBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Full Guide'));
        if (fullGuideBtn) fullGuideBtn.click();
      })()
    `);
    await wait(800);
    url = await evaluateScript(ws, 'window.location.pathname');
    assert(url.startsWith('/city/vellore/tourism/'), `Step 2: Entered detail page ${url}`);

    // Browser BACK (should return to Tourism directory)
    await evaluateScript(ws, 'window.history.back()');
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    hasTourismContent = await evaluateScript(ws, 'Boolean(document.querySelector("h1")?.textContent?.includes("Explore Vellore"))');
    assert(url === '/city/vellore/tourism', 'Browser Back 1: Returned to /city/vellore/tourism');
    assert(hasTourismContent, 'Browser Back 1: Tourism directory content rendered');

    // Browser BACK again (should return to Homepage)
    await evaluateScript(ws, 'window.history.back()');
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    hasHomeContent = await evaluateScript(ws, 'Boolean(document.querySelector("h1")?.textContent?.includes("Vellore"))');
    assert(url === '/city/vellore', 'Browser Back 2: Returned to /city/vellore homepage');
    assert(hasHomeContent, 'Browser Back 2: Homepage content rendered');

    // Browser FORWARD (should return to Tourism directory)
    await evaluateScript(ws, 'window.history.forward()');
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    hasTourismContent = await evaluateScript(ws, 'Boolean(document.querySelector("h1")?.textContent?.includes("Explore Vellore"))');
    assert(url === '/city/vellore/tourism', 'Browser Forward 1: Returned to /city/vellore/tourism');
    assert(hasTourismContent, 'Browser Forward 1: Tourism directory rendered');

    // Browser FORWARD again (should return to attraction detail page)
    await evaluateScript(ws, 'window.history.forward()');
    await wait(800);
    url = await evaluateScript(ws, 'window.location.pathname');
    assert(url.startsWith('/city/vellore/tourism/'), `Browser Forward 2: Returned to detail page ${url}`);

    // ========================================================================
    // SUITE 5: DETAIL PAGE BREADCRUMB & INTERNAL NAVIGATION
    // ========================================================================
    console.log('\n--- SUITE 5: DETAIL PAGE BREADCRUMB & RELATED DISCOVERY ---');

    // Breadcrumb: "Tourism Guide" button
    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('nav[aria-label="Breadcrumb"] button')).find(b => b.textContent?.includes('Tourism Guide'))?.click();
      })()
    `);
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    hasTourismContent = await evaluateScript(ws, 'Boolean(document.querySelector("h1")?.textContent?.includes("Explore Vellore"))');
    assert(url === '/city/vellore/tourism', 'Breadcrumb "Tourism Guide" returned to /city/vellore/tourism');
    assert(hasTourismContent, 'Breadcrumb click rendered directory view');

    // Open detail again
    await evaluateScript(ws, `
      (() => {
        const discoverBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Discover More'));
        if (discoverBtn) discoverBtn.click();
      })()
    `);
    await wait(400);
    await evaluateScript(ws, `
      (() => {
        const fullGuideBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Full Guide'));
        if (fullGuideBtn) fullGuideBtn.click();
      })()
    `);
    await wait(800);

    // Detail page "Directory" button in header bar
    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Directory'))?.click();
      })()
    `);
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    assert(url === '/city/vellore/tourism', 'Header "Directory" button returned to /city/vellore/tourism');

    // ========================================================================
    // SUITE 6: CROSS-CITY PROTECTION & THREE-CITY ISOLATION
    // ========================================================================
    console.log('\n--- SUITE 6: CROSS-CITY REGIONAL ISOLATION (CHITTOOR & BENGALURU) ---');

    // Test Chittoor
    await evaluateScript(ws, `window.location.href = 'http://127.0.0.1:${PORT}/city/chittoor'`);
    await wait(1500);
    url = await evaluateScript(ws, 'window.location.pathname');
    assert(url === '/city/chittoor', 'Chittoor homepage loads correctly at /city/chittoor');

    const chittoorHasTourismNav = await evaluateScript(ws, `
      (() => {
        return Boolean(Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.trim() === 'Tourism'));
      })()
    `);
    assert(!chittoorHasTourismNav, 'Chittoor navbar does NOT contain Tourism link');

    const chittoorHasTourismFooter = await evaluateScript(ws, `
      (() => {
        return Boolean(Array.from(document.querySelectorAll('footer button')).find(b => b.textContent?.includes('Tourism Guide')));
      })()
    `);
    assert(!chittoorHasTourismFooter, 'Chittoor footer does NOT contain Tourism link');

    // Attempt direct access to /city/chittoor/tourism
    await evaluateScript(ws, `window.location.href = 'http://127.0.0.1:${PORT}/city/chittoor/tourism'`);
    await wait(1500);
    const chittoorExclusiveNotice = await evaluateScript(ws, `
      (() => {
        return Boolean(document.body.textContent?.includes('exclusive to Vellore Ads'));
      })()
    `);
    assert(chittoorExclusiveNotice, '/city/chittoor/tourism displays region lock screen (exclusive to Vellore)');

    // Click "Return to Chittoor Home" on lock screen
    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Return to Chittoor Home'))?.click();
      })()
    `);
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    assert(url === '/city/chittoor', 'Region lock button safely returned to /city/chittoor');

    // Test Bengaluru
    await evaluateScript(ws, `window.location.href = 'http://127.0.0.1:${PORT}/city/bengaluru'`);
    await wait(1500);
    url = await evaluateScript(ws, 'window.location.pathname');
    assert(url === '/city/bengaluru', 'Bengaluru homepage loads correctly at /city/bengaluru');

    const blrHasTourismNav = await evaluateScript(ws, `
      (() => {
        return Boolean(Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.trim() === 'Tourism'));
      })()
    `);
    assert(!blrHasTourismNav, 'Bengaluru navbar does NOT contain Tourism link');

    const blrHasTourismFooter = await evaluateScript(ws, `
      (() => {
        return Boolean(Array.from(document.querySelectorAll('footer button')).find(b => b.textContent?.includes('Tourism Guide')));
      })()
    `);
    assert(!blrHasTourismFooter, 'Bengaluru footer does NOT contain Tourism link');

    // Attempt direct access to /city/bengaluru/tourism
    await evaluateScript(ws, `window.location.href = 'http://127.0.0.1:${PORT}/city/bengaluru/tourism'`);
    await wait(1500);
    const blrExclusiveNotice = await evaluateScript(ws, `
      (() => {
        return Boolean(document.body.textContent?.includes('exclusive to Vellore Ads'));
      })()
    `);
    assert(blrExclusiveNotice, '/city/bengaluru/tourism displays region lock screen (exclusive to Vellore)');

    // Click "Return to Bengaluru Home" on lock screen
    await evaluateScript(ws, `
      (() => {
        Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Return to Bengaluru Home'))?.click();
      })()
    `);
    await wait(600);
    url = await evaluateScript(ws, 'window.location.pathname');
    assert(url === '/city/bengaluru', 'Region lock button safely returned to /city/bengaluru');

    // ========================================================================
    // SUITE 7: CONSOLE ERROR AUDIT
    // ========================================================================
    console.log('\n--- SUITE 7: CONSOLE ERROR & EXCEPTION AUDIT ---');
    console.log(`  Logged console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('  Warnings/Errors:', consoleErrors);
    }
    assert(consoleErrors.length === 0, 'Zero runtime console errors or uncaught exceptions during all tests');

  } catch (err) {
    console.error('Test execution failed:', err);
    tracker.failed++;
  } finally {
    if (ws) ws.close();
    if (chromeProcess) chromeProcess.kill();
    if (server) {
      await new Promise((res) => server!.close(res));
    }
  }

  console.log('\n================================================================');
  console.log(`FINAL RESULT: ${tracker.passed} / ${tracker.total} PASSED (${tracker.failed} FAILED)`);
  console.log('================================================================');

  if (tracker.failed > 0) {
    process.exit(1);
  }
}

runNavigationVerification();
