import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, ChevronDown, Zap, LogIn, UserPlus } from 'lucide-react';
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
          className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header: badge + Cart, Total + chevron */}
          <div className="flex items-center justify-between p-4 border-b border-black/10 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-black">
                {itemCount}
              </span>
              <h2 className="text-lg font-bold text-black">{t('cart')}</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowTotalDetail((v) => !v)}
              className="flex items-center gap-1 text-black"
            >
              <div className="text-right">
                <p className="text-xs font-medium text-black/70">{t('total')}</p>
                <p className="text-lg font-bold">€{totalEur.toFixed(2)}</p>
                {totalXp > 0 && (
                  <p className="text-xs font-semibold text-amber-600">+{totalXp} XP</p>
                )}
              </div>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${showTotalDetail ? 'rotate-180' : ''}`}
                strokeWidth={2}
              />
            </button>
          </div>

          {showTotalDetail && (
            <div className="px-4 py-2 bg-gray-50 border-b border-black/5 text-sm text-black/80">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>{item.name} × {item.quantity}</span>
                  <span>€{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              {totalXp > 0 && (
                <div className="flex justify-between mt-1 pt-1 border-t border-black/5 text-amber-600 font-semibold">
                  <span>{t('totalXp')}</span>
                  <span>+{totalXp} XP</span>
                </div>
              )}
            </div>
          )}

          {step === 2 ? (
            /* Earn XP step */
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-amber-500" strokeWidth={2} />
                <h3 className="text-base font-bold text-black">{t('earnXpTitle')}</h3>
              </div>
              <p className="text-sm text-black/70 mb-4">
                {t('xpEarnShort', { count: totalXp })}
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleSignInToEarn}
                  className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border-2 border-black/15 bg-black text-white font-semibold text-sm hover:bg-black/90 transition-colors"
                >
                  <LogIn className="w-5 h-5" strokeWidth={2} />
                  {t('earnXpSignIn', { count: totalXp })}
                </button>
                <button
                  type="button"
                  onClick={handleRegisterToEarn}
                  className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border-2 border-black/15 bg-white text-black font-semibold text-sm hover:bg-black/5 transition-colors"
                >
                  <UserPlus className="w-5 h-5" strokeWidth={2} />
                  {t('earnXpRegister', { count: totalXp })}
                </button>
                <button
                  type="button"
                  onClick={handleContinueAsGuest}
                  className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border border-black/15 bg-gray-50 text-black/80 font-medium text-sm hover:bg-gray-100 transition-colors"
                >
                  {t('continueAsGuest')}
                </button>
              </div>
            </div>
          ) : (
          /* Select payment method */
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-black" strokeWidth={2} />
              <h3 className="text-base font-bold text-black">
                {t('selectPaymentMethod')}
              </h3>
            </div>

            <div className="space-y-1">
              <label
                className={`flex items-center gap-3 py-3 px-4 rounded-xl border cursor-pointer transition-colors ${
                  paymentMethod === 'cash'
                    ? 'border-[#ec4899] bg-pink-50/50'
                    : 'border-black/10 hover:bg-black/[0.02]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'cash' ? 'border-[#ec4899] bg-[#ec4899]' : 'border-black/30'
                  }`}
                >
                  {paymentMethod === 'cash' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="flex-1 text-sm font-medium text-black">
                  {t('paymentCash')}
                </span>
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="sr-only"
                />
              </label>

              <label
                className={`flex items-center gap-3 py-3 px-4 rounded-xl border cursor-pointer transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-[#ec4899] bg-pink-50/50'
                    : 'border-black/10 hover:bg-black/[0.02]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'card' ? 'border-[#ec4899] bg-[#ec4899]' : 'border-black/30'
                  }`}
                >
                  {paymentMethod === 'card' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="flex-1 text-sm font-medium text-black">
                  {t('paymentCard')}
                </span>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="sr-only"
                />
              </label>

              <label
                className={`flex items-center gap-3 py-3 px-4 rounded-xl border cursor-pointer transition-colors ${
                  paymentMethod === 'xp'
                    ? 'border-[#ec4899] bg-pink-50/50'
                    : 'border-black/10 hover:bg-black/[0.02]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'xp' ? 'border-[#ec4899] bg-[#ec4899]' : 'border-black/30'
                  }`}
                >
                  {paymentMethod === 'xp' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="flex-1 text-sm font-medium text-black">
                  {t('paymentXp')}
                </span>
                <input
                  type="radio"
                  name="payment"
                  value="xp"
                  checked={paymentMethod === 'xp'}
                  onChange={() => setPaymentMethod('xp')}
                  className="sr-only"
                />
              </label>

              <div className="flex items-center gap-3 py-3 px-4 rounded-xl border border-black/10 bg-gray-100/80 opacity-75 cursor-not-allowed">
                <div className="w-5 h-5 rounded-full border-2 border-black/20 bg-gray-200 flex items-center justify-center" />
                <span className="flex-1 text-sm font-medium text-black/60">
                  {t('paymentOnline')}
                </span>
                <span className="text-xs text-black/50 italic">
                  {t('paymentOnlineComingSoon')}
                </span>
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  disabled
                  className="sr-only"
                />
              </div>
            </div>
          </div>
          )}

          {externalError && (
            <div className="px-4 pt-2 shrink-0">
              <p className="text-red-600 text-sm text-center">{externalError}</p>
            </div>
          )}
          <div className="p-4 border-t border-black/10 flex gap-3 shrink-0">
            {step === 2 ? (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-sm bg-white border-2 border-black/10 text-black hover:bg-gray-50 transition-colors"
                >
                  {t('back')}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-sm bg-white border-2 border-black/10 text-red-600 hover:bg-red-50 transition-colors"
                >
                  {t('cancel').toUpperCase()}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={paymentMethod === 'online' || isSubmitting}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-sm bg-black text-white hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Αποστολή...' : t('confirmOrder').toUpperCase()}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CartCheckoutModal;
