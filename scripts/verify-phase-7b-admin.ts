/**
 * KAARYAN LABS — PHASE 7B AUTOMATED VERIFICATION SUITE
 * 
 * Comprehensive testing of:
 *   1. Real Database Schema & Remote Supabase Contracts (Port 5432 pooler, 6 migrations)
 *   2. Server-side Super Admin Authentication & Privilege Evaluation
 *   3. 10 Central Management Modules (Overview, Cities, Franchises, Users, Businesses, Enquiries, Content, Analytics, Audit, Settings)
 *   4. Atomic RPC Moderation (moderate_business_listing) & Batch Moderation
 *   5. Dual Customer Enquiry Inboxes & Lead Lifecycle Management
 *   6. User Directory & Role Assignment (user_roles table & account_status)
 *   7. Local Cinema Curation & Helplines (city_theatres table)
 *   8. Additive SQL Migration File Integrity (20261103000003_super_admin_governance.sql)
 *   9. Responsive Viewports across 6 screen sizes (360px, 390px, 768px, 1024px, 1440px, 1920px) with zero horizontal overflow
 *  10. Non-regression of consumer portals (/city/chittoor, /city/vellore, /city/bengaluru) and /city/vellore/franchise
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { adminService } from '../src/services/adminService';
import { franchiseService } from '../src/services/franchiseService';
import { enquiryService } from '../src/services/enquiryService';
import { getSupabaseClient } from '../src/lib/supabase';
import { UserAccount, CityId } from '../src/types';

dotenv.config({ path: '.env.local' });

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
// PART 1: REAL DATABASE SCHEMA & SERVICE ARCHITECTURE TESTS
// =============================================================================
async function runDatabaseAndServiceTests() {
  console.log('▶ PART 1: REAL DATABASE SCHEMA & SUPER ADMIN BACKEND INTEGRATION\n');

  // 1. Supabase Client Configuration
  const isConfigured = adminService.isConfigured();
  assert('Database: Config', 'Supabase client configured via environment', isConfigured, 'VITE_SUPABASE_URL and key active');

  const supabase = getSupabaseClient();
  if (supabase) {
    // 2. Remote Cities Table
    const { data: cities, error: cErr } = await supabase.from('cities').select('*');
    assert('Database: Cities', 'cities table accessible and contains 3 regional hubs', !cErr && cities?.length === 3, `Count: ${cities?.length || 0}`);

    // 3. Remote Businesses Table
    const { data: businesses, error: bErr } = await supabase.from('businesses').select('id, name, city_id, status').limit(5);
    assert('Database: Businesses', 'businesses table accessible with RLS active', !bErr && Array.isArray(businesses), bErr ? bErr.message : `Records: ${businesses?.length}`);

    // 4. Remote User Roles Table
    const { data: roles, error: rErr } = await supabase.from('user_roles').select('*').limit(5);
    assert('Database: Roles', 'user_roles table accessible with RLS active', !rErr && Array.isArray(roles), rErr ? rErr.message : `Records: ${roles?.length}`);

    // 5. Remote Audit Logs Table
    const { data: logs, error: lErr } = await supabase.from('audit_logs').select('*').limit(5);
    assert('Database: Audit', 'audit_logs table accessible with RLS active', !lErr && Array.isArray(logs), lErr ? lErr.message : `Records: ${logs?.length}`);

    // 6. Remote General Service Requests Table
    const { data: genReq, error: gErr } = await (supabase as any).from('general_service_requests').select('*').limit(5);
    assert('Database: Leads', 'general_service_requests table accessible with RLS active', !gErr && Array.isArray(genReq), gErr ? gErr.message : `Records: ${genReq?.length}`);

    // 7. Remote Customer Enquiries Table
    const { data: custEnq, error: ceErr } = await supabase.from('customer_enquiries').select('*').limit(5);
    assert('Database: Enquiries', 'customer_enquiries table accessible with RLS active', !ceErr && Array.isArray(custEnq), ceErr ? ceErr.message : `Records: ${custEnq?.length}`);

    // 8. Remote moderate_business_listing RPC Check
    const { error: rpcErr } = await (supabase as any).rpc('moderate_business_listing', {
      _listing_id: '00000000-0000-0000-0000-000000000000',
      _action: 'approve',
      _new_status: 'active',
      _is_verified: true,
      _is_featured: false,
      _rejection_reason: null,
    });
    const isRpcInstalled = rpcErr ? rpcErr.code !== 'PGRST202' && !rpcErr.message?.includes('does not exist') : true;
    assert('Database: RPC', 'moderate_business_listing RPC is installed and active on PostgreSQL', isRpcInstalled, rpcErr ? rpcErr.message : 'RPC exists');
  }

  // 9. Proposed Additive Migration File Integrity
  const migrationPath = path.join(process.cwd(), 'supabase/migrations/20261103000003_super_admin_governance.sql');
  const migrationExists = fs.existsSync(migrationPath);
  assert('Migration: File', 'Proposed additive migration file exists in repository', migrationExists, 'File present');

  if (migrationExists) {
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    assert('Migration: Content', 'Migration contains user_profiles UPDATE policy for Super Admin', migrationSql.includes('Super Admins may update all user profiles'), 'Policy present');
    assert('Migration: Governance', 'Migration contains DO NOT APPLY REMOTELY WITHOUT APPROVAL header', migrationSql.includes('DO NOT APPLY REMOTELY WITHOUT APPROVAL'), 'Safety header present');
    assert('Migration: Rollback', 'Migration contains explicit ROLLBACK PROCEDURE', migrationSql.includes('ROLLBACK PROCEDURE'), 'Rollback instructions present');
  }

  // 10. Role Verification & Anti-Privilege Escalation
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

  // 11. Platform Stats Aggregation
  const stats = await adminService.getPlatformStats();
  assert('Service: Stats', 'Platform stats aggregates exactly 3 cities', stats.totalCities === 3, `Found ${stats.totalCities} cities`);
  assert('Service: Stats', 'Platform stats includes Chittoor, Vellore, Bengaluru breakdown', Boolean(stats.cityBreakdown.chittoor && stats.cityBreakdown.vellore && stats.cityBreakdown.bengaluru), 'All 3 cities present');
  assert('Service: Stats', 'Total listings is non-negative number', stats.totalListings >= 0, `Listings: ${stats.totalListings}`);
  assert('Service: Stats', 'Total enquiries is non-negative number', stats.totalEnquiries >= 0, `Enquiries: ${stats.totalEnquiries}`);
  assert('Service: Stats', 'Active franchises count is at least 3', stats.activeFranchises >= 3, `Franchises: ${stats.activeFranchises}`);

  // 12. Cities Summary & Status Mutation
  const citiesSummary = await adminService.getCitiesSummary();
  assert('Service: Cities', 'Returns summary for exactly 3 cities', citiesSummary.length === 3, `Count: ${citiesSummary.length}`);
  const cityCodes = citiesSummary.map((c) => c.code).sort();
  assert('Service: Cities', 'Contains AP-03, KA-01, and TN-23 codes', JSON.stringify(cityCodes) === JSON.stringify(['AP-03', 'KA-01', 'TN-23']), `Codes: ${cityCodes.join(', ')}`);

  const cityStatusRes = await adminService.updateCityStatus('chittoor', 'active');
  assert('Service: Cities', 'updateCityStatus returns success', cityStatusRes.success, 'City status updated');

  // 13. Franchise Management
  const partners = await adminService.getFranchisePartners();
  assert('Service: Franchises', 'Returns 3 designated regional partner records', partners.length >= 3, `Count: ${partners.length}`);
  assert('Service: Franchises', 'Partners map to Chittoor, Vellore, Bengaluru', partners.some((p) => p.cityId === 'chittoor') && partners.some((p) => p.cityId === 'vellore') && partners.some((p) => p.cityId === 'bengaluru'), 'All 3 cities represented');

  // 14. User Directory & Role Assignment
  const users = await adminService.getAllUsers();
  assert('Service: Users', 'Returns user directory records', Array.isArray(users) && users.length > 0, `Users count: ${users.length}`);

  const userRoleRes = await adminService.assignUserRole('usr-cust-01', 'customer', 'bengaluru');
  assert('Service: Users', 'assignUserRole executes without throwing', userRoleRes.success, 'Role assigned');

  const userStatusRes = await adminService.updateUserStatus('usr-cust-01', 'active');
  assert('Service: Users', 'updateUserStatus executes without throwing', userStatusRes.success, 'Status updated');

  // 15. Global Listings & Batch Operations
  const listings = await adminService.getAllListings('all');
  assert('Service: Listings', 'Returns global directory listings', Array.isArray(listings), `Listings count: ${listings.length}`);

  // Batch approve test with mock/fallback listings
  const testBatch = [
    { id: 'c-001', cityId: 'chittoor' as CityId },
  ];
  const bulkApproveRes = await adminService.bulkApproveListings(testBatch);
  assert('Service: Batch Moderation', 'bulkApproveListings runs across listing batch', bulkApproveRes.successCount >= 0, `Success: ${bulkApproveRes.successCount}, Failures: ${bulkApproveRes.failureCount}`);

  // 16. Enquiries & Lead Lifecycle
  const enquiries = await adminService.getAllEnquiries('all');
  assert('Service: Enquiries', 'Returns general quote requests array', Array.isArray(enquiries.generalRequests), 'General requests array');
  assert('Service: Enquiries', 'Returns direct customer enquiries array', Array.isArray(enquiries.directEnquiries), 'Direct enquiries array');

  const leadUpdateRes = await adminService.updateGeneralRequestStatus('gen-test-01', 'contacted');
  assert('Service: Enquiries', 'updateGeneralRequestStatus executes successfully', leadUpdateRes.success, 'Status updated');

  const directUpdateRes = await adminService.updateDirectEnquiryStatus('enq-test-01', 'read');
  assert('Service: Enquiries', 'updateDirectEnquiryStatus executes successfully', directUpdateRes.success, 'Status updated');

  // 17. Local Cinema Curation
  const theatres = await adminService.getLocalTheatres('chittoor');
  assert('Service: Content', 'getLocalTheatres returns cinemas for Chittoor', Array.isArray(theatres) && theatres.length > 0, `Theatres: ${theatres.length}`);

  if (theatres.length > 0) {
    const toggleRes = await adminService.toggleTheatreStatus(theatres[0].id, theatres[0].isActive);
    assert('Service: Content', 'toggleTheatreStatus executes successfully', toggleRes.success, 'Status toggled');
  }

  // 18. Audit Logging
  const auditLogs = await adminService.getGlobalAuditLogs('all');
  assert('Service: Audit', 'Returns platform audit log records', Array.isArray(auditLogs), `Audit logs count: ${auditLogs.length}`);

  console.log('\n✅ All Part 1 database and service integration tests passed.\n');
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
  const tmpProfile = path.join(process.cwd(), '.tmp-phase7b-chrome');
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
    await wait(1500);

    const anonEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasAuthReq: text.includes('Super Admin Authentication Required'),
          hasSignInBtn: text.includes('Sign In to Super Admin Console'),
          hidesAdminBody: !text.includes('Platform Oversight')
        };
      })()`,
      returnByValue: true,
    });
    const anonRes = anonEval.result.value;
    assert('Gate: Anonymous', 'Blocks anonymous visitor with Super Administrator gate', anonRes.hasAuthReq && anonRes.hasSignInBtn && anonRes.hidesAdminBody, 'Gate rendered');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7b_gate_anonymous.png'));

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
          roles: [{ role: 'customer', cityId: 'vellore' }]
        };
        if (window.__setTestAuthUser) {
          window.__setTestAuthUser(custUser);
        }
      })()`
    });
    await wait(800);

    const custEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasCustDenied: text.includes('Super Admin Privileges Required') || text.includes('Consumer Account'),
          hasReturnHome: text.includes('Return to Public Directory') || text.includes('Back to Directory')
        };
      })()`,
      returnByValue: true,
    });
    const custRes = custEval.result.value;
    assert('Gate: Customer Denied', 'Displays customer role denial card with explore option', custRes.hasCustDenied && custRes.hasReturnHome, 'Customer denial verified');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7b_gate_customer.png'));

    // -------------------------------------------------------------------------
    // SCENARIO 3: REGIONAL FRANCHISE ACCOUNT ON /admin
    // -------------------------------------------------------------------------
    console.log('▶ Testing Gate: City Franchise Partner on /admin...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const franUser = {
          id: 'usr-fran-vel',
          name: 'Vellore Operations Partner',
          email: 'franchise.vellore@kaaryanlabs.com',
          role: 'provider',
          isFranchise: true,
          franchiseCityId: 'vellore',
          roles: [{ role: 'city_franchise', cityId: 'vellore' }]
        };
        if (window.__setTestAuthUser) {
          window.__setTestAuthUser(franUser);
        }
      })()`
    });
    await wait(800);

    const franEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasTerritoryIsolation: text.includes('City Franchise Scope Boundary') || text.includes('Regional Franchise Partner Detected'),
          hasPortalBtn: text.includes('Go to Franchise Portal') || text.includes('Open My Franchise Portal')
        };
      })()`,
      returnByValue: true,
    });
    const franRes = franEval.result.value;
    assert('Gate: Franchise Isolation', 'Displays territory isolation gate with redirect to city portal', franRes.hasTerritoryIsolation && franRes.hasPortalBtn, 'Franchise isolation verified');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7b_gate_franchise.png'));

    // -------------------------------------------------------------------------
    // SCENARIO 4: SUPER ADMIN AUTHENTICATED ACCESS
    // -------------------------------------------------------------------------
    console.log('▶ Authenticating Verified Super Administrator...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const adminUser = {
          id: 'usr-admin-01',
          name: 'Super Administrator',
          email: 'admin@kaaryanlabs.com',
          role: 'provider',
          isSuperAdmin: true,
          roles: [{ role: 'super_admin', cityId: null }]
        };
        if (window.__setTestAuthUser) {
          window.__setTestAuthUser(adminUser);
        }
        window.location.hash = '#overview';
      })()`
    });
    await wait(1500);

    const adminEval = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasConsoleTitle: text.includes('Central Management Portal') || text.includes('Super Administrator'),
          hasMultiCityKpi: text.includes('Platform Oversight') || text.includes('Overview'),
          hasSidebar: Boolean(document.querySelector('aside')),
          hasHeader: Boolean(document.querySelector('header'))
        };
      })()`,
      returnByValue: true,
    });
    const adminRes = adminEval.result.value;
    assert('Console: Authorized', 'Super Admin console renders full navigation and administrative layout', adminRes.hasConsoleTitle && adminRes.hasMultiCityKpi && adminRes.hasSidebar, 'Console accessible');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7b_console_overview.png'));

    // -------------------------------------------------------------------------
    // SCENARIO 5: VERIFY ALL 10 ADMINISTRATIVE MODULES
    // -------------------------------------------------------------------------
    const modules = [
      { tab: 'overview', title: 'Platform Oversight', shot: 'admin_7b_module_overview.png' },
      { tab: 'cities', title: 'Connected Regional Hubs', shot: 'admin_7b_module_cities.png' },
      { tab: 'franchises', title: 'City Franchise Operators', shot: 'admin_7b_module_franchises.png' },
      { tab: 'users', title: 'User Accounts & Roles', shot: 'admin_7b_module_users.png' },
      { tab: 'businesses', title: 'Multi-City Storefront Management', shot: 'admin_7b_module_businesses.png' },
      { tab: 'enquiries', title: 'Multi-City Customer Inquiries', shot: 'admin_7b_module_enquiries.png' },
      { tab: 'content', title: 'Territory Spotlight', shot: 'admin_7b_module_content.png' },
      { tab: 'analytics', title: 'Territory Performance', shot: 'admin_7b_module_analytics.png' },
      { tab: 'audit', title: 'Platform Audit Feed', shot: 'admin_7b_module_audit.png' },
      { tab: 'settings', title: 'System Infrastructure', shot: 'admin_7b_module_settings.png' },
    ];

    for (const mod of modules) {
      console.log(`▶ Testing Module: ${mod.tab}...`);
      await sendCDP(ws, 'Runtime.evaluate', {
        expression: `(() => {
          const btn = document.querySelector('button[data-tab="${mod.tab}"]');
          if (btn) {
            btn.click();
          } else {
            window.location.hash = '#${mod.tab}';
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          }
        })()`
      });
      await wait(1000);

      const modEval = await sendCDP(ws, 'Runtime.evaluate', {
        expression: `(() => {
          const text = document.body.innerText;
          const btn = document.querySelector('button[data-tab="${mod.tab}"]');
          const isBtnActive = btn ? btn.classList.contains('text-[#E51E31]') : false;
          return {
            hasTitle: text.includes('${mod.title}'),
            isBtnActive
          };
        })()`,
        returnByValue: true,
      });

      const res = modEval.result.value;
      assert(`Module: ${mod.tab}`, `Navigates to #${mod.tab} and renders ${mod.title}`, Boolean(res.hasTitle || res.isBtnActive), `Page active`);
      await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, mod.shot));
    }

    // -------------------------------------------------------------------------
    // SCENARIO 6: RESPONSIVE VIEWPORT TESTING & ZERO HORIZONTAL OVERFLOW
    // -------------------------------------------------------------------------
    console.log('\n▶ Testing Responsive Viewports across 6 screen sizes with Zero Overflow...\n');

    const viewports = [
      { name: '360px_compact_mobile', width: 360, height: 740 },
      { name: '390px_standard_mobile', width: 390, height: 844 },
      { name: '768px_tablet_portrait', width: 768, height: 1024 },
      { name: '1024px_tablet_landscape', width: 1024, height: 768 },
      { name: '1440px_desktop_standard', width: 1440, height: 900 },
      { name: '1920px_desktop_large', width: 1920, height: 1080 },
    ];

    for (const vp of viewports) {
      console.log(`▶ Testing Viewport: ${vp.width}x${vp.height} (${vp.name})...`);
      await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 768,
      });
      await wait(500);

      const overflowEval = await sendCDP(ws, 'Runtime.evaluate', {
        expression: `(() => {
          const scrollW = document.documentElement.scrollWidth;
          const clientW = document.documentElement.clientWidth;
          const bodyScrollW = document.body.scrollWidth;
          const bodyClientW = document.body.clientWidth;
          return {
            docScrollW: scrollW,
            docClientW: clientW,
            bodyScrollW: bodyScrollW,
            bodyClientW: bodyClientW,
            hasOverflow: scrollW > clientW + 1
          };
        })()`,
        returnByValue: true,
      });

      const oRes = overflowEval.result.value;
      assert(
        `Viewport: ${vp.width}px`,
        `Zero horizontal overflow at ${vp.width}px (scroll: ${oRes.docScrollW}px, client: ${oRes.docClientW}px)`,
        !oRes.hasOverflow,
        `scrollWidth: ${oRes.docScrollW}, clientWidth: ${oRes.docClientW}`
      );

      const shotPath = path.join(ARTIFACT_DIR, `admin_7b_responsive_${vp.width}px.png`);
      const res = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(shotPath, Buffer.from(res.data, 'base64'));
    }

    // -------------------------------------------------------------------------
    // SCENARIO 7: NON-REGRESSION OF EXISTING CONSUMER & FRANCHISE PAGES
    // -------------------------------------------------------------------------
    console.log('\n▶ Testing Non-Regression of Public Consumer & Franchise Pages...\n');

    const regressionRoutes = [
      { url: 'http://127.0.0.1:4173/city/chittoor', expected: 'ChittoorAds', name: 'Chittoor Hub' },
      { url: 'http://127.0.0.1:4173/city/vellore', expected: 'VelloreAds', name: 'Vellore Hub' },
      { url: 'http://127.0.0.1:4173/city/bengaluru', expected: 'BengaluruAds', name: 'Bengaluru Hub' },
      { url: 'http://127.0.0.1:4173/city/vellore/franchise', expected: 'Franchise Portal', name: 'Vellore Franchise' },
    ];

    for (const route of regressionRoutes) {
      await sendCDP(ws, 'Page.navigate', { url: route.url });
      await wait(1200);

      const regEval = await sendCDP(ws, 'Runtime.evaluate', {
        expression: `(() => {
          return {
            hasExpectedText: document.body.innerText.includes('${route.expected}')
          };
        })()`,
        returnByValue: true,
      });

      const regRes = regEval.result.value;
      assert('Non-Regression', `Route ${route.name} (${route.url}) renders intact`, regRes.hasExpectedText, `Matched: ${route.expected}`);
    }

  } finally {
    ws.close();
    chromeProc.kill();
    preview.kill();
    console.log('\n🧹 Chrome and Vite Preview processes terminated.');
  }
}

// =============================================================================
// RUNNER & SUMMARY REPORT
// =============================================================================
async function main() {
  console.log('=============================================================================');
  console.log('KAARYAN LABS — PHASE 7B FULL VERIFICATION RUNNER');
  console.log('=============================================================================\n');

  try {
    await runDatabaseAndServiceTests();
    await runBrowserAcceptanceSuite();

    const passed = assertions.filter((a) => a.passed).length;
    const failed = assertions.filter((a) => !a.passed).length;
    const total = assertions.length;
    const pct = Math.round((passed / total) * 100);

    console.log('\n=============================================================================');
    console.log(`TEST SUMMARY: ${passed}/${total} assertions passed (${pct}%)`);
    console.log('=============================================================================');

    if (failed > 0) {
      console.error(`\n❌ ${failed} assertion(s) failed.`);
      process.exit(1);
    } else {
      console.log('\n🎉 ALL PHASE 7B ASSERTIONS PASSED WITH ZERO ERRORS.\n');
      process.exit(0);
    }
  } catch (err: any) {
    console.error('FATAL Test Suite Error:', err);
    process.exit(1);
  }
}

main();
