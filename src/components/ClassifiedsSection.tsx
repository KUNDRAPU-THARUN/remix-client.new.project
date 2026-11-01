import React, { useState } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Clock, 
  MapPin, 
  Tag, 
  Filter, 
  PlusCircle,
  Sparkles
} from 'lucide-react';
import { ClassifiedItem, CityConfig } from '../types';

interface ClassifiedsSectionProps {
  classifieds: ClassifiedItem[];
  onOpenPostAd: () => void;
  currentCity?: CityConfig;
}

export const ClassifiedsSection: React.FC<ClassifiedsSectionProps> = ({
  classifieds,
  onOpenPostAd,
  currentCity,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const cityName = currentCity?.name || 'Chittoor';
  const cityCode = currentCity?.code || 'AP-03';
  const brandName = currentCity?.brandName || 'ChittoorAds';

  const categories = ['all', ...Array.from(new Set(classifieds.map((c) => c.category)))];

  const filtered = selectedCategory === 'all'
    ? classifieds
    : classifieds.filter((c) => c.category === selectedCategory);

  const handleWhatsApp = (item: ClassifiedItem) => {
    const phone = item.whatsapp || item.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${item.postedBy}! I am interested in your classified ad "${item.title}" listed on ${brandName}.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase">
              Free Local Classifieds
            </span>
            <span className="text-xs text-slate-400">{cityCode} Buy & Sell</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1">
            {cityName} Classifieds & Deals
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Used vehicles, rental homes, commercial shops, farm harvest & gadgets in {cityName}.
          </p>
        </div>

        <button
          onClick={onOpenPostAd}
          className="self-start sm:self-center flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Free Classified Ad</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {cat === 'all' ? 'All Classifieds' : cat}
          </button>
        ))}
      </div>

      {/* Classifieds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-lg transition p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between"
          >
            <div className="sm:w-44 h-40 sm:h-auto rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                {item.category}
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base sm:text-lg font-black text-red-600 font-heading">
                    {item.price}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.date}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1 line-clamp-1 font-heading">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                    <MapPin className="w-3 h-3 text-red-500" />
                    {item.location}
                  </span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                    Condition: <strong className="text-slate-700">{item.condition}</strong>
                  </span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                    Seller: <strong className="text-slate-700">{item.postedBy}</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleCall(item.phone)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call Seller</span>
                </button>
                <button
                  onClick={() => handleWhatsApp(item)}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
