import React from 'react';
import { 
  Star, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Phone, 
  MessageSquare,
  Building2, 
  Smartphone,
  CheckCircle2,
  TrendingUp,
  Users,
  PlusCircle
} from 'lucide-react';
import { Listing, CityConfig } from '../types';
import { CHITTOOR_CATEGORIES } from '../data/mockData';
import { useTranslation } from '../i18n/LanguageContext';

interface HomeSectionsProps {
  featuredListings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onSelectArea: (areaId: string) => void;
  onOpenPostAd: () => void;
  onViewAllBusinesses: () => void;
  currentCity: CityConfig;
}

export const HomeSections: React.FC<HomeSectionsProps> = ({
  featuredListings,
  onSelectListing,
  onSelectArea,
  onOpenPostAd,
  onViewAllBusinesses,
  currentCity,
}) => {
  const { t } = useTranslation();

  const handleCall = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  const handleWhatsApp = (e: React.MouseEvent, listing: Listing) => {
    e.stopPropagation();
    const phone = listing.whatsapp || listing.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello! I found your listing "${listing.title}" on ${currentCity.brandName} (${currentCity.code} Local Discovery). I would like to inquire about your services.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-14 py-4">
      
      {/* 1. FEATURED BUSINESSES SECTION */}
      <section aria-label={`Featured Local Businesses in ${currentCity.name}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black text-[#15995F] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase tracking-wider">
                Handpicked & Active
              </span>
              <span className="text-xs text-slate-400 font-medium">{currentCity.code} Spotlight</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              Featured Businesses in {currentCity.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Verified local service providers, stores, and dining establishments in {currentCity.name}
            </p>
          </div>

          {featuredListings.length > 0 && (
            <button
              onClick={onViewAllBusinesses}
              className="self-start sm:self-center text-xs font-black text-[#E51E31] hover:text-white bg-red-50 hover:bg-[#E51E31] px-4 py-2.5 rounded-xl border border-red-200 transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-md shrink-0"
            >
              <span>{t('viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Grid of Business Cards or Friendly Empty State */}
        {featuredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {featuredListings.slice(0, 5).map((biz) => {
              const catName = CHITTOOR_CATEGORIES.find((c) => c.id === biz.category)?.name || biz.category;
              const areaName = currentCity.localities.find((a) => a.id === biz.area)?.name || biz.area;

              return (
                <div
                  key={biz.id}
                  onClick={() => onSelectListing(biz)}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-red-300 transition-all duration-300 p-3.5 flex flex-col justify-between cursor-pointer group hover:-translate-y-1"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectListing(biz);
                    }
                  }}
                >
                  <div>
                    {/* Image with Rating Badge and Verification Shield */}
                    <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-100 relative mb-3">
                      <img
                        src={biz.images[0] || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80'}
                        alt={biz.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        {biz.reviewsCount > 0 ? (
                          <div className="bg-black/70 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{biz.rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="bg-black/70 backdrop-blur-xs text-slate-200 text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                            New Listing
                          </span>
                        )}

                        {biz.isVerified && (
                          <span className="bg-[#15995F] text-white p-1 rounded-full shadow-md" title="Verified business">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      {/* Locality Pill on bottom of image */}
                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px]">
                        <span className="flex items-center gap-1 font-semibold bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs truncate">
                          <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                          <span className="truncate">{areaName}</span>
                        </span>
                      </div>
                    </div>

                    {/* Title & Category */}
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#E51E31] transition-colors line-clamp-1 font-heading">
                      {biz.title}
                    </h3>

                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium">
                      <span className="text-[#176AC4] font-bold truncate">{catName}</span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-medium">
                      {biz.address}
                    </p>
                  </div>

                  {/* Card Actions: Call, WhatsApp, View Details */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleCall(e, biz.phone)}
                        className="py-1.5 px-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                        title={`Call ${biz.phone}`}
                      >
                        <Phone className="w-3 h-3 text-[#15995F]" />
                        <span>Call</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleWhatsApp(e, biz)}
                        className="py-1.5 px-2 rounded-lg bg-[#15995F] hover:bg-emerald-700 text-white font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      className="w-full py-1.5 px-3 rounded-lg bg-slate-50 group-hover:bg-[#E51E31] group-hover:text-white text-slate-700 font-extrabold text-xs transition-colors"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-xl mx-auto shadow-xs">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-black text-slate-900 font-heading">
              New City Directory Active for {currentCity.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
              We are currently onboarding local merchants across {currentCity.name} ({currentCity.code}). Be the first business owner to publish your free verified listing!
            </p>
            <button
              onClick={onOpenPostAd}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E51E31] text-white font-black text-xs shadow-md hover:bg-red-700 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Your {currentCity.name} Business Free</span>
            </button>
          </div>
        )}
      </section>

      {/* 2. EXPLORE YOUR CITY (LOCAL MANDALS / HUBS GRID) */}
      <section aria-label={`Explore ${currentCity.name} Hubs and Localities`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black text-[#F5C325] bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded uppercase tracking-wider">
                Geographic Discovery
              </span>
              <span className="text-xs text-slate-400 font-medium">{currentCity.name} Local Hubs & Corridors</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              Explore {currentCity.name} Areas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Discover verified businesses, services, and local ads across key municipal hubs in {currentCity.name}
            </p>
          </div>
        </div>

        {/* Thumbnail Grid with Landscape Cover Photos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {currentCity.cityGrid.map((hub) => (
            <div
              key={hub.id}
              onClick={() => onSelectArea(hub.id)}
              className="group relative h-52 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer select-none hover:-translate-y-1"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectArea(hub.id);
                }
              }}
            >
              <img
                src={hub.image}
                alt={hub.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] bg-[#E51E31] text-white font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                  {hub.count}+ listings
                </span>
                <h3 className="font-black text-sm sm:text-base font-heading mt-1.5 group-hover:text-red-300 transition-colors">
                  {hub.name}
                </h3>
                <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5 font-medium">
                  {hub.tagline}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. GROW YOUR BUSINESS (PREMIUM PROMOTIONAL SECTION) */}
      <section 
        className="rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-10 shadow-2xl relative border border-slate-800"
        aria-label={`Grow Your Business with ${currentCity.brandName}`}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E51E31]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#176AC4]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-amber-300 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full mb-4 backdrop-blur-md border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-[#F5C325]" />
              <span>Grow Your Local Business • {currentCity.code}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black font-heading tracking-tight leading-tight text-white">
              Connect With Thousands of Local Customers Across {currentCity.name}
            </h2>

            <p className="mt-3 text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              List your shop, clinic, restaurant, school, or service on {currentCity.brandName}. Reach nearby residents in {currentCity.name} ({currentCity.code}) searching for services every day.
            </p>

            {/* 4 Simple Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <div className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#15995F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Targeted {currentCity.name} Reach</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Showcase your services to customers searching specifically in your area.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/10">
                <Phone className="w-4 h-4 text-[#176AC4] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Direct Phone & WhatsApp</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Receive immediate customer enquiries with zero mediator fees.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/10">
                <TrendingUp className="w-4 h-4 text-[#F5C325] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">100% Free Listing Option</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Create your digital storefront without mandatory subscriptions.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/10">
                <Users className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Simple Self-Management</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Update photos, contact info, and special offers from your dashboard.</p>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenPostAd}
                className="px-7 py-3.5 bg-gradient-to-r from-[#E51E31] to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm rounded-xl shadow-xl shadow-red-500/25 transition-all duration-200 flex items-center gap-2 cursor-pointer hover:scale-105"
              >
                <span>Add Your {currentCity.name} Business Free →</span>
              </button>

              <span className="text-xs text-slate-400 font-medium">
                No credit card required • Instant submission
              </span>
            </div>
          </div>

          {/* Right Side Visual Device Mockup */}
          <div className="relative flex items-center justify-center shrink-0 w-full lg:w-auto">
            <div className="w-64 sm:w-72 p-4 bg-slate-950/80 rounded-3xl border border-white/20 backdrop-blur-md shadow-2xl text-center">
              <div className="flex items-center justify-center gap-2 text-white text-xs font-bold mb-3">
                <Smartphone className="w-4 h-4 text-[#E51E31]" />
                <span>{currentCity.brandName} Discovery</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#E51E31] text-white flex items-center justify-center font-bold text-xs">
                    {currentCity.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Your Business Name</p>
                    <p className="text-[10px] text-emerald-400">● Live on {currentCity.code} Directory</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                  <span>Customer Calls: <strong>Direct</strong></span>
                  <span>WhatsApp: <strong>Instant</strong></span>
                </div>
              </div>
            </div>

            {/* Circular badge */}
            <div className="absolute -bottom-3 -right-3 w-22 h-22 bg-[#F5C325] text-slate-950 font-black text-[11px] rounded-full flex items-center justify-center text-center p-2 shadow-2xl border-4 border-slate-900 rotate-12">
              Free Listing!
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
