
import React, { useState, useEffect } from 'react';
import { motion, animate } from 'framer-motion';
import { UserData } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const XPProgressCircle: React.FC<{ user: UserData }> = ({ user }) => {
  const { t } = useLanguage();
  
  const size = 220; 
  const center = size / 2;
  const strokeWidth = 8; 
  const radius = (size / 2) - (strokeWidth * 2);
  const circumference = radius * 2 * Math.PI;

  return (
    <div className="dashboard-card p-4 lg:p-6 flex flex-col items-center justify-center min-h-[300px] lg:min-h-[350px] relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Globe className="w-32 h-32" />
      </div>

      <div className="relative w-full max-w-[160px] lg:max-w-[200px] aspect-square flex items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 w-full h-full opacity-20">
          <circle className="stroke-[var(--anbit-border)] opacity-60" fill="transparent" strokeWidth={strokeWidth} r={radius} cx={center} cy={center} />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <span className="text-[6px] lg:text-[8px] font-semibold text-anbit-muted tracking-wide mb-1">
            ΠΑΓΚΟΣΜΙΟ ΥΠΟΛΟΙΠΟ
          </span>
          <span className="text-4xl lg:text-5xl font-black text-anbit-text tracking-tighter leading-none mb-2">
            0
          </span>
          <div className="px-3 py-1 bg-anbit-border/30 text-anbit-text rounded-full font-semibold text-[7px] lg:text-[9px] tracking-wide border border-anbit-border">
            COMING SOON
          </div>
        </div>
      </div>
      
      <div className="mt-6 lg:mt-8 w-full max-w-[240px] space-y-3">
        <div className="flex justify-between items-end">
          <div className="space-y-0.5">
            <span className="text-[6px] lg:text-[8px] font-semibold text-anbit-muted tracking-wide block">Βαθμίδα</span>
            <span className="text-base lg:text-xl font-bold text-anbit-text italic tracking-tighter leading-none">{user.currentLevelName}</span>
          </div>
          <span className="text-[8px] font-semibold text-anbit-yellow tracking-wide">Περίοδος 01</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div className="h-full bg-white/5 w-full" />
        </div>
        <p className="text-[8px] text-center text-anbit-muted font-medium tracking-wide pt-2">
          ΜΑΖΕΨΕ ΠΟΝΤΟΥΣ ΣΕ ΚΑΤΑΣΤΗΜΑΤΑ ΓΙΑ ΝΑ ΞΕΚΛΕΙΔΩΣΕΙΣ ΤΟ GLOBAL XP
        </p>
      </div>
    </div>
  );
};

export default XPProgressCircle;
