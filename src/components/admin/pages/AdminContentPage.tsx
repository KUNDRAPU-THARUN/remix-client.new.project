import React, { useState } from 'react';
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
} from 'lucide-react';
import { CityId } from '../../../types';
import { CITIES } from '../../../config/cities';

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

  const cityConfig = CITIES[selectedCity];

  // Theatres data per city
  const theatresData: Record<CityId, Array<{ name: string; area: string; screens: number; type: string }>> = {
    chittoor: [
      { name: 'MSR Movie Land 4K Dolby Atmos', area: 'Gandhi Road', screens: 2, type: 'Dolby Atmos 4K' },
      { name: 'Venkateswara Theatre', area: 'High Road', screens: 1, type: '2K Qube' },
      { name: 'Chanakya Multiplex', area: 'Bazaar Street', screens: 3, type: 'Digital Surround' },
    ],
    vellore: [
      { name: 'Vishnu Cinemas 4K Atmos', area: 'Katpadi Road', screens: 3, type: 'RGB Laser Dolby' },
      { name: 'Galaxy Multiplex', area: 'Near New Bus Stand', screens: 4, type: '4K Projection' },
      { name: 'Big Cinemas Vellore', area: 'Arcot Road', screens: 2, type: 'Digital Dolby' },
    ],
    bengaluru: [
      { name: 'PVR IMAX Forum Mall', area: 'Koramangala', screens: 11, type: 'IMAX with Laser' },
      { name: 'INOX Garuda Mall', area: 'Magrath Road', screens: 5, type: 'Insignia 4K' },
      { name: 'Cinepolis Orion Mall', area: 'Rajajinagar', screens: 11, type: '4DX / Macro XE' },
    ],
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

      {/* Sub-section Switcher */}
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
          <span>Cinemas & Theatres</span>
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

      {/* Content Section: Theatres */}
      {activeSection === 'theatres' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {theatresData[selectedCity].map((theatre, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px]">
                    {theatre.type}
                  </span>
                  <span className="text-slate-400 font-medium text-[11px]">
                    {theatre.screens} {theatre.screens === 1 ? 'Screen' : 'Screens'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm font-heading">
                  {theatre.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{theatre.area}, {cityConfig.name}</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Curated & Live</span>
                </span>
                <span className="text-slate-400 text-[11px]">
                  Daily Listings
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Section: Heritage */}
      {activeSection === 'heritage' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {heritageData[selectedCity].map((spot, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px] inline-block mb-2">
                  {spot.tag}
                </span>
                <h4 className="font-bold text-slate-900 text-sm font-heading">
                  {spot.name}
                </h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {spot.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] font-medium">
                  {cityConfig.name} Territory
                </span>
                <span className="text-blue-600 font-bold text-[11px]">
                  Featured Guide
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Section: Helplines */}
      {activeSection === 'helplines' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Emergency / Civic Agency</th>
                  <th className="py-3.5 px-4">Contact Dial</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-6 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {helplinesData[selectedCity].map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      {h.service}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {h.number}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[10px] font-bold">
                        {h.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Official</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
