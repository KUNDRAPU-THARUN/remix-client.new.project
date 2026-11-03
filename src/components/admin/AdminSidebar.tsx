import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Building2,
  Users,
  Briefcase,
  Inbox,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  Database,
} from 'lucide-react';
import { UserAccount } from '../../types';

export type AdminTab =
  | 'overview'
  | 'cities'
  | 'franchises'
  | 'users'
  | 'businesses'
  | 'enquiries'
  | 'content'
  | 'analytics'
  | 'audit'
  | 'settings';

export interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  currentUser: UserAccount;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  counts?: {
    pendingApprovals?: number;
    totalListings?: number;
    totalEnquiries?: number;
  };
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  counts,
}) => {
  const navItems = [
    {
      id: 'overview' as AdminTab,
      label: 'Platform Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'cities' as AdminTab,
      label: 'City Management',
      icon: MapPin,
      badge: '3 Active',
      badgeColor: 'bg-emerald-50 text-emerald-700 font-bold',
    },
    {
      id: 'franchises' as AdminTab,
      label: 'Franchise Partners',
      icon: Building2,
      badge: '3 Assigned',
      badgeColor: 'bg-blue-50 text-blue-700 font-bold',
    },
    {
      id: 'users' as AdminTab,
      label: 'User Directory',
      icon: Users,
      badge: null,
    },
    {
      id: 'businesses' as AdminTab,
      label: 'Global Listings',
      icon: Briefcase,
      badge: counts?.pendingApprovals && counts.pendingApprovals > 0 ? `${counts.pendingApprovals} Pending` : null,
      badgeColor: 'bg-red-500 text-white font-black animate-pulse',
    },
    {
      id: 'enquiries' as AdminTab,
      label: 'Customer Enquiries',
      icon: Inbox,
      badge: counts?.totalEnquiries && counts.totalEnquiries > 0 ? String(counts.totalEnquiries) : null,
      badgeColor: 'bg-slate-100 text-slate-700 font-bold',
    },
    {
      id: 'content' as AdminTab,
      label: 'Content & Spotlight',
      icon: Sparkles,
      badge: null,
    },
    {
      id: 'analytics' as AdminTab,
      label: 'Platform Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'audit' as AdminTab,
      label: 'Audit & Security',
      icon: ShieldCheck,
      badge: 'Protected',
      badgeColor: 'bg-indigo-50 text-indigo-700 font-bold',
    },
    {
      id: 'settings' as AdminTab,
      label: 'System Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (tabId: AdminTab) => {
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
                    KAARYAN Super Admin
                  </h2>
                </div>
                <p className="text-[10px] text-slate-500 font-medium truncate">
                  Multi-City Governance
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

        {/* Global Multi-City Badge */}
        {!isCollapsed && (
          <div className="m-3 p-3 rounded-xl bg-slate-900 text-white shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
              <span>Platform Network</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live
              </span>
            </div>
            <p className="text-xs font-black tracking-tight text-white font-heading">
              3 Connected Territories
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              AP-03 · TN-23 · KA-01
            </p>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-2 space-y-1 mt-1" aria-label="Super Admin navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                data-tab={item.id}
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
                    className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                      item.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#E51E31] rounded-r" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Collapse Toggle */}
      <div className="p-3 border-t border-slate-100 hidden md:block">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition cursor-pointer"
          title={isCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden md:block fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay + Drawer) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
