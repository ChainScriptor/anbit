
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Flame, Search, ChevronRight, Zap } from 'lucide-react';
import { Partner } from '../types';
import { containerVariants, itemVariants } from '../constants';
import CheckInModal from './CheckInModal';
import { useLanguage } from '../context/LanguageContext';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';

interface NetworkPageProps {
  partners: Partner[];
  storeXP?: Record<string, number>;
  onOpenQR: () => void;
  onOrderComplete: (xpEarned: number) => void;
  onOpenStoreMenu: (partner: Partner) => void;
}

const NetworkPage: React.FC<NetworkPageProps> = ({ partners, storeXP = {}, onOpenQR, onOrderComplete, onOpenStoreMenu }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('All');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const categories = [
    { id: 'All', label: t('all') },
    { id: 'Coffee', label: t('coffee') },
    { id: 'Food', label: t('food') },
    { id: 'Lifestyle', label: t('lifestyle') },
    { id: 'Services', label: t('services') }
  ];

  const filteredPartners = filter === 'All'
    ? partners
    : partners.filter(p => p.category === filter);

  useEffect(() => {
    // όταν αλλάζει σελίδα ή φίλτρο, γύρνα την οριζόντια λίστα στην αρχή
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [page, filter]);

  const { paginatedPartners, totalPages, pagesToRender } = useMemo(() => {
    const totalPagesCalc = Math.max(1, Math.ceil(filteredPartners.length / pageSize));
    const currentPage = Math.min(page, totalPagesCalc);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const slice = filteredPartners.slice(start, end);

    const pages: (number | 'ellipsis')[] = [];
    if (totalPagesCalc <= 5) {
      for (let p = 1; p <= totalPagesCalc; p++) pages.push(p);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 'ellipsis', totalPagesCalc);
      } else if (currentPage >= totalPagesCalc - 2) {
        pages.push(1, 'ellipsis', totalPagesCalc - 3, totalPagesCalc - 2, totalPagesCalc - 1, totalPagesCalc);
      } else {
        pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPagesCalc);
      }
    }

    return {
      paginatedPartners: slice,
      totalPages: totalPagesCalc,
      pagesToRender: pages,
    };
  }, [filteredPartners, page, pageSize]);

  const goToPage = (next: number) => {
    setPage((prev) => {
      const total = Math.max(1, Math.ceil(filteredPartners.length / pageSize));
      const target = Math.min(total, Math.max(1, next));
      return target === prev ? prev : target;
    });
  };

  const handleCheckIn = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsCheckInModalOpen(true);
  };

  return (
    <motion.div
      className="space-y-8 lg:space-y-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <section className="space-y-4 lg:space-y-6">
        <div className="space-y-2">
          <span className="section-title text-anbit-yellow text-[10px] lg:text-xs">{t('theEcosystem')}</span>
          <h2 className="section-title-lg text-anbit-text leading-tight">
            {t('thessalonikiWarriorNetwork')}
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-4 pt-2">
          <div className="flex bg-white/[0.03] border border-anbit-border rounded-xl p-1 overflow-x-auto no-scrollbar w-full lg:w-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-6 py-2 rounded-lg text-xs font-black transition-all whitespace-nowrap ${filter === cat.id ? 'bg-anbit-yellow text-anbit-yellow-content shadow-lg' : 'text-anbit-muted hover:text-anbit-text'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex-1 w-full flex items-center bg-white/[0.03] border border-anbit-border rounded-xl px-4 py-2">
            <Search className="w-4 h-4 text-anbit-muted mr-3" />
            <input
              type="text"
              placeholder={t('searchPartners')}
              className="bg-transparent border-none outline-none text-sm font-bold text-anbit-text w-full placeholder:text-anbit-muted"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 lg:space-y-6">
        <h2 className="section-title text-anbit-text text-lg px-1">
          {t('partnerStores')}
        </h2>
        <div className="relative -mx-4 sm:mx-0">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 sm:gap-5 pb-4 sm:pb-6 no-scrollbar snap-x snap-mandatory px-4 sm:px-0 scroll-smooth"
          >
            {paginatedPartners.map((partner) => (
              <motion.div
                key={partner.id}
                variants={itemVariants}
                className="flex-shrink-0 w-[260px] sm:w-[280px] lg:w-[300px] rounded-[12px] overflow-hidden border border-anbit-border bg-anbit-card snap-center shadow-lg"
              >
                <div className="relative h-[140px] sm:h-[160px] lg:h-[175px] overflow-hidden">
                  <img src={partner.image} alt={partner.name} className="w-full h-full object-cover rounded-t-[12px] transition-transform duration-300 group-hover:scale-105" />
                  {partner.bonusXp && (
                    <div className="absolute top-3 right-3 bg-anbit-yellow text-anbit-yellow-content px-2 py-1 rounded-lg font-black text-[9px] flex items-center gap-1 shadow-lg">
                      <Flame className="w-3 h-3 fill-current" />
                      +{partner.bonusXp}%
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5 space-y-2 sm:space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-anbit-text tracking-tight italic leading-tight truncate">
                    {partner.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Star className="w-4 h-4 text-emerald-500 fill-emerald-500 shrink-0" />
                    <span className="text-sm font-black text-anbit-text">{partner.rating}</span>
                    <span className="text-[11px] font-bold text-anbit-muted">({partner.reviewCount ?? '—'})</span>
                    <span className="text-[11px] font-bold text-anbit-muted">{t(partner.category.toLowerCase() as 'coffee' | 'food' | 'lifestyle' | 'services')}</span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-bold text-anbit-muted leading-snug">
                    {partner.deliveryTime ?? '—'}
                    {partner.minOrder && partner.minOrder !== '—' ? ` - Ελάχιστη ${partner.minOrder}` : ''}
                  </p>
                  <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-anbit-yellow/10 border border-anbit-yellow/20">
                    <Zap className="w-3.5 h-3.5 text-anbit-yellow shrink-0" />
                    <span className="text-[11px] font-bold text-anbit-text">{t('pointsAtStore')}</span>
                    <span className="text-sm font-black text-anbit-yellow ml-auto">{(storeXP[partner.id] ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => onOpenStoreMenu(partner)}
                      className="py-2.5 rounded-xl font-bold text-[9px] sm:text-[10px] tracking-wide bg-anbit-card border border-anbit-border text-anbit-text hover:bg-anbit-yellow hover:text-anbit-yellow-content transition-all"
                    >
                      {t('viewMenu')}
                    </button>
                    <button
                      onClick={() => handleCheckIn(partner)}
                      className="py-2.5 rounded-xl font-bold text-[9px] sm:text-[10px] tracking-wide lowercase bg-anbit-yellow text-anbit-yellow-content hover:opacity-90 transition-all"
                    >
                      {t('checkIn')}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
              }
            }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-anbit-card border-2 border-anbit-border flex items-center justify-center text-anbit-text hover:bg-anbit-yellow hover:text-anbit-yellow-content hover:border-anbit-yellow transition-all shadow-lg z-10"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        {totalPages > 1 && (
          <div className="pt-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) goToPage(page - 1);
                    }}
                  />
                </PaginationItem>
                {pagesToRender.map((p, idx) =>
                  p === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === page}
                        onClick={(e) => {
                          e.preventDefault();
                          goToPage(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) goToPage(page + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>

      <section className="dashboard-card h-64 lg:h-80 relative overflow-hidden flex items-center justify-center group">
        <div className="absolute inset-0 opacity-10 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=1200)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative z-10 text-center space-y-4 p-8 bg-anbit-bg/60 backdrop-blur-lg border border-anbit-border rounded-3xl max-w-lg">
          <MapPin className="w-10 h-10 text-anbit-yellow mx-auto" />
          <h2 className="section-title text-anbit-text text-lg">{t('battleMap')}</h2>
          <button className="bg-anbit-yellow text-anbit-yellow-content px-8 py-3 rounded-xl font-semibold text-xs tracking-wide hover:opacity-90 transition-all">{t('launchMap')}</button>
        </div>
      </section>

      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        partner={selectedPartner}
      />
    </motion.div>
  );
};

export default NetworkPage;
