import React from 'react';
import MetricsCards from '@/components/dashboard/MetricsCards';
import { INITIAL_ORDERS } from '@/constants';

const Dashboard: React.FC = () => {
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

  return (
    <div className="flex flex-col gap-6 text-slate-900">
      {/* Banner - ίδιο στυλ με Products/Customers */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-6 md:px-8 md:py-8"
        style={{
          background:
            'linear-gradient(135deg, #fef3e2 0%, #fde8d4 50%, #fad9b8 100%)',
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Orders Overview
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600 md:text-base">
              Revenue, orders and fulfillment at a glance.
            </p>
          </div>
          <div className="mt-4 flex justify-center md:mt-0 md:block">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/60 text-5xl shadow-sm md:h-28 md:w-28">
              📊
            </div>
          </div>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-12 opacity-30"
          style={{
            background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 80' fill='none'%3E%3Cpath d='M0 40 Q360 0 720 40 T1440 40 V80 H0 Z' fill='%23e63533'/%3E%3C/svg%3E") no-repeat bottom center`,
            backgroundSize: 'cover',
          }}
        />
      </div>

      {/* Στατιστικά και γραφήματα παραγγελιών */}
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
