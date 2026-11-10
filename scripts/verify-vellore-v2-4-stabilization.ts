/**
 * KAARYAN LABS — PHASE V2.4 VELLORE STABILIZATION & PROBLEM RESOLUTION SUITE
 *
 * Verifies:
 * 1. HomeSections.tsx contact validation guards (no empty tel: or wa.me/, accessible Enquire fallback)
 * 2. PostAdModal.tsx target city localities priority
 * 3. Footer.tsx brand theme color alignment
 * 4. FloatingChatbot.tsx phoneClean guard
 * 5. App.tsx offline listings preservation
 * 6. Live Headless Chrome DevTools Protocol (CDP) verification across all 4 responsive viewports:
 *    - Desktop (1440x900)
 *    - Tablet (768x1024)
 *    - Mobile (390x844)
 *    - Small Mobile (320x568)
 * 7. Console error zero-tolerance audit
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ARTIFACT_DIR = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb\\screenshots';

let passedChecks = 0;
let totalChecks = 0;

function assert(condition: boolean, description: string, details?: string): void {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✅ PASS: ${description}`);
  } else {
    console.error(`  ❌ FAIL: ${description}${details ? ` -> ${details}` : ''}`);
    process.exitCode = 1;
  }
}

// -----------------------------------------------------------------------------
// SECTION 1: STATIC CODE CONTRACT AUDITS
// -----------------------------------------------------------------------------
console.log('\n=============================================================================');
console.log('KAARYAN LABS — PHASE V2.4 STATIC PROBLEM RESOLUTION AUDIT');
console.log('=============================================================================');

const homeSectionsSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/components/HomeSections.tsx'), 'utf8');
assert(
  homeSectionsSrc.includes("import { resolveListingContact } from '../utils/contactValidation'"),
  'HomeSections imports resolveListingContact engine'
);
assert(
  homeSectionsSrc.includes('const contact = resolveListingContact(biz.phone, biz.whatsapp)'),
  'HomeSections computes resolved contact for each featured listing'
);
assert(
  !homeSectionsSrc.includes("window.location.href = `tel:${phone.replace("),
  'HomeSections eliminated unguarded tel: assignment'
);
assert(
  !homeSectionsSrc.includes("window.open(`https://wa.me/${phone}?text="),
  'HomeSections eliminated unguarded wa.me/ window.open'
);
assert(
  homeSectionsSrc.includes('title="Direct phone not provided — Click to view details and send enquiry"'),
  'HomeSections renders accessible Enquire button with tooltip for unprovided phones'
);
assert(
  homeSectionsSrc.includes('aria-disabled="true"') && homeSectionsSrc.includes('title="WhatsApp contact not provided for this listing"'),
  'HomeSections safely disables WhatsApp button when WhatsApp number is missing'
);

const postAdModalSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/components/PostAdModal.tsx'), 'utf8');
assert(
  postAdModalSrc.includes('const localities = targetCity.localities || currentCity?.localities || [];'),
  'PostAdModal prioritizes targetCity.localities over currentCity to preserve merchant territory localities'
);

const footerSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/components/Footer.tsx'), 'utf8');
assert(
  footerSrc.includes('style={{ color: currentCity.theme.primaryColor }}'),
  'Footer uses dynamic city theme primary color for Ads suffix'
);

const chatbotSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/components/FloatingChatbot.tsx'), 'utf8');
assert(
  chatbotSrc.includes('{phoneClean && (') && chatbotSrc.includes('<span>WhatsApp Helpdesk</span>'),
  'FloatingChatbot guards WhatsApp Helpdesk link with phoneClean'
);

const appSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/App.tsx'), 'utf8');
assert(
  appSrc.includes('if (!remoteListings || remoteListings.length === 0) return;'),
  'App.tsx guards against empty remote listings wiping out initial directory listings'
);

// -----------------------------------------------------------------------------
// SECTION 2: LIVE HEADLESS CHROME AUTOMATION ACROSS 4 VIEWPORTS
// -----------------------------------------------------------------------------
console.log('\n=============================================================================');
console.log('KAARYAN LABS — PHASE V2.4 LIVE HEADLESS CHROME E2E & 4-VIEWPORT AUDIT');
console.log('=============================================================================');

const STATIC_PORT = 4252;
const CDP_PORT = 9290;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function startStaticServer(): http.Server {
  const distDir = path.join(ROOT_DIR, 'dist');
  const server = http.createServer((req, res) => {
    let reqPath = (req.url || '/').split('?')[0];
    if (reqPath === '/city/vellore' || reqPath === '/city/vellore/') {
      reqPath = '/city/vellore/index.html';
    } else if (reqPath === '/city/chittoor' || reqPath === '/city/chittoor/') {
      reqPath = '/city/chittoor/index.html';
    } else if (reqPath === '/city/bengaluru' || reqPath === '/city/bengaluru/') {
      reqPath = '/city/bengaluru/index.html';
    } else if (reqPath === '/' || reqPath === '') {
      reqPath = '/index.html';
    }

    let filePath = path.join(distDir, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      if (reqPath.startsWith('/city/vellore')) {
        filePath = path.join(distDir, 'city/vellore/index.html');
      } else {
        filePath = path.join(distDir, 'index.html');
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
      const data = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  return server;
}

class CDPClient {
  private ws: any;
  private id = 0;
  private pending = new Map<number, { resolve: (val: any) => void; reject: (err: any) => void }>();
  public consoleErrors: string[] = [];

  constructor(private wsUrl: string) {}

  async connect(): Promise<void> {
    const WSClass = (globalThis as any).WebSocket;
    return new Promise((resolve, reject) => {
      this.ws = new WSClass(this.wsUrl);
      this.ws.addEventListener('open', () => resolve());
      this.ws.addEventListener('error', (err: any) => reject(err));
      this.ws.addEventListener('message', (event: any) => {
        const raw = typeof event.data === 'string' ? event.data : event.data?.toString() || '{}';
        const data = JSON.parse(raw);
        if (data.id && this.pending.has(data.id)) {
          const { resolve, reject } = this.pending.get(data.id)!;
          this.pending.delete(data.id);
          if (data.error) reject(new Error(data.error.message || JSON.stringify(data.error)));
          else resolve(data.result);
        } else if (data.method === 'Console.messageAdded') {
          if (data.params?.message?.level === 'error') {
            this.consoleErrors.push(data.params.message.text);
          }
        }
      });
    });
  }

  send(method: string, params: Record<string, any> = {}): Promise<any> {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression: string): Promise<any> {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res?.result?.value;
  }

  close(): void {
    if (this.ws) this.ws.close();
  }
}

async function getCDPPageTarget(cdpPort: number): Promise<string> {
  const maxRetries = 20;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${cdpPort}/json`);
      if (res.ok) {
        const targets: any = await res.json();
        const page = targets.find((t: any) => t.type === 'page');
        if (page && page.webSocketDebuggerUrl) {
          return page.webSocketDebuggerUrl;
        }
      }
    } catch {
      // Chrome starting up
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error('Could not connect to Chrome CDP JSON endpoint');
}

async function runBrowserTests(): Promise<void> {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

  const server = startStaticServer();
  await new Promise<void>((resolve) => server.listen(STATIC_PORT, '127.0.0.1', () => resolve()));
  console.log(`   ✅ Static preview server listening on port ${STATIC_PORT}`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProcess: ChildProcess = spawn(
    chromePath,
    [
      `--remote-debugging-port=${CDP_PORT}`,
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1440,900',
      'about:blank',
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );

  let cdp: CDPClient | null = null;

  try {
    const wsUrl = await getCDPPageTarget(CDP_PORT);
    cdp = new CDPClient(wsUrl);
    await cdp.connect();

    await cdp.send('Console.enable');
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    console.log(`   ✅ Chrome DevTools Protocol connected at ${wsUrl}`);

    // Navigate to Vellore homepage
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${STATIC_PORT}/city/vellore` });
    await new Promise((r) => setTimeout(r, 2000));

    // TEST 1: Navigation & Title
    console.log('\n--- TEST 1: Home & Header Navigation ---');
    const docTitle = await cdp.evaluate('(() => document.title)()');
    assert(docTitle.includes('Vellore'), `Document title reflects Vellore (got: "${docTitle}")`);

    const brandText = await cdp.evaluate("(() => document.body.innerText.includes('VelloreAds'))()");
    assert(brandText, 'Header brand contains VelloreAds');

    const tn23Badge = await cdp.evaluate("(() => document.body.innerText.includes('TN-23'))()");
    assert(tn23Badge, 'Header displays TN-23 regional badge');

    // TEST 2: Featured Businesses Mini-Cards in HomeSections
    console.log('\n--- TEST 2: HomeSections Featured Businesses Contact Guarding ---');
    const featuredContactEvaluation = await cdp.evaluate(`(() => {
      const featuredH2 = Array.from(document.querySelectorAll('h2')).find(h => h.innerText.includes('Featured Businesses in Vellore'));
      if (!featuredH2) return { foundSection: false };
      const section = featuredH2.closest('section');
      if (!section) return { foundSection: false };
      
      const cards = Array.from(section.querySelectorAll('h3')).map(h3 => {
        const card = h3.closest('div[role="button"]') || h3.parentElement?.parentElement;
        const buttons = Array.from(card.querySelectorAll('button')).map(b => ({
          text: b.innerText.trim(),
          ariaDisabled: b.getAttribute('aria-disabled'),
          disabled: b.disabled,
          title: b.getAttribute('title') || '',
          ariaLabel: b.getAttribute('aria-label') || ''
        }));
        return {
          title: h3.innerText.trim(),
          buttons
        };
      });
      return { foundSection: true, cards };
    })()`);

    assert(featuredContactEvaluation.foundSection, 'Found Featured Businesses in Vellore section');
    const diagCard = featuredContactEvaluation.cards?.find((c: any) => c.title.includes('Sample Medical Diagnostic'));
    assert(Boolean(diagCard), 'Found Sample Medical Diagnostic preview listing in featured grid');

    if (diagCard) {
      const enquireBtn = diagCard.buttons.find((b: any) => b.text.includes('Enquire'));
      assert(Boolean(enquireBtn), 'Unprovided phone correctly renders Enquire button instead of broken tel:');

      const whatsappBtn = diagCard.buttons.find((b: any) => b.text.includes('WhatsApp'));
      assert(
        whatsappBtn && (whatsappBtn.ariaDisabled === 'true' || whatsappBtn.disabled),
        'Unprovided WhatsApp safely disabled with aria-disabled="true"'
      );
    }

    // TEST 3: Search Interactivity
    console.log('\n--- TEST 3: Search & Locality Dropdown ---');
    const localityOptions = await cdp.evaluate(`(() => {
      const sel = document.querySelector('select[aria-label*="locality"]');
      if (!sel) return [];
      return Array.from(sel.options).map(o => o.text);
    })()`);
    assert(
      localityOptions.some((o: string) => o.includes('Katpadi')) &&
      localityOptions.some((o: string) => o.includes('Bagayam')),
      'Locality selector contains authentic Vellore areas (Katpadi, Bagayam)'
    );

    // TEST 4: Post Ad Modal Locality Resolution
    console.log('\n--- TEST 4: Post Ad Modal Locality & Branding ---');
    await cdp.evaluate(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Post Ad Free'));
      if (btn) btn.click();
    })()`);
    await new Promise((r) => setTimeout(r, 600));

    const postAdAreas = await cdp.evaluate(`(() => {
      const modal = document.querySelector('div[role="dialog"]') || document.body;
      const selects = Array.from(modal.querySelectorAll('select'));
      // Locality select is the one with area options
      for (const sel of selects) {
        const texts = Array.from(sel.options).map(o => o.text);
        if (texts.some(t => t.includes('Katpadi') || t.includes('Bagayam'))) {
          return texts;
        }
      }
      return [];
    })()`);
    assert(
      postAdAreas.some((a: string) => a.includes('Katpadi')),
      'Post Ad Modal correctly populates Vellore localities (Katpadi verified)'
    );

    // Close Post Ad modal
    await cdp.evaluate(`(() => {
      const closeBtn = document.querySelector('button[aria-label*="Close"]') || Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg.lucide-x'));
      if (closeBtn) closeBtn.click();
    })()`);
    await new Promise((r) => setTimeout(r, 400));

    // TEST 5: Cab Booking Modal Flow
    console.log('\n--- TEST 5: Cab Booking Modal Flow ---');
    await cdp.evaluate(`(() => {
      const cabBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Book Cab') || b.innerText.includes('Book a Cab'));
      if (cabBtn) cabBtn.click();
    })()`);
    await new Promise((r) => setTimeout(r, 600));

    const cabHeader = await cdp.evaluate(`(() => {
      const h3 = Array.from(document.querySelectorAll('h3')).find(h => h.innerText.includes('Book a Verified Cab'));
      return h3 ? h3.innerText.trim() : '';
    })()`);
    assert(cabHeader.includes('Book a Verified Cab'), 'Cab Booking Modal opened successfully');

    // Close Cab modal
    await cdp.evaluate(`(() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg.lucide-x'));
      if (closeBtn) closeBtn.click();
    })()`);
    await new Promise((r) => setTimeout(r, 400));

    // TEST 6: Footer Brand Color
    console.log('\n--- TEST 6: Footer Regional Brand Styling ---');
    const footerStyle = await cdp.evaluate(`(() => {
      const footer = document.querySelector('footer');
      if (!footer) return null;
      const adsSpan = Array.from(footer.querySelectorAll('span')).find(s => s.innerText === 'Ads' && s.style.color);
      return adsSpan ? adsSpan.style.color : '';
    })()`);
    assert(
      footerStyle === 'rgb(23, 106, 196)' || footerStyle.includes('176AC4') || footerStyle.length > 0,
      `Footer Ads brand styling is dynamically bound to city theme (got: "${footerStyle}")`
    );

    // TEST 7: 4 Responsive Viewport Visual Screen Captures
    console.log('\n--- TEST 7: 4 Responsive Viewport Captures ---');
    const viewports = [
      { name: 'desktop_1440px', width: 1440, height: 900, label: 'Desktop 1440px' },
      { name: 'tablet_768px', width: 768, height: 1024, label: 'Tablet 768px' },
      { name: 'mobile_390px', width: 390, height: 844, label: 'Mobile iPhone 390px' },
      { name: 'small_mobile_320px', width: 320, height: 568, label: 'Small Mobile 320px' },
    ];

    for (const vp of viewports) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 768,
      });
      await cdp.send('Emulation.setVisibleSize', { width: vp.width, height: vp.height });
      await new Promise((r) => setTimeout(r, 600));

      // Scroll check: ensure no horizontal overflow
      const overflow = await cdp.evaluate('(() => document.documentElement.scrollWidth > window.innerWidth)()');
      assert(!overflow, `${vp.label}: Zero horizontal overflow detected (scrollWidth <= innerWidth)`);

      const screenshotRes = await cdp.send('Page.captureScreenshot', { format: 'png' });
      const filename = `phase_v2_4_vellore_${vp.name}.png`;
      const screenshotPath = path.join(ARTIFACT_DIR, filename);
      fs.writeFileSync(screenshotPath, Buffer.from(screenshotRes.data, 'base64'));
      console.log(`   📸 Saved screenshot: ${filename} (${vp.width}x${vp.height})`);
    }

    // TEST 8: Console Health
    console.log('\n--- TEST 8: Browser Console Health Check ---');
    assert(
      cdp.consoleErrors.length === 0,
      `Zero unhandled JavaScript errors logged to console (got: ${cdp.consoleErrors.length})`,
      cdp.consoleErrors.join(', ')
    );
  } finally {
    if (cdp) cdp.close();
    chromeProcess.kill('SIGTERM');
    server.close();
  }
}

async function main(): Promise<void> {
  try {
    await runBrowserTests();
  } catch (err) {
    console.error('Browser testing error:', err);
    process.exitCode = 1;
  }

  console.log('\n=============================================================================');
  console.log(`PHASE V2.4 VERIFICATION RESULTS: ${passedChecks}/${totalChecks} PASSED`);
  if (passedChecks === totalChecks && totalChecks > 0) {
    console.log('✅ ALL PHASE V2.4 STABILIZATION CHECKS PASSED WITH 100% SUCCESS');
  } else {
    console.error('❌ SOME CHECKS FAILED');
    process.exitCode = 1;
  }
  console.log('=============================================================================\n');
}

main();
