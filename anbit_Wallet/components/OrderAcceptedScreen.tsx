import React from 'react';
import {
  Menu,
  ShoppingBag,
  Check,
  UtensilsCrossed,
  ConciergeBell,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import AnbitWordmark, { ANBIT_DISPLAY_FONT } from './AnbitWordmark';

const BRAND_RED = '#e63533';
const XP_GOLD = '#ca8a04';

/** Όλο το κείμενο: Omnes Bold Italic (AnbitFont / public/fonts/OmnesBoldItalic.ttf) */
const ORDER_BODY_FONT =
  'font-anbit font-normal not-italic normal-case tracking-tight [font-synthesis:none] leading-normal';

export type OrderReceiptLine = {
  name: string;
  quantity: number;
  unitPrice: number;
};

function formatOrderRef(orderId: string | null | undefined): string {
  if (!orderId?.trim()) return '—';
  const compact = orderId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const core = (compact.slice(0, 8) || orderId.slice(0, 8)).toUpperCase();
  return `AB-${core.slice(0, 6)}`;
}

interface OrderAcceptedScreenProps {
  pin: string;
  tableNumber?: number;
  xpEarned?: number;
  partnerName: string;
  orderId: string | null;
  orderLines: OrderReceiptLine[] | null;
  /** Από API· αν λείπει, υπολογίζεται από τις γραμμές */
  orderTotalEur: number | null;
  onBack: () => void;
}

const OrderAcceptedScreen: React.FC<OrderAcceptedScreenProps> = ({
  pin,
  tableNumber = 1,
  xpEarned = 0,
  partnerName,
  orderId,
  orderLines,
  orderTotalEur,
  onBack,
}) => {
  const { t } = useLanguage();
  const lines = orderLines ?? [];
  const sumLines = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const total = orderTotalEur != null && !Number.isNaN(orderTotalEur) ? orderTotalEur : sumLines;
  const pinDigits = pin.replace(/\D/g, '').slice(0, 6);
  const pinFormatted =
    pinDigits.length >= 6 ? `${pinDigits.slice(0, 3)}-${pinDigits.slice(3, 6)}` : pin || '—';

  return (
    <div
      className={`flex min-h-screen flex-col bg-[#ffffff] text-[#0a0a0a] antialiased ${ORDER_BODY_FONT}`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center border-b border-white/10 bg-[#0a0a0a] px-5 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] sm:px-6">
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center text-white/85 transition-transform active:scale-95"
            aria-label={t('back')}
          >
            <Menu className="h-6 w-6" strokeWidth={2} />
          </button>
          <AnbitWordmark as="span" className="text-2xl text-white sm:text-[1.65rem]" />
          <span className="flex h-10 w-10 items-center justify-center text-white/85" aria-hidden>
            <ShoppingBag className="h-6 w-6" strokeWidth={2} />
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 space-y-8 overflow-y-auto px-6 pb-[calc(8.35rem+env(safe-area-inset-bottom))] pt-6">
        <section className="space-y-4 py-2 text-center">
          <div
            className={`inline-block rounded-full border border-white/10 bg-[#0a0a0a] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/50 ${ORDER_BODY_FONT}`}
          >
            {t('inStoreDining')}
          </div>
          <p
            className={`anbit-wordmark ${ANBIT_DISPLAY_FONT} px-1 text-3xl tracking-tight text-[#0a0a0a] sm:text-4xl`}
          >
            {t('orderPreparingTitle')}
          </p>
          <p className="text-base font-medium text-[#0a0a0a]/60">{t('orderPreparingSubtitle')}</p>
        </section>

        <section className="flex flex-col items-center justify-center space-y-2 rounded-2xl border border-white/10 bg-[#0a0a0a] p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/45">
            {t('servingToTable')}
          </p>
          <p className="text-5xl font-black tracking-tighter text-white sm:text-6xl">T-{tableNumber}</p>
          <div className="mt-2 h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_RED }} />
          <p className="mt-4 text-xs text-white/40">
            {t('pin')}:{' '}
            <span className="text-sm font-bold tracking-wider text-white/90">{pinFormatted}</span>
          </p>
          <p className="max-w-xs text-[11px] leading-snug text-white/35">{t('pinHint')}</p>
        </section>

        <section className="relative px-2 py-6 sm:px-4">
          <div className="relative mx-auto flex max-w-sm justify-between">
            <div
              className="absolute left-0 top-5 z-0 h-0.5 w-full rounded-full bg-[#0a0a0a]/12"
              aria-hidden
            />
            <div
              className="absolute left-0 top-5 z-0 h-0.5 w-1/2 rounded-full"
              style={{ backgroundColor: BRAND_RED }}
              aria-hidden
            />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#ffffff] shadow-sm"
                style={{ backgroundColor: BRAND_RED }}
              >
                <Check className="h-4 w-4 text-white" strokeWidth={3} />
              </div>
              <span className="max-w-[4.5rem] whitespace-pre-line text-center text-[10px] font-bold uppercase leading-tight tracking-tight text-[#0a0a0a]/45">
                {t('trackerOrderReceived')}
              </span>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#ffffff] shadow-[0_0_15px_rgba(230,53,51,0.45)]"
                style={{ backgroundColor: BRAND_RED }}
              >
                <UtensilsCrossed className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="max-w-[4.5rem] whitespace-pre-line text-center text-[10px] font-bold uppercase leading-tight tracking-tight text-[#0a0a0a]">
                {t('trackerPreparingFood')}
              </span>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#ffffff] bg-[#0a0a0a]/35 shadow-sm">
                <ConciergeBell className="h-4 w-4 text-white/35" strokeWidth={2} />
              </div>
              <span className="max-w-[4.5rem] whitespace-pre-line text-center text-[10px] font-bold uppercase leading-tight tracking-tight text-[#0a0a0a]/40">
                {t('trackerBeingServed')}
              </span>
            </div>
          </div>
        </section>

        <section className="space-y-6 rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-lg font-bold text-white">{t('orderNumberShort', { id: formatOrderRef(orderId) })}</p>
              <p className="mt-1 text-sm text-white/45">{t('orderAcceptedDiningAt', { name: partnerName })}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-white/45">{t('total')}</p>
              <p className="text-xl font-black text-white">€{total.toFixed(2)}</p>
              {xpEarned > 0 && (
                <div className="mt-1 flex items-center justify-end gap-1" style={{ color: XP_GOLD }}>
                  <Sparkles className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    +{xpEarned} {t('xpEarnedShort')}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-white/10 pt-4">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/45">
              {t('yourSelection')}
            </p>
            <div className="space-y-3">
              {lines.length === 0 ? (
                <p className="text-sm text-white/40">{t('orderItemsUnavailable')}</p>
              ) : (
                lines.map((line, i) => (
                  <div key={`${line.name}-${i}`} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 text-white/80">
                      {line.quantity}× {line.name}
                    </span>
                    <span className="shrink-0 font-medium text-white">
                      €{(line.unitPrice * line.quantity).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <div className="py-2 text-center">
          <button
            type="button"
            className="text-xs font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/45 transition-colors hover:text-[#0a0a0a]"
          >
            {t('needHelpAlertStaff')}
          </button>
        </div>
      </main>
    </div>
  );
};

export default OrderAcceptedScreen;
