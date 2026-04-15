import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
import { Partner } from '../types';
import { cn } from '@/lib/utils';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { loadFavoriteMerchantIds, subscribeFavoriteMerchantsChanged } from '@/lib/favoriteStores';
import { NetworkStoreCard } from './NetworkStoreCard';

/* ─── Wolt-style κατηγορίες ──────────────────────────────────── */
interface WoltCategory {
  id: string;
  label: string;
  emoji: string;
  categoryId: string;
}

const WOLT_CATEGORIES: WoltCategory[] = [
  { id: 'all',          label: 'Όλα',           emoji: '⭐',   categoryId: 'All' },
  { id: 'restaurants',  label: 'Εστιατόρια',    emoji: '🍽️',  categoryId: 'street_food' },
  { id: 'grocery',      label: 'Σούπερ μάρκετ', emoji: '🛒',  categoryId: 'grocery' },
  { id: 'drinks',       label: 'Ποτά',          emoji: '🍺',  categoryId: 'bar' },
  { id: 'sweets',       label: 'Γλυκά',         emoji: '🍰',  categoryId: 'sweets' },
  { id: 'healthy',      label: 'Υγεινό',        emoji: '🥗',  categoryId: 'healthy' },
  { id: 'pets',         label: 'Κατοικίδια',    emoji: '🐶',  categoryId: 'pets' },
  { id: 'sandwiches',   label: 'Σάντουιτς',     emoji: '🥙',  categoryId: 'sandwiches' },
];

/* ─── Wolt section config ─────────────────────────────────────── */
interface SectionConfig {
  id: string;
  title: string;
  subtitle?: string;
  filter: (partners: Partner[], storeXP: Record<string, number>, favIds: Set<string>) => Partner[];
}

const SECTIONS: SectionConfig[] = [
  {
    id: 'lunch',
    title: 'Κοντά σου για μεσημεριανό',
    filter: (partners) => partners.slice(0, 6),
  },
  {
    id: 'fastest',
    title: 'Γρηγορότερη παράδοση',
    subtitle: 'Φτάνει σε λιγότερο από 30 λεπτά',
    filter: (partners) =>
      [...partners]
        .filter((p) => p.deliveryTime)
        .sort((a, b) => {
          const getMin = (t?: string) => {
            if (!t || t === '—') return 99;
            const m = t.match(/\d+/);
            return m ? parseInt(m[0], 10) : 99;
          };
          return getMin(a.deliveryTime) - getMin(b.deliveryTime);
        })
        .slice(0, 6),
  },
  {
    id: 'favorites',
    title: 'Τοπικά αγαπημένα',
    filter: (partners, storeXP) =>
      [...partners]
        .sort((a, b) => (storeXP[b.id] ?? 0) - (storeXP[a.id] ?? 0))
        .slice(0, 6),
  },
  {
    id: 'toprated',
    title: 'Κορυφαία αξιολογημένα',
    filter: (partners) =>
      [...partners]
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 6),
  },
  {
    id: 'popular',
    title: 'Δημοφιλή αυτή την ώρα',
    filter: (partners) => [...partners].reverse().slice(0, 6),
  },
];

/* ─── Promo banners (static για demo) ────────────────────────── */
const PROMO_BANNERS = [
  { id: 1, title: 'Δωρεάν delivery',    subtitle: 'Σε εκατοντάδες καταστήματα', color: '#EBF7FD', emoji: '🚴' },
  { id: 2, title: '20% έκπτωση',       subtitle: 'Στις πρώτες 3 παραγγελίες',   color: '#EDFBEB', emoji: '🎁' },
  { id: 3, title: 'Κέρδισε XP',        subtitle: 'Σε κάθε παραγγελία σου',      color: '#FFF8E1', emoji: '⚡' },
];

/* ─── Grid categories ─────────────────────────────────────────── */
const GRID_CATEGORIES = [
  { label: 'Burger',   emoji: '🍔', categoryId: 'street_food' },
  { label: 'Pizza',    emoji: '🍕', categoryId: 'street_food' },
  { label: 'Sushi',    emoji: '🍣', categoryId: 'street_food' },
  { label: 'Κρέας',   emoji: '🥩', categoryId: 'street_food' },
  { label: 'Σαλάτες', emoji: '🥗', categoryId: 'healthy'     },
  { label: 'Χυμοί',   emoji: '🧃', categoryId: 'bar'         },
  { label: 'Παγωτό',  emoji: '🍦', categoryId: 'sweets'      },
  { label: 'Καφές',   emoji: '☕', categoryId: 'sweets'      },
];

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

/* ─── Horizontal section component ───────────────────────────── */
function WoltSection({
  title,
  subtitle,
  partners,
  storeXP,
  onOpenStoreProfile,
  isLight,
}: {
  title: string;
  subtitle?: string;
  partners: Partner[];
  storeXP: Record<string, number>;
  onOpenStoreProfile: (p: Partner) => void;
  isLight: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  if (partners.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between px-4">
        <div>
          <h2 className={cn('text-lg font-bold leading-tight', isLight ? 'text-[#202125]' : 'text-white')}>
            {title}
          </h2>
          {subtitle && (
            <p className={cn('text-xs mt-0.5', isLight ? 'text-[#717171]' : 'text-[#aaa]')}>
              {subtitle}
            </p>
          )}
        </div>
        <button className="flex items-center gap-0.5 text-[13px] font-semibold text-[#009DE0] shrink-0">
          Δες όλα <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar snap-x snap-mandatory"
      >
        {partners.map((partner) => (
          <div key={partner.id} className="w-[200px] shrink-0 snap-start sm:w-[220px]">
            <NetworkStoreCard
              partner={partner}
              xp={storeXP[partner.id] ?? 0}
              onOpen={() => onOpenStoreProfile(partner)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Main NetworkPage ────────────────────────────────────────── */
const NetworkPage: React.FC<NetworkPageProps> = ({
  partners,
  storeXP = {},
  onOpenStoreProfile,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteMerchantIds, setFavoriteMerchantIds] = useState(() => loadFavoriteMerchantIds());
  const [promoBannerIdx, setPromoBannerIdx] = useState(0);

  useEffect(() => {
    return subscribeFavoriteMerchantsChanged(() => {
      setFavoriteMerchantIds(loadFavoriteMerchantIds());
    });
  }, []);

  /* Auto-rotate promo banners */
  useEffect(() => {
    const t = setInterval(() => setPromoBannerIdx((i) => (i + 1) % PROMO_BANNERS.length), 3500);
    return () => clearInterval(t);
  }, []);

  /* Filtered partners by category */
  const categoryFilteredPartners = useMemo(() => {
    const cat = WOLT_CATEGORIES.find((c) => c.id === activeCategory);
    if (!cat || cat.categoryId === 'All') return partners;
    return partners.filter((p) => p.category === cat.categoryId);
  }, [partners, activeCategory]);

  /* Search filter */
  const searchFilteredPartners = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categoryFilteredPartners;
    return categoryFilteredPartners.filter((p) =>
      p.name.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q),
    );
  }, [categoryFilteredPartners, searchQuery]);

  /* Show sections only when no search/category filter active */
  const showSections = !searchQuery && activeCategory === 'all';

  return (
    <div
      className={cn('min-h-screen pb-28', isLight ? 'bg-[#F2F2F2]' : 'bg-[#0a0a0a]')}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", sans-serif' }}
    >
      {/* ── Search bar ── */}
      <div className={cn('sticky top-0 z-30 px-4 py-3', isLight ? 'bg-[#F2F2F2]' : 'bg-[#0a0a0a]')}>
        <div className={cn(
          'flex items-center gap-2 rounded-full px-4 py-2.5 border',
          isLight ? 'bg-white border-[#E8E8E8] shadow-sm' : 'bg-[#1e1e1e] border-white/[0.08]',
        )}>
          <Search className={cn('h-4 w-4 shrink-0', isLight ? 'text-[#717171]' : 'text-[#888]')} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Αναζήτηση καταστήματος ή πιάτου"
            className={cn(
              'flex-1 bg-transparent text-sm outline-none',
              isLight ? 'text-[#202125] placeholder:text-[#717171]' : 'text-white placeholder:text-[#888]',
            )}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className={cn('text-sm', isLight ? 'text-[#717171]' : 'text-[#888]')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Category pills ── */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 no-scrollbar">
        {WOLT_CATEGORIES.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors whitespace-nowrap',
                active
                  ? 'bg-[#009DE0] text-white shadow-sm'
                  : isLight
                    ? 'bg-white text-[#202125] border border-[#E8E8E8] hover:border-[#009DE0]/40'
                    : 'bg-[#1e1e1e] text-[#e5e5e5] border border-white/[0.08] hover:border-[#009DE0]/40',
              )}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Search results ─────────────────────────────────────── */}
      {(searchQuery || activeCategory !== 'all') && (
        <div className="px-4 space-y-3 mt-2">
          <p className={cn('text-sm font-medium', isLight ? 'text-[#717171]' : 'text-[#aaa]')}>
            {searchFilteredPartners.length} αποτελέσματα
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {searchFilteredPartners.map((partner) => (
              <NetworkStoreCard
                key={partner.id}
                partner={partner}
                xp={storeXP[partner.id] ?? 0}
                onOpen={() => onOpenStoreProfile(partner)}
              />
            ))}
            {searchFilteredPartners.length === 0 && (
              <p className={cn('col-span-2 py-12 text-center text-sm', isLight ? 'text-[#717171]' : 'text-[#888]')}>
                Δεν βρέθηκαν καταστήματα.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ─── Discovery sections (only when no filter) ───────────── */}
      {showSections && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Promo banners */}
          <div className="px-4">
            <div className="relative overflow-hidden rounded-2xl" style={{ height: 120 }}>
              {PROMO_BANNERS.map((banner, idx) => (
                <motion.div
                  key={banner.id}
                  initial={false}
                  animate={{ opacity: idx === promoBannerIdx ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center px-5"
                  style={{ backgroundColor: banner.color }}
                >
                  <div className="flex-1">
                    <p className="text-xl font-black text-[#202125] leading-tight">{banner.title}</p>
                    <p className="text-sm text-[#717171] mt-0.5">{banner.subtitle}</p>
                  </div>
                  <span className="text-5xl">{banner.emoji}</span>
                </motion.div>
              ))}
              {/* Dots */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
                {PROMO_BANNERS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPromoBannerIdx(i)}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      i === promoBannerIdx ? 'w-4 bg-[#009DE0]' : 'w-1.5 bg-[#202125]/20',
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Discovery sections */}
          {SECTIONS.map((section) => {
            const sectionPartners = section.filter(searchFilteredPartners, storeXP, favoriteMerchantIds);
            return (
              <WoltSection
                key={section.id}
                title={section.title}
                subtitle={section.subtitle}
                partners={sectionPartners}
                storeXP={storeXP}
                onOpenStoreProfile={onOpenStoreProfile}
                isLight={isLight}
              />
            );
          })}

          {/* ── Category grid ── */}
          <section className="px-4 space-y-3">
            <h2 className={cn('text-lg font-bold', isLight ? 'text-[#202125]' : 'text-white')}>
              Κατηγορίες
            </h2>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {GRID_CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => {
                    const wc = WOLT_CATEGORIES.find((c) => c.categoryId === cat.categoryId);
                    if (wc) setActiveCategory(wc.id);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl p-2.5 transition-colors',
                    isLight
                      ? 'bg-white border border-[#E8E8E8] hover:border-[#009DE0]/50'
                      : 'bg-[#1e1e1e] border border-white/[0.08] hover:border-[#009DE0]/40',
                  )}
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className={cn('text-[10px] font-medium text-center', isLight ? 'text-[#202125]' : 'text-[#e5e5e5]')}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Όλα τα καταστήματα (grid) ── */}
          <section className="px-4 space-y-3 pb-4">
            <div className="flex items-center justify-between">
              <h2 className={cn('text-lg font-bold', isLight ? 'text-[#202125]' : 'text-white')}>
                Όλα τα καταστήματα
              </h2>
              <span className={cn('text-sm', isLight ? 'text-[#717171]' : 'text-[#aaa]')}>
                {partners.length} διαθέσιμα
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {partners.map((partner) => (
                <NetworkStoreCard
                  key={partner.id}
                  partner={partner}
                  xp={storeXP[partner.id] ?? 0}
                  onOpen={() => onOpenStoreProfile(partner)}
                />
              ))}
            </div>
          </section>
        </motion.div>
      )}
    </div>
  );
};

export default NetworkPage;
