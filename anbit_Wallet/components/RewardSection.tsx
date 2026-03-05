
import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, ArrowRight } from 'lucide-react';
import { Reward } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface RewardSectionProps {
  rewards: Reward[];
  onViewAll?: () => void;
}

const RewardSection: React.FC<RewardSectionProps> = ({ rewards, onViewAll }) => {
  const { t } = useLanguage();
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="section-title text-anbit-text text-lg lg:text-xl">{t('marketplace')}</h2>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-anbit-yellow tracking-wide flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          {t('vault')} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x snap-mandatory">
        {rewards.map((reward) => (
          <motion.div
            key={reward.id}
            whileHover={{ y: -5 }}
            className={`flex-shrink-0 w-[240px] lg:w-[300px] rounded-[24px] overflow-hidden border border-white/[0.08] bg-anbit-card snap-center ${reward.status === 'locked' ? 'opacity-30 grayscale' : 'shadow-xl'
              }`}
          >
            <div className="relative h-40 lg:h-52 overflow-hidden">
              <img src={reward.image} alt={reward.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <span className="text-[8px] font-semibold tracking-wide text-white">{reward.partner}</span>
              </div>
            </div>
            <div className="p-5 lg:p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-base lg:text-lg font-black text-anbit-text leading-tight tracking-tight truncate">{reward.title}</h3>
                <span className="text-xs lg:text-sm font-black text-anbit-yellow">{reward.xpCost} ΠΟΝΤΟΙ</span>
              </div>
              <button disabled={reward.status === 'locked'} className={`w-full py-2.5 lg:py-3 rounded-xl font-semibold text-[9px] lg:text-[10px] tracking-wide transition-all ${reward.status === 'available' ? 'bg-anbit-yellow text-anbit-yellow-content hover:opacity-90' : 'bg-white/5 text-anbit-muted'
                }`}>
                {reward.status === 'available' ? t('redeemVoucher') : t('levelUpToUnlock')}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RewardSection;
