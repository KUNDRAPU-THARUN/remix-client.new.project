import React from 'react';
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Building2,
  Inbox,
  Briefcase,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { CityId } from '../../../types';
import { AdminPlatformStats } from '../../../services/adminService';
import { CITIES } from '../../../config/cities';

export interface AdminAnalyticsPageProps {
  stats: AdminPlatformStats;
  activeCityFilter: CityId | 'all';
  onSelectCityFilter: (cityId: CityId | 'all') => void;
  isLoading: boolean;
}

export const AdminAnalyticsPage: React.FC<AdminAnalyticsPageProps> = ({
  stats,
  activeCityFilter,
  onSelectCityFilter,
  isLoading,
}) => {
  const cities: CityId[] = ['chittoor', 'vellore', 'bengaluru'];

  // Calculate highest listings volume for bar scaling
  const maxListings = Math.max(
    ...cities.map((c) => stats.cityBreakdown[c]?.totalListings || 1),
    10
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Multi-City Analytics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
            Territory Performance & Volume Breakdown
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Real-time directory density, approval rates, and consumer lead volume aggregated across Chittoor, Vellore, and Bengaluru.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>3 Active Regional Networks</span>
          </div>
        </div>
      </div>

      {/* High-Level Conversion KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-400 block mb-1">Total Directory Listings</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {stats.totalListings}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">
            {stats.activeListings} Active ({stats.totalListings > 0 ? Math.round((stats.activeListings / stats.totalListings) * 100) : 0}%)
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-400 block mb-1">Pending Moderation Queue</span>
          <div className={`text-2xl sm:text-3xl font-black font-heading ${stats.pendingApprovals > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {stats.pendingApprovals}
          </div>
          <div className="text-[11px] text-slate-400 font-bold mt-1">
            Across 3 regional franchisees
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-400 block mb-1">General Quote Requests</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {stats.generalLeads}
          </div>
          <div className="text-[11px] text-blue-600 font-bold mt-1">
            Dispatched to local merchants
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-400 block mb-1">Direct Storefront Enquiries</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {stats.directEnquiries}
          </div>
          <div className="text-[11px] text-purple-600 font-bold mt-1">
            Store-specific customer leads
          </div>
        </div>
      </div>

      {/* Territory Comparison Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
        <div>
          <h3 className="font-bold text-slate-900 font-heading text-base">
            Territory Listings Density Comparison
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparative volume of active, pending, and total storefront listings by city
          </p>
        </div>

        <div className="space-y-5">
          {cities.map((cityId) => {
            const config = CITIES[cityId];
            const cityStat = stats.cityBreakdown[cityId] || {
              totalListings: 0,
              activeListings: 0,
              pendingApprovals: 0,
              totalEnquiries: 0,
            };
            const percentage = Math.min(100, Math.round((cityStat.totalListings / maxListings) * 100));

            return (
              <div key={cityId} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px]">
                      {config.code}
                    </span>
                    <span className="font-bold text-slate-900">{config.name}</span>
                    <span className="text-slate-400 text-[11px]">({config.state})</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600 text-[11px] font-bold">
                    <span>
                      Active: <span className="text-emerald-600">{cityStat.activeListings}</span>
                    </span>
                    <span>
                      Pending: <span className={cityStat.pendingApprovals > 0 ? 'text-amber-600' : 'text-slate-400'}>{cityStat.pendingApprovals}</span>
                    </span>
                    <span>
                      Leads: <span className="text-blue-600">{cityStat.totalEnquiries}</span>
                    </span>
                    <span className="text-slate-900 font-black">
                      Total: {cityStat.totalListings}
                    </span>
                  </div>
                </div>

                {/* Density Bar */}
                <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${percentage}%` }}
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leads Distribution Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cities.map((cityId) => {
          const config = CITIES[cityId];
          const cityStat = stats.cityBreakdown[cityId] || {
            generalLeads: 0,
            directEnquiries: 0,
            totalEnquiries: 0,
          };

          return (
            <div
              key={cityId}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm font-heading">
                    {config.name} Leads
                  </h4>
                  <p className="text-[11px] text-slate-400">{config.brandName}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-100 font-bold text-slate-700 flex items-center justify-center font-mono text-xs">
                  {config.code}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">General Quote Requests</span>
                  <span className="font-bold text-slate-800">{cityStat.generalLeads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Direct Merchant Leads</span>
                  <span className="font-bold text-slate-800">{cityStat.directEnquiries}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-900">Total Leads Dispatched</span>
                  <span className="font-black text-blue-600 text-sm">{cityStat.totalEnquiries}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

