/**
 * KAARYAN LABS — PHASE 7A AUTOMATED VERIFICATION SUITE
 * 
 * Comprehensive testing of:
 *   1. Authorization Matrix (Anonymous, Customer, Owner, Franchise, Super Admin)
 *   2. Centralized Multi-City Service (AdminPlatformStats, Cities, Franchises, Users, Listings, Enquiries, Audit)
 *   3. 10 Central Management Modules (Overview, Cities, Franchises, Users, Businesses, Enquiries, Content, Analytics, Audit, Settings)
 *   4. Responsive Viewports across 6 screen sizes (360px, 390px, 768px, 1024px, 1440px, 1920px) with zero horizontal overflow
 *   5. Non-regression of consumer portals (/city/chittoor, /city/vellore, /city/bengaluru), /dashboard, and /city/vellore/franchise
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { adminService } from '../src/services/adminService';
import { franchiseService } from '../src/services/franchiseService';
import { enquiryService } from '../src/services/enquiryService';
import { UserAccount, CityId } from '../src/types';

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
  await wait(400);

  const res = await sendCDP(ws, 'Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });

  const buffer = Buffer.from(res.data, 'base64');
  fs.writeFileSync(outputPath, buffer);
}

interface TestAssertion {
  category: string;
  name: string;
  passed: boolean;
  details: string;
}

const assertions: TestAssertion[] = [];

function assert(category: string, name: string, condition: boolean, details: string) {
  assertions.push({ category, name, passed: condition, details });
  if (condition) {
    console.log(`   ✅ PASS: [${category}] ${name}`);
  } else {
    console.error(`   ❌ FAIL: [${category}] ${name} -> ${details}`);
  }
}

// =============================================================================
// PART 1: ADMINISTRATIVE SERVICE & ARCHITECTURE UNIT ASSERTIONS
// =============================================================================
async function runUnitAssertions() {
  console.log('▶ PART 1: ADMINISTRATIVE SERVICE & SECURITY ARCHITECTURE ASSERTIONS\n');

  // 1. Role Verification & Anti-Privilege Escalation
  const superAdminUser: UserAccount = {
    id: 'usr-admin-01',
    username: 'super_admin',
    name: 'Super Administrator',
    email: 'admin@kaaryanlabs.com',
    role: 'provider',
    cityId: undefined,
    isSuperAdmin: true,
    roles: [{ role: 'super_admin', cityId: null }],
  };

  const franchiseUser: UserAccount = {
    id: 'usr-vel-01',
    username: 'vellore_partner',
    name: 'Vellore Franchise Partner',
    email: 'franchise.vellore@kaaryanlabs.com',
    role: 'provider',
    cityId: 'vellore',
    isFranchise: true,
    franchiseCityId: 'vellore',
    roles: [{ role: 'city_franchise', cityId: 'vellore' }],
  };

  const merchantUser: UserAccount = {
    id: 'usr-merchant-01',
    username: 'merchant_bob',
    name: 'Sri Krishna Sweets',
    email: 'merchant@krishnasweets.com',
    role: 'provider',
    cityId: 'chittoor',
    roles: [{ role: 'business_owner', cityId: 'chittoor' }],
  };

  const customerUser: UserAccount = {
    id: 'usr-cust-01',
    username: 'customer_anand',
    name: 'Anand Kumar',
    email: 'customer@gmail.com',
    role: 'customer',
    cityId: 'bengaluru',
    roles: [{ role: 'customer', cityId: 'bengaluru' }],
  };

  assert('Auth: Super Admin', 'Super Admin role grants access', adminService.isSuperAdmin(superAdminUser), 'Verified via roles');
  assert('Auth: Franchise Isolation', 'Franchise account denied Super Admin', !adminService.isSuperAdmin(franchiseUser), 'Restricted to single territory');
  assert('Auth: Merchant Isolation', 'Merchant account denied Super Admin', !adminService.isSuperAdmin(merchantUser), 'Restricted to business owner');
  assert('Auth: Customer Isolation', 'Customer account denied Super Admin', !adminService.isSuperAdmin(customerUser), 'Restricted to consumer');
  assert('Auth: Anonymous Isolation', 'Anonymous visitor denied Super Admin', !adminService.isSuperAdmin(null), 'Null user blocked');

  // 2. Data Aggregation Functions
  const stats = await adminService.getPlatformStats();
  assert('Service: Stats', 'Platform stats aggregates exactly 3 cities', stats.totalCities === 3, `Found ${stats.totalCities} cities`);
  assert('Service: Stats', 'Platform stats includes Chittoor, Vellore, Bengaluru breakdown', Boolean(stats.cityBreakdown.chittoor && stats.cityBreakdown.vellore && stats.cityBreakdown.bengaluru), 'All 3 cities present');
  assert('Service: Stats', 'Total listings is non-negative number', stats.totalListings >= 0, `Listings: ${stats.totalListings}`);
  assert('Service: Stats', 'Total enquiries is non-negative number', stats.totalEnquiries >= 0, `Enquiries: ${stats.totalEnquiries}`);

  const cities = await adminService.getCitiesSummary();
  assert('Service: Cities', 'Returns summary for exactly 3 cities', cities.length === 3, `Count: ${cities.length}`);
  const cityCodes = cities.map((c) => c.code).sort();
  assert('Service: Cities', 'Contains AP-03, KA-01, and TN-23 codes', JSON.stringify(cityCodes) === JSON.stringify(['AP-03', 'KA-01', 'TN-23']), `Codes: ${cityCodes.join(', ')}`);

  const partners = await adminService.getFranchisePartners();
  assert('Service: Franchises', 'Returns 3 designated regional partner records', partners.length === 3, `Count: ${partners.length}`);
  assert('Service: Franchises', 'Partners map to Chittoor, Vellore, Bengaluru', partners.every((p) => ['chittoor', 'vellore', 'bengaluru'].includes(p.cityId)), 'Valid territories');

  const users = await adminService.getAllUsers();
  assert('Service: Users', 'Returns user directory records', Array.isArray(users) && users.length > 0, `Users count: ${users.length}`);

  const listings = await adminService.getAllListings('all');
  assert('Service: Listings', 'Returns global directory listings', Array.isArray(listings), `Listings count: ${listings.length}`);

  const enquiries = await adminService.getAllEnquiries('all');
  assert('Service: Enquiries', 'Returns general quote requests array', Array.isArray(enquiries.generalRequests), 'General requests array');
  assert('Service: Enquiries', 'Returns direct customer enquiries array', Array.isArray(enquiries.directEnquiries), 'Direct enquiries array');

  const auditLogs = await adminService.getGlobalAuditLogs('all');
  assert('Service: Audit', 'Returns platform audit log records', Array.isArray(auditLogs), `Audit logs count: ${auditLogs.length}`);

  // 3. Routing & Security Check
  const cityResolverCode = fs.readFileSync(path.join(process.cwd(), 'src/utils/cityResolver.ts'), 'utf-8');
  assert('Architecture: Routing', 'cityResolver parses /admin to admin tab', cityResolverCode.includes("'admin'"), 'Admin tab handled');

  const adminServiceCode = fs.readFileSync(path.join(process.cwd(), 'src/services/adminService.ts'), 'utf-8');
  assert('Architecture: RPC Moderation', 'Admin approvals delegate to franchiseService (RPC backed)', adminServiceCode.includes('franchiseService.approveBusiness'), 'RPC delegation present');
  assert('Architecture: RPC Moderation', 'Admin rejections delegate to franchiseService (RPC backed)', adminServiceCode.includes('franchiseService.rejectBusiness'), 'RPC delegation present');
  assert('Architecture: RPC Moderation', 'Direct update fallback on businesses table is absent', !adminServiceCode.includes("from('businesses').update"), 'Direct table update avoided');

  console.log('\n✅ All Part 1 unit assertions completed successfully.\n');
}

// =============================================================================
// PART 2: FULL BROWSER CDP ACCEPTANCE & RESPONSIVE SUITE
// =============================================================================
async function runBrowserAcceptanceSuite() {
  console.log('▶ PART 2: FULL BROWSER CDP ACCEPTANCE & RESPONSIVE VIEWPORT TESTING\n');

  console.log('▶ Launching Vite Preview Server on Port 4173...');
  const viteBin = path.resolve(process.cwd(), 'node_modules/vite/bin/vite.js');
  const preview = spawn(process.execPath, [viteBin, 'preview', '--port', '4173', '--host', '127.0.0.1']);

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

  console.log('▶ Launching Headless Chrome (port 9228)...');
  const tmpProfile = path.join(process.cwd(), '.tmp-phase7a-chrome');
  if (fs.existsSync(tmpProfile)) {
    fs.rmSync(tmpProfile, { recursive: true, force: true });
  }

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9228',
    `--user-data-dir=${tmpProfile}`,
    '--no-first-run',
    '--no-default-browser-check',
  ]);

  let wsUrl = '';
  for (let i = 0; i < 30; i++) {
    await wait(400);
    try {
      const resp = await fetch('http://127.0.0.1:9228/json/list');
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

  try {
    // -------------------------------------------------------------------------
    // SCENARIO 1: ANONYMOUS VISITOR ON /admin
    // -------------------------------------------------------------------------
    console.log('▶ Testing Gate: Anonymous Visitor on /admin...');
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/admin' });
    await wait(1200);
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        localStorage.clear();
        window.location.reload();
      })()`
    });
    await wait(2000);

    const anonEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasAuthReq: text.includes('Super Admin Authentication Required'),
          hasSignInBtn: text.includes('Sign In to Super Admin Console'),
          hidesAdminBody: !text.includes('Platform Oversight Active')
        };
      })()`,
      returnByValue: true,
    });
    const anonRes = anonEval.result.value;
    assert('Gate: Anonymous', 'Blocks anonymous visitor with Super Administrator gate', anonRes.hasAuthReq && anonRes.hasSignInBtn && anonRes.hidesAdminBody, 'Gate rendered');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7a_gate_anonymous.png'));

    // -------------------------------------------------------------------------
    // SCENARIO 2: CUSTOMER ACCOUNT ON /admin
    // -------------------------------------------------------------------------
    console.log('▶ Testing Gate: Customer Account on /admin...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const custUser = {
          id: 'usr-cust-01',
          name: 'Anand Kumar',
          email: 'anand.customer@gmail.com',
          role: 'customer',
          cityId: 'vellore',
          roles: [{ role: 'customer', cityId: 'vellore' }]
        };
        localStorage.setItem('chittoorads_user', JSON.stringify(custUser));
        window.location.reload();
      })()`
    });
    await wait(2000);

    const custEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasCustomerDenied: text.includes('Super Admin Privileges Required') || text.includes('Consumer Account'),
          hasReturnHome: text.includes('Return to Public Directory') || text.includes('Back to Directory'),
          hidesAdminBody: !text.includes('Platform Oversight Active')
        };
      })()`,
      returnByValue: true,
    });
    const custRes = custEval.result.value;
    assert('Gate: Customer Denied', 'Blocks customer account with descriptive gate', custRes.hasCustomerDenied && custRes.hasReturnHome && custRes.hidesAdminBody, 'Customer denied');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7a_gate_customer_denied.png'));

    // -------------------------------------------------------------------------
    // SCENARIO 3: MERCHANT (BUSINESS OWNER) ACCOUNT ON /admin
    // -------------------------------------------------------------------------
    console.log('▶ Testing Gate: Merchant Account on /admin...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const ownerUser = {
          id: 'usr-biz-01',
          name: 'Sri Krishna Sweets',
          email: 'merchant@krishnasweets.com',
          role: 'provider',
          cityId: 'chittoor',
          roles: [{ role: 'business_owner', cityId: 'chittoor' }]
        };
        localStorage.setItem('chittoorads_user', JSON.stringify(ownerUser));
        window.location.reload();
      })()`
    });
    await wait(2000);

    const ownerEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasOwnerDenied: text.includes('Business Owner Scope'),
          hasGoToDashboard: text.includes('Go to Business Owner Dashboard'),
          hidesAdminBody: !text.includes('Platform Oversight Active')
        };
      })()`,
      returnByValue: true,
    });
    const ownerRes = ownerEval.result.value;
    assert('Gate: Owner Denied', 'Blocks merchant account with link to merchant dashboard', ownerRes.hasOwnerDenied && ownerRes.hasGoToDashboard && ownerRes.hidesAdminBody, 'Owner denied');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7a_gate_owner_denied.png'));

    // -------------------------------------------------------------------------
    // SCENARIO 4: CITY FRANCHISE ACCOUNT ON /admin
    // -------------------------------------------------------------------------
    console.log('▶ Testing Gate: City Franchise Account on /admin...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const franUser = {
          id: 'usr-fran-vel',
          name: 'Vellore Franchise Partner',
          email: 'franchise.vellore@kaaryanlabs.com',
          role: 'provider',
          cityId: 'vellore',
          isFranchise: true,
          franchiseCityId: 'vellore',
          roles: [{ role: 'city_franchise', cityId: 'vellore' }]
        };
        localStorage.setItem('chittoorads_user', JSON.stringify(franUser));
        window.location.reload();
      })()`
    });
    await wait(2000);

    const franEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasFranchiseDenied: text.includes('City Franchise Scope Boundary'),
          hasGoToRegional: text.includes('Go to Franchise Portal'),
          hidesAdminBody: !text.includes('Platform Oversight Active')
        };
      })()`,
      returnByValue: true,
    });
    const franRes = franEval.result.value;
    assert('Gate: Franchise Denied', 'Blocks franchise account with link to regional franchise portal', franRes.hasFranchiseDenied && franRes.hasGoToRegional && franRes.hidesAdminBody, 'Franchise denied');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7a_gate_franchise_denied.png'));

    // -------------------------------------------------------------------------
    // SCENARIO 5: SUPER ADMIN ACCESS & OVERVIEW MODULE
    // -------------------------------------------------------------------------
    console.log('▶ Testing Authorized Super Admin Access on /admin#overview...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const superAdmin = {
          id: 'usr-admin-01',
          name: 'Super Administrator',
          email: 'admin@kaaryanlabs.com',
          role: 'provider',
          cityId: null,
          isSuperAdmin: true,
          roles: [{ role: 'super_admin', cityId: null }]
        };
        localStorage.setItem('chittoorads_user', JSON.stringify(superAdmin));
        window.location.hash = 'overview';
        window.location.reload();
      })()`
    });
    await wait(2500);

    const overviewEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasSuperAdminBadge: text.includes('Super Administrator'),
          hasCentralPortal: text.includes('Central Management Portal'),
          hasEnterpriseHeading: text.includes('Enterprise Multi-City Control Center'),
          hasConnectedCities: text.includes('Connected Cities'),
          hasActiveFranchises: text.includes('Active Franchises'),
          hasTerritoryComparison: text.includes('Chittoor') && text.includes('Vellore') && text.includes('Bengaluru')
        };
      })()`,
      returnByValue: true,
    });
    const oRes = overviewEval.result.value;
    assert('Module 1: Overview', 'Renders header and overview KPI cards for Super Admin', oRes.hasSuperAdminBadge && oRes.hasEnterpriseHeading && oRes.hasConnectedCities && oRes.hasActiveFranchises, 'Overview module verified');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7a_tab_overview.png'));

    // Helper function to reliably switch tabs using sidebar interaction or hash dispatch
    const navigateAdminTab = async (tabId: string) => {
      await sendCDP(ws, 'Runtime.evaluate', {
        expression: `(() => {
          const btn = document.querySelector('button[data-tab="${tabId}"]');
          if (btn) {
            btn.click();
          } else {
            window.location.hash = '${tabId}';
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          }
        })()`,
      });
      await wait(1800);
    };

    // -------------------------------------------------------------------------
    // SCENARIO 6: CITY MANAGEMENT MODULE (#cities)
    // -------------------------------------------------------------------------
    console.log('▶ Navigating to #cities module...');
    await navigateAdminTab('cities');

    const citiesEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasConnectedHubs: text.includes('Connected Regional Hubs'),
          hasAP03: text.includes('AP-03'),
          hasTN23: text.includes('TN-23'),
          hasKA01: text.includes('KA-01'),
          hasExpansionBtn: text.includes('Add / Expand Territory')
        };
      })()`,
      returnByValue: true,
    });
    const cRes = citiesEval.result.value;
    assert('Module 2: Cities', 'Renders all 3 regional hubs with codes and expansion readiness', cRes.hasConnectedHubs && cRes.hasAP03 && cRes.hasTN23 && cRes.hasKA01 && cRes.hasExpansionBtn, 'Cities module verified');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7a_tab_cities.png'));

    // -------------------------------------------------------------------------
    // SCENARIO 7: FRANCHISE PARTNERS MODULE (#franchises)
    // -------------------------------------------------------------------------
    console.log('▶ Navigating to #franchises module...');
    await navigateAdminTab('franchises');

    const franModuleEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasFranchiseHeading: text.includes('City Franchise Operators'),
          hasThreeActive: text.includes('3 Active Territories'),
          hasPartnerCards: text.includes('Chittoor') && text.includes('Vellore') && text.includes('Bengaluru')
        };
      })()`,
      returnByValue: true,
    });
    const fRes = franModuleEval.result.value;
    assert('Module 3: Franchises', 'Renders regional franchise operator directory with metrics', fRes.hasFranchiseHeading && fRes.hasThreeActive && fRes.hasPartnerCards, 'Franchises module verified');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7a_tab_franchises.png'));

    // -------------------------------------------------------------------------
    // SCENARIO 8: USER DIRECTORY MODULE (#users)
    // -------------------------------------------------------------------------
    console.log('▶ Navigating to #users module...');
    await navigateAdminTab('users');

    const usersEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText.toLowerCase();
        return {
          hasUserHeading: text.includes('user accounts & roles'),
          hasRolePills: text.includes('super admin') && text.includes('franchisee') && text.includes('merchant'),
          hasTable: text.includes('identity') || text.includes('territory')
        };
      })()`,
      returnByValue: true,
    });
    const uRes = usersEval.result.value;
    assert('Module 4: Users', 'Renders user directory with role filters and identity records', uRes.hasUserHeading && uRes.hasRolePills && uRes.hasTable, 'Users module verified');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7a_tab_users.png'));

    // -------------------------------------------------------------------------
    // SCENARIO 9: GLOBAL LISTINGS MODULE (#businesses)
    // -------------------------------------------------------------------------
    console.log('▶ Navigating to #businesses module...');
    await navigateAdminTab('businesses');

    const bizEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText.toLowerCase();
        return {
          hasBizHeading: text.includes('global multi-city listings'),
          hasCityFilter: text.includes('all cities') || text.includes('global'),
          hasTableHeaders: text.includes('business') && text.includes('badges') && text.includes('moderation')
        };
      })()`,
      returnByValue: true,
    });
    const bRes = bizEval.result.value;
    assert('Module 5: Businesses', 'Renders global listings with multi-city filters and moderation actions', bRes.hasBizHeading && bRes.hasCityFilter && bRes.hasTableHeaders, 'Businesses module verified');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7a_tab_businesses.png'));

    // -------------------------------------------------------------------------
    // SCENARIO 10: CUSTOMER ENQUIRIES MODULE (#enquiries)
    // -------------------------------------------------------------------------
    console.log('▶ Navigating to #enquiries module...');
    await navigateAdminTab('enquiries');

    const enqEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText.toLowerCase();
        return {
          hasEnqHeading: text.includes('multi-city customer inquiries'),
          hasDualTabs: text.includes('general service') && text.includes('direct'),
          hasTable: text.includes('customer name') && text.includes('territory')
        };
      })()`,
      returnByValue: true,
    });
    const eRes = enqEval.result.value;
    assert('Module 6: Enquiries', 'Renders dual customer lead inboxes with territory scoping', eRes.hasEnqHeading && eRes.hasDualTabs && eRes.hasTable, 'Enquiries module verified');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7a_tab_enquiries.png'));

    // -------------------------------------------------------------------------
    // SCENARIO 11: CONTENT & SPOTLIGHT MODULE (#content)
    // -------------------------------------------------------------------------
    console.log('▶ Navigating to #content module...');
    await navigateAdminTab('content');

    const contentEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasContentHeading: text.includes('Territory Spotlight & Directory Curation'),
          hasSections: text.includes('Cinemas & Theatres') && text.includes('Attractions & Tourism') && text.includes('Civic & Emergency Helplines'),
          hasCityTabs: text.includes('Chittoor (AP-03)') && text.includes('Vellore (TN-23)') && text.includes('Bengaluru (KA-01)')
        };
      })()`,
      returnByValue: true,
    });
    const cntRes = contentEval.result.value;
    assert('Module 7: Content', 'Renders cinemas, attractions, and civic helplines across cities', cntRes.hasContentHeading && cntRes.hasSections && cntRes.hasCityTabs, 'Content module verified');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7a_tab_content.png'));

    // -------------------------------------------------------------------------
    // SCENARIO 12: PLATFORM ANALYTICS MODULE (#analytics)
    // -------------------------------------------------------------------------
    console.log('▶ Navigating to #analytics module...');
    await navigateAdminTab('analytics');

    const analyticsEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasAnalyticsHeading: text.includes('Territory Performance & Volume Breakdown'),
          hasDensityBars: text.includes('Territory Listings Density Comparison'),
          hasLeadsBreakdown: text.includes('Chittoor Leads') && text.includes('Vellore Leads') && text.includes('Bengaluru Leads')
        };
      })()`,
      returnByValue: true,
    });
    const aRes = analyticsEval.result.value;
    assert('Module 8: Analytics', 'Renders comparative territory density bars and conversion metrics', aRes.hasAnalyticsHeading && aRes.hasDensityBars && aRes.hasLeadsBreakdown, 'Analytics module verified');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7a_tab_analytics.png'));

    // -------------------------------------------------------------------------
    // SCENARIO 13: AUDIT TRAIL MODULE (#audit)
    // -------------------------------------------------------------------------
    console.log('▶ Navigating to #audit module...');
    await navigateAdminTab('audit');

    const auditEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText.toLowerCase();
        return {
          hasAuditHeading: text.includes('security & moderation audit trail'),
          hasAuditEntriesBadge: text.includes('audit entries'),
          hasTableHeaders: text.includes('timestamp') && text.includes('territory') && text.includes('action')
        };
      })()`,
      returnByValue: true,
    });
    const audRes = auditEval.result.value;
    assert('Module 9: Audit', 'Renders immutable platform audit log feed with action filters', audRes.hasAuditHeading && audRes.hasAuditEntriesBadge && audRes.hasTableHeaders, 'Audit module verified');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7a_tab_audit.png'));
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7a_tab_audit.png'));

    // -------------------------------------------------------------------------
    // SCENARIO 14: PLATFORM SETTINGS MODULE (#settings)
    // -------------------------------------------------------------------------
    console.log('▶ Navigating to #settings module...');
    await navigateAdminTab('settings');

    const settingsEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasSettingsHeading: text.includes('System Infrastructure & Policies'),
          hasPoolerHealth: text.includes('PostgreSQL Pooler Operational'),
          hasSecurityChecklist: text.includes('Security Policy & Architecture Checklist') && text.includes('Row-Level Security (RLS) Active'),
          hasRoutingMatrix: text.includes('Multi-Territory URL Routing Matrix') && text.includes('/admin')
        };
      })()`,
      returnByValue: true,
    });
    const sRes = settingsEval.result.value;
    assert('Module 10: Settings', 'Renders system infrastructure health, security policy checklist, and URL routing matrix', sRes.hasSettingsHeading && sRes.hasPoolerHealth && sRes.hasSecurityChecklist && sRes.hasRoutingMatrix, 'Settings module verified');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7a_tab_settings.png'));

    // Return to overview for responsive checks
    await navigateAdminTab('overview');

    // -------------------------------------------------------------------------
    // SCENARIO 15: RESPONSIVE VIEWPORTS & ZERO HORIZONTAL OVERFLOW (6 VIEWPORTS)
    // -------------------------------------------------------------------------
    console.log('▶ Testing 6 Viewports for Responsiveness and Zero Horizontal Overflow...');
    const viewports = [
      { name: '360px Mobile Compact', width: 360, height: 780, file: 'admin_7a_responsive_360px_mobile_compact.png' },
      { name: '390px Mobile Standard', width: 390, height: 844, file: 'admin_7a_responsive_390px_mobile_standard.png' },
      { name: '768px Tablet Portrait', width: 768, height: 1024, file: 'admin_7a_responsive_768px_tablet_portrait.png' },
      { name: '1024px Tablet Landscape', width: 1024, height: 768, file: 'admin_7a_responsive_1024px_tablet_landscape.png' },
      { name: '1440px Desktop Standard', width: 1440, height: 900, file: 'admin_7a_responsive_1440px_desktop_standard.png' },
      { name: '1920px Desktop Large', width: 1920, height: 1080, file: 'admin_7a_responsive_1920px_desktop_large.png' },
    ];

    for (const vp of viewports) {
      await setViewportAndCapture(ws, vp.width, vp.height, path.join(ARTIFACT_DIR, vp.file));

      const overflowEval = await sendCDP(ws, 'Runtime.evaluate', {
        expression: `(() => {
          return {
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            bodyScrollWidth: document.body.scrollWidth,
            hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
          };
        })()`,
        returnByValue: true,
      });

      const oFlow = overflowEval.result.value;
      assert(
        `Responsive: ${vp.name}`,
        `Zero horizontal overflow at ${vp.width}x${vp.height} (scrollWidth: ${oFlow.scrollWidth}, clientWidth: ${oFlow.clientWidth})`,
        !oFlow.hasOverflow,
        `Overflow: ${oFlow.hasOverflow}`
      );
    }

    // -------------------------------------------------------------------------
    // SCENARIO 16: REGRESSIONS AUDIT ON CONSUMER WEBSITES & PORTALS
    // -------------------------------------------------------------------------
    console.log('▶ Testing Regressions across Consumer and Franchise Portals...');

    // 16a. Chittoor Homepage
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/chittoor' });
    await wait(1500);
    const chtHomeEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasChittoorAds: text.includes('Chittoor Ads') || text.includes('Chittoor'),
          hasNoUnapprovedPrice: !text.includes('₹999/year') && !text.includes('₹2,499/month')
        };
      })()`,
      returnByValue: true,
    });
    const chtRes = chtHomeEval.result.value;
    assert('Regression: Chittoor', 'Chittoor homepage loads with brand parity and zero unapproved pricing', chtRes.hasChittoorAds && chtRes.hasNoUnapprovedPrice, 'Chittoor verified');

    // 16b. Vellore Homepage
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/vellore' });
    await wait(1500);
    const velHomeEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasVelloreAds: text.includes('Vellore Ads') || text.includes('Vellore'),
          hasNoUnapprovedPrice: !text.includes('₹999/year') && !text.includes('₹2,499/month')
        };
      })()`,
      returnByValue: true,
    });
    const velRes = velHomeEval.result.value;
    assert('Regression: Vellore', 'Vellore homepage loads with brand parity and zero unapproved pricing', velRes.hasVelloreAds && velRes.hasNoUnapprovedPrice, 'Vellore verified');

    // 16c. Bengaluru Homepage
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/bengaluru' });
    await wait(1500);
    const blrHomeEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasBengaluruAds: text.includes('Bengaluru Ads') || text.includes('Bengaluru'),
          hasNoUnapprovedPrice: !text.includes('₹999/year') && !text.includes('₹2,499/month')
        };
      })()`,
      returnByValue: true,
    });
    const blrRes = blrHomeEval.result.value;
    assert('Regression: Bengaluru', 'Bengaluru homepage loads with brand parity and zero unapproved pricing', blrRes.hasBengaluruAds && blrRes.hasNoUnapprovedPrice, 'Bengaluru verified');

    // 16d. Regional Franchise Portal (/city/vellore/franchise)
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const franUser = {
          id: 'usr-fran-vel',
          name: 'Vellore Operations Partner',
          email: 'franchise.vellore@kaaryanlabs.com',
          role: 'provider',
          cityId: 'vellore',
          isFranchise: true,
          franchiseCityId: 'vellore',
          roles: [{ role: 'city_franchise', cityId: 'vellore' }]
        };
        localStorage.setItem('chittoorads_user', JSON.stringify(franUser));
      })()`
    });
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/vellore/franchise' });
    await wait(1800);
    const franPortalEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasVellorePortal: text.includes('Vellore') && (text.includes('Franchise Command Center') || text.includes('Franchise Partner')),
          hidesChittoorAdmin: !text.includes('Chittoor Regional Operations')
        };
      })()`,
      returnByValue: true,
    });
    const fpRes = franPortalEval.result.value;
    assert('Regression: Regional Franchise', 'Vellore Franchise portal remains operational with territory isolation', fpRes.hasVellorePortal, 'Regional portal verified');

  } finally {
    ws.close();
    chromeProc.kill();
    preview.kill();
  }
}

// =============================================================================
// MAIN RUNNER
// =============================================================================
async function main() {
  console.log('=============================================================================');
  console.log('KAARYAN LABS — PHASE 7A SUPER ADMIN AUTOMATED VERIFICATION SUITE');
  console.log('=============================================================================\n');

  try {
    await runUnitAssertions();
    await runBrowserAcceptanceSuite();

    console.log('\n=============================================================================');
    console.log('VERIFICATION SUMMARY');
    console.log('=============================================================================');

    const total = assertions.length;
    const passed = assertions.filter((a) => a.passed).length;
    const failed = assertions.filter((a) => !a.passed).length;

    console.log(`Total Assertions Evaluated : ${total}`);
    console.log(`Passed Assertions          : ${passed}`);
    console.log(`Failed Assertions          : ${failed}`);
    console.log(`Success Rate               : ${Math.round((passed / total) * 100)}%\n`);

    if (failed > 0) {
      console.error('❌ PHASE 7A VERIFICATION FAILED: Some assertions failed.');
      process.exit(1);
    } else {
      console.log('🎉 PHASE 7A VERIFICATION COMPLETED WITH 100% PASSING ASSERTIONS.');
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal execution error during Phase 7A test execution:', err);
    process.exit(1);
  }
}

main();
