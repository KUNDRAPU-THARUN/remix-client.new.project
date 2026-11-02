import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 bg-slate-200 rounded w-24" />
              <div className="w-10 h-10 rounded-xl bg-slate-100" />
            </div>
            <div className="h-8 bg-slate-200 rounded w-16" />
            <div className="h-2.5 bg-slate-100 rounded w-32" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-slate-200 rounded w-48" />
          <div className="h-8 bg-slate-100 rounded w-28" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="h-16 bg-slate-50 rounded-xl flex items-center px-4 gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-lg shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
              <div className="h-6 bg-slate-100 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

