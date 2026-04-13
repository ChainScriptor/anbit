import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { cn } from '@/lib/utils';

const edgeMask = {
  WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)',
  maskImage: 'linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)',
} as const;

/**
 * Απαλά κύματα που «χωνεύονται» στο anbit-bg — dark: μαύρο, light: zinc wash.
 */
export const QuickCategoriesWaveBackdrop: React.FC = () => {
  const { theme } = useTheme();
  const waveFill =
    theme === 'light'
      ? 'text-zinc-300/25'
      : 'text-black/28';

  return (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden style={edgeMask}>
    <div className="absolute inset-0 bg-anbit-bg" />
    <div className="absolute inset-0 bg-gradient-to-b from-anbit-bg via-transparent to-anbit-bg" />
    <motion.div
      className="absolute -bottom-10 left-[-32%] w-[164%] opacity-[0.42]"
      style={{ height: '48%', minHeight: 88 }}
      initial={false}
      animate={{ x: ['0%', '-3.5%', '0%'] }}
      transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 1440 240" className={cn('h-full w-full', waveFill)} preserveAspectRatio="none">
        <path
          fill="currentColor"
          d="M0,155 C200,118 400,188 600,148 C800,108 1000,168 1200,138 C1280,125 1360,118 1440,122 L1440,240 L0,240 Z"
        />
      </svg>
    </motion.div>
    <motion.div
      className="absolute -bottom-8 left-[-38%] w-[176%] opacity-[0.34]"
      style={{ height: '42%', minHeight: 76 }}
      initial={false}
      animate={{ x: ['0%', '4%', '0%'] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 1440 220" className={cn('h-full w-full', theme === 'light' ? 'text-zinc-200/30' : 'text-black/32')} preserveAspectRatio="none">
        <path
          fill="currentColor"
          d="M0,128 C240,168 480,98 720,138 C960,178 1120,108 1320,128 C1380,135 1410,132 1440,130 L1440,220 L0,220 Z"
        />
      </svg>
    </motion.div>
    <motion.div
      className="absolute -bottom-6 left-[-28%] w-[156%] opacity-[0.28]"
      style={{ height: '36%', minHeight: 64 }}
      initial={false}
      animate={{ x: ['0%', '-2.5%', '0%'] }}
      transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 1440 200" className={cn('h-full w-full', theme === 'light' ? 'text-zinc-200/22' : 'text-black/24')} preserveAspectRatio="none">
        <path
          fill="currentColor"
          d="M0,142 C320,102 640,162 960,122 C1120,102 1280,132 1440,118 L1440,200 L0,200 Z"
        />
      </svg>
    </motion.div>
  </div>
  );
};
