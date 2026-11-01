import { CityId } from '../types';
import { CITIES, DEFAULT_CITY_ID, isCityId } from '../config/cities';

export interface ParsedCityRoute {
  cityId: CityId;
  tab: 'home' | 'category' | 'classifieds' | 'kanipakam' | 'dashboard';
  categoryId: string;
  savedOnly: boolean;
  listingId: string | null;
  searchQuery: string;
  selectedArea: string;
  verifiedOnly: boolean;
  minRating: number;
  sortBy: 'rating' | 'popular' | 'latest';
  isCityDomain: boolean;
}

/**
 * Maps known production domain names to their respective city IDs.
 */
export function resolveCityFromHostname(hostname: string): CityId | null {
  const host = hostname.toLowerCase().split(':')[0]; // strip port
  if (host === 'chittoorads.com' || host === 'www.chittoorads.com') return 'chittoor';
  if (host === 'velloreads.com' || host === 'www.velloreads.com') return 'vellore';
  if (host === 'bengaluruads.com' || host === 'www.bengaluruads.com') return 'bengaluru';
  return null;
}

/**
 * Checks if current pathname has a /city/:cityId prefix.
 */
export function resolveCityFromPath(pathname: string): { cityId: CityId | null; subpath: string } {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const match = clean.match(/^\/city\/([a-zA-Z0-9_-]+)(\/.*)?$/);
  if (match) {
    const rawCity = match[1].toLowerCase();
    const subpath = match[2] || '/';
    if (isCityId(rawCity)) {
      return { cityId: rawCity, subpath };
    }
  }
  return { cityId: null, subpath: clean };
}

/**
 * Resolves the active city ID given current URL pathname and hostname.
 */
export function resolveCurrentCity(pathname: string, hostname: string = window.location.hostname): CityId {
  // 1. Path override takes priority (allows previewing any city on any domain/dev server)
  const pathResult = resolveCityFromPath(pathname);
  if (pathResult.cityId) {
    return pathResult.cityId;
  }

  // 2. Domain matching
  const domainCity = resolveCityFromHostname(hostname);
  if (domainCity) {
    return domainCity;
  }

  // 3. Fallback to default city (Chittoor)
  return DEFAULT_CITY_ID;
}

/**
 * Parses full URL into structured city route state.
 */
export function parseCityRoute(
  pathname: string = window.location.pathname,
  search: string = window.location.search,
  hostname: string = window.location.hostname
): ParsedCityRoute {
  const domainCity = resolveCityFromHostname(hostname);
  const isCityDomain = domainCity !== null;
  const pathResult = resolveCityFromPath(pathname);
  
  // Determine city: path prefix override > domain > default
  const cityId: CityId = pathResult.cityId || domainCity || DEFAULT_CITY_ID;
  const effectiveSubpath = pathResult.cityId ? pathResult.subpath : pathname.replace(/\/+$/, '') || '/';
  
  const params = new URLSearchParams(search);

  // Tab & category extraction
  const categoryMatch = effectiveSubpath.match(/^\/category(?:\/([^/]+))?$/);
  const isCategory = Boolean(categoryMatch) || effectiveSubpath === '/category';
  const rawCatId = categoryMatch?.[1];

  let tab: ParsedCityRoute['tab'] = 'home';
  if (isCategory) {
    tab = 'category';
  } else if (effectiveSubpath === '/dashboard' || effectiveSubpath === '/dashboard/my-ads') {
    tab = 'dashboard';
  } else if (effectiveSubpath === '/classifieds') {
    tab = 'classifieds';
  } else if (effectiveSubpath === '/kanipakam') {
    tab = 'kanipakam';
  }

  const categoryId = rawCatId || 'all';
  const savedOnly = tab === 'category' && params.get('saved') === '1';
  const listingId = params.get('listing');
  const sort = params.get('sort');

  const cityConfig = CITIES[cityId] || CITIES[DEFAULT_CITY_ID];
  const area = params.get('area');
  const validArea = area && cityConfig.localities.some((a) => a.id === area) ? area : 'all';

  return {
    cityId,
    tab,
    categoryId,
    savedOnly,
    listingId,
    searchQuery: params.get('q') || '',
    selectedArea: validArea,
    verifiedOnly: params.get('verified') === '1',
    minRating: params.get('rating') === '4' ? 4 : 0,
    sortBy: sort === 'popular' || sort === 'latest' ? sort : 'rating',
    isCityDomain,
  };
}

/**
 * Builds canonical URL for a city route.
 */
export function buildCityRouteUrl(
  cityId: CityId,
  tab: ParsedCityRoute['tab'],
  categoryId: string = 'all',
  filters?: {
    searchQuery?: string;
    selectedArea?: string;
    verifiedOnly?: boolean;
    minRating?: number;
    sortBy?: string;
    savedOnly?: boolean;
    listingId?: string | null;
  },
  hostname: string = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
): string {
  const domainCity = resolveCityFromHostname(hostname);
  const isCityDomain = domainCity === cityId;

  // Base path prefix:
  // On custom city domain: / or /category/...
  // On preview/dev:
  // - If chittoor and at root without /city prefix, can stay /
  // - If vellore or bengaluru, always use /city/vellore or /city/bengaluru
  const prefix = isCityDomain ? '' : `/city/${cityId}`;

  let path = '';
  if (tab === 'home') {
    path = prefix || '/';
  } else if (tab === 'category') {
    path = `${prefix}/category/${categoryId}`;
  } else if (tab === 'dashboard') {
    path = `${prefix}/dashboard/my-ads`;
  } else if (tab === 'classifieds') {
    path = `${prefix}/classifieds`;
  } else if (tab === 'kanipakam') {
    path = `${prefix}/kanipakam`;
  } else {
    path = prefix || '/';
  }

  // Ensure path doesn't end with double slash or start without slash
  path = path.replace(/\/+/g, '/');
  if (!path.startsWith('/')) path = '/' + path;

  const params = new URLSearchParams();
  if (tab === 'category' && filters) {
    if (filters.searchQuery) params.set('q', filters.searchQuery);
    if (filters.selectedArea && filters.selectedArea !== 'all') params.set('area', filters.selectedArea);
    if (filters.verifiedOnly) params.set('verified', '1');
    if (filters.minRating) params.set('rating', String(filters.minRating));
    if (filters.sortBy && filters.sortBy !== 'rating') params.set('sort', filters.sortBy);
    if (filters.savedOnly) params.set('saved', '1');
  }
  if (filters?.listingId) {
    params.set('listing', filters.listingId);
  }

  return path + (params.size ? `?${params.toString()}` : '');
}

