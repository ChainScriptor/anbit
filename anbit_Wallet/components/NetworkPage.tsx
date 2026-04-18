import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import type { Partner } from '../types';
import { partnerToNetworkDisplayQuest } from '@/lib/partnerNetworkQuest';
import { cn } from '@/lib/utils';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { DiscoverButton, type DiscoverTabId } from './ui/discover-button';
import {
  loadFavoriteMerchantIds,
  subscribeFavoriteMerchantsChanged,
  toggleFavoriteMerchantId,
} from '@/lib/favoriteStores';
import { QuestOfferCard } from './QuestOfferCard';

/** Εμφανιζόμενο όνομα κατηγορίας δικτύου (κείμενο πάνω από τα μαγαζιά). */
const NETWORK_CATEGORY_LABELS: Record<string, string> = {
  coffee: 'Καφές',
  burger: 'Burger & ψητό',
  healthy: 'Υγεία & fitness',
  street_food: 'Street food',
  sandwiches: 'Σάντουιτς',
  sweets: 'Γλυκά',
  bar: 'Bar',
  brunch: 'Brunch',
  bbq: 'BBQ',
  breakfast: 'Πρωινό',
  italian: 'Ιταλική κουζίνα',
  asian: 'Ασιατική κουζίνα',
  pizza: 'Πίτσα',
  crepe: 'Κρέπες',
  pasta: 'Ζυμαρικά',
  bougatsa: 'Μπουγάτσα',
  salads: 'Σαλάτες',
  souvlaki: 'Σουβλάκι',
  cooked: 'Μαγειρευτό',
};

function partnerCategoryDisplayLabel(category: string): string {
  const c = category?.trim() || 'other';
  return NETWORK_CATEGORY_LABELS[c] ?? c.replace(/_/g, ' ');
}

/* ─── Sort options ────────────────────────────────────────────── */
type SortMode = 'default' | 'rating' | 'xp' | 'favorites';

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: 'default',   label: 'Προεπιλογή'    },
  { id: 'rating',    label: 'Αξιολόγηση'   },
  { id: 'xp',        label: 'Περισσότερο XP' },
  { id: 'favorites', label: 'Αγαπημένα'    },
];

/** ≥md: κεντρικό modal ταξινόμησης · <md: bottom sheet */
const SORT_SHEET_DESKTOP_MQ = '(min-width: 768px)';

/* ─── Props ───────────────────────────────────────────────────── */
interface NetworkPageProps {
  partners: Partner[];
  storeXP?: Record<string, number>;
  onOpenQR: () => void;
  onOrderComplete: (xpEarned: number) => void;
  onOpenStoreMenu: (partner: Partner) => void;
  onOpenStoreProfile: (partner: Partner) => void;
  unlockedMerchantId?: string | null;
}

/* ─── Main NetworkPage ────────────────────────────────────────── */
const NetworkPage: React.FC<NetworkPageProps> = ({
  partners,
  storeXP = {},
  onOpenStoreProfile,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isLight = theme === 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [discoverTab, setDiscoverTab] = useState<DiscoverTabId>('popular');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [favoriteMerchantIds, setFavoriteMerchantIds] = useState(() => loadFavoriteMerchantIds());
  const [isSortSheetDesktop, setIsSortSheetDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(SORT_SHEET_DESKTOP_MQ).matches,
  );
  /** 'all' = όλες οι κατηγορίες · αλλιώς id κατηγορίας partner */
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    return subscribeFavoriteMerchantsChanged(() => {
      setFavoriteMerchantIds(loadFavoriteMerchantIds());
    });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(SORT_SHEET_DESKTOP_MQ);
    const onChange = () => setIsSortSheetDesktop(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  /* Φίλτρο Discover: αγαπημένα (όπως /quests) */
  const discoverFiltered = useMemo(() => {
    if (discoverTab !== 'favorites') return partners;
    return partners.filter((p) => favoriteMerchantIds.has(p.id));
  }, [partners, discoverTab, favoriteMerchantIds]);

  /** Κατηγορίες που υπάρχουν στα τρέχοντα (μετά discover) δεδομένα — για chips φίλτρου */
  const categoryChips = useMemo(() => {
    const ids = new Set<string>();
    for (const p of discoverFiltered) {
      ids.add((p.category ?? 'other').trim() || 'other');
    }
    return [...ids].sort((a, b) =>
      partnerCategoryDisplayLabel(a).localeCompare(partnerCategoryDisplayLabel(b), 'el', { sensitivity: 'base' }),
    );
  }, [discoverFiltered]);

  useEffect(() => {
    if (categoryFilter !== 'all' && !categoryChips.includes(categoryFilter)) {
      setCategoryFilter('all');
    }
  }, [categoryFilter, categoryChips]);

  const categoryFiltered = useMemo(() => {
    if (categoryFilter === 'all') return discoverFiltered;
    return discoverFiltered.filter((p) => ((p.category ?? 'other').trim() || 'other') === categoryFilter);
  }, [discoverFiltered, categoryFilter]);

  /* Filter by search (Discover search bar) */
  const searchFiltered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categoryFiltered;
    return categoryFiltered.filter(
      (p) => p.name.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q),
    );
  }, [categoryFiltered, searchQuery]);

  /* Sort */
  const sortedPartners = useMemo(() => {
    const arr = [...searchFiltered];
    if (sortMode === 'rating') return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sortMode === 'xp')     return arr.sort((a, b) => (storeXP[b.id] ?? 0) - (storeXP[a.id] ?? 0));
    if (sortMode === 'favorites') {
      return arr.sort((a, b) => {
        const fa = favoriteMerchantIds.has(a.id) ? 1 : 0;
        const fb = favoriteMerchantIds.has(b.id) ? 1 : 0;
        return fb - fa;
      });
    }
    return arr;
  }, [searchFiltered, sortMode, storeXP, favoriteMerchantIds]);

  /** Τμήματα ανά κατηγορία: τίτλος κειμένου + πλέγμα καταστημάτων από κάτω. */
  const categorySections = useMemo(() => {
    const map = new Map<string, Partner[]>();
    for (const p of sortedPartners) {
      const key = (p.category ?? 'other').trim() || 'other';
      const list = map.get(key);
      if (list) list.push(p);
      else map.set(key, [p]);
    }
    const entries = [...map.entries()].map(([category, partners]) => ({
      category,
      label: partnerCategoryDisplayLabel(category),
      partners,
    }));
    entries.sort((a, b) => a.label.localeCompare(b.label, 'el', { sensitivity: 'base' }));
    let index = 0;
    return entries.map((e) => ({
      ...e,
      rows: e.partners.map((partner) => ({ partner, index: index++ })),
    }));
  }, [sortedPartners]);

  const bgPage  = isLight ? 'bg-[#F2F2F2]' : 'bg-[#0a0a0a]';
  const bgSticky = isLight ? 'bg-[#F2F2F2]' : 'bg-[#0a0a0a]';
  /** Ίδιο card shell με QuestOfferCard στο /quests */
  const networkOfferCardBg = isLight ? 'bg-white' : 'bg-[color:var(--anbit-card)]';
  const networkOfferMuted = isLight ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]';

  const sortSheetPanelClass = cn(
    'z-50 p-5 shadow-2xl',
    isLight ? 'bg-white' : 'bg-[#1e1e1e]',
  );

  const sortSheetOptions = (
    <div className="space-y-1">
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => {
            setSortMode(opt.id);
            setShowSortSheet(false);
          }}
          className={cn(
            'flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
            sortMode === opt.id
              ? isLight
                ? 'bg-[#242424]/10 text-[#242424]'
                : 'bg-[#009DE0]/10 text-[#009DE0]'
              : isLight
                ? 'text-[#202125] hover:bg-[#F2F2F2]'
                : 'text-white hover:bg-white/[0.06]',
          )}
        >
          {opt.label}
          {sortMode === opt.id && (
            <span className={cn('h-2 w-2 shrink-0 rounded-full', isLight ? 'bg-[#242424]' : 'bg-[#009DE0]')} />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div
      className={cn('min-h-screen pb-8', bgPage)}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", sans-serif' }}
    >
      {/* ── Sticky: τίτλος (όπως Προφίλ) + Discover δεξιά ── */}
      <div className={cn('sticky top-0 z-30 px-4 pt-3 pb-3', bgSticky)}>
        <div className="flex min-w-0 items-center justify-between gap-3">
          <h1
            className={cn(
              'playpen-sans min-w-0 flex-1 truncate text-[26px] font-bold leading-tight tracking-tight sm:text-[30px]',
              isLight ? 'text-[#202125]' : 'text-white',
            )}
          >
            {searchQuery || discoverTab === 'favorites' || categoryFilter !== 'all'
              ? 'Αποτελέσματα'
              : 'Καταστήματα'}
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            <DiscoverButton
              compact
              className="h-full shrink-0 justify-end p-1"
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeDiscoverTab={discoverTab}
              onDiscoverTabChange={setDiscoverTab}
              labels={{
                popular: t('discoverPopular'),
                favorites: t('discoverFavorites'),
                searchPlaceholder: t('searchPartners'),
              }}
            />
            <button
              type="button"
              onClick={() => setShowSortSheet(true)}
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors',
                sortMode !== 'default'
                  ? isLight
                    ? 'bg-[#242424] border-[#242424] text-white'
                    : 'bg-[#009DE0] border-[#009DE0] text-white'
                  : isLight
                    ? 'bg-white border-[#E8E8E8] text-[#717171] shadow-sm'
                    : 'bg-[#1e1e1e] border-white/[0.08] text-[#888]',
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
        {categoryChips.length > 0 && (
          <div
            className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 no-scrollbar scroll-smooth"
            role="tablist"
            aria-label={t('filterBy')}
          >
            <button
              type="button"
              role="tab"
              aria-selected={categoryFilter === 'all'}
              onClick={() => setCategoryFilter('all')}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                categoryFilter === 'all'
                  ? isLight
                    ? 'border-[#242424]/40 bg-[#242424]/15 text-[#242424]'
                    : 'border-[#009DE0]/40 bg-[#009DE0]/15 text-[#009DE0]'
                  : isLight
                    ? 'border-[#E8E8E8] bg-white text-[#717171] hover:border-[#242424]/30 hover:text-[#202125]'
                    : 'border-white/[0.1] bg-[#1e1e1e] text-[#aaa] hover:border-[#009DE0]/25 hover:text-white',
              )}
            >
              {t('all')}
            </button>
            {categoryChips.map((catId) => {
              const active = categoryFilter === catId;
              return (
                <button
                  key={catId}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategoryFilter(active ? 'all' : catId)}
                  className={cn(
                    'shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                    active
                      ? isLight
                        ? 'border-[#242424]/40 bg-[#242424]/15 text-[#242424]'
                        : 'border-[#009DE0]/40 bg-[#009DE0]/15 text-[#009DE0]'
                      : isLight
                        ? 'border-[#E8E8E8] bg-white text-[#717171] hover:border-[#242424]/30 hover:text-[#202125]'
                        : 'border-white/[0.1] bg-[#1e1e1e] text-[#aaa] hover:border-[#009DE0]/25 hover:text-white',
                  )}
                >
                  {partnerCategoryDisplayLabel(catId)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── No results ── */}
      {sortedPartners.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <span className="text-5xl mb-4">🔍</span>
          <p className={cn('text-base font-semibold', isLight ? 'text-[#202125]' : 'text-white')}>
            Δεν βρέθηκαν καταστήματα
          </p>
          <p className={cn('mt-1 text-sm', isLight ? 'text-[#717171]' : 'text-[#888]')}>
            {discoverTab === 'favorites' && favoriteMerchantIds.size === 0
              ? t('favoriteStoresAddSome')
              : discoverTab === 'favorites'
                ? t('favoriteStoresNoOffers')
                : categoryFilter !== 'all'
                  ? 'Δοκίμασε άλλη κατηγορία ή αναζήτηση.'
                  : 'Δοκίμασε διαφορετική αναζήτηση.'}
          </p>
        </div>
      )}

      {/* ── Store grid (όλα σε ενιαίο πλέγμα, χωρίς hero banner) ── */}
      {sortedPartners.length > 0 && (
        <div className="space-y-10 px-4 pb-4">
          {categorySections.map((section, sectionIndex) => (
            <section key={section.category} className="mx-auto w-full max-w-[1600px]">
              <h2
                className={cn(
                  'mb-3 text-lg font-black tracking-tight',
                  isLight ? 'text-[#202125]' : 'text-white',
                )}
              >
                {section.label}
              </h2>
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.06,
                      delayChildren: 0.02 + sectionIndex * 0.04,
                    },
                  },
                }}
                className="grid w-full grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
              >
                {section.rows.map(({ partner, index }) => (
                  <motion.div
                    key={partner.id}
                    className="min-h-0"
                    variants={{
                      hidden: { opacity: 0, y: 14, scale: 0.97 },
                      show: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { type: 'spring', stiffness: 380, damping: 28 },
                      },
                    }}
                  >
                    <QuestOfferCard
                      quest={partnerToNetworkDisplayQuest(partner, storeXP[partner.id] ?? 0)}
                      index={index}
                      t={t}
                      questsPage
                      partner={partner}
                      cardClassName={networkOfferCardBg}
                      mutedTextClassName={networkOfferMuted}
                      className="h-full w-full"
                      networkStoreCard
                      onNetworkStoreOpen={() => onOpenStoreProfile(partner)}
                      isFavorite={favoriteMerchantIds.has(partner.id)}
                      onFavoriteToggle={() => {
                        toggleFavoriteMerchantId(partner.id);
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </section>
          ))}
        </div>
      )}

      {/* ── Ταξινόμηση: modal (web md+) · bottom sheet (mobile) ── */}
      <AnimatePresence>
        {showSortSheet && (
          <>
            <motion.div
              key="sort-backdrop"
              className="fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSortSheet(false)}
            />
            {isSortSheetDesktop ? (
              <div
                key="sort-modal-wrap"
                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
              >
                <motion.div
                  key="sort-modal-panel"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="network-sort-title"
                  className={cn(
                    sortSheetPanelClass,
                    'pointer-events-auto w-full max-w-sm rounded-2xl',
                  )}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3
                    id="network-sort-title"
                    className={cn('mb-4 text-base font-bold', isLight ? 'text-[#202125]' : 'text-white')}
                  >
                    Ταξινόμηση
                  </h3>
                  {sortSheetOptions}
                </motion.div>
              </div>
            ) : (
              <motion.div
                key="sort-sheet-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="network-sort-title-mobile"
                className={cn(
                  sortSheetPanelClass,
                  'fixed bottom-0 left-0 right-0 rounded-t-2xl',
                )}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              >
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" />
                <h3
                  id="network-sort-title-mobile"
                  className={cn('mb-4 text-base font-bold', isLight ? 'text-[#202125]' : 'text-white')}
                >
                  Ταξινόμηση
                </h3>
                {sortSheetOptions}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NetworkPage;
