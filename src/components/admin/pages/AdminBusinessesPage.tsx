import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { Listing, CityId } from '../../../types';
import { CITIES } from '../../../config/cities';
import { getCityCategories } from '../../../config/categories';

export interface AdminBusinessesPageProps {
  businesses: Listing[];
  activeCityFilter: CityId | 'all';
  onSelectCityFilter: (cityId: CityId | 'all') => void;
  onApproveListing: (listingId: string, cityId: CityId) => Promise<void>;
  onRejectListing: (listingId: string, cityId: CityId, reason: string) => Promise<void>;
  onToggleVerified: (listingId: string, cityId: CityId, currentVerified: boolean) => Promise<void>;
  onToggleFeatured: (listingId: string, cityId: CityId, currentFeatured: boolean) => Promise<void>;
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 8;

export const AdminBusinessesPage: React.FC<AdminBusinessesPageProps> = ({
  businesses,
  activeCityFilter,
  onSelectCityFilter,
  onApproveListing,
  onRejectListing,
  onToggleVerified,
  onToggleFeatured,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'rejected'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Rejection Modal State
  const [rejectingListing, setRejectingListing] = useState<Listing | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Listing Preview Modal State
  const [previewListing, setPreviewListing] = useState<Listing | null>(null);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      // 1. City filter
      if (activeCityFilter !== 'all' && (b.cityId || 'chittoor') !== activeCityFilter) {
        return false;
      }
      // 2. Status filter
      if (statusFilter !== 'all') {
        const isPending = b.status === 'Pending Approval';
        const isRejected = b.status === 'Expired';
        const isActive = !isPending && !isRejected;

        if (statusFilter === 'pending' && !isPending) return false;
        if (statusFilter === 'rejected' && !isRejected) return false;
        if (statusFilter === 'active' && !isActive) return false;
      }
      // 3. Category filter
      if (categoryFilter !== 'all' && b.category !== categoryFilter) {
        return false;
      }
      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          b.phone.includes(q) ||
          b.address.toLowerCase().includes(q) ||
          b.area.toLowerCase().includes(q) ||
          (b.category && b.category.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [businesses, activeCityFilter, statusFilter, categoryFilter, searchQuery]);

  const totalPages = Math.ceil(filteredBusinesses.length / ITEMS_PER_PAGE) || 1;
  const paginatedBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleApprove = async (listing: Listing) => {
    try {
      setActionLoadingId(listing.id);
      await onApproveListing(listing.id, listing.cityId || 'chittoor');
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingListing) return;
    if (!rejectionReason.trim()) {
      setRejectError('Please provide a specific reason for rejection.');
      return;
    }

    try {
      setActionLoadingId(rejectingListing.id);
      await onRejectListing(rejectingListing.id, rejectingListing.cityId || 'chittoor', rejectionReason.trim());
      setRejectingListing(null);
      setRejectionReason('');
      setRejectError(null);
    } catch (err: any) {
      setRejectError(err.message || 'Failed to reject listing');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleVerified = async (listing: Listing) => {
    try {
      setActionLoadingId(listing.id);
      await onToggleVerified(listing.id, listing.cityId || 'chittoor', Boolean(listing.isVerified));
    } catch (err) {
      console.error('Toggle verified failed:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleFeatured = async (listing: Listing) => {
    try {
      setActionLoadingId(listing.id);
      await onToggleFeatured(listing.id, listing.cityId || 'chittoor', Boolean(listing.isFeatured));
    } catch (err) {
      console.error('Toggle featured failed:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Central Business Registry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
            Global Multi-City Listings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Oversee storefront directory records across all regional platforms. All moderation actions execute atomically through <code className="text-slate-700 font-mono text-[11px]">moderate_business_listing</code> PostgreSQL RPC with audit logging.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-700">
            Total Listings: <span className="text-slate-900 font-black">{businesses.length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search title, phone, locality..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* City Filter */}
          <div>
            <select
              value={activeCityFilter}
              onChange={(e) => {
                onSelectCityFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
            >
              <option value="all">All Cities (Global)</option>
              <option value="chittoor">Chittoor (AP-03)</option>
              <option value="vellore">Vellore (TN-23)</option>
              <option value="bengaluru">Bengaluru (KA-01)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="pending">Pending Approvals</option>
              <option value="rejected">Rejected / Expired</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
            >
              <option value="all">All Categories</option>
              {getCityCategories('chittoor').map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Business / Storefront</th>
                <th className="py-3.5 px-4">City</th>
                <th className="py-3.5 px-4">Category & Area</th>
                <th className="py-3.5 px-4">Badges</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No business listings match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedBusinesses.map((b) => {
                  const cityConfig = CITIES[b.cityId || 'chittoor'];
                  const isPending = b.status === 'Pending Approval';
                  const isRejected = b.status === 'Expired';
                  const isWorking = actionLoadingId === b.id;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition">
                      {/* Business / Title */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={b.images && b.images[0] ? b.images[0] : 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100'}
                            alt={b.title}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate max-w-xs">
                              {b.title}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{b.phone}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* City */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{cityConfig.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({cityConfig.code})</span>
                        </span>
                      </td>

                      {/* Category & Area */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{b.category}</div>
                        <div className="text-[11px] text-slate-400">{b.area}</div>
                      </td>

                      {/* Badges Toggle */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {/* Verified Toggle */}
                          <button
                            disabled={isWorking}
                            onClick={() => handleToggleVerified(b)}
                            title={b.isVerified ? 'Remove Verified Badge' : 'Add Verified Badge'}
                            className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              b.isVerified
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span className="text-[10px]">{b.isVerified ? 'Verified' : 'Verify'}</span>
                          </button>

                          {/* Featured Toggle */}
                          <button
                            disabled={isWorking}
                            onClick={() => handleToggleFeatured(b)}
                            title={b.isFeatured ? 'Remove Featured Placement' : 'Make Featured'}
                            className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              b.isFeatured
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5" />
                            <span className="text-[10px]">{b.isFeatured ? 'Featured' : 'Feature'}</span>
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending Approval</span>
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            <span>Rejected</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Moderation Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewListing(b)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                            title="Preview listing details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isPending && (
                            <>
                              <button
                                disabled={isWorking}
                                onClick={() => handleApprove(b)}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                disabled={isWorking}
                                onClick={() => {
                                  setRejectingListing(b);
                                  setRejectionReason('');
                                  setRejectError(null);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="font-bold text-slate-800">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredBusinesses.length)}
              </span>{' '}
              of <span className="font-bold text-slate-800">{filteredBusinesses.length}</span> listings
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-white transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-800">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-white transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5 text-red-600 font-bold font-heading">
                <AlertCircle className="w-5 h-5" />
                <span>Reject Storefront Listing</span>
              </div>
              <button
                onClick={() => setRejectingListing(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              You are rejecting <span className="font-bold text-slate-900">{rejectingListing.title}</span> ({CITIES[rejectingListing.cityId || 'chittoor'].name}). Please provide a clear reason for the business owner:
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete business address, blurred storefront photograph, or unverified phone number."
              rows={3}
              className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-600 mb-2"
            />

            {rejectError && (
              <p className="text-xs text-red-600 font-bold mb-3">{rejectError}</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingListing(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={actionLoadingId === rejectingListing.id}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Listing Modal */}
      {previewListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  {CITIES[previewListing.cityId || 'chittoor'].code}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-heading">
                    {previewListing.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {previewListing.category} • {previewListing.area}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewListing(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="h-44 rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={previewListing.images && previewListing.images[0] ? previewListing.images[0] : 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'}
                  alt={previewListing.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700 bg-slate-50 p-3 rounded-2xl">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Phone</span>
                  <span className="font-bold">{previewListing.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Locality</span>
                  <span className="font-bold">{previewListing.area}, {CITIES[previewListing.cityId || 'chittoor'].name}</span>
                </div>
              </div>

              <div className="text-slate-600 bg-slate-50 p-3 rounded-2xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Store Address</span>
                <p>{previewListing.address}</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewListing(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
