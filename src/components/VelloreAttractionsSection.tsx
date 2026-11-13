import React from 'react';
import { MapPin, ExternalLink, Sparkles, Clock } from 'lucide-react';
import { PUBLISHED_VELLORE_ATTRACTIONS } from '../data/velloreTourismData';

interface Attraction {
  id: string;
  name: string;
  nameNative: string;
  tagline: string;
  distance: string;
  timings: string;
  image: string;
  highlights: string[];
  directionsUrl: string;
}

const VELLORE_ATTRACTIONS: Attraction[] = PUBLISHED_VELLORE_ATTRACTIONS.map((att) => ({
  id: att.id,
  name: att.title,
  nameNative: att.nameNative,
  tagline: att.shortDescription,
  distance: att.location.distanceFromCenter,
  timings: att.visitorInformation.timings,
  image: att.heroImage,
  highlights: att.historicalHighlights,
  directionsUrl: att.location.directionsUrl,
}));

interface VelloreAttractionsProps {
  onOpenCabBooking?: () => void;
  onNavigateTourism?: () => void;
}

export const VelloreAttractionsSection: React.FC<VelloreAttractionsProps> = ({
  onOpenCabBooking,
  onNavigateTourism,
}) => {
  return (
    <section className="py-8" aria-label="Historic Vellore Attractions & Places of Interest">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black text-[#176AC4] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded uppercase tracking-wider">
              Tourism & Heritage
            </span>
            <span className="text-xs text-slate-400 font-medium">Vellore Fort City Guide</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            Vellore Places of Interest & Heritage
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Key historical landmarks, golden pilgrimage shrines, and heritage destinations across Vellore (TN-23)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
          {onNavigateTourism && (
            <button
              type="button"
              onClick={onNavigateTourism}
              className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#176AC4] font-bold text-xs sm:text-sm border border-blue-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Explore All Tourism Guide</span>
              <span aria-hidden="true">→</span>
            </button>
          )}

          {onOpenCabBooking && (
            <button
              type="button"
              onClick={onOpenCabBooking}
              className="px-4 py-2.5 rounded-xl bg-[#176AC4] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🚕</span>
              <span>Book Cab for Sightseeing</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {VELLORE_ATTRACTIONS.map((att) => (
          <div
            key={att.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden flex flex-col justify-between group hover:-translate-y-1"
          >
            <div>
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img
                  src={att.image}
                  alt={att.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                  <MapPin className="w-2.5 h-2.5 text-blue-400" />
                  <span>{att.distance}</span>
                </div>
              </div>

              <div className="p-4">
                <span className="text-[11px] text-[#176AC4] font-bold block">{att.nameNative}</span>
                <h3 className="font-black text-slate-900 text-base font-heading mt-0.5 group-hover:text-blue-600 transition-colors">
                  {att.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {att.tagline}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{att.timings}</span>
                  </div>
                  <ul className="space-y-1 pt-1">
                    {att.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <a
                href={att.directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 min-h-[44px] rounded-xl bg-slate-50 hover:bg-[#176AC4] hover:text-white text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-slate-200 hover:border-transparent cursor-pointer"
              >
                <span>Get Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {onNavigateTourism && (
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 border border-blue-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-bold text-slate-800 text-xs sm:text-sm block">
              Discover All Historical Sights, Pilgrimage Temples & Scenic Hills
            </span>
            <span className="text-[11px] text-slate-500">
              Browse categories, detailed visitor guidelines, opening timings, and clinical notices.
            </span>
          </div>
          <button
            type="button"
            onClick={onNavigateTourism}
            className="px-4 py-2 rounded-xl bg-[#176AC4] hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
          >
            <span>Open Tourism Directory</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </section>
  );
};

