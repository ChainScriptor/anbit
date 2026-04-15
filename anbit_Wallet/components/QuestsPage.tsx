
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Quest, Partner } from '../types';
import { containerVariants, itemVariants } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { OfferCarousel, offerCarouselNavButtonClass } from './ui/offer-carousel';
import { OfferFilterSelect } from './ui/offer-filter-select';
import { DiscoverButton } from './ui/discover-button';
import { GREEK_OFFERS } from '../data/greekOffers';
import { cn } from '@/lib/utils';
import {
  loadFavoriteMerchantIds,
  subscribeFavoriteMerchantsChanged,
  toggleFavoriteMerchantId,
} from '@/lib/favoriteStores';
import { QuestOfferCard } from './QuestOfferCard';
import XPHeroCard from './XPProgressCircle';

const questMuted = 'text-[color:var(--anbit-muted)]';

/** Φόντο καρτών deals + προσφορών quest μόνο στη σελίδα /quests — ευθυγραμμισμένο με `--anbit-card` (πιο ήρεμο από #131313) */
const QUESTS_OFFER_CARD_BG = 'bg-[color:var(--anbit-card)]';
/** Light mode /quests: λευκή κάρτα, μαύρο κείμενο στο σώμα */
const QUESTS_OFFER_CARD_BG_LIGHT = 'bg-white';
/** Chips καταστημάτων — dark */
const QUESTS_MERCHANT_CHIP_BG = 'bg-[#1e1e1e]';
/** Chips καταστημάτων — light */
const QUESTS_MERCHANT_CHIP_BG_LIGHT = 'bg-white';

type FilterValue = '' | 'highest-xp' | 'expiring-soon' | 'favorite-stores';

function resolveQuestPartner(quest: Quest, partners: Partner[]): Partner | undefined {
  if (quest.partnerId) return partners.find((p) => p.id === quest.partnerId);
  if (quest.storeName) return partners.find((p) => p.name === quest.storeName);
  return undefined;
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
  partner,
  onOpenPartner,
  t,
  offerCardClassName,
  mutedTextClassName = questMuted,
  questsPage = true,
}: {
  quests: Quest[];
  partner?: Partner | null;
  onOpenPartner?: (p: Partner) => void;
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
                partner={partner ?? null}
                onOpenPartner={onOpenPartner}
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
  discoverSlot,
}: {
  sections: MerchantSectionGroup[];
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  favoriteMerchantIds: Set<string>;
  onToggleFavoriteMerchant: (merchantKey: string) => void;
  /** Desktop: ίδια γραμμή με «Καταστήματα». Mobile: από κάτω, κεντραρισμένο. */
  discoverSlot?: React.ReactNode;
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
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <h2
          className={cn(
            'playpen-sans min-w-0 shrink-0 text-[26px] font-bold leading-tight tracking-tight sm:text-[28px] md:flex-1 md:min-w-0',
            theme === 'light' ? 'text-neutral-900' : 'text-anbit-text',
          )}
        >
          Καταστήματα
        </h2>
        {discoverSlot ? (
          <div className="flex w-full min-w-0 shrink-0 justify-start md:w-auto md:max-w-[min(100%,28rem)] md:justify-end">
            {discoverSlot}
          </div>
        ) : null}
      </div>
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

const QuestsPage: React.FC<{
  quests: Quest[];
  partners: Partner[];
  storeXP?: Record<string, number>;
  totalXP?: number;
  userName?: string;
}> = ({ quests, partners, storeXP = {}, totalXP, userName }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const questsOfferShell =
    theme === 'light' ? QUESTS_OFFER_CARD_BG_LIGHT : QUESTS_OFFER_CARD_BG;
  const navigate = useNavigate();
  const [offerFilter, setOfferFilter] = useState<FilterValue>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchantKey, setSelectedMerchantKey] = useState<string | null>(null);
  const [favoriteMerchantIds, setFavoriteMerchantIds] = useState(() => loadFavoriteMerchantIds());

  useEffect(() => {
    return subscribeFavoriteMerchantsChanged(() => {
      setFavoriteMerchantIds(loadFavoriteMerchantIds());
    });
  }, []);

  const handleToggleFavoriteMerchant = useCallback((merchantKey: string) => {
    setFavoriteMerchantIds(toggleFavoriteMerchantId(merchantKey));
  }, []);

  const sortedAndFilteredQuests = useMemo(() => {
    let list = [...quests];
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
  }, [quests, partners, offerFilter, searchQuery, favoriteMerchantIds]);

  useEffect(() => {
    setSelectedMerchantKey(null);
  }, [offerFilter]);

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

  const discoverButtonEl = (
    <DiscoverButton
      compact
      className="w-full max-w-md justify-start sm:max-w-lg md:justify-end"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      activeDiscoverTab={offerFilter === 'favorite-stores' ? 'favorites' : 'popular'}
      onDiscoverTabChange={(tab) => {
        setOfferFilter(tab === 'favorites' ? 'favorite-stores' : 'highest-xp');
      }}
      labels={{
        popular: t('discoverPopular'),
        favorites: t('discoverFavorites'),
        searchPlaceholder: t('searchPartners'),
      }}
    />
  );

  const questsMutedForTheme = theme === 'light' ? 'text-neutral-600' : questMuted;
  const questsNavBtnLight =
    theme === 'light' ? 'border-zinc-200 bg-white/95 text-neutral-900 hover:border-[#0a0a0a]/25 hover:bg-[#0a0a0a]/[0.06]' : '';

  const pageBg = theme === 'light' ? '#F2F2F2' : '#0a0a0a';

  return (
    <motion.div
      className="space-y-8 md:space-y-10 pb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
    >
      {/* ── XP HERO CARD ── */}
      {totalXP !== undefined && (
        <motion.div variants={itemVariants} className="-mt-4 mb-2">
          <XPHeroCard
            totalXP={totalXP}
            userName={userName}
            pageBg={pageBg}
          />
        </motion.div>
      )}

      {merchantSections.length > 0 ? (
        <motion.div variants={itemVariants}>
          <QuestsMerchantStrip
            sections={merchantSections}
            selectedKey={selectedMerchantKey}
            onSelect={setSelectedMerchantKey}
            favoriteMerchantIds={favoriteMerchantIds}
            onToggleFavoriteMerchant={handleToggleFavoriteMerchant}
            discoverSlot={discoverButtonEl}
          />
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="flex min-w-0 justify-start pb-2 pt-1 md:justify-end">
          {discoverButtonEl}
        </motion.div>
      )}

      <section className="min-w-0 space-y-4">
        <h2
          className={cn(
            'playpen-sans min-w-0 text-[26px] font-bold leading-tight tracking-tight sm:text-[28px]',
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

      <div className="min-w-0 space-y-4">
        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <h2
            className={cn(
              'playpen-sans min-w-0 text-[26px] font-bold leading-tight tracking-tight sm:text-[28px] md:min-w-0 md:flex-1 md:pr-4',
              theme === 'light' ? 'text-neutral-900' : 'text-anbit-text',
            )}
          >
            {t('quests')}
          </h2>
          <div className="flex w-full min-w-0 flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2 md:w-auto md:shrink-0 md:justify-end md:gap-3">
            <div className="flex w-full min-w-0 flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
              <span className={`w-full text-sm font-medium sm:w-auto sm:shrink-0 sm:whitespace-nowrap ${questsMutedForTheme}`}>{t('filterBy')}</span>
              <OfferFilterSelect
                className="w-full max-w-[min(100%,22rem)] sm:max-w-none md:w-auto"
                value={offerFilter}
                onChange={(v) => setOfferFilter(v as FilterValue)}
                options={offerFilterOptions}
                aria-label={t('filterBy')}
                triggerClassName="w-full sm:w-auto md:min-w-[15rem]"
              />
            </div>
            <label className="relative block w-full min-w-0 max-w-[min(100%,22rem)] sm:min-w-[12rem] sm:max-w-[20rem] sm:flex-1 md:w-56 md:max-w-none md:shrink-0 md:flex-none">
              <Search
                className={cn(
                  'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2',
                  theme === 'light' ? 'text-zinc-400' : 'text-[#9a9a9a]',
                )}
                aria-hidden
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                      partner={partner}
                      onOpenPartner={(p) => navigate(`/store-profile/${p.id}`, { state: { partner: p } })}
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
    </motion.div>
  );
};


export default QuestsPage;
