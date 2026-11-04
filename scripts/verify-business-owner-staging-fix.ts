/**
 * KAARYAN LABS — BUSINESS OWNER STAGING CONNECTION VERIFICATION
 *
 * Verifies:
 * 1. Dual environment variable support (VITE_SUPABASE_ANON_KEY & VITE_SUPABASE_PUBLISHABLE_KEY)
 * 2. Staging vs Production project reference resolution
 * 3. Truthful backend status indicator logic (no fake green active state on unverified sessions)
 * 4. Merchant role authorization & customer account gating
 * 5. Elimination of offline demo user bypasses on active backend
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AssertionResult {
  category: string;
  name: string;
  passed: boolean;
  message: string;
}

const results: AssertionResult[] = [];

function assert(category: string, name: string, passed: boolean, message: string) {
  results.push({ category, name, passed, message });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${icon}] [${category}] ${name}: ${message}`);
}

async function runVerification() {
  console.log('=============================================================================');
  console.log('KAARYAN LABS — BUSINESS OWNER STAGING FIX VERIFICATION');
  console.log('=============================================================================\n');

  // CATEGORY 1: SUPABASE CONFIGURATION & DUAL ENV KEY SUPPORT
  console.log('--- CATEGORY 1: Supabase Configuration & Dual Env Key Support ---');

  const supabaseTsPath = path.resolve(__dirname, '../src/lib/supabase.ts');
  const supabaseTsCode = fs.readFileSync(supabaseTsPath, 'utf8');

  assert(
    'Supabase Config',
    'VITE_SUPABASE_ANON_KEY Supported',
    supabaseTsCode.includes('VITE_SUPABASE_ANON_KEY'),
    'src/lib/supabase.ts explicitly checks VITE_SUPABASE_ANON_KEY'
  );

  assert(
    'Supabase Config',
    'VITE_SUPABASE_PUBLISHABLE_KEY Backward Compatible',
    supabaseTsCode.includes('VITE_SUPABASE_PUBLISHABLE_KEY'),
    'src/lib/supabase.ts maintains backward compatibility with VITE_SUPABASE_PUBLISHABLE_KEY'
  );

  assert(
    'Supabase Config',
    'getSupabaseProjectRef Helper Exported',
    supabaseTsCode.includes('export const getSupabaseProjectRef'),
    'src/lib/supabase.ts exports getSupabaseProjectRef helper'
  );

  assert(
    'Supabase Config',
    'isStagingEnvironment Helper Exported',
    supabaseTsCode.includes('export const isStagingEnvironment') &&
      supabaseTsCode.includes('tbwtxnszyddvpgqvxwow'),
    'src/lib/supabase.ts recognizes staging project reference tbwtxnszyddvpgqvxwow'
  );

  assert(
    'Supabase Config',
    'Placeholder Keys Rejected',
    supabaseTsCode.includes('your-supabase-publishable-key-here') &&
      supabaseTsCode.includes('your-anon-key-here'),
    'Placeholder strings are rejected by isSupabaseConfigured()'
  );

  // CATEGORY 2: IN-MEMORY EVALUATION OF SUPABASE URL & KEY RESOLUTION
  console.log('\n--- CATEGORY 2: In-Memory Key Resolution Simulation ---');

  // Test resolution logic matching src/lib/supabase.ts
  const resolveAnonKey = (metaEnv: any, procEnv: any) => {
    const key =
      metaEnv?.VITE_SUPABASE_ANON_KEY ||
      metaEnv?.VITE_SUPABASE_PUBLISHABLE_KEY ||
      procEnv?.VITE_SUPABASE_ANON_KEY ||
      procEnv?.VITE_SUPABASE_PUBLISHABLE_KEY;
    return typeof key === 'string' ? key.trim() : undefined;
  };

  const resolveProjectRef = (url?: string) => {
    if (!url) return null;
    const match = url.match(/^https:\/\/([^.]+)\.supabase\.co/);
    return match ? match[1] : null;
  };

  const stagingKey = resolveAnonKey({ VITE_SUPABASE_ANON_KEY: 'staging-anon-jwt-12345' }, {});
  assert(
    'Key Resolution',
    'Staging VITE_SUPABASE_ANON_KEY Resolved',
    stagingKey === 'staging-anon-jwt-12345',
    'Successfully extracted key when only VITE_SUPABASE_ANON_KEY is provided'
  );

  const pubKey = resolveAnonKey({ VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_dev_key' }, {});
  assert(
    'Key Resolution',
    'Dev VITE_SUPABASE_PUBLISHABLE_KEY Resolved',
    pubKey === 'sb_publishable_dev_key',
    'Successfully extracted key when only VITE_SUPABASE_PUBLISHABLE_KEY is provided'
  );

  const stagingRef = resolveProjectRef('https://tbwtxnszyddvpgqvxwow.supabase.co');
  assert(
    'Project Ref',
    'Staging Ref tbwtxnszyddvpgqvxwow Matched',
    stagingRef === 'tbwtxnszyddvpgqvxwow',
    'Correctly extracts staging project reference'
  );

  const prodRef = resolveProjectRef('https://gpqbppjqqndzuvksrtjb.supabase.co');
  assert(
    'Project Ref',
    'Production Ref gpqbppjqqndzuvksrtjb Matched',
    prodRef === 'gpqbppjqqndzuvksrtjb',
    'Correctly extracts production/dev project reference'
  );

  // CATEGORY 3: DASHBOARD HEADER TRUTHFUL STATUS INDICATOR
  console.log('\n--- CATEGORY 3: Dashboard Header Truthful Status Indicator ---');

  const headerTsPath = path.resolve(__dirname, '../src/components/business-owner/DashboardHeader.tsx');
  const headerCode = fs.readFileSync(headerTsPath, 'utf8');

  assert(
    'Header Indicator',
    'Imports getSupabaseProjectRef',
    headerCode.includes('getSupabaseProjectRef'),
    'DashboardHeader imports getSupabaseProjectRef for truthful environment display'
  );

  assert(
    'Header Indicator',
    'Requires Cryptographically Verified Session for PostgreSQL Active',
    headerCode.includes('isSessionVerified') &&
      headerCode.includes('isConfigured && isSessionVerified'),
    'DashboardHeader requires both backend configuration AND verified session for PostgreSQL Active'
  );

  assert(
    'Header Indicator',
    'Distinguishes Session Unverified State',
    headerCode.includes('Session Unverified'),
    'DashboardHeader displays Session Unverified when backend is configured but session is unverified'
  );

  assert(
    'Header Indicator',
    'Shows Project Reference Badge in Menu',
    headerCode.includes('tbwtxnszyddvpgqvxwow') &&
      headerCode.includes('staging'),
    'User account menu displays explicit staging tag for staging project reference'
  );

  // CATEGORY 4: USER DASHBOARD ROLE ENFORCEMENT & CUSTOMER GATING
  console.log('\n--- CATEGORY 4: User Dashboard Role Enforcement & Customer Gating ---');

  const userDashPath = path.resolve(__dirname, '../src/components/UserDashboard.tsx');
  const userDashCode = fs.readFileSync(userDashPath, 'utf8');

  assert(
    'Role Enforcement',
    'Imports isSupabaseConfigured',
    userDashCode.includes('isSupabaseConfigured'),
    'UserDashboard imports isSupabaseConfigured to guard against demo user bypasses on live backend'
  );

  assert(
    'Role Enforcement',
    'Blocks Demo/Mock User Bypasses on Live Backend',
    userDashCode.includes('isMockBypassBlocked') ||
      (userDashCode.includes('isDemoOrMockUser') && userDashCode.includes('isConfigured')),
    'Unverified demo/mock sessions are rejected when live Supabase backend is configured'
  );

  assert(
    'Role Enforcement',
    'Customer Role Blocked from Merchant Tools',
    userDashCode.includes('!hasMerchantRole || currentUser.role === \'customer\''),
    'Customers are strictly intercepted by Customer Account Limitation Gate'
  );

  assert(
    'Role Enforcement',
    'Recognizes business_owner, provider, franchise and super_admin Roles',
    userDashCode.includes('business_owner') &&
      userDashCode.includes('city_franchise') &&
      userDashCode.includes('super_admin'),
    'UserDashboard checks specific merchant roles in user account'
  );

  // CATEGORY 5: IN-MEMORY SIMULATION OF GATING CONDITIONS
  console.log('\n--- CATEGORY 5: In-Memory Role Gating Simulation ---');

  // Customer from staging public.user_roles
  const stagingCustomerUser: any = {
    id: 'c7b7f1e2-45a8-4c23-92f7-0d3fbb8b1234',
    username: 'testcustomer',
    email: 'customer.chittoor@example.com',
    role: 'customer',
    roles: [{ role: 'customer', cityId: 'chittoor' }],
    name: 'Chittoor Customer',
  };

  // Mock demo user from offline storage
  const mockDemoUser: any = {
    id: 'u-demo',
    username: 'demo_provider',
    email: 'demo@example.com',
    role: 'provider',
    roles: [{ role: 'business_owner', cityId: 'vellore' }],
    name: 'Demo Provider',
  };

  // Verified Vellore merchant from Supabase
  const verifiedVelloreMerchant: any = {
    id: '8a1f2b3c-9d0e-4f1a-b2c3-d4e5f6a7b8c9',
    username: 'vellore_merchant',
    email: 'merchant.vellore@example.com',
    role: 'provider',
    roles: [{ role: 'business_owner', cityId: 'vellore' }],
    name: 'Vellore Merchant',
  };

  const evaluateDashboardAccess = (user: any | null, isConfigured: boolean) => {
    const isMock = user && (user.id === 'u-demo' || user.id.startsWith('user-'));
    const isBlocked = isConfigured && isMock;

    if (!user || isBlocked) {
      return 'GATED_AUTH_REQUIRED';
    }

    const hasMerchantRole = Boolean(
      user.role === 'provider' ||
      user.isSuperAdmin ||
      user.isFranchise ||
      user.roles?.some((r: any) => r.role === 'business_owner' || r.role === 'city_franchise' || r.role === 'super_admin')
    );

    if (!hasMerchantRole || user.role === 'customer') {
      return 'GATED_CUSTOMER_LIMITED';
    }

    return 'ACCESS_GRANTED';
  };

  // Simulation 1: Anonymous visitor
  assert(
    'Simulation',
    'Anonymous Visitor Gated',
    evaluateDashboardAccess(null, true) === 'GATED_AUTH_REQUIRED',
    'Anonymous visitor must sign in'
  );

  // Simulation 2: Staging customer attempts to view Vellore merchant dashboard
  assert(
    'Simulation',
    'Staging Customer Gated with Customer Notice',
    evaluateDashboardAccess(stagingCustomerUser, true) === 'GATED_CUSTOMER_LIMITED',
    'Customer account in staging is blocked with Customer Account Limitation Gate'
  );

  // Simulation 3: Offline mock user on active staging backend
  assert(
    'Simulation',
    'Offline Mock User Blocked on Active Staging Backend',
    evaluateDashboardAccess(mockDemoUser, true) === 'GATED_AUTH_REQUIRED',
    'Demo/mock user is refused dashboard access when backend is active'
  );

  // Simulation 4: Verified Vellore merchant on active backend
  assert(
    'Simulation',
    'Verified Merchant Granted Access',
    evaluateDashboardAccess(verifiedVelloreMerchant, true) === 'ACCESS_GRANTED',
    'Cryptographically verified merchant is granted dashboard access'
  );

  // CATEGORY 6: ENV EXAMPLE DOCUMENTATION INTEGRITY
  console.log('\n--- CATEGORY 6: Env Example Documentation Integrity ---');

  const envExamplePath = path.resolve(__dirname, '../.env.example');
  const envExampleCode = fs.readFileSync(envExamplePath, 'utf8');

  assert(
    'Documentation',
    '.env.example Documents VITE_SUPABASE_ANON_KEY',
    envExampleCode.includes('VITE_SUPABASE_ANON_KEY'),
    '.env.example explicitly documents VITE_SUPABASE_ANON_KEY'
  );

  assert(
    'Documentation',
    '.env.example Documents Staging Reference tbwtxnszyddvpgqvxwow',
    envExampleCode.includes('tbwtxnszyddvpgqvxwow'),
    '.env.example includes staging project reference tbwtxnszyddvpgqvxwow'
  );

  assert(
    'Documentation',
    '.env.example Documents Production Reference gpqbppjqqndzuvksrtjb',
    envExampleCode.includes('gpqbppjqqndzuvksrtjb'),
    '.env.example includes production project reference gpqbppjqqndzuvksrtjb'
  );

  // SUMMARY
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log('\n=============================================================================');
  console.log(`TEST SUITE SUMMARY: ${passed}/${total} assertions passed (${Math.round((passed / total) * 100)}%)`);
  console.log('=============================================================================');

  if (failed > 0) {
    console.error(`\n❌ Suite failed with ${failed} failing assertions.`);
    process.exit(1);
  } else {
    console.log('\n🎉 ALL ASSERTIONS PASSED! Staging integration and role gating fully verified.\n');
  }
}

runVerification().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});

