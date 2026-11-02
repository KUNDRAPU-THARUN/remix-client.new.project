import React from 'react';
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  BarChart3,
  User,
  Settings,
  PlusCircle,
  ArrowLeft,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
} from 'lucide-react';
import { UserAccount, CityConfig } from '../../types';

export type DashboardTab = 'overview' | 'listings' | 'enquiries' | 'insights' | 'profile' | 'settings';

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  currentUser: UserAccount;
  currentCity?: CityConfig;
  onOpenPostAd: () => void;
  onBackToHome: () => void;
  onSignOut?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  counts: {
    totalListings: number;
    pendingListings: number;
    totalEnquiries: number;
    unreadEnquiries: number;
  };
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  currentCity,
  onOpenPostAd,
  onBackToHome,
  onSignOut,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  counts,
}) => {
  const cityName = currentCity?.name || 'Chittoor';
  const cityCode = currentCity?.code || 'AP-03';
  const brandName = currentCity?.brandName || 'ChittoorAds';

  const navItems = [
    {
      id: 'overview' as DashboardTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'listings' as DashboardTab,
      label: 'My Listings',
      icon: Building2,
      badge: counts.totalListings > 0 ? counts.totalListings : null,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'enquiries' as DashboardTab,
      label: 'Customer Enquiries',
      icon: MessageSquare,
      badge: counts.unreadEnquiries > 0 ? counts.unreadEnquiries : null,
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'insights' as DashboardTab,
      label: 'Business Insights',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'profile' as DashboardTab,
      label: 'Business Profile',
      icon: User,
      badge: null,
    },
    {
      id: 'settings' as DashboardTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (tabId: DashboardTab) => {
    onSelectTab(tabId);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-white select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-red-600 to-red-700 flex items-center justify-center font-black text-white shrink-0 shadow-xs">
            CA
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight font-heading truncate">
                  {brandName}
                </span>
                <span className="text-[10px] bg-red-600/30 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider shrink-0">
                  Owner
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {cityName} ({cityCode})
              </p>
            </div>
          )}
        </div>

        {/* Desktop collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close Mobile Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Action Button */}
      <div className="p-3 shrink-0">
        <button
          onClick={() => {
            onOpenPostAd();
            if (isMobileOpen) onCloseMobile();
          }}
          className={`w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer ${
            isCollapsed ? 'px-2' : ''
          }`}
          title="Post New Business Ad"
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="truncate">+ Post New Ad</span>}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge !== null && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isActive ? 'bg-white text-blue-700' : item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Identity & Utility Footer */}
      <div className="p-3 border-t border-slate-800 space-y-2 shrink-0 bg-slate-950/40">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate font-medium">{currentUser.email}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={() => {
              onBackToHome();
              if (isMobileOpen) onCloseMobile();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 hover:text-white transition cursor-pointer"
            title="Return to Public Directory"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>Public Site</span>}
          </button>

          {onSignOut && (
            <button
              onClick={() => {
                onSignOut();
                if (isMobileOpen) onCloseMobile();
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-red-900/50 hover:text-red-300 text-slate-400 transition cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out border-r border-slate-800 h-screen sticky top-0 ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Sliding Drawer */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

