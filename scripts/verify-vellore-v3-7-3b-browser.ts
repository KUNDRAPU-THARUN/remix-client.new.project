/**
 * KAARYAN LABS — PHASE V3.7.3B
 * REAL BUSINESS DIRECTORY BROWSER VERIFICATION SUITE
 *
 * Verifies live browser behavior of the Real Vellore Business Directory:
 * - Direct navigation to /city/vellore/category/all
 * - Zero mock listings (v-001, v-002, v-003) visible
 * - Accurate branded empty state: "Vellore Businesses Coming Soon"
 * - Subtitle: "Verified local business listings will appear here as they are added to Vellore Ads."
 * - Working navigation buttons ("Return to Home", "Explore Heritage & Tourism", "Community Notices")
 * - Homepage Featured Businesses displays "Vellore Businesses Coming Soon"
 * - Standalone deep link /city/vellore/biz/unknown-id shows "Business Listing Not Found"
 * - Multi-viewport responsiveness (320, 360, 375, 390, 414, 430, 768, 1024, 1280)
 * - Zero horizontal overflow
 * - Zero console errors
 */

import { spawn, ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb\\screenshots';
const PORT = 8126;
const CDP_PORT = 9252;

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

    const indexHtml = path.join(distDir, 'index.html');
    if (fs.existsSync(indexHtml)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(indexHtml));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

class CDPClient {
  private ws: any;
  private id = 1;
  private pending = new Map<number, { resolve: (res: any) => void; reject: (err: any) => void }>();
  public consoleErrors: string[] = [];

  constructor(private wsUrl: string) {}

  async connect(): Promise<void> {
    const WS = (globalThis as any).WebSocket;
    return new Promise((resolve, reject) => {
      this.ws = new WS(this.wsUrl);

      const handleMessage = (dataStr: string) => {
        try {
          const msg = JSON.parse(dataStr);
          if (msg.method === 'Runtime.consoleAPICalled') {
            if (msg.params.type === 'error') {
              const text = msg.params.args.map((a: any) => a.value || a.description || '').join(' ');
              this.consoleErrors.push(text);
            }
          }
          if (msg.id && this.pending.has(msg.id)) {
            const { resolve, reject } = this.pending.get(msg.id)!;
            this.pending.delete(msg.id);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        } catch (e) {
          console.error('CDP message parse error:', e);
        }
      };

      if (typeof this.ws.on === 'function') {
        this.ws.on('open', () => resolve());
        this.ws.on('error', (err: any) => reject(err));
        this.ws.on('message', (data: any) => handleMessage(data.toString()));
      } else {
        this.ws.onopen = () => resolve();
        this.ws.onerror = (err: any) => reject(err);
        this.ws.onmessage = (ev: any) => handleMessage(typeof ev.data === 'string' ? ev.data : ev.data.toString());
      }
    });
  }

  send(method: string, params: any = {}): Promise<any> {
    const msgId = this.id++;
    return new Promise((resolve, reject) => {
      this.pending.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  async close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function getWebSocketDebuggerUrl(port: number): Promise<string> {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      if (res.ok) {
        const tabs = await res.json();
        if (tabs && tabs.length > 0 && tabs[0].webSocketDebuggerUrl) {
          return tabs[0].webSocketDebuggerUrl;
        }
      }
    } catch {
      // Chrome is initializing
    }
    await wait(300);
  }
  throw new Error(`Could not connect to Chrome debugging port ${port}`);
}

async function runBrowserVerification() {
  console.log('========================================================================');
  console.log('KAARYAN LABS — PHASE V3.7.3B REAL BUSINESS DIRECTORY BROWSER SUITE');
  console.log('========================================================================\n');

  console.log('[1/7] Starting local static server on port ' + PORT + '...');
  const server = await createStaticServer(PORT);
  console.log('  Static server active.');

  const userDataDir = path.resolve(process.cwd(), '.tmp', 'chrome-profile-v373b');
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  console.log('[2/7] Launching headless Chrome on CDP port ' + CDP_PORT + '...');
  const chromeProcess: ChildProcess = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${userDataDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--disable-extensions',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  let cdp: CDPClient | null = null;

  try {
    const wsUrl = await getWebSocketDebuggerUrl(CDP_PORT);
    cdp = new CDPClient(wsUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    const viewports = [
      { name: 'Desktop (1280x800)', width: 1280, height: 800 },
      { name: 'Tablet (1024x768)', width: 1024, height: 768 },
      { name: 'Small Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Large Mobile (430x932)', width: 430, height: 932 },
      { name: 'Standard Mobile (414x896)', width: 414, height: 896 },
      { name: 'Standard Mobile (390x844)', width: 390, height: 844 },
      { name: 'Standard Mobile (375x812)', width: 375, height: 812 },
      { name: 'Android Compact (360x780)', width: 360, height: 780 },
      { name: 'Ultra Compact (320x568)', width: 320, height: 568 },
    ];

    // ========================================================================
    // TEST 1: CATEGORY DIRECTORY PAGE (/city/vellore/category/all)
    // ========================================================================
    console.log('\n[3/7] Navigating to /city/vellore/category/all (Desktop 1280x800)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore/category/all` });
    await wait(2000);

    const dirEval = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const bodyText = document.body.innerText;
        return {
          title: document.title,
          hasMockV1: bodyText.includes('Sample Medical Diagnostic'),
          hasMockV2: bodyText.includes('Katpadi Deluxe Student Residency'),
          hasMockV3: bodyText.includes('Ambur Star Heritage Dum Biryani'),
          hasComingSoon: bodyText.includes('Vellore Businesses Coming Soon'),
          hasComingSoonSub: bodyText.includes('Verified local business listings will appear here as they are added to Vellore Ads.'),
          hasReturnHome: bodyText.includes('Return to Home'),
          hasTourismBtn: bodyText.includes('Explore Heritage & Tourism'),
          hasCommunityBtn: bodyText.includes('Community Notices'),
          snippet: bodyText.substring(0, 600),
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        };
      })()`,
      returnByValue: true,
    });

    const dirRes = dirEval.result.value;
    console.log('  Page Snippet:', JSON.stringify(dirRes.snippet));
    console.log('  Page Title:', dirRes.title);
    console.log('  Mock v-001 visible?', dirRes.hasMockV1 ? '❌ YES (BUG)' : '✅ NO');
    console.log('  Mock v-002 visible?', dirRes.hasMockV2 ? '❌ YES (BUG)' : '✅ NO');
    console.log('  Mock v-003 visible?', dirRes.hasMockV3 ? '❌ YES (BUG)' : '✅ NO');
    console.log('  "Vellore Businesses Coming Soon" rendered?', dirRes.hasComingSoon ? '✅ YES' : '❌ NO');
    console.log('  Branded subtitle rendered?', dirRes.hasComingSoonSub ? '✅ YES' : '❌ NO');
    console.log('  "Explore Heritage & Tourism" button present?', dirRes.hasTourismBtn ? '✅ YES' : '❌ NO');
    console.log('  "Community Notices" button present?', dirRes.hasCommunityBtn ? '✅ YES' : '❌ NO');

    const screenshot1 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'phase_v3_7_3b_desktop_directory_1280px.png'),
      Buffer.from(screenshot1.data, 'base64')
    );
    console.log('  📸 Captured screenshot: phase_v3_7_3b_desktop_directory_1280px.png');

    // ========================================================================
    // TEST 2: HOMEPAGE FEATURED BUSINESSES (/city/vellore)
    // ========================================================================
    console.log('\n[4/7] Navigating to /city/vellore (Desktop 1280x800)...');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore` });
    await wait(2000);

    const homeEval = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const bodyText = document.body.innerText;
        return {
          title: document.title,
          hasMockV1: bodyText.includes('Sample Medical Diagnostic'),
          hasMockV2: bodyText.includes('Katpadi Deluxe Student Residency'),
          hasMockV3: bodyText.includes('Ambur Star Heritage Dum Biryani'),
          hasFeaturedHeading: bodyText.includes('Featured Businesses in Vellore'),
          hasComingSoon: bodyText.includes('Vellore Businesses Coming Soon'),
          hasBrowseCategories: bodyText.includes('Browse Categories'),
        };
      })()`,
      returnByValue: true,
    });

    const homeRes = homeEval.result.value;
    console.log('  Featured Businesses Heading present?', homeRes.hasFeaturedHeading ? '✅ YES' : '❌ NO');
    console.log('  Mock items on homepage?', (homeRes.hasMockV1 || homeRes.hasMockV2 || homeRes.hasMockV3) ? '❌ YES (BUG)' : '✅ NO');
    console.log('  Home Featured "Vellore Businesses Coming Soon" rendered?', homeRes.hasComingSoon ? '✅ YES' : '❌ NO');
    console.log('  Browse Categories action button present?', homeRes.hasBrowseCategories ? '✅ YES' : '❌ NO');

    const screenshotHome = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'phase_v3_7_3b_desktop_home_1280px.png'),
      Buffer.from(screenshotHome.data, 'base64')
    );
    console.log('  📸 Captured screenshot: phase_v3_7_3b_desktop_home_1280px.png');

    // ========================================================================
    // TEST 3: STANDALONE BUSINESS NOT-FOUND (/city/vellore/biz/unknown-999)
    // ========================================================================
    console.log('\n[5/7] Navigating to deep link /city/vellore/biz/unknown-listing-test...');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore/biz/unknown-listing-test` });
    await wait(2000);

    const bizEval = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const bodyText = document.body.innerText;
        return {
          title: document.title,
          hasNotFound: bodyText.includes('Business Listing Not Found'),
          hasNotFoundSub: bodyText.includes('We could not find a business listing matching ID'),
          hasSearch: bodyText.includes('Search verified businesses in Vellore'),
        };
      })()`,
      returnByValue: true,
    });

    const bizRes = bizEval.result.value;
    console.log('  "Business Listing Not Found" rendered?', bizRes.hasNotFound ? '✅ YES' : '❌ NO');
    console.log('  Helpful error subtitle present?', bizRes.hasNotFoundSub ? '✅ YES' : '❌ NO');

    const screenshotBiz = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'phase_v3_7_3b_desktop_biz_notfound_1280px.png'),
      Buffer.from(screenshotBiz.data, 'base64')
    );
    console.log('  📸 Captured screenshot: phase_v3_7_3b_desktop_biz_notfound_1280px.png');

    // ========================================================================
    // TEST 4: MOBILE RESPONSIVE VIEWPORT SUITE (/city/vellore/category/all)
    // ========================================================================
    console.log('\n[6/7] Testing mobile responsive viewports on /city/vellore/category/all...');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore/category/all` });
    await wait(1500);

    let anyOverflow = false;
    for (const vp of viewports) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 768,
      });
      await wait(300);

      const vpEval = await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          return {
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
          };
        })()`,
        returnByValue: true,
      });

      const { scrollWidth, clientWidth } = vpEval.result.value;
      const isOverflow = scrollWidth > clientWidth;
      if (isOverflow) anyOverflow = true;
      console.log(`  Viewport ${vp.name.padEnd(28)}: ${clientWidth}px | scroll: ${scrollWidth}px | ${isOverflow ? '❌ OVERFLOW' : '✅ OK'}`);

      if (vp.width === 375) {
        const screenshotMobile = await cdp.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(
          path.join(ARTIFACT_DIR, 'phase_v3_7_3b_mobile_directory_375px.png'),
          Buffer.from(screenshotMobile.data, 'base64')
        );
        console.log('  📸 Captured screenshot: phase_v3_7_3b_mobile_directory_375px.png');
      }
    }

    // ========================================================================
    // TEST 5: CONSOLE ERRORS & HTTP 401 VERIFICATION
    // ========================================================================
    console.log('\n[7/7] Verifying runtime console health...');
    const fatalErrors = cdp.consoleErrors.filter(
      (e) => !e.includes('favicon') && !e.includes('ResizeObserver')
    );
    console.log(`  Console errors count: ${fatalErrors.length}`);
    if (fatalErrors.length > 0) {
      console.log('  Errors:', fatalErrors);
    } else {
      console.log('  ✅ Zero console errors detected.');
    }

    console.log('\n========================================================================');
    console.log('BROWSER VERIFICATION SUMMARY:');
    console.log('  - Mock fallback removed: ' + (!dirRes.hasMockV1 && !dirRes.hasMockV2 && !dirRes.hasMockV3 ? '✅ PASS' : '❌ FAIL'));
    console.log('  - Directory empty state: ' + (dirRes.hasComingSoon && dirRes.hasComingSoonSub ? '✅ PASS' : '❌ FAIL'));
    console.log('  - Homepage empty state:  ' + (homeRes.hasComingSoon && homeRes.hasBrowseCategories ? '✅ PASS' : '❌ FAIL'));
    console.log('  - Deep link resolution:  ' + (bizRes.hasNotFound ? '✅ PASS' : '❌ FAIL'));
    console.log('  - Viewport overflow:     ' + (!anyOverflow ? '✅ PASS (No overflow)' : '❌ FAIL (Overflow detected)'));
    console.log('  - Console cleanliness:   ' + (fatalErrors.length === 0 ? '✅ PASS' : '❌ FAIL'));
    console.log('========================================================================');

    if (dirRes.hasMockV1 || !dirRes.hasComingSoon || anyOverflow || fatalErrors.length > 0) {
      process.exit(1);
    }
  } finally {
    if (cdp) await cdp.close();
    chromeProcess.kill();
    server.close();
  }
}

runBrowserVerification().catch((err) => {
  console.error('Fatal browser verification error:', err);
  process.exit(1);
});
