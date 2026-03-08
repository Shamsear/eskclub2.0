'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransitionVariants, prefersReducedMotion } from './config';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageTransition - Wrapper for page-level transitions
 * Use this to wrap page content for smooth transitions between routes
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const shouldAnimate = !prefersReducedMotion();

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={pageTransitionVariants.initial}
      animate={pageTransitionVariants.animate}
      exit={pageTransitionVariants.exit}
      transition={pageTransitionVariants.transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * AnimatedPage - Higher-level wrapper that includes AnimatePresence
 * Use this at the route level for complete page transitions
 */
export function AnimatedPage({ children, className = '' }: AnimatedPageProps) {
  return (
    <AnimatePresence mode="wait">
      <PageTransition className={className}>{children}</PageTransition>
    </AnimatePresence>
  );
}
