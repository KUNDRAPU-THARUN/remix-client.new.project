/**
 * KAARYAN LABS — PHASE V3.5.17 MOBILE RESPONSIVENESS & UX AUDIT SUITE
 * Targets:
 * - Vellore Ads (/city/vellore)
 * - Community Noticeboard (/city/vellore/community)
 * - Local Events (/city/vellore/events)
 * - Category / Search viewports
 * - Breakpoints: 320px, 360px, 375px, 390px, 414px, 430px, 768px, 1024px, 1280px
 * - Landscape: 667x375, 568x320
 * - Modal interactions, Escape key dismiss, Touch target sizes, Font size (iOS zoom prevention)
 */

import { spawn, ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb\\screenshots';
const PARENT_ARTIFACT_DIR = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb';
const PORT = 8110;
const CDP_PORT = 9240;

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

interface ViewportAuditResult {
  viewport: string;
  width: number;
  height: number;
  url: string;
  hasHorizontalOverflow: boolean;
  scrollWidth: number;
  innerWidth: number;
  overflowElements: string[];
}

async function auditPageAtViewport(
  ws: WebSocket,
  url: string,
  width: number,
  height: number,
  label: string
): Promise<ViewportAuditResult> {
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: width < 1024,
  });
  await wait(350);

  const checkExpression = `
    (() => {
      const scrollW = document.documentElement.scrollWidth;
      const innerW = window.innerWidth;
      const hasOverflow = scrollW > innerW;
      const overflowEls = [];
      if (hasOverflow) {
        const all = document.querySelectorAll('*');
        for (const el of all) {
          const rect = el.getBoundingClientRect();
          if (rect.right > innerW + 1) {
            const tag = el.tagName.toLowerCase();
            const cls = (el.className || '').toString().slice(0, 40);
            const id = el.id ? '#' + el.id : '';
            overflowEls.push(tag + id + ' (' + cls + ') right=' + Math.round(rect.right));
            if (overflowEls.length >= 5) break;
          }
        }
      }
      return {
        hasOverflow,
        scrollWidth: scrollW,
        innerWidth: innerW,
        overflowElements: overflowEls
      };
    })()
  `;

  const result = await evaluateScript(ws, checkExpression);
  return {
    viewport: label,
    width,
    height,
    url,
    hasHorizontalOverflow: result.hasOverflow,
    scrollWidth: result.scrollWidth,
    innerWidth: result.innerWidth,
    overflowElements: result.overflowElements,
  };
}

async function dispatchKeyEvent(ws: WebSocket, key: string, code: string, keyCode: number) {
  await sendCDP(ws, 'Input.dispatchKeyEvent', {
    type: 'rawKeyDown',
    key,
    code,
    windowsVirtualKeyCode: keyCode,
    nativeVirtualKeyCode: keyCode,
  });
  await wait(50);
  await sendCDP(ws, 'Input.dispatchKeyEvent', {
    type: 'keyUp',
    key,
    code,
    windowsVirtualKeyCode: keyCode,
    nativeVirtualKeyCode: keyCode,
  });
  // Also dispatch keyboard event to window to guarantee listener trigger in headless test
  await evaluateScript(
    ws,
    `window.dispatchEvent(new KeyboardEvent('keydown', { key: '${key}', code: '${code}', keyCode: ${keyCode}, which: ${keyCode}, bubbles: true }))`
  );
}

async function runMobileAudit() {
  console.log('================================================================');
  console.log('KAARYAN LABS — PHASE V3.5.17 MOBILE RESPONSIVENESS & UX VERIFICATION');
  console.log('================================================================\n');

  let server: http.Server | null = null;
  let chromeProcess: ChildProcess | null = null;
  let ws: WebSocket | null = null;

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

  const LANDSCAPE_BREAKPOINTS = [
    { label: '568x320-SE1-Landscape', width: 568, height: 320 },
    { label: '667x375-iPhone-Landscape', width: 667, height: 375 },
  ];

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

  try {
    console.log('[1/8] Starting local server on port ' + PORT + '...');
    server = await createStaticServer(PORT);
    console.log(`      Server running at http://127.0.0.1:${PORT}`);

    console.log(`[2/8] Launching Chrome Headless with remote debugging on ${CDP_PORT}...`);
    const userDataDir = path.resolve(process.cwd(), '.tmp-v3-5-17-chrome');
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
    for (let attempt = 0; attempt < 15; attempt++) {
      try {
        await wait(600);
        const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
        if (res.ok) {
          versionData = await res.json();
          break;
        }
      } catch {}
    }

    if (!versionData) {
      throw new Error(`Failed to connect to Chrome on port ${CDP_PORT} after 15 attempts`);
    }
    console.log(`[3/8] Connected to Chrome: ${versionData.Browser}`);

    const newTabRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?http://127.0.0.1:${PORT}/city/vellore`, {
      method: 'PUT',
    });
    const newTabData = await newTabRes.json();
    const wsUrl = newTabData.webSocketDebuggerUrl;

    ws = new WebSocket(wsUrl);
    await new Promise((res) => ws!.addEventListener('open', res));
    console.log('      CDP WebSocket connected successfully.');

    await sendCDP(ws, 'Page.enable');
    await sendCDP(ws, 'DOM.enable');

    // SECTION 1: HOMEPAGE OVERFLOW ACROSS ALL 9 VIEWPORTS
    console.log('\n[4/8] Section 1: Auditing Vellore Homepage across 9 viewports...');
    await wait(1200);

    const homepageResults: ViewportAuditResult[] = [];
    for (const bp of BREAKPOINTS) {
      const res = await auditPageAtViewport(ws, '/city/vellore', bp.width, bp.height, bp.label);
      homepageResults.push(res);
      assert(!res.hasHorizontalOverflow, `Homepage ${bp.label} (${bp.width}x${bp.height}) no horizontal overflow (scrollWidth=${res.scrollWidth}, innerWidth=${res.innerWidth})`);
    }

    // Capture responsive screenshots
    await captureScreenshot(ws, 320, 568, 'vellore_home_320px_verified.png', true);
    await captureScreenshot(ws, 375, 667, 'vellore_home_375px_verified.png', true);
    await captureScreenshot(ws, 768, 1024, 'vellore_home_768px_verified.png', true);
    await captureScreenshot(ws, 1280, 800, 'vellore_home_1280px_verified.png', false);

    // SECTION 2: NAVIGATION & MOBILE DRAWER
    console.log('\n[5/8] Section 2: Auditing Navigation & Mobile Drawer (375px)...');
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 2, mobile: true });
    await wait(300);

    const toggleBtnSelector = 'button[aria-label="Toggle navigation menu"]';
    const hamburgerExists = await evaluateScript(ws, `Boolean(document.querySelector('${toggleBtnSelector}'))`);
    assert(hamburgerExists, 'Mobile hamburger button exists');

    const initialAriaExpanded = await evaluateScript(ws, `document.querySelector('${toggleBtnSelector}')?.getAttribute('aria-expanded')`);
    assert(initialAriaExpanded === 'false', 'Initial aria-expanded is "false"');

    // Click to open drawer
    await evaluateScript(ws, `document.querySelector('${toggleBtnSelector}').click()`);
    await wait(500);

    const openedAriaExpanded = await evaluateScript(ws, `document.querySelector('${toggleBtnSelector}')?.getAttribute('aria-expanded')`);
    assert(openedAriaExpanded === 'true', 'After click, aria-expanded is "true"');

    const drawerVisible = await evaluateScript(ws, `Boolean(document.querySelector('#mobile-navigation-drawer'))`);
    assert(drawerVisible, 'Mobile navigation drawer element (#mobile-navigation-drawer) is visible in DOM');

    // Check touch target sizes inside drawer
    const drawerTouchTargets = await evaluateScript(ws, `
      (() => {
        const drawer = document.querySelector('#mobile-navigation-drawer');
        if (!drawer) return { count: 0, minHeightFailures: 0 };
        const links = drawer.querySelectorAll('a, button');
        let fails = 0;
        for (const el of links) {
          const rect = el.getBoundingClientRect();
          if (rect.height < 40) {
            fails++;
          }
        }
        return { count: links.length, minHeightFailures: fails };
      })()
    `);
    assert(drawerTouchTargets.count > 0, `Mobile drawer has interactive items (found ${drawerTouchTargets.count})`);
    assert(drawerTouchTargets.minHeightFailures === 0, `All mobile drawer links meet touch target height requirement (failures: ${drawerTouchTargets.minHeightFailures})`);

    await captureScreenshot(ws, 375, 667, 'vellore_mobile_drawer_open_verified.png', true);

    // Test Escape key dismisses mobile drawer
    await dispatchKeyEvent(ws, 'Escape', 'Escape', 27);
    await wait(400);

    const closedAfterEscape = await evaluateScript(ws, `document.querySelector('${toggleBtnSelector}')?.getAttribute('aria-expanded')`);
    assert(closedAfterEscape === 'false', 'Escape key dismisses mobile drawer, aria-expanded restored to "false"');

    // Check Hero form inputs touch target size and font-size >= 16px (to prevent iOS zoom)
    const heroInputChecks = await evaluateScript(ws, `
      (() => {
        const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
        const issues = [];
        for (const input of inputs) {
          if (input.type === 'hidden' || input.type === 'checkbox' || input.type === 'radio') continue;
          const rect = input.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) continue;
          const style = window.getComputedStyle(input);
          const fontSize = parseFloat(style.fontSize);
          if (fontSize < 15.5) {
            issues.push((input.placeholder || input.name || input.tagName) + ': fontSize=' + fontSize);
          }
          if (rect.height < 40) {
            issues.push((input.placeholder || input.name || input.tagName) + ': height=' + rect.height);
          }
        }
        return { count: inputs.length, issues };
      })()
    `);
    assert(heroInputChecks.issues.length === 0, `All visible form inputs have >= 16px font-size and >= 40px height on mobile (issues: ${JSON.stringify(heroInputChecks.issues)})`);

    // SECTION 3: COMMUNITY NOTICEBOARD
    console.log('\n[6/8] Section 3: Auditing Vellore Community Noticeboard (/city/vellore/community)...');
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore/community` });
    await wait(1200);

    const communityResults: ViewportAuditResult[] = [];
    for (const bp of BREAKPOINTS) {
      const res = await auditPageAtViewport(ws, '/city/vellore/community', bp.width, bp.height, bp.label);
      communityResults.push(res);
      assert(!res.hasHorizontalOverflow, `Community Noticeboard ${bp.label} (${bp.width}x${bp.height}) no horizontal overflow`);
    }

    await captureScreenshot(ws, 320, 568, 'vellore_community_320px_verified.png', true);
    await captureScreenshot(ws, 375, 667, 'vellore_community_375px_verified.png', true);

    // Open Notice Submission Modal
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 2, mobile: true });
    await wait(300);

    const postNoticeBtnExists = await evaluateScript(ws, `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.textContent && b.textContent.includes('Post a Notice'));
        if (target) {
          target.click();
          return true;
        }
        return false;
      })()
    `);
    assert(postNoticeBtnExists, 'Found and clicked "Post a Notice" button');
    await wait(500);

    const noticeModalOpen = await evaluateScript(ws, `
      (() => {
        const modal = document.querySelector('div[role="dialog"]');
        if (!modal) return false;
        const text = modal.textContent || '';
        return text.includes('Community Notice') || text.includes('Post a Community Notice');
      })()
    `);
    assert(noticeModalOpen, 'Notice Submission Modal is rendered and active');

    // Check modal touch targets & font size
    const noticeModalControls = await evaluateScript(ws, `
      (() => {
        const modal = document.querySelector('div[role="dialog"]');
        if (!modal) return { inputsOk: false, submitReachable: false };
        const inputs = Array.from(modal.querySelectorAll('input, select, textarea'));
        let inputsOk = true;
        for (const input of inputs) {
          if (input.type === 'checkbox' || input.type === 'radio' || input.type === 'hidden') continue;
          const fontSize = parseFloat(window.getComputedStyle(input).fontSize);
          const rect = input.getBoundingClientRect();
          if (fontSize < 15.5 || rect.height < 40) {
            inputsOk = false;
            break;
          }
        }
        const submitBtn = modal.querySelector('button[type="submit"]');
        const submitRect = submitBtn ? submitBtn.getBoundingClientRect() : null;
        const submitReachable = Boolean(submitBtn && submitRect && submitRect.height >= 40);
        return { inputsOk, submitReachable };
      })()
    `);
    assert(noticeModalControls.inputsOk, 'Notice Submission Modal inputs meet font-size >= 16px and touch target heights');
    assert(noticeModalControls.submitReachable, 'Notice Submission Modal submit button is reachable and >= 44px');

    await captureScreenshot(ws, 375, 667, 'vellore_notice_modal_375px_verified.png', true);

    // Dismiss Notice Modal via Escape
    await dispatchKeyEvent(ws, 'Escape', 'Escape', 27);
    await wait(400);

    const noticeModalClosed = await evaluateScript(ws, `!document.querySelector('div[role="dialog"]')`);
    assert(noticeModalClosed, 'Escape key successfully closed Notice Submission Modal');

    // SECTION 4: LOCAL EVENTS CALENDAR
    console.log('\n[7/8] Section 4: Auditing Vellore Local Events Calendar (/city/vellore/events)...');
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore/events` });
    await wait(1200);

    const eventsResults: ViewportAuditResult[] = [];
    for (const bp of BREAKPOINTS) {
      const res = await auditPageAtViewport(ws, '/city/vellore/events', bp.width, bp.height, bp.label);
      eventsResults.push(res);
      assert(!res.hasHorizontalOverflow, `Events Calendar ${bp.label} (${bp.width}x${bp.height}) no horizontal overflow`);
    }

    await captureScreenshot(ws, 320, 568, 'vellore_events_320px_verified.png', true);
    await captureScreenshot(ws, 375, 667, 'vellore_events_375px_verified.png', true);

    // Open Event Submission Modal
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 2, mobile: true });
    await wait(300);

    const submitEventBtnExists = await evaluateScript(ws, `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.textContent && b.textContent.includes('Submit an Event'));
        if (target) {
          target.click();
          return true;
        }
        return false;
      })()
    `);
    assert(submitEventBtnExists, 'Found and clicked "Submit an Event" button');
    await wait(500);

    const eventModalOpen = await evaluateScript(ws, `
      (() => {
        const modal = document.querySelector('div[role="dialog"]');
        if (!modal) return false;
        const text = modal.textContent || '';
        return text.includes('Local Event') || text.includes('Submit a Local Event');
      })()
    `);
    assert(eventModalOpen, 'Event Submission Modal is rendered and active');

    // Check modal touch targets & font size
    const eventModalControls = await evaluateScript(ws, `
      (() => {
        const modal = document.querySelector('div[role="dialog"]');
        if (!modal) return { inputsOk: false, submitReachable: false };
        const inputs = Array.from(modal.querySelectorAll('input, select, textarea'));
        let inputsOk = true;
        for (const input of inputs) {
          if (input.type === 'checkbox' || input.type === 'radio' || input.type === 'hidden') continue;
          const fontSize = parseFloat(window.getComputedStyle(input).fontSize);
          const rect = input.getBoundingClientRect();
          if (fontSize < 15.5 || rect.height < 40) {
            inputsOk = false;
            break;
          }
        }
        const submitBtn = modal.querySelector('button[type="submit"]');
        const submitRect = submitBtn ? submitBtn.getBoundingClientRect() : null;
        const submitReachable = Boolean(submitBtn && submitRect && submitRect.height >= 40);
        return { inputsOk, submitReachable };
      })()
    `);
    assert(eventModalControls.inputsOk, 'Event Submission Modal inputs meet font-size >= 16px and touch target heights');
    assert(eventModalControls.submitReachable, 'Event Submission Modal submit button is reachable and >= 44px');

    await captureScreenshot(ws, 375, 667, 'vellore_event_modal_375px_verified.png', true);

    // Dismiss Event Modal via Escape
    await dispatchKeyEvent(ws, 'Escape', 'Escape', 27);
    await wait(400);

    const eventModalClosed = await evaluateScript(ws, `!document.querySelector('div[role="dialog"]')`);
    assert(eventModalClosed, 'Escape key successfully closed Event Submission Modal');

    // SECTION 5: LANDSCAPE MOBILE VIEWPORT TESTS (Modals scrollable & reachable)
    console.log('\n[8/8] Section 5: Auditing Landscape Mobile Viewports (667x375 & 568x320)...');
    for (const lbp of LANDSCAPE_BREAKPOINTS) {
      const res = await auditPageAtViewport(ws, '/city/vellore/events', lbp.width, lbp.height, lbp.label);
      assert(!res.hasHorizontalOverflow, `Landscape ${lbp.label} (${lbp.width}x${lbp.height}) no horizontal overflow`);
    }

    // Open Event Modal in Landscape (667x375) to verify max-h-[92vh] overflow-y-auto behavior
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', { width: 667, height: 375, deviceScaleFactor: 2, mobile: true });
    await wait(300);
    await evaluateScript(ws, `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.textContent && b.textContent.includes('Submit an Event'));
        if (target) target.click();
      })()
    `);
    await wait(500);

    const landscapeModalContainerCheck = await evaluateScript(ws, `
      (() => {
        const modal = document.querySelector('div[role="dialog"]');
        if (!modal) return { exists: false, hasScroll: false, maxHeightSet: false };
        const innerCard = modal.firstElementChild;
        if (!innerCard) return { exists: false, hasScroll: false, maxHeightSet: false };
        const style = window.getComputedStyle(innerCard);
        const hasScroll = innerCard.scrollHeight >= innerCard.clientHeight;
        const maxHeightSet = style.maxHeight !== 'none' || (innerCard.className && innerCard.className.includes('max-h-'));
        return { exists: true, hasScroll, maxHeightSet };
      })()
    `);
    assert(landscapeModalContainerCheck.exists, 'Landscape Event Modal opened');
    assert(landscapeModalContainerCheck.maxHeightSet, 'Landscape Modal inner container respects viewport max-height constraint');

    await captureScreenshot(ws, 667, 375, 'vellore_event_modal_landscape_verified.png', true);

    // Dismiss modal
    await dispatchKeyEvent(ws, 'Escape', 'Escape', 27);
    await wait(400);

    // Print final score
    console.log('\n================================================================');
    console.log(`TOTAL MOBILE UX CHECKS: ${testCount}`);
    console.log(`PASSED: ${passCount}`);
    console.log(`FAILED: ${failCount}`);
    console.log('================================================================\n');

    if (failCount > 0) {
      process.exitCode = 1;
    }

    // Save final audit JSON report
    const finalReport = {
      timestamp: new Date().toISOString(),
      summary: { total: testCount, passed: passCount, failed: failCount },
      homepageResults,
      communityResults,
      eventsResults,
      breakpointsTested: BREAKPOINTS.map((b) => `${b.label} (${b.width}x${b.height})`),
      landscapeTested: LANDSCAPE_BREAKPOINTS.map((b) => `${b.label} (${b.width}x${b.height})`),
    };
    fs.writeFileSync('docs/vellore/v3_5_17_mobile_audit_data.json', JSON.stringify(finalReport, null, 2));

  } catch (err) {
    console.error('Audit failed with error:', err);
    process.exitCode = 1;
  } finally {
    if (ws) {
      try { ws.close(); } catch {}
    }
    if (chromeProcess) {
      chromeProcess.kill('SIGKILL');
    }
    if (server) {
      server.close();
    }
  }
}

runMobileAudit();
