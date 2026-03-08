'use client';

import React, { useRef } from 'react';
import { motion, MotionProps, useInView } from 'framer-motion';
import { animationVariants, prefersReducedMotion } from './config';

type StaggerSpeed = 'fast' | 'normal' | 'slow';

interface StaggerContainerProps extends Omit<MotionProps, 'variants' | 'initial' | 'animate'> {
  children: React.ReactNode;
  speed?: StaggerSpeed;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'ul' | 'ol' | 'nav';
  /** If true, animation fires only when scrolled into view (scroll-triggered). Default: true */
  scrollTrigger?: boolean;
}

/**
 * StaggerContainer - Container for staggered child animations
 * Now scroll-triggered by default via useInView
 */
export function StaggerContainer({
  children,
  speed = 'normal',
  className = '',
  as = 'div',
  scrollTrigger = true,
  ...motionProps
}: StaggerContainerProps) {
  const shouldAnimate = !prefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true, amount: 0.05 });

  const staggerDelay = speed === 'fast' ? 0.05 : speed === 'slow' ? 0.15 : 0.08;

  if (!shouldAnimate) {
    return React.createElement(as, { className }, children);
  }

  const MotionComponent = motion[as];
  const shouldShow = !scrollTrigger || isInView;

  return (
    <MotionComponent
      ref={ref as any}
      initial="initial"
      animate={shouldShow ? 'animate' : 'initial'}
      variants={{
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.05,
          },
        },
        initial: {},
      }}
      className={className}
      {...motionProps}
    >
      {children}
    </MotionComponent>
  );
}

interface StaggerItemProps extends Omit<MotionProps, 'variants'> {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'li' | 'article' | 'section';
}

/**
 * StaggerItem - Individual item within a StaggerContainer
 * Uses refined spring-based entrance with expo ease
 */
export function StaggerItem({
  children,
  className = '',
  as = 'div',
  ...motionProps
}: StaggerItemProps) {
  const shouldAnimate = !prefersReducedMotion();

  if (!shouldAnimate) {
    return React.createElement(as, { className }, children);
  }

  const MotionComponent = motion[as];

  return (
    <MotionComponent
      variants={{
        initial: { opacity: 0, y: 24 },
        animate: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
      {...motionProps}
    >
      {children}
    </MotionComponent>
  );
}
