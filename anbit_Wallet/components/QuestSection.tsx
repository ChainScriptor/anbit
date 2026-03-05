
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Timer, Trophy } from 'lucide-react';
import { Quest } from '../types';
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

const QuestSection: React.FC<{ quests: Quest[] }> = ({ quests }) => {
  const { t } = useLanguage();
  const pageSize = 4;
  const [page, setPage] = useState(1);

  const { paginatedQuests, totalPages, pagesToRender } = useMemo(() => {
    const totalPagesCalc = Math.max(1, Math.ceil(quests.length / pageSize));
    const currentPage = Math.min(page, totalPagesCalc);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const slice = quests.slice(start, end);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quests, page]);

  const goToPage = (next: number) => {
    setPage((prev) => {
      const total = Math.max(1, Math.ceil(quests.length / pageSize));
      const target = Math.min(total, Math.max(1, next));
      return target === prev ? prev : target;
    });
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="section-title text-anbit-text text-lg lg:text-xl">{t('quests')}</h2>
        <div className="flex items-center gap-2 text-anbit-muted">
           <Trophy className="w-3 h-3 lg:w-4 h-4" />
           <span className="text-xs lg:text-sm font-semibold tracking-wide">{t('season')} 01</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {paginatedQuests.map((quest) => (
          <div key={quest.id} className="dashboard-card p-4 lg:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 group">
            <div className="flex items-center gap-4 w-full">
              <div className="w-12 h-12 lg:w-16 lg:h-16 shrink-0 flex flex-col items-center justify-center gap-0.5 bg-white/[0.03] border border-anbit-border rounded-xl group-hover:bg-anbit-yellow group-hover:text-anbit-yellow-content transition-all">
                {quest.weather ? (() => {
                  const WeatherIcon = getWeatherIcon(quest.weather);
                  return <WeatherIcon size={28} className="shrink-0 lg:w-9 lg:h-9" />;
                })() : (
                  <span className="text-xl lg:text-3xl">{quest.icon}</span>
                )}
                {quest.weather && <span className="text-[9px] opacity-70 leading-none">{quest.icon}</span>}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm lg:text-lg font-bold text-anbit-text tracking-tight italic truncate">{quest.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                   <span className="text-[9px] lg:text-[10px] font-black text-anbit-yellow">+{quest.reward} XP</span>
                   <span className="text-[8px] lg:text-[9px] font-medium text-anbit-muted flex items-center gap-1"><Timer className="w-2.5 h-2.5" /> {quest.expiresIn}</span>
                </div>
              </div>
            </div>
            <div className="w-full sm:w-48 space-y-2">
              <div className="flex justify-between text-[8px] lg:text-[9px] font-semibold">
                <span className="text-anbit-muted">{t('progress')}</span>
                <span className="text-anbit-yellow">{Math.floor((quest.progress/quest.total)*100)}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div className="h-full bg-anbit-yellow" initial={{ width: 0 }} animate={{ width: `${(quest.progress / quest.total) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
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
  );
};

export default QuestSection;
