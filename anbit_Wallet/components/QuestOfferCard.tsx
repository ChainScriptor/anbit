import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Zap } from 'lucide-react';
import type { Partner, Quest } from '../types';
import { getWeatherIcon } from './ui/AnimatedWeatherIcons';
import { cn } from '@/lib/utils';
import { useTheme } from '../context/ThemeContext';
import { QuestOfferDetailModal } from './QuestOfferDetailModal';

const defaultBanner =
  'https://images.unsplash.com/photo-1544025162-766942260318?auto=format&fit=crop&q=80&w=1200&h=480';

type QuestOfferCardProps = {
  quest: Quest;
  index?: number;
  t: (key: string) => string;
  mutedTextClassName?: string;
  /** Φόντο κάρτας (προεπιλογή: --anbit-card) */
  cardClassName?: string;
  /** Σελίδα /quests: light mode → λευκή κάρτα + σκούρο κείμενο, CTA brand */
  questsPage?: boolean;
  /** Συνδεδεμένο κατάστημα (για κάρτα στο modal & πλοήγηση) */
  partner?: Partner | null;
  /** Άνοιγμα προφίλ καταστήματος από το modal */
  onOpenPartner?: (partner: Partner) => void;
};

/** Κάρτα προσφοράς (quest) — κοινή εμφάνιση Quests & προφίλ καταστήματος. */
export const QuestOfferCard: React.FC<QuestOfferCardProps> = ({
  quest,
  index = 0,
  t,
  mutedTextClassName = 'text-[color:var(--anbit-muted)]',
  cardClassName = 'bg-[color:var(--anbit-card)]',
  questsPage = false,
  partner = null,
  onOpenPartner,
}) => {
  const { theme } = useTheme();
  const lightQuests = questsPage && theme === 'light';
  const daysNum = quest.expiresIn.replace(/\D/g, '') || '0';
  const WeatherIcon = quest.weather ? getWeatherIcon(quest.weather) : null;
  const bannerSrc = quest.bannerImage ?? defaultBanner;
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = useCallback(() => setDetailOpen(true), []);
  const closeDetail = useCallback(() => setDetailOpen(false), []);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          'flex h-full flex-col overflow-hidden rounded-xl border transition-colors',
          lightQuests
            ? 'border-zinc-200 hover:border-zinc-300'
            : 'border-[color:var(--anbit-border)] hover:border-anbit-brand/25',
          cardClassName,
        )}
      >
        <button
          type="button"
          onClick={openDetail}
          className="relative h-36 w-full shrink-0 cursor-pointer bg-white/5 text-left sm:h-40"
          aria-label={t('offerDetailOpenAria')}
        >
          <img src={bannerSrc} alt="" className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/8 to-transparent" />
          {WeatherIcon ? (
            <span className="pointer-events-none absolute bottom-2 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm">
              <WeatherIcon size={22} />
            </span>
          ) : (
            <span className="pointer-events-none absolute bottom-2 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-lg backdrop-blur-sm">
              {quest.icon}
            </span>
          )}
          <span
            className={cn(
              'pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold shadow-sm backdrop-blur-sm',
              lightQuests
                ? 'border border-zinc-200 bg-zinc-50 text-neutral-900'
                : 'border border-[color:var(--anbit-xp-surface-border)] bg-[color:var(--anbit-xp-surface)]/90 text-[color:var(--anbit-xp-accent)]',
            )}
          >
            <Star className={cn('h-3 w-3', lightQuests && 'text-[#0a0a0a]')} />+{quest.reward} XP
          </span>
        </button>

        <div className="flex flex-1 flex-col gap-4 p-5">
          <button type="button" onClick={openDetail} className="text-left" aria-label={t('offerDetailOpenAria')}>
            <h3
              className={cn(
                'mb-1 text-lg font-semibold',
                lightQuests ? 'text-neutral-900' : 'text-[color:var(--anbit-text)]',
              )}
            >
              {quest.title}
            </h3>
            <p
              className={cn(
                'line-clamp-2 text-sm',
                lightQuests ? 'text-neutral-600' : mutedTextClassName,
              )}
            >
              {quest.description}
            </p>
          </button>

          {quest.multiplier != null && quest.multiplier > 1 && (
            <div
              className={cn(
                'flex items-center gap-2 rounded-lg border p-2',
                lightQuests
                  ? 'border-zinc-200 bg-zinc-50 text-neutral-900'
                  : 'border-[color:var(--anbit-xp-surface-border)] bg-[color:var(--anbit-xp-surface)] text-[color:var(--anbit-xp-accent)]',
              )}
            >
              <Zap
                className={cn('h-4 w-4', lightQuests ? 'text-[#0a0a0a]' : 'text-[color:var(--anbit-xp-accent)]')}
              />
              <span className="text-sm font-medium">
                {quest.multiplier}x {t('xpMultiplierWeekend')}
              </span>
            </div>
          )}

          <div
            className={cn(
              'mt-auto flex items-center gap-2 text-sm',
              lightQuests ? 'text-neutral-600' : mutedTextClassName,
            )}
          >
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              {t('expiresInDays')} {daysNum} {t('daysLeft')}
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={openDetail}
              className={cn(
                'flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors',
                lightQuests
                  ? 'bg-[#0a0a0a] text-white hover:bg-[#171717]'
                  : 'bg-anbit-brand text-anbit-brand-foreground hover:bg-anbit-brand-hover',
              )}
            >
              {t('claimOffer')}
            </button>
            <button
              type="button"
              onClick={openDetail}
              className={cn(
                'rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                lightQuests
                  ? 'border border-zinc-300 text-neutral-900 hover:bg-zinc-100'
                  : 'border border-[color:var(--anbit-border)] text-[color:var(--anbit-text)] hover:bg-white/5',
              )}
            >
              {t('viewRules')}
            </button>
          </div>
        </div>
      </motion.div>

      <QuestOfferDetailModal
        quest={quest}
        partner={partner}
        isOpen={detailOpen}
        onClose={closeDetail}
        t={t}
        onOpenPartner={onOpenPartner}
      />
    </>
  );
};
