import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Star,
  MapPin,
  Phone,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  MoreVertical,
  Check,
  X,
  Clock,
} from 'lucide-react';
import { Listing, CityConfig } from '../../../types';
import { getCityCategories } from '../../../config/categories';

interface FranchiseBusinessesPageProps {
  businesses: Listing[];
  currentCity: CityConfig;
  onPreviewListing: (listing: Listing) => void;
  onToggleVerified: (listingId: string, current: boolean) => Promise<void>;
  onToggleFeatured: (listingId: string, current: boolean) => Promise<void>;
  onRejectListing?: (listingId: string, reason: string) => Promise<void>;
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 8;

export const FranchiseBusinessesPage: React.FC<FranchiseBusinessesPageProps> = ({
  businesses,
  currentCity,
  onPreviewListing,
  onToggleVerified,
  onToggleFeatured,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'rejected'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const cityCategories = useMemo(() => getCityCategories(currentCity.id), [currentCity.id]);
  const localities = useMemo(() => currentCity.localities.filter((a) => a.id !== 'all'), [currentCity.localities]);

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      // 1. Territory isolation check
      if ((b.cityId || 'chittoor') !== currentCity.id) return false;

      // 2. Status filter
      if (statusFilter !== 'all') {
        const currentStatus = b.status === 'Pending Approval' ? 'pending' : (b.status === 'Expired' ? 'rejected' : 'active');
        if (currentStatus !== statusFilter) return false;
      }

      // 3. Category filter
      if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;

      // 4. Area filter
      if (areaFilter !== 'all' && b.area !== areaFilter) return false;

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          b.phone.includes(q) ||
          b.address.toLowerCase().includes(q) ||
          b.area.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [businesses, currentCity.id, statusFilter, categoryFilter, areaFilter, searchQuery]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter, areaFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleToggleVerified = async (listing: Listing) => {
    setActionLoadingId(listing.id);
    try {
      await onToggleVerified(listing.id, listing.isVerified);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleFeatured = async (listing: Listing) => {
    setActionLoadingId(listing.id);
    try {
      await onToggleFeatured(listing.id, Boolean(listing.isFeatured));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search and Filters Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        {/* Row 1: Search & Status Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${currentCity.name} listings by title, phone or locality...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-red-500 transition"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({businesses.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'active' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({businesses.filter((b) => (b.status || 'Active') === 'Active').length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({businesses.filter((b) => b.status === 'Pending Approval').length})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'rejected' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Moderated ({businesses.filter((b) => b.status === 'Expired').length})
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Dropdowns (Category, Locality) */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold text-[11px]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Categories ({cityCategories.length})</option>
              {cityCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold text-[11px]">Locality:</span>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Areas ({localities.length})</option>
              {localities.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || areaFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCategoryFilter('all');
                setAreaFilter('all');
              }}
              className="text-[11px] font-bold text-red-600 hover:text-red-700 underline cursor-pointer ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Businesses Table / List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90">
          <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-600">Loading directory listings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-slate-200/90 shadow-xs">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-900 font-heading">
            No matching businesses found in {currentCity.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, category selection, or locality filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedItems.map((business) => {
            const isPending = business.status === 'Pending Approval';
            const isRejected = business.status === 'Expired';
            const isActive = !isPending && !isRejected;

            return (
              <div
                key={business.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Business Details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                    <img
                      src={business.images[0] || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=300&q=80'}
                      alt={business.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900 font-heading truncate">
                        {business.title}
                      </h4>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {business.category}
                      </span>

                      {/* Status Badge */}
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Published
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                          <X className="w-3 h-3" />
                          Moderated
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{business.area}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{business.phone}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-700">{business.rating || '0.0'}</span>
                        <span>({business.reviewsCount} reviews)</span>
                      </span>
                      {business.viewsCount !== undefined && (
                        <span className="text-[11px] text-slate-400">
                          {business.viewsCount} views
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Moderation Controls */}
                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* Verified Badge Toggle */}
                  <button
                    onClick={() => handleToggleVerified(business)}
                    disabled={actionLoadingId === business.id}
                    title={business.isVerified ? 'Remove Verified Badge' : 'Grant Verified Badge'}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      business.isVerified
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className={`w-3.5 h-3.5 ${business.isVerified ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{business.isVerified ? 'Verified' : 'Verify'}</span>
                  </button>

                  {/* Featured Spotlight Toggle */}
                  <button
                    onClick={() => handleToggleFeatured(business)}
                    disabled={actionLoadingId === business.id}
                    title={business.isFeatured ? 'Remove from Featured' : 'Spotlight in Featured Showcase'}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      business.isFeatured
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${business.isFeatured ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span>{business.isFeatured ? 'Featured' : 'Spotlight'}</span>
                  </button>

                  {/* Inspect / Preview */}
                  <button
                    onClick={() => onPreviewListing(business)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                    title="View Full Public Profile"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200/90 text-xs">
          <span className="text-slate-500 font-medium">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} businesses
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

