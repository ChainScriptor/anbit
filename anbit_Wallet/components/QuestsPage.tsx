
import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import { loadFavoriteMerchantIds, subscribeFavoriteMerchantsChanged } from '@/lib/favoriteStores';
import { QuestOfferCard } from './QuestOfferCard';

const questMuted = 'text-[color:var(--anbit-muted)]';

/** Φόντο καρτών deals + προσφορών quest μόνο στη σελίδα /quests — ευθυγραμμισμένο με `--anbit-card` (πιο ήρεμο από #131313) */
const QUESTS_OFFER_CARD_BG = 'bg-[color:var(--anbit-card)]';
/** Light mode /quests: λευκή κάρτα, μαύρο κείμενο στο σώμα */
const QUESTS_OFFER_CARD_BG_LIGHT = 'bg-white';

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

const QuestsPage: React.FC<{
  quests: Quest[];
  partners: Partner[];
}> = ({ quests, partners }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const questsOfferShell =
    theme === 'light' ? QUESTS_OFFER_CARD_BG_LIGHT : QUESTS_OFFER_CARD_BG;
  const navigate = useNavigate();
  const [offerFilter, setOfferFilter] = useState<FilterValue>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteMerchantIds, setFavoriteMerchantIds] = useState(() => loadFavoriteMerchantIds());

  useEffect(() => {
    return subscribeFavoriteMerchantsChanged(() => {
      setFavoriteMerchantIds(loadFavoriteMerchantIds());
    });
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

  return (
    <motion.div
      className="space-y-8 md:space-y-10 pb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
    >
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
        <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-4">
          <h2
            className={cn(
              'playpen-sans min-w-0 text-[26px] font-bold leading-tight tracking-tight sm:text-[28px] md:min-w-0 md:flex-1 md:pr-4',
              theme === 'light' ? 'text-neutral-900' : 'text-anbit-text',
            )}
          >
            {t('quests')}
          </h2>
          <motion.div variants={itemVariants} className="w-full min-w-0 shrink-0 md:w-auto md:max-w-[min(100%,28rem)]">
            {discoverButtonEl}
          </motion.div>
        </div>
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
          <div className="flex w-full min-w-0 flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
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
        <div className="space-y-10">
          <AnimatePresence mode="popLayout">
            {merchantSections.length === 0 ? (
              <p className={`text-center text-sm ${questsMutedForTheme}`}>{emptyQuestsMessage}</p>
            ) : (
              merchantSections.map(({ partner, quests: mq, representative }) => (
                <motion.section
                  key={partner?.id ?? representative.storeName ?? representative.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-stretch"
                >
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
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};


export default QuestsPage;
