import { spawn } from 'child_process';
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

    // 1. Check exact file in dist
    let filePath = path.join(distDir, cleanPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(filePath));
      return;
    }

    // 2. City-specific prerendered routes
    if (cleanPath === '/city/chittoor' || cleanPath.startsWith('/city/chittoor/')) {
      const cityHtml = path.join(distDir, 'city/chittoor/index.html');
      if (fs.existsSync(cityHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(cityHtml));
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

    if (cleanPath === '/city/bengaluru' || cleanPath.startsWith('/city/bengaluru/')) {
      const cityHtml = path.join(distDir, 'city/bengaluru/index.html');
      if (fs.existsSync(cityHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(cityHtml));
        return;
      }
    }

    // 3. Fallback to root index.html
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

async function setViewportAndCapture(
  ws: WebSocket,
  width: number,
  height: number,
  outputPath: string,
  scrollToSection = false
) {
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
  await wait(500);

  if (scrollToSection) {
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        const el = document.getElementById('quick-services-section');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
      `,
    });
    await wait(400);
  }

  const res = await sendCDP(ws, 'Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });

  const buffer = Buffer.from(res.data, 'base64');
  fs.writeFileSync(outputPath, buffer);
  console.log(`📸 Captured: ${path.basename(outputPath)} (${width}x${height}, ${buffer.length} bytes)`);
}

async function main() {
  console.log('=============================================================================');
  console.log('KAARYAN LABS — QUICK SERVICES VISUAL QUALITY AUDIT & SCREENSHOT SUITE');
  console.log('=============================================================================\n');

  const PORT = 4199;
  const CDP_PORT = 9244;

  console.log(`▶ 1. Launching In-Process Static Server on Port ${PORT}...`);
  const server = await createStaticServer(PORT);
  console.log(`✅ Static server listening on http://127.0.0.1:${PORT}`);

  console.log(`\n▶ 2. Launching Headless Chrome on Port ${CDP_PORT}...`);
  const tmpProfile = path.join(process.cwd(), '.tmp-qs-chrome');
  if (fs.existsSync(tmpProfile)) {
    fs.rmSync(tmpProfile, { recursive: true, force: true });
  }

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpProfile}`,
    '--no-first-run',
    '--no-default-browser-check',
  ]);

  let cdpReady = false;
  let pageDebuggerUrl = '';
  for (let i = 0; i < 30; i++) {
    await wait(400);
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
    } catch {}
  }

  if (!cdpReady || !pageDebuggerUrl) {
    console.warn('⚠️ Chrome DevTools Protocol port not reachable.');
    chrome.kill();
    server.close();
    return;
  }
  console.log('✅ Chrome DevTools Protocol connected at:', pageDebuggerUrl);

  const ws = new WebSocket(pageDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve));

  await sendCDP(ws, 'Page.enable');
  await sendCDP(ws, 'DOM.enable');
  await sendCDP(ws, 'Runtime.enable');

  const VIEWPORTS = [
    { width: 1920, height: 1080, name: '1920px_desktop_large' },
    { width: 1440, height: 900, name: '1440px_desktop_standard' },
    { width: 1024, height: 768, name: '1024px_tablet_landscape' },
    { width: 768, height: 1024, name: '768px_tablet_portrait' },
    { width: 390, height: 844, name: '390px_mobile_iphone' },
    { width: 360, height: 780, name: '360px_mobile_compact' },
  ];

  const CITIES = [
    { id: 'chittoor', path: '/city/chittoor' },
    { id: 'vellore', path: '/city/vellore' },
    { id: 'bengaluru', path: '/city/bengaluru' },
  ];

  console.log('\n▶ 3. Capturing Multi-City & Responsive Viewport Screenshots...');

  for (const city of CITIES) {
    console.log(`\n--- Navigating to ${city.id} (${city.path}) ---`);
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}${city.path}` });
    await wait(2000);

    // Desktop standard capture (full overview)
    await setViewportAndCapture(
      ws,
      1440,
      900,
      path.join(ARTIFACT_DIR, `quick_services_${city.id}_1440px.png`),
      false
    );

    // Desktop section focus
    await setViewportAndCapture(
      ws,
      1440,
      900,
      path.join(ARTIFACT_DIR, `quick_services_${city.id}_section_1440px.png`),
      true
    );

    // Mobile section focus
    await setViewportAndCapture(
      ws,
      390,
      844,
      path.join(ARTIFACT_DIR, `quick_services_${city.id}_390px.png`),
      true
    );
  }

  // Comprehensive 6-viewport responsive test on Vellore focused on the quick services section
  console.log('\n--- 6-Viewport Responsive Audit on Vellore (Section Focused) ---');
  await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/city/vellore` });
  await wait(1800);

  for (const vp of VIEWPORTS) {
    await setViewportAndCapture(
      ws,
      vp.width,
      vp.height,
      path.join(ARTIFACT_DIR, `quick_services_responsive_${vp.name}.png`),
      true
    );
  }

  console.log('\n🎉 All requested visual screenshots captured successfully!');
  ws.close();
  chrome.kill();
  server.close();
}

main().catch((err) => {
  console.error('Visual capture error:', err);
});
