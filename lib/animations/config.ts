/**
 * Animation Configuration
 * Centralized animation tokens and variants for consistent motion design
 */

export const animationDuration = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
} as const;

export const animationEasing = {
  linear: [0, 0, 1, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: [0.34, 1.56, 0.64, 1],
} as const;

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation duration based on user preferences
 */
export function getAnimationDuration(duration: number): number {
  return prefersReducedMotion() ? 0 : duration;
}

/**
 * Common animation variants
 */
export const animationVariants = {
  // Fade In
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: animationDuration.normal },
  },

  // Slide Up
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: animationDuration.normal, ease: animationEasing.easeOut },
  },

  // Slide Down
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: animationDuration.normal, ease: animationEasing.easeOut },
  },

  // Slide Left
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: animationDuration.normal, ease: animationEasing.easeOut },
  },

  // Slide Right
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: animationDuration.normal, ease: animationEasing.easeOut },
  },

  // Scale
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: animationDuration.normal, ease: animationEasing.easeOut },
  },

  // Scale Up (from smaller)
  scaleUp: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: animationDuration.normal, ease: animationEasing.spring },
  },

  // Stagger Container
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  },

  // Stagger Container (Fast)
  staggerContainerFast: {
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
  },

  // Stagger Container (Slow)
  staggerContainerSlow: {
    animate: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.15,
      },
    },
  },

  // Stagger Item
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
} as const;

/**
 * Hover animation variants
 */
export const hoverVariants = {
  // Scale on hover
  scale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: animationDuration.fast },
  },

  // Lift on hover (with shadow)
  lift: {
    whileHover: { y: -4, scale: 1.02 },
    whileTap: { y: 0, scale: 0.98 },
    transition: { duration: animationDuration.fast },
  },

  // Glow on hover
  glow: {
    whileHover: { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
    transition: { duration: animationDuration.fast },
  },
} as const;

/**
 * Page transition variants
 */
export const pageTransitionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: animationDuration.normal, ease: animationEasing.easeInOut },
} as const;

/**
 * Rank change animation variants for leaderboard
 */
export const rankChangeVariants = {
  up: {
    initial: { y: 0 },
    animate: { y: [-10, 0], opacity: [0.5, 1] },
    transition: { duration: animationDuration.slow, ease: animationEasing.spring },
  },
  down: {
    initial: { y: 0 },
    animate: { y: [10, 0], opacity: [0.5, 1] },
    transition: { duration: animationDuration.slow, ease: animationEasing.spring },
  },
  same: {
    initial: { scale: 1 },
    animate: { scale: [1, 1.05, 1] },
    transition: { duration: animationDuration.fast },
  },
} as const;
