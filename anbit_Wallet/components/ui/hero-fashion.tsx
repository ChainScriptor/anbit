'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface HeroFashionImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  children?: React.ReactNode;
}

/** Profile / hero image: soft pink glow + rounded card + shadow (kokonut-style). */
export default function HeroFashionImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  children,
}: HeroFashionImageProps) {
  return (
    <div className={`relative overflow-visible ${className}`}>
      <div
        className="pointer-events-none absolute -left-10 -top-10 -z-10 h-72 w-72 rounded-full bg-[#f8b3c4] opacity-20 blur-3xl"
        aria-hidden
      />
      <div className="relative">
        <motion.img
          src={src}
          alt={alt}
          initial={{ opacity: 0.96 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`w-full rounded-2xl object-cover shadow-2xl brightness-105 ${imgClassName}`}
        />
        {children}
      </div>
    </div>
  );
}
