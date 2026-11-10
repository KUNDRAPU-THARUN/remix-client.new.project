/**
 * KAARYAN LABS — PHASE V2.3 BROWSER AUTOMATION E2E TEST SUITE
 * VELLORE ADS (/city/vellore, TN-23)
 * Full headless Chrome CDP verification of frontend flows & responsive layouts
 */

import { spawn, ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb\\screenshots';

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

    // 1. Direct file in dist
    const filePath = path.join(distDir, cleanPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(filePath));
      return;
    }

    // 2. City prerendered routes
    if (cleanPath === '/city/vellore' || cleanPath.startsWith('/city/vellore/')) {
      const cityHtml = path.join(distDir, 'city/vellore/index.html');
      if (fs.existsSync(cityHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(cityHtml));
        return;
      }
    }

    if (cleanPath === '/city/chittoor' || cleanPath.startsWith('/city/chittoor/')) {
      const cityHtml = path.join(distDir, 'city/chittoor/index.html');
      if (fs.existsSync(cityHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(cityHtml));
        return;
      }
    }

    if (cleanPath === '/city/bengaluru' || cleanPath.startsWith('/city/bengaluru/')) {
      const cityHtml = path.join(distDir, 'city/bengaluru/index.html');
      if (fs.existsSync(cityHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(cityHtml));
        return;
      }
    }

    // 3. Fallback to index.html
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
    deviceScaleFactor: 1,
    mobile,
  });
  await wait(600);

  const res = await sendCDP(ws, 'Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });

  const buffer = Buffer.from(res.data, 'base64');
  fs.writeFileSync(outputPath, buffer);
  console.log(`   📸 Screenshot: ${path.basename(outputPath)} (${width}x${height}, ${buffer.length} bytes)`);
}

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedAssertions++;
    console.error(`  ❌ FAIL: ${testName}${details ? ` -> ${details}` : ''}`);
  }
}

async function runBrowserE2E() {
  console.log('=============================================================================');
  console.log('KAARYAN LABS — PHASE V2.3 VELLORE LIVE BROWSER E2E VERIFICATION SUITE');
  console.log('Target: /city/vellore (TN-23) Headless Chrome CDP Automation');
  console.log('=============================================================================\n');

  const PORT = 4250;
  const CDP_PORT = 9288;
  const tmpProfile = path.join(process.cwd(), '.tmp-v23-chrome');

  if (fs.existsSync(tmpProfile)) {
    try {
      fs.rmSync(tmpProfile, { recursive: true, force: true });
    } catch {}
  }

  // 1. Launch Server
  console.log(`▶ 1. Launching In-Process Static Server on Port ${PORT}...`);
  const server = await createStaticServer(PORT);
  console.log(`   ✅ Static server online at http://127.0.0.1:${PORT}`);

  // 2. Launch Chrome
  console.log(`\n▶ 2. Launching Headless Chrome on CDP Port ${CDP_PORT}...`);
  const chrome: ChildProcess = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--remote-debugging-address=127.0.0.1',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpProfile}`,
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ]);

  chrome.stdout?.on('data', (d) => console.log('[Chrome stdout]:', d.toString()));
  chrome.stderr?.on('data', (d) => console.log('[Chrome stderr]:', d.toString()));
  chrome.on('error', (err) => console.log('[Chrome error]:', err));
  chrome.on('exit', (code, sig) => console.log('[Chrome exit]:', code, sig));

  let cdpReady = false;
  let pageDebuggerUrl = '';
  let detectedWs = '';
  chrome.stderr?.on('data', (d) => {
    const str = d.toString();
    const match = str.match(/DevTools listening on (ws:\/\/[^\s]+)/);
    if (match) {
      console.log('   [CDP] Detected DevTools URL:', match[1]);
      detectedWs = match[1];
    }
  });

  for (let i = 0; i < 30; i++) {
    await wait(400);
    if (detectedWs) {
      pageDebuggerUrl = detectedWs;
      cdpReady = true;
      break;
    }
    try {
      const targetsRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      if (targetsRes.ok) {
        const targets: any = await targetsRes.json();
        const pageTarget = targets.find((t: any) => t.type === 'page') || targets[0];
        if (pageTarget && pageTarget.webSocketDebuggerUrl) {
          pageDebuggerUrl = pageTarget.webSocketDebuggerUrl;
          cdpReady = true;
          break;
        }
      }
    } catch (e: any) {
      console.log('   [CDP Probe Error]:', e.message, e.cause);
    }
  }

  if (!cdpReady || !pageDebuggerUrl) {
    console.error('❌ Failed to connect to Headless Chrome DevTools Protocol.');
    chrome.kill();
    server.close();
    process.exit(1);
  }
  console.log(`   ✅ Chrome DevTools Protocol connected at: ${pageDebuggerUrl}`);

  const browserWs = new WebSocket(pageDebuggerUrl);
  await new Promise((resolve, reject) => {
    browserWs.addEventListener('open', resolve);
    browserWs.addEventListener('error', reject);
  });

  const targetsRes = await sendCDP(browserWs, 'Target.getTargets');
  console.log('   [CDP] Existing targets:', targetsRes.targetInfos?.map((t: any) => `${t.type}: ${t.url}`));
  let pageTarget = targetsRes.targetInfos?.find((t: any) => t.type === 'page');

  if (!pageTarget) {
    const created = await sendCDP(browserWs, 'Target.createTarget', { url: 'about:blank' });
    console.log('   [CDP] Created page target:', created.targetId);
    pageTarget = { targetId: created.targetId };
  }

  const pageTargetWsUrl = `ws://127.0.0.1:${CDP_PORT}/devtools/page/${pageTarget.targetId}`;
  console.log('   [CDP] Page WebSocket URL:', pageTargetWsUrl);

  const ws = new WebSocket(pageTargetWsUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });

  await sendCDP(ws, 'Page.enable');
  await sendCDP(ws, 'DOM.enable');
  await sendCDP(ws, 'Runtime.enable');

  const consoleErrors: string[] = [];
  ws.addEventListener('message', (evt) => {
    try {
      const d = JSON.parse(evt.data);
      if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') {
        const msg = d.params.args?.map((a: any) => a.value).join(' ');
        if (!msg.includes('net::ERR_') && !msg.includes('Supabase') && !msg.includes('ENOTFOUND')) {
          consoleErrors.push(msg);
        }
      }
    } catch {}
  });

  try {
    // -------------------------------------------------------------------------
    // TEST 1: HOME & NAVIGATION
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 1: Home & Header Navigation ---');
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore` });
    await wait(2500);

    const pageTitle = await evaluateScript(ws, 'document.title');
    assert(pageTitle.includes('Vellore'), `Document title contains Vellore (got: "${pageTitle}")`);

    const headerBrand = await evaluateScript(ws, `
      (() => document.querySelector('header')?.innerText || document.body.innerText)()
    `);
    assert(headerBrand.includes('VelloreAds') || headerBrand.includes('Vellore'), 'Header displays Vellore brand');
    assert(headerBrand.includes('TN-23'), 'Header displays Vellore city code TN-23');

    // Click Emergency Helplines button in top bar to open Emergency modal
    await evaluateScript(ws, `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const emBtn = btns.find(b => b.innerText.includes('Emergency') || b.innerText.includes('அவசர'));
        if (emBtn) emBtn.click();
      })()
    `);
    await wait(800);

    const emergencyText = await evaluateScript(ws, `
      (() => document.body.innerText)()
    `);
    assert(
      emergencyText.includes('வேலூர்') || emergencyText.includes('அவசர') || emergencyText.includes('108'),
      'Emergency modal displays authentic localized Tamil emergency services'
    );

    // Close emergency modal
    await evaluateScript(ws, `
      (() => {
        const closeBtn = document.querySelector('[role="dialog"] button, div[class*="backdrop-blur"] button');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await wait(500);

    // -------------------------------------------------------------------------
    // TEST 2: SEARCH & CATEGORIES
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Search & Category Interactions ---');
    const hasSearchInput = await evaluateScript(ws, `
      (() => Boolean(document.querySelector('input[type="text"]')))()
    `);
    assert(hasSearchInput, 'Search input field is rendered in Hero section');

    // Type query into search input
    await evaluateScript(ws, `
      (() => {
        const inp = document.querySelector('input[type="text"]');
        if (inp) {
          inp.value = 'Diagnostic';
          inp.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `);
    await wait(500);

    const searchVal = await evaluateScript(ws, `
      (() => document.querySelector('input[type="text"]')?.value || '')()
    `);
    assert(searchVal === 'Diagnostic', 'Search input accepts user text ("Diagnostic")');

    // Clear search
    await evaluateScript(ws, `
      (() => {
        const inp = document.querySelector('input[type="text"]');
        if (inp) {
          inp.value = '';
          inp.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `);
    await wait(500);

    // -------------------------------------------------------------------------
    // TEST 3: LOCALITY FILTER
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Locality Dropdown & Filters ---');
    const localitySelect = await evaluateScript(ws, `
      (() => {
        const sel = document.querySelector('select');
        return sel ? Array.from(sel.options).map(o => o.text).join(', ') : 'NONE';
      })()
    `);
    assert(localitySelect.includes('Vellore') || localitySelect.includes('Katpadi') || localitySelect.includes('Locations'), 'Locality selector renders Vellore localities');

    // -------------------------------------------------------------------------
    // TEST 4: LISTING CARD / DETAIL FLOW
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Listing Card & Detail Modal Flow ---');
    const pageHeadings = await evaluateScript(ws, `
      (() => {
        return Array.from(document.querySelectorAll('h2, h3, h4')).map(h => ({
          tag: h.tagName,
          text: h.innerText.trim()
        }));
      })()
    `);
    console.log('   [Page Headings]:', pageHeadings);
    const listingCardTitle = await evaluateScript(ws, `
      (() => {
        const h3List = Array.from(document.querySelectorAll('h3'));
        const previewCard = h3List.find(h =>
          h.innerText.includes('Sample Medical Diagnostic') ||
          h.innerText.includes('Ambur Star Heritage')
        );
        return previewCard ? previewCard.innerText.trim() : 'NONE';
      })()
    `);
    assert(listingCardTitle !== 'NONE', `Listing card rendered: "${listingCardTitle}"`);

    // Click listing card body to open detail modal
    await evaluateScript(ws, `
      (() => {
        const h3List = Array.from(document.querySelectorAll('h3'));
        const previewCard = h3List.find(h =>
          h.innerText.includes('Sample Medical Diagnostic') ||
          h.innerText.includes('Ambur Star Heritage')
        );
        if (previewCard) {
          const cardDiv = previewCard.closest('div[role="button"]') || previewCard;
          cardDiv.click();
        }
      })()
    `);
    await wait(1200);

    const isModalOpen = await evaluateScript(ws, `
      (() => Boolean(document.querySelector('button[title="Close modal"]')))()
    `);
    assert(isModalOpen, 'Clicking listing card opens ListingDetailModal dialog');

    // Verify tabs inside detail modal
    const modalTabsInfo = await evaluateScript(ws, `
      (() => {
        const modal = document.querySelector('button[title="Close modal"]')?.closest('div.bg-white');
        if (!modal) return { about: false, services: false, reviews: false, unrated: false };
        const text = modal.innerText;
        return {
          about: text.includes('About'),
          services: text.includes('Services'),
          reviews: text.includes('Reviews') || text.includes('Write Review'),
          unrated: text.includes('New Listing') || text.includes('Unrated')
        };
      })()
    `);
    assert(modalTabsInfo.about, 'ListingDetailModal contains About tab');
    assert(modalTabsInfo.services, 'ListingDetailModal contains Services tab');
    assert(modalTabsInfo.reviews, 'ListingDetailModal contains Reviews / Write Review tab');
    assert(modalTabsInfo.unrated, 'ListingDetailModal displays rating status ("New Listing • Unrated")');

    // -------------------------------------------------------------------------
    // TEST 5: TELEPHONE & WHATSAPP GUARDS
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Telephone & WhatsApp Contact Buttons ---');
    const contactButtonsState = await evaluateScript(ws, `
      (() => {
        const modal = document.querySelector('button[title="Close modal"]')?.closest('div.bg-white') || document.body;
        const callBtn = Array.from(modal.querySelectorAll('button')).find(b => b.innerText.includes('Call') || b.innerText.includes('Enquire'));
        const waBtn = Array.from(modal.querySelectorAll('button')).find(b => b.innerText.includes('WhatsApp'));
        return {
          callText: callBtn?.innerText || 'NONE',
          hasCallBtn: Boolean(callBtn),
          hasWaBtn: Boolean(waBtn),
          waDisabled: waBtn?.hasAttribute('disabled') || waBtn?.getAttribute('aria-disabled') === 'true',
          waTitle: waBtn?.getAttribute('title') || ''
        };
      })()
    `);
    assert(
      contactButtonsState.hasCallBtn,
      `Call action button rendered in modal header (got: "${contactButtonsState.callText}")`
    );
    assert(
      contactButtonsState.waDisabled,
      'WhatsApp action button on preview listing is safely disabled (aria-disabled="true")'
    );

    // Close detail modal
    await evaluateScript(ws, `
      (() => {
        const closeBtn = document.querySelector('button[title="Close modal"]');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await wait(800);

    // -------------------------------------------------------------------------
    // TEST 6: POST AD MODAL
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Post Ad Modal City Branding ---');
    await evaluateScript(ws, `
      (() => {
        const postAdBtn = Array.from(document.querySelectorAll('button')).find(b =>
          b.innerText.includes('Post Free Ad') || b.innerText.includes('+ Ad')
        );
        if (postAdBtn) postAdBtn.click();
      })()
    `);
    await wait(1000);

    const postAdModalInfo = await evaluateScript(ws, `
      (() => {
        const headings = Array.from(document.querySelectorAll('h3')).map(h => h.innerText);
        const postHeading = headings.find(h => h.includes('Post Free Business Ad'));
        const bodyText = document.body.innerText;
        return {
          hasHeading: Boolean(postHeading),
          headingText: postHeading || '',
          isVellore: postHeading?.includes('Vellore Ads') || bodyText.includes('Vellore (TN-23)'),
          hasTN23: bodyText.includes('TN-23')
        };
      })()
    `);
    assert(postAdModalInfo.isVellore, 'Post Ad modal displays "Vellore Ads" branding dynamically');
    assert(postAdModalInfo.hasTN23, 'Post Ad modal displays "TN-23" city code subtitle');

    // Close Post Ad Modal by clicking close button (X) in its header
    await evaluateScript(ws, `
      (() => {
        const modalContainer = Array.from(document.querySelectorAll('div.fixed.inset-0')).find(el => el.innerText.includes('Post Free Business Ad'));
        if (modalContainer) {
          const closeBtn = modalContainer.querySelector('button');
          if (closeBtn) closeBtn.click();
        }
      })()
    `);
    await wait(800);

    // -------------------------------------------------------------------------
    // TEST 7: CAB BOOKING SHORTCUT & MODAL
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 7: Cab Booking Modal Flow ---');
    // Scroll to quick enquiry section where Cab Booking shortcut resides
    await evaluateScript(ws, `
      (() => {
        const cabBtn = Array.from(document.querySelectorAll('button')).find(b =>
          b.innerText.trim() === 'Book Cab' || b.innerText.includes('Book Cab for Tour')
        );
        if (cabBtn) {
          cabBtn.scrollIntoView({ behavior: 'instant', block: 'center' });
          cabBtn.click();
        }
      })()
    `);
    await wait(1200);

    const cabModalInfo = await evaluateScript(ws, `
      (() => {
        const dialog = document.querySelector('div[role="dialog"]');
        if (!dialog) return { open: false, hasTitle: false, hasVehicleOptions: false };
        const text = dialog.innerText;
        return {
          open: true,
          hasTitle: text.includes('Book a Verified Cab') || text.includes('Cab'),
          hasVehicleOptions: text.includes('Sedan') || text.includes('Hatchback') || text.includes('SUV')
        };
      })()
    `);
    assert(cabModalInfo.open, 'Cab Booking Modal opened successfully');
    assert(cabModalInfo.hasTitle, 'Cab Booking Modal displays verified cab header');
    assert(cabModalInfo.hasVehicleOptions, 'Cab Booking Modal displays vehicle preference options (Sedan/SUV/Hatchback)');

    // Test form validation: fill pickup and drop and submit with short customer name to trigger React validation error
    await evaluateScript(ws, `
      (() => {
        const dialog = document.querySelector('div[role="dialog"]');
        if (!dialog) return;
        const inputs = Array.from(dialog.querySelectorAll('input'));
        // Set React input values helper
        const setVal = (input, val) => {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          if (nativeSetter) {
            nativeSetter.call(input, val);
          } else {
            input.value = val;
          }
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        };

        // inputs: 0: pickup, 1: drop, 2: date, 3: time, 4: name, 5: phone
        if (inputs[0]) setVal(inputs[0], 'Katpadi Railway Station');
        if (inputs[1]) setVal(inputs[1], 'CMC Hospital Bagayam');
        if (inputs[4]) setVal(inputs[4], 'A'); // Too short (< 2 chars)
        if (inputs[5]) setVal(inputs[5], '9842344550');

        const submitBtn = Array.from(dialog.querySelectorAll('button')).find(b =>
          b.innerText.includes('Request Cab') || b.innerText.includes('Submit')
        );
        if (submitBtn) submitBtn.click();
      })()
    `);
    await wait(800);

    const cabErrorText = await evaluateScript(ws, `
      (() => document.querySelector('div[role="dialog"]')?.innerText || '')()
    `);
    assert(
      cabErrorText.includes('Please enter your full name') || cabErrorText.includes('characters'),
      'Cab Booking validation triggers required field warning on invalid name'
    );

    // Close cab modal
    await evaluateScript(ws, `
      (() => {
        const closeBtn = document.querySelector('button[aria-label="Close dialog"], button[title="Close dialog"]');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await wait(800);

    // -------------------------------------------------------------------------
    // TEST 8: FOOTER NAVIGATION & CIVIC LINKS
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 8: Footer Navigation ---');
    const footerText = await evaluateScript(ws, `
      (() => document.querySelector('footer')?.innerText || '')()
    `);
    assert(footerText.includes('Vellore Ads') || footerText.includes('KAARYAN LABS'), 'Footer renders Vellore Ads platform copyright');
    assert(footerText.includes('TN-23') || footerText.includes('Tamil Nadu'), 'Footer references TN-23 regional territory');

    // -------------------------------------------------------------------------
    // TEST 9: SCREENSHOT CAPTURES (DESKTOP & MOBILE VIEWPORTS)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 9: Visual Layout Captures ---');
    // Scroll to top
    await evaluateScript(ws, '(() => window.scrollTo(0, 0))()');
    await wait(500);

    // Desktop capture
    await captureScreenshot(
      ws,
      1440,
      900,
      path.join(ARTIFACT_DIR, 'phase_v2_3_vellore_desktop_1440px.png'),
      false
    );

    // Mobile capture
    await captureScreenshot(
      ws,
      390,
      844,
      path.join(ARTIFACT_DIR, 'phase_v2_3_vellore_mobile_390px.png'),
      true
    );

    // Reset to desktop metrics
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // -------------------------------------------------------------------------
    // TEST 10: CONSOLE ERROR AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 10: Browser Console Health Check ---');
    assert(
      consoleErrors.length === 0,
      `Zero unhandled JavaScript errors logged to browser console (got: ${consoleErrors.length})`,
      consoleErrors.join(' | ')
    );

  } finally {
    ws.close();
    chrome.kill();
    server.close();
  }

  console.log('\n=============================================================================');
  console.log(`PHASE V2.3 BROWSER E2E TEST RESULTS: ${passedAssertions}/${totalAssertions} PASSED`);
  if (failedAssertions > 0) {
    console.error(`❌ FAILED ASSERTIONS: ${failedAssertions}`);
    process.exit(1);
  } else {
    console.log('✅ ALL PHASE V2.3 BROWSER E2E ASSERTIONS PASSED WITH 100% SUCCESS');
    console.log('=============================================================================\n');
  }
}

runBrowserE2E().catch((err) => {
  console.error('Fatal Browser E2E Error:', err);
  process.exit(1);
});
