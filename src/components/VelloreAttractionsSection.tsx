import React from 'react';
import { MapPin, ExternalLink, Sparkles, Compass, Clock, ShieldCheck } from 'lucide-react';

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

const VELLORE_ATTRACTIONS: Attraction[] = [
  {
    id: 'att-1',
    name: 'Vellore Fort & Moat',
    nameNative: 'வேலூர் கோட்டை',
    tagline: '16th-century Vijayanagara granite fortress surrounded by a wide moat',
    distance: 'City Center (Bazaar Area)',
    timings: 'Daily: 8:00 AM - 6:00 PM',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    highlights: ['Grand granite stone ramparts', 'Surrounding water moat', 'Houses Archaeological Museum & Tipu Mahal'],
    directionsUrl: 'https://maps.google.com/?q=Vellore+Fort',
  },
  {
    id: 'att-2',
    name: 'Sri Lakshmi Narayani Golden Temple (Sripuram)',
    nameNative: 'ஸ்ரீபுரம் பொற்கோயில்',
    tagline: 'Spiritual landmark covered in 1,500 kg of pure gold foil inside a star path',
    distance: '8 km from Vellore (Thirumalaikodi)',
    timings: 'Daily: 8:00 AM - 8:00 PM',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    highlights: ['1,500 kg pure gold sanctum', 'Star-shaped spiritual pathway', 'Peaceful green eco-park'],
    directionsUrl: 'https://maps.google.com/?q=Sripuram+Golden+Temple+Vellore',
  },
  {
    id: 'att-3',
    name: 'Jalakandeswarar Temple',
    nameNative: 'ஜலகண்டேஸ்வரர் கோவில்',
    tagline: 'Masterpiece of Dravidian Vijayanagara stone architecture inside Vellore Fort',
    distance: 'Inside Vellore Fort Complex',
    timings: '6:30 AM - 1:00 PM & 5:00 PM - 8:30 PM',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    highlights: ['Intricate 100-pillar stone hall', 'Monolithic dragon carvings', 'Active Lord Shiva sanctum'],
    directionsUrl: 'https://maps.google.com/?q=Jalakandeswarar+Temple+Vellore',
  },
  {
    id: 'att-4',
    name: 'CMC Hospital Heritage Campus',
    nameNative: 'சி.எம்.சி மருத்துவமனை பாரம்பரிய வளாகம்',
    tagline: 'Founded by Dr. Ida S. Scudder in 1900, iconic center of healing and compassion',
    distance: 'Ida Scudder Road, Vellore',
    timings: '24x7 Active Hospital Campus',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    highlights: ['Century-old Scudder memorial', 'World-class medical specialties', 'Historic chapel & archives'],
    directionsUrl: 'https://maps.google.com/?q=CMC+Hospital+Vellore',
  },
  {
    id: 'att-5',
    name: 'Palamathi Hills & Otteri Viewpoint',
    nameNative: 'பாலமதி மலை & ஒட்டேரி காட்சிமுனை',
    tagline: 'Scenic Eastern Ghats hilltop overlooking Vellore valley with serene viewpoints',
    distance: '12 km from Vellore (Otteri)',
    timings: 'Daily: 6:00 AM - 6:00 PM',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    highlights: ['Breathtaking panoramic city view', 'Cool breeze & sunset point', 'Surrounded by reserved forests'],
    directionsUrl: 'https://maps.google.com/?q=Palamathi+Hills+Vellore',
  },
  {
    id: 'att-6',
    name: "St. John's Church (Fort Vellore)",
    nameNative: 'புனித யோவான் தேவாலயம் (கோட்டை)',
    tagline: 'Historic 1846 Anglican church built by the East India Company inside fort grounds',
    distance: 'Inside Vellore Fort Complex',
    timings: 'Daily: 9:00 AM - 5:00 PM',
    image: 'https://images.unsplash.com/photo-1548625361-195fe5787e66?auto=format&fit=crop&w=800&q=80',
    highlights: ['180+ years of colonial history', 'Historical memorial stones & bell tower', 'Quiet heritage sanctuary'],
    directionsUrl: 'https://maps.google.com/?q=St+Johns+Church+Vellore+Fort',
  },
];

interface VelloreAttractionsProps {
  onOpenCabBooking?: () => void;
}

export const VelloreAttractionsSection: React.FC<VelloreAttractionsProps> = ({ onOpenCabBooking }) => {
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

        {onOpenCabBooking && (
          <button
            type="button"
            onClick={onOpenCabBooking}
            className="px-4 py-2.5 rounded-xl bg-[#176AC4] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <span>🚕</span>
            <span>Book Cab for Sightseeing</span>
          </button>
        )}
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
    </section>
  );
};

