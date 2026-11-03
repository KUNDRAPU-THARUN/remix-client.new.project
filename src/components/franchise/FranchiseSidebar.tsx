import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Building2,
  Inbox,
  Sparkles,
  Users,
  BarChart3,
  Settings,
  ArrowLeft,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { UserAccount, CityConfig } from '../../types';

export type FranchiseTab =
  | 'overview'
  | 'approvals'
  | 'businesses'
  | 'enquiries'
  | 'content'
  | 'staff'
  | 'analytics'
  | 'settings';

interface FranchiseSidebarProps {
  activeTab: FranchiseTab;
  onSelectTab: (tab: FranchiseTab) => void;
  currentUser: UserAccount;
  currentCity: CityConfig;
  onBackToHome: () => void;
  onSignOut?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  counts: {
    pendingApprovals: number;
    totalListings: number;
    totalEnquiries: number;
    generalLeads: number;
  };
}

export const FranchiseSidebar: React.FC<FranchiseSidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  currentCity,
  onBackToHome,
  onSignOut,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  counts,
}) => {
  const cityName = currentCity.name;
  const cityCode = currentCity.code;
  const brandName = currentCity.brandName;

  const navItems = [
    {
      id: 'overview' as FranchiseTab,
      label: 'Command Center',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'approvals' as FranchiseTab,
      label: 'Business Approvals',
      icon: CheckSquare,
      badge: counts.pendingApprovals > 0 ? counts.pendingApprovals : null,
      badgeColor: 'bg-red-500 text-white animate-pulse',
    },
    {
      id: 'businesses' as FranchiseTab,
      label: 'Territory Listings',
      icon: Building2,
      badge: counts.totalListings > 0 ? counts.totalListings : null,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'enquiries' as FranchiseTab,
      label: 'Enquiries & Leads',
      icon: Inbox,
      badge: counts.generalLeads > 0 ? counts.generalLeads : null,
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      id: 'content' as FranchiseTab,
      label: 'Local Spotlight',
      icon: Sparkles,
      badge: null,
    },
    {
      id: 'staff' as FranchiseTab,
      label: 'Staff Directory',
      icon: Users,
      badge: null,
    },
    {
      id: 'analytics' as FranchiseTab,
      label: 'City Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings' as FranchiseTab,
      label: 'Franchise Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (tabId: FranchiseTab) => {
    onSelectTab(tabId);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white text-slate-800 select-none border-r border-slate-200">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-red-500/20">
              <Compass className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-black text-sm text-slate-900 truncate font-heading">
                    {brandName}
                  </h2>
                  <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded">
                    {cityCode}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium truncate">
                  City Franchise Portal
                </p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close navigation drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Territory Status Card */}
        {!isCollapsed && (
          <div className="m-3 p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white shadow-xs">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-300 font-medium">Active Territory</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Hub
              </span>
            </div>
            <p className="text-xs font-black tracking-tight text-white font-heading">
              {cityName} Division
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {currentUser.isSuperAdmin ? 'Super Administrator Access' : 'Regional Partner Terminal'}
            </p>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-2 space-y-1 mt-1" aria-label="Franchise navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer relative group ${
                  isActive
                    ? 'bg-red-50 text-[#E51E31]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition ${
                    isActive ? 'text-[#E51E31]' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                />
                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!isCollapsed && item.badge !== null && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${
                      item.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isCollapsed && item.badge !== null && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        {/* Back to Public Site */}
        <button
          onClick={onBackToHome}
          title={isCollapsed ? `Back to ${cityName}` : undefined}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0 text-slate-400" />
          {!isCollapsed && <span className="truncate">Public Directory</span>}
        </button>

        {/* Sign Out */}
        {onSignOut && (
          <button
            onClick={onSignOut}
            title={isCollapsed ? 'Sign Out' : undefined}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0 text-red-500" />
            {!isCollapsed && <span className="truncate">Sign Out</span>}
          </button>
        )}

        {/* Collapse Toggle (Desktop only) */}
        <div className="hidden md:block pt-2">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Navigation</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block sticky top-0 h-screen transition-all duration-200 z-30 shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-white z-50 md:hidden transform transition-transform duration-200 ease-in-out shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

