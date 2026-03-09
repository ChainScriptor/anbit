import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-anbit-soft-bg font-sans text-anbit-text">
      <Sidebar />
      <div className="flex h-screen flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto bg-anbit-soft-bg px-6 py-6 md:px-8 md:py-8">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

