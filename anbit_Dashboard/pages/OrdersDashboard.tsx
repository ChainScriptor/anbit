import React from 'react';
import ViewSelector from '@/components/dashboard/ViewSelector';
import KanbanBoard from '@/components/dashboard/KanbanBoard';

const OrdersDashboard: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
        Order Line
      </h1>
      <ViewSelector />
      <KanbanBoard />
    </div>
  );
};

export default OrdersDashboard;

