import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  TrendingUp,
  Activity,
  CreditCard,
  Truck,
  CheckCircle2,
  RotateCcw,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from 'recharts';
import { INITIAL_ORDERS, REVENUE_HISTORY } from '../constants';
import { Order } from '../types';

type OrderBoardStatus = 'pending' | 'completed' | 'cancelled';

const STATUS_COLUMNS: {
  key: OrderBoardStatus;
  label: string;
  accentColor: string;
  icon: React.ReactNode;
}[] = [
  {
    key: 'pending',
    label: 'Shipped',
    accentColor: 'border-sky-400',
    icon: <Truck className="h-3 w-3 text-sky-500" />,
  },
  {
    key: 'completed',
    label: 'Completed',
    accentColor: 'border-emerald-400',
    icon: <CheckCircle2 className="h-3 w-3 text-emerald-500" />,
  },
  {
    key: 'cancelled',
    label: 'Return',
    accentColor: 'border-rose-400',
    icon: <RotateCcw className="h-3 w-3 text-rose-500" />,
  },
];

const formatTimeAgo = (timestamp: string) => {
  const diffMinutes = Math.max(
    0,
    Math.round((Date.now() - new Date(timestamp).getTime()) / 60000),
  );

  if (diffMinutes === 0) return 'Now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  if (minutes === 0) return `${hours} h ago`;
  return `${hours} h ${minutes} min ago`;
};

const formatDateShort = (timestamp: string) => {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (value: number) => {
  return `$${value.toFixed(2)}`;
};

const Orders: React.FC = () => {
  const allOrders: Order[] = INITIAL_ORDERS;

  const totalOrders = allOrders.length;
  const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  const completedCount = allOrders.filter(
    (o) => o.status === 'completed',
  ).length;
  const cancelledCount = allOrders.filter(
    (o) => o.status === 'cancelled',
  ).length;
  const fulfillmentBase = totalOrders - cancelledCount;
  const fulfillmentRate =
    fulfillmentBase > 0 ? (completedCount / fulfillmentBase) * 100 : 0;

  const ordersByStatus: Record<OrderBoardStatus, Order[]> = {
    pending: [],
    completed: [],
    cancelled: [],
  };

  allOrders.forEach((order) => {
    ordersByStatus[order.status].push(order);
  });

  return (
    <div className="h-full w-full overflow-auto bg-slate-100 px-3 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex h-full max-w-6xl flex-col gap-6 rounded-3xl bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.18)] md:p-6">
        {/* PAGE TITLE */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Orders
          </h1>
        </div>

        {/* ORDERS REVENUE CARD (matches reference layout) */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 md:px-6 md:py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">
                Orders Revenue
              </p>
              <p className="text-xs text-slate-400">All time</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Revenue
                </p>
                <p className="text-2xl md:text-3xl font-semibold text-slate-900">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="mt-1 flex items-center justify-end gap-1 text-xs font-medium text-emerald-500">
                  <TrendingUp className="h-3 w-3" />
                  7.2%
                </p>
              </div>
            </div>
          </div>

          {/* KPI CARDS INSIDE REVENUE CARD */}
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Total Orders
                  </p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {totalOrders.toLocaleString('en-US')}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">All time</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/5">
                  <Activity className="h-4 w-4 text-slate-500" />
                </div>
              </div>
              <p className="mt-2 text-xs text-emerald-500">+5.2%</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Avg. Orders Value
                  </p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {formatCurrency(averageOrderValue)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">All time</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/5">
                  <CreditCard className="h-4 w-4 text-slate-500" />
                </div>
              </div>
              <p className="mt-2 text-xs text-rose-500">-3.6%</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Orders Fulfillment Rate
                  </p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {fulfillmentRate.toFixed(1)}%
                  </p>
                  <p className="mt-1 text-xs text-slate-400">All time</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-emerald-500">+0.5%</p>
            </div>
          </div>
        </div>

        {/* CONTROLS ROW */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-playpen-sans text-xs font-extrabold text-slate-700 shadow-sm">
              Board View
              <ChevronDown className="h-3 w-3" />
            </button>
            <button className="inline-flex items-center gap-1 rounded-lg border border-transparent bg-slate-50 px-3 py-1.5 font-playpen-sans text-xs font-extrabold text-slate-500">
              This Week
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-playpen-sans text-xs font-extrabold text-slate-700 shadow-sm">
              Export
              <ChevronDown className="h-3 w-3" />
            </button>
            <button className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3.5 py-1.5 font-playpen-sans text-xs font-extrabold text-white shadow-sm">
              + Add Orders
            </button>
          </div>
        </div>

        {/* BOARD */}
        <div className="flex-1 overflow-x-auto pb-2">
          <div className="grid min-w-[960px] grid-cols-3 gap-4">
            {STATUS_COLUMNS.map((column) => {
              const columnOrders = ordersByStatus[column.key];

              return (
                <div
                  key={column.key}
                  className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50"
                >
                  {/* Column header */}
                  <div
                    className={`flex items-center justify-between border-b border-slate-100 px-4 py-2.5 border-t-2 ${column.accentColor}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                        {column.icon}
                      </div>
                      <span className="text-xs font-medium text-slate-800">
                        {column.label}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {columnOrders.length}
                      </span>
                    </div>
                    <button className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-white">
                      <MoreHorizontal className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="border-b border-dashed border-slate-200 px-4 py-2">
                    <button className="flex h-7 w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-100 text-[11px] font-medium text-slate-500 hover:bg-white">
                      + Add Orders
                    </button>
                  </div>

                  {/* Column cards */}
                  <div className="flex-1 space-y-3 px-3 py-3">
                    {columnOrders.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-100 px-3 py-4 text-center text-[11px] text-slate-400">
                        No orders in this column.
                      </div>
                    )}

                    {columnOrders.map((order) => {
                      const firstItem = order.items[0];
                      const itemLabel = firstItem
                        ? `${firstItem.name} · x${firstItem.qty}`
                        : `${order.items.length} items`;

                      return (
                        <motion.div
                          key={order.id}
                          whileHover={{ y: -2, scale: 1.01 }}
                          transition={{
                            type: 'spring',
                            stiffness: 260,
                            damping: 20,
                          }}
                          className="flex gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
                        >
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            {firstItem?.image && (
                              <img
                                src={firstItem.image}
                                alt={firstItem.name}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-medium text-slate-900">
                                  {order.customerName}
                                </p>
                                <p className="truncate text-[11px] text-slate-400">
                                  {itemLabel}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-semibold text-slate-900">
                                  {formatCurrency(order.totalPrice)}
                                </p>
                                <p className="mt-0.5 text-[10px] text-slate-400">
                                  +{order.totalPoints} pts
                                </p>
                              </div>
                            </div>

                            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimeAgo(order.timestamp)}</span>
                              </span>
                              <span className="uppercase tracking-wide">
                                Table {order.tableNumber}
                              </span>
                            </div>

                            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                              <span>#{order.id}</span>
                              <span>{formatDateShort(order.timestamp)}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;

