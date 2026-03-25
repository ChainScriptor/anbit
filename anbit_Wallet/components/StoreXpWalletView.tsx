import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Wallet,
  User,
  UtensilsCrossed,
  MapPin,
  MessageSquare,
  Flame,
  ShoppingBag,
  Star,
  Lock,
  Award,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { Partner, UserData } from '../types';
import AnbitWordmark from './AnbitWordmark';
import { api } from '../services/api';

const BRAND_RED = '#ffffff';
const GOLD = BRAND_RED;
const TIER_GOLD = BRAND_RED;

function tierLabel(level: number, t: (k: string) => string): string {
  if (level >= 15) return t('xpWalletTierGold');
  if (level >= 8) return t('xpWalletTierSilver');
  return t('xpWalletTierBronze');
}

interface StoreXpWalletViewProps {
  partner: Partner;
  user: UserData | null;
  onBackToMenu: () => void;
  onOpenProfile: () => void;
  onOpenLogin?: () => void;
}

const StoreXpWalletView: React.FC<StoreXpWalletViewProps> = ({
  partner,
  user,
  onBackToMenu,
  onOpenProfile,
  onOpenLogin,
}) => {
  const { t } = useLanguage();
  const [xpRows, setXpRows] = useState<
    { id: string; title: string; subtitle: string; xp: number; variant: 'food' | 'visit' | 'review' }[]
  >([]);

  useEffect(() => {
    if (!user) {
      setXpRows([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const items = await api.getUserXP({ limit: 8 });
        if (cancelled) return;
        if (items.length > 0) {
          setXpRows(
            items.map((it, i) => ({
              id: it.id,
              title: it.merchantId === partner.id ? partner.name : t('xpWalletActivityOrder'),
              subtitle: partner.name,
              xp: it.xp,
              variant: (['food', 'visit', 'review'] as const)[i % 3],
            }))
          );
          return;
        }
      } catch {
        /* fallback demo */
      }
      if (cancelled) return;
      setXpRows([
        {
          id: 'demo-1',
          title: t('xpWalletDemoBurger'),
          subtitle: partner.name,
          xp: 50,
          variant: 'food',
        },
        {
          id: 'demo-2',
          title: t('xpWalletDemoVisit'),
          subtitle: t('xpWalletDemoCheckIn'),
          xp: 150,
          variant: 'visit',
        },
        {
          id: 'demo-3',
          title: t('xpWalletDemoFeedback'),
          subtitle: t('xpWalletDemoReview'),
          xp: 25,
          variant: 'review',
        },
      ]);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, partner.id, partner.name, t]);

  const displayXp = user ? Math.max(0, user.totalXP) : 0;
  const level = user?.currentLevel ?? 1;
  const levelName = user?.currentLevelName ?? t('xpWalletLevelDefault');
  const rawProgress = user?.levelProgress ?? 0;
  const progressPct = Math.min(
    100,
    Math.max(0, Math.round((rawProgress <= 1 ? rawProgress : rawProgress / 100) * 100))
  );
  const toGo = user?.nextLevelXP ?? 100;

  const iconWrap = (variant: 'food' | 'visit' | 'review') => {
    const base = 'flex h-12 w-12 shrink-0 items-center justify-center rounded-full';
    if (variant === 'food')
      return (
        <div className={base} style={{ backgroundColor: `${BRAND_RED}18` }}>
          <UtensilsCrossed className="h-5 w-5" style={{ color: BRAND_RED }} strokeWidth={2} />
        </div>
      );
    if (variant === 'visit')
      return (
        <div className={`${base}`} style={{ backgroundColor: `${BRAND_RED}22` }}>
          <MapPin className="h-5 w-5" style={{ color: BRAND_RED }} strokeWidth={2} />
        </div>
      );
    return (
      <div className={`${base} bg-white/15`}>
        <MessageSquare className="h-5 w-5 text-white" strokeWidth={2} />
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-[#ffffff] text-[#0a0a0a] antialiased"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-[#0a0a0a]/95 px-5 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToMenu}
            className="text-white/85 transition-opacity hover:opacity-70 active:scale-95"
            aria-label={t('back')}
          >
            <ArrowLeft className="h-6 w-6" strokeWidth={2.2} />
          </button>
          <AnbitWordmark as="span" className="text-xl text-white sm:text-2xl" />
        </div>
        <div className="flex items-center gap-3">
          <Wallet className="h-6 w-6 opacity-90" strokeWidth={2} aria-hidden />
          <button
            type="button"
            onClick={onOpenProfile}
            className="transition-opacity hover:opacity-70 active:scale-95"
            aria-label={t('profile')}
          >
            <User className="h-6 w-6" strokeWidth={2} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-10 px-6 pb-[calc(8.35rem+env(safe-area-inset-bottom))] pt-8">
        <section className="rounded-2xl bg-[#0a0a0a] p-6 flex flex-col items-center space-y-2 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">
            {t('xpWalletCurrentBalance')}
          </span>
          {user ? (
            <div className="relative inline-flex items-end justify-center gap-1">
              <span
                className="text-7xl font-black italic leading-none tracking-tighter sm:text-8xl"
                style={{
                  color: GOLD,
                  textShadow: '0 0 24px rgba(255, 255, 255, 0.35)',
                  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                }}
              >
                {displayXp.toLocaleString()}
              </span>
              <span
                className="mb-2 text-2xl font-bold italic sm:text-3xl"
                style={{ color: GOLD, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}
              >
                XP
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenLogin?.()}
              disabled={!onOpenLogin}
              className="mt-2 rounded-2xl border border-[#0a0a0a]/15 bg-[#0a0a0a] px-8 py-4 text-lg font-bold text-white transition-opacity disabled:opacity-50"
            >
              {t('storeHeaderLogin')}
            </button>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2
                className="text-2xl font-bold italic text-white"
                style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}
              >
                {t('xpWalletLevel', { n: level })}
              </h2>
              <p className="text-sm text-white/50">{levelName}</p>
            </div>
            <div className="text-right">
              <span className="font-bold" style={{ color: TIER_GOLD }}>
                {tierLabel(level, t)}
              </span>
              <p className="text-xs text-white/45">
                {toGo.toLocaleString()} {t('xpWalletToGo')}
              </p>
            </div>
          </div>
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-white/10 shadow-inner">
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                style={{
                width: `${progressPct}%`,
                backgroundColor: TIER_GOLD,
                  boxShadow: '0 0 12px rgba(255, 255, 255, 0.45)',
              }}
            >
              <div className="h-1/2 w-full rounded-full bg-white/25" />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3
              className="text-lg font-bold italic text-white"
              style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}
            >
              {t('xpWalletHistory')}
            </h3>
            <button type="button" className="text-xs font-bold uppercase tracking-widest text-white/40">
              {t('xpWalletViewAll')}
            </button>
          </div>
          <div className="space-y-3">
            {xpRows.length === 0 && user && (
              <p className="py-6 text-center text-sm text-white/45">{t('xpWalletNoActivity')}</p>
            )}
            {xpRows.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0a0a0a] p-4 transition-colors hover:bg-white/[0.06]"
              >
                <div className="flex min-w-0 items-center gap-4">
                  {iconWrap(row.variant)}
                  <div className="min-w-0">
                    <p className="font-bold text-white">{row.title}</p>
                    <p className="text-xs text-white/45">{row.subtitle}</p>
                  </div>
                </div>
                <span
                  className="shrink-0 text-lg font-black italic tracking-tight"
                  style={{ color: TIER_GOLD, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}
                >
                  +{row.xp} XP
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3
            className="text-lg font-bold italic text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}
          >
            {t('xpWalletBadges')}
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="relative flex aspect-square flex-col items-center justify-center rounded-xl border border-white/10 bg-[#0a0a0a] p-4 text-center transition-transform hover:scale-[1.02]">
              <div
                className="mb-3 flex h-16 w-16 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${TIER_GOLD}22` }}
              >
                <Flame className="h-8 w-8" style={{ color: TIER_GOLD }} strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight text-white">
                {t('xpBadgeBurger')}
              </span>
            </div>
            <div className="relative flex aspect-square flex-col items-center justify-center rounded-xl border border-white/10 bg-[#0a0a0a] p-4 text-center transition-transform hover:scale-[1.02]">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
                <ShoppingBag className="h-8 w-8 text-white" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight text-white">
                {t('xpBadgeFirstOrder')}
              </span>
            </div>
            <div className="relative flex aspect-square flex-col items-center justify-center rounded-xl border border-white/10 bg-[#0a0a0a] p-4 text-center opacity-45 grayscale">
              <Lock className="absolute right-2 top-2 h-4 w-4 text-white/50" strokeWidth={2} />
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <Star className="h-8 w-8 text-white/40" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight text-white/50">
                {t('xpBadgeEarly')}
              </span>
            </div>
            <div className="relative flex aspect-square flex-col items-center justify-center rounded-xl border border-white/10 bg-[#0a0a0a] p-4 text-center opacity-45 grayscale">
              <Lock className="absolute right-2 top-2 h-4 w-4 text-white/50" strokeWidth={2} />
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <Award className="h-8 w-8 text-white/40" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight text-white/50">
                {t('xpBadgeVip')}
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StoreXpWalletView;
