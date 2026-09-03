import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Brain, Clock, IndianRupee, ShoppingCart, Tag, CreditCard, CalendarDays, AlertTriangle, ArrowRight, Activity, Wallet, ShieldAlert } from 'lucide-react';
import api from '../api';
import { RiskBadge, SegmentBadge } from '../components/UIComponents';

const CircularGauge = ({ percentage }) => {
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let color = '#22C55E'; // LOW
  let riskText = 'LOW RISK';
  if (percentage >= 70) {
    color = '#EF4444'; // HIGH
    riskText = 'HIGH RISK';
  } else if (percentage >= 40) {
    color = '#F59E0B'; // MEDIUM
    riskText = 'MEDIUM RISK';
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-theme-bg2 rounded-3xl border border-theme-border shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-2xl pointer-events-none" style={{ backgroundColor: color }}></div>
      <h3 className="text-theme-muted font-black tracking-widest uppercase mb-8 flex items-center gap-2 text-lg">
        <ShieldAlert size={20} /> Churn Probability
      </h3>
      <div className="relative w-64 h-64">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="128" cy="128" r={radius} stroke="#1E293B" strokeWidth="16" fill="transparent" />
          <circle
            cx="128" cy="128" r={radius}
            stroke={color}
            strokeWidth="16"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out drop-shadow-xl"
            style={{ filter: `drop-shadow(0 0 12px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-black text-theme-text1 tracking-tighter">{percentage.toFixed(0)}<span className="text-3xl text-theme-text2">%</span></span>
          <span className="text-sm font-black mt-2 tracking-widest" style={{ color }}>{riskText}</span>
        </div>
      </div>
    </div>
  );
};

const CustomerLookup = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchCustomer = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/customers/${id}`);
        setCustomer(res.data);
      } catch (err) {
        setError('Customer not found in the dataset.');
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  if (!id) return (
    <div className="flex flex-col h-[70vh] items-center justify-center animate-fade-in text-center">
      <div className="w-24 h-24 bg-theme-bg2 border border-theme-border rounded-full flex items-center justify-center mb-8 shadow-lg">
        <Search size={48} className="text-cyan-500 opacity-80" />
      </div>
      <h2 className="text-4xl font-extrabold text-theme-text1 mb-4 tracking-tight">Customer Intelligence</h2>
      <p className="text-lg text-theme-text2 max-w-lg leading-relaxed">Enter a Customer ID in the top search bar to view their complete profile.</p>
    </div>
  );

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col h-[70vh] items-center justify-center text-center">
      <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
        <AlertTriangle size={48} className="text-red-500" />
      </div>
      <h2 className="text-3xl font-extrabold text-theme-text1 mb-3">Customer Not Found</h2>
      <p className="text-theme-text2 text-lg">{error}</p>
    </div>
  );

  if (!customer) return null;

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-theme-bg border border-theme-border p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-theme-primary"></div>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-theme-primary/10 text-theme-primary rounded-md text-xs font-black tracking-widest uppercase border border-theme-primary/20">Customer Intelligence</div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-theme-text1 tracking-tighter">
            CUSTOMER PROFILE <span className="text-theme-primary opacity-80">#{customer.CustomerID}</span>
          </h1>
        </div>
        <button
          onClick={() => navigate(`/prediction?id=${customer.CustomerID}`)}
          className="btn-primary py-2.5 px-6 rounded-xl flex items-center gap-2"
        >
          <Brain size={18} />
          Predict Behavior <ArrowRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Pillar 1: Risk & Action */}
        <div className="space-y-6">
          <CircularGauge percentage={customer.ChurnProbability * 100} />
          
          <div className="bg-theme-bg2 border border-theme-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-theme-muted uppercase tracking-wider mb-4">Profile Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-theme-text2">Risk Level</span>
                <RiskBadge risk={customer.RiskLevel} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-theme-text2">Segment</span>
                <SegmentBadge segment={customer.RiskValueSegment} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-theme-text2">Value Category</span>
                <span className="font-semibold text-theme-text1">{customer.ValueLevel}</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-900/20 border-2 border-purple-500/60 rounded-3xl p-8 shadow-[0_0_30px_rgba(168,85,247,0.2)] relative overflow-hidden transform transition-all hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
            <h3 className="text-sm font-black text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Brain size={16}/> Recommended Action</h3>
            <p className="text-2xl font-black text-theme-text1 leading-tight">{customer.RecommendedAction}</p>
          </div>
        </div>

        {/* Pillar 2: Spending Behavior */}
        <div className="bg-theme-bg2 border border-theme-border rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Wallet size={20} /></div>
            <h2 className="text-xl font-extrabold text-theme-text1">Spending Behavior</h2>
          </div>

          <div className="mb-8 text-center py-6 bg-[#0A192F] rounded-xl border border-theme-border">
            <p className="text-sm font-semibold text-theme-muted uppercase tracking-wider mb-1">Total Spent</p>
            <p className="text-4xl font-black text-theme-text1 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              ₹{Number(customer.Monetary).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="space-y-5 flex-1">
            <div className="flex items-center justify-between p-3 hover:bg-theme-bg/50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-theme-muted" />
                <span className="text-theme-text2 font-medium">Avg. Order Size</span>
              </div>
              <span className="font-bold text-theme-text1 text-lg">₹{Number(customer.AverageOrderValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-theme-bg/50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <ShoppingCart size={18} className="text-theme-muted" />
                <span className="text-theme-text2 font-medium">Total Items Bought</span>
              </div>
              <span className="font-bold text-theme-text1 text-lg">{Number(customer.TotalItems).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-theme-bg/50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Tag size={18} className="text-theme-muted" />
                <span className="text-theme-text2 font-medium">Product Variety</span>
              </div>
              <span className="font-bold text-theme-text1 text-lg">{Number(customer.UniqueProducts).toLocaleString()} items</span>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-theme-bg/50 rounded-lg transition-colors border-t border-theme-border pt-4">
              <div className="flex items-center gap-3">
                <IndianRupee size={18} className="text-emerald-400" />
                <span className="text-theme-text2 font-medium">Predicted Future Value</span>
              </div>
              <span className="font-bold text-emerald-400 text-lg">₹{Number(customer.EstimatedCLV).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>

        {/* Pillar 3: Engagement & Loyalty */}
        <div className="bg-theme-bg2 border border-theme-border rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><Activity size={20} /></div>
            <h2 className="text-xl font-extrabold text-theme-text1">Engagement & Loyalty</h2>
          </div>

          <div className="mb-8 text-center py-6 bg-[#0A192F] rounded-xl border border-theme-border">
            <p className="text-sm font-semibold text-theme-muted uppercase tracking-wider mb-1">Last Active</p>
            <p className="text-4xl font-black text-theme-text1 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              {customer.Recency} <span className="text-lg font-bold text-theme-muted">days ago</span>
            </p>
          </div>

          <div className="space-y-5 flex-1">
            <div className="flex items-center justify-between p-3 hover:bg-theme-bg/50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <ShoppingCart size={18} className="text-theme-muted" />
                <span className="text-theme-text2 font-medium">Total Purchases</span>
              </div>
              <span className="font-bold text-theme-text1 text-lg">{customer.Frequency} times</span>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-theme-bg/50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <CalendarDays size={18} className="text-theme-muted" />
                <span className="text-theme-text2 font-medium">Customer Since</span>
              </div>
              <span className="font-bold text-theme-text1 text-lg">{customer.CustomerLifetime} days</span>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-theme-bg/50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-theme-muted" />
                <span className="text-theme-text2 font-medium">Avg. Time Between Visits</span>
              </div>
              <span className="font-bold text-theme-text1 text-lg">{Number(customer.AverageDaysBetweenPurchases).toFixed(1)} days</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerLookup;
