import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api, type ApiOrder, type ApiProduct } from '@/services/api';
import { useAuth } from '@/AuthContext';
import {
  Bell,
  Bike,
  Check,
  ChevronDown,
  HelpCircle,
  Loader2,
  MessageSquare,
  Search,
  User,
  Utensils,
  X,
} from 'lucide-react';

const POLL_INTERVAL_MS = 5000;
const STATUS_MAP: Record<number, string> = {
  0: 'Unknown',
  1: 'Pending',
  2: 'Accepted',
  3: 'Rejected',
  4: 'Completed',
};

type FlowKey = 'new' | 'inProgress' | 'ready' | 'other';

function getStatusLabel(status: string | number | undefined): string {
  if (status == null) return 'Pending';
  if (typeof status === 'number') return STATUS_MAP[status] ?? 'Pending';
  return String(status);
}

function toFlow(status: string | number | undefined): FlowKey {
  const s = getStatusLabel(status).toLowerCase();
  if (s === 'pending') return 'new';
  if (s === 'accepted' || s === 'shipped') return 'inProgress';
  if (s === 'ready' || s === 'completed') return 'ready';
  return 'other';
}

function getOrderShortNumber(orderId: string): string {
  return `#ORD-${orderId.replace(/-/g, '').slice(0, 4)}`;
}

function getCustomerName(order: ApiOrder): string {
  return order.userId ? `Customer ${String(order.userId).slice(0, 6)}` : `Customer ${order.id.slice(0, 4)}`;
}

function getTimerPercent(createdAt: string): number {
  const ageMin = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / 60000);
  return Math.max(8, Math.min(100, Math.round((ageMin / 20) * 100)));
}

const OrdersDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [productsById, setProductsById] = useState<Record<string, ApiProduct>>({});
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadOrders = useCallback(async () => {
    if (!user?.id) return;
    try {
      setError(null);
      const data = await api.getOrders();
      setOrders(
        data.filter(
          (o) => o.merchantId && String(o.merchantId).toLowerCase() === String(user.id).toLowerCase(),
        ),
      );
    } catch (e) {
      console.error(e);
      setError('Αποτυχία φόρτωσης παραγγελιών.');
    }
  }, [user?.id]);

  const loadProducts = useCallback(async () => {
    try {
      const data = await api.getProducts();
      setProductsById(
        data.reduce<Record<string, ApiProduct>>((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {}),
      );
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadProducts();
    const id = setInterval(loadOrders, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loadOrders, loadProducts]);

  const updateOrderStatus = useCallback((orderId: string, newStatus: string | number) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
  }, []);

  const handleAccept = useCallback(
    async (orderId: string) => {
      setActionOrderId(orderId);
      try {
        await api.acceptOrder(orderId);
        updateOrderStatus(orderId, 2);
      } catch (e) {
        console.error(e);
        setError('Αποτυχία αποδοχής παραγγελίας.');
      } finally {
        setActionOrderId(null);
      }
    },
    [updateOrderStatus],
  );

  const handleReject = useCallback(
    async (orderId: string) => {
      setActionOrderId(orderId);
      try {
        await api.rejectOrder(orderId);
        updateOrderStatus(orderId, 3);
      } catch (e) {
        console.error(e);
        setError('Αποτυχία απόρριψης παραγγελίας.');
      } finally {
        setActionOrderId(null);
      }
    },
    [updateOrderStatus],
  );

  const handleComplete = useCallback(
    async (orderId: string) => {
      setActionOrderId(orderId);
      try {
        await api.completeOrder(orderId);
        updateOrderStatus(orderId, 4);
      } catch (e) {
        console.error(e);
        setError('Αποτυχία ολοκλήρωσης παραγγελίας.');
      } finally {
        setActionOrderId(null);
      }
    },
    [updateOrderStatus],
  );

  const visibleOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter((o) =>
      [o.id, o.userId, o.tableNumber != null ? `table ${o.tableNumber}` : 'delivery'].join(' ').toLowerCase().includes(q),
    );
  }, [orders, searchQuery]);

  const board = useMemo(() => {
    const mapped = visibleOrders.map((order) => ({
      order,
      flow: toFlow(order.status),
      customerName: getCustomerName(order),
    }));
    return {
      newOrders: mapped.filter((x) => x.flow === 'new'),
      inProgressOrders: mapped.filter((x) => x.flow === 'inProgress'),
      readyOrders: mapped.filter((x) => x.flow === 'ready'),
    };
  }, [visibleOrders]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-[#f8f9fa]">
      {error && <p className="mx-8 mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      <section className="px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Live Order Feed</h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Kitchen Status: Operational
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, customers..."
                className="w-full rounded-full border-0 bg-white py-2 pl-10 pr-3 text-sm shadow-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[#E63533]/20"
              />
            </div>
            <button className="relative rounded-full p-2 text-slate-500 hover:text-[#E63533]">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#E63533]" />
            </button>
            <button className="rounded-full p-2 text-slate-500 hover:text-[#E63533]">
              <HelpCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid flex-1 grid-cols-1 gap-6 overflow-hidden px-8 pb-8 lg:grid-cols-3">
        <div className="flex h-full flex-col rounded-2xl bg-slate-200/40 p-4">
          <div className="mb-4 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#E63533] px-2 py-0.5 text-[10px] font-bold text-white">NEW</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Incoming</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">{board.newOrders.length} Orders</span>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {board.newOrders.map(({ order, customerName }) => {
              const isExpanded = expandedOrderId === order.id;
              return (
                <article key={order.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setExpandedOrderId((prev) => (prev === order.id ? null : order.id))}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11">
                        <svg viewBox="0 0 36 36" className="h-11 w-11 -rotate-90">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="#E5E7EB" strokeWidth="2.5" />
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke="#E63533"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray={`${getTimerPercent(order.createdAt)} 100`}
                          />
                        </svg>
                        <span className="absolute inset-0 grid place-items-center">
                          <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-slate-500 shadow-sm">
                            <User className="h-4 w-4" />
                          </span>
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#E63533]">{getOrderShortNumber(order.id)}</p>
                        <p className="font-bold text-slate-900">{customerName}</p>
                        <p className="text-xs text-slate-500">
                          {order.tableNumber ? `Τραπέζι ${order.tableNumber}` : 'Delivery'}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="space-y-3 border-t border-slate-100 px-4 pb-4">
                      <div className="pt-3 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          {order.tableNumber ? <Utensils className="h-4 w-4" /> : <Bike className="h-4 w-4" />}
                          <span>{order.tableNumber ? `Τραπέζι ${order.tableNumber}` : 'Delivery'}</span>
                        </div>
                        <p className="mt-1 font-semibold text-slate-800">
                          €{Number(order.totalPrice ?? 0).toFixed(2)} · {order.items?.length ?? 0} items · +{order.totalXp ?? 0} XP
                        </p>
                      </div>

                      <div className="space-y-2">
                        {(order.items ?? []).map((item, idx) => {
                          const product = productsById[item.productId];
                          const qty = Number(item.quantity ?? 0);
                          return (
                            <div key={`${item.productId}-${idx}`} className="flex items-center gap-3">
                              <img
                                src={
                                  product?.imageUrl ||
                                  'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=400'
                                }
                                alt=""
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-slate-900">{qty}x {product?.name ?? 'Product'}</p>
                                <p className="truncate text-xs text-slate-400">
                                  {product?.description?.slice(0, 42) || 'No modifiers'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
                        <p className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          {('customerNote' in order && (order as { customerNote?: string }).customerNote) ||
                            'Χωρίς σχόλια από τον χρήστη'}
                        </p>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleAccept(order.id)}
                          disabled={actionOrderId === order.id}
                          className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {actionOrderId === order.id ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" /> Accepting...
                            </span>
                          ) : (
                            'Accept Order'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(order.id)}
                          disabled={actionOrderId === order.id}
                          className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionOrderId === order.id ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" /> Declining...
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <X className="h-4 w-4" /> Decline
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        <div className="flex h-full flex-col rounded-2xl bg-slate-200/40 p-4">
          <div className="mb-4 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">LIVE</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">In Progress</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">{board.inProgressOrders.length} Order</span>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {board.inProgressOrders.map(({ order, customerName }) => (
              <article key={order.id} className="rounded-xl border-l-4 border-blue-600 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-blue-600">{getOrderShortNumber(order.id)}</p>
                    <p className="font-bold text-slate-900">{customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Est. Prep</p>
                    <p className="text-sm font-bold text-slate-800">12 Mins</p>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-2/3 rounded-full bg-blue-600" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-slate-500">{order.items?.length ?? 0} items</p>
                  <button
                    type="button"
                    onClick={() => handleComplete(order.id)}
                    disabled={actionOrderId === order.id}
                    className="rounded-lg bg-blue-600/10 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white disabled:opacity-50"
                  >
                    Move to Ready
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="flex h-full flex-col rounded-2xl bg-slate-200/40 p-4">
          <div className="mb-4 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">DONE</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Ready</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">{board.readyOrders.length}</span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {board.readyOrders.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 grid h-20 w-20 place-items-center rounded-full bg-slate-200">
                  <Check className="h-10 w-10 text-slate-300" />
                </div>
                <h4 className="font-bold text-slate-900">All caught up!</h4>
                <p className="mt-2 text-sm text-slate-400">Orders ready for pickup will appear here.</p>
              </div>
            ) : (
              board.readyOrders.map(({ order, customerName }) => (
                <article key={order.id} className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold text-emerald-600">{getOrderShortNumber(order.id)}</p>
                  <p className="font-bold text-slate-900">{customerName}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrdersDashboard;

