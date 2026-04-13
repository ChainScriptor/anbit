import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '../context/ThemeContext';
import { useFavoriteMerchant } from '@/lib/favoriteStores';
import type { Partner } from '../types';

const NETWORK_STORE_CARD_BG_DARK = 'bg-[#1e1e1e]';
const NETWORK_STORE_CARD_BG_LIGHT = 'bg-white';

function formatDeliveryLabel(partner: Partner): string {
  const raw = partner.deliveryTime;
  if (!raw || raw === '—') return '20-30 λεπτά';
  const cleaned = raw.replace(/'/g, '').replace(/\s*-\s*/g, '-');
  return `${cleaned} λεπτά`;
}

function formatFeeLabel(partner: Partner): string {
  const m = partner.minOrder;
  if (!m || m === '—') return '0,00 €';
  return m.includes('€') ? m.replace('€', ' €').trim() : `${m} €`;
}

/** Κάρτα καταστήματος — ίδιο UI με `/network`. */
export function NetworkStoreCard({
  partner,
  xp,
  onOpen,
}: {
  partner: Partner;
  xp: number;
  onOpen: () => void;
}) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [favorite, toggleFavorite] = useFavoriteMerchant(partner.id);
  const img = partner.image;
  const rating = partner.rating ?? 9.2;

  const activate = () => onOpen();

  return (
    <div
      className={cn(
        'group relative flex w-full cursor-pointer items-stretch overflow-hidden rounded-lg border shadow-md transition-all duration-300',
        isLight
          ? cn(NETWORK_STORE_CARD_BG_LIGHT, 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50')
          : cn(NETWORK_STORE_CARD_BG_DARK, 'border-white/[0.08] hover:border-white/12 hover:bg-[#262626]'),
      )}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      }}
      role="button"
      tabIndex={0}
      style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden sm:h-[4.5rem] sm:w-[4.5rem]">
        {img ? (
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            draggable={false}
          />
        ) : (
          <div className={cn('h-full w-full', isLight ? 'bg-zinc-200' : 'bg-[#1f1f1f]')} />
        )}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-r to-transparent',
            isLight ? 'from-black/10' : 'from-black/25',
          )}
        />
      </div>
      <div
        className={cn(
          'min-w-0 flex-1 py-2.5 pl-2.5 pr-10 sm:pr-11',
          isLight ? 'text-neutral-900' : 'text-[#e5e5e5]',
        )}
      >
        <div className="flex items-center gap-1.5">
          <h2
            className={cn(
              'truncate text-sm font-semibold uppercase leading-tight tracking-tight',
              isLight ? 'text-neutral-900' : 'text-white',
            )}
          >
            {partner.name}
          </h2>
          <span
            className={cn(
              'shrink-0 rounded-sm px-1 py-px text-[7px] font-semibold uppercase leading-none tracking-tight text-white',
              isLight ? 'bg-[#0a0a0a]' : 'bg-anbit-brand/90',
            )}
          >
            Anbit+
          </span>
        </div>
        <p
          className={cn(
            'mt-0.5 line-clamp-1 text-[10px] font-medium',
            isLight ? 'text-neutral-600' : 'text-[#ababab]',
          )}
        >
          <span>{formatFeeLabel(partner)}</span>
          <span
            className={cn(
              'mx-1 inline-block h-0.5 w-0.5 rounded-full align-middle',
              isLight ? 'bg-zinc-400' : 'bg-[#484848]',
            )}
          />
          <span>{formatDeliveryLabel(partner)}</span>
          <span
            className={cn(
              'mx-1 inline-block h-0.5 w-0.5 rounded-full align-middle',
              isLight ? 'bg-zinc-400' : 'bg-[#484848]',
            )}
          />
          <span className="inline-flex items-center gap-0.5">
            {rating.toFixed(1)}
            <span
              className="material-symbols-outlined text-[12px] text-sky-400"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              sentiment_satisfied
            </span>
          </span>
        </p>
        <p
          className={cn(
            'mt-1 text-sm font-bold leading-none',
            isLight ? 'text-neutral-900' : 'text-white',
          )}
        >
          {xp.toLocaleString()} XP
        </p>
      </div>
      <div className="absolute right-1 top-1 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite();
          }}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-colors duration-300',
            isLight
              ? cn(
                  'border border-zinc-200 bg-zinc-100 text-neutral-600 hover:bg-zinc-200',
                  favorite && 'border-[#2563eb] bg-[#2563eb] text-white hover:bg-[#1d4ed8]',
                )
              : cn(
                  'bg-[#262626]/80 text-white hover:bg-[#2563eb]/90',
                  favorite && 'bg-[#2563eb]',
                ),
          )}
          aria-label={favorite ? 'Αφαίρεση από αγαπημένα' : 'Αγαπημένα'}
        >
          <span
            className="material-symbols-outlined text-[16px]"
            style={favorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            favorite
          </span>
        </button>
      </div>
    </div>
  );
}
