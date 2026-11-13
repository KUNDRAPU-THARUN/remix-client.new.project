import React, { useState } from 'react';
import { CityConfig } from '../../types';
import { EventCategory, EventSubmissionPayload } from '../../types/community';
import { communityService } from '../../services/communityService';
import { X, AlertCircle, CheckCircle, Calendar, ShieldCheck, MapPin } from 'lucide-react';

interface EventSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: CityConfig;
  onEventSubmitted?: () => void;
}

const EVENT_CATEGORIES: { id: EventCategory; label: string }[] = [
  { id: 'cultural', label: 'Cultural & Music' },
  { id: 'education', label: 'Education & Workshops' },
  { id: 'business', label: 'Business & Conferences' },
  { id: 'sports', label: 'Sports & Tournaments' },
  { id: 'entertainment', label: 'Entertainment & Festivities' },
  { id: 'other', label: 'Community Gatherings' },
];

export const EventSubmissionModal: React.FC<EventSubmissionModalProps> = ({
  isOpen,
  onClose,
  currentCity,
  onEventSubmitted,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('cultural');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [locality, setLocality] = useState(
    currentCity.localities[1]?.name || 'Katpadi'
  );
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeDisplay, setTimeDisplay] = useState('09:30 AM – 05:00 PM IST');
  const [isFree, setIsFree] = useState(true);
  const [entryFee, setEntryFee] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerContact, setOrganizerContact] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [description, setDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    if (!startDate || isNaN(Date.parse(startDate))) {
      setSubmitting(false);
      setErrorMessage('Please provide a valid start date and time.');
      return;
    }

    const payload: EventSubmissionPayload = {
      cityId: currentCity.id,
      title,
      category,
      description,
      venueName,
      venueAddress,
      locality,
      startDate: new Date(startDate).toISOString(),
      endDate: endDate && !isNaN(Date.parse(endDate)) ? new Date(endDate).toISOString() : undefined,
      timeDisplay,
      organizerName,
      organizerContact: organizerContact ? organizerContact : undefined,
      registrationUrl: registrationUrl ? registrationUrl : undefined,
      isFree,
      entryFee: isFree ? undefined : entryFee,
    };

    const res = await communityService.submitEvent(payload);
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
    setSubmittedId(res.event?.id || 'SUBMITTED');
    onEventSubmitted?.();
  };

  const handleReset = () => {
    setTitle('');
    setVenueName('');
    setVenueAddress('');
    setStartDate('');
    setEndDate('');
    setDescription('');
    setOrganizerName('');
    setOrganizerContact('');
    setRegistrationUrl('');
    setEntryFee('');
    setIsFree(true);
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
      aria-labelledby="event-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition cursor-pointer"
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
              {isDuplicate ? 'Event Already Submitted' : 'Event Submitted for Verification'}
            </h3>
            {isDemoMode && (
              <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium">
                <span>Local Preview Mode (Supabase not connected)</span>
              </div>
            )}
            <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
              {isDuplicate
                ? 'An identical event was submitted recently and is pending review by our local team.'
                : 'Thank you for listing your local event. Our Vellore editorial desk will review the details and publish it to the local events calendar.'}
            </p>
            <div className="inline-block bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-xs font-mono text-gray-700 mb-6">
              Event Ref ID: <span className="font-bold text-blue-600">{submittedId}</span>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 id="event-modal-title" className="text-lg font-bold text-gray-900">
                  Submit a Local Event
                </h3>
                <p className="text-xs text-gray-500">
                  Promote cultural, academic, sports, or business events in {currentCity.name}
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
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. North Arcot Classical Carnatic Music Evening"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    {EVENT_CATEGORIES.map((c) => (
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
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Venue Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. Gandhi Nagar Cultural Hall"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Venue Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={250}
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    placeholder="e.g. Katpadi Main Road, Vellore - 632006"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Start Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    End Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Event Timings Display <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={timeDisplay}
                  onChange={(e) => setTimeDisplay(e.target.value)}
                  placeholder="e.g. 09:30 AM – 05:00 PM IST"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFree"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="isFree" className="text-xs font-semibold text-gray-800 cursor-pointer select-none">
                    Free Admission (No Ticket Required)
                  </label>
                </div>
                {!isFree && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Ticket / Entry Details
                    </label>
                    <input
                      type="text"
                      value={entryFee}
                      onChange={(e) => setEntryFee(e.target.value)}
                      placeholder="e.g. ₹150 Registration Fee / Delegate Pass"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Organizer / Host Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    placeholder="e.g. Vellore District Chamber of Commerce"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Organizer Contact (Optional)
                  </label>
                  <input
                    type="text"
                    value={organizerContact}
                    onChange={(e) => setOrganizerContact(e.target.value)}
                    placeholder="+91 81899 85559 / events@org.com"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Registration / Event URL (Optional)
                </label>
                <input
                  type="url"
                  value={registrationUrl}
                  onChange={(e) => setRegistrationUrl(e.target.value)}
                  placeholder="https://example.com/register"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  Must begin with http:// or https:// (no script/data schemes permitted).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Event Description & Agenda <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={3000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the event, target audience, schedule, speaker list, and any special attendee instructions..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
                />
                <span className="text-[10px] text-gray-400 block text-right mt-0.5">
                  {description.length}/3000 characters
                </span>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2 text-xs text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Editorial Review:</strong> Submissions are validated for authentic venues and schedules before publication in the Vellore local events directory.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Submit Event'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
