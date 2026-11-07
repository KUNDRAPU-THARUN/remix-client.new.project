import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  MapPin,
  PlusCircle,
  Database,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { UserAccount, CityConfig } from '../../types';
import { DashboardTab } from './DashboardSidebar';
import { isSupabaseConfigured, getSupabaseProjectRef } from '../../lib/supabase';

interface DashboardHeaderProps {
  activeTab: DashboardTab;
  currentUser: UserAccount;
  currentCity?: CityConfig;
  onOpenMobileSidebar: () => void;
  onOpenPostAd: () => void;
  onSelectTab: (tab: DashboardTab) => void;
  onBackToHome: () => void;
  onSignOut?: () => void;
  unreadCount?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeTab,
  currentUser,
  currentCity,
  onOpenMobileSidebar,
  onOpenPostAd,
  onSelectTab,
  onBackToHome,
  onSignOut,
  unreadCount = 0,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const cityName = currentCity?.name || 'Chittoor';
  const cityCode = currentCity?.code || 'AP-03';
  const isConfigured = isSupabaseConfigured();
  const projectRef = getSupabaseProjectRef();

  // Session verification: Ensure session is not a demo/mock user and is backed by Supabase Auth
  const isSessionVerified = Boolean(
    isConfigured &&
    currentUser &&
    currentUser.id &&
    !currentUser.id.startsWith('user-') &&
    currentUser.id !== 'u-demo'
  );

  // Truthful status: PostgreSQL Active requires both configured backend AND a verified session
  const isSupabase = isConfigured && isSessionVerified;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageTitles: Record<DashboardTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Merchant Dashboard',
      subtitle: `Real-time management for ${cityName} local business operations`,
    },
    listings: {
      title: 'My Business Listings',
      subtitle: `Manage, edit and monitor all ads registered in ${cityName}`,
    },
    enquiries: {
      title: 'Customer Enquiries & Leads',
      subtitle: 'Direct requirement inquiries received from local customers',
    },
    insights: {
      title: 'Business Insights & Analytics',
      subtitle: 'Performance views and customer engagement metrics',
    },
    profile: {
      title: 'Business & Account Profile',
      subtitle: 'Registered merchant credentials and territory assignments',
    },
    settings: {
      title: 'Dashboard Settings',
      subtitle: 'Territory, language and authentication preferences',
    },
  };

  const currentMeta = pageTitles[activeTab] || pageTitles.overview;

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
      <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="hidden sm:inline">Owner Dashboard</span>
              <span className="hidden sm:inline text-slate-300">/</span>
              <span className="font-bold text-slate-800 capitalize truncate">
                {activeTab}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black font-heading text-slate-900 tracking-tight truncate">
              {currentMeta.title}
            </h1>
          </div>
        </div>

        {/* Right: City, Status, Notifications & Account */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active City Territory Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-red-600" />
            <span>Assigned Business Region: {cityName} ({cityCode})</span>
          </div>

          {/* Database mode indicator */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              isSupabase
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : isConfigured
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
            title={
              isSupabase
                ? `Connected to Supabase PostgreSQL (${projectRef || 'Remote'}) with RLS • Session Verified`
                : isConfigured
                ? `Supabase backend configured (${projectRef || 'Remote'}), but session is not cryptographically verified`
                : 'Running in Local Storage Sandbox mode (No remote backend configured)'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabase ? 'bg-emerald-500 animate-pulse' : isConfigured ? 'bg-amber-500' : 'bg-slate-400'
              }`}
            />
            <Database className="w-3 h-3" />
            <span className="hidden md:inline">
              {isSupabase ? 'PostgreSQL Active' : isConfigured ? 'Session Unverified' : 'Offline Sandbox'}
            </span>
          </div>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen((prev) => !prev)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative cursor-pointer"
              title="Notifications"
              aria-label="View Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute 1.5 top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-40 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 ? (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100/80 flex items-start gap-2.5">
                      <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold text-slate-900">New Customer Enquiry</p>
                        <p className="text-slate-600 text-[11px] mt-0.5">
                          You have {unreadCount} new customer lead{unreadCount > 1 ? 's' : ''} in {cityName}.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">
                    No new notifications right now.
                  </p>
                )}
                <button
                  onClick={() => {
                    onSelectTab('enquiries');
                    setIsNotifOpen(false);
                  }}
                  className="w-full py-1.5 text-center text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                >
                  View All Enquiries →
                </button>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onOpenPostAd}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Post Ad</span>
          </button>

          {/* User Account Menu Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition cursor-pointer"
              aria-label="User Account Menu"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline font-bold text-xs text-slate-800 max-w-[100px] truncate">
                {currentUser.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-40 space-y-1 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900 truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border bg-blue-50 text-blue-700 border-blue-200">
                      {currentUser.isSuperAdmin ? 'Super Admin' : currentUser.isFranchise ? 'City Franchise' : 'Business Owner'}
                    </span>
                    {projectRef && (
                      <span className="inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {projectRef === 'tbwtxnszyddvpgqvxwow' ? 'staging' : projectRef}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectTab('profile');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition font-medium text-left cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Business Profile</span>
                </button>

                <button
                  onClick={() => {
                    onSelectTab('settings');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition font-medium text-left cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account Settings</span>
                </button>

                <button
                  onClick={() => {
                    onBackToHome();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition font-medium text-left cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Back to Public Directory</span>
                </button>

                {onSignOut && (
                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        onSignOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition font-bold text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
