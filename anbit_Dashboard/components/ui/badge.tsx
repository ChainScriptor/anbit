import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'success';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  ...props
}) => {
  const base =
    'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium';
  const styles =
    variant === 'outline'
      ? 'border-slate-200 text-slate-700 bg-white'
      : variant === 'success'
      ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
      : 'border-slate-900 bg-slate-900 text-white';

  return (
    <div className={cn(base, styles, className)} {...props} />
  );
};

