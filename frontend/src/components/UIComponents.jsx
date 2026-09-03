import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon: Icon }) => (
  <div className="dashboard-card p-4 sm:p-5 flex flex-col justify-between min-h-[160px] group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
    <div className="absolute -right-4 -top-4 text-theme-bg opacity-30 transform rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
      {Icon && <Icon size={100} strokeWidth={1} />}
    </div>
    
    <div className="flex justify-between items-start w-full relative z-10 gap-2 mb-4">
      <p className="text-[11px] sm:text-xs font-bold text-theme-muted uppercase tracking-widest leading-tight flex-1 line-clamp-2">{title}</p>
      <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-theme-bg rounded-lg flex items-center justify-center text-[#3B82F6] shadow-inner border border-theme-border/50 group-hover:bg-[#3B82F6]/10 transition-colors">
        {Icon && <Icon size={18} strokeWidth={2} />}
      </div>
    </div>
    
    <div className="mt-auto relative z-10">
      <h3 className="text-[32px] sm:text-4xl font-black text-theme-text1 leading-none tracking-tight whitespace-nowrap shrink-0">{value}</h3>
      {subtitle && <p className="text-xs sm:text-sm text-theme-text2 font-medium mt-2 line-clamp-1 opacity-80">{subtitle}</p>}
    </div>
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
