import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Quadrant = ({ title, count, type, onClick }) => {
  // Determine styling based on quadrant type
  let description = '';
  let colorClass = '';
  if (type === 'priority') {
    colorClass = 'text-theme-high border-theme-high hover:bg-theme-high/5 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]';
    description = 'High Value + High Risk';
  }
  if (type === 'vip') {
    colorClass = 'text-theme-low border-theme-low hover:bg-theme-low/5 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]';
    description = 'High Value + Low Risk';
  }
  if (type === 'automated') {
    colorClass = 'text-theme-medium border-theme-medium hover:bg-theme-medium/5 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]';
    description = 'Low Value + High Risk';
  }
  if (type === 'normal') {
    colorClass = 'text-theme-primary border-theme-primary hover:bg-theme-primary/5 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]';
    description = 'Low Value + Low Risk';
  }

  return (
    <div 
      onClick={onClick}
      className={`dashboard-card p-6 md:p-12 flex flex-col justify-center items-center text-center cursor-pointer transition-all duration-300 border-2 ${colorClass}`}
    >
      <h3 className="text-xl md:text-3xl font-black mb-3 tracking-tight">{title}</h3>
      <p className="text-4xl md:text-6xl font-black mb-2">{count.toLocaleString()}</p>
      <p className="text-sm md:text-base font-bold uppercase tracking-widest opacity-80 mb-4">Customers</p>
      <div className="mt-auto pt-4 border-t border-current/20 w-full">
        <p className="text-sm md:text-lg font-medium opacity-90">{description}</p>
      </div>
    </div>
  );
};

const Segmentation = () => {
  const [segments, setSegments] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [segRes, dashRes] = await Promise.all([
          api.get('/segments'),
          api.get('/dashboard')
        ]);
        setSegments(segRes.data);
        setMetrics(dashRes.data);
      } catch (err) {
        console.error('Failed to fetch segmentation data', err);
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

  const getCount = (name) => {
    const s = segments.find(s => s.segment_name === name);
    return s ? s.customer_count : 0;
  };

  const highValueCount = metrics ? metrics.high_value_customers : 0;
  const lowValueCount = metrics ? metrics.total_customers - metrics.high_value_customers : 0;
  const priorityCount = getCount('Priority Retain');
  const vipCount = getCount('VIP Loyal');
  const automatedCount = getCount('Automated Campaign');
  const normalCount = getCount('Normal Marketing');

  const handleQuadrantClick = (segmentName) => {
    // Navigate to churn analysis with filter
    navigate(`/churn-analysis?segment=${encodeURIComponent(segmentName)}`);
  };

  return (
    <div className="space-y-10 w-full animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-black text-theme-text1 tracking-tight">Customer Segmentation</h1>
        <p className="text-theme-text2 mt-2 text-lg">Understand customer value and behavioural segments.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="dashboard-card p-6 flex flex-col justify-between">
          <p className="text-xs font-bold text-theme-muted uppercase tracking-widest mb-2">High Value Customers</p>
          <p className="text-4xl font-black text-theme-text1">{highValueCount.toLocaleString()}</p>
        </div>
        <div className="dashboard-card p-6 flex flex-col justify-between">
          <p className="text-xs font-bold text-theme-muted uppercase tracking-widest mb-2">Low Value Customers</p>
          <p className="text-4xl font-black text-theme-text1">{lowValueCount.toLocaleString()}</p>
        </div>
        <div className="dashboard-card p-6 flex flex-col justify-between border-b-4 border-theme-high">
          <p className="text-xs font-bold text-theme-muted uppercase tracking-widest mb-2">Priority Retain</p>
          <p className="text-4xl font-black text-theme-high">{priorityCount.toLocaleString()}</p>
        </div>
        <div className="dashboard-card p-6 flex flex-col justify-between border-b-4 border-theme-low">
          <p className="text-xs font-bold text-theme-muted uppercase tracking-widest mb-2">VIP Loyal</p>
          <p className="text-4xl font-black text-theme-low">{vipCount.toLocaleString()}</p>
        </div>
      </div>

      {/* Risk x Value Matrix */}
      <div className="pt-8">
        <div className="flex flex-col w-full mx-auto">
          
          {/* Top axis labels */}
          <div className="flex mb-6">
            <div className="w-16 md:w-32"></div> {/* spacer for left axis */}
            <div className="flex-1 flex flex-col items-center">
              <h4 className="text-theme-muted font-black tracking-widest uppercase mb-4 text-xl">Churn Risk</h4>
              <div className="flex w-full">
                <div className="flex-1 text-center font-black text-theme-low text-xl md:text-2xl tracking-widest">LOW</div>
                <div className="flex-1 text-center font-black text-theme-high text-xl md:text-2xl tracking-widest">HIGH</div>
              </div>
            </div>
          </div>

          {/* Matrix Body */}
          <div className="flex">
            {/* Left axis labels */}
            <div className="w-16 md:w-32 flex flex-col justify-around py-16">
              <div className="text-right pr-4 md:pr-8 font-black text-theme-accent2 text-xl md:text-2xl whitespace-pre-line leading-tight tracking-widest">
                HIGH{'\n'}VALUE
              </div>
              <div className="text-right pr-4 md:pr-8 font-black text-theme-muted text-xl md:text-2xl whitespace-pre-line leading-tight tracking-widest">
                LOW{'\n'}VALUE
              </div>
            </div>
            
            {/* 2x2 Grid */}
            <div className="flex-1 grid grid-cols-2 gap-6">
              <Quadrant title="VIP Loyal" count={vipCount} type="vip" onClick={() => handleQuadrantClick('VIP Loyal')} />
              <Quadrant title="Priority Retain" count={priorityCount} type="priority" onClick={() => handleQuadrantClick('Priority Retain')} />
              
              <Quadrant title="Normal Marketing" count={normalCount} type="normal" onClick={() => handleQuadrantClick('Normal Marketing')} />
              <Quadrant title="Automated Campaign" count={automatedCount} type="automated" onClick={() => handleQuadrantClick('Automated Campaign')} />
            </div>
          </div>
          
        </div>
      </div>

    </div>
  );
};

export default Segmentation;
