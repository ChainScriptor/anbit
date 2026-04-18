import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { api, type ApiOrder, type ApiProduct } from '@/services/api';
import { useAuth } from '@/AuthContext';
import {
  Bell,
  BellOff,
  Bike,
  Check,
  ChevronDown,
  Clock,
  Loader2,
  MessageSquare,
  PackageCheck,
  TrendingUp,
  User,
  Utensils,
  X,
} from 'lucide-react';
import { GooeySearchBar } from '@/components/ui/animated-search-bar';
import { CalendarDateAndTimeRange } from '@/components/ui/calendar-date-and-time-range';

const POLL_INTERVAL_MS = 5000;
const STATUS_MAP: Record<number, string> = {
  0: 'Unknown',
  1: 'Pending',
  2: 'Accepted',
  3: 'Rejected',
  4: 'Completed',
};

type FlowKey = 'new' | 'inProgress' | 'ready' | 'other';
type BoardEntry = { order: ApiOrder; flow: FlowKey; customerName: string };
type InProgressBoardEntry = {
  order: ApiOrder;
  customerName: string;
  addedProductsCount: number;
};

type Toast = { id: string; message: string; type: 'success' | 'error' | 'info' };

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

function getElapsedLabel(createdAt: string): string {
  const ms = Date.now() - new Date(createdAt).getTime();
  if (ms < 0) return 'μόλις τώρα';
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}δ`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} λ`;
  return `${Math.floor(min / 60)}ω`;
}

function sortByCreatedAtDesc<T extends { order: ApiOrder }>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const at = new Date(a.order.createdAt ?? 0).getTime();
    const bt = new Date(b.order.createdAt ?? 0).getTime();
    return bt - at;
  });
}

function sortByCreatedAtAsc<T extends { order: ApiOrder }>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const at = new Date(a.order.createdAt ?? 0).getTime();
    const bt = new Date(b.order.createdAt ?? 0).getTime();
    return at - bt;
  });
}

function formatSentTime(createdAt: string): string {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString('el-GR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function getTableMergeKey(order: ApiOrder): string {
  if (order.tableNumber != null) return `table:${order.tableNumber}`;
  return `order:${order.id}`;
}

// ─── Elapsed timer that re-renders every 30s ────────────────────────────────
function useElapsedTick() {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function ToastList({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all ${
            t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-red-600' : 'bg-slate-700'
          }`}
        >
          {t.type === 'success' && <Check className="h-4 w-4 shrink-0" />}
          {t.type === 'error' && <X className="h-4 w-4 shrink-0" />}
          {t.type === 'info' && <Bell className="h-4 w-4 shrink-0" />}
          <span>{t.message}</span>
          <button type="button" onClick={() => onDismiss(t.id)} className="ml-1 opacity-70 hover:opacity-100">
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
const OrdersDashboard: React.FC = () => {
  const { user } = useAuth();
  const canManageOrders = Boolean(user?.roles?.includes('Merchant'));
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [productsById, setProductsById] = useState<Record<string, ApiProduct>>({});
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);
  const [preparedItemsByOrder, setPreparedItemsByOrder] = useState<Record<string, Record<string, boolean>>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [mobileCol, setMobileCol] = useState<'new' | 'inProgress' | 'ready'>('new');
  const prevOrderIdsRef = useRef<Set<string>>(new Set());
  const audioCtxRef = useRef<AudioContext | null>(null);

  useElapsedTick();

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Audio beep for new orders ──────────────────────────────────────────────
  const playNewOrderBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext not available (e.g. SSR / test)
    }
  }, [soundEnabled]);

  // ── Data loading ──────────────────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    if (!user?.id) return;
    try {
      setError(null);
      const data = await api.getOrders();
      const isMerchant = user.roles?.includes('Merchant') ?? false;
      const normalizedUserId = String(user.id).toLowerCase();
      const filtered = data.filter(
        (o) => o.merchantId && String(o.merchantId).toLowerCase() === normalizedUserId,
      );
      const effectiveOrders =
        isMerchant && filtered.length === 0 && data.length > 0 ? data : filtered;

      effectiveOrders.sort((a, b) => {
        const at = new Date(a.createdAt ?? 0).getTime();
        const bt = new Date(b.createdAt ?? 0).getTime();
        return bt - at;
      });

      // Detect genuinely new incoming orders to trigger notification
      const incomingIds = new Set(effectiveOrders.filter((o) => toFlow(o.status) === 'new').map((o) => o.id));
      const arrivedIds = [...incomingIds].filter((id) => !prevOrderIdsRef.current.has(id));

      if (arrivedIds.length > 0) {
        playNewOrderBeep();
        setNewOrderIds((prev) => new Set([...prev, ...arrivedIds]));
        // Clear pulse after 8s
        setTimeout(() => {
          setNewOrderIds((prev) => {
            const next = new Set(prev);
            arrivedIds.forEach((id) => next.delete(id));
            return next;
          });
        }, 8000);
        if (prevOrderIdsRef.current.size > 0) {
          addToast(`${arrivedIds.length} νέα παραγγελία${arrivedIds.length > 1 ? 'ες' : ''}!`, 'info');
        }
      }

      prevOrderIdsRef.current = incomingIds;
      setOrders(effectiveOrders);
    } catch (e) {
      console.error(e);
      setError('Αποτυχία φόρτωσης παραγγελιών.');
    }
  }, [user?.id, user?.roles, playNewOrderBeep, addToast]);

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
      if (isAxiosError(e) && e.response?.status === 401) {
        setProductsById({});
        return;
      }
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadProducts();
    const id = setInterval(loadOrders, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loadOrders, loadProducts]);

  // ── Order actions ─────────────────────────────────────────────────────────
  const updateOrderStatus = useCallback((orderId: string, newStatus: string | number) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
  }, []);

  const togglePreparedItem = useCallback((orderId: string, itemKey: string) => {
    setPreparedItemsByOrder((prev) => {
      const orderItems = prev[orderId] ?? {};
      return {
        ...prev,
        [orderId]: { ...orderItems, [itemKey]: !orderItems[itemKey] },
      };
    });
  }, []);

  const handleAccept = useCallback(
    async (orderId: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!canManageOrders) {
        setError('Το Accept επιτρέπεται μόνο σε λογαριασμό Merchant.');
        return;
      }
      setActionOrderId(orderId);
      try {
        await api.acceptOrder(orderId);
        updateOrderStatus(orderId, 2);
        addToast('Παραγγελία αποδεκτή!', 'success');
        setExpandedOrderId(null);
      } catch (e) {
        console.error(e);
        if (isAxiosError(e) && e.response?.status === 403) {
          setError('403: Δεν έχεις δικαίωμα Accept.');
        } else {
          addToast('Αποτυχία αποδοχής παραγγελίας.', 'error');
        }
      } finally {
        setActionOrderId(null);
      }
    },
    [canManageOrders, updateOrderStatus, addToast],
  );

  const handleReject = useCallback(
    async (orderId: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!canManageOrders) {
        setError('Το Reject επιτρέπεται μόνο σε λογαριασμό Merchant.');
        return;
      }
      setActionOrderId(orderId);
      try {
        await api.rejectOrder(orderId);
        updateOrderStatus(orderId, 3);
        addToast('Παραγγελία απορρίφθηκε.', 'info');
        setExpandedOrderId(null);
      } catch (e) {
        console.error(e);
        if (isAxiosError(e) && e.response?.status === 403) {
          setError('403: Δεν έχεις δικαίωμα Reject.');
        } else {
          addToast('Αποτυχία απόρριψης παραγγελίας.', 'error');
        }
      } finally {
        setActionOrderId(null);
      }
    },
    [canManageOrders, updateOrderStatus, addToast],
  );

  const handleComplete = useCallback(
    async (orderId: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!canManageOrders) {
        setError('Το Complete επιτρέπεται μόνο σε λογαριασμό Merchant.');
        return;
      }
      const targetOrder = orders.find((o) => o.id === orderId);
      if (targetOrder?.tableNumber != null) {
        const hasPendingForSameTable = orders.some(
          (o) =>
            o.id !== orderId &&
            o.tableNumber != null &&
            getTableMergeKey(o) === getTableMergeKey(targetOrder) &&
            toFlow(o.status) === 'new',
        );
        if (hasPendingForSameTable) {
          addToast(`Τραπέζι ${targetOrder.tableNumber}: έχετε παραγγελία στο Incoming που περιμένει αποδοχή.`, 'error');
          return;
        }
      }
      setActionOrderId(orderId);
      try {
        const orderIdsToComplete: string[] =
          targetOrder?.tableNumber != null
            ? Array.from(
                new Set(
                  orders
                    .filter(
                      (o) =>
                        o.tableNumber != null &&
                        getTableMergeKey(o) === getTableMergeKey(targetOrder) &&
                        toFlow(o.status) === 'inProgress',
                    )
                    .map((o) => o.id),
                ),
              )
            : [orderId];

        const results = await Promise.allSettled(orderIdsToComplete.map((id) => api.completeOrder(id)));
        const succeededIds = orderIdsToComplete.filter((_, idx) => results[idx]?.status === 'fulfilled');
        const failedCount = results.length - succeededIds.length;

        if (succeededIds.length > 0) {
          setOrders((prev) => prev.map((o) => (succeededIds.includes(o.id) ? { ...o, status: 4 } : o)));
          addToast('Παραγγελία ολοκληρώθηκε!', 'success');
          setExpandedOrderId(null);
        }
        if (failedCount > 0) {
          addToast(`Ολοκληρώθηκαν ${succeededIds.length}/${orderIdsToComplete.length}. Δοκίμασε ξανά.`, 'error');
        }
      } catch (e) {
        console.error(e);
        if (isAxiosError(e) && e.response?.status === 403) {
          setError('403: Δεν έχεις δικαίωμα Complete.');
        } else {
          addToast('Αποτυχία ολοκλήρωσης παραγγελίας.', 'error');
        }
      } finally {
        setActionOrderId(null);
      }
    },
    [canManageOrders, orders, addToast],
  );

  // ── Filtering ─────────────────────────────────────────────────────────────
  const visibleOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const parseMinutes = (hhmm: string): number | null => {
      if (!hhmm) return null;
      const [h, m] = hhmm.split(':').map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) return null;
      return h * 60 + m;
    };
    const fromMinutes = parseMinutes(fromTime);
    const toMinutes = parseMinutes(toTime);

    return orders.filter((o) => {
      if (q) {
        const productNames = (o.items ?? [])
          .map((item) => productsById[item.productId]?.name ?? '')
          .join(' ')
          .toLowerCase();
        const haystack = [
          o.id,
          o.userId,
          o.tableNumber != null ? `table ${o.tableNumber}` : 'delivery',
          productNames,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      const created = new Date(o.createdAt);
      if (Number.isNaN(created.getTime())) return false;
      if (selectedDate) {
        const y = created.getFullYear();
        const m = String(created.getMonth() + 1).padStart(2, '0');
        const d = String(created.getDate()).padStart(2, '0');
        if (`${y}-${m}-${d}` !== selectedDate) return false;
      }
      if (fromMinutes != null || toMinutes != null) {
        const orderMinutes = created.getHours() * 60 + created.getMinutes();
        if (fromMinutes != null && orderMinutes < fromMinutes) return false;
        if (toMinutes != null && orderMinutes > toMinutes) return false;
      }
      return true;
    });
  }, [orders, searchQuery, selectedDate, fromTime, toTime, productsById]);

  // ── Board ─────────────────────────────────────────────────────────────────
  const board = useMemo(() => {
    const mapped: BoardEntry[] = visibleOrders.map((order) => ({
      order,
      flow: toFlow(order.status),
      customerName: getCustomerName(order),
    }));

    const rawNewOrders = mapped.filter((x) => x.flow === 'new');
    const rawInProgressOrders = mapped.filter((x) => x.flow === 'inProgress');

    const inProgressByTable = new Map<string, BoardEntry[]>();
    rawInProgressOrders.forEach((entry) => {
      const key = getTableMergeKey(entry.order);
      const current = inProgressByTable.get(key) ?? [];
      current.push(entry);
      inProgressByTable.set(key, current);
    });

    const inProgressOrders: InProgressBoardEntry[] = Array.from(inProgressByTable.values()).map((entries) => {
      const sorted = sortByCreatedAtAsc(entries);
      const primary = sorted[0];
      const allOrders = sorted.map((x) => x.order);
      const mergedItems = allOrders.flatMap((o) => o.items ?? []);
      const mergedTotalPrice = allOrders.reduce((sum, o) => sum + Number(o.totalPrice ?? 0), 0);
      const mergedTotalXp = allOrders.reduce((sum, o) => sum + Number(o.totalXp ?? 0), 0);
      const addedProductsCount = sorted
        .slice(1)
        .reduce((sum, e) => sum + (e.order.items ?? []).reduce((q, item) => q + Number(item.quantity ?? 0), 0), 0);
      return {
        ...primary,
        order: { ...primary.order, items: mergedItems, totalPrice: mergedTotalPrice, totalXp: mergedTotalXp },
        addedProductsCount,
      };
    });

    return {
      newOrders: sortByCreatedAtDesc(rawNewOrders),
      inProgressOrders: sortByCreatedAtAsc(inProgressOrders),
      readyOrders: sortByCreatedAtDesc(mapped.filter((x) => x.flow === 'ready')),
    };
  }, [visibleOrders]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayCompleted = orders.filter((o) => {
      const d = new Date(o.createdAt).toISOString().slice(0, 10);
      return d === todayStr && toFlow(o.status) === 'ready';
    });
    const todayRevenue = todayCompleted.reduce((sum, o) => sum + Number(o.totalPrice ?? 0), 0);
    const activeCount = board.newOrders.length + board.inProgressOrders.length;
    return { completedToday: todayCompleted.length, todayRevenue, activeCount };
  }, [orders, board]);

  // ── Prepared items progress helper ────────────────────────────────────────
  const getPreparedProgress = useCallback(
    (orderId: string, items: ApiOrder['items']) => {
      const total = (items ?? []).length;
      if (total === 0) return { done: 0, total: 0, pct: 0 };
      const done = Object.values(preparedItemsByOrder[orderId] ?? {}).filter(Boolean).length;
      return { done, total, pct: Math.round((done / total) * 100) };
    },
    [preparedItemsByOrder],
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-[#f8f9fa]">
      <ToastList toasts={toasts} onDismiss={dismissToast} />

      {error && (
        <div className="mx-4 mt-3 flex items-center justify-between rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700 shadow-sm lg:mx-8">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="ml-2 opacity-60 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {!canManageOrders && (
        <p className="mx-4 mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-xs text-amber-800 lg:mx-8">
          Είσαι συνδεδεμένος χωρίς role Merchant — μόνο προβολή.
        </p>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <section className="px-4 pt-4 pb-3 lg:px-8 lg:pt-5 lg:pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
          <div>
            <h2 className="font-anbit-display text-xl font-bold tracking-tight text-slate-900 lg:text-2xl">Live Order Feed</h2>
            <p className="mt-0.5 text-xs text-slate-400">Ανανεώνεται κάθε 5 δευτερόλεπτα</p>
          </div>

          {/* Stats strip + sound */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span>€{stats.todayRevenue.toFixed(0)} σήμερα</span>
            </div>
            <div className="hidden items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm sm:flex">
              <PackageCheck className="h-3.5 w-3.5 text-blue-500" />
              <span>{stats.completedToday} ολοκλ.</span>
            </div>
            <div className="hidden items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm sm:flex">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>{stats.activeCount} ενεργές</span>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              title={soundEnabled ? 'Απενεργοποίηση ήχου' : 'Ενεργοποίηση ήχου'}
              className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-sm transition-colors ${
                soundEnabled ? 'bg-white text-slate-600 hover:text-slate-900' : 'bg-slate-200 text-slate-400'
              }`}
            >
              {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </button>
          </div>

          {/* Search + date */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <GooeySearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Αναζήτηση παραγγελιών..."
              className="w-full sm:w-[17.5rem]"
            />
            <CalendarDateAndTimeRange
              date={selectedDate}
              fromTime={fromTime}
              toTime={toTime}
              onDateChange={setSelectedDate}
              onFromTimeChange={setFromTime}
              onToTimeChange={setToTime}
              onClear={() => { setSelectedDate(''); setFromTime(''); setToTime(''); }}
              className="w-full sm:min-w-[18rem]"
            />
          </div>
        </div>
      </section>

      {/* ── Mobile column tabs ──────────────────────────────────────────── */}
      <div className="flex lg:hidden gap-1 rounded-xl bg-slate-200/60 p-1 mx-4 mb-2">
        {([
          { key: 'new', label: 'Incoming', count: board.newOrders.length, activeColor: 'text-[#E63533]' },
          { key: 'inProgress', label: 'In Progress', count: board.inProgressOrders.length, activeColor: 'text-blue-600' },
          { key: 'ready', label: 'Ready', count: board.readyOrders.length, activeColor: 'text-emerald-600' },
        ] as const).map((col) => (
          <button
            key={col.key}
            type="button"
            onClick={() => setMobileCol(col.key)}
            className={`flex-1 rounded-lg px-2 py-2 text-[11px] font-bold transition-all ${
              mobileCol === col.key ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
            }`}
          >
            {col.label}
            <span className={`ml-1 ${mobileCol === col.key ? col.activeColor : ''}`}>({col.count})</span>
          </button>
        ))}
      </div>

      {/* ── Kanban board ───────────────────────────────────────────────── */}
      <section className="grid min-h-0 flex-1 gap-4 overflow-hidden px-4 pb-4 lg:grid-cols-3 lg:gap-6 lg:px-8 lg:pb-8">

        {/* ── INCOMING ─────────────────────────────────────────────────── */}
        <div className={`min-h-0 h-full flex-col rounded-2xl bg-slate-200/40 p-4 ${mobileCol === 'new' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="mb-4 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className={`rounded bg-[#E63533] px-2 py-0.5 text-[10px] font-bold text-white ${board.newOrders.length > 0 ? 'animate-pulse' : ''}`}>
                NEW
              </span>
              <h3 className="font-anbit-display text-xs font-bold uppercase tracking-widest text-slate-500">Incoming</h3>
            </div>
            <span className="rounded-full bg-[#E63533]/10 px-2 py-0.5 text-xs font-bold text-[#E63533]">
              {board.newOrders.length}
            </span>
          </div>
          <div className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {board.newOrders.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-slate-200/60">
                  <Utensils className="h-7 w-7 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-400">Καμία νέα παραγγελία</p>
                <p className="mt-1 text-xs text-slate-300">Οι νέες παραγγελίες θα εμφανιστούν εδώ</p>
              </div>
            ) : (
              board.newOrders.map(({ order, customerName }) => {
                const isExpanded = expandedOrderId === order.id;
                const isNew = newOrderIds.has(order.id);
                const isActing = actionOrderId === order.id;
                return (
                  <article
                    key={order.id}
                    className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow ${
                      isNew ? 'border-[#E63533]/50 ring-2 ring-[#E63533]/20 shadow-md' : 'border-slate-200'
                    }`}
                  >
                    {/* Collapsed header – always visible */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setExpandedOrderId((prev) => (prev === order.id ? null : order.id))}
                      onKeyDown={(e) => e.key === 'Enter' && setExpandedOrderId((prev) => (prev === order.id ? null : order.id))}
                      className="flex w-full cursor-pointer items-center gap-3 p-4 text-left"
                    >
                      {/* Timer ring */}
                      <div className="relative h-11 w-11 shrink-0">
                        <svg viewBox="0 0 36 36" className="h-11 w-11 -rotate-90">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="#E5E7EB" strokeWidth="2.5" />
                          <circle
                            cx="18" cy="18" r="16" fill="none"
                            stroke="#E63533" strokeWidth="2.5" strokeLinecap="round"
                            strokeDasharray={`${getTimerPercent(order.createdAt)} 100`}
                          />
                        </svg>
                        <span className="absolute inset-0 grid place-items-center">
                          <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-slate-500 shadow-sm">
                            <User className="h-4 w-4" />
                          </span>
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#E63533]">{getOrderShortNumber(order.id)}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span>{getElapsedLabel(order.createdAt)}</span>
                          </div>
                        </div>
                        <p className="font-bold text-slate-900 truncate">{customerName}</p>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-slate-500">
                            {order.tableNumber ? `Τραπέζι ${order.tableNumber}` : 'Delivery'} · {order.items?.length ?? 0} items
                          </p>
                          <p className="text-xs font-semibold text-slate-700">€{Number(order.totalPrice ?? 0).toFixed(2)}</p>
                        </div>
                      </div>

                      <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Quick actions – always visible on incoming */}
                    {canManageOrders && !isExpanded && (
                      <div className="flex gap-2 border-t border-slate-100 px-4 py-2.5">
                        <button
                          type="button"
                          onClick={(e) => handleAccept(order.id, e)}
                          disabled={isActing}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white disabled:opacity-50 transition-colors"
                        >
                          {isActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          Αποδοχή
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleReject(order.id, e)}
                          disabled={isActing}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 py-2 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50 transition-colors"
                        >
                          {isActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                          Απόρριψη
                        </button>
                      </div>
                    )}

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="space-y-3 border-t border-slate-100 px-4 pb-4">
                        <div className="pt-3 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            {order.tableNumber ? <Utensils className="h-4 w-4" /> : <Bike className="h-4 w-4" />}
                            <span>{order.tableNumber ? `Τραπέζι ${order.tableNumber}` : 'Delivery'}</span>
                          </div>
                          <p className="anbit-tabular-nums mt-1 font-semibold text-slate-800">
                            €{Number(order.totalPrice ?? 0).toFixed(2)} · {order.items?.length ?? 0} items · +{order.totalXp ?? 0} XP
                          </p>
                        </div>

                        <div className="space-y-2">
                          {(order.items ?? []).map((item, idx) => {
                            const product = productsById[item.productId];
                            const qty = Number(item.quantity ?? 0);
                            const itemKey = `${item.productId}-${idx}`;
                            const isPrepared = !!preparedItemsByOrder[order.id]?.[itemKey];
                            return (
                              <div key={itemKey} className="flex items-center gap-3">
                                <label className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={isPrepared}
                                    onChange={() => togglePreparedItem(order.id, itemKey)}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    aria-label={`Έτοιμο: ${product?.name ?? 'Product'}`}
                                  />
                                </label>
                                <img
                                  src={product?.imageUrl || 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=400'}
                                  alt=""
                                  className={`h-12 w-12 rounded-lg object-cover ${isPrepared ? 'opacity-60' : ''}`}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className={`truncate text-sm font-bold text-slate-900 ${isPrepared ? 'line-through opacity-60' : ''}`}>
                                    {qty}x {product?.name ?? 'Product'}
                                  </p>
                                  <p className={`truncate text-xs text-slate-400 ${isPrepared ? 'opacity-60' : ''}`}>
                                    {product?.description?.slice(0, 42) || 'No modifiers'}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
                          <p className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 shrink-0" />
                            {('customerNote' in order && (order as { customerNote?: string }).customerNote) || 'Χωρίς σχόλια'}
                          </p>
                        </div>

                        {canManageOrders && (
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={(e) => handleAccept(order.id, e)}
                              disabled={isActing}
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {isActing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              Αποδοχή
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleReject(order.id, e)}
                              disabled={isActing}
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              {isActing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                              Απόρριψη
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* ── IN PROGRESS ──────────────────────────────────────────────── */}
        <div className={`min-h-0 h-full flex-col rounded-2xl bg-slate-200/40 p-4 ${mobileCol === 'inProgress' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="mb-4 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">LIVE</span>
              <h3 className="font-anbit-display text-xs font-bold uppercase tracking-widest text-slate-500">In Progress</h3>
            </div>
            <span className="rounded-full bg-blue-600/10 px-2 py-0.5 text-xs font-bold text-blue-600">
              {board.inProgressOrders.length}
            </span>
          </div>
          <div className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {board.inProgressOrders.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-slate-200/60">
                  <Clock className="h-7 w-7 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-400">Τίποτα σε εξέλιξη</p>
                <p className="mt-1 text-xs text-slate-300">Αποδέξου παραγγελίες για να εμφανιστούν εδώ</p>
              </div>
            ) : (
              board.inProgressOrders.map(({ order, customerName, addedProductsCount }) => {
                const isExpanded = expandedOrderId === order.id;
                const isActing = actionOrderId === order.id;
                const { done, total, pct } = getPreparedProgress(order.id, order.items);
                return (
                  <article key={order.id} className="overflow-hidden rounded-xl border-l-4 border-blue-600 bg-white shadow-sm">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setExpandedOrderId((prev) => (prev === order.id ? null : order.id))}
                      onKeyDown={(e) => e.key === 'Enter' && setExpandedOrderId((prev) => (prev === order.id ? null : order.id))}
                      className="w-full cursor-pointer p-4 text-left"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-blue-600">{getOrderShortNumber(order.id)}</p>
                          <p className="font-bold text-slate-900 truncate">{customerName}</p>
                          <p className="text-xs text-slate-500">
                            {order.tableNumber ? `Τραπέζι ${order.tableNumber}` : 'Delivery'}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {addedProductsCount > 0 && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                              +{addedProductsCount} νέα
                            </span>
                          )}
                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase text-slate-400">Ώρα</p>
                            <p className="anbit-tabular-nums text-sm font-bold text-slate-800">{formatSentTime(order.createdAt)}</p>
                          </div>
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {/* Dynamic progress bar based on prepared checkboxes */}
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-300"
                          style={{ width: total > 0 ? `${pct}%` : '0%' }}
                        />
                      </div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <p className="text-xs text-slate-500">{order.items?.length ?? 0} items</p>
                        {total > 0 && (
                          <p className="text-xs font-semibold text-blue-600">{done}/{total} έτοιμα</p>
                        )}
                      </div>
                    </div>

                    {/* Quick "Mark ready" on collapsed card */}
                    {canManageOrders && !isExpanded && (
                      <div className="border-t border-slate-100 px-4 py-2.5">
                        <button
                          type="button"
                          onClick={(e) => handleComplete(order.id, e)}
                          disabled={isActing}
                          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-50 py-2 text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white disabled:opacity-50 transition-colors"
                        >
                          {isActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          Μάρκαρε ως Έτοιμο
                        </button>
                      </div>
                    )}

                    {isExpanded && (
                      <div className="space-y-3 border-t border-slate-100 px-4 pb-4">
                        <div className="pt-3 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            {order.tableNumber ? <Utensils className="h-4 w-4" /> : <Bike className="h-4 w-4" />}
                            <span>{order.tableNumber ? `Τραπέζι ${order.tableNumber}` : 'Delivery'}</span>
                          </div>
                          <p className="anbit-tabular-nums mt-1 font-semibold text-slate-800">
                            €{Number(order.totalPrice ?? 0).toFixed(2)} · {order.items?.length ?? 0} items · +{order.totalXp ?? 0} XP
                          </p>
                        </div>

                        <div className="space-y-2">
                          {(order.items ?? []).map((item, idx) => {
                            const product = productsById[item.productId];
                            const qty = Number(item.quantity ?? 0);
                            const itemKey = `${item.productId}-${idx}`;
                            const isPrepared = !!preparedItemsByOrder[order.id]?.[itemKey];
                            return (
                              <div key={itemKey} className="flex items-center gap-3">
                                <label className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={isPrepared}
                                    onChange={() => togglePreparedItem(order.id, itemKey)}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    aria-label={`Έτοιμο: ${product?.name ?? 'Product'}`}
                                  />
                                </label>
                                <img
                                  src={product?.imageUrl || 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=400'}
                                  alt=""
                                  className={`h-12 w-12 rounded-lg object-cover ${isPrepared ? 'opacity-60' : ''}`}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className={`truncate text-sm font-bold text-slate-900 ${isPrepared ? 'line-through opacity-60' : ''}`}>
                                    {qty}x {product?.name ?? 'Product'}
                                  </p>
                                  <p className={`truncate text-xs text-slate-400 ${isPrepared ? 'opacity-60' : ''}`}>
                                    {product?.description?.slice(0, 42) || 'No modifiers'}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {canManageOrders && (
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={(e) => handleComplete(order.id, e)}
                              disabled={isActing}
                              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-600/20"
                            >
                              {isActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                              Μάρκαρε ως Έτοιμο
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* ── READY ────────────────────────────────────────────────────── */}
        <div className={`min-h-0 h-full flex-col rounded-2xl bg-slate-200/40 p-4 ${mobileCol === 'ready' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="mb-4 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">DONE</span>
              <h3 className="font-anbit-display text-xs font-bold uppercase tracking-widest text-slate-500">Ready</h3>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600">
              {board.readyOrders.length}
            </span>
          </div>
          <div className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {board.readyOrders.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 grid h-20 w-20 place-items-center rounded-full bg-slate-200">
                  <Check className="h-10 w-10 text-slate-300" />
                </div>
                <h4 className="font-bold text-slate-900">Όλα εντάξει!</h4>
                <p className="mt-2 text-sm text-slate-400">Οι έτοιμες παραγγελίες θα εμφανιστούν εδώ.</p>
              </div>
            ) : (
              board.readyOrders.map(({ order, customerName }) => {
                const isExpanded = expandedOrderId === order.id;
                return (
                  <article key={order.id} className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setExpandedOrderId((prev) => (prev === order.id ? null : order.id))}
                      onKeyDown={(e) => e.key === 'Enter' && setExpandedOrderId((prev) => (prev === order.id ? null : order.id))}
                      className="flex w-full cursor-pointer items-center justify-between p-4 text-left"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                            <Check className="h-3 w-3 text-emerald-600" />
                          </div>
                          <p className="text-xs font-bold text-emerald-600">{getOrderShortNumber(order.id)}</p>
                        </div>
                        <p className="mt-0.5 font-bold text-slate-900 truncate">{customerName}</p>
                        <p className="text-xs text-slate-500">
                          {order.tableNumber ? `Τραπέζι ${order.tableNumber}` : 'Delivery'} · {order.items?.length ?? 0} items · €{Number(order.totalPrice ?? 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{formatSentTime(order.createdAt)}</span>
                        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="space-y-3 border-t border-slate-100 px-4 pb-4">
                        <div className="pt-3 text-sm text-slate-600">
                          <p className="anbit-tabular-nums font-semibold text-slate-800">
                            €{Number(order.totalPrice ?? 0).toFixed(2)} · +{order.totalXp ?? 0} XP
                          </p>
                        </div>
                        <div className="space-y-2">
                          {(order.items ?? []).map((item, idx) => {
                            const product = productsById[item.productId];
                            const qty = Number(item.quantity ?? 0);
                            return (
                              <div key={`${item.productId}-${idx}`} className="flex items-center gap-3">
                                <img
                                  src={product?.imageUrl || 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=400'}
                                  alt=""
                                  className="h-12 w-12 rounded-lg object-cover opacity-80"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-slate-700">{qty}x {product?.name ?? 'Product'}</p>
                                  <p className="truncate text-xs text-slate-400">
                                    {product?.description?.slice(0, 42) || 'No modifiers'}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrdersDashboard;
