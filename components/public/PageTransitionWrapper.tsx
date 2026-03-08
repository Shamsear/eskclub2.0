'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/animations/config';
import { useScrollRestoration } from '@/lib/hooks/useScrollRestoration';

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

/**
 * PageTransitionWrapper - Wraps page content with smooth transitions
 * Handles fade in/out animations between route changes
 */
export function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const pathname = usePathname();
  const shouldAnimate = !prefersReducedMotion();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Manage scroll restoration
  useScrollRestoration();

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!shouldAnimate) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 16, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 1.005 }}
        transition={{
          duration: 0.38,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface FadeTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * FadeTransition - Simple fade transition for content
 * Used for section-level transitions
 */
export function FadeTransition({ children, className = '' }: FadeTransitionProps) {
  const shouldAnimate = !prefersReducedMotion();

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface SlideTransitionProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

/**
 * SlideTransition - Slide transition for content
 * Used for modal and drawer animations
 */
export function SlideTransition({ 
  children, 
  direction = 'up',
  className = '' 
}: SlideTransitionProps) {
  const shouldAnimate = !prefersReducedMotion();

  const variants = {
    up: { initial: { y: 20 }, animate: { y: 0 }, exit: { y: 20 } },
    down: { initial: { y: -20 }, animate: { y: 0 }, exit: { y: -20 } },
    left: { initial: { x: 20 }, animate: { x: 0 }, exit: { x: 20 } },
    right: { initial: { x: -20 }, animate: { x: 0 }, exit: { x: -20 } },
  };

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ ...variants[direction].initial, opacity: 0 }}
      animate={{ ...variants[direction].animate, opacity: 1 }}
      exit={{ ...variants[direction].exit, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
