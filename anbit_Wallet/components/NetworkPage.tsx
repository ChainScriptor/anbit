import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Partner } from '../types';
import { containerVariants, itemVariants } from '../constants';
import { cn } from '@/lib/utils';

const networkMuted = 'text-[#b0b0b0]';

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

function NetworkStoreCard({
  partner,
  xp,
  onOpen,
}: {
  partner: Partner;
  xp: number;
  onOpen: () => void;
}) {
  const [favorite, setFavorite] = useState(false);
  const img = partner.image;
  const rating = partner.rating ?? 9.2;

  const activate = () => onOpen();

  return (
    <div
      className={cn(
        'group relative flex w-full cursor-pointer items-stretch overflow-hidden rounded-lg border border-white/10 bg-[#131313] shadow-md transition-all duration-300 hover:border-white/15 hover:bg-[#191919]',
      )}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      }}
      role="button"
      tabIndex={0}
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
          <div className="h-full w-full bg-[#1f1f1f]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 to-transparent" />
      </div>
      <div className="min-w-0 flex-1 py-2.5 pl-2.5 pr-10 text-[#e5e5e5] sm:pr-11">
        <div className="flex items-center gap-1.5">
          <h2 className="truncate text-sm font-bold uppercase leading-tight tracking-tight text-white">{partner.name}</h2>
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
        <p className="mt-1 text-sm font-extrabold leading-none text-white">{xp.toLocaleString()} XP</p>
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
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [quickSelectionId, setQuickSelectionId] = useState<string | null>(null);

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
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 sm:gap-3">
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
              'border border-anbit-border focus:border-[#e63533] focus:ring-[#e63533]/40',
            quickSelectionId === RESTAURANTS_QUICK_ID &&
              'border border-white ring-1 ring-white/30 focus:border-white focus:ring-white/35',
            quickSelectionId != null &&
              quickSelectionId !== RESTAURANTS_QUICK_ID &&
              'border border-[#e63533] ring-1 ring-[#e63533]/35 focus:border-[#e63533] focus:ring-[#e63533]/40',
          )}
          style={{
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23b0b0b0' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
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
      </motion.div>

      <motion.section variants={itemVariants} className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="section-title flex items-center gap-2 text-anbit-text text-lg lg:text-xl">
              Καταστήματα
              <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#e63533' }} />
            </h2>
            <p className="mt-1 text-sm text-[#b0b0b0]">
              <span className="font-semibold text-white/90">{filterContextLabel}</span>
              <span className="mx-1.5 text-white/30">·</span>
              {sortedPartners.length}{' '}
              {sortedPartners.length === 1 ? 'κατάστημα' : 'καταστήματα'}
            </p>
          </div>
        </div>

        {sortedPartners.length === 0 ? (
          <p className="text-center text-sm text-[#b0b0b0]">Δεν υπάρχουν καταστήματα για αυτή την επιλογή.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {sortedPartners.map((partner) => (
              <motion.div key={partner.id} variants={itemVariants} className="min-w-0">
                <NetworkStoreCard
                  partner={partner}
                  xp={storeXP[partner.id] ?? 0}
                  onOpen={() => onOpenStoreProfile(partner)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    </motion.div>
  );
};

export default NetworkPage;
