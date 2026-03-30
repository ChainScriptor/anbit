import React from 'react';
import MetricsCards from '@/components/dashboard/MetricsCards';
import { INITIAL_ORDERS } from '@/constants';
import { useAuth } from '@/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const roles = user?.roles ?? [];
  const isAdmin = roles.includes('Admin');

  const totalOrders = INITIAL_ORDERS.length;
  const totalRevenue = INITIAL_ORDERS.reduce(
    (sum, o) => sum + o.totalPrice,
    0,
  );
  const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
  const completedCount = INITIAL_ORDERS.filter(
    (o) => o.status === 'completed',
  ).length;
  const cancelledCount = INITIAL_ORDERS.filter(
    (o) => o.status === 'cancelled',
  ).length;
  const fulfillmentBase = totalOrders - cancelledCount;
  const fulfillmentRate =
    fulfillmentBase > 0 ? (completedCount / fulfillmentBase) * 100 : 0;

  if (isAdmin) {
    // AdminView – global πλατφορμικά νούμερα
    return (
      <div className="flex flex-col gap-6 text-slate-900">
        <div
          className="relative overflow-hidden rounded-2xl px-6 py-6 md:px-8 md:py-8"
          style={{
            background:
              'linear-gradient(135deg, #e0f2fe 0%, #bfdbfe 50%, #93c5fd 100%)',
          }}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-sky-700 mb-2">
                Platform Administrator
              </p>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Global Platform Overview
              </h1>
              <p className="mt-1 max-w-xl text-sm text-slate-600 md:text-base">
                Total performance across all connected stores.
              </p>
            </div>
            <div className="mt-4 flex justify-center md:mt-0 md:block">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/70 text-4xl shadow-sm md:h-28 md:w-28">
                🌐
              </div>
            </div>
          </div>
        </div>

        <MetricsCards
          totalOrders={totalOrders * 4}
          totalRevenue={totalRevenue * 4}
          averageOrderValue={averageOrderValue}
          fulfillmentRate={fulfillmentRate}
        />
      </div>
    );
  }

  // MerchantView – στοιχεία συγκεκριμένου καταστήματος
  return (
    <div className="flex flex-col gap-6 text-slate-900">
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-6 md:px-8 md:py-8"
        style={{
          background:
            'linear-gradient(135deg, #fef3e2 0%, #fde8d4 50%, #fad9b8 100%)',
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-amber-700 mb-2">
              Store Manager
            </p>
            <h1
              className="text-2xl font-bold text-slate-900 md:text-3xl"
              style={{ fontFamily: 'OmnesBoldItalic, sans-serif', fontStyle: 'italic', fontWeight: 700 }}
            >
              Store Dashboard
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600 md:text-base">
              Today&apos;s orders, revenue and table activity for your store.
            </p>
          </div>
          <div className="mt-4 flex justify-center md:mt-0 md:block">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/60 text-5xl shadow-sm md:h-28 md:w-28">
              📊
            </div>
          </div>
        </div>
      </div>

      <MetricsCards
        totalOrders={totalOrders}
        totalRevenue={totalRevenue}
        averageOrderValue={averageOrderValue}
        fulfillmentRate={fulfillmentRate}
      />
    </div>
  );
};

export default Dashboard;
