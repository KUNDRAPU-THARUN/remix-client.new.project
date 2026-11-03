import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  MapPin,
  Lock,
  LogOut,
  Save,
  CheckCircle2,
  Bell,
  Globe,
  Compass,
} from 'lucide-react';
import { UserAccount, CityConfig } from '../../../types';

interface FranchiseSettingsPageProps {
  currentUser: UserAccount;
  currentCity: CityConfig;
  onSignOut?: () => void;
}

export const FranchiseSettingsPage: React.FC<FranchiseSettingsPageProps> = ({
  currentUser,
  currentCity,
  onSignOut,
}) => {
  const [partnerPhone, setPartnerPhone] = useState(currentUser.mobile || currentCity.contact.phone);
  const [leadAlerts, setLeadAlerts] = useState(true);
  const [autoRouting, setAutoRouting] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Partner Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-black text-base shadow-xs">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'F'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 font-heading">
                  {currentUser.name}
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Certified Franchise Partner
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {currentUser.email}
              </p>
            </div>
          </div>

          <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-900 text-white">
            {currentCity.code}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Operating Territory</span>
            <span className="font-black text-slate-900 text-xs mt-0.5 block">{currentCity.name}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Territory Code</span>
            <span className="font-black text-slate-900 text-xs mt-0.5 block">{currentCity.code}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Regional Portal</span>
            <span className="font-black text-slate-900 text-xs mt-0.5 block truncate">{currentCity.domain}</span>
          </div>
        </div>
      </div>

      {/* Operational Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            <h3 className="text-sm font-black text-slate-900 font-heading">
              Territory Dispatch & Notification Preferences
            </h3>
          </div>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Preferences Saved</span>
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Franchise Dispatch Telephone / WhatsApp
            </label>
            <input
              type="text"
              value={partnerPhone}
              onChange={(e) => setPartnerPhone(e.target.value)}
              className="w-full sm:w-80 text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-red-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Used for SMS and WhatsApp dispatch notifications for new resident quote requests in {currentCity.name}.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={leadAlerts}
                onChange={(e) => setLeadAlerts(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
              />
              <div>
                <span className="font-bold text-slate-800 block">Instant Service Request Notifications</span>
                <span className="text-[11px] text-slate-500">Receive real-time lead alerts when a customer submits a general service request in {currentCity.name}.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={autoRouting}
                onChange={(e) => setAutoRouting(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
              />
              <div>
                <span className="font-bold text-slate-800 block">Auto-Assign Verified Merchants</span>
                <span className="text-[11px] text-slate-500">Automatically broadcast verified customer requests to active merchants in matching categories.</span>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Security & Active Session */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-black text-slate-900 font-heading">
              Authenticated Session Security
            </h4>
          </div>
          <p className="text-xs text-slate-500">
            Signed in with server-verified credentials. Role: <span className="font-bold text-slate-700 capitalize">{currentUser.isSuperAdmin ? 'Super Administrator' : 'City Franchise'}</span>.
          </p>
        </div>

        {onSignOut && (
          <button
            onClick={onSignOut}
            className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        )}
      </div>
    </div>
  );
};

