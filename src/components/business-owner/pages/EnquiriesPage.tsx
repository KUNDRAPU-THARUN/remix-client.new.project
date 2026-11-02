import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  ShieldCheck,
  Building2,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { CustomerEnquiry } from '../../../services/enquiryService';
import { Listing, UserAccount, CityConfig } from '../../../types';
import { DashboardEmptyState } from '../DashboardEmptyState';

interface EnquiriesPageProps {
  currentUser: UserAccount;
  enquiries: CustomerEnquiry[];
  userListings: Listing[];
  currentCity?: CityConfig;
  onUpdateStatus: (enquiryId: string, status: 'pending' | 'read' | 'replied' | 'archived') => Promise<void>;
  onOpenPostAd: () => void;
}

export const EnquiriesPage: React.FC<EnquiriesPageProps> = ({
  currentUser,
  enquiries,
  userListings,
  currentCity,
  onUpdateStatus,
  onOpenPostAd,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'read' | 'replied'>('all');
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(
    enquiries[0]?.id || null
  );

  const cityName = currentCity?.name || 'Chittoor';

  const pendingCount = enquiries.filter((e) => e.status === 'pending').length;
  const repliedCount = enquiries.filter((e) => e.status === 'replied').length;
  const readCount = enquiries.filter((e) => e.status === 'read').length;

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = e.customerName.toLowerCase().includes(q);
        const matchesPhone = e.customerPhone.toLowerCase().includes(q);
        const matchesMsg = e.message.toLowerCase().includes(q);
        const matchesBiz = (e.businessName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesMsg && !matchesBiz) return false;
      }
      return true;
    });
  }, [enquiries, statusFilter, searchQuery]);

  const activeEnquiry = useMemo(() => {
    return (
      filteredEnquiries.find((e) => e.id === selectedEnquiryId) ||
      filteredEnquiries[0] ||
      null
    );
  }, [filteredEnquiries, selectedEnquiryId]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black font-heading text-slate-900 tracking-tight">
                Customer Leads & Direct Enquiries ({enquiries.length})
              </h2>
              <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-full border border-red-200">
                Encrypted & Private
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customers who clicked "Send Enquiry" on your {cityName} business profiles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Response Rate:{' '}
              <strong className="text-slate-900">
                {enquiries.length > 0
                  ? `${Math.round(((repliedCount + readCount) / enquiries.length) * 100)}%`
                  : 'N/A'}
              </strong>
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Leads ({enquiries.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending ({pendingCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('replied')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'replied'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Replied ({repliedCount})</span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads by customer name, phone..."
              aria-label="Search leads by customer name or phone"
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition"
            />
          </div>
        </div>
      </div>

      {/* 2. Split Leads Container */}
      {filteredEnquiries.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Lead Cards List (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden divide-y divide-slate-100 max-h-[75vh] overflow-y-auto">
            {filteredEnquiries.map((enq) => {
              const isSelected = activeEnquiry?.id === enq.id;
              const isPending = enq.status === 'pending';

              return (
                <div
                  key={enq.id}
                  onClick={() => setSelectedEnquiryId(enq.id)}
                  className={`p-4 transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-blue-50/80 border-l-4 border-l-blue-600'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {enq.customerName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        enq.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : enq.status === 'replied'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {enq.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    "{enq.message}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
                    <span className="font-semibold text-slate-600 truncate max-w-[160px]">
                      {enq.businessName || 'Your Business'}
                    </span>
                    <span>{new Date(enq.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Lead Detail View (7 Cols) */}
          {activeEnquiry && (
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-6 sticky top-20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    Target Listing: {activeEnquiry.businessName || 'Your Business Listing'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black font-heading text-slate-900 mt-0.5">
                    {activeEnquiry.customerName}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Received on {new Date(activeEnquiry.createdAt).toLocaleString()}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {activeEnquiry.status === 'pending' && (
                    <button
                      onClick={() => onUpdateStatus(activeEnquiry.id, 'read')}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      Mark Read
                    </button>
                  )}
                  {activeEnquiry.status !== 'replied' && (
                    <button
                      onClick={() => onUpdateStatus(activeEnquiry.id, 'replied')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      Mark Replied
                    </button>
                  )}
                </div>
              </div>

              {/* Requirement Message Box */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Customer Requirement / Inquiry Message
                </span>
                <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-100 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  "{activeEnquiry.message}"
                </div>
              </div>

              {/* Direct Follow-Up Action Buttons */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Direct Contact & Customer Conversion
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={`tel:${activeEnquiry.customerPhone.replace(/\D/g, '')}`}
                    className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call: {activeEnquiry.customerPhone}</span>
                  </a>

                  <a
                    href={`https://wa.me/91${activeEnquiry.customerPhone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                      `Hello ${activeEnquiry.customerName}, thank you for your enquiry regarding ${activeEnquiry.businessName || 'our services'} on ${cityName}Ads.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Customer</span>
                  </a>

                  {activeEnquiry.customerEmail && (
                    <a
                      href={`mailto:${activeEnquiry.customerEmail}?subject=${encodeURIComponent(
                        `Response to your inquiry on ${cityName}Ads`
                      )}`}
                      className="sm:col-span-2 p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center gap-2 transition"
                    >
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Email: {activeEnquiry.customerEmail}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Privacy and Security Notice */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-2.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Customer lead data is protected by Supabase Row Level Security (RLS) and is strictly invisible to other competing business owners.
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <DashboardEmptyState
          icon={MessageSquare}
          title={searchQuery ? 'No Matching Enquiries Found' : 'No Customer Enquiries Received Yet'}
          description={
            searchQuery
              ? `We couldn't find any inquiries matching "${searchQuery}". Try clearing your search.`
              : `When local customers visit your business profile on ${cityName}Ads and submit a query, their contact details and requirement will arrive directly in this inbox.`
          }
          actionLabel="+ Add / Optimize Listing"
          onAction={onOpenPostAd}
          secondaryActionLabel={searchQuery || statusFilter !== 'all' ? 'Reset Filters' : undefined}
          onSecondaryAction={() => {
            setSearchQuery('');
            setStatusFilter('all');
          }}
        />
      )}
    </div>
  );
};

