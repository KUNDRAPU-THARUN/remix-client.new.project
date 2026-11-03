import React, { useState, useMemo } from 'react';
import {
  Inbox,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  Clock,
  Briefcase,
  CheckCircle2,
  Calendar,
  X,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
} from 'lucide-react';
import { CityId } from '../../../types';
import { GeneralServiceRequest, CustomerEnquiry } from '../../../services/enquiryService';
import { CITIES } from '../../../config/cities';

export interface AdminEnquiriesPageProps {
  generalRequests: GeneralServiceRequest[];
  directEnquiries: CustomerEnquiry[];
  activeCityFilter: CityId | 'all';
  onSelectCityFilter: (cityId: CityId | 'all') => void;
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 8;

export const AdminEnquiriesPage: React.FC<AdminEnquiriesPageProps> = ({
  generalRequests,
  directEnquiries,
  activeCityFilter,
  onSelectCityFilter,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'direct'>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<{
    type: 'general' | 'direct';
    data: GeneralServiceRequest | CustomerEnquiry;
  } | null>(null);

  // Filter general requests
  const filteredGeneral = useMemo(() => {
    return generalRequests.filter((req) => {
      if (activeCityFilter !== 'all' && req.cityId !== activeCityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          req.customerName.toLowerCase().includes(q) ||
          req.customerPhone.includes(q) ||
          req.categoryId.toLowerCase().includes(q) ||
          (req.message && req.message.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [generalRequests, activeCityFilter, searchQuery]);

  // Filter direct enquiries
  const filteredDirect = useMemo(() => {
    return directEnquiries.filter((enq) => {
      if (activeCityFilter !== 'all' && (enq.cityId || 'chittoor') !== activeCityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          enq.customerName.toLowerCase().includes(q) ||
          enq.customerPhone.includes(q) ||
          (enq.businessName && enq.businessName.toLowerCase().includes(q)) ||
          enq.message.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [directEnquiries, activeCityFilter, searchQuery]);

  const activeList = activeTab === 'general' ? filteredGeneral : filteredDirect;
  const totalPages = Math.ceil(activeList.length / ITEMS_PER_PAGE) || 1;
  const paginatedList = activeList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Inbox className="w-3.5 h-3.5" />
            <span>Lead Dispatch & Customer Connect</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
            Multi-City Customer Inquiries
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Audit customer enquiries submitted across Chittoor, Vellore, and Bengaluru. Both general category quote requests and direct business leads are tracked with territory isolation.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-700">
            Total Leads:{' '}
            <span className="text-slate-900 font-black">
              {generalRequests.length + directEnquiries.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Dual Inboxes Tabs */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setActiveTab('general');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'general'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>General Service Leads</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
                {generalRequests.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('direct');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'direct'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Direct Storefront Enquiries</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
                {directEnquiries.length}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search customer, phone, message..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Customer Name & Contact</th>
                <th className="py-3.5 px-4">Territory</th>
                <th className="py-3.5 px-4">Target / Category</th>
                <th className="py-3.5 px-4">Requirement / Message</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No inquiries match the current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item: any, idx) => {
                  const isGeneral = activeTab === 'general';
                  const customerName = item.customerName;
                  const customerPhone = item.customerPhone;
                  const cityId: CityId = (item.cityId || 'chittoor') as CityId;
                  const cityConfig = CITIES[cityId] || CITIES['chittoor'];
                  const categoryOrTarget = isGeneral ? item.categoryId : (item.businessName || 'Direct Storefront');
                  const message = item.message || 'General enquiry request';
                  const dateStr = item.createdAt;

                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-bold text-slate-900">{customerName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{customerPhone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{cityConfig.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({cityConfig.code})</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800">
                        {categoryOrTarget}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="truncate text-slate-600">{message}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                        {dateStr ? new Date(dateStr).toLocaleDateString() : '—'}
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLead({ type: activeTab, data: item })}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                        >
                          View Lead
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="font-bold text-slate-800">
                {Math.min(currentPage * ITEMS_PER_PAGE, activeList.length)}
              </span>{' '}
              of <span className="font-bold text-slate-800">{activeList.length}</span> leads
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-white transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-800">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-white transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  <Inbox className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-heading">
                    {selectedLead.type === 'general' ? 'General Service Lead' : 'Direct Merchant Lead'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Lead ID: {(selectedLead.data as any).id || '—'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 space-y-2 border border-slate-100">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Customer Contact
                </div>
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Customer Name</span>
                    <span className="font-bold">
                      {selectedLead.data.customerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Phone Number</span>
                    <span className="font-bold">
                      {selectedLead.data.customerPhone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 space-y-1.5 border border-slate-100">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Requirement Details
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {selectedLead.type === 'general'
                    ? (selectedLead.data as GeneralServiceRequest).message || 'No additional message.'
                    : (selectedLead.data as CustomerEnquiry).message}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px]">
                  Protected by privacy safeguards. Dispatched strictly to verified regional merchants.
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
