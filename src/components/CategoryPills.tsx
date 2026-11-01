import React from 'react';
import { 
  ArrowRight, 
  Sparkles,
  Hotel,
  UtensilsCrossed,
  Stethoscope,
  GraduationCap,
  Building2,
  Home,
  Briefcase,
  Dumbbell,
  PartyPopper,
  Banknote,
  Truck,
  Package,
  Car,
  Wrench,
  TreePine,
  Shirt,
  MapPin,
  HelpCircle
} from 'lucide-react';
import { CHITTOOR_CATEGORIES } from '../data/mockData';
import { useTranslation } from '../i18n/LanguageContext';

interface CategoryPillsProps {
  onSelectCategory: (category: string) => void;
}

// Icon mapper for consistent rendering
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Hotel': return Hotel;
    case 'UtensilsCrossed': return UtensilsCrossed;
    case 'Sparkles': return Sparkles;
    case 'Stethoscope': return Stethoscope;
    case 'GraduationCap': return GraduationCap;
    case 'Building2': return Building2;
    case 'Home': return Home;
    case 'Briefcase': return Briefcase;
    case 'Dumbbell': return Dumbbell;
    case 'PartyPopper': return PartyPopper;
    case 'Banknote': return Banknote;
    case 'Truck': return Truck;
    case 'Package': return Package;
    case 'Car': return Car;
    case 'Wrench': return Wrench;
    case 'TreePine': return TreePine;
    case 'Shirt': return Shirt;
    case 'MapPin': return MapPin;
    default: return Sparkles;
  }
};

// Coordinated brand accent styles for categories
const ACCENT_STYLES = [
  { border: 'hover:border-[#E51E31]', badge: 'bg-[#E51E31] text-white', iconColor: 'text-[#E51E31]' },
  { border: 'hover:border-[#176AC4]', badge: 'bg-[#176AC4] text-white', iconColor: 'text-[#176AC4]' },
  { border: 'hover:border-[#15995F]', badge: 'bg-[#15995F] text-white', iconColor: 'text-[#15995F]' },
  { border: 'hover:border-[#F5C325]', badge: 'bg-[#F5C325] text-slate-950', iconColor: 'text-amber-600' },
  { border: 'hover:border-rose-500', badge: 'bg-rose-500 text-white', iconColor: 'text-rose-600' },
  { border: 'hover:border-indigo-500', badge: 'bg-indigo-500 text-white', iconColor: 'text-indigo-600' },
  { border: 'hover:border-teal-500', badge: 'bg-teal-500 text-white', iconColor: 'text-teal-600' },
  { border: 'hover:border-orange-500', badge: 'bg-orange-500 text-white', iconColor: 'text-orange-600' },
];

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  onSelectCategory,
}) => {
  const { t } = useTranslation();

  return (
    <section className="py-8" aria-label="Explore Categories Grid">
      {/* Section Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black text-[#176AC4] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded uppercase tracking-wider">
              Local Sectors
            </span>
            <span className="text-xs text-slate-400 font-medium">Verified Andhra Directory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {t('exploreCategoriesTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            {t('exploreCategoriesSubtitle')}
          </p>
        </div>

        <button
          onClick={() => onSelectCategory('all')}
          className="self-start sm:self-center text-xs font-black text-[#E51E31] hover:text-white bg-red-50 hover:bg-[#E51E31] px-4 py-2.5 rounded-xl border border-red-200 transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-md shrink-0"
        >
          <span>{t('viewAllCategories')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modern Colorful Responsive Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {CHITTOOR_CATEGORIES.slice(0, 16).map((cat, idx) => {
          const IconComponent = getCategoryIcon(cat.icon);
          const accent = ACCENT_STYLES[idx % ACCENT_STYLES.length];

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group bg-white rounded-2xl border border-slate-200/90 ${accent.border} shadow-2xs hover:shadow-xl transition-all duration-300 p-2.5 flex flex-col justify-between cursor-pointer select-none overflow-hidden hover:-translate-y-1`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCategory(cat.id);
                }
              }}
            >
              {/* Visual Thumbnail Image with Icon Badge Overlay */}
              <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100 relative mb-2.5">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 group-hover:opacity-60 transition-opacity" />
                
                {/* Floating Icon Pill */}
                <div className="absolute top-1.5 right-1.5 w-7 h-7 rounded-lg bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-md">
                  <IconComponent className={`w-3.5 h-3.5 ${accent.iconColor}`} />
                </div>

                {/* Ad count pill */}
                <span className="absolute bottom-1.5 left-2 text-[10px] text-white font-extrabold px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs">
                  {cat.count}+ ads
                </span>
              </div>

              {/* Title & Native Telugu Subtitle */}
              <div className="px-1 text-center">
                <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-[#E51E31] transition-colors line-clamp-1 font-heading">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 font-semibold">
                  {cat.nameTe}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
