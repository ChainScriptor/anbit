import React, { useEffect, useState } from 'react';
import ViewSelector from '@/components/dashboard/ViewSelector';
import KanbanBoard from '@/components/dashboard/KanbanBoard';
import { api, type ApiOrder } from '@/services/api';

const POLL_INTERVAL_MS = 30000;

const OrdersDashboard: React.FC = () => {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setError(null);
      const data = await api.getOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
      setError('Αποτυχία φόρτωσης παραγγελιών.');
    }
  };

  useEffect(() => {
    loadOrders();
    const id = setInterval(loadOrders, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
        Order Line
      </h1>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600 max-w-md">
          {error}
        </p>
      )}

      {orders.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            Live Orders (API)
          </h2>
          <ul className="divide-y divide-slate-100">
            {orders.map((o) => (
              <li key={o.id} className="py-1.5 flex items-center justify-between">
                <span className="font-medium text-slate-800">{o.id}</span>
                <span className="text-xs text-slate-500">
                  {o.status} · €{o.totalPrice.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ViewSelector />
      <KanbanBoard />
    </div>
  );
};

export default OrdersDashboard;

