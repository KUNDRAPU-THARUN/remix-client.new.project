import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { UserAccount } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const [role, setRole] = useState<'customer' | 'provider'>('customer');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Username or Registered Mobile Number is required.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const user: UserAccount = {
        id: `user-${Date.now()}`,
        username: username.trim(),
        email: email.trim() || `${username.trim().toLowerCase()}@chittoorads.com`,
        role,
        name: username.trim(),
        mobile: username.replace(/[^0-9]/g, '') || '9440218456',
      };

      onLoginSuccess(user);
      setIsLoading(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black shadow-xs">
              CA
            </div>
            <div>
              <h3 className="font-bold text-base font-heading">
                Sign In to ChittoorAds
              </h3>
              <p className="text-[11px] text-slate-400">Discover Chittoor in One Click</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual-role toggle switcher */}
        <div className="p-6 pb-2">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-2 rounded-lg transition cursor-pointer ${
                role === 'customer'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In as Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('provider')}
              className={`py-2 rounded-lg transition cursor-pointer ${
                role === 'provider'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In as Provider
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Username (or Registered Mobile Number) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Username / Registered Mobile *
              </label>
              <div className="flex items-center px-3 py-2.5 rounded-xl border border-slate-200 focus-within:border-red-500 bg-slate-50 focus-within:bg-white transition">
                <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. RameshNaidu or 9440218456"
                  className="w-full text-xs sm:text-sm outline-hidden font-medium text-slate-900 bg-transparent"
                />
              </div>
            </div>

            {/* 2. Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Email Address
              </label>
              <div className="flex items-center px-3 py-2.5 rounded-xl border border-slate-200 focus-within:border-red-500 bg-slate-50 focus-within:bg-white transition">
                <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ramesh@example.com"
                  className="w-full text-xs sm:text-sm outline-hidden font-medium text-slate-900 bg-transparent"
                />
              </div>
            </div>

            {/* 3. Password (with toggle show/hide) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Password
              </label>
              <div className="flex items-center px-3 py-2.5 rounded-xl border border-slate-200 focus-within:border-red-500 bg-slate-50 focus-within:bg-white transition">
                <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full text-xs sm:text-sm outline-hidden font-medium text-slate-900 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 transition ml-2 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 accent-red-600 cursor-pointer"
                />
                <span className="font-semibold text-slate-700">Remember Me</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Password reset link sent to your registered mobile/email in Chittoor.')}
                className="font-semibold text-red-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Main Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-sm shadow-md shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In →</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Help */}
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-[11px] text-slate-500">
            <span className="font-bold text-slate-700">Instant Demo Login:</span> Enter any username & password to sign in and test your provider dashboard.
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          ChittoorAds Security • 100% Verified Local Portal
        </div>
      </div>
    </div>
  );
};
