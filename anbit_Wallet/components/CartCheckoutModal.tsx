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
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { CartItemData } from '../types';

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
  const deliveryFee = 2.99;
  const serviceTax = subtotal * 0.1;
  const grandTotal = subtotal + deliveryFee + serviceTax;
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
          className="relative w-full max-w-lg bg-black rounded-t-3xl sm:rounded-3xl h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col shadow-2xl text-white"
        >
          <header className="shrink-0 h-20 px-6 flex items-center justify-between bg-black/80 backdrop-blur-xl border-b border-neutral-900/60">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center active:scale-95 transition-transform"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="font-extrabold italic tracking-tighter text-3xl text-[#E63533]">Anbit</h1>
            </div>
            <div className="text-neutral-400 text-sm font-semibold tracking-widest uppercase">Checkout</div>
          </header>

          <div className="flex-1 overflow-y-auto px-6 pt-6 pb-44 no-scrollbar">
            {step === 2 ? (
              <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-amber-500" strokeWidth={2} />
                  <h3 className="text-base font-bold text-white">{t('earnXpTitle')}</h3>
                </div>
                <p className="text-sm text-neutral-300 mb-4">
                  {t('xpEarnShort', { count: totalXp })}
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleSignInToEarn}
                    className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border border-white/10 bg-black text-white font-semibold text-sm hover:bg-neutral-900 transition-colors"
                  >
                    <LogIn className="w-5 h-5" strokeWidth={2} />
                    {t('earnXpSignIn', { count: totalXp })}
                  </button>
                  <button
                    type="button"
                    onClick={handleRegisterToEarn}
                    className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border border-white/10 bg-neutral-900 text-white font-semibold text-sm hover:bg-neutral-800 transition-colors"
                  >
                    <UserPlus className="w-5 h-5" strokeWidth={2} />
                    {t('earnXpRegister', { count: totalXp })}
                  </button>
                  <button
                    type="button"
                    onClick={handleContinueAsGuest}
                    className="w-full py-3 px-4 rounded-xl border border-white/10 bg-neutral-950 text-neutral-300 font-medium text-sm hover:bg-neutral-900 transition-colors"
                  >
                    {t('continueAsGuest')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <section className="space-y-6 mb-8">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-5xl font-bold tracking-tight">Your Selection</h2>
                    <span className="text-neutral-500 text-sm">{itemCount} Items</span>
                  </div>
                  <div className="grid gap-4">
                    {cart.map((item, i) => (
                      <div key={`${item.id}-${i}`} className="flex gap-4 p-4 rounded-3xl bg-neutral-950 border border-neutral-900/60">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-900 shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-2xl leading-tight line-clamp-2">{item.name}</h3>
                            <span className="font-bold text-2xl shrink-0">€{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                          <p className="text-sm text-neutral-500 line-clamp-1 mt-1">
                            {[item.options?.extras, item.comments].filter(Boolean).join(', ') || item.description}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3 bg-black rounded-full px-3 py-1 border border-neutral-800">
                              <button type="button" className="text-neutral-400 cursor-not-allowed">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                              <button type="button" className="text-neutral-400 cursor-not-allowed">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button type="button" className="text-neutral-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {totalXp > 0 && (
                  <section className="mb-8">
                    <div className="relative overflow-hidden rounded-3xl p-5 bg-[#CA8A04] shadow-[0_0_50px_rgba(202,138,4,0.2)]">
                      <div className="relative flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Star className="w-4 h-4 text-black fill-current" />
                            <span className="font-extrabold text-black uppercase tracking-tight">Anbit Loyalty</span>
                          </div>
                          <p className="text-black text-lg">
                            Apply your {totalXp} XP for a <span className="font-bold underline">€{redeemableDiscount.toFixed(0)} discount</span>
                          </p>
                        </div>
                        <button type="button" className="bg-black text-white px-6 py-2 rounded-full font-bold text-sm">
                          Apply
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                <section className="space-y-5 mb-8">
                  <h2 className="text-4xl font-bold">Payment Method</h2>
                  <div className="grid grid-cols-3 gap-3">
                    <label className="cursor-pointer">
                      <input
                        className="peer sr-only"
                        name="payment"
                        type="radio"
                        checked={paymentMethod === 'xp'}
                        onChange={() => setPaymentMethod('xp')}
                      />
                      <div className="h-24 flex flex-col items-center justify-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-950 peer-checked:border-[#CA8A04] peer-checked:bg-neutral-900 transition-all">
                        <Star className="w-8 h-8 text-[#CA8A04] fill-current" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">XP</span>
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input
                        className="peer sr-only"
                        name="payment"
                        type="radio"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                      />
                      <div className="h-24 flex flex-col items-center justify-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-950 peer-checked:border-[#E63533] peer-checked:bg-neutral-900 transition-all">
                        <CreditCard className="w-8 h-8" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Card</span>
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input
                        className="peer sr-only"
                        name="payment"
                        type="radio"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                      />
                      <div className="h-24 flex flex-col items-center justify-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-950 peer-checked:border-[#E63533] peer-checked:bg-neutral-900 transition-all">
                        <Wallet className="w-8 h-8" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Wallet</span>
                      </div>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTotalDetail((v) => !v)}
                    className="w-full flex items-center justify-end gap-1 text-neutral-400"
                  >
                    <span className="text-xs uppercase tracking-widest">{t('total')}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showTotalDetail ? 'rotate-180' : ''}`} />
                  </button>
                </section>

                <section className="bg-neutral-950/60 p-6 rounded-3xl border border-neutral-900/40 space-y-3">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Delivery Fee</span>
                    <span>€{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Service Tax (10%)</span>
                    <span>€{serviceTax.toFixed(2)}</span>
                  </div>
                  {showTotalDetail && (
                    <div className="pt-2 text-sm text-neutral-500 border-t border-neutral-900">
                      {cart.map((item, i) => (
                        <div key={`${item.id}-detail-${i}`} className="flex justify-between">
                          <span>{item.name} x {item.quantity}</span>
                          <span>€{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pt-4 border-t border-neutral-900 flex justify-between items-baseline">
                    <span className="font-bold text-3xl">Total</span>
                    <span className="font-black text-5xl">€{grandTotal.toFixed(2)}</span>
                  </div>
                  {totalXp > 0 && (
                    <div className="flex justify-end items-center gap-1.5 text-[#CA8A04] font-bold text-xs uppercase tracking-wider">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>+{totalXp} XP earned with this order</span>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>

          {externalError && (
            <div className="px-6 pb-2 shrink-0">
              <p className="text-red-500 text-sm text-center">{externalError}</p>
            </div>
          )}

          <footer className="absolute bottom-0 left-0 right-0 p-6 bg-black/90 backdrop-blur-2xl border-t border-neutral-900/60 z-10">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-4 rounded-2xl font-bold text-base bg-neutral-900 border border-neutral-700 text-white hover:bg-neutral-800 transition-colors"
              >
                {t('back')}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={paymentMethod === 'online' || isSubmitting}
                className="w-full bg-[#E63533] text-white py-5 rounded-2xl font-black text-xl tracking-tight uppercase transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Αποστολή...' : t('confirmOrder')}
                {!isSubmitting && <ArrowRight className="w-5 h-5" />}
              </button>
            )}
            <p className="text-center text-[10px] text-neutral-600 mt-4 font-bold uppercase tracking-[0.2em]">
              Secure Checkout • Encrypted by Anbit Core
            </p>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CartCheckoutModal;
