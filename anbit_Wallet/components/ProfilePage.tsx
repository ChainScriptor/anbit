import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Copy, Facebook, Linkedin, Search, Sparkles, Star, TicketPercent } from 'lucide-react';
import { UserData, Partner } from '../types';
import { useTheme } from '../context/ThemeContext';
import { cn } from '@/lib/utils';
import { IconTabs3D, type ProfileTabItem } from './ui/3d-icon-tabs-1';
import { ProfileInsightsSection } from './profile/ProfileInsightsSection';
import { ProfilePersonalInfoSection } from './profile/ProfilePersonalInfoSection';
import { OfferFilterSelect } from './ui/offer-filter-select';
import { GREEK_OFFERS } from '../data/greekOffers';
import {
  loadFavoriteMerchantIds,
  subscribeFavoriteMerchantsChanged,
  useFavoriteMerchant,
} from '@/lib/favoriteStores';
import { NetworkStoreCard } from './NetworkStoreCard';
import { Button } from './ui/button';

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

type ClaimedCardEntry = {
  id: string;
  cardTitle: string;
  storeName: string;
  claimedAt: string;
  code: string;
  status: 'active' | 'used' | 'expired';
};
type ClaimedStatusFilter = 'all' | ClaimedCardEntry['status'];

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

const CLAIMED_CARDS_MOCK: ClaimedCardEntry[] = [
  {
    id: 'c1',
    cardTitle: '4€ Coupon',
    storeName: 'Anbit Market',
    claimedAt: '11 Απριλίου, 13:42',
    code: 'ANB4-MKT-92Q',
    status: 'active',
  },
  {
    id: 'c2',
    cardTitle: '2x XP Weekend Pass',
    storeName: 'Meat the King',
    claimedAt: '09 Απριλίου, 19:05',
    code: 'XP2-WK-MTK',
    status: 'used',
  },
  {
    id: 'c3',
    cardTitle: '5€ Cashback Card',
    storeName: 'Pizza Squad',
    claimedAt: '03 Απριλίου, 21:10',
    code: 'CB5-PZ-44L',
    status: 'expired',
  },
];

const REDEEM_TIPS = [
  { title: 'Χωρίς κενά', text: 'Αντιγράφεις–επικολλάς ολόκληρο τον κωδικό όπως τον έλαβες.' },
  { title: 'Λήξη', text: 'Έλεγξε αν ο κωδικός έχει ημερομηνία λήξης πριν τον χρησιμοποιήσεις.' },
] as const;

const profileTabs: Array<ProfileTabItem & { path: string }> = [
  { id: 'history', label: 'Ιστορικό παραγγελιών', path: '/profile/history' },
  { id: 'informations', label: 'Προσωπικές πληροφορίες', path: '/profile/informations' },
  { id: 'claimed', label: 'Claimed κάρτες', path: '/profile/claimed' },
  { id: 'favorites', label: 'Αγαπημένα καταστήματα', path: '/profile/favorites' },
  { id: 'earn', label: 'Κέρδισε κουπόνια Anbit', path: '/profile/earn' },
  { id: 'redeem', label: 'Εξαργύρωση κουπονιού', path: '/profile/redeem' },
  { id: 'settings', label: 'Ρυθμίσεις', path: '/profile/settings' },
];

const NETWORK_STORE_CARD_BG_DARK = 'bg-[#1e1e1e]';
const NETWORK_STORE_CARD_BG_LIGHT = 'bg-white';

const MOCK_FAVORITES_PREVIEW_COUNT = 4;

/** Ετικέτες δικτύου για φίλτρο ιστορικού όταν η παραγγελία ταιριάζει με partner. */
const PARTNER_CATEGORY_LABELS: Record<string, string> = {
  coffee: 'Καφές',
  burger: 'Burger & ψητό',
  healthy: 'Υγεία & fitness',
  street_food: 'Street food',
  sandwiches: 'Σάντουιτς',
  sweets: 'Γλυκά',
  bar: 'Bar',
};

function orderHistoryPartnerCategoryLabel(categoryId: string): string {
  return PARTNER_CATEGORY_LABELS[categoryId] ?? categoryId.replace(/_/g, ' ');
}

function formatDeliveryLabel(partner: Partner): string {
  const raw = partner.deliveryTime;
  if (!raw || raw === '—') return '20-30 λεπτά';
  const cleaned = raw.replace(/'/g, '').replace(/\s*-\s*/g, '-');
  return `${cleaned} λεπτά`;
}

function formatFeeLabel(partner: Partner): string {
  const m = partner.minOrder;
  if (!m || m === '—') return '0,00 €';
  return m.includes('€') ? m.replace('€', ' €').trim() : `${m} €`;
}

function resolvePartnerForOrderHistory(storeName: string, partners: Partner[]): Partner | undefined {
  const q = storeName.trim().toLowerCase();
  return partners.find((p) => p.name.trim().toLowerCase() === q);
}

/** Κεφαλίδα καταστήματος — ίδιο visual language με QuestMerchantBanner / Network chips. */
function OrderHistoryMerchantHeader({
  order,
  partner,
}: {
  order: OrderHistoryEntry;
  partner?: Partner;
}) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isLight = theme === 'light';
  const merchantId = partner?.id ?? '';
  const [favorite, toggleFavorite] = useFavoriteMerchant(merchantId);
  const img = partner?.image ?? order.storeImage;
  const rating = partner?.rating ?? 9.2;
  const isCancelled = order.status === 'cancelled';
  const statusLabel = isCancelled ? 'Ακυρώθηκε' : 'Ολοκληρώθηκε';

  const goStore = () => {
    if (!partner) return;
    navigate(`/store-profile/${partner.id}`, { state: { partner } });
  };

  return (
    <div
      className={cn(
        'group relative flex w-full cursor-pointer items-stretch overflow-hidden rounded-lg border shadow-md transition-all duration-300',
        isLight
          ? cn(NETWORK_STORE_CARD_BG_LIGHT, 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50')
          : cn(NETWORK_STORE_CARD_BG_DARK, 'border-white/[0.08] hover:border-white/12 hover:bg-[#262626]'),
        partner ? '' : 'cursor-default',
      )}
      onClick={() => goStore()}
      onKeyDown={(e) => {
        if (!partner) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goStore();
        }
      }}
      role={partner ? 'button' : undefined}
      tabIndex={partner ? 0 : undefined}
      style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden sm:h-[4.5rem] sm:w-[4.5rem]">
        {img ? (
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            draggable={false}
          />
        ) : (
          <div className={cn('h-full w-full', isLight ? 'bg-zinc-200' : 'bg-[#1f1f1f]')} />
        )}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-r to-transparent',
            isLight ? 'from-black/10' : 'from-black/25',
          )}
        />
      </div>
      <div
        className={cn(
          'min-w-0 flex-1 py-2.5 pl-2.5 pr-2 sm:pr-3',
          isLight ? 'text-neutral-900' : 'text-[#e5e5e5]',
        )}
      >
        <div className="flex items-center gap-1.5">
          <h2
            className={cn(
              'truncate text-sm font-semibold uppercase leading-tight tracking-tight',
              isLight ? 'text-neutral-900' : 'text-white',
            )}
          >
            {order.storeName}
          </h2>
          <span
            className={cn(
              'shrink-0 rounded-sm px-1 py-px text-[7px] font-semibold uppercase leading-none tracking-tight text-white',
              isLight ? 'bg-[#0a0a0a]' : 'bg-anbit-brand/90',
            )}
          >
            Anbit+
          </span>
        </div>
        <p
          className={cn(
            'mt-0.5 line-clamp-1 text-[10px] font-medium',
            isLight ? 'text-neutral-600' : 'text-[#ababab]',
          )}
        >
          {partner ? (
            <>
              <span>{formatFeeLabel(partner)}</span>
              <span
                className={cn(
                  'mx-1 inline-block h-0.5 w-0.5 rounded-full align-middle',
                  isLight ? 'bg-zinc-400' : 'bg-[#484848]',
                )}
              />
              <span>{formatDeliveryLabel(partner)}</span>
              <span
                className={cn(
                  'mx-1 inline-block h-0.5 w-0.5 rounded-full align-middle',
                  isLight ? 'bg-zinc-400' : 'bg-[#484848]',
                )}
              />
              <span className="inline-flex items-center gap-0.5">
                {rating.toFixed(1)}
                <span
                  className="material-symbols-outlined text-[12px] text-sky-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  sentiment_satisfied
                </span>
              </span>
            </>
          ) : (
            <>
              {order.dateTime}
              <span
                className={cn(
                  'mx-1 inline-block h-0.5 w-0.5 rounded-full align-middle',
                  isLight ? 'bg-zinc-400' : 'bg-[#484848]',
                )}
              />
              <span className={isCancelled ? 'text-anbit-brand' : ''}>{statusLabel}</span>
            </>
          )}
        </p>
        {partner ? (
          <p
            className={cn(
              'mt-1 line-clamp-1 text-[10px] font-medium',
              isLight ? 'text-neutral-500' : 'text-[#7a7a7a]',
            )}
          >
            {order.dateTime}
            <span className="mx-1">•</span>
            <span className={isCancelled ? 'text-anbit-brand' : ''}>{statusLabel}</span>
          </p>
        ) : null}
      </div>
      <div
        className={cn(
          'flex shrink-0 flex-col items-end justify-center px-2 py-2.5 sm:px-3',
          partner ? 'pr-10 sm:pr-11' : 'pr-3',
        )}
      >
        <span
          className={cn(
            'text-base font-bold leading-none sm:text-lg',
            isCancelled ? (isLight ? 'text-neutral-400 line-through' : 'text-[color:var(--anbit-muted)] line-through') : isLight ? 'text-neutral-900' : 'text-white',
          )}
        >
          {order.price}
        </span>
      </div>
      {partner ? (
        <div className="absolute right-1 top-1 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite();
            }}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-colors duration-300',
              isLight
                ? cn(
                    'border border-zinc-200 bg-zinc-100 text-neutral-600 hover:bg-zinc-200',
                    favorite && 'border-[#0a0a0a] bg-[#0a0a0a] text-white hover:bg-[#171717]',
                  )
                : cn(
                    'bg-[#262626]/80 text-white hover:bg-[#2563eb]/90',
                    favorite && 'bg-[#2563eb]',
                  ),
            )}
            aria-label={favorite ? 'Αφαίρεση από αγαπημένα' : 'Αγαπημένα'}
          >
            <span
              className="material-symbols-outlined text-[16px]"
              style={favorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              favorite
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

function claimedCardStatusLabel(status: ClaimedCardEntry['status']): string {
  if (status === 'active') return 'Ενεργή';
  if (status === 'used') return 'Χρησιμοποιήθηκε';
  return 'Έληξε';
}

/** Ίδιο chip καταστήματος με το ιστορικό — για claimed κάρτες. */
function ClaimedCardMerchantHeader({ entry, partner }: { entry: ClaimedCardEntry; partner?: Partner }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isLight = theme === 'light';
  const merchantId = partner?.id ?? '';
  const [favorite, toggleFavorite] = useFavoriteMerchant(merchantId);
  const img = partner?.image ?? '';
  const rating = partner?.rating ?? 9.2;
  const statusLabel = claimedCardStatusLabel(entry.status);
  const statusRightClass =
    entry.status === 'active'
      ? isLight
        ? 'text-emerald-700'
        : 'text-emerald-400'
      : entry.status === 'used'
        ? isLight
          ? 'text-neutral-500'
          : 'text-[color:var(--anbit-muted)]'
        : 'text-anbit-brand';

  const goStore = () => {
    if (!partner) return;
    navigate(`/store-profile/${partner.id}`, { state: { partner } });
  };

  return (
    <div
      className={cn(
        'group relative flex w-full cursor-pointer items-stretch overflow-hidden rounded-lg border shadow-md transition-all duration-300',
        isLight
          ? cn(NETWORK_STORE_CARD_BG_LIGHT, 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50')
          : cn(NETWORK_STORE_CARD_BG_DARK, 'border-white/[0.08] hover:border-white/12 hover:bg-[#262626]'),
        partner ? '' : 'cursor-default',
      )}
      onClick={() => goStore()}
      onKeyDown={(e) => {
        if (!partner) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goStore();
        }
      }}
      role={partner ? 'button' : undefined}
      tabIndex={partner ? 0 : undefined}
      style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden sm:h-[4.5rem] sm:w-[4.5rem]">
        {img ? (
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            draggable={false}
          />
        ) : (
          <div className={cn('h-full w-full', isLight ? 'bg-zinc-200' : 'bg-[#1f1f1f]')} />
        )}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-r to-transparent',
            isLight ? 'from-black/10' : 'from-black/25',
          )}
        />
      </div>
      <div
        className={cn(
          'min-w-0 flex-1 py-2.5 pl-2.5 pr-2 sm:pr-3',
          isLight ? 'text-neutral-900' : 'text-[#e5e5e5]',
        )}
      >
        <div className="flex items-center gap-1.5">
          <h2
            className={cn(
              'truncate text-sm font-semibold uppercase leading-tight tracking-tight',
              isLight ? 'text-neutral-900' : 'text-white',
            )}
          >
            {entry.storeName}
          </h2>
          <span
            className={cn(
              'shrink-0 rounded-sm px-1 py-px text-[7px] font-semibold uppercase leading-none tracking-tight text-white',
              isLight ? 'bg-[#0a0a0a]' : 'bg-anbit-brand/90',
            )}
          >
            Anbit+
          </span>
        </div>
        <p
          className={cn(
            'mt-0.5 line-clamp-1 text-[10px] font-medium',
            isLight ? 'text-neutral-600' : 'text-[#ababab]',
          )}
        >
          {partner ? (
            <>
              <span>{formatFeeLabel(partner)}</span>
              <span
                className={cn(
                  'mx-1 inline-block h-0.5 w-0.5 rounded-full align-middle',
                  isLight ? 'bg-zinc-400' : 'bg-[#484848]',
                )}
              />
              <span>{formatDeliveryLabel(partner)}</span>
              <span
                className={cn(
                  'mx-1 inline-block h-0.5 w-0.5 rounded-full align-middle',
                  isLight ? 'bg-zinc-400' : 'bg-[#484848]',
                )}
              />
              <span className="inline-flex items-center gap-0.5">
                {rating.toFixed(1)}
                <span
                  className="material-symbols-outlined text-[12px] text-sky-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  sentiment_satisfied
                </span>
              </span>
            </>
          ) : (
            <>
              {entry.claimedAt}
              <span
                className={cn(
                  'mx-1 inline-block h-0.5 w-0.5 rounded-full align-middle',
                  isLight ? 'bg-zinc-400' : 'bg-[#484848]',
                )}
              />
              <span className={statusRightClass}>{statusLabel}</span>
            </>
          )}
        </p>
        {partner ? (
          <p
            className={cn(
              'mt-1 line-clamp-1 text-[10px] font-medium',
              isLight ? 'text-neutral-500' : 'text-[#7a7a7a]',
            )}
          >
            Claim στις {entry.claimedAt}
            <span className="mx-1">•</span>
            <span className={statusRightClass}>{statusLabel}</span>
          </p>
        ) : null}
      </div>
      <div
        className={cn(
          'flex shrink-0 flex-col items-end justify-center px-2 py-2.5 text-right sm:px-3',
          partner ? 'pr-10 sm:pr-11' : 'pr-3',
        )}
      >
        <span className={cn('text-xs font-bold leading-tight sm:text-sm', statusRightClass)}>{statusLabel}</span>
      </div>
      {partner ? (
        <div className="absolute right-1 top-1 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite();
            }}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-colors duration-300',
              isLight
                ? cn(
                    'border border-zinc-200 bg-zinc-100 text-neutral-600 hover:bg-zinc-200',
                    favorite && 'border-[#0a0a0a] bg-[#0a0a0a] text-white hover:bg-[#171717]',
                  )
                : cn(
                    'bg-[#262626]/80 text-white hover:bg-[#2563eb]/90',
                    favorite && 'bg-[#2563eb]',
                  ),
            )}
            aria-label={favorite ? 'Αφαίρεση από αγαπημένα' : 'Αγαπημένα'}
          >
            <span
              className="material-symbols-outlined text-[16px]"
              style={favorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              favorite
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

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

  const [orderHistoryCategoryFilter, setOrderHistoryCategoryFilter] = useState<string>('all');
  const [orderHistoryStoreSearch, setOrderHistoryStoreSearch] = useState('');
  const [selectedClaimedStoreId, setSelectedClaimedStoreId] = useState<string | null>(null);
  const [claimedStatusFilter, setClaimedStatusFilter] = useState<ClaimedStatusFilter>('all');
  const [favoriteMerchantIds, setFavoriteMerchantIds] = useState<Set<string>>(() => loadFavoriteMerchantIds());
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemFeedback, setRedeemFeedback] = useState<{ kind: 'success' | 'error' | null; message: string }>({
    kind: null,
    message: '',
  });
  const handleRedeemSubmit = useCallback(() => {
    const code = redeemCode.trim().toUpperCase();
    if (!code) {
      setRedeemFeedback({ kind: 'error', message: 'Πληκτρολόγησε έναν κωδικό για να συνεχίσεις.' });
      return;
    }
    if (code.length < 4) {
      setRedeemFeedback({ kind: 'error', message: 'Ο κωδικός φαίνεται πολύ σύντομος.' });
      return;
    }
    setRedeemFeedback({
      kind: 'success',
      message: 'Ο κωδικός καταχωρήθηκε. (Προεπισκόπηση — σύνδεση με backend αργότερα.)',
    });
    setRedeemCode('');
  }, [redeemCode]);

  const orderHistoryCategoryOptions = useMemo(() => {
    const base: { value: string; label: string }[] = [
      { value: 'all', label: 'Όλες οι κατηγορίες' },
      { value: 'supermarket', label: 'Σούπερ μάρκετ' },
      { value: 'food', label: 'Φαγητό & delivery' },
    ];
    const seen = new Set(base.map((b) => b.value));
    for (const o of ORDER_HISTORY_MOCK) {
      const p = resolvePartnerForOrderHistory(o.storeName, partners);
      const cat = p?.category;
      if (cat && !seen.has(cat)) {
        seen.add(cat);
        base.push({ value: cat, label: orderHistoryPartnerCategoryLabel(cat) });
      }
    }
    return base;
  }, [partners]);

  const filteredOrderHistory = useMemo(() => {
    let list = [...ORDER_HISTORY_MOCK];
    if (orderHistoryCategoryFilter !== 'all') {
      if (orderHistoryCategoryFilter === 'supermarket' || orderHistoryCategoryFilter === 'food') {
        list = list.filter((o) => o.category === orderHistoryCategoryFilter);
      } else {
        list = list.filter((o) => {
          const p = resolvePartnerForOrderHistory(o.storeName, partners);
          return p?.category === orderHistoryCategoryFilter;
        });
      }
    }
    const q = orderHistoryStoreSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((o) => {
        const p = resolvePartnerForOrderHistory(o.storeName, partners);
        const name = (p?.name ?? o.storeName).toLowerCase();
        return name.includes(q);
      });
    }
    return list;
  }, [orderHistoryCategoryFilter, orderHistoryStoreSearch, partners]);
  const claimedStores = useMemo(() => {
    const claimsPerStore = CLAIMED_CARDS_MOCK.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.storeName] = (acc[entry.storeName] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(claimsPerStore)
      .map(([storeName, claimsCount]) => {
        const partner = resolvePartnerForOrderHistory(storeName, partners);
        return partner
          ? {
              partner,
              claimsCount,
            }
          : null;
      })
      .filter((x): x is { partner: Partner; claimsCount: number } => x != null);
  }, [partners]);

  const filteredClaimedCards = useMemo(() => {
    let list = [...CLAIMED_CARDS_MOCK];
    if (selectedClaimedStoreId) {
      list = list.filter((entry) => {
        const p = resolvePartnerForOrderHistory(entry.storeName, partners);
        return p?.id === selectedClaimedStoreId;
      });
    }
    if (claimedStatusFilter !== 'all') {
      list = list.filter((entry) => entry.status === claimedStatusFilter);
    }
    return list;
  }, [selectedClaimedStoreId, claimedStatusFilter, partners]);
  const favoritePreviewStores = useMemo(() => {
    const sortedPartners = [...partners].sort((a, b) => a.name.localeCompare(b.name, 'el', { sensitivity: 'base' }));
    const realFavorites = sortedPartners.filter((partner) => favoriteMerchantIds.has(partner.id));
    if (realFavorites.length > 0) return realFavorites;
    // Mock preview: αν δεν υπάρχουν αγαπημένα, δείξε μερικά για οπτικό έλεγχο του layout.
    return sortedPartners.slice(0, MOCK_FAVORITES_PREVIEW_COUNT);
  }, [partners, favoriteMerchantIds]);

  useEffect(() => {
    if (location.pathname === '/profile') {
      navigate('/profile/history', { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    setFavoriteMerchantIds(loadFavoriteMerchantIds());
    return subscribeFavoriteMerchantsChanged(() => {
      setFavoriteMerchantIds(loadFavoriteMerchantIds());
    });
  }, []);

  const activeTabId =
    profileTabs.find((tab) => location.pathname.startsWith(tab.path))?.id ?? 'history';

  return (
    <div
      className="min-h-screen font-sans antialiased"
      data-theme={theme}
      style={{
        backgroundColor: 'var(--anbit-bg)',
        color: 'var(--anbit-text)',
      }}
    >
      <main className="mx-auto w-full max-w-[1180px] px-3 pb-10 pt-5 sm:px-5 sm:pt-7 lg:pt-8">
        <div className="mb-6 space-y-2 sm:mb-7">
          <h1
            className={cn(
              'playpen-sans text-[26px] font-bold leading-tight tracking-tight sm:text-[30px]',
              theme === 'light' ? 'text-neutral-900' : 'text-anbit-text',
            )}
          >
            Προφίλ
          </h1>
          <p className={cn('text-sm sm:text-base', theme === 'light' ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]')}>
            Διαχείριση λογαριασμού, παραγγελιών και rewards σε ένα μέρος.
          </p>
        </div>
        <div className="mb-5 rounded-2xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] p-2 sm:p-3">
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
          <div
            className="mx-auto w-full max-w-[1180px] space-y-6 px-1 pb-8 pt-2 sm:space-y-8 sm:px-2"
            style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
          >
            <div className="min-w-0 space-y-1">
              <h2
                className={cn(
                  'playpen-sans text-[26px] font-bold leading-tight tracking-tight sm:text-[28px]',
                  theme === 'light' ? 'text-neutral-900' : 'text-anbit-text',
                )}
              >
                Ιστορικό παραγγελιών
              </h2>
              <p
                className={cn(
                  'text-sm sm:text-base',
                  theme === 'light' ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]',
                )}
              >
                Οι αγορές σου σε μορφή παρόμοια με τις προσφορές στο Anbit — κατάστημα, είδη και XP.
              </p>
            </div>

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start sm:gap-3 md:gap-4">
              <label className="relative block w-full min-w-0 sm:w-[min(100%,22rem)] sm:shrink-0">
                <Search
                  className={cn(
                    'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2',
                    theme === 'light' ? 'text-zinc-400' : 'text-[#9a9a9a]',
                  )}
                  aria-hidden
                />
                <input
                  type="search"
                  value={orderHistoryStoreSearch}
                  onChange={(e) => setOrderHistoryStoreSearch(e.target.value)}
                  placeholder="Αναζήτηση καταστήματος…"
                  autoComplete="off"
                  className={cn(
                    'h-10 w-full rounded-lg border pl-9 pr-3 text-sm focus:outline-none focus:ring-2',
                    theme === 'light'
                      ? 'border-zinc-200 bg-white text-neutral-900 placeholder:text-zinc-400 focus:border-[#0a0a0a]/45 focus:ring-[#0a0a0a]/12'
                      : 'border-anbit-border bg-anbit-card text-anbit-text placeholder:text-anbit-muted/80 focus:border-anbit-brand/40 focus:ring-anbit-brand/15',
                  )}
                  aria-label="Αναζήτηση καταστήματος"
                />
              </label>
              <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                <span
                  className={cn(
                    'shrink-0 whitespace-nowrap text-sm font-medium',
                    theme === 'light' ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]',
                  )}
                >
                  Κατηγορία
                </span>
                <OfferFilterSelect
                  value={orderHistoryCategoryFilter}
                  onChange={setOrderHistoryCategoryFilter}
                  options={orderHistoryCategoryOptions}
                  aria-label="Κατηγορία παραγγελιών"
                  className="min-w-0 sm:shrink-0"
                  triggerClassName="sm:min-w-[13rem]"
                />
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
              {filteredOrderHistory.length === 0 ? (
                <p
                  className={cn(
                    'col-span-full py-12 text-center text-sm',
                    theme === 'light' ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]',
                  )}
                >
                  Δεν βρέθηκαν παραγγελίες με αυτά τα κριτήρια. Δοκίμασε άλλη κατηγορία ή άλλο όνομα καταστήματος.
                </p>
              ) : null}
              {filteredOrderHistory.map((order) => {
                const isCancelled = order.status === 'cancelled';
                const partner = resolvePartnerForOrderHistory(order.storeName, partners);
                const lightQuests = theme === 'light';
                const detailShell = cn(
                  'flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border transition-colors',
                  lightQuests
                    ? 'border-zinc-200 hover:border-zinc-300 bg-white'
                    : 'border-[color:var(--anbit-border)] hover:border-anbit-brand/25 bg-[color:var(--anbit-card)]',
                );
                const mutedBody = theme === 'light' ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]';

                return (
                  <section key={order.id} className="flex h-full min-h-0 min-w-0 flex-col gap-3">
                    <OrderHistoryMerchantHeader order={order} partner={partner} />
                    <div className={detailShell}>
                      <div className="relative h-28 w-full shrink-0 sm:h-32">
                        <img
                          src={order.storeImage}
                          alt=""
                          className={cn('h-full w-full object-cover', isCancelled && 'opacity-60 grayscale')}
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/8 to-transparent" />
                        {!isCancelled && order.xp != null ? (
                          <span
                            className={cn(
                              'absolute right-3 top-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold shadow-sm backdrop-blur-sm',
                              lightQuests
                                ? 'border border-zinc-200 bg-zinc-50 text-neutral-900'
                                : 'border border-[color:var(--anbit-xp-surface-border)] bg-[color:var(--anbit-xp-surface)]/90 text-[color:var(--anbit-xp-accent)]',
                            )}
                          >
                            <Star className={cn('h-3 w-3', lightQuests && 'text-[#0a0a0a]')} aria-hidden />
                            +{order.xp} XP
                          </span>
                        ) : null}
                      </div>
                      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
                        <p className={cn('line-clamp-4 text-xs leading-relaxed sm:text-sm', mutedBody)}>
                          {order.itemsSummary}
                        </p>
                        <div className="mt-auto flex flex-col gap-2 pt-1">
                          {isCancelled ? (
                            <>
                              <button
                                type="button"
                                className={cn(
                                  'w-full rounded-lg py-2.5 text-xs font-semibold transition-colors sm:text-sm',
                                  lightQuests
                                    ? 'bg-[#0a0a0a] text-white hover:bg-[#171717]'
                                    : 'bg-anbit-brand text-anbit-brand-foreground hover:bg-anbit-brand-hover',
                                )}
                              >
                                Αναφορά προβλήματος
                              </button>
                              <button
                                type="button"
                                className={cn(
                                  'w-full rounded-lg px-3 py-2.5 text-xs font-medium transition-colors sm:text-sm',
                                  lightQuests
                                    ? 'border border-zinc-300 text-neutral-900 hover:bg-zinc-100'
                                    : 'border border-[color:var(--anbit-border)] text-[color:var(--anbit-text)] hover:bg-white/5',
                                )}
                              >
                                Αρχεία παραγγελίας
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className={cn(
                                'w-full rounded-lg py-2.5 text-xs font-semibold transition-colors sm:text-sm',
                                lightQuests
                                  ? 'bg-[#0a0a0a] text-white hover:bg-[#171717]'
                                  : 'bg-anbit-brand text-anbit-brand-foreground hover:bg-anbit-brand-hover',
                              )}
                            >
                              Λεπτομέρειες
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}

        {activeTabId === 'claimed' && (
          <div
            className="mx-auto w-full max-w-[1180px] space-y-6 px-1 pb-8 pt-2 sm:space-y-8 sm:px-2"
            style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
          >
            <div className="min-w-0 space-y-1">
              <h2
                className={cn(
                  'playpen-sans text-[26px] font-bold leading-tight tracking-tight sm:text-[28px]',
                  theme === 'light' ? 'text-neutral-900' : 'text-anbit-text',
                )}
              >
                Claimed κάρτες
              </h2>
              <p
                className={cn(
                  'text-sm sm:text-base',
                  theme === 'light' ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]',
                )}
              >
                Όλες οι κάρτες που έχεις κάνει claim και το κατάστημα όπου αντιστοιχούν — ίδια διάταξη με το ιστορικό παραγγελιών.
              </p>
            </div>

            <div className="flex min-w-0 flex-col gap-3">
              <div className="flex min-w-0 flex-wrap items-center justify-start gap-2">
                <span
                  className={cn(
                    'mr-1 shrink-0 text-sm font-medium',
                    theme === 'light' ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]',
                  )}
                >
                  Κατάσταση
                </span>
                <OfferFilterSelect
                  value={claimedStatusFilter}
                  onChange={(v) => setClaimedStatusFilter(v as ClaimedStatusFilter)}
                  options={[
                    { value: 'all', label: 'Όλες' },
                    { value: 'active', label: 'Ενεργές' },
                    { value: 'used', label: 'Χρησιμοποιήθηκαν' },
                    { value: 'expired', label: 'Έληξαν' },
                  ]}
                  aria-label="Φίλτρο κατάστασης claimed καρτών"
                  className="min-w-0 sm:shrink-0"
                  triggerClassName="sm:min-w-[12rem]"
                />
              </div>

            {claimedStores.length > 0 ? (
              <div className="flex min-w-0 flex-wrap items-center justify-start gap-2">
                <span
                  className={cn(
                    'mr-1 shrink-0 text-sm font-medium',
                    theme === 'light' ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]',
                  )}
                >
                  Κατάστημα
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedClaimedStoreId(null)}
                  className={cn(
                    'shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors sm:text-sm',
                    selectedClaimedStoreId === null
                      ? theme === 'light'
                        ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white'
                        : 'border-anbit-brand/60 bg-anbit-brand/25 text-white'
                      : theme === 'light'
                        ? 'border-zinc-200 bg-white text-neutral-700 hover:bg-zinc-50'
                        : 'border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] text-[color:var(--anbit-text)] hover:bg-white/5',
                  )}
                >
                  Όλα
                </button>
                {claimedStores.map((store) => {
                  const sel = selectedClaimedStoreId === store.partner.id;
                  return (
                    <button
                      key={store.partner.id}
                      type="button"
                      onClick={() =>
                        setSelectedClaimedStoreId((prev) => (prev === store.partner.id ? null : store.partner.id))
                      }
                      className={cn(
                        'max-w-[14rem] shrink-0 truncate rounded-lg border px-3 py-2 text-xs font-semibold transition-colors sm:max-w-[16rem] sm:text-sm',
                        sel
                          ? theme === 'light'
                            ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white'
                            : 'border-anbit-brand/60 bg-anbit-brand/25 text-white'
                          : theme === 'light'
                            ? 'border-zinc-200 bg-white text-neutral-700 hover:bg-zinc-50'
                            : 'border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] text-[color:var(--anbit-text)] hover:bg-white/5',
                      )}
                    >
                      {store.partner.name}
                    </button>
                  );
                })}
              </div>
            ) : null}
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
              {filteredClaimedCards.length === 0 ? (
                <p
                  className={cn(
                    'col-span-full py-12 text-center text-sm',
                    theme === 'light' ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]',
                  )}
                >
                  Δεν βρέθηκαν κάρτες για αυτό το φίλτρο.
                </p>
              ) : null}
              {filteredClaimedCards.map((entry, index) => {
                const partner = resolvePartnerForOrderHistory(entry.storeName, partners);
                const lightQuests = theme === 'light';
                const detailShell = cn(
                  'flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border transition-colors',
                  lightQuests
                    ? 'border-zinc-200 hover:border-zinc-300 bg-white'
                    : 'border-[color:var(--anbit-border)] hover:border-anbit-brand/25 bg-[color:var(--anbit-card)]',
                );
                const mutedBody = theme === 'light' ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]';
                const statusLabel = claimedCardStatusLabel(entry.status);
                const bannerSrc =
                  GREEK_OFFERS[index % GREEK_OFFERS.length]?.imageSrc ?? '/categories/coupons.gif';
                const isExpired = entry.status === 'expired';

                return (
                  <section key={entry.id} className="flex h-full min-h-0 min-w-0 flex-col gap-3">
                    <ClaimedCardMerchantHeader entry={entry} partner={partner} />
                    <div className={detailShell}>
                      <div className="relative h-28 w-full shrink-0 sm:h-32">
                        <img
                          src={bannerSrc}
                          alt=""
                          className={cn('h-full w-full object-cover', isExpired && 'opacity-60 grayscale')}
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/8 to-transparent" />
                        <span
                          className={cn(
                            'absolute right-3 top-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold shadow-sm backdrop-blur-sm',
                            lightQuests
                              ? 'border border-zinc-200 bg-zinc-50 text-neutral-900'
                              : 'border border-[color:var(--anbit-xp-surface-border)] bg-[color:var(--anbit-xp-surface)]/90 text-[color:var(--anbit-xp-accent)]',
                          )}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
                        <div className="min-h-0 space-y-2">
                          <p
                            className={cn(
                              'text-sm font-semibold leading-snug sm:text-base',
                              lightQuests ? 'text-neutral-900' : 'text-[color:var(--anbit-text)]',
                            )}
                          >
                            {entry.cardTitle}
                          </p>
                          <p className={cn('text-xs leading-relaxed sm:text-sm', mutedBody)}>
                            Claim στις {entry.claimedAt}
                          </p>
                          <p
                            className={cn(
                              'truncate font-mono text-[11px] sm:text-xs',
                              lightQuests ? 'text-neutral-500' : 'text-[color:var(--anbit-muted)]',
                            )}
                          >
                            {entry.code}
                          </p>
                        </div>
                        <div className="mt-auto flex flex-col gap-2 pt-1">
                          <button
                            type="button"
                            className={cn(
                              'w-full rounded-lg py-2.5 text-xs font-semibold transition-colors sm:text-sm',
                              lightQuests
                                ? 'bg-[#0a0a0a] text-white hover:bg-[#171717]'
                                : 'bg-anbit-brand text-anbit-brand-foreground hover:bg-anbit-brand-hover',
                            )}
                          >
                            Λεπτομέρειες
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}

        {activeTabId === 'earn' && (
          <div
            className="mx-auto w-full max-w-[1180px] space-y-6 px-1 pb-8 pt-2 sm:space-y-8 sm:px-2"
            style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
          >
            <div className="min-w-0 space-y-1">
              <h2
                className={cn(
                  'playpen-sans text-[26px] font-bold leading-tight tracking-tight sm:text-[28px]',
                  theme === 'light' ? 'text-neutral-900' : 'text-anbit-text',
                )}
              >
                Κέρδισε κουπόνια Anbit
              </h2>
              <p className={cn('text-sm sm:text-base', theme === 'light' ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]')}>
                Ίδιο visual στυλ με το ιστορικό για να διαβάζεται πιο ξεκάθαρα.
              </p>
            </div>
            <section className="rounded-xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] p-5 shadow-sm sm:p-7">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-8">
                <div className={cn('min-w-0 flex-1 space-y-4', theme === 'light' ? 'text-neutral-900' : 'text-white')}>
                  <h2 className="text-left text-2xl font-extrabold leading-tight sm:text-4xl">
                    Προσκάλεσε τους φίλους σου και κέρδισε προσφορές
                  </h2>

                  <div
                    className={cn(
                      'space-y-4 text-[15px] leading-relaxed',
                      theme === 'light' ? 'text-neutral-700' : 'text-white/95',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-anbit-brand text-sm font-bold text-anbit-brand-foreground">
                        1
                      </span>
                      <p>
                        Οι φίλοι σου θα κερδίσουν 3,00 € σε Anbit κουπόνια όταν χρησιμοποιήσουν τον κωδικό σου για κάθε μία από τις
                        πρώτες τους 3 παραγγελίες.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-anbit-brand text-sm font-bold text-anbit-brand-foreground">
                        2
                      </span>
                      <p>
                        Θα κερδίσεις 3,00 € σε Anbit κουπόνια για κάθε μία από τις πρώτες 3 παραγγελίες των φίλων σου. Μπορείς να
                        κερδίσεις έναν μέγιστο αριθμό 15,00 € μονάδων πίστωσης προσκαλώντας τους φίλους σας να γίνουν μέλη της Anbit.
                      </p>
                    </div>
                  </div>

                  <div className="pt-1 text-left">
                    <button type="button" className="text-anbit-brand hover:text-anbit-brand-hover transition-colors">
                      Πώς λειτουργούν τα κουπόνια Anbit;
                    </button>
                  </div>
                </div>

                <div className="flex shrink-0 justify-center md:justify-end md:pt-0.5">
                  <div
                    className={cn(
                      'overflow-hidden rounded-xl border',
                      theme === 'light' ? 'border-zinc-200' : 'border-[color:var(--anbit-border)]',
                    )}
                  >
                    <img
                      src="/categories/coupon.gif"
                      alt="Referral coupon"
                      className="h-[140px] w-[210px] object-cover sm:h-[176px] sm:w-[264px]"
                      draggable={false}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div
                  className={cn(
                    'rounded-2xl border p-4',
                    theme === 'light' ? 'border-zinc-200 bg-zinc-50' : 'border-white/15 bg-white/5',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className={cn('text-sm', theme === 'light' ? 'text-neutral-600' : 'text-white/70')}>Ο κωδικός σου</p>
                      <p className={cn('mt-1 text-2xl font-bold tracking-wide', theme === 'light' ? 'text-neutral-900' : 'text-white')}>
                        ATUD5MF
                      </p>
                    </div>
                    <button
                      type="button"
                      className={cn(
                        'inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors',
                        theme === 'light'
                          ? 'border-zinc-300 text-neutral-700 hover:bg-zinc-100'
                          : 'border-white/20 text-white/90 hover:bg-white/10',
                      )}
                      aria-label="Αντιγραφή κωδικού"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="pt-1 text-left">
                  <p className={cn('text-sm', theme === 'light' ? 'text-neutral-600' : 'text-white/75')}>
                    Μοιράσου τον εκπτωτικό κωδικό σου
                  </p>
                  <div className="mt-3 flex items-center justify-start gap-4">
                    <button
                      type="button"
                      className={cn(
                        'inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors',
                        theme === 'light'
                          ? 'border-zinc-300 text-neutral-800 hover:bg-zinc-100'
                          : 'border-white/25 text-white hover:bg-white/10',
                      )}
                      aria-label="Share on Facebook"
                    >
                      <Facebook className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className={cn(
                        'inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors',
                        theme === 'light'
                          ? 'border-zinc-300 text-neutral-800 hover:bg-zinc-100'
                          : 'border-white/25 text-white hover:bg-white/10',
                      )}
                      aria-label="Share on X"
                    >
                      <span className="text-lg font-semibold">X</span>
                    </button>
                    <button
                      type="button"
                      className={cn(
                        'inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors',
                        theme === 'light'
                          ? 'border-zinc-300 text-neutral-800 hover:bg-zinc-100'
                          : 'border-white/25 text-white hover:bg-white/10',
                      )}
                      aria-label="Share on LinkedIn"
                    >
                      <Linkedin className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTabId === 'redeem' && (
          <div
            className="mx-auto w-full max-w-[1180px] space-y-6 px-1 pb-10 pt-2 sm:space-y-8 sm:px-2"
            style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
          >
            <div className="min-w-0 space-y-1">
              <h2
                className={cn(
                  'playpen-sans text-[26px] font-bold leading-tight tracking-tight sm:text-[28px]',
                  theme === 'light' ? 'text-neutral-900' : 'text-anbit-text',
                )}
              >
                Εξαργύρωση κουπονιού
              </h2>
              <p className={cn('text-sm sm:text-base', theme === 'light' ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]')}>
                Πρόσθεσε δωροκάρτα ή κωδικό προσφοράς· το υπόλοιπό σου ενημερώνεται όταν συνδεθεί το backend.
              </p>
            </div>

            <section
              className={cn(
                'relative overflow-hidden rounded-2xl border shadow-md',
                theme === 'light' ? 'border-zinc-200 bg-white' : 'border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)]',
              )}
            >
              <div
                className="h-1 w-full bg-gradient-to-r from-anbit-brand via-sky-500 to-amber-500"
                aria-hidden
              />
              <div className="p-5 sm:p-7 lg:p-8">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
                  <div className="min-w-0 flex-1 space-y-6">
                    <div
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5',
                        theme === 'light'
                          ? 'border-zinc-200 bg-zinc-50 text-neutral-800'
                          : 'border-white/10 bg-white/[0.04] text-white',
                      )}
                    >
                      <TicketPercent className="h-4 w-4 shrink-0 text-anbit-brand" aria-hidden />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Anbit κουπόνι</span>
                    </div>

                    <div>
                      <h3
                        className={cn(
                          'text-2xl font-bold leading-tight tracking-tight sm:text-3xl',
                          theme === 'light' ? 'text-neutral-900' : 'text-white',
                        )}
                      >
                        Πρόσθεσε τον κωδικό σου
                      </h3>
                      <p
                        className={cn(
                          'mt-2 max-w-xl text-sm leading-relaxed sm:text-base',
                          theme === 'light' ? 'text-neutral-600' : 'text-white/80',
                        )}
                      >
                        Δέχεται κωδικούς δωροκάρτας και προσφορών. Μετά την εξαργύρωση, το ποσό εμφανίζεται στα διαθέσιμα
                        κουπόνια σου.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="profile-redeem-code"
                        className={cn('block text-sm font-semibold', theme === 'light' ? 'text-neutral-800' : 'text-white/90')}
                      >
                        Κωδικός
                      </label>
                      <div className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:items-stretch">
                        <input
                          id="profile-redeem-code"
                          type="text"
                          value={redeemCode}
                          onChange={(e) => {
                            setRedeemCode(e.target.value);
                            if (redeemFeedback.kind) setRedeemFeedback({ kind: null, message: '' });
                          }}
                          placeholder="π.χ. ANBIT-GIFT-XXXX"
                          autoComplete="off"
                          spellCheck={false}
                          className={cn(
                            'h-12 min-w-0 flex-1 rounded-xl border px-4 font-medium outline-none transition-shadow focus:ring-2',
                            theme === 'light'
                              ? 'border-zinc-200 bg-white uppercase text-neutral-900 placeholder:normal-case placeholder:text-zinc-400 focus:border-[#0a0a0a]/40 focus:ring-[#0a0a0a]/10'
                              : 'border-[color:var(--anbit-border)] bg-[color:var(--anbit-input)] uppercase text-white placeholder:normal-case placeholder:text-white/40 focus:border-anbit-brand focus:ring-anbit-brand/25',
                          )}
                        />
                        <Button
                          type="button"
                          size="lg"
                          className="h-12 shrink-0 px-8 font-bold sm:self-auto"
                          onClick={handleRedeemSubmit}
                        >
                          Εξαργύρωση
                        </Button>
                      </div>
                      {redeemFeedback.kind ? (
                        <p
                          role="status"
                          className={cn(
                            'text-sm font-medium',
                            redeemFeedback.kind === 'success'
                              ? theme === 'light'
                                ? 'text-emerald-700'
                                : 'text-emerald-400'
                              : theme === 'light'
                                ? 'text-red-600'
                                : 'text-red-400',
                          )}
                        >
                          {redeemFeedback.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {REDEEM_TIPS.map((tip) => (
                        <div
                          key={tip.title}
                          className={cn(
                            'rounded-xl border p-4',
                            theme === 'light' ? 'border-zinc-200 bg-zinc-50/80' : 'border-white/[0.08] bg-white/[0.03]',
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-anbit-brand" aria-hidden />
                            <div>
                              <p className={cn('text-sm font-bold', theme === 'light' ? 'text-neutral-900' : 'text-white')}>
                                {tip.title}
                              </p>
                              <p
                                className={cn(
                                  'mt-1 text-xs leading-relaxed',
                                  theme === 'light' ? 'text-neutral-600' : 'text-white/70',
                                )}
                              >
                                {tip.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p
                      className={cn(
                        'text-xs leading-relaxed',
                        theme === 'light' ? 'text-neutral-500' : 'text-white/50',
                      )}
                    >
                      <Link to="/quests" className="font-semibold text-anbit-brand hover:underline">
                        Δες διαθέσιμες προσφορές
                      </Link>
                      <span className="mx-1.5 text-anbit-muted">·</span>
                      <Link to="/profile/claimed" className="font-semibold text-anbit-brand hover:underline">
                        Claimed κάρτες
                      </Link>
                    </p>
                  </div>

                  <div className="flex shrink-0 justify-center lg:w-[min(100%,360px)] lg:justify-end">
                    <div
                      className={cn(
                        'w-full max-w-[320px] overflow-hidden rounded-2xl border shadow-xl ring-1',
                        theme === 'light' ? 'border-zinc-200 ring-black/[0.04]' : 'border-white/10 ring-white/5',
                      )}
                    >
                      <div
                        className={cn(
                          'aspect-[4/3] w-full',
                          theme === 'light' ? 'bg-gradient-to-br from-orange-50 to-amber-50' : 'bg-gradient-to-br from-zinc-900 to-black',
                        )}
                      >
                        <img
                          src="/categories/coupons.gif"
                          alt=""
                          className="h-full w-full object-cover"
                          draggable={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
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
          <div
            className="mx-auto w-full max-w-[1180px] space-y-6 px-1 pb-8 pt-2 sm:space-y-8 sm:px-2"
            style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
          >
            <ProfilePersonalInfoSection user={user} isLight={theme === 'light'} />
            <ProfileInsightsSection partnersWithPoints={partnersWithPoints} />
          </div>
        )}

        {activeTabId === 'favorites' && (
          <div
            className="mx-auto w-full max-w-[1180px] space-y-6 px-1 pb-8 pt-2 sm:space-y-8 sm:px-2"
            style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
          >
            {favoritePreviewStores.length === 0 ? (
              <>
                <div className="space-y-4">
                  <h2 className={cn('playpen-sans text-2xl font-bold tracking-tight md:text-3xl', theme === 'light' ? 'text-neutral-900' : 'text-anbit-text')}>
                    Αγαπημένα καταστήματα
                  </h2>
                  <p className={cn('max-w-2xl text-base leading-relaxed md:text-lg', theme === 'light' ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]')}>
                    Όλα τα αγαπημένα σου εστιατόρια και καταστήματα θα εμφανίζονται εδώ. Μπορείς να τα προσθέσεις
                    στην λίστα των αγαπημένων σου απλά πατώντας το εικονίδιο με την καρδιά.
                  </p>
                </div>
                <div
                  className="flex w-full flex-col items-center justify-center"
                  data-purpose="favorites-banner"
                  id="favorites-hero"
                >
                  <div
                    className="flex w-full max-w-[min(100%,640px)] shrink-0 justify-center"
                    data-purpose="favourite-visual"
                  >
                    <img
                      src="/fav.gif"
                      alt=""
                      className="h-auto max-h-[min(52vh,420px)] w-full object-contain"
                      draggable={false}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2 sm:space-y-3">
                  <h3
                    className={cn(
                      'playpen-sans min-w-0 text-[24px] font-extrabold leading-tight tracking-tight sm:text-[28px]',
                      theme === 'light' ? 'text-neutral-900' : 'text-anbit-text',
                    )}
                  >
                    Αγαπημένα καταστήματα
                  </h3>
                  <p className={cn('text-sm', theme === 'light' ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]')}>
                    <span className={cn('font-semibold', theme === 'light' ? 'text-neutral-900' : 'text-anbit-text')}>Όλα</span>
                    <span className="mx-1.5 text-anbit-muted">·</span>
                    {favoritePreviewStores.length}{' '}
                    {favoritePreviewStores.length === 1 ? 'κατάστημα' : 'καταστήματα'} — ίδια εμφάνιση με το δίκτυο.
                  </p>
                </div>
                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {favoritePreviewStores.map((partner) => (
                    <div key={partner.id} className="min-w-0">
                      <NetworkStoreCard
                        partner={partner}
                        xp={storeXP[partner.id] ?? 0}
                        onOpen={() => navigate(`/store-profile/${partner.id}`, { state: { partner } })}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
