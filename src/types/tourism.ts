import { CityId } from '../types';

/**
 * Standard Tourism Categories for Vellore (TN-23)
 */
export type TourismCategory =
  | 'historic_fort'
  | 'pilgrimage_temple'
  | 'nature_hills'
  | 'colonial_heritage'
  | 'museums_culture'
  | 'medical_institutional';

/**
 * Metadata definition for each tourism category
 */
export interface TourismCategoryDefinition {
  id: TourismCategory;
  label: string;
  labelNative: string; // Tamil display label
  description: string;
  iconName: string;
  themeColor: string; // Tailwind color class or hex
}

/**
 * Tourism Image reference with verification & attribution metadata
 */
export interface TourismImage {
  url: string;
  alt: string;
  caption?: string;
  isHero?: boolean;
  isStockPhoto: boolean;
  credit?: string;
}

/**
 * Geographic and transit location information
 */
export interface TourismLocation {
  locality: string; // e.g. 'Bazaar Area', 'Thirumalaikodi', 'Otteri'
  address?: string;
  distanceFromCenter: string; // e.g. 'City Center (Bazaar Area)', '8 km from Vellore'
  latitude?: number;
  longitude?: number;
  directionsUrl: string; // Direct Google Maps navigation URL
  nearestTransit?: {
    railwayStation?: string; // e.g. 'Katpadi Junction (6.5 km)'
    busStand?: string; // e.g. 'Vellore Old Bus Stand (1.2 km)'
    airport?: string; // e.g. 'Chennai International Airport (130 km)'
  };
}

/**
 * Practical visitor guidance & regulatory rules
 */
export interface TourismVisitorInfo {
  timings: string; // e.g. 'Daily: 8:00 AM - 6:00 PM'
  timingNotes?: string;
  entryFeeType: 'free' | 'paid' | 'partially_paid' | 'unverified';
  entryFeeDetails?: string;
  photographyRules?: 'allowed' | 'restricted' | 'prohibited' | 'unverified';
  photographyNotes?: string;
  dressCode?: string;
  accessibility?: string;
  parkingAvailable?: 'yes' | 'no' | 'limited' | 'unverified';
  parkingNotes?: string;
  recommendedDuration?: string;
  visitorNotes?: string;
  bestTimeToVisit?: string;
}

/**
 * Content authenticity status
 */
export type ContentVerificationStatus =
  | 'verified'          // Verified against official circulars, ASI gazetteers or official trust sources
  | 'partially_verified'// Identity & location verified; secondary details (e.g. festival hours) approximate
  | 'unverified';       // Community report or preliminary research

/**
 * Publication lifecycle status
 */
export type TourismPublicationStatus =
  | 'published' // Publicly visible on platform
  | 'draft'     // Internal research backlog, hidden from public listings
  | 'archived';  // Historical or temporarily inaccessible

/**
 * Core Tourism Attraction Entity
 */
export interface TourismAttraction {
  id: string; // Stable internal identifier, e.g. 'vel-att-fort'
  slug: string; // URL-safe identifier, e.g. 'vellore-fort-and-moat'
  cityId: CityId; // Strictly 'vellore'
  title: string;
  nameNative: string; // Tamil title, e.g. 'வேலூர் கோட்டை'
  shortDescription: string; // Tagline / preview summary
  fullDescription: string;
  category: TourismCategory;
  categoryLabel?: string;
  location: TourismLocation;
  images: TourismImage[];
  heroImage: string; // Primary image URL for cards & header banners
  historicalHighlights: string[];
  historicalEra?: string; // e.g. '16th Century Vijayanagara Empire'
  architecturalStyle?: string; // e.g. 'Dravidian Granite Military Architecture'
  visitorInformation: TourismVisitorInfo;
  clinicalVisitorNotice?: string; // Special disclaimer for hospital heritage sites (CMC)
  officialWebsite?: string;
  sourceReferences: string[]; // Authoritative citations (ASI, HR&CE, TTDC, etc.)
  verificationDate?: string; // Sourced verification date, e.g. '2026-11-13'
  contentVerificationStatus: ContentVerificationStatus;
  publicationStatus: TourismPublicationStatus;
  isFeatured: boolean;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

/**
 * Dynamic category with real record counts
 */
export interface TourismCategoryWithCount {
  category: TourismCategoryDefinition;
  count: number;
}

/**
 * Filter state for tourism browsing interfaces
 */
export interface TourismFilterState {
  category: TourismCategory | 'all';
  searchQuery: string;
  locality?: string;
  featuredOnly?: boolean;
  verifiedOnly?: boolean;
  sortBy?: 'popular' | 'distance' | 'title';
}

/**
 * Search options for querying the service layer
 */
export interface TourismSearchOptions {
  category?: TourismCategory | 'all';
  locality?: string;
  featuredOnly?: boolean;
  verifiedOnly?: boolean;
  limit?: number;
  offset?: number;
}
