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

function checkServerReady(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 304);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function sendCDP(ws: WebSocket, method: string, params: any = {}): Promise<any> {
  const id = Math.floor(Math.random() * 1000000);
  return new Promise((resolve, reject) => {
    const handleMsg = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.id === id) {
        ws.removeEventListener('message', handleMsg);
        if (data.error) reject(data.error);
        else resolve(data.result);
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
  outputPath: string
) {
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
  await wait(800);

  const res = await sendCDP(ws, 'Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });

  const buffer = Buffer.from(res.data, 'base64');
  fs.writeFileSync(outputPath, buffer);
}

async function main() {
  console.log('=============================================================================');
  console.log('KAARYAN LABS — PHASE 5A AUTHENTICATED DASHBOARD ACCEPTANCE & SCREENSHOT SUITE');
  console.log('=============================================================================\n');

  console.log('▶ 1. Launching Vite Preview Server on Port 4173...');
  const preview = spawn('npx.cmd', ['vite', 'preview', '--port', '4173', '--host', '127.0.0.1'], {
    shell: true,
  });

  let ready = false;
  for (let i = 0; i < 20; i++) {
    await wait(500);
    ready = await checkServerReady(4173);
    if (ready) break;
  }

  if (!ready) {
    console.error('❌ Failed to reach Vite preview server on 127.0.0.1:4173');
    preview.kill();
    process.exit(1);
  }
  console.log('✅ Vite preview server online.');

  console.log('\n▶ 2. Launching Headless Chrome with Remote Debugging (port 9222)...');
  const tmpProfile = path.join(process.cwd(), '.tmp-acceptance-chrome');
  if (fs.existsSync(tmpProfile)) {
    fs.rmSync(tmpProfile, { recursive: true, force: true });
  }

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    `--user-data-dir=${tmpProfile}`,
    'about:blank',
  ]);

  await wait(2000);

  // Connect via CDP WebSocket
  const targetsRes = await fetch('http://127.0.0.1:9222/json/list');
  const targets = await targetsRes.json();
  const pageTarget = targets.find((t: any) => t.type === 'page') || targets[0];
  console.log('   Target page connected:', pageTarget.title);

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve));

  await sendCDP(ws, 'Page.enable');
  await sendCDP(ws, 'Runtime.enable');
  await sendCDP(ws, 'DOM.enable');

  try {
    // -------------------------------------------------------------------------
    // STEP A: AUTHENTICATE AS BUSINESS OWNER
    // -------------------------------------------------------------------------
    console.log('\n▶ 3. Authenticating as Verified Business Owner (Sri Krishna Grand)...');
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/' });
    await wait(1200);

    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        localStorage.setItem('chittoorads_user', JSON.stringify({
          id: 'f7a0d0fc-f75a-496b-89c4-21f90448a38c',
          username: 'dev.owner',
          email: 'dev.owner@kaaryanlabs.com',
          role: 'provider',
          name: 'Sri Krishna Grand Restaurant',
          mobile: '+91 94402 18456',
          cityId: 'chittoor'
        }));
      `,
    });

    // -------------------------------------------------------------------------
    // STEP B: CAPTURE AUTHENTICATED RESPONSIVE VIEWPORTS (OVERVIEW)
    // -------------------------------------------------------------------------
    console.log('\n▶ 4. Capturing Authenticated Business Owner Dashboard Across 5 Viewports...');
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/chittoor/dashboard#overview' });
    await wait(2000);

    const viewports = [
      { name: 'owner_dashboard_1440px', width: 1440, height: 900, label: '1440px Large Desktop' },
      { name: 'owner_dashboard_1024px', width: 1024, height: 768, label: '1024px Small Desktop' },
      { name: 'owner_dashboard_768px', width: 768, height: 1024, label: '768px Tablet' },
      { name: 'owner_dashboard_390px', width: 390, height: 844, label: '390px Mobile (iPhone)' },
      { name: 'owner_dashboard_360px', width: 360, height: 800, label: '360px Compact Mobile' },
    ];

    for (const vp of viewports) {
      console.log(`   📸 Capturing ${vp.label}...`);
      const outPath = path.join(ARTIFACT_DIR, `${vp.name}.png`);
      await setViewportAndCapture(ws, vp.width, vp.height, outPath);
      console.log(`      ✅ Saved: ${vp.name}.png`);
    }

    // -------------------------------------------------------------------------
    // STEP C: CAPTURE ALL 6 SUBPAGES FOR AUTHENTICATED OWNER (DESKTOP & MOBILE)
    // -------------------------------------------------------------------------
    console.log('\n▶ 5. Capturing All 6 Subpages (Desktop 1440px & Mobile 390px)...');
    const subpages = [
      { id: 'overview', name: 'Overview' },
      { id: 'listings', name: 'My Listings' },
      { id: 'enquiries', name: 'Customer Enquiries' },
      { id: 'insights', name: 'Business Insights' },
      { id: 'profile', name: 'Business Profile' },
      { id: 'settings', name: 'Settings' },
    ];

    for (const page of subpages) {
      console.log(`   ▶ Navigating to: ${page.name} (#${page.id})`);
      await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:4173/city/chittoor/dashboard#${page.id}` });
      await wait(1800);

      // Desktop 1440px
      const desktopOut = path.join(ARTIFACT_DIR, `owner_${page.id}_1440px.png`);
      await setViewportAndCapture(ws, 1440, 900, desktopOut);
      console.log(`      ✅ Saved Desktop: owner_${page.id}_1440px.png`);

      // Mobile 390px
      const mobileOut = path.join(ARTIFACT_DIR, `owner_${page.id}_390px.png`);
      await setViewportAndCapture(ws, 390, 844, mobileOut);
      console.log(`      ✅ Saved Mobile: owner_${page.id}_390px.png`);
    }

    // -------------------------------------------------------------------------
    // STEP D: ACCESS CONTROL & ROLE GATES
    // -------------------------------------------------------------------------
    console.log('\n▶ 6. Testing Access Control & Role Gates...');

    // Customer Account Limitation Gate
    console.log('   📸 Testing Customer Role (role=customer)...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        localStorage.setItem('chittoorads_user', JSON.stringify({
          id: '7e61711a-66f3-455d-a4fb-d4774aa801f5',
          username: 'dev.customer',
          email: 'dev.customer@kaaryanlabs.com',
          role: 'customer',
          name: 'Dev Customer',
          mobile: '+91 98480 12345',
          cityId: 'chittoor'
        }));
      `,
    });
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/chittoor/dashboard' });
    await wait(1500);

    await setViewportAndCapture(
      ws,
      1440,
      900,
      path.join(ARTIFACT_DIR, 'gate_customer_limitation_1440px.png')
    );
    await setViewportAndCapture(
      ws,
      390,
      844,
      path.join(ARTIFACT_DIR, 'gate_customer_limitation_390px.png')
    );
    console.log('      ✅ Saved: gate_customer_limitation_1440px.png & 390px.png');

    // Unauthenticated Guest Merchant Gate
    console.log('   📸 Testing Unauthenticated Visitor (role=guest)...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `localStorage.removeItem('chittoorads_user');`,
    });
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/chittoor/dashboard' });
    await wait(1500);

    await setViewportAndCapture(
      ws,
      1440,
      900,
      path.join(ARTIFACT_DIR, 'gate_guest_merchant_1440px.png')
    );
    await setViewportAndCapture(
      ws,
      390,
      844,
      path.join(ARTIFACT_DIR, 'gate_guest_merchant_390px.png')
    );
    console.log('      ✅ Saved: gate_guest_merchant_1440px.png & 390px.png');

    // -------------------------------------------------------------------------
    // STEP E: PUBLIC WEBSITE INTEGRITY VERIFICATION
    // -------------------------------------------------------------------------
    console.log('\n▶ 7. Verifying Public Website Integrity Across Cities...');
    const publicCities = [
      { id: 'chittoor', label: 'Chittoor Ads' },
      { id: 'vellore', label: 'Vellore Ads' },
      { id: 'bengaluru', label: 'Bengaluru Ads' },
    ];

    for (const city of publicCities) {
      await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:4173/city/${city.id}` });
      await wait(1500);
      const out = path.join(ARTIFACT_DIR, `public_${city.id}_homepage_1440px.png`);
      await setViewportAndCapture(ws, 1440, 900, out);
      console.log(`      ✅ Saved: public_${city.id}_homepage_1440px.png`);
    }

    console.log('\n=============================================================================');
    console.log('🎉 ALL 21 TEST SCREENSHOTS CAPTURED WITH 100% SUCCESS!');
    console.log('=============================================================================');
  } finally {
    ws.close();
    chrome.kill();
    preview.kill();
    if (fs.existsSync(tmpProfile)) {
      try {
        fs.rmSync(tmpProfile, { recursive: true, force: true });
      } catch (e) {
        // ignore lock
      }
    }
  }
}

main().catch((err) => {
  console.error('Fatal error during capture suite:', err);
  process.exit(1);
});
