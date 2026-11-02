import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface DashboardStatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  variant?: 'blue' | 'emerald' | 'amber' | 'red';
  onClick?: () => void;
  isActive?: boolean;
}

export const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'blue',
  onClick,
  isActive = false,
}) => {
  const variantStyles = {
    blue: {
      iconBg: 'bg-blue-50 text-blue-600',
      activeRing: 'border-blue-500 ring-2 ring-blue-500/20',
      valColor: 'text-slate-900',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      activeRing: 'border-emerald-500 ring-2 ring-emerald-500/20',
      valColor: 'text-emerald-700',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
      activeRing: 'border-amber-500 ring-2 ring-amber-500/20',
      valColor: 'text-amber-700',
    },
    red: {
      iconBg: 'bg-red-50 text-red-600',
      activeRing: 'border-red-500 ring-2 ring-red-500/20',
      valColor: 'text-red-700',
    },
  }[variant];

  const clickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
      className={`bg-white rounded-2xl p-5 border transition-all duration-200 ${
        isActive
          ? `${variantStyles.activeRing} shadow-md`
          : clickable
          ? 'border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 cursor-pointer'
          : 'border-slate-200/90 shadow-2xs'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${variantStyles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className={`text-3xl font-black font-heading tracking-tight ${variantStyles.valColor}`}>
          {value}
        </span>
      </div>
      <p className="text-[11px] text-slate-500 mt-1 font-medium line-clamp-1">
        {subtext}
      </p>
    </div>
  );
};

