import React from 'react';
import {
  User,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  MapPin,
  Lock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Listing, UserAccount, CityConfig } from '../../../types';

interface ProfilePageProps {
  currentUser: UserAccount;
  userListings: Listing[];
  currentCity?: CityConfig;
  onPreviewListing: (listing: Listing) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  userListings,
  currentCity,
  onPreviewListing,
}) => {
  const cityName = currentCity?.name || 'Chittoor';
  const cityCode = currentCity?.code || 'AP-03';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-md">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
                {currentUser.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                Business Owner Account
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                Active Status
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Registered Provider ID: <span className="font-mono text-slate-700">{currentUser.id}</span>
            </p>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>Registered Email</span>
            </span>
            <p className="font-bold text-slate-900">{currentUser.email}</p>
            <p className="text-[11px] text-slate-400">Authenticated via Supabase Auth</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mobile Number</span>
            </span>
            <p className="font-bold text-slate-900">{currentUser.mobile || 'Not specified'}</p>
            <p className="text-[11px] text-slate-400">Used for customer enquiry notifications</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span>Assigned City Territory</span>
            </span>
            <p className="font-bold text-slate-900">{cityName} ({cityCode})</p>
            <p className="text-[11px] text-slate-400">Designated operating region for your listings</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Linked Business Listings</span>
            </span>
            <p className="font-bold text-slate-900">{userListings.length} Active Records</p>
            <p className="text-[11px] text-slate-400">Protected by database row ownership</p>
          </div>
        </div>
      </div>

      {/* 2. Security & Role Policy Notice */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200/90 p-6 space-y-2.5">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-700" />
          <h3 className="font-bold text-sm text-slate-900 font-heading">
            Strict Security & Anti-Escalation Safeguards
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          In compliance with KAARYAN LABS security specifications, business owner accounts cannot directly alter their assigned territory, elevate account roles to Franchise or Super Admin, or modify listing verification badges. All elevated role assignments are guarded by PostgreSQL database triggers and Supabase Row Level Security (RLS).
        </p>
      </div>

      {/* 3. Linked Businesses Overview */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <h3 className="font-black text-sm sm:text-base text-slate-900 font-heading flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Registered Business Profiles ({userListings.length})</span>
        </h3>

        {userListings.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {userListings.map((biz) => (
              <div key={biz.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {biz.title}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {biz.category} • {biz.address}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      (biz.status || 'Active') === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {biz.status || 'Active'}
                  </span>
                  <button
                    onClick={() => onPreviewListing(biz)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                    title="View Public Profile"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-3 text-center">
            No business listings currently linked to this profile.
          </p>
        )}
      </div>
    </div>
  );
};

