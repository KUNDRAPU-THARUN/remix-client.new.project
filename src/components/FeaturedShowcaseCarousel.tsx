import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Pause, Play } from 'lucide-react';

interface ShowcaseItem {
  id: string;
  category: string;
  categoryId: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 'sc-1',
    category: 'Restaurants & Dining',
    categoryId: 'restaurants',
    badge: 'Food & Dining',
    badgeColor: 'bg-[#E51E31]',
    title: 'Authentic Rayalaseema Food & Biryani',
    subtitle: 'Discover famous Chittoor ghee karam dosa, spicy mutton dum biryani, Andhra thalis & family restaurants.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Explore Restaurants →',
  },
  {
    id: 'sc-2',
    category: 'Hospitals & Healthcare',
    categoryId: 'healthcare',
    badge: '24x7 Medical',
    badgeColor: 'bg-[#176AC4]',
    title: 'Top Hospitals & Emergency Care',
    subtitle: 'Multispeciality trauma centers, Arogyasri empanelled hospitals, pediatric clinics & 24-hour diagnostic labs.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Find Hospitals →',
  },
  {
    id: 'sc-3',
    category: 'Schools & Education',
    categoryId: 'education',
    badge: 'CBSE & Coaching',
    badgeColor: 'bg-[#15995F]',
    title: 'Premier Schools & Coaching Academies',
    subtitle: 'Find top CBSE digital campuses, intermediate colleges, and premier NEET/EAPCET competitive entrance coaching.',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'View Schools →',
  },
  {
    id: 'sc-4',
    category: 'Real Estate & Properties',
    categoryId: 'real-estate',
    badge: 'Plots & Homes',
    badgeColor: 'bg-[#F5C325] text-slate-950',
    title: 'DTCP Plots, Rental Homes & Commercial Spaces',
    subtitle: 'Verified residential plots, rental 2BHK/3BHK flats, independent houses, and prime highway commercial shops.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Explore Properties →',
  },
  {
    id: 'sc-5',
    category: 'Silk Sarees & Handlooms',
    categoryId: 'silks-textiles',
    badge: 'Traditional Wear',
    badgeColor: 'bg-rose-600',
    title: 'Pure Kuppadam & Kanchi Border Silks',
    subtitle: 'Handpicked bridal silk sarees, authentic handloom weavers, pattu showrooms, and custom tailoring boutiques.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Shop Silk Sarees →',
  },
  {
    id: 'sc-6',
    category: 'Jobs & Careers',
    categoryId: 'jobs',
    badge: 'Local Hiring',
    badgeColor: 'bg-indigo-600',
    title: 'Local Careers & Immediate Openings',
    subtitle: 'Verified job openings across local retail, hospital nursing, accounting, sales, and manufacturing units.',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Browse Local Jobs →',
  },
];

interface FeaturedShowcaseCarouselProps {
  onSelectCategory: (categoryId: string) => void;
}

export const FeaturedShowcaseCarousel: React.FC<FeaturedShowcaseCarouselProps> = ({
  onSelectCategory,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide every 4 seconds with clean pause
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SHOWCASE_ITEMS.length) % SHOWCASE_ITEMS.length);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
  }, []);

  return (
    <section 
      className="py-8"
      aria-label="Featured Categories Showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black text-[#E51E31] bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase tracking-wider">
              Essential Services
            </span>
            <span className="text-xs text-slate-400 font-medium">Chittoor District Highlights</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Featured Categories in Chittoor
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Top local destinations with verified phone contacts & customer ratings
          </p>
        </div>

        {/* Carousel Arrow Controls & Pause/Play */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition cursor-pointer"
            title={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
            aria-label={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition cursor-pointer"
            title="Previous showcase item"
            aria-label="Previous showcase item"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition cursor-pointer"
            title="Next showcase item"
            aria-label="Next showcase item"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Responsive Carousel Frame */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200/90 bg-slate-950">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {SHOWCASE_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectCategory(item.categoryId)}
              className="min-w-full h-80 sm:h-96 relative flex items-end p-6 sm:p-10 cursor-pointer group select-none"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCategory(item.categoryId);
                }
              }}
            >
              {/* High-res background image */}
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              {/* Multi-step gradient for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

              {/* Foreground Card Content */}
              <div className="relative z-10 max-w-xl text-white">
                <span className={`inline-block ${item.badgeColor} text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full mb-3 shadow-md`}>
                  {item.badge}
                </span>

                <h3 className="text-2xl sm:text-4xl font-black font-heading text-white tracking-tight leading-tight">
                  {item.title}
                </h3>

                <p className="mt-2.5 text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed font-medium">
                  {item.subtitle}
                </p>

                {/* Pill Action Button */}
                <div className="mt-5">
                  <span className="inline-flex items-center gap-2 bg-white text-slate-950 group-hover:bg-[#E51E31] group-hover:text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-xl transition-all duration-200">
                    <span>{item.buttonText}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Side Floating Nav Controls */}
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer z-20 border border-white/20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer z-20 border border-white/20"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Centered Pagination Indicators */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {SHOWCASE_ITEMS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              currentIndex === idx
                ? 'w-8 bg-[#E51E31]'
                : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
            title={`Go to showcase slide ${idx + 1}`}
            aria-label={`Go to showcase slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
