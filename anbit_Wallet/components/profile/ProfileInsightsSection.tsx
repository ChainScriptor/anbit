import React, { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { offerCarouselNavButtonClass } from '../ui/offer-carousel';
import { NetworkStoreCard } from '../NetworkStoreCard';
import type { Partner } from '../../types';

const NETWORK_CAROUSEL_NAV_LIGHT =
  'border-zinc-200 bg-white/95 text-neutral-900 hover:border-[#0a0a0a]/25 hover:bg-[#0a0a0a]/[0.06]';

type Props = {
  partnersWithPoints: Array<{ partner: Partner; xp: number }>;
};

export function ProfileInsightsSection({ partnersWithPoints }: Props) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const navigate = useNavigate();
  const storesScrollRef = useRef<HTMLDivElement>(null);

  const scrollStoresStrip = useCallback((dir: 'left' | 'right') => {
    const el = storesScrollRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  }, []);

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
            Κάθε συνεργαζόμενο κατάστημα κρατά ξεχωριστά XP — ίδια εμφάνιση με το δίκτυο, με τους πόντους σου.
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
              className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
            >
              {partnersWithPoints.map(({ partner, xp }) => (
                <div
                  key={partner.id}
                  className="w-[min(100vw-2.5rem,280px)] shrink-0 snap-start sm:w-[300px] md:w-[min(22rem,85vw)]"
                >
                  <NetworkStoreCard
                    partner={partner}
                    xp={Math.round(xp)}
                    onOpen={() => navigate(`/store-profile/${partner.id}`, { state: { partner } })}
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
