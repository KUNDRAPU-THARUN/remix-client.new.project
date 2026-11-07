import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Compass,
  ArrowRight,
  Shield,
  KeyRound,
  AlertCircle,
  MapPin,
  Globe,
} from 'lucide-react';
import { UserAccount, CityConfig, CityId } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCity } from '../contexts/CityContext';
import { CITIES, DEFAULT_CITY_ID, SUPPORTED_CITY_IDS, isCityId } from '../config/cities';

export type DestinationTab = 'home' | 'category' | 'classifieds' | 'kanipakam' | 'dashboard' | 'franchise' | 'admin';
export type PortalType = 'customer' | 'business_owner' | 'city_franchise' | 'super_admin';

export interface AuthorizedDestination {
  id: string;
  title: string;
  subtitle: string;
  tab: DestinationTab;
  cityId?: CityId;
  badge: string;
  badgeColor: string;
}

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount, targetTab?: DestinationTab, targetCityId?: CityId) => void;
  currentCity?: CityConfig;
  activeTab?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentCity: propCity,
  activeTab = 'home',
}) => {
  const { signIn, signUp, resetPassword, isConfigured } = useAuth();

  // Safe city resolution: propCity > contextCity > DEFAULT_CITY_ID
  let contextCity: CityConfig | undefined;
  try {
    const cityContext = useCity();
    contextCity = cityContext?.city;
  } catch {
    // Rendered outside CityProvider (e.g. isolated test harness)
  }
  const defaultCity = propCity || contextCity || CITIES[DEFAULT_CITY_ID];

  // Selected City State (for Sign In territory & Registration registered city)
  const [selectedCityId, setSelectedCityId] = useState<CityId>(() => {
    return defaultCity?.id || DEFAULT_CITY_ID;
  });

  // Form states
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [signupRole, setSignupRole] = useState<'customer' | 'provider'>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Four-Portal Selection State
  const [selectedPortal, setSelectedPortal] = useState<PortalType>(() => {
    if (activeTab === 'admin') return 'super_admin';
    if (activeTab === 'franchise') return 'city_franchise';
    if (activeTab === 'dashboard') return 'business_owner';
    return 'customer';
  });

  // Effective modal city based on user's current city selection
  const modalCity = useMemo(() => {
    return CITIES[selectedCityId] || defaultCity;
  }, [selectedCityId, defaultCity]);

  const cityName = modalCity.name;
  const cityCode = modalCity.code;
  const cityTagline = modalCity.tagline;
  const cityBrandName = `${cityName}Ads`;

  // Dynamic city initials for logo badge (CA = Chittoor, VA = Vellore, BA = Bengaluru, SA = Super Admin)
  const isSuperAdminPortal = selectedPortal === 'super_admin';
  const logoInitials = isSuperAdminPortal
    ? 'SA'
    : selectedCityId === 'vellore'
    ? 'VA'
    : selectedCityId === 'bengaluru'
    ? 'BA'
    : 'CA';

  // Dynamic city gradients
  const logoGradient = isSuperAdminPortal
    ? 'from-purple-600 via-indigo-600 to-slate-900'
    : selectedCityId === 'vellore'
    ? 'from-[#176AC4] via-[#15995F] to-[#E51E31]'
    : selectedCityId === 'bengaluru'
    ? 'from-[#15995F] via-[#F5C325] to-[#176AC4]'
    : 'from-[#E51E31] via-[#c91829] to-[#176AC4]';

  const buttonGradient = isSuperAdminPortal
    ? 'from-purple-700 via-indigo-700 to-slate-900 shadow-purple-600/30'
    : selectedCityId === 'vellore'
    ? 'from-[#176AC4] via-blue-700 to-indigo-800 shadow-blue-600/30'
    : selectedCityId === 'bengaluru'
    ? 'from-[#15995F] via-emerald-700 to-teal-800 shadow-emerald-600/30'
    : 'from-red-600 via-rose-600 to-red-700 shadow-red-600/30';

  // Portal definitions for clear visual segmentation
  const portalOptions: {
    id: PortalType;
    title: string;
    badge: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    activeBorder: string;
    activeBg: string;
    iconActiveBg: string;
    badgeColor: string;
    textActive: string;
  }[] = [
    {
      id: 'customer',
      title: 'Customer',
      badge: 'Public',
      desc: 'Directory & Leads',
      icon: User,
      activeBorder: 'border-blue-600',
      activeBg: 'bg-blue-50/70',
      iconActiveBg: 'bg-blue-600 text-white',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      textActive: 'text-blue-900',
    },
    {
      id: 'business_owner',
      title: 'Business Owner',
      badge: 'Merchant',
      desc: 'Storefront Ads',
      icon: Building2,
      activeBorder: 'border-indigo-600',
      activeBg: 'bg-indigo-50/70',
      iconActiveBg: 'bg-indigo-600 text-white',
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      textActive: 'text-indigo-900',
    },
    {
      id: 'city_franchise',
      title: 'City Franchise',
      badge: isSuperAdminPortal ? 'Multi-City' : cityCode,
      desc: isSuperAdminPortal ? 'Territory Ops' : `${cityName} Ops`,
      icon: Compass,
      activeBorder: 'border-rose-600',
      activeBg: 'bg-rose-50/70',
      iconActiveBg: 'bg-rose-600 text-white',
      badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
      textActive: 'text-rose-900',
    },
    {
      id: 'super_admin',
      title: 'Super Admin',
      badge: 'Global',
      desc: 'Platform Governance',
      icon: ShieldCheck,
      activeBorder: 'border-purple-600',
      activeBg: 'bg-purple-50/70',
      iconActiveBg: 'bg-purple-600 text-white',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      textActive: 'text-purple-900',
    },
  ];

  const getPortalHelper = (portal: PortalType): string => {
    switch (portal) {
      case 'super_admin':
        return 'Restricted to central platform administrators with multi-city governance privileges.';
      case 'city_franchise':
        return `Restricted to authorized ${cityName} (${cityCode}) franchise partners and territory staff.`;
      case 'business_owner':
        return `Sign in to manage storefront listings, track customer leads, and view insights in ${cityName}.`;
      case 'customer':
      default:
        return `Sign in to bookmark businesses, submit enquiries, and review listings in ${cityName}.`;
    }
  };

  const getSubmitButtonLabel = (): string => {
    if (isLoading) return 'Signing In...';
    switch (selectedPortal) {
      case 'super_admin':
        return 'Sign In to Super Admin Console →';
      case 'city_franchise':
        return `Sign In to ${cityName} Franchise →`;
      case 'business_owner':
        return `Sign In to Business Dashboard (${cityName}) →`;
      case 'customer':
      default:
        return `Sign In to ${cityBrandName} →`;
    }
  };

  // Multi-role destination selector state
  const [pendingUser, setPendingUser] = useState<UserAccount | null>(null);
  const [availableDestinations, setAvailableDestinations] = useState<AuthorizedDestination[]>([]);

  // Functional Remember Me: Restore remembered email on modal open
  useEffect(() => {
    if (isOpen) {
      try {
        const rememberedEmail = localStorage.getItem('kaaryan_remembered_email');
        if (rememberedEmail) {
          setEmail(rememberedEmail);
          setRememberMe(true);
        }
      } catch {}
      setErrorMessage('');
      setSuccessMessage('');
      setPendingUser(null);
      setAvailableDestinations([]);
      setAuthMode('signin');
      setShowPassword(false);
      setSelectedCityId(defaultCity?.id || DEFAULT_CITY_ID);
      // Contextual portal initialization based on active route
      if (activeTab === 'admin') setSelectedPortal('super_admin');
      else if (activeTab === 'franchise') setSelectedPortal('city_franchise');
      else if (activeTab === 'dashboard') setSelectedPortal('business_owner');
      else setSelectedPortal('customer');
    }
  }, [isOpen, activeTab, defaultCity?.id]);

  if (!isOpen) return null;

  // Build list of authorized destinations based on user's server-verified roles
  const computeDestinations = (user: UserAccount, targetCityId: CityId = selectedCityId): AuthorizedDestination[] => {
    const destinations: AuthorizedDestination[] = [];

    // 1. Super Admin Console
    if (user.isSuperAdmin || user.roles?.some((r) => r.role === 'super_admin')) {
      destinations.push({
        id: 'admin',
        title: 'Central Super Admin Console',
        subtitle: 'Platform-wide controls, multi-territory governance & database health',
        tab: 'admin',
        badge: 'Super Admin',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      });
    }

    // 2. City Franchise Command Center
    const franchiseRoles = user.roles?.filter(
      (r) => r.role === 'city_franchise' || r.role === 'data_entry_staff'
    ) || [];

    if (user.isSuperAdmin) {
      const assignedCityConfig = CITIES[targetCityId] || modalCity;
      destinations.push({
        id: `franchise-${targetCityId}`,
        title: `${assignedCityConfig.name} Franchise Command Center`,
        subtitle: `Regional listing moderation, quote dispatch & local directory (${assignedCityConfig.code})`,
        tab: 'franchise',
        cityId: targetCityId,
        badge: `Franchise (${assignedCityConfig.code})`,
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      });
    } else if (franchiseRoles.length > 0) {
      for (const fRole of franchiseRoles) {
        const assignedCityId = fRole.cityId || targetCityId;
        const assignedCityConfig = CITIES[assignedCityId] || modalCity;
        destinations.push({
          id: `franchise-${assignedCityId}`,
          title: `${assignedCityConfig.name} Franchise Command Center`,
          subtitle: `Regional listing moderation, quote dispatch & local directory (${assignedCityConfig.code})`,
          tab: 'franchise',
          cityId: assignedCityId,
          badge: `Franchise (${assignedCityConfig.code})`,
          badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        });
      }
    } else if (user.isFranchise && user.franchiseCityId) {
      const assignedCityConfig = CITIES[user.franchiseCityId] || modalCity;
      destinations.push({
        id: `franchise-${user.franchiseCityId}`,
        title: `${assignedCityConfig.name} Franchise Command Center`,
        subtitle: `Regional listing moderation, quote dispatch & local directory (${assignedCityConfig.code})`,
        tab: 'franchise',
        cityId: user.franchiseCityId,
        badge: `Franchise (${assignedCityConfig.code})`,
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      });
    }

    // 3. Business Owner Dashboard
    const isMerchant =
      user.roles?.some((r) => r.role === 'business_owner') ||
      (!user.isSuperAdmin && !user.isFranchise && user.role === 'provider');
    if (isMerchant || user.isSuperAdmin) {
      const merchantCityConfig = CITIES[targetCityId] || modalCity;
      destinations.push({
        id: 'dashboard',
        title: `Business Owner Dashboard (${merchantCityConfig.name})`,
        subtitle: 'Manage storefront advertisements, track customer leads & reviews',
        tab: 'dashboard',
        cityId: targetCityId,
        badge: 'Merchant Portal',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      });
    }

    // 4. Consumer Experience
    const consumerCityConfig = CITIES[targetCityId] || modalCity;
    destinations.push({
      id: `directory-${targetCityId}`,
      title: `Browse ${consumerCityConfig.name} Directory`,
      subtitle: `Explore verified businesses, attractions & classifieds in ${consumerCityConfig.name} (${consumerCityConfig.code})`,
      tab: 'home',
      cityId: targetCityId,
      badge: 'Public Directory',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    });

    return destinations;
  };

  const handleDestinationSelect = (dest: AuthorizedDestination) => {
    if (!pendingUser) return;
    onLoginSuccess(pendingUser, dest.tab, dest.cityId);
    onClose();
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    // Functional Remember Me
    try {
      if (rememberMe) {
        localStorage.setItem('kaaryan_remembered_email', cleanEmail);
      } else {
        localStorage.removeItem('kaaryan_remembered_email');
      }
    } catch {}

    setIsLoading(true);
    try {
      const res = await signIn({
        email: cleanEmail,
        password: password.trim(),
      });

      if (res.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
        return;
      }

      if (!res.user) {
        setErrorMessage('User session could not be established. Please try again.');
        setIsLoading(false);
        return;
      }

      const authenticatedUser = res.user;

      // -------------------------------------------------------------
      // FOUR-PORTAL SECURITY & ROLE VERIFICATION
      // -------------------------------------------------------------
      if (selectedPortal === 'super_admin') {
        const isSuperAdmin =
          authenticatedUser.isSuperAdmin ||
          authenticatedUser.roles?.some((r) => r.role === 'super_admin');

        if (!isSuperAdmin) {
          setErrorMessage(
            'Access Denied: Your account does not have Super Administrator privileges. Please select your authorized portal.'
          );
          setIsLoading(false);
          return;
        }

        onLoginSuccess(authenticatedUser, 'admin');
        onClose();
        return;
      }

      if (selectedPortal === 'city_franchise') {
        const franchiseRole = authenticatedUser.roles?.find(
          (r) => r.role === 'city_franchise' || r.role === 'data_entry_staff'
        );
        const isFranchiseAuthorized =
          authenticatedUser.isSuperAdmin ||
          authenticatedUser.isFranchise ||
          Boolean(franchiseRole);

        if (!isFranchiseAuthorized) {
          setErrorMessage(
            'Access Denied: Your account is not authorized as a City Franchise partner. Please select your authorized portal.'
          );
          setIsLoading(false);
          return;
        }

        // Super Admin can access any franchise territory
        if (authenticatedUser.isSuperAdmin) {
          onLoginSuccess(authenticatedUser, 'franchise', selectedCityId);
          onClose();
          return;
        }

        // Territory validation: Verify selected territory matches user's assigned franchise city
        const assignedCityId = franchiseRole?.cityId || authenticatedUser.franchiseCityId;
        if (assignedCityId && assignedCityId !== selectedCityId) {
          const assignedCityName = CITIES[assignedCityId]?.name || assignedCityId;
          const assignedCityCode = CITIES[assignedCityId]?.code || '';
          const targetCityName = CITIES[selectedCityId]?.name || selectedCityId;
          setErrorMessage(
            `Access Denied: Your franchise account is authorized for ${assignedCityName} (${assignedCityCode}), not ${targetCityName}. Please select your assigned territory.`
          );
          setIsLoading(false);
          return;
        }

        onLoginSuccess(authenticatedUser, 'franchise', assignedCityId || selectedCityId);
        onClose();
        return;
      }

      if (selectedPortal === 'business_owner') {
        const isMerchant =
          authenticatedUser.isSuperAdmin ||
          authenticatedUser.roles?.some((r) => r.role === 'business_owner') ||
          authenticatedUser.role === 'provider';

        if (!isMerchant) {
          setErrorMessage(
            'Access Denied: Your account is registered as a Customer. The Business Owner portal requires a registered business account.'
          );
          setIsLoading(false);
          return;
        }

        onLoginSuccess(authenticatedUser, 'dashboard', selectedCityId);
        onClose();
        return;
      }

      // Customer portal (default): Accessible to all verified users
      // If user possesses elevated roles, offer the Multi-Role Destination Selector:
      const destinations = computeDestinations(authenticatedUser, selectedCityId);
      const elevatedDestinations = destinations.filter((d) => d.tab !== 'home');

      if (elevatedDestinations.length > 0) {
        setPendingUser(authenticatedUser);
        setAvailableDestinations(destinations);
        setIsLoading(false);
        return;
      }

      // Pure Customer account
      onLoginSuccess(authenticatedUser, 'home', selectedCityId);
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Sign in failed unexpectedly.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim();
    const cleanName = fullName.trim();
    if (!cleanName || !cleanEmail || !password.trim()) {
      setErrorMessage('Full name, email address, and password are required.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (!isCityId(selectedCityId)) {
      setErrorMessage('Please select an authorized city territory (Chittoor, Vellore, or Bengaluru).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signUp({
        email: cleanEmail,
        password: password.trim(),
        fullName: cleanName,
        phone: phone.trim() || undefined,
        role: signupRole,
        cityId: selectedCityId,
      });

      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.user) {
        if (signupRole === 'provider') {
          onLoginSuccess(res.user, 'dashboard', selectedCityId);
        } else {
          onLoginSuccess(res.user, 'home', selectedCityId);
        }
        onClose();
      } else {
        // Supabase requires email verification
        setSuccessMessage(
          `Account created for ${cleanEmail}! Please check your email to confirm your account before signing in.`
        );
        setAuthMode('signin');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address to receive password reset instructions.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(cleanEmail);
      if (res.success) {
        setSuccessMessage(`Password recovery instructions have been sent to ${cleanEmail}. Please check your inbox.`);
      } else {
        setErrorMessage(res.error || 'Failed to send recovery link. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Dynamic City Top Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${logoGradient} flex items-center justify-center text-white font-black text-sm shadow-md shadow-slate-950/40 shrink-0`}
            >
              {logoInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base font-heading text-white">
                  {authMode === 'signin'
                    ? isSuperAdminPortal
                      ? 'Sign In to Super Admin Console'
                      : `Sign In to ${cityBrandName}`
                    : authMode === 'signup'
                    ? `Create ${cityBrandName} Account`
                    : 'Reset Password'}
                </h3>
                <span className="text-[10px] bg-white/10 text-slate-300 font-extrabold px-1.5 py-0.5 rounded border border-white/15">
                  {isSuperAdminPortal ? 'GLOBAL' : cityCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                {authMode === 'signin'
                  ? isSuperAdminPortal
                    ? 'Platform-Wide Multi-City Governance'
                    : cityTagline
                  : authMode === 'signup'
                  ? `Join ${cityName}'s Local Business Directory`
                  : 'Enter your email for recovery instructions'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* MULTI-ROLE DESTINATION SELECTION SCREEN */}
          {pendingUser && availableDestinations.length > 0 ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-slate-900 font-heading">
                  Authentication Successful
                </h4>
                <p className="text-xs text-slate-600">
                  Signed in as <strong className="text-slate-800">{pendingUser.name}</strong> ({pendingUser.email}).
                  Select your destination:
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                {availableDestinations.map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => handleDestinationSelect(dest)}
                    className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-red-600 transition">
                          {dest.title}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${dest.badgeColor}`}
                        >
                          {dest.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {dest.subtitle}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Alert Feedback Messages */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* MODE 1: SIGN IN                                               */}
              {/* ------------------------------------------------------------- */}
              {authMode === 'signin' && (
                <form onSubmit={handleSignInSubmit} noValidate className="space-y-4">
                  {/* Four-Portal Target Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Target Portal *
                      </label>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Select destination portal
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {portalOptions.map((portal) => {
                        const isSelected = selectedPortal === portal.id;
                        const Icon = portal.icon;
                        return (
                          <button
                            key={portal.id}
                            type="button"
                            onClick={() => {
                              setSelectedPortal(portal.id);
                              setErrorMessage('');
                            }}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? `${portal.activeBorder} ${portal.activeBg} ring-1 ring-slate-400/30 shadow-xs`
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <div
                                className={`p-1.5 rounded-lg ${
                                  isSelected ? portal.iconActiveBg : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span
                                className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                  isSelected ? portal.badgeColor : 'bg-slate-50 text-slate-500 border-slate-200'
                                }`}
                              >
                                {portal.badge}
                              </span>
                            </div>
                            <div>
                              <span
                                className={`text-xs font-bold block ${
                                  isSelected ? portal.textActive : 'text-slate-800'
                                }`}
                              >
                                {portal.title}
                              </span>
                              <span className="text-[10px] text-slate-500 leading-tight line-clamp-1">
                                {portal.desc}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Territory / City Selection for City-Scoped Portals */}
                  {selectedPortal === 'super_admin' ? (
                    <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-900 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-purple-600 text-white shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold block text-purple-950">Territory Scope: All Cities</span>
                          <span className="text-[11px] text-purple-700">Multi-city governance (AP-03 • TN-23 • KA-01)</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-200/80 text-purple-800 border border-purple-300">
                        Global
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                          City / Territory *
                        </label>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Select target city
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {SUPPORTED_CITY_IDS.map((cId) => {
                          const cConfig = CITIES[cId];
                          const isSelected = selectedCityId === cId;
                          const activeColor =
                            cId === 'vellore'
                              ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-1 ring-blue-500/30'
                              : cId === 'bengaluru'
                              ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 ring-1 ring-emerald-500/30'
                              : 'border-red-600 bg-red-50/80 text-red-900 ring-1 ring-red-500/30';
                          const badgeColor =
                            cId === 'vellore'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : cId === 'bengaluru'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-red-100 text-red-800 border-red-200';

                          return (
                            <button
                              key={cId}
                              type="button"
                              onClick={() => {
                                setSelectedCityId(cId);
                                setErrorMessage('');
                              }}
                              className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                                isSelected
                                  ? activeColor
                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span className="text-xs font-bold">{cConfig.name}</span>
                              </div>
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${badgeColor}`}>
                                {cConfig.code}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Portal Description Helper Callout */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{getPortalHelper(selectedPortal)}</span>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Email Address *
                    </label>
                    <div className="flex items-center px-3 py-2.5 rounded-xl border border-slate-200 focus-within:border-red-500 bg-slate-50 focus-within:bg-white transition">
                      <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. name@example.com"
                        className="w-full text-xs sm:text-sm outline-hidden font-medium text-slate-900 bg-transparent"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password with Show/Hide Toggle */}
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
                        placeholder="Enter your account password"
                        className="w-full text-xs sm:text-sm outline-hidden font-medium text-slate-900 bg-transparent"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 transition ml-2 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Functional Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-red-600 accent-red-600 cursor-pointer"
                      />
                      <span className="font-semibold text-slate-700">Remember email</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="font-semibold text-red-600 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Sign In Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${buttonGradient} text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60`}
                    >
                      {isLoading ? (
                        <span>Signing In...</span>
                      ) : (
                        <span>{getSubmitButtonLabel()}</span>
                      )}
                    </button>
                  </div>

                  {/* Link to Registration */}
                  <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-red-600 transition cursor-pointer"
                    >
                      New to {cityBrandName}?{' '}
                      <span className="text-red-600 underline">Create an Account</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ------------------------------------------------------------- */}
              {/* MODE 2: REGISTRATION (SIGN UP)                                 */}
              {/* ------------------------------------------------------------- */}
              {authMode === 'signup' && (
                <form onSubmit={handleSignUpSubmit} noValidate className="space-y-4">
                  {/* Account Type Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Account Type *
                    </label>
                    <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setSignupRole('customer')}
                        className={`py-2 px-2 rounded-lg transition cursor-pointer text-center ${
                          signupRole === 'customer'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Customer
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupRole('provider')}
                        className={`py-2 px-2 rounded-lg transition cursor-pointer text-center ${
                          signupRole === 'provider'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Business Owner
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 px-1">
                      {signupRole === 'customer'
                        ? 'Explore directory, bookmark listings & submit verified reviews.'
                        : 'Register your business & manage local storefront advertisements.'}
                    </p>
                    <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2 leading-relaxed">
                      <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        Note: City Franchise and Super Admin accounts are provisioned via administrative governance and cannot be self-registered.
                      </span>
                    </div>
                  </div>

                  {/* Explicit Territory / City Selection for Registration */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Registered City / Territory *
                      </label>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Primary operating territory
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {SUPPORTED_CITY_IDS.map((cId) => {
                        const cConfig = CITIES[cId];
                        const isSelected = selectedCityId === cId;
                        const activeColor =
                          cId === 'vellore'
                            ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-1 ring-blue-500/30'
                            : cId === 'bengaluru'
                            ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 ring-1 ring-emerald-500/30'
                            : 'border-red-600 bg-red-50/80 text-red-900 ring-1 ring-red-500/30';
                        const badgeColor =
                          cId === 'vellore'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : cId === 'bengaluru'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-red-100 text-red-800 border-red-200';

                        return (
                          <button
                            key={cId}
                            type="button"
                            onClick={() => {
                              setSelectedCityId(cId);
                              setErrorMessage('');
                            }}
                            className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              isSelected
                                ? activeColor
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span className="text-xs font-bold">{cConfig.name}</span>
                            </div>
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${badgeColor}`}>
                              {cConfig.code}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 px-1">
                      {signupRole === 'customer'
                        ? `Your customer profile will be associated with ${CITIES[selectedCityId]?.name || selectedCityId} (${CITIES[selectedCityId]?.code || ''}).`
                        : `Your business listings and leads will be managed in ${CITIES[selectedCityId]?.name || selectedCityId} (${CITIES[selectedCityId]?.code || ''}).`}
                    </p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Full Name *
                    </label>
                    <div className="flex items-center px-3 py-2.5 rounded-xl border border-slate-200 focus-within:border-red-500 bg-slate-50 focus-within:bg-white transition">
                      <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ramesh Naidu"
                        className="w-full text-xs sm:text-sm outline-hidden font-medium text-slate-900 bg-transparent"
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Email Address *
                    </label>
                    <div className="flex items-center px-3 py-2.5 rounded-xl border border-slate-200 focus-within:border-red-500 bg-slate-50 focus-within:bg-white transition">
                      <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. ramesh@example.com"
                        className="w-full text-xs sm:text-sm outline-hidden font-medium text-slate-900 bg-transparent"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Mobile Number (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Mobile Number {signupRole === 'provider' ? '(for customer enquiries)' : '(optional)'}
                    </label>
                    <div className="flex items-center px-3 py-2.5 rounded-xl border border-slate-200 focus-within:border-red-500 bg-slate-50 focus-within:bg-white transition">
                      <span className="text-xs font-bold text-slate-400 mr-2">+91</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9440218456"
                        className="w-full text-xs sm:text-sm outline-hidden font-medium text-slate-900 bg-transparent"
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Create Password (min. 6 characters) *
                    </label>
                    <div className="flex items-center px-3 py-2.5 rounded-xl border border-slate-200 focus-within:border-red-500 bg-slate-50 focus-within:bg-white transition">
                      <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Choose a strong password"
                        className="w-full text-xs sm:text-sm outline-hidden font-medium text-slate-900 bg-transparent"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 transition ml-2 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Registration Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${buttonGradient} text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60`}
                    >
                      {isLoading ? (
                        <span>Creating Account...</span>
                      ) : (
                        <span>
                          {signupRole === 'provider'
                            ? `Register Business Account in ${cityName} →`
                            : `Create Customer Account in ${cityName} →`}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Switch to Sign In */}
                  <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-red-600 transition cursor-pointer"
                    >
                      Already have an account?{' '}
                      <span className="text-red-600 underline">Sign In</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ------------------------------------------------------------- */}
              {/* MODE 3: FORGOT PASSWORD                                       */}
              {/* ------------------------------------------------------------- */}
              {authMode === 'forgot' && (
                <form onSubmit={handleForgotPasswordSubmit} noValidate className="space-y-4">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
                    Enter your registered email address below. We will send a secure link to reset your account password.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Registered Email Address *
                    </label>
                    <div className="flex items-center px-3 py-2.5 rounded-xl border border-slate-200 focus-within:border-red-500 bg-slate-50 focus-within:bg-white transition">
                      <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. name@example.com"
                        className="w-full text-xs sm:text-sm outline-hidden font-medium text-slate-900 bg-transparent"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${buttonGradient} text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60`}
                    >
                      {isLoading ? <span>Sending Link...</span> : <span>Send Recovery Link →</span>}
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-red-600 transition cursor-pointer"
                    >
                      Back to <span className="text-red-600 underline">Sign In</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Dynamic City Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          {isSuperAdminPortal ? 'KAARYAN Central Multi-City Governance Platform' : `${cityBrandName} Security • Multi-City Local Advertising Platform`}
        </div>
      </div>
    </div>
  );
};