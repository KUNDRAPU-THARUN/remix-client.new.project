import React from 'react';
import {
  ShoppingBag,
  Plane,
  Hotel,
  Utensils,
  Hospital,
  GraduationCap,
  House,
  Briefcase,
  Clapperboard,
  CarFront,
  Wrench,
  Megaphone,
  Sparkles,
  Home,
  Dumbbell,
  LucideIcon,
} from 'lucide-react';
import { CityConfig, CityId } from '../types';

export interface ServiceQuickLinksProps {
  currentCity: CityConfig;
  onSelectCategory: (categoryId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export interface QuickServiceItem {
  id: string;
  label: string;
  icon: LucideIcon;
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

/**
 * CHITTOOR ADS (AP-03) QUICK SERVICES — 12 Verified Local Shortcuts
 * Matches authentic categories in CHITTOOR_CATEGORIES and dedicated platform tabs.
 * No misleading fallbacks: Kanipakam travel for Travel, Real jobs for Jobs, Silks for Shopping.
 */
export const CHITTOOR_QUICK_SERVICES: QuickServiceItem[] = [
  {
    id: 'shopping',
    label: 'Shopping',
    icon: ShoppingBag,
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200/80',
    hoverBg: 'group-hover:bg-pink-600 group-hover:text-white group-hover:border-pink-600',
    category: 'silks-textiles',
  },
  {
    id: 'travel',
    label: 'Travel',
    icon: Plane,
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-600',
    borderColor: 'border-sky-200/80',
    hoverBg: 'group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600',
    category: 'kanipakam-travels',
  },
  {
    id: 'hotels',
    label: 'Hotels',
    icon: Hotel,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200/80',
    hoverBg: 'group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600',
    category: 'hotels-lodges',
  },
  {
    id: 'restaurants',
    label: 'Restaurants',
    icon: Utensils,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200/80',
    hoverBg: 'group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500',
    category: 'restaurants',
  },
  {
    id: 'hospitals',
    label: 'Hospitals',
    icon: Hospital,
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200/80',
    hoverBg: 'group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600',
    category: 'healthcare',
  },
  {
    id: 'education',
    label: 'Education',
    icon: GraduationCap,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200/80',
    hoverBg: 'group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600',
    category: 'education',
  },
  {
    id: 'real-estate',
    label: 'Real Estate',
    icon: House,
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200/80',
    hoverBg: 'group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600',
    category: 'real-estate',
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: Briefcase,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200/80',
    hoverBg: 'group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600',
    category: 'jobs',
  },
  {
    id: 'automobiles',
    label: 'Automobiles',
    icon: CarFront,
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300/80',
    hoverBg: 'group-hover:bg-slate-800 group-hover:text-white group-hover:border-slate-800',
    category: 'automobiles',
  },
  {
    id: 'home-services',
    label: 'Home Services',
    icon: Wrench,
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200/80',
    hoverBg: 'group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600',
    category: 'home-services',
  },
  {
    id: 'beauty-spa',
    label: 'Beauty & Spa',
    icon: Sparkles,
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200/80',
    hoverBg: 'group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600',
    category: 'beauty-spa',
  },
  {
    id: 'classifieds',
    label: 'Classifieds',
    icon: Megaphone,
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200/80',
    hoverBg: 'group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600',
    targetTab: 'classifieds',
  },
];

/**
 * VELLORE ADS (TN-23) QUICK SERVICES — 12 Verified Local Shortcuts
 * Direct links to Vellore Theatres showcase, CMC healthcare, VIT colleges, and Long Bazaar shopping.
 * No misleading fallbacks: Movies links to Cinema module/theatres category, Hotels links to Hotels.
 */
export const VELLORE_QUICK_SERVICES: QuickServiceItem[] = [
  {
    id: 'shopping',
    label: 'Shopping',
    icon: ShoppingBag,
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200/80',
    hoverBg: 'group-hover:bg-pink-600 group-hover:text-white group-hover:border-pink-600',
    category: 'shopping',
  },
  {
    id: 'movies',
    label: 'Movies',
    icon: Clapperboard,
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-600',
    borderColor: 'border-violet-200/80',
    hoverBg: 'group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600',
    category: 'theatres-entertainment',
    targetSection: 'vellore-theatres-section',
  },
  {
    id: 'hotels',
    label: 'Hotels',
    icon: Hotel,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200/80',
    hoverBg: 'group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600',
    category: 'hotels-lodges',
  },
  {
    id: 'restaurants',
    label: 'Restaurants',
    icon: Utensils,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200/80',
    hoverBg: 'group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500',
    category: 'restaurants',
  },
  {
    id: 'hospitals',
    label: 'Hospitals',
    icon: Hospital,
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200/80',
    hoverBg: 'group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600',
    category: 'healthcare',
  },
  {
    id: 'education',
    label: 'Education',
    icon: GraduationCap,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200/80',
    hoverBg: 'group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600',
    category: 'education',
  },
  {
    id: 'real-estate',
    label: 'Real Estate',
    icon: House,
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200/80',
    hoverBg: 'group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600',
    category: 'real-estate',
  },
  {
    id: 'automobiles',
    label: 'Automobiles',
    icon: CarFront,
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300/80',
    hoverBg: 'group-hover:bg-slate-800 group-hover:text-white group-hover:border-slate-800',
    category: 'automobiles',
  },
  {
    id: 'home-services',
    label: 'Home Services',
    icon: Wrench,
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200/80',
    hoverBg: 'group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600',
    category: 'home-services',
  },
  {
    id: 'beauty-spa',
    label: 'Beauty & Spa',
    icon: Sparkles,
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200/80',
    hoverBg: 'group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600',
    category: 'beauty-spa',
  },
  {
    id: 'pg-hostels',
    label: 'PG Hostels',
    icon: Home,
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200/80',
    hoverBg: 'group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-600',
    category: 'pg-hostels',
  },
  {
    id: 'classifieds',
    label: 'Classifieds',
    icon: Megaphone,
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200/80',
    hoverBg: 'group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600',
    targetTab: 'classifieds',
  },
];

/**
 * BENGALURU ADS (KA-01) QUICK SERVICES — 12 Verified Local Shortcuts
 * Links to tech consultancies & jobs, coworking spaces, electronics repair, and gyms.
 * No misleading fallbacks: Hotels & Stays links to accommodation, Jobs links to tech jobs.
 */
export const BENGALURU_QUICK_SERVICES: QuickServiceItem[] = [
  {
    id: 'shopping',
    label: 'Shopping',
    icon: ShoppingBag,
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200/80',
    hoverBg: 'group-hover:bg-pink-600 group-hover:text-white group-hover:border-pink-600',
    category: 'electronics',
  },
  {
    id: 'hotels',
    label: 'Hotels & Stays',
    icon: Hotel,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200/80',
    hoverBg: 'group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600',
    category: 'pg-hostels',
  },
  {
    id: 'restaurants',
    label: 'Restaurants',
    icon: Utensils,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200/80',
    hoverBg: 'group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500',
    category: 'restaurants',
  },
  {
    id: 'hospitals',
    label: 'Hospitals',
    icon: Hospital,
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200/80',
    hoverBg: 'group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600',
    category: 'healthcare',
  },
  {
    id: 'education',
    label: 'Education',
    icon: GraduationCap,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200/80',
    hoverBg: 'group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600',
    category: 'education',
  },
  {
    id: 'real-estate',
    label: 'Real Estate',
    icon: House,
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200/80',
    hoverBg: 'group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600',
    category: 'real-estate',
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: Briefcase,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200/80',
    hoverBg: 'group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600',
    category: 'jobs',
  },
  {
    id: 'automobiles',
    label: 'Automobiles',
    icon: CarFront,
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300/80',
    hoverBg: 'group-hover:bg-slate-800 group-hover:text-white group-hover:border-slate-800',
    category: 'automobiles',
  },
  {
    id: 'home-services',
    label: 'Home Services',
    icon: Wrench,
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200/80',
    hoverBg: 'group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600',
    category: 'home-services',
  },
  {
    id: 'beauty-spa',
    label: 'Beauty & Spa',
    icon: Sparkles,
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200/80',
    hoverBg: 'group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600',
    category: 'beauty-spa',
  },
  {
    id: 'fitness',
    label: 'Fitness',
    icon: Dumbbell,
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200/80',
    hoverBg: 'group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600',
    category: 'fitness',
  },
  {
    id: 'classifieds',
    label: 'Classifieds',
    icon: Megaphone,
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200/80',
    hoverBg: 'group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600',
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
      className="bg-white border-b border-slate-200/80 shadow-2xs py-4 sm:py-5 relative z-10"
      aria-label="Explore Popular Services"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Compact Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-black font-heading text-slate-900 tracking-tight flex items-center gap-2">
              <span>Explore Popular Services</span>
            </h2>
            <span className="hidden sm:inline-block text-slate-300">•</span>
            <p className="text-xs text-slate-500 font-medium">
              Find the services you need in {cityName} ({cityCode})
            </p>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Instant City Shortcuts</span>
          </div>
        </div>

        {/* 12-Service Responsive Quick Links Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 sm:gap-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => handleServiceClick(service)}
                className="group flex flex-col items-center justify-start p-1.5 sm:p-2 rounded-2xl hover:bg-slate-50/90 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400 transition-all duration-200 cursor-pointer select-none text-center"
                title={`Browse ${service.label} in ${cityName}`}
                aria-label={`Browse ${service.label} in ${cityName}`}
              >
                {/* Tile Container */}
                <div
                  className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:scale-105 group-hover:shadow-md border ${service.bgColor} ${service.textColor} ${service.borderColor} ${service.hoverBg}`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:scale-110" />
                </div>

                {/* Short Readable Balanced Label */}
                <span className="mt-1.5 text-[11px] sm:text-xs font-bold text-slate-700 group-hover:text-slate-900 tracking-tight leading-tight text-center w-full min-h-[2.2em] flex items-center justify-center px-0.5">
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
