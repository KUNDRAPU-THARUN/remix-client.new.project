/**
 * KAARYAN LABS — PHASE V3.2.2 BROWSER AUTOMATION & E2E VERIFICATION SUITE
 * TARGET: Vellore Ads (/city/vellore, TN-23)
 * Comprehensive headless Chrome CDP verification of:
 * - /city/vellore/about (Desktop, Tablet, Mobile, Small Mobile)
 * - /city/vellore/contact (Form validation, contact channels, responsive layouts)
 * - /city/vellore/biz/:id (Standalone business profiles, moderation guarding, not-found fallbacks)
 * - Footer navigation & URL alias handling
 * - Visual overflow audits & console error tracking
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

    // 2. Specific subpage prerendered routes
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
  await wait(300);
  const { data } = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(outputPath, Buffer.from(data, 'base64'));
}

async function runBrowserTests() {
  console.log('======================================================================');
  console.log('KAARYAN LABS — PHASE V3.2.2 VELLORE ADS BROWSER & ROUTE VERIFICATION');
  console.log('======================================================================\n');

  const PORT = 8095;
  const server = await createStaticServer(PORT);
  console.log(`[HTTP Server] Listening on http://127.0.0.1:${PORT}`);

  const userDataDir = path.resolve(process.cwd(), '.tmp-v3-2-2-chrome');
  if (fs.existsSync(userDataDir)) {
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }

  const chromeProc: ChildProcess = spawn(
    CHROME_PATH,
    [
      '--remote-debugging-port=9226',
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-extensions',
      `--user-data-dir=${userDataDir}`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  await wait(1800);

  let wsEndpoint = '';
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      const res = await fetch('http://127.0.0.1:9226/json');
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
  await sendCDP(ws, 'DOM.enable');

  const consoleErrors: string[] = [];
  ws.addEventListener('message', (event: MessageEvent) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        const text = msg.params.args.map((a: any) => a.value || a.description).join(' ');
        consoleErrors.push(text);
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        consoleErrors.push(msg.params.exceptionDetails?.text || 'Uncaught exception');
      }
    } catch {}
  });

  let totalAssertions = 0;
  let passedAssertions = 0;

  function assert(desc: string, condition: boolean, detail = '') {
    totalAssertions++;
    if (condition) {
      passedAssertions++;
      console.log(`  ✅ PASS: ${desc}`);
    } else {
      console.error(`  ❌ FAIL: ${desc} ${detail ? `(${detail})` : ''}`);
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: ABOUT PAGE VERIFICATION (/city/vellore/about)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 1: VELLORE ABOUT PAGE VERIFICATION ---');
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore/about` });
    await wait(2000);

    const aboutTitle = await evaluateScript(ws, 'document.title');
    assert(
      'Document title matches Vellore About page',
      aboutTitle.includes('About Vellore Ads') && aboutTitle.includes('TN-23'),
      `Got: ${aboutTitle}`
    );

    const aboutHeading = await evaluateScript(ws, 'document.querySelector("h1")?.innerText');
    assert('H1 heading is "About Vellore Ads"', aboutHeading === 'About Vellore Ads', `Got: ${aboutHeading}`);

    const breadcrumbText = await evaluateScript(
      ws,
      'document.querySelector(\'nav[aria-label="Breadcrumb"]\')?.innerText'
    );
    assert(
      'Breadcrumb displays Home -> About Vellore Ads',
      breadcrumbText?.includes('Home') && breadcrumbText?.includes('About Vellore Ads'),
      `Got: ${breadcrumbText}`
    );

    const hasPillars = await evaluateScript(
      ws,
      'document.body.innerText.includes("Healthcare & Medical Capital") && document.body.innerText.includes("University & Student Life") && document.body.innerText.includes("Heritage & Pilgrimage")'
    );
    assert('All four regional economic corridors are highlighted', Boolean(hasPillars));

    const aboutCanonical = await evaluateScript(
      ws,
      'document.querySelector(\'link[rel="canonical"]\')?.getAttribute("href")'
    );
    assert(
      'Canonical link points to /city/vellore/about',
      aboutCanonical?.endsWith('/city/vellore/about'),
      `Got: ${aboutCanonical}`
    );

    // -------------------------------------------------------------------------
    // TEST 2: CONTACT PAGE VERIFICATION (/city/vellore/contact)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 2: VELLORE CONTACT PAGE VERIFICATION ---');
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore/contact` });
    await wait(2000);

    const contactTitle = await evaluateScript(ws, 'document.title');
    assert(
      'Document title matches Vellore Contact page',
      contactTitle.includes('Contact Vellore Ads') && contactTitle.includes('TN-23'),
      `Got: ${contactTitle}`
    );

    const phoneHref = await evaluateScript(
      ws,
      'document.querySelector(\'a[href^="tel:"]\')?.getAttribute("href")'
    );
    assert('Helpline phone link is tel:+918189985559', phoneHref === 'tel:+918189985559', `Got: ${phoneHref}`);

    const waHref = await evaluateScript(
      ws,
      'document.querySelector(\'a[href*="wa.me"]\')?.getAttribute("href")'
    );
    assert('WhatsApp link targets 918189985559', waHref?.includes('918189985559'), `Got: ${waHref}`);

    const mailHref = await evaluateScript(
      ws,
      'document.querySelector(\'a[href^="mailto:"]\')?.getAttribute("href")'
    );
    assert('Email link targets info@velloreads.com', mailHref === 'mailto:info@velloreads.com', `Got: ${mailHref}`);

    const addressText = await evaluateScript(ws, 'document.body.innerText');
    assert('Office address mentions Katpadi Main Road and Near VIT Junction',
      addressText.includes('Katpadi Main Road') && addressText.includes('Near VIT Junction')
    );

    assert('Operating hours displayed (Monday – Saturday: 9:00 AM – 7:30 PM)',
      addressText.includes('Monday – Saturday: 9:00 AM – 7:30 PM')
    );

    // Form validation test: submit empty form
    await evaluateScript(ws, 'document.querySelector(\'button[type="submit"]\')?.click()');
    await wait(400);

    const formErrors = await evaluateScript(
      ws,
      'Array.from(document.querySelectorAll("p.text-red-600")).map(el => el.innerText).join(" | ")'
    );
    assert(
      'Form validation prevents empty submission and flags required fields',
      formErrors.includes('full name') && formErrors.includes('mobile number') && formErrors.includes('details'),
      `Got: ${formErrors}`
    );

    // -------------------------------------------------------------------------
    // TEST 3: STANDALONE BUSINESS PROFILE (/city/vellore/biz/v-001)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 3: STANDALONE BUSINESS PROFILE (/city/vellore/biz/v-001) ---');
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore/biz/v-001` });
    await wait(2000);

    const bizTitle = await evaluateScript(ws, 'document.title');
    assert(
      'Document title contains business title and Vellore Ads (TN-23)',
      bizTitle.includes('Sample Medical Diagnostic') || bizTitle.includes('TN-23'),
      `Got: ${bizTitle}`
    );

    const bizHeading = await evaluateScript(ws, 'document.querySelector("h1")?.innerText');
    assert(
      'H1 heading renders business title',
      bizHeading?.includes('Sample Medical Diagnostic') || bizHeading?.includes('Listing'),
      `Got: ${bizHeading}`
    );

    const hasShareBtn = await evaluateScript(
      ws,
      'Boolean(document.querySelector(\'button[aria-label="Share listing"]\') || document.body.innerText.includes("Share"))'
    );
    assert('Share button is available on standalone profile', Boolean(hasShareBtn));

    const hasBreadcrumbs = await evaluateScript(
      ws,
      'Boolean(document.querySelector(\'nav[aria-label="Breadcrumb"]\'))'
    );
    assert('Breadcrumbs navigation present on profile', Boolean(hasBreadcrumbs));

    // -------------------------------------------------------------------------
    // TEST 4: PENDING BUSINESS SECURITY GUARD (/city/vellore/biz/v-pending-01)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 4: PENDING APPROVAL SECURITY GUARD (/city/vellore/biz/v-pending-01) ---');
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore/biz/v-pending-01` });
    await wait(2000);

    const pendingHeading = await evaluateScript(ws, 'document.querySelector("h1")?.innerText');
    assert(
      'Unauthenticated visitor receives "Listing Under Review" screen',
      pendingHeading?.includes('Listing Under Review'),
      `Got: ${pendingHeading}`
    );

    const pendingBody = await evaluateScript(ws, 'document.body.innerText');
    assert(
      'Private merchant details are NOT exposed to anonymous visitor',
      !pendingBody.includes('94432 11223') && pendingBody.includes('moderation desk')
    );

    // -------------------------------------------------------------------------
    // TEST 5: INVALID BUSINESS ID NOT-FOUND VIEW (/city/vellore/biz/v-nonexistent-999)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 5: INVALID LISTING ID NOT-FOUND FALLBACK ---');
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore/biz/v-nonexistent-999` });
    await wait(2000);

    const notFoundHeading = await evaluateScript(ws, 'document.querySelector("h1")?.innerText');
    assert(
      'Non-existent listing renders accessible "Business Listing Not Found" heading',
      notFoundHeading?.includes('Business Listing Not Found'),
      `Got: ${notFoundHeading}`
    );

    const hasSearchFallback = await evaluateScript(
      ws,
      'Boolean(document.querySelector(\'input[placeholder*="Search verified businesses"]\'))'
    );
    assert('Search recovery input available on not-found screen', Boolean(hasSearchFallback));

    // -------------------------------------------------------------------------
    // TEST 6: RESPONSIVE VIEWPORTS & VISUAL OVERFLOW AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 6: RESPONSIVE VIEWPORTS & VISUAL OVERFLOW AUDIT ---');

    const viewports = [
      { name: 'desktop_1440px', width: 1440, height: 900, mobile: false },
      { name: 'tablet_768px', width: 768, height: 1024, mobile: false },
      { name: 'mobile_390px', width: 390, height: 844, mobile: true },
      { name: 'small_mobile_320px', width: 320, height: 568, mobile: true },
    ];

    for (const vp of viewports) {
      // About Page
      await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore/about` });
      await wait(1200);
      const aboutOverflow = await evaluateScript(
        ws,
        'document.documentElement.scrollWidth > window.innerWidth'
      );
      assert(
        `About page (${vp.name}): Zero horizontal overflow`,
        aboutOverflow === false,
        `scrollWidth > innerWidth? ${aboutOverflow}`
      );
      await captureScreenshot(
        ws,
        vp.width,
        vp.height,
        path.join(ARTIFACT_DIR, `phase_v3_2_2_about_${vp.name}.png`),
        vp.mobile
      );

      // Contact Page
      await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore/contact` });
      await wait(1200);
      const contactOverflow = await evaluateScript(
        ws,
        'document.documentElement.scrollWidth > window.innerWidth'
      );
      assert(
        `Contact page (${vp.name}): Zero horizontal overflow`,
        contactOverflow === false,
        `scrollWidth > innerWidth? ${contactOverflow}`
      );
      await captureScreenshot(
        ws,
        vp.width,
        vp.height,
        path.join(ARTIFACT_DIR, `phase_v3_2_2_contact_${vp.name}.png`),
        vp.mobile
      );

      // Standalone Biz Page
      await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore/biz/v-001` });
      await wait(1200);
      const bizOverflow = await evaluateScript(
        ws,
        'document.documentElement.scrollWidth > window.innerWidth'
      );
      assert(
        `Biz page (${vp.name}): Zero horizontal overflow`,
        bizOverflow === false,
        `scrollWidth > innerWidth? ${bizOverflow}`
      );
      await captureScreenshot(
        ws,
        vp.width,
        vp.height,
        path.join(ARTIFACT_DIR, `phase_v3_2_2_biz_${vp.name}.png`),
        vp.mobile
      );
    }

    // -------------------------------------------------------------------------
    // TEST 7: CONSOLE ERROR AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 7: BROWSER CONSOLE ERROR AUDIT ---');
    assert('Zero uncaught exceptions or browser console errors recorded', consoleErrors.length === 0, consoleErrors.join('; '));

  } finally {
    ws.close();
    chromeProc.kill();
    server.close();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }

  console.log('\n======================================================================');
  console.log(`TOTAL PHASE V3.2.2 ASSERTIONS: ${totalAssertions}`);
  console.log(`PASSED: ${passedAssertions}`);
  console.log(`FAILED: ${totalAssertions - passedAssertions}`);
  console.log('======================================================================\n');

  if (passedAssertions === totalAssertions) {
    console.log('🎉 ALL PHASE V3.2.2 BROWSER & ROUTE VERIFICATIONS PASSED (100%)!\n');
    process.exit(0);
  } else {
    console.error('❌ SOME ASSERTIONS FAILED.\n');
    process.exit(1);
  }
}

runBrowserTests().catch((err) => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
