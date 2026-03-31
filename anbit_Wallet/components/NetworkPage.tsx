import React, { useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Truck, Zap, ChevronLeft, ChevronRight, Info, SlidersHorizontal, X } from 'lucide-react';
import { Partner } from '../types';
import { containerVariants, itemVariants } from '../constants';
import { useLanguage } from '../context/LanguageContext';

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
}

type SortOption = 'default' | 'name_asc' | 'name_desc' | 'rating_desc' | 'rating_asc' | 'delivery_asc' | 'min_order_asc';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Προεπιλογή' },
  { value: 'name_asc', label: 'Όνομα Α-Ω' },
  { value: 'name_desc', label: 'Όνομα Ω-Α' },
  { value: 'rating_desc', label: 'Βαθμολογία (υψηλή → χαμηλή)' },
  { value: 'rating_asc', label: 'Βαθμολογία (χαμηλή → υψηλή)' },
  { value: 'delivery_asc', label: 'Χρόνος παράδοσης (πιο γρήγορα)' },
  { value: 'min_order_asc', label: 'Ελάχ. παραγγελία (από μικρότερο)' },
];

const NetworkPage: React.FC<NetworkPageProps> = ({ partners, storeXP = {}, onOpenQR, onOrderComplete, onOpenStoreMenu, onOpenStoreProfile }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const categoriesScrollRef = useRef<HTMLDivElement | null>(null);

  const categories = [
    { id: 'All', label: t('all') },
    { id: 'street_food', label: 'Street Food' },
    { id: 'sandwiches', label: 'Σάντουιτς' },
    { id: 'brunch', label: 'Brunch' },
    { id: 'coffee', label: 'καφέ' },
    { id: 'bar', label: 'μπάρ' },
    { id: 'burger', label: 'Burger' },
    { id: 'sweets', label: 'Γλυκά' },
    { id: 'bbq', label: 'BBQ' },
    { id: 'breakfast', label: 'Πρωινό' },
    { id: 'italian', label: 'ιταλικό' },
    { id: 'asian', label: 'Asian' },
    { id: 'pizza', label: 'Pizza' },
    { id: 'crepe', label: 'κρέπα' },
    { id: 'healthy', label: 'Healthy' },
    { id: 'pasta', label: 'Ζυμαρικά' },
    { id: 'bougatsa', label: 'Μπουγάτσα' },
    { id: 'salads', label: 'Σαλάτες' },
    { id: 'souvlaki', label: 'Σουβλάκι' },
    { id: 'cooked', label: 'Μαγειρευτά' },
  ];

  const getCategoryCount = (categoryId: string) =>
    categoryId === 'All' ? partners.length : partners.filter(p => p.category === categoryId).length;

  const scrollCategories = (dir: 'left' | 'right') => {
    if (!categoriesScrollRef.current) return;
    const step = 260;
    categoriesScrollRef.current.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  const filteredPartners = filter === 'All'
    ? partners
    : partners.filter(p => p.category === filter);

  const sortedPartners = useMemo(() => {
    const list = [...filteredPartners];
    if (sortBy === 'default') return list;
    if (sortBy === 'name_asc') return list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'name_desc') return list.sort((a, b) => b.name.localeCompare(a.name));
    if (sortBy === 'rating_desc') return list.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'rating_asc') return list.sort((a, b) => a.rating - b.rating);
    if (sortBy === 'delivery_asc') {
      const parseMins = (s: string | undefined) => {
        if (!s || s === '—') return 9999;
        const m = s.match(/(\d+)/);
        return m ? parseInt(m[1], 10) : 9999;
      };
      return list.sort((a, b) => parseMins(a.deliveryTime) - parseMins(b.deliveryTime));
    }
    if (sortBy === 'min_order_asc') {
      const parseEuro = (s: string | undefined) => {
        if (!s || s === '—') return 9999;
        const n = parseFloat(s.replace(/[^\d,.]/g, '').replace(',', '.'));
        return isNaN(n) ? 9999 : n;
      };
      return list.sort((a, b) => parseEuro(a.minOrder) - parseEuro(b.minOrder));
    }
    return list;
  }, [filteredPartners, sortBy]);

  return (
    <motion.div
      className="space-y-8 lg:space-y-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <section className="space-y-4 lg:space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="anbit-wordmark font-anbit text-anbit-text text-2xl sm:text-3xl lg:text-4xl leading-tight">
            {t('thessalonikiWarriorNetwork')}
          </h2>
          <div className="flex items-center gap-2">
            <span className="font-greek text-base lg:text-lg font-greek-bold text-anbit-muted">Ταξινόμηση</span>
            <button
              type="button"
              onClick={() => setIsSortModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-anbit-border bg-anbit-card text-anbit-text hover:bg-anbit-yellow hover:text-anbit-yellow-content hover:border-anbit-yellow transition-colors"
              aria-label="Ταξινόμηση"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="font-greek text-sm font-greek-bold hidden sm:inline max-w-[140px] truncate">{SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? 'Προεπιλογή'}</span>
            </button>
          </div>
        </div>

        {/* Κατηγορίες – horizontal cards με εικόνα + πλήθος καταστημάτων */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-greek-bold text-anbit-text">Κατηγορίες</h3>
              <button type="button" className="w-5 h-5 rounded-full border border-anbit-border flex items-center justify-center text-anbit-muted hover:text-anbit-text" aria-label="Πληροφορίες">
                <Info className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                className="w-9 h-9 rounded-full bg-anbit-card border border-anbit-border flex items-center justify-center text-anbit-text hover:bg-anbit-yellow hover:text-anbit-yellow-content hover:border-anbit-yellow transition-colors"
                aria-label="Προηγούμενες"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollCategories('right')}
                className="w-9 h-9 rounded-full bg-anbit-card border border-anbit-border flex items-center justify-center text-anbit-text hover:bg-anbit-yellow hover:text-anbit-yellow-content hover:border-anbit-yellow transition-colors"
                aria-label="Επόμενες"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div
            ref={categoriesScrollRef}
            className="flex gap-5 overflow-x-auto no-scrollbar pb-2 scroll-smooth"
          >
            {categories.map((cat) => {
              const count = getCategoryCount(cat.id);
              const isActive = filter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilter(cat.id)}
                  className={`flex-shrink-0 w-[200px] sm:w-[220px] rounded-2xl overflow-hidden border-2 transition-all shadow-lg ${
                    isActive ? 'border-anbit-yellow ring-2 ring-anbit-yellow/30' : 'border-anbit-border hover:border-anbit-muted'
                  }`}
                >
                  <div className="aspect-square overflow-hidden bg-anbit-border">
                    <img
                      src={CATEGORY_IMAGES[cat.id] ?? CATEGORY_IMAGES.All}
                      alt=""
                      className="w-full h-full object-cover rounded-t-[14px]"
                    />
                  </div>
                  <div className="bg-anbit-card px-4 py-3 text-left font-greek">
                    <p className="text-lg font-greek-bold text-anbit-text leading-tight truncate">
                      {cat.label}
                    </p>
                    <p className="text-sm font-semibold text-anbit-muted mt-1">
                      {count} {count === 1 ? 'κατάστημα' : 'καταστήματα'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-4 lg:space-y-6 font-greek">
        <h2 className="section-title font-greek-bold text-anbit-text text-xl lg:text-2xl px-1">
          {t('partnerStores')}
        </h2>
        <div ref={scrollRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          {sortedPartners.map((partner) => (
            <motion.div
              key={partner.id}
              variants={itemVariants}
              className="rounded-xl overflow-hidden border border-anbit-border bg-anbit-card shadow-md flex flex-col"
            >
              {/* Εικόνα με badges */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={partner.image} alt={partner.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                  {partner.bonusXp && (
                    <span className="inline-flex items-center gap-0.5 bg-sky-500/90 text-white px-1.5 py-0.5 rounded text-[9px] font-bold shadow">
                      <Zap className="w-2.5 h-2.5" /> +{partner.bonusXp}%
                    </span>
                  )}
                  {partner.minOrder && partner.minOrder !== '—' && (
                    <span className="bg-emerald-600/90 text-white px-1.5 py-0.5 rounded text-[8px] font-bold shadow leading-tight">
                      ΕΛΑΧ. {partner.minOrder}
                    </span>
                  )}
                </div>
                {partner.deliveryTime && partner.deliveryTime !== '—' && (
                  <div className="absolute top-1.5 right-1.5 bg-sky-500/90 text-white px-2 py-0.5 rounded text-[9px] font-bold shadow">
                    {partner.deliveryTime}
                  </div>
                )}
              </div>
              {/* Πληροφορίες – μεγαλύτερα, bold, ευανάγνωστα */}
              <div className="p-3 flex-1 flex flex-col min-w-0 font-greek">
                <h3 className="text-base lg:text-lg font-greek-bold text-anbit-text leading-tight line-clamp-2 mb-1">
                  {partner.name}
                </h3>
                <p className="text-xs lg:text-sm font-semibold text-anbit-muted leading-snug line-clamp-1 mb-2">
                  {categories.find(c => c.id === partner.category)?.label ?? partner.category} · {partner.location}
                </p>
                {/* Γραμμή: delivery · τιμές · rating */}
                <div className="flex items-center gap-2 text-xs font-semibold text-anbit-muted mb-2">
                  <span className="flex items-center gap-0.5">
                    <Truck className="w-3.5 h-3.5" />
                    {partner.minOrder && partner.minOrder !== '—' ? partner.minOrder : '—'}
                  </span>
                  <span className="text-anbit-text">€€</span>
                  <span className="flex items-center gap-0.5 font-bold text-anbit-text">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {partner.rating.toFixed(1)}
                  </span>
                </div>
                {/* XP στο κατάστημα */}
                <div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-md bg-anbit-yellow/10 border border-anbit-yellow/20 mb-2">
                  <Zap className="w-3.5 h-3.5 text-anbit-yellow shrink-0" />
                  <span className="text-xs font-bold text-anbit-text truncate">{t('pointsAtStore')}</span>
                  <span className="text-sm font-black text-anbit-yellow ml-auto">{(storeXP[partner.id] ?? 0).toLocaleString()}</span>
                </div>
                {/* Κουμπιά Παραγγελία / Προφίλ καταστήματος */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <button
                    onClick={() => onOpenStoreMenu(partner)}
                    className="py-2.5 rounded-lg font-greek-bold text-sm tracking-wide bg-anbit-card border border-anbit-border text-anbit-text hover:bg-anbit-yellow hover:text-anbit-yellow-content transition-all"
                  >
                    {t('orderBtn')}
                  </button>
                  <button
                    onClick={() => onOpenStoreProfile(partner)}
                    className="py-2.5 rounded-lg font-greek-bold text-sm tracking-wide bg-anbit-yellow text-anbit-yellow-content hover:opacity-90 transition-all"
                  >
                    Προφίλ
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="dashboard-card h-64 lg:h-80 relative overflow-hidden flex items-center justify-center group">
        <div className="absolute inset-0 opacity-10 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=1200)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative z-10 text-center space-y-4 p-8 bg-anbit-bg/60 backdrop-blur-lg border border-anbit-border rounded-3xl max-w-lg">
          <MapPin className="w-10 h-10 text-anbit-yellow mx-auto" />
          <h2 className="section-title text-anbit-text text-lg">{t('battleMap')}</h2>
          <button className="bg-anbit-yellow text-anbit-yellow-content px-8 py-3 rounded-xl font-semibold text-xs tracking-wide hover:opacity-90 transition-all">{t('launchMap')}</button>
        </div>
      </section>

      {/* Modal ταξινόμησης */}
      {isSortModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsSortModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sort-modal-title"
        >
          <div
            className="bg-anbit-card border border-anbit-border rounded-2xl shadow-xl max-w-sm w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-anbit-border">
              <h3 id="sort-modal-title" className="font-greek text-lg font-greek-bold text-anbit-text">Ταξινόμηση</h3>
              <button
                type="button"
                onClick={() => setIsSortModalOpen(false)}
                className="p-2 rounded-lg text-anbit-muted hover:text-anbit-text hover:bg-anbit-border transition-colors"
                aria-label="Κλείσιμο"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 overflow-y-auto max-h-[60vh]">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSortBy(opt.value);
                    setIsSortModalOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-greek text-base font-semibold transition-colors ${
                    sortBy === opt.value
                      ? 'bg-anbit-yellow/20 text-anbit-yellow border border-anbit-yellow/40'
                      : 'text-anbit-text hover:bg-anbit-border border border-transparent'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
};

export default NetworkPage;
