import React, { useState, useEffect, useMemo } from 'react';
import {
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
  ChevronRight,
  ArrowLeft,
  X,
  ChevronLeft,
  Train,
  Bus,
  Plane,
  Building2,
  Calendar,
  Globe,
  Info,
  Phone,
  Star,
} from 'lucide-react';
import { CityConfig, Listing } from '../../types';
import { TourismAttraction, TourismImage } from '../../types/tourism';
import { tourismService } from '../../services/tourismService';

interface AttractionDetailPageProps {
  slug: string;
  currentCity: CityConfig;
  listings?: Listing[];
  onNavigateHome: () => void;
  onNavigateDirectory: () => void;
  onSelectAttractionSlug: (slug: string) => void;
  onSelectListing?: (listing: Listing) => void;
  onOpenCabBooking?: () => void;
  onOpenEmergency?: () => void;
}

export const AttractionDetailPage: React.FC<AttractionDetailPageProps> = ({
  slug,
  currentCity,
  listings = [],
  onNavigateHome,
  onNavigateDirectory,
  onSelectAttractionSlug,
  onSelectListing,
  onOpenCabBooking,
}) => {
  const [attraction, setAttraction] = useState<TourismAttraction | null>(null);
  const [relatedAttractions, setRelatedAttractions] = useState<TourismAttraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fetch attraction data by slug
  useEffect(() => {
    let isMounted = true;
    async function loadAttraction() {
      setLoading(true);
      try {
        const data = await tourismService.getTourismAttractionBySlug(slug, currentCity.id);
        if (isMounted) {
          setAttraction(data);
          if (data) {
            const related = await tourismService.getRelatedTourismAttractions(data.id, 3, currentCity.id);
            if (isMounted) {
              setRelatedAttractions(related);
            }
          } else {
            setRelatedAttractions([]);
          }
        }
      } catch (err) {
        console.error('Failed to load attraction detail:', err);
        if (isMounted) setAttraction(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAttraction();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [slug, currentCity.id]);

  // Keyboard accessibility for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null || !attraction) return;

      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : attraction.images.length - 1
        );
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev !== null && prev < attraction.images.length - 1 ? prev + 1 : 0
        );
      }
    };

    if (lightboxIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [lightboxIndex, attraction]);

  // Filter verified active Vellore listings
  const nearbyVelloreListings = useMemo(() => {
    if (!attraction) return [];
    // Confine to Vellore only
    const velloreListings = listings.filter(
      (l) => l.cityId === 'vellore' && (l.status === 'Active' || !l.status)
    );

    // Prefer relevant categories: restaurants, healthcare, pg-hostels, hotels
    return velloreListings.slice(0, 3);
  }, [listings, attraction]);

  const handleCopyLink = () => {
    const canonical = `${window.location.origin}/city/vellore/tourism/${slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(canonical);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Structured Data (Schema.org TouristAttraction JSON-LD)
  const structuredData = useMemo(() => {
    if (!attraction) return null;
    const postalCode = attraction.location.address?.match(/\b(\d{6})\b/)?.[1] || '632004';
    return {
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      name: attraction.title,
      alternateName: attraction.nameNative,
      description: attraction.shortDescription,
      image: attraction.heroImage,
      url: `https://remix-client-new-project.vercel.app/city/vellore/tourism/${attraction.slug}`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: attraction.location.address || attraction.location.locality,
        addressLocality: attraction.location.locality,
        addressRegion: 'Tamil Nadu',
        postalCode,
        addressCountry: 'IN',
      },
      geo:
        attraction.location.latitude && attraction.location.longitude
          ? {
              '@type': 'GeoCoordinates',
              latitude: attraction.location.latitude,
              longitude: attraction.location.longitude,
            }
          : undefined,
      isAccessibleForFree: attraction.visitorInformation.entryFeeType === 'free',
      publicAccess: true,
    };
  }, [attraction]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-8 bg-slate-200 rounded w-2/3" />
          <div className="h-80 bg-slate-200 rounded-3xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Not Found State (Unknown or Draft record)
  if (!attraction) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-black text-slate-900 font-heading">
              Attraction Not Found
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              The requested Vellore tourism destination does not exist or is currently in research review.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateDirectory}
            className="w-full py-3 px-4 rounded-xl bg-[#176AC4] hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Vellore Tourism Directory</span>
          </button>
        </div>
      </div>
    );
  }

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
    officialWebsite,
  } = attraction;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Schema.org Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      {/* TOP NAVIGATION BREADCRUMB BAR */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto scrollbar-none"
          >
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-blue-600 shrink-0 transition cursor-pointer"
            >
              Vellore Ads
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              type="button"
              onClick={onNavigateDirectory}
              className="hover:text-blue-600 shrink-0 transition cursor-pointer"
            >
              Tourism Guide
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-bold truncate max-w-[150px] sm:max-w-xs">
              {title}
            </span>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 min-h-[40px] min-w-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center cursor-pointer text-xs font-semibold gap-1.5"
              aria-label="Share attraction link"
              title="Copy link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onNavigateDirectory}
              className="px-3 py-2 min-h-[40px] rounded-xl bg-blue-50 hover:bg-blue-100 text-[#176AC4] font-bold text-xs transition cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Directory</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-10">
        {/* 1. HERO SECTION */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-[#176AC4] border border-blue-200 text-xs font-black uppercase tracking-wider">
              {categoryLabel || attraction.category.replace('_', ' ')}
            </span>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border ${
                contentVerificationStatus === 'verified'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {contentVerificationStatus === 'verified'
                  ? 'Official Gazetted Landmark'
                  : 'Partially Verified Landmark'}
              </span>
            </span>

            {attraction.verificationDate && (
              <span className="text-[11px] text-slate-500 font-medium px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
                Verified: {attraction.verificationDate}
              </span>
            )}

            {visitorInformation.entryFeeType === 'free' && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                <span>Free Entry</span>
              </span>
            )}
          </div>

          <div>
            <span
              data-testid="native-title"
              className="text-sm sm:text-base font-bold text-[#176AC4] block"
            >
              {nameNative}
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-heading tracking-tight mt-1 leading-tight">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2 font-medium leading-relaxed max-w-3xl">
              {shortDescription}
            </p>
          </div>

          {/* Primary Hero Image */}
          <div className="relative h-64 sm:h-96 md:h-[420px] w-full rounded-3xl overflow-hidden bg-slate-200 border border-slate-200 shadow-md">
            <img
              src={heroImage}
              alt={`${title} - ${nameNative}`}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-xs px-3 py-1.5 rounded-full text-xs font-semibold border border-white/20">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{location.locality}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300">{location.distanceFromCenter}</span>
              </div>

              {location.directionsUrl && (
                <a
                  href={location.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 min-h-[44px] rounded-xl bg-[#176AC4] hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Stock photo attribution disclaimer if applicable */}
          {images.some((img) => img.isStockPhoto) && (
            <p className="text-[11px] text-slate-400 italic">
              * Note: Some gallery visuals use illustrative stock photography due to conservation rules or photo restrictions.
            </p>
          )}
        </header>

        {/* 2. CLINICAL ADVISORY (CMC Hospital Heritage Notice) */}
        {clinicalVisitorNotice && (
          <section
            className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm space-y-2 shadow-xs"
            aria-label="Healthcare Facility Notice"
          >
            <div className="flex items-center gap-2 font-black uppercase tracking-wider text-amber-900 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Healthcare Campus Regulatory Visitor Advisory</span>
            </div>
            <p className="leading-relaxed text-amber-900">{clinicalVisitorNotice}</p>
          </section>
        )}

        {/* 3. TWO-COLUMN LAYOUT: DESCRIPTION & VISITOR INFORMATION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
          {/* Main Content Column (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview & Full Description */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-xl font-black text-slate-900 font-heading">
                About {title}
              </h2>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line font-normal">
                {fullDescription}
              </div>

              {/* Historical Period & Architectural Style */}
              {(historicalEra || architecturalStyle) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs">
                  {historicalEra && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">
                        Historical Period
                      </span>
                      <span className="font-semibold text-slate-800">{historicalEra}</span>
                    </div>
                  )}
                  {architecturalStyle && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">
                        Architectural Style
                      </span>
                      <span className="font-semibold text-slate-800">{architecturalStyle}</span>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Historical and Cultural Highlights */}
            {historicalHighlights && historicalHighlights.length > 0 && (
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="text-xl font-black text-slate-900 font-heading">
                    Historical & Cultural Highlights
                  </h2>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
                  {historicalHighlights.map((highlight, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#176AC4] shrink-0 mt-2" />
                      <span className="leading-relaxed">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 4. IMAGE GALLERY WITH LIGHTBOX */}
            {images && images.length > 0 && (
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900 font-heading">
                    Photo Gallery ({images.length})
                  </h2>
                  <span className="text-xs text-slate-400 font-medium">Click to view full photo</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className="group relative h-28 sm:h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#176AC4] cursor-pointer"
                      aria-label={`View photo ${idx + 1}: ${img.caption || img.alt}`}
                    >
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors" />
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Column (Right 1 col): Visitor Info & Local Services */}
          <aside className="space-y-6">
            {/* Practical Visitor Guidelines Card */}
            <div className="bg-blue-50/70 rounded-3xl p-6 border border-blue-200/80 shadow-2xs space-y-5">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#176AC4]" />
                <h2 className="text-lg font-black text-slate-900 font-heading">
                  Visitor Guidelines
                </h2>
              </div>

              <div className="space-y-4 text-xs text-slate-700">
                {/* Timings */}
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Opening Timings</span>
                    <span>{visitorInformation.timings}</span>
                    {visitorInformation.timingNotes && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {visitorInformation.timingNotes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Entry Fee */}
                <div className="flex items-start gap-2.5">
                  <Ticket className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Entrance Policy</span>
                    <span className="capitalize">{visitorInformation.entryFeeType.replace('_', ' ')}</span>
                    {visitorInformation.entryFeeDetails && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {visitorInformation.entryFeeDetails}
                      </p>
                    )}
                  </div>
                </div>

                {/* Photography */}
                {visitorInformation.photographyRules && (
                  <div className="flex items-start gap-2.5">
                    <Camera className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Photography</span>
                      <span className="capitalize">
                        {visitorInformation.photographyRules.replace('_', ' ')}
                      </span>
                      {visitorInformation.photographyNotes && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {visitorInformation.photographyNotes}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Dress Code */}
                {visitorInformation.dressCode && (
                  <div className="flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Dress Code</span>
                      <span>{visitorInformation.dressCode}</span>
                    </div>
                  </div>
                )}

                {/* Parking */}
                {visitorInformation.parkingAvailable && (
                  <div className="flex items-start gap-2.5">
                    <Car className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Parking</span>
                      <span className="capitalize">{visitorInformation.parkingAvailable}</span>
                      {visitorInformation.parkingNotes && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {visitorInformation.parkingNotes}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Best Time & Duration */}
                {(visitorInformation.bestTimeToVisit || visitorInformation.recommendedDuration) && (
                  <div className="pt-3 border-t border-blue-200/60 space-y-1.5 text-[11px]">
                    {visitorInformation.bestTimeToVisit && (
                      <p>
                        <strong className="text-slate-800">Best Hours:</strong>{' '}
                        {visitorInformation.bestTimeToVisit}
                      </p>
                    )}
                    {visitorInformation.recommendedDuration && (
                      <p>
                        <strong className="text-slate-800">Typical Visit:</strong>{' '}
                        {visitorInformation.recommendedDuration}
                      </p>
                    )}
                  </div>
                )}

                {/* Official Website */}
                {officialWebsite && (
                  <div className="pt-2 border-t border-blue-200/60">
                    <a
                      href={officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#176AC4] hover:text-blue-800 flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Official Trust / Authority Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Transit Connectivity Card */}
            {location.nearestTransit && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  Transit Connectivity
                </h3>
                <div className="space-y-2 text-slate-700">
                  {location.nearestTransit.railwayStation && (
                    <div className="flex items-center gap-2">
                      <Train className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{location.nearestTransit.railwayStation}</span>
                    </div>
                  )}
                  {location.nearestTransit.busStand && (
                    <div className="flex items-center gap-2">
                      <Bus className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{location.nearestTransit.busStand}</span>
                    </div>
                  )}
                  {location.nearestTransit.airport && (
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>{location.nearestTransit.airport}</span>
                    </div>
                  )}
                </div>

                {onOpenCabBooking && (
                  <button
                    type="button"
                    onClick={onOpenCabBooking}
                    className="w-full mt-3 py-2.5 px-3 min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>🚕</span>
                    <span>Book Local Sightseeing Cab</span>
                  </button>
                )}
              </div>
            )}

            {/* Authoritative References Citations */}
            {sourceReferences && sourceReferences.length > 0 && (
              <div className="p-4 bg-slate-100 rounded-2xl text-[10px] text-slate-500 space-y-1">
                <span className="font-bold uppercase tracking-wider block text-slate-600">
                  Authoritative Gazetteers & Sources
                </span>
                <p>{sourceReferences.join(' • ')}</p>
              </div>
            )}
          </aside>
        </div>

        {/* 5. NEARBY VERIFIED VELLORE SERVICES & BUSINESSES */}
        {nearbyVelloreListings.length > 0 && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                  Local Commercial Network
                </span>
                <h2 className="text-xl font-black text-slate-900 font-heading">
                  Useful Vellore Services & Accommodations
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Verified businesses across Vellore (TN-23)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {nearbyVelloreListings.map((biz) => (
                <div
                  key={biz.id}
                  onClick={() => onSelectListing && onSelectListing(biz)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between group bg-slate-50/50"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold uppercase tracking-wider">
                        {biz.category}
                      </span>
                      {biz.isVerified && (
                        <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition line-clamp-1">
                      {biz.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {biz.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3" />
                      <span className="capitalize">{biz.area}</span>
                    </span>
                    <span className="font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                      View Ad →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. RELATED VELLORE ATTRACTIONS */}
        {relatedAttractions.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                  Continue Exploring
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                  More Vellore Destinations to Visit
                </h2>
              </div>
              <button
                type="button"
                onClick={onNavigateDirectory}
                className="text-xs font-bold text-[#176AC4] hover:text-blue-800 transition flex items-center gap-1 cursor-pointer"
              >
                <span>View all places</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedAttractions.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectAttractionSlug(rel.slug)}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                      <img
                        src={rel.heroImage}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-slate-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-blue-400" />
                        <span>{rel.location.locality}</span>
                      </span>
                    </div>
                    <div className="p-4 space-y-1">
                      <span className="text-[10px] font-bold text-blue-600 block">
                        {rel.nameNative}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition line-clamp-1">
                        {rel.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {rel.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <span className="text-xs font-bold text-[#176AC4] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Explore details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* BOTTOM BACK TO DIRECTORY BANNER */}
        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={onNavigateDirectory}
            className="px-6 py-3 min-h-[44px] rounded-2xl bg-[#176AC4] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to All Vellore Heritage & Tourism Places</span>
          </button>
        </div>
      </main>

      {/* 7. IMAGE LIGHTBOX MODAL */}
      {lightboxIndex !== null && attraction.images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Image Preview Lightbox"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2.5 min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center cursor-pointer border border-white/20 z-10"
            aria-label="Close image preview"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Controls */}
          {attraction.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : attraction.images.length - 1
                  );
                }}
                className="absolute left-3 sm:left-6 p-3 min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center cursor-pointer border border-white/20 z-10"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) =>
                    prev !== null && prev < attraction.images.length - 1 ? prev + 1 : 0
                  );
                }}
                className="absolute right-3 sm:right-6 p-3 min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center cursor-pointer border border-white/20 z-10"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Active Image Container */}
          <div
            className="max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={attraction.images[lightboxIndex].url}
              alt={attraction.images[lightboxIndex].alt}
              className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="mt-3 text-center text-white space-y-1">
              <p className="text-xs sm:text-sm font-medium">
                {attraction.images[lightboxIndex].caption || attraction.images[lightboxIndex].alt}
              </p>
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <span>
                  Photo {lightboxIndex + 1} of {attraction.images.length}
                </span>
                {attraction.images[lightboxIndex].isStockPhoto && (
                  <span className="text-amber-400">
                    • Illustrative Stock Photography
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
