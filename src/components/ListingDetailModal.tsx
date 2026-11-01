import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Star,
  MapPin,
  Phone,
  MessageSquare,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Share2,
  Bookmark,
  Send,
  User,
  Mail,
  Smartphone,
  Upload,
  ThumbsUp,
  ThumbsDown,
  CornerDownRight,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Compass,
  RotateCw,
  Maximize2,
  Check,
  AlertCircle,
  Wrench,
  Info
} from 'lucide-react';
import { Listing, Review } from '../types';
import { CHITTOOR_AREAS } from '../data/mockData';
import { enquiryService } from '../services/enquiryService';

interface ListingDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onAddReview: (listingId: string, review: Omit<Review, 'id' | 'date'>) => void;
}

type SubTab = 'about' | 'services' | 'gallery' | 'view360' | 'write-review' | 'reviews';

const RATING_LABELS: Record<number, string> = {
  1: 'Poor (1.0)',
  2: 'Fair (2.0)',
  3: 'Good (3.0)',
  4: 'Very Good (4.0)',
  5: 'Excellent (5.0)',
};

export const ListingDetailModal: React.FC<ListingDetailModalProps> = (props) => {
  if (!props.listing) return null;
  return <ListingDetailContent {...props} listing={props.listing} key={props.listing.id} />;
};

// Mount the stateful content only for a real listing; switching listings resets its form/gallery.
const ListingDetailContent: React.FC<Omit<ListingDetailModalProps, 'listing'> & { listing: Listing }> = ({
  listing,
  onClose,
  isSaved,
  onToggleSave,
  onAddReview,
}) => {
  const [activeTab, setActiveTab] = useState<SubTab>('about');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  // 360 View interactive state
  const [pan360, setPan360] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  // Write Review Form State
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [serviceQuality, setServiceQuality] = useState<number>(5);
  const [valueForMoney, setValueForMoney] = useState<number>(5);
  const [cleanliness, setCleanliness] = useState<number>(5);
  const [authorName, setAuthorName] = useState('');
  const [userMobile, setUserMobile] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const [certifiedExperience, setCertifiedExperience] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Reviews Feed Filter & Sorting State
  const [reviewSort, setReviewSort] = useState<'recent' | 'highest' | 'lowest' | 'photos'>('recent');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, { yes: number; no: number; userVote?: 'yes' | 'no' }>>({});
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const schedule = (callback: () => void, delay: number) => {
    timers.current.push(setTimeout(callback, delay));
  };

  const areaName = CHITTOOR_AREAS.find((a) => a.id === listing.area)?.name || listing.area;

  // Direct contact handlers
  const handleCall = () => {
    window.location.href = `tel:${listing.phone.replace(/\s+/g, '')}`;
  };

  // Customer Enquiry Dialog State
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryEmail, setEnquiryEmail] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [isEnquirySubmitting, setIsEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryError, setEnquiryError] = useState('');

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEnquirySubmitting(true);
    setEnquiryError('');
    const res = await enquiryService.submitEnquiry({
      businessId: listing.id,
      businessName: listing.title,
      cityId: listing.cityId || 'chittoor',
      customerName: enquiryName,
      customerPhone: enquiryPhone,
      customerEmail: enquiryEmail || undefined,
      message: enquiryMessage,
    });
    setIsEnquirySubmitting(false);
    if (res.error) {
      setEnquiryError(res.error);
    } else {
      setEnquirySuccess(true);
      setEnquiryName('');
      setEnquiryPhone('');
      setEnquiryEmail('');
      setEnquiryMessage('');
    }
  };

  const handleWhatsApp = () => {
    const phone = listing.whatsapp || listing.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello! I found your listing "${listing.title}" on ChittoorAds (AP-03 local directory). I'd like more details.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleShare = async (textToShare?: string) => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(textToShare || window.location.href);
      setCopiedLink(true);
      schedule(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.warn('Could not copy listing:', error);
      alert('Could not copy the link. Please copy the address from your browser.');
    }
  };

  // Photo Attachment Dropzone
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (!['image/jpeg', 'image/png'].includes(files[0].type) || files[0].size > 10 * 1024 * 1024) {
        alert('Please choose a PNG or JPG image up to 10 MB.');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.onerror = () => alert('Could not read this image. Please try another file.');
      reader.readAsDataURL(files[0]);
    }
  };

  const handleAddSamplePhoto = (sampleUrl: string) => {
    setAttachedPhotos((prev) => [...prev, sampleUrl]);
  };

  const handleRemovePhoto = (idx: number) => {
    setAttachedPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit review form
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!authorName.trim() || !reviewComment.trim()) return;
    if (!certifiedExperience) {
      alert('Please certify that this review is based on your genuine local experience.');
      return;
    }

    setIsSubmitting(true);
    schedule(() => {
      onAddReview(listing.id, {
        author: authorName.trim(),
        title: reviewTitle.trim() || undefined,
        rating,
        comment: reviewComment.trim(),
        verifiedPurchase: false, // In Phase 2A prototype, reviews cannot claim verified customer status without backend gateway evidence
        subRatings: {
          serviceQuality,
          valueForMoney,
          cleanliness,
        },
        photos: attachedPhotos.length > 0 ? attachedPhotos : undefined,
        helpfulCount: 0,
        unhelpfulCount: 0,
      });

      setIsSubmitting(false);
      setShowSuccessToast(true);
      // Reset form
      setAuthorName('');
      setUserMobile('');
      setUserEmail('');
      setReviewTitle('');
      setReviewComment('');
      setAttachedPhotos([]);

      // Switch to reviews feed to view submitted review
      schedule(() => {
        setShowSuccessToast(false);
        setActiveTab('reviews');
      }, 1200);
    }, 600);
  };

  // Helpful vote toggle
  const handleVote = (revId: string, type: 'yes' | 'no') => {
    setHelpfulVotes((prev) => {
      const review = listing.reviews.find((review) => review.id === revId);
      const existing = prev[revId] || { yes: review?.helpfulCount ?? 12, no: review?.unhelpfulCount ?? 1 };
      if (existing.userVote === type) {
        return {
          ...prev,
          [revId]: {
            ...existing,
            [type]: Math.max(0, existing[type] - 1),
            userVote: undefined,
          },
        };
      }
      return {
        ...prev,
        [revId]: {
          yes: type === 'yes' ? existing.yes + 1 : existing.userVote === 'yes' ? Math.max(0, existing.yes - 1) : existing.yes,
          no: type === 'no' ? existing.no + 1 : existing.userVote === 'no' ? Math.max(0, existing.no - 1) : existing.no,
          userVote: type,
        },
      };
    });
  };

  // Compute rating breakdown percentages
  const ratingBreakdown = useMemo(() => {
    const total = listing.reviews.length || 1;
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    listing.reviews.forEach((r) => {
      const score = Math.round(r.rating);
      if (score >= 5) counts[5]++;
      else if (score === 4) counts[4]++;
      else if (score === 3) counts[3]++;
      else if (score === 2) counts[2]++;
      else counts[1]++;
    });

    return {
      5: Math.round((counts[5] / total) * 100),
      4: Math.round((counts[4] / total) * 100),
      3: Math.round((counts[3] / total) * 100),
      2: Math.round((counts[2] / total) * 100),
      1: Math.round((counts[1] / total) * 100),
      counts,
    };
  }, [listing.reviews]);

  // Filter & Sort reviews
  const sortedReviews = useMemo(() => {
    let list = [...listing.reviews];
    if (reviewSort === 'photos') {
      list = list.filter((r) => r.photos && r.photos.length > 0);
    } else if (reviewSort === 'highest') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (reviewSort === 'lowest') {
      list.sort((a, b) => a.rating - b.rating);
    } else {
      // most recent
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return list;
  }, [listing.reviews, reviewSort]);

  const currentStarLabel = RATING_LABELS[hoverRating ?? rating] || 'Select Rating';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col border border-slate-200">
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Chittoor Verified
            </span>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              {areaName}
            </span>
            {listing.badge && (
              <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full hidden sm:inline">
                {listing.badge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleShare()}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
              title="Share listing link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleSave(listing.id)}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title={isSaved ? 'Remove from saved' : 'Save business'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-red-600 text-red-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero Title & Direct Call Banner */}
        <div className="px-5 sm:px-6 pt-4 pb-2 border-b border-slate-100 bg-white shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 font-heading">
                {listing.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-600">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{listing.rating.toFixed(1)} / 5</span>
                  <span className="text-amber-700 font-medium">({listing.reviewsCount} reviews)</span>
                </div>
                <span className="text-slate-500">{listing.address}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setIsEnquiryOpen(true);
                  setEnquirySuccess(false);
                  setEnquiryError('');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition cursor-pointer"
                title="Send Enquiry to Business"
              >
                <Send className="w-4 h-4" />
                <span>Enquire</span>
              </button>
              <button
                onClick={handleCall}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call</span>
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Clean Pill Style Sub-Tabs Bar */}
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 no-scrollbar">
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>👤</span>
              <span>About</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>⚙️</span>
              <span>Services</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>🖼️</span>
              <span>Gallery</span>
            </button>

            <button
              onClick={() => setActiveTab('view360')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'view360'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>🌐</span>
              <span>360 View</span>
            </button>

            <button
              onClick={() => setActiveTab('write-review')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'write-review'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>📝</span>
              <span>Write Review</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>⭐</span>
              <span>User Reviews ({listing.rating.toFixed(1)}/5)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Tab Content Container */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          {copiedLink && (
            <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-4 py-2 rounded-lg border border-emerald-200 text-center animate-fade-in">
              Listing link copied to clipboard!
            </div>
          )}

          {/* 1. ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              {/* Photo Banner */}
              <div className="h-60 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-100 relative shadow-xs">
                <img
                  src={listing.images[activeImageIdx] || listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <div>
                    <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-md">
                      Verified AP-03 Listing
                    </span>
                    <p className="text-sm font-semibold mt-1">{listing.timings}</p>
                  </div>
                  {listing.priceRange && (
                    <span className="text-sm font-bold bg-red-600 px-3 py-1 rounded-xl">
                      {listing.priceRange}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <h4 className="text-base font-bold text-slate-900 mb-2 font-heading flex items-center gap-2">
                  <Info className="w-4 h-4 text-red-600" />
                  <span>Business Overview</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Quick Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Exact Address & Landmark
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{listing.address}</span>
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Working Hours
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{listing.timings}</span>
                  </p>
                </div>
              </div>

              {/* Action Prompt to write review */}
              <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <h5 className="font-bold text-sm text-red-900">Have you visited this place?</h5>
                  <p className="text-xs text-red-700">Share your experience to help fellow citizens in Chittoor.</p>
                </div>
                <button
                  onClick={() => setActiveTab('write-review')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer shrink-0"
                >
                  Write Review
                </button>
              </div>
            </div>
          )}

          {/* 2. SERVICES TAB */}
          {activeTab === 'services' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h4 className="text-lg font-bold text-slate-900 font-heading">
                  Verified Services & Capabilities
                </h4>
                <p className="text-xs text-slate-500">
                  Services offered with direct local booking and inquiry in Chittoor
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {listing.services.map((service, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs sm:text-sm text-slate-800 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500">Need a custom quote or service inquiry?</span>
                <button
                  onClick={handleWhatsApp}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Inquire via WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. GALLERY TAB */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-900 relative shadow-md">
                <img
                  src={listing.images[activeImageIdx] || listing.images[0]}
                  alt="Gallery large"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => setLightboxPhoto(listing.images[activeImageIdx] || listing.images[0])}
                  className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/80 text-white rounded-lg backdrop-blur-xs transition"
                  title="Expand Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {listing.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`h-20 sm:h-24 rounded-xl overflow-hidden border-2 transition ${
                      activeImageIdx === i ? 'border-red-600 scale-95 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. 360 VIEW TAB */}
          {activeTab === 'view360' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
                    <Compass className="w-5 h-5 text-red-600" />
                    <span>360° Interactive Virtual Tour</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Drag or click pan controls to explore {listing.title} in full panoramic view
                  </p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-full border border-slate-200">
                  Heading: {Math.abs(pan360 % 360)}°
                </span>
              </div>

              {/* 360 Viewer Canvas */}
              <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-300 select-none cursor-grab active:cursor-grabbing">
                <div
                  className="w-full h-full transition-transform duration-300"
                  style={{
                    backgroundImage: `url(${listing.images[0]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: `${pan360}% center`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                {/* Hotspot Markers */}
                <div className="absolute top-1/3 left-1/4 bg-white/90 text-slate-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg border border-red-500 flex items-center gap-1 animate-bounce">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  <span>Main Entrance & Reception</span>
                </div>
                <div className="absolute top-1/2 right-1/4 bg-white/90 text-slate-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg border border-emerald-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Customer Lounge & Facility</span>
                </div>

                {/* Virtual Compass Overlay */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>Interactive 360 Mode Active</span>
                </div>

                {/* Bottom Pan Controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 backdrop-blur-md p-1.5 rounded-full border border-white/20">
                  <button
                    onClick={() => setPan360((prev) => prev - 25)}
                    className="px-3 py-1 text-xs text-white hover:bg-white/20 rounded-full font-bold transition"
                  >
                    ← Rotate Left
                  </button>
                  <button
                    onClick={() => setPan360(0)}
                    className="px-2.5 py-1 text-xs text-amber-300 hover:bg-white/20 rounded-full font-bold transition"
                  >
                    Reset View
                  </button>
                  <button
                    onClick={() => setPan360((prev) => prev + 25)}
                    className="px-3 py-1 text-xs text-white hover:bg-white/20 rounded-full font-bold transition"
                  >
                    Rotate Right →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. WRITE REVIEW TAB (Upgraded Form Panel) */}
          {activeTab === 'write-review' && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="border-b border-slate-100 pb-4 mb-5">
                <h3 className="text-xl font-bold text-slate-900 font-heading">
                  Write Your Review for {listing.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your feedback helps local residents of Chittoor make informed decisions.
                </p>
              </div>

              {showSuccessToast && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Review submitted successfully! Loading user reviews feed...</span>
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-6">
                {/* 1. Overall Star Rating with Hover Feedback */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Overall Experience Rating *
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= (hoverRating ?? rating);
                        return (
                          <button
                            type="button"
                            key={star}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            onClick={() => setRating(star)}
                            className="p-1 focus:outline-hidden transition-transform hover:scale-125 cursor-pointer"
                            title={`${star} Star`}
                          >
                            <Star
                              className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                                isFilled
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300 hover:text-amber-200'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-sm font-bold text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-200">
                      {currentStarLabel}
                    </span>
                  </div>
                </div>

                {/* 2. Rating Criteria Breakdown (Sub-Ratings) */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
                    Detailed Criteria Breakdown (Sub-Ratings)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Service Quality */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Service Quality</span>
                        <span className="text-amber-600 font-bold">{serviceQuality} ★</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={serviceQuality}
                        onChange={(e) => setServiceQuality(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Value for Money */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Value for Money</span>
                        <span className="text-amber-600 font-bold">{valueForMoney} ★</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={valueForMoney}
                        onChange={(e) => setValueForMoney(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Cleanliness / Behavior */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Behavior & Cleanliness</span>
                        <span className="text-amber-600 font-bold">{cleanliness} ★</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={cleanliness}
                        onChange={(e) => setCleanliness(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Structured 2-Column Grid Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Full Name *
                    </label>
                    <div className="flex items-center px-3 rounded-xl border border-slate-200 focus-within:border-red-500 bg-white">
                      <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        required
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="e.g. Ramesh Naidu"
                        className="w-full py-2.5 text-xs sm:text-sm outline-hidden font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Mobile Number (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Mobile Number (Optional)
                    </label>
                    <div className="flex items-center px-3 rounded-xl border border-slate-200 focus-within:border-red-500 bg-white">
                      <Smartphone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="tel"
                        value={userMobile}
                        onChange={(e) => setUserMobile(e.target.value)}
                        placeholder="e.g. 9440212345"
                        className="w-full py-2.5 text-xs sm:text-sm outline-hidden font-medium text-slate-900"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Note: Live SMS OTP verification is disabled in demo mode. All community reviews are submitted without unearned verification badges.
                    </p>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center px-3 rounded-xl border border-slate-200 focus-within:border-red-500 bg-white">
                      <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="e.g. ramesh@example.com"
                        className="w-full py-2.5 text-xs sm:text-sm outline-hidden font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Review Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Review Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Great experience & prompt service in Chittoor!"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-red-500 outline-hidden font-medium bg-white"
                    />
                  </div>
                </div>

                {/* Write Review Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Your Detailed Review *
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {reviewComment.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe your customer experience: punctuality, pricing, service quality, staff behavior..."
                    className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-red-500 outline-hidden font-normal bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tip: Honest, detailed reviews with specific service mentions receive the most helpful votes.
                  </p>
                </div>

                {/* Photo & Video Attachment Dropzone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Attach Photos of Your Experience (Optional)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-red-400 rounded-2xl p-4 text-center bg-slate-50 transition cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-700">
                      📷 Add photos or videos of your experience (PNG, JPG up to 10MB)
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Drag and drop here, or click to browse files
                    </p>
                  </div>

                  {/* Sample Quick Attachments */}
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                    <span>Quick Sample Photos:</span>
                    <button
                      type="button"
                      onClick={() => handleAddSamplePhoto('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80')}
                      className="text-red-600 hover:underline font-medium"
                    >
                      + Facility Photo
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => handleAddSamplePhoto('https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80')}
                      className="text-red-600 hover:underline font-medium"
                    >
                      + Counter/Bill Photo
                    </button>
                  </div>

                  {/* Attached Photos Preview */}
                  {attachedPhotos.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {attachedPhotos.map((photo, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                          <img src={photo} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black/80"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Verified Visit Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="certify"
                    checked={certifiedExperience}
                    onChange={(e) => setCertifiedExperience(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 accent-red-600 cursor-pointer"
                  />
                  <label htmlFor="certify" className="text-xs text-slate-700 cursor-pointer font-medium">
                    ☑️ I certify that this review is based on my genuine local experience in Chittoor.
                  </label>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-50 text-white font-extrabold text-sm sm:text-base tracking-wide transition shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Submitting Your Review...</span>
                    </>
                  ) : (
                    <span>SUBMIT REVIEW →</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* 6. USER REVIEWS TAB (Upgraded Feed Section) */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Overall Rating Summary Card */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-6">
                {/* Left: Big Rating Score */}
                <div className="text-center md:border-r md:border-slate-200 md:pr-8 shrink-0">
                  <span className="text-5xl sm:text-6xl font-black text-slate-900 font-heading">
                    {listing.rating.toFixed(1)}
                  </span>
                  <div className="flex items-center justify-center gap-1 my-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(listing.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">
                    Based on {listing.reviewsCount} verified reviews
                  </p>
                  <button
                    onClick={() => setActiveTab('write-review')}
                    className="mt-3 text-xs bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg border border-red-200 transition"
                  >
                    + Write a Review
                  </button>
                </div>

                {/* Right: Star Breakdown Progress Bars */}
                <div className="flex-1 w-full space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const pct = (ratingBreakdown as any)[stars] || 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs">
                        <span className="w-8 font-semibold text-slate-600">{stars} ★</span>
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-slate-400 font-medium">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Filter & Sort Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div>
                  <h4 className="text-base font-bold text-slate-900 font-heading">
                    Customer Experience Feed ({sortedReviews.length})
                  </h4>
                  <p className="text-xs text-slate-500">Genuine feedback from verified visitors</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold">Sort by:</span>
                  <select
                    value={reviewSort}
                    onChange={(e) => setReviewSort(e.target.value as any)}
                    className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 outline-hidden cursor-pointer"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                    <option value="photos">With Photos Only</option>
                  </select>
                </div>
              </div>

              {/* Individual Review Cards Feed */}
              {sortedReviews.length > 0 ? (
                <div className="space-y-4">
                  {sortedReviews.map((rev) => {
                    const votes = helpfulVotes[rev.id] || {
                      yes: rev.helpfulCount ?? 12,
                      no: rev.unhelpfulCount ?? 1,
                    };

                    return (
                      <div
                        key={rev.id}
                        className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3"
                      >
                        {/* Header: User Avatar & Verified Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-sm shadow-2xs">
                              {rev.author.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-slate-900">{rev.author}</span>
                                {rev.verifiedPurchase && (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Verified Customer
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400">{rev.date}</span>
                            </div>
                          </div>

                          {/* Score Badge */}
                          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 font-bold px-2.5 py-1 rounded-xl text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{rev.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Review Title & Body */}
                        <div>
                          {rev.title && (
                            <h5 className="font-bold text-sm text-slate-900 mb-1">
                              "{rev.title}"
                            </h5>
                          )}
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                            {rev.comment}
                          </p>
                        </div>

                        {/* Criteria Sub-Rating Pills */}
                        {rev.subRatings && (
                          <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              Service: <strong className="text-amber-600">{rev.subRatings.serviceQuality}★</strong>
                            </span>
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              Value: <strong className="text-amber-600">{rev.subRatings.valueForMoney}★</strong>
                            </span>
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              Cleanliness: <strong className="text-amber-600">{rev.subRatings.cleanliness}★</strong>
                            </span>
                          </div>
                        )}

                        {/* Attached Photos Gallery */}
                        {rev.photos && rev.photos.length > 0 && (
                          <div className="pt-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                              Attached Photos:
                            </span>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {rev.photos.map((photo, i) => (
                                <button
                                  key={i}
                                  onClick={() => setLightboxPhoto(photo)}
                                  className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 transition shrink-0 cursor-pointer shadow-2xs"
                                >
                                  <img src={photo} alt="" className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Helpful Counter & Interactions */}
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Was this review helpful?</span>
                            <button
                              onClick={() => handleVote(rev.id, 'yes')}
                              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 font-semibold transition ${
                                votes.userVote === 'yes'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>Yes ({votes.yes})</span>
                            </button>
                            <button
                              onClick={() => handleVote(rev.id, 'no')}
                              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 font-semibold transition ${
                                votes.userVote === 'no'
                                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                              <span>No ({votes.no})</span>
                            </button>
                          </div>

                          <button
                            onClick={() => handleShare(`${rev.author}'s review of ${listing.title}`)}
                            className="hover:text-slate-800 flex items-center gap-1 font-medium"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Share</span>
                          </button>
                        </div>

                        {/* Business Owner Response Box */}
                        {rev.ownerResponse && (
                          <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                <CornerDownRight className="w-3.5 h-3.5 text-red-600" />
                                <span>Response from Business Owner ({rev.ownerResponse.responder})</span>
                              </span>
                              <span className="text-[11px] text-slate-400">{rev.ownerResponse.date}</span>
                            </div>
                            <p className="text-xs text-slate-600 pl-5 leading-relaxed">
                              {rev.ownerResponse.text}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                  <p className="text-sm font-semibold text-slate-700">No reviews matching the filter.</p>
                  <button
                    onClick={() => setReviewSort('recent')}
                    className="mt-2 text-xs text-red-600 font-bold hover:underline"
                  >
                    View all reviews
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Customer Enquiry Modal Dialog */}
      {isEnquiryOpen && (
        <div
          onClick={() => setIsEnquiryOpen(false)}
          className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm font-heading">Direct Customer Enquiry</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{listing.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEnquiryOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              {enquirySuccess ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-base text-slate-900">Enquiry Sent Successfully!</h5>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                    Your enquiry has been securely submitted directly to the verified business owner of <strong>{listing.title}</strong>. They will contact you shortly.
                  </p>
                  <button
                    onClick={() => setIsEnquiryOpen(false)}
                    className="mt-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-3">
                  {enquiryError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                      {enquiryError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Your Full Name *
                    </label>
                    <div className="flex items-center px-3 py-2 rounded-xl border border-slate-200 focus-within:border-red-500 bg-slate-50 focus-within:bg-white transition">
                      <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        required
                        value={enquiryName}
                        onChange={(e) => setEnquiryName(e.target.value)}
                        placeholder="e.g. Anand Kumar"
                        className="w-full text-xs font-medium text-slate-900 outline-hidden bg-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Mobile / WhatsApp Number *
                    </label>
                    <div className="flex items-center px-3 py-2 rounded-xl border border-slate-200 focus-within:border-red-500 bg-slate-50 focus-within:bg-white transition">
                      <Smartphone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="tel"
                        required
                        value={enquiryPhone}
                        onChange={(e) => setEnquiryPhone(e.target.value)}
                        placeholder="e.g. 98480 12345"
                        className="w-full text-xs font-medium text-slate-900 outline-hidden bg-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Email Address (Optional)
                    </label>
                    <div className="flex items-center px-3 py-2 rounded-xl border border-slate-200 focus-within:border-red-500 bg-slate-50 focus-within:bg-white transition">
                      <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="email"
                        value={enquiryEmail}
                        onChange={(e) => setEnquiryEmail(e.target.value)}
                        placeholder="e.g. anand@gmail.com"
                        className="w-full text-xs font-medium text-slate-900 outline-hidden bg-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Your Message / Service Request *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={enquiryMessage}
                      onChange={(e) => setEnquiryMessage(e.target.value)}
                      placeholder="Describe what services or details you require from this business..."
                      className="w-full p-2.5 text-xs font-medium text-slate-900 rounded-xl border border-slate-200 focus:border-red-500 outline-hidden bg-slate-50 focus:bg-white transition resize-none"
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isEnquirySubmitting}
                      className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isEnquirySubmitting ? (
                        <span>Sending Enquiry...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Enquiry Directly</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center pt-1">
                    Your contact information will only be shared with this verified merchant.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Full Photo View */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxPhoto} alt="Full view" className="w-full h-auto max-h-[85vh] object-contain rounded-2xl" />
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black/90 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
