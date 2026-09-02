import React from 'react'; // Trigger HMR to fix CSS
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Segmentation from './pages/Segmentation';
import ChurnAnalysis from './pages/ChurnAnalysis';
import CustomerLookup from './pages/CustomerLookup';
import Prediction from './pages/Prediction';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-theme-bg font-sans text-theme-text1 selection:bg-cyan-500/30">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/segmentation" element={<Segmentation />} />
              <Route path="/churn-analysis" element={<ChurnAnalysis />} />
              <Route path="/customer-lookup" element={<CustomerLookup />} />
              <Route path="/prediction" element={<Prediction />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
