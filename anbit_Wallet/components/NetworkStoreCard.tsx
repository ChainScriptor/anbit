import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '../context/ThemeContext';
import { useFavoriteMerchant } from '@/lib/favoriteStores';
import type { Partner } from '../types';

function formatDeliveryTime(partner: Partner): string {
  const raw = partner.deliveryTime;
  if (!raw || raw === '—') return '20-30 λεπτ.';
  const cleaned = raw.replace(/'/g, '').replace(/\s*-\s*/g, '-');
  return `${cleaned} λεπτ.`;
}

function formatMinOrder(partner: Partner): string {
  const m = partner.minOrder;
  if (!m || m === '—') return '0 €';
  return m.includes('€') ? m.replace('€', ' €').trim() : `${m} €`;
}

function getRatingEmoji(rating: number): string {
  if (rating >= 9.5) return '🤩';
  if (rating >= 9.0) return '😄';
  if (rating >= 8.5) return '😊';
  return '🙂';
}

/** Wolt-style vertical κάρτα καταστήματος */
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
  const rating = partner.rating ?? 9.2;
  const minOrder = formatMinOrder(partner);
  const deliveryTime = formatDeliveryTime(partner);
  const isFreeDelivery = minOrder === '0 €' || minOrder.startsWith('0');

  return (
    <div
      className={cn(
        'group relative flex flex-col cursor-pointer overflow-hidden rounded-xl transition-all duration-200',
        isLight
          ? 'bg-white shadow-sm hover:shadow-md border border-[#E8E8E8]'
          : 'bg-[#1e1e1e] border border-white/[0.08] hover:bg-[#262626]',
      )}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); }
      }}
      role="button"
      tabIndex={0}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", sans-serif' }}
    >
      {/* Εικόνα */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {partner.image ? (
          <img
            src={partner.image}
            alt={partner.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            draggable={false}
          />
        ) : (
          <div className={cn('h-full w-full flex items-center justify-center', isLight ? 'bg-[#F2F2F2]' : 'bg-[#2a2a2a]')}>
            <span className="text-4xl">🏪</span>
          </div>
        )}

        {/* Δωρεάν delivery badge */}
        {isFreeDelivery && (
          <div className="absolute top-2 left-2 rounded-full bg-[#EDFBEB] px-2 py-0.5 text-[10px] font-semibold text-[#1a7a4a]">
            0 € delivery
          </div>
        )}

        {/* XP badge */}
        {xp > 0 && (
          <div className="absolute top-2 right-10 rounded-full bg-[#009DE0] px-2 py-0.5 text-[10px] font-bold text-white">
            +{xp.toLocaleString()} XP
          </div>
        )}

        {/* Favorite button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleFavorite(); }}
          className={cn(
            'absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-colors',
            favorite
              ? 'bg-[#009DE0] text-white'
              : 'bg-white/90 text-[#717171] hover:text-[#009DE0]',
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

      {/* Πληροφορίες καταστήματος */}
      <div className={cn('flex-1 px-3 py-2.5', isLight ? 'text-[#202125]' : 'text-[#e5e5e5]')}>
        {/* Όνομα */}
        <h2 className={cn('text-sm font-bold leading-tight truncate', isLight ? 'text-[#202125]' : 'text-white')}>
          {partner.name}
        </h2>

        {/* Τοποθεσία / κατηγορία */}
        {partner.location && (
          <p className={cn('mt-0.5 text-xs line-clamp-1', isLight ? 'text-[#717171]' : 'text-[#ababab]')}>
            📍 {partner.location}
          </p>
        )}

        {/* Rating + delivery info */}
        <div className={cn('mt-1.5 flex items-center gap-2 text-[11px]', isLight ? 'text-[#717171]' : 'text-[#ababab]')}>
          <span className="flex items-center gap-0.5 font-semibold">
            <span>{getRatingEmoji(rating)}</span>
            <span className={isLight ? 'text-[#202125]' : 'text-white'}>{rating.toFixed(1)}</span>
          </span>
          <span>·</span>
          <span>{deliveryTime}</span>
          {!isFreeDelivery && (
            <>
              <span>·</span>
              <span>ελ. {minOrder}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
