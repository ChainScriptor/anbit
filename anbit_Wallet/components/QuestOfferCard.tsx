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
  /** Επιπλέον κλάσεις στο εξωτερικό motion wrapper (π.χ. w-full στο grid) */
  className?: string;
  /**
   * Κάρτα καταστήματος στο /network — ίδιο shell με προσφορά,
   * χωρίς modal και χωρίς CTA· κλικ στο banner ή στο κείμενο → προφίλ.
   */
  networkStoreCard?: boolean;
  onNetworkStoreOpen?: () => void;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
};

/** Κάρτα προσφοράς (quest) — κοινή εμφάνιση Quests, /network & προφίλ καταστήματος. */
export const QuestOfferCard: React.FC<QuestOfferCardProps> = ({
  quest,
  index = 0,
  t,
  mutedTextClassName = 'text-[color:var(--anbit-muted)]',
  cardClassName = 'bg-[color:var(--anbit-card)]',
  questsPage = false,
  partner = null,
  onOpenPartner,
  className,
  networkStoreCard = false,
  onNetworkStoreOpen,
  isFavorite = false,
  onFavoriteToggle,
}) => {
  const { theme } = useTheme();
  const lightQuests = questsPage && theme === 'light';
  const daysNum = quest.expiresIn.replace(/\D/g, '') || '0';
  const WeatherIcon = quest.weather ? getWeatherIcon(quest.weather) : null;
  const bannerSrc = quest.bannerImage ?? defaultBanner;
  const [detailOpen, setDetailOpen] = useState(false);

  const handleOpen = useCallback(() => {
    if (networkStoreCard && onNetworkStoreOpen) {
      onNetworkStoreOpen();
      return;
    }
    setDetailOpen(true);
  }, [networkStoreCard, onNetworkStoreOpen]);

  const closeDetail = useCallback(() => setDetailOpen(false), []);

  const showXpBadge = !networkStoreCard || (quest.reward ?? 0) > 0;
  const openAria = networkStoreCard ? `${quest.title} · ${t('profile')}` : t('offerDetailOpenAria');

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          'group flex h-full min-h-0 flex-col overflow-hidden border transition-all duration-300',
          networkStoreCard
            ? cn(
                'rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-lg',
                lightQuests
                  ? 'border-zinc-200/90 hover:border-zinc-300'
                  : 'border-white/[0.08] hover:border-[#009DE0]/35',
              )
            : cn(
                'rounded-xl',
                lightQuests ? 'border-zinc-200 hover:border-zinc-300' : 'border-[color:var(--anbit-border)] hover:border-anbit-brand/25',
              ),
          cardClassName,
          className,
        )}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={handleOpen}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpen();
            }
          }}
          className={cn(
            'relative w-full shrink-0 cursor-pointer overflow-hidden bg-white/5 text-left',
            networkStoreCard ? 'h-40 sm:h-44' : 'h-36 sm:h-40',
          )}
          aria-label={openAria}
        >
          <img
            src={bannerSrc}
            alt=""
            className={cn(
              'h-full w-full object-cover transition-transform duration-500',
              networkStoreCard && 'group-hover:scale-[1.03]',
            )}
            draggable={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          {WeatherIcon ? (
            <span className="pointer-events-none absolute bottom-2 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm">
              <WeatherIcon size={22} />
            </span>
          ) : (
            <span className="pointer-events-none absolute bottom-2 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-lg backdrop-blur-sm">
              {quest.icon}
            </span>
          )}
          {showXpBadge && (
            <span
              className={cn(
                'pointer-events-none absolute top-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold shadow-sm backdrop-blur-sm',
                networkStoreCard ? 'left-3' : 'right-3',
                lightQuests
                  ? 'border border-zinc-200 bg-zinc-50 text-neutral-900'
                  : 'border border-[color:var(--anbit-xp-surface-border)] bg-[color:var(--anbit-xp-surface)]/90 text-[color:var(--anbit-xp-accent)]',
              )}
            >
              <Star className={cn('h-3 w-3', lightQuests && 'text-[#0a0a0a]')} />+{quest.reward} XP
            </span>
          )}

          {networkStoreCard && onFavoriteToggle && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle();
              }}
              className={cn(
                'absolute right-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full shadow-md backdrop-blur-md transition-transform duration-200 hover:scale-105 active:scale-95',
                isFavorite
                  ? 'bg-[#009DE0] text-white ring-2 ring-white/25'
                  : 'bg-black/45 text-white ring-1 ring-white/15 hover:bg-black/60',
              )}
              aria-label={isFavorite ? 'Αφαίρεση από αγαπημένα' : 'Αγαπημένο'}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                favorite
              </span>
            </button>
          )}
        </div>

        <div
          className={cn(
            'flex flex-1 flex-col',
            networkStoreCard ? 'gap-2 px-4 pb-4 pt-3' : 'gap-4 p-5',
            networkStoreCard && 'cursor-pointer',
          )}
          role={networkStoreCard ? 'button' : undefined}
          tabIndex={networkStoreCard ? 0 : undefined}
          onClick={networkStoreCard ? handleOpen : undefined}
          onKeyDown={
            networkStoreCard
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpen();
                  }
                }
              : undefined
          }
          aria-label={networkStoreCard ? openAria : undefined}
        >
          {!networkStoreCard ? (
            <button type="button" onClick={handleOpen} className="text-left" aria-label={openAria}>
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
          ) : (
            <>
              <h3
                className={cn(
                  'text-[1.05rem] font-semibold leading-snug tracking-tight',
                  lightQuests ? 'text-neutral-900' : 'text-[color:var(--anbit-text)]',
                )}
              >
                {quest.title}
              </h3>
              <p
                className={cn(
                  'line-clamp-2 text-[13px] leading-relaxed',
                  lightQuests ? 'text-neutral-600' : mutedTextClassName,
                )}
              >
                {quest.description}
              </p>
              {partner != null && (
                <div
                  className={cn(
                    'mt-0.5 flex items-center gap-1.5 text-xs font-semibold tabular-nums',
                    lightQuests ? 'text-neutral-500' : 'text-[color:var(--anbit-muted)]',
                  )}
                >
                  <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" aria-hidden />
                  <span>{(partner.rating ?? 0).toFixed(1)}</span>
                </div>
              )}
            </>
          )}

          {!networkStoreCard && quest.multiplier != null && quest.multiplier > 1 && (
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

          {!networkStoreCard && (
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
          )}

          {!networkStoreCard && (
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleOpen}
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
                onClick={handleOpen}
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
          )}
        </div>
      </motion.div>

      {!networkStoreCard && (
        <QuestOfferDetailModal
          quest={quest}
          partner={partner}
          isOpen={detailOpen}
          onClose={closeDetail}
          t={t}
          onOpenPartner={onOpenPartner}
        />
      )}
    </>
  );
};
