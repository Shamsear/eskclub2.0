/**
 * Animation System
 * 
 * A comprehensive animation library built on Framer Motion
 * with support for reduced motion preferences.
 * 
 * Usage:
 * ```tsx
 * import { AnimatedContainer, StaggerContainer, StaggerItem } from '@/lib/animations';
 * 
 * <AnimatedContainer variant="fadeIn">
 *   <h1>Hello World</h1>
 * </AnimatedContainer>
 * 
 * <StaggerContainer>
 *   <StaggerItem>Item 1</StaggerItem>
 *   <StaggerItem>Item 2</StaggerItem>
 *   <StaggerItem>Item 3</StaggerItem>
 * </StaggerContainer>
 * ```
 */

// Configuration and utilities
export {
  animationDuration,
  animationEasing,
  animationVariants,
  hoverVariants,
  pageTransitionVariants,
  rankChangeVariants,
  prefersReducedMotion,
  getAnimationDuration,
} from './config';

// Components
export { AnimatedContainer } from './AnimatedContainer';
export { StaggerContainer, StaggerItem } from './StaggerContainer';
export { PageTransition, AnimatedPage } from './PageTransition';
export { ScrollReveal, Parallax, ScrollProgress, FadeInWhenVisible } from './ScrollReveal';
export { RankAnimation, AnimatedCounter } from './RankAnimation';

// Re-export commonly used Framer Motion utilities
export { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
