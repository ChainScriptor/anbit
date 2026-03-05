
import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Clock, Zap } from 'lucide-react';
import { Reward } from '../types';
import { containerVariants, itemVariants } from '../constants';
import { useLanguage } from '../context/LanguageContext';

interface VaultPageProps {
  rewards: Reward[];
  onRedeem: (reward: Reward) => void;
}

const VaultPage: React.FC<VaultPageProps> = ({ rewards, onRedeem }) => {
  const { t } = useLanguage();

  return (
    <motion.div
      className="space-y-6 pb-20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header – compact */}
      <section className="flex items-center gap-2">
        <div className="w-9 h-9 bg-anbit-yellow rounded-lg flex items-center justify-center">
          <Gift className="w-4 h-4 text-anbit-yellow-content" />
        </div>
        <div>
          <span className="text-[9px] font-semibold text-anbit-muted tracking-wide">The Vault</span>
          <h2 className="text-xl font-bold text-anbit-text tracking-tight italic leading-none">
            {t('yourLootBox').split(' ')[0]} <span className="text-anbit-yellow">{t('yourLootBox').split('Your ')[1]}</span>
          </h2>
        </div>
      </section>

      {/* Small reward cards – app colors */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {rewards.map((voucher) => {
          const isLocked = voucher.status === 'locked';
          return (
            <motion.div
              key={voucher.id}
              variants={itemVariants}
              className={`dashboard-card overflow-hidden flex flex-col h-[200px] ${
                isLocked ? 'opacity-60' : ''
              }`}
            >
              <div className="relative h-20 flex-shrink-0">
                <img src={voucher.image} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-anbit-card to-transparent" />
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-anbit-yellow/90 border border-anbit-border">
                  <span className="text-[8px] font-semibold text-anbit-yellow-content flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 fill-current" /> +{voucher.xpCost}
                  </span>
                </div>
              </div>
              <div className="flex-1 p-2.5 flex flex-col min-h-0 border-t border-anbit-border">
                <p className="text-[9px] font-medium text-anbit-muted tracking-wide truncate">{voucher.partner}</p>
                <p className="text-xs font-black text-anbit-text leading-tight line-clamp-2 mt-0.5">{voucher.title}</p>
                <div className="flex items-center gap-1 text-[8px] text-anbit-muted mt-1">
                  <Clock className="w-2.5 h-2.5 shrink-0" /> {t('expiresIn')} 48h
                </div>
                <button
                  onClick={() => !isLocked && onRedeem(voucher)}
                  disabled={isLocked}
                  className={`mt-2 w-full py-1.5 rounded-lg font-semibold text-[9px] tracking-wide transition-all ${
                    isLocked
                      ? 'bg-anbit-border/50 text-anbit-muted cursor-not-allowed'
                      : 'bg-anbit-yellow text-anbit-yellow-content hover:opacity-90'
                  }`}
                >
                  {isLocked ? t('levelUpToUnlock') : t('redeemNow')}
                </button>
              </div>
            </motion.div>
          );
        })}
      </section>
    </motion.div>
  );
};

export default VaultPage;
