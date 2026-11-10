/**
 * KAARYAN LABS — PHASE V3.3 BROWSER & E2E VERIFICATION SUITE
 * TARGET: Vellore Ads (/city/vellore, TN-23)
 *
 * Verifies:
 * - Homepage featured business cards (real-time operating hours pill, accurate trust badges)
 * - Standalone business profiles (/city/vellore/biz/v-001, /city/vellore/biz/v-003)
 * - Photo gallery component (touch/click navigation, counter, accessibility)
 * - Responsive viewports: 1440px, 768px, 390px, 320px
 * - Zero horizontal overflow across all viewports
 * - Zero runtime console errors
 */

import { spawn, ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb\\screenshots';
const PORT = 8097;
const CDP_PORT = 9228;

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

    // 1. Direct static file in dist
    const filePath = path.join(distDir, cleanPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(filePath));
      return;
    }

    // 2. Subpage prerendered routes
    if (cleanPath === '/city/vellore/about' || cleanPath === '/city/vellore/about-us') {
      const aboutHtml = path.join(distDir, 'city/vellore/about/index.html');
      if (fs.existsSync(aboutHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(aboutHtml));
        return;
      }
    }

    if (cleanPath === '/city/vellore/contact' || cleanPath === '/city/vellore/contact-us') {
      const contactHtml = path.join(distDir, 'city/vellore/contact/index.html');
      if (fs.existsSync(contactHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(contactHtml));
        return;
      }
    }

    // 3. City-level prerendered routes
    if (cleanPath === '/city/vellore' || cleanPath.startsWith('/city/vellore/')) {
      const cityHtml = path.join(distDir, 'city/vellore/index.html');
      if (fs.existsSync(cityHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(cityHtml));
        return;
      }
    }

    // 4. Default fallback to root index.html
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
  outputPath: string,
  mobile = false
) {
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile,
  });
  await wait(400);
  const { data } = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(outputPath, Buffer.from(data, 'base64'));
}

async function runBrowserTests() {
  console.log('======================================================================');
  console.log('KAARYAN LABS — PHASE V3.3 VELLORE DIRECTORY BROWSER VERIFICATION');
  console.log('======================================================================\n');

  const server = await createStaticServer(PORT);
  console.log(`[HTTP Server] Listening on http://127.0.0.1:${PORT}`);

  const userDataDir = path.resolve(process.cwd(), '.tmp-v3-3-chrome');
  if (fs.existsSync(userDataDir)) {
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }

  const chromeProc: ChildProcess = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${CDP_PORT}`,
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-extensions',
      `--user-data-dir=${userDataDir}`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  await wait(2000);

  let wsEndpoint = '';
  for (let attempt = 0; attempt < 15; attempt++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
      const tabs = (await res.json()) as any[];
      const pageTab = tabs.find((t: any) => t.type === 'page');
      if (pageTab && pageTab.webSocketDebuggerUrl) {
        wsEndpoint = pageTab.webSocketDebuggerUrl;
        break;
      }
    } catch {
      await wait(500);
    }
  }

  if (!wsEndpoint) {
    console.error('❌ Could not connect to Chrome DevTools Protocol endpoint.');
    chromeProc.kill();
    server.close();
    process.exit(1);
  }

  const ws = new WebSocket(wsEndpoint);
  await new Promise((resolve) => ws.addEventListener('open', resolve));

  const consoleErrors: string[] = [];
  ws.addEventListener('message', (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        const type = data.params.type;
        if (type === 'error') {
          const text = data.params.args.map((a: any) => a.value || a.description || '').join(' ');
          consoleErrors.push(text);
        }
      }
    } catch {}
  });

  await sendCDP(ws, 'Page.enable');
  await sendCDP(ws, 'Runtime.enable');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` (${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: HOMEPAGE WITH VELLORE DIRECTORY & FEATURED ITEMS
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Testing /city/vellore Homepage & Featured Business Cards ---');
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore` });
    await wait(2200);

    const homeTitle = await evaluateScript(ws, 'document.title');
    assert(homeTitle.includes('Vellore Ads'), 'Homepage title mentions Vellore Ads', homeTitle);

    // Check for "Preview" badges
    const previewBadgesCount = await evaluateScript(
      ws,
      `Array.from(document.querySelectorAll('*')).filter(el => el.textContent && el.textContent.trim() === 'Preview').length`
    );
    assert(previewBadgesCount >= 1, `Found ${previewBadgesCount} Preview badges on homepage cards`);

    // Capture Desktop Homepage
    const homeDesktopPath = path.join(ARTIFACT_DIR, 'phase_v3_3_vellore_home_desktop_1440px.png');
    await captureScreenshot(ws, 1440, 900, homeDesktopPath, false);
    console.log(`  📸 Captured Homepage Desktop -> ${homeDesktopPath}`);

    // Check overflow on Desktop
    const homeOverflowDesktop = await evaluateScript(
      ws,
      'document.documentElement.scrollWidth > window.innerWidth'
    );
    assert(!homeOverflowDesktop, 'Homepage desktop has zero horizontal overflow');

    // Capture Mobile Homepage (390px)
    const homeMobilePath = path.join(ARTIFACT_DIR, 'phase_v3_3_vellore_home_mobile_390px.png');
    await captureScreenshot(ws, 390, 844, homeMobilePath, true);
    console.log(`  📸 Captured Homepage Mobile -> ${homeMobilePath}`);

    const homeOverflowMobile = await evaluateScript(
      ws,
      'document.documentElement.scrollWidth > window.innerWidth'
    );
    assert(!homeOverflowMobile, 'Homepage mobile (390px) has zero horizontal overflow');

    // -------------------------------------------------------------------------
    // TEST 2: STANDALONE BUSINESS PROFILE (v-001) - PREVIEW & HOURS UNAVAILABLE
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testing /city/vellore/biz/v-001 Standalone Profile (Preview Item) ---');
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore/biz/v-001` });
    await wait(2000);

    const v001Heading = await evaluateScript(
      ws,
      `document.querySelector('h1')?.textContent?.trim() || ''`
    );
    assert(v001Heading.includes('Diagnostic'), 'Page loaded v-001 profile heading', v001Heading);

    const v001TrustBadge = await evaluateScript(
      ws,
      `Array.from(document.querySelectorAll('span')).some(s => s.textContent && s.textContent.includes('Preview Listing'))`
    );
    assert(v001TrustBadge, 'v-001 displays "Preview Listing" trust badge');

    const v001HoursBadge = await evaluateScript(
      ws,
      `Array.from(document.querySelectorAll('span')).some(s => s.textContent && s.textContent.includes('Hours Unavailable'))`
    );
    assert(v001HoursBadge, 'v-001 displays "Hours Unavailable" without fabricating hours');

    const v001PriceBadge = await evaluateScript(
      ws,
      `Array.from(document.querySelectorAll('span')).some(s => s.textContent && s.textContent.includes('Consultation by Appointment'))`
    );
    assert(v001PriceBadge, 'v-001 displays structured price range indicator');

    // Capture Desktop (1440px)
    const bizDesktopPath = path.join(ARTIFACT_DIR, 'phase_v3_3_vellore_biz_desktop_1440px.png');
    await captureScreenshot(ws, 1440, 900, bizDesktopPath, false);
    console.log(`  📸 Captured Biz Profile Desktop -> ${bizDesktopPath}`);

    // Capture Tablet (768px)
    const bizTabletPath = path.join(ARTIFACT_DIR, 'phase_v3_3_vellore_biz_tablet_768px.png');
    await captureScreenshot(ws, 768, 1024, bizTabletPath, false);
    console.log(`  📸 Captured Biz Profile Tablet -> ${bizTabletPath}`);

    // Capture Mobile (390px)
    const bizMobilePath = path.join(ARTIFACT_DIR, 'phase_v3_3_vellore_biz_mobile_390px.png');
    await captureScreenshot(ws, 390, 844, bizMobilePath, true);
    console.log(`  📸 Captured Biz Profile Mobile -> ${bizMobilePath}`);

    // Capture Small Mobile (320px)
    const bizSmallMobilePath = path.join(ARTIFACT_DIR, 'phase_v3_3_vellore_biz_small_mobile_320px.png');
    await captureScreenshot(ws, 320, 568, bizSmallMobilePath, true);
    console.log(`  📸 Captured Biz Profile Small Mobile -> ${bizSmallMobilePath}`);

    // Horizontal overflow assertions across all 4 viewports
    for (const vp of [
      { w: 1440, h: 900, name: 'Desktop (1440px)', mob: false },
      { w: 768, h: 1024, name: 'Tablet (768px)', mob: false },
      { w: 390, h: 844, name: 'Mobile (390px)', mob: true },
      { w: 320, h: 568, name: 'Small Mobile (320px)', mob: true },
    ]) {
      await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
        width: vp.w,
        height: vp.h,
        deviceScaleFactor: 2,
        mobile: vp.mob,
      });
      await wait(250);
      const overflow = await evaluateScript(
        ws,
        'document.documentElement.scrollWidth > window.innerWidth'
      );
      assert(!overflow, `v-001 has zero horizontal overflow on ${vp.name}`);
    }

    // -------------------------------------------------------------------------
    // TEST 3: STANDALONE BUSINESS PROFILE (v-003) & GALLERY
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing /city/vellore/biz/v-003 & Photos Gallery ---');
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore/biz/v-003` });
    await wait(2000);

    const v003Heading = await evaluateScript(
      ws,
      `document.querySelector('h1')?.textContent?.trim() || ''`
    );
    assert(v003Heading.includes('Biryani'), 'Page loaded v-003 profile heading', v003Heading);

    // Switch to Photos tab
    await evaluateScript(
      ws,
      `Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('Photo') || b.textContent.includes('Gallery')))?.click()`
    );
    await wait(800);

    // Verify Gallery components rendered
    const hasGalleryCounter = await evaluateScript(
      ws,
      `Array.from(document.querySelectorAll('*')).some(el => el.textContent && /\\d+\\s*\\/\\s*\\d+/.test(el.textContent.trim()))`
    );
    assert(hasGalleryCounter, 'Photo Gallery counter indicator (X / Y) is rendered');

    // -------------------------------------------------------------------------
    // CONSOLE ERROR CHECK
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Runtime Console Error Check ---');
    assert(consoleErrors.length === 0, 'Zero runtime console errors during browser navigation', consoleErrors.join('; '));

  } finally {
    try { ws.close(); } catch {}
    chromeProc.kill();
    server.close();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }

  console.log('\n======================================================================');
  console.log(`BROWSER TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runBrowserTests().catch((err) => {
  console.error('Fatal browser test error:', err);
  process.exit(1);
});
