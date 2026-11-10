import React, { useState } from 'react';
import { X, Car, Calendar, Clock, MapPin, User, Phone, CheckCircle2, ShieldCheck, ArrowRight, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { CityConfig } from '../types';
import { enquiryService } from '../services/enquiryService';
import { validateIndianMobile } from '../utils/contactValidation';

interface CabBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: CityConfig;
}

type TripType = 'local' | 'outstation_oneway' | 'outstation_round' | 'airport';

interface VehicleOption {
  id: string;
  name: string;
  type: string;
  capacity: string;
  idealFor: string;
  badge?: string;
}

const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: 'sedan',
    name: 'Prime Sedan',
    type: 'Dzire / Etios / Aura',
    capacity: '4 Passengers • 2 Bags',
    idealFor: 'Comfortable family & business trips',
    badge: 'Most Popular',
  },
  {
    id: 'suv',
    name: 'Prime SUV',
    type: 'Innova / Ertiga / Carens',
    capacity: '6-7 Passengers • 4 Bags',
    idealFor: 'Group travel, outstation & temple visits',
    badge: 'Spacious',
  },
  {
    id: 'hatchback',
    name: 'Economy Hatchback',
    type: 'WagonR / Tiago / Swift',
    capacity: '4 Passengers • 1-2 Bags',
    idealFor: 'Budget city travel & quick station drops',
  },
  {
    id: 'tempo',
    name: 'Tempo Traveller',
    type: 'Force 12-17 Seater AC',
    capacity: '12-16 Passengers • Large Luggage',
    idealFor: 'Weddings, pilgrimages & corporate groups',
  },
];

export const CabBookingModal: React.FC<CabBookingModalProps> = ({
  isOpen,
  onClose,
  currentCity,
}) => {
  const [tripType, setTripType] = useState<TripType>('local');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [journeyDate, setJourneyDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [journeyTime, setJourneyTime] = useState('09:00');
  const [selectedVehicle, setSelectedVehicle] = useState('sedan');
  const [passengers, setPassengers] = useState('2');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOfflineResult, setIsOfflineResult] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!customerName.trim() || customerName.trim().length < 2) {
      errors.name = 'Please enter your full name (at least 2 characters).';
    }

    const mobileCheck = validateIndianMobile(customerPhone);
    if (!mobileCheck.isValid) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number for operator callback.';
    }

    if (!pickupLocation.trim() || pickupLocation.trim().length < 3) {
      errors.pickup = 'Please provide a specific pickup location (at least 3 characters).';
    }

    if (!dropLocation.trim() || dropLocation.trim().length < 3) {
      errors.drop = 'Please provide a specific destination / drop location (at least 3 characters).';
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (journeyDate < todayStr) {
      errors.date = 'Please select today or a future journey date.';
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

    const tripLabels: Record<TripType, string> = {
      local: 'Local City Ride',
      outstation_oneway: 'Outstation One-Way',
      outstation_round: 'Outstation Round-Trip',
      airport: 'Airport Transfer',
    };

    const vehicleObj = VEHICLE_OPTIONS.find((v) => v.id === selectedVehicle);

    const detailedMessage = `[CAB_BOOKING_ENQUIRY]
Trip Type: ${tripLabels[tripType]}
Pickup: ${pickupLocation.trim()}
Drop: ${dropLocation.trim()}
Date: ${journeyDate} at ${journeyTime}
Vehicle Preference: ${vehicleObj?.name || selectedVehicle} (${vehicleObj?.type || ''})
Passengers: ${passengers}
${notes.trim() ? `Customer Notes: ${notes.trim()}` : ''}
* Note: Service enquiry for tariff & driver dispatch quotation.`.trim();

    const res = await enquiryService.submitGeneralLead({
      cityId: currentCity.id,
      categoryId: 'cab-services',
      areaId: 'all',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      message: detailedMessage,
    });

    setIsSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setIsOfflineResult(!res.persisted);
      setBookingRef(res.persisted && res.leadId ? res.leadId : '');
      setIsSuccess(true);
      setFieldErrors({});
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setIsOfflineResult(false);
    setBookingRef('');
    setErrorMessage('');
    setFieldErrors({});
    onClose();
  };

  return (
    <div
      onClick={handleResetAndClose}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cab-booking-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: currentCity.theme.primaryColor }}
            >
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="cab-booking-title" className="text-base sm:text-lg font-black font-heading text-white">
                  Book a Verified Cab
                </h3>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: currentCity.theme.primaryColor }}
                >
                  {currentCity.code}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Local city, outstation & airport taxi services in {currentCity.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            title="Close dialog"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  {isOfflineResult ? 'Cab Enquiry (Demo Mode)' : 'Cab Enquiry Received (Free Callback)'}
                </span>
                <h4 className="text-2xl font-black text-slate-900 font-heading mt-2">
                  {bookingRef ? `Enquiry Ref: ${bookingRef}` : isOfflineResult ? 'Cab Enquiry Stored Locally' : 'Cab Enquiry Registered'}
                </h4>
                {isOfflineResult ? (
                  <p className="text-xs sm:text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 max-w-md mx-auto mt-2 leading-relaxed">
                    Thank you, <strong className="text-amber-950">{customerName}</strong>! Your cab enquiry has been stored locally in preview demo mode. Live vehicle dispatch requires an active server database connection.
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                    Thank you, <strong className="text-slate-900">{customerName}</strong>! Your cab enquiry has been registered with taxi partners and our regional transport desk in {currentCity.name}. An authorized operator or regional desk coordinator will call you at <strong className="text-slate-900">{customerPhone}</strong> within 10-15 minutes with available vehicles, fixed fares, and confirmation details.
                  </p>
                )}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-left text-xs space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Pickup:</span>
                  <span className="font-semibold text-slate-800">{pickupLocation}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Destination:</span>
                  <span className="font-semibold text-slate-800">{dropLocation}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Date & Time:</span>
                  <span className="font-semibold text-slate-800">{journeyDate} at {journeyTime}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Vehicle:</span>
                  <span className="font-semibold text-slate-800">{VEHICLE_OPTIONS.find((v) => v.id === selectedVehicle)?.name}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs cursor-pointer"
                  style={{ backgroundColor: currentCity.theme.primaryColor }}
                >
                  Back to {currentCity.brandName}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {errorMessage && (
                <div
                  role="alert"
                  className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage('')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 underline hover:text-rose-950 cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              {/* Trip Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Select Trip Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'local', label: 'Local City' },
                      { id: 'outstation_oneway', label: 'One-Way Outstation' },
                      { id: 'outstation_round', label: 'Round-Trip' },
                      { id: 'airport', label: 'Airport Transfer' },
                    ] as const
                  ).map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setTripType(t.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        tripType === t.id
                          ? 'border-transparent text-white shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                      style={{
                        backgroundColor: tripType === t.id ? currentCity.theme.primaryColor : undefined,
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pickup & Drop Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cab-pickup-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Pickup Location *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="cab-pickup-input"
                      type="text"
                      required
                      disabled={isSubmitting}
                      value={pickupLocation}
                      onChange={(e) => {
                        setPickupLocation(e.target.value);
                        if (fieldErrors.pickup) {
                          setFieldErrors((prev) => ({ ...prev, pickup: '' }));
                        }
                      }}
                      placeholder={`e.g. Katpadi Station / CMC Campus`}
                      aria-invalid={!!fieldErrors.pickup}
                      aria-describedby={fieldErrors.pickup ? 'cab-pickup-error' : undefined}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border ${
                        fieldErrors.pickup ? 'border-red-500 bg-red-50/40' : 'border-slate-200'
                      } text-xs sm:text-sm font-medium focus:outline-hidden focus:border-slate-800 disabled:opacity-60`}
                    />
                  </div>
                  {fieldErrors.pickup && (
                    <p id="cab-pickup-error" role="alert" className="text-[11px] font-medium text-red-600 mt-1">
                      {fieldErrors.pickup}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="cab-drop-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Drop / Destination *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-emerald-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="cab-drop-input"
                      type="text"
                      required
                      disabled={isSubmitting}
                      value={dropLocation}
                      onChange={(e) => {
                        setDropLocation(e.target.value);
                        if (fieldErrors.drop) {
                          setFieldErrors((prev) => ({ ...prev, drop: '' }));
                        }
                      }}
                      placeholder={`e.g. Chennai Airport / Sripuram Temple`}
                      aria-invalid={!!fieldErrors.drop}
                      aria-describedby={fieldErrors.drop ? 'cab-drop-error' : undefined}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border ${
                        fieldErrors.drop ? 'border-red-500 bg-red-50/40' : 'border-slate-200'
                      } text-xs sm:text-sm font-medium focus:outline-hidden focus:border-slate-800 disabled:opacity-60`}
                    />
                  </div>
                  {fieldErrors.drop && (
                    <p id="cab-drop-error" role="alert" className="text-[11px] font-medium text-red-600 mt-1">
                      {fieldErrors.drop}
                    </p>
                  )}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="cab-date-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Journey Date *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="cab-date-input"
                      type="date"
                      required
                      disabled={isSubmitting}
                      min={new Date().toISOString().split('T')[0]}
                      value={journeyDate}
                      onChange={(e) => {
                        setJourneyDate(e.target.value);
                        if (fieldErrors.date) {
                          setFieldErrors((prev) => ({ ...prev, date: '' }));
                        }
                      }}
                      aria-invalid={!!fieldErrors.date}
                      aria-describedby={fieldErrors.date ? 'cab-date-error' : undefined}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border ${
                        fieldErrors.date ? 'border-red-500 bg-red-50/40' : 'border-slate-200'
                      } text-xs sm:text-sm font-medium focus:outline-hidden focus:border-slate-800 disabled:opacity-60`}
                    />
                  </div>
                  {fieldErrors.date && (
                    <p id="cab-date-error" role="alert" className="text-[11px] font-medium text-red-600 mt-1">
                      {fieldErrors.date}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="cab-time-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Pickup Time *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="cab-time-input"
                      type="time"
                      required
                      disabled={isSubmitting}
                      value={journeyTime}
                      onChange={(e) => setJourneyTime(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-slate-800 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="cab-passengers-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Passengers
                  </label>
                  <select
                    id="cab-passengers-select"
                    disabled={isSubmitting}
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-slate-800 bg-white disabled:opacity-60"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, '10+', '15+'].map((num) => (
                      <option key={num} value={num}>
                        {num} Passenger{num === 1 ? '' : 's'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vehicle Preference Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Select Vehicle Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {VEHICLE_OPTIONS.map((v) => {
                    const isSelected = selectedVehicle === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicle(v.id)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-start justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">{v.name}</span>
                            {v.badge && (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white px-1.5 py-0.2 rounded">
                                {v.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{v.type}</p>
                          <p className="text-[11px] text-slate-400 mt-1">{v.capacity}</p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label htmlFor="cab-name-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="cab-name-input"
                      type="text"
                      required
                      disabled={isSubmitting}
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (fieldErrors.name) {
                          setFieldErrors((prev) => ({ ...prev, name: '' }));
                        }
                      }}
                      placeholder="e.g. Ramesh Kumar"
                      aria-invalid={!!fieldErrors.name}
                      aria-describedby={fieldErrors.name ? 'cab-name-error' : undefined}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border ${
                        fieldErrors.name ? 'border-red-500 bg-red-50/40' : 'border-slate-200'
                      } text-xs sm:text-sm font-medium focus:outline-hidden focus:border-slate-800 disabled:opacity-60`}
                    />
                  </div>
                  {fieldErrors.name && (
                    <p id="cab-name-error" role="alert" className="text-[11px] font-medium text-red-600 mt-1">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="cab-phone-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Mobile Number (Callback) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="cab-phone-input"
                      type="tel"
                      required
                      disabled={isSubmitting}
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        if (fieldErrors.phone) {
                          setFieldErrors((prev) => ({ ...prev, phone: '' }));
                        }
                      }}
                      placeholder="10-digit mobile number"
                      aria-invalid={!!fieldErrors.phone}
                      aria-describedby={fieldErrors.phone ? 'cab-phone-error' : undefined}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border ${
                        fieldErrors.phone ? 'border-red-500 bg-red-50/40' : 'border-slate-200'
                      } text-xs sm:text-sm font-medium focus:outline-hidden focus:border-slate-800 disabled:opacity-60`}
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p id="cab-phone-error" role="alert" className="text-[11px] font-medium text-red-600 mt-1">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label htmlFor="cab-notes-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Special Notes or Flight / Train Number (Optional)
                </label>
                <input
                  id="cab-notes-input"
                  type="text"
                  disabled={isSubmitting}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Need roof carrier, flight arrives at 2:30 PM, senior citizen traveling"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-slate-800 disabled:opacity-60"
                />
              </div>

              {/* Privacy Notice Microcopy */}
              <div className="flex items-start gap-1.5 pt-1 text-[11px] text-slate-500 leading-snug">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy Notice:</strong> Your travel requirement is shared with authorized taxi operators or our regional transport coordinators in {currentCity.name} to arrange a quote and callback. We do not sell your contact details.
                </span>
              </div>

              {/* Trust Badge & Submit Button */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No upfront payment • Licensed & local operators • Free quote callback (Not an instant reservation)</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                  style={{ backgroundColor: currentCity.theme.primaryColor }}
                >
                  {isSubmitting ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Request Cab Callback & Quote</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

