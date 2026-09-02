import React, { useState } from 'react';
import { Search, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Topbar = ({ setIsMobileMenuOpen }) => {
  const [searchId, setSearchId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setError('');

    try {
      // Validate customer exists before redirecting
      await api.get(`/customers/${searchId}`);
      navigate(`/customer-lookup?id=${searchId}`);
      setSearchId('');
    } catch (err) {
      setError('Customer not found');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <header className="bg-theme-bg border-b border-theme-border h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center md:hidden">
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-theme-text2 hover:text-theme-text1 focus:outline-none">
          <Menu size={24} />
        </button>
      </div>
      
      <div className="flex-1 flex justify-end">
        <div className="relative w-full md:w-72">
          <form onSubmit={handleSearch}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-theme-muted" />
          </div>
          <input
            type="number"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="input-search pl-10"
            placeholder="Search Customer ID..."
          />
        </form>
        {error && (
          <div className="absolute top-full mt-2 w-full bg-theme-high/10 border border-theme-high text-theme-high text-sm py-1.5 px-3 rounded-lg text-center shadow-lg animate-fade-in">
            {error}
          </div>
        )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
