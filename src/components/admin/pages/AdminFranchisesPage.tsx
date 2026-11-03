import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  ShieldCheck,
  Mail,
  Phone,
  Clock,
  Briefcase,
  Users,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  Sparkles,
  X,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { CityId } from '../../../types';
import { AdminFranchisePartner } from '../../../services/adminService';
import { CITIES } from '../../../config/cities';

export interface AdminFranchisesPageProps {
  franchises: AdminFranchisePartner[];
  activeCityFilter: CityId | 'all';
  onSelectCityFilter: (cityId: CityId | 'all') => void;
  onNavigateTab: (tab: any) => void;
  isLoading: boolean;
}

export const AdminFranchisesPage: React.FC<AdminFranchisesPageProps> = ({
  franchises,
  activeCityFilter,
  onSelectCityFilter,
  onNavigateTab,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<AdminFranchisePartner | null>(null);

  const filteredFranchises = franchises.filter((fran) => {
    if (activeCityFilter !== 'all' && fran.cityId !== activeCityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        fran.name.toLowerCase().includes(q) ||
        fran.cityName.toLowerCase().includes(q) ||
        fran.email.toLowerCase().includes(q) ||
        fran.phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Regional Franchise Directory</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
            City Franchise Operators
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Each franchise operates under strict database row-level security (RLS). Regional partners moderate storefront submissions, manage customer enquiries, and monitor local business growth.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>3 Active Territories</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search partner, city, email..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => onSelectCityFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeCityFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Cities
          </button>
          <button
            onClick={() => onSelectCityFilter('chittoor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeCityFilter === 'chittoor'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Chittoor
          </button>
          <button
            onClick={() => onSelectCityFilter('vellore')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeCityFilter === 'vellore'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Vellore
          </button>
          <button
            onClick={() => onSelectCityFilter('bengaluru')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeCityFilter === 'bengaluru'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bengaluru
          </button>
        </div>
      </div>

      {/* Franchise Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredFranchises.map((partner) => {
          const config = CITIES[partner.cityId];

          return (
            <div
              key={partner.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 font-black text-sm flex items-center justify-center font-heading">
                      {partner.cityCode}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm font-heading leading-tight">
                        {partner.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {partner.cityName} Territory • {config.state}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                </div>

                {/* Contact Information */}
                <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{partner.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{partner.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Assigned since {partner.assignedDate}</span>
                  </div>
                </div>

                {/* Operations Metrics */}
                <div className="grid grid-cols-2 gap-2 my-4 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Moderated
                    </span>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      {partner.moderationCount}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Pending Reviews
                    </span>
                    <div className={`text-lg font-black mt-0.5 ${partner.pendingReviewsCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                      {partner.pendingReviewsCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedPartner(partner)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Operator Profile</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => {
                    onSelectCityFilter(partner.cityId);
                    onNavigateTab('businesses');
                  }}
                  className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer"
                  title="View listings for this territory"
                >
                  Listings
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Partner Detail Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {selectedPartner.cityCode}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-heading">
                    {selectedPartner.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedPartner.cityName} Regional Franchise
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPartner(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 space-y-2 border border-slate-100">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Contact Credentials
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    <span className="font-bold">{selectedPartner.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Direct Phone</span>
                    <span className="font-bold">{selectedPartner.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Territory Code</span>
                    <span className="font-bold">{selectedPartner.cityCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Account Status</span>
                    <span className="font-bold text-emerald-600 uppercase">Active</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>RLS Security Boundary</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  This operator account is bound to <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono">{selectedPartner.cityId}</code>. Database RLS policies automatically prevent this operator from reading, modifying, or moderating records belonging to other regional territories.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`/city/${selectedPartner.cityId}/franchise`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-xs font-bold"
              >
                <span>Preview Regional Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setSelectedPartner(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

