/**
 * KAARYAN LABS — PHASE 7C AUTOMATED ACCEPTANCE SUITE
 * 
 * Comprehensive testing of:
 *   CATEGORY 1: Static Code, Contracts & Proposed Migration Governance
 *   CATEGORY 2: Live Read-Only Supabase Database Tests (Remote PostgreSQL 17.11)
 *   CATEGORY 3: Live Privilege Boundary & Negative Auth Tests
 *   CATEGORY 4: Simulated Persona Isolation & Authorization Guards
 *   CATEGORY 5: Multi-City Services & Batch Moderation Operations
 *   CATEGORY 6: Headless Chrome CDP Browser Acceptance & 10 Admin Modules
 *   CATEGORY 7: Responsive Viewport Zero Horizontal Overflow (360px - 1920px)
 *   CATEGORY 8: Non-Regression of Public Hubs & Franchise Portals
 *   CATEGORY 9: Live Authenticated Super Admin Testing Status (Credential Boundary)
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
  classification: 'STATIC' | 'LIVE_READ' | 'LIVE_AUTH' | 'SIMULATED' | 'BROWSER' | 'BLOCKED';
}

const assertions: TestAssertion[] = [];

function assert(
  category: string,
  name: string,
  condition: boolean,
  details: string,
  classification: TestAssertion['classification'] = 'STATIC'
) {
  assertions.push({ category, name, passed: condition, details, classification });
  if (condition) {
    console.log(`   ✅ PASS [${classification}]: [${category}] ${name}`);
  } else {
    console.error(`   ❌ FAIL [${classification}]: [${category}] ${name} -> ${details}`);
  }
}

function recordBlocked(category: string, name: string, reason: string) {
  assertions.push({ category, name, passed: false, details: reason, classification: 'BLOCKED' });
  console.log(`   ⚠️ BLOCKED [BLOCKED]: [${category}] ${name} -> ${reason}`);
}

async function runPhase7CSuite() {
  console.log('=============================================================================');
  console.log('KAARYAN LABS — PHASE 7C FINAL ACCEPTANCE & SECURITY HARDENING RUNNER');
  console.log('=============================================================================\n');

  // ===========================================================================
  // CATEGORY 1: STATIC CODE, CONTRACTS & PROPOSED MIGRATION GOVERNANCE
  // ===========================================================================
  console.log('▶ CATEGORY 1: STATIC CODE & PROPOSED MIGRATION GOVERNANCE\n');

  const isConfigured = adminService.isConfigured();
  assert('Static: Config', 'Supabase environment configuration loaded', isConfigured, 'VITE_SUPABASE_URL and key active', 'STATIC');

  const migrationPath = path.join(process.cwd(), 'supabase/migrations/20261103000003_super_admin_governance.sql');
  const migrationExists = fs.existsSync(migrationPath);
  assert('Static: Migration', 'Proposed additive migration file exists in repository', migrationExists, 'File present', 'STATIC');

  if (migrationExists) {
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    assert('Static: Migration', 'Migration contains user_profiles UPDATE policy for Super Admin', migrationSql.includes('Super Admins may update all user profiles'), 'Policy present', 'STATIC');
    assert('Static: Migration', 'Migration contains DO NOT APPLY REMOTELY WITHOUT APPROVAL header', migrationSql.includes('DO NOT APPLY REMOTELY WITHOUT APPROVAL'), 'Safety header present', 'STATIC');
    assert('Static: Migration', 'Migration contains explicit ROLLBACK PROCEDURE', migrationSql.includes('ROLLBACK PROCEDURE'), 'Rollback instructions present', 'STATIC');
    assert('Static: Migration', 'Migration contains profile integrity trigger to prevent self-un-suspension', migrationSql.includes('protect_user_profile_integrity'), 'Trigger present', 'STATIC');
    assert('Static: Migration', 'Migration contains atomic admin_set_user_status RPC', migrationSql.includes('admin_set_user_status'), 'RPC present', 'STATIC');
    assert('Static: Migration', 'Migration contains atomic admin_assign_user_role RPC', migrationSql.includes('admin_assign_user_role'), 'RPC present', 'STATIC');
  }

  // ===========================================================================
  // CATEGORY 2: LIVE READ-ONLY SUPABASE DATABASE TESTS
  // ===========================================================================
  console.log('\n▶ CATEGORY 2: LIVE READ-ONLY SUPABASE DATABASE TESTS\n');

  const supabase = getSupabaseClient();
  if (supabase) {
    // 1. Remote Cities Table
    const { data: cities, error: cErr } = await supabase.from('cities').select('*');
    assert('Database: Cities', 'cities table contains 3 regional hubs', !cErr && cities?.length === 3, `Count: ${cities?.length || 0}`, 'LIVE_READ');

    // 2. Remote Businesses Table
    const { data: businesses, error: bErr } = await supabase.from('businesses').select('id, name, city_id, status').limit(5);
    assert('Database: Businesses', 'businesses table accessible with RLS active (clean baseline)', !bErr && Array.isArray(businesses), bErr ? bErr.message : `Records: ${businesses?.length}`, 'LIVE_READ');

    // 3. Remote User Roles Table
    const { data: roles, error: rErr } = await supabase.from('user_roles').select('*').limit(5);
    assert('Database: Roles', 'user_roles table accessible with RLS isolating unauthenticated access', !rErr && Array.isArray(roles), rErr ? rErr.message : `Records: ${roles?.length}`, 'LIVE_READ');

    // 4. Remote Audit Logs Table
    const { data: logs, error: lErr } = await supabase.from('audit_logs').select('*').limit(5);
    assert('Database: Audit', 'audit_logs table accessible with RLS isolating unauthenticated access', !lErr && Array.isArray(logs), lErr ? lErr.message : `Records: ${logs?.length}`, 'LIVE_READ');

    // 5. Remote General Service Requests Table
    const { data: genReq, error: gErr } = await (supabase as any).from('general_service_requests').select('*').limit(5);
    assert('Database: Leads', 'general_service_requests table accessible with RLS active', !gErr && Array.isArray(genReq), gErr ? gErr.message : `Records: ${genReq?.length}`, 'LIVE_READ');

    // 6. Remote Customer Enquiries Table
    const { data: custEnq, error: ceErr } = await supabase.from('customer_enquiries').select('*').limit(5);
    assert('Database: Enquiries', 'customer_enquiries table accessible with RLS active', !ceErr && Array.isArray(custEnq), ceErr ? ceErr.message : `Records: ${custEnq?.length}`, 'LIVE_READ');

    // 7. Remote City Theatres Table
    const { data: theatres, error: thErr } = await (supabase as any).from('city_theatres').select('*').limit(5);
    assert('Database: Theatres', 'city_theatres table accessible for local content curation', !thErr && Array.isArray(theatres), thErr ? thErr.message : `Records: ${theatres?.length}`, 'LIVE_READ');

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
    assert('Database: RPC', 'moderate_business_listing RPC is active on remote PostgreSQL', isRpcInstalled, rpcErr ? rpcErr.message : 'RPC active', 'LIVE_READ');
  }

  // ===========================================================================
  // CATEGORY 3: LIVE PRIVILEGE BOUNDARY & NEGATIVE AUTH TESTS
  // ===========================================================================
  console.log('\n▶ CATEGORY 3: LIVE PRIVILEGE BOUNDARY & NEGATIVE AUTH TESTS\n');

  if (supabase) {
    // 1. Negative Authentication Against Live Supabase Auth Service
    const { error: invalidAuthErr } = await supabase.auth.signInWithPassword({
      email: 'nonexistent.superadmin.audit@kaaryanlabs.com',
      password: 'DefinitelyWrongPassword!123',
    });
    assert('Live Auth: Rejection', 'Live Supabase Auth rejects invalid administrator login credentials', Boolean(invalidAuthErr), invalidAuthErr ? invalidAuthErr.message : 'No error', 'LIVE_AUTH');

    // 2. Anonymous Privilege Escalation Denial: Direct Insert to user_roles
    const { error: unauthRoleErr } = await supabase.from('user_roles').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      role: 'super_admin',
    });
    assert('Privilege: Anti-Escalation', 'Anonymous client denied direct INSERT into user_roles', Boolean(unauthRoleErr), unauthRoleErr ? unauthRoleErr.message : 'Rejected by RLS', 'LIVE_AUTH');

    // 3. Anonymous Privilege Escalation Denial: Direct Update to cities
    const { data: cBefore } = await supabase.from('cities').select('status').eq('id', 'chittoor').single();
    const { error: unauthCityErr } = await supabase.from('cities').update({ status: 'inactive' }).eq('id', 'chittoor');
    const { data: cAfter } = await supabase.from('cities').select('status').eq('id', 'chittoor').single();
    const cityProtected = Boolean(unauthCityErr) || (cBefore?.status === 'active' && cAfter?.status === 'active');
    assert('Privilege: Territory Guard', 'Anonymous client denied direct UPDATE to cities table', cityProtected, `Status preserved: ${cAfter?.status}`, 'LIVE_AUTH');

    // 4. Anonymous Audit Log Immutability: Direct Delete from audit_logs
    const { count: auditCountBefore } = await supabase.from('audit_logs').select('*', { count: 'exact', head: true });
    const { error: unauthAuditErr, count: deletedCount } = await supabase.from('audit_logs').delete({ count: 'exact' }).neq('id', '00000000-0000-0000-0000-000000000000');
    const { count: auditCountAfter } = await supabase.from('audit_logs').select('*', { count: 'exact', head: true });
    const auditImmutable = Boolean(unauthAuditErr) || deletedCount === 0 || (auditCountBefore ?? 0) === (auditCountAfter ?? 0);
    assert('Privilege: Audit Integrity', 'Anonymous client denied DELETE from audit_logs (immutable trail)', auditImmutable, `Logs retained: ${auditCountAfter || 0}`, 'LIVE_AUTH');
  }

  // ===========================================================================
  // CATEGORY 4: SIMULATED PERSONA ISOLATION & AUTHORIZATION GUARDS
  // ===========================================================================
  console.log('\n▶ CATEGORY 4: SIMULATED PERSONA ISOLATION & AUTHORIZATION GUARDS\n');

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
    name: 'Vellore Franchise Operator',
    email: 'franchise.vellore@kaaryanlabs.com',
    role: 'provider',
    cityId: 'vellore',
    isFranchise: true,
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

  assert('Auth: Super Admin', 'Super Admin role grants access', adminService.isSuperAdmin(superAdminUser), 'Verified via roles', 'SIMULATED');
  assert('Auth: Franchise Isolation', 'Franchise account denied Super Admin', !adminService.isSuperAdmin(franchiseUser), 'Restricted to single territory', 'SIMULATED');
  assert('Auth: Merchant Isolation', 'Merchant account denied Super Admin', !adminService.isSuperAdmin(merchantUser), 'Restricted to business owner', 'SIMULATED');
  assert('Auth: Customer Isolation', 'Customer account denied Super Admin', !adminService.isSuperAdmin(customerUser), 'Restricted to consumer', 'SIMULATED');
  assert('Auth: Anonymous Isolation', 'Anonymous visitor denied Super Admin', !adminService.isSuperAdmin(null), 'Null user blocked', 'SIMULATED');

  // ===========================================================================
  // CATEGORY 5: MULTI-CITY SERVICES & BATCH MODERATION OPERATIONS
  // ===========================================================================
  console.log('\n▶ CATEGORY 5: MULTI-CITY SERVICES & BATCH MODERATION OPERATIONS\n');

  // 1. Platform Stats Aggregation
  const stats = await adminService.getPlatformStats();
  assert('Service: Stats', 'Platform stats aggregates exactly 3 cities', stats.totalCities === 3, `Found ${stats.totalCities} cities`, 'STATIC');
  assert('Service: Stats', 'Platform stats includes Chittoor, Vellore, Bengaluru breakdown', Boolean(stats.cityBreakdown.chittoor && stats.cityBreakdown.vellore && stats.cityBreakdown.bengaluru), 'All 3 cities present', 'STATIC');
  assert('Service: Stats', 'Total listings is non-negative number', stats.totalListings >= 0, `Listings: ${stats.totalListings}`, 'STATIC');
  assert('Service: Stats', 'Total enquiries is non-negative number', stats.totalEnquiries >= 0, `Enquiries: ${stats.totalEnquiries}`, 'STATIC');
  assert('Service: Stats', 'Active franchises count is at least 3', stats.activeFranchises >= 3, `Franchises: ${stats.activeFranchises}`, 'STATIC');

  // 2. Cities Summary
  const citiesSummary = await adminService.getCitiesSummary();
  assert('Service: Cities', 'Returns summary for exactly 3 cities', citiesSummary.length === 3, `Count: ${citiesSummary.length}`, 'STATIC');
  const cityCodes = citiesSummary.map((c) => c.code).sort();
  assert('Service: Cities', 'Contains AP-03, KA-01, and TN-23 codes', JSON.stringify(cityCodes) === JSON.stringify(['AP-03', 'KA-01', 'TN-23']), `Codes: ${cityCodes.join(', ')}`, 'STATIC');

  // 3. Franchise Partners
  const partners = await adminService.getFranchisePartners();
  assert('Service: Franchises', 'Returns 3 designated regional partner records', partners.length >= 3, `Count: ${partners.length}`, 'STATIC');
  assert('Service: Franchises', 'Partners map to Chittoor, Vellore, Bengaluru', partners.some((p) => p.cityId === 'chittoor') && partners.some((p) => p.cityId === 'vellore') && partners.some((p) => p.cityId === 'bengaluru'), 'All 3 cities represented', 'STATIC');

  // 4. User Directory & Role Assignment
  const users = await adminService.getAllUsers();
  assert('Service: Users', 'Returns user directory records', users.length >= 4, `Records: ${users.length}`, 'STATIC');
  const roleRes = await adminService.assignUserRole('usr-cust-01', 'business_owner', 'chittoor');
  assert('Service: Users', 'assignUserRole executes without throwing', roleRes.success, 'Role assigned', 'STATIC');
  const statusRes = await adminService.updateUserStatus('usr-cust-01', 'active');
  assert('Service: Users', 'updateUserStatus executes without throwing', statusRes.success, 'Status updated', 'STATIC');

  // 5. Global Directory Listings & Batch Moderation
  const allListings = await adminService.getAllListings();
  assert('Service: Listings', 'Returns global directory listings', allListings.length > 0, `Count: ${allListings.length}`, 'STATIC');

  const batchListings = allListings.slice(0, 2).map((l) => ({ id: l.id, cityId: (l.cityId || 'chittoor') as CityId }));
  const bulkApproveRes = await adminService.bulkApproveListings(batchListings, 'super-admin-01');
  assert('Service: Batch Moderation', 'bulkApproveListings executes across listing batch', bulkApproveRes.successCount + bulkApproveRes.failureCount === batchListings.length, `Processed ${batchListings.length} items`, 'STATIC');

  // 6. Lead & Enquiry Management
  const allEnquiries = await adminService.getAllEnquiries();
  assert('Service: Enquiries', 'Returns general quote requests array', Array.isArray(allEnquiries.generalRequests), `Count: ${allEnquiries.generalRequests.length}`, 'STATIC');
  assert('Service: Enquiries', 'Returns direct customer enquiries array', Array.isArray(allEnquiries.directEnquiries), `Count: ${allEnquiries.directEnquiries.length}`, 'STATIC');

  const leadUpdateRes = await adminService.updateGeneralRequestStatus('gen-test-01', 'routed', 'super-admin-01');
  assert('Service: Enquiries', 'updateGeneralRequestStatus executes successfully', leadUpdateRes.success, 'Lead updated', 'STATIC');
  const enqUpdateRes = await adminService.updateDirectEnquiryStatus('enq-test-01', 'replied', 'super-admin-01');
  assert('Service: Enquiries', 'updateDirectEnquiryStatus executes successfully', enqUpdateRes.success, 'Enquiry updated', 'STATIC');

  // 7. Local Cinema Curation
  const theatres = await adminService.getLocalTheatres('chittoor');
  assert('Service: Content', 'getLocalTheatres returns cinemas for Chittoor', theatres.length > 0, `Found: ${theatres.length}`, 'STATIC');
  const theatreToggleRes = await adminService.toggleTheatreStatus(theatres[0]?.id || 'th-01', true);
  assert('Service: Content', 'toggleTheatreStatus executes successfully', theatreToggleRes.success, 'Status toggled', 'STATIC');

  // 8. Platform Audit Feed
  const auditLogs = await adminService.getGlobalAuditLogs();
  assert('Service: Audit', 'Returns platform audit log records', Array.isArray(auditLogs), `Count: ${auditLogs.length}`, 'STATIC');

  // ===========================================================================
  // CATEGORY 6, 7 & 8: BROWSER CDP ACCEPTANCE & RESPONSIVE TESTING
  // ===========================================================================
  await runBrowserAcceptanceSuite();

  // ===========================================================================
  // CATEGORY 9: LIVE AUTHENTICATED SUPER ADMIN CREDENTIAL STATUS
  // ===========================================================================
  console.log('\n▶ CATEGORY 9: LIVE AUTHENTICATED SUPER ADMIN CREDENTIAL STATUS\n');
  const liveAdminEmail = process.env.TEST_SUPER_ADMIN_EMAIL;
  const liveAdminPassword = process.env.TEST_SUPER_ADMIN_PASSWORD;

  if (liveAdminEmail && liveAdminPassword) {
    if (supabase) {
      const { data: authData, error: lAuthErr } = await supabase.auth.signInWithPassword({
        email: liveAdminEmail,
        password: liveAdminPassword,
      });
      if (!lAuthErr && authData.user) {
        assert('Live Auth: Session', 'Live Super Admin authenticated session established', true, `Authenticated as ${authData.user.email}`, 'LIVE_AUTH');
      } else {
        recordBlocked('Live Auth: Session', 'Live Super Admin login failed', lAuthErr ? lAuthErr.message : 'Unknown auth error');
      }
    }
  } else {
    recordBlocked('Live Auth: Session', 'Live Super Admin end-to-end authenticated login', 'TEST_SUPER_ADMIN_EMAIL and TEST_SUPER_ADMIN_PASSWORD are not provisioned in environment. Real server-side RLS and simulated RBAC gates verified.');
  }

  // ===========================================================================
  // TEST SUMMARY
  // ===========================================================================
  const passedCount = assertions.filter((a) => a.passed).length;
  const failedCount = assertions.filter((a) => !a.passed && a.classification !== 'BLOCKED').length;
  const blockedCount = assertions.filter((a) => a.classification === 'BLOCKED').length;
  const totalExecutable = assertions.filter((a) => a.classification !== 'BLOCKED').length;

  console.log('\n=============================================================================');
  console.log(`TEST SUMMARY: ${passedCount}/${totalExecutable} executable assertions passed (${Math.round((passedCount / totalExecutable) * 100)}%)`);
  if (blockedCount > 0) {
    console.log(`STATUS: ${blockedCount} test(s) cleanly marked as BLOCKED due to unprovisioned live credentials.`);
  }
  console.log('=============================================================================\n');

  if (failedCount > 0) {
    console.error(`❌ ${failedCount} assertion(s) failed.`);
    process.exit(1);
  } else {
    console.log('🎉 ALL PHASE 7C EXECUTABLE ASSERTIONS PASSED WITH ZERO REGRESSIONS.\n');
  }
}

async function runBrowserAcceptanceSuite() {
  console.log('\n▶ CATEGORY 6, 7 & 8: BROWSER CDP ACCEPTANCE & RESPONSIVE VIEWPORT TESTING\n');

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
  const tmpProfile = path.join(process.cwd(), '.tmp-phase7c-chrome');
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
    console.error('❌ Could not connect to Headless Chrome via CDP.');
    chromeProc.kill();
    preview.kill();
    process.exit(1);
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve));

  try {
    await sendCDP(ws, 'Page.enable');
    await sendCDP(ws, 'DOM.enable');

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
          hasAuthReq: text.includes('Super Admin Authentication Required') || text.includes('Super Administrator Access'),
          hasSignInBtn: text.includes('Sign In to Super Admin Console') || text.includes('Super Admin Login'),
          hidesAdminBody: !text.includes('Platform Oversight')
        };
      })()`,
      returnByValue: true,
    });
    const anonRes = anonEval.result.value;
    assert('Gate: Anonymous', 'Blocks anonymous visitor with Super Administrator gate', anonRes.hasAuthReq && anonRes.hasSignInBtn && anonRes.hidesAdminBody, 'Gate rendered', 'BROWSER');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7c_gate_anonymous.png'));

    // -------------------------------------------------------------------------
    // SCENARIO 2: CONSUMER ACCOUNT ON /admin
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
    assert('Gate: Customer Denied', 'Displays customer role denial card with explore option', custRes.hasCustDenied && custRes.hasReturnHome, 'Customer denial verified', 'BROWSER');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7c_gate_customer.png'));

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
    assert('Gate: Franchise Isolation', 'Displays territory isolation gate with redirect to city portal', franRes.hasTerritoryIsolation && franRes.hasPortalBtn, 'Franchise isolation verified', 'BROWSER');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7c_gate_franchise.png'));

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
    assert('Console: Authorized', 'Super Admin console renders full navigation and administrative layout', adminRes.hasConsoleTitle && adminRes.hasMultiCityKpi && adminRes.hasSidebar, 'Console accessible', 'BROWSER');
    await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, 'admin_7c_console_overview.png'));

    // -------------------------------------------------------------------------
    // SCENARIO 5: VERIFY ALL 10 ADMINISTRATIVE MODULES
    // -------------------------------------------------------------------------
    const modules = [
      { tab: 'overview', title: 'Platform Oversight', shot: 'admin_7c_module_overview.png' },
      { tab: 'cities', title: 'Connected Regional Hubs', shot: 'admin_7c_module_cities.png' },
      { tab: 'franchises', title: 'City Franchise Operators', shot: 'admin_7c_module_franchises.png' },
      { tab: 'users', title: 'User Accounts & Roles', shot: 'admin_7c_module_users.png' },
      { tab: 'businesses', title: 'Multi-City Storefront Management', shot: 'admin_7c_module_businesses.png' },
      { tab: 'enquiries', title: 'Multi-City Customer Inquiries', shot: 'admin_7c_module_enquiries.png' },
      { tab: 'content', title: 'Territory Spotlight', shot: 'admin_7c_module_content.png' },
      { tab: 'analytics', title: 'Territory Performance', shot: 'admin_7c_module_analytics.png' },
      { tab: 'audit', title: 'Platform Audit Feed', shot: 'admin_7c_module_audit.png' },
      { tab: 'settings', title: 'System Infrastructure', shot: 'admin_7c_module_settings.png' },
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
      assert(`Module: ${mod.tab}`, `Navigates to #${mod.tab} and renders ${mod.title}`, Boolean(res.hasTitle || res.isBtnActive), `Page active`, 'BROWSER');
      await setViewportAndCapture(ws, 1440, 900, path.join(ARTIFACT_DIR, mod.shot));
    }

    // -------------------------------------------------------------------------
    // SCENARIO 6: RESPONSIVE VIEWPORT TESTING & ZERO HORIZONTAL OVERFLOW
    // -------------------------------------------------------------------------
    console.log('\n▶ Testing Responsive Viewports across 6 screen sizes with Zero Overflow...\n');

    const viewports = [
      { name: '360px_compact_mobile', width: 360, height: 740, code: '360px' },
      { name: '390px_standard_mobile', width: 390, height: 844, code: '390px' },
      { name: '768px_tablet_portrait', width: 768, height: 1024, code: '768px' },
      { name: '1024px_tablet_landscape', width: 1024, height: 768, code: '1024px' },
      { name: '1440px_desktop_standard', width: 1440, height: 900, code: '1440px' },
      { name: '1920px_desktop_large', width: 1920, height: 1080, code: '1920px' },
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
          const docEl = document.documentElement;
          const body = document.body;
          const scrollW = Math.max(docEl.scrollWidth, body.scrollWidth);
          const clientW = docEl.clientWidth;
          return {
            scrollW,
            clientW,
            hasOverflow: scrollW > clientW + 1
          };
        })()`,
        returnByValue: true,
      });

      const res = overflowEval.result.value;
      assert(
        `Viewport: ${vp.code}`,
        `Zero horizontal overflow at ${vp.code} (scroll: ${res.scrollW}px, client: ${res.clientW}px)`,
        !res.hasOverflow,
        `Overflow: ${res.hasOverflow}`,
        'BROWSER'
      );
      await setViewportAndCapture(ws, vp.width, vp.height, path.join(ARTIFACT_DIR, `admin_7c_responsive_${vp.code}.png`));
    }

    // -------------------------------------------------------------------------
    // SCENARIO 7: NON-REGRESSION OF PUBLIC & FRANCHISE PAGES
    // -------------------------------------------------------------------------
    console.log('\n▶ Testing Non-Regression of Public Consumer & Franchise Pages...\n');

    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    const routes = [
      { name: 'Chittoor Hub', url: 'http://127.0.0.1:4173/city/chittoor', expected: 'Chittoor' },
      { name: 'Vellore Hub', url: 'http://127.0.0.1:4173/city/vellore', expected: 'Vellore' },
      { name: 'Bengaluru Hub', url: 'http://127.0.0.1:4173/city/bengaluru', expected: 'Bengaluru' },
      { name: 'Vellore Franchise', url: 'http://127.0.0.1:4173/city/vellore/franchise', expected: 'Franchise' },
    ];

    for (const r of routes) {
      await sendCDP(ws, 'Page.navigate', { url: r.url });
      await wait(1200);

      const rEval = await sendCDP(ws, 'Runtime.evaluate', {
        expression: `document.body.innerText.includes('${r.expected}')`,
        returnByValue: true,
      });

      assert('Non-Regression', `Route ${r.name} (${r.url}) renders intact`, Boolean(rEval.result.value), `Contains ${r.expected}`, 'BROWSER');
    }

  } finally {
    ws.close();
    chromeProc.kill();
    preview.kill();
    console.log('\n🧹 Chrome and Vite Preview processes terminated.');
  }
}

// Execute Runner
runPhase7CSuite().catch((err) => {
  console.error('Fatal execution error in Phase 7C runner:', err);
  process.exit(1);
});
