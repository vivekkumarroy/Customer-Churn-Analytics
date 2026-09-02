import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Quadrant = ({ title, count, type, onClick }) => {
  // Determine styling based on quadrant type
  let colorClass = '';
  if (type === 'priority') colorClass = 'text-theme-high border-theme-high hover:bg-theme-high/10';
  if (type === 'vip') colorClass = 'text-theme-low border-theme-low hover:bg-theme-low/10';
  if (type === 'automated') colorClass = 'text-theme-medium border-theme-medium hover:bg-theme-medium/10';
  if (type === 'normal') colorClass = 'text-theme-accent1 border-theme-accent1 hover:bg-theme-accent1/10';

  return (
    <div 
      onClick={onClick}
      className={`dashboard-card p-4 md:p-8 flex flex-col justify-center items-center text-center cursor-pointer transition-all duration-300 border-2 ${colorClass}`}
    >
      <h3 className="text-sm md:text-xl font-bold mb-2 leading-tight">{title}</h3>
      <p className="text-2xl md:text-4xl font-black">{count.toLocaleString()}</p>
      <p className="text-xs md:text-sm mt-1 opacity-80">customers</p>
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
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-theme-text1 tracking-tight">Customer Segmentation</h1>
        <p className="text-theme-text2 mt-1">Understand customer value and behavioural segments.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="dashboard-card p-6">
          <p className="text-sm font-semibold text-theme-muted uppercase tracking-wider mb-1">High Value Customers</p>
          <p className="text-3xl font-bold text-theme-text1">{highValueCount.toLocaleString()}</p>
        </div>
        <div className="dashboard-card p-6">
          <p className="text-sm font-semibold text-theme-muted uppercase tracking-wider mb-1">Low Value Customers</p>
          <p className="text-3xl font-bold text-theme-text1">{lowValueCount.toLocaleString()}</p>
        </div>
        <div className="dashboard-card p-6">
          <p className="text-sm font-semibold text-theme-muted uppercase tracking-wider mb-1">Priority Retain</p>
          <p className="text-3xl font-bold text-theme-high">{priorityCount.toLocaleString()}</p>
        </div>
        <div className="dashboard-card p-6">
          <p className="text-sm font-semibold text-theme-muted uppercase tracking-wider mb-1">VIP Loyal</p>
          <p className="text-3xl font-bold text-theme-low">{vipCount.toLocaleString()}</p>
        </div>
      </div>

      {/* Risk x Value Matrix */}
      <div className="pt-8">
        <div className="flex flex-col max-w-5xl mx-auto">
          
          {/* Top axis labels */}
          <div className="flex mb-4">
            <div className="w-24"></div> {/* spacer for left axis */}
            <div className="flex-1 flex flex-col items-center">
              <h4 className="text-theme-muted font-bold tracking-widest uppercase mb-2">Churn Risk</h4>
              <div className="flex w-full">
                <div className="flex-1 text-center font-semibold text-theme-low">LOW</div>
                <div className="flex-1 text-center font-semibold text-theme-high">HIGH</div>
              </div>
            </div>
          </div>

          {/* Matrix Body */}
          <div className="flex">
            {/* Left axis labels */}
            <div className="w-24 flex flex-col justify-around py-16">
              <div className="text-right pr-4 font-semibold text-theme-accent2 whitespace-pre-line leading-tight">
                HIGH{'\n'}VALUE
              </div>
              <div className="text-right pr-4 font-semibold text-theme-muted whitespace-pre-line leading-tight">
                LOW{'\n'}VALUE
              </div>
            </div>
            
            {/* 2x2 Grid */}
            <div className="flex-1 grid grid-cols-2 gap-4">
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
