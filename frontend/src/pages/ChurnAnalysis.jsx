import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../api';
import { RiskBadge, SegmentBadge } from '../components/UIComponents';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const RISK_COLORS = { 'LOW': '#22C55E', 'MEDIUM': '#F59E0B', 'HIGH': '#EF4444' };

const ChurnAnalysis = () => {
  const [searchParams] = useSearchParams();
  const initSegment = searchParams.get('segment') || 'All';
  
  const [data, setData] = useState(null);
  const [allCustomers, setAllCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [riskFilter, setRiskFilter] = useState('All');
  const [segmentFilter, setSegmentFilter] = useState(initSegment);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sort & Pagination
  const [sortField, setSortField] = useState('ChurnProbability');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch churn aggregates and all customers for the table
        const [churnRes, custRes] = await Promise.all([
          api.get('/churn'),
          api.get('/customers?page_size=5000') // Fetch all for local filtering
        ]);
        setData(churnRes.data);
        setAllCustomers(custRes.data.data);
      } catch (err) {
        console.error('Failed to fetch churn analysis data', err);
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

  const riskDist = data.risk_distribution;
  const churned = data.churn_distribution['1'] || 0;

  const riskBarData = [
    { name: 'HIGH', count: riskDist['HIGH'] || 0, fill: RISK_COLORS['HIGH'] },
    { name: 'MEDIUM', count: riskDist['MEDIUM'] || 0, fill: RISK_COLORS['MEDIUM'] },
    { name: 'LOW', count: riskDist['LOW'] || 0, fill: RISK_COLORS['LOW'] },
  ];

  // Apply filters
  let filtered = allCustomers.filter(c => {
    if (riskFilter !== 'All' && c.RiskLevel !== riskFilter) return false;
    if (segmentFilter !== 'All' && c.RiskValueSegment !== segmentFilter) return false;
    if (searchTerm && !String(c.CustomerID).includes(searchTerm)) return false;
    return true;
  });

  // Apply Sort
  filtered.sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    
    // Convert to numbers if possible
    if (typeof valA === 'string' && !isNaN(Number(valA))) valA = Number(valA);
    if (typeof valB === 'string' && !isNaN(Number(valB))) valB = Number(valB);

    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="opacity-30 ml-1">↕</span>;
    return <span className="ml-1 text-theme-accent1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const FilterButton = ({ label, active, onClick, color }) => {
    const isActive = active === label;
    let baseClass = "px-4 py-2 rounded-lg text-sm font-semibold transition-all border ";
    if (isActive) {
      if (color === 'HIGH') baseClass += "bg-theme-high/10 text-theme-high border-theme-high";
      else if (color === 'MEDIUM') baseClass += "bg-theme-medium/10 text-theme-medium border-theme-medium";
      else if (color === 'LOW') baseClass += "bg-theme-low/10 text-theme-low border-theme-low";
      else baseClass += "bg-theme-text1 text-theme-bg border-theme-text1";
    } else {
      baseClass += "bg-theme-bg2 text-theme-text2 border-theme-border hover:border-theme-muted hover:text-theme-text1";
    }
    return <button onClick={() => { onClick(label); setPage(1); }} className={baseClass}>{label}</button>;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-theme-text1 tracking-tight">Churn Intelligence</h1>
        <p className="text-theme-text2 mt-1">Identify customers requiring retention attention.</p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="dashboard-card p-6 text-center border-t-4 border-t-theme-high">
          <p className="text-sm font-semibold text-theme-muted uppercase tracking-wider mb-2">High Risk Customers</p>
          <p className="text-4xl font-black text-theme-high">{(riskDist['HIGH'] || 0).toLocaleString()}</p>
        </div>
        <div className="dashboard-card p-6 text-center border-t-4 border-t-theme-medium">
          <p className="text-sm font-semibold text-theme-muted uppercase tracking-wider mb-2">Medium Risk Customers</p>
          <p className="text-4xl font-black text-theme-medium">{(riskDist['MEDIUM'] || 0).toLocaleString()}</p>
        </div>
        <div className="dashboard-card p-6 text-center border-t-4 border-t-theme-low">
          <p className="text-sm font-semibold text-theme-muted uppercase tracking-wider mb-2">Low Risk Customers</p>
          <p className="text-4xl font-black text-theme-low">{(riskDist['LOW'] || 0).toLocaleString()}</p>
        </div>
        <div className="dashboard-card p-6 text-center border-t-4 border-t-theme-accent1">
          <p className="text-sm font-semibold text-theme-muted uppercase tracking-wider mb-2">Predicted Churn</p>
          <p className="text-4xl font-black text-theme-accent1">{churned.toLocaleString()}</p>
        </div>
      </div>

      {/* Risk Distribution Chart */}
      <div className="dashboard-card p-6">
        <h3 className="text-lg font-bold text-theme-text1 mb-6">Risk Distribution</h3>
        <div className="h-48 max-w-3xl">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskBarData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
              <XAxis type="number" stroke="#64748B" tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="#94A3B8" tickLine={false} axisLine={false} width={80} />
              <Tooltip cursor={{fill: '#1E293B'}} contentStyle={{backgroundColor: '#111827', borderColor: '#1E293B'}} itemStyle={{color: '#F8FAFC'}} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {riskBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer Table Section */}
      <div className="dashboard-card overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-theme-border flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-theme-bg2/50">
          
          <div className="flex flex-wrap gap-2">
            <FilterButton label="All" active={riskFilter} onClick={setRiskFilter} color="ALL" />
            <FilterButton label="HIGH" active={riskFilter} onClick={setRiskFilter} color="HIGH" />
            <FilterButton label="MEDIUM" active={riskFilter} onClick={setRiskFilter} color="MEDIUM" />
            <FilterButton label="LOW" active={riskFilter} onClick={setRiskFilter} color="LOW" />
          </div>

          <div className="flex flex-wrap gap-4">
            <select 
              value={segmentFilter} 
              onChange={(e) => { setSegmentFilter(e.target.value); setPage(1); }}
              className="bg-theme-bg border border-theme-border rounded-lg text-theme-text1 px-4 py-2 text-sm focus:outline-none focus:border-theme-accent1"
            >
              <option value="All">All Segments</option>
              <option value="Priority Retain">Priority Retain</option>
              <option value="VIP Loyal">VIP Loyal</option>
              <option value="Automated Campaign">Automated Campaign</option>
              <option value="Normal Marketing">Normal Marketing</option>
            </select>
            
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
              <input 
                type="text" 
                placeholder="Search ID..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="input-search pl-9 w-48"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="table-header cursor-pointer group" onClick={() => handleSort('CustomerID')}>
                  Customer ID <SortIcon field="CustomerID" />
                </th>
                <th className="table-header cursor-pointer group" onClick={() => handleSort('ChurnProbability')}>
                  Churn Prob. <SortIcon field="ChurnProbability" />
                </th>
                <th className="table-header cursor-pointer group" onClick={() => handleSort('RiskLevel')}>
                  Risk Level <SortIcon field="RiskLevel" />
                </th>
                <th className="table-header cursor-pointer group" onClick={() => handleSort('EstimatedCLV')}>
                  CLV <SortIcon field="EstimatedCLV" />
                </th>
                <th className="table-header">Value Level</th>
                <th className="table-header">Risk × Value Segment</th>
                <th className="table-header">Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? paginated.map((c, idx) => (
                <tr key={idx} className="table-row">
                  <td className="table-cell font-semibold text-theme-accent1">
                    <Link to={`/customer-lookup?id=${c.CustomerID}`} className="hover:underline">{c.CustomerID}</Link>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-theme-text1">{(c.ChurnProbability * 100).toFixed(2)}%</span>
                    </div>
                  </td>
                  <td className="table-cell"><RiskBadge risk={c.RiskLevel} /></td>
                  <td className="table-cell font-medium text-theme-text1">
                    ₹{Number(c.EstimatedCLV).toLocaleString(undefined, {maximumFractionDigits:0})}
                  </td>
                  <td className="table-cell text-theme-text2">{c.ValueLevel}</td>
                  <td className="table-cell"><SegmentBadge segment={c.RiskValueSegment} /></td>
                  <td className="table-cell text-xs text-theme-text2">{c.RecommendedAction}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="table-cell text-center py-12 text-theme-muted">
                    No customers match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-theme-border flex items-center justify-between bg-theme-bg2/50">
            <span className="text-sm text-theme-muted">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded bg-theme-bg border border-theme-border text-theme-text1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-theme-border transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-semibold text-theme-text1 px-2">{page} / {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded bg-theme-bg border border-theme-border text-theme-text1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-theme-border transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default ChurnAnalysis;
