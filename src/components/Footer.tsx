import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Heart, 
  Smartphone, 
  Download,
  Share2
} from 'lucide-react';
import { CHITTOOR_AREAS, CHITTOOR_CATEGORIES } from '../data/mockData';

interface FooterProps {
  onSelectCategory: (catId: string) => void;
  onSelectArea: (areaId: string) => void;
  onOpenEmergency: () => void;
  onOpenPostAd: () => void;
  onOpenAI: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onSelectArea,
  onOpenEmergency,
  onOpenPostAd,
  onOpenAI,
}) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-10 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Mobile App Download Banner */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-850 to-slate-800 rounded-3xl p-6 sm:p-8 mb-10 border border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-600/30">
              <Smartphone className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Mobile Convenience
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-heading mt-0.5">
                Download Our Mobile App
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-lg">
                Search local shops, call verified doctors, and post ads on the go in Chittoor & Kanipakam.
              </p>
            </div>
          </div>

          {/* App Store / Play Store Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            {/* Google Play Mock Badge */}
            <div className="bg-black/80 hover:bg-black text-white px-4 py-2.5 rounded-xl border border-white/20 flex items-center gap-2.5 transition cursor-pointer select-none">
              <div className="w-6 h-6 flex items-center justify-center text-emerald-400 font-bold text-sm">
                ▶
              </div>
              <div className="text-left">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 leading-none">GET IT ON</p>
                <p className="text-xs font-bold text-white leading-tight">Google Play</p>
              </div>
            </div>

            {/* Apple App Store Mock Badge */}
            <div className="bg-black/80 hover:bg-black text-white px-4 py-2.5 rounded-xl border border-white/20 flex items-center gap-2.5 transition cursor-pointer select-none">
              <div className="w-6 h-6 flex items-center justify-center text-white font-bold text-sm">
                
              </div>
              <div className="text-left">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 leading-none">Download on the</p>
                <p className="text-xs font-bold text-white leading-tight">App Store</p>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-column Dark Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand Info & Social Links */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-blue-600 flex items-center justify-center text-white font-bold">
                <MapPin className="w-4 h-4 fill-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight font-heading">
                Chittoor<span className="text-red-500">Ads</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Chittoor's premier hyper-local digital business directory & classifieds portal. Connecting residents, pilgrims, farmers, and traders across AP-03.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Free Local Business Listing</span>
            </div>

            {/* Social Links (FB, X, IG, YT, LinkedIn) */}
            <div className="mt-5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Follow Us
              </p>
              <div className="flex items-center gap-2">
                {['Facebook', 'X', 'Instagram', 'YouTube', 'LinkedIn'].map((social) => (
                  <span
                    key={social}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition cursor-pointer"
                    title={social}
                  >
                    {social.charAt(0)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Top Categories
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {CHITTOOR_CATEGORIES.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onSelectCategory(c.id)}
                    className="hover:text-red-400 transition cursor-pointer text-left"
                  >
                    {c.name} ({c.nameTe})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Localities & Mandals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Chittoor Locations
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-400">
              {CHITTOOR_AREAS.slice(1, 9).map((a) => (
                <button
                  key={a.id}
                  onClick={() => onSelectArea(a.id)}
                  className="hover:text-red-400 text-left transition truncate cursor-pointer"
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Information & Portal Services */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Contact & Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenPostAd}
                  className="text-red-400 hover:text-red-300 font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>+ Post Free Classified Ad</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAI}
                  className="text-amber-300 hover:text-amber-200 font-medium transition cursor-pointer"
                >
                  Chittoor Smart Scout (AI Assistant)
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenEmergency}
                  className="text-slate-300 hover:text-white transition cursor-pointer"
                >
                  District Emergency Helplines (24x7)
                </button>
              </li>
              <li className="pt-2 text-slate-400 text-[11px] leading-relaxed border-t border-slate-800">
                <span className="font-semibold text-slate-300">Office:</span> Gandhi Road Center, Chittoor - 517001<br />
                <span className="font-semibold text-slate-300">Phone:</span> +91 94402 18456<br />
                <span className="font-semibold text-slate-300">Email:</span> support@chittoorads.com
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ChittoorAds (AP-03). Search Local | Go Digital. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for the people of Chittoor District
          </p>
        </div>
      </div>
    </footer>
  );
};
