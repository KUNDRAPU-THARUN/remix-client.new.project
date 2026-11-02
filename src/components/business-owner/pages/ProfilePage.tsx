import React, { useState } from 'react';
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
  Edit3,
  X,
  Loader2,
} from 'lucide-react';
import { Listing, UserAccount, CityConfig } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';

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
  const { updateProfile } = useAuth();
  const cityName = currentCity?.name || 'Chittoor';
  const cityCode = currentCity?.code || 'AP-03';

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.mobile || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const handleOpenEdit = () => {
    setEditName(currentUser.name);
    setEditPhone(currentUser.mobile || '');
    setSaveError('');
    setSaveSuccess('');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess('');

    if (!editName.trim() || editName.trim().length < 2) {
      setSaveError('Please enter a valid display name (at least 2 characters).');
      return;
    }

    const cleanPhone = editPhone.replace(/\D/g, '');
    if (cleanPhone && (cleanPhone.length < 10 || cleanPhone.length > 15)) {
      setSaveError('Please enter a valid 10-15 digit mobile number.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateProfile({
        displayName: editName.trim(),
        phone: editPhone.trim(),
      });

      if (res.success) {
        setSaveSuccess('Merchant profile details updated and saved to database successfully.');
        setTimeout(() => {
          setIsEditModalOpen(false);
          setSaveSuccess('');
        }, 1200);
      } else {
        setSaveError(res.error || 'Failed to update profile.');
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-5">
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

          <button
            onClick={handleOpenEdit}
            className="self-start sm:self-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
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

      {/* 4. Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base font-heading">Edit Merchant Profile</h3>
                  <p className="text-xs text-slate-400">Update verified contact and business owner name</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              {saveSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccess}</span>
                </div>
              )}

              {saveError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Display / Business Owner Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Contact Mobile Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
                <p className="text-[11px] text-slate-400">Used for customer inquiry and lead notifications.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Registered Email Address (Read-Only)</label>
                <input
                  type="email"
                  value={currentUser.email}
                  disabled
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400">Email is protected and managed via Supabase Auth credentials.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Operating City Territory (Protected)</label>
                <input
                  type="text"
                  value={`${cityName} (${cityCode})`}
                  disabled
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400">Territory is bound to franchise region and cannot be modified by merchant.</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

