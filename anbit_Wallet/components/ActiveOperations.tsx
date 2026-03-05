
import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Zap, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ActiveOperationProps {
  partnerName: string;
}

const ActiveOperations: React.FC<ActiveOperationProps> = ({ partnerName }) => {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="dashboard-card p-10 lg:p-12 border-anbit-yellow/50 bg-gradient-to-r from-anbit-yellow/[0.08] to-transparent relative overflow-hidden mb-12"
    >
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Zap className="w-24 h-24 text-anbit-yellow" strokeWidth={1} />
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="flex items-center gap-8">
          <div className="relative">
             <div className="w-5 h-5 bg-anbit-yellow rounded-full animate-ping absolute inset-0" />
             <div className="w-5 h-5 bg-anbit-yellow rounded-full relative z-10 shadow-[0_0_20px_#FEF08A]" />
          </div>
          <div className="space-y-2">
            <span className="text-[12px] font-black text-anbit-yellow uppercase tracking-[0.6em] block">{t('activeOperations')}</span>
            <h4 className="text-3xl lg:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
              {t('missionAt')} <span className="text-anbit-yellow">{partnerName}</span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-black/40 px-8 py-5 rounded-2xl border border-anbit-yellow/20">
           <Loader2 className="w-6 h-6 text-anbit-yellow animate-spin" />
           <div className="flex flex-col">
              <span className="text-xs font-black text-anbit-muted uppercase tracking-widest leading-none mb-1">Status</span>
              <span className="text-lg font-black text-white uppercase italic tracking-tighter animate-pulse">
                {t('awaitingXP')}
              </span>
           </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 h-1.5 bg-white/5 w-full">
        <motion.div 
          className="h-full bg-anbit-yellow shadow-[0_0_15px_#FEF08A]"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#FEF08A 1px, transparent 1px), linear-gradient(90deg, #FEF08A 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
    </motion.div>
  );
};

export default ActiveOperations;
