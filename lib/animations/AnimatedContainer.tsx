'use client';

import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { animationVariants, prefersReducedMotion } from './config';

type AnimationVariant = keyof typeof animationVariants;

interface AnimatedContainerProps extends Omit<MotionProps, 'variants' | 'initial' | 'animate' | 'exit'> {
  children: React.ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'nav' | 'main';
}

/**
 * AnimatedContainer - A reusable container with predefined animation variants
 * Automatically respects prefers-reduced-motion settings
 */
export function AnimatedContainer({
  children,
  variant = 'fadeIn',
  delay = 0,
  className = '',
  as = 'div',
  ...motionProps
}: AnimatedContainerProps) {
  const shouldAnimate = !prefersReducedMotion();
  const variantConfig = animationVariants[variant];

  if (!shouldAnimate) {
    // Render without animation if user prefers reduced motion
    const Component = as;
    return React.createElement(Component, { className }, children);
  }

  // Only use variants that have initial/animate/exit
  const hasTransitions = 'initial' in variantConfig && 'animate' in variantConfig && 'exit' in variantConfig;
  
  if (!hasTransitions) {
    // Fallback for stagger containers
    return React.createElement(as, { className }, children);
  }

  const MotionComponent = motion[as];

  return (
    <MotionComponent
      initial={variantConfig.initial}
      animate={variantConfig.animate}
      exit={variantConfig.exit}
      transition={{
        ...('transition' in variantConfig ? variantConfig.transition : {}),
        delay,
      }}
      className={className}
      {...motionProps}
    >
      {children}
    </MotionComponent>
  );
}
