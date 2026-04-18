import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Outlet } from 'react-router-dom';

const AppLayout: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-anbit-soft-bg font-sans text-anbit-text">
      {/* Mobile backdrop overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-hidden="true"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <Header onMenuToggle={() => setMobileNavOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto bg-anbit-soft-bg px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
