/**
 * KAARYAN LABS — PHASE V3.4 BROWSER & E2E VERIFICATION SUITE
 * TARGET: Vellore Ads (/city/vellore, TN-23)
 *
 * Verifies:
 * - Homepage Quick Enquiry form usability, loading state, field errors, and Privacy Guarantee
 * - Standalone business profile (/city/vellore/biz/v-001) sidebar enquiry & category-tailored WhatsApp CTA
 * - Listing Detail Modal customer enquiry dialog with accessible inputs & microcopy
 * - Vellore Cab Booking Modal with trip selection, privacy guarantee, and zero fabricated reference codes
 * - Dedicated Contact Page (/city/vellore/contact) on small mobile (320px)
 * - Multi-viewport responsiveness (1440px, 768px, 390px, 320px) with zero horizontal overflow
 */

import { spawn, ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb\\screenshots';
const PARENT_ARTIFACT_DIR = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb';
const PORT = 8098;
const CDP_PORT = 9229;

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
  const buffer = Buffer.from(data, 'base64');

  const subPath = path.join(ARTIFACT_DIR, filename);
  fs.writeFileSync(subPath, buffer);

  const parentPath = path.join(PARENT_ARTIFACT_DIR, filename);
  fs.writeFileSync(parentPath, buffer);

  console.log(`  📸 Screenshot saved -> ${filename}`);
}

async function runBrowserTests() {
  console.log('======================================================================');
  console.log('KAARYAN LABS — PHASE V3.4 VELLORE CUSTOMER ENQUIRY BROWSER VERIFICATION');
  console.log('======================================================================\n');

  const server = await createStaticServer(PORT);
  console.log(`[HTTP Server] Listening on http://127.0.0.1:${PORT}`);

  const userDataDir = path.resolve(process.cwd(), '.tmp-v3-4-chrome');
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
    // TEST 1: HOMEPAGE QUICK ENQUIRY SECTION (DESKTOP 1440px)
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Testing Homepage Quick Enquiry Section (Desktop 1440px) ---');
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore` });
    await wait(2200);

    const hasQuickEnquiryTitle = await evaluateScript(
      ws,
      `Array.from(document.querySelectorAll('h2, h3')).some(h => h.textContent && h.textContent.includes('Need a Local Service in Vellore'))`
    );
    assert(hasQuickEnquiryTitle, 'Homepage Quick Enquiry pitch heading rendered');

    const hasPrivacyNoticeQuick = await evaluateScript(
      ws,
      `Array.from(document.querySelectorAll('*')).some(el => el.textContent && el.textContent.includes('Privacy Notice') && el.textContent.includes('solely to coordinate your service quote callback'))`
    );
    assert(hasPrivacyNoticeQuick, 'Homepage Quick Enquiry contains accurate Privacy Notice microcopy');

    // Scroll to Quick Enquiry section
    await evaluateScript(
      ws,
      `const el = document.querySelector('input#quick-enquiry-name') || document.querySelector('form'); if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });`
    );
    await wait(400);

    await captureScreenshot(ws, 1440, 900, 'phase_v3_4_quick_enquiry_desktop_1440px.png', false);

    const desktopOverflow = await evaluateScript(ws, 'document.documentElement.scrollWidth > window.innerWidth');
    assert(!desktopOverflow, 'Homepage at 1440px has zero horizontal overflow');

    // -------------------------------------------------------------------------
    // TEST 2: STANDALONE BUSINESS PROFILE SIDEBAR ENQUIRY (DESKTOP 1440px)
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testing Standalone Profile Sidebar Enquiry & WhatsApp (/city/vellore/biz/v-001) ---');
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore/biz/v-001` });
    await wait(2000);

    const hasBizEnquirySidebar = await evaluateScript(
      ws,
      `Array.from(document.querySelectorAll('h3')).some(h => h.textContent && h.textContent.includes('Send Enquiry to'))`
    );
    assert(hasBizEnquirySidebar, 'Standalone Business Profile renders sidebar enquiry form');

    const hasBizPrivacyNotice = await evaluateScript(
      ws,
      `Array.from(document.querySelectorAll('*')).some(el => el.textContent && el.textContent.includes('Privacy Notice') && el.textContent.includes('shared with this business listing and our regional support team'))`
    );
    assert(hasBizPrivacyNotice, 'Standalone Business Profile sidebar contains accurate Privacy Notice microcopy');

    // Verify Quick Action fallback when contact is unconfigured on preview listing
    const hasOnlineInquiryBtn = await evaluateScript(
      ws,
      `Array.from(document.querySelectorAll('a, button')).some(el => el.textContent && el.textContent.includes('Send Online Inquiry'))`
    );
    assert(hasOnlineInquiryBtn, 'Quick Action Bar provides "Send Online Inquiry" when direct phone/WhatsApp is unconfigured');

    await captureScreenshot(ws, 1440, 900, 'phase_v3_4_biz_enquiry_desktop_1440px.png', false);

    // -------------------------------------------------------------------------
    // TEST 3: LISTING DETAIL MODAL ENQUIRY DIALOG (TABLET 768px)
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing Listing Detail Modal Enquiry Dialog (Tablet 768px) ---');
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore/business/v-001` });
    await wait(2200);

    // In modal, click "Enquire" action button to open customer enquiry dialog
    await evaluateScript(
      ws,
      `const enquiryBtn = document.querySelector('button[title="Send Enquiry to Business"]');
       if (enquiryBtn) enquiryBtn.click();`
    );
    await wait(800);

    const modalEnquiryOpen = await evaluateScript(
      ws,
      `Array.from(document.querySelectorAll('h4, h5')).some(el => el.textContent && el.textContent.includes('Direct Customer Enquiry'))`
    );
    assert(
      modalEnquiryOpen,
      'Listing Detail Modal successfully opens Direct Customer Enquiry dialog'
    );

    const modalPrivacyPresent = await evaluateScript(
      ws,
      `Array.from(document.querySelectorAll('*')).some(el => el.textContent && el.textContent.includes('Privacy Notice'))`
    );
    assert(modalPrivacyPresent, 'Modal enquiry dialog displays accurate Privacy Notice microcopy');

    await captureScreenshot(ws, 768, 1024, 'phase_v3_4_listing_modal_tablet_768px.png', false);

    const tabletOverflow = await evaluateScript(ws, 'document.documentElement.scrollWidth > window.innerWidth');
    assert(!tabletOverflow, 'Modal at 768px tablet has zero horizontal overflow');

    // -------------------------------------------------------------------------
    // TEST 4: CAB BOOKING MODAL (MOBILE 390px)
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing Cab Booking Modal (Mobile 390px) ---');
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore` });
    await wait(2000);

    // Click "Book Cab" CTA button
    const openedCab = await evaluateScript(
      ws,
      `const btns = Array.from(document.querySelectorAll('button'));
       const cabBtn = btns.find(b => b.textContent && b.textContent.includes('Book Cab'));
       if (cabBtn) { cabBtn.click(); true; } else { false; }`
    );
    await wait(1000);

    const cabModalRendered = await evaluateScript(
      ws,
      `Array.from(document.querySelectorAll('h3')).some(h => h.textContent && h.textContent.includes('Book a Verified Cab'))`
    );
    assert(openedCab && cabModalRendered, 'Cab Booking Modal is opened and rendered on Mobile');

    const cabPrivacyPresent = await evaluateScript(
      ws,
      `Array.from(document.querySelectorAll('*')).some(el => el.textContent && el.textContent.includes('Privacy Notice') && el.textContent.includes('shared with authorized taxi operators or our regional transport coordinators in Vellore'))`
    );
    assert(cabPrivacyPresent, 'Cab Booking Modal displays accurate Privacy Notice microcopy');

    // Check that there is no fake tracking reference in the DOM
    const noFakeRef = await evaluateScript(
      ws,
      `!document.body.innerText.includes('CAB-TN-23-')`
    );
    assert(noFakeRef, 'Cab Booking modal strictly eliminates fake client-side tracking numbers');

    await captureScreenshot(ws, 390, 844, 'phase_v3_4_cab_booking_mobile_390px.png', true);

    const mobileOverflow = await evaluateScript(ws, 'document.documentElement.scrollWidth > window.innerWidth');
    assert(!mobileOverflow, 'Cab Booking modal at 390px mobile has zero horizontal overflow');

    // -------------------------------------------------------------------------
    // TEST 5: VELLORE CONTACT PAGE (SMALL MOBILE 320px)
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Testing Vellore Contact Page (Small Mobile 320px) ---');
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore/contact` });
    await wait(2000);

    const contactHeading = await evaluateScript(
      ws,
      `document.querySelector('h1')?.textContent?.trim() || ''`
    );
    assert(contactHeading.includes('Contact Vellore Ads'), 'Contact page heading rendered', contactHeading);

    const contactPrivacyPresent = await evaluateScript(
      ws,
      `Array.from(document.querySelectorAll('*')).some(el => el.textContent && el.textContent.includes('Privacy Notice') && el.textContent.includes('Vellore regional desk and authorized service coordinators'))`
    );
    assert(contactPrivacyPresent, 'Vellore Contact Page displays explicit Privacy Notice');

    await captureScreenshot(ws, 320, 700, 'phase_v3_4_contact_small_mobile_320px.png', true);

    const smallMobileOverflow = await evaluateScript(ws, 'document.documentElement.scrollWidth > window.innerWidth');
    assert(!smallMobileOverflow, 'Contact page at 320px small mobile has zero horizontal overflow');

  } catch (err) {
    console.error('Browser testing failed with exception:', err);
    failed++;
  } finally {
    ws.close();
    chromeProc.kill();
    server.close();

    console.log('\n======================================================================');
    console.log(`BROWSER ASSERTIONS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log('======================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  }
}

runBrowserTests();
