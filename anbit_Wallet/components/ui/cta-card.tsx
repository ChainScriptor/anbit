import * as React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface CtaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle: React.ReactNode;
  description: string;
  buttonText: string;
  /** Εσωτερική διαδρομή SPA — το κουμπί γίνεται `Link`. */
  buttonHref?: string;
  onButtonClick?: () => void;
  /** Συγχρονισμός με `ProfilePersonalInfoSection` / theme. */
  isLight?: boolean;
  /** Στενό κάρτα κάθετα (εικόνα πάνω) — για placement δίπλα στο όνομα. */
  compact?: boolean;
}

const CtaCard = React.forwardRef<HTMLDivElement, CtaCardProps>(
  (
    {
      className,
      imageSrc,
      imageAlt,
      title,
      subtitle,
      description,
      buttonText,
      buttonHref,
      onButtonClick,
      isLight = false,
      compact = false,
      ...props
    },
    ref,
  ) => {
    const cardBg = isLight ? 'bg-white' : 'bg-[color:var(--anbit-card)]';
    const border = isLight ? 'border-zinc-200' : 'border-[color:var(--anbit-border)]';
    const heading = isLight ? 'text-neutral-900' : 'text-white';
    const desc = isLight ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]';

    const imageShell = isLight
      ? 'bg-gradient-to-br from-orange-100 to-amber-50'
      : 'bg-gradient-to-br from-orange-900/45 to-amber-950/35';

    const btnSize = compact ? 'default' : 'lg';
    const buttonNode =
      buttonHref != null && buttonHref !== '' ? (
        <Button size={btnSize} asChild>
          <Link to={buttonHref}>{buttonText}</Link>
        </Button>
      ) : (
        <Button size={btnSize} type="button" onClick={onButtonClick}>
          {buttonText}
        </Button>
      );

    return (
      <div
        ref={ref}
        className={cn(
          'flex overflow-hidden rounded-xl border shadow-sm',
          compact ? 'w-full flex-col' : 'flex-col md:flex-row',
          cardBg,
          border,
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'relative w-full shrink-0 overflow-hidden',
            compact ? 'min-h-[8.5rem]' : 'min-h-[13rem] md:w-[min(42%,300px)] md:min-h-0 md:self-stretch',
            imageShell,
          )}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            className="absolute inset-0 h-full w-full object-cover object-center"
            draggable={false}
          />
        </div>

        <div
          className={cn(
            'flex w-full flex-col justify-center',
            compact ? 'p-4' : 'p-6 md:flex-1 md:w-2/3 md:p-8',
          )}
        >
          <div>
            <p className={cn('font-semibold text-anbit-brand', compact ? 'text-xs' : 'text-sm')}>{title}</p>
            <h2
              className={cn(
                'mt-1 font-bold tracking-tight',
                compact ? 'text-lg leading-snug' : 'text-2xl md:text-3xl',
                heading,
              )}
            >
              {subtitle}
            </h2>
            <p className={cn('leading-relaxed', compact ? 'mt-2 text-xs' : 'mt-4 text-sm md:text-base', desc)}>
              {description}
            </p>
            <div className={compact ? 'mt-4' : 'mt-6'}>{buttonNode}</div>
          </div>
        </div>
      </div>
    );
  },
);
CtaCard.displayName = 'CtaCard';

export { CtaCard };
