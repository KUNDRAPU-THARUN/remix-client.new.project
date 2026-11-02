import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  MessageSquare,
  Building2,
  Info,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Listing, UserAccount, CityConfig } from '../../../types';
import { CustomerEnquiry } from '../../../services/enquiryService';
import { DashboardStatCard } from '../DashboardStatCard';

interface InsightsPageProps {
  currentUser: UserAccount;
  userListings: Listing[];
  enquiries: CustomerEnquiry[];
  currentCity?: CityConfig;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({
  currentUser,
  userListings,
  enquiries,
  currentCity,
}) => {
  const cityName = currentCity?.name || 'Chittoor';
  const totalViews = userListings.reduce((sum, l) => sum + (l.viewsCount || 0), 0);
  const totalLeads = enquiries.length;
  const conversionRate = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : '0.0';

  // Calculate leads per listing truthfully
  const listingStats = userListings.map((listing) => {
    const listingLeads = enquiries.filter(
      (e) => e.businessId === listing.id || e.businessName === listing.title
    ).length;
    return {
      listing,
      leads: listingLeads,
      views: listing.viewsCount || 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-black font-heading text-slate-900 tracking-tight">
            Verified Business Performance Analytics
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Aggregated performance data derived strictly from your verified PostgreSQL listing records and customer inquiry transactions. No synthetic trends or estimated figures.
        </p>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardStatCard
          title="Total Directory Views"
          value={totalViews}
          subtext={`Cumulative visits across ${cityName}Ads`}
          icon={Eye}
          variant="blue"
        />
        <DashboardStatCard
          title="Customer Inquiries"
          value={totalLeads}
          subtext="Verified customer inquiries logged"
          icon={MessageSquare}
          variant="red"
        />
        <DashboardStatCard
          title="Lead Conversion Rate"
          value={`${conversionRate}%`}
          subtext="Direct inquiries generated per visit"
          icon={TrendingUp}
          variant="emerald"
        />
      </div>

      {/* 3. Performance by Listing Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-600" />
            <h3 className="font-black text-sm text-slate-900 font-heading">
              Performance Breakdown by Owned Listing
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {userListings.length} Registered Business{userListings.length === 1 ? '' : 'es'}
          </span>
        </div>

        {listingStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Business Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Locality</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Views</th>
                  <th className="py-3 px-4 text-right">Leads Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listingStats.map(({ listing, leads, views }) => (
                  <tr key={listing.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {listing.title}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {listing.category}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {listing.area}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          (listing.status || 'Active') === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {listing.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      {views}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-red-600">
                      {leads}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No listings currently registered under this account.
          </div>
        )}
      </div>

      {/* 4. Truthful Notice Regarding Historical Time-Series Analytics (Phase 5B Roadmap) */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200/90 p-6 sm:p-7 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-sm text-slate-900 font-heading">
            Continuous Impression Tracking & Engagement Heatmaps
          </h3>
          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Phase 5B Roadmap
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          In alignment with our engineering standards, KAARYAN LABS strictly avoids synthetic or fabricated performance charts. Day-by-day clickstream analytics, referral breakdown, and hourly traffic heatmaps require dedicated time-series event instrumentation, which will be integrated in <strong>Phase 5B</strong> via Supabase Edge Functions. The numbers above reflect verified real-time totals from your production database.
        </p>
      </div>
    </div>
  );
};

