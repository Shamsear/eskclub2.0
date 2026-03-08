/**
 * Micro-interactions Configuration
 * 
 * This file defines subtle, delightful micro-interactions that enhance
 * the user experience throughout the public sports platform.
 */

import { Variants } from 'framer-motion';

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Button press animation
 * Subtle scale down on press for tactile feedback
 */
export const buttonPress: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  press: { scale: 0.98 },
};

/**
 * Card hover lift
 * Elevates cards on hover with shadow increase
 */
export const cardLift: Variants = {
  rest: {
    y: 0,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  },
  hover: {
    y: -4,
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

/**
 * Badge pulse
 * Subtle pulse animation for status badges
 */
export const badgePulse: Variants = {
  initial: { scale: 1, opacity: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Number counter animation
 * Smooth counting animation for statistics
 */
export const counterAnimation = {
  duration: 1000,
  ease: 'easeOut',
};

/**
 * Icon bounce
 * Playful bounce for interactive icons
 */
export const iconBounce: Variants = {
  rest: { y: 0 },
  hover: {
    y: [0, -4, 0],
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
};

/**
 * Ripple effect
 * Material Design-inspired ripple on click
 */
export const rippleEffect = {
  initial: { scale: 0, opacity: 0.5 },
  animate: {
    scale: 2,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

/**
 * Tooltip fade
 * Smooth fade in/out for tooltips
 */
export const tooltipFade: Variants = {
  hidden: {
    opacity: 0,
    y: 4,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
};

/**
 * Skeleton shimmer
 * Loading shimmer effect for skeleton loaders
 */
export const skeletonShimmer = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Progress bar fill
 * Smooth progress bar animation
 */
export const progressFill: Variants = {
  initial: { width: '0%' },
  animate: (width: number) => ({
    width: `${width}%`,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  }),
};

/**
 * Notification slide
 * Slide in from right for notifications/toasts
 */
export const notificationSlide: Variants = {
  hidden: {
    x: 400,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: 400,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Modal backdrop
 * Fade in backdrop for modals
 */
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Modal content
 * Scale and fade in modal content
 */
export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * List item stagger
 * Stagger animation for list items
 */
export const listStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const listItem: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

/**
 * Tab switch
 * Smooth tab switching animation
 */
export const tabSwitch: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 20 : -20,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  }),
};

/**
 * Rank change indicator
 * Animation for rank changes in leaderboard
 */
export const rankChange: Variants = {
  up: {
    y: [0, -20, 0],
    color: ['#000', '#16a34a', '#000'],
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
  down: {
    y: [0, 20, 0],
    color: ['#000', '#dc2626', '#000'],
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
  same: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Success checkmark
 * Animated checkmark for success states
 */
export const successCheckmark: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 0.5,
        ease: 'easeInOut',
      },
      opacity: {
        duration: 0.2,
      },
    },
  },
};

/**
 * Error shake
 * Shake animation for error states
 */
export const errorShake: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
    },
  },
};

/**
 * Loading spinner
 * Smooth rotation for loading indicators
 */
export const loadingSpinner = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Accordion expand/collapse
 * Smooth height animation for accordions
 */
export const accordionContent: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        duration: 0.3,
      },
      opacity: {
        duration: 0.2,
      },
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: {
        duration: 0.3,
      },
      opacity: {
        duration: 0.2,
        delay: 0.1,
      },
    },
  },
};

/**
 * Get animation with reduced motion support
 */
export const getAnimation = (animation: Variants): Variants => {
  if (prefersReducedMotion()) {
    // Return instant transitions for reduced motion
    return Object.keys(animation).reduce((acc, key) => {
      acc[key] = {
        ...animation[key],
        transition: { duration: 0 },
      };
      return acc;
    }, {} as Variants);
  }
  return animation;
};

/**
 * Hover scale utility
 */
export const hoverScale = (scale: number = 1.05) => ({
  whileHover: { scale },
  whileTap: { scale: scale * 0.95 },
  transition: { duration: 0.2 },
});

/**
 * Focus ring utility
 */
export const focusRing = {
  whileFocus: {
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)',
  },
};
