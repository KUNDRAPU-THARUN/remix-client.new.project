import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Sparkles, Phone, MapPin, Tag, RefreshCw, ShieldCheck } from 'lucide-react';
import { CityConfig } from '../types';
import { getCityCategories } from '../config/categories';
import { enquiryService } from '../services/enquiryService';
import { validateIndianMobile } from '../utils/contactValidation';

interface HomepageQuickEnquiryProps {
  currentCity: CityConfig;
  onOpenCabBooking?: () => void;
}

export const HomepageQuickEnquiry: React.FC<HomepageQuickEnquiryProps> = ({ currentCity, onOpenCabBooking }) => {
  const categories = getCityCategories(currentCity.id);
  const localities = currentCity.localities.filter((a) => a.id !== 'all');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || 'services');
  const [selectedArea, setSelectedArea] = useState(localities[0]?.id || 'all');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOfflineResult, setIsOfflineResult] = useState(false);
  const [serverLeadId, setServerLeadId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      errors.name = 'Please enter your full name (at least 2 characters).';
    }

    const mobileCheck = validateIndianMobile(phone);
    if (!mobileCheck.isValid) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const catObj = categories.find((c) => c.id === selectedCategory);
    const areaObj = localities.find((a) => a.id === selectedArea);

    const res = await enquiryService.submitGeneralLead({
      cityId: currentCity.id,
      categoryId: selectedCategory,
      areaId: selectedArea,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      message: `[Category: ${catObj?.name || selectedCategory}] [Area: ${areaObj?.name || selectedArea}] ${message.trim() || 'Customer requested callback for local service quote.'}`,
    });

    setIsSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setIsSuccess(true);
      setIsOfflineResult(!res.persisted);
      setServerLeadId(res.persisted && res.leadId ? res.leadId : null);
      setName('');
      setPhone('');
      setMessage('');
      setFieldErrors({});
    }
  };

  const handleRetry = () => {
    setErrorMessage('');
    // Form data is preserved, focus stays on form
  };

  return (
    <section
      className="rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-10 shadow-2xl relative border border-slate-800 my-8"
      aria-label={`Get Free Quotes in ${currentCity.name}`}
    >
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Pitch and Trust Badges */}
        <div className="lg:col-span-5">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full mb-3 backdrop-blur-md border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Instant Local Quotes • {currentCity.code}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-white leading-tight">
            Need a Local Service in {currentCity.name}?
          </h2>

          <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Post your requirement in 30 seconds. Local service providers, contractors, and businesses in {currentCity.name} will contact you directly with free competitive estimates.
          </p>

          <div className="mt-6 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#15995F] shrink-0" />
              <span>100% Free • No Commission or Hidden Charges</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#15995F] shrink-0" />
              <span>Direct Call / WhatsApp from Local {currentCity.name} Experts</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#15995F] shrink-0" />
              <span>Fast Doorstep Quotes Across All Mandals & Areas</span>
            </div>
          </div>

          {onOpenCabBooking && currentCity.id === 'vellore' && (
            <div className="mt-6 p-4 rounded-2xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🚕</span>
                <div>
                  <h4 className="text-xs font-bold text-white">Need a Taxi or Airport Cab?</h4>
                  <p className="text-[11px] text-slate-300">Local rides, Chennai airport transfers & outstation trips</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenCabBooking}
                className="px-3.5 py-2 rounded-xl bg-[#176AC4] hover:bg-blue-600 text-white font-bold text-xs transition cursor-pointer shrink-0 shadow-xs"
              >
                Book Cab
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Quick Enquiry Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-7 text-slate-800 shadow-xl">
          {isSuccess ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 font-heading">
                {isOfflineResult ? 'Requirement Stored (Demo Mode)' : 'Enquiry Sent Successfully!'}
              </h3>
              {serverLeadId && (
                <p className="text-[11px] font-mono text-slate-500 mt-1">
                  Confirmed Reference: <span className="font-semibold text-slate-700">{serverLeadId}</span>
                </p>
              )}
              {isOfflineResult ? (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5 mt-2 max-w-md mx-auto leading-relaxed">
                  Your requirement was recorded locally in preview demo mode. Live routing to local service providers requires an active Supabase database connection.
                </p>
              ) : (
                <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                  Thank you! Your requirement has been registered. Relevant local service providers or our regional directory coordinators in {currentCity.name} will reach out to you.
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setServerLeadId(null);
                  setIsOfflineResult(false);
                }}
                className="mt-5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Send Another Requirement
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-base font-heading text-slate-900">
                  Request Free Callback & Quotes
                </h3>
                <span className="text-[10px] bg-blue-50 text-[#176AC4] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                  ⚡ Direct Quotes
                </span>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 underline hover:text-red-950 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="quick-enquiry-name" className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="quick-enquiry-name"
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) {
                        setFieldErrors((prev) => ({ ...prev, name: '' }));
                      }
                    }}
                    placeholder="e.g. Senthil Kumar"
                    aria-invalid={!!fieldErrors.name}
                    aria-describedby={fieldErrors.name ? 'quick-enquiry-name-error' : undefined}
                    className={`w-full text-base sm:text-xs px-3.5 py-2.5 min-h-[44px] rounded-xl border ${
                      fieldErrors.name ? 'border-red-500 bg-red-50/40' : 'border-slate-200 bg-slate-50'
                    } focus:outline-hidden focus:border-blue-500 focus:bg-white transition disabled:opacity-60`}
                  />
                  {fieldErrors.name && (
                    <p id="quick-enquiry-name-error" role="alert" className="text-[11px] font-medium text-red-600 mt-1">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="quick-enquiry-phone" className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="quick-enquiry-phone"
                    type="tel"
                    required
                    disabled={isSubmitting}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone) {
                        setFieldErrors((prev) => ({ ...prev, phone: '' }));
                      }
                    }}
                    placeholder="e.g. 98423 44550"
                    aria-invalid={!!fieldErrors.phone}
                    aria-describedby={fieldErrors.phone ? 'quick-enquiry-phone-error' : undefined}
                    className={`w-full text-base sm:text-xs px-3.5 py-2.5 min-h-[44px] rounded-xl border ${
                      fieldErrors.phone ? 'border-red-500 bg-red-50/40' : 'border-slate-200 bg-slate-50'
                    } focus:outline-hidden focus:border-blue-500 focus:bg-white transition disabled:opacity-60`}
                  />
                  {fieldErrors.phone && (
                    <p id="quick-enquiry-phone-error" role="alert" className="text-[11px] font-medium text-red-600 mt-1">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="quick-enquiry-category" className="block text-xs font-bold text-slate-700 mb-1">
                    Service Required <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="quick-enquiry-category"
                    disabled={isSubmitting}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-base sm:text-xs px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50 focus:bg-white cursor-pointer disabled:opacity-60"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="quick-enquiry-area" className="block text-xs font-bold text-slate-700 mb-1">
                    Locality in {currentCity.name} <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="quick-enquiry-area"
                    disabled={isSubmitting}
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full text-base sm:text-xs px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50 focus:bg-white cursor-pointer disabled:opacity-60"
                  >
                    {localities.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="quick-enquiry-notes" className="block text-xs font-bold text-slate-700 mb-1">
                  Brief Requirement / Notes (Optional)
                </label>
                <textarea
                  id="quick-enquiry-notes"
                  rows={2}
                  disabled={isSubmitting}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Need 2BHK rental flat near VIT / 24x7 ambulance enquiry / AC repair quote..."
                  className="w-full text-base sm:text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50 focus:bg-white disabled:opacity-60"
                />
              </div>

              {/* Privacy Notice Microcopy */}
              <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-500 leading-snug">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy Notice:</strong> Your requirement and contact details are shared with relevant local service providers or our regional directory team in {currentCity.name} solely to coordinate your service quote callback. We do not sell your personal contact details.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 min-h-[44px] rounded-xl bg-gradient-to-r from-[#E51E31] to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs sm:text-sm shadow-md shadow-red-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting Enquiry...' : `Get Free Quotes in ${currentCity.name} →`}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

