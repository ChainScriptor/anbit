import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Coffee, Gift, Sparkles, Star, UtensilsCrossed, X, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

type BoxState = 'idle' | 'shaking' | 'opening' | 'revealing';
type RewardRarity = 'common' | 'rare' | 'legendary';

interface Reward {
  id: string;
  title: string;
  description: string;
  rarity: RewardRarity;
  icon: ReactNode;
}

interface StoreMysteryBoxProps {
  initialXp?: number;
}

const REWARDS: Record<RewardRarity, Reward[]> = {
  common: [
    {
      id: 'xp-boost',
      title: '+5 XP Boost',
      description: 'Better luck next time!',
      rarity: 'common',
      icon: <Sparkles className="h-10 w-10" />,
    },
  ],
  rare: [
    {
      id: 'coffee-voucher',
      title: 'Free Coffee Voucher',
      description: 'Enjoy a premium coffee on us!',
      rarity: 'rare',
      icon: <Coffee className="h-10 w-10" />,
    },
  ],
  legendary: [
    {
      id: 'full-meal',
      title: 'Full Meal Voucher',
      description: 'Legendary reward unlocked!',
      rarity: 'legendary',
      icon: <UtensilsCrossed className="h-10 w-10" />,
    },
  ],
};

const StoreMysteryBox: React.FC<StoreMysteryBoxProps> = ({ initialXp = 250 }) => {
  const { theme } = useTheme();
  const [boxState, setBoxState] = useState<BoxState>('idle');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xp, setXp] = useState(initialXp);

  useEffect(() => {
    setXp(initialXp);
  }, [initialXp]);

  useEffect(() => {
    if (!showConfetti) return undefined;
    const timeoutId = window.setTimeout(() => setShowConfetti(false), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [showConfetti]);

  const rarityStyles = useMemo(
    () => ({
      legendary:
        theme === 'light'
          ? 'border-[color:var(--anbit-yellow)] shadow-[0_0_24px_rgba(10,10,10,0.16)] bg-gradient-to-br from-[color:var(--anbit-card)] to-[color:var(--anbit-input)] text-[color:var(--anbit-text)]'
          : 'border-white shadow-[0_0_32px_rgba(255,255,255,0.45)] bg-gradient-to-br from-white/15 to-white/5 text-white',
      rare:
        theme === 'light'
          ? 'border-[color:var(--anbit-border)] shadow-[0_0_14px_rgba(10,10,10,0.1)] bg-gradient-to-br from-[color:var(--anbit-card)] to-[color:var(--anbit-input)] text-[color:var(--anbit-text)]'
          : 'border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.35)] bg-gradient-to-br from-white/10 to-white/5 text-white',
      common:
        theme === 'light'
          ? 'border-[color:var(--anbit-border)] shadow-[0_0_8px_rgba(10,10,10,0.06)] bg-[color:var(--anbit-card)] text-[color:var(--anbit-text)]'
          : 'border-white/30 shadow-[0_0_10px_rgba(255,255,255,0.18)] bg-gradient-to-br from-white/5 to-transparent text-white/80',
    }),
    [theme],
  );

  const getRandomReward = (): Reward => {
    const rand = Math.random();
    if (rand < 0.05) return REWARDS.legendary[0];
    if (rand < 0.25) return REWARDS.rare[0];
    return REWARDS.common[0];
  };

  const handleOpen = () => {
    if (boxState !== 'idle') return;
    setXp((prev) => (prev >= 100 ? prev - 100 : prev));
    setBoxState('shaking');
    window.setTimeout(() => setBoxState('opening'), 1000);
    window.setTimeout(() => {
      const reward = getRandomReward();
      setSelectedReward(reward);
      setBoxState('revealing');
      if (reward.rarity !== 'common') setShowConfetti(true);
    }, 1900);
  };

  const handleReset = () => {
    setBoxState('idle');
    setSelectedReward(null);
  };

  return (
    <section className="rounded-3xl bg-[color:var(--anbit-card)] p-5 shadow-sm border border-[color:var(--anbit-border)] relative overflow-hidden">
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 z-10">
          {[...Array(24)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-white"
              style={{ left: `${Math.random() * 100}%`, top: '-8%' }}
              animate={{ y: ['0%', '1400%'], opacity: [1, 0], x: [0, (Math.random() - 0.5) * 120] }}
              transition={{ duration: Math.random() * 1.2 + 1.2, ease: 'linear' }}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--anbit-muted)]">Mystery Box</h2>
        <div className="rounded-full border border-[color:var(--anbit-border)] bg-[color:var(--anbit-input)] px-3 py-1 text-xs flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-[color:var(--anbit-yellow)]" />
          <span>{xp} XP</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {boxState !== 'revealing' ? (
          <motion.div key="box-idle" initial={{ opacity: 0.85 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className={`${theme === 'light' ? 'bg-[color:var(--anbit-input)]' : 'bg-[#111]'} rounded-2xl border border-[color:var(--anbit-border)] p-4 flex flex-col items-center`}>
              <motion.div
                animate={boxState === 'shaking' ? { rotate: [0, -5, 5, -5, 0], scale: [1, 1.04, 1] } : { y: [0, -6, 0] }}
                transition={{
                  duration: boxState === 'shaking' ? 0.35 : 1.8,
                  repeat: boxState === 'shaking' ? Infinity : Infinity,
                }}
                className="relative mb-4 mt-1"
              >
                <div className="absolute inset-0 blur-xl bg-white/20 rounded-full" />
                <Gift className={`relative h-16 w-16 ${theme === 'light' ? 'text-[color:var(--anbit-text)]' : 'text-white'}`} />
              </motion.div>
              <button
                type="button"
                onClick={handleOpen}
                disabled={boxState !== 'idle'}
                className="w-full rounded-xl bg-[color:var(--anbit-yellow)] text-[color:var(--anbit-yellow-content)] py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Open for 100 XP
              </button>
            </div>
          </motion.div>
        ) : (
          selectedReward && (
            <motion.div key="box-reveal" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className={`rounded-2xl border p-4 ${rarityStyles[selectedReward.rarity]}`}>
                <button type="button" onClick={handleReset} className="ml-auto mb-2 block text-white/70 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
                <div className="text-center">
                  <div className="flex justify-center mb-3">{selectedReward.icon}</div>
                  <div className={`mb-2 flex items-center justify-center gap-1 ${theme === 'light' ? 'text-[color:var(--anbit-yellow)]' : ''}`}>
                    {selectedReward.rarity === 'legendary' && (
                      <>
                        <Star className={`h-4 w-4 ${theme === 'light' ? 'fill-[color:var(--anbit-yellow)] text-[color:var(--anbit-yellow)]' : 'fill-white text-white'}`} />
                        <Star className={`h-4 w-4 ${theme === 'light' ? 'fill-[color:var(--anbit-yellow)] text-[color:var(--anbit-yellow)]' : 'fill-white text-white'}`} />
                        <Star className={`h-4 w-4 ${theme === 'light' ? 'fill-[color:var(--anbit-yellow)] text-[color:var(--anbit-yellow)]' : 'fill-white text-white'}`} />
                      </>
                    )}
                    {selectedReward.rarity === 'rare' && (
                      <>
                        <Star className={`h-4 w-4 ${theme === 'light' ? 'fill-[color:var(--anbit-yellow)] text-[color:var(--anbit-yellow)]' : 'fill-white text-white'}`} />
                        <Star className={`h-4 w-4 ${theme === 'light' ? 'fill-[color:var(--anbit-yellow)] text-[color:var(--anbit-yellow)]' : 'fill-white text-white'}`} />
                      </>
                    )}
                    {selectedReward.rarity === 'common' && (
                      <Star className={`h-4 w-4 ${theme === 'light' ? 'fill-[color:var(--anbit-muted)] text-[color:var(--anbit-muted)]' : 'fill-white/60 text-white/60'}`} />
                    )}
                  </div>
                  <h3 className="font-semibold text-base">{selectedReward.title}</h3>
                  <p className={`mt-1 text-xs ${theme === 'light' ? 'text-[color:var(--anbit-muted)]' : 'text-white/70'}`}>{selectedReward.description}</p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-4 rounded-xl bg-[color:var(--anbit-yellow)] px-4 py-2 text-xs font-semibold text-[color:var(--anbit-yellow-content)]"
                  >
                    Open another
                  </button>
                </div>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </section>
  );
};

export default StoreMysteryBox;
