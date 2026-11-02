import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  Filter,
  PlusCircle,
  Eye,
  Edit3,
  Trash2,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  LayoutGrid,
  List,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { Listing, UserAccount, CityConfig } from '../../../types';
import { CHITTOOR_CATEGORIES, CHITTOOR_AREAS } from '../../../data/mockData';
import { DashboardEmptyState } from '../DashboardEmptyState';

interface ListingsPageProps {
  currentUser: UserAccount;
  userListings: Listing[];
  currentCity?: CityConfig;
  onOpenPostAd: () => void;
  onPreviewListing: (listing: Listing) => void;
  onEditListing: (listing: Listing) => void;
  onDeleteListing: (id: string) => void;
}

export const ListingsPage: React.FC<ListingsPageProps> = ({
  currentUser,
  userListings,
  currentCity,
  onOpenPostAd,
  onPreviewListing,
  onEditListing,
  onDeleteListing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Pending Approval'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);

  const cityName = currentCity?.name || 'Chittoor';

  const activeCount = userListings.filter((l) => (l.status || 'Active') === 'Active').length;
  const pendingCount = userListings.filter((l) => l.status === 'Pending Approval').length;

  // Filtered listings
  const filteredListings = useMemo(() => {
    return userListings.filter((item) => {
      // Status filter
      const itemStatus = item.status || 'Active';
      if (statusFilter !== 'all' && itemStatus !== statusFilter) return false;

      // City filter
      if (cityFilter !== 'all' && (item.cityId || 'chittoor') !== cityFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesAddress = item.address.toLowerCase().includes(q);
        const matchesPhone = item.phone.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAddress && !matchesPhone) return false;
      }

      return true;
    });
  }, [userListings, statusFilter, cityFilter, categoryFilter, searchQuery]);

  const confirmDelete = () => {
    if (listingToDelete) {
      onDeleteListing(listingToDelete.id);
      setListingToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black font-heading text-slate-900 tracking-tight">
              Business Directory Listings ({userListings.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified merchant ownership: Only listings posted by {currentUser.name} can be managed here.
            </p>
          </div>

          <button
            onClick={onOpenPostAd}
            className="self-start sm:self-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Listing</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({userListings.length})
            </button>
            <button
              onClick={() => setStatusFilter('Active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'Active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active ({activeCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('Pending Approval')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'Pending Approval'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Review ({pendingCount})</span>
            </button>
          </div>

          {/* Search & Layout Toggles */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, phone, area..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition"
              />
            </div>

            {/* City Select */}
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden"
              aria-label="Filter by City"
            >
              <option value="all">All Cities</option>
              <option value="chittoor">Chittoor (AP-03)</option>
              <option value="vellore">Vellore (TN-23)</option>
              <option value="bengaluru">Bengaluru (KA-01)</option>
            </select>

            {/* Category Select */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              {CHITTOOR_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Grid / Table View Toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-slate-600 transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
                }`}
                title="Table View"
                aria-label="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-slate-600 transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
                }`}
                title="Card View"
                aria-label="Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Listings Content (Table or Grid) */}
      {filteredListings.length > 0 ? (
        viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Business Details</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Locality</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Views</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredListings.map((item) => {
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
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-sm truncate max-w-xs">
                                {item.title}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
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
                            <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                            <span>{areaName}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {item.phone}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {item.viewsCount || 0}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{status === 'Active' ? 'Active / Live' : 'Under Review'}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onPreviewListing(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Preview on Public Directory"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEditListing(item)}
                              className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              title="Edit Listing Details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setListingToDelete(item)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete Listing"
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
          /* Grid Card View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map((item) => {
              const catName = CHITTOOR_CATEGORIES.find((c) => c.id === item.category)?.name || item.category;
              const areaName = CHITTOOR_AREAS.find((a) => a.id === item.area)?.name || item.area;
              const status = item.status || 'Active';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col"
                >
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.images[0] || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                          status === 'Active'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{status === 'Active' ? 'Live' : 'Under Review'}</span>
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{item.viewsCount || 0} views</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                        {catName}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 mt-0.5 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-2">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="truncate">{item.address} ({areaName})</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-600">
                        {item.phone}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onPreviewListing(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditListing(item)}
                          className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setListingToDelete(item)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Empty State */
        <DashboardEmptyState
          icon={Building2}
          title={searchQuery ? 'No Matching Listings Found' : 'No Business Listings Posted Yet'}
          description={
            searchQuery
              ? `We couldn't find any listings matching "${searchQuery}". Try clearing your search or status filter.`
              : `You haven't posted any business listings for ${cityName} yet. Post your business ad to begin reaching local buyers across the city.`
          }
          actionLabel="+ Post Your First Ad"
          onAction={onOpenPostAd}
          secondaryActionLabel={searchQuery || statusFilter !== 'all' ? 'Reset Filters' : undefined}
          onSecondaryAction={() => {
            setSearchQuery('');
            setStatusFilter('all');
            setCategoryFilter('all');
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {listingToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-heading">
                Delete Business Listing?
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Are you sure you want to permanently delete <strong>"{listingToDelete.title}"</strong>? This will remove the listing and its images from the directory.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setListingToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition cursor-pointer"
              >
                Yes, Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

