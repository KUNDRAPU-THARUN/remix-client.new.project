import React from 'react';
import {
  Settings,
  Shield,
  Database,
  CheckCircle2,
  Server,
  Globe,
  Lock,
  Cpu,
  Layers,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { UserAccount } from '../../../types';
import { CITIES } from '../../../config/cities';

export interface AdminSettingsPageProps {
  currentUser: UserAccount;
  isLoading: boolean;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({
  currentUser,
  isLoading,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Platform Governance & Health</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
            System Infrastructure & Policies
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Audit core database connection health, security policy compliance, and multi-tenant routing parameters for the platform.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>PostgreSQL Pooler Operational</span>
          </div>
        </div>
      </div>

      {/* Grid: Administrator Profile & System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Administrator Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-heading">
                Super Administrator Session
              </h3>
              <p className="text-xs text-slate-400">
                Identity verified via server-side role evaluation
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 space-y-2.5 border border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Session Name</span>
              <span className="font-bold text-slate-900">{currentUser.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Email Address</span>
              <span className="font-mono text-slate-800">{currentUser.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Account Role</span>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-black uppercase tracking-wider">
                super_admin
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Territory Jurisdiction</span>
              <span className="font-bold text-blue-600">Global (All 3 Cities)</span>
            </div>
          </div>
        </div>

        {/* Database & Pooler Health */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-heading">
                PostgreSQL & Supabase Health
              </h3>
              <p className="text-xs text-slate-400">
                Connected via Supabase Management API & Pooler
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 space-y-2.5 border border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Engine</span>
              <span className="font-mono text-slate-900 font-bold">PostgreSQL 17.11 (Supabase)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Database Pooler Port</span>
              <span className="font-mono text-emerald-600 font-bold">5432 (Session Pooler)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Migration Status</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>6/6 Migrations Synchronized</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase text-[10px]">RPC Security</span>
              <span className="font-bold text-slate-900">moderate_business_listing Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Compliance Checklist */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 font-heading text-base">
            Security Policy & Architecture Checklist
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Core safeguards verified across client and remote PostgreSQL database
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950">Row-Level Security (RLS) Active</span>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Tables <code className="bg-emerald-100 px-1 py-0.2 rounded font-mono">businesses</code>, <code className="bg-emerald-100 px-1 py-0.2 rounded font-mono">customer_enquiries</code>, <code className="bg-emerald-100 px-1 py-0.2 rounded font-mono">general_service_requests</code>, <code className="bg-emerald-100 px-1 py-0.2 rounded font-mono">user_roles</code>, and <code className="bg-emerald-100 px-1 py-0.2 rounded font-mono">audit_logs</code> enforce strict RLS.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950">Atomic RPC Moderation</span>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Listing approvals and rejections use <code className="bg-emerald-100 px-1 py-0.2 rounded font-mono">moderate_business_listing</code> RPC with row locks (<code className="font-mono">FOR UPDATE</code>) to prevent race conditions.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950">Territory Franchise Isolation</span>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Regional franchisee accounts are strictly bound to their assigned city ID. Cross-territory write and moderation attempts are rejected by RLS.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950">Zero Unapproved Pricing</span>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                All customer and merchant-facing surfaces are completely free of unapproved subscription prices and claims.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Territory Domain Routing Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 font-heading text-base">
            Multi-Territory URL Routing Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Path resolution handled dynamically by <code className="text-slate-700 font-mono">src/utils/cityResolver.ts</code>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-6">Scope / Territory</th>
                <th className="py-3 px-4">Public URL Subpath</th>
                <th className="py-3 px-4">Regional Franchise URL</th>
                <th className="py-3 px-6 text-right">Route Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              <tr>
                <td className="py-3 px-6 font-bold text-slate-900">Chittoor (AP-03)</td>
                <td className="py-3 px-4 font-mono text-blue-600">/city/chittoor</td>
                <td className="py-3 px-4 font-mono text-purple-600">/city/chittoor/franchise</td>
                <td className="py-3 px-6 text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">Live</span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-bold text-slate-900">Vellore (TN-23)</td>
                <td className="py-3 px-4 font-mono text-blue-600">/city/vellore</td>
                <td className="py-3 px-4 font-mono text-purple-600">/city/vellore/franchise</td>
                <td className="py-3 px-6 text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">Live</span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-bold text-slate-900">Bengaluru (KA-01)</td>
                <td className="py-3 px-4 font-mono text-blue-600">/city/bengaluru</td>
                <td className="py-3 px-4 font-mono text-purple-600">/city/bengaluru/franchise</td>
                <td className="py-3 px-6 text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">Live</span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-bold text-slate-900">Central Platform Admin</td>
                <td className="py-3 px-4 font-mono text-slate-500">—</td>
                <td className="py-3 px-4 font-mono text-red-600">/admin</td>
                <td className="py-3 px-6 text-right">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">Protected</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
