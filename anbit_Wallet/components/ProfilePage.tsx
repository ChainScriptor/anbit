import React, { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  Zap,
  Star,
  Mail,
  Coffee,
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  Gift,
  Settings,
  Clock,
  ExternalLink,
  Copy,
  Facebook,
  Linkedin,
} from 'lucide-react';
import { UserData, Partner } from '../types';
import { useTheme } from '../context/ThemeContext';
import AnbitWordmark from './AnbitWordmark';
import AnimatedSocialLinks, { type Social } from './ui/social-links';
import { IconTabs3D, type ProfileTabItem } from './ui/3d-icon-tabs-1';

const profileSocials: Social[] = [
  {
    name: 'Instagram',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'TikTok',
    image:
      'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Google',
    image:
      'https://images.unsplash.com/photo-1592609931041-40265b692757?auto=format&fit=crop&w=200&q=80',
  },
];

const profileTabs: Array<ProfileTabItem & { path: string }> = [
  { id: 'informations', label: 'Προσωπικές πληροφορίες', path: '/profile/informations' },
  { id: 'history', label: 'Ιστορικό παραγγελιών', path: '/profile/history' },
  { id: 'earn', label: 'Κέρδισε κουπόνια Anbit', path: '/profile/earn' },
  { id: 'redeem', label: 'Εξαργύρωση κουπονιού', path: '/profile/redeem' },
  { id: 'settings', label: 'Ρυθμίσεις', path: '/profile/settings' },
];

const ProfilePage: React.FC<{ user: UserData; partners?: Partner[] }> = ({ user, partners = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const storeXP = user.storeXP || {};
  const totalStorePoints = Object.values(storeXP).reduce((sum, v) => sum + (Number(v) || 0), 0);
  const availableGifts = 3;

  const partnersWithPoints = useMemo(
    () =>
      [...partners]
        .map((p) => ({ partner: p, xp: storeXP[p.id] ?? 0 }))
        .sort((a, b) => b.xp - a.xp),
    [partners, storeXP]
  );

  const topStores = partnersWithPoints.slice(0, 3);
  // Kept for legacy/hidden UI below (we replace the visible layout with the template).
  const pointsCapXp = 200;
  const levelProgress = Math.max(0, Math.min(100, user.levelProgress ?? 0));
  const storesWithXpCount = partnersWithPoints.filter((x) => x.xp > 0).length;

  const recentActivity = partnersWithPoints.slice(0, 4).map((entry, index) => ({
    id: `${entry.partner.id}-${index}`,
    name: entry.partner.name,
    xp: Math.max(10, Math.round((entry.xp || 0) * 0.06)),
    date: ['Σήμερα · 09:45', 'Χθες · 19:12', 'Πριν 2 μέρες · 20:30', 'Πρόσφατα'][index] ?? 'Πρόσφατα',
    icon: index % 2 === 0 ? Coffee : UtensilsCrossed,
  }));

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
          <section className="rounded-3xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] p-5 shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Ιστορικό παραγγελιών</h2>
            <p className="text-sm text-[color:var(--anbit-muted)] mb-5">Οι τελευταίες επιβεβαιωμένες κινήσεις σου.</p>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--anbit-muted)] mb-3">
              Πρόσφατη δραστηριότητα
            </h3>
            <ul className="space-y-3 text-sm">
              {recentActivity.length === 0 ? (
                <li className="rounded-2xl bg-[color:var(--anbit-input)] p-4 text-center text-xs text-[color:var(--anbit-muted)]">
                  Δεν βρέθηκαν παραγγελίες ακόμη.
                </li>
              ) : (
                recentActivity.map((item) => (
                  <li key={item.id} className="flex items-center justify-between rounded-2xl bg-[color:var(--anbit-input)] p-4">
                    <div>
                      <p className="font-semibold text-[color:var(--anbit-text)]">{item.name}</p>
                      <p className="text-xs text-[color:var(--anbit-muted)]">{item.date}</p>
                    </div>
                    <p className="font-bold text-[color:var(--anbit-text)]">+{item.xp} XP</p>
                  </li>
                ))
              )}
            </ul>
          </section>
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
                  <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e63533] text-sm font-bold">1</span>
                  <p>
                    Οι φίλοι σου θα κερδίσουν 3,00 € σε Anbit κουπόνια όταν χρησιμοποιήσουν τον κωδικό σου για κάθε μία από τις
                    πρώτες τους 3 παραγγελίες.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e63533] text-sm font-bold">2</span>
                  <p>
                    Θα κερδίσεις 3,00 € σε Anbit κουπόνια για κάθε μία από τις πρώτες 3 παραγγελίες των φίλων σου. Μπορείς να
                    κερδίσεις έναν μέγιστο αριθμό 15,00 € μονάδων πίστωσης προσκαλώντας τους φίλους σας να γίνουν μέλη της Anbit.
                  </p>
                </div>
              </div>

              <div className="pt-1 text-center">
                <button type="button" className="text-[#e63533] hover:text-[#cf2f2d] transition-colors">
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
                  className="h-12 flex-1 rounded-2xl border border-white/20 bg-black/40 px-4 text-white outline-none placeholder:text-white/45 focus:border-[#e63533] focus:ring-2 focus:ring-[#e63533]/20"
                />
                <button
                  type="button"
                  className="h-12 rounded-2xl bg-[#e63533] px-7 font-bold text-white transition-colors hover:bg-[#cf2f2d]"
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
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                            row.value ? 'left-[22px]' : 'left-0.5'
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
        <>
        <section>
          <div className="relative overflow-hidden rounded-3xl border border-[color:var(--anbit-xp-surface-border)] shadow-lg">
            <div className="flex flex-col gap-4 rounded-[22px] bg-[color:var(--anbit-card)] p-4 sm:flex-row sm:gap-5 sm:p-6">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[color:var(--anbit-input)] shadow-sm sm:h-24 sm:w-24">
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                <div className="absolute -bottom-1 -right-1 rounded-lg bg-[color:var(--anbit-xp-bar)] px-1.5 py-0.5 text-[10px] font-bold text-[color:var(--anbit-bg)] shadow-sm">
                  LVL {user.currentLevel}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{user.name}</h1>
                    <p className="text-xs text-[color:var(--anbit-muted)]">
                      {user.currentLevelName ?? user.email}
                    </p>
                  </div>
                  <div className="w-fit rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm">
                    <span className="text-amber-300">★</span>
                    <span className="ml-1.5 text-white/90">Global Rank #45</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 sm:text-sm lg:grid-cols-3">
                  <div className="rounded-2xl bg-[color:var(--anbit-input)] p-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-[color:var(--anbit-muted)]">
                      Συνολικά XP
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold tabular-nums">
                      <Zap className="h-4 w-4 text-[color:var(--anbit-xp-accent)]" />
                      <span className="text-[color:var(--anbit-xp-accent)]">{user.totalXP.toLocaleString()} XP</span>
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[color:var(--anbit-input)] p-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-[color:var(--anbit-muted)]">
                      Επόμενο επίπεδο ({levelProgress}%)
                    </p>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[color:var(--anbit-border)]">
                      <div
                        className="h-full rounded-full bg-[color:var(--anbit-xp-bar)]"
                        style={{ width: `${levelProgress}%` }}
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[color:var(--anbit-input)] p-3 shadow-sm sm:col-span-2 lg:col-span-1">
                    <p className="text-[11px] uppercase tracking-wide text-[color:var(--anbit-muted)]">
                      Καταστήματα με XP
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold">
                      <Star className="h-4 w-4 text-[color:var(--anbit-xp-accent)]" />
                      <span className="text-[color:var(--anbit-xp-accent)]">{storesWithXpCount} ενεργά</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Οι πόντοι σου ανά κατάστημα</h1>
            <p className="text-[color:var(--anbit-muted)] text-lg">
              Κάθε συνεργαζόμενο μέρος κρατά ξεχωριστά XP — δες πού 'καίει' το score σου.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-8">
                <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[color:var(--anbit-card)] border border-[color:var(--anbit-border)] text-[color:var(--anbit-muted)] hover:text-[color:var(--anbit-text)] transition-colors">
                  <span className="material-symbols-outlined text-sm" data-icon="chevron_left">
                    chevron_left
                  </span>
                </button>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-[color:var(--anbit-text)] rounded-full" />
                  <div className="w-1 h-1 bg-[color:var(--anbit-border)] rounded-full" />
                  <div className="w-1 h-1 bg-[color:var(--anbit-border)] rounded-full" />
                  <div className="w-1 h-1 bg-[color:var(--anbit-border)] rounded-full" />
                </div>

                <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[color:var(--anbit-card)] border border-[color:var(--anbit-border)] text-[color:var(--anbit-muted)] hover:text-[color:var(--anbit-text)] transition-colors">
                  <span className="material-symbols-outlined text-sm" data-icon="chevron_right">
                    chevron_right
                  </span>
                </button>
              </div>

              {topStores.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm font-medium text-[color:var(--anbit-muted)]">
                  Δεν υπάρχουν ακόμα πόντοι. Εξερεύνησε το δίκτυο.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topStores.map(({ partner, xp }, idx) => {
                    const tier = idx === 1 ? "SILVER" : "GOLD";
                    const capXp = idx === 1 ? 150 : 200;
                    const points = Math.round(xp);
                    const safePct = Math.max(0, Math.min(100, Math.round((points / capXp) * 100)));

                    // Match the template's constants: r=42 => circumference ≈ 263.8
                    const radius = 42;
                    const circumference = 263.8;
                    const dashOffset = Number(
                      (circumference - (circumference * safePct) / 100).toFixed(1),
                    );

                    const lastVisit =
                      idx === 0 ? "2 μέρες πριν" : idx === 1 ? "5 μέρες πριν" : "1 μέρα πριν";

                    return (
                      <div
                        key={partner.id}
                        className="relative bg-[color:var(--anbit-card)] border border-[color:var(--anbit-border)] rounded-3xl p-6"
                      >
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-14 h-14 rounded-full border-2 border-[color:var(--anbit-border)] p-0.5">
                            <img
                              alt={partner.name}
                              className="w-full h-full object-cover rounded-full"
                              src={partner.image}
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-[color:var(--anbit-text)]">{partner.name}</h3>
                            <div className="flex items-center gap-2">
                              <span
                                className="material-symbols-outlined text-[10px] text-yellow-500"
                                data-icon="star"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                star
                              </span>
                              <span className="text-[10px] font-bold text-[color:var(--anbit-muted)]">
                                {partner.rating.toFixed(1)}
                              </span>
                              <span className="text-[10px] font-bold text-[color:var(--anbit-muted)] uppercase tracking-widest ml-1">
                                {tier}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-end mb-8">
                          <div>
                            <p className="text-[10px] text-[color:var(--anbit-muted)] font-bold uppercase mb-1">Points</p>
                            <p className="text-4xl font-black text-[color:var(--anbit-text)]">{points}</p>
                            <p className="text-[11px] text-[color:var(--anbit-muted)] mt-1">από {capXp} XP</p>
                          </div>

                          <div className="relative w-20 h-20">
                            <svg
                              className="w-full h-full"
                              viewBox="0 0 100 100"
                              style={{ transform: "rotate(-90deg)" }}
                            >
                              <circle
                                className="text-[color:var(--anbit-border)] stroke-current"
                                cx="50"
                                cy="50"
                                fill="transparent"
                                r={radius}
                                strokeWidth="6"
                              />
                              <circle
                                className="text-[color:var(--anbit-text)] stroke-current"
                                cx="50"
                                cy="50"
                                fill="transparent"
                                r={radius}
                                strokeDasharray={`${circumference}`}
                                strokeDashoffset={`${dashOffset}`}
                                strokeLinecap="round"
                                strokeWidth="6"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center font-black text-sm">
                              {safePct}%
                            </div>
                          </div>
                        </div>

                        <div className="h-1 bg-[color:var(--anbit-border)] rounded-full mb-8 overflow-hidden">
                          <div className="h-full bg-[color:var(--anbit-text)]" style={{ width: `${safePct}%` }} />
                        </div>

                        <div className="flex items-center gap-2 text-[color:var(--anbit-muted)] text-[10px] font-bold mb-6">
                          <span className="material-symbols-outlined text-sm" data-icon="schedule">
                            schedule
                          </span>
                          Τελευταία επίσκεψη: {lastVisit}
                        </div>

                        <Link
                          to={`/store-profile/${partner.id}`}
                          state={{ partner }}
                          className="w-full py-3 rounded-2xl border border-[#e63533] bg-[#e63533] text-white flex items-center justify-center gap-2 text-xs font-bold hover:bg-[#cf2f2d] hover:border-[#cf2f2d] transition-all"
                        >
                          Explore Store{" "}
                          <span className="material-symbols-outlined text-sm" data-icon="open_in_new">
                            open_in_new
                          </span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="bg-[color:var(--anbit-card)] border border-[color:var(--anbit-border)] rounded-3xl p-6">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--anbit-muted)] mb-6">
                  ΓΡΗΓΟΡΕΣ ΕΝΕΡΓΕΙΕΣ
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="material-symbols-outlined text-[color:var(--anbit-muted)] text-lg"
                        data-icon="card_giftcard"
                      >
                        card_giftcard
                      </span>
                      <span className="text-sm text-[color:var(--anbit-muted)]">Διαθέσιμα Δώρα</span>
                    </div>
                    <span className="text-sm font-black text-[color:var(--anbit-text)]">{availableGifts}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="material-symbols-outlined text-[color:var(--anbit-muted)] text-lg"
                        data-icon="trending_up"
                      >
                        trending_up
                      </span>
                      <span className="text-sm text-[color:var(--anbit-muted)]">Συνολικοί Πόντοι</span>
                    </div>
                    <span className="text-sm font-black text-[color:var(--anbit-text)]">{Math.round(totalStorePoints)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[color:var(--anbit-card)] border border-[color:var(--anbit-border)] rounded-3xl p-6">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--anbit-muted)] mb-6">
                  ΡΥΘΜΙΣΕΙΣ
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[color:var(--anbit-muted)] text-lg" data-icon="settings">
                      settings
                    </span>
                    <span className="text-sm text-[color:var(--anbit-muted)]">Ρυθμίσεις Λογαριασμού</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[color:var(--anbit-muted)] text-lg" data-icon="person">
                      person
                    </span>
                    <span className="text-sm text-[color:var(--anbit-muted)]">Προφίλ</span>
                  </div>
                </div>
              </div>

              <div className="bg-[color:var(--anbit-card)] border border-[color:var(--anbit-border)] rounded-3xl p-6">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--anbit-muted)] mb-6">SOCIAL</h4>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[color:var(--anbit-muted)] text-lg" data-icon="group">
                    group
                  </span>
                  <span className="text-sm text-[color:var(--anbit-muted)]">Προσκάλεσε Φίλους</span>
                </div>
              </div>

              <div className="bg-[color:var(--anbit-card)] border border-[color:var(--anbit-border)] rounded-3xl p-6">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--anbit-muted)] mb-6">
                  ΣΤΟΙΧΕΙΑ ΛΟΓΑΡΙΑΣΜΟΥ
                </h4>
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <span
                      className="material-symbols-outlined text-[color:var(--anbit-muted)] text-lg mt-0.5"
                      data-icon="person_outline"
                    >
                      person_outline
                    </span>
                    <div>
                      <p className="text-[9px] text-[color:var(--anbit-muted)] font-bold uppercase tracking-widest">Όνομα</p>
                      <p className="text-sm font-black text-[color:var(--anbit-text)]">{user.name} Anbit</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span
                      className="material-symbols-outlined text-[color:var(--anbit-muted)] text-lg mt-0.5"
                      data-icon="equalizer"
                    >
                      equalizer
                    </span>
                    <div>
                      <p className="text-[9px] text-[color:var(--anbit-muted)] font-bold uppercase tracking-widest">Επίπεδο</p>
                      <p className="text-sm font-black text-[color:var(--anbit-text)]">{user.currentLevelName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12 hidden">
            <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-[color:var(--anbit-text)]">
              Οι πόντοι σου ανά κατάστημα
            </h2>
            <p className="text-[color:var(--anbit-muted)] text-lg">
              Κάθε συνεργαζόμενο μέρος κρατά ξεχωριστά XP — δες πού «καίει» το score σου.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 hidden">
            <div className="lg:col-span-8">
              <section className="relative overflow-hidden rounded-3xl border-2 border-[color:var(--anbit-yellow)] bg-[color:var(--anbit-card)] p-5 shadow-lg sm:p-6">
                <div
                  className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full bg-[color:var(--anbit-yellow)] opacity-[0.12]"
                  aria-hidden
                />

                {topStores.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm font-medium text-[color:var(--anbit-muted)]">
                    Δεν υπάρχουν ακόμα πόντοι. Εξερεύνησε το δίκτυο.
                  </p>
                ) : (
                  <div className="relative space-y-0 rounded-2xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-input)]/40 p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-8">
                      <button
                        type="button"
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-[color:var(--anbit-card)] border border-[color:var(--anbit-border)] text-[color:var(--anbit-muted)] hover:text-[color:var(--anbit-text)] transition-colors"
                        aria-label="Previous"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(4, Math.max(1, Math.ceil(topStores.length / 3))) }).map((_, i) => {
                          const isActive = i === 0;
                          return (
                            <div
                              key={i}
                              className={`${isActive ? "bg-[color:var(--anbit-text)]" : "bg-[color:var(--anbit-muted)]"} h-1 rounded-full`}
                              style={{ width: isActive ? 32 : 8 }}
                            />
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-[color:var(--anbit-card)] border border-[color:var(--anbit-border)] text-[color:var(--anbit-muted)] hover:text-[color:var(--anbit-text)] transition-colors"
                        aria-label="Next"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {topStores.map(({ partner, xp }, idx) => {
                        const tier = idx === 0 ? "GOLD" : idx === 1 ? "SILVER" : "NEW";
                        const isGold = tier === "GOLD";
                        const isSilver = tier === "SILVER";

                        const pct = Math.round((xp / pointsCapXp) * 100);
                        const safePct = Math.max(0, Math.min(100, pct));
                        const radius = 42;
                        const circumference = 2 * Math.PI * radius;
                        const dashOffset = circumference - (circumference * safePct) / 100;

                        const lastVisitLabels = ["2 μέρες πριν", "5 μέρες πριν", "1 μέρα πριν", "Χθες · 19:12"];
                        const lastVisit = lastVisitLabels[idx % lastVisitLabels.length] ?? "Πρόσφατα";

                        return (
                          <div
                            key={partner.id}
                            className="relative bg-[#0a0a0a]/40 border border-[#2a2a2a]/50 rounded-3xl p-6"
                          >
                            <div className="flex items-center gap-4 mb-8">
                              <div className="w-14 h-14 rounded-full border-2 border-[color:var(--anbit-border)] p-0.5 overflow-hidden">
                                <img
                                  src={partner.image}
                                  alt={partner.name}
                                  className="w-full h-full object-cover rounded-full"
                                  draggable={false}
                                />
                              </div>

                              <div className="min-w-0">
                                <div className="font-bold text-[color:var(--anbit-text)] truncate">{partner.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Star
                                    className="w-[10px] h-[10px]"
                                    fill="currentColor"
                                    aria-hidden
                                    style={{
                                      color: isGold
                                        ? "var(--anbit-yellow)"
                                        : isSilver
                                          ? "rgba(255,255,255,0.75)"
                                          : "rgba(255,255,255,0.55)",
                                    }}
                                  />
                                  <span className="text-[10px] font-bold text-[color:var(--anbit-muted)]">
                                    {partner.rating.toFixed(1)}
                                  </span>
                                  <span
                                    className="text-[10px] font-bold uppercase tracking-widest ml-1"
                                    style={{
                                      color: isGold
                                        ? "var(--anbit-yellow)"
                                        : isSilver
                                          ? "rgba(255,255,255,0.70)"
                                          : "rgba(255,255,255,0.45)",
                                    }}
                                  >
                                    {tier}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-end mb-8">
                              <div>
                                <p className="text-[10px] text-[color:var(--anbit-muted)] font-bold uppercase mb-1">Points</p>
                                <p className="text-4xl font-black text-[color:var(--anbit-text)]">{xp.toLocaleString()}</p>
                                <p className="text-[11px] text-[color:var(--anbit-muted)] mt-1">από {pointsCapXp} XP</p>
                              </div>

                              <div className="relative w-20 h-20">
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                  <circle
                                    className="text-[color:var(--anbit-border)] stroke-current"
                                    cx="50"
                                    cy="50"
                                    fill="transparent"
                                    r={radius}
                                    strokeWidth="6"
                                  />
                                  <circle
                                    className="text-[color:var(--anbit-text)] stroke-current"
                                    cx="50"
                                    cy="50"
                                    fill="transparent"
                                    r={radius}
                                    strokeDasharray={`${circumference}`}
                                    strokeDashoffset={`${dashOffset}`}
                                    strokeLinecap="round"
                                    strokeWidth="6"
                                    transform="rotate(-90 50 50)"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center font-black text-sm">
                                  {safePct}%
                                </div>
                              </div>
                            </div>

                            <div className="h-1 bg-[color:var(--anbit-border)] rounded-full mb-8 overflow-hidden">
                              <div className="h-full bg-[color:var(--anbit-text)]" style={{ width: `${safePct}%` }} />
                            </div>

                            <div className="flex items-center gap-2 text-[color:var(--anbit-muted)] text-[10px] font-bold mb-6">
                              <Clock className="w-4 h-4" aria-hidden />
                              Τελευταία επίσκεψη: {lastVisit}
                            </div>

                            <Link
                              to={`/store-profile/${partner.id}`}
                              state={{ partner }}
                              className="w-full py-3 rounded-2xl border border-[#e63533] bg-[#e63533] text-white flex items-center justify-center gap-2 text-xs font-bold hover:bg-[#cf2f2d] hover:border-[#cf2f2d] transition-all"
                            >
                              Explore Store
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            </div>

            <aside className="lg:col-span-4 space-y-6">
              <section className="rounded-3xl bg-[color:var(--anbit-card)] p-5 shadow-sm border border-[color:var(--anbit-border)]">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--anbit-muted)]">
                    Γρήγορες ενέργειες
                  </h2>
                  <span className="rounded-full bg-[color:var(--anbit-yellow)] px-3 py-1 text-[11px] font-semibold text-[color:var(--anbit-yellow-content)] shadow-sm">
                    Anbit
                  </span>
                </div>
                <div className="mt-4 grid gap-4">
                  <Link
                    to="/quests"
                    className="block rounded-2xl bg-slate-900 p-4 text-white shadow-md transition hover:opacity-95"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-300">Προσφορές</p>
                    <p className="mt-1 text-sm font-semibold">Δες offers & κέρδισε XP</p>
                    <p className="mt-3 flex items-center gap-1 text-xs text-slate-300">
                      <Gift className="h-3.5 w-3.5" /> Quests
                    </p>
                  </Link>
                  <Link
                    to="/network"
                    className="block rounded-2xl bg-[#e63533] p-4 text-white shadow-md transition hover:bg-[#cf2f2d]"
                  >
                    <p className="text-xs uppercase tracking-wide opacity-80">Καταστήματα</p>
                    <p className="mt-1 text-sm font-semibold">Παραγγελίες & δίκτυο</p>
                    <p className="mt-3 text-xs opacity-80">Βρες το επόμενό σου μέρος.</p>
                  </Link>
                </div>
              </section>

              <section className="rounded-3xl bg-[color:var(--anbit-card)] p-5 shadow-sm border border-[color:var(--anbit-border)]">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--anbit-muted)]">
                    Ρυθμίσεις
                  </h2>
                  <Settings className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-1 text-xs text-[color:var(--anbit-muted)]">
                  Διαχείριση λογαριασμού και προτιμήσεων.
                </p>
                <Link
                  to="/settings"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-black"
                >
                  Άνοιγμα ρυθμίσεων
                </Link>
              </section>

              <section className="rounded-3xl bg-[color:var(--anbit-card)] p-5 shadow-sm border border-[color:var(--anbit-border)]">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--anbit-muted)]">
                    Social
                  </h2>
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-1 text-xs text-[color:var(--anbit-muted)]">Ακολούθησε το Anbit στα social.</p>
                <div className="mt-3">
                  <AnimatedSocialLinks socials={profileSocials} />
                </div>
              </section>

              <section className="rounded-3xl bg-[color:var(--anbit-card)] p-5 shadow-sm border border-[color:var(--anbit-border)]">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--anbit-muted)]">
                  Στοιχεία λογαριασμού
                </h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <dt className="mt-0.5">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </dt>
                    <dd className="flex-1 text-[color:var(--anbit-text)]">{user.email}</dd>
                  </div>
                  <div className="flex items-start gap-3">
                    <dt className="mt-0.5">
                      <Zap className="h-4 w-4 text-slate-400" />
                    </dt>
                    <dd className="flex-1">
                      Επίπεδο {user.currentLevel}
                      {user.nextLevelXP ? (
                        <>
                          {' '}
                          · Στόχος: {user.nextLevelXP.toLocaleString()} XP
                        </>
                      ) : null}
                    </dd>
                  </div>
                </dl>
              </section>
            </aside>
          </div>

        </section>
        </>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
