import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  ShieldCheck,
  Send,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  LifeBuoy,
  HeartPulse,
  RefreshCw,
} from 'lucide-react';
import { CityConfig } from '../types';
import { enquiryService } from '../services/enquiryService';

interface VelloreContactPageProps {
  currentCity: CityConfig;
  onNavigateHome: () => void;
  onOpenEmergency: () => void;
}

export const VelloreContactPage: React.FC<VelloreContactPageProps> = ({
  currentCity,
  onNavigateHome,
  onOpenEmergency,
}) => {
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Assistance');
  const [message, setMessage] = useState('');

  // Status state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isOfflineResult, setIsOfflineResult] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [serverLeadId, setServerLeadId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const cleanPhone = currentCity.contact.phone.replace(/[^0-9+]/g, '');
  const cleanWhatsAppNumber = '918189985559';

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      errors.name = 'Please enter your full name (at least 2 characters).';
    }

    const digitsOnly = phone.replace(/\D/g, '');
    if (!digitsOnly || (digitsOnly.length !== 10 && digitsOnly.length !== 12)) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!message.trim() || message.trim().length < 10) {
      errors.message = 'Please provide details about your enquiry (at least 10 characters).';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await enquiryService.submitGeneralLead({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || undefined,
        categoryId: subject.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        areaId: 'all',
        message: `[CONTACT_PAGE_ENQUIRY] Subject: ${subject}\n\nMessage:\n${message.trim()}`,
        cityId: 'vellore',
      });

      setIsSubmitting(false);

      if (res.error) {
        setSubmitError(res.error);
      } else {
        setSubmitSuccess(true);
        setIsOfflineResult(!res.persisted);
        setServerLeadId(res.persisted && res.leadId ? res.leadId : null);
        // Clear message but retain contact for convenience
        setMessage('');
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      setSubmitError('Unable to send your enquiry right now. Please try again or contact us via WhatsApp.');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* 1. Breadcrumbs */}
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
            <span className="text-slate-800 font-bold" aria-current="page">Contact Vellore Ads</span>
          </nav>
        </div>
      </div>

      {/* 2. Hero Header */}
      <section className="bg-gradient-to-br from-[#0D3B66] via-[#176AC4] to-[#12539B] text-white py-10 sm:py-14 px-4 sm:px-6 shadow-md">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-[#F5C325] uppercase tracking-wider mb-3">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Support & Assistance • TN-23</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-heading mb-3">
            Contact Vellore Ads
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Have questions about business listings, advertising plans, or local services in Vellore? Our local support team is here to assist you.
          </p>
        </div>
      </section>

      {/* 3. Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Verified Contact Information & Hours (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Contact Details Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div>
                <span className="text-[11px] font-extrabold text-[#176AC4] uppercase tracking-wider">
                  Verified Contact
                </span>
                <h2 className="text-xl font-black text-slate-900 font-heading mt-0.5">
                  Vellore District Office
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  KAARYAN LABS Hyper-Local Operations Desk
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Address */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#176AC4] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">Physical Address</strong>
                    <p className="text-slate-600 leading-relaxed">{currentCity.contact.address}</p>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-[#176AC4]">
                      Landmark: Near VIT Junction, Katpadi
                    </span>
                  </div>
                </div>

                {/* Telephone */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#15995F] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">Helpline Phone</strong>
                    <a
                      href={`tel:${cleanPhone}`}
                      className="text-slate-700 hover:text-[#176AC4] font-semibold transition"
                    >
                      {currentCity.contact.phone}
                    </a>
                    <span className="block text-[11px] text-slate-400 mt-0.5">
                      Direct voice assistance during office hours
                    </span>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">WhatsApp Quick Desk</strong>
                    <a
                      href={`https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent('Hello Vellore Ads team! I need assistance with the directory.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#15995F] hover:text-emerald-700 font-bold flex items-center gap-1 transition"
                    >
                      <span>+91 81899 85559</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="block text-[11px] text-slate-400 mt-0.5">
                      Instant chat for ad listings & verification
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">Email Support</strong>
                    <a
                      href={`mailto:${currentCity.contact.email}`}
                      className="text-slate-700 hover:text-[#176AC4] font-semibold transition"
                    >
                      {currentCity.contact.email}
                    </a>
                    <span className="block text-[11px] text-slate-400 mt-0.5">
                      Official inquiries & partner correspondence
                    </span>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">Operating Hours</strong>
                    <p className="text-slate-600">Monday – Saturday: 9:00 AM – 7:30 PM (IST)</p>
                    <p className="text-slate-400 text-[11px]">Sunday: Closed (Helpline on Standby)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 24x7 Emergency Services Card */}
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-xs space-y-3">
              <div className="flex items-center gap-2 text-rose-700 font-extrabold uppercase tracking-wider text-[11px]">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                <span>24x7 Emergency Helplines</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                If you are facing a medical emergency, ambulance requirement, or civic crisis in Vellore, please dial directly:
              </p>
              <div className="space-y-1.5 font-semibold text-slate-800 pt-1">
                <div className="flex justify-between items-center py-1 border-b border-rose-100">
                  <span>CMC Hospital Emergency:</span>
                  <a href="tel:04162281000" className="text-rose-700 font-bold hover:underline">0416-2281000</a>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-rose-100">
                  <span>Govt Medical College (VMCH):</span>
                  <a href="tel:04162260900" className="text-rose-700 font-bold hover:underline">0416-2260900</a>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-rose-100">
                  <span>Police Control Room:</span>
                  <a href="tel:100" className="text-rose-700 font-bold hover:underline">100</a>
                </div>
              </div>

              <button
                onClick={onOpenEmergency}
                className="w-full mt-2 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition text-center shadow-sm cursor-pointer"
              >
                View Complete 24x7 Emergency Directory
              </button>
            </div>
          </div>

          {/* Right Column: Functional Lead & Inquiry Submission Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
              <div className="mb-6">
                <span className="text-[11px] font-extrabold text-[#15995F] uppercase tracking-wider">
                  Direct Desk
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading mt-0.5">
                  Send Us a Message
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Fill in your details below and a Vellore Ads regional coordinator will review your request.
                </p>
              </div>

              {/* Success Notification Banner */}
              {submitSuccess && (
                <div
                  role="alert"
                  className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3 animate-fade-in"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-extrabold text-sm text-emerald-950">
                      {isOfflineResult ? 'Message Stored (Demo Mode)' : 'Thank you! Your message has been received.'}
                    </h3>
                    {serverLeadId && (
                      <p className="mt-0.5 text-[11px] font-mono text-emerald-950">
                        Confirmed Reference: <strong>{serverLeadId}</strong>
                      </p>
                    )}
                    {isOfflineResult ? (
                      <p className="mt-1 text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-2 leading-relaxed">
                        Your message regarding <strong>"{subject}"</strong> has been recorded locally in preview demo mode. Live routing requires an active server database connection.
                      </p>
                    ) : (
                      <p className="mt-1 text-emerald-800">
                        Our Vellore desk has recorded your enquiry under topic <strong>"{subject}"</strong>. An authorized coordinator will contact you via <strong>{phone}</strong> within 24 business hours.
                      </p>
                    )}
                    <button
                      onClick={() => {
                        setSubmitSuccess(false);
                        setIsOfflineResult(false);
                        setServerLeadId(null);
                      }}
                      className="mt-2 text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer text-xs"
                    >
                      Send another message
                    </button>
                  </div>
                </div>
              )}

              {/* Submission Error Alert */}
              {submitError && (
                <div
                  role="alert"
                  className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-extrabold text-sm text-rose-950">Submission Failed</h3>
                      <p className="mt-1 text-rose-800">{submitError}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitError(null)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 underline hover:text-rose-950 cursor-pointer shrink-0 mt-0.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.name)}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                    }}
                    placeholder="e.g. Senthil Kumar"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 transition ${
                      fieldErrors.name
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-slate-300 focus:ring-[#176AC4] focus:border-[#176AC4]'
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Phone & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      aria-required="true"
                      aria-invalid={Boolean(fieldErrors.phone)}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                      }}
                      placeholder="e.g. 94432 11223"
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 transition ${
                        fieldErrors.phone
                          ? 'border-red-400 focus:ring-red-400'
                          : 'border-slate-300 focus:ring-[#176AC4] focus:border-[#176AC4]'
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-[11px] text-red-600 mt-1 font-medium">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      aria-invalid={Boolean(fieldErrors.email)}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                      }}
                      placeholder="e.g. senthil@example.com"
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 transition ${
                        fieldErrors.email
                          ? 'border-red-400 focus:ring-red-400'
                          : 'border-slate-300 focus:ring-[#176AC4] focus:border-[#176AC4]'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-[11px] text-red-600 mt-1 font-medium">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>

                {/* Topic / Subject */}
                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-bold text-slate-700 mb-1">
                    Enquiry Topic <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176AC4] focus:border-[#176AC4] transition"
                  >
                    <option value="General Assistance">General Information & Assistance</option>
                    <option value="Business Listing Support">Business Listing & Verification Support</option>
                    <option value="Advertising Packages">Commercial Advertising & Packages</option>
                    <option value="Franchise Inquiry">Vellore City Franchise & Partner Opportunities</option>
                    <option value="Bug Report / Feedback">Technical Feedback & Report Issue</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="contact-message" className="block text-xs font-bold text-slate-700 mb-1">
                    Detailed Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.message)}
                    rows={4}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (fieldErrors.message) setFieldErrors({ ...fieldErrors, message: '' });
                    }}
                    placeholder="Tell us what you need help with. If you are inquiring about a specific business, please include its name or locality."
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 transition ${
                      fieldErrors.message
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-slate-300 focus:ring-[#176AC4] focus:border-[#176AC4]'
                    }`}
                  />
                  {fieldErrors.message && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{fieldErrors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-5 bg-[#176AC4] hover:bg-blue-600 disabled:bg-blue-300 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Your Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Message to Vellore Desk</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-500 text-center mt-2">
                  🔒 <strong>Privacy Notice:</strong> Your contact information is used by our Vellore regional desk and authorized service coordinators to address your inquiry. We do not sell your contact details.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
