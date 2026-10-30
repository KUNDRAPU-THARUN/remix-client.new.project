import React, { useState } from 'react';
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
  Building2,
  Tag
} from 'lucide-react';
import { UserAccount } from '../types';
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
}) => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Civic Helpline Strip */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              {t('chittoorDistrict')}
            </span>
            <span className="hidden sm:inline">{t('borderAreasNote')}</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onOpenEmergency}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-semibold transition cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t('emergencyHelplines')}</span>
            </button>
            <span className="text-slate-600 hidden md:inline">•</span>
            <button
              onClick={onOpenAI}
              className="hidden md:flex items-center gap-1 text-amber-300 hover:text-amber-200 font-medium cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('aiScout')}</span>
            </button>
            <span className="text-slate-600 hidden sm:inline">•</span>

            {/* Language Selector Dropdown Widget */}
            <LanguageSelector />
          </div>
        </div>
      </div>

      {/* Main Header Bar (NO duplicate search bar) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo with red-to-blue gradient pin marker + Subtext */}
        <div 
          onClick={() => { setActiveTab('home'); if (isSavedViewActive) onToggleSavedView(); }}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
            <MapPin className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-slate-900 font-heading">
                Chittoor<span className="text-red-600">Ads</span>
              </span>
              <span className="text-[10px] bg-red-50 text-red-700 font-bold px-1.5 py-0.5 rounded border border-red-200">
                AP-03
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 -mt-0.5 tracking-wider">
              {t('discoverTagline')}
            </p>
          </div>
        </div>

        {/* Center/Right Navigation Items */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-700">
          {/* Home with Red Active Underline Indicator */}
          <button
            onClick={() => handleNavClick('home')}
            className={`px-3 py-2 rounded-lg relative transition cursor-pointer ${
              activeTab === 'home' && !isSavedViewActive
                ? 'text-red-600 font-bold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>{t('home')}</span>
            {activeTab === 'home' && !isSavedViewActive && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-red-600 rounded-full" />
            )}
          </button>

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
              className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1 transition cursor-pointer"
            >
              <span>{t('categories')}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {categoriesDropdownOpen && (
              <div 
                className="absolute top-12 left-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setCategoriesDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                  {t('categoriesModules')}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {CHITTOOR_CATEGORIES.slice(0, 8).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onSelectCategory(cat.id);
                        setCategoriesDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-red-50 hover:text-red-600 flex items-center justify-between transition cursor-pointer"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{cat.count}+</span>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      onSelectCategory('all');
                      setCategoriesDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border-t border-slate-100 transition cursor-pointer"
                  >
                    {t('viewAllCategories')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Businesses */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-2 rounded-lg relative transition cursor-pointer ${
              activeTab === 'category'
                ? 'text-red-600 font-bold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>{t('businesses')}</span>
          </button>

          {/* Classifieds */}
          <button
            onClick={() => handleNavClick('classifieds')}
            className={`px-3 py-2 rounded-lg relative transition cursor-pointer ${
              activeTab === 'classifieds' && !isSavedViewActive
                ? 'text-red-600 font-bold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>{t('classifieds')}</span>
          </button>

          {/* Kanipakam Pilgrimage */}
          <button
            onClick={() => handleNavClick('kanipakam')}
            className={`px-3 py-2 rounded-lg relative transition cursor-pointer ${
              activeTab === 'kanipakam' && !isSavedViewActive
                ? 'text-red-600 font-bold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>{t('kanipakamTemple')}</span>
          </button>

          {/* Dashboard (if user logged in) */}
          {currentUser && (
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`px-3 py-2 rounded-lg relative transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'text-red-600 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{t('myAds')}</span>
            </button>
          )}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Saved Bookmarks */}
          <button
            onClick={onToggleSavedView}
            className={`relative p-2 rounded-xl border transition cursor-pointer ${
              isSavedViewActive
                ? 'bg-red-50 text-red-600 border-red-300'
                : 'text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Saved Businesses"
          >
            <Bookmark className={`w-4 h-4 ${isSavedViewActive ? 'fill-red-600' : ''}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>

          {/* Login / Register or Profile Dropdown */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-slate-800 max-w-[90px] truncate hidden sm:inline">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div 
                  className="absolute right-0 top-11 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleNavClick('dashboard');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 font-semibold text-slate-700 cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    <span>My Ads Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-semibold cursor-pointer border-t border-slate-100"
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
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">{t('loginRegister')}</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}

          {/* Bold Red CTA Button: + Post an Ad */}
          <button
            onClick={onOpenPostAd}
            className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-full shadow-sm shadow-red-500/30 transition hover:shadow-md cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('postAnAd')}</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 text-sm font-medium">
          <button
            onClick={() => handleNavClick('home')}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-800 hover:bg-slate-100 font-bold"
          >
            Home
          </button>
          <button
            onClick={() => {
              onSelectCategory('all');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-800 hover:bg-slate-100"
          >
            All Businesses & Categories
          </button>
          <button
            onClick={() => handleNavClick('classifieds')}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-800 hover:bg-slate-100"
          >
            Classifieds & Free Ads
          </button>
          <button
            onClick={() => handleNavClick('kanipakam')}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-800 hover:bg-slate-100"
          >
            Kanipakam Pilgrimage & Cabs
          </button>
          {currentUser && (
            <button
              onClick={() => handleNavClick('dashboard')}
              className="w-full text-left px-3 py-2 rounded-lg text-blue-600 hover:bg-blue-50 font-bold"
            >
              My Ads Dashboard
            </button>
          )}
          <button
            onClick={() => { onOpenEmergency(); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 flex items-center justify-between"
          >
            <span>Emergency 24x7 Helplines</span>
            <PhoneCall className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
