import React from 'react';
import {
  Menu,
  Bell,
  Building2,
  ShieldCheck,
  ChevronDown,
  Globe,
  Sparkles,
} from 'lucide-react';
import { UserAccount, CityConfig, CityId } from '../../types';
import { CITIES, SUPPORTED_CITY_IDS } from '../../config/cities';
import { FranchiseTab } from './FranchiseSidebar';

interface FranchiseHeaderProps {
  activeTab: FranchiseTab;
  currentUser: UserAccount;
  currentCity: CityConfig;
  onOpenMobileNav: () => void;
  onSelectCity?: (cityId: CityId) => void;
  pendingApprovalsCount: number;
  unreadLeadsCount: number;
}

const TAB_TITLES: Record<FranchiseTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Command Center',
    subtitle: 'Real-time territory performance, pending verifications and operational metrics.',
  },
  approvals: {
    title: 'Business Approvals Queue',
    subtitle: 'Review incoming merchant submissions, verify documentation, and approve listings.',
  },
  businesses: {
    title: 'Territory Business Directory',
    subtitle: 'Manage all verified, active, and moderated business entities in your jurisdiction.',
  },
  enquiries: {
    title: 'Customer Enquiries & Lead Dispatch',
    subtitle: 'Route public service requests and oversee customer-to-merchant enquiries.',
  },
  content: {
    title: 'Local Spotlight Management',
    subtitle: 'Curate city attractions, cinema showtimes, banners, and emergency helplines.',
  },
  staff: {
    title: 'Field Operations & Staff Directory',
    subtitle: 'Manage territory coordinators, verification agents, and data entry desks.',
  },
  analytics: {
    title: 'Territory Intelligence & Analytics',
    subtitle: 'Listing distribution, category demand trends, and merchant growth metrics.',
  },
  settings: {
    title: 'Franchise Partner Settings',
    subtitle: 'Manage franchise operator profile, notification webhooks, and contact desk.',
  },
};

export const FranchiseHeader: React.FC<FranchiseHeaderProps> = ({
  activeTab,
  currentUser,
  currentCity,
  onOpenMobileNav,
  onSelectCity,
  pendingApprovalsCount,
  unreadLeadsCount,
}) => {
  const meta = TAB_TITLES[activeTab] || TAB_TITLES.overview;
  const isSuperAdmin = Boolean(currentUser.isSuperAdmin);

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4 max-w-full overflow-hidden">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-sm sm:text-lg font-black text-slate-900 truncate font-heading tracking-tight">
              {meta.title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {currentCity.code}
            </span>
          </div>
          <p className="hidden md:block text-[11px] text-slate-500 font-medium truncate max-w-xl">
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions, City Selector & Partner Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Super Admin Multi-City Switcher */}
        {isSuperAdmin && onSelectCity && (
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-1.5 py-1 text-xs max-w-[125px] sm:max-w-none">
            <Globe className="w-3.5 h-3.5 text-slate-500 hidden sm:block shrink-0" />
            <select
              value={currentCity.id}
              onChange={(e) => onSelectCity(e.target.value as CityId)}
              className="bg-transparent text-xs font-bold text-slate-800 pr-1 py-0.5 focus:outline-hidden cursor-pointer max-w-[110px] sm:max-w-none truncate"
              aria-label="Switch territorial hub"
            >
              {SUPPORTED_CITY_IDS.map((cId) => (
                <option key={cId} value={cId}>
                  {CITIES[cId].name} ({CITIES[cId].code})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Territory Status Tag */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{currentCity.name} Operations Active</span>
        </div>

        {/* Notification Bell with Badges */}
        <div className="relative">
          <div className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative cursor-pointer" title="Territory Alerts">
            <Bell className="w-4 h-4" />
            {(pendingApprovalsCount > 0 || unreadLeadsCount > 0) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 animate-ping" />
            )}
          </div>
        </div>

        {/* User Role Badge / Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'F'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-black text-slate-900 leading-tight truncate max-w-[130px]">
              {currentUser.name}
            </p>
            <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-red-600" />
              <span>{isSuperAdmin ? 'Super Admin' : 'Franchise Partner'}</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
