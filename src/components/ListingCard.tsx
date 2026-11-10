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
  ExternalLink,
  Send
} from 'lucide-react';
import { Listing } from '../types';
import { CITIES, DEFAULT_CITY_ID } from '../config/cities';
import { resolveListingContact } from '../utils/contactValidation';
import { getOperatingHoursStatus } from '../utils/operatingHours';
import { buildListingWhatsAppUrl } from '../utils/whatsappTemplates';

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
  const cityConfig = CITIES[listing.cityId || DEFAULT_CITY_ID] || CITIES[DEFAULT_CITY_ID];
  const areaName = cityConfig.localities.find((a) => a.id === listing.area)?.name || listing.area;

  // Contact validation: distinguish Indian mobile, landline with STD, helplines, and international formats
  const contact = resolveListingContact(listing.phone, listing.whatsapp);
  const cleanPhone = contact.dialablePhone;
  const cleanWhatsApp = contact.whatsappNumber;
  const hasValidPhone = contact.hasValidPhone;
  const hasValidWhatsApp = contact.hasValidWhatsApp;

  const isVellore = cityConfig.id === 'vellore';
  const hoursStatus = getOperatingHoursStatus(listing.timings);

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasValidWhatsApp) {
      onSelect(listing);
      return;
    }
    const wa = buildListingWhatsAppUrl({
      phone: listing.phone,
      whatsapp: listing.whatsapp,
      businessTitle: listing.title,
      categoryId: listing.category,
      localityName: areaName,
      cityId: cityConfig.id,
      brandName: cityConfig.brandName,
      cityCode: cityConfig.code,
    });
    if (wa.isValid && wa.url) {
      window.open(wa.url, '_blank');
    } else {
      onSelect(listing);
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasValidPhone) {
      onSelect(listing);
      return;
    }
    window.location.href = `tel:${cleanPhone}`;
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
              {listing.isVerified ? (
                <span className="inline-flex items-center gap-1 bg-[#15995F] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              ) : isVellore ? (
                listing.status === 'Pending Approval' ? (
                  <span className="inline-flex items-center gap-1 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs">
                    Pending Approval
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-slate-900/85 text-slate-100 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs">
                    Preview Listing
                  </span>
                )
              ) : null}
              {listing.isFeatured && (
                <span className="inline-flex items-center bg-[#F5C325] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Featured
                </span>
              )}
            </div>

            <button
              onClick={handleSave}
              className={`p-2 rounded-full backdrop-blur-md transition ${
                isSaved
                  ? 'bg-[#E51E31] text-white'
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
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{listing.timings || (isVellore ? 'Hours Unavailable' : 'Regular Hours')}</span>
            </div>
            {isVellore && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${hoursStatus.badgeClass}`}
                title={hoursStatus.currentIstTime ? `Evaluated at ${hoursStatus.currentIstTime}` : undefined}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${hoursStatus.dotClass}`} />
                <span>{hoursStatus.label}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="p-4 pt-0 sm:p-5 sm:pt-0">
        <div className="grid grid-cols-2 gap-2">
          {/* Call / Enquiry Button */}
          {hasValidPhone ? (
            <button
              type="button"
              onClick={handleCall}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition cursor-pointer"
              aria-label={`Call ${listing.title}`}
            >
              <Phone className="w-4 h-4 text-[#15995F]" />
              <span>Call Now</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(listing);
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition cursor-pointer"
              title="Direct phone not provided — Click to view details and send enquiry"
              aria-label={`Enquire with ${listing.title} (Phone unavailable)`}
            >
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <span>Enquire</span>
            </button>
          )}

          {/* WhatsApp Button */}
          {hasValidWhatsApp ? (
            <button
              type="button"
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#15995F] hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition shadow-2xs shadow-emerald-600/30 cursor-pointer"
              aria-label={`WhatsApp ${listing.title}`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 text-slate-400 font-semibold text-xs sm:text-sm border border-slate-200 cursor-not-allowed select-none"
              title="WhatsApp contact not provided for this listing"
              aria-label="WhatsApp unavailable"
            >
              <MessageSquare className="w-4 h-4 text-slate-300" />
              <span>WhatsApp</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
