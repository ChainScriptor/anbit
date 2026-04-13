
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Quest, Partner } from '../types';
import { containerVariants, itemVariants } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { OfferCarousel, offerCarouselNavButtonClass } from './ui/offer-carousel';
import { OfferFilterSelect } from './ui/offer-filter-select';
import { GREEK_OFFERS } from '../data/greekOffers';
import { cn } from '@/lib/utils';
import {
  loadFavoriteMerchantIds,
  subscribeFavoriteMerchantsChanged,
  toggleFavoriteMerchantId,
} from '@/lib/favoriteStores';
import { QuickCategories } from './QuickCategories';
import { QuickCategoriesWaveBackdrop } from './QuickCategoriesWaveBackdrop';
import { QuestOfferCard } from './QuestOfferCard';
import {
  QuickCategoryStoresModal,
  buildQuickCategoryStoreEntries,
} from './QuickCategoryStoresModal';
import {
  PLACEHOLDER_CATEGORY_IDS,
  buildPartnerCategoryTabsForBundle,
  categoryStripBundleFromQuickId,
  partnerCategoryTabImageSrc as stripCategoryTabImageSrc,
} from './questCategoryStrip';

const questMuted = 'text-[color:var(--anbit-muted)]';

/** Φόντο καρτών deals + προσφορών quest μόνο στη σελίδα /quests — ευθυγραμμισμένο με `--anbit-card` (πιο ήρεμο από #131313) */
const QUESTS_OFFER_CARD_BG = 'bg-[color:var(--anbit-card)]';
/** Light mode /quests: λευκή κάρτα, μαύρο κείμενο στο σώμα */
const QUESTS_OFFER_CARD_BG_LIGHT = 'bg-white';
/** Chips καταστημάτων — dark */
const QUESTS_MERCHANT_CHIP_BG = 'bg-[#1e1e1e]';
/** Chips καταστημάτων — light */
const QUESTS_MERCHANT_CHIP_BG_LIGHT = 'bg-white';

/** Strip «Αναζήτηση ανά κατηγορία»: βελάκια ορατά στο mobile (το κοινό `offerCarouselNavButtonClass` είναι `hidden` κάτω από `sm`). */
const partnerCategoryNavButtonClass =
  'absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-anbit-border bg-anbit-card/90 text-anbit-text shadow-sm backdrop-blur-sm transition-colors transition-opacity hover:border-anbit-brand/25 hover:bg-anbit-brand/[0.08] sm:h-10 sm:w-10 opacity-90 md:opacity-0 md:group-hover:opacity-100';

function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const p = path.startsWith('/') ? path.slice(1) : path;
  return base.endsWith('/') ? `${base}${p}` : `${base}/${p}`;
}

const QuestQuickMerchantIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg
    className={cn('text-anbit-brand', className)}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 10.5L12 3L21 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 9.5V20H18V9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 20V14H14V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.5 12.5H8.51M15.5 12.5H15.51" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

type FilterValue = '' | 'highest-xp' | 'expiring-soon' | 'favorite-stores';

function resolveQuestPartner(quest: Quest, partners: Partner[]): Partner | undefined {
  if (quest.partnerId) return partners.find((p) => p.id === quest.partnerId);
  if (quest.storeName) return partners.find((p) => p.name === quest.storeName);
  return undefined;
}

function questMatchesPartnerCategory(quest: Quest, partners: Partner[], categoryId: string): boolean {
  if (categoryId === 'All') return true;
  if (PLACEHOLDER_CATEGORY_IDS.has(categoryId)) return true;
  const p = resolveQuestPartner(quest, partners);
  if (!p) return false;
  return p.category === categoryId;
}

/** Ίδιες γρήγορες κατηγορίες με το NetworkPage· `categoryId` = id καρτέλας Network (partner.category). */
const QUEST_QUICK_CATEGORIES: { id: string; label: string; subtitle: string; categoryId: string; image: string }[] = [
  {
    id: 'q-restaurants',
    label: 'Εστιατόρια',
    subtitle: 'Ξεκλειδώστε VIP προνόμια σε κάθε σας γεύμα.',
    categoryId: 'street_food',
    image: publicUrl('categories/restaurant.gif'),
  },
  {
    id: 'q-shopping',
    label: 'Ψώνια',
    subtitle: 'Καθημερινές αγορές με το πλεονέκτημα της Anbit.',
    categoryId: 'sandwiches',
    image: publicUrl('categories/shop.gif'),
  },
  {
    id: 'q-market',
    label: 'Διαμονή',
    subtitle: 'Exclusive rates και προνόμια για VIP αποδράσεις.',
    categoryId: 'All',
    image: publicUrl('categories/airbnb.gif'),
  },
  {
    id: 'q-health',
    label: 'Υγεία & Ευεξία',
    subtitle: 'Επενδύστε στην ευεξία με κορυφαίες ανταμοιβές.',
    categoryId: 'healthy',
    image: publicUrl('categories/gym.gif'),
  },
  {
    id: 'q-beauty',
    label: 'Ομορφιά',
    subtitle: 'Premium περιποίηση με exclusive Noir προσφορές.',
    categoryId: 'sweets',
    image: publicUrl('categories/beauty.gif'),
  },
  {
    id: 'q-drinks',
    label: 'Ποτά',
    subtitle: 'High-stakes γεύσεις με τα προνόμια του νικητή.',
    categoryId: 'bar',
    image: publicUrl('categories/drinks.gif'),
  },
  {
    id: 'q-pets',
    label: 'Κατοικίδια',
    subtitle: 'Ανταμοιβές που αξίζουν οι πιο πιστοί σας φίλοι.',
    categoryId: 'All',
    image: publicUrl('categories/pets.gif'),
  },
  {
    id: 'q-electronics',
    label: 'Ηλεκτρονικά',
    subtitle: 'Tech gadgets επόμενης γενιάς με προνόμια μέλους.',
    categoryId: 'All',
    image: publicUrl('categories/electronics.gif'),
  },
  {
    id: 'q-baby',
    label: 'Παιδικά',
    subtitle: 'Ο κόσμος των παιδιών με τις καλύτερες ανταμοιβές.',
    categoryId: 'All',
    image: publicUrl('categories/baby.gif'),
  },
  {
    id: 'q-home',
    label: 'Σπίτι & DIY',
    subtitle: 'Design και εργαλεία με πρόσβαση σε exclusive deals.',
    categoryId: 'All',
    image: publicUrl('categories/home.gif'),
  },
  {
    id: 'q-flowers',
    label: 'Ανθοπωλεία',
    subtitle: 'Η κομψότητα της φύσης με ειδικά προνόμια Anbit.',
    categoryId: 'All',
    image: publicUrl('categories/flowers.gif'),
  },
  {
    id: 'q-hobbies',
    label: 'Χόμπι & Αθλητισμός',
    subtitle: 'Κορυφαίος εξοπλισμός με το πλεονέκτημα του κέρδους.',
    categoryId: 'All',
    image: publicUrl('categories/hobbie.gif'),
  },
  {
    id: 'q-clothes',
    label: 'Ένδυση',
    subtitle: 'Το απόλυτο στυλ που ανταμείβει κάθε σας επιλογή.',
    categoryId: 'All',
    image: publicUrl('categories/clothes.gif'),
  },
  {
    id: 'q-gifts',
    label: 'Δώρα',
    subtitle: 'Επιλεγμένα δώρα με το "Jackpot" των προνομίων μας.',
    categoryId: 'All',
    image: publicUrl('categories/gifts.gif'),
  },
];

/** Προεπιλογή στο /quests: γρήγορη κάρτα + strip φαγητού (`food` bundle). */
const DEFAULT_QUESTS_QUICK_ID = 'q-restaurants';

function scrollQuestQuickStrip(el: HTMLDivElement | null, dir: 'left' | 'right') {
  if (!el) return;
  const step = el.clientWidth * 0.8;
  el.scrollTo({ left: dir === 'right' ? el.scrollLeft + step : el.scrollLeft - step, behavior: 'smooth' });
}

function scrollPartnerCategoryStrip(el: HTMLDivElement | null, dir: 'left' | 'right') {
  if (!el) return;
  const step = el.clientWidth * 0.8;
  el.scrollTo({ left: dir === 'right' ? el.scrollLeft + step : el.scrollLeft - step, behavior: 'smooth' });
}

/** Σταθερό κλειδί ομάδας merchant (ίδιο με το grouping των προσφορών). */
function merchantGroupKey(quest: Quest, partners: Partner[]): string {
  const p = resolveQuestPartner(quest, partners);
  if (p) return p.id;
  return `__name:${quest.storeName ?? quest.id}`;
}

function groupKeyFromSection(group: {
  partner?: Partner;
  representative: Quest;
}): string {
  return group.partner?.id ?? `__name:${group.representative.storeName ?? group.representative.id}`;
}

function formatDeliveryLabel(partner?: Partner): string {
  const raw = partner?.deliveryTime;
  if (!raw || raw === '—') return '20-30 λεπτά';
  const cleaned = raw.replace(/'/g, '').replace(/\s*-\s*/g, '-');
  return `${cleaned} λεπτά`;
}

function formatFeeLabel(partner?: Partner): string {
  const m = partner?.minOrder;
  if (!m || m === '—') return '0,00 €';
  return m.includes('€') ? m.replace('€', ' €').trim() : `${m} €`;
}

function QuestMerchantBanner({
  partner,
  representativeQuest,
  quests,
  selectable = false,
  selected = false,
  onSelect,
  favoriteMerchantId,
  isFavorite,
  onToggleFavorite,
}: {
  partner?: Partner;
  representativeQuest: Quest;
  quests: Quest[];
  /** Στη γραμμή επιλογής: κλικ φιλτράρει, χωρίς πλοήγηση στο κατάστημα. */
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  /** Κλειδί ίδιο με `groupKeyFromSection` / `merchantGroupKey` για localStorage αγαπημένων. */
  favoriteMerchantId: string;
  isFavorite: boolean;
  onToggleFavorite: (merchantKey: string) => void;
}) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const navigate = useNavigate();
  const name = partner?.name ?? representativeQuest.storeName ?? 'Merchant';
  const img = partner?.image ?? representativeQuest.storeImage ?? '';
  const rating = partner?.rating ?? 9.2;
  const maxXp = Math.max(...quests.map((q) => q.reward), 0);
  const profilePartnerId =
    partner?.id ??
    representativeQuest.partnerId ??
    quests.find((q) => q.partnerId)?.partnerId;

  const goStore = () => {
    if (partner) {
      navigate(`/store-profile/${partner.id}`, { state: { partner } });
      return;
    }
    if (profilePartnerId) navigate(`/store-profile/${profilePartnerId}`);
  };

  const handleCardActivate = () => {
    if (selectable && onSelect) {
      onSelect();
      return;
    }
    goStore();
  };

  const isInteractive = selectable || !!profilePartnerId;

  return (
    <div
      className={cn(
        'group relative inline-flex max-w-[min(100%,17rem)] shrink-0 items-stretch overflow-hidden rounded-lg border shadow-sm transition-all duration-300',
        isLight ? QUESTS_MERCHANT_CHIP_BG_LIGHT : QUESTS_MERCHANT_CHIP_BG,
        isLight ? 'hover:bg-zinc-50' : 'hover:bg-[#262626]',
        selected
          ? isLight
            ? 'border-[#0a0a0a] ring-1 ring-[#0a0a0a]/20'
            : 'border-anbit-brand/50 ring-1 ring-anbit-brand/20'
          : isLight
            ? 'border-zinc-200 hover:border-zinc-300'
            : 'border-white/[0.08] hover:border-white/12',
        isInteractive && 'cursor-pointer',
      )}
      onClick={handleCardActivate}
      onKeyDown={(e) => {
        if (!isInteractive) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardActivate();
        }
      }}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden">
        {img ? (
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
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
          'min-w-0 flex-1 py-2.5 pl-2.5 pr-9',
          isLight ? 'text-neutral-900' : 'text-[#e5e5e5]',
        )}
      >
        <div className="flex items-center gap-1.5">
          <h2
            className={cn(
              'truncate text-sm font-semibold leading-tight tracking-tight',
              isLight ? 'text-neutral-900' : 'text-white',
            )}
          >
            {name}
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
        </p>
        <div className="mt-1 flex min-w-0 items-center justify-between gap-2 pr-0">
          <span
            className={cn(
              'truncate text-sm font-bold leading-none',
              isLight ? 'text-neutral-900' : 'text-white',
            )}
          >
            {maxXp} XP
          </span>
          {profilePartnerId ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (partner) {
                  navigate(`/store-profile/${partner.id}`, { state: { partner } });
                } else {
                  navigate(`/store-profile/${profilePartnerId}`);
                }
              }}
              className={cn(
                'shrink-0 text-[10px] font-bold tracking-wide underline-offset-2 transition-colors hover:underline',
                isLight
                  ? 'text-neutral-600 hover:text-[#0a0a0a]'
                  : 'text-[#ababab] hover:text-anbit-brand',
              )}
            >
              Προφίλ
            </button>
          ) : null}
        </div>
      </div>
      <div className="absolute right-1 top-1 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(favoriteMerchantId);
          }}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-colors duration-300',
            isLight
              ? cn(
                  'border border-zinc-200 bg-zinc-100 text-neutral-600 hover:bg-zinc-200',
                  isFavorite && 'border-[#0a0a0a] bg-[#0a0a0a] text-white hover:bg-[#171717]',
                )
              : cn(
                  'bg-black/25 text-white/90 hover:bg-anbit-brand/35',
                  isFavorite && 'bg-anbit-brand/85',
                ),
          )}
          aria-label={isFavorite ? 'Αφαίρεση από αγαπημένα' : 'Αγαπημένα'}
        >
          <span
            className="material-symbols-outlined text-[16px]"
            style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            favorite
          </span>
        </button>
      </div>
    </div>
  );
}

function MerchantOffersRow({
  quests,
  t,
  offerCardClassName,
  mutedTextClassName = questMuted,
  questsPage = true,
}: {
  quests: Quest[];
  t: (key: string) => string;
  offerCardClassName?: string;
  mutedTextClassName?: string;
  questsPage?: boolean;
}) {
  const { theme } = useTheme();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const navLight =
    theme === 'light' ? 'border-zinc-200 bg-white/95 text-neutral-900 hover:border-[#0a0a0a]/25 hover:bg-[#0a0a0a]/[0.06]' : '';

  const scrollOffers = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.min(el.clientWidth * 0.85, 360);
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  return (
    <div className="min-w-0 w-full">
      <div className="group relative w-full min-w-0">
        <button
          type="button"
          onClick={() => scrollOffers('left')}
          className={cn(offerCarouselNavButtonClass, navLight, 'left-0')}
          aria-label="Προηγούμενες προσφορές"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div
          ref={scrollRef}
          className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {quests.map((quest, index) => (
            <div
              key={quest.id}
              className="w-[min(100vw-2.5rem,280px)] shrink-0 snap-start sm:w-[300px] md:w-[min(22rem,85vw)]"
            >
              <QuestOfferCard
                quest={quest}
                index={index}
                t={t}
                mutedTextClassName={mutedTextClassName}
                cardClassName={offerCardClassName}
                questsPage={questsPage}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => scrollOffers('right')}
          className={cn(offerCarouselNavButtonClass, navLight, 'right-0')}
          aria-label="Επόμενες προσφορές"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

type MerchantSectionGroup = {
  partner?: Partner;
  quests: Quest[];
  representative: Quest;
};

/** Ίδιο οπτικό κέλυφος με το QuestMerchantBanner, μόνο για «Όλα» στη γραμμή scroll. */
function AllMerchantsStripCard({
  selected,
  onSelect,
  totalOffers,
}: {
  selected: boolean;
  onSelect: () => void;
  totalOffers: number;
}) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        'group relative inline-flex max-w-[min(100%,17rem)] shrink-0 cursor-pointer items-stretch overflow-hidden rounded-lg border shadow-sm transition-all duration-300',
        isLight ? QUESTS_MERCHANT_CHIP_BG_LIGHT : QUESTS_MERCHANT_CHIP_BG,
        isLight ? 'hover:bg-zinc-50' : 'hover:bg-[#262626]',
        selected
          ? isLight
            ? 'border-[#0a0a0a] ring-1 ring-[#0a0a0a]/20'
            : 'border-anbit-brand/50 ring-1 ring-anbit-brand/20'
          : isLight
            ? 'border-zinc-200 hover:border-zinc-300'
            : 'border-white/[0.08] hover:border-white/12',
      )}
      style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
    >
      <div
        className={cn(
          'relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden',
          isLight ? 'bg-zinc-100' : 'bg-[#1f1f1f]',
        )}
      >
        <span
          className={cn(
            'text-[10px] font-semibold uppercase tracking-wide',
            isLight ? 'text-neutral-800' : 'text-white',
          )}
        >
          Όλα
        </span>
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-r to-transparent',
            isLight ? 'from-black/5' : 'from-black/25',
          )}
        />
      </div>
      <div
        className={cn(
          'min-w-0 flex-1 py-2.5 pl-2.5 pr-3',
          isLight ? 'text-neutral-900' : 'text-[#e5e5e5]',
        )}
      >
        <div className="flex items-center gap-1.5">
          <h2
            className={cn(
              'truncate text-sm font-semibold leading-tight tracking-tight',
              isLight ? 'text-neutral-900' : 'text-white',
            )}
          >
            Όλα τα καταστήματα
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
          Προβολή όλων των προσφορών δικτύου
        </p>
        <p
          className={cn(
            'mt-1 text-sm font-bold leading-none',
            isLight ? 'text-neutral-900' : 'text-white',
          )}
        >
          {totalOffers} {totalOffers === 1 ? 'προσφορά' : 'προσφορές'}
        </p>
      </div>
    </div>
  );
}

function QuestsMerchantStrip({
  sections,
  selectedKey,
  onSelect,
  favoriteMerchantIds,
  onToggleFavoriteMerchant,
}: {
  sections: MerchantSectionGroup[];
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  favoriteMerchantIds: Set<string>;
  onToggleFavoriteMerchant: (merchantKey: string) => void;
}) {
  const { theme } = useTheme();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollStrip = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  const totalOffers = sections.reduce((n, g) => n + g.quests.length, 0);
  const navLight =
    theme === 'light' ? 'border-zinc-200 bg-white/95 text-neutral-900 hover:border-[#0a0a0a]/25 hover:bg-[#0a0a0a]/[0.06]' : '';

  return (
    <div className="min-w-0 space-y-4">
      <h2
        className={cn(
          'playpen-sans min-w-0 text-[30px] font-bold leading-tight tracking-tight sm:text-[32px]',
          theme === 'light' ? 'text-neutral-900' : 'text-anbit-text',
        )}
      >
        Καταστήματα
      </h2>
      <div className="group relative w-full min-w-0">
        <button
          type="button"
          onClick={() => scrollStrip('left')}
          className={cn(offerCarouselNavButtonClass, navLight, 'left-0')}
          aria-label="Προηγούμενα καταστήματα"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          <div className="shrink-0 snap-start">
            <AllMerchantsStripCard
              selected={selectedKey === null}
              onSelect={() => onSelect(null)}
              totalOffers={totalOffers}
            />
          </div>
          {sections.map((g) => {
            const key = groupKeyFromSection(g);
            return (
              <div key={key} className="shrink-0 snap-start">
                <QuestMerchantBanner
                  partner={g.partner}
                  representativeQuest={g.representative}
                  quests={g.quests}
                  selectable
                  selected={selectedKey === key}
                  onSelect={() => onSelect(key)}
                  favoriteMerchantId={key}
                  isFavorite={favoriteMerchantIds.has(key)}
                  onToggleFavorite={onToggleFavoriteMerchant}
                />
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => scrollStrip('right')}
          className={cn(offerCarouselNavButtonClass, navLight, 'right-0')}
          aria-label="Επόμενα καταστήματα"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

const QuestsPage: React.FC<{ quests: Quest[]; partners: Partner[] }> = ({ quests, partners }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const questsOfferShell =
    theme === 'light' ? QUESTS_OFFER_CARD_BG_LIGHT : QUESTS_OFFER_CARD_BG;
  const navigate = useNavigate();
  const location = useLocation();
  const prevPathnameRef = useRef<string | undefined>(undefined);
  const [offerFilter, setOfferFilter] = useState<FilterValue>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [partnerCategoryFilter, setPartnerCategoryFilter] = useState<string>('All');
  const [quickSelectionId, setQuickSelectionId] = useState<string | null>(DEFAULT_QUESTS_QUICK_ID);
  const [selectedMerchantKey, setSelectedMerchantKey] = useState<string | null>(null);
  const [quickStoresModalQuickId, setQuickStoresModalQuickId] = useState<string | null>(null);
  const [favoriteMerchantIds, setFavoriteMerchantIds] = useState(() => loadFavoriteMerchantIds());
  const [showMobileStickySearch, setShowMobileStickySearch] = useState(false);
  const [isMobileStickySearchFocused, setIsMobileStickySearchFocused] = useState(false);
  const quickCategoriesScrollRef = useRef<HTMLDivElement | null>(null);
  const partnerCategoryScrollRef = useRef<HTMLDivElement | null>(null);
  const offersSearchTriggerRef = useRef<HTMLElement | null>(null);
  const lastMobileScrollYRef = useRef(0);

  useEffect(() => {
    return subscribeFavoriteMerchantsChanged(() => {
      setFavoriteMerchantIds(loadFavoriteMerchantIds());
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobile = () => window.innerWidth < 768;
    const updateStickySearch = () => {
      const currentY = window.scrollY || 0;
      if (!isMobile()) {
        setShowMobileStickySearch(false);
        lastMobileScrollYRef.current = currentY;
        return;
      }
      const triggerEl = offersSearchTriggerRef.current;
      if (!triggerEl) {
        setShowMobileStickySearch(false);
        lastMobileScrollYRef.current = currentY;
        return;
      }
      const prevY = lastMobileScrollYRef.current;
      const isScrollingDown = currentY > prevY + 1;
      const isScrollingUp = currentY < prevY - 1;
      lastMobileScrollYRef.current = currentY;
      const top = triggerEl.getBoundingClientRect().top;
      const inOffersZone = top <= 96;

      // 1) Κρύβεται αν ο χρήστης ανέβει πάνω από τα offers.
      if (!inOffersZone) {
        setShowMobileStickySearch(false);
        return;
      }

      // 2) Μέσα στα offers: εμφανίζεται στο scroll down και μένει visible.
      // 3) Κρύβεται μόνο στο scroll up ώστε να φαίνεται το navbar.
      if (isScrollingDown) {
        setShowMobileStickySearch(true);
      } else if (isScrollingUp && !isMobileStickySearchFocused) {
        setShowMobileStickySearch(false);
      }
    };
    updateStickySearch();
    window.addEventListener('scroll', updateStickySearch, { passive: true });
    window.addEventListener('resize', updateStickySearch);
    return () => {
      window.removeEventListener('scroll', updateStickySearch);
      window.removeEventListener('resize', updateStickySearch);
    };
  }, [isMobileStickySearchFocused]);

  const handleToggleFavoriteMerchant = useCallback((merchantKey: string) => {
    setFavoriteMerchantIds(toggleFavoriteMerchantId(merchantKey));
  }, []);

  useEffect(() => {
    const prev = prevPathnameRef.current;
    prevPathnameRef.current = location.pathname;
    if (location.pathname !== '/quests') return;
    if (prev !== undefined && prev !== '/quests') {
      setQuickSelectionId(DEFAULT_QUESTS_QUICK_ID);
      setPartnerCategoryFilter('All');
    }
  }, [location.pathname]);

  const categoryStripBundle = categoryStripBundleFromQuickId(quickSelectionId);

  const partnerCategoryTabs = useMemo(
    () => buildPartnerCategoryTabsForBundle(categoryStripBundle, publicUrl, t('all')),
    [categoryStripBundle, t],
  );

  useEffect(() => {
    const ids = new Set(partnerCategoryTabs.map((x) => x.id));
    if (!ids.has(partnerCategoryFilter)) {
      setPartnerCategoryFilter('All');
    }
  }, [partnerCategoryTabs, partnerCategoryFilter]);

  const quickQuestCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const qc of QUEST_QUICK_CATEGORIES) {
      const n = quests.filter((q) => questMatchesPartnerCategory(q, partners, qc.categoryId)).length;
      map.set(qc.id, n);
    }
    return map;
  }, [quests, partners]);

  const quickModalCategory = useMemo(
    () =>
      quickStoresModalQuickId
        ? QUEST_QUICK_CATEGORIES.find((q) => q.id === quickStoresModalQuickId)
        : undefined,
    [quickStoresModalQuickId],
  );

  const quickModalStoreEntries = useMemo(() => {
    if (!quickModalCategory) return [];
    return buildQuickCategoryStoreEntries(quests, partners, quickModalCategory.categoryId);
  }, [quickModalCategory, quests, partners]);

  /** Όταν δεν έχει γίνει κλικ σε quick κάρτα, η «επιλεγμένη» quick κάρτα = πρώτη που ταιριάζει στο φίλτρο (για σκεπή + περίγραμμα). */
  const primaryQuickCardIdForFilter = useMemo(() => {
    const hit = QUEST_QUICK_CATEGORIES.find((q) => q.categoryId === partnerCategoryFilter);
    return hit?.id ?? null;
  }, [partnerCategoryFilter]);

  const sortedAndFilteredQuests = useMemo(() => {
    let list = quests.filter((quest) => questMatchesPartnerCategory(quest, partners, partnerCategoryFilter));
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((quest) => {
        const storeName = (quest.storeName ?? '').toLowerCase();
        const title = (quest.title ?? '').toLowerCase();
        const description = (quest.description ?? '').toLowerCase();
        return storeName.includes(q) || title.includes(q) || description.includes(q);
      });
    }
    if (offerFilter === 'favorite-stores') {
      list = list.filter((quest) => favoriteMerchantIds.has(merchantGroupKey(quest, partners)));
    }
    if (offerFilter === 'highest-xp') list.sort((a, b) => b.reward - a.reward);
    else if (offerFilter === 'expiring-soon') {
      list.sort((a, b) => {
        const daysA = parseInt(a.expiresIn, 10) || 999;
        const daysB = parseInt(b.expiresIn, 10) || 999;
        return daysA - daysB;
      });
    }
    return list;
  }, [quests, partners, offerFilter, searchQuery, partnerCategoryFilter, favoriteMerchantIds]);

  useEffect(() => {
    setSelectedMerchantKey(null);
  }, [offerFilter, partnerCategoryFilter]);

  const merchantSections = useMemo(() => {
    const map = new Map<
      string,
      { partner?: Partner; quests: Quest[]; representative: Quest }
    >();
    for (const quest of sortedAndFilteredQuests) {
      const partner = resolveQuestPartner(quest, partners);
      const key = merchantGroupKey(quest, partners);
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { partner, quests: [quest], representative: quest });
      } else {
        existing.quests.push(quest);
      }
    }
    const list = Array.from(map.values());
    const orderIndex = (id: string) => {
      const i = partners.findIndex((p) => p.id === id);
      return i === -1 ? 999 : i;
    };
    list.sort((a, b) => {
      const ia = a.partner ? orderIndex(a.partner.id) : 999;
      const ib = b.partner ? orderIndex(b.partner.id) : 999;
      if (ia !== ib) return ia - ib;
      return (a.partner?.name ?? '').localeCompare(b.partner?.name ?? '');
    });
    return list;
  }, [sortedAndFilteredQuests, partners]);

  useEffect(() => {
    if (selectedMerchantKey == null) return;
    if (!merchantSections.some((g) => groupKeyFromSection(g) === selectedMerchantKey)) {
      setSelectedMerchantKey(null);
    }
  }, [selectedMerchantKey, merchantSections]);

  const visibleMerchantSections = useMemo(() => {
    if (selectedMerchantKey == null) return merchantSections;
    return merchantSections.filter((g) => groupKeyFromSection(g) === selectedMerchantKey);
  }, [merchantSections, selectedMerchantKey]);

  const emptyQuestsMessage = useMemo(() => {
    if (offerFilter === 'favorite-stores') {
      if (favoriteMerchantIds.size === 0) return t('favoriteStoresAddSome');
      return t('favoriteStoresNoOffers');
    }
    return t('questsFilterEmpty');
  }, [offerFilter, favoriteMerchantIds.size, t]);

  const offerFilterOptions = useMemo(
    () => [
      { value: '', label: t('allOffers') },
      { value: 'favorite-stores', label: t('favoriteStoresFilter') },
      { value: 'highest-xp', label: t('highestXP') },
      { value: 'expiring-soon', label: t('expiringSoon') },
    ],
    [t],
  );

  const questsMutedForTheme = theme === 'light' ? 'text-neutral-600' : questMuted;
  const questsNavBtnLight =
    theme === 'light' ? 'border-zinc-200 bg-white/95 text-neutral-900 hover:border-[#0a0a0a]/25 hover:bg-[#0a0a0a]/[0.06]' : '';

  return (
    <motion.div
      className="space-y-8 md:space-y-10 pb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
    >
      <AnimatePresence>
        {showMobileStickySearch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={cn(
              'fixed inset-x-0 top-0 z-[120] px-3 pb-2 pt-[calc(env(safe-area-inset-top)+0.35rem)] shadow-sm md:hidden',
              theme === 'light'
                ? 'bg-white'
                : 'bg-[color:var(--anbit-bg)]',
            )}
          >
            <div className="mx-auto max-w-[1600px]">
              <div
                className={cn(
                  'rounded-xl px-3 py-2 shadow-lg',
                  theme === 'light'
                    ? 'bg-white'
                    : 'bg-[color:var(--anbit-card)]',
                )}
              >
                <label className="relative block">
                  <Search
                    className={cn(
                      'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2',
                      theme === 'light' ? 'text-zinc-400' : 'text-[#9a9a9a]',
                    )}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsMobileStickySearchFocused(true)}
                    onBlur={() => setIsMobileStickySearchFocused(false)}
                    placeholder="Αναζήτηση καταστήματος ή προσφοράς..."
                    className={cn(
                      'h-10 w-full rounded-lg border pl-9 pr-3 text-sm focus:outline-none focus:ring-2',
                      theme === 'light'
                        ? 'border-zinc-200 bg-white text-neutral-900 placeholder:text-zinc-400 focus:border-[#0a0a0a]/45 focus:ring-[#0a0a0a]/12'
                        : 'border-anbit-border bg-anbit-card text-anbit-text placeholder:text-anbit-muted/80 focus:border-anbit-brand/40 focus:ring-anbit-brand/15',
                    )}
                    aria-label="Αναζήτηση καταστήματος ή προσφοράς"
                  />
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section variants={itemVariants} className="-mt-2 space-y-2 sm:-mt-3 sm:space-y-3">
        <div className="relative overflow-visible py-5 sm:py-8">
          <QuickCategoriesWaveBackdrop />
          <div className="relative z-[1] min-w-0">
            <div className="group relative w-full min-w-0">
              <button
                type="button"
                onClick={() => scrollQuestQuickStrip(quickCategoriesScrollRef.current, 'left')}
                className={cn(offerCarouselNavButtonClass, questsNavBtnLight, 'left-0')}
                aria-label="Προηγούμενο"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <QuickCategories scrollRef={quickCategoriesScrollRef}>
            {QUEST_QUICK_CATEGORIES.map((qc) => {
              const isActive =
                quickSelectionId === qc.id ||
                (quickSelectionId === null && primaryQuickCardIdForFilter === qc.id);
              const count = quickQuestCounts.get(qc.id) ?? 0;
              const selectQuickCategory = () => {
                setQuickSelectionId(qc.id);
                if (
                  qc.id === 'q-shopping' ||
                  qc.id === 'q-market' ||
                  qc.id === 'q-health' ||
                  qc.id === 'q-beauty' ||
                  qc.id === 'q-drinks' ||
                  qc.id === 'q-pets'
                ) {
                  setPartnerCategoryFilter('All');
                } else {
                  setPartnerCategoryFilter(qc.categoryId);
                }
              };

              return (
                <div
                  key={qc.id}
                  data-quick-cat={qc.id}
                  className="flex w-[200px] shrink-0 snap-start flex-col gap-0 sm:w-[218px]"
                >
                  <div
                    className={cn(
                      'flex w-full flex-col overflow-hidden rounded-lg border text-left shadow-sm transition-colors duration-300',
                      theme === 'light'
                        ? cn(
                            'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/80',
                            isActive ? 'ring-2 ring-[#0a0a0a]/20 border-zinc-300' : '',
                          )
                        : cn(
                            'border-white/[0.08] bg-[#1e1e1e] hover:border-white/12 hover:bg-[#262626]',
                            isActive ? 'border-white/25 ring-1 ring-white/20' : '',
                          ),
                    )}
                    style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
                  >
                    <button
                      type="button"
                      onClick={selectQuickCategory}
                      className={cn(
                        'group relative h-[128px] w-full shrink-0 overflow-hidden rounded-t-lg text-left outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-anbit-brand/55 sm:h-[138px]',
                        theme === 'light' ? 'bg-zinc-100' : 'bg-[#252525]',
                      )}
                    >
                      <img
                        src={qc.image}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
                    </button>
                    <div
                      className={cn(
                        'flex min-h-0 items-stretch border-t',
                        theme === 'light' ? 'border-zinc-200' : 'border-white/[0.08]',
                      )}
                    >
                      <button
                        type="button"
                        onClick={selectQuickCategory}
                        className={cn(
                          'min-w-0 flex-1 px-2.5 py-2 text-left outline-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset sm:px-3 sm:py-2.5',
                          theme === 'light'
                            ? 'focus-visible:ring-[#0a0a0a]/35 hover:bg-zinc-50'
                            : 'focus-visible:ring-anbit-brand/35 hover:bg-white/[0.04]',
                        )}
                      >
                        <p
                          className={cn(
                            'line-clamp-2 text-xs font-semibold leading-tight sm:text-sm',
                            theme === 'light' ? 'text-neutral-900' : 'text-white',
                          )}
                        >
                          {qc.label}
                        </p>
                        <p
                          className={cn(
                            'mt-1 line-clamp-3 text-[9px] font-medium leading-snug sm:line-clamp-4 sm:text-[10px]',
                            theme === 'light' ? 'text-neutral-600' : 'text-[#9a9a9a]',
                          )}
                        >
                          {qc.subtitle}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickStoresModalQuickId(qc.id);
                        }}
                        className={cn(
                          'inline-flex shrink-0 flex-col items-center justify-center gap-0.5 border-l px-2.5 py-2 outline-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset sm:px-3',
                          theme === 'light'
                            ? 'border-zinc-200 focus-visible:ring-[#0a0a0a]/35 hover:bg-zinc-50'
                            : 'border-white/[0.08] focus-visible:ring-anbit-brand/35 hover:bg-white/[0.05]',
                        )}
                        aria-label={`Καταστήματα — ${qc.label} (${count})`}
                      >
                        <QuestQuickMerchantIcon
                          className={cn(
                            'h-4 w-4 opacity-95',
                            theme === 'light' ? 'text-[#0a0a0a]' : 'text-anbit-brand',
                          )}
                        />
                        <span
                          className={cn(
                            'text-xs font-semibold sm:text-sm',
                            theme === 'light' ? 'text-neutral-900' : 'text-white',
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
              </QuickCategories>
              <button
                type="button"
                onClick={() => scrollQuestQuickStrip(quickCategoriesScrollRef.current, 'right')}
                className={cn(offerCarouselNavButtonClass, questsNavBtnLight, 'right-0')}
                aria-label="Επόμενο"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.div variants={itemVariants} className="min-w-0 space-y-3 pb-1">
        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <h2
            className={cn(
              'playpen-sans min-w-0 text-[26px] font-bold leading-tight tracking-tight sm:text-[30px] md:min-w-0 md:flex-1 md:pr-4',
              theme === 'light' ? 'text-neutral-900' : 'text-anbit-text',
            )}
          >
            Αναζήτηση ανά κατηγορία
          </h2>
          <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2 md:w-auto md:shrink-0 md:justify-end md:gap-3">
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
              <span className={`shrink-0 whitespace-nowrap text-sm font-medium ${questsMutedForTheme}`}>{t('filterBy')}</span>
              <OfferFilterSelect
                value={offerFilter}
                onChange={(v) => setOfferFilter(v as FilterValue)}
                options={offerFilterOptions}
                aria-label={t('filterBy')}
              />
            </div>
            <label className="relative block w-full min-w-0 sm:min-w-[12rem] sm:flex-1 sm:max-w-[20rem] md:w-56 md:max-w-none md:shrink-0 md:flex-none">
              <Search
                className={cn(
                  'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2',
                  theme === 'light' ? 'text-zinc-400' : 'text-[#9a9a9a]',
                )}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search store or offer..."
                className={cn(
                  'h-10 w-full rounded-lg border pl-9 pr-3 text-sm focus:outline-none focus:ring-2',
                  theme === 'light'
                    ? 'border-zinc-200 bg-white text-neutral-900 placeholder:text-zinc-400 focus:border-[#0a0a0a]/45 focus:ring-[#0a0a0a]/12'
                    : 'border-anbit-border bg-anbit-card text-anbit-text placeholder:text-anbit-muted/80 focus:border-anbit-brand/40 focus:ring-anbit-brand/15',
                )}
              />
            </label>
          </div>
        </div>

        <div className="group relative w-full min-w-0 py-1">
          <button
            type="button"
            onClick={() => scrollPartnerCategoryStrip(partnerCategoryScrollRef.current, 'left')}
            className={cn(partnerCategoryNavButtonClass, questsNavBtnLight, 'left-0')}
            aria-label="Προηγούμενη κατηγορία"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div
            ref={partnerCategoryScrollRef}
            role="toolbar"
            aria-label="Κατηγορίες δικτύου"
            className="min-h-0 min-w-0 w-full overflow-x-auto overscroll-x-contain overscroll-y-none no-scrollbar scroll-smooth touch-pan-x"
            style={{ touchAction: 'pan-x' }}
          >
            <div
              className="flex w-max snap-x snap-mandatory flex-row items-center gap-4 sm:gap-5 md:gap-6 pr-1"
              style={{ touchAction: 'pan-x' }}
            >
              {partnerCategoryTabs.map((cat) => {
                const active = partnerCategoryFilter === cat.id;
                const src = stripCategoryTabImageSrc(cat, active);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setPartnerCategoryFilter(cat.id);
                    }}
                    className={cn(
                      'group/cat flex w-40 shrink-0 snap-start flex-col items-center justify-start gap-0 border-0 bg-transparent p-0 text-center outline-none transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-anbit-brand/35 sm:w-44 md:w-48 lg:w-52',
                      active && 'scale-[1.01]',
                    )}
                  >
                    <div
                      className={cn(
                        'flex w-full justify-center transition-transform duration-200',
                        active ? 'scale-[1.02]' : 'group-hover/cat:scale-[1.015]',
                      )}
                    >
                      <img
                        src={src}
                        alt=""
                        className="h-auto w-full max-h-52 object-contain sm:max-h-60 md:max-h-64 lg:max-h-72"
                        draggable={false}
                      />
                    </div>
                    <p
                      className={cn(
                        'mt-0 line-clamp-2 w-full px-0.5 text-xs font-semibold leading-tight tracking-tight sm:text-sm',
                        active
                          ? theme === 'light'
                            ? 'text-neutral-900'
                            : 'text-anbit-brand/90'
                          : theme === 'light'
                            ? 'text-neutral-600 group-hover/cat:text-neutral-900'
                            : 'text-zinc-400 group-hover/cat:text-anbit-brand/75',
                      )}
                    >
                      {cat.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={() => scrollPartnerCategoryStrip(partnerCategoryScrollRef.current, 'right')}
            className={cn(partnerCategoryNavButtonClass, questsNavBtnLight, 'right-0')}
            aria-label="Επόμενη κατηγορία"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </motion.div>

      {merchantSections.length > 0 && (
        <QuestsMerchantStrip
          sections={merchantSections}
          selectedKey={selectedMerchantKey}
          onSelect={setSelectedMerchantKey}
          favoriteMerchantIds={favoriteMerchantIds}
          onToggleFavoriteMerchant={handleToggleFavoriteMerchant}
        />
      )}

      <section className="min-w-0 space-y-4">
        <h2
          className={cn(
            'playpen-sans min-w-0 text-[30px] font-bold leading-tight tracking-tight sm:text-[32px]',
            theme === 'light' ? 'text-neutral-900' : 'text-anbit-text',
          )}
        >
          {t('dealsOfTheDay')}
        </h2>
        <OfferCarousel
          offers={GREEK_OFFERS}
          mutedTextClassName={questsMutedForTheme}
          cardClassName={questsOfferShell}
          questsDealSurface
        />
      </section>

      <div ref={offersSearchTriggerRef} className="min-w-0 space-y-4">
        <h2
          className={cn(
            'playpen-sans min-w-0 text-[30px] font-bold leading-tight tracking-tight sm:text-[32px]',
            theme === 'light' ? 'text-neutral-900' : 'text-anbit-text',
          )}
        >
          {t('quests')}
        </h2>
        <div className="space-y-10">
          <AnimatePresence mode="popLayout">
            {visibleMerchantSections.length === 0 ? (
              <p className={`text-center text-sm ${questsMutedForTheme}`}>{emptyQuestsMessage}</p>
            ) : (
              visibleMerchantSections.map(({ partner, quests: mq, representative }) => {
                const merchantKey = groupKeyFromSection({ partner, representative });
                return (
                <motion.section
                  key={partner?.id ?? representative.storeName ?? representative.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-stretch gap-3"
                >
                  <div className="self-start">
                    <QuestMerchantBanner
                      partner={partner}
                      representativeQuest={representative}
                      quests={mq}
                      favoriteMerchantId={merchantKey}
                      isFavorite={favoriteMerchantIds.has(merchantKey)}
                      onToggleFavorite={handleToggleFavoriteMerchant}
                    />
                  </div>
                  <MerchantOffersRow
                    quests={mq}
                    t={t}
                    offerCardClassName={questsOfferShell}
                    mutedTextClassName={questsMutedForTheme}
                    questsPage
                  />
                </motion.section>
              );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      <QuickCategoryStoresModal
        isOpen={quickStoresModalQuickId != null}
        onClose={() => setQuickStoresModalQuickId(null)}
        categoryLabel={quickModalCategory?.label ?? ''}
        entries={quickModalStoreEntries}
        onOpenStore={(partnerId) => {
          const partner = partners.find((p) => p.id === partnerId);
          navigate(`/store-profile/${partnerId}`, partner ? { state: { partner } } : undefined);
        }}
      />
    </motion.div>
  );
};


export default QuestsPage;
