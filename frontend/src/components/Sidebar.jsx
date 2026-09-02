import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, AlertTriangle, UserSearch, Brain, X } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Segmentation', path: '/segmentation', icon: Users },
  { name: 'Churn Analysis', path: '/churn-analysis', icon: AlertTriangle },
  { name: 'Customer Lookup', path: '/customer-lookup', icon: UserSearch },
  { name: 'Prediction', path: '/prediction', icon: Brain },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  return (
    <aside className={`w-64 bg-theme-bg2 border-r border-theme-border min-h-screen flex flex-col flex-shrink-0 fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      {/* Branding */}
      <div className="p-6 border-b border-theme-border flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-theme-text1 tracking-tight">ChurnIQ</h1>
          <p className="text-xs font-medium text-theme-muted mt-1 uppercase tracking-wider">Customer Intelligence</p>
        </div>
        <button className="md:hidden p-1 -mr-2 text-theme-text2 hover:text-theme-text1" onClick={() => setIsOpen(false)}>
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
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
