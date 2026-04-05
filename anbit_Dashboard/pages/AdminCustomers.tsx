import React, { useMemo, useState } from 'react';
import { INITIAL_CUSTOMERS } from '@/constants';
import type { Customer } from '@/types';
import { Users, Search, Wallet, Star, ShoppingBag, TrendingUp, Clock } from 'lucide-react';

const ITEM_TO_STORE: Record<string, string> = {
  'Flat White': 'Anbit Coffee Lab',
  Croissant: 'Anbit Coffee Lab',
  'Freddo Espresso': 'Anbit Coffee Lab',
  'Caramel Latte': 'Anbit Coffee Lab',
  Burgers: 'Anbit Burger House',
  'Legendary Burger': 'Anbit Burger House',
  'Cyber Burger': 'Anbit Burger House',
  'Cheese Fries': 'Anbit Burger House',
  Beer: 'Anbit Craft Bar',
  'Craft Beer': 'Anbit Craft Bar',
  'Craft IPA': 'Anbit Craft Bar',
  'Chocolate Cake': 'Anbit Dessert Room',
};

const AdminCustomers: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string>(INITIAL_CUSTOMERS[0]?.id ?? '');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return INITIAL_CUSTOMERS;
    return INITIAL_CUSTOMERS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q),
    );
  }, [search]);

  const selected = useMemo(
    () => filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId],
  );

  const totals = useMemo(() => {
    const users = INITIAL_CUSTOMERS.length;
    const totalXp = INITIAL_CUSTOMERS.reduce((sum, c) => sum + c.loyaltyPoints, 0);
    const totalSpent = INITIAL_CUSTOMERS.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalOrders = INITIAL_CUSTOMERS.reduce((sum, c) => sum + c.totalOrders, 0);
    return {
      users,
      totalXp,
      totalSpent,
      avgSpent: users ? totalSpent / users : 0,
      totalOrders,
    };
  }, []);

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
            <h1 className="font-anbit-display text-2xl font-bold text-slate-900 md:text-3xl">
              Users & XP Intelligence
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600 md:text-base">
              Συγκεντρωτική εικόνα χρηστών, πόντων, αγορών και συμπεριφοράς.
            </p>
          </div>
          <div className="mt-4 flex justify-center md:mt-0 md:block">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/70 text-4xl shadow-sm md:h-28 md:w-28">
              👥
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={<Users className="h-4 w-4" />} label="Σύνολο Χρηστών" value={totals.users.toLocaleString()} />
        <KpiCard icon={<Star className="h-4 w-4" />} label="Συνολικά XP" value={totals.totalXp.toLocaleString()} />
        <KpiCard icon={<Wallet className="h-4 w-4" />} label="Συνολική Δαπάνη" value={`€${totals.totalSpent.toFixed(2)}`} />
        <KpiCard icon={<TrendingUp className="h-4 w-4" />} label="Μέση Δαπάνη / User" value={`€${totals.avgSpent.toFixed(2)}`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Όλοι οι χρήστες</h2>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
              />
            </div>
          </div>
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-slate-700">User</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-slate-700">XP</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-slate-700">Orders</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-slate-700">Spent</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const active = selected?.id === c.id;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className={`cursor-pointer border-b border-slate-100 hover:bg-slate-50 ${active ? 'bg-sky-50/70' : ''}`}
                    >
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.email}</div>
                      </td>
                      <td className="anbit-tabular-nums px-4 py-2.5 font-semibold text-slate-900">
                        {c.loyaltyPoints.toLocaleString()}
                      </td>
                      <td className="anbit-tabular-nums px-4 py-2.5 text-slate-700">{c.totalOrders}</td>
                      <td className="anbit-tabular-nums px-4 py-2.5 text-slate-700">€{c.totalSpent.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          {selected ? <CustomerDetails customer={selected} /> : <p className="text-sm text-slate-500">Δεν βρέθηκε χρήστης.</p>}
        </div>
      </div>
    </div>
  );
};

function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <p className="anbit-tabular-nums mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function CustomerDetails({ customer }: { customer: Customer }) {
  const latestTx = customer.transactions[0];
  const stores = Array.from(
    new Set(
      customer.transactions.flatMap((tx) =>
        tx.items.map((item) => ITEM_TO_STORE[item.name] ?? 'Unknown Store'),
      ),
    ),
  );
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <img src={customer.avatar} alt="" className="h-14 w-14 rounded-xl border border-slate-200" />
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{customer.name}</h3>
          <p className="text-xs text-slate-500">{customer.email}</p>
          <p className="text-xs text-slate-500">ID: {customer.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MiniStat icon={<Star className="h-4 w-4" />} label="XP" value={customer.loyaltyPoints.toLocaleString()} />
        <MiniStat icon={<ShoppingBag className="h-4 w-4" />} label="Orders" value={String(customer.totalOrders)} />
        <MiniStat icon={<Wallet className="h-4 w-4" />} label="Spent" value={`€${customer.totalSpent.toFixed(2)}`} />
        <MiniStat icon={<Clock className="h-4 w-4" />} label="Last Visit" value={customer.lastVisit} />
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Προτιμήσεις</p>
        <div className="flex flex-wrap gap-2">
          {customer.preferredItems.map((item) => (
            <span key={item} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
          Μαγαζιά που ψωνίζει
        </p>
        {stores.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {stores.map((store) => (
              <span
                key={store}
                className="rounded-full bg-sky-50 border border-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700"
              >
                {store}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Δεν υπάρχουν διαθέσιμα δεδομένα καταστημάτων.</p>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Τελευταία αγορά</p>
        {latestTx ? (
          <div className="rounded-xl border border-slate-200 p-3 text-sm">
            <p className="font-medium text-slate-900">{latestTx.date} {latestTx.time}</p>
            <p className="text-slate-600">
              Σύνολο:{' '}
              <span className="anbit-tabular-nums">
                €{latestTx.totalSpent.toFixed(2)} · XP: +{latestTx.pointsEarned}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Δεν υπάρχουν αγορές.</p>
        )}
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
      <p className="anbit-tabular-nums mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default AdminCustomers;
