import React, { useState } from 'react';
import { 
  Listing, 
  UserAccount 
} from '../types';
import { 
  PlusCircle, 
  Eye, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Phone, 
  MapPin, 
  ArrowLeft,
  Share2,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { CHITTOOR_CATEGORIES, CHITTOOR_AREAS } from '../data/mockData';

interface UserDashboardProps {
  currentUser: UserAccount | null;
  userListings: Listing[];
  onOpenPostAd: () => void;
  onPreviewListing: (listing: Listing) => void;
  onDeleteListing: (id: string) => void;
  onBackToHome: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  userListings,
  onOpenPostAd,
  onPreviewListing,
  onDeleteListing,
  onBackToHome,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'Active' | 'Pending Approval'>('all');

  const filtered = activeFilter === 'all'
    ? userListings
    : userListings.filter((l) => (l.status || 'Active') === activeFilter);

  const totalViews = userListings.reduce((sum, l) => sum + (l.viewsCount || 120), 0);
  const activeCount = userListings.filter((l) => (l.status || 'Active') === 'Active').length;

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={onBackToHome}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
              My Ads & Business Listings
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Logged in as <strong className="text-white">{currentUser?.name || 'Local Merchant (Chittoor)'}</strong> ({currentUser?.email || 'vendor@chittoorads.com'})
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
            <p className="text-[11px] text-slate-400 mt-1">Free listings across Chittoor</p>
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
            <p className="text-[11px] text-slate-400 mt-1">100% verified & searchable</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Total Inquiries & Views
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-black text-slate-900 font-heading">
                {totalViews.toLocaleString()}
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Local customer impressions</p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center justify-between gap-3 mb-4">
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
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline">
            Auto-approved instantly in Developer Mode
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
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            {item.viewsCount || 140}
                          </span>
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
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Preview Listing"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteListing(item.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
              No Ads Found in this filter
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Post your business or service ad for free on ChittoorAds to reach thousands of local customers.
            </p>
            <button
              onClick={onOpenPostAd}
              className="mt-4 px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-red-700 transition"
            >
              + Post Your First Ad
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
