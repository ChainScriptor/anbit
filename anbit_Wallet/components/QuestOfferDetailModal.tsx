import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bike, ChevronRight, Clock, Smile, X } from 'lucide-react';
import type { Partner, Quest } from '../types';
import { cn } from '@/lib/utils';

const defaultBanner =
  'https://images.unsplash.com/photo-1544025162-766942260318?auto=format&fit=crop&q=80&w=1200&h=480';

const WOLT_CTA = '#242424';

type QuestOfferDetailModalProps = {
  quest: Quest;
  partner?: Partner | null;
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
  onOpenPartner?: (partner: Partner) => void;
};

export const QuestOfferDetailModal: React.FC<QuestOfferDetailModalProps> = ({
  quest,
  partner,
  isOpen,
  onClose,
  t,
  onOpenPartner,
}) => {
  const bannerSrc = quest.bannerImage ?? defaultBanner;
  const daysNum = quest.expiresIn.replace(/\D/g, '') || '0';
  const storeName = partner?.name ?? quest.storeName ?? t('partnerStore');
  const storeImage = partner?.image ?? quest.storeImage ?? bannerSrc;
  const delivery = partner?.deliveryTime ?? '20–30 λεπτά';
  const minOrder = partner?.minOrder;
  const rating = partner?.rating ?? 0;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleStorePress = () => {
    if (partner && onOpenPartner) {
      onClose();
      onOpenPartner(partner);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quest-offer-detail-title"
            className="flex max-h-[min(92dvh,760px)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[min(90dvh,720px)] sm:rounded-2xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative shrink-0 bg-white px-4 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-700 text-white transition-colors hover:bg-zinc-600 sm:right-4 sm:top-4"
                aria-label={t('close')}
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <div className="mx-auto mt-10 max-w-[17.5rem] rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:mt-11 sm:max-w-xs">
                <img
                  src={bannerSrc}
                  alt=""
                  className="mx-auto max-h-52 w-full object-contain object-center"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#161616] px-4 py-5 text-white sm:px-5">
              <h2 id="quest-offer-detail-title" className="text-xl font-bold leading-snug tracking-tight sm:text-[1.35rem]">
                {quest.title}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                {t('offerDetailRewardLine').replace('{xp}', String(quest.reward))}
              </p>

              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-2xl font-bold text-red-500">+{quest.reward} XP</span>
                <span className="text-sm text-zinc-500">
                  {t('offerDetailProgress')
                    .replace('{current}', String(quest.progress))
                    .replace('{total}', String(quest.total))}
                </span>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-white/95">{quest.description}</p>
              <p className="mt-3 text-sm text-zinc-400">
                {t('expiresInDays')} {daysNum} {t('daysLeft')}. {t('offerDetailExpiryNote')}
              </p>

              <div className="mt-5 space-y-2.5 border-l-2 border-zinc-600 pl-3 text-sm leading-relaxed text-zinc-300">
                <p>{t('offerDetailStep1')}</p>
                <p>{t('offerDetailStep2')}</p>
                <p>{t('offerDetailStep3')}</p>
                <p>{t('offerDetailStep4')}</p>
              </div>

              <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                {t('offerDetailFromLabel')}
              </p>
              <button
                type="button"
                onClick={handleStorePress}
                disabled={!partner || !onOpenPartner}
                className={cn(
                  'mt-2 flex w-full items-center gap-3 rounded-xl border border-zinc-700/80 bg-zinc-800/60 p-3 text-left transition-colors',
                  partner && onOpenPartner
                    ? 'cursor-pointer hover:border-zinc-500 hover:bg-zinc-800'
                    : 'cursor-default opacity-90',
                )}
              >
                <img
                  src={storeImage}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-lg border border-zinc-600 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-white">{storeName}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-400">
                    {minOrder ? (
                      <span className="inline-flex items-center gap-1">
                        <Bike className="h-3.5 w-3.5 shrink-0" />
                        {minOrder}
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      {delivery}
                    </span>
                    {rating > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <Smile className="h-3.5 w-3.5 shrink-0" />
                        {rating.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                </div>
                {partner && onOpenPartner ? (
                  <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400" />
                ) : null}
              </button>
            </div>

            <div className="shrink-0 border-t border-zinc-800 bg-[#161616] px-4 py-4 sm:px-5">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl py-3.5 text-center text-base font-bold text-black transition hover:brightness-95 active:scale-[0.99]"
                style={{ backgroundColor: WOLT_CTA }}
              >
                {t('claimOffer')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
