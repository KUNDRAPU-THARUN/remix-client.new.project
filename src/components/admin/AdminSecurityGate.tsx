import React from 'react';
import {
  ShieldAlert,
  LogIn,
  ArrowLeft,
  Building2,
  Lock,
  UserX,
  Compass,
  CheckCircle2,
  Store,
} from 'lucide-react';
import { UserAccount, CityConfig } from '../../types';

export interface AdminSecurityGateProps {
  gateType: 'unauthenticated' | 'customer_denied' | 'owner_denied' | 'franchise_denied';
  currentUser: UserAccount | null;
  onOpenLogin?: () => void;
  onBackToHome: () => void;
  onGoToOwnerDashboard?: () => void;
  onGoToFranchisePortal?: () => void;
}

export const AdminSecurityGate: React.FC<AdminSecurityGateProps> = ({
  gateType,
  currentUser,
  onOpenLogin,
  onBackToHome,
  onGoToOwnerDashboard,
  onGoToFranchisePortal,
}) => {
  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Top Banner */}
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
              Super Admin Management Console
            </h1>
            <span className="text-xs bg-red-600/20 text-red-400 border border-red-500/30 px-3 py-0.5 rounded-full font-bold">
              Multi-City Network
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Restricted administrative gateway for global platform management, multi-city oversight, and system security controls.
          </p>
        </div>
      </div>

      {/* Main Gate Card */}
      <div className="max-w-xl mx-auto px-4 pt-12 text-center">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm space-y-5">
          {/* Gate 1: Unauthenticated */}
          {gateType === 'unauthenticated' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                  Super Admin Authentication Required
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Access to the central Super Admin Console is strictly protected. Please sign in with verified Super Administrator credentials.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs text-slate-600 space-y-2">
                <p className="font-bold text-slate-800">Super Administrator Privileges:</p>
                <ul className="space-y-1.5 text-[11px] text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Cross-city administrative oversight for Chittoor, Vellore, and Bengaluru</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Franchise partner assignment, role governance, and staff provisioning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Global business moderation, security audit logs, and platform analytics</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {onOpenLogin && (
                  <button
                    onClick={onOpenLogin}
                    className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-red-600/20 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Super Admin Console →</span>
                  </button>
                )}
                <button
                  onClick={onBackToHome}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
                >
                  Back to Directory
                </button>
              </div>
            </>
          )}

          {/* Gate 2: Customer Denied */}
          {gateType === 'customer_denied' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                <UserX className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                  Super Admin Privileges Required
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your signed-in account (<strong className="text-slate-800">{currentUser?.name || currentUser?.email}</strong>) is registered as a <strong className="text-slate-800">Consumer Account</strong>. Platform administration is restricted to authorized Super Administrators.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-left text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Access Boundary Enforced</span>
                </p>
                <p className="text-[11px] text-amber-800">
                  Customer profiles do not possess platform administration privileges under PostgreSQL Row Level Security.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onBackToHome}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
                >
                  Return to Public Directory
                </button>
              </div>
            </>
          )}

          {/* Gate 3: Business Owner Denied */}
          {gateType === 'owner_denied' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                <Store className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                  Business Owner Scope
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  You are signed in as a <strong className="text-slate-800">Verified Business Owner</strong>. Merchant storefront operations are managed through the Business Owner Dashboard.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-left text-xs text-blue-800 space-y-1">
                <p className="font-bold">Looking to manage your store listings?</p>
                <p className="text-[11px] text-blue-700">
                  Manage your business profile, respond to customer inquiries, and post advertisements from your Merchant Portal.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {onGoToOwnerDashboard && (
                  <button
                    onClick={onGoToOwnerDashboard}
                    className="w-full sm:w-auto px-6 py-3 bg-[#176AC4] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Go to Business Owner Dashboard →</span>
                  </button>
                )}
                <button
                  onClick={onBackToHome}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
                >
                  Back to Directory
                </button>
              </div>
            </>
          )}

          {/* Gate 4: Franchise Partner Scope */}
          {gateType === 'franchise_denied' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
                <Compass className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                  City Franchise Scope Boundary
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  You are signed in with a <strong className="text-slate-800">City Franchise Partner</strong> account. Regional operations are managed from your territory-specific Franchise Command Center.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-left text-xs text-indigo-900 space-y-1">
                <p className="font-bold">Regional Franchise Access:</p>
                <p className="text-[11px] text-indigo-800">
                  Global platform administration is reserved for Super Administrators. You can manage your assigned city's approvals, listings, and leads via the Franchise portal.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {onGoToFranchisePortal && (
                  <button
                    onClick={onGoToFranchisePortal}
                    className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Go to Franchise Portal →</span>
                  </button>
                )}
                <button
                  onClick={onBackToHome}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
                >
                  Back to Directory
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

