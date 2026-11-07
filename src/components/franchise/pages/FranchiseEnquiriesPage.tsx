import React, { useState } from 'react';
import {
  Inbox,
  Send,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  Building2,
  Calendar,
  Sparkles,
  UserCheck,
  Check,
  ArrowRight,
} from 'lucide-react';
import { CityConfig } from '../../../types';
import { CustomerEnquiry, GeneralServiceRequest } from '../../../services/enquiryService';

interface FranchiseEnquiriesPageProps {
  generalLeads: GeneralServiceRequest[];
  businessEnquiries: CustomerEnquiry[];
  currentCity: CityConfig;
  onUpdateGeneralLeadStatus: (leadId: string, status: 'pending' | 'routed' | 'contacted' | 'resolved' | 'archived') => Promise<void>;
  isLoading: boolean;
}

export const FranchiseEnquiriesPage: React.FC<FranchiseEnquiriesPageProps> = ({
  generalLeads,
  businessEnquiries,
  currentCity,
  onUpdateGeneralLeadStatus,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'direct'>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filter general leads
  const filteredGeneral = generalLeads.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.customerName.toLowerCase().includes(q) ||
        l.customerPhone.includes(q) ||
        l.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter direct enquiries
  const filteredDirect = businessEnquiries.filter((e) => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.customerName.toLowerCase().includes(q) ||
        e.customerPhone.includes(q) ||
        e.message.toLowerCase().includes(q) ||
        (e.businessName && e.businessName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleStatusChange = async (leadId: string, newStatus: 'contacted' | 'resolved' | 'archived') => {
    setUpdatingId(leadId);
    try {
      await onUpdateGeneralLeadStatus(leadId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Navigation & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Main Switcher: General Service Leads vs Direct Inquiries */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => {
                setActiveTab('general');
                setStatusFilter('all');
              }}
              className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'general' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>General Service Requests ({generalLeads.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('direct');
                setStatusFilter('all');
              }}
              className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'direct' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Direct Storefront Enquiries ({businessEnquiries.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer, phone or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-red-500"
            />
          </div>
        </div>

        {/* Territory Privacy Notice */}
        <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2.5">
          <span>Protected Lead Privacy: Leads are isolated to {currentCity.name} ({currentCity.code}) under Supabase RLS.</span>
          <span className="font-bold text-slate-700">Zero Cross-Territory Leakage</span>
        </div>
      </div>

      {/* Main Tab Content */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90">
          <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-600">Loading customer leads...</p>
        </div>
      ) : activeTab === 'general' ? (
        /* TAB 1: GENERAL SERVICE REQUESTS */
        filteredGeneral.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-slate-200/90 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-900 font-heading">
              No General Service Requests Yet
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              When residents in {currentCity.name} submit quotes via the homepage Quick Enquiry form, they will be routed here for franchise dispatch.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGeneral.map((lead) => {
              const isPending = lead.status === 'pending';
              const isContacted = lead.status === 'contacted';
              const isResolved = lead.status === 'resolved';

              return (
                <div
                  key={lead.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black text-slate-900 font-heading">
                          {lead.customerName}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                          {lead.categoryId || 'General Service'}
                        </span>
                        {lead.message.includes('[CAB_BOOKING_ENQUIRY]') && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <span>🚕</span>
                            <span>Cab Booking</span>
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          Area: {lead.areaId}
                        </span>

                        {/* Status Tag */}
                        {isPending && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            New Lead
                          </span>
                        )}
                        {isContacted && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            Contacted
                          </span>
                        )}
                        {isResolved && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Resolved
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
                        {lead.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <a
                          href={`tel:${lead.customerPhone}`}
                          className="flex items-center gap-1 font-bold text-slate-800 hover:text-red-600 transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lead.customerPhone}</span>
                        </a>

                        {lead.customerEmail && (
                          <a
                            href={`mailto:${lead.customerEmail}`}
                            className="flex items-center gap-1 text-slate-600 hover:text-red-600 transition"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{lead.customerEmail}</span>
                          </a>
                        )}

                        <span className="text-[11px] text-slate-400">
                          Received {new Date(lead.createdAt).toLocaleDateString()} at{' '}
                          {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Quick Status Update Actions */}
                    <div className="flex sm:flex-col lg:flex-row items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {isPending && (
                        <button
                          onClick={() => handleStatusChange(lead.id, 'contacted')}
                          disabled={updatingId === lead.id}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Mark Contacted</span>
                        </button>
                      )}

                      {!isResolved && (
                        <button
                          onClick={() => handleStatusChange(lead.id, 'resolved')}
                          disabled={updatingId === lead.id}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      )}

                      <a
                        href={`https://wa.me/91${lead.customerPhone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(lead.customerName)},%20we%20received%20your%20service%20quote%20request%20on%20${encodeURIComponent(currentCity.brandName)}.`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                      >
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* TAB 2: DIRECT STOREFRONT ENQUIRIES */
        filteredDirect.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-slate-200/90 shadow-xs">
            <Building2 className="w-14 h-14 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-black text-slate-900 font-heading">
              No Direct Merchant Inquiries
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Direct inquiries submitted to individual businesses in {currentCity.name} will appear here for franchise monitoring.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDirect.map((enq) => (
              <div
                key={enq.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-slate-900 font-heading">
                        {enq.customerName}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">→</span>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        {enq.businessName || 'Local Business'}
                      </span>
                      {enq.message.includes('[CLAIM_BUSINESS_REQUEST]') && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <span>🛡️</span>
                          <span>Ownership Claim</span>
                        </span>
                      )}
                      {enq.message.includes('[SUGGEST_AN_EDIT]') && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-300 flex items-center gap-1">
                          <span>🚩</span>
                          <span>Edit Suggestion</span>
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                        {enq.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {enq.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-bold text-slate-800">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{enq.customerPhone}</span>
                      </span>
                      {enq.customerEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{enq.customerEmail}</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        Sent {new Date(enq.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

