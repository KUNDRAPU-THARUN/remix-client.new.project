import React from 'react';
import { 
  Star, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  Laptop, 
  Smartphone,
  ExternalLink 
} from 'lucide-react';
import { Listing } from '../types';
import { CHITTOOR_CITIES_GRID, CHITTOOR_CATEGORIES } from '../data/mockData';
import { useTranslation } from '../i18n/LanguageContext';

interface HomeSectionsProps {
  featuredListings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onSelectArea: (areaId: string) => void;
  onOpenPostAd: () => void;
  onViewAllBusinesses: () => void;
}

export const HomeSections: React.FC<HomeSectionsProps> = ({
  featuredListings,
  onSelectListing,
  onSelectArea,
  onOpenPostAd,
  onViewAllBusinesses,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-12 py-4">
      
      {/* 1. FEATURED BUSINESSES SECTION */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase">
                Handpicked & Verified
              </span>
              <span className="text-xs text-slate-400">AP-03 Spotlight</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1">
              {t('featuredBusinessesTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t('featuredBusinessesSubtitle')}
            </p>
          </div>

          <button
            onClick={onViewAllBusinesses}
            className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl border border-red-200 transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>{t('viewAll')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Grid of Business Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {featuredListings.slice(0, 5).map((biz) => {
            const catName = CHITTOOR_CATEGORIES.find((c) => c.id === biz.category)?.name || biz.category;

            return (
              <div
                key={biz.id}
                onClick={() => onSelectListing(biz)}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-red-300 transition-all duration-300 p-3 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Image with Rating Badge */}
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 relative mb-3">
                    <img
                      src={biz.images[0] || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80'}
                      alt={biz.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{biz.rating.toFixed(1)} ({biz.reviewsCount})</span>
                    </div>

                    {biz.isVerified && (
                      <span className="absolute top-2 right-2 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
                        <ShieldCheck className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {/* Title & Category */}
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-red-600 transition-colors line-clamp-1 font-heading">
                    {biz.title}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                    <span className="text-red-600 font-semibold">{catName}</span>
                    <span>•</span>
                    <span className="truncate">{biz.area}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {biz.address}
                  </p>
                </div>

                {/* View Details Button */}
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    className="w-full py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 font-bold text-xs transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. SEARCH BY CITY / AREA IN CHITTOOR GRID */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase">
                Geographic Discovery
              </span>
              <span className="text-xs text-slate-400">Chittoor District Mandals</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1">
              {t('searchByCityTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t('searchByCitySubtitle')}
            </p>
          </div>
        </div>

        {/* Thumbnail Grid with Landscape Cover Photos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CHITTOOR_CITIES_GRID.map((city) => (
            <div
              key={city.id}
              onClick={() => onSelectArea(city.id)}
              className="group relative h-48 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer select-none"
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded">
                  {city.count}+ listings
                </span>
                <h3 className="font-extrabold text-sm sm:text-base font-heading mt-1 group-hover:text-red-300 transition-colors">
                  {city.name}
                </h3>
                <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">
                  {city.tagline}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PROMOTIONAL BANNER ("Helping Entrepreneurs Build & Grow") */}
      <section className="rounded-3xl overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 sm:p-10 shadow-xl relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="inline-block bg-white/20 text-white text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full mb-3 backdrop-blur-xs">
              Go Digital • Chittoor District Growth
            </span>

            <h2 className="text-2xl sm:text-4xl font-black font-heading tracking-tight leading-tight">
              {t('helpingEntrepreneurs')}
            </h2>

            <p className="mt-3 text-xs sm:text-sm text-red-100 font-medium leading-relaxed">
              {t('helpingSubtitle')}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenPostAd}
                className="px-6 py-3 bg-white hover:bg-slate-100 text-red-600 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <span>{t('advertiseYourBusiness')}</span>
              </button>

              <span className="text-xs text-red-200">100% Free Listing Option Available</span>
            </div>
          </div>

          {/* Right Side Visual Device Mockup */}
          <div className="relative flex items-center justify-center shrink-0">
            <div className="w-56 sm:w-64 p-3 bg-black/30 rounded-2xl border border-white/20 backdrop-blur-md shadow-2xl text-center">
              <div className="flex items-center justify-center gap-2 text-white text-xs font-bold mb-2">
                <Laptop className="w-4 h-4" />
                <span>ChittoorAds Platform</span>
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="h-28 bg-white/10 rounded-xl flex items-center justify-center p-3 text-center border border-white/10">
                <p className="text-xs text-white font-medium">
                  Connect with thousands of local buyers in Chittoor, Kanipakam & AP-03
                </p>
              </div>
            </div>

            {/* Circular badge */}
            <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-amber-400 text-slate-950 font-black text-[11px] rounded-full flex items-center justify-center text-center p-2 shadow-xl border-4 border-white rotate-12">
              List For Free!
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
