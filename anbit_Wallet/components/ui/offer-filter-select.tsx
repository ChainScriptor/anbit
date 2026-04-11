import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Custom listbox αντί για native `<select>` ώστε hover/focus στις επιλογές να χρησιμοποιούν #e63533
 * (τα `<option>` δεν επιδέχονται styling στους περισσότερους browsers).
 */
export function OfferFilterSelect({
  value,
  onChange,
  options,
  className,
  triggerClassName,
  'aria-label': ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  triggerClassName?: string;
  'aria-label'?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div ref={rootRef} className={cn('relative shrink-0', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-10 w-full min-w-[9.5rem] items-center justify-between gap-2 rounded-lg border border-anbit-border bg-anbit-card px-3 text-left text-sm font-medium text-anbit-text transition-colors focus:border-[#e63533] focus:outline-none focus:ring-2 focus:ring-[#e63533]/40 sm:min-w-[13rem] md:min-w-[15rem]',
          triggerClassName,
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-[#9a9a9a] transition-transform duration-200', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-[60] mt-1 max-h-64 overflow-auto rounded-lg border border-anbit-border bg-[#131313] py-1 shadow-xl ring-1 ring-white/10"
        >
          {options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <li key={opt.value === '' ? '__all' : opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full px-3 py-2.5 text-left text-sm font-medium transition-colors',
                    isSelected
                      ? 'bg-[#e63533]/30 text-white'
                      : 'text-[#e5e5e5] hover:bg-[#e63533] hover:text-white',
                    'focus-visible:bg-[#e63533] focus-visible:text-white focus-visible:outline-none',
                  )}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
