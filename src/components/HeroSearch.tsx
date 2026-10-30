import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Tag, 
  ShieldCheck, 
  CheckCircle2, 
  Building2 
} from 'lucide-react';
import { CHITTOOR_AREAS, CHITTOOR_CATEGORIES } from '../data/mockData';
import { useTranslation } from '../i18n/LanguageContext';

interface HeroSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedArea: string;
  setSelectedArea: (area: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onSearchSubmit: () => void;
  onQuickTagClick: (tag: string, catId?: string) => void;
  onOpenAI: () => void;
}

// Bright, colorful local Chittoor promotional banners
const HERO_AD_BANNERS = [
  {
    id: 'ad-banner-1',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1600&q=80',
    title: 'Royal Rayalaseema Ruchulu',
    tag: '⚡ 20% OFF on Sunday Dum Biryani Orders • Gandhi Road',
  },
  {
    id: 'ad-banner-2',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
    title: 'Grand Chittoor Residency & Lodging',
    tag: '⚡ Special Pilgrim AC Rooms for Kanipakam Visitors',
  },
  {
    id: 'ad-banner-3',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80',
    title: 'Glow & Glamour Bridal Salon',
    tag: '⚡ South Indian HD Bridal Makeup Booking Open • Church Street',
  },
  {
    id: 'ad-banner-4',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
    title: 'Green Valley International School',
    tag: '⚡ Admissions Open 2026-27 • CBSE Digital Campus • Kattamanchi',
  },
  {
    id: 'ad-banner-5',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80',
    title: 'Sri Balaji Multi-Speciality Hospital',
    tag: '⚡ 24x7 Emergency Trauma Care & Arogyasri Empanelled',
  },
];

const POPULAR_SEARCH_TAGS = [
  { label: 'Restaurants', catId: 'restaurants' },
  { label: 'Hotels', catId: 'hotels-lodges' },
  { label: 'Schools', catId: 'education' },
  { label: 'Hospitals', catId: 'healthcare' },
  { label: 'Jobs', catId: 'jobs' },
  { label: 'Real Estate', catId: 'real-estate' },
  { label: 'PG/Hostels', catId: 'pg-hostels' },
  { label: 'Car Services', catId: 'automobiles' },
  { label: 'Beauty Spa', catId: 'beauty-spa' },
  { label: 'Mango Mandis', catId: 'mango-agro' },
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  searchQuery,
  setSearchQuery,
  selectedArea,
  setSelectedArea,
  selectedCategory,
  setSelectedCategory,
  onSearchSubmit,
  onQuickTagClick,
  onOpenAI,
}) => {
  const { t } = useTranslation();
  const [activeSlide, setActiveSlide] = useState(0);

  // Fast auto-rotation (1.8s per slide with continuous smooth play)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_AD_BANNERS.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + HERO_AD_BANNERS.length) % HERO_AD_BANNERS.length);
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % HERO_AD_BANNERS.length);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <div className="relative text-white pt-10 pb-16 px-4 sm:px-6 overflow-hidden min-h-[460px] sm:min-h-[500px] flex items-center justify-center">
      {/* Background Ad Carousel Slider */}
      <div className="absolute inset-0 z-0">
        {HERO_AD_BANNERS.map((banner, idx) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              activeSlide === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Soft, Light Overlay for High Image Visibility and Vibrant Ad Banners */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/35 to-slate-950/40 backdrop-blur-[0.5px]" />
      </div>

      {/* Manual Slide Navigation Arrows on Hover */}
      <button
        onClick={handlePrevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs hidden sm:flex"
        title="Previous Ad"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={handleNextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs hidden sm:flex"
        title="Next Ad"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Active Promo Ticker Pill (Top Center) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 hidden md:inline-flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-amber-300 border border-white/10 shadow-xs">
        <span>{HERO_AD_BANNERS[activeSlide].tag}</span>
      </div>

      {/* Static Foreground Content Layer */}
      <div className="max-w-5xl mx-auto relative z-10 text-center flex flex-col items-center w-full">
        {/* Top Badge */}
        <div className="mx-auto text-center inline-flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 rounded-full px-4 py-1.5 mb-4 backdrop-blur-md shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-xs font-bold text-white tracking-wide">
            {t('topHeroBadge')}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-xs text-amber-300 font-semibold">{t('localInformationBadge')}</span>
        </div>

        {/* Main Heading with text shadow */}
        <h1 className="text-center w-full text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-heading text-white max-w-4xl mx-auto leading-tight sm:leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {t('heroHeadingMain')}{' '}
          <span className="bg-gradient-to-r from-red-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">
            {t('heroHeadingHighlight')}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-center mx-auto max-w-2xl mt-3 text-sm sm:text-base text-slate-100 leading-relaxed font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
          {t('heroSubtitle')}
        </p>

        {/* Primary Unified Central Search Bar Container */}
        <form
          onSubmit={handleFormSubmit}
          className="mt-6 bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-full shadow-2xl border border-white/30 w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-2 text-slate-800"
        >
          {/* Left Segment: Location / Area Selector */}
          <div className="w-full md:w-56 flex items-center gap-2 px-3 py-2 bg-slate-50 md:bg-transparent rounded-xl md:rounded-l-full border md:border-0 border-slate-200 text-slate-800">
            <MapPin className="w-4 h-4 text-red-500 shrink-0" />
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full py-1 text-xs sm:text-sm font-semibold outline-hidden bg-transparent text-slate-700 cursor-pointer"
            >
              <option value="all">{t('allAreas')}</option>
              {CHITTOOR_AREAS.filter((a) => a.id !== 'all').map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200" />

          {/* Middle Segment: Category Selector */}
          <div className="w-full md:w-60 flex items-center gap-2 px-3 py-2 bg-slate-50 md:bg-transparent rounded-xl border md:border-0 border-slate-200 text-slate-800">
            <Tag className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-1 text-xs sm:text-sm font-semibold outline-hidden bg-transparent text-slate-700 cursor-pointer"
            >
              <option value="all">{t('allCategories')}</option>
              {CHITTOOR_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200" />

          {/* Right Segment: Service Search Field */}
          <div className="w-full flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 md:bg-transparent rounded-xl border md:border-0 border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full py-1 text-xs sm:text-sm outline-hidden font-medium placeholder:text-slate-400 text-slate-900 bg-transparent"
            >
            </input>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
              >
                ×
              </button>
            )}
          </div>

          {/* Action Button: Red Search CTA */}
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 rounded-xl md:rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-sm transition shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            <span>{t('searchButton')}</span>
          </button>
        </form>

        {/* Popular Searches Quick Tags (Centered beneath search bar) */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-200">
          <span className="font-bold mr-1 text-slate-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {t('popularSearches')}
          </span>
          {POPULAR_SEARCH_TAGS.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => onQuickTagClick(tag.label, tag.catId)}
              className="bg-black/40 hover:bg-red-600 hover:text-white text-slate-200 px-3 py-1 rounded-full border border-white/20 backdrop-blur-xs transition font-semibold cursor-pointer text-xs"
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Carousel Slide Indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {HERO_AD_BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeSlide === i ? 'w-6 bg-red-500' : 'w-1.5 bg-white/50 hover:bg-white'
              }`}
              title={`Ad Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
