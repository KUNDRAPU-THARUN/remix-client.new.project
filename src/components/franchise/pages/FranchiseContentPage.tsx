import React, { useState, useEffect } from 'react';
import {
  Film,
  Sparkles,
  Landmark,
  Image,
  PhoneCall,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  MapPin,
  Clock,
  Ticket,
  Calendar,
  Bell,
  Check,
  X,
  ShieldCheck,
} from 'lucide-react';
import { CityConfig, EmergencyContact } from '../../../types';
import { getCityEmergencyContacts } from '../../../config/emergency';
import { communityService } from '../../../services/communityService';
import { CommunityNotice, LocalEvent } from '../../../types/community';

interface FranchiseContentPageProps {
  currentCity: CityConfig;
}

export const FranchiseContentPage: React.FC<FranchiseContentPageProps> = ({ currentCity }) => {
  const [activeSubtab, setActiveSubtab] = useState<'theatres' | 'attractions' | 'banners' | 'emergency' | 'notices' | 'events'>('theatres');
  const emergencyList: EmergencyContact[] = getCityEmergencyContacts(currentCity.id);

  // Community moderation state
  const [notices, setNotices] = useState<CommunityNotice[]>([]);
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);

  const loadFranchiseCommunity = async () => {
    setLoadingCommunity(true);
    const n = await communityService.getAllNoticesForFranchise(currentCity.id);
    const e = await communityService.getAllEventsForFranchise(currentCity.id);
    setNotices(n);
    setEvents(e);
    setLoadingCommunity(false);
  };

  useEffect(() => {
    loadFranchiseCommunity();
  }, [currentCity.id]);

  const handleModerateNotice = async (id: string, status: 'published' | 'rejected' | 'archived') => {
    await communityService.moderateNotice(id, status);
    loadFranchiseCommunity();
  };

  const handleModerateEvent = async (id: string, status: 'published' | 'rejected' | 'archived') => {
    await communityService.moderateEvent(id, status);
    loadFranchiseCommunity();
  };

  // Content for Vellore (or fallback for other cities)
  const isVellore = currentCity.id === 'vellore';
  const isChittoor = currentCity.id === 'chittoor';

  const theatres = isVellore ? [
    { id: 'th-01', name: 'Vishnu Cinemas A/C 4K Dolby Atmos', area: 'Katpadi Road', screens: 'Screen 1 & 2', status: 'Active Listing', sound: 'Dolby Atmos 7.1' },
    { id: 'th-02', name: 'Venus Cinemas A/C Dolby 7.1', area: 'Officers Line', screens: 'Main Hall', status: 'Active Listing', sound: 'Dolby Digital' },
    { id: 'th-03', name: 'Aascar Multiplex 4K Laser', area: 'Katpadi', screens: 'Screen 1, 2, 3', status: 'Active Listing', sound: 'Dolby Atmos' },
    { id: 'th-04', name: 'Balaji Theatre 2K Digital', area: 'Sainathapuram', screens: 'Single Screen', status: 'Active Listing', sound: 'Dolby 5.1' },
    { id: 'th-05', name: 'Alankar Theatre A/C DTS', area: 'Gandhi Road', screens: 'Single Screen', status: 'Active Listing', sound: 'DTS Surround' },
  ] : [
    { id: 'th-ct-01', name: 'Gurunath Multiplex 4K', area: 'High Road, Chittoor', screens: 'Screen 1 & 2', status: 'Active Listing', sound: 'Dolby Atmos' },
    { id: 'th-ct-02', name: 'Vijaya Theatre A/C', area: 'Bazaar Street, Chittoor', screens: 'Single Screen', status: 'Active Listing', sound: 'Dolby 7.1' },
    { id: 'th-ct-03', name: 'Chanakya Cinemas 2K', area: 'Collectorate Junction', screens: 'Screen 1', status: 'Active Listing', sound: 'DTS Digital' },
  ];

  const attractions = isVellore ? [
    { id: 'at-01', name: 'Vellore Fort (16th Century)', type: 'Heritage Fort & Moat', distance: '1.2 km from New Bus Stand', timings: '8:00 AM - 6:00 PM', entry: 'Free Entry' },
    { id: 'at-02', name: 'Sripuram Golden Temple', type: 'Spiritual Landmark', distance: '8.5 km from City Center', timings: '7:00 AM - 8:00 PM', entry: 'Free / VIP ₹100' },
    { id: 'at-03', name: 'Jalakanteshwara Temple', type: 'Vijayanagara Architecture', distance: 'Inside Vellore Fort', timings: '6:00 AM - 8:30 PM', entry: 'Free Entry' },
    { id: 'at-04', name: 'State Government Museum', type: 'History & Artifacts', distance: 'Inside Vellore Fort', timings: '9:00 AM - 5:00 PM', entry: '₹5 / ₹2' },
  ] : [
    { id: 'at-ct-01', name: 'Sri Varasiddhi Vinayaka Temple, Kanipakam', type: 'Swayambhu Shrine', distance: '12 km from Chittoor', timings: '5:00 AM - 9:30 PM', entry: 'Free / Special ₹100' },
    { id: 'at-ct-02', name: 'Horsley Hills Hill Station', type: 'Scenic Tourism', distance: '120 km from Chittoor', timings: '24x7 Open', entry: 'Free' },
    { id: 'at-ct-03', name: 'Kaigal Falls (Dumukurallu)', type: 'Waterfalls & Forest', distance: '65 km from Chittoor', timings: '9:00 AM - 5:00 PM', entry: 'Free' },
  ];

  return (
    <div className="space-y-6">
      {/* Subtab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubtab('theatres')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeSubtab === 'theatres'
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Cinema Theatres & Showtimes ({theatres.length})</span>
          </button>

          <button
            onClick={() => setActiveSubtab('attractions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeSubtab === 'attractions'
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>City Heritage & Attractions ({attractions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubtab('banners')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeSubtab === 'banners'
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Hero Banners & Showcase ({currentCity.heroBanners.length})</span>
          </button>

          <button
            onClick={() => setActiveSubtab('emergency')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeSubtab === 'emergency'
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Emergency Helplines ({emergencyList.length})</span>
          </button>

          {currentCity.features.hasCommunityNoticeboard && (
            <button
              onClick={() => setActiveSubtab('notices')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                activeSubtab === 'notices'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Community Notices ({notices.length})</span>
            </button>
          )}

          {currentCity.features.hasLocalEvents && (
            <button
              onClick={() => setActiveSubtab('events')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                activeSubtab === 'events'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Local Events ({events.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Section 1: Theatres */}
      {activeSubtab === 'theatres' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div>
              <h3 className="text-base font-black text-slate-900 font-heading">
                {currentCity.name} Cinema Theatres
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Catering to Fort City moviegoers with theatre listings, audio formats, and ticketing links.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Published on Homepage
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {theatres.map((th) => (
              <div key={th.id} className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-black text-slate-900 font-heading leading-snug">
                    {th.name}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 shrink-0">
                    Active
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{th.area}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{th.screens} • {th.sound}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Territory: {currentCity.code}</span>
                  <span className="font-bold text-red-600 flex items-center gap-1">
                    <span>Live Showcase</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Section 2: Attractions */}
      {activeSubtab === 'attractions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div>
              <h3 className="text-base font-black text-slate-900 font-heading">
                {currentCity.name} Heritage & Tourism Spotlight
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                City landmarks and historical points of interest showcased on the visitor portal.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Published on Homepage
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attractions.map((att) => (
              <div key={att.id} className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 font-heading">
                      {att.name}
                    </h4>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {att.type}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {att.entry}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{att.distance}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{att.timings}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Section 3: Banners */}
      {activeSubtab === 'banners' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <h3 className="text-base font-black text-slate-900 font-heading">
              Hero Carousel Banners ({currentCity.name})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Top featured promotions and seasonal commercial highlights for {currentCity.name}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentCity.heroBanners.map((banner) => (
              <div key={banner.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs">
                <div className="h-36 bg-slate-100 overflow-hidden relative">
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                    {banner.tag}
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="text-xs font-black text-slate-900 font-heading">
                    {banner.title}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Category: {banner.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Section 4: Emergency */}
      {activeSubtab === 'emergency' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <h3 className="text-base font-black text-slate-900 font-heading">
              24x7 Verified Emergency Helplines ({currentCity.name})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified local hospital desks, electricity control, police and disaster numbers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {emergencyList.map((contact) => (
              <div key={contact.id} className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 font-heading">
                      {contact.name}
                    </h4>
                    {contact.teluguName && (
                      <p className="text-[11px] text-slate-500 font-medium">{contact.teluguName}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    24x7
                  </span>
                </div>

                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-1.5 text-xs font-black text-red-600 hover:text-red-700 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{contact.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Section 5: Community Notices Moderation */}
      {activeSubtab === 'notices' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 font-heading">
                Community Notices Moderation ({currentCity.name})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review, approve, or reject civic and community notices submitted by residents and local organizations.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Staging / Local Storage Mode</span>
            </div>
          </div>

          {loadingCommunity ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading notices...</div>
          ) : notices.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200/90 text-center text-xs text-slate-500">
              No notices submitted for moderation yet.
            </div>
          ) : (
            <div className="space-y-3">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {n.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          n.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700'
                            : n.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {n.status}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Category: {n.category}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Locality: {n.locality}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{n.content}</p>

                    <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1">
                      <span>Organizer: <strong>{n.organizerName}</strong></span>
                      {n.contactPhone && <span>Phone: {n.contactPhone}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {n.status !== 'published' && (
                      <button
                        onClick={() => handleModerateNotice(n.id, 'published')}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Publish</span>
                      </button>
                    )}
                    {n.status !== 'rejected' && (
                      <button
                        onClick={() => handleModerateNotice(n.id, 'rejected')}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition cursor-pointer flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Section 6: Local Events Moderation */}
      {activeSubtab === 'events' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 font-heading">
                Local Events Moderation ({currentCity.name})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and approve event listings, verify venue schedules, and ensure accurate timing.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Staging / Local Storage Mode</span>
            </div>
          </div>

          {loadingCommunity ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200/90 text-center text-xs text-slate-500">
              No events submitted for moderation yet.
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {evt.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          evt.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700'
                            : evt.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {evt.status}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {evt.category.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Locality: {evt.locality}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{evt.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{evt.description}</p>

                    <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                      <div>
                        <strong>Venue:</strong> {evt.venueName} — {evt.venueAddress}
                      </div>
                      <div>
                        <strong>Schedule:</strong> {evt.timeDisplay} | Organizer: {evt.organizerName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {evt.status !== 'published' && (
                      <button
                        onClick={() => handleModerateEvent(evt.id, 'published')}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Publish</span>
                      </button>
                    )}
                    {evt.status !== 'rejected' && (
                      <button
                        onClick={() => handleModerateEvent(evt.id, 'rejected')}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition cursor-pointer flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
