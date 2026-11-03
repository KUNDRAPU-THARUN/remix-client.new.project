import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  MapPin,
  Film,
  Compass,
  PhoneCall,
  Image,
  Eye,
  CheckCircle2,
  ExternalLink,
  Plus,
  Power,
  X,
  PlusCircle,
  Save,
} from 'lucide-react';
import { CityId } from '../../../types';
import { CITIES } from '../../../config/cities';
import { adminService, AdminTheatreRecord } from '../../../services/adminService';

export interface AdminContentPageProps {
  activeCityFilter: CityId | 'all';
  onSelectCityFilter: (cityId: CityId | 'all') => void;
  isLoading: boolean;
}

export const AdminContentPage: React.FC<AdminContentPageProps> = ({
  activeCityFilter,
  onSelectCityFilter,
  isLoading,
}) => {
  const [selectedCity, setSelectedCity] = useState<CityId>(
    activeCityFilter === 'all' ? 'chittoor' : activeCityFilter
  );
  const [activeSection, setActiveSection] = useState<'theatres' | 'heritage' | 'helplines'>('theatres');
  const [theatres, setTheatres] = useState<AdminTheatreRecord[]>([]);
  const [isTogglingTheatre, setIsTogglingTheatre] = useState<string | null>(null);

  // Add Theatre Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTheatreName, setNewTheatreName] = useState('');
  const [newLocality, setNewLocality] = useState('');
  const [newMovie, setNewMovie] = useState('');
  const [newScreenType, setNewScreenType] = useState('4K Dolby Atmos');

  const cityConfig = CITIES[selectedCity];

  const loadTheatres = useCallback(async () => {
    try {
      const list = await adminService.getLocalTheatres(selectedCity);
      setTheatres(list);
    } catch (err) {
      console.warn('Error loading theatres:', err);
    }
  }, [selectedCity]);

  useEffect(() => {
    loadTheatres();
  }, [loadTheatres]);

  const handleToggleTheatre = async (theatre: AdminTheatreRecord) => {
    try {
      setIsTogglingTheatre(theatre.id);
      await adminService.toggleTheatreStatus(theatre.id, theatre.isActive);
      await loadTheatres();
    } catch (err) {
      console.error('Failed to toggle theatre status:', err);
    } finally {
      setIsTogglingTheatre(null);
    }
  };

  const handleAddTheatre = async () => {
    if (!newTheatreName.trim() || !newLocality.trim()) return;
    const newRecord: AdminTheatreRecord = {
      id: `th-${Date.now()}`,
      cityId: selectedCity,
      name: newTheatreName.trim(),
      locality: newLocality.trim(),
      screenType: newScreenType,
      currentMovie: newMovie.trim() || 'Now Showing',
      language: selectedCity === 'chittoor' ? 'Telugu' : selectedCity === 'vellore' ? 'Tamil' : 'Kannada / Multi',
      ticketStatus: 'Available',
      isActive: true,
    };

    setTheatres([newRecord, ...theatres]);
    setShowAddModal(false);
    setNewTheatreName('');
    setNewLocality('');
    setNewMovie('');
  };

  // Heritage & Attractions data per city
  const heritageData: Record<CityId, Array<{ name: string; tag: string; description: string }>> = {
    chittoor: [
      { name: 'Horsley Hills (Andhra Ooty)', tag: 'Hill Station', description: 'Scenic high-altitude hill resort situated at 1,290m altitude with eucalyptus groves.' },
      { name: 'Sri Varasiddhi Vinayaka Temple, Kanipakam', tag: 'Spiritual Heritage', description: 'Famous historic swayambhu Ganesha pilgrimage center with perennial temple well.' },
      { name: 'Kaundinya Wildlife Sanctuary', tag: 'Eco Tourism', description: 'Elephant reserve and sanctuary encompassing dense dry deciduous forests.' },
    ],
    vellore: [
      { name: 'Historic Vellore Fort', tag: '16th Century Monument', description: 'Granite stone fort with deep moat, housing Jalakanteswarar Temple and State Museum.' },
      { name: 'Sripuram Golden Temple', tag: 'Spiritual Sanctuary', description: 'Spiritual park covering 100 acres featuring 1.5 tons of pure gold leaf gilding.' },
      { name: 'Amirthi Zoological Park', tag: 'Nature & Wildlife', description: 'Waterfalls and animal sanctuary situated in the Javadi Hills foothills.' },
    ],
    bengaluru: [
      { name: 'Lalbagh Botanical Garden', tag: 'Botanical Landmark', description: '240-acre botanical haven established in 1760, home to historic glass house and fossil tree.' },
      { name: 'Bangalore Palace', tag: 'Royal Heritage', description: 'Tudor-revival architectural palace surrounded by manicured royal gardens.' },
      { name: 'Bannerghatta Biological Park', tag: 'Wildlife Safari', description: 'Expansive biological park with safari, zoo, and country’s premier butterfly park.' },
    ],
  };

  // Emergency helplines
  const helplinesData: Record<CityId, Array<{ service: string; number: string; type: string }>> = {
    chittoor: [
      { service: 'District Police Control', number: '100 / 08572-225100', type: 'Emergency' },
      { service: 'Government General Hospital', number: '108 / 08572-226200', type: 'Medical' },
      { service: 'Fire & Rescue Services', number: '101', type: 'Fire' },
      { service: 'Chittoor Municipal Corporation', number: '08572-232111', type: 'Civic' },
    ],
    vellore: [
      { service: 'Vellore Police Control Room', number: '100 / 0416-2225255', type: 'Emergency' },
      { service: 'CMC Hospital Emergency', number: '0416-2282000 / 108', type: 'Medical' },
      { service: 'Vellore Fire Station', number: '101 / 0416-2220101', type: 'Fire' },
      { service: 'Vellore City Corporation', number: '0416-2220578', type: 'Civic' },
    ],
    bengaluru: [
      { service: 'Bengaluru Police Commissionerate', number: '112 / 080-22942222', type: 'Emergency' },
      { service: 'Victoria Hospital Emergency', number: '108 / 080-26701150', type: 'Medical' },
      { service: 'State Fire & Disaster Response', number: '101 / 080-22971500', type: 'Fire' },
      { service: 'BBMP Central Control Room', number: '1533 / 080-22660000', type: 'Civic' },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Regional Content & Spotlight</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
            Territory Spotlight & Directory Curation
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Curate city-specific attractions, cinema schedules, and civic helplines. Each territory maintains authentic local listings without cross-city spillover.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/city/${selectedCity}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            <span>Live Consumer View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* City Switcher Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {(['chittoor', 'vellore', 'bengaluru'] as CityId[]).map((cId) => {
          const cfg = CITIES[cId];
          const isCurrent = selectedCity === cId;
          return (
            <button
              key={cId}
              onClick={() => {
                setSelectedCity(cId);
                onSelectCityFilter(cId);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                isCurrent
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{cfg.name} ({cfg.code})</span>
            </button>
          );
        })}
      </div>

      {/* Sub-section Switcher & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection('theatres')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'theatres'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Cinemas & Theatres ({theatres.length})</span>
          </button>
          <button
            onClick={() => setActiveSection('heritage')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'heritage'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Attractions & Tourism</span>
          </button>
          <button
            onClick={() => setActiveSection('helplines')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'helplines'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Civic & Emergency Helplines</span>
          </button>
        </div>

        {activeSection === 'theatres' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Cinema / Screen</span>
          </button>
        )}
      </div>

      {/* Content Section: Theatres */}
      {activeSection === 'theatres' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {theatres.map((theatre) => (
            <div
              key={theatre.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px]">
                    {theatre.screenType}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    theatre.isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {theatre.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm font-heading">
                  {theatre.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{theatre.locality}, {cityConfig.name}</span>
                </p>

                <div className="mt-2.5 p-2 rounded-xl bg-slate-50 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-800">Current Movie: </span>
                  <span>{theatre.currentMovie}</span>
                  <span className="text-slate-400 block text-[10px] mt-0.5">
                    Ticket Status: {theatre.ticketStatus}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  disabled={isTogglingTheatre === theatre.id}
                  onClick={() => handleToggleTheatre(theatre)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    theatre.isActive
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{theatre.isActive ? 'Deactivate' : 'Activate'}</span>
                </button>

                <span className="text-slate-400 text-[10px] font-mono">
                  {theatre.language}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Section: Heritage */}
      {activeSection === 'heritage' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {heritageData[selectedCity].map((place, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold mb-2">
                  {place.tag}
                </span>
                <h4 className="font-bold text-slate-900 text-sm font-heading">
                  {place.name}
                </h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {place.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-slate-700">{cityConfig.name} Tourism</span>
                <span>Curated Landmark</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Section: Helplines */}
      {activeSection === 'helplines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {helplinesData[selectedCity].map((line, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {line.service}
                  </h4>
                  <p className="text-[11px] text-slate-400">{line.type} Support • {cityConfig.name}</p>
                </div>
              </div>
              <a
                href={`tel:${line.number.split('/')[0].trim()}`}
                className="font-mono text-xs sm:text-sm font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition"
              >
                {line.number}
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Add Cinema Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 font-heading">
                <Film className="w-5 h-5 text-blue-600" />
                <span>Add Cinema to {cityConfig.name}</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cinema Name</label>
                <input
                  type="text"
                  value={newTheatreName}
                  onChange={(e) => setNewTheatreName(e.target.value)}
                  placeholder="e.g. Navrang Multiplex"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Locality / Area</label>
                <input
                  type="text"
                  value={newLocality}
                  onChange={(e) => setNewLocality(e.target.value)}
                  placeholder="e.g. MG Road"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Movie</label>
                <input
                  type="text"
                  value={newMovie}
                  onChange={(e) => setNewMovie(e.target.value)}
                  placeholder="e.g. Blockbuster Feature"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Screen Projection Type</label>
                <select
                  value={newScreenType}
                  onChange={(e) => setNewScreenType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="4K Dolby Atmos">4K Dolby Atmos</option>
                  <option value="RGB Laser Dolby">RGB Laser Dolby</option>
                  <option value="IMAX with Laser">IMAX with Laser</option>
                  <option value="2K Qube Digital">2K Qube Digital</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTheatre}
                disabled={!newTheatreName.trim() || !newLocality.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer disabled:opacity-50"
              >
                Add Cinema
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
