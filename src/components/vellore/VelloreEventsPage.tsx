import React, { useState, useEffect } from 'react';
import { CityConfig } from '../../types';
import { LocalEvent, EventCategory } from '../../types/community';
import { communityService } from '../../services/communityService';
import { EventSubmissionModal } from './EventSubmissionModal';
import {
  Calendar,
  Search,
  MapPin,
  Clock,
  User,
  PlusCircle,
  ChevronRight,
  X,
  Share2,
  Check,
  ExternalLink,
  Tag,
  ShieldCheck,
  Ticket,
  CalendarDays,
} from 'lucide-react';

interface VelloreEventsPageProps {
  currentCity: CityConfig;
  activeEventId?: string | null;
  onNavigateHome: () => void;
  onSelectEvent: (id: string | null) => void;
  onOpenEmergency?: () => void;
}

const EVENT_CATEGORIES: { id: EventCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Categories' },
  { id: 'cultural', label: 'Cultural & Music' },
  { id: 'education', label: 'Education & Tech' },
  { id: 'business', label: 'Business & Expo' },
  { id: 'sports', label: 'Sports' },
  { id: 'entertainment', label: 'Entertainment' },
];

export const VelloreEventsPage: React.FC<VelloreEventsPageProps> = ({
  currentCity,
  activeEventId,
  onNavigateHome,
  onSelectEvent,
}) => {
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<'upcoming' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [selectedLocality, setSelectedLocality] = useState<string>('all');
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    const data = await communityService.getEvents(currentCity.id, {
      timeline,
      category: selectedCategory,
      locality: selectedLocality,
      searchQuery,
    });
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, [currentCity.id, timeline, selectedCategory, selectedLocality, searchQuery]);

  const activeEvent = activeEventId ? events.find((e) => e.id === activeEventId) : null;

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/city/${currentCity.id}/events/${id}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatEventDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const day = date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit' });
      const month = date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short' });
      const year = date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric' });
      const weekday = date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short' });
      return { day, month, year, weekday };
    } catch {
      return { day: '01', month: 'Nov', year: '2026', weekday: 'Sat' };
    }
  };

  const getCategoryClass = (cat: EventCategory) => {
    switch (cat) {
      case 'cultural':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'education':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'business':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'sports':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-pink-50 text-pink-700 border-pink-200';
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
            <span className="font-semibold text-gray-800">Local Events</span>
          </nav>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-10 px-4 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xs rounded-full text-xs font-semibold text-blue-100 border border-white/15">
              <CalendarDays className="w-3.5 h-3.5 text-blue-300" />
              <span>Vellore District Events Calendar (TN-23)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Vellore Local Events & Happenings
            </h1>
            <p className="text-blue-100/90 text-sm max-w-2xl">
              Discover academic symposiums, classical concerts, youth sports championships, exhibitions, and community festivals across Vellore.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsSubmitOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-900 font-bold text-sm rounded-xl hover:bg-blue-50 transition shadow-lg shadow-black/10 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>Submit an Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Upcoming vs Past Toggle Tabs */}
            <div className="inline-flex bg-gray-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setTimeline('upcoming')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  timeline === 'upcoming'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Upcoming Events
              </button>
              <button
                onClick={() => setTimeline('past')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  timeline === 'past'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Past Events Archive
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by title, venue, organizer..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Locality Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <MapPin className="w-4 h-4 text-gray-400 hidden sm:block" />
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {EVENT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
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

      {/* Main Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-xs text-gray-500">Loading events calendar...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              No {timeline === 'upcoming' ? 'Upcoming' : 'Past'} Events Found
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              There are no events matching your current filter selections in Vellore.
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
                Submit an Event
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => {
              const { day, month, year, weekday } = formatEventDate(evt.startDate);
              return (
                <article
                  key={evt.id}
                  className="bg-white rounded-2xl border border-gray-200/90 hover:border-blue-300 transition shadow-xs hover:shadow-md flex flex-col p-5 group"
                >
                  {/* Top Bar: Date Card & Category Badge */}
                  <div className="flex items-start gap-4 mb-3">
                    {/* Compact Date Box */}
                    <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-2 text-center min-w-[56px] shrink-0">
                      <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                        {month}
                      </span>
                      <span className="block text-xl font-extrabold text-blue-900 leading-tight">
                        {day}
                      </span>
                      <span className="block text-[9px] font-medium text-blue-500">
                        {weekday}
                      </span>
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md border ${getCategoryClass(
                            evt.category
                          )}`}
                        >
                          {evt.category.toUpperCase()}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <Ticket className="w-3 h-3" />
                          {evt.isFree ? 'Free Entry' : 'Ticketed'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-gray-500">
                        <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">{evt.timeDisplay}</span>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => onSelectEvent(evt.id)}
                    className="font-bold text-gray-900 group-hover:text-blue-600 transition text-base mb-2 cursor-pointer line-clamp-2"
                  >
                    {evt.title}
                  </h3>

                  {/* Description snippet */}
                  <p className="text-gray-600 text-xs leading-relaxed line-clamp-3 mb-4 flex-1">
                    {evt.description}
                  </p>

                  {/* Venue & Locality */}
                  <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-500 mb-4">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-800">{evt.venueName}</span>
                        <span className="text-gray-400 ml-1">({evt.locality})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{evt.organizerName}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => onSelectEvent(evt.id)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Event Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCopyLink(evt.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                      title="Share event link"
                      aria-label="Share event link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Editorial Notice Banner */}
        <div className="mt-12 bg-blue-50/60 border border-blue-200/80 rounded-2xl p-6 text-xs text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-blue-900 mb-0.5">
                Vellore Local Events Advisory
              </p>
              <p className="text-blue-800/90 leading-relaxed">
                Event timings, venues, and entrance rules are verified prior to publication. Attendees are encouraged to contact the host organizers for schedule updates or ticket inquiries.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shrink-0 cursor-pointer"
          >
            Submit an Event
          </button>
        </div>
      </div>

      {/* Modal: Event Detail View */}
      {activeEvent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-event-title"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => onSelectEvent(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition cursor-pointer"
              aria-label="Close detail"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getCategoryClass(
                    activeEvent.category
                  )}`}
                >
                  {activeEvent.category.toUpperCase()}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  <Ticket className="w-3.5 h-3.5" />
                  {activeEvent.isFree ? 'Free Admission' : activeEvent.entryFee || 'Ticketed Entry'}
                </span>
              </div>

              <h2 id="detail-event-title" className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                {activeEvent.title}
              </h2>

              {/* Event Timing & Venue Panel */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2.5 text-xs text-gray-700">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900 block">Date & Schedule</span>
                    <span>
                      {new Date(activeEvent.startDate).toLocaleDateString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}{' '}
                      • {activeEvent.timeDisplay}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2 border-t border-gray-200">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900 block">{activeEvent.venueName}</span>
                    <span className="text-gray-600">{activeEvent.venueAddress}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2 border-t border-gray-200">
                  <User className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900 block">Organized By</span>
                    <span>{activeEvent.organizerName}</span>
                    {activeEvent.organizerContact && (
                      <span className="text-gray-500 ml-2">({activeEvent.organizerContact})</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed py-2">
                {activeEvent.description}
              </div>

              {/* External Registration Link (Safe protocols only) */}
              {activeEvent.registrationUrl && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <span className="text-blue-900 font-medium">
                    Official event registration / inquiry link:
                  </span>
                  <a
                    href={activeEvent.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    <span>Register / RSVP</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                <button
                  onClick={() => handleCopyLink(activeEvent.id)}
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
                      <span>Share Event</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onSelectEvent(null)}
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
      <EventSubmissionModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        currentCity={currentCity}
        onEventSubmitted={() => {
          loadEvents();
        }}
      />
    </div>
  );
};
