import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, AlertTriangle, UserSearch, Brain } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Segmentation', path: '/segmentation', icon: Users },
  { name: 'Churn Analysis', path: '/churn-analysis', icon: AlertTriangle },
  { name: 'Customer Lookup', path: '/customer-lookup', icon: UserSearch },
  { name: 'Prediction', path: '/prediction', icon: Brain },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-theme-bg2 border-r border-theme-border min-h-screen flex flex-col flex-shrink-0">
      {/* Branding */}
      <div className="p-6 border-b border-theme-border">
        <h1 className="text-xl font-bold text-theme-text1 tracking-tight">ChurnIQ</h1>
        <p className="text-xs font-medium text-theme-muted mt-1 uppercase tracking-wider">Customer Intelligence</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon size={18} className="mr-3" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Status */}
      <div className="p-6 border-t border-theme-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-theme-accent1 animate-pulse" />
          <span className="text-xs font-semibold text-theme-text2 tracking-wider">ML MODEL ACTIVE</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
