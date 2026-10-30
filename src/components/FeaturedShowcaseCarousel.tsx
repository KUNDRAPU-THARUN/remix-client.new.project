import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';

interface ShowcaseItem {
  id: string;
  category: string;
  categoryId: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 'sc-1',
    category: 'Restaurants',
    categoryId: 'restaurants',
    title: 'Restaurants & Food',
    subtitle: 'Discover the best spicy Rayalaseema biryani, authentic thalis & sweet karam dosa in Chittoor.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Book Now →',
  },
  {
    id: 'sc-2',
    category: 'Beauty & Wellness',
    categoryId: 'beauty-spa',
    title: 'Beauty & Wellness',
    subtitle: 'Luxury bridal makeup studios, salons, herbal Ayurvedic massage & wellness centers.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Explore Now →',
  },
  {
    id: 'sc-3',
    category: 'Schools & Education',
    categoryId: 'education',
    title: 'Schools & Education',
    subtitle: 'Find the best CBSE matriculation schools, digital campuses & top NEET/EAPCET academies.',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'View Schools →',
  },
  {
    id: 'sc-4',
    category: 'Hospitals & Healthcare',
    categoryId: 'healthcare',
    title: 'Hospitals & Healthcare',
    subtitle: '24x7 trauma care, Arogyasri multi-speciality centers, pediatric clinics & diagnostic labs.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Find Hospitals →',
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

  // Auto-slide every 3.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SHOWCASE_ITEMS.length) % SHOWCASE_ITEMS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
  };

  return (
    <div 
      className="py-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Featured Categories in Chittoor
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Top local destinations with verified phone contacts & customer ratings
          </p>
        </div>

        {/* Navigation Arrow Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition cursor-pointer"
            title="Previous showcase"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition cursor-pointer"
            title="Next showcase"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Responsive Carousel Track */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200/80">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {SHOWCASE_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectCategory(item.categoryId)}
              className="min-w-full h-72 sm:h-96 relative flex items-end p-6 sm:p-10 cursor-pointer group select-none"
            >
              {/* Background Image with Dark Gradient Overlay */}
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

              {/* Content Placement */}
              <div className="relative z-10 max-w-xl text-white">
                <span className="inline-block bg-red-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full mb-2.5 shadow-md">
                  {item.category}
                </span>

                <h3 className="text-2xl sm:text-4xl font-black font-heading text-white tracking-tight leading-tight">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed font-normal">
                  {item.subtitle}
                </p>

                {/* White Pill Button */}
                <div className="mt-5">
                  <span className="inline-flex items-center gap-2 bg-white text-slate-900 group-hover:bg-red-600 group-hover:text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-lg transition-all">
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
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer z-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer z-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Centered Pagination Dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {SHOWCASE_ITEMS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              currentIndex === idx
                ? 'w-7 bg-red-600'
                : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
            title={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
