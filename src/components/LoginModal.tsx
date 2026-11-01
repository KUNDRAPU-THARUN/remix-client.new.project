import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../contexts/AuthContext';

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
  const { signIn, signUp, resetPassword, isConfigured } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<'customer' | 'provider'>('customer');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage('');
    setSuccessMessage('');

    if (authMode === 'signup') {
      if (!email.trim() || !password.trim() || !username.trim()) {
        setErrorMessage('Full name, email address, and password are required.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await signUp({
          email: email.trim(),
          password,
          fullName: username.trim(),
          phone: username.replace(/[^0-9]/g, '') || undefined,
          role,
        });

        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.user) {
          onLoginSuccess(res.user);
          onClose();
        }
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Registration failed.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // SIGN IN MODE
    if (!username.trim() && !email.trim()) {
      setErrorMessage('Username or Registered Email / Mobile Number is required.');
      return;
    }

    const loginEmail = email.trim() || (username.includes('@') ? username.trim() : `${username.trim().toLowerCase()}@chittoorads.com`);

    setIsLoading(true);
    try {
      const res = await signIn({
        email: loginEmail,
        password: password || 'demo123',
      });

      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.user) {
        // Apply selected role if in demo mode
        const updatedUser: UserAccount = {
          ...res.user,
          role: isConfigured ? res.user.role : role,
          name: username.trim() || res.user.name,
        };
        onLoginSuccess(updatedUser);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const targetEmail = email.trim() || (username.includes('@') ? username.trim() : '');
    if (!targetEmail) {
      setErrorMessage('Please enter your email address above to receive a password reset link.');
      return;
    }
    setIsLoading(true);
    const res = await resetPassword(targetEmail);
    setIsLoading(false);
    if (res.success) {
      setSuccessMessage(`Password recovery link sent to ${targetEmail}. Please check your inbox.`);
    } else {
      setErrorMessage(res.error || 'Failed to send reset link.');
    }
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
                {authMode === 'signin' ? 'Sign In to ChittoorAds' : 'Create an Account'}
              </h3>
              <p className="text-[11px] text-slate-400">Discover Chittoor in One Click</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
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

          {successMessage && (
            <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Username / Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                {authMode === 'signup' ? 'Full Name *' : 'Username / Registered Mobile *'}
              </label>
              <div className="flex items-center px-3 py-2.5 rounded-xl border border-slate-200 focus-within:border-red-500 bg-slate-50 focus-within:bg-white transition">
                <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={authMode === 'signup' ? 'e.g. Ramesh Naidu' : 'e.g. RameshNaidu or 9440218456'}
                  className="w-full text-xs sm:text-sm outline-hidden font-medium text-slate-900 bg-transparent"
                />
              </div>
            </div>

            {/* 2. Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Email Address {authMode === 'signup' && '*'}
              </label>
              <div className="flex items-center px-3 py-2.5 rounded-xl border border-slate-200 focus-within:border-red-500 bg-slate-50 focus-within:bg-white transition">
                <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="email"
                  required={authMode === 'signup'}
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
                Password *
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
            {authMode === 'signin' && (
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
                  onClick={handleForgotPassword}
                  className="font-semibold text-red-600 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Main Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-sm shadow-md shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <span>{authMode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
                ) : (
                  <>
                    <span>{authMode === 'signin' ? 'Sign In →' : 'Register Free →'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch between Sign In and Sign Up */}
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-xs font-bold text-slate-600 hover:text-red-600 transition cursor-pointer"
            >
              {authMode === 'signin' ? (
                <>New to ChittoorAds? <span className="text-red-600 underline">Create an Account</span></>
              ) : (
                <>Already have an account? <span className="text-red-600 underline">Sign In</span></>
              )}
            </button>
          </div>

          {/* Quick Demo Credentials Help */}
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-[11px] text-slate-500">
            <span className="font-bold text-slate-700">
              {isConfigured ? 'Live Supabase Auth Active:' : 'Instant Demo Login:'}
            </span>{' '}
            {isConfigured
              ? 'Enter your registered email & password to authenticate.'
              : 'Enter any username & password to sign in and test your provider dashboard.'}
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
