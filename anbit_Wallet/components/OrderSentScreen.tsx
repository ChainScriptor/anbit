import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ACCEPTANCE_DEMO_DELAY_MS = 8000;

interface OrderSentScreenProps {
  onBack: () => void;
  onAccepted: () => void;
  /** Όταν true, δεν καλείται αυτόματα onAccepted μετά από 8s (χρήση με πραγματικό API/polling) */
  disableAutoAccept?: boolean;
}

const OrderSentScreen: React.FC<OrderSentScreenProps> = ({ onBack, onAccepted, disableAutoAccept }) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (disableAutoAccept) return;
    const timer = setTimeout(onAccepted, ACCEPTANCE_DEMO_DELAY_MS);
    return () => clearTimeout(timer);
  }, [onAccepted, disableAutoAccept]);

  return (
    <div
      className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center px-6 text-center"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Spinner */}
      <motion.div
        className="w-16 h-16 rounded-full border-4 border-[#2563eb] border-t-transparent mb-6"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <h1 className="text-xl font-bold text-black mb-2">
        {t('orderSent')}
      </h1>
      <p className="text-base text-black/90 mb-4 max-w-[280px]">
        {t('orderWaitingApproval')}
      </p>
      <p className="text-sm font-bold text-red-600 uppercase tracking-wide mb-4">
        {t('doNotClosePage')}
      </p>
      <p className="text-sm text-black/60 mb-6 max-w-[300px]">
        {t('orderNotAcceptedHint')}
      </p>
      <a
        href="tel:+302310000000"
        className="inline-flex items-center justify-center gap-2 w-14 h-14 rounded-xl bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors mb-6"
        aria-label={t('callUs')}
      >
        <Phone className="w-6 h-6" strokeWidth={2} />
      </a>
      <p className="text-sm text-black/80 mb-8">
        {t('thankYouPatience')}
      </p>
      <button
        type="button"
        onClick={onBack}
        className="px-6 py-3 rounded-xl font-semibold text-sm bg-black/10 text-black hover:bg-black/15 transition-colors"
      >
        {t('backToStores')}
      </button>
    </div>
  );
};

export default OrderSentScreen;
