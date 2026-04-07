import React, { useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, RotateCcw, Star, Truck, Zap, ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { Partner } from '../types';
import { containerVariants, itemVariants } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '@/lib/utils';

/** Ίδιο secondary copy με QuestsPage (`questMuted`) */
const networkQuestMuted = 'text-[#b0b0b0]';

/** Carousel arrows: ορατά ελαφρά στο κινητό, πλήρη fade στο hover (desktop) όπως τα deals */
const dealsCarouselNavBtnLeft =
  'absolute top-1/2 -translate-y-1/2 left-0 z-10 w-10 h-10 rounded-full bg-anbit-card/95 backdrop-blur-md border border-anbit-border shadow-lg flex items-center justify-center text-anbit-text opacity-80 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-anbit-yellow hover:text-anbit-yellow-content hover:border-anbit-yellow hover:shadow-anbit-yellow/20';
const dealsCarouselNavBtnRight =
  'absolute top-1/2 -translate-y-1/2 right-0 z-10 w-10 h-10 rounded-full bg-anbit-card/95 backdrop-blur-md border border-anbit-border shadow-lg flex items-center justify-center text-anbit-text opacity-80 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-anbit-yellow hover:text-anbit-yellow-content hover:border-anbit-yellow hover:shadow-anbit-yellow/20';

/** Helpers */
function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const p = path.startsWith('/') ? path.slice(1) : path;
  return base.endsWith('/') ? `${base}${p}` : `${base}/${p}`;
}

const CATEGORY_IMAGES: Record<string, string> = {
  All: 'https://images.unsplash.com/photo-1504674900247-0877df9cc84e?auto=format&fit=crop&q=80&w=400',
  street_food: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&q=80&w=400',
  sandwiches: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400',
  brunch: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=400',
  coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400',
  bar: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=400',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
  sweets: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=400',
  bbq: 'https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?auto=format&fit=crop&q=80&w=400',
  breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80&w=400',
  italian: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400',
  asian: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=400',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400',
  crepe: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&q=80&w=400',
  healthy: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400',
  pasta: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&q=80&w=400',
  bougatsa: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
  salads: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400',
  souvlaki: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&q=80&w=400',
  cooked: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=400',
};

interface NetworkPageProps {
  partners: Partner[];
  storeXP?: Record<string, number>;
  onOpenQR: () => void;
  onOrderComplete: (xpEarned: number) => void;
  onOpenStoreMenu: (partner: Partner) => void;
  onOpenStoreProfile: (partner: Partner) => void;
  unlockedMerchantId?: string | null;
}

type SortOption = 'default' | 'name_asc' | 'rating_desc' | 'delivery_asc' | 'min_order_asc';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Προεπιλογή' },
  { value: 'name_asc', label: 'Όνομα Α-Ω' },
  { value: 'rating_desc', label: 'Βαθμολογία' },
  { value: 'delivery_asc', label: 'Πιο γρήγορα' },
  { value: 'min_order_asc', label: 'Ελάχιστη παραγγελία' },
];

const NetworkPage: React.FC<NetworkPageProps> = ({
  partners,
  storeXP = {},
  onOpenStoreProfile,
  unlockedMerchantId = null,
}) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [filter, setFilter] = useState('All');
  const [quickSelectionId, setQuickSelectionId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const categoriesScrollRef = useRef<HTMLDivElement | null>(null);
  const quickCategoriesScrollRef = useRef<HTMLDivElement | null>(null);

  const pointsAccentClass = theme === 'dark' ? 'text-white' : 'text-[#CA8A04]';

  const categories = [
    { id: 'All', label: t('all') },
    { id: 'street_food', label: 'Street Food' },
    { id: 'burger', label: 'Burger' },
    { id: 'coffee', label: 'Καφέ' },
    { id: 'pizza', label: 'Pizza' },
    { id: 'italian', label: 'Ιταλικό' },
    { id: 'sweets', label: 'Γλυκά' },
    { id: 'brunch', label: 'Brunch' },
    { id: 'pasta', label: 'Ζυμαρικά' },
    { id: 'healthy', label: 'Healthy' },
    { id: 'asian', label: 'Asian' },
  ];

  // ΕΠΑΝΑΦΟΡΑ ΟΛΩΝ ΤΩΝ ΕΠΙΛΟΓΩΝ ΟΠΩΣ ΣΤΗ WOLT
  const quickCategories = [
    { id: 'q-restaurants', label: 'Εστιατόρια', mappedFilter: 'street_food', image: publicUrl('categories/restaurant.gif') },
    { id: 'q-shopping', label: 'Ψώνια', mappedFilter: 'sandwiches', image: publicUrl('categories/shop.gif') },
    { id: 'q-market', label: 'Διαμονή', mappedFilter: 'All', image: publicUrl('categories/airbnb.gif') },
    { id: 'q-health', label: 'Υγεία & Ευεξία', mappedFilter: 'healthy', image: publicUrl('categories/gym.gif') },
    { id: 'q-beauty', label: 'Ομορφιά', mappedFilter: 'sweets', image: publicUrl('categories/beauty.gif') },
    { id: 'q-drinks', label: 'Ποτά', mappedFilter: 'bar', image: publicUrl('categories/drinks.gif') },
    { id: 'q-pets', label: 'Κατοικίδια', mappedFilter: 'All', image: publicUrl('categories/pets.gif') },
    { id: 'q-electronics', label: 'Ηλεκτρονικά', mappedFilter: 'All', image: publicUrl('categories/electronics.gif') },
    { id: 'q-baby', label: 'Παιδικά', mappedFilter: 'All', image: publicUrl('categories/baby.gif') },
    { id: 'q-home', label: 'Σπίτι & DIY', mappedFilter: 'All', image: publicUrl('categories/home.gif') },
    { id: 'q-flowers', label: 'Ανθοπωλεία', mappedFilter: 'All', image: publicUrl('categories/flowers.gif') },
    { id: 'q-hobbies', label: 'Χόμπι & Αθλητισμός', mappedFilter: 'All', image: publicUrl('categories/hobbie.gif') },
    { id: 'q-clothes', label: 'Ένδυση', mappedFilter: 'All', image: publicUrl('categories/clothes.gif') },
    { id: 'q-gifts', label: 'Δώρα', mappedFilter: 'All', image: publicUrl('categories/gifts.gif') },
  ];

  const scrollStrip = (el: HTMLDivElement | null, dir: 'left' | 'right') => {
    if (!el) return;
    const step = el.clientWidth * 0.8;
    el.scrollTo({ left: dir === 'right' ? el.scrollLeft + step : el.scrollLeft - step, behavior: 'smooth' });
  };

  const filteredPartners = filter === 'All' ? partners : partners.filter(p => p.category === filter);

  const sortedPartners = useMemo(() => {
    const list = [...filteredPartners];
    if (sortBy === 'rating_desc') return list.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'delivery_asc') {
      const parseMins = (s: string | undefined) => {
        const m = s?.match(/(\d+)/);
        return m ? parseInt(m[1], 10) : 9999;
      };
      return list.sort((a, b) => parseMins(a.deliveryTime) - parseMins(b.deliveryTime));
    }
    return list;
  }, [filteredPartners, sortBy]);

  const getCategoryCount = (id: string) => id === 'All' ? partners.length : partners.filter(p => p.category === id).length;

  /** Ετικέτα για το header «Κατηγορίες»: πρώτα από quick strip, αλλιώς από επιλεγμένη κάρτα κατηγορίας */
  const categoriesContextLabel =
    (quickSelectionId ? quickCategories.find((q) => q.id === quickSelectionId)?.label : null) ||
    (filter !== 'All' ? categories.find((c) => c.id === filter)?.label : null) ||
    null;

  return (
    <motion.div className="min-w-0 space-y-8 md:space-y-10 pb-28" initial="hidden" animate="visible" variants={containerVariants}>

      {/* Γρήγορες επιλογές */}
      <motion.section variants={itemVariants} className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="section-title text-anbit-text text-lg lg:text-xl">Γρήγορες επιλογές</h2>
            <p className={`mt-1 text-sm ${networkQuestMuted}`}>Πρόσβαση ανά τύπο υπηρεσίας — σύρε οριζόντια</p>
          </div>
        </div>
        <div className="relative w-full min-w-0 group">
          <button
            type="button"
            onClick={() => scrollStrip(quickCategoriesScrollRef.current, 'left')}
            className={dealsCarouselNavBtnLeft}
            aria-label="Προηγούμενο"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div
            ref={quickCategoriesScrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
          >
            {quickCategories.map((qc) => {
              const isActive = quickSelectionId === qc.id;
              return (
                <motion.button
                  key={qc.id}
                  type="button"
                  onClick={() => { setQuickSelectionId(qc.id); setFilter(qc.mappedFilter); }}
                  whileHover={theme === 'light' ? { y: -2 } : { y: -6 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className={cn(
                    'group relative flex-shrink-0 w-[240px] sm:w-[260px] rounded-2xl overflow-hidden snap-start bg-anbit-card text-left transition-all duration-300 outline-none focus:outline-none focus-visible:outline-none',
                    theme === 'light'
                      ? cn(
                          'border border-anbit-border shadow-none hover:-translate-y-0.5 hover:shadow-none',
                          isActive
                            ? 'border-anbit-text ring-2 ring-black/[0.06]'
                            : 'hover:border-anbit-border',
                        )
                      : cn(
                          'border-2 border-transparent shadow-lg shadow-black/30',
                          isActive
                            ? 'border-white ring-2 ring-white/30 shadow-xl shadow-black/40'
                            : 'hover:shadow-xl hover:shadow-black/35',
                        ),
                  )}
                >
                  <div className="relative h-[158px] sm:h-[168px] w-full overflow-hidden bg-anbit-border">
                    <img
                      src={qc.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-90" />
                  </div>
                  <div
                    className={cn(
                      'relative bg-anbit-card p-4',
                      theme !== 'light' && 'border-t border-anbit-border/25',
                    )}
                  >
                    <p className="font-bold text-sm leading-tight text-anbit-text line-clamp-2 sm:text-base">{qc.label}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => scrollStrip(quickCategoriesScrollRef.current, 'right')}
            className={dealsCarouselNavBtnRight}
            aria-label="Επόμενο"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </motion.section>

      {/* Κατηγορίες — ίδιο layout με quests, μέσα σε μαύρο panel */}
      <motion.section variants={itemVariants} className="min-w-0">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black sm:rounded-3xl">
          <div className="space-y-5 px-5 py-6 sm:space-y-6 sm:px-8 sm:py-7">
            <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between sm:pb-6">
              <div className="min-w-0 space-y-2">
                <h2 className="text-lg font-extrabold tracking-tight text-white lg:text-xl">
                  Κατηγορίες
                </h2>
                <p className={`text-sm ${networkQuestMuted}`}>
                  Διάλεξε κατηγορία — η λίστα ανανεώνεται αμέσως. Σύρε οριζόντια.
                </p>
                {categoriesContextLabel && (
                  <p className={`text-xs font-bold tracking-wide ${networkQuestMuted}`}>{categoriesContextLabel}</p>
                )}
                {filter !== 'All' && (
                  <p className="text-sm font-bold text-white">
                    {getCategoryCount(filter)} {getCategoryCount(filter) === 1 ? 'κατάστημα' : 'καταστήματα'}
                  </p>
                )}
              </div>
              {filter !== 'All' && (
                <button
                  type="button"
                  onClick={() => {
                    setFilter('All');
                    setQuickSelectionId(null);
                  }}
                  className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:self-auto"
                >
                  <RotateCcw className="h-4 w-4 opacity-80" aria-hidden />
                  Όλα τα καταστήματα
                </button>
              )}
            </div>

            <div className="relative w-full min-w-0 group">
              <button
                type="button"
                onClick={() => scrollStrip(categoriesScrollRef.current, 'left')}
                className={dealsCarouselNavBtnLeft}
                aria-label="Προηγούμενο"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div
                ref={categoriesScrollRef}
                className="flex snap-x snap-mandatory scroll-smooth gap-4 overflow-x-auto pb-4 no-scrollbar sm:gap-6"
              >
                {categories.map((cat) => {
                  const count = getCategoryCount(cat.id);
                  const isActive = filter === cat.id;
                  const catImg = CATEGORY_IMAGES[cat.id] ?? CATEGORY_IMAGES.All;
                  const storeWord = count === 1 ? 'κατάστημα' : 'καταστήματα';
                  return (
                    <motion.button
                      key={cat.id}
                      type="button"
                      aria-pressed={isActive}
                      aria-label={`${cat.label}, ${count} ${storeWord}`}
                      onClick={() => {
                        setQuickSelectionId(null);
                        setFilter(cat.id);
                      }}
                      whileHover={{ y: -4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      className={cn(
                        'group relative w-[200px] shrink-0 snap-start overflow-hidden rounded-xl border-2 border-anbit-border bg-anbit-card text-left shadow-md shadow-black/25 outline-none transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-anbit-yellow/50 sm:w-[220px]',
                        isActive
                          ? 'border-anbit-text ring-2 ring-white/25 shadow-lg shadow-black/35'
                          : 'hover:border-anbit-yellow/30 hover:shadow-lg hover:shadow-black/30',
                      )}
                    >
                      <div className="relative h-[148px] w-full overflow-hidden bg-anbit-border sm:h-[158px]">
                        <img
                          src={catImg}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-90" />
                      </div>
                      <div className="relative border-t border-anbit-border/25 bg-anbit-card p-4">
                        <p className="line-clamp-2 font-bold text-sm leading-tight text-anbit-text sm:text-base">{cat.label}</p>
                        <p className={`mt-1 text-xs ${networkQuestMuted}`}>
                          {count} {storeWord}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => scrollStrip(categoriesScrollRef.current, 'right')}
                className={dealsCarouselNavBtnRight}
                aria-label="Επόμενο"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Καταστήματα */}
      <motion.section variants={itemVariants} className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="section-title text-anbit-text text-lg lg:text-xl">{t('partnerStores')}</h2>
            <p className="mt-1 text-xs text-anbit-muted">
              {sortedPartners.length} {sortedPartners.length === 1 ? 'αποτέλεσμα' : 'αποτελέσματα'}
              {filter !== 'All' && (
                <span className="text-anbit-text/80"> · φίλτρο ενεργό</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsSortModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-transparent bg-anbit-card px-4 py-2.5 text-sm font-bold tracking-wide text-anbit-text shadow-md shadow-black/25 transition-all hover:bg-white/[0.06] sm:self-auto"
          >
            <SlidersHorizontal className="h-4 w-4 text-anbit-yellow" />
            Ταξινόμηση
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {sortedPartners.map((partner) => (
            <motion.div
              key={partner.id}
              variants={itemVariants}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-transparent bg-anbit-card shadow-md shadow-black/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/35"
              onClick={() => onOpenStoreProfile(partner)}
            >
              <div className="relative aspect-[2/1] w-full overflow-hidden">
                <img
                  src={partner.image}
                  alt={partner.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-90" />
                <div className="absolute left-3 top-3 flex flex-col gap-1">
                  {partner.bonusXp && (
                    <span className="rounded-md bg-sky-500 px-2 py-0.5 text-[9px] font-black text-white shadow-lg">
                      -{partner.bonusXp}% XP
                    </span>
                  )}
                </div>
                {partner.deliveryTime && (
                  <div className="absolute bottom-3 right-3 rounded-md bg-white/95 px-2 py-1 text-[9px] font-bold text-neutral-900 shadow-md backdrop-blur-sm">
                    {partner.deliveryTime}
                  </div>
                )}
              </div>

              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 font-bold text-sm leading-snug text-anbit-text">{partner.name}</h3>
                  <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-amber-400/15 px-2 py-0.5">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-bold text-anbit-text">{partner.rating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="line-clamp-1 text-xs font-medium text-anbit-muted">
                  {partner.category} · {partner.location}
                </p>
                <div className="flex items-center justify-between border-t border-anbit-border/50 pt-3">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-anbit-muted">
                    <Truck className="h-3.5 w-3.5 opacity-80" />
                    {partner.minOrder !== '—' ? partner.minOrder : '0,00€'}
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-1 rounded-full border border-transparent px-2.5 py-1 text-[10px] font-black',
                      theme === 'dark' ? 'bg-white/[0.08]' : 'bg-anbit-border/15',
                    )}
                  >
                    <Zap className={cn('h-3 w-3', pointsAccentClass)} />
                    <span className={pointsAccentClass}>{(storeXP[partner.id] ?? 0).toLocaleString()} XP</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Χάρτης */}
      <motion.section
        variants={itemVariants}
        className="group relative flex min-h-[17rem] items-center justify-center overflow-hidden rounded-2xl border border-transparent shadow-xl shadow-black/35 sm:min-h-[19rem] sm:rounded-3xl"
      >
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center transition-transform duration-[1.4s] ease-out group-hover:scale-100"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=1600)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a]/92 via-[#0a0a0a]/75 to-anbit-yellow/10" />
        <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-transparent bg-black/50 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-anbit-yellow/15 ring-1 ring-anbit-yellow/30">
            <MapPin className="h-6 w-6 text-anbit-yellow" />
          </div>
          <h2 className="section-title mb-2 text-anbit-text text-lg lg:text-xl">{t('battleMap')}</h2>
          <p className="mb-6 text-sm text-anbit-muted">Δες συνεργάτες γύρω σου στον χάρτη μάχης.</p>
          <button
            type="button"
            className="rounded-xl bg-anbit-yellow px-8 py-3 text-sm font-bold text-anbit-yellow-content shadow-lg shadow-anbit-yellow/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {t('launchMap')}
          </button>
        </div>
      </motion.section>

      {/* Modal ταξινόμησης */}
      {isSortModalOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsSortModalOpen(false)}
        >
          <motion.div
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-transparent bg-anbit-card shadow-2xl shadow-black/50"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-anbit-border/20 bg-white/[0.02] px-5 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-anbit-text">Ταξινόμηση</h3>
                <button
                  type="button"
                  onClick={() => setIsSortModalOpen(false)}
                  className="rounded-lg p-1.5 text-anbit-muted transition-colors hover:bg-white/5 hover:text-anbit-text"
                  aria-label="Κλείσιμο"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-1 text-sm text-anbit-muted">Διάλεξε πώς να ταξινομούνται τα καταστήματα</p>
            </div>
            <div className="space-y-1.5 p-4">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSortBy(opt.value);
                    setIsSortModalOpen(false);
                  }}
                  className={cn(
                    'w-full rounded-xl px-4 py-3.5 text-left text-sm font-bold transition-colors',
                    sortBy === opt.value
                      ? 'bg-anbit-yellow text-anbit-yellow-content shadow-md shadow-anbit-yellow/20'
                      : 'text-anbit-text hover:bg-white/[0.06]',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default NetworkPage;