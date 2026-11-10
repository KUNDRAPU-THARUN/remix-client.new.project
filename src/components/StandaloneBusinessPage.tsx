import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Phone,
  MessageSquare,
  ShieldCheck,
  Star,
  Clock,
  Navigation,
  Share2,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Search,
  ExternalLink,
  Globe,
  Mail,
  Send,
  AlertCircle,
  ThumbsUp,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { Listing, Review, UserAccount, CityConfig } from '../types';
import { resolveListingContact } from '../utils/contactValidation';
import { enquiryService } from '../services/enquiryService';
import { getCityCategories } from '../config/categories';

interface StandaloneBusinessPageProps {
  listingId: string | null;
  listings: Listing[];
  currentCity: CityConfig;
  currentUser: UserAccount | null;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onNavigateHome: () => void;
  onNavigateCategory: (categoryId: string, areaId?: string) => void;
  onAddReview: (listingId: string, review: Omit<Review, 'id' | 'date'>) => void;
}

export const StandaloneBusinessPage: React.FC<StandaloneBusinessPageProps> = ({
  listingId,
  listings,
  currentCity,
  currentUser,
  savedIds,
  onToggleSave,
  onNavigateHome,
  onNavigateCategory,
  onAddReview,
}) => {
  // Resolve listing from available listings
  const listing = useMemo(() => {
    if (!listingId) return null;
    return listings.find((l) => l.id === listingId) || null;
  }, [listingId, listings]);

  // Security check: pending listings are only visible to the owner, franchise partner, or super admin
  const isPendingAuthorized = useMemo(() => {
    if (!listing) return false;
    if (listing.status !== 'Pending Approval') return true;
    if (!currentUser) return false;
    if (currentUser.isSuperAdmin) return true;
    if (listing.postedByUser === currentUser.id) return true;
    if (currentUser.isFranchise && (listing.cityId || 'chittoor') === currentUser.franchiseCityId) return true;
    return false;
  }, [listing, currentUser]);

  // Territory check: listing must belong to current active city
  const isCityMatch = useMemo(() => {
    if (!listing) return false;
    return (listing.cityId || 'chittoor') === currentCity.id;
  }, [listing, currentCity.id]);

  // UI state
  const [activeTab, setActiveTab] = useState<'about' | 'services' | 'photos' | 'reviews'>('about');
  const [copiedLink, setCopiedLink] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  // Enquiry state
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryEmail, setEnquiryEmail] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [isEnquirySubmitting, setIsEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  // Review state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewerName, setReviewerName] = useState(currentUser?.name || '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Search state for not-found fallback
  const [searchQuery, setSearchQuery] = useState('');

  // ---------------------------------------------------------------------------
  // CASE 1: LISTING NOT FOUND OR CITY MISMATCH
  // ---------------------------------------------------------------------------
  if (!listing || !isCityMatch) {
    return (
      <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>

          <span className="text-xs font-extrabold text-[#176AC4] uppercase tracking-wider">
            {currentCity.name} Directory ({currentCity.code})
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1 mb-3">
            Business Listing Not Found
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-6">
            We could not find a business listing matching ID <strong>"{listingId || 'unknown'}"</strong> in {currentCity.name}. The business may have been updated, relocated, or unpublished.
          </p>

          {/* Quick Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                onNavigateCategory('all');
              }
            }}
            className="flex items-center gap-2 max-w-md mx-auto mb-6"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search verified businesses in ${currentCity.name}...`}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#176AC4]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#176AC4] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onNavigateHome}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {currentCity.name} Home</span>
            </button>

            <button
              onClick={() => onNavigateCategory('all')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl transition cursor-pointer"
            >
              Browse All Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // CASE 2: LISTING UNDER MODERATION / PENDING APPROVAL (UNAUTHORIZED)
  // ---------------------------------------------------------------------------
  if (listing.status === 'Pending Approval' && !isPendingAuthorized) {
    return (
      <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-[#176AC4] flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
            Verification in Progress • TN-23
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1 mb-3">
            Listing Under Review
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-6">
            This business listing has been submitted and is currently undergoing verification by the {currentCity.name} Ads moderation desk. It will be published after contact and locality confirmation.
          </p>

          <button
            onClick={onNavigateHome}
            className="px-5 py-2.5 bg-[#176AC4] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to {currentCity.name} Directory</span>
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // CASE 3: VALID & PUBLISHED BUSINESS PROFILE
  // ---------------------------------------------------------------------------
  const isSaved = savedIds.includes(listing.id);
  const contact = resolveListingContact(listing.phone, listing.whatsapp);
  const cleanPhone = contact.dialablePhone;
  const cleanWhatsApp = contact.whatsappNumber;
  const hasValidPhone = contact.hasValidPhone;
  const hasValidWhatsApp = contact.hasValidWhatsApp;

  const categories = getCityCategories(currentCity.id);
  const categoryConfig = categories.find((c) => c.id === listing.category);
  const categoryName = categoryConfig?.name || listing.category;

  const handleShare = async () => {
    try {
      const canonicalUrl = `${window.location.origin}/city/${currentCity.id}/biz/${listing.id}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(canonicalUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } else {
        alert(`Listing Link: ${canonicalUrl}`);
      }
    } catch {
      alert(`Listing Link: ${window.location.href}`);
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryError(null);

    if (!enquiryName.trim() || enquiryName.trim().length < 2) {
      setEnquiryError('Please enter your full name (at least 2 characters).');
      return;
    }

    const digitsOnly = enquiryPhone.replace(/\D/g, '');
    if (!digitsOnly || digitsOnly.length < 10) {
      setEnquiryError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!enquiryMessage.trim() || enquiryMessage.trim().length < 5) {
      setEnquiryError('Please enter your message or query.');
      return;
    }

    setIsEnquirySubmitting(true);

    const res = await enquiryService.submitEnquiry({
      businessId: listing.id,
      businessName: listing.title,
      cityId: listing.cityId || currentCity.id,
      customerName: enquiryName.trim(),
      customerPhone: enquiryPhone.trim(),
      customerEmail: enquiryEmail.trim() || undefined,
      message: enquiryMessage.trim(),
    });

    setIsEnquirySubmitting(false);

    if (res.error) {
      setEnquiryError(res.error);
    } else {
      setEnquirySuccess(true);
      setEnquiryMessage('');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    onAddReview(listing.id, {
      author: reviewerName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
    });

    setReviewSubmitted(true);
    setShowReviewForm(false);
    setReviewComment('');
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* 1. Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap">
            <button
              onClick={onNavigateHome}
              className="hover:text-[#176AC4] transition flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>{currentCity.name}</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => onNavigateCategory(listing.category)}
              className="hover:text-[#176AC4] transition cursor-pointer shrink-0"
            >
              <span>{categoryName}</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-bold truncate" aria-current="page">
              {listing.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
        {/* 2. Business Header Card */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-blue-50 text-[#176AC4] border border-blue-200">
                  {categoryName}
                </span>

                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  <MapPin className="w-3 h-3 inline mr-1 text-slate-500" />
                  {listing.area}
                </span>

                {listing.isVerified && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-[#15995F] border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Merchant</span>
                  </span>
                )}

                {listing.status === 'Pending Approval' && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Preview (Under Moderation)
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 font-heading tracking-tight">
                {listing.title}
              </h1>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-black text-slate-900">{listing.rating.toFixed(1)}</span>
                </div>
                <span className="text-slate-500">
                  ({listing.reviewsCount} verified {listing.reviewsCount === 1 ? 'review' : 'reviews'})
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {listing.timings || 'Open Regular Business Hours'}
                </span>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 text-xs text-slate-600 pt-1">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{listing.address}</span>
              </div>
            </div>

            {/* Top Action Buttons (Save & Share) */}
            <div className="flex items-center gap-2 self-start shrink-0">
              <button
                onClick={() => onToggleSave(listing.id)}
                className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                  isSaved
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save business'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-600' : ''}`} />
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                title="Copy shareable link"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>

          {/* Share Copied Notification */}
          {copiedLink && (
            <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl text-center animate-fade-in flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Direct profile URL copied to clipboard! Share on WhatsApp or social media.</span>
            </div>
          )}

          {/* Quick Action Bar (Call, WhatsApp, Directions) */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
            {hasValidPhone ? (
              <a
                href={`tel:${cleanPhone}`}
                className="px-5 py-2.5 bg-[#176AC4] hover:bg-blue-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call {listing.phone}</span>
              </a>
            ) : (
              <button
                onClick={() => setActiveTab('about')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs sm:text-sm rounded-xl transition flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Send Online Inquiry</span>
              </button>
            )}

            {hasValidWhatsApp && (
              <a
                href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                  `Hello! I found "${listing.title}" on ${currentCity.brandName} (${currentCity.code}). I would like more information.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#15995F] hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Message</span>
              </a>
            )}

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${listing.title}, ${listing.address}, ${currentCity.name}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-2"
            >
              <Navigation className="w-4 h-4 text-blue-600" />
              <span>Directions</span>
            </a>
          </div>
        </section>

        {/* 3. Section Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs sm:text-sm font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'about'
                ? 'bg-[#176AC4] text-white shadow-sm'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Overview & About
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'services'
                ? 'bg-[#176AC4] text-white shadow-sm'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Services Offered ({listing.services.length})
          </button>

          {listing.images && listing.images.length > 0 && (
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'photos'
                  ? 'bg-[#176AC4] text-white shadow-sm'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              Photo Gallery ({listing.images.length})
            </button>
          )}

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-[#176AC4] text-white shadow-sm'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Reviews ({listing.reviews.length})
          </button>
        </div>

        {/* 4. Tabbed Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Details (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* TAB: About */}
            {activeTab === 'about' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 font-heading mb-2">
                    About {listing.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {listing.description || 'Verified local establishment in Vellore providing quality services.'}
                  </p>
                </div>

                {/* Services Snapshot */}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 font-heading mb-3">
                    Key Specialties & Services
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {listing.services.map((svc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#15995F] shrink-0" />
                        <span>{svc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operating Hours Box */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#176AC4] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Operating Schedule</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{listing.timings || 'Mon – Sat: 9:00 AM – 8:00 PM'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Services */}
            {activeTab === 'services' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                <h2 className="text-lg font-black text-slate-900 font-heading">
                  All Services & Capabilities
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {listing.services.map((svc, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-xs sm:text-sm font-bold text-slate-800"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#15995F] flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <span>{svc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Photos */}
            {activeTab === 'photos' && listing.images && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                <h2 className="text-lg font-black text-slate-900 font-heading">
                  Photo Gallery
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {listing.images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxPhoto(img)}
                      className="aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group relative"
                    >
                      <img
                        src={img}
                        alt={`${listing.title} photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                        View Full Size
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Reviews */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-900 font-heading">
                    Customer Reviews ({listing.reviews.length})
                  </h2>

                  {!showReviewForm && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="px-4 py-2 bg-[#176AC4] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
                    >
                      Write a Review
                    </button>
                  )}
                </div>

                {reviewSubmitted && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl text-center">
                    Thank you! Your review has been added.
                  </div>
                )}

                {/* Review Submission Form */}
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Leave a Review</h3>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="e.g. Anand"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#176AC4]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 cursor-pointer"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= reviewRating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Your Feedback</label>
                      <textarea
                        required
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience with this establishment..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#176AC4]"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#176AC4] hover:bg-blue-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Submit Review
                      </button>
                    </div>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {listing.reviews.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4 text-center">
                      No customer reviews yet. Be the first to share your experience!
                    </p>
                  ) : (
                    listing.reviews.map((rev) => (
                      <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{rev.author}</span>
                          <span className="text-[11px] text-slate-400">{rev.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Direct Merchant Contact / Inquiry (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div>
                <span className="text-[11px] font-extrabold text-[#176AC4] uppercase tracking-wider">
                  Direct Merchant Message
                </span>
                <h3 className="text-base font-extrabold text-slate-900 font-heading mt-0.5">
                  Send Enquiry to {listing.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Have a question about pricing, availability, or appointment bookings?
                </p>
              </div>

              {enquirySuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl text-center">
                  Enquiry sent! The business owner has been notified.
                </div>
              )}

              {enquiryError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl text-center">
                  {enquiryError}
                </div>
              )}

              <form onSubmit={handleEnquirySubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={enquiryName}
                    onChange={(e) => setEnquiryName(e.target.value)}
                    placeholder="e.g. Ramesh"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#176AC4]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={enquiryPhone}
                    onChange={(e) => setEnquiryPhone(e.target.value)}
                    placeholder="e.g. 94432 11223"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#176AC4]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Message *</label>
                  <textarea
                    required
                    rows={3}
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    placeholder="Enter your requirement or query..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#176AC4]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isEnquirySubmitting}
                  className="w-full py-2.5 bg-[#176AC4] hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isEnquirySubmitting ? 'Sending...' : 'Send Inquiry'}</span>
                </button>
              </form>
            </div>

            {/* Merchant Verification Badge Box */}
            <div className="bg-slate-100 rounded-3xl p-5 border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-[#15995F]" />
                <span>Verified by {currentCity.brandName}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Listed in {currentCity.name} ({currentCity.code}). Contact details and locality verified for direct customer convenience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={lightboxPhoto}
            alt="Full size view"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl"
          />
        </div>
      )}
    </div>
  );
};

