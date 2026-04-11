import React from 'react';
import { cn } from '@/lib/utils';

/** Δημόσιο asset — ίδιο pattern με `publicUrl` στο QuestsPage. */
export function quickCategoriesRoofUrl(): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalized = base.endsWith('/') ? base : `${base}/`;
  return `${normalized}categories/roof.svg`;
}

const ROOF_H = 'clamp(2rem, 6vw, 2.75rem)';

/**
 * Σκεπή μόνο για την ενεργή στήλη· οι υπόλοιπες δεν κρατούν κενό — το strip χρησιμοποιεί `items-end` ώστε οι κάρτες να ευθυγραμμίζονται κάτω.
 */
export const QuickCategoryRoofSlot: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  return (
    <div
      className="w-full shrink-0 overflow-hidden"
      style={{ height: ROOF_H }}
      aria-hidden
    >
      <img
        src={quickCategoriesRoofUrl()}
        alt=""
        width={375}
        height={120}
        className="block h-full w-full max-w-none select-none"
        style={{
          objectFit: 'cover',
          objectPosition: 'center top',
        }}
        draggable={false}
        loading="eager"
        decoding="sync"
      />
    </div>
  );
};

/**
 * Stub για παλιούς imports / HMR.
 * @deprecated Χρησιμοποίησε `QuickCategoryRoofSlot` ή στήλη με `QuickCategoryRoofSlot`.
 */
export const QuickCategoryRoofStrip: React.FC<{ className?: string }> = () => null;

export type QuickCategoriesProps = {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  className?: string;
};

/**
 * Οριζόντια quick κατηγορίες: στήλες (`shrink-0` + `snap-start`), `items-end` ώστε οι κάρτες να ευθυγραμμίζονται·
 * μόνο η ενεργή στήλη δείχνει `QuickCategoryRoofSlot` (χωρίς κενό στις υπόλοιπες).
 */
export const QuickCategories: React.FC<QuickCategoriesProps> = ({ scrollRef, children, className }) => {
  return (
    <div className={cn('quick-categories w-full min-w-0', className)}>
      <div
        ref={scrollRef}
        className="flex items-end gap-3 overflow-x-auto overflow-y-visible pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth sm:gap-4"
      >
        {children}
      </div>
    </div>
  );
};
