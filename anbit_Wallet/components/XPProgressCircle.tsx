
import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';

const XP_GOLD = '#F5C518';
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
function Particle({ x, y, delay, dur }: { x: string; y: string; delay: number; dur: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{ left: x, top: y, width: 2, height: 2, background: XP_GOLD }}
      animate={{ opacity: [0, 0.9, 0], scale: [0, 1.4, 0] }}
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
  // Window scroll → card collapse
  const { scrollY } = useScroll();

  const rawHeight   = useTransform(scrollY, [0, CARD_HEIGHT + 20], [CARD_HEIGHT, 0]);
  const rawOpacity  = useTransform(scrollY, [0, CARD_HEIGHT * 0.65], [1, 0]);
  const rawContentY = useTransform(scrollY, [0, CARD_HEIGHT + 20], [0, -36]);

  const animHeight   = useSpring(rawHeight,   { stiffness: 220, damping: 32 });
  const animOpacity  = useSpring(rawOpacity,  { stiffness: 220, damping: 32 });
  const animContentY = useSpring(rawContentY, { stiffness: 220, damping: 32 });

  return (
    <motion.div
      style={{ height: animHeight, overflow: 'hidden' }}
      className="relative w-full -mx-4 sm:-mx-6 lg:mx-0 lg:rounded-2xl"
    >
      {/* Dark cosmic background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 120% at 50% -10%, #1b1040 0%, #100c2a 35%, #0c0a1e 60%, #0a0a0a 100%)',
        }}
      />

      {/* Animated ambient glow – centre top */}
      <motion.div
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: 280,
          height: 280,
          background: `radial-gradient(circle, ${XP_GOLD}22 0%, transparent 68%)`,
        }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Second accent glow (blue) */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 160,
          height: 160,
          bottom: -30,
          right: '15%',
          background: 'radial-gradient(circle, #2563eb22 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Particles */}
      {PARTICLES.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      {/* Thin gold top line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${XP_GOLD}66, transparent)` }}
      />

      {/* Content */}
      <motion.div
        style={{ opacity: animOpacity, y: animContentY }}
        className="absolute inset-0 flex flex-col items-center justify-center select-none"
      >
        {/* Label row */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="h-px w-10 rounded-full"
            style={{ background: `linear-gradient(90deg, transparent, ${XP_GOLD}70)` }}
          />
          <span
            className="text-[10px] font-bold tracking-[0.22em] uppercase"
            style={{ color: 'rgba(255,255,255,0.38)' }}
          >
            {userName ? `${userName} ·` : ''} Παγκόσμιο Υπόλοιπο
          </span>
          <div
            className="h-px w-10 rounded-full"
            style={{ background: `linear-gradient(90deg, ${XP_GOLD}70, transparent)` }}
          />
        </div>

        {/* Big XP number */}
        <div className="relative flex items-end gap-2">
          {/* Soft glow beneath the number */}
          <div
            className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 80% 100% at 50% 100%, ${XP_GOLD}30 0%, transparent 70%)`,
              filter: 'blur(6px)',
            }}
          />

          <motion.span
            className="font-black leading-none relative"
            style={{
              fontSize: 72,
              lineHeight: 1,
              color: XP_GOLD,
              fontVariantNumeric: 'tabular-nums',
            }}
            animate={{
              textShadow: [
                `0 0 24px ${XP_GOLD}90, 0 0 60px ${XP_GOLD}44`,
                `0 0 40px ${XP_GOLD}cc, 0 0 100px ${XP_GOLD}66`,
                `0 0 24px ${XP_GOLD}90, 0 0 60px ${XP_GOLD}44`,
              ],
            }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <XPCounter target={totalXP} />
          </motion.span>

          <span
            className="font-extrabold pb-2.5 text-xl tracking-tight"
            style={{ color: `${XP_GOLD}aa` }}
          >
            XP
          </span>
        </div>

        {/* Optional message */}
        {placeholderMessage && (
          <p
            className="mt-3 text-[11px] font-semibold tracking-wide"
            style={{ color: `${XP_GOLD}cc` }}
          >
            {placeholderMessage}
          </p>
        )}
      </motion.div>

      {/* Bottom gradient – dissolves into page background */}
      <div
        className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
        style={{ background: `linear-gradient(to bottom, transparent, ${pageBg})` }}
      />
    </motion.div>
  );
};

export default XPHeroCard;
