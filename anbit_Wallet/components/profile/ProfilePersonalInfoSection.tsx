import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { CtaCard } from '../ui/cta-card';
import type { UserData } from '../../types';

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0]?.[0] ?? '?').toUpperCase();
}

function tierLabel(user: UserData): string {
  const raw = (user.currentLevelName || `Επίπεδο ${user.currentLevel}`).trim();
  return raw.toUpperCase();
}

type Props = {
  user: UserData;
  isLight: boolean;
};

/** Πάνω μπλοκ προφίλ + δύο κάρτες (στυλ παρόμοιο με Wolt / mockup). */
export function ProfilePersonalInfoSection({ user, isLight }: Props) {
  const initials = initialsFromName(user.name);
  const email = user.email?.trim() || '—';
  const phone = user.phone?.trim() || '—';

  const shell = isLight
    ? 'rounded-2xl border border-zinc-200 bg-white shadow-sm'
    : 'rounded-2xl border border-white/[0.08] bg-[#0c0c0c]';

  const subCard = isLight
    ? 'rounded-xl border border-zinc-200 bg-zinc-50/80 p-5 sm:p-6'
    : 'rounded-xl border border-white/[0.06] bg-[#141414] p-5 sm:p-6';

  const muted = isLight ? 'text-neutral-600' : 'text-[#a0a0a0]';
  const strong = isLight ? 'text-neutral-900' : 'text-white';

  return (
    <div className="space-y-6">
      <section className={cn('p-5 sm:p-6 md:p-8', shell)}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)] lg:items-start">
          {/* Avatar + actions */}
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <div
              className={cn(
                'flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center rounded-full text-xl font-bold tracking-tight sm:h-24 sm:w-24 sm:text-2xl',
                isLight ? 'bg-[#f5e6c8] text-neutral-800' : 'bg-[#f5e6c8] text-[#2d2d2d]',
              )}
              aria-hidden
            >
              {initials}
            </div>
            <div className="flex flex-col items-center gap-1 text-sm sm:items-start">
              <Link
                to="/settings"
                className="font-medium text-sky-500 transition-colors hover:text-sky-400"
              >
                Επεξεργασία
              </Link>
              <Link
                to="/security"
                className="font-medium text-red-600 transition-colors hover:text-red-500 dark:text-red-500 dark:hover:text-red-400"
              >
                Διαγραφή
              </Link>
            </div>
          </div>

          {/* Όνομα + στοιχεία · στενό CtaCard δεξιά (από md) */}
          <div className="flex min-w-0 flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-5">
            <div className="min-w-0 flex-1 space-y-5">
              <h2
                className={cn(
                  'text-lg font-bold uppercase leading-tight tracking-wide sm:text-xl md:text-2xl',
                  strong,
                )}
              >
                {user.name}
              </h2>
              <div className="space-y-1">
                <p className={cn('text-sm font-bold', strong)}>Email</p>
                <p className={cn('truncate text-sm', isLight ? 'text-neutral-700' : 'text-white/90')}>
                  {email}
                </p>
              </div>
              <div className="space-y-1">
                <p className={cn('text-sm font-bold', strong)}>Αριθμός τηλεφώνου</p>
                <p className={cn('text-sm', isLight ? 'text-neutral-700' : 'text-white/90')}>{phone}</p>
              </div>
            </div>
            <div className="w-full max-w-[min(100%,280px)] shrink-0 md:max-w-[240px] lg:max-w-[260px]">
              <CtaCard
                compact
                isLight={isLight}
                title="Anbit+"
                subtitle={tierLabel(user)}
                description="Συγκεντρώνεις XP σε κάθε συνεργαζόμενο κατάστημα. Δες quests και προσφορές για να ανεβάσεις επίπεδο και να ξεκλειδώνεις rewards."
                buttonText="Δες περισσότερα"
                buttonHref="/quests"
                imageSrc="/xp.gif"
                imageAlt=""
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <section className={cn(subCard, 'flex min-h-[11rem] flex-col')}>
          <h3 className={cn('text-base font-bold', strong)}>Δωροκάρτες Anbit</h3>
          <p className={cn('mt-2 flex-1 text-sm leading-relaxed', muted)}>
            Μπορείς να χρησιμοποιήσεις δωροκάρτες για την πληρωμή των παραγγελιών σου.
          </p>
          <Link
            to="/profile/redeem"
            className="mt-4 inline-flex w-fit text-sm font-semibold text-sky-500 hover:text-sky-400"
          >
            Προβολή δωροκαρτών
          </Link>
        </section>

        <section className={cn(subCard, 'relative flex min-h-[11rem] flex-col')}>
          <div className="flex items-start justify-between gap-3">
            <h3 className={cn('text-base font-bold', strong)}>Κουπόνια Anbit</h3>
            <span className={cn('shrink-0 text-base font-semibold tabular-nums', strong)}>0,00 €</span>
          </div>
          <p className={cn('mt-2 text-sm leading-relaxed', muted)}>
            Μπορείς να χρησιμοποιήσεις τα κουπόνια σου για να πληρώνεις τις παραγγελίες σου.
          </p>
        </section>
      </div>
    </div>
  );
}
