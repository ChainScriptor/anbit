import React from 'react';
import { cn } from '@/lib/utils';

export type QuickCategoriesProps = {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  className?: string;
};

/**
 * Οριζόντια quick κατηγορίες: στήλες (`shrink-0` + `snap-start`).
 */
export const QuickCategories: React.FC<QuickCategoriesProps> = ({ scrollRef, children, className }) => {
  return (
    <div className={cn('quick-categories w-full min-w-0', className)}>
      <div
        ref={scrollRef}
        className="flex items-start gap-3 overflow-x-auto overflow-y-visible pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth sm:gap-4"
      >
        {children}
      </div>
    </div>
  );
};
