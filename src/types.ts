import { SupportedLanguage } from './i18n/translations';

export type CityId = 'chittoor' | 'vellore' | 'bengaluru';

export interface CityTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
}

export interface CityGridItem {
  id: string;
  name: string;
  image: string;
  count: number;
  tagline: string;
}

export interface HeroBannerConfig {
  id: string;
  image: string;
  title: string;
  tag: string;
  category: string;
}

export interface CityConfig {
  id: CityId;
  name: string;
  nameNative: string;
  brandName: string;
  brandSuffix: string;
  code: string; // e.g. AP-03, TN-23, KA-01
  tagline: string;
  state: string;
  domain: string;
  primaryLanguage: SupportedLanguage;
  supportedLanguages: SupportedLanguage[];
  theme: CityTheme;
  localities: Area[];
  cityGrid: CityGridItem[];
  heroBanners: HeroBannerConfig[];
  contact: {
    address: string;
    phone: string;
    email: string;
  };
  seo: {
    title: string;
    description: string;
  };
  features: {
    hasKanipakamSpecial: boolean;
    landmark: string;
    heroHeadingMain: string;
    heroHeadingHighlight: string;
  };
  stats: {
    totalListingsCount: number;
    activeLocalitiesCount: number;
  };
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase?: boolean;
  title?: string;
  userEmail?: string;
  userMobile?: string;
  subRatings?: {
    serviceQuality: number;
    valueForMoney: number;
    cleanliness: number;
  };
  photos?: string[];
  helpfulCount?: number;
  unhelpfulCount?: number;
  ownerResponse?: {
    text: string;
    date: string;
    responder: string;
  };
}

export interface Listing {
  id: string;
  cityId?: CityId; // City scoping
  title: string;
  category: string;
  area: string;
  address: string;
  phone: string;
  whatsapp?: string;
  description: string;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  isFeatured?: boolean;
  priceRange?: string;
  services: string[];
  timings: string;
  images: string[];
  reviews: Review[];
  postedDate: string;
  badge?: string;
  email?: string;
  status?: 'Active' | 'Pending Approval' | 'Expired';
  viewsCount?: number;
  postedByUser?: string;
}

export interface Category {
  id: string;
  name: string;
  nameTe: string; // Telugu translation
  nameTa?: string; // Tamil translation
  nameKn?: string; // Kannada translation
  icon: string;
  description: string;
  count: number;
  image?: string;
  iconBg?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  role: 'provider' | 'customer';
  name: string;
  mobile?: string;
  cityId?: CityId;
}

export interface Area {
  id: string;
  cityId?: CityId;
  name: string;
  landmark: string;
}

export interface ClassifiedItem {
  id: string;
  cityId?: CityId;
  title: string;
  category: string;
  price: string;
  condition: string;
  location: string;
  phone: string;
  whatsapp?: string;
  date: string;
  image: string;
  description: string;
  postedBy: string;
}

export interface EmergencyContact {
  id: string;
  cityId?: CityId;
  name: string;
  teluguName: string;
  phone: string;
  category: string;
  description: string;
  available247: boolean;
  address?: string;
}
