import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ANBIT_WORDMARK_PATH_D } from './anbitWordmarkPath';
import { playSplashDrawSfxFromUserGesture } from './playSplashSfx';

type Props = { onComplete?: () => void };

const AnbitSplashScreen = ({ onComplete }: Props) => {
  const doneRef = useRef(false);
  const sfxStartedRef = useRef(false);

  const tryStartSfxOnUserGesture = () => {
    if (sfxStartedRef.current) return;
    sfxStartedRef.current = true;
    playSplashDrawSfxFromUserGesture();
  };

  const handleAnimationComplete = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete?.();
  };

  return (
    <motion.div
      role="presentation"
      onPointerDownCapture={tryStartSfxOnUserGesture}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <svg width="300" viewBox="-17 -7 571 182" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          d={ANBIT_WORDMARK_PATH_D}
          stroke="#ffffff"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, fill: 'rgba(255, 255, 255, 0)' }}
          animate={{
            pathLength: 1,
            fill: 'rgba(255, 255, 255, 1)',
          }}
          transition={{
            pathLength: { duration: 1.5, ease: 'easeInOut' },
            fill: { delay: 1.2, duration: 0.5 },
          }}
          onAnimationComplete={handleAnimationComplete}
        />
      </svg>
    </motion.div>
  );
};

export default AnbitSplashScreen;
