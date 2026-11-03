import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Pause, Play } from 'lucide-react';
import { CityConfig } from '../types';

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

const CHITTOOR_SHOWCASE: ShowcaseItem[] = [
  {
    id: 'sc-ch-1',
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
    id: 'sc-ch-2',
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
    id: 'sc-ch-3',
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
    id: 'sc-ch-4',
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
    id: 'sc-ch-5',
    category: 'Silk Sarees & Handlooms',
    categoryId: 'silks-textiles',
    badge: 'Traditional Wear',
    badgeColor: 'bg-rose-600 text-white',
    title: 'Pure Kuppadam & Kanchi Border Silks',
    subtitle: 'Handpicked bridal silk sarees, authentic handloom weavers, pattu showrooms, and custom tailoring boutiques.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Shop Silk Sarees →',
  },
  {
    id: 'sc-ch-6',
    category: 'Mango & Agro Mandis',
    categoryId: 'mango-agro',
    badge: 'Agro & Pulp',
    badgeColor: 'bg-amber-600 text-white',
    title: 'Totapuri Mango Pulp & Fruit Mandis',
    subtitle: 'Direct producers of Totapuri aseptic pulp, Banganapalli wholesale fruit, and agro-processing clusters.',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Explore Agro Mandis →',
  },
];

const VELLORE_SHOWCASE: ShowcaseItem[] = [
  {
    id: 'sc-vel-1',
    category: 'Hospitals & Healthcare',
    categoryId: 'healthcare',
    badge: 'CMC Medical Network',
    badgeColor: 'bg-[#176AC4]',
    title: 'CMC & Multispeciality Healthcare Network',
    subtitle: 'World-renowned medical specialists, diagnostic imaging, and 24x7 emergency trauma care on Ida Scudder Road.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Find CMC Specialists →',
  },
  {
    id: 'sc-vel-2',
    category: 'Student PGs & Accommodations',
    categoryId: 'pg-hostels',
    badge: 'VIT Student Boarding',
    badgeColor: 'bg-[#15995F]',
    title: 'Katpadi Student Accommodations & PGs',
    subtitle: 'Verified student hostels, AC rooms with high-speed Wi-Fi, and mess meals near VIT University Katpadi.',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Explore Student PGs →',
  },
  {
    id: 'sc-vel-3',
    category: 'Restaurants & Dining',
    categoryId: 'restaurants',
    badge: 'Ambur Biryani Icon',
    badgeColor: 'bg-[#E51E31]',
    title: 'Authentic Vellore & Ambur Star Dum Biryani',
    subtitle: 'Legendary Seeraga Samba mutton and chicken dum biryani, kathirikai brinjal curry, and authentic Fort city messes.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Explore Vellore Food →',
  },
  {
    id: 'sc-vel-4',
    category: 'Hotels & Pilgrim Stays',
    categoryId: 'hotels-lodges',
    badge: 'Sripuram & Transit',
    badgeColor: 'bg-indigo-600 text-white',
    title: 'Sripuram Golden Temple Pilgrim Lodges',
    subtitle: 'Deluxe AC family accommodation, medical transit stays near CMC, and Katpadi railway junction hotels.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Book Pilgrim Stays →',
  },
  {
    id: 'sc-vel-5',
    category: 'Leather & Manufacturing',
    categoryId: 'leather-industry',
    badge: 'Export Manufacturing',
    badgeColor: 'bg-[#F5C325] text-slate-950',
    title: 'Ranipet & Vellore Leather Industries',
    subtitle: 'Premier leather tanning, export footwear manufacturers, safety accessories, and industrial goods corridor.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'View Leather Directory →',
  },
  {
    id: 'sc-vel-6',
    category: 'Real Estate & House Rentals',
    categoryId: 'real-estate',
    badge: 'Katpadi & Sathuvachari',
    badgeColor: 'bg-teal-600 text-white',
    title: 'Vellore Properties & Rental Flats',
    subtitle: 'Rental 2BHK/3BHK houses in Katpadi and Sathuvachari, commercial offices, and approved plots near NH-48.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Explore Vellore Real Estate →',
  },
];

const BENGALURU_SHOWCASE: ShowcaseItem[] = [
  {
    id: 'sc-blr-1',
    category: 'Coworking & Enterprise Spaces',
    categoryId: 'real-estate',
    badge: 'Flexible Workspaces',
    badgeColor: 'bg-[#176AC4]',
    title: 'Silicon City Coworking & Enterprise Suites',
    subtitle: 'Flexible hot desks, private team cabins, conference rooms, and startup hubs across Indiranagar & HSR Layout.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Find Coworking Desks →',
  },
  {
    id: 'sc-blr-2',
    category: 'PGs & Co-Living Spaces',
    categoryId: 'pg-hostels',
    badge: 'Managed Living',
    badgeColor: 'bg-[#15995F]',
    title: 'Premium Co-Living PGs & Tech Rentals',
    subtitle: 'High-speed fiber Wi-Fi, ergonomic work desks, gym, and nutritious meals in Koramangala & Whitefield.',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Explore Bengaluru PGs →',
  },
  {
    id: 'sc-blr-3',
    category: 'Dining, Cafes & Breweries',
    categoryId: 'restaurants',
    badge: 'South Dining & Cafes',
    badgeColor: 'bg-[#E51E31]',
    title: 'Iconic Filter Coffee & Global Dining',
    subtitle: 'Crispy butter benne dosas, authentic degree filter coffee, artisan cafes, and rooftop craft breweries.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Discover Cafes & Pubs →',
  },
  {
    id: 'sc-blr-4',
    category: 'Hospitals & Super-Speciality',
    categoryId: 'healthcare',
    badge: 'Robotic & Super Speciality',
    badgeColor: 'bg-blue-600 text-white',
    title: 'Super-Speciality Healthcare Network',
    subtitle: 'Tertiary care medical institutions, robotic surgery, advanced diagnostic centers, and 24x7 emergency response.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Find Top Hospitals →',
  },
];

interface FeaturedShowcaseCarouselProps {
  onSelectCategory: (categoryId: string) => void;
  currentCity?: CityConfig;
}

export const FeaturedShowcaseCarousel: React.FC<FeaturedShowcaseCarouselProps> = ({
  onSelectCategory,
  currentCity,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const cityId = currentCity?.id || 'chittoor';
  const cityName = currentCity?.name || 'Chittoor';

  const items = useMemo(() => {
    switch (cityId) {
      case 'vellore':
        return VELLORE_SHOWCASE;
      case 'bengaluru':
        return BENGALURU_SHOWCASE;
      case 'chittoor':
      default:
        return CHITTOOR_SHOWCASE;
    }
  }, [cityId]);

  // Auto-slide every 4 seconds with clean pause
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  // Reset index when city changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [cityId]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const activeItem = items[currentIndex] || items[0];

  return (
    <section 
      className="py-8"
      aria-label={`Featured Categories Showcase for ${cityName}`}
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
            <span className="text-xs text-slate-400 font-medium">{cityName} District Highlights</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Featured Categories in {cityName}
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
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
            aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handlePrev}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
            aria-label="Previous showcase category"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
            aria-label="Next showcase category"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Showcase Slide Card */}
      <div
        onClick={() => onSelectCategory(activeItem.categoryId)}
        className="group relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/90 cursor-pointer h-72 sm:h-84 md:h-96 select-none transition-all duration-300 hover:shadow-2xl"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectCategory(activeItem.categoryId);
          }
        }}
      >
        <img
          src={activeItem.image}
          alt={activeItem.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent" />

        <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end text-white max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs ${activeItem.badgeColor}`}>
              {activeItem.badge}
            </span>
            <span className="text-xs text-slate-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeItem.category}</span>
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading leading-tight group-hover:text-red-300 transition-colors">
            {activeItem.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 mt-2 font-medium max-w-2xl leading-relaxed">
            {activeItem.subtitle}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-white text-slate-950 font-black text-xs hover:bg-[#E51E31] hover:text-white transition-all duration-200 flex items-center gap-1.5 shadow-lg"
            >
              <span>{activeItem.buttonText}</span>
            </button>
            <span className="text-xs text-slate-300 font-semibold">
              Explore {activeItem.category} in {cityName}
            </span>
          </div>
        </div>

        {/* Carousel Slide Indicators */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          {items.map((it, idx) => (
            <button
              key={it.id}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all ${
                currentIndex === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
