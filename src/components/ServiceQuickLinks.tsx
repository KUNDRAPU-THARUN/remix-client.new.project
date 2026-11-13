import React from 'react';
import {
  Sparkles,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';
import { CityConfig, CityId } from '../types';

export interface ServiceQuickLinksProps {
  currentCity: CityConfig;
  onSelectCategory: (categoryId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export type IconComponent = React.ComponentType<{ className?: string }> | LucideIcon;

export interface QuickServiceItem {
  id: string;
  label: string;
  icon: IconComponent;
  bgColor: string;
  textColor: string;
  borderColor: string;
  hoverBg: string;
  category?: string;
  targetTab?: 'classifieds' | 'kanipakam';
  targetSection?: string;
  categoryByCity?: Partial<Record<CityId, string>>;
  defaultCategory?: string;
}

/* ============================================================================
   PREMIUM BESPOKE SERVICE ILLUSTRATIONS (High-Quality Duotone SVG System)
   Inspired by modern marketplace platforms (Magicpin / Quickix).
   Features scalable vector geometry, duotone body fills, crisp foreground lines.
   ============================================================================ */

export const ShoppingIllustration: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M8 15C8 13.3431 9.34315 12 11 12H29C30.6569 12 32 13.3431 32 15V30C32 32.2091 30.2091 34 28 34H12C9.79086 34 8 32.2091 8 30V15Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M14 12V9C14 5.68629 16.6863 3 20 3C23.3137 3 26 5.68629 26 9V12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="14" cy="16" r="1.5" fill="currentColor" />
    <circle cx="26" cy="16" r="1.5" fill="currentColor" />
    <path d="M23 23C23 24.6569 24.3431 26 26 26C27.6569 26 29 24.6569 29 23C29 21.3431 27.6569 20 26 20C24.3431 20 23 21.3431 23 23Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.8" />
    <path d="M30 6L31 8L33 9L31 10L30 12L29 10L27 9L29 8L30 6Z" fill="currentColor" />
  </svg>
);

export const TravelIllustration: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M20 4L24.5 14.5L36 19L24.5 22.5L22.5 35L17.5 26L10 29.5L11 22.5L4 19L15 15.5L20 4Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M5 32C9 31 12 32 15 36" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
    <path d="M4 26C7 25.5 9 26 11 28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
    <circle cx="34" cy="10" r="1.5" fill="currentColor" />
  </svg>
);

export const HotelsIllustration: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <rect x="8" y="10" width="24" height="26" rx="3.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.4" />
    <rect x="12" y="14" width="4" height="4" rx="1" fill="currentColor" />
    <rect x="24" y="14" width="4" height="4" rx="1" fill="currentColor" />
    <rect x="12" y="21" width="4" height="4" rx="1" fill="currentColor" />
    <rect x="24" y="21" width="4" height="4" rx="1" fill="currentColor" />
    <path d="M16 36V28H24V36" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M14 28H26" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M13 5L16.5 7.5L20 4.5L23.5 7.5L27 5V9H13V5Z" fill="currentColor" />
  </svg>
);

export const RestaurantsIllustration: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M8 28C8 20.8203 13.3726 15 20 15C26.6274 15 32 20.8203 32 28H8Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M5 28H35C35.5523 28 36 28.4477 36 29C36 29.5523 35.5523 30 35 30H5C4.44772 30 4 29.5523 4 29C4 28.4477 4.44772 28 5 28Z" fill="currentColor" />
    <circle cx="20" cy="12.5" r="2.8" stroke="currentColor" strokeWidth="2.2" fill="currentColor" />
    <path d="M15 6C15 6 16.5 8.5 14.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
    <path d="M20 5C20 5 21.5 7.5 19.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
    <path d="M25 6C25 6 26.5 8.5 24.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
    <path d="M11 34H29" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const HospitalsIllustration: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M20 4L33 8.5V20C33 28 27 34 20 37C13 34 7 28 7 20V8.5L20 4Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M20 12V28" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
    <path d="M12 20H28" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
    <circle cx="28.5" cy="11.5" r="1.8" fill="currentColor" />
  </svg>
);

export const EducationIllustration: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M20 6L37 14L20 22L3 14L20 6Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M9 17V26C9 30 14 33.5 20 33.5C26 33.5 31 30 31 26V17" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M33 16V27.5C33 28 32.5 28.5 31.5 28.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="31.5" cy="30" r="1.8" fill="currentColor" />
  </svg>
);

export const RealEstateIllustration: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M20 5L4 17H9V34C9 34.5523 9.44772 35 10 35H30C30.5523 35 31 34.5523 31 34V17H36L20 5Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    <rect x="25" y="8" width="3.5" height="4.5" fill="currentColor" />
    <rect x="13" y="19" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.4" />
    <path d="M22 35V24H27V35" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
  </svg>
);

export const JobsIllustration: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <rect x="5" y="12" width="30" height="22" rx="4.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.4" />
    <path d="M14 12V8.5C14 7.39543 14.8954 6.5 16 6.5H24C25.1046 6.5 26 7.39543 26 8.5V12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M5 21H35" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <rect x="17.5" y="19" width="5" height="4.5" rx="1.2" fill="currentColor" />
    <path d="M20 22V24.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const AutomobilesIllustration: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M8 23L11 12C11.3 10.7 12.5 9.8 13.8 9.8H26.2C27.5 9.8 28.7 10.7 29 12L32 23V31C32 31.5523 31.5523 32 31 32H29C28.4477 32 28 31.5523 28 31V29H12V31C12 31.5523 11.5523 32 11 32H9C8.44772 32 8 31.5523 8 31V23Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M11 18H29" stroke="currentColor" strokeWidth="2" />
    <circle cx="13" cy="24" r="2.2" fill="currentColor" />
    <circle cx="27" cy="24" r="2.2" fill="currentColor" />
    <rect x="17" y="23" width="6" height="2.5" rx="0.8" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export const HomeServicesIllustration: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M31.5 8.5C28.5 5.5 24.5 5.5 22.5 7.5C21.3 8.3 20.8 9.8 21.2 11.2L9.2 23.2C8 24.4 7.5 26 7.5 27.5C7.5 31 10.5 34 14 34C15.5 34 17.1 33.5 18.3 32.3L30.3 20.3C31.7 20.7 33.2 20.2 34 19C36 17 36 13 31.5 8.5Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    <circle cx="13.5" cy="28" r="2.2" fill="currentColor" />
    <path d="M8 9L15.5 16.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.65" />
    <path d="M25 25L33 33" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.65" />
  </svg>
);

export const BeautySpaIllustration: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M20 7C20 14.5 15.5 20 11 24.5C15.5 27 24.5 27 29 24.5C24.5 20 20 14.5 20 7Z" fill="currentColor" fillOpacity="0.28" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M20 15C21.5 20 27 24 32.5 25C30.5 30 23 31 20 31C17 31 9.5 30 7.5 25C13 24 18.5 20 20 15Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M20 31C14 31 6 32.5 4 35H36C34 32.5 26 31 20 31Z" fill="currentColor" />
    <circle cx="20" cy="11.5" r="1.8" fill="currentColor" />
    <path d="M31 8L32 10.5L34.5 11.5L32 12.5L31 15L30 12.5L27.5 11.5L30 10.5L31 8Z" fill="currentColor" />
  </svg>
);

export const ClassifiedsIllustration: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M8 15H12L25 7V30L12 22H8C6.89543 22 6 21.1046 6 20V17C6 15.8954 6.89543 15 8 15Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M12 22V30C12 31.1046 12.8954 32 14 32C15.1046 32 16 31.1046 16 30V24.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M29 13C31 15 32 17.5 32 19.5C32 21.5 31 24 29 26" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M33 10C36 13 37.5 16 37.5 19.5C37.5 23 36 26 33 29" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
  </svg>
);

export const MoviesIllustration: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <rect x="5" y="14" width="30" height="20" rx="3.5" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="2.4" />
    <path d="M5 14L32 7L34 14H5Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M13 12L15 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M21 10L23 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M29 8.5L31 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="14" cy="24" r="3.5" stroke="currentColor" strokeWidth="2" />
    <circle cx="26" cy="24" r="3.5" stroke="currentColor" strokeWidth="2" />
    <circle cx="14" cy="24" r="1.2" fill="currentColor" />
    <circle cx="26" cy="24" r="1.2" fill="currentColor" />
  </svg>
);

export const FitnessIllustration: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <rect x="6" y="12" width="5" height="16" rx="2" fill="currentColor" />
    <rect x="29" y="12" width="5" height="16" rx="2" fill="currentColor" />
    <rect x="11" y="15" width="3.5" height="10" rx="1.5" fill="currentColor" fillOpacity="0.45" stroke="currentColor" strokeWidth="1.8" />
    <rect x="25.5" y="15" width="3.5" height="10" rx="1.5" fill="currentColor" fillOpacity="0.45" stroke="currentColor" strokeWidth="1.8" />
    <rect x="14.5" y="18" width="11" height="4" rx="1.5" fill="currentColor" stroke="currentColor" strokeWidth="1.2" />
    <path d="M18.5 18V22" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
    <path d="M21.5 18V22" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
    <path d="M4 16C4 15.1716 4.67157 14.5 5.5 14.5H6V25.5H5.5C4.67157 25.5 4 24.8284 4 24V16Z" fill="currentColor" opacity="0.75" />
    <path d="M34 14.5H34.5C35.3284 14.5 36 15.1716 36 16V24C36 24.8284 35.3284 25.5 34.5 25.5H34V14.5Z" fill="currentColor" opacity="0.75" />
  </svg>
);

export const PGHostelsIllustration: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M20 4L5 15V33C5 33.5523 5.44772 34 6 34H34C34.5523 34 35 33.5523 35 33V15L20 4Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    <rect x="11" y="18" width="6" height="5.5" rx="1.2" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2" />
    <rect x="23" y="18" width="6" height="5.5" rx="1.2" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2" />
    <path d="M17 34V26H23V34" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    <circle cx="20" cy="11" r="1.8" fill="currentColor" />
  </svg>
);

/* ============================================================================
   CITY-SCOPED QUICK SERVICES DEFINITIONS (12 Verified Shortcuts Per City)
   Matches authentic categories with zero misleading fallbacks.
   ============================================================================ */

export const CHITTOOR_QUICK_SERVICES: QuickServiceItem[] = [
  {
    id: 'shopping',
    label: 'Shopping',
    icon: ShoppingIllustration,
    bgColor: 'bg-gradient-to-b from-pink-50/90 to-pink-100/70',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200/90',
    hoverBg: 'group-hover:from-pink-100 group-hover:to-pink-200/80 group-hover:border-pink-400 group-hover:shadow-pink-500/20',
    category: 'silks-textiles',
  },
  {
    id: 'travel',
    label: 'Travel',
    icon: TravelIllustration,
    bgColor: 'bg-gradient-to-b from-sky-50/90 to-sky-100/70',
    textColor: 'text-sky-600',
    borderColor: 'border-sky-200/90',
    hoverBg: 'group-hover:from-sky-100 group-hover:to-sky-200/80 group-hover:border-sky-400 group-hover:shadow-sky-500/20',
    category: 'kanipakam-travels',
  },
  {
    id: 'hotels',
    label: 'Hotels',
    icon: HotelsIllustration,
    bgColor: 'bg-gradient-to-b from-blue-50/90 to-blue-100/70',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200/90',
    hoverBg: 'group-hover:from-blue-100 group-hover:to-blue-200/80 group-hover:border-blue-400 group-hover:shadow-blue-500/20',
    category: 'hotels-lodges',
  },
  {
    id: 'restaurants',
    label: 'Restaurants',
    icon: RestaurantsIllustration,
    bgColor: 'bg-gradient-to-b from-amber-50/90 to-amber-100/70',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200/90',
    hoverBg: 'group-hover:from-amber-100 group-hover:to-amber-200/80 group-hover:border-amber-400 group-hover:shadow-amber-500/20',
    category: 'restaurants',
  },
  {
    id: 'hospitals',
    label: 'Hospitals',
    icon: HospitalsIllustration,
    bgColor: 'bg-gradient-to-b from-rose-50/90 to-rose-100/70',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200/90',
    hoverBg: 'group-hover:from-rose-100 group-hover:to-rose-200/80 group-hover:border-rose-400 group-hover:shadow-rose-500/20',
    category: 'healthcare',
  },
  {
    id: 'education',
    label: 'Education',
    icon: EducationIllustration,
    bgColor: 'bg-gradient-to-b from-emerald-50/90 to-emerald-100/70',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200/90',
    hoverBg: 'group-hover:from-emerald-100 group-hover:to-emerald-200/80 group-hover:border-emerald-400 group-hover:shadow-emerald-500/20',
    category: 'education',
  },
  {
    id: 'real-estate',
    label: 'Real Estate',
    icon: RealEstateIllustration,
    bgColor: 'bg-gradient-to-b from-indigo-50/90 to-indigo-100/70',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200/90',
    hoverBg: 'group-hover:from-indigo-100 group-hover:to-indigo-200/80 group-hover:border-indigo-400 group-hover:shadow-indigo-500/20',
    category: 'real-estate',
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: JobsIllustration,
    bgColor: 'bg-gradient-to-b from-purple-50/90 to-purple-100/70',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200/90',
    hoverBg: 'group-hover:from-purple-100 group-hover:to-purple-200/80 group-hover:border-purple-400 group-hover:shadow-purple-500/20',
    category: 'jobs',
  },
  {
    id: 'automobiles',
    label: 'Automobiles',
    icon: AutomobilesIllustration,
    bgColor: 'bg-gradient-to-b from-slate-100 to-slate-200/80',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300/90',
    hoverBg: 'group-hover:from-slate-200 group-hover:to-slate-300/80 group-hover:border-slate-400 group-hover:shadow-slate-500/20',
    category: 'automobiles',
  },
  {
    id: 'home-services',
    label: 'Home Services',
    icon: HomeServicesIllustration,
    bgColor: 'bg-gradient-to-b from-teal-50/90 to-teal-100/70',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200/90',
    hoverBg: 'group-hover:from-teal-100 group-hover:to-teal-200/80 group-hover:border-teal-400 group-hover:shadow-teal-500/20',
    category: 'home-services',
  },
  {
    id: 'beauty-spa',
    label: 'Beauty & Spa',
    icon: BeautySpaIllustration,
    bgColor: 'bg-gradient-to-b from-rose-50/90 to-rose-100/70',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200/90',
    hoverBg: 'group-hover:from-rose-100 group-hover:to-rose-200/80 group-hover:border-rose-400 group-hover:shadow-rose-500/20',
    category: 'beauty-spa',
  },
  {
    id: 'classifieds',
    label: 'Classifieds',
    icon: ClassifiedsIllustration,
    bgColor: 'bg-gradient-to-b from-orange-50/90 to-orange-100/70',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200/90',
    hoverBg: 'group-hover:from-orange-100 group-hover:to-orange-200/80 group-hover:border-orange-400 group-hover:shadow-orange-500/20',
    targetTab: 'classifieds',
  },
];

export const VELLORE_QUICK_SERVICES: QuickServiceItem[] = [
  {
    id: 'shopping',
    label: 'Shopping',
    icon: ShoppingIllustration,
    bgColor: 'bg-gradient-to-b from-pink-50/90 to-pink-100/70',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200/90',
    hoverBg: 'group-hover:from-pink-100 group-hover:to-pink-200/80 group-hover:border-pink-400 group-hover:shadow-pink-500/20',
    category: 'shopping',
  },
  {
    id: 'movies',
    label: 'Movies',
    icon: MoviesIllustration,
    bgColor: 'bg-gradient-to-b from-violet-50/90 to-violet-100/70',
    textColor: 'text-violet-600',
    borderColor: 'border-violet-200/90',
    hoverBg: 'group-hover:from-violet-100 group-hover:to-violet-200/80 group-hover:border-violet-400 group-hover:shadow-violet-500/20',
    category: 'theatres-entertainment',
    targetSection: 'vellore-theatres-section',
  },
  {
    id: 'hotels',
    label: 'Hotels',
    icon: HotelsIllustration,
    bgColor: 'bg-gradient-to-b from-blue-50/90 to-blue-100/70',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200/90',
    hoverBg: 'group-hover:from-blue-100 group-hover:to-blue-200/80 group-hover:border-blue-400 group-hover:shadow-blue-500/20',
    category: 'hotels-lodges',
  },
  {
    id: 'restaurants',
    label: 'Restaurants',
    icon: RestaurantsIllustration,
    bgColor: 'bg-gradient-to-b from-amber-50/90 to-amber-100/70',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200/90',
    hoverBg: 'group-hover:from-amber-100 group-hover:to-amber-200/80 group-hover:border-amber-400 group-hover:shadow-amber-500/20',
    category: 'restaurants',
  },
  {
    id: 'hospitals',
    label: 'Hospitals',
    icon: HospitalsIllustration,
    bgColor: 'bg-gradient-to-b from-rose-50/90 to-rose-100/70',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200/90',
    hoverBg: 'group-hover:from-rose-100 group-hover:to-rose-200/80 group-hover:border-rose-400 group-hover:shadow-rose-500/20',
    category: 'healthcare',
  },
  {
    id: 'education',
    label: 'Education',
    icon: EducationIllustration,
    bgColor: 'bg-gradient-to-b from-emerald-50/90 to-emerald-100/70',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200/90',
    hoverBg: 'group-hover:from-emerald-100 group-hover:to-emerald-200/80 group-hover:border-emerald-400 group-hover:shadow-emerald-500/20',
    category: 'education',
  },
  {
    id: 'real-estate',
    label: 'Real Estate',
    icon: RealEstateIllustration,
    bgColor: 'bg-gradient-to-b from-indigo-50/90 to-indigo-100/70',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200/90',
    hoverBg: 'group-hover:from-indigo-100 group-hover:to-indigo-200/80 group-hover:border-indigo-400 group-hover:shadow-indigo-500/20',
    category: 'real-estate',
  },
  {
    id: 'automobiles',
    label: 'Automobiles',
    icon: AutomobilesIllustration,
    bgColor: 'bg-gradient-to-b from-slate-100 to-slate-200/80',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300/90',
    hoverBg: 'group-hover:from-slate-200 group-hover:to-slate-300/80 group-hover:border-slate-400 group-hover:shadow-slate-500/20',
    category: 'automobiles',
  },
  {
    id: 'home-services',
    label: 'Home Services',
    icon: HomeServicesIllustration,
    bgColor: 'bg-gradient-to-b from-teal-50/90 to-teal-100/70',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200/90',
    hoverBg: 'group-hover:from-teal-100 group-hover:to-teal-200/80 group-hover:border-teal-400 group-hover:shadow-teal-500/20',
    category: 'home-services',
  },
  {
    id: 'beauty-spa',
    label: 'Beauty & Spa',
    icon: BeautySpaIllustration,
    bgColor: 'bg-gradient-to-b from-rose-50/90 to-rose-100/70',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200/90',
    hoverBg: 'group-hover:from-rose-100 group-hover:to-rose-200/80 group-hover:border-rose-400 group-hover:shadow-rose-500/20',
    category: 'beauty-spa',
  },
  {
    id: 'pg-hostels',
    label: 'PG Hostels',
    icon: PGHostelsIllustration,
    bgColor: 'bg-gradient-to-b from-cyan-50/90 to-cyan-100/70',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200/90',
    hoverBg: 'group-hover:from-cyan-100 group-hover:to-cyan-200/80 group-hover:border-cyan-400 group-hover:shadow-cyan-500/20',
    category: 'pg-hostels',
  },
  {
    id: 'classifieds',
    label: 'Classifieds',
    icon: ClassifiedsIllustration,
    bgColor: 'bg-gradient-to-b from-orange-50/90 to-orange-100/70',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200/90',
    hoverBg: 'group-hover:from-orange-100 group-hover:to-orange-200/80 group-hover:border-orange-400 group-hover:shadow-orange-500/20',
    targetTab: 'classifieds',
  },
];

export const BENGALURU_QUICK_SERVICES: QuickServiceItem[] = [
  {
    id: 'shopping',
    label: 'Shopping',
    icon: ShoppingIllustration,
    bgColor: 'bg-gradient-to-b from-pink-50/90 to-pink-100/70',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200/90',
    hoverBg: 'group-hover:from-pink-100 group-hover:to-pink-200/80 group-hover:border-pink-400 group-hover:shadow-pink-500/20',
    category: 'electronics',
  },
  {
    id: 'hotels',
    label: 'Hotels & Stays',
    icon: HotelsIllustration,
    bgColor: 'bg-gradient-to-b from-blue-50/90 to-blue-100/70',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200/90',
    hoverBg: 'group-hover:from-blue-100 group-hover:to-blue-200/80 group-hover:border-blue-400 group-hover:shadow-blue-500/20',
    category: 'pg-hostels',
  },
  {
    id: 'restaurants',
    label: 'Restaurants',
    icon: RestaurantsIllustration,
    bgColor: 'bg-gradient-to-b from-amber-50/90 to-amber-100/70',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200/90',
    hoverBg: 'group-hover:from-amber-100 group-hover:to-amber-200/80 group-hover:border-amber-400 group-hover:shadow-amber-500/20',
    category: 'restaurants',
  },
  {
    id: 'hospitals',
    label: 'Hospitals',
    icon: HospitalsIllustration,
    bgColor: 'bg-gradient-to-b from-rose-50/90 to-rose-100/70',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200/90',
    hoverBg: 'group-hover:from-rose-100 group-hover:to-rose-200/80 group-hover:border-rose-400 group-hover:shadow-rose-500/20',
    category: 'healthcare',
  },
  {
    id: 'education',
    label: 'Education',
    icon: EducationIllustration,
    bgColor: 'bg-gradient-to-b from-emerald-50/90 to-emerald-100/70',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200/90',
    hoverBg: 'group-hover:from-emerald-100 group-hover:to-emerald-200/80 group-hover:border-emerald-400 group-hover:shadow-emerald-500/20',
    category: 'education',
  },
  {
    id: 'real-estate',
    label: 'Real Estate',
    icon: RealEstateIllustration,
    bgColor: 'bg-gradient-to-b from-indigo-50/90 to-indigo-100/70',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200/90',
    hoverBg: 'group-hover:from-indigo-100 group-hover:to-indigo-200/80 group-hover:border-indigo-400 group-hover:shadow-indigo-500/20',
    category: 'real-estate',
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: JobsIllustration,
    bgColor: 'bg-gradient-to-b from-purple-50/90 to-purple-100/70',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200/90',
    hoverBg: 'group-hover:from-purple-100 group-hover:to-purple-200/80 group-hover:border-purple-400 group-hover:shadow-purple-500/20',
    category: 'jobs',
  },
  {
    id: 'automobiles',
    label: 'Automobiles',
    icon: AutomobilesIllustration,
    bgColor: 'bg-gradient-to-b from-slate-100 to-slate-200/80',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300/90',
    hoverBg: 'group-hover:from-slate-200 group-hover:to-slate-300/80 group-hover:border-slate-400 group-hover:shadow-slate-500/20',
    category: 'automobiles',
  },
  {
    id: 'home-services',
    label: 'Home Services',
    icon: HomeServicesIllustration,
    bgColor: 'bg-gradient-to-b from-teal-50/90 to-teal-100/70',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200/90',
    hoverBg: 'group-hover:from-teal-100 group-hover:to-teal-200/80 group-hover:border-teal-400 group-hover:shadow-teal-500/20',
    category: 'home-services',
  },
  {
    id: 'beauty-spa',
    label: 'Beauty & Spa',
    icon: BeautySpaIllustration,
    bgColor: 'bg-gradient-to-b from-rose-50/90 to-rose-100/70',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200/90',
    hoverBg: 'group-hover:from-rose-100 group-hover:to-rose-200/80 group-hover:border-rose-400 group-hover:shadow-rose-500/20',
    category: 'beauty-spa',
  },
  {
    id: 'fitness',
    label: 'Fitness',
    icon: FitnessIllustration,
    bgColor: 'bg-gradient-to-b from-red-50/90 to-red-100/70',
    textColor: 'text-red-600',
    borderColor: 'border-red-200/90',
    hoverBg: 'group-hover:from-red-100 group-hover:to-red-200/80 group-hover:border-red-400 group-hover:shadow-red-500/20',
    category: 'fitness',
  },
  {
    id: 'classifieds',
    label: 'Classifieds',
    icon: ClassifiedsIllustration,
    bgColor: 'bg-gradient-to-b from-orange-50/90 to-orange-100/70',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200/90',
    hoverBg: 'group-hover:from-orange-100 group-hover:to-orange-200/80 group-hover:border-orange-400 group-hover:shadow-orange-500/20',
    targetTab: 'classifieds',
  },
];

export const CITY_QUICK_SERVICES: Record<CityId, QuickServiceItem[]> = {
  chittoor: CHITTOOR_QUICK_SERVICES,
  vellore: VELLORE_QUICK_SERVICES,
  bengaluru: BENGALURU_QUICK_SERVICES,
};

/**
 * Returns the verified 12 quick services for a given city territory.
 * Guarantees zero misleading category fallbacks and exactly 12 items.
 */
export function getCityQuickServices(cityId: CityId): QuickServiceItem[] {
  return CITY_QUICK_SERVICES[cityId] || CHITTOOR_QUICK_SERVICES;
}

// Backward compatibility export
export const QUICK_SERVICES: QuickServiceItem[] = CHITTOOR_QUICK_SERVICES;

export const ServiceQuickLinks: React.FC<ServiceQuickLinksProps> = ({
  currentCity,
  onSelectCategory,
  onNavigateTab,
}) => {
  const cityName = currentCity.name;
  const cityId = currentCity.id;
  const cityCode = currentCity.code;
  const services = getCityQuickServices(cityId);

  const handleServiceClick = (service: QuickServiceItem) => {
    // 1. Target section scroll (e.g. Vellore Theatres module on homepage)
    if (service.targetSection && typeof document !== 'undefined') {
      const sectionEl = document.getElementById(service.targetSection);
      if (sectionEl) {
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    // 2. Direct tab navigation (e.g. Classifieds)
    if (service.targetTab) {
      onNavigateTab(service.targetTab);
      return;
    }

    // 3. Category navigation
    if (service.category) {
      onSelectCategory(service.category);
      return;
    }

    onSelectCategory('all');
  };

  return (
    <section
      id="quick-services-section"
      className="bg-white border-b border-slate-200/80 shadow-2xs py-4 sm:py-6 relative z-10"
      aria-label="Explore Popular Services"
    >
      <div className="max-w-7xl mx-auto px-2.5 xs:px-4 sm:px-6">
        {/* Compact Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-3.5 sm:mb-4.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-black font-heading text-slate-900 tracking-tight flex items-center gap-2">
              <span>Explore Popular Services</span>
            </h2>
            <span className="hidden sm:inline-block text-slate-300">•</span>
            <p className="text-xs text-slate-500 font-medium">
              Find the services you need in {cityName} ({cityCode})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors group cursor-pointer"
              title={`View all directory categories in ${cityName}`}
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
            </button>
            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Instant City Shortcuts</span>
            </div>
          </div>
        </div>

        {/* 12-Service Responsive Quick Links Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2.5 sm:gap-3.5 lg:gap-2">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => handleServiceClick(service)}
                className="group flex flex-col items-center justify-start p-1 sm:p-1.5 rounded-2xl hover:bg-slate-50/70 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400 transition-all duration-200 cursor-pointer select-none text-center"
                title={`Browse ${service.label} in ${cityName}`}
                aria-label={`Browse ${service.label} in ${cityName}`}
              >
                {/* Premium Tile Container: Desktop ~72px, Tablet ~66px, Mobile ~58px with soft depth */}
                <div
                  className={`w-[58px] h-[58px] sm:w-[66px] sm:h-[66px] lg:w-[72px] lg:h-[72px] rounded-[18px] sm:rounded-[20px] flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:shadow-md motion-safe:group-hover:-translate-y-1 border ${service.bgColor} ${service.textColor} ${service.borderColor} ${service.hoverBg}`}
                >
                  {/* High-Quality Duotone SVG Illustration (30-38px desktop, 26-30px mobile) */}
                  <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 lg:w-[34px] lg:h-[34px] transition-transform duration-200 group-hover:scale-108 shrink-0" />
                </div>

                {/* Short Readable Balanced Label (12-13px desktop, 11-12px mobile) */}
                <span className="mt-2 text-[11px] sm:text-xs lg:text-[13px] font-bold text-slate-700 group-hover:text-slate-950 tracking-tight leading-snug text-center w-full min-h-[2.2em] flex items-center justify-center px-0.5 transition-colors">
                  {service.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
