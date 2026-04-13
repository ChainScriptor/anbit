import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '../../context/ThemeContext';

/**
 * Custom listbox αντί για native `<select>` — light: accent #0a0a0a, dark: brand #2563eb
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
  const { theme } = useTheme();
  const isLight = theme === 'light';
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
          'flex h-10 w-full min-w-[9.5rem] items-center justify-between gap-2 rounded-lg border px-3 text-left text-sm font-medium transition-colors focus:outline-none focus:ring-2 sm:min-w-[13rem] md:min-w-[15rem]',
          isLight
            ? 'border-zinc-200 bg-white text-neutral-900 focus:border-[#0a0a0a]/45 focus:ring-[#0a0a0a]/12'
            : 'border-anbit-border bg-anbit-card text-anbit-text focus:border-anbit-brand/40 focus:ring-anbit-brand/15',
          triggerClassName,
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 transition-transform duration-200',
            isLight ? 'text-zinc-500' : 'text-[#9a9a9a]',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          className={cn(
            'absolute left-0 right-0 z-[60] mt-1 max-h-64 overflow-auto rounded-lg border py-1 shadow-xl',
            isLight
              ? 'border-zinc-200 bg-white ring-1 ring-black/5'
              : 'border-anbit-border bg-[#131313] ring-1 ring-white/10',
          )}
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
                    'flex w-full px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none',
                    isLight
                      ? cn(
                          isSelected
                            ? 'bg-[#0a0a0a] text-white'
                            : 'text-neutral-900 hover:bg-zinc-100',
                          'focus-visible:bg-[#0a0a0a] focus-visible:text-white',
                        )
                      : cn(
                          isSelected
                            ? 'bg-[#2563eb]/30 text-white'
                            : 'text-[#e5e5e5] hover:bg-[#2563eb] hover:text-white',
                          'focus-visible:bg-[#2563eb] focus-visible:text-white',
                        ),
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
