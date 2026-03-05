
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Globe, Star, ChevronRight } from 'lucide-react';
import { UserData, Partner } from '../types';
import { containerVariants, itemVariants } from '../constants';
import { useLanguage } from '../context/LanguageContext';

const ProfilePage: React.FC<{ user: UserData; partners?: Partner[] }> = ({ user, partners = [] }) => {
  const { t } = useLanguage();
  const storeCardsScrollRef = useRef<HTMLDivElement>(null);
  const storeXP = user.storeXP || {};

  const partnersWithPoints = [...partners]
    .map((p) => ({ partner: p, xp: storeXP[p.id] ?? 0 }))
    .sort((a, b) => b.xp - a.xp);

  return (
    <motion.div
      className="space-y-8 lg:space-y-12 pb-20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-10 items-end">
        <div className="xl:col-span-4 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="relative shrink-0">
            <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl lg:rounded-3xl overflow-hidden border-2 border-anbit-yellow shadow-[0_0_30px_rgba(254,240,138,0.2)]">
              <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-anbit-yellow text-anbit-yellow-content w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-xl">
              {user.currentLevel}
            </div>
          </div>
          <div className="text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Zap className="w-3 h-3 text-anbit-yellow fill-anbit-yellow" />
              <span className="text-[10px] font-semibold text-anbit-yellow tracking-wide">{user.currentLevelName}</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-anbit-text tracking-tighter italic leading-none">{user.name}</h2>
            <p className="text-xs text-anbit-muted font-medium tracking-wide italic">Ενεργό μέλος από το 2024</p>
          </div>
        </div>

        <div className="xl:col-span-8">
          <div className="dashboard-card p-6 lg:p-8 flex flex-col justify-between bg-gradient-to-br from-anbit-card to-black border-anbit-yellow/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Globe className="w-20 h-20 text-anbit-yellow" />
            </div>
            <div className="relative z-10">
              <span className="text-[8px] lg:text-[10px] font-semibold text-anbit-muted tracking-wide mb-4 block">Συνολικό XP</span>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl lg:text-6xl font-bold text-anbit-text/20 tracking-tighter italic">0</span>
                <span className="text-[10px] font-semibold text-anbit-yellow bg-anbit-yellow/10 px-3 py-1 rounded-full tracking-wide animate-pulse">Σύντομα</span>
              </div>
              <p className="text-[9px] text-anbit-muted font-medium mt-4 max-w-xs leading-relaxed">
                Η ΠΑΓΚΟΣΜΙΑ ΚΑΤΑΤΑΞΗ ΚΑΙ ΟΙ ΠΑΓΚΟΣΜΙΟΙ ΠΟΝΤΟΙ ΘΑ ΕΙΝΑΙ ΔΙΑΘΕΣΙΜΟΙ ΣΤΟ ΕΠΟΜΕΝΟ UPDATE.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 lg:space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl lg:text-3xl font-bold text-anbit-text italic tracking-tighter">Πόντοι ανά κατάστημα</h3>
          <span className="text-[10px] font-semibold text-anbit-muted tracking-wide">Σύνολο: {partners.length} καταστήματα</span>
        </div>

        {/* Καρτέλες μαγαζιών όπως στο tab Καταστήματα – οριζόντια σειρά */}
        <div className="relative -mx-4 sm:mx-0">
          <div ref={storeCardsScrollRef} className="flex overflow-x-auto gap-4 sm:gap-5 pb-4 sm:pb-6 no-scrollbar snap-x snap-mandatory px-4 sm:px-0 scroll-smooth">
            {partnersWithPoints.map(({ partner, xp }) => (
              <motion.div
                key={partner.id}
                variants={itemVariants}
                className="flex-shrink-0 w-[260px] sm:w-[280px] lg:w-[300px] rounded-[12px] overflow-hidden border border-anbit-border bg-anbit-card snap-center shadow-lg"
              >
                <div className="relative h-[140px] sm:h-[160px] lg:h-[175px] overflow-hidden">
                  <img src={partner.image} alt={partner.name} className="w-full h-full object-cover rounded-t-[12px] transition-transform duration-300 group-hover:scale-105" />
                  {partner.bonusXp && (
                    <div className="absolute top-3 right-3 bg-anbit-yellow text-anbit-yellow-content px-2 py-1 rounded-lg font-black text-[9px] flex items-center gap-1 shadow-lg">
                      +{partner.bonusXp}%
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5 space-y-2 sm:space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-anbit-text tracking-tight italic leading-tight truncate">
                    {partner.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Star className="w-4 h-4 text-emerald-500 fill-emerald-500 shrink-0" />
                    <span className="text-sm font-black text-anbit-text">{partner.rating}</span>
                    <span className="text-[11px] font-bold text-anbit-muted">({partner.reviewCount ?? '—'})</span>
                    <span className="text-[11px] font-bold text-anbit-muted">{t(partner.category.toLowerCase() as 'coffee' | 'food' | 'lifestyle' | 'services')}</span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-bold text-anbit-muted leading-snug">
                    {partner.deliveryTime ?? '—'}
                    {partner.minOrder && partner.minOrder !== '—' ? ` - Ελάχιστη ${partner.minOrder}` : ''}
                  </p>
                  <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-anbit-yellow/10 border border-anbit-yellow/20">
                    <Zap className="w-3.5 h-3.5 text-anbit-yellow shrink-0" />
                    <span className="text-[11px] font-bold text-anbit-text">{t('pointsAtStore')}</span>
                    <span className="text-sm font-black text-anbit-yellow ml-auto">{xp.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => storeCardsScrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-anbit-card border-2 border-anbit-border flex items-center justify-center text-anbit-text hover:bg-anbit-yellow hover:text-anbit-yellow-content hover:border-anbit-yellow transition-all shadow-lg z-10"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </section>

      <div className="dashboard-card p-6 border-dashed border-anbit-border bg-transparent flex flex-col items-center justify-center text-center space-y-3 opacity-40">
        <TrendingUp className="w-5 h-5 text-anbit-muted" />
        <span className="text-[9px] font-semibold text-anbit-muted tracking-wide">Ιστορικό δραστηριότητας...</span>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
