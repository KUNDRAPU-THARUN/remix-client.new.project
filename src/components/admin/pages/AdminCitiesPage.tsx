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
  Clock,
  AlertCircle,
  Edit,
  Save,
} from 'lucide-react';
import { CityId } from '../../../types';
import { AdminCitySummary, adminService } from '../../../services/adminService';
import { CITIES, SUPPORTED_CITY_IDS } from '../../../config/cities';

export interface AdminCitiesPageProps {
  cities: AdminCitySummary[];
  activeCityFilter: CityId | 'all';
  onSelectCityFilter: (cityId: CityId | 'all') => void;
  onNavigateTab: (tab: any) => void;
  onRefreshData?: () => Promise<void>;
  isLoading: boolean;
}

export const AdminCitiesPage: React.FC<AdminCitiesPageProps> = ({
  cities,
  activeCityFilter,
  onSelectCityFilter,
  onNavigateTab,
  onRefreshData,
  isLoading,
}) => {
  const [selectedCityForLocalities, setSelectedCityForLocalities] = useState<CityId | null>(null);
  const [showExpansionGuide, setShowExpansionGuide] = useState(false);
  const [editingCityId, setEditingCityId] = useState<CityId | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'coming_soon' | 'inactive'>('active');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const handleStartEdit = (city: AdminCitySummary) => {
    setEditingCityId(city.id);
    setSelectedStatus(city.status);
    setStatusFeedback(null);
  };

  const handleSaveCityStatus = async (cityId: CityId) => {
    setIsUpdatingStatus(true);
    setStatusFeedback(null);
    try {
      const res = await adminService.updateCityStatus(cityId, selectedStatus);
      if (res.success) {
        setStatusFeedback(`Territory status updated to ${selectedStatus}.`);
        setEditingCityId(null);
        if (onRefreshData) await onRefreshData();
      } else {
        setStatusFeedback(res.error || 'Failed to update territory status.');
      }
    } catch (err: any) {
      setStatusFeedback(err.message || 'Error executing status update.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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

      {statusFeedback && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center justify-between">
          <span>{statusFeedback}</span>
          <button onClick={() => setStatusFeedback(null)} className="p-1 hover:bg-black/5 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid of City Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cities.map((city) => {
          const config = CITIES[city.id];
          const isSelected = activeCityFilter === city.id;
          const isEditing = editingCityId === city.id;

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
                      {city.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : city.status === 'coming_soon' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          <span>Coming Soon</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-slate-900 font-heading mt-2">
                      {city.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-400">
                      {city.brandName} • {city.state}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(city)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      title="Edit territory status"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={`/city/${city.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                      title={`Open live portal for ${city.name}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Status Editor Inline */}
                {isEditing && (
                  <div className="mt-3 p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Hub Status
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as any)}
                        className="flex-1 p-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="active">Active</option>
                        <option value="coming_soon">Coming Soon</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <button
                        onClick={() => handleSaveCityStatus(city.id)}
                        disabled={isUpdatingStatus}
                        className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                )}

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
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Localities are used for precise territorial indexing and neighborhood filtering on public consumer search pages:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
              {CITIES[selectedCityForLocalities].localities
                .filter((l) => l.id !== 'all')
                .map((loc) => (
                  <div
                    key={loc.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-800"
                  >
                    {loc.name}
                  </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCityForLocalities(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expansion Architecture Guide Modal */}
      {showExpansionGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-heading">
                    Territory Expansion Architecture
                  </h3>
                  <p className="text-xs text-slate-500">
                    Standard operating procedure for adding new regional hubs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExpansionGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-blue-950">
                <p className="font-bold mb-1">Architecture Rules for Territory Expansion:</p>
                <p className="text-[11px]">
                  All KAARYAN LABS city expansions follow an automated 3-tier synchronization pattern without modifying existing client-approved layouts.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center">1</span>
                  <span>PostgreSQL Database Registration</span>
                </div>
                <p className="pl-6 text-[11px]">
                  Execute an additive <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">INSERT INTO public.cities</code> row with the new city code (e.g. <code className="font-mono">KL-07</code>), slug, name, and brand name.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center">2</span>
                  <span>Frontend Configuration Registry</span>
                </div>
                <p className="pl-6 text-[11px]">
                  Add the city configuration entry in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">src/config/cities.ts</code> defining localities, official helpline contacts, and meta branding.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center">3</span>
                  <span>Franchise Provisioning & RLS Scoping</span>
                </div>
                <p className="pl-6 text-[11px]">
                  Assign a regional operator in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">user_roles</code> with <code className="font-mono">city_franchise</code> and territory binding. RLS policies isolate data automatically.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowExpansionGuide(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
