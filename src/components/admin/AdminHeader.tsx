import React from 'react';
import {
  Menu,
  Shield,
  LogOut,
  ChevronDown,
  Building2,
  ExternalLink,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { UserAccount, CityId } from '../../types';
import { CITIES, SUPPORTED_CITY_IDS } from '../../config/cities';

export interface AdminHeaderProps {
  currentUser: UserAccount;
  activeCityFilter: CityId | 'all';
  onCityFilterChange: (cityId: CityId | 'all') => void;
  onOpenMobileDrawer: () => void;
  onSignOut?: () => void;
  onBackToHome: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentUser,
  activeCityFilter,
  onCityFilterChange,
  onOpenMobileDrawer,
  onSignOut,
  onBackToHome,
}) => {
  const [cityDropdownOpen, setCityDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLabel =
    activeCityFilter === 'all'
      ? 'All Cities (Global)'
      : `${CITIES[activeCityFilter].name} (${CITIES[activeCityFilter].code})`;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        {/* Left: Mobile Drawer Trigger & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onOpenMobileDrawer}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer shrink-0"
            aria-label="Open administration navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider shrink-0">
              <Shield className="w-3 h-3 text-red-600" />
              <span>Super Administrator</span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[125px] sm:max-w-none">
              Central Management Portal
            </span>
          </div>
        </div>

        {/* Center/Right: City Territory Filter Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-xs font-bold text-slate-800 transition cursor-pointer shadow-2xs"
              aria-label="Filter active city scope"
              aria-expanded={cityDropdownOpen}
            >
              <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="hidden sm:inline">{activeLabel}</span>
              <span className="sm:hidden font-mono uppercase text-[11px]">{activeCityFilter === 'all' ? 'All' : CITIES[activeCityFilter].code}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {cityDropdownOpen && (
              <div className="absolute right-0 top-11 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 text-xs">
                <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Select Scope Territory
                </div>

                <button
                  onClick={() => {
                    onCityFilterChange('all');
                    setCityDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 font-bold flex items-center justify-between transition cursor-pointer ${
                    activeCityFilter === 'all'
                      ? 'bg-red-50 text-red-600'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>All Cities (Multi-City)</span>
                  <span className="text-[10px] font-extrabold text-slate-400">GLOBAL</span>
                </button>

                {SUPPORTED_CITY_IDS.map((cityId) => {
                  const cfg = CITIES[cityId];
                  const isSelected = activeCityFilter === cityId;
                  return (
                    <button
                      key={cityId}
                      onClick={() => {
                        onCityFilterChange(cityId);
                        setCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 font-bold flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-red-50 text-red-600'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cfg.name}</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {cfg.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Return to Public Website */}
          <button
            onClick={onBackToHome}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            title="View public directory"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </button>

          {/* User Avatar & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
            </div>

            <div className="hidden lg:block text-left">
              <p className="text-xs font-extrabold text-slate-900 truncate max-w-[120px]">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                Global Admin
              </p>
            </div>

            {onSignOut && (
              <button
                onClick={onSignOut}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Sign out of administration"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
