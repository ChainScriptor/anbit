
import React, { useEffect, useMemo, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '../context/ThemeContext';

const CARD_HEIGHT = 228;

/** Animated XP counter that counts up with spring physics */
function XPCounter({ target }: { target: number }) {
  const raw = useMotionValue(0);
  const spring = useSpring(raw, { stiffness: 55, damping: 18, mass: 1.3 });
  const [display, setDisplay] = useState(0);

  useEffect(() => { raw.set(target); }, [target, raw]);
  useEffect(() => {
    const unsub = spring.on('change', (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return <>{display.toLocaleString()}</>;
}

/** Floating particle dot */
function Particle({
  x, y, delay, dur, color,
}: { x: string; y: string; delay: number; dur: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{ left: x, top: y, width: 2, height: 2, background: color }}
      animate={{ opacity: [0, 0.85, 0], scale: [0, 1.35, 0] }}
      transition={{ duration: dur, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
}

const PARTICLES = [
  { x: '8%',  y: '18%', delay: 0,    dur: 2.4 },
  { x: '18%', y: '72%', delay: 0.4,  dur: 3.1 },
  { x: '30%', y: '30%', delay: 0.9,  dur: 2.7 },
  { x: '44%', y: '82%', delay: 0.2,  dur: 2.2 },
  { x: '55%', y: '20%', delay: 1.1,  dur: 3.4 },
  { x: '67%', y: '65%', delay: 0.6,  dur: 2.9 },
  { x: '78%', y: '38%', delay: 1.5,  dur: 2.6 },
  { x: '88%', y: '78%', delay: 0.3,  dur: 3.0 },
  { x: '23%', y: '50%', delay: 1.8,  dur: 2.3 },
  { x: '60%', y: '48%', delay: 0.8,  dur: 3.2 },
  { x: '92%', y: '25%', delay: 1.3,  dur: 2.8 },
  { x: '3%',  y: '55%', delay: 2.0,  dur: 2.5 },
];

interface XPHeroCardProps {
  totalXP: number;
  userName?: string;
  placeholderMessage?: string;
  /** Background color of the page, used for bottom fade blend */
  pageBg?: string;
}

const XPHeroCard: React.FC<XPHeroCardProps> = ({
  totalXP,
  userName,
  placeholderMessage,
  pageBg = '#F2F2F2',
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const particleColor = isLight ? 'rgba(36, 36, 36, 0.45)' : 'rgba(255, 255, 255, 0.35)';

  const shellBg = useMemo(() => {
    if (isLight) {
      return {
        background: `
          linear-gradient(180deg, #ffffff 0%, #fafafa 52%, ${pageBg} 100%),
          radial-gradient(ellipse 90% 65% at 50% -8%, rgba(36, 36, 36, 0.09) 0%, transparent 58%)
        `,
      };
    }
    return {
      background: `
        linear-gradient(165deg, #2c2c2c 0%, #242424 38%, #1a1a1a 100%),
        radial-gradient(ellipse 88% 72% at 50% -18%, rgba(37, 99, 235, 0.16) 0%, transparent 55%)
      `,
    };
  }, [isLight, pageBg]);

  const accentLine = isLight
    ? 'linear-gradient(90deg, transparent, rgba(36, 36, 36, 0.35), transparent)'
    : `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.22), transparent)`;

  const numberColor = isLight ? '#202125' : '#ffffff';
  const suffixClass = isLight ? 'text-[#242424]' : 'text-white/55';
  const labelClass = isLight ? 'text-neutral-500' : 'text-[color:var(--anbit-muted)]';
  const messageClass = isLight ? 'text-neutral-600' : 'text-[color:var(--anbit-muted)]';

  const numberGlow = isLight
    ? [
        '0 1px 0 rgba(255,255,255,0.9), 0 12px 40px rgba(36,36,36,0.12)',
        '0 1px 0 rgba(255,255,255,0.9), 0 16px 48px rgba(36,36,36,0.18)',
        '0 1px 0 rgba(255,255,255,0.9), 0 12px 40px rgba(36,36,36,0.12)',
      ]
    : [
        '0 0 20px rgba(255,255,255,0.12), 0 0 48px rgba(37,99,235,0.18)',
        '0 0 28px rgba(255,255,255,0.18), 0 0 64px rgba(37,99,235,0.22)',
        '0 0 20px rgba(255,255,255,0.12), 0 0 48px rgba(37,99,235,0.18)',
      ];

  // Window scroll → card collapse
  const { scrollY } = useScroll();

  const rawHeight   = useTransform(scrollY, [0, CARD_HEIGHT + 20], [CARD_HEIGHT, 0]);
  const rawOpacity  = useTransform(scrollY, [0, CARD_HEIGHT * 0.65], [1, 0]);
  const rawContentY = useTransform(scrollY, [0, CARD_HEIGHT + 20], [0, -36]);

  const animHeight   = useSpring(rawHeight,   { stiffness: 220, damping: 32 });
  const animOpacity  = useSpring(rawOpacity,  { stiffness: 220, damping: 32 });
  const animContentY = useSpring(rawContentY, { stiffness: 220, damping: 32 });

  const topGlow = isLight
    ? `radial-gradient(circle, rgba(36, 36, 36, 0.14) 0%, transparent 68%)`
    : `radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 68%)`;

  const cornerGlow = isLight
    ? `radial-gradient(circle, rgba(36, 36, 36, 0.1) 0%, transparent 72%)`
    : `radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 72%)`;

  return (
    <motion.div
      style={{ height: animHeight, overflow: 'hidden', fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
      className={cn(
        'relative w-full -mx-4 sm:-mx-6 lg:mx-0 lg:rounded-2xl',
        isLight
          ? 'border border-zinc-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
          : 'border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)]',
      )}
    >
      {/* Card surface — ίδιο πνεύμα με profile/history (κάρτα, όχι μωβ cosmic) */}
      <div className="absolute inset-0 overflow-hidden rounded-[inherit] lg:rounded-2xl" style={shellBg} />

      {/* Soft top glow */}
      <motion.div
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: 260,
          height: 260,
          background: topGlow,
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Corner brand accent */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 140,
          height: 140,
          bottom: -24,
          right: '12%',
          background: cornerGlow,
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      />

      {PARTICLES.map((p, i) => (
        <Particle key={i} {...p} color={particleColor} />
      ))}

      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: accentLine }}
      />

      <motion.div
        style={{ opacity: animOpacity, y: animContentY }}
        className="absolute inset-0 flex flex-col items-center justify-center select-none px-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-10 rounded-full" style={{ background: accentLine }} />
          <span className={cn('text-[10px] font-bold tracking-[0.2em] uppercase', labelClass)}>
            {userName ? `${userName} ·` : ''} Παγκόσμιο Υπόλοιπο
          </span>
          <div className="h-px w-10 rounded-full" style={{ background: accentLine }} />
        </div>

        <div className="relative flex items-end gap-2">
          <div
            className="absolute inset-x-0 bottom-0 h-10 pointer-events-none opacity-80"
            style={{
              background: isLight
                ? `radial-gradient(ellipse 75% 100% at 50% 100%, rgba(36, 36, 36, 0.12) 0%, transparent 72%)`
                : `radial-gradient(ellipse 75% 100% at 50% 100%, rgba(37, 99, 235, 0.2) 0%, transparent 72%)`,
              filter: 'blur(8px)',
            }}
          />

          <motion.span
            className="font-black leading-none relative tabular-nums"
            style={{
              fontSize: 72,
              lineHeight: 1,
              color: numberColor,
            }}
            animate={{ textShadow: numberGlow }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <XPCounter target={totalXP} />
          </motion.span>

          <span className={cn('font-extrabold pb-2.5 text-xl tracking-tight', suffixClass)}>
            XP
          </span>
        </div>

        {placeholderMessage && (
          <p className={cn('mt-3 text-center text-[11px] font-semibold tracking-wide', messageClass)}>
            {placeholderMessage}
          </p>
        )}
      </motion.div>

      <div
        className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
        style={{ background: `linear-gradient(to bottom, transparent, ${pageBg})` }}
      />
    </motion.div>
  );
};

export default XPHeroCard;
