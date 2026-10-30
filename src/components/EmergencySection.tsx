import React from 'react';
import { 
  X, 
  PhoneCall, 
  AlertTriangle, 
  ShieldAlert, 
  Flame, 
  Zap, 
  Building, 
  Ambulance, 
  Clock 
} from 'lucide-react';
import { CHITTOOR_EMERGENCY_CONTACTS } from '../data/mockData';

interface EmergencySectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySection: React.FC<EmergencySectionProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleDial = (phone: string) => {
    const cleanNumber = phone.split('/')[0].trim().replace(/[^0-9]/g, '');
    window.location.href = `tel:${cleanNumber}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-red-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <PhoneCall className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl font-heading text-white">
                Chittoor District 24x7 Emergency Helplines
              </h3>
              <p className="text-xs text-red-100">
                చిత్తూరు అత్యవసర హెల్ప్‌లైన్ నంబర్లు • Tap to dial immediately
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 bg-slate-50">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-amber-900 text-xs font-medium">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              For critical health emergencies on highways or within mandals, dial <strong>108</strong> directly for immediate ambulance dispatch.
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {CHITTOOR_EMERGENCY_CONTACTS.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-red-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-slate-900 font-heading">
                      {item.name}
                    </span>
                    {item.available247 && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        24x7 Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-red-700 font-semibold mt-0.5">{item.teluguName}</p>
                  <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                  {item.address && (
                    <p className="text-[11px] text-slate-400 mt-0.5">Location: {item.address}</p>
                  )}
                </div>

                <button
                  onClick={() => handleDial(item.phone)}
                  className="sm:self-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call {item.phone}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 text-center text-xs text-slate-500 shrink-0">
          Maintained as a public civic utility by ChittoorAds (AP-03)
        </div>
      </div>
    </div>
  );
};
