import React, { useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { offerCarouselNavButtonClass } from '../ui/offer-carousel';
import type { Partner, UserData } from '../../types';

const SPENDING_MONTH_BARS = [
  { label: 'JAN', pct: 45, highlight: false },
  { label: 'FEB', pct: 65, highlight: false },
  { label: 'MAR', pct: 40, highlight: false },
  { label: 'APR', pct: 85, highlight: false },
  { label: 'MAY', pct: 55, highlight: false },
  { label: 'JUN', pct: 75, highlight: true },
] as const;

const RING_R = 40;
const RING_C = 2 * Math.PI * RING_R;

type Props = {
  user: UserData;
  partnersWithPoints: Array<{ partner: Partner; xp: number }>;
};

export function ProfileInsightsSection({ user, partnersWithPoints }: Props) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const levelProgress = Math.max(0, Math.min(100, user.levelProgress ?? 0));
  const xpToNext =
    user.nextLevelXP > 0 ? Math.max(0, user.nextLevelXP - user.totalXP) : 0;
  const nextLevel = user.currentLevel + 1;

  const scrollCarousel = useCallback((dir: 'left' | 'right') => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
  }, []);

  return (
    <div
      className="w-full text-[#e5e5e5] selection:bg-anbit-brand/30"
      style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
    >
      <header className="mb-8 flex w-full flex-col items-start justify-between gap-6 px-1 py-6 sm:px-2 md:flex-row md:items-end md:py-10">
        <div>
          <h1 className="mb-2 text-4xl font-extrabold uppercase italic tracking-tighter text-[#e5e5e5] md:text-6xl">
            Insights
          </h1>
          <p className="text-lg font-medium text-[#ababab]">Detailed analysis of your Anbit activity.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold uppercase tracking-widest text-anbit-brand">Current Balance</span>
            <span className="text-2xl font-bold tracking-tight text-white">$ 12,450.00</span>
          </div>
          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/5 bg-[#1f1f1f] transition-all hover:bg-[#2c2c2c]"
            aria-label="Ημερολόγιο"
          >
            <span className="material-symbols-outlined text-white">calendar_today</span>
          </button>
        </div>
      </header>

      <div className="space-y-12 px-1 pb-24 sm:px-2">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <section className="relative flex min-h-[400px] flex-col justify-between overflow-hidden rounded-lg border border-white/5 bg-[#121214] p-6 sm:p-8 md:col-span-8">
            <div className="z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h2 className="mb-1 text-xl font-bold text-white">Monthly Spending</h2>
                <p className="text-sm text-[#ababab]">Expense trends over last 6 months</p>
              </div>
              <div className="text-left sm:text-right">
                <span className="block text-3xl font-extrabold tracking-tighter text-white">$3,240</span>
                <p className="text-xs font-bold text-anbit-brand">+12% from last month</p>
              </div>
            </div>

            <div className="z-10 mt-10 flex h-48 w-full items-end justify-between gap-2 md:mt-12 md:gap-4">
              {SPENDING_MONTH_BARS.map((m) => (
                <div key={m.label} className="group flex flex-1 flex-col items-center">
                  <div
                    className={`relative flex h-full w-full flex-col justify-end overflow-hidden rounded-t-lg ${
                      m.highlight ? 'bg-anbit-brand' : 'bg-[#191919]'
                    }`}
                  >
                    <div
                      className={`w-full transition-all duration-1000 ${
                        m.highlight
                          ? 'bg-anbit-brand/80'
                          : 'bg-anbit-brand/20 group-hover:bg-anbit-brand/40'
                      }`}
                      style={{ height: `${m.pct}%` }}
                    />
                  </div>
                  <span
                    className={`mt-4 text-xs font-bold ${m.highlight ? 'text-white' : 'text-[#ababab]'}`}
                  >
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="relative flex flex-col justify-between overflow-hidden rounded-lg border border-white/5 bg-[#242424] p-6 sm:p-8 md:col-span-4">
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-anbit-brand/10 blur-3xl" />
            <div className="relative z-10">
              <div className="mb-8 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-anbit-brand">Reward Status</span>
                <span
                  className="material-symbols-outlined text-anbit-brand"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  military_tech
                </span>
              </div>
              <div className="mb-10">
                <h3 className="mb-2 text-sm font-semibold text-[#ababab]">Total XP Earned</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tight text-white">
                    {user.totalXP.toLocaleString()}
                  </span>
                  <span className="text-lg font-bold text-anbit-brand">XP</span>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex justify-between text-xs font-bold">
                    <span className="text-white">LEVEL {user.currentLevel}</span>
                    <span className="text-[#ababab]">
                      {xpToNext > 0
                        ? `${xpToNext.toLocaleString()} XP TO LEVEL ${nextLevel}`
                        : 'Max level'}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#262626]">
                    <div className="h-full bg-anbit-brand" style={{ width: `${levelProgress}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="relative z-10 mt-10 flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-anbit-brand">
                <span className="material-symbols-outlined text-xl text-white">trending_up</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#ababab]">Top 5% this month</p>
                <p className="text-sm font-bold text-white">You&apos;re outperforming others</p>
              </div>
            </div>
          </section>
        </div>

        <section className="mb-4">
          <div className="mb-8">
            <h2 className="mb-2 text-4xl font-extrabold tracking-tight text-white">
              Οι πόντοι σου ανά κατάστημα
            </h2>
            <p className="text-lg font-medium text-[#ababab]">
              Κάθε συνεργαζόμενο μέρος κρατά ξεχωριστά XP — δες πού &quot;καίει&quot; το score σου.
            </p>
          </div>

          <div className="group relative flex w-full items-center">
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              className={cn(offerCarouselNavButtonClass, 'left-0')}
              aria-label="Προηγούμενα καταστήματα"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div
              ref={carouselRef}
              className="flex w-full gap-6 overflow-x-auto pb-6 pl-10 pr-10 [scrollbar-width:thin] [scrollbar-color:var(--anbit-brand)_#131313] sm:pl-12 sm:pr-12 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#131313] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-anbit-brand"
            >
              {partnersWithPoints.length === 0 ? (
                <p className="w-full py-12 text-center text-sm font-medium text-[#ababab]">
                  Δεν υπάρχουν ακόμα πόντοι. Εξερεύνησε το δίκτυο.
                </p>
              ) : (
                partnersWithPoints.map(({ partner, xp }, idx) => {
                  const tier = idx === 1 ? 'SILVER' : 'GOLD';
                  const capXp = idx === 1 ? 150 : 200;
                  const points = Math.round(xp);
                  const safePct = Math.max(0, Math.min(100, Math.round((points / capXp) * 100)));
                  const dashOffset = RING_C - (RING_C * safePct) / 100;
                  const lastVisit =
                    idx === 0 ? '2 μέρες πριν' : idx === 1 ? '5 μέρες πριν' : '1 μέρα πριν';
                  const isSilver = tier === 'SILVER';
                  const faded = idx > 0;

                  return (
                    <div
                      key={partner.id}
                      className={cn(
                        'group/card relative min-w-[320px] snap-center overflow-hidden rounded-2xl border border-white/5 bg-[#242424] p-6 transition-opacity',
                        faded && 'opacity-80 hover:opacity-100',
                      )}
                    >
                      <div className="mb-8 flex items-start gap-4">
                        <div
                          className={`h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 ${
                            idx === 0 ? 'border-anbit-brand/20' : 'border-white/10'
                          }`}
                        >
                          <img
                            src={partner.image}
                            alt=""
                            className="h-full w-full object-cover"
                            draggable={false}
                          />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">{partner.name}</h4>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`material-symbols-outlined text-[14px] ${isSilver ? 'text-zinc-400' : 'text-yellow-500'}`}
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              star
                            </span>
                            <span className="text-xs font-bold text-[#ababab]">
                              {partner.rating.toFixed(1)}{' '}
                              <span className="ml-1 text-white">{tier}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-8 flex items-center justify-between">
                        <div>
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#ababab]">
                            POINTS
                          </p>
                          <p className="text-4xl font-black text-white">{points}</p>
                          <p className="text-xs font-medium text-[#ababab]">από {capXp} XP</p>
                        </div>
                        <div className="relative flex h-20 w-20 items-center justify-center">
                          <svg className="h-full w-full" viewBox="0 0 100 100" aria-hidden>
                            <circle
                              className="stroke-current text-white/5"
                              cx="50"
                              cy="50"
                              fill="transparent"
                              r={RING_R}
                              strokeWidth="8"
                            />
                            <circle
                              className={`stroke-current ${isSilver ? 'text-white' : 'text-anbit-brand'}`}
                              cx="50"
                              cy="50"
                              fill="transparent"
                              r={RING_R}
                              strokeWidth="8"
                              strokeLinecap="round"
                              strokeDasharray={RING_C}
                              strokeDashoffset={dashOffset}
                              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                            />
                          </svg>
                          <span className="absolute text-sm font-bold text-white">{safePct}%</span>
                        </div>
                      </div>

                      <div className="mb-6 h-px w-full bg-white/5" />
                      <div className="mb-6 flex items-center gap-2 text-xs text-[#ababab]">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span>Τελευταία επίσκεψη: {lastVisit}</span>
                      </div>
                      <Link
                        to={`/store-profile/${partner.id}`}
                        state={{ partner }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-anbit-brand py-3 text-xs font-extrabold uppercase tracking-widest text-anbit-brand-foreground transition-all group-hover/card:bg-anbit-brand-hover"
                      >
                        Explore Store
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                      </Link>
                    </div>
                  );
                })
              )}
            </div>

            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              className={cn(offerCarouselNavButtonClass, 'right-0')}
              aria-label="Επόμενα καταστήματα"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </section>

        <section className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {(
            [
              { label: 'Average Order', value: '$ 84.20' },
              { label: 'Saved with Anbit', value: '$ 124.50' },
              { label: 'Store Visits', value: '12' },
              { label: 'Active Coupons', value: '4' },
            ] as const
          ).map((stat) => (
            <div
              key={stat.label}
              className="group rounded-lg border border-white/5 bg-[#242424] p-5 transition-colors hover:border-anbit-brand/30 md:p-6"
            >
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#ababab]">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
