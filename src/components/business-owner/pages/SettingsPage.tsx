import React, { useState } from 'react';
import {
  Settings,
  Globe,
  Lock,
  Mail,
  ShieldCheck,
  Bell,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  MapPin,
} from 'lucide-react';
import { UserAccount, CityConfig, CityId } from '../../../types';
import { useTranslation } from '../../../i18n/LanguageContext';
import { LanguageOption } from '../../../i18n/translations';
import { authService } from '../../../services/authService';

interface SettingsPageProps {
  currentUser: UserAccount;
  currentCity?: CityConfig;
  onSignOut?: () => void;
  onBackToHome: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  currentCity,
  onSignOut,
  onBackToHome,
}) => {
  const { currentLanguage, setLanguage, languages } = useTranslation();
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetStatus, setResetStatus] = useState<{ success: boolean; message: string } | null>(null);

  const cityName = currentCity?.name || 'Chittoor';
  const cityCode = currentCity?.code || 'AP-03';

  const handlePasswordReset = async () => {
    setIsResettingPassword(true);
    setResetStatus(null);
    try {
      const res = await authService.resetPassword(currentUser.email);
      if (res.success) {
        setResetStatus({
          success: true,
          message: `Password reset instructions have been dispatched to ${currentUser.email}. Please check your inbox.`,
        });
      } else {
        setResetStatus({
          success: false,
          message: res.error || 'Failed to dispatch password recovery email.',
        });
      }
    } catch (err) {
      setResetStatus({
        success: false,
        message: err instanceof Error ? err.message : 'An error occurred during password recovery.',
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-black font-heading text-slate-900 tracking-tight">
            Dashboard & Account Preferences
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Configure language, territory, notification preferences and authentication security.
        </p>
      </div>

      {/* 2. Language & Localization */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-sm text-slate-900 font-heading">
            Interface Language
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Select your preferred regional language for the directory dashboard and public interface.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {languages.map((lang: LanguageOption) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20 shadow-2xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <p className="font-bold text-xs">{lang.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{lang.nativeName}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Authentication & Account Security */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900 font-heading">
            Account Security & Supabase Authentication
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-slate-900">Sign-in Email</p>
              <p className="text-[11px] text-slate-500">{currentUser.email}</p>
            </div>
            <span className="self-start sm:self-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Verified Auth Session
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-slate-900">Password Recovery</p>
              <p className="text-[11px] text-slate-500">
                Send a secure password reset link to your verified email address.
              </p>
            </div>
            <button
              onClick={handlePasswordReset}
              disabled={isResettingPassword}
              className="self-start sm:self-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isResettingPassword ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Send Reset Email</span>
                </>
              )}
            </button>
          </div>

          {resetStatus && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-2 text-xs font-medium ${
                resetStatus.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {resetStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{resetStatus.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Session Termination */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 font-heading">
          Sign Out of Business Dashboard
        </h3>
        <p className="text-xs text-slate-500">
          Terminate your current provider session on this browser. You can sign back in at any time.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Dashboard</span>
            </button>
          )}

          <button
            onClick={onBackToHome}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            Return to Public Website
          </button>
        </div>
      </div>
    </div>
  );
};
