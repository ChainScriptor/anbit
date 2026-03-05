
import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Activity } from '../types';
import { useLanguage } from '../context/LanguageContext';

const ActivityFeed: React.FC<{ activities: Activity[] }> = ({ activities }) => {
  const { t } = useLanguage();
  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h2 className="text-[9px] lg:text-[11px] font-semibold tracking-wide text-anbit-muted">{t('liveLedger')}</h2>
        <button className="text-[8px] lg:text-[9px] font-semibold text-anbit-yellow tracking-wide">{t('viewHistory')}</button>
      </div>
      <div className="space-y-3 lg:space-y-4">
        {activities.map((act) => (
          <div key={act.id} className="flex items-center justify-between group cursor-pointer border-b border-white/[0.03] pb-3 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-white/[0.03] flex items-center justify-center text-sm lg:text-lg group-hover:bg-anbit-yellow group-hover:text-anbit-yellow-content transition-all">
                {act.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-xs lg:text-sm text-anbit-text truncate leading-none mb-1">
                   {act.partner || act.title}
                </span>
                <span className="text-[8px] lg:text-[9px] text-anbit-muted font-medium flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {act.timestamp}
                </span>
              </div>
            </div>
            <span className={`text-xs lg:text-sm font-black ${act.xp > 0 ? 'text-anbit-yellow' : 'text-anbit-muted'}`}>
              {act.xp > 0 ? '+' : ''}{act.xp} XP
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
