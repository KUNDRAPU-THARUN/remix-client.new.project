import React, { useState, useRef, useEffect } from 'react';
import { 
  PlusCircle, 
  Bookmark, 
  PhoneCall, 
  Sparkles, 
  Menu, 
  X, 
  MapPin, 
  User, 
  ChevronDown, 
  LogOut,
  LayoutDashboard,
  Grid,
  Check
} from 'lucide-react';
import { UserAccount, CityConfig, CityId } from '../types';
import { CHITTOOR_CATEGORIES } from '../data/mockData';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from '../i18n/LanguageContext';

interface NavbarProps {
  onOpenPostAd: () => void;
  onOpenAI: () => void;
  onOpenEmergency: () => void;
  onOpenLogin: () => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
  savedCount: number;
  onToggleSavedView: () => void;
  isSavedViewActive: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectCategory: (catId: string) => void;
  currentCity: CityConfig;
  allCities: CityConfig[];
  onCityChange: (cityId: CityId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPostAd,
  onOpenAI,
  onOpenEmergency,
  onOpenLogin,
  currentUser,
  onLogout,
  savedCount,
  onToggleSavedView,
  isSavedViewActive,
  activeTab,
  setActiveTab,
  onSelectCategory,
  currentCity,
  allCities,
  onCityChange,
}) => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [citySwitcherOpen, setCitySwitcherOpen] = useState(false);
  const citySwitcherRef = useRef<HTMLDivElement>(null);

  // Close city dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (citySwitcherRef.current && !citySwitcherRef.current.contains(e.target as Node)) {
        setCitySwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
  };

  const handleSelectCity = (cityId: CityId) => {
    onCityChange(cityId);
    setCitySwitcherOpen(false);
    setMobileMenuOpen(false);
  };

  // Dynamic gradient per city
  const logoGradient = 
    currentCity.id === 'vellore'
      ? 'from-[#176AC4] via-[#15995F] to-[#E51E31]'
      : currentCity.id === 'bengaluru'
      ? 'from-[#15995F] via-[#F5C325] to-[#176AC4]'
      : 'from-[#E51E31] via-[#c91829] to-[#176AC4]';

  const brandAccentColor =
    currentCity.id === 'vellore'
      ? 'text-[#176AC4]'
      : currentCity.id === 'bengaluru'
      ? 'text-[#15995F]'
      : 'text-[#E51E31]';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      {/* Top Civic Helpline & Location Strip */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-[#E51E31] text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider shadow-xs">
              {currentCity.name} {currentCity.code}
            </span>
            <span className="hidden sm:inline text-slate-400 font-medium">
              {currentCity.state} • {currentCity.tagline}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onOpenEmergency}
              className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-semibold transition cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse text-[#E51E31]" />
              <span>{t('emergencyHelplines')}</span>
            </button>
            <span className="text-slate-700 hidden md:inline">•</span>
            <button
              onClick={onOpenAI}
              className="hidden md:flex items-center gap-1 text-[#F5C325] hover:text-amber-200 font-semibold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('aiScout')}</span>
            </button>
            <span className="text-slate-700 hidden sm:inline">•</span>

            {/* Language Selector Dropdown Widget */}
            <LanguageSelector />
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Brand Logo & Premium City Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none shrink-0"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') handleNavClick('home'); }}
            aria-label={`${currentCity.brandName} Home`}
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr ${logoGradient} flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform duration-200`}>
              <MapPin className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-heading">
                  {currentCity.name}<span className={brandAccentColor}>Ads</span>
                </span>
                <span className="text-[10px] bg-red-50 text-[#E51E31] font-extrabold px-1.5 py-0.5 rounded border border-red-200">
                  {currentCity.code}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 -mt-0.5 tracking-wider truncate max-w-[140px] sm:max-w-none">
                {currentCity.tagline}
              </p>
            </div>
          </div>

          {/* Premium Desktop City Switcher Dropdown */}
          <div className="relative" ref={citySwitcherRef}>
            <button
              onClick={() => setCitySwitcherOpen(!citySwitcherOpen)}
              className="flex items-center gap-1.5 text-xs font-extrabold px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition cursor-pointer select-none"
              aria-label="Select City"
              aria-expanded={citySwitcherOpen}
              aria-haspopup="listbox"
            >
              <span className="w-2 h-2 rounded-full bg-[#15995F] shrink-0" />
              <span className="hidden sm:inline">{currentCity.name}</span>
              <span className="text-[10px] text-slate-500 font-semibold">{currentCity.code}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {citySwitcherOpen && (
              <div 
                className="absolute top-10 left-0 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                role="listbox"
                aria-label="Cities list"
              >
                <div className="px-3.5 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1 flex items-center justify-between">
                  <span>Select City Platform</span>
                  <span className="text-[#15995F] font-bold">Multi-City Network</span>
                </div>

                <div className="p-1 space-y-1">
                  {allCities.map((c) => {
                    const isSelected = c.id === currentCity.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSelectCity(c.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                          isSelected 
                            ? 'bg-red-50 text-[#E51E31] font-black' 
                            : 'hover:bg-slate-50 text-slate-800 font-bold'
                        }`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#E51E31]' : 'text-slate-400'}`} />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold">{c.name}</span>
                              <span className="text-[9px] text-slate-400 font-normal">({c.nameNative})</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium block">
                              {c.state} • {c.code}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-[#E51E31] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="px-3.5 py-2 border-t border-slate-100 text-[10px] text-slate-400">
                  Switching cities updates search, localities & ads.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-700">
          {/* Home */}
          <button
            onClick={() => handleNavClick('home')}
            className={`px-3 py-2 rounded-xl relative transition cursor-pointer ${
              activeTab === 'home' && !isSavedViewActive
                ? 'text-[#E51E31] font-bold bg-red-50/70'
                : 'hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <span>{t('home')}</span>
            {activeTab === 'home' && !isSavedViewActive && (
              <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-[#E51E31] rounded-full" />
            )}
          </button>

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
              className="px-3 py-2 rounded-xl hover:text-slate-900 hover:bg-slate-100/80 flex items-center gap-1 transition cursor-pointer"
            >
              <Grid className="w-4 h-4 text-slate-500" />
              <span>{t('categories')}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {categoriesDropdownOpen && (
              <div 
                className="absolute top-12 left-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setCategoriesDropdownOpen(false)}
              >
                <div className="px-3.5 py-1.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1 flex items-center justify-between">
                  <span>{t('categoriesModules')}</span>
                  <span className="text-[10px] text-[#15995F] font-bold">{currentCity.name} Directory</span>
                </div>
                <div className="max-h-84 overflow-y-auto px-1 space-y-0.5">
                  {CHITTOOR_CATEGORIES.slice(0, 10).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onSelectCategory(cat.id);
                        setCategoriesDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-red-50 hover:text-[#E51E31] flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-2">{cat.count}+ ads</span>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      onSelectCategory('all');
                      setCategoriesDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 text-xs font-bold text-[#E51E31] hover:bg-red-50 rounded-lg border-t border-slate-100 transition cursor-pointer flex items-center justify-between"
                  >
                    <span>{t('viewAllCategories')}</span>
                    <span className="text-[11px]">→</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Businesses */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-2 rounded-xl relative transition cursor-pointer ${
              activeTab === 'category' && !isSavedViewActive
                ? 'text-[#E51E31] font-bold bg-red-50/70'
                : 'hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <span>{t('businesses')}</span>
          </button>

          {/* Classifieds */}
          <button
            onClick={() => handleNavClick('classifieds')}
            className={`px-3 py-2 rounded-xl relative transition cursor-pointer ${
              activeTab === 'classifieds' && !isSavedViewActive
                ? 'text-[#E51E31] font-bold bg-red-50/70'
                : 'hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <span>{t('classifieds')}</span>
          </button>

          {/* Kanipakam Pilgrimage (Only if supported by city) */}
          {currentCity.features.hasKanipakamSpecial && (
            <button
              onClick={() => handleNavClick('kanipakam')}
              className={`px-3 py-2 rounded-xl relative transition cursor-pointer ${
                activeTab === 'kanipakam' && !isSavedViewActive
                  ? 'text-[#E51E31] font-bold bg-red-50/70'
                  : 'hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <span>{t('kanipakamTemple')}</span>
            </button>
          )}

          {/* Dashboard (if user logged in) */}
          {currentUser && (
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`px-3 py-2 rounded-xl relative transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'text-[#176AC4] font-bold bg-blue-50/70'
                  : 'hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <span>{t('myAds')}</span>
            </button>
          )}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Saved Bookmarks */}
          <button
            onClick={onToggleSavedView}
            className={`relative p-2 sm:p-2.5 rounded-xl border transition cursor-pointer ${
              isSavedViewActive
                ? 'bg-red-50 text-[#E51E31] border-red-300'
                : 'text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Saved Businesses"
            aria-label="View saved listings"
          >
            <Bookmark className={`w-4 h-4 ${isSavedViewActive ? 'fill-[#E51E31]' : ''}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E51E31] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {savedCount}
              </span>
            )}
          </button>

          {/* Login / Register or Profile Dropdown */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#176AC4] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-slate-800 max-w-[85px] truncate hidden sm:inline">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div 
                  className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in duration-150"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-3.5 py-2.5 border-b border-slate-100">
                    <p className="font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleNavClick('dashboard');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2 font-semibold text-slate-700 cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    <span>My Ads Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-semibold cursor-pointer border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">{t('loginRegister')}</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}

          {/* Premium Red Brand CTA Button: + Post Free Ad */}
          <button
            onClick={onOpenPostAd}
            className="flex items-center gap-1.5 bg-gradient-to-r from-[#E51E31] to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md shadow-red-500/25 hover:shadow-lg transition cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">{t('postFreeAd')}</span>
            <span className="xs:hidden">+ Ad</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-5 py-5 space-y-4 text-sm font-semibold shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200">
          
          {/* Mobile City Selector Header */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
              Select City Platform
            </span>
            <div className="grid grid-cols-3 gap-2">
              {allCities.map((c) => {
                const isSelected = c.id === currentCity.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCity(c.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold text-center border transition ${
                      isSelected
                        ? 'bg-[#E51E31] text-white border-[#E51E31] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>{c.name}</div>
                    <div className="text-[9px] opacity-80">{c.code}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition ${
                activeTab === 'home' && !isSavedViewActive ? 'bg-red-50 text-[#E51E31] font-bold' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                onSelectCategory('all');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-slate-800 hover:bg-slate-100"
            >
              All Businesses & Categories
            </button>
            <button
              onClick={() => handleNavClick('classifieds')}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition ${
                activeTab === 'classifieds' ? 'bg-red-50 text-[#E51E31] font-bold' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              Classifieds & Free Ads
            </button>
            {currentCity.features.hasKanipakamSpecial && (
              <button
                onClick={() => handleNavClick('kanipakam')}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition ${
                  activeTab === 'kanipakam' ? 'bg-red-50 text-[#E51E31] font-bold' : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                Kanipakam Pilgrimage & Cabs
              </button>
            )}

            {currentUser && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className="w-full text-left px-3 py-2.5 rounded-xl text-[#176AC4] hover:bg-blue-50 font-bold"
              >
                My Ads Dashboard
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => { onOpenEmergency(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2.5 rounded-xl bg-red-50 text-[#E51E31] flex items-center justify-between font-bold"
            >
              <span>Emergency 24x7 Helplines</span>
              <PhoneCall className="w-4 h-4" />
            </button>
            <button
              onClick={() => { onOpenAI(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2.5 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-between font-bold"
            >
              <span>AI Scout Assistant</span>
              <Sparkles className="w-4 h-4 text-[#F5C325]" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
