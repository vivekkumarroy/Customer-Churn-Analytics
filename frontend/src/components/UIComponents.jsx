import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon: Icon }) => (
  <div className="dashboard-card p-6 flex flex-col items-center text-center justify-center h-full group">
    <div className="mb-4 p-3 bg-theme-bg2 rounded-lg text-theme-accent1 group-hover:bg-theme-accent1/10 transition-colors inline-flex">
      {Icon && <Icon size={26} />}
    </div>
    <div>
      <p className="text-sm font-semibold text-theme-muted uppercase tracking-wider mb-2">{title}</p>
      <h3 className="text-3xl font-bold text-theme-text1 leading-tight tracking-tight mb-2 truncate" title={String(value)}>{value}</h3>
      {subtitle && <p className="text-sm text-theme-text2">{subtitle}</p>}
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
