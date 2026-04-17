import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { offerCarouselNavButtonClass } from '../ui/offer-carousel';
import { QuestOfferCard } from '../QuestOfferCard';
import { partnerToNetworkDisplayQuest } from '@/lib/partnerNetworkQuest';
import {
  loadFavoriteMerchantIds,
  subscribeFavoriteMerchantsChanged,
  toggleFavoriteMerchantId,
} from '@/lib/favoriteStores';
import type { Partner } from '../../types';

const NETWORK_CAROUSEL_NAV_LIGHT =
  'border-zinc-200 bg-white/95 text-neutral-900 hover:border-[#0a0a0a]/25 hover:bg-[#0a0a0a]/[0.06]';

type Props = {
  partnersWithPoints: Array<{ partner: Partner; xp: number }>;
};

export function ProfileInsightsSection({ partnersWithPoints }: Props) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isLight = theme === 'light';
  const navigate = useNavigate();
  const storesScrollRef = useRef<HTMLDivElement>(null);
  const [favoriteMerchantIds, setFavoriteMerchantIds] = useState(() => loadFavoriteMerchantIds());

  useEffect(() => {
    return subscribeFavoriteMerchantsChanged(() => {
      setFavoriteMerchantIds(loadFavoriteMerchantIds());
    });
  }, []);

  const scrollStoresStrip = useCallback((dir: 'left' | 'right') => {
    const el = storesScrollRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  }, []);

  const networkOfferCardBg = isLight ? 'bg-white' : 'bg-[color:var(--anbit-card)]';
  const networkOfferMuted = isLight ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]';

  return (
    <div
      className="w-full text-[color:var(--anbit-text)] selection:bg-anbit-brand/30"
      style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
    >
      <section className="mb-8 space-y-3 px-1 sm:px-2">
        <div className="min-w-0 space-y-1">
          <h2
            className={cn(
              'playpen-sans text-[24px] font-bold leading-tight tracking-tight sm:text-[28px]',
              isLight ? 'text-neutral-900' : 'text-anbit-text',
            )}
          >
            Οι πόντοι σου ανά κατάστημα
          </h2>
          <p
            className={cn(
              'text-sm sm:text-base',
              isLight ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]',
            )}
          >
            Κάθε συνεργαζόμενο κατάστημα κρατά ξεχωριστά XP — ίδια κάρτα με το δίκτυο Anbit.
          </p>
        </div>

        {partnersWithPoints.length === 0 ? (
          <p
            className={cn(
              'rounded-xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] py-10 text-center text-sm',
              isLight ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]',
            )}
          >
            Δεν υπάρχουν ακόμα καταστήματα. Εξερεύνησε το δίκτυο.
          </p>
        ) : (
          <div className="group relative w-full min-w-0">
            <button
              type="button"
              onClick={() => scrollStoresStrip('left')}
              className={cn(offerCarouselNavButtonClass, isLight && NETWORK_CAROUSEL_NAV_LIGHT, 'left-0')}
              aria-label="Προηγούμενα καταστήματα"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div
              ref={storesScrollRef}
              className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth snap-x snap-mandatory sm:gap-5"
            >
              {partnersWithPoints.map(({ partner, xp }, index) => (
                <div
                  key={partner.id}
                  className="w-[min(calc(50vw-1.75rem),280px)] shrink-0 snap-start sm:w-[min(300px,calc(50vw-2rem))] md:w-[min(22rem,calc(25vw-1.5rem))]"
                >
                  <QuestOfferCard
                    quest={partnerToNetworkDisplayQuest(partner, Math.round(xp))}
                    index={index}
                    t={t}
                    questsPage
                    partner={partner}
                    cardClassName={networkOfferCardBg}
                    mutedTextClassName={networkOfferMuted}
                    className="h-full w-full"
                    networkStoreCard
                    onNetworkStoreOpen={() => navigate(`/store-profile/${partner.id}`, { state: { partner } })}
                    isFavorite={favoriteMerchantIds.has(partner.id)}
                    onFavoriteToggle={() => toggleFavoriteMerchantId(partner.id)}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => scrollStoresStrip('right')}
              className={cn(offerCarouselNavButtonClass, isLight && NETWORK_CAROUSEL_NAV_LIGHT, 'right-0')}
              aria-label="Επόμενα καταστήματα"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
