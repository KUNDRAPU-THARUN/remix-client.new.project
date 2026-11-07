import { CityId, UserAccount, UserRoleType } from '../types';
import { SUPPORTED_CITY_IDS } from '../config/cities';

/**
 * Checks whether the given user has verified Super Admin privileges.
 * Super Admin status is granted strictly through database-verified roles or flags,
 * never by email-string matching or client-side UI selections.
 */
export function isSuperAdmin(user: UserAccount | null): boolean {
  if (!user) return false;
  if (user.isSuperAdmin === true) return true;
  if (Array.isArray(user.roles) && user.roles.some((r) => r.role === 'super_admin')) {
    return true;
  }
  return false;
}

/**
 * Returns the list of CityIds that the user is authorized to manage or operate within.
 * - Anonymous visitors: [] (no private permissions)
 * - Super Admin: all supported cities ['chittoor', 'vellore', 'bengaluru']
 * - City Franchise: only assigned franchise territory
 * - Business Owner: only assigned business city/cities
 * - Customer: registered city (for private account actions)
 */
export function getUserAuthorizedCities(user: UserAccount | null, roleFilter?: UserRoleType): CityId[] {
  if (!user) return [];
  if (isSuperAdmin(user)) {
    return [...SUPPORTED_CITY_IDS];
  }

  const authorized = new Set<CityId>();

  if (Array.isArray(user.roles)) {
    for (const r of user.roles) {
      if (roleFilter && r.role !== roleFilter) continue;
      if (r.cityId && SUPPORTED_CITY_IDS.includes(r.cityId)) {
        authorized.add(r.cityId);
      }
    }
  }

  // Also include franchise territory if checking franchise role or no filter
  if (!roleFilter || roleFilter === 'city_franchise') {
    if (user.isFranchise && user.franchiseCityId && SUPPORTED_CITY_IDS.includes(user.franchiseCityId)) {
      authorized.add(user.franchiseCityId);
    }
  }

  // Also include assigned account cityId if checking merchant or customer
  if (!roleFilter || roleFilter === 'business_owner' || roleFilter === 'customer') {
    if (user.cityId && SUPPORTED_CITY_IDS.includes(user.cityId)) {
      authorized.add(user.cityId);
    }
  }

  return Array.from(authorized);
}

/**
 * Verifies if the user is authorized for a specific city and optional role.
 * Fails closed if session or role cannot be verified.
 */
export function isUserAuthorizedForCity(
  user: UserAccount | null,
  targetCityId: CityId,
  requiredRole?: UserRoleType
): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;

  if (requiredRole === 'super_admin') {
    return false; // Handled by isSuperAdmin check above
  }

  if (requiredRole === 'city_franchise') {
    if (user.isFranchise && user.franchiseCityId === targetCityId) return true;
    if (Array.isArray(user.roles)) {
      return user.roles.some((r) => r.role === 'city_franchise' && r.cityId === targetCityId);
    }
    return false;
  }

  if (requiredRole === 'business_owner') {
    const hasOwnerRole =
      user.role === 'provider' ||
      (Array.isArray(user.roles) && user.roles.some((r) => r.role === 'business_owner'));
    if (!hasOwnerRole) return false;

    // Authorized city check
    if (user.cityId && user.cityId === targetCityId) return true;
    if (Array.isArray(user.roles)) {
      return user.roles.some((r) => r.role === 'business_owner' && r.cityId === targetCityId);
    }
    return false;
  }

  if (requiredRole === 'customer') {
    return user.cityId === targetCityId;
  }

  const cities = getUserAuthorizedCities(user);
  return cities.includes(targetCityId);
}

export interface DashboardCityResolution {
  authorizedCity: CityId;
  isPermitted: boolean;
  reason?: string;
}

/**
 * Resolves the effective operational territory for protected dashboard routes.
 * Prevents unauthorized cross-city access or URL parameter tampering.
 */
export function getEffectiveDashboardCity(
  user: UserAccount | null,
  requestedCityId: CityId,
  context: 'franchise' | 'dashboard' | 'admin'
): DashboardCityResolution {
  if (context === 'admin') {
    if (isSuperAdmin(user)) {
      return { authorizedCity: requestedCityId, isPermitted: true };
    }
    return {
      authorizedCity: requestedCityId,
      isPermitted: false,
      reason: 'Super Admin central administrative access required.',
    };
  }

  if (context === 'franchise') {
    if (isSuperAdmin(user)) {
      return { authorizedCity: requestedCityId, isPermitted: true };
    }
    if (!user || (!user.isFranchise && !user.roles?.some((r) => r.role === 'city_franchise'))) {
      return {
        authorizedCity: requestedCityId,
        isPermitted: false,
        reason: 'City Franchise Partner authentication required.',
      };
    }
    const franchiseCity = user.franchiseCityId || user.roles?.find((r) => r.role === 'city_franchise')?.cityId;
    if (franchiseCity && franchiseCity !== requestedCityId) {
      return {
        authorizedCity: franchiseCity,
        isPermitted: false,
        reason: `Territory mismatch: Your franchise credentials are valid for ${franchiseCity.toUpperCase()}, not ${requestedCityId.toUpperCase()}.`,
      };
    }
    return { authorizedCity: requestedCityId, isPermitted: true };
  }

  if (context === 'dashboard') {
    if (isSuperAdmin(user)) {
      return { authorizedCity: requestedCityId, isPermitted: true };
    }
    if (!user) {
      return {
        authorizedCity: requestedCityId,
        isPermitted: false,
        reason: 'Business Owner authentication required.',
      };
    }
    const hasMerchantRole =
      user.role === 'provider' ||
      (Array.isArray(user.roles) && user.roles.some((r) => r.role === 'business_owner'));
    if (!hasMerchantRole || user.role === 'customer') {
      return {
        authorizedCity: requestedCityId,
        isPermitted: false,
        reason: 'Customer account cannot access Business Owner operations.',
      };
    }
    const merchantCity = user.cityId || user.roles?.find((r) => r.role === 'business_owner')?.cityId;
    if (!merchantCity) {
      return {
        authorizedCity: requestedCityId,
        isPermitted: false,
        reason: 'Operating territory unverified: Merchant account lacks an authorized operational city assignment.',
      };
    }
    if (merchantCity !== requestedCityId) {
      return {
        authorizedCity: merchantCity,
        isPermitted: false,
        reason: `Operating region mismatch: Your merchant account is assigned to ${merchantCity.toUpperCase()}.`,
      };
    }
    return { authorizedCity: requestedCityId, isPermitted: true };
  }

  return { authorizedCity: requestedCityId, isPermitted: true };
}

export interface RegionLockBadgeInfo {
  isLocked: boolean;
  lockLabel: string;
  allowedCityId: CityId | null;
  statusText: string;
  isSuperAdmin: boolean;
  canSwitchCity: boolean;
}

/**
 * Calculates region lock UI badge state for Navbar and headers.
 * Under Strict City Lock:
 * - Anonymous: can switch public cities freely.
 * - Super Admin: global access, can switch cities freely across all views.
 * - City-scoped authenticated accounts (Customer, Business Owner, City Franchise):
 *   Strictly locked to their database-authorized city across ALL tabs and pages.
 *   They cannot switch cities while logged in; they must sign out first.
 */
export function getRegionLockBadge(
  user: UserAccount | null,
  activeTab: string,
  currentCityId: CityId
): RegionLockBadgeInfo {
  if (!user) {
    return {
      isLocked: false,
      lockLabel: 'Public Directory',
      allowedCityId: null,
      statusText: 'Multi-City Network',
      isSuperAdmin: false,
      canSwitchCity: true,
    };
  }

  if (isSuperAdmin(user)) {
    return {
      isLocked: false,
      lockLabel: 'Super Admin Portal',
      allowedCityId: null,
      statusText: 'All Cities Oversight',
      isSuperAdmin: true,
      canSwitchCity: true,
    };
  }

  // Determine authorized territory from authentic account data
  const franchiseCity =
    user.franchiseCityId ||
    user.roles?.find((r) => r.role === 'city_franchise')?.cityId ||
    null;
  const merchantCity =
    user.cityId ||
    user.roles?.find((r) => r.role === 'business_owner')?.cityId ||
    null;
  const customerCity =
    user.cityId ||
    user.roles?.find((r) => r.role === 'customer')?.cityId ||
    null;

  const isFranchiseRole = Boolean(
    user.isFranchise || user.roles?.some((r) => r.role === 'city_franchise')
  );
  const isOwnerRole = Boolean(
    user.role === 'provider' || user.roles?.some((r) => r.role === 'business_owner')
  );

  const allowedCityId = isFranchiseRole
    ? franchiseCity
    : isOwnerRole
    ? merchantCity
    : customerCity;

  let lockLabel = 'Registered City';
  let statusText = 'Account City';

  if (isFranchiseRole) {
    lockLabel = allowedCityId ? 'Assigned Franchise Territory' : 'Territory Unverified';
    statusText = allowedCityId ? 'Franchise Territory' : 'Territory Unverified';
  } else if (isOwnerRole) {
    lockLabel = allowedCityId ? 'Assigned Business Region' : 'Territory Unverified';
    statusText = allowedCityId ? 'Business Region' : 'Territory Unverified';
  } else {
    lockLabel = allowedCityId ? 'Registered City' : 'Territory Unverified';
    statusText = allowedCityId ? 'Account City' : 'Territory Unverified';
  }

  return {
    isLocked: true,
    lockLabel,
    allowedCityId,
    statusText,
    isSuperAdmin: false,
    canSwitchCity: false,
  };
}

