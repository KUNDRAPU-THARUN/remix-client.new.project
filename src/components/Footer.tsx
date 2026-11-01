import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Heart, 
  Smartphone, 
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';
import { CHITTOOR_CATEGORIES } from '../data/mockData';
import { CityConfig } from '../types';

interface FooterProps {
  onSelectCategory: (catId: string) => void;
  onSelectArea: (areaId: string) => void;
  onOpenEmergency: () => void;
  onOpenPostAd: () => void;
  onOpenAI: () => void;
  currentCity: CityConfig;
  allCities: CityConfig[];
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onSelectArea,
  onOpenEmergency,
  onOpenPostAd,
  onOpenAI,
  currentCity,
  allCities,
}) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-8 border-t border-slate-800" aria-label="Site Footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Mobile Web & Multi-City Network Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-6 sm:p-8 mb-12 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#E51E31] text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-600/30">
              <Smartphone className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-[11px] font-extrabold text-[#F5C325] uppercase tracking-wider">
                  Mobile Responsive Web Experience
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  PWA Ready
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-heading mt-0.5">
                {currentCity.name} in Your Pocket
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Bookmark {currentCity.brandName} on your smartphone home screen for instant access to local shops, emergency doctors, and classified listings across {currentCity.code}.
              </p>
            </div>
          </div>

          {/* Regional Multi-City Network Status */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2 shrink-0 text-xs">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              KAARYAN Multi-City Network
            </span>
            {allCities.map((c) => {
              const isCurrent = c.id === currentCity.id;
              return (
                <div key={c.id} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-[#15995F] animate-pulse' : 'bg-slate-600'}`} />
                  <span className={isCurrent ? 'text-white font-bold' : 'text-slate-400'}>
                    {c.brandName} ({c.code}) — {isCurrent ? 'Active' : 'Live Platform'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Multi-column Dark Directory Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-850">
          {/* Brand Info & Mission */}
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E51E31] via-[#c91829] to-[#176AC4] flex items-center justify-center text-white shadow-md shadow-red-500/20">
                <MapPin className="w-5 h-5 fill-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight font-heading">
                {currentCity.name}<span className="text-[#E51E31]">Ads</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              {currentCity.name}'s hyper-local digital business discovery directory and classifieds portal ({currentCity.code}). Connecting residents, pilgrims, businesses, and traders across {currentCity.state}.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-[#15995F] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Free Local Business Listing</span>
            </div>

            {/* Social Links */}
            <div className="mt-5">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                Connect With Us
              </p>
              <div className="flex items-center gap-2">
                {['Facebook', 'X', 'Instagram', 'YouTube', 'LinkedIn'].map((social) => (
                  <span
                    key={social}
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-[#E51E31] text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition cursor-pointer border border-slate-800"
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
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E51E31]" />
              <span>Top Categories</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              {CHITTOOR_CATEGORIES.slice(0, 7).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onSelectCategory(c.id)}
                    className="hover:text-[#E51E31] transition cursor-pointer text-left flex items-center justify-between w-full"
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-slate-500 font-normal">{c.count}+</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* City Localities & Areas */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#176AC4]" />
              <span>{currentCity.name} Locations</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 font-medium">
              {currentCity.localities.filter((a) => a.id !== 'all').slice(0, 8).map((a) => (
                <button
                  key={a.id}
                  onClick={() => onSelectArea(a.id)}
                  className="hover:text-blue-400 text-left transition truncate cursor-pointer py-0.5"
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Information & Portal Services */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15995F]" />
              <span>Contact & Support</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={onOpenPostAd}
                  className="text-[#E51E31] hover:text-red-400 font-black transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>+ Post Free Classified Ad</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAI}
                  className="text-[#F5C325] hover:text-amber-200 font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Scout Assistant</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenEmergency}
                  className="text-rose-400 hover:text-rose-300 font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-rose-500" />
                  <span>24x7 Emergency Helplines</span>
                </button>
              </li>
              <li className="pt-2 text-slate-400 text-[11px] leading-relaxed border-t border-slate-900 space-y-1">
                <p><strong className="text-slate-300">Office:</strong> {currentCity.contact.address}</p>
                <p><strong className="text-slate-300">Helpline:</strong> {currentCity.contact.phone}</p>
                <p><strong className="text-slate-300">Email:</strong> {currentCity.contact.email}</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Legal Notice */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {currentCity.brandName} ({currentCity.code}). A KAARYAN LABS Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-[#E51E31] fill-[#E51E31]" /> for the citizens of {currentCity.name} ({currentCity.state})
          </p>
        </div>
      </div>
    </footer>
  );
};
