import React from 'react';
import { 
  MapPin, 
  Clock, 
  Car, 
  Sparkles, 
  Phone, 
  ShieldCheck, 
  HelpCircle,
  ExternalLink 
} from 'lucide-react';

export const KanipakamSpecial: React.FC = () => {
  const handleCallTravels = () => {
    window.location.href = 'tel:+919700834112';
  };

  const handleWhatsAppTravels = () => {
    const msg = encodeURIComponent(
      'Namaste! I would like to book a cab/darshan package for Sri Varasiddhi Vinayaka Temple, Kanipakam from Chittoor.'
    );
    window.open(`https://wa.me/919700834112?text=${msg}`, '_blank');
  };

  return (
    <div className="py-8">
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-700 via-amber-800 to-orange-950 text-white p-6 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-full px-3 py-1 mb-4 text-xs font-semibold text-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Famous Pilgrimage Center (Just 11 km from Chittoor Town)</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black font-heading text-white tracking-tight">
            Sri Varasiddhi Vinayaka Swamy Temple, Kanipakam
          </h2>
          <p className="mt-2 text-sm sm:text-base text-amber-100/90 leading-relaxed">
            The historic Swayambhu (self-manifested) water-growing Ganesha idol in the Bahuda River basin. Dedicated travel services, AC cabs, accommodation & pooja samagri suppliers.
          </p>

          {/* Quick Guide Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-black/25 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-1">
                <Clock className="w-4 h-4" />
                <span>Temple Timings</span>
              </div>
              <p className="text-xs text-white">4:00 AM - 9:30 PM</p>
              <p className="text-[11px] text-amber-200/80">Suprabhata Seva at 4:00 AM</p>
            </div>

            <div className="bg-black/25 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-1">
                <Car className="w-4 h-4" />
                <span>Distance from Chittoor</span>
              </div>
              <p className="text-xs text-white">11 Kilometers (20 mins)</p>
              <p className="text-[11px] text-amber-200/80">Via Kanipakam Bypass Road</p>
            </div>

            <div className="bg-black/25 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Cabs</span>
              </div>
              <p className="text-xs text-white">Sedans, Innovas & Tempo</p>
              <p className="text-[11px] text-amber-200/80">Doorstep Chittoor pickup</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleWhatsAppTravels}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-950/30 cursor-pointer"
            >
              <span>Book Temple Cab on WhatsApp</span>
            </button>
            <button
              onClick={handleCallTravels}
              className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Call +91 97008 34112</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
