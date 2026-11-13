import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  Filter,
  Sparkles,
  MapPin,
  Compass,
  Landmark,
  RotateCcw,
  Clock,
  Car,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Info,
} from 'lucide-react';
import { CityConfig } from '../../types';
import {
  TourismAttraction,
  TourismCategory,
  TourismCategoryWithCount,
} from '../../types/tourism';
import { tourismService } from '../../services/tourismService';
import { TourismAttractionCard } from './TourismAttractionCard';
import { AttractionDetailPreviewModal } from './AttractionDetailPreviewModal';

interface VelloreTourismPageProps {
  currentCity: CityConfig;
  onNavigateHome: () => void;
  onSelectAttractionSlug?: (slug: string) => void;
  onOpenCabBooking?: () => void;
  onOpenEmergency?: () => void;
}

export const VelloreTourismPage: React.FC<VelloreTourismPageProps> = ({
  currentCity,
  onNavigateHome,
  onSelectAttractionSlug,
  onOpenCabBooking,
  onOpenEmergency,
}) => {
  const [attractions, setAttractions] = useState<TourismAttraction[]>([]);
  const [featuredAttractions, setFeaturedAttractions] = useState<TourismAttraction[]>([]);
  const [categoriesWithCounts, setCategoriesWithCounts] = useState<TourismCategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TourismCategory | 'all'>('all');
  const [selectedAttraction, setSelectedAttraction] = useState<TourismAttraction | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initial data loading
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [allAttractions, featured, categories] = await Promise.all([
          tourismService.getTourismAttractions(currentCity.id),
          tourismService.getFeaturedTourismAttractions(currentCity.id),
          tourismService.getTourismCategories(currentCity.id),
        ]);

        if (isMounted) {
          setAttractions(allAttractions);
          setFeaturedAttractions(featured);
          setCategoriesWithCounts(categories);
        }
      } catch (err) {
        console.error('Failed to load Vellore tourism data:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentCity.id]);

  // Dynamic search and filter processing
  const filteredAttractions = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    return attractions.filter((att) => {
      // Category filter
      if (selectedCategory !== 'all' && att.category !== selectedCategory) {
        return false;
      }

      // Keyword search
      if (trimmed.length > 0) {
        const corpus = [
          att.title,
          att.nameNative,
          att.shortDescription,
          att.fullDescription,
          att.location.locality,
          att.location.distanceFromCenter,
          ...(att.historicalHighlights || []),
          att.category,
        ]
          .join(' ')
          .toLowerCase();

        const tokens = trimmed.split(/\s+/).filter(Boolean);
        return tokens.every((token) => corpus.includes(token));
      }

      return true;
    });
  }, [attractions, searchQuery, selectedCategory]);

  const totalPublishedCount = attractions.length;
  const isFiltering = searchQuery.trim().length > 0 || selectedCategory !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSelectAttraction = (att: TourismAttraction) => {
    setSelectedAttraction(att);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* 1. TOURISM HERO SECTION */}
      <section
        className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-10 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden border-b border-slate-800"
        aria-label="Vellore Tourism Hero"
      >
        {/* Subtle Background Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#176AC4_1px,transparent_1px)] [background-size:24px_24px]"
          aria-hidden="true"
        />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb Navigation */}
          <nav
            className="flex items-center gap-1.5 text-xs text-slate-400 mb-6 font-medium"
            aria-label="Breadcrumb"
          >
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-white transition cursor-pointer"
            >
              {currentCity.name} Ads
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-blue-400 font-bold">Heritage & Tourism</span>
          </nav>

          {/* Hero Content Heading */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-black uppercase tracking-wider mb-4">
              <Landmark className="w-3.5 h-3.5" />
              <span>Fort City Heritage Guide • {currentCity.code}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-white leading-tight">
              Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-amber-300">Vellore</span>
            </h1>

            <p className="text-sm sm:text-lg text-slate-300 mt-3 sm:mt-4 font-normal leading-relaxed max-w-2xl">
              Discover the heritage, culture, temples and natural beauty of Vellore. From Vijayanagara granite ramparts to spiritual shrines and scenic hill viewpoints.
            </p>
          </div>

          {/* 2. DESTINATION SEARCH BAR */}
          <div className="mt-8 max-w-2xl">
            <div className="relative flex items-center">
              <label htmlFor="tourism-search-input" className="sr-only">
                Search tourism destinations, temples, forts, or localities in Vellore
              </label>
              <Search
                className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="tourism-search-input"
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Fort, Golden Temple, Jalakandeswarar, Otteri..."
                className="w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-slate-400 focus:placeholder:text-slate-500 text-sm sm:text-base font-medium outline-hidden border border-white/20 focus:border-[#176AC4] focus:ring-4 focus:ring-blue-500/20 transition-all shadow-xl backdrop-blur-md"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Suggestions */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-400">Popular:</span>
              {['Vellore Fort', 'Golden Temple', 'Jalakandeswarar', 'Palamathi Hills'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setSearchQuery(term)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-medium transition cursor-pointer border border-white/10"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY FILTERS (Sticky / Scrollable) */}
      <section
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 shadow-2xs"
        aria-label="Tourism Categories"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-none pb-0.5 -mx-4 px-4 sm:mx-0 sm:px-0">
            {/* Category Chips */}
            <div className="flex items-center gap-2 shrink-0">
              {/* All Places Chip */}
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[40px] ${
                  selectedCategory === 'all'
                    ? 'bg-[#176AC4] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                aria-pressed={selectedCategory === 'all'}
              >
                <span>All Places</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    selectedCategory === 'all'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {totalPublishedCount}
                </span>
              </button>

              {/* Dynamic Category Chips */}
              {categoriesWithCounts.map(({ category, count }) => {
                const isSelected = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[40px] ${
                      isSelected
                        ? 'bg-[#176AC4] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <span>{category.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Reset Filters action (if filtering) */}
            {isFiltering && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ml-auto"
                aria-label="Reset all search and category filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-12">
        {/* Results Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              {selectedCategory === 'all'
                ? 'All Vellore Destinations'
                : categoriesWithCounts.find((c) => c.category.id === selectedCategory)?.category
                    .label || 'Vellore Destinations'}
            </h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
              {filteredAttractions.length} {filteredAttractions.length === 1 ? 'place' : 'places'}
            </span>
          </div>

          {searchQuery && (
            <p className="text-xs text-slate-500">
              Showing results matching &ldquo;<span className="font-bold text-slate-800">{searchQuery}</span>&rdquo;
            </p>
          )}
        </div>

        {/* 4. FEATURED ATTRACTIONS SPOTLIGHT (Show when browsing all without active search) */}
        {!isFiltering && featuredAttractions.length > 0 && (
          <section aria-label="Featured Vellore Heritage Destinations" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-100 text-amber-700">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading">
                  Featured Vellore Landmarks
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Must-visit places</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {featuredAttractions.slice(0, 2).map((att) => (
                <div
                  key={`feat-${att.id}`}
                  className="relative rounded-3xl overflow-hidden bg-slate-950 text-white min-h-[220px] sm:min-h-[260px] flex flex-col justify-end p-5 sm:p-6 group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
                  onClick={() => handleSelectAttraction(att)}
                >
                  <img
                    src={att.heroImage}
                    alt={att.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  <div className="relative z-10 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                        Featured
                      </span>
                      <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-400" />
                        <span>{att.location.locality}</span>
                      </span>
                    </div>

                    <span className="text-xs text-blue-300 font-bold block">{att.nameNative}</span>
                    <h4 className="text-lg sm:text-xl font-black text-white font-heading">
                      {att.title}
                    </h4>
                    <p className="text-xs text-slate-300 line-clamp-2 max-w-xl">
                      {att.shortDescription}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {att.visitorInformation.timings}
                      </span>
                      <span className="text-xs font-bold text-blue-300 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Explore details →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. ALL DESTINATIONS GRID / EMPTY STATE / LOADING */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-slate-200 h-96 animate-pulse p-4 space-y-3"
              >
                <div className="h-48 bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredAttractions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAttractions.map((attraction) => (
              <TourismAttractionCard
                key={attraction.id}
                attraction={attraction}
                onSelect={(att) => handleSelectAttraction(att)}
                onNavigateDetail={onSelectAttractionSlug}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-md mx-auto space-y-4 my-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#176AC4] flex items-center justify-center mx-auto shadow-inner">
              <Compass className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 font-heading">
                No Destinations Found
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                No tourism places matched your current search &ldquo;
                <span className="font-semibold text-slate-700">{searchQuery}</span>
                &rdquo; in the selected category.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2.5 rounded-xl bg-[#176AC4] hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show All Vellore Destinations</span>
            </button>
          </div>
        )}

        {/* 7. HELPFUL VISITOR INFORMATION & REGIONAL TIPS */}
        <section
          className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl"
          aria-label="Helpful Vellore Visitor Tips"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <span className="text-[11px] font-extrabold text-blue-300 uppercase tracking-wider block mb-1">
                Traveler Advisory & Guidelines
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-heading">
                Planning Your Vellore Sightseeing
              </h3>
            </div>

            {onOpenCabBooking && (
              <button
                type="button"
                onClick={onOpenCabBooking}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto shrink-0"
              >
                <span>🚕</span>
                <span>Book Local Sightseeing Cab</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs text-slate-300">
            <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 font-bold text-white">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Best Timing & Weather</span>
              </div>
              <p className="leading-relaxed text-slate-300">
                October through March offers pleasant mornings and cool breezes. Fort exploration is best scheduled between 8:30 AM and 11:30 AM before afternoon peak heat.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Temple & Heritage Etiquette</span>
              </div>
              <p className="leading-relaxed text-slate-300">
                Sripuram and Jalakandeswarar temples require traditional modest attire. Mobile phones and electronic items are strictly prohibited inside the Sripuram inner sanctum.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 font-bold text-white">
                <Car className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Local Transit & Parking</span>
              </div>
              <p className="leading-relaxed text-slate-300">
                Katpadi Junction (6.5 km) connects Chennai and Bengaluru rail routes. Autos and local buses connect Old Bus Stand directly to Sripuram (Bagayam corridor).
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* QUICK VIEW PREVIEW MODAL */}
      <AttractionDetailPreviewModal
        attraction={selectedAttraction}
        onClose={() => setSelectedAttraction(null)}
        onOpenCabBooking={onOpenCabBooking}
        onNavigateDetail={onSelectAttractionSlug}
      />
    </div>
  );
};
