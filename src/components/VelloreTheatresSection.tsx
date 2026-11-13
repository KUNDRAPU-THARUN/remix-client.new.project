import React from 'react';
import { Film, Ticket, MapPin, ExternalLink } from 'lucide-react';

interface Theatre {
  id: string;
  name: string;
  nameNative: string;
  area: string;
  address: string;
  image: string;
  directionsUrl: string;
}

const VELLORE_THEATRES: Theatre[] = [
  {
    id: 'th-1',
    name: 'Balaji Cinemas',
    nameNative: 'பாலாஜி சினிமாஸ்',
    area: 'Katpadi',
    address: 'Near Katpadi Railway Junction, Katpadi, Vellore - 632007',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
    directionsUrl: 'https://maps.google.com/?q=Balaji+Cinemas+Katpadi+Vellore',
  },
  {
    id: 'th-2',
    name: 'Vishnu Cinemas',
    nameNative: 'விஷ்ணு சினிமாஸ்',
    area: 'Officers Line',
    address: 'Officers Line, Near Vellore Fort, Vellore - 632001',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    directionsUrl: 'https://maps.google.com/?q=Vishnu+Cinemas+Vellore',
  },
  {
    id: 'th-3',
    name: 'Lakshmi Multiplex',
    nameNative: 'லட்சுமி மல்டிபிளக்ஸ்',
    area: 'Officers Line',
    address: 'Officers Line, Opp. Head Post Office, Vellore - 632001',
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80',
    directionsUrl: 'https://maps.google.com/?q=Lakshmi+Multiplex+Vellore',
  },
  {
    id: 'th-4',
    name: 'Alankar Theatre',
    nameNative: 'அலங்கார் திரையரங்கம்',
    area: 'Old Bus Stand',
    address: 'Near Old Bus Stand, Vellore - 632004',
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=80',
    directionsUrl: 'https://maps.google.com/?q=Alankar+Theatre+Vellore',
  },
];

export const VelloreTheatresSection: React.FC = () => {
  return (
    <section id="vellore-theatres-section" className="py-8 scroll-mt-24" aria-label="Vellore Theatres & Cinema Directory">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black text-[#176AC4] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded uppercase tracking-wider">
              Entertainment Directory
            </span>
            <span className="text-xs text-slate-400 font-medium">Vellore Cinemas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            Vellore Theatres & Cinemas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Key local movie destinations across Vellore. Live daily showtimes and direct online booking connect upon client ticketing integration.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {VELLORE_THEATRES.map((th) => (
          <div
            key={th.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden flex flex-col justify-between group hover:-translate-y-1"
          >
            <div>
              <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                <img
                  src={th.image}
                  alt={th.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-[#176AC4] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Film className="w-2.5 h-2.5" />
                  <span>{th.area}</span>
                </div>
              </div>

              <div className="p-4">
                <span className="text-[11px] text-[#176AC4] font-bold block">{th.nameNative}</span>
                <h3 className="font-black text-slate-900 text-base font-heading mt-0.5 group-hover:text-blue-600 transition-colors">
                  {th.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {th.address}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0 space-y-2">
              <a
                href={th.directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 min-h-[44px] rounded-xl bg-slate-50 hover:bg-[#176AC4] hover:text-white text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-slate-200 hover:border-transparent cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-500 group-hover:text-white" />
                <span>Get Directions</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
              <div className="w-full py-1.5 px-3 rounded-lg bg-slate-50 text-slate-500 font-semibold text-[11px] flex items-center justify-center gap-1.5">
                <Ticket className="w-3 h-3 text-slate-400" />
                <span>Showtimes via Partners</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
