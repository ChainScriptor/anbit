import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Partner } from '../types';
import { containerVariants, itemVariants } from '../constants';
import { cn } from '@/lib/utils';
import { useTheme } from '../context/ThemeContext';
import { offerCarouselNavButtonClass } from './ui/offer-carousel';
import { NetworkStoreCard } from './NetworkStoreCard';

/** Βελάκια carousel — light (όπως `questsDealNavLight` στο offer-carousel) */
const NETWORK_CAROUSEL_NAV_LIGHT =
  'border-zinc-200 bg-white/95 text-neutral-900 hover:border-[#0a0a0a]/25 hover:bg-[#0a0a0a]/[0.06]';

/** Ίδιες επιλογές με Quests quick strip· `categoryId` = `partner.category` ή `All`. */
const QUEST_QUICK_CATEGORIES: { id: string; label: string; categoryId: string }[] = [
  { id: 'q-restaurants', label: 'Εστιατόρια', categoryId: 'street_food' },
  { id: 'q-shopping', label: 'Ψώνια', categoryId: 'sandwiches' },
  { id: 'q-market', label: 'Διαμονή', categoryId: 'All' },
  { id: 'q-health', label: 'Υγεία & Ευεξία', categoryId: 'healthy' },
  { id: 'q-beauty', label: 'Ομορφιά', categoryId: 'sweets' },
  { id: 'q-drinks', label: 'Ποτά', categoryId: 'bar' },
  { id: 'q-pets', label: 'Κατοικίδια', categoryId: 'All' },
  { id: 'q-electronics', label: 'Ηλεκτρονικά', categoryId: 'All' },
  { id: 'q-baby', label: 'Παιδικά', categoryId: 'All' },
  { id: 'q-home', label: 'Σπίτι & DIY', categoryId: 'All' },
  { id: 'q-flowers', label: 'Ανθοπωλεία', categoryId: 'All' },
  { id: 'q-hobbies', label: 'Χόμπι & Αθλητισμός', categoryId: 'All' },
  { id: 'q-clothes', label: 'Ένδυση', categoryId: 'All' },
  { id: 'q-gifts', label: 'Δώρα', categoryId: 'All' },
];

/** Για λευκό περίγραμμα όταν ο χρήστης επιλέγει «Εστιατόρια». */
const RESTAURANTS_QUICK_ID = 'q-restaurants';

interface NetworkPageProps {
  partners: Partner[];
  storeXP?: Record<string, number>;
  onOpenQR: () => void;
  onOrderComplete: (xpEarned: number) => void;
  onOpenStoreMenu: (partner: Partner) => void;
  onOpenStoreProfile: (partner: Partner) => void;
  unlockedMerchantId?: string | null;
}

const NetworkPage: React.FC<NetworkPageProps> = ({ partners, storeXP = {}, onOpenStoreProfile }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const networkMuted = isLight ? 'text-neutral-600' : 'text-[#b0b0b0]';
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [quickSelectionId, setQuickSelectionId] = useState<string | null>(null);
  const storesScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollStoresStrip = (dir: 'left' | 'right') => {
    const el = storesScrollRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  const filteredPartners = useMemo(() => {
    if (categoryFilter === 'All') return partners;
    return partners.filter((p) => p.category === categoryFilter);
  }, [partners, categoryFilter]);

  const sortedPartners = useMemo(() => {
    return [...filteredPartners].sort((a, b) => a.name.localeCompare(b.name, 'el', { sensitivity: 'base' }));
  }, [filteredPartners]);

  const filterContextLabel =
    quickSelectionId != null
      ? QUEST_QUICK_CATEGORIES.find((q) => q.id === quickSelectionId)?.label
      : categoryFilter === 'All'
        ? 'Όλα'
        : categoryFilter;

  return (
    <motion.div
      className="min-w-0 space-y-8 pb-24 md:space-y-10"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
    >
      <motion.section variants={itemVariants} className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="playpen-sans min-w-0 text-[36px] font-extrabold leading-tight tracking-tight text-anbit-text">
              Καταστήματα
            </h2>
            <p className={cn('text-sm', networkMuted)}>
              <span className="font-semibold text-anbit-text">{filterContextLabel}</span>
              <span className="mx-1.5 text-anbit-muted">·</span>
              {sortedPartners.length} {sortedPartners.length === 1 ? 'κατάστημα' : 'καταστήματα'}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end sm:pt-1.5">
            <span className={`shrink-0 whitespace-nowrap text-sm font-medium ${networkMuted}`}>Τύπος υπηρεσίας:</span>
            <select
              value={quickSelectionId ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '') {
                  setCategoryFilter('All');
                  setQuickSelectionId(null);
                  return;
                }
                const qc = QUEST_QUICK_CATEGORIES.find((q) => q.id === v);
                if (qc) {
                  setQuickSelectionId(qc.id);
                  setCategoryFilter(qc.categoryId);
                }
              }}
              className={cn(
                'h-10 min-w-[11rem] shrink-0 rounded-lg bg-anbit-card px-3 py-2 pr-9 text-sm font-medium text-anbit-text focus:outline-none focus:ring-2 sm:min-w-[14rem]',
                quickSelectionId == null &&
                  'border border-anbit-border focus:border-anbit-brand focus:ring-anbit-brand/40',
                quickSelectionId === RESTAURANTS_QUICK_ID &&
                  (isLight
                    ? 'border border-[#0a0a0a] ring-1 ring-[#0a0a0a]/20 focus:border-[#0a0a0a] focus:ring-[#0a0a0a]/25'
                    : 'border border-white ring-1 ring-white/30 focus:border-white focus:ring-white/35'),
                quickSelectionId != null &&
                  quickSelectionId !== RESTAURANTS_QUICK_ID &&
                  'border border-anbit-brand ring-1 ring-anbit-brand/35 focus:border-anbit-brand focus:ring-anbit-brand/40',
              )}
              style={{
                appearance: 'none',
                backgroundImage: isLight
                  ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2352525c' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`
                  : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23b0b0b0' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.65rem center',
                backgroundSize: '1rem',
              }}
              aria-label="Γρήγορη επιλογή τύπου υπηρεσίας"
            >
              <option value="">Όλα</option>
              {QUEST_QUICK_CATEGORIES.map((qc) => (
                <option key={qc.id} value={qc.id}>
                  {qc.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {sortedPartners.length === 0 ? (
          <p className={cn('text-center text-sm', networkMuted)}>Δεν υπάρχουν καταστήματα για αυτή την επιλογή.</p>
        ) : (
          <div className="group relative w-full min-w-0">
            <button
              type="button"
              onClick={() => scrollStoresStrip('left')}
              className={cn(offerCarouselNavButtonClass, isLight && NETWORK_CAROUSEL_NAV_LIGHT, 'left-0')}
              aria-label="Προηγούμενα καταστήματα"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div
              ref={storesScrollRef}
              className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
            >
              {sortedPartners.map((partner) => (
                <motion.div
                  key={partner.id}
                  variants={itemVariants}
                  className="w-[min(100vw-2.5rem,280px)] shrink-0 snap-start sm:w-[300px] md:w-[min(22rem,85vw)]"
                >
                  <NetworkStoreCard
                    partner={partner}
                    xp={storeXP[partner.id] ?? 0}
                    onOpen={() => onOpenStoreProfile(partner)}
                  />
                </motion.div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => scrollStoresStrip('right')}
              className={cn(offerCarouselNavButtonClass, isLight && NETWORK_CAROUSEL_NAV_LIGHT, 'right-0')}
              aria-label="Επόμενα καταστήματα"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        )}
      </motion.section>
    </motion.div>
  );
};

export default NetworkPage;
