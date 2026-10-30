import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CHITTOOR_CATEGORIES } from '../data/mockData';
import { useTranslation } from '../i18n/LanguageContext';

interface CategoryPillsProps {
  onSelectCategory: (category: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  onSelectCategory,
}) => {
  const { t } = useTranslation();

  return (
    <div className="py-8">
      {/* Section Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase">
              Local Sectors
            </span>
            <span className="text-xs text-slate-400">AP-03 Directory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1">
            {t('exploreCategoriesTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('exploreCategoriesSubtitle')}
          </p>
        </div>

        <button
          onClick={() => onSelectCategory('all')}
          className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl border border-red-200 transition flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>{t('viewAllCategories')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2-Row Rich Visual Thumbnail Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {CHITTOOR_CATEGORIES.slice(0, 16).map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="group bg-white rounded-2xl border border-slate-200/80 hover:border-red-400 shadow-2xs hover:shadow-xl transition-all duration-300 p-2.5 flex flex-col justify-between cursor-pointer select-none overflow-hidden"
          >
            {/* Visual Thumbnail Image */}
            <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100 relative mb-2.5">
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
              <span className="absolute bottom-1.5 left-2 text-[10px] text-white font-bold px-1.5 py-0.2 rounded bg-black/40 backdrop-blur-xs">
                {cat.count}+ ads
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="px-1 text-center">
              <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-red-600 transition-colors line-clamp-1 font-heading">
                {cat.name}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 font-medium">
                {cat.nameTe}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
