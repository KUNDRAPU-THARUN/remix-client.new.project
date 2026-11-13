import React, { useEffect, useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Ticket,
  Camera,
  Car,
  Compass,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Share2,
  Check,
  AlertCircle,
  Building2,
  Train,
  Bus,
  Plane,
} from 'lucide-react';
import { TourismAttraction } from '../../types/tourism';

interface AttractionDetailPreviewModalProps {
  attraction: TourismAttraction | null;
  onClose: () => void;
  onOpenCabBooking?: () => void;
  onNavigateDetail?: (slug: string) => void;
}

export const AttractionDetailPreviewModal: React.FC<AttractionDetailPreviewModalProps> = ({
  attraction,
  onClose,
  onOpenCabBooking,
  onNavigateDetail,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (attraction) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [attraction, onClose]);

  if (!attraction) return null;

  const {
    title,
    nameNative,
    shortDescription,
    fullDescription,
    categoryLabel,
    heroImage,
    images,
    location,
    visitorInformation,
    historicalHighlights,
    historicalEra,
    architecturalStyle,
    sourceReferences,
    contentVerificationStatus,
    clinicalVisitorNotice,
  } = attraction;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/city/vellore/tourism#${attraction.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="attraction-modal-title"
    >
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image & Controls */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-100 shrink-0">
          <img
            src={heroImage}
            alt={`${title} - ${nameNative}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

          {/* Close & Share Buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 min-h-[44px] min-w-[44px] rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white backdrop-blur-xs transition flex items-center justify-center cursor-pointer border border-white/20"
              aria-label="Share attraction link"
              title="Copy share link"
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              ) : (
                <Share2 className="w-4 h-4 text-white" />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 min-h-[44px] min-w-[44px] rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white backdrop-blur-xs transition flex items-center justify-center cursor-pointer border border-white/20"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Floating Badges */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/90 text-white uppercase tracking-wider backdrop-blur-xs">
                {categoryLabel}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-200 backdrop-blur-xs flex items-center gap-1 border border-white/20">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>
                  {contentVerificationStatus === 'verified'
                    ? 'Official Verified'
                    : 'Partially Verified'}
                </span>
              </span>
            </div>

            <span className="text-xs sm:text-sm font-bold text-blue-300 block">
              {nameNative}
            </span>
            <h2
              id="attraction-modal-title"
              className="text-xl sm:text-2xl font-black text-white font-heading leading-tight"
            >
              {title}
            </h2>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-700">
          {/* Clinical advisory notice for CMC Hospital */}
          {clinicalVisitorNotice && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-800 block">
                  Healthcare Facility Regulatory Notice
                </span>
                <p className="leading-relaxed">{clinicalVisitorNotice}</p>
              </div>
            </div>
          )}

          {/* Short Tagline / Summary */}
          <p className="text-sm font-semibold text-slate-800 leading-relaxed border-l-4 border-[#176AC4] pl-3 py-0.5">
            {shortDescription}
          </p>

          {/* Full Description */}
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
            <p>{fullDescription}</p>
          </div>

          {/* Historical Era & Architecture */}
          {(historicalEra || architecturalStyle) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
              {historicalEra && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Historical Period
                  </span>
                  <span className="font-semibold text-slate-800">{historicalEra}</span>
                </div>
              )}
              {architecturalStyle && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Architectural Style
                  </span>
                  <span className="font-semibold text-slate-800">{architecturalStyle}</span>
                </div>
              )}
            </div>
          )}

          {/* Historical Highlights */}
          {historicalHighlights && historicalHighlights.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Historical Highlights & Features</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {historicalHighlights.map((highlight, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#176AC4] shrink-0 mt-1.5" />
                    <span className="leading-snug">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Practical Visitor Information Panel */}
          <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#176AC4] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#176AC4]" />
              <span>Visitor Guidelines & Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Timings */}
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Opening Timings</span>
                  <span className="text-slate-600">{visitorInformation.timings}</span>
                  {visitorInformation.timingNotes && (
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      ({visitorInformation.timingNotes})
                    </span>
                  )}
                </div>
              </div>

              {/* Entry Fee */}
              <div className="flex items-start gap-2">
                <Ticket className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Entry Fee</span>
                  <span className="text-slate-600 capitalize">
                    {visitorInformation.entryFeeType.replace('_', ' ')}
                  </span>
                  {visitorInformation.entryFeeDetails && (
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {visitorInformation.entryFeeDetails}
                    </span>
                  )}
                </div>
              </div>

              {/* Photography Rules */}
              {visitorInformation.photographyRules && (
                <div className="flex items-start gap-2">
                  <Camera className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Photography</span>
                    <span className="text-slate-600 capitalize">
                      {visitorInformation.photographyRules.replace('_', ' ')}
                    </span>
                    {visitorInformation.photographyNotes && (
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {visitorInformation.photographyNotes}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Parking */}
              {visitorInformation.parkingAvailable && (
                <div className="flex items-start gap-2">
                  <Car className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Parking</span>
                    <span className="text-slate-600 capitalize">
                      {visitorInformation.parkingAvailable}
                    </span>
                    {visitorInformation.parkingNotes && (
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {visitorInformation.parkingNotes}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Best Time to Visit & Duration */}
            {(visitorInformation.bestTimeToVisit ||
              visitorInformation.recommendedDuration) && (
              <div className="pt-2 border-t border-blue-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                {visitorInformation.bestTimeToVisit && (
                  <div>
                    <span className="font-bold text-slate-700">Best Time: </span>
                    <span>{visitorInformation.bestTimeToVisit}</span>
                  </div>
                )}
                {visitorInformation.recommendedDuration && (
                  <div>
                    <span className="font-bold text-slate-700">Duration: </span>
                    <span>{visitorInformation.recommendedDuration}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nearest Transit */}
          {location.nearestTransit && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
              <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider text-slate-500">
                Transit Connectivity
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600 text-[11px]">
                {location.nearestTransit.railwayStation && (
                  <div className="flex items-center gap-1.5">
                    <Train className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{location.nearestTransit.railwayStation}</span>
                  </div>
                )}
                {location.nearestTransit.busStand && (
                  <div className="flex items-center gap-1.5">
                    <Bus className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{location.nearestTransit.busStand}</span>
                  </div>
                )}
                {location.nearestTransit.airport && (
                  <div className="flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>{location.nearestTransit.airport}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Authoritative Sources & Gazetteers */}
          {sourceReferences && sourceReferences.length > 0 && (
            <div className="pt-2 text-[10px] text-slate-400">
              <span className="font-bold uppercase tracking-wider block mb-1">
                Authoritative Reference Sources:
              </span>
              <span>{sourceReferences.join(' • ')}</span>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="truncate max-w-[220px]">{location.locality}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onNavigateDetail && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateDetail(attraction.slug);
                }}
                className="flex-1 sm:flex-initial py-2.5 px-3.5 min-h-[44px] rounded-xl bg-blue-50 hover:bg-[#176AC4] text-[#176AC4] hover:text-white font-bold text-xs transition cursor-pointer border border-blue-200"
              >
                <span>Full Guide & Discovery →</span>
              </button>
            )}

            {onOpenCabBooking && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCabBooking();
                }}
                className="flex-1 sm:flex-initial py-2.5 px-3 min-h-[44px] rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
              >
                Book Sightseeing Cab
              </button>
            )}

            <a
              href={location.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial py-2.5 px-4 min-h-[44px] rounded-xl bg-[#176AC4] hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Get Directions</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
