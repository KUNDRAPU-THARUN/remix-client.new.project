import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  Sparkles, 
  Upload, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Listing } from '../types';
import { CHITTOOR_AREAS, CHITTOOR_CATEGORIES } from '../data/mockData';
import { generateAdCopy } from '../services/aiService';

interface PostAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddListing: (newListing: Listing) => void;
  onNavigateToDashboard?: () => void;
}

export const PostAdModal: React.FC<PostAdModalProps> = ({
  isOpen,
  onClose,
  onAddListing,
  onNavigateToDashboard,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CHITTOOR_CATEGORIES[0].id);
  const [area, setArea] = useState(CHITTOOR_AREAS[1].id);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [whatsapp, setWhatsapp] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [servicesInput, setServicesInput] = useState('');
  const [timings, setTimings] = useState('Mon - Sat: 9:00 AM - 8:00 PM');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleAIAssist = async () => {
    if (!title.trim()) {
      alert('Please enter your business or ad title first to generate description.');
      return;
    }
    setIsGeneratingAI(true);
    try {
      const catObj = CHITTOOR_CATEGORIES.find((c) => c.id === category);
      const areaObj = CHITTOOR_AREAS.find((a) => a.id === area);
      const generated = await generateAdCopy({
        title,
        category: catObj?.name || category,
        area: areaObj?.name || area,
        highlights: servicesInput || 'Prompt service, verified quality, affordable pricing in Chittoor',
        phone: phone || '+91 94400 00000',
      });
      setDescription(generated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !phone.trim() || !address.trim()) return;

    const services = servicesInput
      ? servicesInput.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Verified Service', 'Customer Support'];

    const newListing: Listing = {
      id: `ch-user-${Date.now()}`,
      title: title.trim(),
      category,
      area,
      address: address.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.replace(/[^0-9]/g, ''),
      description: description.trim() || `${title} offers top-quality local services in ${area}, Chittoor. Contact directly for prices and booking.`,
      rating: 5.0,
      reviewsCount: 1,
      isVerified: true,
      isFeatured: false,
      priceRange: priceRange.trim() || 'Best Market Rate',
      services,
      timings: timings.trim() || 'Daily: 9:00 AM - 8:00 PM',
      status: 'Active', // Auto-approval in dev mode
      viewsCount: 1,
      images: [
        imageUrl.trim() ||
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
      ],
      reviews: [
        {
          id: `rev-${Date.now()}`,
          author: 'ChittoorAds Verification Desk',
          rating: 5,
          comment: 'New verified business listed on ChittoorAds portal. Active contact details verified.',
          date: 'Just now',
          verifiedPurchase: true,
        },
      ],
      postedDate: new Date().toISOString().split('T')[0],
      badge: 'Newly Listed',
    };

    onAddListing(newListing);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 font-heading flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-red-600" />
              <span>Post Free Business Ad on ChittoorAds</span>
            </h3>
            <p className="text-xs text-slate-500">
              Reach thousands of local customers in Chittoor, Kanipakam & nearby mandals for free!
            </p>
          </div>

          <button
            onClick={() => { setSubmitted(false); onClose(); }}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        {submitted ? (
          <div className="p-8 sm:p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black text-slate-900 font-heading">
              Ad Submitted Successfully!
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your ad has been submitted successfully! It is currently under review by our team and will be visible on the site shortly (Auto-Approved as <strong className="text-emerald-700">Live</strong> in Test Mode).
            </p>
            
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              {onNavigateToDashboard && (
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    onClose();
                    onNavigateToDashboard();
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
                >
                  View in My Dashboard →
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
              >
                Close & Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Business / Service Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sree Balaji AC Service & Electricals"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-hidden font-medium"
              />
            </div>

            {/* Category and Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-hidden bg-white"
                >
                  {CHITTOOR_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.nameTe})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Chittoor Locality / Area *
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-hidden bg-white"
                >
                  {CHITTOOR_AREAS.filter((a) => a.id !== 'all').map((ar) => (
                    <option key={ar.id} value={ar.id}>
                      {ar.name} ({ar.landmark})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone and WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Calling Phone Number *
                </label>
                <div className="flex items-center px-3 rounded-xl border border-slate-200 focus-within:border-red-500">
                  <Phone className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 94402 12345"
                    className="w-full py-2.5 text-sm outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  WhatsApp Number (Optional)
                </label>
                <div className="flex items-center px-3 rounded-xl border border-slate-200 focus-within:border-red-500">
                  <MessageSquare className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="e.g. 919440212345"
                    className="w-full py-2.5 text-sm outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Full Address & Landmark in Chittoor *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Beside Clock Tower, Gandhi Road, Chittoor - 517001"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-hidden font-medium"
              />
            </div>

            {/* Price & Timings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Pricing / Starting Fee
                </label>
                <input
                  type="text"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  placeholder="e.g. Starting ₹299 / Wholesale Rates"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Working Hours / Timings
                </label>
                <input
                  type="text"
                  value={timings}
                  onChange={(e) => setTimings(e.target.value)}
                  placeholder="e.g. Daily: 8:00 AM - 9:00 PM"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-hidden"
                />
              </div>
            </div>

            {/* Services / Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Services Offered (comma separated)
              </label>
              <input
                type="text"
                value={servicesInput}
                onChange={(e) => setServicesInput(e.target.value)}
                placeholder="e.g. Emergency Repairs, Doorstep Service, Genuine Spares, 24x7 Pickup"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-hidden"
              />
            </div>

            {/* Description with AI Assist */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Description / Ad Content
                </label>
                <button
                  type="button"
                  onClick={handleAIAssist}
                  disabled={isGeneratingAI}
                  className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isGeneratingAI ? 'Writing...' : 'Auto-Write with AI'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what makes your business great in Chittoor, special discounts, quality guarantees..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-hidden"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Photo URL (optional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/shop-photo.jpg (Leave empty for default category photo)"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-hidden"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Publish Free Ad to Chittoor Directory</span>
              </button>
              <p className="text-[11px] text-slate-500 text-center mt-2">
                100% Free forever. No listing charges. Instant public visibility across AP-03.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
