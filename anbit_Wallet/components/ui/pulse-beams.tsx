import React from 'react';
import { motion, type Transition } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useThemeMode } from '../../context/ThemeContext';

export interface BeamPath {
  path: string;
  gradientConfig: {
    initial: {
      x1: string;
      x2: string;
      y1: string;
      y2: string;
    };
    animate: {
      x1: string | string[];
      x2: string | string[];
      y1: string | string[];
      y2: string | string[];
    };
    transition?: Transition;
  };
  connectionPoints?: Array<{
    cx: number;
    cy: number;
    r: number;
  }>;
}

export interface PulseBeamsProps {
  children?: React.ReactNode;
  className?: string;
  background?: React.ReactNode;
  beams: BeamPath[];
  width?: number;
  height?: number;
  baseColor?: string;
  accentColor?: string;
  gradientColors?: {
    start: string;
    middle: string;
    end: string;
  };
}

const DARK_GRADIENT = {
  start: 'rgba(230, 53, 51, 0)',
  middle: '#2563eb',
  end: 'rgba(230, 53, 51, 0.35)',
};

const LIGHT_GRADIENT = {
  start: 'rgba(10, 10, 10, 0)',
  middle: '#0a0a0a',
  end: 'rgba(10, 10, 10, 0.35)',
};

export const PulseBeams = ({
  children,
  className,
  background,
  beams,
  width = 858,
  height = 434,
  baseColor: baseColorProp,
  accentColor: accentColorProp,
  gradientColors: gradientColorsProp,
}: PulseBeamsProps) => {
  const theme = useThemeMode();
  const isLight = theme === 'light';
  const baseColor = baseColorProp ?? (isLight ? '#0a0a0a' : '#2563eb');
  const accentColor = accentColorProp ?? (isLight ? '#333333' : '#b02826');
  const gradientColors = gradientColorsProp ?? (isLight ? LIGHT_GRADIENT : DARK_GRADIENT);

  return (
    <div
      className={cn(
        'relative flex h-screen w-full items-center justify-center overflow-hidden antialiased',
        className,
      )}
    >
      {background}
      <div className="relative z-10">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <PulseBeamSVGs
          beams={beams}
          width={width}
          height={height}
          baseColor={baseColor}
          accentColor={accentColor}
          gradientColors={gradientColors}
        />
      </div>
    </div>
  );
};

interface PulseBeamSVGsProps {
  beams: BeamPath[];
  width: number;
  height: number;
  baseColor: string;
  accentColor: string;
  gradientColors: NonNullable<PulseBeamsProps['gradientColors']>;
}

const PulseBeamSVGs = ({
  beams,
  width,
  height,
  baseColor,
  accentColor,
  gradientColors,
}: PulseBeamSVGsProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex shrink-0"
    >
      {beams.map((beam, index) => (
        <React.Fragment key={index}>
          <path d={beam.path} stroke={baseColor} strokeWidth="1" strokeOpacity={0.35} />
          <path
            d={beam.path}
            stroke={`url(#pulse-grad-${index})`}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {beam.connectionPoints?.map((point, pointIndex) => (
            <circle
              key={`${index}-${pointIndex}`}
              cx={point.cx}
              cy={point.cy}
              r={point.r}
              fill={baseColor}
              stroke={accentColor}
              strokeWidth={1}
            />
          ))}
        </React.Fragment>
      ))}

      <defs>
        {beams.map((beam, index) => (
          <motion.linearGradient
            key={index}
            id={`pulse-grad-${index}`}
            gradientUnits="userSpaceOnUse"
            initial={beam.gradientConfig.initial}
            animate={beam.gradientConfig.animate}
            transition={beam.gradientConfig.transition}
          >
            <BeamGradientStops colors={gradientColors} />
          </motion.linearGradient>
        ))}
      </defs>
    </svg>
  );
};

function BeamGradientStops({
  colors = DARK_GRADIENT,
}: {
  colors?: { start: string; middle: string; end: string };
}) {
  return (
    <>
      <stop offset="0%" stopColor={colors.start} stopOpacity={0} />
      <stop offset="20%" stopColor={colors.start} stopOpacity={1} />
      <stop offset="50%" stopColor={colors.middle} stopOpacity={1} />
      <stop offset="100%" stopColor={colors.end} stopOpacity={0} />
    </>
  );
}
