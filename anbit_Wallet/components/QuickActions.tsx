
import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, ScanLine } from 'lucide-react';
import { tapScale } from '../constants';
import { useLanguage } from '../context/LanguageContext';

interface QuickActionsProps {
  onOpenQR: () => void;
  onOpenScanner: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onOpenQR, onOpenScanner }) => {
  const { t } = useLanguage();
  
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4 w-[90%] max-w-md">
      <motion.button
        whileTap={tapScale}
        onClick={onOpenScanner}
        className="flex-1 h-20 bg-[#1a1a2e]/90 border-2 border-anbit-border rounded-[24px] flex flex-col items-center justify-center text-white shadow-2xl backdrop-blur-2xl transition-all hover:bg-anbit-card"
      >
        <ScanLine className="w-7 h-7 text-anbit-yellow" strokeWidth={2.5} />
        <span className="text-[10px] font-semibold tracking-wide mt-1">{t('order')}</span>
      </motion.button>
      
      <motion.button
        onClick={onOpenQR}
        whileTap={tapScale}
        className="flex-[2] h-20 bg-anbit-yellow rounded-[24px] flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(254,240,138,0.35)] relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-active:translate-y-0 transition-transform" />
        <QrCode className="w-8 h-8 text-anbit-yellow-content" strokeWidth={3} />
        <span className="text-lg font-bold text-anbit-yellow-content tracking-wide">{t('myId')}</span>
      </motion.button>
    </div>
  );
};

export default QuickActions;
