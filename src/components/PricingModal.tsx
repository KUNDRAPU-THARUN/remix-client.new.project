import React from 'react';
import { X, Sparkles, Building2, HelpCircle } from 'lucide-react';
import { CityConfig } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPostAd: () => void;
  currentCity?: CityConfig;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onOpenPostAd,
  currentCity,
}) => {
  if (!isOpen) return null;

  const cityName = currentCity?.name || 'Local';
  const brandName = currentCity?.brandName || 'Local Ads';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-blue-600 font-extrabold px-2 py-0.5 rounded text-white uppercase tracking-wider">
                Merchant Information
              </span>
              <h3 className="font-black text-lg sm:text-xl font-heading text-white">
                Advertise on {brandName}
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Promotional channels and business listing options for {cityName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
            aria-label="Close pricing modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice of Official Tariff Review */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-slate-50 space-y-6 text-slate-700">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Official Commercial Rate Card Under Review</p>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                Official commercial advertising tariffs, sponsorship packages, and premium verification tiers are currently pending client review and authorization. Standard business directory listings can be submitted today through the merchant self-service portal.
              </p>
            </div>
          </div>

          {/* Promotion Channels (No unapproved prices or payment claims) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Option 1: Standard Listing */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Standard Tier
                </span>
                <h4 className="text-base font-black text-slate-900 font-heading mt-1">Directory Listing</h4>
                <div className="mt-2 mb-3 text-xs font-semibold text-slate-500">
                  Standard Self-Service
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Basic local presence for verified neighborhood retailers, service specialists, and freelancers across {cityName}.
                </p>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li>• Published in {cityName} Directory</li>
                  <li>• Direct Contact & WhatsApp Links</li>
                  <li>• Business Address & Timings</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPostAd();
                }}
                className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Post Free Listing
              </button>
            </div>

            {/* Option 2: Featured Placement */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-red-600 uppercase tracking-wider block">
                  Enhanced Visibility
                </span>
                <h4 className="text-base font-black text-slate-900 font-heading mt-1">Featured Placement</h4>
                <div className="mt-2 mb-3 text-xs font-semibold text-slate-500">
                  Rates on Request
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Prominent category positioning and verified digital badge for established local establishments.
                </p>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li>• Priority Category Positioning</li>
                  <li>• Verified Merchant Badge</li>
                  <li>• Customer Review Response Tools</li>
                </ul>
              </div>

              <div className="mt-6 py-2 px-3 bg-slate-100 rounded-xl text-center text-[11px] font-semibold text-slate-600">
                Awaiting Rate Card Release
              </div>
            </div>

            {/* Option 3: Hero Sponsorship */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider block">
                  Citywide Branding
                </span>
                <h4 className="text-base font-black text-slate-900 font-heading mt-1">Homepage Spotlight</h4>
                <div className="mt-2 mb-3 text-xs font-semibold text-slate-500">
                  Custom Campaign Quote
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Homepage rotating hero banner spot for major brand announcements, medical centers, and festivals.
                </p>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li>• High-Impact Top Banner</li>
                  <li>• Targeted City Audience</li>
                  <li>• Custom Campaign Schedule</li>
                </ul>
              </div>

              <div className="mt-6 py-2 px-3 bg-slate-100 rounded-xl text-center text-[11px] font-semibold text-slate-600">
                Awaiting Rate Card Release
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
