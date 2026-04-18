import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Facebook,
  Linkedin,
  Search,
  Sparkles,
  Star,
  TicketPercent,
  X,
} from 'lucide-react';
import { UserData, Partner } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { cn } from '@/lib/utils';
import { IconTabs3D, type ProfileTabItem } from './ui/3d-icon-tabs-1';
import { ProfileInsightsSection } from './profile/ProfileInsightsSection';
import { ProfilePersonalInfoSection } from './profile/ProfilePersonalInfoSection';
import { OfferFilterSelect } from './ui/offer-filter-select';
import { GREEK_OFFERS } from '../data/greekOffers';
import {
  loadFavoriteMerchantIds,
  subscribeFavoriteMerchantsChanged,
  toggleFavoriteMerchantId,
  useFavoriteMerchant,
} from '@/lib/favoriteStores';
import { partnerToNetworkDisplayQuest } from '@/lib/partnerNetworkQuest';
import { QuestOfferCard } from './QuestOfferCard';
import { Button } from './ui/button';
import { api, type ApiOrderListItem } from '../services/api';

type OrderHistoryLineItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice?: number;
  unitXp?: number;
};

type OrderHistoryEntry = {
  id: string;
  storeName: string;
  storeImage: string;
  dateTime: string;
  /** ISO 8601 για φίλτρα ημερομηνίας στο modal */
  createdAtIso: string;
  status: 'completed' | 'cancelled';
  price: string;
  itemsSummary: string;
  xp?: number;
  lineItems: OrderHistoryLineItem[];
  xpEarned: number;
  /** XP που ξοδεύτηκαν (αν το API τα στέλνει· αλλιώς 0). */
  xpSpent: number;
  category: 'supermarket' | 'food';
};

type OrderHistoryStoreGroup = {
  merchantId: string;
  partner?: Partner;
  storeName: string;
  storeImage: string;
  orders: OrderHistoryEntry[];
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

const ORDER_HISTORY_STORE_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&q=80&w=800&h=400';

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

function resolvePartnerByMerchantId(merchantId: string, partners: Partner[]): Partner | undefined {
  const mid = String(merchantId ?? '').trim().toLowerCase();
  if (!mid) return undefined;
  return partners.find((p) => p.id.trim().toLowerCase() === mid);
}

function mapApiOrderStatusToHistory(status: number | string): OrderHistoryEntry['status'] {
  const s = String(status ?? '').toLowerCase();
  if (s === '3' || s.includes('rejected') || s.includes('cancel')) return 'cancelled';
  return 'completed';
}

function historyCategoryFromPartner(partner: Partner | undefined): OrderHistoryEntry['category'] {
  if (!partner) return 'food';
  const n = partner.name.toLowerCase();
  if (n.includes('market') || n.includes('μάρκετ') || n.includes('μαρκετ')) return 'supermarket';
  return 'food';
}

function startOfDayMs(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function endOfDayMs(d: Date): number {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.getTime();
}

function parseDateInputYmd(s: string): Date | null {
  const t = s.trim();
  if (!t) return null;
  const parts = t.split('-').map((p) => Number(p));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
}

function sumLineItemsXp(items: { quantity: number; unitXp?: number }[]): number {
  return items.reduce((s, i) => s + Number(i.quantity ?? 0) * Number(i.unitXp ?? 0), 0);
}

function productLabelFromMenu(productId: string, partner: Partner | undefined): string {
  const id = productId.trim();
  if (!id) return '—';
  const menu = partner?.menu;
  if (!menu?.length) return id;
  const p = menu.find((m) => m.id.trim().toLowerCase() === id.toLowerCase());
  return p?.name?.trim() || id;
}

function formatOrderHistoryDateTime(iso: string, lang: 'el' | 'en'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(lang === 'el' ? 'el-GR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildOrderItemsSummary(
  items: { productId?: string; quantity?: number }[],
  t: (k: string) => string,
): string {
  const lines = Array.isArray(items) ? items.length : 0;
  const pieces = Array.isArray(items) ? items.reduce((s, i) => s + Number(i.quantity ?? 0), 0) : 0;
  return t('orderHistoryItemsSummary').replace('{{lines}}', String(lines)).replace('{{pieces}}', String(pieces));
}

function normalizeApiOrderRow(raw: unknown): ApiOrderListItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = String(r.id ?? r.Id ?? '').trim();
  if (!id) return null;
  const itemsRaw = r.items ?? r.Items;
  const items = Array.isArray(itemsRaw)
    ? itemsRaw.map((it) => {
        const x = it as Record<string, unknown>;
        return {
          productId: String(x.productId ?? x.ProductId ?? ''),
          quantity: Number(x.quantity ?? x.Quantity ?? 0),
          unitPrice: x.unitPrice != null || x.UnitPrice != null ? Number(x.unitPrice ?? x.UnitPrice) : undefined,
          unitXp: x.unitXp != null || x.UnitXp != null ? Number(x.unitXp ?? x.UnitXp) : undefined,
        };
      })
    : [];
  const spentRaw =
    r.spentXp ?? r.SpentXp ?? r.xpSpent ?? r.XpSpent ?? r.redeemedXp ?? r.RedeemedXp ?? r.usedXp ?? r.UsedXp;
  const spentNum = spentRaw != null && spentRaw !== '' ? Number(spentRaw) : NaN;
  const spentXp = Number.isFinite(spentNum) ? Math.max(0, spentNum) : undefined;

  return {
    id,
    userId: String(r.userId ?? r.UserId ?? '').trim(),
    merchantId: String(r.merchantId ?? r.MerchantId ?? '').trim(),
    tableNumber: Number(r.tableNumber ?? r.TableNumber ?? 0),
    items,
    totalPrice: Number(r.totalPrice ?? r.TotalPrice ?? 0),
    totalXp: Number(r.totalXp ?? r.TotalXp ?? 0),
    spentXp,
    status: (r.status ?? r.Status ?? 0) as number | string,
    createdAt: String(r.createdAt ?? r.CreatedAt ?? ''),
    updatedAt:
      r.updatedAt != null
        ? String(r.updatedAt)
        : r.UpdatedAt != null
          ? String(r.UpdatedAt)
          : undefined,
  };
}

function mapApiOrderToHistoryEntry(
  order: ApiOrderListItem,
  partners: Partner[],
  lang: 'el' | 'en',
  t: (k: string) => string,
): OrderHistoryEntry {
  const partner = resolvePartnerByMerchantId(order.merchantId, partners);
  const storeName = partner?.name?.trim() || `Κατάστημα ${String(order.merchantId).slice(0, 8)}`;
  const xpEarned = Number(order.totalXp ?? 0);
  const xpSpent = Math.max(0, Number(order.spentXp ?? 0));
  const lineItems: OrderHistoryLineItem[] = (order.items ?? []).map((it) => ({
    productId: it.productId,
    quantity: Number(it.quantity ?? 0),
    unitPrice: it.unitPrice,
    unitXp: it.unitXp,
    productName: productLabelFromMenu(it.productId, partner),
  }));
  return {
    id: order.id,
    storeName,
    storeImage: partner?.image || ORDER_HISTORY_STORE_FALLBACK_IMAGE,
    dateTime: formatOrderHistoryDateTime(order.createdAt, lang),
    createdAtIso: order.createdAt,
    status: mapApiOrderStatusToHistory(order.status),
    price: `${Number(order.totalPrice ?? 0).toFixed(2)} €`,
    itemsSummary: buildOrderItemsSummary(order.items ?? [], t),
    xp: xpEarned > 0 ? xpEarned : undefined,
    lineItems,
    xpEarned,
    xpSpent,
    category: historyCategoryFromPartner(partner),
  };
}

function OrderHistoryStoreCard({
  group,
  theme,
  onOpen,
  t,
}: {
  group: OrderHistoryStoreGroup;
  theme: 'light' | 'dark';
  onOpen: () => void;
  t: (k: string) => string;
}) {
  const isLight = theme === 'light';
  const count = group.orders.length;
  const countLabel = t('orderHistoryStoreOrderCount').replace('{{count}}', String(count));
  const last = group.orders[0]?.dateTime ?? '—';

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'flex w-full min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-colors sm:gap-4 sm:p-4',
        isLight
          ? 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
          : 'border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] hover:border-anbit-brand/30',
      )}
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg sm:h-16 sm:w-16">
        <img src={group.storeImage} alt="" className="h-full w-full object-cover" draggable={false} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-semibold sm:text-base', isLight ? 'text-neutral-900' : 'text-anbit-text')}>
          {group.storeName}
        </p>
        <p className={cn('mt-0.5 text-xs sm:text-sm', isLight ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]')}>
          {countLabel}
          <span className="mx-1">·</span>
          {last}
        </p>
      </div>
      <ChevronRight
        className={cn('h-5 w-5 shrink-0', isLight ? 'text-zinc-400' : 'text-[color:var(--anbit-muted)]')}
        aria-hidden
      />
    </button>
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
  const { t, language } = useLanguage();
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
  const [orderHistoryRaw, setOrderHistoryRaw] = useState<ApiOrderListItem[]>([]);
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);
  const [orderHistoryError, setOrderHistoryError] = useState<string | null>(null);
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

  const orderHistoryEntries = useMemo(
    () =>
      orderHistoryRaw.map((o) =>
        mapApiOrderToHistoryEntry(o, partners, language === 'en' ? 'en' : 'el', t),
      ),
    [orderHistoryRaw, partners, language, t],
  );

  const orderHistoryCategoryOptions = useMemo(() => {
    const base: { value: string; label: string }[] = [
      { value: 'all', label: 'Όλες οι κατηγορίες' },
      { value: 'supermarket', label: 'Σούπερ μάρκετ' },
      { value: 'food', label: 'Φαγητό & delivery' },
    ];
    const seen = new Set(base.map((b) => b.value));
    for (const o of orderHistoryEntries) {
      const p = resolvePartnerForOrderHistory(o.storeName, partners);
      const cat = p?.category;
      if (cat && !seen.has(cat)) {
        seen.add(cat);
        base.push({ value: cat, label: orderHistoryPartnerCategoryLabel(cat) });
      }
    }
    return base;
  }, [orderHistoryEntries, partners]);

  const orderHistoryStoreGroups = useMemo((): OrderHistoryStoreGroup[] => {
    const byMid = new Map<string, ApiOrderListItem[]>();
    for (const row of orderHistoryRaw) {
      const k = String(row.merchantId ?? '').trim().toLowerCase();
      if (!k) continue;
      const list = byMid.get(k) ?? [];
      list.push(row);
      byMid.set(k, list);
    }
    const lang = language === 'en' ? 'en' : 'el';
    const tuples: { lastAt: string; group: OrderHistoryStoreGroup }[] = [];
    for (const [, rawList] of byMid) {
      rawList.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
      const orders = rawList.map((o) => mapApiOrderToHistoryEntry(o, partners, lang, t));
      const partner = resolvePartnerByMerchantId(rawList[0].merchantId, partners);
      tuples.push({
        lastAt: rawList[0].createdAt,
        group: {
          merchantId: rawList[0].merchantId,
          partner,
          storeName: orders[0]?.storeName ?? '—',
          storeImage: orders[0]?.storeImage ?? ORDER_HISTORY_STORE_FALLBACK_IMAGE,
          orders,
        },
      });
    }
    tuples.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
    return tuples.map((x) => x.group);
  }, [orderHistoryRaw, partners, language, t]);

  const filteredOrderHistoryStores = useMemo(() => {
    let list = [...orderHistoryStoreGroups];
    if (orderHistoryCategoryFilter !== 'all') {
      list = list.filter((g) =>
        g.orders.some((o) => {
          if (orderHistoryCategoryFilter === 'supermarket' || orderHistoryCategoryFilter === 'food') {
            return o.category === orderHistoryCategoryFilter;
          }
          const p = resolvePartnerForOrderHistory(o.storeName, partners);
          return p?.category === orderHistoryCategoryFilter;
        }),
      );
    }
    const q = orderHistoryStoreSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((g) => g.storeName.toLowerCase().includes(q));
    }
    return list;
  }, [orderHistoryStoreGroups, orderHistoryCategoryFilter, orderHistoryStoreSearch, partners]);

  const [orderHistoryModalMerchantId, setOrderHistoryModalMerchantId] = useState<string | null>(null);
  const [orderHistoryModalDateFrom, setOrderHistoryModalDateFrom] = useState('');
  const [orderHistoryModalDateTo, setOrderHistoryModalDateTo] = useState('');
  const [orderHistoryModalExpandedOrderId, setOrderHistoryModalExpandedOrderId] = useState<string | null>(null);

  const orderHistoryModalGroup = useMemo(() => {
    if (!orderHistoryModalMerchantId) return null;
    const mid = orderHistoryModalMerchantId.trim().toLowerCase();
    return orderHistoryStoreGroups.find((g) => g.merchantId.trim().toLowerCase() === mid) ?? null;
  }, [orderHistoryModalMerchantId, orderHistoryStoreGroups]);

  const orderHistoryModalOrdersFiltered = useMemo(() => {
    if (!orderHistoryModalGroup) return [];
    let list = [...orderHistoryModalGroup.orders];
    const fromD = parseDateInputYmd(orderHistoryModalDateFrom);
    const toD = parseDateInputYmd(orderHistoryModalDateTo);
    if (fromD) {
      const lo = startOfDayMs(fromD);
      list = list.filter((o) => new Date(o.createdAtIso).getTime() >= lo);
    }
    if (toD) {
      const hi = endOfDayMs(toD);
      list = list.filter((o) => new Date(o.createdAtIso).getTime() <= hi);
    }
    return list;
  }, [orderHistoryModalGroup, orderHistoryModalDateFrom, orderHistoryModalDateTo]);

  useEffect(() => {
    if (!orderHistoryModalMerchantId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOrderHistoryModalMerchantId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [orderHistoryModalMerchantId]);

  useEffect(() => {
    if (orderHistoryModalMerchantId) return;
    setOrderHistoryModalDateFrom('');
    setOrderHistoryModalDateTo('');
    setOrderHistoryModalExpandedOrderId(null);
  }, [orderHistoryModalMerchantId]);

  useEffect(() => {
    if (!orderHistoryModalExpandedOrderId) return;
    if (!orderHistoryModalOrdersFiltered.some((o) => o.id === orderHistoryModalExpandedOrderId)) {
      setOrderHistoryModalExpandedOrderId(null);
    }
  }, [orderHistoryModalOrdersFiltered, orderHistoryModalExpandedOrderId]);

  useEffect(() => {
    if (!location.pathname.startsWith('/profile/history')) return;
    let cancelled = false;
    setOrderHistoryLoading(true);
    setOrderHistoryError(null);
    void (async () => {
      try {
        const data = await api.getOrders({ limit: 100, offset: 0 });
        if (cancelled) return;
        const uid = String(user.id).toLowerCase();
        const rows = (Array.isArray(data) ? data : [])
          .map(normalizeApiOrderRow)
          .filter((x): x is ApiOrderListItem => x != null);
        const mine = rows
          .filter((o) => String(o.userId ?? '').toLowerCase() === uid)
          .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
        setOrderHistoryRaw(mine);
      } catch {
        if (!cancelled) {
          setOrderHistoryError(t('orderHistoryLoadError'));
          setOrderHistoryRaw([]);
        }
      } finally {
        if (!cancelled) setOrderHistoryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname, user.id, t]);
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
                {t('orderHistoryStoresHint')}
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

            {orderHistoryLoading ? (
              <p
                className={cn(
                  'rounded-xl border px-4 py-6 text-center text-sm',
                  theme === 'light'
                    ? 'border-zinc-200 bg-zinc-50 text-neutral-600'
                    : 'border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] text-[color:var(--anbit-muted)]',
                )}
              >
                {t('orderHistoryLoading')}
              </p>
            ) : null}

            {orderHistoryError && !orderHistoryLoading ? (
              <p
                className={cn(
                  'rounded-xl border px-4 py-4 text-center text-sm',
                  theme === 'light'
                    ? 'border-red-200 bg-red-50 text-red-800'
                    : 'border-red-500/35 bg-red-500/10 text-red-200',
                )}
              >
                {orderHistoryError}
              </p>
            ) : null}

            {!orderHistoryLoading && !orderHistoryError && orderHistoryStoreGroups.length === 0 ? (
              <p
                className={cn(
                  'rounded-xl border px-4 py-10 text-center text-sm',
                  theme === 'light'
                    ? 'border-zinc-200 bg-white text-neutral-600'
                    : 'border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] text-[color:var(--anbit-muted)]',
                )}
              >
                {t('orderHistoryEmpty')}
              </p>
            ) : null}

            {!orderHistoryLoading && orderHistoryStoreGroups.length > 0 ? (
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
              {!orderHistoryError && filteredOrderHistoryStores.length === 0 ? (
                <p
                  className={cn(
                    'col-span-full py-12 text-center text-sm',
                    theme === 'light' ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]',
                  )}
                >
                  Δεν βρέθηκαν καταστήματα με αυτά τα κριτήρια. Δοκίμασε άλλη κατηγορία ή άλλο όνομα.
                </p>
              ) : null}
              {filteredOrderHistoryStores.map((group) => (
                <OrderHistoryStoreCard
                  key={group.merchantId}
                  group={group}
                  theme={theme === 'light' ? 'light' : 'dark'}
                  t={t}
                  onOpen={() => {
                    setOrderHistoryModalDateFrom('');
                    setOrderHistoryModalDateTo('');
                    setOrderHistoryModalExpandedOrderId(null);
                    setOrderHistoryModalMerchantId(group.merchantId);
                  }}
                />
              ))}
            </div>
            ) : null}

            <AnimatePresence>
              {orderHistoryModalGroup ? (
                <motion.div
                  key={orderHistoryModalGroup.merchantId}
                  role="presentation"
                  className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 font-sans backdrop-blur-sm sm:items-center sm:p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setOrderHistoryModalMerchantId(null)}
                >
                  <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="order-history-store-modal-title"
                    className={cn(
                      'relative flex max-h-[min(92dvh,820px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] shadow-2xl sm:max-h-[min(88dvh,720px)] sm:rounded-2xl',
                    )}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[color:var(--anbit-border)] px-4 pb-3 pt-4 sm:px-5">
                      <div className="min-w-0 pr-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-anbit-muted">
                          {t('orderHistoryModalAllOrders')}
                        </p>
                        <h2
                          id="order-history-store-modal-title"
                          className="playpen-sans mt-0.5 text-xl font-bold leading-tight text-[color:var(--anbit-text)] sm:text-2xl"
                        >
                          {orderHistoryModalGroup.storeName}
                        </h2>
                        <p className="mt-1 text-xs text-anbit-muted">
                          {t('orderHistoryModalOrderCount')
                            .replace('{{shown}}', String(orderHistoryModalOrdersFiltered.length))
                            .replace('{{total}}', String(orderHistoryModalGroup.orders.length))}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOrderHistoryModalMerchantId(null)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--anbit-border)] bg-[color:var(--anbit-input)] text-[color:var(--anbit-text)] transition-colors hover:bg-[color:var(--anbit-border)]/40"
                        aria-label={t('close')}
                      >
                        <X className="h-4 w-4" strokeWidth={2.5} />
                      </button>
                    </div>
                    <div className="shrink-0 space-y-2 border-b border-[color:var(--anbit-border)] px-4 py-3 sm:px-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3">
                        <label className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-[11rem]">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-anbit-muted">
                            {t('orderHistoryFilterDateFrom')}
                          </span>
                          <input
                            type="date"
                            value={orderHistoryModalDateFrom}
                            onChange={(e) => setOrderHistoryModalDateFrom(e.target.value)}
                            className={cn(
                              'h-9 w-full rounded-lg border px-2 text-sm focus:outline-none focus:ring-2',
                              theme === 'light'
                                ? 'border-zinc-200 bg-white text-neutral-900 focus:border-[#0a0a0a]/45 focus:ring-[#0a0a0a]/12'
                                : 'border-anbit-border bg-anbit-card text-anbit-text focus:border-anbit-brand/40 focus:ring-anbit-brand/15',
                            )}
                          />
                        </label>
                        <label className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-[11rem]">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-anbit-muted">
                            {t('orderHistoryFilterDateTo')}
                          </span>
                          <input
                            type="date"
                            value={orderHistoryModalDateTo}
                            onChange={(e) => setOrderHistoryModalDateTo(e.target.value)}
                            className={cn(
                              'h-9 w-full rounded-lg border px-2 text-sm focus:outline-none focus:ring-2',
                              theme === 'light'
                                ? 'border-zinc-200 bg-white text-neutral-900 focus:border-[#0a0a0a]/45 focus:ring-[#0a0a0a]/12'
                                : 'border-anbit-border bg-anbit-card text-anbit-text focus:border-anbit-brand/40 focus:ring-anbit-brand/15',
                            )}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setOrderHistoryModalDateFrom('');
                            setOrderHistoryModalDateTo('');
                          }}
                          className="h-9 shrink-0 rounded-lg border border-[color:var(--anbit-border)] px-3 text-xs font-semibold text-[color:var(--anbit-text)] transition-colors hover:bg-[color:var(--anbit-border)]/25"
                        >
                          {t('orderHistoryFilterDateClear')}
                        </button>
                      </div>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
                      <div className="space-y-3">
                        {orderHistoryModalOrdersFiltered.length === 0 ? (
                          <p
                            className={cn(
                              'py-8 text-center text-sm',
                              theme === 'light' ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]',
                            )}
                          >
                            {t('orderHistoryNoOrdersInRange')}
                          </p>
                        ) : null}
                        {orderHistoryModalOrdersFiltered.map((order) => {
                          const isCancelled = order.status === 'cancelled';
                          const light = theme === 'light';
                          const expanded = orderHistoryModalExpandedOrderId === order.id;
                          const lineXpSum = sumLineItemsXp(order.lineItems);
                          return (
                            <div
                              key={order.id}
                              className={cn(
                                'rounded-xl border',
                                light ? 'border-zinc-200 bg-white' : 'border-[color:var(--anbit-border)] bg-[color:var(--anbit-bg)]',
                              )}
                            >
                              <button
                                type="button"
                                className={cn(
                                  'flex w-full items-start gap-2 rounded-xl p-4 text-left transition-colors',
                                  light ? 'hover:bg-zinc-50' : 'hover:bg-white/5',
                                )}
                                aria-expanded={expanded}
                                onClick={() =>
                                  setOrderHistoryModalExpandedOrderId((prev) => (prev === order.id ? null : order.id))
                                }
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <p
                                      className={cn('text-xs font-medium', light ? 'text-neutral-600' : 'text-anbit-muted')}
                                    >
                                      {order.dateTime}
                                    </p>
                                    <span
                                      className={cn(
                                        'inline-flex shrink-0 items-center justify-center rounded-md px-2 py-0.5 text-base leading-none',
                                        isCancelled
                                          ? light
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-red-500/15 text-red-300'
                                          : light
                                            ? 'bg-emerald-100 text-emerald-900'
                                            : 'bg-emerald-500/15 text-emerald-200',
                                      )}
                                      title={isCancelled ? 'Ακυρώθηκε' : 'Ολοκληρώθηκε'}
                                      aria-label={isCancelled ? 'Ακυρώθηκε' : 'Ολοκληρώθηκε'}
                                    >
                                      {isCancelled ? '❌' : '✅'}
                                    </span>
                                  </div>
                                  <p
                                    className={cn('mt-2 text-lg font-bold', light ? 'text-neutral-900' : 'text-anbit-text')}
                                  >
                                    {order.price}
                                  </p>
                                  <div
                                    className={cn(
                                      'mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs',
                                      light ? 'text-neutral-700' : 'text-[color:var(--anbit-muted)]',
                                    )}
                                  >
                                    <span>
                                      {t('orderHistoryXpEarned')}:{' '}
                                      <span className="font-semibold text-anbit-brand">+{order.xpEarned}</span>
                                    </span>
                                    <span>
                                      {t('orderHistoryXpSpent')}:{' '}
                                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                                        −{order.xpSpent}
                                      </span>
                                    </span>
                                    {lineXpSum > 0 ? (
                                      <span>
                                        {t('orderHistoryXpFromLines')}:{' '}
                                        <span className="font-semibold text-[color:var(--anbit-text)]">{lineXpSum}</span>
                                      </span>
                                    ) : null}
                                  </div>
                                  <p
                                    className={cn(
                                      'mt-2 text-xs leading-relaxed sm:text-sm',
                                      light ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]',
                                    )}
                                  >
                                    {order.itemsSummary}
                                  </p>
                                  <p className="mt-2 text-[11px] font-medium text-anbit-brand">
                                    {expanded ? t('orderHistoryCollapseOrder') : t('orderHistoryExpandOrder')}
                                  </p>
                                </div>
                                <ChevronDown
                                  className={cn(
                                    'mt-1 h-5 w-5 shrink-0 transition-transform text-anbit-muted',
                                    expanded && 'rotate-180',
                                  )}
                                  aria-hidden
                                />
                              </button>
                              {expanded ? (
                                <div
                                  className={cn(
                                    'border-t px-4 pb-4 pt-3',
                                    light ? 'border-zinc-200 bg-zinc-50/80' : 'border-[color:var(--anbit-border)] bg-black/20',
                                  )}
                                >
                                  <p
                                    className={cn(
                                      'mb-2 text-[11px] font-bold uppercase tracking-wide',
                                      light ? 'text-neutral-500' : 'text-anbit-muted',
                                    )}
                                  >
                                    {t('orderHistoryOrderItems')}
                                  </p>
                                  <ul className="space-y-2">
                                    {order.lineItems.length === 0 ? (
                                      <li className="text-xs text-anbit-muted">—</li>
                                    ) : (
                                      order.lineItems.map((line, idx) => {
                                        const lineXp = Number(line.quantity ?? 0) * Number(line.unitXp ?? 0);
                                        const hasPrice = line.unitPrice != null && Number.isFinite(line.unitPrice);
                                        return (
                                          <li
                                            key={`${order.id}-line-${idx}`}
                                            className={cn(
                                              'flex flex-col gap-0.5 rounded-lg border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between',
                                              light ? 'border-zinc-200 bg-white' : 'border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)]',
                                            )}
                                          >
                                            <span className={cn('font-medium', light ? 'text-neutral-900' : 'text-anbit-text')}>
                                              {line.productName}
                                              <span className="ml-1 font-normal text-anbit-muted">×{line.quantity}</span>
                                            </span>
                                            <span className="flex flex-wrap gap-x-3 text-xs text-anbit-muted">
                                              {hasPrice ? (
                                                <span>
                                                  {Number(line.unitPrice).toFixed(2)} €{' '}
                                                  <span className="text-[10px] opacity-80">/ τεμ.</span>
                                                </span>
                                              ) : null}
                                              {lineXp > 0 ? <span className="text-anbit-brand">+{lineXp} XP</span> : null}
                                            </span>
                                          </li>
                                        );
                                      })
                                    )}
                                  </ul>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {orderHistoryModalGroup.partner ? (
                      <div className="shrink-0 border-t border-[color:var(--anbit-border)] px-4 py-3 sm:px-5">
                        <button
                          type="button"
                          onClick={() => {
                            const p = orderHistoryModalGroup.partner!;
                            setOrderHistoryModalMerchantId(null);
                            navigate(`/store-profile/${p.id}`, { state: { partner: p } });
                          }}
                          className="w-full rounded-lg bg-anbit-brand py-2.5 text-sm font-semibold text-anbit-brand-foreground transition-colors hover:bg-anbit-brand-hover"
                        >
                          Προφίλ καταστήματος
                        </button>
                      </div>
                    ) : null}
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
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
                <div className="mx-auto grid w-full max-w-[1600px] grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                  {favoritePreviewStores.map((partner, index) => (
                    <div key={partner.id} className="min-h-0 min-w-0">
                      <QuestOfferCard
                        quest={partnerToNetworkDisplayQuest(partner, storeXP[partner.id] ?? 0)}
                        index={index}
                        t={t}
                        questsPage
                        partner={partner}
                        cardClassName={theme === 'light' ? 'bg-white' : 'bg-[color:var(--anbit-card)]'}
                        mutedTextClassName={
                          theme === 'light' ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]'
                        }
                        className="h-full w-full"
                        networkStoreCard
                        onNetworkStoreOpen={() => navigate(`/store-profile/${partner.id}`, { state: { partner } })}
                        isFavorite={favoriteMerchantIds.has(partner.id)}
                        onFavoriteToggle={() => toggleFavoriteMerchantId(partner.id)}
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
