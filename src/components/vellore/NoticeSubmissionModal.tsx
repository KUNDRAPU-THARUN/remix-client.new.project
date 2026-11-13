import React, { useState } from 'react';
import { CityConfig } from '../../types';
import { NoticeCategory, NoticeSubmissionPayload } from '../../types/community';
import { communityService } from '../../services/communityService';
import { X, AlertCircle, CheckCircle, Bell, ShieldCheck } from 'lucide-react';

interface NoticeSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: CityConfig;
  onNoticeSubmitted?: () => void;
}

const NOTICE_CATEGORIES: { id: NoticeCategory; label: string }[] = [
  { id: 'community', label: 'Community & Social' },
  { id: 'education', label: 'Education & Student Notices' },
  { id: 'public_notice', label: 'Public & Civic Notices' },
  { id: 'jobs', label: 'Local Jobs & Vacancies' },
  { id: 'lost_found', label: 'Lost & Found' },
  { id: 'other', label: 'Other Announcements' },
];

export const NoticeSubmissionModal: React.FC<NoticeSubmissionModalProps> = ({
  isOpen,
  onClose,
  currentCity,
  onNoticeSubmitted,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('community');
  const [content, setContent] = useState('');
  const [locality, setLocality] = useState(
    currentCity.localities[1]?.name || 'Katpadi'
  );
  const [organizerName, setOrganizerName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [showContact, setShowContact] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Keyboard accessibility: close modal on Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    const payload: NoticeSubmissionPayload = {
      cityId: currentCity.id,
      title,
      category,
      content,
      locality,
      organizerName,
      contactPhone: contactPhone ? contactPhone : undefined,
      contactEmail: contactEmail ? contactEmail : undefined,
      showContact,
    };

    const res = await communityService.submitNotice(payload);
    setSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Submission failed. Please check inputs.');
      return;
    }

    if (res.isDuplicate) {
      setIsDuplicate(true);
    }
    if (res.isDemoMode) {
      setIsDemoMode(true);
    }
    setSubmittedId(res.notice?.id || 'SUBMITTED');
    onNoticeSubmitted?.();
  };

  const handleReset = () => {
    setTitle('');
    setContent('');
    setOrganizerName('');
    setContactPhone('');
    setContactEmail('');
    setSubmittedId(null);
    setErrorMessage(null);
    setIsDuplicate(false);
    setIsDemoMode(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notice-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
        <button
          onClick={handleReset}
          className="absolute top-3.5 right-3.5 p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedId ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isDuplicate ? 'Notice Already Submitted' : 'Notice Submitted for Review'}
            </h3>
            {isDemoMode && (
              <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium">
                <span>Local Preview Mode (Supabase not connected)</span>
              </div>
            )}
            <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
              {isDuplicate
                ? 'An identical notice was recently received. It is queued for review by the Vellore community desk.'
                : 'Thank you for contributing. Your notice has been logged and sent to the Vellore local moderation desk for verification before public listing.'}
            </p>
            <div className="inline-block bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-xs font-mono text-gray-700 mb-6">
              Reference ID: <span className="font-bold text-blue-600">{submittedId}</span>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition cursor-pointer flex items-center justify-center"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 id="notice-modal-title" className="text-lg font-bold text-gray-900">
                  Post a Community Notice
                </h3>
                <p className="text-xs text-gray-500">
                  Civic updates, resident associations, student notices for {currentCity.name}
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Notice Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sathuvachari Residents Cleanliness Drive"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[44px]"
                />
                <span className="text-[10px] text-gray-400 block text-right mt-0.5">
                  {title.length}/120 characters
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as NoticeCategory)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white min-h-[44px] cursor-pointer"
                  >
                    {NOTICE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Locality in Vellore <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white min-h-[44px] cursor-pointer"
                  >
                    {currentCity.localities
                      .filter((l) => l.id !== 'all')
                      .map((loc) => (
                        <option key={loc.id} value={loc.name}>
                          {loc.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Notice Content / Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={2000}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide clear details including date, location, purpose, and relevant guidelines..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
                />
                <span className="text-[10px] text-gray-400 block text-right mt-0.5">
                  {content.length}/2000 characters
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Organizer / Desk Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    placeholder="e.g. Residents Welfare Association"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Contact Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contact Email (Optional)
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="desk@example.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="showContact"
                  checked={showContact}
                  onChange={(e) => setShowContact(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer min-h-[18px] min-w-[18px]"
                />
                <label htmlFor="showContact" className="text-xs text-gray-600 cursor-pointer select-none">
                  Display my contact phone/email publicly on the noticeboard. If unchecked, contact info is only visible to the moderation team.
                </label>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2 text-xs text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Moderation Policy:</strong> All notices are verified by our Vellore team before listing. Commercial advertisements should use the "Post Free Ad" service instead.
                </span>
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition cursor-pointer flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer flex items-center justify-center"
                >
                  {submitting ? 'Submitting...' : 'Submit Notice'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
