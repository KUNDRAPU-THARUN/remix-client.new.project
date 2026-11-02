import React from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  MessageSquare,
  PlusCircle,
  Eye,
  Phone,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Listing, UserAccount, CityConfig } from '../../../types';
import { CustomerEnquiry } from '../../../services/enquiryService';
import { DashboardStatCard } from '../DashboardStatCard';
import { DashboardTab } from '../DashboardSidebar';

interface OverviewPageProps {
  currentUser: UserAccount;
  userListings: Listing[];
  enquiries: CustomerEnquiry[];
  currentCity?: CityConfig;
  onSelectTab: (tab: DashboardTab) => void;
  onOpenPostAd: () => void;
  onPreviewListing: (listing: Listing) => void;
  onEditListing: (listing: Listing) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  currentUser,
  userListings,
  enquiries,
  currentCity,
  onSelectTab,
  onOpenPostAd,
  onPreviewListing,
  onEditListing,
}) => {
  const cityName = currentCity?.name || 'Chittoor';
  const cityCode = currentCity?.code || 'AP-03';

  const activeCount = userListings.filter((l) => (l.status || 'Active') === 'Active').length;
  const pendingCount = userListings.filter((l) => l.status === 'Pending Approval').length;
  const unreadEnquiries = enquiries.filter((e) => e.status === 'pending').length;
  const totalViews = userListings.reduce((sum, l) => sum + (l.viewsCount || 0), 0);

  const recentListings = [...userListings]
    .sort((a, b) => new Date(b.postedDate || '').getTime() - new Date(a.postedDate || '').getTime())
    .slice(0, 3);

  const recentEnquiries = [...enquiries]
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* 1. Welcome Greeting Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-bold text-blue-200 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Merchant Account • {cityName} ({cityCode})</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
              Namaste, {currentUser.name}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Welcome to your business dashboard. You have <strong>{userListings.length} listing{userListings.length === 1 ? '' : 's'}</strong> registered and <strong>{enquiries.length} customer lead{enquiries.length === 1 ? '' : 's'}</strong> received across the {cityName} local directory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenPostAd}
              className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-red-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Post New Business Ad</span>
            </button>
            <button
              onClick={() => onSelectTab('enquiries')}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/15 transition flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>View Inquiries ({unreadEnquiries} New)</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. Genuine Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          title="Total Registered Ads"
          value={userListings.length}
          subtext="Owned by this business account"
          icon={Building2}
          variant="blue"
          onClick={() => onSelectTab('listings')}
        />
        <DashboardStatCard
          title="Active & Published"
          value={activeCount}
          subtext="Publicly discoverable on directory"
          icon={CheckCircle2}
          variant="emerald"
          onClick={() => onSelectTab('listings')}
        />
        <DashboardStatCard
          title="Pending Franchise Review"
          value={pendingCount}
          subtext="Awaiting local territory verification"
          icon={Clock}
          variant="amber"
          onClick={() => onSelectTab('listings')}
        />
        <DashboardStatCard
          title="Customer Leads"
          value={enquiries.length}
          subtext={`${unreadEnquiries} awaiting response`}
          icon={MessageSquare}
          variant="red"
          onClick={() => onSelectTab('enquiries')}
        />
      </div>

      {/* 3. Franchise Moderation Lifecycle Guidance */}
      {pendingCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-amber-950">
              {pendingCount} Listing{pendingCount === 1 ? ' is' : 's are'} currently undergoing review
            </h4>
            <p className="text-amber-800 leading-relaxed">
              To protect local consumers against spam, new submissions are moderated by the KAARYAN LABS {cityName} franchise team within 24 hours. Once verified, your phone number and address will become live on the public directory.
            </p>
          </div>
        </div>
      )}

      {/* 4. Split Preview: Recent Listings & Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Listings */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-black text-sm sm:text-base text-slate-900 font-heading">
                Recent Business Listings
              </h3>
            </div>
            <button
              onClick={() => onSelectTab('listings')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition cursor-pointer"
            >
              <span>View All ({userListings.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentListings.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentListings.map((listing) => {
                const status = listing.status || 'Active';
                return (
                  <div key={listing.id} className="py-3.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={listing.images[0] || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=200&q=80'}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {listing.title}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate mt-0.5">
                          <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                          <span>{listing.address}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {status === 'Active' ? 'Live' : 'Review'}
                      </span>
                      <button
                        onClick={() => onPreviewListing(listing)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No listings posted yet.</p>
              <button
                onClick={onOpenPostAd}
                className="text-xs font-bold text-red-600 hover:text-red-700"
              >
                + Post your first ad now
              </button>
            </div>
          )}
        </div>

        {/* Right: Recent Enquiries */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-600" />
              <h3 className="font-black text-sm sm:text-base text-slate-900 font-heading">
                Recent Customer Leads
              </h3>
            </div>
            <button
              onClick={() => onSelectTab('enquiries')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition cursor-pointer"
            >
              <span>View All ({enquiries.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentEnquiries.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentEnquiries.map((enq) => (
                <div key={enq.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {enq.customerName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        enq.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : enq.status === 'replied'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {enq.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 italic bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                    "{enq.message}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <a
                      href={`tel:${enq.customerPhone.replace(/\D/g, '')}`}
                      className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{enq.customerPhone}</span>
                    </a>
                    <span className="text-slate-400">
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No customer leads received yet.</p>
              <p className="text-[11px] text-slate-400">
                Customer inquiries from your directory profile will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Merchant Onboarding Guide */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-black text-sm sm:text-base text-slate-900 font-heading">
            Merchant Best Practices for Maximum Local Customer Leads
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="font-bold text-xs text-slate-900">Add Complete Address</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Include exact street, landmark, and pin code so nearby customers can easily locate your store.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="font-bold text-xs text-slate-900">Clear Storefront Photos</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Listings with real signboard and interior photos receive 3x more direct customer phone inquiries.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="font-bold text-xs text-slate-900">Specify Business Timings</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Customers in {cityName} frequently check open hours before traveling or booking services.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">
              4
            </div>
            <h4 className="font-bold text-xs text-slate-900">Respond Promptly to Leads</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Check incoming inquiries daily and call back prospective buyers to convert local interest into sales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

