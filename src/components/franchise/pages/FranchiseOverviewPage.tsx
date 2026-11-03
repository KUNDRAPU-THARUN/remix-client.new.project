import React from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  Inbox,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  MapPin,
  Phone,
  FileCheck2,
  Activity,
  Check,
  X,
  Eye,
} from 'lucide-react';
import { Listing, CityConfig } from '../../../types';
import { FranchiseStats, FranchiseAuditLog } from '../../../services/franchiseService';
import { FranchiseTab } from '../FranchiseSidebar';

interface FranchiseOverviewPageProps {
  stats: FranchiseStats;
  pendingListings: Listing[];
  auditLogs: FranchiseAuditLog[];
  currentCity: CityConfig;
  onNavigateTab: (tab: FranchiseTab) => void;
  onApproveListing: (listingId: string) => void;
  onRejectListing: (listingId: string) => void;
  onPreviewListing: (listing: Listing) => void;
}

export const FranchiseOverviewPage: React.FC<FranchiseOverviewPageProps> = ({
  stats,
  pendingListings,
  auditLogs,
  currentCity,
  onNavigateTab,
  onApproveListing,
  onRejectListing,
  onPreviewListing,
}) => {
  const cityName = currentCity.name;
  const cityCode = currentCity.code;

  return (
    <div className="space-y-6">
      {/* Territory Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-red-500/30">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>{cityName} Regional Operations • {cityCode}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black font-heading tracking-tight text-white">
              Welcome to the {currentCity.brandName} Control Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Oversee local merchant onboarding, moderate business profiles, dispatch consumer service quotes, and manage certified regional directory listings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => onNavigateTab('approvals')}
              className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-gradient-to-r from-[#E51E31] to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs shadow-md shadow-red-500/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Review Approvals ({stats.pendingApprovals})</span>
            </button>
            <button
              onClick={() => onNavigateTab('enquiries')}
              className="px-4 py-2.5 sm:py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-sm border border-white/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Inbox className="w-4 h-4" />
              <span>Lead Inbox ({stats.totalEnquiries})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Listings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-500">Total City Listings</p>
            <p className="text-2xl font-black text-slate-900 font-heading tracking-tight mt-0.5">
              {stats.totalListings}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Across {stats.activeCategories} categories in {cityCode}
            </p>
          </div>
        </div>

        {/* Card 2: Active Verified */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-500">Active & Published</p>
            <p className="text-2xl font-black text-slate-900 font-heading tracking-tight mt-0.5">
              {stats.activeListings}
            </p>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
              {stats.verifiedBusinesses} with verified badge
            </p>
          </div>
        </div>

        {/* Card 3: Pending Approvals */}
        <div
          onClick={() => onNavigateTab('approvals')}
          className={`bg-white rounded-2xl p-5 border shadow-xs flex items-center gap-4 cursor-pointer transition ${
            stats.pendingApprovals > 0
              ? 'border-red-200 hover:border-red-400 bg-red-50/20'
              : 'border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              stats.pendingApprovals > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-500">Pending Approvals</p>
            <p className="text-2xl font-black text-slate-900 font-heading tracking-tight mt-0.5 flex items-center gap-2">
              <span>{stats.pendingApprovals}</span>
              {stats.pendingApprovals > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse">
                  Action Required
                </span>
              )}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Awaiting compliance review
            </p>
          </div>
        </div>

        {/* Card 4: Total Enquiries */}
        <div
          onClick={() => onNavigateTab('enquiries')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4 cursor-pointer hover:border-slate-300 transition"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Inbox className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-500">Customer Leads & Quotes</p>
            <p className="text-2xl font-black text-slate-900 font-heading tracking-tight mt-0.5">
              {stats.totalEnquiries}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              {stats.generalLeads} general leads • {stats.directEnquiries} direct
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Pending Queue & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Priority Pending Approvals Queue (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-black text-slate-900 font-heading">
                  Pending Verification Queue
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('approvals')}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition cursor-pointer"
              >
                <span>View all ({stats.pendingApprovals})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingListings.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Queue is Clear</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No businesses currently pending review in {cityName}. New merchant submissions will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {pendingListings.slice(0, 3).map((listing) => (
                  <div key={listing.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black text-slate-900 truncate font-heading">
                          {listing.title}
                        </p>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {listing.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{listing.area}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{listing.phone}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onPreviewListing(listing)}
                        title="Preview business details"
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onApproveListing(listing.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => onRejectListing(listing.id)}
                        className="px-2.5 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Enforcing PostgreSQL RLS city isolation</span>
            <span className="font-bold text-slate-700">Territory: {cityCode}</span>
          </div>
        </div>

        {/* Right: Operational Activity & Audit Feed (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900 font-heading">
                  Recent Territory Activity
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400">Live Audit Log</span>
            </div>

            {auditLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                <p>No recent administrative actions recorded for {cityName}.</p>
                <p className="text-[10px] text-slate-400 mt-1">Actions taken here are logged securely in PostgreSQL.</p>
              </div>
            ) : (
              <div className="space-y-3 mt-3">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5 text-xs text-slate-600 p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 leading-snug">
                        {log.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {log.details?.name ? `Listing: ${log.details.name}` : `Entity: ${log.entityId}`}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Immutable database audit trail for compliance
          </div>
        </div>
      </div>
    </div>
  );
};
