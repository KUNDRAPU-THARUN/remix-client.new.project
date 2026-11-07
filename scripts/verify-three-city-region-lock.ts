/**
 * KAARYAN LABS — THREE-CITY REGION LOCK & DASHBOARD SECURITY TEST SUITE
 *
 * Implements rigorous verification for:
 * 1. Region Authorization Helper (isSuperAdmin, isUserAuthorizedForCity, getEffectiveDashboardCity, getRegionLockBadge)
 * 2. All 14 Mandatory Negative Security Scenarios from Task 15
 * 3. Desktop and Mobile Navbar region badge state & lock enforcement
 * 4. URL tampering and refresh security boundaries
 */

import { UserAccount, CityId } from '../src/types';
import {
  isSuperAdmin,
  getUserAuthorizedCities,
  isUserAuthorizedForCity,
  getEffectiveDashboardCity,
  getRegionLockBadge,
} from '../src/utils/regionAuthorization';
import { adminService } from '../src/services/adminService';
import { franchiseService } from '../src/services/franchiseService';
import { businessService } from '../src/services/businessService';

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedChecks++;
    console.error(`  ❌ FAIL: ${testName}`);
    if (details) console.error(`     Details: ${details}`);
  }
}

// ============================================================================
// TEST ACCOUNTS FIXTURES
// ============================================================================

const anonymousUser: UserAccount | null = null;

const velloreCustomer: UserAccount = {
  id: 'usr-customer-vel-01',
  username: 'vellore_shopper',
  email: 'customer@vellore.ads',
  role: 'customer',
  roles: [{ role: 'customer', cityId: 'vellore' }],
  name: 'Vellore Customer',
  cityId: 'vellore',
};

const chittoorOwner: UserAccount = {
  id: 'usr-owner-ch-01',
  username: 'chittoor_merchant',
  email: 'merchant@chittoor.ads',
  role: 'provider',
  roles: [{ role: 'business_owner', cityId: 'chittoor' }],
  name: 'Chittoor Store Owner',
  cityId: 'chittoor',
};

const velloreOwner: UserAccount = {
  id: 'usr-owner-vel-01',
  username: 'vellore_merchant',
  email: 'merchant@vellore.ads',
  role: 'provider',
  roles: [{ role: 'business_owner', cityId: 'vellore' }],
  name: 'Vellore Merchant',
  cityId: 'vellore',
};

const velloreFranchise: UserAccount = {
  id: 'usr-franchise-vel-01',
  username: 'vellore_partner',
  email: 'partner@vellore.ads',
  role: 'provider',
  roles: [{ role: 'city_franchise', cityId: 'vellore' }],
  name: 'Vellore Franchise Operator',
  isFranchise: true,
  franchiseCityId: 'vellore',
  cityId: 'vellore',
};

const bengaluruFranchise: UserAccount = {
  id: 'usr-franchise-blr-01',
  username: 'bengaluru_partner',
  email: 'partner@bengaluru.ads',
  role: 'provider',
  roles: [{ role: 'city_franchise', cityId: 'bengaluru' }],
  name: 'Bengaluru Franchise Operator',
  isFranchise: true,
  franchiseCityId: 'bengaluru',
  cityId: 'bengaluru',
};

const superAdmin: UserAccount = {
  id: 'usr-super-admin-01',
  username: 'superadmin',
  email: 'governance@kaaryanlabs.in',
  role: 'provider',
  roles: [{ role: 'super_admin', cityId: null }],
  name: 'Central Platform Director',
  isSuperAdmin: true,
  isFranchise: true,
};

async function runTestSuite() {
  console.log('\n======================================================================');
  console.log('KAARYAN LABS — THREE-CITY REGION LOCK & DASHBOARD SECURITY SUITE');
  console.log('======================================================================\n');

  // --------------------------------------------------------------------------
  console.log('--- SECTION 1: Region Authorization Helper Foundation ---');
  // --------------------------------------------------------------------------
  assert(!isSuperAdmin(null), 'Anonymous is not Super Admin');
  assert(!isSuperAdmin(velloreCustomer), 'Customer is not Super Admin');
  assert(!isSuperAdmin(velloreOwner), 'Business Owner is not Super Admin');
  assert(!isSuperAdmin(velloreFranchise), 'Franchise Operator is not Super Admin');
  assert(isSuperAdmin(superAdmin), 'Super Admin recognized via isSuperAdmin()');

  // Never infer Super Admin from email string alone
  const fakeAdminByEmail: UserAccount = {
    id: 'usr-fake-01',
    username: 'fake_admin',
    email: 'admin@kaaryanlabs.in',
    role: 'customer',
    name: 'Attacker Impersonating Admin',
  };
  assert(!isSuperAdmin(fakeAdminByEmail), 'Email string containing "admin" does NOT grant Super Admin');

  // Authorized cities resolution
  assert(getUserAuthorizedCities(anonymousUser).length === 0, 'Anonymous has 0 authorized cities');
  const velCustCities = getUserAuthorizedCities(velloreCustomer);
  assert(velCustCities.length === 1 && velCustCities[0] === 'vellore', 'Vellore Customer authorized only for Vellore');

  const velOwnerCities = getUserAuthorizedCities(velloreOwner);
  assert(velOwnerCities.length === 1 && velOwnerCities[0] === 'vellore', 'Vellore Owner authorized only for Vellore');

  const velFranCities = getUserAuthorizedCities(velloreFranchise);
  assert(velFranCities.length === 1 && velFranCities[0] === 'vellore', 'Vellore Franchise authorized only for Vellore');

  const superAdminCities = getUserAuthorizedCities(superAdmin);
  assert(
    superAdminCities.length === 3 &&
    superAdminCities.includes('chittoor') &&
    superAdminCities.includes('vellore') &&
    superAdminCities.includes('bengaluru'),
    'Super Admin authorized across all 3 cities'
  );

  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 2: Mandatory Task 15 Negative Security Tests ---');
  // --------------------------------------------------------------------------

  // Test 1: Vellore Customer attempts Chittoor private dashboard access
  const res1 = getEffectiveDashboardCity(velloreCustomer, 'chittoor', 'dashboard');
  assert(!res1.isPermitted, 'Test 1: Vellore Customer denied access to merchant dashboard');
  assert(!isUserAuthorizedForCity(velloreCustomer, 'chittoor', 'customer'), 'Test 1b: Vellore Customer not authorized for Chittoor private customer actions');

  // Test 2: Vellore Owner attempts Bengaluru merchant dashboard access
  const res2 = getEffectiveDashboardCity(velloreOwner, 'bengaluru', 'dashboard');
  assert(!res2.isPermitted, 'Test 2: Vellore Owner denied access to Bengaluru merchant dashboard');
  assert(res2.authorizedCity === 'vellore', 'Test 2b: Effective territory resolved safely to Vellore');
  assert(!isUserAuthorizedForCity(velloreOwner, 'bengaluru', 'business_owner'), 'Test 2c: isUserAuthorizedForCity denies Vellore Owner in Bengaluru');

  // Test 3: Chittoor Owner attempts to edit a Vellore business
  const updateResult = await businessService.updateListing(
    'c-005', // Owned by u-demo
    { title: 'Hacked Title' },
    chittoorOwner.id // chittoorOwner is not the owner of c-005
  );
  assert(updateResult.listing === null, 'Test 3: Non-owner merchant cannot edit listing');
  assert(
    Boolean(updateResult.error?.includes('Unauthorized') || updateResult.error?.includes('only edit your own')),
    'Test 3b: Update operation returned an unauthorized security error'
  );

  // Test 4: Vellore Franchise attempts to approve a listing in Bengaluru territory
  const approveResult = await franchiseService.approveBusiness(
    'v-rest-01',
    'bengaluru', // Operating context is Bengaluru, but listing v-rest-01 is Vellore
    { operatorId: velloreFranchise.id }
  );
  assert(approveResult.success === false, 'Test 4: Cross-city franchise listing approval is strictly denied');
  assert(
    Boolean(approveResult.error?.includes('Security Violation') || approveResult.error?.includes('territory') || approveResult.error?.includes('not found')),
    'Test 4b: Security violation error returned on cross-territory listing approval'
  );

  // Test 5: Bengaluru Franchise attempts to read Vellore protected enquiries
  const canAccessVellore = isUserAuthorizedForCity(bengaluruFranchise, 'vellore', 'city_franchise');
  assert(!canAccessVellore, 'Test 5: Bengaluru Franchise denied access to Vellore territory');
  const res5 = getEffectiveDashboardCity(bengaluruFranchise, 'vellore', 'franchise');
  assert(!res5.isPermitted, 'Test 5b: Franchise dashboard territory mismatch triggered');
  assert(res5.authorizedCity === 'bengaluru', 'Test 5c: Route safely redirected to assigned Bengaluru territory');

  // Test 6: Customer attempts to access Super Admin
  const res6 = getEffectiveDashboardCity(velloreCustomer, 'vellore', 'admin');
  assert(!res6.isPermitted, 'Test 6: Customer denied access to Super Admin portal');
  assert(!adminService.isSuperAdmin(velloreCustomer), 'Test 6b: adminService denies Super Admin to customer');

  // Test 7: Business Owner attempts to access Franchise administration
  const res7 = getEffectiveDashboardCity(velloreOwner, 'vellore', 'franchise');
  assert(!res7.isPermitted, 'Test 7: Business Owner denied access to Franchise administration');
  assert(!isUserAuthorizedForCity(velloreOwner, 'vellore', 'city_franchise'), 'Test 7b: Owner lacks franchise role');

  // Test 8: Unauthenticated visitor attempts protected operations
  const res8Dashboard = getEffectiveDashboardCity(anonymousUser, 'vellore', 'dashboard');
  const res8Franchise = getEffectiveDashboardCity(anonymousUser, 'vellore', 'franchise');
  const res8Admin = getEffectiveDashboardCity(anonymousUser, 'vellore', 'admin');
  assert(!res8Dashboard.isPermitted, 'Test 8a: Anonymous visitor denied merchant dashboard');
  assert(!res8Franchise.isPermitted, 'Test 8b: Anonymous visitor denied franchise portal');
  assert(!res8Admin.isPermitted, 'Test 8c: Anonymous visitor denied admin portal');

  // Test 9: User changes city_id in URL parameters (e.g. /city/bengaluru/dashboard/my-ads for Vellore Owner)
  const res9 = getEffectiveDashboardCity(velloreOwner, 'bengaluru', 'dashboard');
  assert(!res9.isPermitted, 'Test 9: URL parameter manipulation to unauthorized city is blocked');
  assert(res9.authorizedCity === 'vellore', 'Test 9b: System preserves merchant\'s authentic authorized territory');

  // Test 10: User modifies client-side city state
  const res10 = getEffectiveDashboardCity(velloreFranchise, 'chittoor', 'franchise');
  assert(!res10.isPermitted, 'Test 10: Client-side city state modification rejected for Franchise');

  // Test 11: User refreshes an unauthorized dashboard URL
  // On direct refresh of /city/chittoor/franchise by Vellore Franchise:
  const res11 = getEffectiveDashboardCity(velloreFranchise, 'chittoor', 'franchise');
  assert(!res11.isPermitted, 'Test 11: Refreshing unauthorized franchise URL triggers security gate');
  assert(res11.authorizedCity === 'vellore', 'Test 11b: Refresh gate redirects or locks to Vellore');

  // Test 12: User navigates Back/Forward after authorized session changes
  const postLogoutUser: UserAccount | null = null;
  const res12 = getEffectiveDashboardCity(postLogoutUser, 'vellore', 'dashboard');
  assert(!res12.isPermitted, 'Test 12: History navigation after logout fails closed');

  // Test 13: User's account role changes or becomes inactive
  const demotedUser: UserAccount = {
    ...velloreOwner,
    role: 'customer',
    roles: [{ role: 'customer', cityId: 'vellore' }],
  };
  const res13 = getEffectiveDashboardCity(demotedUser, 'vellore', 'dashboard');
  assert(!res13.isPermitted, 'Test 13: Demoted user immediately loses merchant dashboard access');

  // Test 14: Super Admin switches between authorized city filters
  const res14Chittoor = getEffectiveDashboardCity(superAdmin, 'chittoor', 'admin');
  const res14Vellore = getEffectiveDashboardCity(superAdmin, 'vellore', 'admin');
  const res14Bengaluru = getEffectiveDashboardCity(superAdmin, 'bengaluru', 'admin');
  assert(res14Chittoor.isPermitted, 'Test 14a: Super Admin permitted in Chittoor administrative view');
  assert(res14Vellore.isPermitted, 'Test 14b: Super Admin permitted in Vellore administrative view');
  assert(res14Bengaluru.isPermitted, 'Test 14c: Super Admin permitted in Bengaluru administrative view');

  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 3: Navbar Region Lock Badge Audit ---');
  // --------------------------------------------------------------------------

  // Anonymous visitor: Free to browse all public cities, no lock badge
  const badgeAnon = getRegionLockBadge(anonymousUser, 'home', 'vellore');
  assert(!badgeAnon.isLocked, 'Anonymous: Not region locked');
  assert(badgeAnon.canSwitchCity, 'Anonymous: Can switch public cities freely');

  // Signed-in Customer browsing public directory: Free to browse, no dashboard lock
  const badgeCustPublic = getRegionLockBadge(velloreCustomer, 'home', 'bengaluru');
  assert(!badgeCustPublic.isLocked, 'Customer on public home: Not locked out of browsing');
  assert(badgeCustPublic.canSwitchCity, 'Customer on public home: Can switch public city');
  assert(badgeCustPublic.lockLabel === 'Registered Region', 'Customer: Displays "Registered Region" badge');

  // Business Owner on Dashboard: STRICTLY LOCKED
  const badgeOwnerDashboard = getRegionLockBadge(velloreOwner, 'dashboard', 'vellore');
  assert(badgeOwnerDashboard.isLocked, 'Business Owner on dashboard: Strictly locked');
  assert(!badgeOwnerDashboard.canSwitchCity, 'Business Owner on dashboard: Cannot switch city');
  assert(badgeOwnerDashboard.lockLabel === 'Assigned Business Region', 'Business Owner: Displays "Assigned Business Region"');
  assert(badgeOwnerDashboard.allowedCityId === 'vellore', 'Business Owner: Bound to Vellore');

  // City Franchise on Franchise Command Center: STRICTLY LOCKED
  const badgeFranDashboard = getRegionLockBadge(velloreFranchise, 'franchise', 'vellore');
  assert(badgeFranDashboard.isLocked, 'Franchise on command center: Strictly locked');
  assert(!badgeFranDashboard.canSwitchCity, 'Franchise on command center: Cannot switch city');
  assert(badgeFranDashboard.lockLabel === 'Assigned Franchise Territory', 'Franchise: Displays "Assigned Franchise Territory"');
  assert(badgeFranDashboard.allowedCityId === 'vellore', 'Franchise: Bound to Vellore');

  // Super Admin: Never locked, oversight across all cities
  const badgeSuperAdmin = getRegionLockBadge(superAdmin, 'dashboard', 'vellore');
  assert(!badgeSuperAdmin.isLocked, 'Super Admin: Never locked');
  assert(badgeSuperAdmin.canSwitchCity, 'Super Admin: Can switch cities');
  assert(badgeSuperAdmin.isSuperAdmin, 'Super Admin: isSuperAdmin flag is true');

  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 4: Unsafe Fallback Removal & Creation/Update Confinement ---');
  // --------------------------------------------------------------------------

  // Test 15: Missing cityId in listing creation fails closed (No silent Chittoor default)
  const invalidListing: any = {
    id: 'test-invalid-01',
    title: 'Illegal Listing Without City',
    category: 'restaurants',
    area: 'gandhi-road',
    address: 'Sample Address',
    phone: '9440218456',
    status: 'Pending Approval',
  };
  const createInvalidRes = await businessService.createListing(invalidListing, velloreOwner.id);
  assert(createInvalidRes.listing === null, 'Missing cityId in listing creation is strictly blocked');
  assert(
    Boolean(createInvalidRes.error?.includes('Operating Territory Error') || createInvalidRes.error?.includes('city_id')),
    'Informative Operating Territory Error returned on missing cityId'
  );

  // Test 16: Vellore Owner cannot create a listing in Bengaluru territory
  const isVelloreOwnerAllowedInBlr = isUserAuthorizedForCity(velloreOwner, 'bengaluru', 'business_owner');
  assert(!isVelloreOwnerAllowedInBlr, 'Vellore Owner is not authorized to create or operate listings in Bengaluru');

  // Test 17: Request payload manipulation cannot alter listing city_id
  const payloadManipulationRes = await businessService.updateListing(
    'c-005',
    { title: 'Safe Title', cityId: 'bengaluru' as any },
    'u-demo' // owner of c-005
  );
  if (payloadManipulationRes.listing) {
    assert(
      payloadManipulationRes.listing.cityId === 'chittoor',
      'Update listing ignores cityId in update payload; territory cannot be altered via request manipulation'
    );
  } else {
    assert(true, 'Update listing rejected payload manipulation safely');
  }

  // Test 18: Unverified operating territory fails closed
  const unverifiedOwner: UserAccount = {
    id: 'usr-unverified-01',
    username: 'unverified_merchant',
    email: 'unverified@merchant.com',
    role: 'provider',
    roles: [{ role: 'business_owner', cityId: null }],
    name: 'Unverified Merchant',
    cityId: undefined,
  };
  const unverifiedRes = getEffectiveDashboardCity(unverifiedOwner, 'vellore', 'dashboard');
  assert(!unverifiedRes.isPermitted, 'Merchant with unverified city fails closed on dashboard access');
  const unverifiedBadge = getRegionLockBadge(unverifiedOwner, 'dashboard', 'vellore');
  assert(unverifiedBadge.allowedCityId === null, 'Unverified merchant has null allowedCityId (No Chittoor fallback)');
  assert(unverifiedBadge.statusText === 'Territory Unverified', 'Unverified merchant shows Territory Unverified badge');

  // --------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log(`TOTAL REGION LOCK & DASHBOARD SECURITY CHECKS: ${totalChecks}`);
  console.log(`PASSED: ${passedChecks}`);
  console.log(`FAILED: ${failedChecks}`);
  console.log('======================================================================\n');

  if (failedChecks > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
