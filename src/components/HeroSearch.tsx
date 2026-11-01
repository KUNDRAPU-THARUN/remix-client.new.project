import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Tag, 
  Play,
  Pause,
  ArrowRight
} from 'lucide-react';
import { CityConfig } from '../types';
import { CHITTOOR_CATEGORIES } from '../data/mockData';
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
  currentCity: CityConfig;
}

const POPULAR_SEARCH_TAGS = [
  { label: 'Restaurants', catId: 'restaurants' },
  { label: 'Hotels & Lodges', catId: 'hotels-lodges' },
  { label: 'Hospitals', catId: 'healthcare' },
  { label: 'Schools', catId: 'education' },
  { label: 'Silk Sarees', catId: 'silks-textiles' },
  { label: 'Real Estate', catId: 'real-estate' },
  { label: 'PG / Hostels', catId: 'pg-hostels' },
  { label: 'Jobs', catId: 'jobs' },
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
  currentCity,
}) => {
  const { t } = useTranslation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const banners = currentCity.heroBanners;

  // Reset active slide when city changes
  useEffect(() => {
    setActiveSlide(0);
  }, [currentCity.id]);

  // Smooth rotation with pause control (4.5s interval)
  useEffect(() => {
    if (!isPlaying || banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying, banners.length]);

  const handlePrevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const handleNextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  const currentBanner = banners[activeSlide] || banners[0];

  return (
    <section 
      className="relative text-white pt-10 pb-16 px-4 sm:px-6 overflow-hidden min-h-[480px] sm:min-h-[540px] flex items-center justify-center"
      aria-label={`${currentCity.name} Hero & Search`}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Background Ad Carousel Slider */}
      <div className="absolute inset-0 z-0">
        {banners.map((banner, idx) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              activeSlide === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover object-center"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}

        {/* High contrast dark gradient overlay ensuring 100% legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/70 backdrop-blur-[1px]" />
      </div>

      {/* Manual Slide Navigation Arrows on Hover */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-md hidden sm:flex border border-white/20 hover:scale-105"
            title="Previous spotlight banner"
            aria-label="Previous spotlight banner"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-md hidden sm:flex border border-white/20 hover:scale-105"
            title="Next spotlight banner"
            aria-label="Next spotlight banner"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Slide Active Promo Ticker Pill (Top Center) */}
      {currentBanner && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 hidden md:inline-flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold text-amber-300 border border-white/15 shadow-md">
          <span>{currentBanner.tag}</span>
        </div>
      )}

      {/* Static Foreground Content Layer */}
      <div className="max-w-5xl mx-auto relative z-10 text-center flex flex-col items-center w-full">
        {/* Top Civic Badge */}
        <div className="inline-flex items-center gap-2 bg-slate-900/85 border border-white/20 rounded-full px-4 py-1.5 mb-5 backdrop-blur-md shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-[#15995F] animate-pulse shrink-0" />
          <span className="text-xs font-extrabold text-white tracking-wide">
            {currentCity.name}'s No.1 Local Search Platform
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-xs text-[#F5C325] font-bold">{currentCity.code} Directory</span>
        </div>

        {/* Main Heading: "Your City. Everything You Need." */}
        <h1 className="text-center w-full text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-heading text-white max-w-4xl mx-auto leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
          {currentCity.id === 'chittoor' ? (
            t('heroHeadlineMain') || (
              <>
                Your City.{' '}
                <span className="bg-gradient-to-r from-red-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">
                  Everything You Need.
                </span>
              </>
            )
          ) : (
            <>
              Find Everything in{' '}
              <span className="bg-gradient-to-r from-red-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">
                {currentCity.name}
              </span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-center mx-auto max-w-2xl mt-3 text-sm sm:text-base text-slate-100 leading-relaxed font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
          {currentCity.id === 'chittoor'
            ? t('heroSupportingMessage') || t('heroSubtitle')
            : `Discover verified local businesses, services, and opportunities across ${currentCity.name} (${currentCity.code}).`}
        </p>

        {/* Primary Unified Central Search Bar Container */}
        <form
          onSubmit={handleFormSubmit}
          className="mt-7 bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-full shadow-2xl border border-white/40 w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-2 text-slate-800"
          role="search"
        >
          {/* Left Segment: City Localities Selector */}
          <div className="w-full md:w-60 flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 md:bg-transparent rounded-xl md:rounded-l-full border md:border-0 border-slate-200 text-slate-800">
            <MapPin className="w-4 h-4 text-[#E51E31] shrink-0" />
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              aria-label={`Select ${currentCity.name} locality`}
              className="w-full py-1 text-xs sm:text-sm font-semibold outline-hidden bg-transparent text-slate-700 cursor-pointer"
            >
              <option value="all">📍 All Locations ({currentCity.name})</option>
              {currentCity.localities.filter((a) => a.id !== 'all').map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200" />

          {/* Middle Segment: Category Selector */}
          <div className="w-full md:w-60 flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 md:bg-transparent rounded-xl border md:border-0 border-slate-200 text-slate-800">
            <Tag className="w-4 h-4 text-[#176AC4] shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Select business category"
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

          {/* Right Segment: Keyword Service Search Input */}
          <div className="w-full flex-1 flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 md:bg-transparent rounded-xl border md:border-0 border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search businesses in ${currentCity.name}...`}
              aria-label="Search keywords"
              className="w-full py-1 text-xs sm:text-sm outline-hidden font-medium placeholder:text-slate-400 text-slate-900 bg-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-sm text-slate-400 hover:text-slate-700 font-bold px-1.5 cursor-pointer"
                title="Clear query"
              >
                ×
              </button>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            className="w-full md:w-auto px-7 py-3 rounded-xl md:rounded-full bg-gradient-to-r from-[#E51E31] to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm transition shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            <span>{t('searchButton')}</span>
          </button>
        </form>

        {/* Popular Searches Quick Tags */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-200">
          <span className="font-extrabold mr-1 text-slate-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            Popular in {currentCity.name}:
          </span>
          {POPULAR_SEARCH_TAGS.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => onQuickTagClick(tag.label, tag.catId)}
              className="bg-black/45 hover:bg-[#E51E31] hover:text-white text-slate-200 px-3 py-1 rounded-full border border-white/25 backdrop-blur-xs transition font-semibold cursor-pointer text-xs"
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Controls: Indicators + Pause/Play toggle */}
        {banners.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="flex items-center gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeSlide === i ? 'w-7 bg-[#E51E31]' : 'w-2 bg-white/40 hover:bg-white'
                  }`}
                  title={`Spotlight Slide ${i + 1}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 rounded-full bg-black/40 hover:bg-black/60 text-white text-xs backdrop-blur-xs transition cursor-pointer border border-white/20"
              title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
