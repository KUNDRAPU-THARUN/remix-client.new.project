import React from 'react';
import {
  Listing,
  UserAccount,
  CityConfig,
} from '../types';
import {
  LogIn,
  ArrowLeft,
  UserCheck,
  Building2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { DashboardLayout } from './business-owner/DashboardLayout';

export interface UserDashboardProps {
  currentUser: UserAccount | null;
  userListings: Listing[];
  onOpenPostAd: () => void;
  onPreviewListing: (listing: Listing) => void;
  onDeleteListing: (id: string) => void;
  onBackToHome: () => void;
  onOpenLogin?: () => void;
  currentCity?: CityConfig;
  onListingCreatedOrUpdated?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  userListings,
  onOpenPostAd,
  onPreviewListing,
  onDeleteListing,
  onBackToHome,
  onOpenLogin,
  currentCity,
  onListingCreatedOrUpdated,
}) => {
  const { signOut } = useAuth();
  const cityName = currentCity?.name || 'Chittoor';
  const cityCode = currentCity?.code || 'AP-03';

  // 1. Anonymous / Logged-out Visitor Gate
  if (!currentUser) {
    return (
      <div className="bg-slate-50 min-h-screen pb-16">
        {/* Banner */}
        <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 border-b border-slate-800">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={onBackToHome}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 mb-3 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Directory</span>
            </button>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
                Business Owner & Merchant Portal
              </h1>
              <span className="text-xs bg-red-600/20 text-red-400 border border-red-500/30 px-3 py-0.5 rounded-full font-bold">
                {cityName} ({cityCode})
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Sign in with your verified merchant credentials to manage storefront ads, track leads, and view performance metrics.
            </p>
          </div>
        </div>

        {/* Access Box */}
        <div className="max-w-xl mx-auto px-4 pt-12 text-center">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-xs">
              <LogIn className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                Merchant Authentication Required
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                You are currently viewing the Business Owner Dashboard as a guest. To protect merchant privacy, lead confidentiality, and listing ownership, please sign in with your verified Provider account.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs text-slate-600 space-y-2">
              <p className="font-bold text-slate-800">Merchant Portal Features:</p>
              <ul className="space-y-1.5 text-[11px] text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Real-time lead inbox for incoming customer inquiries</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Direct ad management, photo updates, and operational hours</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Multi-city territory isolation backed by Supabase RLS</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-red-600/20 transition cursor-pointer"
                >
                  Sign In as Merchant →
                </button>
              )}
              <button
                onClick={onBackToHome}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
              >
                Back to Public Directory
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Customer Account Limitation Gate
  if (currentUser.role === 'customer') {
    return (
      <div className="bg-slate-50 min-h-screen pb-16">
        <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 border-b border-slate-800">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={onBackToHome}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 mb-3 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Directory</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
              Business Owner Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Signed in as <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})
            </p>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 pt-12 text-center">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
              <UserCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                Customer Account Active
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                You are currently signed in with a <strong>Customer</strong> account. The Business Owner Dashboard is reserved for verified merchant profiles to publish commercial listings, manage customer leads, and view analytics.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
                >
                  Switch to Provider Account →
                </button>
              )}
              <button
                onClick={onBackToHome}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
              >
                Back to Public Directory
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Business Owner / Provider Dashboard
  return (
    <DashboardLayout
      currentUser={currentUser}
      userListings={userListings}
      currentCity={currentCity}
      onOpenPostAd={onOpenPostAd}
      onPreviewListing={onPreviewListing}
      onDeleteListing={onDeleteListing}
      onBackToHome={onBackToHome}
      onSignOut={signOut}
      onListingCreatedOrUpdated={onListingCreatedOrUpdated}
    />
  );
};
