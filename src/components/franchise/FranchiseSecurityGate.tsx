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
} from 'lucide-react';
import { UserAccount, CityConfig, CityId } from '../../types';

export interface FranchiseSecurityGateProps {
  gateType: 'unauthenticated' | 'customer_denied' | 'owner_denied' | 'territory_mismatch';
  currentUser: UserAccount | null;
  currentCity: CityConfig;
  userAssignedCityId?: CityId | null;
  onOpenLogin?: () => void;
  onBackToHome: () => void;
  onSwitchToAssignedCity?: (cityId: CityId) => void;
  onGoToOwnerDashboard?: () => void;
}

export const FranchiseSecurityGate: React.FC<FranchiseSecurityGateProps> = ({
  gateType,
  currentUser,
  currentCity,
  userAssignedCityId,
  onOpenLogin,
  onBackToHome,
  onSwitchToAssignedCity,
  onGoToOwnerDashboard,
}) => {
  const cityName = currentCity.name;
  const cityCode = currentCity.code;

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Top Territory Bar */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBackToHome}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 mb-3 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {cityName} Directory</span>
          </button>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
              City Franchise Command Center
            </h1>
            <span className="text-xs bg-red-600/20 text-red-400 border border-red-500/30 px-3 py-0.5 rounded-full font-bold">
              {cityName} ({cityCode})
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Restricted regional administration gateway for verified territory partners and local operations staff.
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
                  Franchise Authentication Required
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Access to the {cityName} Franchise Dashboard is protected. Please sign in with your verified City Franchise Partner or Super Administrator credentials.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs text-slate-600 space-y-2">
                <p className="font-bold text-slate-800">Franchise Management Capabilities:</p>
                <ul className="space-y-1.5 text-[11px] text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Approve or reject local business registrations for {cityName}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Dispatch incoming customer leads and service requests</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Curate city spotlight, theatres, and emergency directory</span>
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
                    <span>Sign In to Franchise Portal →</span>
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
                  Franchise Partner Privileges Required
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  You are currently signed in as <strong className="text-slate-800">{currentUser?.name}</strong> with a <strong>Customer</strong> account.
                  Franchise territory dashboards are restricted to certified regional franchise partners.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {onOpenLogin && (
                  <button
                    onClick={onOpenLogin}
                    className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
                  >
                    Switch Account →
                  </button>
                )}
                <button
                  onClick={onBackToHome}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
                >
                  Back to Public Directory
                </button>
              </div>
            </>
          )}

          {/* Gate 3: Business Owner Denied */}
          {gateType === 'owner_denied' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                  Business Owner Scope
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  You are currently signed in as a <strong>Business Owner</strong>. Business owners can create and manage their own storefront listings in the Business Owner Dashboard, but cannot moderate other merchants or access territory-wide franchise tools.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {onGoToOwnerDashboard && (
                  <button
                    onClick={onGoToOwnerDashboard}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
                  >
                    Go to Business Owner Dashboard →
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

          {/* Gate 4: Territory Mismatch */}
          {gateType === 'territory_mismatch' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                  Territory Boundary Restriction
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  You are authenticated as the City Franchise Partner for <strong className="text-slate-900 capitalize">{userAssignedCityId}</strong>.
                  Under Kaaryan Labs Multi-Territory Isolation, you do not have administrative authority to manage or review data for <strong>{cityName} ({cityCode})</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 text-left text-xs text-rose-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-rose-600" />
                  <span>Assigned Operating Territory:</span>
                </p>
                <p className="text-[11px] text-slate-700">
                  Your credentials grant full moderation, approval, and enquiry management rights strictly inside your registered jurisdiction: <span className="font-bold capitalize">{userAssignedCityId}</span>.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {userAssignedCityId && onSwitchToAssignedCity && (
                  <button
                    onClick={() => onSwitchToAssignedCity(userAssignedCityId)}
                    className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
                  >
                    Switch to {userAssignedCityId.toUpperCase()} Dashboard →
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

