'use client';

import { useEffect, useState } from 'react';
import { isSlowConnection, prefersReducedMotion } from '@/lib/utils/performance';

interface OptimizedLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

/**
 * Optimized loader that adapts to network conditions
 * Shows fallback immediately on slow connections
 */
export function OptimizedLoader({
  children,
  fallback,
  delay = 300,
}: OptimizedLoaderProps) {
  const [showContent, setShowContent] = useState(false);
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    // Check connection speed
    const slow = isSlowConnection();
    setIsSlow(slow);

    // Show content after delay (or immediately on slow connections)
    const timeout = setTimeout(
      () => setShowContent(true),
      slow ? 0 : delay
    );

    return () => clearTimeout(timeout);
  }, [delay]);

  if (!showContent && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AdaptiveAnimationProps {
  children: React.ReactNode;
  reducedMotionFallback?: React.ReactNode;
}

/**
 * Wrapper that respects user's motion preferences
 */
export function AdaptiveAnimation({
  children,
  reducedMotionFallback,
}: AdaptiveAnimationProps) {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    setShouldReduceMotion(prefersReducedMotion());

    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setShouldReduceMotion(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (shouldReduceMotion && reducedMotionFallback) {
    return <>{reducedMotionFallback}</>;
  }

  return <>{children}</>;
}

interface PriorityLoaderProps {
  priority: 'high' | 'medium' | 'low';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Loader that respects priority for progressive enhancement
 */
export function PriorityLoader({
  priority,
  children,
  fallback,
}: PriorityLoaderProps) {
  const [shouldLoad, setShouldLoad] = useState(priority === 'high');

  useEffect(() => {
    if (priority === 'high') return;

    const delay = priority === 'medium' ? 100 : 500;
    
    const timeout = setTimeout(() => {
      setShouldLoad(true);
    }, delay);

    return () => clearTimeout(timeout);
  }, [priority]);

  if (!shouldLoad && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
