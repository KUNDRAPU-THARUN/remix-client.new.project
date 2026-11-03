import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Eye,
  MapPin,
  Phone,
  Mail,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Search,
  Filter,
  Check,
  X,
  Building2,
  Calendar,
} from 'lucide-react';
import { Listing, CityConfig } from '../../../types';

interface FranchiseApprovalsPageProps {
  pendingListings: Listing[];
  currentCity: CityConfig;
  onApproveListing: (listingId: string, options?: { isVerified?: boolean; isFeatured?: boolean }) => Promise<void>;
  onRejectListing: (listingId: string, reason: string) => Promise<void>;
  onPreviewListing: (listing: Listing) => void;
  isLoading: boolean;
}

export const FranchiseApprovalsPage: React.FC<FranchiseApprovalsPageProps> = ({
  pendingListings,
  currentCity,
  onApproveListing,
  onRejectListing,
  onPreviewListing,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal States
  const [rejectingListing, setRejectingListing] = useState<Listing | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Incomplete or unverifiable business contact details');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Approval Options Modal
  const [approvingListing, setApprovingListing] = useState<Listing | null>(null);
  const [grantVerified, setGrantVerified] = useState(true);
  const [grantFeatured, setGrantFeatured] = useState(false);

  // Inspection Drawer
  const [inspectingListing, setInspectingListing] = useState<Listing | null>(null);

  const categories = Array.from(new Set(pendingListings.map((l) => l.category)));

  const filtered = pendingListings.filter((l) => {
    if (selectedCategory !== 'all' && l.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.address.toLowerCase().includes(q) ||
        l.area.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleConfirmApproval = async () => {
    if (!approvingListing) return;
    setIsSubmitting(true);
    try {
      await onApproveListing(approvingListing.id, {
        isVerified: grantVerified,
        isFeatured: grantFeatured,
      });
      setApprovingListing(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRejection = async () => {
    if (!rejectingListing) return;
    const finalReason = customReason.trim() ? customReason.trim() : rejectionReason;
    setIsSubmitting(true);
    try {
      await onRejectListing(rejectingListing.id, finalReason);
      setRejectingListing(null);
      setCustomReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 font-heading">
              Pending Business Submissions
            </h2>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
              {pendingListings.length} Awaiting Review
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Carefully verify merchant information, operating territory, and documentation before approving into {currentCity.name}.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-red-500"
            />
          </div>

          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90">
          <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-600">Loading pending submissions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-slate-200/90 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900 font-heading">
            Zero Pending Approvals in {currentCity.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            All submitted listings in {currentCity.name} ({currentCity.code}) have been reviewed and processed.
            When local merchants register, they will appear here immediately.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                {/* Image and Basic Info */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 relative">
                    <img
                      src={listing.images[0] || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80'}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-slate-900/80 text-white px-1.5 py-0.5 rounded backdrop-blur-xs">
                      {listing.images.length} photos
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 font-heading truncate">
                        {listing.title}
                      </h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {listing.category}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Pending Verification
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {listing.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{listing.area}, {listing.address}</span>
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{listing.phone}</span>
                      </span>
                      {listing.email && (
                        <span className="flex items-center gap-1 font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{listing.email}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-medium text-[11px] text-slate-400">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>Submitted {listing.postedDate}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Moderation Action Buttons */}
                <div className="flex sm:flex-col lg:flex-row items-center gap-2.5 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => onPreviewListing(listing)}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>

                  <button
                    onClick={() => {
                      setRejectingListing(listing);
                      setRejectionReason('Incomplete or unverifiable business contact details');
                    }}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => {
                      setApprovingListing(listing);
                      setGrantVerified(true);
                      setGrantFeatured(false);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {approvingListing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-heading">
                  Approve Listing Publication
                </h3>
                <p className="text-xs text-slate-500">
                  {approvingListing.title} ({currentCity.code})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This business will become immediately discoverable across {currentCity.name}&apos;s public directory, category search, and AI assistant.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={grantVerified}
                  onChange={(e) => setGrantVerified(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Grant Verified Merchant Badge (Recommended)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={grantFeatured}
                  onChange={(e) => setGrantFeatured(e.target.checked)}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span>Feature in City Top Showcase Carousel</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setApprovingListing(null)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'Approving...' : 'Confirm Approval'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingListing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-heading">
                  Reject Business Listing
                </h3>
                <p className="text-xs text-slate-500">
                  {rejectingListing.title}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Reason for Rejection
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden cursor-pointer"
                >
                  <option value="Incomplete or unverifiable business contact details">
                    Incomplete or unverifiable business contact details
                  </option>
                  <option value="Out of operating territory (Business is outside registered city)">
                    Out of operating territory (Business is outside registered city)
                  </option>
                  <option value="Duplicate listing already published in directory">
                    Duplicate listing already published in directory
                  </option>
                  <option value="Prohibited services or regulatory compliance violation">
                    Prohibited services or regulatory compliance violation
                  </option>
                  <option value="Unclear, misleading, or low-quality storefront photos">
                    Unclear, misleading, or low-quality storefront photos
                  </option>
                  <option value="other">Other reason (specify below)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Notes for Merchant (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="e.g. Please update your 10-digit mobile number and provide shop front image..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingListing(null)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejection}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition cursor-pointer"
              >
                {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

