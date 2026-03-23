import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface OrderAcceptedScreenProps {
  pin: string;
  tableNumber?: number;
  xpEarned?: number;
  onBack: () => void;
}

const CONFETTI_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#e63533', '#9333ea'];

function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: Math.random() * 100 - 5,
      delay: Math.random() * 0.5,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 6 + Math.random() * 6,
      rotation: Math.random() * 360,
    }))
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.left}%`,
            top: '-10%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            rotate: p.rotation,
          }}
          initial={{ y: 0, opacity: 1 }}
          animate={{
            y: '120vh',
            opacity: 0,
            rotate: p.rotation + 360,
          }}
          transition={{
            duration: 2.5 + Math.random(),
            delay: p.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}

const OrderAcceptedScreen: React.FC<OrderAcceptedScreenProps> = ({
  pin,
  tableNumber = 1,
  xpEarned = 0,
  onBack,
}) => {
  const { t } = useLanguage();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const pinDigits = pin.replace(/\D/g, '').slice(0, 6).split('');
  const pinPart1 = pinDigits.slice(0, 3);
  const pinPart2 = pinDigits.slice(3, 6);

  return (
    <div
      className="fixed inset-0 z-[310] bg-white flex flex-col items-center overflow-y-auto"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {showConfetti && <Confetti />}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-6 shadow-lg"
        >
          <Check className="w-12 h-12 text-white" strokeWidth={3} />
        </motion.div>
        <h1 className="text-xl font-bold text-black mb-6 max-w-[300px]">
          {t('thankYouOrderReceived')}
        </h1>

        {xpEarned > 0 && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm font-medium text-amber-800">{t('pointsEarnedWithOrder')}</p>
            <p className="text-2xl font-bold text-amber-700 mt-0.5">+{xpEarned} XP</p>
          </div>
        )}

        <div className="mb-2">
          <p className="text-sm font-semibold text-black/80 mb-2">{t('pin')}</p>
          <div className="flex justify-center items-center gap-1">
            {pinPart1.map((d, i) => (
              <span
                key={`a-${i}`}
                className="w-10 h-12 rounded-lg border-2 border-gray-300 flex items-center justify-center text-lg font-bold text-black bg-gray-50"
              >
                {d}
              </span>
            ))}
            <span className="text-gray-400 font-bold mx-1">-</span>
            {pinPart2.map((d, i) => (
              <span
                key={`b-${i}`}
                className="w-10 h-12 rounded-lg border-2 border-gray-300 flex items-center justify-center text-lg font-bold text-black bg-gray-50"
              >
                {d}
              </span>
            ))}
          </div>
          <p className="text-xs text-black/50 mt-2 max-w-[260px] mx-auto">
            {t('pinHint')}
          </p>
        </div>

        <div className="w-full max-w-[320px] mt-8 text-left">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-black">{t('orderTimeline')}</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-100 text-red-700">
              → {tableNumber}
            </span>
          </div>
          <div className="space-y-0">
            {[
              { step: t('stepYouCreated'), label: 'Created' },
              { step: t('stepStaffSeen'), label: 'Seen' },
              { step: t('stepStaffAccepted'), label: 'Accepted' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-black/50">{t('minuteAgo')}</p>
                  <p className="text-sm font-medium text-black">{item.step}</p>
                </div>
                <span className="text-xs text-black/40 bg-gray-100 px-2 py-1 rounded">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-lg px-4 pb-6 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors"
        >
          {t('back').toUpperCase()}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          {t('close').toUpperCase()}
        </button>
      </div>
    </div>
  );
};

export default OrderAcceptedScreen;
