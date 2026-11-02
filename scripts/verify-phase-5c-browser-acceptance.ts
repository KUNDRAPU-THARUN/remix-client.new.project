import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb\\screenshots';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const testPassword = process.env.TEST_PASSWORD || process.env.DEV_PASSWORD || '';
if (!testPassword) {
  console.error('❌ Missing TEST_PASSWORD / DEV_PASSWORD in environment');
  process.exit(1);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  console.log(`   📸 Captured: ${path.basename(outputPath)} (${width}x${height})`);
}

async function main() {
  console.log('=============================================================================');
  console.log('KAARYAN LABS — PHASE 5C REAL BROWSER AUDIT & SCREENSHOT ACCEPTANCE SUITE');
  console.log('=============================================================================\n');

  // 1. Authenticate with live Supabase to obtain real tokens
  console.log('▶ 1. Authenticating with real Supabase Auth to obtain verified bearer session...');
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'dev.owner@kaaryanlabs.com',
    password: testPassword,
  });

  if (authErr || !authData.session) {
    console.error('❌ Failed to authenticate test business owner:', authErr?.message);
    process.exit(1);
  }

  const session = authData.session;
  const storageKey = 'kaaryan_multi_city_auth_session';

  console.log('   ✅ Real session established for user:', session.user.id);
  console.log('   ✅ Supabase project storage key:', storageKey);

  // 2. Launch Vite Preview Server
  console.log('\n▶ 2. Launching Vite Preview Server on Port 4173...');
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
  console.log('   ✅ Vite preview server online at http://127.0.0.1:4173');

  // 3. Launch Headless Chrome
  console.log('\n▶ 3. Launching Headless Chrome with Remote Debugging (port 9222)...');
  const tmpProfile = path.join(process.cwd(), '.tmp-acceptance-chrome-5c');
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

  // Connect via clean page target
  const newTargetRes = await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' });
  const pageTarget = await newTargetRes.json();
  console.log('   Target page created:', pageTarget.id);

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve));

  await sendCDP(ws, 'Page.enable');
  await sendCDP(ws, 'Runtime.enable');
  await sendCDP(ws, 'DOM.enable');

  let errorOccurred = false;
  const consoleErrors: string[] = [];

  ws.addEventListener('message', (evt) => {
    try {
      const d = JSON.parse(evt.data);
      if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') {
        const msg = d.params.args?.map((a: any) => a.value).join(' ');
        consoleErrors.push(msg);
      }
    } catch {}
  });

  try {
    // 4. Inject Verified Supabase Session into Browser
    console.log('\n▶ 4. Injecting verified Supabase bearer session into browser storage...');
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/' });
    await wait(1500);

    const sessionJson = JSON.stringify(session);
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        localStorage.setItem('${storageKey}', ${JSON.stringify(sessionJson)});
        localStorage.setItem('chittoorads_user', JSON.stringify({
          id: '${session.user.id}',
          username: 'dev.owner',
          email: '${session.user.email}',
          role: 'provider',
          name: '${session.user.user_metadata?.display_name || 'Dev Business Owner'}',
          mobile: '${session.user.user_metadata?.phone || '+91 94402 18456'}',
          cityId: 'chittoor'
        }));
      `,
    });

    console.log('   ✅ Real bearer tokens successfully stored in browser.');

    // 5. Navigate to Authenticated Dashboard
    console.log('\n▶ 5. Navigating to Authenticated Dashboard (#overview)...');
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/chittoor/dashboard#overview' });
    await wait(2500);

    // Verify dashboard rendered
    const titleRes = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `document.querySelector('h2')?.innerText || document.body.innerText.slice(0, 100)`,
    });
    console.log('   Dashboard heading detected:', titleRes.result?.value);

    // -------------------------------------------------------------------------
    // CAPTURE VIEWPORTS FOR OVERVIEW (7 Viewports: 360, 390, 430, 768, 1024, 1440, 1920)
    // -------------------------------------------------------------------------
    console.log('\n▶ 6. Capturing Overview across 7 Responsive Viewports...');
    const viewports = [
      { name: '1920px', w: 1920, h: 1080 },
      { name: '1440px', w: 1440, h: 900 },
      { name: '1024px', w: 1024, h: 768 },
      { name: '768px', w: 768, h: 1024 },
      { name: '430px', w: 430, h: 932 },
      { name: '390px', w: 390, h: 844 },
      { name: '360px', w: 360, h: 800 },
    ];

    for (const vp of viewports) {
      await setViewportAndCapture(
        ws,
        vp.w,
        vp.h,
        path.join(ARTIFACT_DIR, `phase5c_owner_overview_${vp.name}.png`)
      );
    }

    // -------------------------------------------------------------------------
    // CAPTURE SUBPAGES (1440px & 390px)
    // -------------------------------------------------------------------------
    console.log('\n▶ 7. Capturing Remaining 5 Subpages (1440px & 390px)...');

    const subpages: { tab: string; label: string }[] = [
      { tab: 'listings', label: 'My Listings' },
      { tab: 'enquiries', label: 'Customer Enquiries' },
      { tab: 'insights', label: 'Business Insights' },
      { tab: 'profile', label: 'Business Profile' },
      { tab: 'settings', label: 'Settings' },
    ];

    for (const page of subpages) {
      await sendCDP(ws, 'Page.navigate', {
        url: `http://127.0.0.1:4173/city/chittoor/dashboard#${page.tab}`,
      });
      await wait(1800);

      // Desktop 1440px
      await setViewportAndCapture(
        ws,
        1440,
        900,
        path.join(ARTIFACT_DIR, `phase5c_owner_${page.tab}_1440px.png`)
      );

      // Mobile 390px
      await setViewportAndCapture(
        ws,
        390,
        844,
        path.join(ARTIFACT_DIR, `phase5c_owner_${page.tab}_390px.png`)
      );
    }

    // -------------------------------------------------------------------------
    // CAPTURE DIALOGS & MODALS
    // -------------------------------------------------------------------------
    console.log('\n▶ 8. Capturing Dialogs & Modals...');

    // 8a. Add Listing Modal
    console.log('   Opening Add Listing Modal...');
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/chittoor/dashboard#listings' });
    await wait(1500);

    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Add New Listing') || b.innerText.includes('Post New'));
        if (addBtn) addBtn.click();
      `,
    });
    await wait(1000);

    await setViewportAndCapture(
      ws,
      1440,
      900,
      path.join(ARTIFACT_DIR, 'phase5c_modal_add_listing_1440px.png')
    );
    await setViewportAndCapture(
      ws,
      390,
      844,
      path.join(ARTIFACT_DIR, 'phase5c_modal_add_listing_390px.png')
    );

    // Close modal
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        const closeBtn = document.querySelector('button[aria-label="Close modal"]');
        if (closeBtn) closeBtn.click();
      `,
    });
    await wait(800);

    // 8b. Edit Profile Modal
    console.log('   Opening Edit Profile Modal...');
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/chittoor/dashboard#profile' });
    await wait(1500);

    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        const editBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Edit Profile'));
        if (editBtn) editBtn.click();
      `,
    });
    await wait(1000);

    await setViewportAndCapture(
      ws,
      1440,
      900,
      path.join(ARTIFACT_DIR, 'phase5c_modal_edit_profile_1440px.png')
    );
    await setViewportAndCapture(
      ws,
      390,
      844,
      path.join(ARTIFACT_DIR, 'phase5c_modal_edit_profile_390px.png')
    );

    // Close modal
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText === 'Cancel');
        if (cancelBtn) cancelBtn.click();
      `,
    });
    await wait(800);

    // 8c. Mobile Menu Drawer
    console.log('   Opening Mobile Sidebar Drawer (390px)...');
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/chittoor/dashboard#overview' });
    await wait(1500);

    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        const menuBtn = document.querySelector('button[aria-label="Open Navigation Menu"]');
        if (menuBtn) menuBtn.click();
      `,
    });
    await wait(800);

    await setViewportAndCapture(
      ws,
      390,
      844,
      path.join(ARTIFACT_DIR, 'phase5c_mobile_drawer_open_390px.png')
    );

    console.log(`\n=== CONSOLE ERROR AUDIT ===`);
    if (consoleErrors.length === 0) {
      console.log('   ✅ 0 browser console errors detected across all tested pages and viewports.');
    } else {
      console.warn(`   ⚠️ ${consoleErrors.length} console errors logged:`);
      consoleErrors.forEach((e) => console.warn(`      - ${e}`));
    }

    console.log('\n🎉 ALL REAL BROWSER SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Error during browser testing:', err);
    errorOccurred = true;
  } finally {
    // Teardown
    console.log('\n▶ Teardown servers and test profiles...');
    try { ws.close(); } catch {}
    try { chrome.kill(); } catch {}
    try { preview.kill(); } catch {}
    if (fs.existsSync(tmpProfile)) {
      try {
        fs.rmSync(tmpProfile, { recursive: true, force: true });
      } catch {}
    }
    process.exit(errorOccurred ? 1 : 0);
  }
}

main().catch(console.error);

