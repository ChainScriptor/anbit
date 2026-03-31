import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Zap,
  Star,
  Mail,
  Coffee,
  UtensilsCrossed,
  ChevronRight,
  Gift,
  Settings,
} from 'lucide-react';
import { UserData, Partner } from '../types';
import { useTheme } from '../context/ThemeContext';
import AnbitWordmark from './AnbitWordmark';
import AnimatedSocialLinks, { type Social } from './ui/social-links';

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

const ProfilePage: React.FC<{ user: UserData; partners?: Partner[] }> = ({ user, partners = [] }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const storeXP = user.storeXP || {};

  const partnersWithPoints = useMemo(
    () =>
      [...partners]
        .map((p) => ({ partner: p, xp: storeXP[p.id] ?? 0 }))
        .sort((a, b) => b.xp - a.xp),
    [partners, storeXP]
  );

  const topStores = partnersWithPoints.slice(0, 8);
  const levelProgress = Math.max(0, Math.min(100, user.levelProgress ?? 0));
  const storesWithXpCount = partnersWithPoints.filter((x) => x.xp > 0).length;

  const recentActivity = partnersWithPoints.slice(0, 4).map((entry, index) => ({
    id: `${entry.partner.id}-${index}`,
    name: entry.partner.name,
    xp: Math.max(10, Math.round((entry.xp || 0) * 0.06)),
    date: ['Σήμερα · 09:45', 'Χθες · 19:12', 'Πριν 2 μέρες · 20:30', 'Πρόσφατα'][index] ?? 'Πρόσφατα',
    icon: index % 2 === 0 ? Coffee : UtensilsCrossed,
  }));

  return (
    <div
      className="min-h-screen font-sans antialiased"
      data-theme={theme}
      style={{
        backgroundColor: 'var(--anbit-bg)',
        color: 'var(--anbit-text)',
      }}
    >
      <header className="bg-[color:var(--anbit-card)] shadow-sm border-b border-[color:var(--anbit-border)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex h-9 items-center rounded-full border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] px-3 text-xs font-medium text-[color:var(--anbit-muted)] shadow-sm hover:bg-[color:var(--anbit-input)]"
          >
            ← Πίσω
          </button>
          <span className="flex flex-wrap items-baseline justify-end gap-2 text-slate-400">
            <AnbitWordmark className="text-sm text-slate-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">Προφίλ</span>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <section>
          <div className="relative overflow-hidden rounded-3xl border border-[color:var(--anbit-yellow)] shadow-lg">
            <div className="flex flex-col gap-4 rounded-[22px] bg-[color:var(--anbit-card)] p-4 sm:flex-row sm:gap-5 sm:p-6">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[color:var(--anbit-input)] shadow-sm sm:h-24 sm:w-24">
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                <div className="absolute -bottom-1 -right-1 rounded-lg bg-[color:var(--anbit-yellow)] px-1.5 py-0.5 text-[10px] font-bold text-[color:var(--anbit-yellow-content)] shadow-sm">
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
                      <Zap className="h-4 w-4 text-[color:var(--anbit-yellow)]" />
                      <span>{user.totalXP.toLocaleString()} XP</span>
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[color:var(--anbit-input)] p-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-[color:var(--anbit-muted)]">
                      Επόμενο επίπεδο ({levelProgress}%)
                    </p>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[color:var(--anbit-border)]">
                      <div
                        className="h-full rounded-full bg-[color:var(--anbit-yellow)]"
                        style={{ width: `${levelProgress}%` }}
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[color:var(--anbit-input)] p-3 shadow-sm sm:col-span-2 lg:col-span-1">
                    <p className="text-[11px] uppercase tracking-wide text-[color:var(--anbit-muted)]">
                      Καταστήματα με XP
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold">
                      <Star className="h-4 w-4 text-[color:var(--anbit-yellow)]" />
                      <span>{storesWithXpCount} ενεργά</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-3xl border-2 border-[color:var(--anbit-yellow)] bg-[color:var(--anbit-card)] p-5 shadow-lg sm:p-6">
              <div className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full bg-[color:var(--anbit-yellow)] opacity-[0.12]" aria-hidden />
              <div className="relative mb-5 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--anbit-yellow)] bg-[color:var(--anbit-yellow)]/15 px-3 py-1">
                    <Zap className="h-4 w-4 text-[color:var(--anbit-yellow)]" aria-hidden />
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--anbit-text)]">
                      Καταστήματα &amp; XP
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-bold tracking-tight text-[color:var(--anbit-text)] sm:text-xl">
                    Οι πόντοι σου ανά κατάστημα
                  </h2>
                  <p className="mt-1 max-w-xl text-sm font-medium text-[color:var(--anbit-muted)]">
                    Κάθε συνεργαζόμενο μέρος κρατά ξεχωριστά XP — δες πού «καίει» το score σου.
                  </p>
                </div>
                <Link
                  to="/network"
                  className="shrink-0 rounded-full border border-[color:var(--anbit-border)] bg-[color:var(--anbit-input)] px-3 py-1.5 text-xs font-bold text-[color:var(--anbit-text)] shadow-sm transition hover:border-[color:var(--anbit-yellow)]"
                >
                  Όλα τα καταστήματα →
                </Link>
              </div>
              <div className="relative space-y-0 rounded-2xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-input)]/40">
                {topStores.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm font-medium text-[color:var(--anbit-muted)]">
                    Δεν υπάρχουν ακόμα πόντοι. Εξερεύνησε το δίκτυο.
                  </p>
                ) : (
                  topStores.map(({ partner, xp }, index) => (
                    <Link
                      key={partner.id}
                      to={`/store-profile/${partner.id}`}
                      state={{ partner }}
                      className="flex items-center gap-3 border-b border-[color:var(--anbit-border)] px-3 py-3.5 last:border-b-0 hover:bg-[color:var(--anbit-card)]/80 sm:gap-4 sm:px-4 sm:py-4"
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#0a0a0a] p-0.5 ring-2 ring-[color:var(--anbit-border)]">
                        <img
                          src={partner.image}
                          alt={partner.name}
                          className="h-full w-full rounded-[14px] object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold leading-snug text-[color:var(--anbit-text)]">{partner.name}</p>
                          <span className="shrink-0 rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-200/90">
                            {index === 0 ? 'Gold' : index === 1 ? 'Silver' : 'New'}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs font-medium text-[color:var(--anbit-muted)] sm:text-sm">Συνεργαζόμενο κατάστημα</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="flex min-w-[5.5rem] flex-col items-end rounded-2xl border-2 border-[color:var(--anbit-yellow)] bg-slate-950 px-2.5 py-2 text-right shadow-md sm:min-w-[6.5rem] sm:px-3 sm:py-2.5">
                          <span className="flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--anbit-yellow)]">
                            <Zap className="h-3 w-3" aria-hidden />
                            XP
                          </span>
                          <span className="text-base font-extrabold tabular-nums text-white sm:text-lg">
                            {xp.toLocaleString()}
                          </span>
                        </div>
                        <ChevronRight className="hidden h-5 w-5 text-[color:var(--anbit-muted)] sm:block" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-3xl bg-[color:var(--anbit-card)] p-5 shadow-sm border border-[color:var(--anbit-border)]">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--anbit-muted)]">
                Πρόσφατη δραστηριότητα
              </h2>
              <ul className="mt-3 space-y-3 text-sm">
                {recentActivity.length === 0 ? (
                  <li className="rounded-2xl bg-[color:var(--anbit-input)] p-4 text-center text-xs text-[color:var(--anbit-muted)]">
                    Καμία πρόσφατη δραστηριότητα.
                  </li>
                ) : (
                  recentActivity.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li
                        key={item.id}
                        className="flex items-center gap-4 rounded-2xl bg-[color:var(--anbit-input)] p-3 shadow-sm"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                          <Icon className="h-5 w-5" strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[color:var(--anbit-text)]">{item.name}</p>
                          <p className="text-xs text-[color:var(--anbit-muted)]">{item.date}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-bold text-[color:var(--anbit-text)]">+{item.xp} XP</p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#e63533]">Verified</p>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </section>
          </div>

          <aside className="space-y-6">
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
                  className="block rounded-2xl bg-[color:var(--anbit-yellow)] p-4 text-[color:var(--anbit-yellow-content)] shadow-md transition hover:opacity-95"
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
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;
