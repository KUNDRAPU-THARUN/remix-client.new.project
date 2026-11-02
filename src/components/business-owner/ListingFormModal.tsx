import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Sparkles,
  Upload,
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Building2,
  Mail,
  Tag,
} from 'lucide-react';
import { Listing, UserAccount, CityConfig } from '../../types';
import { CHITTOOR_AREAS, CHITTOOR_CATEGORIES } from '../../data/mockData';
import { generateAdCopy } from '../../services/aiService';
import { storageService } from '../../services/storageService';

export interface ListingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (listingData: Partial<Listing>) => Promise<{ success: boolean; error?: string }>;
  initialListing?: Listing | null;
  currentUser: UserAccount;
  currentCity?: CityConfig;
}

export const ListingFormModal: React.FC<ListingFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialListing,
  currentUser,
  currentCity,
}) => {
  const isEditing = Boolean(initialListing);
  const localities = currentCity?.localities || CHITTOOR_AREAS;
  const cityName = currentCity?.name || 'Chittoor';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CHITTOOR_CATEGORIES[0].id);
  const [area, setArea] = useState(localities[1]?.id || 'gandhi-road');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [servicesInput, setServicesInput] = useState('');
  const [timings, setTimings] = useState('Daily: 9:00 AM - 8:00 PM');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Populate fields if editing
  useEffect(() => {
    if (initialListing) {
      setTitle(initialListing.title || '');
      setCategory(initialListing.category || CHITTOOR_CATEGORIES[0].id);
      setArea(initialListing.area || localities[1]?.id || 'gandhi-road');
      setAddress(initialListing.address || '');
      setPhone(initialListing.phone || '+91 ');
      setWhatsapp(initialListing.whatsapp || '');
      setEmail(initialListing.email || '');
      setPriceRange(initialListing.priceRange || '');
      setServicesInput(initialListing.services?.join(', ') || '');
      setTimings(initialListing.timings || 'Daily: 9:00 AM - 8:00 PM');
      setDescription(initialListing.description || '');
      setImageUrl(initialListing.images?.[0] || '');
    } else {
      // Reset form
      setTitle('');
      setCategory(CHITTOOR_CATEGORIES[0].id);
      setArea(localities[1]?.id || 'gandhi-road');
      setAddress('');
      setPhone('+91 ');
      setWhatsapp('');
      setEmail(currentUser.email || '');
      setPriceRange('');
      setServicesInput('');
      setTimings('Daily: 9:00 AM - 8:00 PM');
      setDescription('');
      setImageUrl('');
    }
    setFormError('');
    setIsSuccess(false);
  }, [initialListing, isOpen, currentUser.email, localities]);

  if (!isOpen) return null;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    setUploadError('');
    try {
      const res = await storageService.uploadBusinessImage(
        file,
        initialListing?.cityId || currentCity?.id || 'chittoor',
        initialListing?.id || 'new'
      );
      if (res.error) {
        setUploadError(res.error);
      } else if (res.url) {
        setImageUrl(res.url);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAIAssist = async () => {
    if (!title.trim()) {
      alert('Please enter your business title first so the AI can craft your description.');
      return;
    }
    setIsGeneratingAI(true);
    try {
      const catObj = CHITTOOR_CATEGORIES.find((c) => c.id === category);
      const areaObj = localities.find((a) => a.id === area);
      const generated = await generateAdCopy({
        title,
        category: catObj?.name || category,
        area: areaObj?.name || area,
        highlights: servicesInput || 'Reliable service, authentic quality, verified pricing',
        phone: phone || '+91 94400 00000',
      });
      setDescription(generated);
    } catch (err) {
      console.warn('AI Copywriting generation fallback:', err);
      setDescription(
        `Welcome to ${title}, your trusted destination for quality ${category} services in ${cityName}. We offer authentic products, friendly customer service, and reliable market rates. Visit us today or call ${phone} for immediate assistance.`
      );
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!title.trim() || title.trim().length < 3) {
      setFormError('Please enter a valid business title (at least 3 characters).');
      return;
    }
    if (!address.trim() || address.trim().length < 5) {
      setFormError('Please enter a complete street address or landmark.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setFormError('Please provide a description of your services (at least 10 characters).');
      return;
    }

    const services = servicesInput
      ? servicesInput.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    setIsSubmitting(true);

    const payload: Partial<Listing> = {
      title: title.trim(),
      category,
      area,
      address: address.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || undefined,
      email: email.trim() || undefined,
      priceRange: priceRange.trim() || 'Best Market Rate',
      services,
      timings: timings.trim() || 'Daily: 9:00 AM - 8:00 PM',
      description: description.trim(),
      cityId: initialListing?.cityId || currentCity?.id || 'chittoor',
      images: imageUrl
        ? [imageUrl]
        : ['https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80'],
    };

    try {
      const res = await onSubmit(payload);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setFormError(res.error || 'Failed to save listing. Please try again.');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black font-heading tracking-tight">
                {isEditing ? 'Edit Business Listing' : 'Post New Business Listing'}
              </h2>
              <p className="text-xs text-slate-400">
                {cityName} Directory • Registered to {currentUser.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {isSuccess ? (
          <div className="p-8 sm:p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 font-heading">
              {isEditing ? 'Listing Updated Successfully!' : 'Listing Submitted for Approval!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              {isEditing
                ? 'Your updates have been securely saved to the database.'
                : 'Your business listing is now pending review by our local city franchise. Once verified, it will be published live across the directory.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Error banner */}
            {formError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-800 font-medium">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Verification lifecycle notice */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Moderation & Quality Assurance</p>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  New submissions start in <strong>Pending Approval</strong> status. In compliance with platform trust policies, business owners cannot self-approve listings or self-grant verified badges.
                </p>
              </div>
            </div>

            {/* 1. Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>1. Business Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business / Shop Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sri Krishna Grand Restaurant"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition bg-white"
                  >
                    {CHITTOOR_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Locality / Area <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition bg-white"
                  >
                    {localities.filter((l) => l.id !== 'all').map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Gandhi Road, Near Clock Tower, Chittoor"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* 2. Contact Details */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Public Contact Channels</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 94400 12345"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="9440012345"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@business.com"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* 3. Operational Highlights */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>3. Timings, Pricing & Key Services</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price Range Indicator
                  </label>
                  <input
                    type="text"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    placeholder="e.g. ₹100 - ₹300 or Best Market Rate"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business Timings
                  </label>
                  <input
                    type="text"
                    value={timings}
                    onChange={(e) => setTimings(e.target.value)}
                    placeholder="e.g. Mon - Sat: 9:00 AM - 8:00 PM"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Key Services / Amenities (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={servicesInput}
                    onChange={(e) => setServicesInput(e.target.value)}
                    placeholder="e.g. AC Dining, Pure Ghee Sweets, Home Delivery, UPI Accepted"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* 4. Description with AI Assist */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Business Description <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAIAssist}
                  disabled={isGeneratingAI}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>{isGeneratingAI ? 'Generating Copy...' : 'AI Auto-Draft Copy'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your business specialties, background, and what makes your services unique..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition leading-relaxed"
              />
            </div>

            {/* 5. Storefront Photo Upload */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                Storefront or Banner Photo
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {imageUrl ? (
                  <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 group">
                    <img src={imageUrl} alt="Storefront preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-red-600 transition"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 text-xs font-bold text-slate-600 transition cursor-pointer">
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        <span>Uploading to Storage...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-slate-500" />
                        <span>Upload Storefront Photo (JPG/PNG &lt; 5MB)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageFileChange}
                      disabled={isUploadingImage}
                    />
                  </label>
                )}

                <p className="text-[11px] text-slate-400">
                  Uploaded photos are stored securely in Supabase Storage with signed URL verification.
                </p>
              </div>

              {uploadError && (
                <p className="text-xs text-red-600 font-medium">{uploadError}</p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Listing...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>{isEditing ? 'Save Changes' : 'Submit Listing'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

