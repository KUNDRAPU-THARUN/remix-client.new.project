import React, { useMemo } from 'react';
import { 
  Listing, 
  Category, 
  Area 
} from '../types';
import { 
  CHITTOOR_CATEGORIES, 
  CHITTOOR_AREAS 
} from '../data/mockData';
import { ListingCard } from './ListingCard';
import { 
  Search, 
  MapPin, 
  Star, 
  CheckCircle, 
  Clock, 
  RotateCcw, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Building2,
  PlusCircle,
  ArrowLeft
} from 'lucide-react';

export interface ResultsFilters {
  searchQuery: string;
  selectedArea: string;
  verifiedOnly: boolean;
  minRating: number;
  sortBy: 'rating' | 'popular' | 'latest';
}

interface CategoryResultsPageProps {
  activeCategoryId: string;
  onSelectCategory: (catId: string) => void;
  listings: Listing[];
  savedListingIds: string[];
  onToggleSave: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
  onBackToHome: () => void;
  onOpenPostAd: () => void;
  savedOnly: boolean;
  filters: ResultsFilters;
  onFiltersChange: (filters: ResultsFilters) => void;
}

export const CategoryResultsPage: React.FC<CategoryResultsPageProps> = ({
  activeCategoryId,
  onSelectCategory,
  listings,
  savedListingIds,
  onToggleSave,
  onSelectListing,
  onBackToHome,
  onOpenPostAd,
  savedOnly,
  filters,
  onFiltersChange,
}) => {
  const { searchQuery, selectedArea, verifiedOnly, minRating, sortBy } = filters;
  const setSearchQuery = (searchQuery: string) => onFiltersChange({ ...filters, searchQuery });
  const setSelectedArea = (selectedArea: string) => onFiltersChange({ ...filters, selectedArea });
  const setVerifiedOnly = (verifiedOnly: boolean) => onFiltersChange({ ...filters, verifiedOnly });
  const setMinRating = (minRating: number) => onFiltersChange({ ...filters, minRating });
  const setSortBy = (sortBy: ResultsFilters['sortBy']) => onFiltersChange({ ...filters, sortBy });
  const savedIds = useMemo(() => new Set(savedListingIds), [savedListingIds]);

  // Find active category metadata
  const currentCategory = useMemo(() => {
    return CHITTOOR_CATEGORIES.find((c) => c.id === activeCategoryId) || {
      id: 'all',
      name: 'All Categories',
      nameTe: 'అన్ని విభాగాలు',
      description: 'Explore verified local businesses, stores, and services in Chittoor.',
      count: listings.length,
    };
  }, [activeCategoryId, listings.length]);

  // Filter listings by active category, location, rating, and verified status
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      if (savedOnly && !savedIds.has(l.id)) return false;
      // Category filter
      if (activeCategoryId !== 'all' && l.category !== activeCategoryId) {
        return false;
      }

      // Area filter
      if (selectedArea !== 'all' && l.area !== selectedArea) {
        return false;
      }

      // Verified filter
      if (verifiedOnly && !l.isVerified) {
        return false;
      }

      // Min rating filter
      if (minRating > 0 && l.rating < minRating) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = l.title.toLowerCase().includes(q);
        const matchDesc = l.description.toLowerCase().includes(q);
        const matchAddr = l.address.toLowerCase().includes(q);
        const matchServices = l.services.some((s) => s.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchAddr && !matchServices) {
          return false;
        }
      }

      return true;
    });
  }, [listings, activeCategoryId, selectedArea, verifiedOnly, minRating, searchQuery, savedOnly, savedIds]);

  // Sort listings
  const sortedListings = useMemo(() => {
    const list = [...filteredListings];
    if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'popular') {
      list.sort((a, b) => b.reviewsCount - a.reviewsCount);
    } else {
      list.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
    }
    return list;
  }, [filteredListings, sortBy]);

  const resetFilters = () => {
    onFiltersChange({ searchQuery: '', selectedArea: 'all', verifiedOnly: false, minRating: 0, sortBy: 'rating' });
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Category Results Page Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-8 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <button
                onClick={onBackToHome}
                className="hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
              <span>/</span>
              <span className="text-slate-300">Category Directory</span>
              <span>/</span>
              <span className="text-red-400 font-bold">{currentCategory.name}</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading text-white tracking-tight">
                {currentCategory.name}
              </h1>
              <span className="text-xs font-bold bg-red-600 text-white px-2.5 py-1 rounded-full shadow-xs">
                {sortedListings.length} Listed
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {currentCategory.description}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenPostAd}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Your Business Here</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* LEFT SIDEBAR (w-72 or w-80 fixed width) */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            
            {/* 1. CATEGORIES / MODULES Vertical Selection Widget */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold tracking-wider uppercase">
                    Categories / Modules
                  </h3>
                  <p className="text-[11px] text-slate-400">Select module to switch results</p>
                </div>
                <span className="text-xs bg-red-600 font-bold px-2 py-0.5 rounded text-white">
                  {CHITTOOR_CATEGORIES.length} Modules
                </span>
              </div>

              {/* Vertical Module Radio-Item List */}
              <div className="p-2 max-h-[460px] overflow-y-auto space-y-1">
                {/* All Categories Option */}
                <button
                  onClick={() => onSelectCategory('all')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between text-xs font-semibold cursor-pointer ${
                    activeCategoryId === 'all'
                      ? 'bg-red-600 text-white shadow-xs font-bold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                      activeCategoryId === 'all' ? 'border-white bg-white' : 'border-slate-400'
                    }`}>
                      {activeCategoryId === 'all' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      )}
                    </span>
                    <span>All Chittoor Directory</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    activeCategoryId === 'all' ? 'bg-red-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {listings.length}
                  </span>
                </button>

                {CHITTOOR_CATEGORIES.map((cat) => {
                  const isActive = activeCategoryId === cat.id;
                  const countForCat = listings.filter((l) => l.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => onSelectCategory(cat.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between text-xs cursor-pointer ${
                        isActive
                          ? 'bg-red-600 text-white shadow-xs font-bold'
                          : 'hover:bg-slate-100 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate mr-2">
                        {/* Radio indicator */}
                        <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isActive ? 'border-white bg-white' : 'border-slate-300'
                        }`}>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                          )}
                        </span>
                        <span className="truncate">{cat.name}</span>
                      </div>

                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                        isActive ? 'bg-red-700 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {countForCat}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. FILTER RESULTS PANEL */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-red-600" />
                  <h3 className="font-bold text-sm text-slate-900 font-heading">Filter Results</h3>
                </div>
                {(searchQuery || selectedArea !== 'all' || verifiedOnly || minRating > 0) && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Keyword Search Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Search in {currentCategory.name}
                </label>
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Doctor, AC, Biryani..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500 outline-hidden font-medium"
                  />
                </div>
              </div>

              {/* Location / Area Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Location / Area in Chittoor
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-red-500 absolute left-3 top-2.5 pointer-events-none" />
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500 outline-hidden font-medium cursor-pointer"
                  >
                    {CHITTOOR_AREAS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Verified Only Checkbox */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded accent-emerald-600 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Listings Only
                    </span>
                    <p className="text-[10px] text-slate-400">Phone & address verified</p>
                  </div>
                </label>
              </div>

              {/* Rating 4+ Stars Filter */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Minimum Rating
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    onClick={() => setMinRating(0)}
                    className={`py-1.5 px-2 rounded-lg font-semibold border transition ${
                      minRating === 0
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All Ratings
                  </button>
                  <button
                    onClick={() => setMinRating(4)}
                    className={`py-1.5 px-2 rounded-lg font-semibold border transition flex items-center justify-center gap-1 ${
                      minRating === 4
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>4.0+ Stars</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Helpline Assistance Box */}
            <div className="p-4 bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl text-white shadow-sm">
              <h4 className="font-bold text-sm">Need help finding a service?</h4>
              <p className="text-xs text-red-100 mt-1">
                WhatsApp our Chittoor Helpdesk directly for personalized recommendations.
              </p>
              <a
                href="https://wa.me/919440218456?text=Hi%20ChittoorAds,%20I%20need%20help%20finding%20a%20service"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block px-3.5 py-1.5 bg-white text-red-700 text-xs font-bold rounded-xl shadow-xs hover:bg-red-50 transition"
              >
                Chat on WhatsApp
              </a>
            </div>
          </aside>

          {/* RIGHT COLUMN: BUSINESS SEARCH RESULTS */}
          <div className="flex-1 w-full min-w-0">
            {/* Top Bar with Sort Dropdown */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <p className="text-xs text-slate-500">
                  Showing <strong className="text-slate-900">{sortedListings.length}</strong> businesses in{' '}
                  <strong className="text-red-600">{currentCategory.name}</strong>
                  {selectedArea !== 'all' && (
                    <span> • {CHITTOOR_AREAS.find((a) => a.id === selectedArea)?.name}</span>
                  )}
                </p>
              </div>

              {/* Sort Control */}
              <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
                <span className="font-semibold text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as ResultsFilters['sortBy'])}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-700 outline-hidden cursor-pointer"
                >
                  <option value="rating">Top Rated (Highest Stars)</option>
                  <option value="popular">Most Reviewed</option>
                  <option value="latest">Newly Listed</option>
                </select>
              </div>
            </div>

            {/* Business Listings Grid */}
            {sortedListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isSaved={savedListingIds.includes(listing.id)}
                    onToggleSave={onToggleSave}
                    onSelect={onSelectListing}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-heading">
                  No listings found in {currentCategory.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
                  Try clearing your search query, choosing "All Locations", or be the first to list a business in this sector!
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={onOpenPostAd}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ List Your Business</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
