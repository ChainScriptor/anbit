import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  ChevronRight,
  CreditCard,
  Fingerprint,
  Headphones,
  HelpCircle,
  History,
  LogIn,
  LogOut,
  Menu,
  Mail,
  Milestone,
  Search,
  Settings,
  Lock,
  ShoppingBasket,
  ShoppingBag,
  Store as StoreIcon,
  Sun,
  Moon,
  Star,
  User,
  Wallet,
  EyeOff,
  X,
} from 'lucide-react';
import { Partner, Product, type UserData } from '../types';
import type { CartItemData, ProductCartOptions } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ProductDetailModal from './ProductDetailModal';
import ProductCustomizeModal from './ProductCustomizeModal';
import AnbitWordmark from './AnbitWordmark';
import { ANBIT_DISPLAY_FONT } from './AnbitWordmark';
import CartCheckoutModal, { type PaymentMethod } from './CartCheckoutModal';
import OrderSentScreen from './OrderSentScreen';
import OrderAcceptedScreen, { type OrderReceiptLine } from './OrderAcceptedScreen';
import OrderDeliveredScreen from './OrderDeliveredScreen';
import StoreXpWalletView from './StoreXpWalletView';

const STORE_SOFT_BG = '#F8F9FA';

/** Κάτω tab + κύμα (h-6) + labels· ύψος στο οποίο «κάθεται» η περιοχή πριν κενό + μπάρα καλαθιού */
const STORE_BOTTOM_NAV_VISUAL_HEIGHT = '8.35rem';
/** Κενό ανάμεσα στο κάτω άκρο της μπάρας καλαθιού και στην κορυφή του κύματος / tab */
const STORE_CART_TO_WAVE_GAP = '14px';
const MERCHANT_BANNERS_STORAGE_KEY = 'anbit_merchant_banners_v1';

type MerchantBanner = {
  id: string;
  merchantId: string;
  title: string;
  imageUrl: string;
  createdAt: string;
};

function readMerchantBanners(merchantId: string): MerchantBanner[] {
  if (typeof window === 'undefined' || !merchantId) return [];
  try {
    const raw = localStorage.getItem(MERCHANT_BANNERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MerchantBanner[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((row) => String(row?.merchantId ?? '').toLowerCase() === merchantId.toLowerCase())
      .filter((row) => typeof row?.imageUrl === 'string' && row.imageUrl.length > 0)
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  } catch {
    return [];
  }
}

function StoreWaveStrokeDivider() {
  return (
    <div className="mb-6 h-3 w-full overflow-hidden text-[#0a0a0a]/[0.12]" aria-hidden>
      <svg viewBox="0 0 1200 14" preserveAspectRatio="none" className="h-full w-full">
        <path
          d="M0,7 C240,2 480,12 720,5 C960,-2 1080,10 1200,6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export type StoreNavTab = 'menu' | 'xp' | 'profile';

/** Κάτω tab + κύμα — ίδιο με /store για order accepted & κύρια σελίδα καταστήματος */
function StoreBottomNav({
  activeTab,
  onMenuPress,
  onXpPress,
  onProfilePress,
}: {
  activeTab: StoreNavTab;
  onMenuPress?: () => void;
  onXpPress?: () => void;
  onProfilePress?: () => void;
}) {
  const goXp = onXpPress ?? onMenuPress;
  const goProfile = onProfilePress ?? onMenuPress;
  return (
    <nav
      className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-white/10 bg-[#0a0a0a] px-4 pb-8 pt-5 backdrop-blur-lg"
      style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
    >
      <div className="pointer-events-none absolute inset-x-0 -top-6 h-6 overflow-hidden" aria-hidden>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-full w-full">
          <path
            d="M0,64 C120,24 240,24 360,64 C480,104 600,104 720,64 C840,24 960,24 1080,64 C1140,84 1170,94 1200,104 L1200,120 L0,120 Z"
            fill="#0a0a0a"
          />
          <path
            d="M0,68 C120,28 240,28 360,68 C480,108 600,108 720,68 C840,28 960,28 1080,68 C1140,88 1170,98 1200,108"
            fill="none"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="2"
          />
        </svg>
      </div>
      <button
        type="button"
        onClick={() => {
          if (onMenuPress) onMenuPress();
          else window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex flex-col items-center justify-center gap-1.5 px-3 py-1 transition-all active:scale-95 ${
          activeTab === 'menu' ? 'text-white' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <span className="text-2xl leading-none sm:text-[1.65rem]" aria-hidden>
          ✕
        </span>
        <span className="text-base font-anbit font-normal not-italic normal-case tracking-tight leading-none [font-synthesis:none] sm:text-lg">
          menu
        </span>
      </button>
      <button
        type="button"
        onClick={() => goXp?.()}
        className={`flex flex-col items-center justify-center gap-1.5 px-3 py-1 transition-all active:scale-95 ${
          activeTab === 'xp' ? 'scale-110 text-white' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Star
          className={`h-7 w-7 sm:h-8 sm:w-8 ${activeTab === 'xp' ? 'fill-anbit-brand text-anbit-brand' : 'fill-none text-zinc-400'}`}
          strokeWidth={2}
        />
        <span className="text-base font-anbit font-normal not-italic normal-case tracking-tight leading-none [font-synthesis:none] sm:text-lg">
          xp wallet
        </span>
      </button>
      <button
        type="button"
        onClick={() => goProfile?.()}
        className={`flex flex-col items-center justify-center gap-1.5 px-3 py-1 transition-all active:scale-95 ${
          activeTab === 'profile' ? 'text-white' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <User className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2} />
        <span className="text-base font-anbit font-normal not-italic normal-case tracking-tight leading-none [font-synthesis:none] sm:text-lg">
          profile
        </span>
      </button>
    </nav>
  );
}

function StoreProfilePanel({
  user,
  onBackToMenu,
  onOpenXp,
  onOpenLogin,
  logout,
}: {
  user: UserData | null;
  onBackToMenu: () => void;
  onOpenXp: () => void;
  onOpenLogin?: () => void;
  logout: () => void;
}) {
  const { t } = useLanguage();
  const memberLabel = user?.currentLevel && user.currentLevel >= 15 ? t('xpWalletTierGold') : user ? t('xpWalletTierSilver') : '';
  const [profileView, setProfileView] = useState<'home' | 'help' | 'settings' | 'orders' | 'badges'>('home');
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);
  const [orderHistoryError, setOrderHistoryError] = useState<string | null>(null);
  const [orderHistoryItems, setOrderHistoryItems] = useState<
    {
      id: string;
      totalPrice: number;
      totalXp: number;
      status: number | string;
      createdAt: string;
      items: { productId: string; quantity: number }[];
    }[]
  >([]);

  useEffect(() => {
    if (!user || profileView !== 'orders') return;
    let isActive = true;

    const loadOrderHistory = async () => {
      setOrderHistoryLoading(true);
      setOrderHistoryError(null);
      try {
        const data = await api.getOrders({ limit: 150, offset: 0 });
        if (!isActive) return;
        const filtered = (Array.isArray(data) ? data : [])
          .filter((order) => String(order.userId).toLowerCase() === String(user.id).toLowerCase())
          .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
          .slice(0, 30)
          .map((order) => ({
            id: order.id,
            totalPrice: Number(order.totalPrice ?? 0),
            totalXp: Number(order.totalXp ?? 0),
            status: order.status,
            createdAt: order.createdAt,
            items: Array.isArray(order.items)
              ? order.items.map((item) => ({
                  productId: String(item?.productId ?? ''),
                  quantity: Number(item?.quantity ?? 0),
                }))
              : [],
          }));
        setOrderHistoryItems(filtered);
      } catch {
        if (isActive) {
          setOrderHistoryError('Δεν ήταν δυνατή η φόρτωση από το server. Εμφάνιση demo history.');
        }
      } finally {
        if (isActive) setOrderHistoryLoading(false);
      }
    };

    loadOrderHistory();
    return () => {
      isActive = false;
    };
  }, [profileView, t, user]);

  const formatOrderStatus = (status: number | string) => {
    const normalized = String(status ?? '').toLowerCase();
    if (normalized === '2' || normalized.includes('accepted') || normalized.includes('completed')) {
      return { label: 'COMPLETED', className: 'border-white/20 bg-white/10 text-white' };
    }
    if (normalized === '3' || normalized.includes('rejected') || normalized.includes('cancel')) {
      return { label: 'CANCELLED', className: 'border-white/15 bg-[#0a0a0a] text-white/70' };
    }
    return { label: 'PENDING', className: 'border-white/20 bg-white/10 text-white/85' };
  };

  const formatOrderDate = (isoDate: string) => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('el-GR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fallbackHistoryItems = [
    { id: 'AB-9021', totalPrice: 34, totalXp: 200, status: 'completed', createdAt: '2023-10-24T20:45:00.000Z', items: [{ productId: 'demo-1', quantity: 2 }] },
    { id: 'AB-8842', totalPrice: 18.5, totalXp: 0, status: 'cancelled', createdAt: '2023-10-18T14:20:00.000Z', items: [{ productId: 'demo-2', quantity: 1 }] },
    { id: 'AB-8710', totalPrice: 52, totalXp: 350, status: 'completed', createdAt: '2023-10-12T19:15:00.000Z', items: [{ productId: 'demo-3', quantity: 3 }] },
  ];
  const visibleOrderHistory = orderHistoryItems.length > 0 ? orderHistoryItems : fallbackHistoryItems;

  if (profileView === 'badges') {
    return (
      <div className="min-h-screen bg-[#ffffff] text-[#0a0a0a]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <header className="sticky top-0 z-50 w-full bg-[#0a0a0a] shadow-[0_12px_28px_-12px_rgba(0,0,0,0.38)]">
          <div className="flex h-16 items-center justify-between px-6">
            <button
              type="button"
              onClick={() => setProfileView('home')}
              className="text-white/90 transition-opacity hover:opacity-75 active:scale-95"
              aria-label={t('back')}
            >
              <ArrowLeft className="h-6 w-6" strokeWidth={2.2} />
            </button>
            <h1 className="text-base font-extrabold tracking-tight text-white sm:text-lg">Badges &amp; Achievements</h1>
            <button
              type="button"
              onClick={onOpenXp}
              className="text-white/90 transition-opacity hover:opacity-75 active:scale-95"
              aria-label={t('navXpRewards')}
            >
              <Wallet className="h-5 w-5" strokeWidth={2.1} />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-2xl space-y-8 px-6 pb-[calc(8.35rem+env(safe-area-inset-bottom))] pt-6">
          <section className="rounded-3xl border border-[#0a0a0a]/10 bg-[#0a0a0a] p-5 text-white">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/65">Current Status</p>
                <h2 className="mt-1 text-3xl font-extrabold tracking-tight">Level 12</h2>
              </div>
              <p className="text-sm font-bold text-white/90">2,450 / 3,000 XP</p>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-[81%] rounded-full bg-white" />
            </div>
            <p className="mt-4 text-xs text-white/70">550 XP more to reach Vanguard Tier</p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-extrabold tracking-tight text-[#0a0a0a]">Active Badges</h3>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#0a0a0a]/55">Recent wins</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { title: 'Early Adopter', icon: <BadgeCheck className="h-7 w-7 text-white" strokeWidth={2.1} /> },
                { title: '7-Day Streak', icon: <Milestone className="h-7 w-7 text-white" strokeWidth={2.1} /> },
                { title: 'Elite Member', icon: <Star className="h-7 w-7 fill-white text-white" strokeWidth={2} /> },
              ].map((badge) => (
                <article key={badge.title} className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-4 text-center text-white">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10">
                    {badge.icon}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider">{badge.title}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-2xl font-extrabold tracking-tight text-[#0a0a0a]">Dining Milestones</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Burger Master', subtitle: 'First 5 burger orders', emoji: '🍔' },
                { title: 'Pizza Lover', subtitle: 'Explored 3 pizzerias', emoji: '🍕' },
              ].map((milestone) => (
                <article key={milestone.title} className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-5 text-center text-white">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-4xl">
                    {milestone.emoji}
                  </div>
                  <h4 className="text-sm font-bold">{milestone.title}</h4>
                  <p className="mt-1 text-[10px] text-white/65">{milestone.subtitle}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-2xl font-extrabold tracking-tight text-[#0a0a0a]">Loyalty Peaks</h3>
            <div className="space-y-3">
              <article className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#0a0a0a] p-4 text-white">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                  <Milestone className="h-6 w-6" strokeWidth={2.1} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold">Weekly Regular</h4>
                  <p className="text-xs text-white/65">Ordered every day for a week</p>
                </div>
                <BadgeCheck className="h-5 w-5 text-white" strokeWidth={2.3} />
              </article>

              <article className="flex items-center gap-4 rounded-3xl border border-[#0a0a0a]/10 bg-[#0a0a0a]/70 p-4 text-white/65">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                  <Lock className="h-6 w-6" strokeWidth={2.1} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold">Anbit Veteran</h4>
                  <p className="text-xs text-white/60">Unlock after 1 year of membership</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/65">Locked</span>
              </article>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-extrabold tracking-tight text-[#0a0a0a]">Social Achievements</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0a0a0a]/55">New challenges</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { title: 'Friend Referral', icon: <User className="h-5 w-5" strokeWidth={2.1} />, muted: true },
                { title: 'Reviewer', icon: <CreditCard className="h-5 w-5" strokeWidth={2.1} />, muted: false },
                { title: 'Socialite', icon: <Star className="h-5 w-5" strokeWidth={2.1} />, muted: true },
              ].map((item) => (
                <article
                  key={item.title}
                  className={`rounded-2xl border p-3 text-center ${item.muted ? 'border-[#0a0a0a]/10 bg-[#0a0a0a]/65 text-white/55' : 'border-white/10 bg-[#0a0a0a] text-white'}`}
                >
                  <div className={`mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full ${item.muted ? 'border border-dashed border-white/30' : 'bg-white/10'}`}>
                    {item.icon}
                  </div>
                  <p className="text-[9px] font-bold">{item.title}</p>
                </article>
              ))}
            </div>
          </section>

          <p className="pb-2 text-center text-xs text-[#0a0a0a]/55">
            Keep ordering to earn more XP and unlock exclusive digital collectibles.
          </p>
        </main>
      </div>
    );
  }

  if (profileView === 'orders') {
    return (
      <div className="min-h-screen bg-[#ffffff] text-[#0a0a0a]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <header className="sticky top-0 z-50 w-full bg-[#0a0a0a] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setProfileView('home')}
                className="text-white/95 active:scale-95 transition-transform"
                aria-label={t('back')}
              >
                <ArrowLeft className="h-6 w-6" strokeWidth={2.2} />
              </button>
              <h1 className="text-xl font-bold tracking-tight text-white">{t('xpWalletOrderHistory')}</h1>
            </div>
            <div className="h-8 w-8 rounded-full bg-white/10" />
          </div>
        </header>

        <main className="mx-auto max-w-2xl space-y-6 px-6 pb-[calc(8.35rem+env(safe-area-inset-bottom))] pt-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#0a0a0a]/45">MY ACCOUNT</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0a0a0a]">{t('xpWalletOrderHistory')}</h2>
            <div className="mt-3 h-1 w-12 rounded-full bg-[#0a0a0a]" />
          </div>

          {orderHistoryLoading ? (
            <div className="rounded-2xl border border-[#0a0a0a]/12 bg-[#0a0a0a]/[0.03] p-5 text-sm text-[#0a0a0a]/70">
              Loading orders...
            </div>
          ) : null}

          {orderHistoryError ? (
            <div className="rounded-2xl border border-[#0a0a0a]/15 bg-[#0a0a0a]/[0.03] p-5 text-sm text-[#0a0a0a]/70">
              {orderHistoryError}
            </div>
          ) : null}

          {!orderHistoryLoading && !orderHistoryError && orderHistoryItems.length === 0 ? (
            <div className="rounded-2xl border border-[#0a0a0a]/15 bg-[#0a0a0a]/[0.03] p-5 text-sm text-[#0a0a0a]/70">
              Δεν βρέθηκαν παραγγελίες για αυτό το προφίλ. Προβολή demo history.
            </div>
          ) : null}

          <section className="space-y-4">
            {visibleOrderHistory.map((order) => {
              const statusMeta = formatOrderStatus(order.status);
              return (
                <article key={order.id} className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-5 text-white">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                        #{String(order.id).slice(0, 8).toUpperCase()}
                      </p>
                      <p className="mt-1 text-sm text-white/70">{formatOrderDate(order.createdAt)}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusMeta.className}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>

                  <div className="mb-5 rounded-2xl bg-white/5 px-4 py-3">
                    <p className="text-sm text-white/85">
                      {order.items.length > 0
                        ? `${order.items.reduce((acc, item) => acc + item.quantity, 0)} items in this order`
                        : 'Order details unavailable'}
                    </p>
                  </div>

                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-3xl font-black leading-none text-white">€{order.totalPrice.toFixed(2)}</p>
                      <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-white/65">
                        {order.totalXp > 0 ? `+${order.totalXp} XP EARNED` : 'NO XP AWARDED'}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
                    >
                      Details
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        </main>
      </div>
    );
  }

  if (profileView === 'help') {
    return (
      <div className="min-h-screen bg-[#ffffff] text-[#0a0a0a]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <header className="sticky top-0 z-50 w-full bg-[#0a0a0a] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between px-6 h-16">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setProfileView('home')}
                className="text-white/95 active:scale-95 transition-transform"
                aria-label={t('back')}
              >
                <ArrowLeft className="h-6 w-6" strokeWidth={2.2} />
              </button>
              <h1 className="text-xl font-bold tracking-tight text-white">Support</h1>
            </div>
            {user ? (
              <div className="w-10 h-10 overflow-hidden rounded-full bg-[#0a0a0a] border border-white/10">
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#0a0a0a] border border-white/10" />
            )}
          </div>
        </header>

        <main className="pt-8 pb-[calc(8.35rem+env(safe-area-inset-bottom))] px-6 max-w-2xl mx-auto space-y-8">
          <section className="mt-8 mb-2">
            <h2 className="text-4xl font-extrabold tracking-tight text-[#0a0a0a] leading-tight">
              How can we <span className="text-anbit-brand">help?</span>
            </h2>

            <div className="relative mt-6">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[#0a0a0a]/35" strokeWidth={2} />
              </div>
              <input
                type="text"
                placeholder="Search for FAQs..."
                className="w-full h-14 pl-12 pr-4 bg-[#0a0a0a]/[0.04] border border-[#0a0a0a]/10 rounded-2xl text-[#0a0a0a] focus:ring-2 focus:ring-anbit-brand/30 outline-none placeholder:text-[#0a0a0a]/40"
              />
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-[#0a0a0a]/[0.03] border border-[#0a0a0a]/10 hover:bg-[#0a0a0a]/[0.06] transition-colors">
              <div className="w-12 h-12 rounded-full bg-anbit-brand/10 flex items-center justify-center mb-4">
                <ShoppingBasket className="h-6 w-6 text-anbit-brand" strokeWidth={2} />
              </div>
              <h3 className="text-base font-bold text-[#0a0a0a] mb-1">Ordering</h3>
              <p className="text-xs text-[#0a0a0a]/50 font-medium">Tracking, issues &amp; more</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0a0a0a]/[0.03] border border-[#0a0a0a]/10 hover:bg-[#0a0a0a]/[0.06] transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#0a0a0a]/[0.08] flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-[#0a0a0a]" strokeWidth={2} />
              </div>
              <h3 className="text-base font-bold text-[#0a0a0a] mb-1">Payment</h3>
              <p className="text-xs text-[#0a0a0a]/50 font-medium">Refunds &amp; methods</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0a0a0a]/[0.03] border border-[#0a0a0a]/10 hover:bg-[#0a0a0a]/[0.06] transition-colors relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#feb63c]/20 text-[#805600] text-[10px] font-bold uppercase tracking-wider">
                XP Gold
              </div>
              <div className="w-12 h-12 rounded-full bg-[#feb63c]/20 flex items-center justify-center mb-4">
                <Milestone className="h-6 w-6 text-[#805600]" strokeWidth={2} />
              </div>
              <h3 className="text-base font-bold text-[#0a0a0a] mb-1">XP Loyalty</h3>
              <p className="text-xs text-[#0a0a0a]/50 font-medium">Rewards &amp; Tier status</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0a0a0a]/[0.03] border border-[#0a0a0a]/10 hover:bg-[#0a0a0a]/[0.06] transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#0a0a0a]/[0.08] flex items-center justify-center mb-4">
                <StoreIcon className="h-6 w-6 text-[#0a0a0a]" strokeWidth={2} />
              </div>
              <h3 className="text-base font-bold text-[#0a0a0a] mb-1">Merchant</h3>
              <p className="text-xs text-[#0a0a0a]/50 font-medium">Business tools</p>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-bold text-[#0a0a0a]">Trending Questions</h4>
            <div className="space-y-2">
              {[
                'How do I track my delivery?',
                'My payment failed but I was charged',
                'How to redeem XP Gold points?',
                'Partnering as a Merchant',
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  className="w-full p-5 rounded-2xl bg-[#0a0a0a]/[0.03] flex items-center justify-between text-left hover:bg-[#0a0a0a]/[0.06] transition-colors border border-transparent active:border-[#0a0a0a]/10"
                >
                  <span className="text-sm font-medium text-[#0a0a0a]">{q}</span>
                  <ChevronRight className="h-5 w-5 text-[#0a0a0a]/40" strokeWidth={2} />
                </button>
              ))}
            </div>
          </section>

          <button
            type="button"
            className="w-full h-14 bg-anbit-brand text-anbit-brand-foreground font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)] active:scale-95 transition-all"
          >
            <Headphones className="h-5 w-5" strokeWidth={2.4} />
            Contact Support
          </button>
        </main>
      </div>
    );
  }

  if (profileView === 'settings') {
    const Toggle: React.FC<{ checked: boolean }> = ({ checked }) => (
      <div
        className={`relative flex h-6 w-11 items-center rounded-full p-1 transition-colors ${
          checked ? 'bg-anbit-brand' : 'bg-white/15 border border-white/10'
        }`}
      >
        <div
          className={`h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
    );

    return (
      <div
        className="min-h-screen bg-[#ffffff] text-[#0a0a0a] antialiased"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-[#0a0a0a] px-5 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setProfileView('home')}
              className="text-white/85 transition-opacity hover:opacity-70 active:scale-95"
              aria-label={t('back')}
            >
              <ArrowLeft className="h-6 w-6" strokeWidth={2.2} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-white">{t('settings')}</h1>
          </div>
          <div className="h-10 w-10" />
        </header>

        <main className="mx-auto max-w-md space-y-8 px-6 pb-[calc(8.35rem+env(safe-area-inset-bottom))] pt-10">
          <section className="rounded-2xl bg-[#0a0a0a] p-5 text-white">
            <div className="flex items-center gap-5">
              <div className="relative h-20 w-20 shrink-0">
                <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-white/10">
                  {user ? (
                    <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-anbit-brand border border-[#0a0a0a]">
                  <BadgeCheck className="h-4 w-4 text-white" strokeWidth={2.4} />
                </div>
              </div>

              <div className="min-w-0">
                <h2 className="text-2xl font-extrabold tracking-tight text-white truncate">
                  {user?.name ?? ''}
                </h2>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-anbit-brand/15 border border-anbit-brand/25 px-4 py-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-anbit-brand">
                    {memberLabel}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <div>
              <h3 className="px-2 mb-3 text-[#0a0a0a]/55 text-[11px] font-black uppercase tracking-[0.2em]">
                Account
              </h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-4 bg-[#0a0a0a] rounded-2xl border border-white/10 active:opacity-95 transition-colors">
                  <div className="flex items-center gap-4">
                    <User className="h-5 w-5 text-anbit-brand" strokeWidth={2.2} />
                    <span className="font-medium text-white">Personal Information</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-white/35" strokeWidth={2.2} />
                </button>
              </div>
            </div>

            <div>
              <h3 className="px-2 mb-3 text-[#0a0a0a]/55 text-[11px] font-black uppercase tracking-[0.2em]">
                Notifications
              </h3>
              <div className="bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/10">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <Bell className="h-5 w-5 text-anbit-brand" strokeWidth={2.2} />
                    <span className="font-medium text-white">Push Notifications</span>
                  </div>
                  <Toggle checked />
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-anbit-brand" strokeWidth={2.2} />
                    <span className="font-medium text-white">Email Updates</span>
                  </div>
                  <Toggle checked={false} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="px-2 mb-3 text-[#0a0a0a]/55 text-[11px] font-black uppercase tracking-[0.2em]">
                Security &amp; Privacy
              </h3>
              <div className="bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/10">
                <button className="w-full flex items-center justify-between p-4 border-b border-white/10 active:bg-[#0a0a0a] transition-colors">
                  <div className="flex items-center gap-4">
                    <Lock className="h-5 w-5 text-anbit-brand" strokeWidth={2.2} />
                    <span className="font-medium text-white">Password &amp; 2FA</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-white/35" strokeWidth={2.2} />
                </button>
                <button className="w-full flex items-center justify-between p-4 border-b border-white/10 active:bg-[#0a0a0a] transition-colors">
                  <div className="flex items-center gap-4">
                    <Fingerprint className="h-5 w-5 text-anbit-brand" strokeWidth={2.2} />
                    <span className="font-medium text-white">Biometric Login</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-white/35" strokeWidth={2.2} />
                </button>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <EyeOff className="h-5 w-5 text-anbit-brand" strokeWidth={2.2} />
                    <span className="font-medium text-white">Private Profile</span>
                  </div>
                  <Toggle checked={false} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="px-2 mb-3 text-[#0a0a0a]/55 text-[11px] font-black uppercase tracking-[0.2em]">
                Support
              </h3>
              <button
                type="button"
                className="w-full flex items-center justify-between p-4 bg-[#0a0a0a] rounded-2xl border border-white/10 active:opacity-95 transition-colors"
                onClick={() => setProfileView('help')}
              >
                <div className="flex items-center gap-4">
                  <HelpCircle className="h-5 w-5 text-anbit-brand" strokeWidth={2.2} />
                  <span className="font-medium text-white">Help &amp; Support Center</span>
                </div>
                <ChevronRight className="h-5 w-5 text-white/35" strokeWidth={2.2} />
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                logout();
                onBackToMenu();
              }}
              className="w-full py-4 bg-anbit-brand rounded-2xl text-anbit-brand-foreground font-bold tracking-tight active:scale-95 transition-all shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)]"
            >
              <div className="flex items-center justify-center gap-2">
                <LogOut className="h-5 w-5" strokeWidth={2.4} />
                <span>Logout</span>
              </div>
            </button>
            <p className="text-center mt-6 text-[#0a0a0a]/55 text-[10px] uppercase font-bold tracking-widest">
              Anbit PWA
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#ffffff] text-[#0a0a0a] antialiased"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <header className="sticky top-0 z-40 grid h-16 grid-cols-3 items-center border-b border-white/10 bg-[#0a0a0a] px-5 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] sm:px-6">
        <div className="flex items-center justify-self-start">
          <button
            type="button"
            onClick={onOpenXp}
            className="text-white/85 transition-opacity hover:opacity-70 active:scale-95"
            aria-label={t('navXpRewards')}
          >
            <Wallet className="h-6 w-6" strokeWidth={2} />
          </button>
        </div>
        <div className="flex justify-center justify-self-center">
          <AnbitWordmark as="span" className="text-2xl text-white" />
        </div>
        <div className="flex items-center justify-end justify-self-end">
          <button
            type="button"
            onClick={onBackToMenu}
            className="text-white/85 transition-opacity hover:opacity-70 active:scale-95"
            aria-label={t('back')}
          >
            <ArrowLeft className="h-6 w-6" strokeWidth={2.2} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-8 px-6 pb-[calc(8.35rem+env(safe-area-inset-bottom))] pt-10">
        {user ? (
          <>
            <section className="flex flex-col items-center py-2 text-center">
              <div className="relative mb-4">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-anbit-brand/40 to-[#0a0a0a]/30 blur-lg opacity-60" />
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-[#0a0a0a]/10 bg-[#0a0a0a]/5">
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                </div>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#0a0a0a]">{user.name}</h1>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#0a0a0a]/10 bg-[#0a0a0a]/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#0a0a0a]/80">
                <BadgeCheck className="h-4 w-4" strokeWidth={2.6} />
                <span>{memberLabel}</span>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-4">
              {[
                { key: 'settings', title: t('settings'), icon: <Settings className="h-5 w-5 text-white" strokeWidth={2} /> },
                { key: 'badges', title: t('xpWalletBadges'), subtitle: 'XP • Achievements', icon: <CreditCard className="h-5 w-5 text-white" strokeWidth={2} /> },
                { key: 'orders', title: t('xpWalletOrderHistory'), icon: <History className="h-5 w-5 text-white" strokeWidth={2} /> },
                { key: 'help', title: t('xpWalletHelp'), icon: <HelpCircle className="h-5 w-5 text-white" strokeWidth={2} /> },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    if (item.key === 'help') setProfileView('help');
                    if (item.key === 'settings') setProfileView('settings');
                    if (item.key === 'orders') setProfileView('orders');
                    if (item.key === 'badges') setProfileView('badges');
                  }}
                  className="group flex flex-col items-start rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 text-left transition-all hover:opacity-95 active:scale-95"
                >
                  <div className="mb-4 rounded-xl bg-white/10 p-2 transition-colors group-hover:bg-white/15">
                    {item.icon}
                  </div>
                  <span className="text-base font-bold text-white">{item.title}</span>
                  {'subtitle' in item && item.subtitle ? (
                    <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-white/45">
                      {item.subtitle}
                    </span>
                  ) : null}
                </button>
              ))}
            </section>

            <button
              type="button"
              onClick={() => {
                logout();
                onBackToMenu();
              }}
              className="w-full rounded-2xl border border-[#0a0a0a]/15 bg-[#0a0a0a] py-4 text-center text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              {t('logout')}
            </button>
          </>
        ) : (
          <div className="space-y-6 text-center">
            <p className="text-[#0a0a0a]/60">{t('storeProfileGuestHint')}</p>
            <button
              type="button"
              onClick={() => onOpenLogin?.()}
              disabled={!onOpenLogin}
              className="w-full rounded-2xl border border-[#0a0a0a]/15 bg-[#0a0a0a] py-4 text-sm font-bold text-white disabled:opacity-50"
            >
              {t('storeHeaderLogin')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function StoreWaveDarkToSoft() {
  return (
    <div className="-mx-4 mb-6 h-9 overflow-hidden sm:mx-0" aria-hidden>
      <svg viewBox="0 0 1200 72" preserveAspectRatio="none" className="h-full w-full text-[#0a0a0a]/10">
        <path
          d="M0,36 C200,10 400,58 600,32 C800,6 1000,52 1200,26 L1200,72 L0,72 Z"
          fill={STORE_SOFT_BG}
        />
        <path
          d="M0,34 C200,8 400,56 600,30 C800,4 1000,50 1200,24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        />
      </svg>
    </div>
  );
}

interface StoreMenuPageProps {
  partner: Partner;
  onBack: () => void;
  onOrderComplete?: (xpEarned: number) => void;
  isAuthenticated?: boolean;
  onOpenLogin?: (onSuccess?: () => void) => void;
  onOpenRegister?: (onSuccess?: () => void) => void;
}

const StoreMenuPage: React.FC<StoreMenuPageProps> = ({
  partner,
  onBack,
  onOrderComplete,
  isAuthenticated = false,
  onOpenLogin,
  onOpenRegister,
}) => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { session } = useOrder();
  const [cart, setCart] = useState<CartItemData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToCustomize, setProductToCustomize] = useState<Product | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [orderAccepted, setOrderAccepted] = useState(false);
  const [orderDelivered, setOrderDelivered] = useState(false);
  const [orderRejected, setOrderRejected] = useState(false);
  const [orderPin, setOrderPin] = useState('');
  const [orderXpEarned, setOrderXpEarned] = useState(0);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderReceiptLines, setOrderReceiptLines] = useState<OrderReceiptLine[] | null>(null);
  const [acceptedOrderTotalEur, setAcceptedOrderTotalEur] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('anbit_store_theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
  });
  const [storeTab, setStoreTab] = useState<StoreNavTab>('menu');
  const [storeBalanceXp, setStoreBalanceXp] = useState<number | null>(null);

  const menu = useMemo(() => partner.menu || [], [partner]);
  const categories = useMemo(() => {
    const fromMenu = new Set(menu.map((p) => p.category).filter(Boolean));
    const rest = Array.from(fromMenu).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    return ['All', ...rest];
  }, [menu]);

  const filteredByCategory = useMemo(() => {
    return activeCategory === 'All' ? menu : menu.filter((p) => p.category === activeCategory);
  }, [menu, activeCategory]);

  const filteredMenu = useMemo(() => {
    if (!searchQuery.trim()) return filteredByCategory;
    const q = searchQuery.trim().toLowerCase();
    return filteredByCategory.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [filteredByCategory, searchQuery]);

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const xpTotal = cart.reduce((acc, item) => acc + item.xpReward * item.quantity, 0);

  const openCustomize = (product: Product) => {
    setProductToCustomize(product);
  };

  const addToCartWithOptions = (
    product: Product,
    quantity: number,
    options: ProductCartOptions | undefined,
    comments: string | undefined
  ) => {
    setCart((prev) => [
      ...prev,
      { ...product, quantity, options, comments },
    ]);
    setProductToCustomize(null);
  };

  const openCheckout = () => {
    if (cart.length === 0) return;
    setShowCheckoutModal(true);
  };

  const handleConfirmOrder = useCallback(async (_paymentMethod: PaymentMethod, earnXp: boolean) => {
    if (!user) {
      setCheckoutError('Παρακαλώ συνδεθείτε για να στείλετε παραγγελία.');
      return;
    }
    const orderItems = cart
      .map((item) => ({ productId: String(item.id ?? '').trim(), quantity: item.quantity }))
      .filter((item) => item.productId && item.quantity > 0);
    if (orderItems.length !== cart.length) {
      setCheckoutError('Κάποια προϊόντα δεν έχουν έγκυρο id. Κάνε refresh το μενού και ξαναπροσπάθησε.');
      return;
    }
    setCheckoutError(null);
    setOrderSubmitting(true);
    try {
      await api.submitOrder({
        userId: user.id,
        merchantId: partner.id,
        tableNumber: session?.tableNumber ?? 1,
        orderItems,
      });
      setOrderReceiptLines(
        cart.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
        }))
      );
      setAcceptedOrderTotalEur(null);

      // Workaround: POST /Orders doesn't return an orderId.
      // Fetch the latest matching order for this user+merchant (and table if available).
      const latestOrderFirstTry = await api.getLatestOrder({
        userId: user.id,
        merchantId: session?.merchantId ?? partner.id,
        tableNumber: session?.tableNumber,
      });

      let latestOrder = latestOrderFirstTry;
      if (!latestOrder) {
        await new Promise((r) => setTimeout(r, 1000));
        latestOrder = await api.getLatestOrder({
          userId: user.id,
          merchantId: session?.merchantId ?? partner.id,
          tableNumber: session?.tableNumber,
        });
      }

      if (!latestOrder) {
        setCheckoutError('Δεν βρέθηκε η τελευταία παραγγελία. Δοκίμασε ξανά.');
        return;
      }

      setOrderPin(String(100000 + Math.floor(Math.random() * 900000)));
      setPendingOrderId(latestOrder.id);
      setCart([]);
      setShowCheckoutModal(false);
      setOrderSent(true);
    } catch (e) {
      console.error('Order submit failed', e);
      setCheckoutError('Αποτυχία αποστολής παραγγελίας. Δοκιμάστε ξανά.');
    } finally {
      setOrderSubmitting(false);
    }
  }, [user, partner.id, session?.tableNumber, cart]);

  useEffect(() => {
    if (!pendingOrderId || !orderSent) return;
    const poll = async () => {
      try {
        // Backend doesn't implement `GET /api/v1/Orders/{orderId}`.
        // Workaround: fetch the latest order from `GET /api/v1/Orders` and use its status.
        const latestOrder = await api.getLatestOrder({
          userId: user?.id ?? '',
          merchantId: session?.merchantId ?? partner.id,
          tableNumber: session?.tableNumber,
        });

        if (!latestOrder) return;
        if (pendingOrderId && latestOrder.id !== pendingOrderId) {
          // If backend order ordering is slightly different, follow the latest matching order.
          setPendingOrderId(latestOrder.id);
        }

        const order = latestOrder;
        const status = order.status;
        const statusNum =
          typeof status === 'string'
            ? status === 'Accepted'
              ? 2
              : status === 'Rejected'
                ? 3
                : status === 'Completed' || status === 'Ready' || status === 'ready'
                  ? 4
                  : 1
            : status;

        if (statusNum === 2) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;

          setOrderDelivered(false);
          setOrderAccepted(true);
          setOrderRejected(false);

          setOrderXpEarned(order.totalXp ?? 0);
          const tp = order.totalPrice;
          setAcceptedOrderTotalEur(typeof tp === 'number' && !Number.isNaN(tp) ? tp : null);
        } else if (statusNum === 4) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;

          setOrderAccepted(false);
          setOrderDelivered(true);
          setOrderRejected(false);
          setOrderSent(false);

          setOrderXpEarned(order.totalXp ?? 0);
          const tp = order.totalPrice;
          setAcceptedOrderTotalEur(typeof tp === 'number' && !Number.isNaN(tp) ? tp : null);

          onOrderComplete?.(order.totalXp ?? 0);
        } else if (statusNum === 3) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setOrderReceiptLines(null);
          setAcceptedOrderTotalEur(null);
          setOrderRejected(true);
        }
      } catch {
        // ignore, retry on next poll
      }
    };
    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pendingOrderId, orderSent, onOrderComplete, user?.id, partner.id, session?.merchantId, session?.tableNumber]);

  const handleOrderAccepted = useCallback(() => {
    setOrderSent(false);
    setOrderAccepted(true);
  }, []);

  /** Dev: σταματάει το poll και ανοίγει την οθόνη αποδοχής χωρίς merchant accept. */
  const skipWaitingToAccepted = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setOrderSent(false);
    setOrderAccepted(true);
  }, []);

  /** Κλείσιμο οθόνης accept· επιστροφή στον κατάλογο του καταστήματος (χωρίς έξοδο από /store). */
  const returnToStoreCatalog = useCallback(() => {
    setOrderAccepted(false);
    setOrderDelivered(false);
    setOrderRejected(false);
    setOrderSent(false);
    setOrderPin('');
    setOrderXpEarned(0);
    setPendingOrderId(null);
    setOrderReceiptLines(null);
    setAcceptedOrderTotalEur(null);
    setStoreTab('menu');
  }, []);

  const handleBottomNavMenu = useCallback(() => {
    if (storeTab !== 'menu') setStoreTab('menu');
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [storeTab]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('anbit_store_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const loadStoreBalanceXp = useCallback(async () => {
    if (!user?.id) {
      setStoreBalanceXp(null);
      return;
    }
    try {
      const pageSize = 100;
      let offset = 0;
      let totalForStore = 0;

      while (true) {
        const page = await api.getUserXP({ limit: pageSize, offset });
        for (const item of page) {
          if (String(item.merchantId).toLowerCase() === String(partner.id).toLowerCase()) {
            totalForStore += Number(item.xp ?? 0);
          }
        }
        if (page.length < pageSize) break;
        offset += pageSize;
      }

      setStoreBalanceXp(Math.max(0, totalForStore));
    } catch {
      setStoreBalanceXp(user.storeXP?.[partner.id] ?? null);
    }
  }, [user?.id, user?.storeXP, partner.id]);

  useEffect(() => {
    void loadStoreBalanceXp();
    if (!user?.id) return;
    const id = setInterval(() => {
      void loadStoreBalanceXp();
    }, 10000);
    return () => clearInterval(id);
  }, [loadStoreBalanceXp, user?.id]);

  const topStoreXp = Math.max(0, storeBalanceXp ?? user?.storeXP?.[partner.id] ?? user?.totalXP ?? 0);

  const categoryLabel = (id: string) => (id === 'All' ? t('all') : id);
  const sectionTitle = activeCategory === 'All' ? partner.name : activeCategory;
  const featuredProduct = menu[0];
  const categoryPreview = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) {
      const match = menu.find((p) => (c === 'All' ? true : p.category === c));
      map.set(c, match?.image || partner.image);
    }
    return map;
  }, [categories, menu, partner.image]);
  const merchantBanners = useMemo(() => readMerchantBanners(partner.id), [partner.id]);

  if (orderDelivered) {
    return (
      <div className="min-h-screen bg-[#ffffff]">
        <OrderDeliveredScreen
          pin={orderPin}
          tableNumber={session?.tableNumber ?? 1}
          xpEarned={orderXpEarned}
          partnerName={partner.name}
          orderId={pendingOrderId}
          orderLines={orderReceiptLines}
          orderTotalEur={acceptedOrderTotalEur}
          onBack={() => {
            setOrderDelivered(false);
            setOrderAccepted(false);
            setOrderRejected(false);
            setOrderSent(false);
            setOrderPin('');
            setOrderXpEarned(0);
            setPendingOrderId(null);
            setOrderReceiptLines(null);
            setAcceptedOrderTotalEur(null);
            onBack();
          }}
        />
        <StoreBottomNav activeTab="menu" onMenuPress={returnToStoreCatalog} />
      </div>
    );
  }

  if (orderAccepted) {
    return (
      <div className="min-h-screen bg-[#ffffff]">
        <OrderAcceptedScreen
          pin={orderPin}
          tableNumber={session?.tableNumber ?? 1}
          xpEarned={orderXpEarned}
          partnerName={partner.name}
          orderId={pendingOrderId}
          orderLines={orderReceiptLines}
          orderTotalEur={acceptedOrderTotalEur}
          onBack={() => {
            setOrderAccepted(false);
            setOrderPin('');
            setOrderXpEarned(0);
            setPendingOrderId(null);
            setOrderReceiptLines(null);
            setAcceptedOrderTotalEur(null);
            onBack();
          }}
        />
        <StoreBottomNav activeTab="menu" onMenuPress={returnToStoreCatalog} />
      </div>
    );
  }

  if (orderRejected) {
    return (
      <div
        className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center px-6 text-center"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <X className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-black mb-2">Η παραγγελία σας απορρίφθηκε</h1>
        <p className="text-black/70 text-sm mb-8 max-w-[280px]">Το κατάστημα δεν μπόρεσε να εξυπηρετήσει την παραγγελία σας.</p>
        <button
          type="button"
          onClick={() => {
            setOrderRejected(false);
            setOrderSent(false);
            setPendingOrderId(null);
            onBack();
          }}
          className="px-6 py-3 rounded-xl font-semibold text-sm bg-black text-white"
        >
          Επιστροφή
        </button>
      </div>
    );
  }

  if (orderSent) {
    return (
      <OrderSentScreen
        orderId={pendingOrderId}
        onAccepted={handleOrderAccepted}
        disableAutoAccept
        onDevSkipToAccepted={import.meta.env.DEV ? skipWaitingToAccepted : undefined}
      />
    );
  }

  return (
    <div className={storeTab === 'menu' ? 'store-wolt min-h-screen' : 'min-h-screen bg-[#ffffff]'}>
      {storeTab === 'menu' && (
        <>
      <header
        className="fixed top-0 left-0 right-0 z-50 grid min-h-[4.75rem] grid-cols-3 items-center border-b border-white/10 bg-[#0a0a0a] px-2 backdrop-blur-xl sm:min-h-[5.25rem] sm:px-4"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center justify-self-start pl-1">
          {user ? (
            <button
              type="button"
              onClick={() => {
                logout();
                onBack();
              }}
              className="text-white active:scale-95 transition-transform"
              aria-label={t('logout')}
            >
              <LogOut className="h-5 w-5" strokeWidth={2.4} />
            </button>
          ) : (
            <button type="button" onClick={onBack} className="text-white active:scale-95 transition-transform" aria-label={t('back')}>
              <Menu className="h-5 w-5" strokeWidth={2.4} />
            </button>
          )}
        </div>

        <div className="flex min-w-0 flex-col items-center justify-center justify-self-center text-center">
          {user ? (
            <div
              className="flex max-w-full items-center justify-center gap-1.5 sm:gap-2"
              aria-label={t('totalXp')}
            >
              <Star
                className="h-6 w-6 shrink-0 fill-anbit-brand text-anbit-brand drop-shadow-[0_0_10px_rgba(0,0,0,0.35)] sm:h-7 sm:w-7"
                strokeWidth={2}
              />
              <span
                className={`anbit-wordmark truncate ${ANBIT_DISPLAY_FONT} text-[1.35rem] leading-none text-anbit-brand sm:text-[1.65rem] sm:tracking-tight md:text-[1.85rem] [text-shadow:0_0_20px_rgba(0,0,0,0.2),0_1px_0_rgba(0,0,0,0.15)]`}
              >
                {topStoreXp.toLocaleString()} XP
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenLogin?.()}
              disabled={!onOpenLogin}
              className="flex max-w-full items-center justify-center gap-1.5 rounded-lg px-1 py-0.5 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2"
              aria-label={t('storeHeaderLogin')}
            >
              <LogIn
                className="h-6 w-6 shrink-0 text-anbit-brand drop-shadow-[0_0_10px_rgba(0,0,0,0.35)] sm:h-7 sm:w-7"
                strokeWidth={2.25}
              />
              <span
                className={`anbit-wordmark ${ANBIT_DISPLAY_FONT} text-[1.35rem] leading-none text-anbit-brand sm:text-[1.65rem] sm:tracking-tight md:text-[1.85rem] [text-shadow:0_0_20px_rgba(0,0,0,0.2),0_1px_0_rgba(0,0,0,0.15)]`}
              >
                {t('storeHeaderLogin')}
              </span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-end justify-self-end gap-2 pr-1 sm:gap-3">
          <button type="button" onClick={() => setIsDarkMode((v) => !v)} className="text-white active:scale-95 transition-transform">
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button type="button" onClick={openCheckout} className="text-white active:scale-95 transition-transform">
            <ShoppingBag className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>
      </header>

      <main
        className={`px-4 pt-[calc(4.75rem+env(safe-area-inset-top))] max-w-5xl mx-auto sm:pt-[calc(5.25rem+env(safe-area-inset-top))] ${cart.length > 0 ? 'pb-[15rem]' : 'pb-40'}`}
      >
        <section className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" strokeWidth={2} />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Αναζήτηση & Φιλτράρισμα"
              className="w-full bg-white border border-black/10 rounded-premium-sm py-3 pl-10 pr-4 text-[#1b1c1c] placeholder-zinc-500 focus:ring-1 focus:ring-[#0a0a0a] focus:border-[#0a0a0a] transition-all text-sm"
              aria-label={t('searchProduct')}
            />
          </div>
        </section>

        <StoreWaveStrokeDivider />

        <section className="mb-0 rounded-2xl bg-[#0a0a0a] p-6 relative overflow-hidden">
          <div className="relative z-10">
            {merchantBanners.length > 0 ? (
              <>
                <h4 className="mb-3 text-lg tracking-tight text-white uppercase">Store Banners</h4>
                <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
                  {merchantBanners.map((banner) => (
                    <article key={banner.id} className="relative h-32 min-w-[240px] overflow-hidden rounded-xl border border-white/15">
                      <img src={banner.imageUrl} alt={banner.title || 'store banner'} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                      {banner.title ? (
                        <p className="absolute bottom-2 left-2 right-2 truncate text-xs font-semibold text-white">
                          {banner.title}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h4 className="text-xl tracking-tighter mb-1 text-white uppercase">XP Multiplier Active!</h4>
                <p className="text-white/90 text-sm mb-4 leading-snug max-w-[70%]">Κερδίστε x2 XP σε κάθε παραγγελία για τις επόμενες 2 ώρες.</p>
                <button type="button" className="primary-button bg-white text-black text-[10px] px-4 py-2 rounded-premium-sm uppercase tracking-widest shadow-sm hover:bg-zinc-100 transition-colors">
                  Περισσότερα
                </button>
              </>
            )}
          </div>
          <span className="absolute -right-4 -bottom-4 text-[90px] text-white/10 rotate-12">✦</span>
        </section>

        <StoreWaveDarkToSoft />

        <section className="mb-8 overflow-hidden">
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className="flex-none group cursor-pointer"
                >
                  <div
                    className={`relative w-24 h-24 rounded-xl overflow-hidden mb-2 border transition-all ${isActive ? 'border-[#0a0a0a]' : 'border-zinc-800'} `}
                  >
                    <img
                      src={categoryPreview.get(cat) || partner.image}
                      alt={categoryLabel(cat)}
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <span
                    className={`category-label text-center text-[13px] uppercase transition-colors ${
                      isActive ? 'text-[#0a0a0a]' : 'text-zinc-500 group-hover:text-[#0a0a0a]'
                    }`}
                  >
                    {categoryLabel(cat)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <StoreWaveStrokeDivider />

        <section className="grid grid-cols-2 gap-x-4 gap-y-8 mb-4">
          {filteredMenu.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => openCustomize(product)}
              onViewDetail={() => setSelectedProduct(product)}
            />
          ))}
        </section>

        {filteredMenu.length === 0 && <p className="text-sm py-10 text-center text-zinc-500">Δεν βρέθηκαν προϊόντα στην κατηγορία {sectionTitle}.</p>}

      </main>

      {cart.length > 0 && (
        <div
          className="fixed left-4 right-4 z-[60] rounded-premium bg-[#0a0a0a] text-white shadow-2xl border border-white/10 px-4 py-3 flex items-center justify-between gap-3"
          style={{
            bottom: `calc(${STORE_BOTTOM_NAV_VISUAL_HEIGHT} + ${STORE_CART_TO_WAVE_GAP} + env(safe-area-inset-bottom))`,
          }}
        >
          <div className="min-w-0">
            <p className="text-sm">
              {cart.reduce((s, i) => s + i.quantity, 0)} προϊόντα · €{cartTotal.toFixed(2)}
            </p>
            <p className="text-[11px] text-white/80">
              {xpTotal > 0 ? `+${xpTotal} XP` : t('placeOrder')}
            </p>
          </div>
          <button
            onClick={openCheckout}
            className="primary-button shrink-0 px-4 py-2 rounded-premium-sm bg-black/30 hover:bg-black/45 text-sm transition-colors"
          >
            Checkout
          </button>
        </div>
      )}
        </>
      )}

      {storeTab === 'xp' && (
        <StoreXpWalletView
          partner={partner}
          user={user}
          onBackToMenu={() => setStoreTab('menu')}
          onOpenProfile={() => setStoreTab('profile')}
          onOpenLogin={onOpenLogin}
          onStoreBalanceChange={setStoreBalanceXp}
        />
      )}

      {storeTab === 'profile' && (
        <StoreProfilePanel
          user={user}
          onBackToMenu={() => setStoreTab('menu')}
          onOpenXp={() => setStoreTab('xp')}
          onOpenLogin={onOpenLogin}
          logout={logout}
        />
      )}

      <StoreBottomNav
        activeTab={storeTab}
        onMenuPress={handleBottomNavMenu}
        onXpPress={() => setStoreTab('xp')}
        onProfilePress={() => setStoreTab('profile')}
      />

      <CartCheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => { setShowCheckoutModal(false); setCheckoutError(null); }}
        cart={cart}
        totalEur={cartTotal}
        totalXp={xpTotal}
        isAuthenticated={isAuthenticated}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        onConfirm={handleConfirmOrder}
        isSubmitting={orderSubmitting}
        error={checkoutError}
      />
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p) => { setSelectedProduct(null); openCustomize(p); }}
        partnerName={partner.name}
      />
      <ProductCustomizeModal
        product={productToCustomize}
        onClose={() => setProductToCustomize(null)}
        onAdd={addToCartWithOptions}
      />
    </div>
  );
};

function ProductCard({
  product,
  onAddToCart,
  onViewDetail,
}: {
  product: Product;
  onAddToCart: () => void;
  onViewDetail: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-premium-sm p-3 flex flex-col group cursor-pointer transition-all hover:bg-white border border-black/10 bg-white shadow-sm"
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`Προσθήκη στο καλάθι — ${product.name}`}
        onClick={onAddToCart}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onAddToCart();
          }
        }}
        className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 text-left cursor-pointer"
      >
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        {product.xpReward > 0 && (
          <div className="absolute left-2 top-2 rounded-lg border border-anbit-brand/45 bg-black/80 px-2.5 py-1 backdrop-blur-sm sm:left-2.5 sm:top-2.5 sm:px-3 sm:py-1.5">
            <span className="xp-badge text-[11px] font-extrabold uppercase tracking-wide text-anbit-brand sm:text-sm">
              +{product.xpReward} XP
            </span>
          </div>
        )}
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={onViewDetail}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onViewDetail();
          }
        }}
        className="text-left cursor-pointer"
      >
        <h4 className="product-title text-sm text-[#1b1c1c] mb-0.5 line-clamp-1">{product.name}</h4>
        <p className="text-[11px] text-zinc-500 mb-3 line-clamp-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="product-title text-[#1b1c1c] text-sm">€{product.price.toFixed(2)}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            className="primary-button bg-[#0a0a0a] text-white text-[10px] px-3 py-1.5 rounded-premium-sm tracking-widest hover:opacity-90 transition-colors"
          >
            ADD
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default StoreMenuPage;
