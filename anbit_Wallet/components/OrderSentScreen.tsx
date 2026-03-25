import React, { useEffect } from 'react';
import { Menu, ShoppingBag, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import AnbitWordmark, { ANBIT_DISPLAY_FONT } from './AnbitWordmark';

const ACCEPTANCE_DEMO_DELAY_MS = 8000;

function formatOrderDisplayId(orderId: string | null): string {
  if (!orderId?.trim()) return '—';
  const compact = orderId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const core = (compact.slice(0, 8) || orderId.slice(0, 8)).toUpperCase();
  return `#ANB-${core}-XP`;
}

interface OrderSentScreenProps {
  orderId: string | null;
  onAccepted: () => void;
  /** Όταν true, δεν καλείται αυτόματα onAccepted μετά από 8s (χρήση με πραγματικό API/polling) */
  disableAutoAccept?: boolean;
  /** Μόνο dev: χειροκίνητη μετάβαση στην οθόνη αποδοχής παραγγελίας */
  onDevSkipToAccepted?: () => void;
}

const OrderSentScreen: React.FC<OrderSentScreenProps> = ({
  orderId,
  onAccepted,
  disableAutoAccept,
  onDevSkipToAccepted,
}) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (disableAutoAccept) return;
    const timer = setTimeout(onAccepted, ACCEPTANCE_DEMO_DELAY_MS);
    return () => clearTimeout(timer);
  }, [onAccepted, disableAutoAccept]);

  return (
    <div
      className="order-sent-screen fixed inset-0 z-[300] flex flex-col bg-[#ffffff] text-[#0a0a0a] antialiased"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <header
        className="flex h-16 shrink-0 items-center border-b border-white/10 bg-[#0a0a0a] px-5 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] sm:px-6"
        aria-label="Anbit"
      >
        <div className="grid w-full grid-cols-3 items-center">
          <div className="flex justify-start">
            <span
              className="inline-flex h-10 w-10 items-center justify-center text-white/95"
              aria-hidden
            >
              <Menu className="h-6 w-6" strokeWidth={2} />
            </span>
          </div>
          <div className="flex justify-center">
            <AnbitWordmark as="span" className="text-2xl text-white sm:text-[1.65rem]" />
          </div>
          <div className="flex justify-end">
            <span
              className="inline-flex h-10 w-10 items-center justify-center text-white/95"
              aria-hidden
            >
              <ShoppingBag className="h-6 w-6" strokeWidth={2} />
            </span>
          </div>
        </div>
      </header>

      <main className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-8 pb-10">
        <div
          className="pointer-events-none absolute -right-[12%] -top-[8%] h-[280px] w-[280px] rounded-full bg-[#0a0a0a]/[0.05] blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-[2%] -left-[8%] h-[220px] w-[220px] rounded-full bg-[#0a0a0a]/[0.04] blur-[80px]"
          aria-hidden
        />

        <div className="relative z-[1] mb-14 sm:mb-16">
          <div className="relative flex h-[140px] w-[140px] items-center justify-center">
            <div
              className="order-sent-pulse-ring absolute rounded-full bg-[#0a0a0a]"
              style={{ width: 120, height: 120 }}
            />
            <div
              className="order-sent-pulse-ring absolute rounded-full bg-[#0a0a0a]"
              style={{ width: 120, height: 120, animationDelay: '1s' }}
            />
            <div
              className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-[#0a0a0a] shadow-[0_20px_50px_-12px_rgba(10,10,10,0.45)]"
              aria-hidden
            >
              <RefreshCw
                className="h-10 w-10 text-white"
                strokeWidth={2}
                style={{ animation: 'spin 8s linear infinite' }}
              />
            </div>
          </div>
        </div>

        <div className="relative z-[1] max-w-md space-y-6 text-center">
          <h1
            className={`anbit-wordmark ${ANBIT_DISPLAY_FONT} px-1 text-2xl leading-tight tracking-tight text-[#0a0a0a] sm:text-3xl`}
          >
            {t('orderAwaitingApprovalHeadline')}
          </h1>
          <div className="space-y-2 py-2">
            <p className="font-sans text-base leading-snug text-[#0a0a0a]/85 sm:text-lg">
              {t('orderAwaitingApprovalSubtitle')}
            </p>
            <p className="font-sans text-sm italic text-[#0a0a0a]/50">{t('thankYouPatience')}</p>
          </div>
        </div>

        <div className="relative z-[1] mt-10 w-full max-w-xs space-y-4">
          <button
            type="button"
            disabled
            className="flex h-14 w-full cursor-not-allowed items-center justify-center gap-3 rounded-2xl border border-[#0a0a0a]/20 bg-[#0a0a0a] font-sans text-base font-bold text-white opacity-45"
            aria-disabled="true"
          >
            <ArrowLeft className="h-5 w-5 shrink-0" strokeWidth={2.2} />
            {t('waitingScreenNavMenu')}
          </button>
          <p className="text-center font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a]/45">
            {t('orderIdLabel')} {formatOrderDisplayId(orderId)}
          </p>
          {onDevSkipToAccepted ? (
            <button
              type="button"
              onClick={onDevSkipToAccepted}
              className="w-full rounded-2xl border border-dashed border-[#0a0a0a]/35 bg-[#0a0a0a]/[0.04] py-3 font-sans text-xs font-semibold text-[#0a0a0a]/70 transition-colors hover:border-[#0a0a0a]/50 hover:bg-[#0a0a0a]/[0.07] active:scale-[0.99]"
            >
              {t('devSimulateOrderAccept')}
            </button>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default OrderSentScreen;
