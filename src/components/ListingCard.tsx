import React from 'react';
import { 
  Star, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Bookmark, 
  Clock, 
  Tag, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Listing } from '../types';
import { CHITTOOR_AREAS } from '../data/mockData';

interface ListingCardProps {
  listing: Listing;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onSelect: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isSaved,
  onToggleSave,
  onSelect,
}) => {
  const areaName = CHITTOOR_AREAS.find((a) => a.id === listing.area)?.name || listing.area;

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = listing.whatsapp || listing.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello! I found your listing "${listing.title}" on ChittoorAds (Search Local AP-03). I would like to inquire about your services.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${listing.phone.replace(/\s+/g, '')}`;
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave(listing.id);
  };

  return (
    <div 
      onClick={() => onSelect(listing)}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-red-200 transition-all duration-200 flex flex-col justify-between overflow-hidden group cursor-pointer"
    >
      <div>
        {/* Image Container with Badges */}
        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
          <img
            src={listing.images[0] || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              {listing.isVerified && (
                <span className="inline-flex items-center gap-1 bg-emerald-600/95 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
              {listing.isFeatured && (
                <span className="inline-flex items-center bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Featured
                </span>
              )}
            </div>

            <button
              onClick={handleSave}
              className={`p-2 rounded-full backdrop-blur-md transition ${
                isSaved
                  ? 'bg-red-600 text-white'
                  : 'bg-black/40 text-white hover:bg-black/60'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save business'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Bottom Area Banner on Image */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
            <span className="flex items-center gap-1 font-medium bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              {areaName}
            </span>

            {listing.priceRange && (
              <span className="font-semibold bg-red-600/90 px-2 py-0.5 rounded-md backdrop-blur-xs text-[11px]">
                {listing.priceRange}
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5">
          {/* Rating and Reviews */}
          <div className="flex items-center justify-between gap-2 mb-2">
            {listing.reviewsCount > 0 ? (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{listing.rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-slate-500">
                  ({listing.reviewsCount} reviews)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                  New Listing • Unrated
                </span>
              </div>
            )}

            {listing.badge && (
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                {listing.badge}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug group-hover:text-red-600 transition line-clamp-1 font-heading">
            {listing.title}
          </h3>

          {/* Description */}
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>

          {/* Services Tag Chips */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {listing.services.slice(0, 3).map((service, idx) => (
              <span
                key={idx}
                className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
              >
                {service}
              </span>
            ))}
            {listing.services.length > 3 && (
              <span className="text-[11px] bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded-md font-medium">
                +{listing.services.length - 3} more
              </span>
            )}
          </div>

          {/* Timings */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-500 gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{listing.timings}</span>
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="p-4 pt-0 sm:p-5 sm:pt-0">
        <div className="grid grid-cols-2 gap-2">
          {/* Call Button */}
          <button
            onClick={handleCall}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition cursor-pointer"
          >
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>Call Now</span>
          </button>

          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition shadow-2xs shadow-emerald-600/30 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
