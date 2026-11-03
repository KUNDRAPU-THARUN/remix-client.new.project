import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
  Search,
  Filter,
  UserCheck,
} from 'lucide-react';
import { CityConfig } from '../../../types';
import { FranchiseStaffMember } from '../../../services/franchiseService';

interface FranchiseStaffPageProps {
  staffMembers: FranchiseStaffMember[];
  currentCity: CityConfig;
  onInviteStaff: (member: Omit<FranchiseStaffMember, 'id' | 'joinedDate'>) => Promise<void>;
  isLoading: boolean;
}

export const FranchiseStaffPage: React.FC<FranchiseStaffPageProps> = ({
  staffMembers,
  currentCity,
  onInviteStaff,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'field_agent' | 'data_entry_staff'>('field_agent');
  const [assignedArea, setAssignedArea] = useState(currentCity.localities[1]?.name || 'Central Territory');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNote, setSuccessNote] = useState('');

  const filteredStaff = staffMembers.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    try {
      await onInviteStaff({
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        cityId: currentCity.id,
        status: 'pending',
        assignedArea,
        lastActive: 'Invited just now',
      });
      setSuccessNote(`Staff invitation registered for ${fullName.trim()}. Pending Super Admin role provisioning.`);
      setFullName('');
      setEmail('');
      setPhone('');
      setTimeout(() => {
        setIsInviteModalOpen(false);
        setSuccessNote('');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Architecture Notice */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 sm:p-5 text-amber-900 shadow-xs flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
          <Lock className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-black font-heading tracking-tight text-amber-950">
            Database Security Model & Role Provisioning Notice
          </p>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            Under PostgreSQL RLS policy <code className="bg-amber-100/80 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold">20261101000002_row_level_security.sql</code>, modification of table <code className="bg-amber-100/80 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold">public.user_roles</code> is strictly restricted to <strong>Super Admins</strong>.
            Franchise partners may coordinate field teams and register staff profiles; however, cryptographic role elevation in Supabase Auth requires Super Admin authorization.
          </p>
        </div>
      </div>

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 font-heading">
              {currentCity.name} Field Operations Staff
            </h2>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {staffMembers.length} Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Active coordinators, field verification officers, and data clerks in {currentCity.name} ({currentCity.code}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-red-500"
            />
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E51E31] to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs shadow-md shadow-red-500/20 transition cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Staff</span>
          </button>
        </div>
      </div>

      {/* Staff Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 font-heading">
                      {member.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                      {member.role.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    member.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {member.status === 'active' ? 'Active On-Duty' : 'Pending Auth'}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{member.assignedArea || 'Territory Wide'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Joined {member.joinedDate}</span>
              <span className="font-medium text-slate-600">{member.lastActive || 'Active'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-heading">
                  Register Territory Staff
                </h3>
                <p className="text-xs text-slate-500">
                  {currentCity.name} Operational Hub ({currentCity.code})
                </p>
              </div>
            </div>

            {successNote && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successNote}</span>
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Babu"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@kaaryanlabs.com"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 94432 00000"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Operational Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden cursor-pointer"
                >
                  <option value="field_agent">Field Verification Officer (Inspects Physical Shops)</option>
                  <option value="data_entry_staff">Merchant Data Entry Clerk (Cataloguing Listings)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Locality / Area
                </label>
                <select
                  value={assignedArea}
                  onChange={(e) => setAssignedArea(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden cursor-pointer"
                >
                  <option value="All Territory Mandals">All Territory Mandals</option>
                  {currentCity.localities.filter((a) => a.id !== 'all').map((loc) => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition cursor-pointer"
                >
                  {isSubmitting ? 'Registering...' : 'Register Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

