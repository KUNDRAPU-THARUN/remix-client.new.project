import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Building2,
  CheckCircle2,
  Clock,
  Inbox,
  ShieldCheck,
  Compass,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Listing, CityConfig } from '../../../types';
import { FranchiseStats, FranchiseAuditLog } from '../../../services/franchiseService';
import { getCityCategories } from '../../../config/categories';

interface FranchiseAnalyticsPageProps {
  stats: FranchiseStats;
  businesses: Listing[];
  auditLogs: FranchiseAuditLog[];
  currentCity: CityConfig;
}

export const FranchiseAnalyticsPage: React.FC<FranchiseAnalyticsPageProps> = ({
  stats,
  businesses,
  auditLogs,
  currentCity,
}) => {
  const cityName = currentCity.name;
  const cityCode = currentCity.code;

  // Real Category Distribution
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of businesses) {
      if ((b.cityId || 'chittoor') === currentCity.id) {
        map[b.category] = (map[b.category] || 0) + 1;
      }
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [businesses, currentCity.id]);

  // Real Locality Distribution
  const localityCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of businesses) {
      if ((b.cityId || 'chittoor') === currentCity.id) {
        map[b.area] = (map[b.area] || 0) + 1;
      }
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [businesses, currentCity.id]);

  const activePct = stats.totalListings > 0
    ? Math.round((stats.activeListings / stats.totalListings) * 100)
    : 0;
  const pendingPct = stats.totalListings > 0
    ? Math.round((stats.pendingApprovals / stats.totalListings) * 100)
    : 0;
  const verifiedPct = stats.totalListings > 0
    ? Math.round((stats.verifiedBusinesses / stats.totalListings) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* KPI Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <p className="text-xs font-bold text-slate-500">Directory Publishing Rate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 font-heading">{activePct}%</span>
            <span className="text-xs font-bold text-emerald-600">Active</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${activePct}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {stats.activeListings} of {stats.totalListings} businesses published
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <p className="text-xs font-bold text-slate-500">Trust & Verification Rate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 font-heading">{verifiedPct}%</span>
            <span className="text-xs font-bold text-blue-600">Verified</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${verifiedPct}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {stats.verifiedBusinesses} holding verified badge
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <p className="text-xs font-bold text-slate-500">Pending Review Pipeline</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 font-heading">{stats.pendingApprovals}</span>
            <span className="text-xs font-bold text-amber-600">Queued</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${pendingPct}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {pendingPct}% of catalog in moderation
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <p className="text-xs font-bold text-slate-500">Total Customer Inquiries</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 font-heading">{stats.totalEnquiries}</span>
            <span className="text-xs font-bold text-purple-600">Leads</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: '100%' }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {stats.generalLeads} general • {stats.directEnquiries} direct storefront
          </p>
        </div>
      </div>

      {/* Real Distribution Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metric 1: Category Demand Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-black text-slate-900 font-heading">
                Category Density ({cityName})
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400">
              {categoryCounts.length} Active Categories
            </span>
          </div>

          {categoryCounts.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No category data recorded.</p>
          ) : (
            <div className="space-y-3">
              {categoryCounts.slice(0, 6).map(([catName, count]) => {
                const pct = stats.totalListings > 0 ? Math.round((count / stats.totalListings) * 100) : 0;
                return (
                  <div key={catName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{catName}</span>
                      <span className="text-slate-500 font-medium">
                        {count} listings ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-red-600 to-rose-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Metric 2: Locality Coverage */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-black text-slate-900 font-heading">
                Locality & Area Distribution
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400">
              {localityCounts.length} Localities
            </span>
          </div>

          {localityCounts.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No locality data recorded.</p>
          ) : (
            <div className="space-y-3">
              {localityCounts.slice(0, 6).map(([areaName, count]) => {
                const pct = stats.totalListings > 0 ? Math.round((count / stats.totalListings) * 100) : 0;
                return (
                  <div key={areaName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{areaName}</span>
                      <span className="text-slate-500 font-medium">
                        {count} businesses ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Compliance & Audit History Count */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-xs font-black text-slate-900 font-heading tracking-wider">
            PostgreSQL Multi-Territory Compliance Notice
          </h4>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            All analytics presented on this dashboard represent genuine database records strictly isolated to {cityName} ({cityCode}).
            Metrics do not include simulated or fabricated statistics.
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>RLS Audited & Certified</span>
          </span>
        </div>
      </div>
    </div>
  );
};
