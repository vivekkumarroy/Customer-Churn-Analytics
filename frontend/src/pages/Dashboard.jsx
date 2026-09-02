import React, { useEffect, useState } from 'react';
import { Users, IndianRupee, Activity, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import api from '../api';
import { MetricCard } from '../components/UIComponents';

const RISK_COLORS = { 'LOW': '#22C55E', 'MEDIUM': '#F59E0B', 'HIGH': '#EF4444' };
const CHURN_COLORS = { '0': '#06B6D4', '1': '#EF4444' }; // 0: Not Churn (Cyan), 1: Churn (High Risk)
const VALUE_COLORS = { 'High Value': '#8B5CF6', 'Low Value': '#64748B' };

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-theme-bg2 border border-theme-border rounded-lg p-3 shadow-lg text-sm">
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color || '#fff' }}>
            <span className="text-theme-text2">{p.name}: </span>
            <span className="font-bold text-theme-text1">
              {typeof p.value === 'number' && p.value > 1000 ? p.value.toLocaleString() : p.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [churnData, setChurnData] = useState(null);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, churnRes, segRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/churn'),
          api.get('/segments'),
        ]);
        setMetrics(dashRes.data);
        setChurnData(churnRes.data);
        setSegments(segRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-theme-accent1 border-t-transparent animate-spin" />
    </div>
  );

  if (!metrics || !churnData) return <div className="text-theme-high">Failed to load data.</div>;

  // Chart 1: Churn Distribution (Donut)
  const churned = churnData.churn_distribution['1'] || 0;
  const retained = churnData.churn_distribution['0'] || 0;
  const totalChurn = churned + retained;
  const churnPieData = [
    { name: 'Churn', value: churned },
    { name: 'Not Churn', value: retained }
  ];

  // Chart 2: Risk Distribution (Bar)
  const riskBarData = [
    { name: 'HIGH', count: churnData.risk_distribution['HIGH'] || 0, fill: RISK_COLORS['HIGH'] },
    { name: 'MEDIUM', count: churnData.risk_distribution['MEDIUM'] || 0, fill: RISK_COLORS['MEDIUM'] },
    { name: 'LOW', count: churnData.risk_distribution['LOW'] || 0, fill: RISK_COLORS['LOW'] },
  ];

  // Chart 3: Customer Value Distribution (Bar)
  const highValue = metrics.high_value_customers;
  const lowValue = metrics.total_customers - highValue;
  const valueBarData = [
    { name: 'High Value', count: highValue, fill: VALUE_COLORS['High Value'] },
    { name: 'Low Value', count: lowValue, fill: VALUE_COLORS['Low Value'] },
  ];

  // Chart 4: Risk x Value Segments (Horizontal Bar)
  const segmentBarData = segments.map(s => ({
    name: s.segment_name,
    count: s.customer_count,
    avgCLV: s.average_clv,
    fill: '#06B6D4' // Primary accent
  }));

  // Business Priority
  const prioritySegment = segments.find(s => s.segment_name === 'Priority Retain');

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-theme-text1 tracking-tight">Customer Churn Intelligence</h1>
        <p className="text-theme-text2 mt-1">AI-powered customer retention and lifetime value analytics</p>
        <div className="flex items-center gap-2 mt-4 text-xs font-semibold px-3 py-1 bg-theme-bg2 border border-theme-border rounded-full w-max">
          <div className="w-2 h-2 rounded-full bg-theme-low animate-pulse" />
          <span className="text-theme-text2 tracking-widest">ML MODEL ACTIVE</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <MetricCard title="Total Customers" value={metrics.total_customers.toLocaleString()} subtitle="Customers analysed" icon={Users} />
        <MetricCard title="Total Revenue" value={Intl.NumberFormat('en-IN', { notation: 'compact', style: 'currency', currency: 'INR', maximumFractionDigits: 1 }).format(metrics.total_revenue)} subtitle="Across all customers" icon={IndianRupee} />
        <MetricCard title="Churn Rate" value={`${(metrics.churn_rate * 100).toFixed(1)}%`} subtitle="Predicted churn risk" icon={Activity} />
        <MetricCard title="High-Risk Customers" value={metrics.high_risk_customers.toLocaleString()} subtitle="Require immediate attention" icon={AlertTriangle} />
        <MetricCard title="High-Value Customers" value={metrics.high_value_customers.toLocaleString()} subtitle="Top revenue contributors" icon={ShieldCheck} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Chart 1: Churn Donut */}
        <div className="dashboard-card p-6">
          <h3 className="text-lg font-bold text-theme-text1 mb-4">Customer Churn Distribution</h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={churnPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
                  {churnPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Churn' ? CHURN_COLORS['1'] : CHURN_COLORS['0']} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
              <span className="text-2xl font-bold text-theme-text1">{(churned / totalChurn * 100).toFixed(1)}%</span>
              <span className="text-xs text-theme-text2 uppercase tracking-wider">Churn</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Risk Bar */}
        <div className="dashboard-card p-6">
          <h3 className="text-lg font-bold text-theme-text1 mb-4">Churn Risk Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskBarData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" tickLine={false} axisLine={false} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {riskBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Value Bar */}
        <div className="dashboard-card p-6">
          <h3 className="text-lg font-bold text-theme-text1 mb-4">Customer Value Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valueBarData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" tickLine={false} axisLine={false} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {valueBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Risk x Value Horizontal Bar */}
        <div className="dashboard-card p-6">
          <h3 className="text-lg font-bold text-theme-text1 mb-4">Risk × Value Segments</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentBarData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#64748B" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="#94A3B8" tickLine={false} axisLine={false} width={100} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: CLV Trend by Segment (Line) */}
        <div className="dashboard-card p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-theme-accent2" />
            <h3 className="text-lg font-bold text-theme-text1">Average CLV by Segment</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={segmentBarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748B" tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="avgCLV" stroke="#8B5CF6" strokeWidth={4} dot={{ r: 6, fill: '#1E293B', stroke: '#8B5CF6', strokeWidth: 2 }} activeDot={{ r: 8 }} name="Average CLV" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Business Insight Section */}
      {prioritySegment && (
        <div className="bg-theme-bg2 border border-theme-accent1/30 rounded-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-theme-accent1"></div>
          <h3 className="text-xl font-bold text-theme-text1 mb-4">Business Priority</h3>
          <p className="text-theme-text2 text-lg mb-6 max-w-3xl">
            High-value customers with high churn risk should be prioritized for retention campaigns.
            Addressing this segment protects maximum revenue.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-theme-muted mb-1">Priority Retain Customers</p>
              <p className="text-3xl font-bold text-theme-high">{prioritySegment.customer_count.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-theme-muted mb-1">Estimated Customer Value</p>
              <p className="text-3xl font-bold text-theme-text1">{Intl.NumberFormat('en-IN', { notation: 'compact', style: 'currency', currency: 'INR', maximumFractionDigits: 1 }).format(prioritySegment.total_revenue)}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
