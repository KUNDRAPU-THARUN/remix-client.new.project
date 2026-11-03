import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  Building2,
  Briefcase,
  User as UserIcon,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  Mail,
  Phone,
  Calendar,
  Lock,
  Sparkles,
} from 'lucide-react';
import { UserRoleType, CityId } from '../../../types';
import { AdminUserRecord } from '../../../services/adminService';
import { CITIES } from '../../../config/cities';

export interface AdminUsersPageProps {
  users: AdminUserRecord[];
  activeCityFilter: CityId | 'all';
  onSelectCityFilter: (cityId: CityId | 'all') => void;
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 8;

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({
  users,
  activeCityFilter,
  onSelectCityFilter,
  isLoading,
}) => {
  const [roleFilter, setRoleFilter] = useState<UserRoleType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // City filter
      if (activeCityFilter !== 'all' && u.cityId && u.cityId !== activeCityFilter) {
        return false;
      }
      // Role filter
      if (roleFilter !== 'all' && u.role !== roleFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.mobile && u.mobile.includes(q))
        );
      }
      return true;
    });
  }, [users, activeCityFilter, roleFilter, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getRoleBadge = (role: UserRoleType) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-100 text-red-700">
            <Shield className="w-3 h-3 text-red-600" />
            <span>Super Admin</span>
          </span>
        );
      case 'city_franchise':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700">
            <Building2 className="w-3 h-3 text-purple-600" />
            <span>City Franchise</span>
          </span>
        );
      case 'business_owner':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
            <Briefcase className="w-3 h-3 text-emerald-600" />
            <span>Merchant</span>
          </span>
        );
      case 'customer':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
            <UserIcon className="w-3 h-3 text-slate-500" />
            <span>Customer</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Identity & Access Directory</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
            User Accounts & Roles
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Audit user accounts across customers, merchants, regional franchisees, and administrators. Roles map directly to Supabase authentication UID and <code className="text-slate-700 font-mono text-[11px]">user_roles</code> RLS policies.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-700">
            Total Users: <span className="text-slate-900 font-black">{users.length}</span>
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
              placeholder="Search by name, email, phone..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Role Pill Filters */}
          <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
            {(
              [
                { id: 'all', label: 'All Roles' },
                { id: 'super_admin', label: 'Super Admins' },
                { id: 'city_franchise', label: 'Franchisees' },
                { id: 'business_owner', label: 'Merchants' },
                { id: 'customer', label: 'Customers' },
              ] as const
            ).map((rf) => (
              <button
                key={rf.id}
                onClick={() => {
                  setRoleFilter(rf.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  roleFilter === rf.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {rf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">User / Identity</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Territory Scope</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Registered</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No user accounts match the current filters.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const initial = (user.name || user.email)[0].toUpperCase();
                  const cityConfig = user.cityId ? CITIES[user.cityId] : null;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {user.name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {cityConfig ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{cityConfig.name} ({cityConfig.code})</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">
                            Global / All Cities
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="capitalize">{user.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                        {user.registeredDate}
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="font-bold text-slate-800">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}
              </span>{' '}
              of <span className="font-bold text-slate-800">{filteredUsers.length}</span> accounts
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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                  {(selectedUser.name || selectedUser.email)[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-heading">
                    {selectedUser.name}
                  </h3>
                  <p className="text-xs text-slate-400">Account ID: {selectedUser.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 space-y-2 border border-slate-100">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Profile Credentials
                </div>
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    <span className="font-bold truncate block">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Mobile Number</span>
                    <span className="font-bold">{selectedUser.mobile || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Primary Role</span>
                    <span className="mt-0.5 block">{getRoleBadge(selectedUser.role)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Territory Bound</span>
                    <span className="font-bold">{selectedUser.cityId ? CITIES[selectedUser.cityId]?.name : 'Global (Multi-City)'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-blue-950 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Database Row-Level Security Rules</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Role assignments are persisted in <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">user_roles</code> with foreign key constraints. RLS policies evaluate <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">auth.uid()</code> against active roles on every query.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
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

