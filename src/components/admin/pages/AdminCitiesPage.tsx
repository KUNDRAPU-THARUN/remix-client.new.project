import React, { useState } from 'react';
import {
  MapPin,
  Building2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Info,
  Sparkles,
  Search,
  PlusCircle,
  X,
  FileCode2,
  Database,
  ArrowRight,
} from 'lucide-react';
import { CityId } from '../../../types';
import { AdminCitySummary } from '../../../services/adminService';
import { CITIES, SUPPORTED_CITY_IDS } from '../../../config/cities';

export interface AdminCitiesPageProps {
  cities: AdminCitySummary[];
  activeCityFilter: CityId | 'all';
  onSelectCityFilter: (cityId: CityId | 'all') => void;
  onNavigateTab: (tab: any) => void;
  isLoading: boolean;
}

export const AdminCitiesPage: React.FC<AdminCitiesPageProps> = ({
  cities,
  activeCityFilter,
  onSelectCityFilter,
  onNavigateTab,
  isLoading,
}) => {
  const [selectedCityForLocalities, setSelectedCityForLocalities] = useState<CityId | null>(null);
  const [showExpansionGuide, setShowExpansionGuide] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Multi-Territory Governance</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
            Connected Regional Hubs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Oversee active regional platforms across Andhra Pradesh, Tamil Nadu, and Karnataka. Each hub maintains independent listings, local franchisees, and localized consumer portals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExpansionGuide(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Add / Expand Territory</span>
          </button>
        </div>
      </div>

      {/* Grid of City Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cities.map((city) => {
          const config = CITIES[city.id];
          const isSelected = activeCityFilter === city.id;

          return (
            <div
              key={city.id}
              className={`bg-white rounded-3xl border transition-all duration-200 p-6 shadow-xs flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/20'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                        {city.code}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 font-heading mt-2">
                      {city.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-400">
                      {city.brandName} • {city.state}
                    </p>
                  </div>

                  <a
                    href={`/city/${city.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                    title={`Open live portal for ${city.name}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 my-5 py-3 border-y border-slate-100 text-center">
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      Listings
                    </div>
                    <div className="text-base font-black text-slate-900 mt-0.5">
                      {city.activeListings}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      Pending
                    </div>
                    <div className={`text-base font-black mt-0.5 ${city.pendingApprovals > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                      {city.pendingApprovals}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      Leads
                    </div>
                    <div className="text-base font-black text-slate-900 mt-0.5">
                      {city.totalEnquiries}
                    </div>
                  </div>
                </div>

                {/* Franchise Assignment */}
                <div className="bg-slate-50 rounded-2xl p-3.5 space-y-1 mb-4 text-xs">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    <span>Regional Franchise</span>
                  </div>
                  <div className="font-bold text-slate-800 truncate">
                    {city.franchisePartnerName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {city.franchiseEmail}
                  </div>
                </div>

                {/* Localities info */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium">
                    {city.localitiesCount} Municipal Localities
                  </span>
                  <button
                    onClick={() => setSelectedCityForLocalities(city.id)}
                    className="text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                  >
                    View Localities
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => {
                    onSelectCityFilter(city.id);
                    onNavigateTab('businesses');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Manage Listings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onSelectCityFilter(city.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isSelected ? 'Current Scope' : 'Set Scope'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Localities Modal */}
      {selectedCityForLocalities && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-heading">
                    {CITIES[selectedCityForLocalities].name} Localities
                  </h3>
                  <p className="text-xs text-slate-500">
                    {CITIES[selectedCityForLocalities].code} • {CITIES[selectedCityForLocalities].state}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCityForLocalities(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-2">
              <p className="text-xs text-slate-600 mb-3">
                Active municipal delivery zones and commercial clusters configured for {CITIES[selectedCityForLocalities].name}:
              </p>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1">
                {CITIES[selectedCityForLocalities].localities
                  .filter((loc) => loc.id !== 'all')
                  .map((loc) => (
                    <span
                      key={loc.id}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold"
                    >
                      {loc.name}
                    </span>
                  ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCityForLocalities(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expansion Guide Drawer / Modal */}
      {showExpansionGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-heading text-lg">
                    New City Expansion Architecture
                  </h3>
                  <p className="text-xs text-slate-500">
                    Standard operating procedure for activating new city platforms
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExpansionGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 space-y-1.5 text-blue-900">
                <div className="font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Zero Code Duplication Architecture</span>
                </div>
                <p>
                  The platform uses dynamic multi-tenant territory routing. Adding a city requires zero frontend scaffolding or new repositories.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-800 text-sm">Activation Steps:</h4>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <div>
                    <span className="font-bold text-slate-900">Declare City Configuration in code</span>
                    <p className="text-slate-500 mt-0.5">
                      Add entry to <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">src/config/cities.ts</code> with code, state, contact phone, email, and municipal localities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <div>
                    <span className="font-bold text-slate-900">Insert Database Record in `cities` table</span>
                    <p className="text-slate-500 mt-0.5">
                      Execute <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">INSERT INTO cities (id, name, code, state, is_active)</code>. Foreign keys in <code className="text-slate-700">businesses</code> and <code className="text-slate-700">customer_enquiries</code> automatically validate.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                  <div>
                    <span className="font-bold text-slate-900">Assign Regional Franchisee Account</span>
                    <p className="text-slate-500 mt-0.5">
                      Grant <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">role: &apos;city_franchise&apos;, city_id: &apos;new_city&apos;</code> in <code className="text-slate-700">user_roles</code>. Row-Level Security automatically isolates listings and reviews to that city.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">4</span>
                  <div>
                    <span className="font-bold text-slate-900">Live URL Automatic Provisioning</span>
                    <p className="text-slate-500 mt-0.5">
                      URL paths <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">/city/new_city</code> and <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">/city/new_city/franchise</code> instantly become active with dedicated branding.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowExpansionGuide(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

