import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CreditCard,
  ChevronDown,
  Zap,
  LogIn,
  UserPlus,
  Plus,
  Minus,
  Pencil,
  Star,
  Wallet,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { CartItemData } from '../types';
import AnbitWordmark, { ANBIT_DISPLAY_FONT } from './AnbitWordmark';

const BRAND_RED = 'var(--anbit-brand)';
const BRAND_BLACK = '#0a0a0a';

function CheckoutFooterWave() {
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-6 h-6 overflow-hidden" aria-hidden>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-full w-full">
        <path
          d="M0,64 C120,24 240,24 360,64 C480,104 600,104 720,64 C840,24 960,24 1080,64 C1140,84 1170,94 1200,104 L1200,120 L0,120 Z"
          fill={BRAND_BLACK}
        />
        <path
          d="M0,68 C120,28 240,28 360,68 C480,108 600,108 720,68 C840,28 960,28 1080,68 C1140,88 1170,98 1200,108"
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1.75"
        />
      </svg>
    </div>
  );
}

export type PaymentMethod = 'cash' | 'card' | 'xp' | 'online';

interface CartCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItemData[];
  totalEur: number;
  totalXp: number;
  isAuthenticated: boolean;
  onOpenLogin?: (onSuccess?: () => void) => void;
  onOpenRegister?: (onSuccess?: () => void) => void;
  onConfirm: (paymentMethod: PaymentMethod, earnXp: boolean) => void;
  /** Όταν true, το κουμπί confirm δείχνει loading και δεν κλείνει το modal (το κλείνει το parent μετά από επιτυχία) */
  isSubmitting?: boolean;
  error?: string | null;
}

const CartCheckoutModal: React.FC<CartCheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  totalEur,
  totalXp,
  isAuthenticated,
  onOpenLogin,
  onOpenRegister,
  onConfirm,
  isSubmitting = false,
  error: externalError = null,
}) => {
  const { t } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [showTotalDetail, setShowTotalDetail] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen]);

  if (!isOpen) return null;

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = totalEur;
  const grandTotal = subtotal;
  const redeemableDiscount = Math.min(5, Math.floor(totalXp / 100));

  const handleConfirm = () => {
    if (paymentMethod === 'online') return;
    if (!isAuthenticated && totalXp > 0 && onOpenLogin && onOpenRegister) {
      setStep(2);
      return;
    }
    onConfirm(paymentMethod, isAuthenticated && totalXp > 0);
  };

  const handleContinueAsGuest = () => {
    onConfirm(paymentMethod, false);
    onClose();
  };

  const handleSignInToEarn = () => {
    onOpenLogin?.(() => {
      onConfirm(paymentMethod, true);
      onClose();
    });
  };

  const handleRegisterToEarn = () => {
    onOpenRegister?.(() => {
      onConfirm(paymentMethod, true);
      onClose();
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[270] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50"
        />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative flex h-[100dvh] max-h-[100dvh] w-full max-w-lg flex-col overflow-hidden bg-white text-[#0a0a0a] shadow-2xl sm:rounded-3xl"
        >
          <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 bg-[#0a0a0a] px-5 sm:px-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.12] text-white transition-transform hover:bg-white/20 active:scale-95"
              >
                <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
              </button>
              <AnbitWordmark className="text-white text-[1.65rem] sm:text-[1.85rem]" />
            </div>
            <div className={`anbit-wordmark ${ANBIT_DISPLAY_FONT} text-base text-white/55 sm:text-lg`}>
              Checkout
            </div>
          </header>

          <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-52 pt-6 sm:px-6 sm:pb-56">
            {step === 2 ? (
              <>
                <div className="mb-6 rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 text-white shadow-[0_16px_40px_-12px_rgba(10,10,10,0.35)]">
                  <div className="mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-anbit-brand" strokeWidth={2} />
                    <h3 className="text-base font-bold text-white">{t('earnXpTitle')}</h3>
                  </div>
                  <p className="mb-4 text-sm text-white/65">{t('xpEarnShort', { count: totalXp })}</p>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleSignInToEarn}
                      className="flex w-full items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                    >
                      <LogIn className="h-5 w-5" strokeWidth={2} />
                      {t('earnXpSignIn', { count: totalXp })}
                    </button>
                    <button
                      type="button"
                      onClick={handleRegisterToEarn}
                      className="flex w-full items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.14]"
                    >
                      <UserPlus className="h-5 w-5" strokeWidth={2} />
                      {t('earnXpRegister', { count: totalXp })}
                    </button>
                    <button
                      type="button"
                      onClick={handleContinueAsGuest}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-black/45"
                    >
                      {t('continueAsGuest')}
                    </button>
                  </div>
                </div>
                <img
                  src="/maskot.jpg"
                  alt=""
                  decoding="async"
                  className="mx-auto block h-auto w-full max-h-[min(420px,52vh)] max-w-[min(100%,520px)] object-contain object-bottom sm:max-h-[min(520px,50vh)] sm:max-w-[min(100%,640px)]"
                />
              </>
            ) : (
              <>
                <section className="mb-10 space-y-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#0a0a0a] sm:text-4xl">
                      Your Selection
                    </h2>
                    <span className="shrink-0 text-sm font-medium text-[#0a0a0a]/50">
                      {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                    </span>
                  </div>
                  <div className="grid gap-4">
                    {cart.map((item, i) => (
                      <div
                        key={`${item.id}-${i}`}
                        className="group relative flex gap-4 rounded-xl border border-white/10 bg-[#0a0a0a] p-4 text-white shadow-[0_12px_32px_-10px_rgba(10,10,10,0.45)] transition-all sm:gap-5"
                      >
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-white/10">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex min-w-0 flex-grow flex-col justify-between py-0.5">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="line-clamp-2 text-lg font-bold leading-snug text-white">{item.name}</h3>
                              <span className="shrink-0 text-lg font-bold text-white">
                                €{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm text-white/55">
                              {[item.options?.extras, item.comments].filter(Boolean).join(', ') || item.description}
                            </p>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-3 rounded-full border border-white/15 bg-black/40 px-3 py-1">
                              <button type="button" className="cursor-not-allowed text-white/35" aria-hidden>
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-4 text-center text-sm font-bold text-white">{item.quantity}</span>
                              <button type="button" className="cursor-not-allowed text-white/35" aria-hidden>
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <button
                              type="button"
                              className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-white/45 transition-colors hover:text-white"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {totalXp > 0 && (
                  <section className="mb-10">
                    <div className="group relative overflow-hidden rounded-xl border border-anbit-brand/35 bg-[#0a0a0a] p-5 shadow-[0_16px_40px_-12px_rgba(10,10,10,0.4)] sm:p-6">
                      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-anbit-brand/15 blur-3xl" aria-hidden />
                      <div className="relative flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 shrink-0 fill-anbit-brand text-anbit-brand sm:h-6 sm:w-6" strokeWidth={2} />
                            <span className="flex flex-wrap items-baseline gap-1.5 font-extrabold uppercase tracking-tight text-white">
                              <AnbitWordmark className="text-sm text-white sm:text-base" /> Loyalty
                            </span>
                          </div>
                          <p className="text-base font-medium text-white/85 sm:text-lg">
                            Apply your {totalXp} XP for a{' '}
                            <span className="font-bold text-anbit-brand underline decoration-anbit-brand/80">
                              €{redeemableDiscount.toFixed(0)} discount
                            </span>
                          </p>
                        </div>
                        <button
                          type="button"
                          className="shrink-0 rounded-full px-6 py-3 text-sm font-bold text-white transition-transform active:scale-95"
                          style={{ backgroundColor: BRAND_RED }}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                <section className="mb-10 space-y-6">
                  <h2 className="text-xl font-bold text-[#0a0a0a] sm:text-2xl">Payment Method</h2>
                  <div className="grid grid-cols-3 gap-3">
                    <label className="cursor-pointer">
                      <input
                        className="peer sr-only"
                        name="payment-checkout"
                        type="radio"
                        checked={paymentMethod === 'xp'}
                        onChange={() => setPaymentMethod('xp')}
                      />
                      <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0a0a0a] transition-all peer-checked:border-anbit-brand peer-checked:ring-1 peer-checked:ring-anbit-brand/40 peer-checked:[&>span]:text-white sm:h-28">
                        <Star className="h-9 w-9 fill-anbit-brand text-anbit-brand" strokeWidth={2} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/45">XP</span>
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input
                        className="peer sr-only"
                        name="payment-checkout"
                        type="radio"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                      />
                      <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0a0a0a] transition-all peer-checked:border-anbit-brand peer-checked:ring-1 peer-checked:ring-anbit-brand/40 peer-checked:[&>span]:text-white sm:h-28">
                        <CreditCard className="h-9 w-9 text-white" strokeWidth={1.75} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/45">Card</span>
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input
                        className="peer sr-only"
                        name="payment-checkout"
                        type="radio"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                      />
                      <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0a0a0a] transition-all peer-checked:border-anbit-brand peer-checked:ring-1 peer-checked:ring-anbit-brand/40 peer-checked:[&>span]:text-white sm:h-28">
                        <Wallet className="h-9 w-9 text-white" strokeWidth={1.75} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/45">Wallet</span>
                      </div>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTotalDetail((v) => !v)}
                    className="flex w-full items-center justify-end gap-1 text-[#0a0a0a]/50"
                  >
                    <span className="text-xs uppercase tracking-widest">{t('total')}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showTotalDetail ? 'rotate-180' : ''}`} />
                  </button>
                </section>

                <section className="mb-6 space-y-4 rounded-xl border border-white/10 bg-[#0a0a0a] p-6 text-white shadow-[0_16px_40px_-12px_rgba(10,10,10,0.4)]">
                  <div className="flex justify-between font-medium text-white/60">
                    <span>Subtotal</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  {showTotalDetail && (
                    <div className="border-t border-white/10 pt-2 text-sm text-white/50">
                      {cart.map((item, i) => (
                        <div key={`${item.id}-detail-${i}`} className="flex justify-between">
                          <span>
                            {item.name} x {item.quantity}
                          </span>
                          <span>€{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-baseline justify-between border-t border-white/15 pt-4">
                    <span className="text-xl font-bold text-white">Total</span>
                    <span className="text-3xl font-black tracking-tight text-white">€{grandTotal.toFixed(2)}</span>
                  </div>
                  {totalXp > 0 && (
                    <div className="flex items-center justify-end gap-1.5 text-xs font-bold uppercase tracking-wider text-anbit-brand">
                      <Star className="h-4 w-4 fill-anbit-brand text-anbit-brand" strokeWidth={2} />
                      <span>+{totalXp} XP earned with this order</span>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>

          {externalError && (
            <div className="shrink-0 px-5 pb-2 sm:px-6">
              <p className="text-center text-sm text-red-600">{externalError}</p>
            </div>
          )}

          <footer className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-[#0a0a0a] backdrop-blur-2xl">
            <CheckoutFooterWave />
            <div className="max-w-2xl px-5 pb-6 pt-2 sm:mx-auto sm:px-6">
              {step === 2 ? (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full rounded-lg border border-white/15 bg-white/10 py-4 text-base font-bold text-white transition-colors hover:bg-white/[0.14]"
                >
                  {t('back')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={paymentMethod === 'online' || isSubmitting}
                  className="w-full rounded-2xl border border-white/20 bg-gradient-to-b from-[#141414] to-[#0a0a0a] px-6 py-4 text-center text-sm font-extrabold uppercase tracking-[0.2em] text-white shadow-[0_12px_36px_-10px_rgba(0,0,0,0.75)] ring-1 ring-white/10 transition-all hover:border-white/30 hover:from-[#181818] hover:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100 sm:py-[1.15rem] sm:text-[15px]"
                >
                  {isSubmitting ? 'Αποστολή...' : t('confirmOrder')}
                </button>
              )}
              <p className="mt-4 flex flex-wrap items-baseline justify-center gap-x-1 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                <span>Secure Checkout • Encrypted by</span>
                <AnbitWordmark className="text-[10px] tracking-tight text-white/45" />
                <span>Core</span>
              </p>
            </div>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CartCheckoutModal;
