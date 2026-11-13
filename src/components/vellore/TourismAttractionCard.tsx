import React from 'react';
import {
  MapPin,
  Clock,
  Ticket,
  Camera,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Car,
} from 'lucide-react';
import { TourismAttraction } from '../../types/tourism';

interface TourismAttractionCardProps {
  attraction: TourismAttraction;
  onSelect: (attraction: TourismAttraction) => void;
  onNavigateDetail?: (slug: string) => void;
}

export const TourismAttractionCard: React.FC<TourismAttractionCardProps> = ({
  attraction,
  onSelect,
  onNavigateDetail,
}) => {
  const {
    title,
    nameNative,
    shortDescription,
    categoryLabel,
    heroImage,
    location,
    visitorInformation,
    isFeatured,
    contentVerificationStatus,
    clinicalVisitorNotice,
  } = attraction;

  // Format entry fee badge
  const renderEntryFeeBadge = () => {
    switch (visitorInformation.entryFeeType) {
      case 'free':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Ticket className="w-3 h-3" />
            <span>Free Entry</span>
          </span>
        );
      case 'partially_paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Ticket className="w-3 h-3" />
            <span>Free / Paid Seva</span>
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Ticket className="w-3 h-3" />
            <span>Ticketed</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <article
      className="bg-white rounded-3xl border border-slate-200 shadow-2xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden flex flex-col justify-between group focus-within:ring-2 focus-within:ring-[#176AC4] focus-within:outline-hidden"
      aria-labelledby={`attraction-title-${attraction.id}`}
    >
      <div
        className={onNavigateDetail ? 'cursor-pointer' : undefined}
        onClick={() => {
          if (onNavigateDetail) {
            onNavigateDetail(attraction.slug);
          }
        }}
      >
        {/* Card Hero Image */}
        <div className="relative h-48 sm:h-52 w-full bg-slate-100 overflow-hidden">
          <img
            src={heroImage}
            alt={`${title} - ${nameNative}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              // Graceful fallback to high quality monument default if image URL fails
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80';
            }}
          />

          {/* Top badges: Distance & Featured */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className="bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/20 shadow-xs">
              <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-[180px]">{location.locality}</span>
            </span>

            {isFeatured && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-amber-300">
                <Sparkles className="w-3 h-3 fill-slate-950 text-slate-950 shrink-0" />
                <span>Featured</span>
              </span>
            )}
          </div>

          {/* Verification Badge */}
          <div className="absolute bottom-3 left-3 pointer-events-none">
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs border ${
                contentVerificationStatus === 'verified'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-950/80 text-slate-200 border-white/20'
              }`}
            >
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              <span>
                {contentVerificationStatus === 'verified' ? 'Verified Landmark' : 'Partially Verified'}
              </span>
            </span>
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-4 sm:p-5">
          {/* Native Script Title */}
          <span className="text-[11px] sm:text-xs font-bold text-[#176AC4] tracking-tight block">
            {nameNative}
          </span>

          {/* Main Title */}
          <h3
            id={`attraction-title-${attraction.id}`}
            className="text-base sm:text-lg font-black text-slate-900 font-heading mt-0.5 group-hover:text-[#176AC4] transition-colors leading-snug line-clamp-1"
          >
            {title}
          </h3>

          {/* Category Chip */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider border border-slate-200">
              {categoryLabel || attraction.category.replace('_', ' ')}
            </span>
            {renderEntryFeeBadge()}
          </div>

          {/* Short Description */}
          <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-2">
            {shortDescription}
          </p>

          {/* Clinical advisory notice chip if applicable (e.g. CMC) */}
          {clinicalVisitorNotice && (
            <div className="mt-2.5 p-2 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-1.5 text-[10px] text-amber-900">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span className="line-clamp-2 font-medium">
                Hospital heritage zone: Visits restricted to Ida Scudder Archives & Chapel.
              </span>
            </div>
          )}

          {/* Quick Facts Row */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
            {/* Timings */}
            <div className="flex items-center gap-1.5 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{visitorInformation.timings}</span>
            </div>

            {/* Distance from Center */}
            <div className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{location.distanceFromCenter}</span>
            </div>

            {/* Photography Rule */}
            {visitorInformation.photographyRules && (
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                <Camera className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="capitalize">
                  Photography: {visitorInformation.photographyRules.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 sm:p-5 pt-0 grid grid-cols-2 gap-2">
        {/* Discover More Button */}
        <button
          type="button"
          onClick={() => onSelect(attraction)}
          className="py-2.5 px-3 min-h-[44px] rounded-xl bg-blue-50 hover:bg-[#176AC4] text-[#176AC4] hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 border border-blue-200 hover:border-transparent cursor-pointer"
          aria-label={`Discover details about ${title}`}
        >
          <span>Discover More</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        </button>

        {/* Directions Link */}
        <a
          href={location.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-3 min-h-[44px] rounded-xl bg-slate-50 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1 border border-slate-200 cursor-pointer"
          aria-label={`Get directions to ${title} on Google Maps`}
        >
          <span>Directions</span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-500" />
        </a>
      </div>
    </article>
  );
};
