import React from 'react';
import {
  MapPin,
  Building2,
  Briefcase,
  CheckCircle2,
  Clock,
  Inbox,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { CityId, Listing } from '../../../types';
import { AdminPlatformStats, AdminCitySummary } from '../../../services/adminService';
import { FranchiseAuditLog } from '../../../services/franchiseService';
import { CITIES } from '../../../config/cities';

export interface AdminOverviewPageProps {
  stats: AdminPlatformStats;
  cities: AdminCitySummary[];
  auditLogs: FranchiseAuditLog[];
  activeCityFilter: CityId | 'all';
  onNavigateTab: (tab: any) => void;
  onSelectCityFilter: (cityId: CityId | 'all') => void;
  isLoading: boolean;
}

export const AdminOverviewPage: React.FC<AdminOverviewPageProps> = ({
  stats,
  cities,
  auditLogs,
  activeCityFilter,
  onNavigateTab,
  onSelectCityFilter,
  isLoading,
}) => {
  return (
    <div className="space-y-6">
      {/* Platform Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Oversight Active</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-white">
            Enterprise Multi-City Control Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Central governance across Chittoor (AP-03), Vellore (TN-23), and Bengaluru (KA-01). Monitor regional franchise performance, review business registrations, and track lead dispatch.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cities */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold">Connected Cities</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {stats.totalCities}
          </div>
          <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>3 Active Territories</span>
          </p>
        </div>

        {/* Active Franchises */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold">Active Franchises</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {stats.activeFranchises}
          </div>
          <p className="text-[11px] text-blue-600 font-bold mt-1">
            100% Territory Coverage
          </p>
        </div>

        {/* Pending Approvals Queue */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold">Pending Reviews</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {stats.pendingApprovals}
          </div>
          <button
            onClick={() => onNavigateTab('businesses')}
            className="text-[11px] text-red-600 font-bold mt-1 hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <span>Inspect Moderation Queue</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Customer Inquiries */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold">Total Customer Leads</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {stats.totalEnquiries}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            {stats.generalLeads} general · {stats.directEnquiries} direct
          </p>
        </div>
      </div>

      {/* City-by-City Territory Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-slate-900 font-heading">
            Regional Territory Overview
          </h3>
          <button
            onClick={() => onNavigateTab('cities')}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Manage All Territories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cities.map((city) => {
            const isFilterActive = activeCityFilter === city.id;
            return (
              <div
                key={city.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs ${
                  isFilterActive ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-900 text-base font-heading">
                        {city.name}
                      </h4>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {city.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{city.state}</p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Active territory" />
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Active Listings</span>
                    <span className="font-extrabold text-slate-800 text-sm">{city.activeListings}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Pending Reviews</span>
                    <span className="font-extrabold text-red-600 text-sm">{city.pendingApprovals}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Leads Dispatched</span>
                    <span className="font-extrabold text-slate-800 text-sm">{city.totalEnquiries}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Localities</span>
                    <span className="font-extrabold text-slate-800 text-sm">{city.localitiesCount}</span>
                  </div>
                </div>

                <div className="mt-4 pt-1 flex items-center justify-between text-xs">
                  <div className="truncate max-w-[150px]">
                    <span className="text-[10px] text-slate-400 block">Partner Desk</span>
                    <span className="font-bold text-slate-700 text-[11px] truncate">{city.franchisePartnerName}</span>
                  </div>
                  <button
                    onClick={() => onSelectCityFilter(city.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                  >
                    Filter Scope
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Platform Audit Trail */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-600" />
            <h3 className="text-base font-black text-slate-900 font-heading">
              Live Platform Audit Feed
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('audit')}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Full Audit Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {auditLogs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No administrative moderation actions recorded yet in this session.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {auditLogs.slice(0, 6).map((log) => {
              const cityCode = CITIES[log.cityId]?.code || log.cityId.toUpperCase();
              return (
                <div key={log.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-slate-800 truncate">
                        {log.action} — <span className="font-normal text-slate-600">{log.details?.name || log.entityId}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Operator: {log.userId || 'Super Admin'} · Territory: {cityCode}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

