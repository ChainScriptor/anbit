import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const BG = '#0a0a0a';
const BLOCK = '#1a1a1a';

/** Λεπτό φως που διατρέχει αριστερά → δεξιά (Anbit Noir). */
function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]', className)} aria-hidden>
      <motion.div
        className="absolute inset-y-0 w-[42%] max-w-[180px] bg-gradient-to-r from-transparent via-white/[0.11] to-transparent"
        style={{ skewX: -12 }}
        initial={{ x: '-120%' }}
        animate={{ x: '320%' }}
        transition={{
          duration: 2.15,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

function SkeletonBlock({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-lg', className)}
      style={{ backgroundColor: BLOCK }}
      {...rest}
    >
      <Shimmer />
      {children}
    </div>
  );
}

function CategoryOrb({ className }: { className?: string }) {
  return <SkeletonBlock className={cn('aspect-square shrink-0 rounded-2xl', className)} />;
}

function MerchantCardSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <SkeletonBlock className="aspect-video w-full overflow-hidden rounded-xl" />
      <div className="flex flex-col gap-2 px-0.5">
        <SkeletonBlock className="h-2.5 w-[88%] rounded-full" />
        <SkeletonBlock className="h-2 w-[62%] rounded-full" />
        <SkeletonBlock className="h-2 w-[44%] rounded-full" />
      </div>
    </div>
  );
}

const CATEGORY_COUNT = 9;
const GRID_CARD_COUNT = 8;

export type NetworkSkeletonProps = {
  className?: string;
};

/**
 * Wolt-style loading shell — Anbit Noir (#0a0a0a / #1a1a1a) με shimmer.
 * Πλέγμα: 1 στήλη mobile → 4 στήλες xl (16:9 κάρτες + γραμμές κειμένου).
 */
export const NetworkSkeleton: React.FC<NetworkSkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn('min-w-0 space-y-8 pb-24 md:space-y-10', className)}
      style={{ backgroundColor: BG, fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
      aria-busy="true"
      aria-label="Φόρτωση καταστημάτων"
    >
      {/* Header placeholder */}
      <SkeletonBlock className="h-11 w-full max-w-3xl rounded-xl md:h-12" />

      {/* Category circles — οριζόντια σειρά (Wolt-style strip) */}
      <div className="-mx-1 flex gap-3 overflow-x-auto pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {Array.from({ length: CATEGORY_COUNT }, (_, i) => (
          <CategoryOrb key={i} className="h-14 w-14 sm:h-16 sm:w-16" />
        ))}
      </div>

      {/* Merchant grid: 1 → 2 (sm/md) → 4 (xl) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-5 md:gap-6 xl:grid-cols-4">
        {Array.from({ length: GRID_CARD_COUNT }, (_, i) => (
          <MerchantCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export default NetworkSkeleton;
