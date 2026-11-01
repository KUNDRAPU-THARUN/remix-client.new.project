import React, { useState } from 'react';
import { 
  Listing, 
  UserAccount,
  CityConfig
} from '../types';
import { 
  PlusCircle, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Building2, 
  MapPin, 
  ArrowLeft,
  TrendingUp,
  ShieldAlert,
  LogIn,
  UserCheck
} from 'lucide-react';
import { CHITTOOR_CATEGORIES, CHITTOOR_AREAS } from '../data/mockData';

interface UserDashboardProps {
  currentUser: UserAccount | null;
  userListings: Listing[];
  onOpenPostAd: () => void;
  onPreviewListing: (listing: Listing) => void;
  onDeleteListing: (id: string) => void;
  onBackToHome: () => void;
  onOpenLogin?: () => void;
  currentCity?: CityConfig;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  userListings,
  onOpenPostAd,
  onPreviewListing,
  onDeleteListing,
  onBackToHome,
  onOpenLogin,
  currentCity,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'Active' | 'Pending Approval'>('all');
  const cityName = currentCity?.name || 'Chittoor';
  const cityCode = currentCity?.code || 'AP-03';

  // Anonymous / Logged-out state
  if (!currentUser) {
    return (
      <div className="bg-slate-50 min-h-screen pb-16">
        <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 border-b border-slate-800">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={onBackToHome}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
              Business Owner Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Sign in to manage your local business listings and performance metrics
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pt-12 text-center">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <LogIn className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 font-heading">
              Sign In Required
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              You are currently viewing the Business Owner Dashboard as an anonymous visitor. To protect merchant privacy and listing ownership, please sign in with your Provider demo account to access your listings.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              {onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition cursor-pointer"
                >
                  Sign In to Access Dashboard →
                </button>
              )}
              <button
                onClick={onBackToHome}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
              >
                Back to Public Directory
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Customer role limitation state
  if (currentUser.role === 'customer') {
    return (
      <div className="bg-slate-50 min-h-screen pb-16">
        <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 border-b border-slate-800">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={onBackToHome}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
              Business Owner Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Signed in as <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pt-12 text-center">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <UserCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 font-heading">
              Customer Account Active
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              You are signed in as a <strong>Customer</strong> account. The Business Owner Dashboard is reserved for verified merchant and service provider profiles to manage company listings, inquiries, and reviews.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              {onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition cursor-pointer"
                >
                  Switch to Provider Account →
                </button>
              )}
              <button
                onClick={onBackToHome}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Provider View
  const filtered = activeFilter === 'all'
    ? userListings
    : userListings.filter((l) => (l.status || 'Active') === activeFilter);

  const totalViews = userListings.reduce((sum, l) => sum + (l.viewsCount || 0), 0);
  const activeCount = userListings.filter((l) => (l.status || 'Active') === 'Active').length;
  const pendingCount = userListings.filter((l) => l.status === 'Pending Approval').length;

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={onBackToHome}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
                My Ads & Business Listings
              </h1>
              <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full font-bold">
                {cityName} ({cityCode})
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Logged in as <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})
            </p>
          </div>

          <button
            onClick={onOpenPostAd}
            className="self-start sm:self-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Post New Ad</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Prototype Transparency Notice */}
        <div className="mb-6 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded">
              Prototype Notice
            </span>
            <span>
              Listing changes are stored in this browser session. Cloud synchronization and multi-tenant database isolation arrive in Phase 2B.
            </span>
          </div>
          <span className="text-blue-700 font-semibold">
            Account: {currentUser.username} ({userListings.length} owned)
          </span>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Total Posted Ads
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-black text-slate-900 font-heading">
                {userListings.length}
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Owned by this merchant account</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Active / Live Listings
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-black text-emerald-600 font-heading">
                {activeCount}
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Publicly searchable across directory</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Pending / Under Review
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-black text-amber-600 font-heading">
                {pendingCount}
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting city franchise approval</p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Listings ({userListings.length})
            </button>
            <button
              onClick={() => setActiveFilter('Active')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFilter === 'Active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Active / Live ({activeCount})
            </button>
            <button
              onClick={() => setActiveFilter('Pending Approval')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFilter === 'Pending Approval'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Pending Approval ({pendingCount})
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Demo Safeguard: Only listings owned by {currentUser.username} can be deleted
          </span>
        </div>

        {/* Listings Table / Card Container */}
        {filtered.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Ad Title & Details</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Area / Location</th>
                    <th className="py-3.5 px-4">Date Posted</th>
                    <th className="py-3.5 px-4">Views</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => {
                    const catName = CHITTOOR_CATEGORIES.find((c) => c.id === item.category)?.name || item.category;
                    const areaName = CHITTOOR_AREAS.find((a) => a.id === item.area)?.name || item.area;
                    const status = item.status || 'Active';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.images[0] || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80'}
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 text-sm line-clamp-1">
                                {item.title}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                {item.address}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {catName}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-500" />
                            {areaName}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {item.postedDate}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          <span>{item.viewsCount || 0}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {status === 'Active' ? 'Active / Live' : 'Under Review'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onPreviewListing(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Preview Listing"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteListing(item.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete Ad"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              {activeFilter === 'all' 
                ? 'No Listings Found for this Account'
                : `No ${activeFilter} Listings Found`}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Post your business or service ad on ChittoorAds to reach local customers across the district.
            </p>
            <button
              onClick={onOpenPostAd}
              className="mt-4 px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-red-700 transition cursor-pointer"
            >
              + Post Your First Ad
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
