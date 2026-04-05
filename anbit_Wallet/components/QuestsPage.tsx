
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Clock, Zap } from 'lucide-react';
import { Quest, UserData } from '../types';
import { containerVariants, itemVariants } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { getWeatherIcon } from './ui/AnimatedWeatherIcons';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { OfferCarousel } from './ui/offer-carousel';
import { GREEK_OFFERS } from '../data/greekOffers';

/** Quests page: secondary copy, was anbit-muted (#71717a) — lighter for readability */
const questMuted = 'text-[#b0b0b0]';

type FilterValue = '' | 'highest-xp' | 'expiring-soon';

const QuestsPage: React.FC<{ quests: Quest[]; user?: UserData | null }> = ({ quests, user }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<FilterValue>('');
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const currentXP = user?.totalXP ?? 0;
  const targetXP = user?.nextLevelXP ?? 2000;
  const level = user?.currentLevel ?? 1;
  const progressPct = user?.levelProgress ?? Math.min(100, (currentXP / targetXP) * 100);

  const filteredQuests = useMemo(() => {
    let list = [...quests];
    if (filter === 'highest-xp') {
      list.sort((a, b) => b.reward - a.reward);
    } else if (filter === 'expiring-soon') {
      list.sort((a, b) => {
        const daysA = parseInt(a.expiresIn, 10) || 999;
        const daysB = parseInt(b.expiresIn, 10) || 999;
        return daysA - daysB;
      });
    }
    return list;
  }, [quests, filter]);

  const { paginatedQuests, totalPages, pagesToRender } = useMemo(() => {
    const totalPagesCalc = Math.max(1, Math.ceil(filteredQuests.length / pageSize));
    const currentPage = Math.min(page, totalPagesCalc);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const slice = filteredQuests.slice(start, end);

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
      paginatedQuests: slice,
      totalPages: totalPagesCalc,
      pagesToRender: pages,
    };
  }, [filteredQuests, page, pageSize]);

  const goToPage = (next: number) => {
    setPage((prev) => {
      const total = Math.max(1, Math.ceil(filteredQuests.length / pageSize));
      const target = Math.min(total, Math.max(1, next));
      return target === prev ? prev : target;
    });
  };

  return (
    <motion.div
      className="space-y-6 md:space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Προσφορές της ημέρας - carousel */}
      <section className="space-y-4">
        <h2 className="section-title text-anbit-text text-lg lg:text-xl">{t('dealsOfTheDay')}</h2>
        <OfferCarousel offers={GREEK_OFFERS} mutedTextClassName={questMuted} />
      </section>

      <div className="space-y-2">
        <h1 className="section-title-lg text-anbit-text tracking-tight">
          {t('storeOffers')}
        </h1>
        <p className={`text-sm ${questMuted}`}>
          {t('storeOffersSubtitle')}
        </p>
      </div>

      {/* XP Progress Card - anbit colors */}
      <motion.div variants={itemVariants} className="rounded-xl border border-anbit-border bg-anbit-card overflow-hidden">
        <div className="p-6 text-anbit-text">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[color:var(--anbit-xp-surface)]">
                <Trophy className="h-5 w-5 text-anbit-xp-accent" />
              </div>
              <div>
                <p className={`text-xs font-bold tracking-wide ${questMuted}`}>{t('yourLevel')}</p>
                <p className="text-2xl font-black italic text-anbit-text">Level {level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xs font-bold tracking-wide ${questMuted}`}>{t('totalXP')}</p>
              <p className="text-2xl font-black italic text-anbit-text">{currentXP.toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={questMuted}>{t('progressToLevel')} {level + 1}</span>
              <span className="font-bold text-anbit-text">{currentXP} / {targetXP}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-anbit-xp-bar"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, progressPct)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter - simple select, anbit styling */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-sm font-medium ${questMuted}`}>{t('filterBy')}</span>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterValue)}
          className="h-9 min-w-[160px] rounded-lg border border-anbit-border bg-anbit-card px-3 text-sm font-medium text-anbit-text focus:outline-none focus:ring-2 focus:ring-anbit-yellow/50"
        >
          <option value="">{t('allOffers')}</option>
          <option value="highest-xp">{t('highestXP')}</option>
          <option value="expiring-soon">{t('expiringSoon')}</option>
        </select>
      </div>

      {/* Offer cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {paginatedQuests.map((quest, index) => (
            <OfferCard key={quest.id} quest={quest} index={index} t={t} />
          ))}
        </AnimatePresence>
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
    </motion.div>
  );
};

function OfferCard({
  quest,
  index,
  t,
}: {
  quest: Quest;
  index: number;
  t: (key: string) => string;
}) {
  const storeName = quest.storeName || t('partnerStore');
  const daysNum = quest.expiresIn.replace(/\D/g, '') || '0';
  const WeatherIcon = quest.weather ? getWeatherIcon(quest.weather) : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-anbit-border bg-anbit-card p-5 flex flex-col gap-4 hover:border-anbit-yellow/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0 w-12 h-12 rounded-full overflow-hidden bg-white/5 ring-2 ring-anbit-border">
            {quest.storeImage ? (
              <img
                src={quest.storeImage}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">
                {WeatherIcon ? (
                  <WeatherIcon size={24} />
                ) : (
                  quest.icon
                )}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-anbit-text text-sm truncate">{storeName}</p>
            <p className={`text-xs ${questMuted}`}>{t('categoryOffer')}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md border border-[color:var(--anbit-xp-surface-border)] bg-[color:var(--anbit-xp-surface)] text-anbit-xp-accent px-2 py-1 text-xs font-bold">
          <Star className="h-3 w-3" />
          +{quest.reward} XP
        </span>
      </div>

      <div>
        <h3 className="font-bold text-lg text-anbit-text mb-1">{quest.title}</h3>
        <p className={`text-sm line-clamp-2 ${questMuted}`}>{quest.description}</p>
      </div>

      {quest.multiplier != null && quest.multiplier > 1 && (
        <div className="flex items-center gap-2 p-2 rounded-lg border border-[color:var(--anbit-xp-surface-border)] bg-[color:var(--anbit-xp-surface)]">
          <Zap className="h-4 w-4 text-anbit-xp-accent" />
          <span className="text-sm font-medium text-anbit-xp-accent">{quest.multiplier}x {t('xpMultiplierWeekend')}</span>
        </div>
      )}

      <div className={`flex items-center gap-2 text-sm ${questMuted}`}>
        <Clock className="h-4 w-4 shrink-0" />
        <span>{t('expiresInDays')} {daysNum} {t('daysLeft')}</span>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          className="flex-1 py-2.5 rounded-lg bg-anbit-yellow text-anbit-yellow-content text-sm font-bold hover:opacity-90 transition-opacity"
        >
          {t('claimOffer')}
        </button>
        <button
          type="button"
          className="py-2.5 px-4 rounded-lg border border-anbit-border text-anbit-text text-sm font-medium hover:bg-white/5 transition-colors"
        >
          {t('viewRules')}
        </button>
      </div>
    </motion.div>
  );
}

export default QuestsPage;
