'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { rankChangeVariants, animationDuration, prefersReducedMotion } from './config';

type RankChange = 'up' | 'down' | 'same';

interface RankAnimationProps {
  children: React.ReactNode;
  previousRank?: number;
  currentRank: number;
  className?: string;
}

/**
 * RankAnimation - Animates rank changes in leaderboards
 * Shows directional indicators and smooth transitions
 */
export function RankAnimation({
  children,
  previousRank,
  currentRank,
  className = '',
}: RankAnimationProps) {
  const [rankChange, setRankChange] = useState<RankChange>('same');
  const [showIndicator, setShowIndicator] = useState(false);
  const shouldAnimate = !prefersReducedMotion();

  useEffect(() => {
    if (previousRank !== undefined && previousRank !== currentRank) {
      const change: RankChange = previousRank > currentRank ? 'up' : 'down';
      setRankChange(change);
      setShowIndicator(true);

      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [previousRank, currentRank]);

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  const variant = rankChangeVariants[rankChange];

  return (
    <motion.div
      initial={variant.initial as any}
      animate={variant.animate as any}
      transition={variant.transition}
      className={`relative ${className}`}
    >
      {children}
      
      {showIndicator && rankChange !== 'same' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: animationDuration.fast }}
          className={`
            absolute -right-2 -top-2 w-6 h-6 rounded-full
            flex items-center justify-center text-white text-xs font-bold
            ${rankChange === 'up' ? 'bg-green-500' : 'bg-red-500'}
          `}
          aria-label={`Rank changed ${rankChange}`}
        >
          {rankChange === 'up' ? '↑' : '↓'}
        </motion.div>
      )}
    </motion.div>
  );
}

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  format?: (value: number) => string;
}

/**
 * AnimatedCounter - Smoothly animates number changes
 * Used for statistics and counters in leaderboards
 */
export function AnimatedCounter({
  value,
  duration = 1000,
  className = '',
  format = (v) => Math.round(v).toString(),
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const shouldAnimate = !prefersReducedMotion();

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayValue(value);
      return;
    }

    const startValue = displayValue;
    const difference = value - startValue;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + difference * easeOut;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, shouldAnimate]);

  return (
    <motion.span
      key={value}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: animationDuration.fast }}
      className={className}
    >
      {format(displayValue)}
    </motion.span>
  );
}
