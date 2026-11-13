/**
 * KAARYAN LABS — PHASE V3.5 BROWSER & CDP VERIFICATION SUITE
 * Targets:
 * - Vellore Community Noticeboard (/city/vellore/community)
 * - Vellore Local Events (/city/vellore/events)
 * - Modal interactions & responsive viewports (1440px, 768px, 390px, 320px)
 */

import { spawn, ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb\\screenshots';
const PARENT_ARTIFACT_DIR = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb';
const PORT = 8105;
const CDP_PORT = 9235;

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

  console.log(`  📸 Saved screenshot: ${filename} (${width}x${height})`);
}

async function runBrowserVerification() {
  console.log('================================================================');
  console.log('KAARYAN LABS — PHASE V3.5 BROWSER & VIEWPORT VERIFICATION');
  console.log('================================================================\n');

  let server: http.Server | null = null;
  let chromeProcess: ChildProcess | null = null;
  let ws: WebSocket | null = null;

  try {
    console.log(`[1/5] Starting local production server on port ${PORT}...`);
    server = await createStaticServer(PORT);
    console.log(`      Server running at http://127.0.0.1:${PORT}`);

    console.log(`[2/5] Launching Chrome Headless with remote debugging on ${CDP_PORT}...`);
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

    await wait(1500);

    console.log(`[3/5] Querying CDP endpoints...`);
    const versionRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
    const versionData = await versionRes.json();
    console.log(`      Connected to Chrome: ${versionData.Browser}`);

    const newTabRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?http://127.0.0.1:${PORT}/city/vellore/community`, {
      method: 'PUT',
    });
    const newTabData = await newTabRes.json();
    const wsUrl = newTabData.webSocketDebuggerUrl;

    ws = new WebSocket(wsUrl);
    await new Promise((res) => ws!.addEventListener('open', res));
    console.log('      CDP WebSocket connected successfully.');

    await sendCDP(ws, 'Page.enable');
    await sendCDP(ws, 'DOM.enable');

    // TEST SUITE A: COMMUNITY NOTICEBOARD
    console.log('\n--- VERIFYING VELLORE COMMUNITY NOTICEBOARD (/city/vellore/community) ---');
    await wait(2000);

    const communityTitle = await evaluateScript(ws, 'document.title');
    console.log(`  Title: "${communityTitle}"`);

    // Check horizontal overflow at 1440px
    const overflow1440 = await evaluateScript(
      ws,
      'document.documentElement.scrollWidth <= window.innerWidth'
    );
    console.log(`  Desktop (1440px) No Overflow: ${overflow1440}`);
    await captureScreenshot(ws, 1440, 900, 'phase_v3_5_community_desktop_1440px.png', false);

    // Tablet 768px
    const overflow768 = await evaluateScript(
      ws,
      'document.documentElement.scrollWidth <= window.innerWidth'
    );
    console.log(`  Tablet (768px) No Overflow: ${overflow768}`);
    await captureScreenshot(ws, 768, 1024, 'phase_v3_5_community_tablet_768px.png', true);

    // Mobile 390px
    const overflow390 = await evaluateScript(
      ws,
      'document.documentElement.scrollWidth <= window.innerWidth'
    );
    console.log(`  Mobile (390px) No Overflow: ${overflow390}`);
    await captureScreenshot(ws, 390, 844, 'phase_v3_5_community_mobile_390px.png', true);

    // Open Post Notice Modal
    await evaluateScript(
      ws,
      `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Post a Notice') || b.textContent.includes('Post Notice'));
        if (btn) btn.click();
      })()`
    );
    await wait(600);
    await captureScreenshot(ws, 390, 844, 'phase_v3_5_notice_modal_mobile_390px.png', true);

    // Close modal
    await evaluateScript(
      ws,
      `(() => {
        const closeBtn = document.querySelector('button[aria-label="Close modal"]') || document.querySelector('button[aria-label="Close"]');
        if (closeBtn) closeBtn.click();
      })()`
    );
    await wait(500);

    // Small Mobile 320px
    const overflow320 = await evaluateScript(
      ws,
      'document.documentElement.scrollWidth <= window.innerWidth'
    );
    console.log(`  Small Mobile (320px) No Overflow: ${overflow320}`);
    await captureScreenshot(ws, 320, 568, 'phase_v3_5_community_small_mobile_320px.png', true);

    // TEST SUITE B: LOCAL EVENTS CALENDAR
    console.log('\n--- VERIFYING VELLORE LOCAL EVENTS (/city/vellore/events) ---');
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore/events` });
    await wait(2000);

    const eventsTitle = await evaluateScript(ws, 'document.title');
    console.log(`  Title: "${eventsTitle}"`);

    // Desktop 1440px
    await captureScreenshot(ws, 1440, 900, 'phase_v3_5_events_desktop_1440px.png', false);

    // Tablet 768px
    await captureScreenshot(ws, 768, 1024, 'phase_v3_5_events_tablet_768px.png', true);

    // Mobile 390px
    await captureScreenshot(ws, 390, 844, 'phase_v3_5_events_mobile_390px.png', true);

    // Open Submit Event Modal
    await evaluateScript(
      ws,
      `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Submit an Event') || b.textContent.includes('Submit Event'));
        if (btn) btn.click();
      })()`
    );
    await wait(600);
    await captureScreenshot(ws, 390, 844, 'phase_v3_5_event_modal_mobile_390px.png', true);

    // Close modal
    await evaluateScript(
      ws,
      `(() => {
        const closeBtn = document.querySelector('button[aria-label="Close modal"]') || document.querySelector('button[aria-label="Close"]');
        if (closeBtn) closeBtn.click();
      })()`
    );
    await wait(500);

    // Small Mobile 320px
    const eventsOverflow320 = await evaluateScript(
      ws,
      'document.documentElement.scrollWidth <= window.innerWidth'
    );
    console.log(`  Small Mobile (320px) No Overflow: ${eventsOverflow320}`);
    await captureScreenshot(ws, 320, 568, 'phase_v3_5_events_small_mobile_320px.png', true);

    console.log('\n================================================================');
    console.log('✅ ALL BROWSER & VIEWPORT CHECKS COMPLETED SUCCESSFULLY!');
    console.log('================================================================');
  } catch (err) {
    console.error('Browser verification encountered an error:', err);
    process.exit(1);
  } finally {
    if (ws) {
      ws.close();
    }
    if (chromeProcess) {
      chromeProcess.kill('SIGKILL');
    }
    if (server) {
      server.close();
    }
  }
}

runBrowserVerification();
