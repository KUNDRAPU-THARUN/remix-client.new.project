import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Star,
  User,
  ChevronLeft,
  ChevronRight,
  Database,
  Lock,
} from 'lucide-react';
import { CityId } from '../../../types';
import { FranchiseAuditLog } from '../../../services/franchiseService';
import { CITIES } from '../../../config/cities';

export interface AdminAuditPageProps {
  auditLogs: FranchiseAuditLog[];
  activeCityFilter: CityId | 'all';
  onSelectCityFilter: (cityId: CityId | 'all') => void;
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 10;

export const AdminAuditPage: React.FC<AdminAuditPageProps> = ({
  auditLogs,
  activeCityFilter,
  onSelectCityFilter,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // 1. City filter
      if (activeCityFilter !== 'all' && log.cityId !== activeCityFilter) {
        return false;
      }
      // 2. Action filter
      if (actionFilter !== 'all') {
        if (!log.action.toLowerCase().includes(actionFilter.toLowerCase())) {
          return false;
        }
      }
      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.action.toLowerCase().includes(q) ||
          log.entityId.toLowerCase().includes(q) ||
          (log.userId && log.userId.toLowerCase().includes(q)) ||
          JSON.stringify(log.details || {}).toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [auditLogs, activeCityFilter, actionFilter, searchQuery]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getActionBadge = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('approve')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Approved</span>
        </span>
      );
    }
    if (act.includes('reject')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700">
          <AlertCircle className="w-3 h-3 text-red-600" />
          <span>Rejected</span>
        </span>
      );
    }
    if (act.includes('verify')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
          <ShieldCheck className="w-3 h-3 text-blue-600" />
          <span>Verification</span>
        </span>
      );
    }
    if (act.includes('feature')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">
          <Star className="w-3 h-3 text-amber-600" />
          <span>Featured</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 font-mono">
        <span>{action}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Immutable Platform Audit Feed</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
            Security & Moderation Audit Trail
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Append-only audit trail logging administrative decisions, listing approvals, rejections, and role activities across all regional territories.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-700 flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-500" />
            <span>Audit Entries: <strong className="text-slate-900">{auditLogs.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search action, target ID, actor..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
            >
              <option value="all">All Action Types</option>
              <option value="approve">Approvals</option>
              <option value="reject">Rejections</option>
              <option value="verify">Verification Badges</option>
              <option value="feature">Featured Toggles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Timestamp</th>
                <th className="py-3.5 px-4">Territory</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Listing ID</th>
                <th className="py-3.5 px-4">Operator / Actor</th>
                <th className="py-3.5 px-4 sm:px-6">Details / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No audit records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const cityConfig = CITIES[log.cityId];
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{cityConfig.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({cityConfig.code})</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-800 text-[11px]">
                        {log.entityId.length > 16 ? `${log.entityId.substring(0, 16)}...` : log.entityId}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-[11px]">
                        {log.userId || 'system'}
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 max-w-xs truncate text-slate-500 text-[11px]">
                        {typeof log.details === 'object'
                          ? JSON.stringify(log.details)
                          : String(log.details || '—')}
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
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)}
              </span>{' '}
              of <span className="font-bold text-slate-800">{filteredLogs.length}</span> records
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
    </div>
  );
};
