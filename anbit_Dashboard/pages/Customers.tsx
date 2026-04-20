import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  History,
  Loader2,
  Search,
  Star,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api, type ApiOrder, type ApiProduct, type CustomerAnalyticsItem } from '@/services/api';

const ACCENT = '#0a0a0a';
const PAGE_SIZE = 50;

const PLACEHOLDER_IMG =
  'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=80';

const MONTH_NAMES_EL = [
  'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος',
  'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος',
  'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος',
];
const DAY_NAMES_EL = ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'];

function initialsAvatar(username: string): string {
  const parts = username.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  if (parts[0]?.length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0]?.[0] ?? '?').toUpperCase();
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('el-GR', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function toYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function orderEmoji(status?: string): { emoji: string; label: string } {
  const s = String(status ?? '').toLowerCase();
  if (s === '3' || s.includes('reject') || s.includes('cancel'))
    return { emoji: '❌', label: 'Ακυρώθηκε' };
  if (s === '2' || s.includes('complet'))
    return { emoji: '✅', label: 'Ολοκληρώθηκε' };
  if (s === '1' || s.includes('accept'))
    return { emoji: '🔄', label: 'Αποδέχτηκε' };
  return { emoji: '⏳', label: 'Σε αναμονή' };
}

// ── History Modal ─────────────────────────────────────────────────────────────
interface HistoryModalProps {
  customer: CustomerAnalyticsItem;
  orders: ApiOrder[];
  productMap: Map<string, ApiProduct>;
  loading: boolean;
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  customer, orders, productMap, loading, onClose,
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedYmd, setSelectedYmd] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Days that have at least one order in the viewed month
  const orderDaySet = useMemo(() => {
    const s = new Set<string>();
    for (const o of orders) {
      if (!o.createdAt) continue;
      const d = new Date(o.createdAt);
      if (d.getFullYear() === viewDate.getFullYear() && d.getMonth() === viewDate.getMonth()) {
        s.add(toYmd(d));
      }
    }
    return s;
  }, [orders, viewDate]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstWeekday).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewDate]);

  const shownOrders = useMemo(() => {
    if (!selectedYmd) return orders;
    return orders.filter((o) => {
      if (!o.createdAt) return false;
      return toYmd(new Date(o.createdAt)) === selectedYmd;
    });
  }, [orders, selectedYmd]);

  const prevMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const todayYmd = toYmd(new Date());

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="flex w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl"
        style={{ maxHeight: '90vh' }}>
        {/* ── Header ── */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
              {initialsAvatar(customer.username)}
            </div>
            <div>
              <h2 className="font-bold text-slate-900">{customer.username}</h2>
              <p className="text-xs text-slate-500">Ιστορικό παραγγελιών</p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* ── Calendar ── */}
          <div className="shrink-0 border-b border-slate-100 bg-slate-50 px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <button type="button" onClick={prevMonth}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-slate-700">
                {MONTH_NAMES_EL[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button type="button" onClick={nextMonth}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-px text-center">
              {DAY_NAMES_EL.map((d) => (
                <div key={d} className="py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {d}
                </div>
              ))}
              {calendarDays.map((day, i) => {
                if (day === null)
                  return <div key={`e-${i}`} />;
                const ymd = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasOrder = orderDaySet.has(ymd);
                const isSelected = selectedYmd === ymd;
                const isToday = ymd === todayYmd;
                return (
                  <button
                    key={ymd}
                    type="button"
                    disabled={!hasOrder}
                    onClick={() => setSelectedYmd((prev) => (prev === ymd ? null : ymd))}
                    className={cn(
                      'relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors',
                      isSelected
                        ? 'font-bold text-white'
                        : hasOrder
                          ? 'font-semibold text-slate-900 hover:bg-slate-200'
                          : 'text-slate-300',
                      isToday && !isSelected && 'ring-1 ring-slate-300',
                    )}
                    style={isSelected ? { backgroundColor: ACCENT } : undefined}
                  >
                    {day}
                    {hasOrder && !isSelected && (
                      <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>
            {selectedYmd && (
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Φίλτρο: <strong>{selectedYmd}</strong> ({shownOrders.length} παραγγελίες)
                </p>
                <button type="button" onClick={() => setSelectedYmd(null)}
                  className="text-xs font-medium text-slate-400 hover:text-slate-700">
                  Εμφάνιση όλων
                </button>
              </div>
            )}
          </div>

          {/* ── Orders list ── */}
          <div className="px-5 py-4">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
              </div>
            )}
            {!loading && shownOrders.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-400">
                {selectedYmd ? 'Δεν υπάρχουν παραγγελίες αυτή την ημέρα.' : 'Δεν βρέθηκαν παραγγελίες.'}
              </p>
            )}
            {!loading && shownOrders.length > 0 && (
              <ul className="space-y-4">
                {shownOrders.map((order) => {
                  const { emoji, label } = orderEmoji(order.status);
                  return (
                    <li key={order.id}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                      {/* Order header */}
                      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg leading-none">{emoji}</span>
                          <div>
                            <span className="text-sm font-semibold text-slate-900">{label}</span>
                            <p className="text-xs text-slate-400">
                              {order.createdAt ? formatDateTime(order.createdAt) : '—'}
                              {order.tableNumber != null && ` · Τραπέζι ${order.tableNumber}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="tabular-nums text-sm font-bold text-slate-900">
                            €{Number(order.totalPrice).toFixed(2)}
                          </p>
                          {(order.totalXp ?? 0) > 0 && (
                            <p className="flex items-center justify-end gap-1 text-xs font-medium text-amber-600">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              +{order.totalXp} XP
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Products */}
                      {order.items && order.items.length > 0 && (
                        <ul className="divide-y divide-slate-50 px-4 py-2">
                          {order.items.map((item, i) => {
                            const product = productMap.get(item.productId.toLowerCase());
                            const imgSrc = product?.imageUrl?.trim() || PLACEHOLDER_IMG;
                            const name = product?.name?.trim() || item.productId;
                            return (
                              <li key={i} className="flex items-center gap-3 py-2.5">
                                <img
                                  src={imgSrc}
                                  alt={name}
                                  className="h-11 w-11 shrink-0 rounded-lg border border-slate-100 object-cover"
                                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-slate-800">{name}</p>
                                  {product?.category && (
                                    <p className="text-xs text-slate-400">{product.category}</p>
                                  )}
                                </div>
                                <div className="shrink-0 text-right">
                                  <p className="text-sm font-semibold text-slate-700 tabular-nums">
                                    ×{item.quantity}
                                  </p>
                                  {item.unitPrice != null && (
                                    <p className="text-xs text-slate-400 tabular-nums">
                                      €{(item.unitPrice * item.quantity).toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        {!loading && orders.length > 0 && (
          <div className="shrink-0 flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500">
            <span>
              {selectedYmd
                ? `${shownOrders.length} από ${orders.length} παραγγελίες`
                : `${orders.length} παραγγελίες`}
            </span>
            <span className="tabular-nums font-semibold text-slate-700">
              Σύνολο €{shownOrders.reduce((s, o) => s + Number(o.totalPrice), 0).toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerAnalyticsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyOrders, setHistoryOrders] = useState<ApiOrder[]>([]);
  const [productMap, setProductMap] = useState<Map<string, ApiProduct>>(new Map());
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getCustomerAnalytics({ limit: PAGE_SIZE, offset: 0 });
        setCustomers(data);
        setHasMore(data.length === PAGE_SIZE);
        if (data.length > 0) setSelectedUserId(data[0].userId);
      } catch {
        setError('Αποτυχία φόρτωσης πελατών.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      const data = await api.getCustomerAnalytics({ limit: PAGE_SIZE, offset: customers.length });
      setCustomers((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    } catch {
      /* silent */
    } finally {
      setIsLoadingMore(false);
    }
  };

  const openHistory = async (userId: string) => {
    setHistoryOrders([]);
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const [allOrders, allProducts] = await Promise.all([
        api.getOrders(),
        api.getProducts(),
      ]);
      // Build product lookup map (id lowercase → product)
      const pMap = new Map<string, ApiProduct>();
      for (const p of allProducts) pMap.set(p.id.toLowerCase(), p);
      setProductMap(pMap);

      // Filter orders by this user, newest first
      const forUser = allOrders
        .filter((o) => String(o.userId ?? '').toLowerCase() === userId.toLowerCase())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setHistoryOrders(forUser);
    } catch {
      /* show empty state */
    } finally {
      setHistoryLoading(false);
    }
  };

  const filtered = customers.filter((c) =>
    c.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const selected = customers.find((c) => c.userId === selectedUserId) ?? null;

  return (
    <div className="flex flex-col gap-6 text-slate-900">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Left: Customer list */}
        <aside className={cn(
          'flex w-full shrink-0 flex-col rounded-2xl border border-slate-200 bg-white',
          'lg:sticky lg:top-0 lg:h-[calc(100vh-6rem)] lg:max-h-[calc(100vh-6rem)] lg:w-72',
        )}>
          <div className="shrink-0 border-b border-slate-200 px-4 py-3">
            <h2 className="font-semibold text-slate-900">Customers</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {isLoading ? '…' : `${filtered.length} σύνολο`}
            </p>
          </div>
          <div className="shrink-0 px-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Αναζήτηση πελάτη..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            {isLoading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            )}
            {!isLoading && error && <p className="px-3 py-4 text-xs text-red-500">{error}</p>}
            {!isLoading && !error && filtered.length === 0 && (
              <p className="px-3 py-4 text-xs text-slate-400">Δεν βρέθηκαν πελάτες.</p>
            )}
            {filtered.map((customer) => {
              const isActive = selectedUserId === customer.userId;
              return (
                <button
                  key={customer.userId}
                  type="button"
                  onClick={() => setSelectedUserId(customer.userId)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                    isActive ? 'text-white' : 'text-slate-700 hover:bg-slate-100',
                  )}
                  style={isActive ? { backgroundColor: ACCENT } : undefined}
                >
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                    isActive ? 'border-white/40 bg-white/20 text-white' : 'border-slate-200 bg-slate-100 text-slate-600',
                  )}>
                    {initialsAvatar(customer.username)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{customer.username}</p>
                    <p className={cn('text-xs font-normal tabular-nums', isActive ? 'text-white/80' : 'text-slate-500')}>
                      €{customer.totalSpent.toFixed(0)} · {customer.totalXpEarned} XP
                    </p>
                  </div>
                </button>
              );
            })}
            {hasMore && (
              <button
                type="button"
                onClick={() => void loadMore()}
                disabled={isLoadingMore}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                {isLoadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isLoadingMore ? 'Φόρτωση…' : 'Φόρτωση περισσότερων'}
              </button>
            )}
          </div>
        </aside>

        {/* Right panel */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {/* Banner */}
          <div
            className="relative overflow-hidden rounded-2xl px-6 py-6 md:px-8 md:py-8"
            style={{ background: 'linear-gradient(135deg, #fef3e2 0%, #fde8d4 50%, #fad9b8 100%)' }}
          >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="font-anbit-display text-2xl font-bold text-slate-900 md:text-3xl">
                  Manage Your Customers
                </h1>
                <p className="mt-1 max-w-xl text-sm text-slate-600 md:text-base">
                  Δείτε δαπάνες, πόντους XP και παραγγελίες κάθε πελάτη.
                </p>
              </div>
              <div className="mt-4 flex justify-center md:mt-0">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/60 text-5xl shadow-sm md:h-28 md:w-28">👥</div>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          )}

          {!isLoading && error && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />{error}
            </div>
          )}

          {!isLoading && !error && selected && (
            <div className="flex flex-col gap-6">
              {/* Hero */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-100 bg-slate-100 text-2xl font-bold text-slate-600">
                    {initialsAvatar(selected.username)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-slate-900 md:text-2xl">{selected.username}</h3>
                    <p className="mt-0.5 text-xs text-slate-400 tabular-nums">ID: {selected.userId}</p>
                    <div className="mt-6 flex flex-wrap gap-6 border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Συνολική δαπάνη</p>
                        <p className="tabular-nums text-2xl font-bold text-slate-900">€{selected.totalSpent.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">XP Earned</p>
                        <p className="tabular-nums text-2xl font-bold text-slate-900">{selected.totalXpEarned}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Παραγγελίες</p>
                        <p className="tabular-nums text-2xl font-bold text-slate-900">{selected.totalOrders}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <TrendingUp className="h-4 w-4" style={{ color: ACCENT }} />
                    Στατιστικά
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      { label: 'Μέση αξία παραγγελίας', value: `€${selected.totalOrders > 0 ? (selected.totalSpent / selected.totalOrders).toFixed(2) : '0.00'}` },
                      { label: 'Μέσο XP ανά παραγγελία', value: String(selected.totalOrders > 0 ? Math.round(selected.totalXpEarned / selected.totalOrders) : 0) },
                      { label: 'Σύνολο παραγγελιών', value: String(selected.totalOrders) },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                        <p className="text-sm text-slate-600">{label}</p>
                        <p className="tabular-nums font-semibold text-slate-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    Πόντοι XP
                  </div>
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <p className="tabular-nums text-5xl font-extrabold text-slate-900">{selected.totalXpEarned}</p>
                    <p className="text-sm text-slate-500">συνολικοί πόντοι XP</p>
                    <div className="mt-4 w-full rounded-xl border border-amber-100 bg-amber-50 p-4 text-center">
                      <p className="text-xs text-amber-700">
                        Ο πελάτης έχει κερδίσει <strong>{selected.totalXpEarned} XP</strong> σε{' '}
                        <strong>{selected.totalOrders}</strong> παραγγελίες.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap gap-3">
                  <Button className="gap-2 text-white" style={{ backgroundColor: ACCENT }}>
                    <CreditCard className="h-4 w-4" />
                    Προσθήκη Loyalty Πόντων
                  </Button>
                  <Button variant="outline" className="gap-2"
                    onClick={() => void openHistory(selected.userId)}>
                    <History className="h-4 w-4" />
                    Ιστορικό Συναλλαγών
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && customers.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-400">
              <Users className="h-14 w-14" />
              <p className="mt-3 text-sm font-medium">Δεν υπάρχουν πελάτες ακόμα.</p>
            </div>
          )}
        </div>
      </div>

      {historyOpen && selected && (
        <HistoryModal
          customer={selected}
          orders={historyOrders}
          productMap={productMap}
          loading={historyLoading}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </div>
  );
};

export default Customers;
