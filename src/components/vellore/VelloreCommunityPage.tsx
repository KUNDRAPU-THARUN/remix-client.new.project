import React, { useState, useEffect } from 'react';
import { CityConfig } from '../../types';
import { CommunityNotice, NoticeCategory } from '../../types/community';
import { communityService } from '../../services/communityService';
import { NoticeSubmissionModal } from './NoticeSubmissionModal';
import {
  Bell,
  Search,
  Filter,
  PlusCircle,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  ChevronRight,
  X,
  Share2,
  Check,
  AlertTriangle,
  Pin,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface VelloreCommunityPageProps {
  currentCity: CityConfig;
  activeNoticeId?: string | null;
  onNavigateHome: () => void;
  onSelectNotice: (id: string | null) => void;
  onOpenEmergency?: () => void;
}

const CATEGORIES: { id: NoticeCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Notices' },
  { id: 'community', label: 'Community' },
  { id: 'public_notice', label: 'Public Notices' },
  { id: 'education', label: 'Education' },
  { id: 'jobs', label: 'Local Jobs' },
  { id: 'lost_found', label: 'Lost & Found' },
  { id: 'other', label: 'Other' },
];

export const VelloreCommunityPage: React.FC<VelloreCommunityPageProps> = ({
  currentCity,
  activeNoticeId,
  onNavigateHome,
  onSelectNotice,
}) => {
  const [notices, setNotices] = useState<CommunityNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NoticeCategory | 'all'>('all');
  const [selectedLocality, setSelectedLocality] = useState<string>('all');
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load notices
  const loadNotices = async () => {
    setLoading(true);
    const data = await communityService.getNotices(currentCity.id, {
      category: selectedCategory,
      locality: selectedLocality,
      searchQuery,
    });
    setNotices(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNotices();
  }, [currentCity.id, selectedCategory, selectedLocality, searchQuery]);

  // Keyboard accessibility: close detail modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSelectNotice(null);
      }
    };
    if (activeNoticeId) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeNoticeId, onSelectNotice]);

  // Active notice modal details
  const activeNotice = activeNoticeId ? notices.find((n) => n.id === activeNoticeId) : null;

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/city/${currentCity.id}/community/${id}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatDateIST = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const getCategoryBadgeClass = (cat: NoticeCategory) => {
    switch (cat) {
      case 'public_notice':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'education':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'jobs':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'lost_found':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      {/* Top Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500">
            <button
              onClick={onNavigateHome}
              className="hover:text-blue-600 transition cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <button
              onClick={onNavigateHome}
              className="hover:text-blue-600 transition cursor-pointer capitalize"
            >
              {currentCity.name}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-800">Community Noticeboard</span>
          </nav>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-10 px-4 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xs rounded-full text-xs font-semibold text-blue-100 border border-white/15">
              <Bell className="w-3.5 h-3.5 text-blue-300" />
              <span>Vellore District Community Hub (TN-23)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Vellore Community Noticeboard
            </h1>
            <p className="text-blue-100/90 text-sm max-w-2xl">
              Local civic announcements, resident welfare updates, student forums, blood donation camps, and non-commercial community notices across Vellore.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsSubmitOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-900 font-bold text-sm rounded-xl hover:bg-blue-50 transition shadow-lg shadow-black/10 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>Post a Notice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notices by keyword, title, organizer..."
                className="w-full pl-10 pr-4 py-2.5 min-h-[44px] border border-gray-200 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Locality Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <MapPin className="w-4 h-4 text-gray-400 hidden sm:block" />
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 min-h-[44px] border border-gray-200 rounded-xl text-base sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="all">All Localities</option>
                {currentCity.localities
                  .filter((l) => l.id !== 'all')
                  .map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none flex-nowrap" style={{ WebkitOverflowScrolling: 'touch' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 min-h-[36px] shrink-0 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-xs text-gray-500">Loading notices...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No Notices Found</h3>
            <p className="text-xs text-gray-500 mb-6">
              No published community notices match your search or filter criteria.
            </p>
            <div className="flex justify-center gap-3">
              {(searchQuery || selectedCategory !== 'all' || selectedLocality !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedLocality('all');
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
              <button
                onClick={() => setIsSubmitOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
              >
                Post the First Notice
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notices.map((notice) => (
              <article
                key={notice.id}
                className="bg-white rounded-2xl border border-gray-200/90 hover:border-blue-300 transition shadow-xs hover:shadow-md flex flex-col p-5 group"
              >
                {/* Header tags: Priority & Category */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {notice.priority === 'pinned' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[11px] font-bold rounded-md">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                    {notice.priority === 'urgent' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-md">
                        <AlertTriangle className="w-3 h-3" /> Urgent
                      </span>
                    )}
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-md border ${getCategoryBadgeClass(
                        notice.category
                      )}`}
                    >
                      {notice.category.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    {formatDateIST(notice.publishDate)}
                  </span>
                </div>

                {/* Title */}
                <h3
                  onClick={() => onSelectNotice(notice.id)}
                  className="font-bold text-gray-900 group-hover:text-blue-600 transition text-base mb-2 cursor-pointer line-clamp-2"
                >
                  {notice.title}
                </h3>

                {/* Content snippet */}
                <p className="text-gray-600 text-xs leading-relaxed line-clamp-3 mb-4 flex-1">
                  {notice.content}
                </p>

                {/* Locality & Organizer */}
                <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{notice.locality}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate font-medium text-gray-700">
                      {notice.organizerName}
                    </span>
                  </div>
                </div>

                {/* Card Action */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => onSelectNotice(notice.id)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read Full Notice</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleCopyLink(notice.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    title="Share notice"
                    aria-label="Share notice"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Civic Safety & Policy Footer Banner */}
        <div className="mt-12 bg-blue-50/60 border border-blue-200/80 rounded-2xl p-6 text-xs text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-blue-900 mb-0.5">
                Vellore Community Moderation Policy
              </p>
              <p className="text-blue-800/90 leading-relaxed">
                All notices are reviewed by the Vellore local franchise moderation desk before publication. To report an inaccurate notice or request retraction, email support@velloreads.com or call +91 81899 85559.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shrink-0 cursor-pointer"
          >
            Post Notice
          </button>
        </div>
      </div>

      {/* Modal: Full Notice Detail View */}
      {activeNotice && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-notice-title"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => onSelectNotice(null)}
              className="absolute top-3.5 right-3.5 p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition cursor-pointer"
              aria-label="Close detail"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {activeNotice.priority === 'pinned' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-md">
                    <Pin className="w-3.5 h-3.5" /> Pinned Announcement
                  </span>
                )}
                {activeNotice.priority === 'urgent' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-100 text-rose-800 text-xs font-bold rounded-md">
                    <AlertTriangle className="w-3.5 h-3.5" /> Urgent Notice
                  </span>
                )}
                <span
                  className={`inline-block px-3 py-0.5 text-xs font-semibold rounded-md border ${getCategoryBadgeClass(
                    activeNotice.category
                  )}`}
                >
                  {activeNotice.category.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs text-gray-500 ml-auto">
                  Published: {formatDateIST(activeNotice.publishDate)}
                </span>
              </div>

              <h2 id="detail-notice-title" className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                {activeNotice.title}
              </h2>

              <div className="flex items-center gap-4 text-xs text-gray-500 py-2 border-y border-gray-100 flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-700">{activeNotice.locality}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-700">{activeNotice.organizerName}</span>
                </div>
                {activeNotice.expiryDate && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Valid until: {formatDateIST(activeNotice.expiryDate)}</span>
                  </div>
                )}
              </div>

              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed py-2">
                {activeNotice.content}
              </div>

              {/* Contact Information (Only if showContact === true) */}
              {activeNotice.showContact && (activeNotice.contactPhone || activeNotice.contactEmail) && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2 mt-4">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                    Contact & Inquiries
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-3 text-xs text-gray-700">
                    {activeNotice.contactPhone && (
                      <a
                        href={`tel:${activeNotice.contactPhone}`}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:underline font-semibold"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{activeNotice.contactPhone}</span>
                      </a>
                    )}
                    {activeNotice.contactEmail && (
                      <a
                        href={`mailto:${activeNotice.contactEmail}`}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:underline font-semibold"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{activeNotice.contactEmail}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                <button
                  onClick={() => handleCopyLink(activeNotice.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Notice</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onSelectNotice(null)}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Modal */}
      <NoticeSubmissionModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        currentCity={currentCity}
        onNoticeSubmitted={() => {
          loadNotices();
        }}
      />
    </div>
  );
};
