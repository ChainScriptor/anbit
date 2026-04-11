import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Copy, Facebook, Linkedin, Trophy } from 'lucide-react';
import { UserData, Partner } from '../types';
import { useTheme } from '../context/ThemeContext';
import { IconTabs3D, type ProfileTabItem } from './ui/3d-icon-tabs-1';
import { ProfileInsightsSection } from './profile/ProfileInsightsSection';

type OrderHistoryFilter = 'all' | 'supermarket' | 'food';

type OrderHistoryEntry = {
  id: string;
  storeName: string;
  storeImage: string;
  dateTime: string;
  status: 'completed' | 'cancelled';
  price: string;
  itemsSummary: string;
  xp?: number;
  category: 'supermarket' | 'food';
};

const ORDER_HISTORY_MOCK: OrderHistoryEntry[] = [
  {
    id: '1',
    storeName: 'Anbit Market',
    storeImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA1R3KTvL-Zjrr9zGyuScQJcSY0KkyFxF-hXC36_5EA_BEpjUdTyed8t6ueWdwYazjt0TXPhs3Uv_Z9yfy2SPOdNsc_T7d1dze7SJwhTfqSBc_feLSBGxGeUc_z2NSGFce762-vxmSs3ZXmdQ8ETS5NLBqos3Vxz1z9z5r4Mu9qRiz9EBfO6fLykl3HLnPTtSQQS2zy86aDb7_xIOnHnkN6wfSEJDVcyp5c1sRHFqO-J6Vk0ftTS52DLTMKMgCMsLlK2frWs5L826k',
    dateTime: '10 Απριλίου, 20:30',
    status: 'completed',
    price: '24.50 €',
    itemsSummary: '1x Γάλα Φρέσκο, 2x Μπανάνες, 1x Ψωμί',
    xp: 150,
    category: 'supermarket',
  },
  {
    id: '2',
    storeName: 'Meat the King',
    storeImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA_WiKyEt4PbNC2i15LG1PRA9qoOBdxQKfEvDbhNXm3awPcKOpYyNohg7v2rBY49oBf5UEYGsYQmSGIK-g6lJa0MX3jsXNTwdYJElzazCS41MbMDqOEVBZpOtXlzvXbaDbAdiYUhXtLv8BH_qrHvhIFIuQzNn8kHkPDYRy7G5acg_m-ZJqtStIhCzGnzcUJeoBuO550BYrA-BljIi7-UmPJvecy-0xihUM5lT_3B-rY9aswUf5nLPQ2U7WRCLiFy3zVD0ds6hpRxp0',
    dateTime: '08 Απριλίου, 14:15',
    status: 'completed',
    price: '42.80 €',
    itemsSummary: '2x Μπριζόλες Μοσχαρίσιες, 1x Χοιρινό Σουβλάκι (5 τμχ)',
    xp: 280,
    category: 'food',
  },
  {
    id: '3',
    storeName: 'Pizza Squad',
    storeImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBH8r80SC7C60gnIrADg_DLZf60pxDunUx0v14lfoeuF8_187xj5DZdIgmpAciyaPfOBnEHkEh9AfCqWnROiL3h2Mi-FpXSpQ9wkp89o1RSdN-Ewt971H-lBqvE0nrGxJm7jWxPBO5aOZq3xbMFTMsCeCihkHz6_A8mgvQaJIQ-A1nQ-d0E6Sdh9TBqTf3BNgoS53XW7vjXDQufMrl2FFMjlFNYOo_gXsj0zU20PoEkEst76nnkKHnWePV_3XjBO0o4Uxy61pRoFM0',
    dateTime: '05 Απριλίου, 21:05',
    status: 'cancelled',
    price: '18.20 €',
    itemsSummary: '1x Pizza Special (Μεγάλη), 1x Coca Cola 500ml',
    category: 'food',
  },
];

const profileTabs: Array<ProfileTabItem & { path: string }> = [
  { id: 'informations', label: 'Προσωπικές πληροφορίες', path: '/profile/informations' },
  { id: 'favorites', label: 'Αγαπημένα καταστήματα', path: '/profile/favorites' },
  { id: 'history', label: 'Ιστορικό παραγγελιών', path: '/profile/history' },
  { id: 'earn', label: 'Κέρδισε κουπόνια Anbit', path: '/profile/earn' },
  { id: 'redeem', label: 'Εξαργύρωση κουπονιού', path: '/profile/redeem' },
  { id: 'settings', label: 'Ρυθμίσεις', path: '/profile/settings' },
];

const ProfilePage: React.FC<{ user: UserData; partners?: Partner[] }> = ({
  user,
  partners = [],
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const storeXP = user.storeXP || {};
  const totalStorePoints = Object.values(storeXP).reduce((sum, v) => sum + (Number(v) || 0), 0);

  const partnersWithPoints = useMemo(
    () =>
      [...partners]
        .map((p) => ({ partner: p, xp: storeXP[p.id] ?? 0 }))
        .sort((a, b) => b.xp - a.xp),
    [partners, storeXP]
  );

  const [orderHistoryFilter, setOrderHistoryFilter] = useState<OrderHistoryFilter>('all');
  const filteredOrderHistory = useMemo(() => {
    if (orderHistoryFilter === 'all') return ORDER_HISTORY_MOCK;
    return ORDER_HISTORY_MOCK.filter((o) => o.category === orderHistoryFilter);
  }, [orderHistoryFilter]);

  useEffect(() => {
    if (location.pathname === '/profile') {
      navigate('/profile/informations', { replace: true });
    }
  }, [location.pathname, navigate]);

  const activeTabId =
    profileTabs.find((tab) => location.pathname.startsWith(tab.path))?.id ?? 'informations';

  return (
    <div
      className="min-h-screen font-sans antialiased"
      data-theme={theme}
      style={{
        backgroundColor: 'var(--anbit-bg)',
        color: 'var(--anbit-text)',
      }}
    >
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <div className="mb-4 sm:mb-5">
          <h1
            className="anbit-wordmark font-anbit text-4xl sm:text-5xl leading-none text-white"
            style={{ textShadow: '0 0 8px rgba(255,255,255,0.12)' }}
          >
            Προφίλ
          </h1>
        </div>
        <div className="mb-4">
          <IconTabs3D
            items={profileTabs}
            activeId={activeTabId}
            onSelect={(id) => {
              const selected = profileTabs.find((tab) => tab.id === id);
              if (selected) navigate(selected.path);
            }}
          />
        </div>

        {activeTabId === 'history' && (
          <div className="mx-auto w-full max-w-4xl px-2 pb-12 pt-2 sm:px-4">
            <div className="mb-10 sm:mb-12">
              <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                Ιστορικό Παραγγελιών
              </h2>
              <p className="text-lg font-medium text-[#ababab]/80">
                Δείτε και διαχειριστείτε τις προηγούμενες αγορές σας
              </p>
            </div>

            <div className="mb-10 flex gap-4 overflow-x-auto pb-2 sm:mb-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {(
                [
                  { id: 'all' as const, label: 'Όλες' },
                  { id: 'supermarket' as const, label: 'Σούπερ Μάρκετ' },
                  { id: 'food' as const, label: 'Φαγητό' },
                ] as const
              ).map((pill) => {
                const active = orderHistoryFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setOrderHistoryFilter(pill.id)}
                    className={
                      active
                        ? 'shrink-0 rounded-full bg-anbit-brand px-8 py-3 text-sm font-bold text-anbit-brand-foreground shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all hover:brightness-110 active:scale-95'
                        : 'shrink-0 whitespace-nowrap rounded-full border border-white/5 bg-[#131313] px-8 py-3 text-sm font-bold text-[#ababab] transition-all hover:bg-[#1f1f1f]'
                    }
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-8">
              {filteredOrderHistory.map((order) => {
                const isCancelled = order.status === 'cancelled';
                return (
                  <div
                    key={order.id}
                    className={`group relative rounded-xl border p-6 sm:p-8 transition-all hover:ring-1 hover:ring-white/10 ${isCancelled ? 'border-anbit-brand/20' : 'border-white/5'} bg-[linear-gradient(145deg,#131313_0%,#0e0e0e_100%)] shadow-[0_4px_30px_rgba(0,0,0,0.5)]`}
                  >
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4 sm:gap-5">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-[#1f1f1f] sm:h-16 sm:w-16">
                          <img
                            src={order.storeImage}
                            alt=""
                            className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                            draggable={false}
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="mb-1 text-xl font-extrabold text-white sm:text-2xl">{order.storeName}</h3>
                          {isCancelled ? (
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-anbit-brand">
                              {order.dateTime} • Ακυρώθηκε
                            </p>
                          ) : (
                            <p className="text-sm font-medium tracking-wide text-[#ababab]">
                              {order.dateTime} • Ολοκληρώθηκε
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-start sm:items-end">
                        <span
                          className={`text-2xl font-black sm:text-3xl ${isCancelled ? 'text-white/20 line-through' : 'text-white'}`}
                        >
                          {order.price}
                        </span>
                      </div>
                    </div>

                    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-white/5 bg-black/40 px-4 py-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                      <p className="text-sm font-medium italic text-[#ababab]">{order.itemsSummary}</p>
                      {!isCancelled && order.xp != null ? (
                        <div className="flex shrink-0 items-center gap-1.5 self-start rounded-full border border-anbit-brand/20 bg-anbit-brand/10 px-3 py-1.5 sm:self-auto">
                          <Trophy className="h-4 w-4 text-white" aria-hidden />
                          <span className="text-xs font-bold tracking-widest text-white">+{order.xp} XP</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex gap-4">
                      {isCancelled ? (
                        <button
                          type="button"
                          className="w-full rounded-lg border border-white/10 bg-[#131313] py-4 text-xs font-extrabold tracking-wider text-[#e5e5e5] transition-all duration-300 hover:bg-[#1f1f1f] active:scale-[0.99]"
                        >
                          ΑΝΑΦΟΡΑ ΠΡΟΒΛΗΜΑΤΟΣ
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="w-full rounded-lg bg-anbit-brand py-4 text-xs font-extrabold tracking-wider text-anbit-brand-foreground transition-all duration-300 hover:bg-anbit-brand-hover active:scale-[0.99]"
                        >
                          ΛΕΠΤΟΜΕΡΕΙΕΣ
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTabId === 'earn' && (
          <section className="mx-auto max-w-3xl rounded-3xl border border-[color:var(--anbit-border)] bg-[#05070b] p-5 shadow-sm sm:p-7">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <img src="/categories/coupon.gif" alt="Referral coupon" className="h-[190px] w-full object-cover sm:h-[240px]" />
            </div>

            <div className="mt-6 space-y-4 text-white">
              <h2 className="text-center text-2xl font-extrabold leading-tight sm:text-4xl">
                Προσκάλεσε τους φίλους σου και κέρδισε προσφορές
              </h2>

              <div className="space-y-4 text-[15px] leading-relaxed text-white/95">
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-anbit-brand text-sm font-bold text-anbit-brand-foreground">1</span>
                  <p>
                    Οι φίλοι σου θα κερδίσουν 3,00 € σε Anbit κουπόνια όταν χρησιμοποιήσουν τον κωδικό σου για κάθε μία από τις
                    πρώτες τους 3 παραγγελίες.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-anbit-brand text-sm font-bold text-anbit-brand-foreground">2</span>
                  <p>
                    Θα κερδίσεις 3,00 € σε Anbit κουπόνια για κάθε μία από τις πρώτες 3 παραγγελίες των φίλων σου. Μπορείς να
                    κερδίσεις έναν μέγιστο αριθμό 15,00 € μονάδων πίστωσης προσκαλώντας τους φίλους σας να γίνουν μέλη της Anbit.
                  </p>
                </div>
              </div>

              <div className="pt-1 text-center">
                <button type="button" className="text-anbit-brand hover:text-anbit-brand-hover transition-colors">
                  Πώς λειτουργούν τα κουπόνια Anbit;
                </button>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-white/70">Ο κωδικός σου</p>
                    <p className="mt-1 text-2xl font-bold tracking-wide">ATUD5MF</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/90 hover:bg-white/10 transition-colors"
                    aria-label="Αντιγραφή κωδικού"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="pt-1 text-center">
                <p className="text-sm text-white/75">Μοιράσου τον εκπτωτικό κωδικό σου</p>
                <div className="mt-3 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10 transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10 transition-colors"
                    aria-label="Share on X"
                  >
                    <span className="text-lg font-semibold">X</span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10 transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTabId === 'redeem' && (
          <section className="mx-auto max-w-3xl rounded-3xl border border-[color:var(--anbit-border)] bg-[#05070b] p-5 shadow-sm sm:p-7">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <img src="/categories/coupons.gif" alt="Coupon redemption" className="h-[190px] w-full object-cover sm:h-[240px]" />
            </div>

            <div className="mt-6 text-center text-white">
              <h2 className="text-3xl font-extrabold leading-tight sm:text-5xl">Εξαργύρωση κωδικού</h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-2xl">
                Εάν έχεις δωροκάρτα Anbit ή κωδικό προσφοράς, πληκτρολόγησέ τον παρακάτω για να τον εξαργυρώσεις!
              </p>

              <div className="mx-auto mt-7 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  placeholder="Εισάγετε τον κωδικό..."
                  className="h-12 flex-1 rounded-2xl border border-white/20 bg-black/40 px-4 text-white outline-none placeholder:text-white/45 focus:border-anbit-brand focus:ring-2 focus:ring-anbit-brand/20"
                />
                <button
                  type="button"
                  className="h-12 rounded-2xl bg-anbit-brand px-7 font-bold text-anbit-brand-foreground transition-colors hover:bg-anbit-brand-hover"
                >
                  Εξαργύρωση
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTabId === 'settings' && (
          <section
            className="overflow-hidden rounded-3xl border shadow-sm"
            style={{
              borderColor: 'var(--anbit-border)',
              backgroundColor: 'var(--anbit-card)',
              color: 'var(--anbit-text)',
            }}
          >
            <div className="border-b px-5 py-5 sm:px-6" style={{ borderColor: 'var(--anbit-border)' }}>
              <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--anbit-text)' }}>
                Ρυθμίσεις
              </h2>
            </div>

            <div className="px-5 py-6 sm:px-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_180px] sm:items-end">
                <div>
                  <label className="text-xs font-medium" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--anbit-text)' }}>
                    Χώρα
                  </label>
                  <p className="mt-1 text-[11px]" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--anbit-muted)' }}>
                    Το νόμισμα που συνδέεται αφορίζει τις χρεώσεις στην εφαρμογή μας
                  </p>
                </div>
                <div>
                  <select
                    className="h-10 w-full rounded-md border px-3 text-sm outline-none"
                    defaultValue="Ελλάδα"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      borderColor: 'var(--anbit-border)',
                      backgroundColor: 'var(--anbit-input)',
                      color: 'var(--anbit-text)',
                    }}
                  >
                    <option>Ελλάδα</option>
                    <option>Κύπρος</option>
                  </select>
                </div>
              </div>

              <div
                className="mt-6 divide-y border-y"
                style={{ borderColor: 'var(--anbit-border)', ['--tw-divide-opacity' as never]: '1' }}
              >
                {[
                  { label: 'Email', value: user.email, accent: true },
                  { label: 'Αριθμός κινητού', value: '+30 69 1234 5678', accent: true },
                  { label: 'Όνομα', value: user.name, accent: true },
                  { label: 'Διαγραφή λογαριασμού', value: 'Διαγραφή', danger: true },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3 py-3">
                    <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--anbit-text)' }}>
                      {row.label}
                    </span>
                    <span
                      className={`text-sm ${row.danger ? 'text-red-500' : row.accent ? 'text-sky-500' : ''}`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="mt-4 divide-y border-y"
                style={{ borderColor: 'var(--anbit-border)', ['--tw-divide-opacity' as never]: '1' }}
              >
                {[
                  { label: 'Αποστολή αποδείξεων σε email', value: true },
                  { label: 'Αποδοχή ρύθμισης αυτόματης μετάφρασης', value: false, text: 'Επεξεργασία' },
                  { label: 'Αποσύνδεση από τον λογαριασμό Anbit', value: false, text: 'Αποσύνδεση' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3 py-3">
                    <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--anbit-text)' }}>
                      {row.label}
                    </span>
                    {row.text ? (
                      <span className="text-sm text-sky-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {row.text}
                      </span>
                    ) : (
                      <button
                        type="button"
                        className={`relative h-6 w-11 rounded-full ${row.value ? 'bg-sky-500' : ''}`}
                        style={{ backgroundColor: row.value ? undefined : 'var(--anbit-border)' }}
                        aria-label={row.label}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${row.value ? 'left-[22px]' : 'left-0.5'
                            }`}
                        />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 border-y py-3" style={{ borderColor: 'var(--anbit-border)' }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--anbit-text)' }}>
                    Αποδοχές
                  </span>
                  <div
                    className="inline-flex rounded-md border p-0.5"
                    style={{ borderColor: 'var(--anbit-border)', backgroundColor: 'var(--anbit-input)' }}
                  >
                    {['Απλάχιστα', 'Φυσικά', 'Σκοτεινό', 'Υψηλή αντίθεση'].map((mode, idx) => (
                      <button
                        key={mode}
                        type="button"
                        className="rounded px-2.5 py-1 text-xs"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          backgroundColor: idx === 2 ? 'var(--anbit-card)' : 'transparent',
                          color: idx === 2 ? 'var(--anbit-text)' : 'var(--anbit-muted)',
                          border: idx === 2 ? '1px solid var(--anbit-border)' : '1px solid transparent',
                        }}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--anbit-text)' }}>
                  Προστασία δεδομένων
                </h3>
                <div
                  className="mt-3 divide-y border-y"
                  style={{ borderColor: 'var(--anbit-border)', ['--tw-divide-opacity' as never]: '1' }}
                >
                  <div className="flex items-center justify-between gap-3 py-3">
                    <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--anbit-text)' }}>
                      Δήλω δεδομένων λογαριασμού
                    </span>
                    <span className="text-sm text-sky-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Λήψη PDF
                    </span>
                  </div>
                  {[
                    {
                      title: 'Αναλυτικά',
                      desc: 'Αυτός ο απολογισμός είναι απαραίτητος για τη χρήση των υπηρεσιών της Anbit.',
                    },
                    {
                      title: 'Λειτουργικά',
                      desc: 'Χρησιμοποιούμε τεχνολογίες για την καλύτερη εμπειρία και λειτουργία της εφαρμογής.',
                    },
                    {
                      title: 'Αναλυτικά στοιχεία',
                      desc: 'Χρησιμοποιούμε τεχνολογίες για κατανόηση και βελτιστοποίηση της εμπειρίας σου.',
                    },
                    {
                      title: 'Μάρκετινγκ',
                      desc: 'Χρησιμοποιούμε τεχνολογίες για εξατομικευμένο περιεχόμενο και σχετικές προτάσεις.',
                    },
                  ].map((row) => (
                    <div key={row.title} className="py-3">
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--anbit-text)' }}>
                          {row.title}
                        </span>
                        <button type="button" className="relative h-6 w-11 rounded-full bg-sky-500" aria-label={row.title}>
                          <span className="absolute left-[22px] top-0.5 h-5 w-5 rounded-full bg-white" />
                        </button>
                      </div>
                      <p className="max-w-3xl text-xs leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--anbit-muted)' }}>
                        {row.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--anbit-text)' }}>
                  Προτιμήσεις επικοινωνίας
                </h3>
                <div
                  className="mt-3 divide-y border-y"
                  style={{ borderColor: 'var(--anbit-border)', ['--tw-divide-opacity' as never]: '1' }}
                >
                  {[
                    { title: 'Ειδοποιήσεις push', desc: 'Στέλνουμε push notifications και προσφορές από το Anbit και τους συνεργάτες μας.' },
                    { title: 'Ειδικές προσφορές', desc: 'Στέλνουμε email με προσφορές από το Anbit και τους συνεργάτες μας.' },
                  ].map((row) => (
                    <div key={row.title} className="py-3">
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--anbit-text)' }}>
                          {row.title}
                        </span>
                        <button type="button" className="relative h-6 w-11 rounded-full bg-sky-500" aria-label={row.title}>
                          <span className="absolute left-[22px] top-0.5 h-5 w-5 rounded-full bg-white" />
                        </button>
                      </div>
                      <p className="max-w-3xl text-xs leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--anbit-muted)' }}>
                        {row.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTabId === 'informations' && (
          <ProfileInsightsSection user={user} partnersWithPoints={partnersWithPoints} />
        )}

        {activeTabId === 'favorites' && (
          <section
            className="flex w-full max-w-5xl flex-col items-start justify-between gap-8 rounded-2xl bg-black p-8 md:flex-row md:items-center md:p-12"
            data-purpose="favorites-banner"
            id="favorites-hero"
          >
            <div className="flex-1 space-y-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                Τα αγαπημένα σου
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-[#A1A1AA] md:text-lg">
                Όλα τα αγαπημένα σου εστιατόρια και καταστήματα θα εμφανίζονται εδώ. Μπορείς να τα προσθέσεις
                στην λίστα των αγαπημένων σου απλά πατώντας το εικονίδιο με την καρδιά.
              </p>
            </div>
            <div
              className="flex w-full shrink-0 justify-center md:w-auto md:max-w-[min(100%,520px)] lg:max-w-[min(100%,640px)]"
              data-purpose="favourite-visual"
            >
              <img
                src="/fav.gif"
                alt=""
                className="h-auto max-h-[min(72vh,640px)] w-full object-contain"
                draggable={false}
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
