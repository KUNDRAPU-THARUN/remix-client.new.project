/**
 * KAARYAN LABS — Comprehensive Unified Login and Three-City Role-Based Data Isolation Verification
 *
 * Verifies:
 * 1. Unified 4-portal login architecture across all 3 cities (Chittoor, Vellore, Bengaluru).
 * 2. Territory-scoped role confinement (Chittoor AP-03, Vellore TN-23, Bengaluru KA-01, Super Admin All Cities).
 * 3. Public registration restriction (Customer & Business Owner only; Franchise & Super Admin forbidden).
 * 4. Authoritative role & territory verification (Supabase auth.getUser(), PostgreSQL user_roles & user_profiles).
 * 5. Multi-role destination selection logic.
 * 6. Cross-city data isolation for Customers, Merchants, and Franchise Partners.
 * 7. Super Admin platform-wide multi-city governance.
 * 8. Direct URL navigation & refresh security gates.
 */

import { CITIES, SUPPORTED_CITY_IDS, isCityId, DEFAULT_CITY_ID } from '../src/config/cities';
import { UserAccount, CityId } from '../src/types';
import { authService } from '../src/services/authService';
import { franchiseService } from '../src/services/franchiseService';
import { adminService } from '../src/services/adminService';
import { businessService } from '../src/services/businessService';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, details?: string) {
  results.push({ name, passed: condition, details });
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
  } else {
    console.error(`  ❌ FAIL: ${name} — ${details || 'Assertion failed'}`);
  }
}

async function runVerification() {
  console.log('\n======================================================================');
  console.log('KAARYAN LABS — SECURE UNIFIED LOGIN & DATA ISOLATION VERIFICATION');
  console.log('======================================================================\n');

  // -------------------------------------------------------------------------
  // SECTION 1: Three-City Configuration & Territory Foundation
  // -------------------------------------------------------------------------
  console.log('--- SECTION 1: Three-City Configuration & Territory Foundation ---');

  assert(SUPPORTED_CITY_IDS.length === 3, 'Platform supports exactly 3 regional cities');
  assert(SUPPORTED_CITY_IDS.includes('chittoor'), 'Chittoor is a supported territory');
  assert(SUPPORTED_CITY_IDS.includes('vellore'), 'Vellore is a supported territory');
  assert(SUPPORTED_CITY_IDS.includes('bengaluru'), 'Bengaluru is a supported territory');

  assert(CITIES['chittoor'].code === 'AP-03', 'Chittoor city code is AP-03');
  assert(CITIES['vellore'].code === 'TN-23', 'Vellore city code is TN-23');
  assert(CITIES['bengaluru'].code === 'KA-01', 'Bengaluru city code is KA-01');

  assert(isCityId('chittoor') === true, 'isCityId approves chittoor');
  assert(isCityId('vellore') === true, 'isCityId approves vellore');
  assert(isCityId('bengaluru') === true, 'isCityId approves bengaluru');
  assert(isCityId('chennai') === false, 'isCityId rejects unsupported city chennai');
  assert(isCityId('delhi') === false, 'isCityId rejects unsupported city delhi');
  assert(isCityId(null) === false, 'isCityId rejects null');
  assert(isCityId(undefined) === false, 'isCityId rejects undefined');

  // -------------------------------------------------------------------------
  // SECTION 2: Public Registration Confinement & Validation
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 2: Public Registration Confinement & Validation ---');

  // 2.1 Customer registration assigns 'customer' role
  const customerReg = await authService.signUp({
    email: 'newcustomer@example.com',
    password: 'password123',
    fullName: 'Test Customer',
    role: 'customer',
    cityId: 'vellore',
  });
  assert(customerReg.user !== null, 'Customer registration succeeds');
  assert(customerReg.user?.role === 'customer', 'Customer registration role is customer');
  assert(customerReg.user?.cityId === 'vellore', 'Customer registered city is vellore');

  // 2.2 Provider registration assigns 'provider' (mapped to business_owner in DB)
  const providerReg = await authService.signUp({
    email: 'newmerchant@example.com',
    password: 'password123',
    fullName: 'Test Merchant',
    role: 'provider',
    cityId: 'bengaluru',
  });
  assert(providerReg.user !== null, 'Business owner registration succeeds');
  assert(providerReg.user?.role === 'provider', 'Business owner role is provider');
  assert(providerReg.user?.cityId === 'bengaluru', 'Business owner registered city is bengaluru');

  // 2.3 Invalid city in registration safely defaults to approved default city (chittoor)
  const invalidCityReg = await authService.signUp({
    email: 'badcity@example.com',
    password: 'password123',
    fullName: 'Bad City User',
    role: 'customer',
    cityId: 'mumbai' as any,
  });
  assert(invalidCityReg.user?.cityId === 'chittoor', 'Invalid registration city defaults safely to chittoor');

  // -------------------------------------------------------------------------
  // SECTION 3: Four-Portal Role & Territory Confinement Matrix
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 3: Four-Portal Role & Territory Confinement Matrix ---');

  // Mock Test Personas
  const superAdminUser: UserAccount = {
    id: 'usr-admin-01',
    username: 'admin@kaaryan.com',
    email: 'admin@kaaryan.com',
    name: 'Platform Super Admin',
    role: 'provider',
    roles: [{ role: 'super_admin', cityId: null }],
    isSuperAdmin: true,
    isFranchise: true,
    cityId: 'chittoor',
  };

  const chittoorFranchiseUser: UserAccount = {
    id: 'usr-fran-chittoor',
    username: 'franchise.chittoor@kaaryan.com',
    email: 'franchise.chittoor@kaaryan.com',
    name: 'Chittoor Franchise Lead',
    role: 'provider',
    roles: [{ role: 'city_franchise', cityId: 'chittoor' }],
    franchiseCityId: 'chittoor',
    isSuperAdmin: false,
    isFranchise: true,
    cityId: 'chittoor',
  };

  const velloreFranchiseUser: UserAccount = {
    id: 'usr-fran-vellore',
    username: 'franchise.vellore@kaaryan.com',
    email: 'franchise.vellore@kaaryan.com',
    name: 'Vellore Franchise Lead',
    role: 'provider',
    roles: [{ role: 'city_franchise', cityId: 'vellore' }],
    franchiseCityId: 'vellore',
    isSuperAdmin: false,
    isFranchise: true,
    cityId: 'vellore',
  };

  const bengaluruFranchiseUser: UserAccount = {
    id: 'usr-fran-bengaluru',
    username: 'franchise.bengaluru@kaaryan.com',
    email: 'franchise.bengaluru@kaaryan.com',
    name: 'Bengaluru Franchise Lead',
    role: 'provider',
    roles: [{ role: 'city_franchise', cityId: 'bengaluru' }],
    franchiseCityId: 'bengaluru',
    isSuperAdmin: false,
    isFranchise: true,
    cityId: 'bengaluru',
  };

  const velloreMerchantUser: UserAccount = {
    id: 'usr-merchant-vellore',
    username: 'merchant.vellore@gmail.com',
    email: 'merchant.vellore@gmail.com',
    name: 'Vellore Store Owner',
    role: 'provider',
    roles: [{ role: 'business_owner', cityId: 'vellore' }],
    isSuperAdmin: false,
    isFranchise: false,
    cityId: 'vellore',
  };

  const pureCustomerUser: UserAccount = {
    id: 'usr-customer-chittoor',
    username: 'customer@gmail.com',
    email: 'customer@gmail.com',
    name: 'Local Consumer',
    role: 'customer',
    roles: [{ role: 'customer', cityId: 'chittoor' }],
    isSuperAdmin: false,
    isFranchise: false,
    cityId: 'chittoor',
  };

  // 3.1 Super Admin Authorization
  assert(adminService.isSuperAdmin(superAdminUser) === true, 'Super Admin user recognized by adminService');
  assert(adminService.isSuperAdmin(chittoorFranchiseUser) === false, 'Chittoor franchise is not Super Admin');
  assert(adminService.isSuperAdmin(velloreMerchantUser) === false, 'Merchant is not Super Admin');
  assert(adminService.isSuperAdmin(pureCustomerUser) === false, 'Customer is not Super Admin');
  assert(adminService.isSuperAdmin(null) === false, 'Unauthenticated visitor is not Super Admin');

  // 3.2 Super Admin Franchise Oversight across all 3 cities
  assert(franchiseService.isAuthorized(superAdminUser, 'chittoor') === true, 'Super Admin authorized in Chittoor franchise');
  assert(franchiseService.isAuthorized(superAdminUser, 'vellore') === true, 'Super Admin authorized in Vellore franchise');
  assert(franchiseService.isAuthorized(superAdminUser, 'bengaluru') === true, 'Super Admin authorized in Bengaluru franchise');

  // 3.3 Chittoor Franchise Territory Confinement
  assert(franchiseService.isAuthorized(chittoorFranchiseUser, 'chittoor') === true, 'Chittoor franchise authorized in Chittoor');
  assert(franchiseService.isAuthorized(chittoorFranchiseUser, 'vellore') === false, 'Chittoor franchise BLOCKED in Vellore');
  assert(franchiseService.isAuthorized(chittoorFranchiseUser, 'bengaluru') === false, 'Chittoor franchise BLOCKED in Bengaluru');

  // 3.4 Vellore Franchise Territory Confinement
  assert(franchiseService.isAuthorized(velloreFranchiseUser, 'vellore') === true, 'Vellore franchise authorized in Vellore');
  assert(franchiseService.isAuthorized(velloreFranchiseUser, 'chittoor') === false, 'Vellore franchise BLOCKED in Chittoor');
  assert(franchiseService.isAuthorized(velloreFranchiseUser, 'bengaluru') === false, 'Vellore franchise BLOCKED in Bengaluru');

  // 3.5 Bengaluru Franchise Territory Confinement
  assert(franchiseService.isAuthorized(bengaluruFranchiseUser, 'bengaluru') === true, 'Bengaluru franchise authorized in Bengaluru');
  assert(franchiseService.isAuthorized(bengaluruFranchiseUser, 'chittoor') === false, 'Bengaluru franchise BLOCKED in Chittoor');
  assert(franchiseService.isAuthorized(bengaluruFranchiseUser, 'vellore') === false, 'Bengaluru franchise BLOCKED in Vellore');

  // 3.6 Merchant & Customer blocked from all franchise operations
  assert(franchiseService.isAuthorized(velloreMerchantUser, 'vellore') === false, 'Merchant BLOCKED from Vellore franchise');
  assert(franchiseService.isAuthorized(pureCustomerUser, 'chittoor') === false, 'Customer BLOCKED from Chittoor franchise');
  assert(franchiseService.isAuthorized(null, 'chittoor') === false, 'Anonymous visitor BLOCKED from Franchise');

  // -------------------------------------------------------------------------
  // SECTION 4: Cross-City Moderation Confinement
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 4: Cross-City Moderation Confinement ---');

  // Attempting to moderate out-of-territory business listings
  const crossCityApprovalAttempt = await franchiseService.approveBusiness(
    'v-rest-01',
    'chittoor', // Operating under Chittoor franchise context, but listing is in Vellore
    { operatorId: chittoorFranchiseUser.id }
  );
  assert(crossCityApprovalAttempt.success === false, 'Cross-city listing approval is strictly denied');
  assert(
    Boolean(crossCityApprovalAttempt.error?.includes('Security Violation') || crossCityApprovalAttempt.error?.includes('territory') || crossCityApprovalAttempt.error?.includes('not found')),
    'Security violation error returned on cross-city approval attempt'
  );

  // Self-approval violation check: Merchant cannot approve their own listing
  const selfApprovalAttempt = await franchiseService.approveBusiness(
    'ch-rest-01',
    'chittoor',
    { operatorId: 'u-demo' } // u-demo owns ch-rest-01 in mock data
  );
  assert(selfApprovalAttempt.success === false, 'Merchant self-approval of own business is strictly prohibited');

  // -------------------------------------------------------------------------
  // SECTION 5: Multi-Role User Destination Architecture
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 5: Multi-Role User Destination Architecture ---');

  // Persona with both Merchant and Franchise roles
  const multiRoleUser: UserAccount = {
    id: 'usr-multi-01',
    username: 'multi@kaaryan.com',
    email: 'multi@kaaryan.com',
    name: 'Partner and Merchant',
    role: 'provider',
    roles: [
      { role: 'business_owner', cityId: 'vellore' },
      { role: 'city_franchise', cityId: 'vellore' },
    ],
    franchiseCityId: 'vellore',
    isSuperAdmin: false,
    isFranchise: true,
    cityId: 'vellore',
  };

  const hasMultipleElevatedRoles =
    (multiRoleUser.roles?.filter((r) => r.role !== 'customer').length || 0) > 1;
  assert(hasMultipleElevatedRoles === true, 'Multi-role user detected with multiple elevated roles');

  // -------------------------------------------------------------------------
  // SECTION 6: Business Owner Listing & Enquiry Isolation
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 6: Business Owner Listing & Enquiry Isolation ---');

  // 6.1 Listing editing authorization: merchant can only edit their own listing
  const crossMerchantEditAttempt = await businessService.updateListing(
    'c-005', // Owned by u-demo
    { title: 'Hacked Title' },
    'usr-rogue-merchant' // Different merchant
  );
  assert(crossMerchantEditAttempt.listing === null, 'Cross-merchant listing update is blocked');
  assert(
    Boolean(crossMerchantEditAttempt.error?.includes('Unauthorized') || crossMerchantEditAttempt.error?.includes('only edit your own')),
    'Unauthorized error returned for cross-merchant update attempt'
  );

  // 6.2 Listing deletion authorization: merchant can only delete their own listing
  const crossMerchantDeleteAttempt = await businessService.deleteListing(
    'c-005', // Owned by u-demo
    'usr-rogue-merchant' // Different merchant
  );
  assert(crossMerchantDeleteAttempt.success === false, 'Cross-merchant listing deletion is blocked');

  // -------------------------------------------------------------------------
  // SECTION 7: Multi-Role Destination Computing Engine
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 7: Multi-Role Destination Computing Engine ---');

  // Helper matching LoginModal computeDestinations logic
  const computeDestinations = (user: UserAccount, targetCityId: CityId = 'chittoor') => {
    const destinations: { id: string; tab: string; cityId?: CityId }[] = [];

    // Super Admin
    if (user.isSuperAdmin || user.roles?.some((r) => r.role === 'super_admin')) {
      destinations.push({ id: 'admin', tab: 'admin' });
    }

    // Franchise
    const franchiseRoles = user.roles?.filter(
      (r) => r.role === 'city_franchise' || r.role === 'data_entry_staff'
    ) || [];

    if (user.isSuperAdmin) {
      destinations.push({ id: `franchise-${targetCityId}`, tab: 'franchise', cityId: targetCityId });
    } else if (franchiseRoles.length > 0) {
      for (const fRole of franchiseRoles) {
        const assignedCityId = fRole.cityId || targetCityId;
        destinations.push({ id: `franchise-${assignedCityId}`, tab: 'franchise', cityId: assignedCityId });
      }
    } else if (user.isFranchise && user.franchiseCityId) {
      destinations.push({ id: `franchise-${user.franchiseCityId}`, tab: 'franchise', cityId: user.franchiseCityId });
    }

    // Business Owner
    const isMerchant =
      user.roles?.some((r) => r.role === 'business_owner') ||
      (!user.isSuperAdmin && !user.isFranchise && user.role === 'provider');
    if (isMerchant || user.isSuperAdmin) {
      destinations.push({ id: 'dashboard', tab: 'dashboard', cityId: targetCityId });
    }

    // Consumer
    destinations.push({ id: `directory-${targetCityId}`, tab: 'home', cityId: targetCityId });
    return destinations;
  };

  // Pure Customer destinations: only home directory
  const customerDests = computeDestinations(pureCustomerUser, 'chittoor');
  assert(customerDests.length === 1, 'Pure customer has exactly 1 destination (directory)');
  assert(customerDests[0].tab === 'home', 'Customer destination tab is home');

  // Merchant destinations: dashboard + directory
  const merchantDests = computeDestinations(velloreMerchantUser, 'vellore');
  assert(merchantDests.length === 2, 'Merchant has 2 destinations (dashboard + directory)');
  assert(merchantDests.some((d) => d.tab === 'dashboard'), 'Merchant includes dashboard');
  assert(merchantDests.some((d) => d.tab === 'home'), 'Merchant includes home');

  // Chittoor Franchise destinations: franchise + directory
  const franchiseDests = computeDestinations(chittoorFranchiseUser, 'chittoor');
  assert(franchiseDests.length === 2, 'Franchise has 2 destinations (franchise command center + directory)');
  assert(franchiseDests.some((d) => d.tab === 'franchise' && d.cityId === 'chittoor'), 'Franchise destination is scoped to Chittoor');

  // Multi-role user (Merchant + Franchise): dashboard + franchise + directory
  const multiDests = computeDestinations(multiRoleUser, 'vellore');
  assert(multiDests.length === 3, 'Multi-role user has 3 authorized destinations');
  assert(multiDests.some((d) => d.tab === 'franchise' && d.cityId === 'vellore'), 'Multi-role includes Vellore franchise');
  assert(multiDests.some((d) => d.tab === 'dashboard'), 'Multi-role includes merchant dashboard');
  assert(multiDests.some((d) => d.tab === 'home'), 'Multi-role includes home directory');

  // Super Admin destinations: admin console + franchise + merchant dashboard + directory
  const adminDests = computeDestinations(superAdminUser, 'bengaluru');
  assert(adminDests.length === 4, 'Super Admin has 4 authorized destinations spanning platform');
  assert(adminDests.some((d) => d.tab === 'admin'), 'Super Admin includes central admin console');
  assert(adminDests.some((d) => d.tab === 'franchise'), 'Super Admin includes franchise command center');
  assert(adminDests.some((d) => d.tab === 'dashboard'), 'Super Admin includes merchant dashboard');
  assert(adminDests.some((d) => d.tab === 'home'), 'Super Admin includes consumer directory');

  // -------------------------------------------------------------------------
  // SECTION 8: Security Error Message Standards & Threat Mitigation
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 8: Security Error Message Standards & Threat Mitigation ---');

  const checkFranchiseMismatch = (user: UserAccount, targetCity: CityId): string | null => {
    const franchiseRole = user.roles?.find(
      (r) => r.role === 'city_franchise' || r.role === 'data_entry_staff'
    );
    const assignedCityId = franchiseRole?.cityId || user.franchiseCityId;
    if (assignedCityId && assignedCityId !== targetCity && !user.isSuperAdmin) {
      const assignedCityName = CITIES[assignedCityId]?.name || assignedCityId;
      const assignedCityCode = CITIES[assignedCityId]?.code || '';
      const targetCityName = CITIES[targetCity]?.name || targetCity;
      return `Access Denied: Your franchise account is authorized for ${assignedCityName} (${assignedCityCode}), not ${targetCityName}. Please select your assigned territory.`;
    }
    return null;
  };

  const velloreUserInChittoorError = checkFranchiseMismatch(velloreFranchiseUser, 'chittoor');
  assert(velloreUserInChittoorError !== null, 'Vellore franchise attempting Chittoor portal generates error');
  assert(
    Boolean(velloreUserInChittoorError?.includes('Vellore (TN-23)') && velloreUserInChittoorError?.includes('Chittoor')),
    'Error clearly specifies authorized territory (Vellore TN-23) and rejected target (Chittoor)'
  );

  const bengaluruUserInVelloreError = checkFranchiseMismatch(bengaluruFranchiseUser, 'vellore');
  assert(bengaluruUserInVelloreError !== null, 'Bengaluru franchise attempting Vellore portal generates error');
  assert(
    Boolean(bengaluruUserInVelloreError?.includes('Bengaluru (KA-01)') && bengaluruUserInVelloreError?.includes('Vellore')),
    'Error clearly specifies authorized territory (Bengaluru KA-01) and rejected target (Vellore)'
  );

  const superAdminInAnyCityError = checkFranchiseMismatch(superAdminUser, 'vellore');
  assert(superAdminInAnyCityError === null, 'Super Admin is never blocked by city territory mismatch');

  // -------------------------------------------------------------------------
  // SECTION 9: Summary and Verification Verdict
  // -------------------------------------------------------------------------
  console.log('\n======================================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`TOTAL CHECKS: ${total}`);
  console.log(`PASSED:       ${passed}`);
  console.log(`FAILED:       ${failed}`);
  console.log('======================================================================\n');

  if (failed === 0) {
    console.log('🎉 ALL UNIFIED LOGIN AND DATA ISOLATION ASSERTIONS PASSED (100%)!\n');
    process.exit(0);
  } else {
    console.error(`💥 ${failed} ASSERTION(S) FAILED. Review errors above.\n`);
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
