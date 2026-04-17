import React from 'react';
import { ChevronRight, MapPin, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '../context/ThemeContext';
import { useFavoriteMerchant } from '@/lib/favoriteStores';
import type { Partner } from '../types';

/** Premium grid card — ring glow, glass footer, micro-interactions */
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
  const reviews = partner.reviewCount;

  return (
    <div
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-500 ease-out',
        'hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]',
        isLight
          ? 'shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.06] hover:shadow-[0_24px_48px_-12px_rgba(0,157,224,0.22)] hover:ring-[#009DE0]/35'
          : 'shadow-[0_16px_48px_-12px_rgba(0,0,0,0.75)] ring-1 ring-white/[0.12] hover:shadow-[0_28px_56px_-8px_rgba(0,157,224,0.28)] hover:ring-[#009DE0]/45',
      )}
      style={{ aspectRatio: '4/5' }}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); }
      }}
      role="button"
      tabIndex={0}
    >
      {/* Φωτογραφία */}
      {partner.image ? (
        <img
          src={partner.image}
          alt={partner.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0c1220] via-[#1a2440] to-[#009DE0]/25">
          <span className="text-5xl opacity-90 drop-shadow-lg">🏪</span>
        </div>
      )}

      {/* Vignette + depth */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(ellipse_120%_80%_at_50%_0%,rgba(0,157,224,0.22),transparent_55%)]"
        aria-hidden
      />

      {/* Shine sweep on hover */}
      <div
        className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/18 to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100"
        aria-hidden
      />

      {/* Top row */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {xp > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-[#009DE0] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-lg shadow-[#009DE0]/40">
              <Zap className="h-3 w-3 shrink-0 fill-white" />
              +{xp.toLocaleString()} XP
            </div>
          )}
          {partner.deliveryTime && (
            <span className="truncate rounded-full bg-black/45 px-2 py-1 text-[10px] font-bold text-white/95 backdrop-blur-md ring-1 ring-white/15">
              {partner.deliveryTime}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleFavorite(); }}
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200',
            favorite
              ? 'bg-[#009DE0] text-white shadow-lg shadow-[#009DE0]/35 scale-105'
              : 'bg-black/45 text-white/85 ring-1 ring-white/15 hover:bg-black/55 hover:scale-105',
          )}
          aria-label={favorite ? 'Αφαίρεση από αγαπημένα' : 'Αγαπημένο'}
        >
          <span
            className="material-symbols-outlined text-[17px]"
            style={favorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            favorite
          </span>
        </button>
      </div>

      {/* Bottom glass panel */}
      <div className="absolute inset-x-0 bottom-0 p-3 pt-10">
        <div
          className={cn(
            'relative overflow-hidden rounded-xl px-3 py-2.5 backdrop-blur-xl',
            'border border-white/15 bg-gradient-to-br from-white/14 to-white/[0.06]',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]',
          )}
        >
          <div className="mb-1.5 flex items-center gap-2">
            <div className="inline-flex items-center gap-0.5 rounded-full bg-black/35 px-1.5 py-0.5 ring-1 ring-white/10">
              <Star className="h-3 w-3 fill-[#F5C518] text-[#F5C518]" />
              <span className="text-[11px] font-black text-white">{rating.toFixed(1)}</span>
              {reviews != null && reviews > 0 && (
                <span className="text-[9px] font-semibold text-white/55">({reviews > 999 ? `${Math.floor(reviews / 1000)}k` : reviews})</span>
              )}
            </div>
            <ChevronRight
              className="ml-auto h-4 w-4 text-white/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#009DE0]"
              aria-hidden
            />
          </div>

          <h2 className="line-clamp-2 text-[15px] font-black leading-tight tracking-tight text-white drop-shadow-md sm:text-base">
            {partner.name}
          </h2>

          {partner.location && (
            <div className="mt-1 flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0 text-[#009DE0]" />
              <p className="truncate text-[11px] font-medium text-white/75">
                {partner.location}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
