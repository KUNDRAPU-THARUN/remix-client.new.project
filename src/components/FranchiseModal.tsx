import React from 'react';
import { X, Building2, MapPin, CheckCircle2, TrendingUp, Users, Phone, Mail } from 'lucide-react';
import { CityConfig } from '../types';

interface FranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity?: CityConfig;
}

export const FranchiseModal: React.FC<FranchiseModalProps> = ({
  isOpen,
  onClose,
  currentCity,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-500 font-extrabold px-2 py-0.5 rounded text-white uppercase tracking-wider">
                Partnership
              </span>
              <h3 className="font-black text-lg sm:text-xl font-heading text-white">
                City Franchise & Regional Growth
              </h3>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Own & monetize the hyper-local digital business directory in your city
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
            aria-label="Close franchise modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-slate-50 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h4 className="font-black text-base font-heading text-slate-900">
              The KAARYAN LABS Multi-City Platform Model
            </h4>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              We provide the complete turnkey technology stack: lightning-fast React + Supabase backend, mobile-responsive PWA web app, Merchant Self-Serve Dashboard, instant WhatsApp lead routing, and PostgreSQL multi-tenant architecture. You operate the local merchant sales and community relationships in your district.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-emerald-600 font-black text-sm block">100% Turnkey</span>
                <span className="text-slate-500 text-[11px]">Ready within 48 hours for your city domain</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-blue-600 font-black text-sm block">Merchant Revenue</span>
                <span className="text-slate-500 text-[11px]">Keep 80% of listing and banner ad sales</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-purple-600 font-black text-sm block">Zero Server Ops</span>
                <span className="text-slate-500 text-[11px]">Fully managed cloud & security by KAARYAN</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Available Franchise Territories
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">Tamil Nadu</span>
                <span className="text-[11px] text-slate-500">Vellore, Ranipet, Tirupattur, Salem, Hosur, Trichy</span>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">Andhra Pradesh</span>
                <span className="text-[11px] text-slate-500">Chittoor, Tirupati, Madanapalle, Nellore, Kadapa</span>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">Karnataka</span>
                <span className="text-[11px] text-slate-500">Bengaluru, Kolar, Mysore, Hubli-Dharwad, Mangalore</span>
              </div>
            </div>
          </div>

          {/* Contact Box */}
          <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h5 className="font-bold text-sm">Speak with our Franchise Team</h5>
              <p className="text-xs text-blue-200 mt-0.5">Contact KAARYAN LABS for investment terms and city availability</p>
            </div>
            <a
              href="mailto:partner@chittoorads.com?subject=Franchise%20Opportunity%20Inquiry"
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-emerald-500 hover:text-white font-black text-xs transition shrink-0"
            >
              Contact Franchise Lead →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

