import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Outlet } from 'react-router-dom';

const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-anbit-soft-bg font-sans text-anbit-text">
      <Sidebar />
      <div className="flex h-screen flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto bg-anbit-soft-bg px-6 py-6 md:px-8 md:py-8">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

