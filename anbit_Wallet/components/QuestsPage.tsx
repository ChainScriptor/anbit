
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Quest, Partner } from '../types';
import { containerVariants, itemVariants } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { OfferCarousel, offerCarouselNavButtonClass } from './ui/offer-carousel';
import { GREEK_OFFERS } from '../data/greekOffers';
import { cn } from '@/lib/utils';
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

const questMuted = 'text-[#b0b0b0]';

function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const p = path.startsWith('/') ? path.slice(1) : path;
  return base.endsWith('/') ? `${base}${p}` : `${base}/${p}`;
}

const QuestQuickMerchantIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 10.5L12 3L21 10.5" stroke="#e63533" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 9.5V20H18V9.5" stroke="#e63533" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 20V14H14V20" stroke="#e63533" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.5 12.5H8.51M15.5 12.5H15.51" stroke="#e63533" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

type FilterValue = '' | 'highest-xp' | 'expiring-soon';

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
const QUEST_QUICK_CATEGORIES: { id: string; label: string; categoryId: string; image: string }[] = [
  { id: 'q-restaurants', label: 'Εστιατόρια', categoryId: 'street_food', image: publicUrl('categories/restaurant.gif') },
  { id: 'q-shopping', label: 'Ψώνια', categoryId: 'sandwiches', image: publicUrl('categories/shop.gif') },
  { id: 'q-market', label: 'Διαμονή', categoryId: 'All', image: publicUrl('categories/airbnb.gif') },
  { id: 'q-health', label: 'Υγεία & Ευεξία', categoryId: 'healthy', image: publicUrl('categories/gym.gif') },
  { id: 'q-beauty', label: 'Ομορφιά', categoryId: 'sweets', image: publicUrl('categories/beauty.gif') },
  { id: 'q-drinks', label: 'Ποτά', categoryId: 'bar', image: publicUrl('categories/drinks.gif') },
  { id: 'q-pets', label: 'Κατοικίδια', categoryId: 'All', image: publicUrl('categories/pets.gif') },
  { id: 'q-electronics', label: 'Ηλεκτρονικά', categoryId: 'All', image: publicUrl('categories/electronics.gif') },
  { id: 'q-baby', label: 'Παιδικά', categoryId: 'All', image: publicUrl('categories/baby.gif') },
  { id: 'q-home', label: 'Σπίτι & DIY', categoryId: 'All', image: publicUrl('categories/home.gif') },
  { id: 'q-flowers', label: 'Ανθοπωλεία', categoryId: 'All', image: publicUrl('categories/flowers.gif') },
  { id: 'q-hobbies', label: 'Χόμπι & Αθλητισμός', categoryId: 'All', image: publicUrl('categories/hobbie.gif') },
  { id: 'q-clothes', label: 'Ένδυση', categoryId: 'All', image: publicUrl('categories/clothes.gif') },
  { id: 'q-gifts', label: 'Δώρα', categoryId: 'All', image: publicUrl('categories/gifts.gif') },
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
}: {
  partner?: Partner;
  representativeQuest: Quest;
  quests: Quest[];
  /** Στη γραμμή επιλογής: κλικ φιλτράρει, χωρίς πλοήγηση στο κατάστημα. */
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const navigate = useNavigate();
  const [favorite, setFavorite] = useState(false);
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
        'group relative inline-flex max-w-[min(100%,17rem)] shrink-0 items-stretch overflow-hidden rounded-lg border bg-[#131313] shadow-md transition-all duration-300 hover:bg-[#191919]',
        selected ? 'border-[#e63533] ring-1 ring-[#e63533]/40' : 'border-white/10 hover:border-white/15',
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
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            draggable={false}
          />
        ) : (
          <div className="h-full w-full bg-[#1f1f1f]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 to-transparent" />
      </div>
      <div className="min-w-0 flex-1 py-2.5 pl-2.5 pr-9 text-[#e5e5e5]">
        <div className="flex items-center gap-1.5">
          <h2 className="truncate text-sm font-bold leading-tight tracking-tight text-white">{name}</h2>
          <span className="shrink-0 rounded-sm bg-[#e63533] px-1 py-px text-[7px] font-extrabold uppercase leading-none tracking-tighter text-white">
            Anbit+
          </span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-[10px] font-medium text-[#ababab]">
          <span>{formatFeeLabel(partner)}</span>
          <span className="mx-1 inline-block h-0.5 w-0.5 rounded-full bg-[#484848] align-middle" />
          <span>{formatDeliveryLabel(partner)}</span>
          <span className="mx-1 inline-block h-0.5 w-0.5 rounded-full bg-[#484848] align-middle" />
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
          <span className="truncate text-sm font-extrabold leading-none text-white">{maxXp} XP</span>
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
              className="shrink-0 text-[10px] font-bold tracking-wide text-[#ababab] underline-offset-2 transition-colors hover:text-[#e63533] hover:underline"
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
            setFavorite((v) => !v);
          }}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full bg-[#262626]/80 text-white backdrop-blur-sm transition-colors duration-300 hover:bg-[#e63533]',
            favorite && 'bg-[#e63533]',
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
    </div>
  );
}

function MerchantOffersRow({ quests, t }: { quests: Quest[]; t: (key: string) => string }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

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
          className={cn(offerCarouselNavButtonClass, 'left-0')}
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
              <QuestOfferCard quest={quest} index={index} t={t} mutedTextClassName={questMuted} />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => scrollOffers('right')}
          className={cn(offerCarouselNavButtonClass, 'right-0')}
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
        'group relative inline-flex max-w-[min(100%,17rem)] shrink-0 cursor-pointer items-stretch overflow-hidden rounded-lg border bg-[#131313] shadow-md transition-all duration-300 hover:bg-[#191919]',
        selected ? 'border-[#e63533] ring-1 ring-[#e63533]/40' : 'border-white/10 hover:border-white/15',
      )}
      style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
    >
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden bg-[#1f1f1f]">
        <span className="text-[10px] font-extrabold uppercase tracking-wide text-white">Όλα</span>
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 to-transparent" />
      </div>
      <div className="min-w-0 flex-1 py-2.5 pl-2.5 pr-3 text-[#e5e5e5]">
        <div className="flex items-center gap-1.5">
          <h2 className="truncate text-sm font-bold leading-tight tracking-tight text-white">Όλα τα καταστήματα</h2>
          <span className="shrink-0 rounded-sm bg-[#e63533] px-1 py-px text-[7px] font-extrabold uppercase leading-none tracking-tighter text-white">
            Anbit+
          </span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-[10px] font-medium text-[#ababab]">
          Προβολή όλων των προσφορών δικτύου
        </p>
        <p className="mt-1 text-sm font-extrabold leading-none text-white">
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
}: {
  sections: MerchantSectionGroup[];
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollStrip = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  const totalOffers = sections.reduce((n, g) => n + g.quests.length, 0);

  return (
    <div className="min-w-0 space-y-4">
      <h2 className="playpen-sans min-w-0 text-[36px] font-extrabold leading-tight tracking-tight text-anbit-text">
        Καταστήματα
      </h2>
      <div className="group relative w-full min-w-0">
        <button
          type="button"
          onClick={() => scrollStrip('left')}
          className={cn(offerCarouselNavButtonClass, 'left-0')}
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
                />
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => scrollStrip('right')}
          className={cn(offerCarouselNavButtonClass, 'right-0')}
          aria-label="Επόμενα καταστήματα"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

const QuestsPage: React.FC<{ quests: Quest[]; partners: Partner[] }> = ({ quests, partners }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const prevPathnameRef = useRef<string | undefined>(undefined);
  const [offerFilter, setOfferFilter] = useState<FilterValue>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [partnerCategoryFilter, setPartnerCategoryFilter] = useState<string>('All');
  const [quickSelectionId, setQuickSelectionId] = useState<string | null>(DEFAULT_QUESTS_QUICK_ID);
  const [selectedMerchantKey, setSelectedMerchantKey] = useState<string | null>(null);
  const [quickStoresModalQuickId, setQuickStoresModalQuickId] = useState<string | null>(null);
  const quickCategoriesScrollRef = useRef<HTMLDivElement | null>(null);
  const partnerCategoryScrollRef = useRef<HTMLDivElement | null>(null);

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
    if (offerFilter === 'highest-xp') list.sort((a, b) => b.reward - a.reward);
    else if (offerFilter === 'expiring-soon') {
      list.sort((a, b) => {
        const daysA = parseInt(a.expiresIn, 10) || 999;
        const daysB = parseInt(b.expiresIn, 10) || 999;
        return daysA - daysB;
      });
    }
    return list;
  }, [quests, partners, offerFilter, searchQuery, partnerCategoryFilter]);

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

  return (
    <motion.div
      className="space-y-8 md:space-y-10 pb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
    >
      <motion.section variants={itemVariants} className="-mt-2 space-y-2 sm:-mt-3 sm:space-y-3">
        <div className="relative overflow-visible py-5 sm:py-8">
          <QuickCategoriesWaveBackdrop />
          <div className="relative z-[1] min-w-0">
            <div className="group relative w-full min-w-0">
              <button
                type="button"
                onClick={() => scrollQuestQuickStrip(quickCategoriesScrollRef.current, 'left')}
                className={cn(offerCarouselNavButtonClass, 'left-0')}
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
                if (qc.id === 'q-shopping' || qc.id === 'q-market' || qc.id === 'q-health') {
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
                      'flex w-full flex-col overflow-hidden rounded-lg border bg-[#131313] text-left shadow-md transition-colors duration-300 hover:bg-[#191919]',
                      isActive
                        ? 'border-white ring-1 ring-white/45'
                        : 'border-white/10 hover:border-white/15',
                    )}
                    style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
                  >
                    <button
                      type="button"
                      onClick={selectQuickCategory}
                      className="group relative h-[128px] w-full shrink-0 overflow-hidden rounded-t-lg bg-[#1f1f1f] text-left outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e63533]/55 sm:h-[138px]"
                    >
                      <img
                        src={qc.image}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                    </button>
                    <div className="flex min-h-0 items-stretch border-t border-white/10">
                      <button
                        type="button"
                        onClick={selectQuickCategory}
                        className="min-w-0 flex-1 px-2.5 py-2.5 text-left outline-none transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e63533]/55 sm:px-3 sm:py-3"
                      >
                        <p className="line-clamp-2 text-xs font-bold leading-tight text-white sm:text-sm">{qc.label}</p>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickStoresModalQuickId(qc.id);
                        }}
                        className="inline-flex shrink-0 flex-col items-center justify-center gap-0.5 border-l border-white/10 px-2.5 py-2 outline-none transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e63533]/55 sm:px-3"
                        aria-label={`Καταστήματα — ${qc.label} (${count})`}
                      >
                        <QuestQuickMerchantIcon className="h-4 w-4 opacity-95" />
                        <span className="text-xs font-bold text-white sm:text-sm">{count}</span>
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
                className={cn(offerCarouselNavButtonClass, 'right-0')}
                aria-label="Επόμενο"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
        <h2 className="playpen-sans text-[36px] font-extrabold leading-tight tracking-tight text-anbit-text">
          Αναζήτηση ανά κατηγορία
        </h2>
      </motion.section>

      <div className="flex min-w-0 flex-row items-center gap-2 pb-1 sm:gap-3 md:gap-4">
        <div className="flex shrink-0 flex-row items-center gap-2 sm:gap-3">
          <span className={`shrink-0 whitespace-nowrap text-sm font-medium ${questMuted}`}>{t('filterBy')}</span>
          <select
            value={offerFilter}
            onChange={(e) => setOfferFilter(e.target.value as FilterValue)}
            className="h-10 min-w-[9.5rem] shrink-0 rounded-lg border border-anbit-border bg-anbit-card px-3 text-sm font-medium text-anbit-text focus:outline-none focus:ring-2 focus:ring-anbit-yellow/50 sm:min-w-[160px]"
          >
            <option value="">{t('allOffers')}</option>
            <option value="highest-xp">{t('highestXP')}</option>
            <option value="expiring-soon">{t('expiringSoon')}</option>
          </select>
          <label className="relative w-44 shrink-0 sm:w-56 sm:max-w-[min(100%,20rem)]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9a9a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store or offer..."
              className="h-10 w-full rounded-lg border border-anbit-border bg-anbit-card pl-9 pr-3 text-sm text-anbit-text placeholder:text-[#8a8a8a] focus:border-[#e63533] focus:outline-none focus:ring-2 focus:ring-[#e63533]/45"
            />
          </label>
        </div>
        <div className="group relative min-h-0 min-w-0 flex-1 py-1">
          <button
            type="button"
            onClick={() => scrollPartnerCategoryStrip(partnerCategoryScrollRef.current, 'left')}
            className={cn(offerCarouselNavButtonClass, 'left-0')}
            aria-label="Προηγούμενη κατηγορία"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div
            ref={partnerCategoryScrollRef}
            role="toolbar"
            aria-label="Κατηγορίες δικτύου"
            className="min-h-0 min-w-0 w-full overflow-x-auto overscroll-x-contain no-scrollbar scroll-smooth"
          >
            <div className="flex w-max snap-x snap-mandatory flex-row items-center gap-4 sm:gap-5 md:gap-6 pr-1">
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
                      'group/cat flex w-40 shrink-0 snap-start flex-col items-center justify-start gap-0 border-0 bg-transparent p-0 text-center outline-none transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e63533]/55 sm:w-44 md:w-48 lg:w-52',
                      active && 'scale-[1.02]',
                    )}
                  >
                    <div
                      className={cn(
                        'flex w-full justify-center',
                        active ? 'scale-[1.05]' : 'group-hover/cat:scale-[1.03]',
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
                        'mt-0 line-clamp-2 w-full px-0.5 text-xs font-extrabold leading-tight tracking-tight sm:text-sm',
                        active ? 'text-[#e63533]' : 'text-white group-hover/cat:text-[#e63533]',
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
            className={cn(offerCarouselNavButtonClass, 'right-0')}
            aria-label="Επόμενη κατηγορία"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>

      {merchantSections.length > 0 && (
        <QuestsMerchantStrip
          sections={merchantSections}
          selectedKey={selectedMerchantKey}
          onSelect={setSelectedMerchantKey}
        />
      )}

      <section className="space-y-4">
        <h2 className="section-title text-anbit-text text-lg lg:text-xl">{t('dealsOfTheDay')}</h2>
        <OfferCarousel offers={GREEK_OFFERS} mutedTextClassName={questMuted} />
      </section>

      <div className="space-y-12">
        <AnimatePresence mode="popLayout">
          {visibleMerchantSections.length === 0 ? (
            <p className={`text-center text-sm ${questMuted}`}>Δεν υπάρχουν προσφορές για αυτό το φίλτρο.</p>
          ) : (
            visibleMerchantSections.map(({ partner, quests: mq, representative }) => (
              <motion.section
                key={partner?.id ?? representative.storeName ?? representative.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-stretch gap-3"
              >
                <div className="self-start">
                  <QuestMerchantBanner partner={partner} representativeQuest={representative} quests={mq} />
                </div>
                <MerchantOffersRow quests={mq} t={t} />
              </motion.section>
            ))
          )}
        </AnimatePresence>
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
