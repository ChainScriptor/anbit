import React, { useCallback, useEffect, useState } from 'react';
import ViewSelector from '@/components/dashboard/ViewSelector';
import KanbanBoard from '@/components/dashboard/KanbanBoard';
import { api, type ApiOrder } from '@/services/api';
import { useAuth } from '@/AuthContext';
import { Check, X, Package, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const POLL_INTERVAL_MS = 5000;

const STATUS_MAP: Record<number, string> = {
  0: 'Unknown',
  1: 'Pending',
  2: 'Accepted',
  3: 'Rejected',
  4: 'Completed',
};

function getStatusLabel(status: string | number | undefined): string {
  if (status == null) return 'Pending';
  if (typeof status === 'number') return STATUS_MAP[status] ?? 'Pending';
  return String(status);
}

function StatusBadge({ status }: { status: string | number | undefined }) {
  const label = getStatusLabel(status);
  const s = label.toLowerCase();
  const classes =
    s === 'pending'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : s === 'accepted'
        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
        : s === 'rejected'
          ? 'bg-red-100 text-red-800 border-red-200'
          : s === 'completed'
            ? 'bg-slate-100 text-slate-700 border-slate-200'
            : 'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${classes}`}
    >
      {label === 'Pending' && 'Σε αναμονή'}
      {label === 'Accepted' && 'Αποστάλθηκε'}
      {label === 'Rejected' && 'Απορρίφθηκε'}
      {label === 'Completed' && 'Ολοκληρώθηκε'}
      {!['Pending', 'Accepted', 'Rejected', 'Completed'].includes(label) && label}
    </span>
  );
}

const OrdersDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!user?.id) return;
    try {
      setError(null);
      const data = await api.getOrders();
      const myOrders = data.filter(
        (o) => o.merchantId && String(o.merchantId).toLowerCase() === String(user.id).toLowerCase()
      );
      setOrders(myOrders);
    } catch (e) {
      console.error(e);
      setError('Αποτυχία φόρτωσης παραγγελιών.');
    }
  }, [user?.id]);

  const updateOrderStatus = useCallback((orderId: string, newStatus: string | number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
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
    [updateOrderStatus]
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
    [updateOrderStatus]
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
    [updateOrderStatus]
  );

  useEffect(() => {
    loadOrders();
    const id = setInterval(loadOrders, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loadOrders]);

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

      {orders.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 w-8" />
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Παραγγελία</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Τραπέζι</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Σύνολο</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Κατάσταση</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => {
                  const statusLabel = getStatusLabel(o.status).toLowerCase();
                  const isPending = statusLabel === 'pending';
                  const isAccepted = statusLabel === 'accepted';
                  const isBusy = actionOrderId === o.id;
                  return (
                    <React.Fragment key={o.id}>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-4 align-top">
                        <button
                          type="button"
                          onClick={() => setExpandedOrderId((id) => (id === o.id ? null : o.id))}
                          className="p-1 rounded text-slate-500 hover:bg-slate-100"
                          aria-label={expandedOrderId === o.id ? 'Σύμπτυξη' : 'Λεπτομέρειες'}
                        >
                          {expandedOrderId === o.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">{o.id}</span>
                        {o.userId && (
                          <span className="block text-xs text-slate-500 mt-0.5">Χρήστης: {o.userId}</span>
                        )}
                        {o.items && o.items.length > 0 && (
                          <span className="ml-1 text-xs text-slate-500">
                            ({o.items.length} προϊόντα)
                          </span>
                        )}
                        {o.items && o.items.length > 0 && (
                          <span className="ml-1 text-xs text-slate-500">
                            ({o.items.length} προϊόντα)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {o.tableNumber != null ? (
                          <span className="text-slate-700">Τραπέζι {o.tableNumber}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-700">€{Number(o.totalPrice).toFixed(2)}</span>
                        {o.totalXp != null && o.totalXp > 0 && (
                          <span className="ml-1 text-xs text-slate-500">· {o.totalXp} XP</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="py-3 px-4">
                        {isPending && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAccept(o.id)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {isBusy ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                              Αποδοχή
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(o.id)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              {isBusy ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <X className="h-3.5 w-3.5" />
                              )}
                              Απόρριψη
                            </button>
                          </div>
                        )}
                        {isAccepted && (
                          <button
                            type="button"
                            onClick={() => handleComplete(o.id)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                          >
                            {isBusy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Package className="h-3.5 w-3.5" />
                            )}
                            Ολοκλήρωση
                          </button>
                        )}
                        {(statusLabel === 'rejected' || statusLabel === 'completed') && (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                    {expandedOrderId === o.id && o.items && o.items.length > 0 && (
                      <tr>
                        <td colSpan={6} className="bg-slate-50/80 p-4">
                          <p className="text-xs font-semibold text-slate-600 mb-2">Λεπτομέρειες παραγγελίας</p>
                          <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                            <thead>
                              <tr className="bg-slate-100">
                                <th className="text-left py-2 px-3">Product ID</th>
                                <th className="text-right py-2 px-3">Ποσότητα</th>
                                <th className="text-right py-2 px-3">Τιμή μον.</th>
                                <th className="text-right py-2 px-3">XP μον.</th>
                              </tr>
                            </thead>
                            <tbody>
                              {o.items.map((item, idx) => (
                                <tr key={idx} className="border-t border-slate-100">
                                  <td className="py-1.5 px-3 font-mono text-slate-700">{item.productId}</td>
                                  <td className="py-1.5 px-3 text-right">{item.quantity}</td>
                                  <td className="py-1.5 px-3 text-right">€{Number(item.unitPrice ?? 0).toFixed(2)}</td>
                                  <td className="py-1.5 px-3 text-right">{item.unitXp ?? 0} XP</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <p className="mt-2 text-xs text-slate-500">
                            Σύνολο: €{Number(o.totalPrice).toFixed(2)} · {o.totalXp ?? 0} XP
                          </p>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="px-4 py-2 text-xs text-slate-500 border-t border-slate-100">
            Οι παραγγελίες σας ({orders.length})
          </p>
        </div>
      ) : (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Δεν υπάρχουν παραγγελίες για το κατάστημά σας. Οι παραγγελίες που στέλνουν οι χρήστες θα εμφανίζονται εδώ.
        </p>
      )}

      <ViewSelector />
      <KanbanBoard />
    </div>
  );
};

export default OrdersDashboard;

