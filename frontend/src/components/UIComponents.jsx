import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon: Icon }) => (
  <div className="dashboard-card p-6 flex flex-col justify-between h-full group relative overflow-hidden">
    <div className="absolute -right-6 -top-6 text-theme-bg opacity-50 transform rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
      {Icon && <Icon size={120} strokeWidth={1} />}
    </div>
    <div className="flex justify-between items-start mb-6 relative z-10 gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] md:text-xs font-bold text-theme-muted uppercase tracking-widest mb-2 truncate" title={title}>{title}</p>
        <h3 className="text-3xl lg:text-4xl font-black text-theme-text1 leading-none tracking-tight truncate" title={String(value)}>{value}</h3>
      </div>
      <div className="p-3 bg-theme-bg rounded-xl text-theme-primary shadow-inner border border-theme-border/50 group-hover:bg-[#3B82F6]/20 transition-colors shrink-0">
        {Icon && <Icon size={24} strokeWidth={2} />}
      </div>
    </div>
    {subtitle && <p className="text-sm text-theme-text2 font-medium relative z-10">{subtitle}</p>}
  </div>
);

export const RiskBadge = ({ risk }) => {
  if (risk === 'HIGH') return <span className="badge-high">{risk}</span>;
  if (risk === 'LOW') return <span className="badge-low">{risk}</span>;
  return <span className="badge-medium">{risk || 'MEDIUM'}</span>;
};

export const SegmentBadge = ({ segment }) => (
  <span className="inline-block whitespace-nowrap bg-theme-accent2/10 text-theme-accent2 border border-theme-accent2/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
    {segment}
  </span>
);
