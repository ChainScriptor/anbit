import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Zap } from 'lucide-react';
import type { Quest } from '../types';
import { getWeatherIcon } from './ui/AnimatedWeatherIcons';
import { cn } from '@/lib/utils';

const defaultBanner =
  'https://images.unsplash.com/photo-1544025162-766942260318?auto=format&fit=crop&q=80&w=1200&h=480';

type QuestOfferCardProps = {
  quest: Quest;
  index?: number;
  t: (key: string) => string;
  mutedTextClassName?: string;
};

/** Κάρτα προσφοράς (quest) — κοινή εμφάνιση Quests & προφίλ καταστήματος. */
export const QuestOfferCard: React.FC<QuestOfferCardProps> = ({
  quest,
  index = 0,
  t,
  mutedTextClassName = 'text-[color:var(--anbit-muted)]',
}) => {
  const daysNum = quest.expiresIn.replace(/\D/g, '') || '0';
  const WeatherIcon = quest.weather ? getWeatherIcon(quest.weather) : null;
  const bannerSrc = quest.bannerImage ?? defaultBanner;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] transition-colors hover:border-[#e63533]/40"
    >
      <div className="relative h-36 w-full shrink-0 bg-white/5 sm:h-40">
        <img src={bannerSrc} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        {WeatherIcon ? (
          <span className="absolute bottom-2 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm">
            <WeatherIcon size={22} />
          </span>
        ) : (
          <span className="absolute bottom-2 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-lg backdrop-blur-sm">
            {quest.icon}
          </span>
        )}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md border border-[color:var(--anbit-xp-surface-border)] bg-[color:var(--anbit-xp-surface)]/95 px-2 py-1 text-xs font-bold text-[color:var(--anbit-xp-accent)] shadow-sm backdrop-blur-sm">
          <Star className="h-3 w-3" />+{quest.reward} XP
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="mb-1 text-lg font-bold text-[color:var(--anbit-text)]">{quest.title}</h3>
          <p className={cn('line-clamp-2 text-sm', mutedTextClassName)}>{quest.description}</p>
        </div>

        {quest.multiplier != null && quest.multiplier > 1 && (
          <div className="flex items-center gap-2 rounded-lg border border-[color:var(--anbit-xp-surface-border)] bg-[color:var(--anbit-xp-surface)] p-2">
            <Zap className="h-4 w-4 text-[color:var(--anbit-xp-accent)]" />
            <span className="text-sm font-medium text-[color:var(--anbit-xp-accent)]">
              {quest.multiplier}x {t('xpMultiplierWeekend')}
            </span>
          </div>
        )}

        <div className={cn('mt-auto flex items-center gap-2 text-sm', mutedTextClassName)}>
          <Clock className="h-4 w-4 shrink-0" />
          <span>
            {t('expiresInDays')} {daysNum} {t('daysLeft')}
          </span>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            className="flex-1 rounded-lg bg-[#e63533] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#cf2f2d]"
          >
            {t('claimOffer')}
          </button>
          <button
            type="button"
            className="rounded-lg border border-[color:var(--anbit-border)] px-4 py-2.5 text-sm font-medium text-[color:var(--anbit-text)] transition-colors hover:bg-white/5"
          >
            {t('viewRules')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
