import React from 'react';
import {
  MapPin,
  ShieldCheck,
  Building2,
  GraduationCap,
  HeartPulse,
  Landmark,
  Phone,
  Mail,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Layers,
  Search,
} from 'lucide-react';
import { CityConfig } from '../types';

interface VelloreAboutPageProps {
  currentCity: CityConfig;
  onNavigateHome: () => void;
  onNavigateCategory: (categoryId: string, areaId?: string) => void;
  onNavigateContact: () => void;
  onOpenPostAd: () => void;
  onOpenEmergency: () => void;
}

export const VelloreAboutPage: React.FC<VelloreAboutPageProps> = ({
  currentCity,
  onNavigateHome,
  onNavigateCategory,
  onNavigateContact,
  onOpenPostAd,
  onOpenEmergency,
}) => {
  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* 1. Breadcrumbs Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <button
              onClick={onNavigateHome}
              className="hover:text-[#176AC4] transition flex items-center gap-1 cursor-pointer"
            >
              <span>Home</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-bold" aria-current="page">About Vellore Ads</span>
          </nav>
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="bg-gradient-to-br from-[#0D3B66] via-[#176AC4] to-[#12539B] text-white py-12 sm:py-16 px-4 sm:px-6 shadow-md relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#F5C325]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-[#F5C325] uppercase tracking-wider mb-4">
            <Landmark className="w-3.5 h-3.5" />
            <span>வேலூர் • TN-23 • Fort City Digital Hub</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight font-heading leading-tight mb-4">
            About Vellore Ads
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed font-medium">
            The dedicated digital business discovery directory and hyper-local classifieds portal for the citizens, students, healthcare travelers, and businesses of Vellore District ({currentCity.code}).
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigateCategory('all')}
              className="px-5 py-2.5 bg-white text-[#176AC4] hover:bg-blue-50 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Explore Business Directory</span>
            </button>

            <button
              onClick={onOpenPostAd}
              className="px-5 py-2.5 bg-[#F5C325] text-slate-900 hover:bg-amber-400 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Post Free Business Ad</span>
            </button>

            <button
              onClick={onNavigateContact}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/25 transition flex items-center gap-2 cursor-pointer"
            >
              <span>Contact Vellore Office</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Key Metrics / Platform Pillars Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="p-2">
            <div className="text-2xl sm:text-3xl font-black text-[#176AC4]">11</div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">Vellore Localities</div>
            <div className="text-[11px] text-slate-400">Katpadi to Ranipet</div>
          </div>
          <div className="p-2">
            <div className="text-2xl sm:text-3xl font-black text-[#15995F]">12</div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">Verified Categories</div>
            <div className="text-[11px] text-slate-400">Healthcare, Education & Trade</div>
          </div>
          <div className="p-2">
            <div className="text-2xl sm:text-3xl font-black text-[#E51E31]">24x7</div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">Emergency Helplines</div>
            <div className="text-[11px] text-slate-400">CMC, VMCH, Police, Fire</div>
          </div>
          <div className="p-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-500">100% Free</div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">Local Business Listing</div>
            <div className="text-[11px] text-slate-400">Zero Merchant Fees</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 space-y-12">
        {/* 4. The Vellore Story: Regional Hubs */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-extrabold text-[#176AC4] uppercase tracking-wider">
              Regional Ecosystem
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 font-heading mt-1">
              Serving Vellore's Unique Economic & Cultural Corridors
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Vellore is a historic and dynamic center connecting healthcare seekers from across the globe, university students, heritage pilgrims, and industrial manufacturing leaders. Vellore Ads unites these four pillars into a unified digital portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Medical Capital */}
            <div className="bg-blue-50/60 rounded-2xl p-5 border border-blue-100 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#176AC4] text-white flex items-center justify-center mb-3.5 shadow-md shadow-blue-500/20">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Healthcare & Medical Capital
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Home to Christian Medical College (CMC), Vellore Government Medical College (VMCH), multi-specialty clinics, diagnostic labs, and medical lodges serving domestic and international patients.
                </p>
              </div>
              <button
                onClick={() => onNavigateCategory('hospitals-clinics')}
                className="mt-4 text-xs font-bold text-[#176AC4] hover:text-blue-800 flex items-center gap-1 cursor-pointer pt-2 border-t border-blue-200/60"
              >
                <span>Explore Healthcare Services</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2: Knowledge & Student Life */}
            <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-100 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-3.5 shadow-md shadow-amber-500/20">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  University & Student Life
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Powered by VIT University and premier engineering and arts colleges. Connecting thousands of students and faculty with Katpadi hostels, PGs, bookshops, cafes, and stationery hubs.
                </p>
              </div>
              <button
                onClick={() => onNavigateCategory('education')}
                className="mt-4 text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer pt-2 border-t border-amber-200/60"
              >
                <span>Explore Student Services</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 3: Heritage & Tourism */}
            <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#15995F] text-white flex items-center justify-center mb-3.5 shadow-md shadow-emerald-500/20">
                  <Landmark className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Heritage & Pilgrimage
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  The historic 16th-century Vellore Fort & Moat, Sri Jalakandeswarar Temple, Sripuram Golden Temple (Malaikodi), Palamathi Hills, and colonial St. John's Church attract millions of visitors annually.
                </p>
              </div>
              <button
                onClick={() => onNavigateCategory('theatres')}
                className="mt-4 text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer pt-2 border-t border-emerald-200/60"
              >
                <span>View Theatres & Attractions</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 4: Leather & Industrial Trade */}
            <div className="bg-purple-50/60 rounded-2xl p-5 border border-purple-100 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3.5 shadow-md shadow-purple-500/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Leather & Industrial Trade
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  The Ranipet, Katpadi, and SIPCOT industrial corridors represent Tamil Nadu's leather tanning, shoe exporting, and automobile engineering backbone with global commercial supply chains.
                </p>
              </div>
              <button
                onClick={() => onNavigateCategory('leather-industry')}
                className="mt-4 text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer pt-2 border-t border-purple-200/60"
              >
                <span>Explore Leather & Industry</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* 5. What Makes Vellore Ads Different (Integrity & Safety) */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-extrabold text-[#15995F] uppercase tracking-wider">
              Platform Standards
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 font-heading mt-1">
              Engineered for Accuracy, Privacy, and Trust
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Unlike generic aggregators flooded with outdated entries, Vellore Ads maintains verified contact information, direct WhatsApp channels, and transparent local governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#15995F] flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Verified Contact Details
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                All business phone numbers and WhatsApp links are verified with direct dialing to prevent spam and misdirection.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#176AC4] flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                100% Free Merchant Access
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Small business owners and service technicians in Vellore post free ads and manage their listings without extortionate lead fees.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-[#E51E31] flex items-center justify-center mb-3">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                24x7 Emergency Integration
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Essential emergency hospital and civic numbers are always available with 1-click calling in Tamil and English.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Locality Coverage in Vellore */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-extrabold text-[#176AC4] uppercase tracking-wider">
                Hyper-Local Coverage
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading mt-1">
                Localities We Serve Across Vellore ({currentCity.code})
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Click any locality to view verified businesses and classifieds in that area.
              </p>
            </div>
            <button
              onClick={() => onNavigateCategory('all')}
              className="text-xs font-bold text-[#176AC4] hover:text-blue-800 transition flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>View All Businesses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {currentCity.localities
              .filter((loc) => loc.id !== 'all')
              .map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => onNavigateCategory('all', loc.id)}
                  className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-slate-700 group-hover:text-[#176AC4] font-bold text-xs">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#176AC4] shrink-0" />
                    <span className="truncate">{loc.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 group-hover:text-blue-600">
                    Vellore District
                  </div>
                </button>
              ))}
          </div>
        </section>

        {/* 7. Office Contact & Platform Governance */}
        <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-[11px] font-extrabold text-[#F5C325] uppercase tracking-wider">
                Official Directory Operations
              </span>
              <h2 className="text-xl sm:text-3xl font-black font-heading mt-1">
                KAARYAN LABS — Vellore Operations
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Vellore Ads is operated under the KAARYAN LABS multi-city platform framework, strictly observing data protection, verified contact publishing, and non-partisan directory governance.
              </p>

              <div className="mt-6 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#F5C325] shrink-0 mt-0.5" />
                  <span><strong>Office Address:</strong> {currentCity.contact.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#15995F] shrink-0" />
                  <span><strong>Helpline:</strong> <a href={`tel:${currentCity.contact.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white transition">{currentCity.contact.phone}</a></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#176AC4] shrink-0" />
                  <span><strong>Official Email:</strong> <a href={`mailto:${currentCity.contact.email}`} className="hover:text-white transition">{currentCity.contact.email}</a></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>Hours:</strong> Mon – Sat: 9:00 AM – 7:30 PM (IST)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 flex flex-col justify-between gap-6">
              <div>
                <h3 className="text-base font-extrabold text-white font-heading">
                  Need Help or Have a Question?
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Our regional team in Vellore is available to verify business listings, assist with classified submissions, and handle civic queries.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onNavigateContact}
                  className="px-4 py-2.5 bg-[#176AC4] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow transition text-center cursor-pointer"
                >
                  Open Contact Page
                </button>
                <button
                  onClick={onOpenEmergency}
                  className="px-4 py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow transition text-center cursor-pointer"
                >
                  24x7 Emergency Numbers
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

