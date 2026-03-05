
import React from 'react';
import { LeaderboardEntry } from '../types';
import { useLanguage } from '../context/LanguageContext';

const Leaderboard: React.FC<{ entries: LeaderboardEntry[] }> = ({ entries }) => {
  const { t } = useLanguage();
  return (
    <div className="p-6 sm:p-10 lg:p-16">
      <div className="flex items-center justify-between mb-8 sm:mb-16">
        <h2 className="section-title text-anbit-muted text-sm sm:text-base">{t('hallOfFame')}</h2>
        <div className="flex items-center gap-2 sm:gap-3">
           <div className="w-2 h-2 sm:w-3 h-3 bg-anbit-yellow rounded-full animate-pulse" />
           <span className="text-[10px] sm:text-xs font-semibold text-anbit-text tracking-wide">{t('liveData')}</span>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-10">
        {entries.slice(0, 5).map((user) => (
          <div key={user.rank} className="flex items-center justify-between group cursor-pointer transition-all hover:translate-x-2 sm:hover:translate-x-4">
            <div className="flex items-center gap-4 sm:gap-10">
              <span className={`text-2xl sm:text-5xl font-black w-8 sm:w-14 text-center italic ${user.rank <= 3 ? 'text-anbit-yellow scale-110 drop-shadow-xl' : 'text-anbit-muted opacity-30'}`}>
                {user.rank < 10 ? `0${user.rank}` : user.rank}
              </span>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 sm:gap-4">
                  <span className={`text-lg sm:text-3xl font-bold tracking-tighter truncate normal-case ${user.isCurrentUser ? 'text-anbit-yellow' : 'text-anbit-text'}`}>
                    {user.name}
                  </span>
                  {user.isCurrentUser && (
                    <span className="px-1.5 py-0.5 sm:px-3 sm:py-1 bg-anbit-yellow text-anbit-yellow-content text-[8px] sm:text-[10px] font-bold rounded-md sm:rounded-lg">Εσύ</span>
                  )}
                </div>
                <span className="text-[8px] sm:text-xs text-anbit-muted font-semibold tracking-wide mt-1 sm:mt-2">Επίπεδο {user.level}</span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-lg sm:text-3xl font-black text-anbit-text tracking-tighter leading-none">{user.xp.toLocaleString()}</span>
              <span className="text-[8px] sm:text-[10px] font-semibold text-anbit-muted tracking-wide mt-1 sm:mt-2">XP</span>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-10 sm:mt-20 py-4 sm:py-7 bg-white/[0.03] border-2 border-anbit-border rounded-xl sm:rounded-[28px] text-xs sm:text-base font-semibold tracking-wide text-anbit-muted hover:text-anbit-text hover:bg-white/[0.08] transition-all">
        {t('globalStandings')}
      </button>
    </div>
  );
};

export default Leaderboard;
