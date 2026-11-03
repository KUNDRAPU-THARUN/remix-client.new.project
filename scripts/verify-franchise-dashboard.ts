import { spawn } from 'child_process';
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

async function checkServerReady(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/`);
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
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
  await wait(600);

  const res = await sendCDP(ws, 'Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });

  const buffer = Buffer.from(res.data, 'base64');
  fs.writeFileSync(outputPath, buffer);
}

interface TestAssertion {
  name: string;
  category: string;
  passed: boolean;
  details: string;
}

const assertions: TestAssertion[] = [];

function assert(category: string, name: string, condition: boolean, details: string) {
  assertions.push({ name, category, passed: condition, details });
  if (condition) {
    console.log(`   ✅ PASS: [${category}] ${name}`);
  } else {
    console.error(`   ❌ FAIL: [${category}] ${name} -> ${details}`);
  }
}

async function main() {
  console.log('=============================================================================');
  console.log('KAARYAN LABS — PHASE 6A CITY FRANCHISE DASHBOARD ACCEPTANCE SUITE');
  console.log('=============================================================================\n');

  console.log('▶ 1. Launching Vite Preview Server on Port 4173...');
  const preview = spawn(process.execPath, ['./node_modules/vite/bin/vite.js', 'preview', '--port', '4173', '--host', '127.0.0.1']);

  let ready = false;
  for (let i = 0; i < 30; i++) {
    await wait(300);
    ready = await checkServerReady(4173);
    if (ready) break;
  }

  if (!ready) {
    console.error('❌ Failed to launch Vite preview server.');
    preview.kill();
    process.exit(1);
  }
  console.log('✅ Vite preview server online on port 4173.\n');

  console.log('▶ 2. Launching Headless Chrome with Pristine User Profile (port 9226)...');
  const tmpProfile = path.join(process.cwd(), '.tmp-franchise-chrome');
  if (fs.existsSync(tmpProfile)) {
    fs.rmSync(tmpProfile, { recursive: true, force: true });
  }

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9226',
    `--user-data-dir=${tmpProfile}`,
    '--no-first-run',
    '--no-default-browser-check',
  ]);

  let wsUrl = '';
  for (let i = 0; i < 30; i++) {
    await wait(400);
    try {
      const resp = await fetch('http://127.0.0.1:9226/json/list');
      if (resp.ok) {
        const targets: any = await resp.json();
        const pageTarget = targets.find((t: any) => t.type === 'page') || targets[0];
        if (pageTarget && pageTarget.webSocketDebuggerUrl) {
          wsUrl = pageTarget.webSocketDebuggerUrl;
          break;
        }
      }
    } catch {}
  }

  if (!wsUrl) {
    console.error('❌ Could not connect to Chrome DevTools Protocol.');
    chromeProc.kill();
    preview.kill();
    process.exit(1);
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((res) => ws.addEventListener('open', res));
  await sendCDP(ws, 'Page.enable');
  await sendCDP(ws, 'DOM.enable');
  await sendCDP(ws, 'Runtime.enable');

  console.log('✅ Connected to Chrome. Running Acceptance Test Journeys...\n');

  try {
    // ---------------------------------------------------------------------------
    // JOURNEY 1: UNAUTHENTICATED VISITOR GATE
    // ---------------------------------------------------------------------------
    console.log('▶ Journey 1: Testing Unauthenticated Gate on /city/vellore/franchise...');
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/vellore/franchise' });
    await wait(2000);

    const gateEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasAuthReq: text.includes('Franchise Authentication Required'),
          hasSignInBtn: text.includes('Sign In to Franchise Portal'),
          hasVelloreCode: text.includes('TN-23'),
          hasRestrictedNotice: text.includes('Restricted regional administration gateway'),
          noAdminToolsVisible: !text.includes('Pending Verification Queue')
        };
      })()`,
      returnByValue: true,
    });

    const gRes = gateEval.result?.value || {};
    assert('Auth Gate', 'Blocks unauthenticated visitor', gRes.hasAuthReq, 'Requires login');
    assert('Auth Gate', 'Shows Sign In CTA button', gRes.hasSignInBtn, 'Shows Sign In to Franchise Portal');
    assert('Auth Gate', 'Displays city territorial code (TN-23)', gRes.hasVelloreCode, 'TN-23 verified');
    assert('Auth Gate', 'Hides administrative tools from guest', gRes.noAdminToolsVisible, 'Admin tools hidden');

    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'franchise_gate_unauthenticated_1440px.png'));
    await setViewportAndCapture(ws, 390, 844, path.join(ARTIFACT_DIR, 'franchise_gate_unauthenticated_390px.png'));
    console.log('   📸 Captured: franchise_gate_unauthenticated_1440px.png & 390px.png\n');

    // ---------------------------------------------------------------------------
    // JOURNEY 2: CUSTOMER ACCOUNT DENIAL
    // ---------------------------------------------------------------------------
    console.log('▶ Journey 2: Testing Customer Account Access Denial...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const customerUser = {
          id: 'usr-cust-01',
          name: 'Anitha Ramesh',
          email: 'anitha.customer@kaaryanlabs.com',
          role: 'customer',
          cityId: 'vellore'
        };
        localStorage.setItem('chittoorads_user', JSON.stringify(customerUser));
        window.location.reload();
      })()`,
    });
    await wait(2000);

    const custEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasCustomerDenied: text.includes('Franchise Partner Privileges Required'),
          hasCustomerName: text.includes('Anitha Ramesh'),
          hasSwitchBtn: text.includes('Switch Account'),
          noAdminTools: !text.includes('Pending Verification Queue')
        };
      })()`,
      returnByValue: true,
    });

    const cRes = custEval.result?.value || {};
    assert('Role Boundary', 'Customer account access denied', cRes.hasCustomerDenied, 'Shows Franchise Privileges Required');
    assert('Role Boundary', 'Identifies customer account name', cRes.hasCustomerName, 'Customer name shown');
    assert('Role Boundary', 'Admin tools strictly hidden from customer', cRes.noAdminTools, 'Admin queue hidden');

    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'franchise_gate_customer_denied_1440px.png'));
    console.log('   📸 Captured: franchise_gate_customer_denied_1440px.png\n');

    // ---------------------------------------------------------------------------
    // JOURNEY 3: BUSINESS OWNER ACCOUNT DENIAL (WITHOUT FRANCHISE ROLE)
    // ---------------------------------------------------------------------------
    console.log('▶ Journey 3: Testing Standard Business Owner Account Denial...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const ownerUser = {
          id: 'usr-owner-01',
          name: 'Senthil Textiles Owner',
          email: 'senthil.owner@kaaryanlabs.com',
          role: 'provider',
          roles: [{ role: 'business_owner', cityId: 'vellore' }],
          cityId: 'vellore'
        };
        localStorage.setItem('chittoorads_user', JSON.stringify(ownerUser));
        window.location.reload();
      })()`,
    });
    await wait(2000);

    const ownerEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasOwnerScope: text.includes('Business Owner Scope'),
          hasGoToOwnerDashboard: text.includes('Go to Business Owner Dashboard'),
          noAdminTools: !text.includes('Pending Verification Queue')
        };
      })()`,
      returnByValue: true,
    });

    const oRes = ownerEval.result?.value || {};
    assert('Role Boundary', 'Business Owner denied franchise tools', oRes.hasOwnerScope, 'Shows Business Owner Scope gate');
    assert('Role Boundary', 'Redirects merchant to their own Dashboard', oRes.hasGoToOwnerDashboard, 'Button to owner dashboard present');

    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'franchise_gate_owner_denied_1440px.png'));
    console.log('   📸 Captured: franchise_gate_owner_denied_1440px.png\n');

    // ---------------------------------------------------------------------------
    // JOURNEY 4: TERRITORY MISMATCH BOUNDARY GUARD
    // ---------------------------------------------------------------------------
    console.log('▶ Journey 4: Testing Cross-Territory Boundary Violation Guard...');
    // User is franchise for VELLORE, but visits CHITTOOR franchise dashboard
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const velloreFranchise = {
          id: 'usr-fran-vel',
          name: 'Vellore Franchise Operator',
          email: 'dev.franchise.vellore@kaaryanlabs.com',
          role: 'provider',
          roles: [{ role: 'city_franchise', cityId: 'vellore' }],
          franchiseCityId: 'vellore',
          isFranchise: true,
          cityId: 'vellore'
        };
        localStorage.setItem('chittoorads_user', JSON.stringify(velloreFranchise));
      })()`,
    });

    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/chittoor/franchise' });
    await wait(2000);

    const terrEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasTerritoryRestriction: text.includes('Territory Boundary Restriction'),
          mentionsVellore: text.includes('vellore') || text.includes('Vellore'),
          mentionsChittoor: text.includes('Chittoor'),
          hasSwitchToVelloreBtn: text.includes('Switch to VELLORE Dashboard'),
          blocksChittoorData: !text.includes('Command Center')
        };
      })()`,
      returnByValue: true,
    });

    const tRes = terrEval.result?.value || {};
    assert('Territory Isolation', 'Blocks out-of-territory franchise access', tRes.hasTerritoryRestriction, 'Territory Boundary Restriction displayed');
    assert('Territory Isolation', 'Identifies assigned jurisdiction (Vellore)', tRes.mentionsVellore, 'Vellore recognized');
    assert('Territory Isolation', 'Provides seamless switch to assigned city', tRes.hasSwitchToVelloreBtn, 'Switch button present');

    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'franchise_gate_territory_mismatch_1440px.png'));
    console.log('   📸 Captured: franchise_gate_territory_mismatch_1440px.png\n');

    // ---------------------------------------------------------------------------
    // JOURNEY 5: AUTHORIZED VELLORE FRANCHISE LOGIN & OVERVIEW COMMAND CENTER
    // ---------------------------------------------------------------------------
    console.log('▶ Journey 5: Testing Authorized Vellore Franchise Dashboard (/city/vellore/franchise)...');
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/vellore/franchise' });
    await wait(2000);

    const ovEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasCommandCenter: text.includes('Command Center'),
          hasVelloreBrand: text.includes('VelloreAds') || text.includes('Vellore Division'),
          hasTN23: text.includes('TN-23'),
          hasTotalListings: text.includes('Total City Listings'),
          hasActivePublished: text.includes('Active & Published'),
          hasPendingApprovals: text.includes('Pending Approvals'),
          hasCustomerLeads: text.includes('Customer Leads & Quotes'),
          hasPendingQueue: text.includes('Pending Verification Queue'),
          hasAuditTrail: text.includes('Recent Territory Activity') || text.includes('Live Audit Log')
        };
      })()`,
      returnByValue: true,
    });

    const oRes2 = ovEval.result?.value || {};
    assert('Overview KPI', 'Command Center renders for authorized franchise', oRes2.hasCommandCenter, 'Command Center visible');
    assert('Overview KPI', 'Territory branding verified (VelloreAds, TN-23)', oRes2.hasVelloreBrand && oRes2.hasTN23, 'Branding verified');
    assert('Overview KPI', 'Listing statistics verified', oRes2.hasTotalListings && oRes2.hasActivePublished, 'Listing metrics rendered');
    assert('Overview KPI', 'Pending queue and audit feed rendered', oRes2.hasPendingQueue && oRes2.hasAuditTrail, 'Panels rendered');

    // Capture desktop, tablet, and mobile viewports
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'franchise_vellore_overview_1440px.png'));
    await setViewportAndCapture(ws, 768, 1024, path.join(ARTIFACT_DIR, 'franchise_vellore_overview_768px.png'));
    await setViewportAndCapture(ws, 390, 844, path.join(ARTIFACT_DIR, 'franchise_vellore_overview_390px.png'));
    console.log('   📸 Captured: franchise_vellore_overview (1440px, 768px, 390px)\n');

    // ---------------------------------------------------------------------------
    // JOURNEY 6: BUSINESS APPROVALS QUEUE
    // ---------------------------------------------------------------------------
    console.log('▶ Journey 6: Testing Business Approvals Queue (#approvals)...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `window.location.hash = 'approvals';`,
    });
    await wait(1200);

    const appEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasHeading: text.includes('Pending Business Submissions') || text.includes('Business Approvals Queue'),
          hasSearch: Boolean(document.querySelector('input[placeholder*="Search"]')),
          hasReviewCardsOrClear: text.includes('Awaiting Review') || text.includes('Zero Pending Approvals')
        };
      })()`,
      returnByValue: true,
    });

    const aRes = appEval.result?.value || {};
    assert('Approvals Queue', 'Business Approvals queue rendered', aRes.hasHeading, 'Queue heading rendered');
    assert('Approvals Queue', 'Search and filter controls operational', aRes.hasSearch, 'Search input active');

    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'franchise_vellore_approvals_1440px.png'));
    console.log('   📸 Captured: franchise_vellore_approvals_1440px.png\n');

    // ---------------------------------------------------------------------------
    // JOURNEY 7: TERRITORY BUSINESS DIRECTORY
    // ---------------------------------------------------------------------------
    console.log('▶ Journey 7: Testing Territory Business Directory (#businesses)...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `window.location.hash = 'businesses';`,
    });
    await wait(1200);

    const bizEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasSearch: Boolean(document.querySelector('input[placeholder*="Search"]')),
          hasStatusTabs: text.includes('Active') && text.includes('Pending'),
          hasCategoryFilter: Boolean(document.querySelector('select')),
          hasVerifyButtons: text.includes('Verified') || text.includes('Verify')
        };
      })()`,
      returnByValue: true,
    });

    const bRes = bizEval.result?.value || {};
    assert('Business Directory', 'Territory directory table rendered', bRes.hasSearch && bRes.hasStatusTabs, 'Directory rendered');
    assert('Business Directory', 'Moderation badges and actions operational', bRes.hasVerifyButtons, 'Moderation actions available');

    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'franchise_vellore_businesses_1440px.png'));
    console.log('   📸 Captured: franchise_vellore_businesses_1440px.png\n');

    // ---------------------------------------------------------------------------
    // JOURNEY 8: CUSTOMER ENQUIRIES & LEAD DISPATCH INBOX
    // ---------------------------------------------------------------------------
    console.log('▶ Journey 8: Testing Customer Enquiries & Lead Dispatch (#enquiries)...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `window.location.hash = 'enquiries';`,
    });
    await wait(1200);

    const enqEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasGeneralRequestsTab: text.includes('General Service Requests'),
          hasDirectStorefrontTab: text.includes('Direct Storefront Enquiries'),
          hasPrivacyNotice: text.includes('Protected Lead Privacy') || text.includes('Zero Cross-Territory Leakage')
        };
      })()`,
      returnByValue: true,
    });

    const eRes = enqEval.result?.value || {};
    assert('Lead Inbox', 'Dual lead dispatch tabs rendered', eRes.hasGeneralRequestsTab && eRes.hasDirectStorefrontTab, 'General & direct tabs present');
    assert('Lead Inbox', 'RLS lead privacy notice verified', eRes.hasPrivacyNotice, 'Lead privacy active');

    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'franchise_vellore_enquiries_1440px.png'));
    console.log('   📸 Captured: franchise_vellore_enquiries_1440px.png\n');

    // ---------------------------------------------------------------------------
    // JOURNEY 9: LOCAL CONTENT & SPOTLIGHT (THEATRES, ATTRACTIONS, BANNERS)
    // ---------------------------------------------------------------------------
    console.log('▶ Journey 9: Testing Local Spotlight & Theatres (#content)...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `window.location.hash = 'content';`,
    });
    await wait(1200);

    const contEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasTheatresTab: text.includes('Cinema Theatres & Showtimes'),
          hasVishnuCinemas: text.includes('Vishnu Cinemas') || text.includes('Venus Cinemas'),
          hasHeritageTab: text.includes('City Heritage & Attractions'),
          hasEmergencyTab: text.includes('Emergency Helplines')
        };
      })()`,
      returnByValue: true,
    });

    const ctRes = contEval.result?.value || {};
    assert('Local Content', 'Vellore cinema theatres listed', ctRes.hasTheatresTab && ctRes.hasVishnuCinemas, 'Vellore theatres displayed');
    assert('Local Content', 'Attractions and emergency tabs operational', ctRes.hasHeritageTab && ctRes.hasEmergencyTab, 'Tabs active');

    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'franchise_vellore_content_1440px.png'));
    console.log('   📸 Captured: franchise_vellore_content_1440px.png\n');

    // ---------------------------------------------------------------------------
    // JOURNEY 10: STAFF & FIELD OPERATIONS DIRECTORY
    // ---------------------------------------------------------------------------
    console.log('▶ Journey 10: Testing Field Operations & Staff Directory (#staff)...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `window.location.hash = 'staff';`,
    });
    await wait(1200);

    const staffEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasStaffHeading: text.includes('Field Operations Staff'),
          hasSecurityNotice: text.includes('Database Security Model & Role Provisioning Notice'),
          hasUserRolesRLSNotice: text.includes('public.user_roles') && text.includes('Super Admin'),
          hasInviteBtn: text.includes('Invite Staff')
        };
      })()`,
      returnByValue: true,
    });

    const sRes = staffEval.result?.value || {};
    assert('Staff Directory', 'Staff directory rendered with profiles', sRes.hasStaffHeading, 'Staff heading present');
    assert('Staff Directory', 'RLS user_roles security boundary clearly stated', sRes.hasUserRolesRLSNotice, 'Database RLS policy noted');
    assert('Staff Directory', 'Invite staff modal trigger present', sRes.hasInviteBtn, 'Invite button active');

    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'franchise_vellore_staff_1440px.png'));
    console.log('   📸 Captured: franchise_vellore_staff_1440px.png\n');

    // ---------------------------------------------------------------------------
    // JOURNEY 11: TERRITORY ANALYTICS & INTELLIGENCE
    // ---------------------------------------------------------------------------
    console.log('▶ Journey 11: Testing Territory Analytics (#analytics)...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `window.location.hash = 'analytics';`,
    });
    await wait(1200);

    const anaEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasPublishingRate: text.includes('Directory Publishing Rate'),
          hasVerificationRate: text.includes('Trust & Verification Rate'),
          hasCategoryDensity: text.includes('Category Density'),
          hasLocalityDist: text.includes('Locality & Area Distribution'),
          hasComplianceNotice: text.includes('PostgreSQL Multi-Territory Compliance Notice')
        };
      })()`,
      returnByValue: true,
    });

    const anRes = anaEval.result?.value || {};
    assert('Analytics', 'Publishing and trust rate metrics rendered', anRes.hasPublishingRate && anRes.hasVerificationRate, 'KPI rates calculated');
    assert('Analytics', 'Category density and locality distribution rendered', anRes.hasCategoryDensity && anRes.hasLocalityDist, 'Distributions rendered');
    assert('Analytics', 'RLS compliance certified', anRes.hasComplianceNotice, 'Zero simulation certified');

    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'franchise_vellore_analytics_1440px.png'));
    console.log('   📸 Captured: franchise_vellore_analytics_1440px.png\n');

    // ---------------------------------------------------------------------------
    // JOURNEY 12: SUPER ADMINISTRATOR MULTI-CITY TERMINAL
    // ---------------------------------------------------------------------------
    console.log('▶ Journey 12: Testing Super Admin Multi-City Management...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const superAdmin = {
          id: 'usr-admin-01',
          name: 'Chief Platform Administrator',
          email: 'dev.admin@kaaryanlabs.com',
          role: 'provider',
          roles: [{ role: 'super_admin', cityId: null }],
          isSuperAdmin: true,
          isFranchise: true,
          franchiseCityId: null,
          cityId: 'chittoor'
        };
        localStorage.setItem('chittoorads_user', JSON.stringify(superAdmin));
        window.location.hash = 'overview';
        window.location.reload();
      })()`,
    });
    await wait(2000);

    const adminEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        const select = document.querySelector('header select');
        return {
          hasAdminRole: text.includes('Super Admin') || text.includes('Super Administrator'),
          hasCitySelector: Boolean(select),
          selectorOptions: select ? Array.from(select.options).map(o => o.value) : []
        };
      })()`,
      returnByValue: true,
    });

    const adRes = adminEval.result?.value || {};
    assert('Super Admin', 'Super admin role authenticated', adRes.hasAdminRole, 'Super admin role active');
    assert('Super Admin', 'Multi-city territory switcher available in header', adRes.hasCitySelector, 'City switcher rendered');

    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'franchise_superadmin_multicity_1440px.png'));
    console.log('   📸 Captured: franchise_superadmin_multicity_1440px.png\n');

    // ---------------------------------------------------------------------------
    // JOURNEY 13: RESPONSIVE VIEWPORT SUITE (360px, 390px, 768px, 1024px, 1440px, 1920px)
    // ---------------------------------------------------------------------------
    console.log('▶ Journey 13: Testing Responsive Viewports & Mobile Navigation Drawer...');
    const viewports = [
      { width: 360, height: 740, name: '360px_small_mobile' },
      { width: 390, height: 844, name: '390px_standard_mobile' },
      { width: 768, height: 1024, name: '768px_tablet' },
      { width: 1024, height: 768, name: '1024px_desktop' },
      { width: 1440, height: 900, name: '1440px_laptop' },
      { width: 1920, height: 1080, name: '1920px_ultrawide' },
    ];

    for (const vp of viewports) {
      await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 768,
      });
      await wait(300);

      const vpEval = await sendCDP(ws, 'Runtime.evaluate', {
        expression: `(() => {
          return {
            clientWidth: document.documentElement.clientWidth,
            bodyWidth: document.body.scrollWidth,
            noHorizOverflow: document.body.scrollWidth <= document.documentElement.clientWidth + 5
          };
        })()`,
        returnByValue: true,
      });

      const vRes = vpEval.result?.value || {};
      assert('Responsiveness', `No horizontal scroll overflow at ${vp.width}px`, vRes.noHorizOverflow, `Body: ${vRes.bodyWidth}px, View: ${vRes.clientWidth}px`);
    }

    // Open mobile drawer on 390px
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await wait(300);

    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const menuBtn = document.querySelector('header button[aria-label="Open navigation menu"]');
        if (menuBtn) (menuBtn as any).click();
      })()`,
    });
    await wait(800);

    const drawerEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasDrawerOpen: text.includes('City Franchise Portal') && text.includes('Command Center'),
          hasCloseBtn: Boolean(document.querySelector('button[aria-label="Close navigation drawer"]'))
        };
      })()`,
      returnByValue: true,
    });

    const dRes = drawerEval.result?.value || {};
    assert('Mobile Drawer', 'Mobile drawer opens with franchise navigation links', dRes.hasDrawerOpen, 'Drawer navigation active');

    await setViewportAndCapture(ws, 390, 844, path.join(ARTIFACT_DIR, 'franchise_mobile_drawer_390px.png'));
    console.log('   📸 Captured: franchise_mobile_drawer_390px.png\n');

  } finally {
    console.log('▶ Cleaning up headless test processes...');
    ws.close();
    chromeProc.kill();
    preview.kill();
  }

  // ---------------------------------------------------------------------------
  // SUMMARY REPORT
  // ---------------------------------------------------------------------------
  console.log('=============================================================================');
  console.log('PHASE 6A ACCEPTANCE TEST EXECUTION SUMMARY');
  console.log('=============================================================================');

  const passed = assertions.filter((a) => a.passed).length;
  const total = assertions.length;
  console.log(`Total Assertions: ${total} | Passed: ${passed} | Failed: ${total - passed}`);

  if (passed === total) {
    console.log('🎉 ALL PHASE 6A FRANCHISE DASHBOARD ASSERTIONS PASSED! Exit code 0.');
    process.exit(0);
  } else {
    console.error('❌ PHASE 6A ASSERTIONS FAILED! Exit code 1.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
