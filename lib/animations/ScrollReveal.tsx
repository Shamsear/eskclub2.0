'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { animationDuration, animationEasing, prefersReducedMotion } from './config';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  once?: boolean;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
}

/**
 * ScrollReveal - Reveals content when it enters the viewport
 * Premium spring-based entrance with directional control
 */
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  threshold = 0.1,
  once = true,
  direction = 'up',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const shouldAnimate = !prefersReducedMotion();

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  const directionMap = {
    up:    { initial: { opacity: 0, y: 32 },  animate: { opacity: 1, y: 0 } },
    down:  { initial: { opacity: 0, y: -32 }, animate: { opacity: 1, y: 0 } },
    left:  { initial: { opacity: 0, x: 32 },  animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -32 }, animate: { opacity: 1, x: 0 } },
    scale: { initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 } },
  };

  const { initial, animate } = directionMap[direction];

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? animate : initial}
      transition={{
        duration: animationDuration.slow,
        delay,
        ease: [0.22, 1, 0.36, 1], // custom expo ease-out for premium feel
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  offset?: number;
}

/**
 * Parallax - Creates parallax scrolling effect
 */
export function Parallax({ children, className = '', offset = 50 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, offset]);
  const shouldAnimate = !prefersReducedMotion();

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

interface ScrollProgressProps {
  className?: string;
}

/**
 * ScrollProgress - Orange branded scroll progress bar
 */
export function ScrollProgress({ className = '' }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const shouldAnimate = !prefersReducedMotion();

  if (!shouldAnimate) return null;

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-[2px] origin-left z-50 ${className}`}
      style={{
        scaleX: scrollYProgress,
        background: 'linear-gradient(90deg,#FF6600,#FFB700)',
      }}
    />
  );
}

interface FadeInWhenVisibleProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * FadeInWhenVisible - Simple fade-in triggered by IntersectionObserver
 * Lightweight version without full motion dependency
 */
export function FadeInWhenVisible({ children, className = '', delay = 0 }: FadeInWhenVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const shouldAnimate = !prefersReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1 }}
      animate={isInView ? { opacity: 1, y: 0 } : (shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1 })}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
