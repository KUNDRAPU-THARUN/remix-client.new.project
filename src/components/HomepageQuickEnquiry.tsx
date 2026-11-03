import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Sparkles, Phone, MapPin, Tag } from 'lucide-react';
import { CityConfig } from '../types';
import { getCityCategories } from '../config/categories';
import { enquiryService } from '../services/enquiryService';

interface HomepageQuickEnquiryProps {
  currentCity: CityConfig;
}

export const HomepageQuickEnquiry: React.FC<HomepageQuickEnquiryProps> = ({ currentCity }) => {
  const categories = getCityCategories(currentCity.id);
  const localities = currentCity.localities.filter((a) => a.id !== 'all');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || 'services');
  const [selectedArea, setSelectedArea] = useState(localities[0]?.id || 'all');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
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
      setName('');
      setPhone('');
      setMessage('');
    }
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
            Post your requirement in 30 seconds. Verified local service providers, doctors, contractors, and businesses in {currentCity.name} will contact you directly with free competitive estimates.
          </p>

          <div className="mt-6 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#15995F] shrink-0" />
              <span>100% Free • No Commission or Hidden Charges</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#15995F] shrink-0" />
              <span>Direct Call / WhatsApp from Verified {currentCity.name} Experts</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#15995F] shrink-0" />
              <span>Fast Doorstep Quotes Across All Mandals & Areas</span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Enquiry Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-7 text-slate-800 shadow-xl">
          {isSuccess ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 font-heading">
                Enquiry Sent Successfully!
              </h3>
              <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                Thank you! Your service request has been registered in the {currentCity.brandName} network. Verified local businesses in {currentCity.name} will reach out to you shortly.
              </p>
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="mt-5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Send Another Enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-base font-heading text-slate-900">
                  Request Free Callback & Quotes
                </h3>
                <span className="text-[10px] bg-red-50 text-red-700 font-extrabold px-2 py-0.5 rounded-full border border-red-200">
                  ⚡ Verified Leads
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Senthil Kumar"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Service Required <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50 focus:bg-white cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Locality in {currentCity.name} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50 focus:bg-white cursor-pointer"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brief Requirement / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Need 2BHK rental flat near VIT / 24x7 ambulance enquiry / AC repair quote..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E51E31] to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs sm:text-sm shadow-md shadow-red-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

