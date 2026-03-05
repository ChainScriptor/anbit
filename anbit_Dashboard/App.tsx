
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AdminHeader from './components/AdminHeader';
import VoucherValidatorModal from './components/VoucherValidatorModal';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Squad from './pages/Squad';
import Inventory from './pages/Inventory';
import Quests from './pages/Quests';
import Customers from './pages/Customers';

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [isVoucherModalOpen, setVoucherModalOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div className="min-h-screen bg-anbit-dark text-white flex font-sans antialiased overflow-x-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[220px]' : 'ml-0'}`}>
          <AdminHeader 
            onMenuClick={toggleSidebar} 
            onVoucherClick={() => setVoucherModalOpen(true)}
          />
          
          <main className="flex-1 fluid-padding w-full max-w-[1400px] mx-auto overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/squad" element={<Squad />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/quests" element={<Quests />} />
            </Routes>
          </main>

          <footer className="py-4 border-t border-white/5 text-center">
            <p className="text-[8px] font-bold text-white/10 tracking-[0.3em] uppercase">
              Anbit Business OS v2.5.0-PRO | Διαχείριση Καταστήματος
            </p>
          </footer>
        </div>

        <VoucherValidatorModal 
          isOpen={isVoucherModalOpen} 
          onClose={() => setVoucherModalOpen(false)} 
        />
      </div>
    </Router>
  );
};

export default App;
