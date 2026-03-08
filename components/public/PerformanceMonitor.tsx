'use client';

import { useEffect } from 'react';
import { logCoreWebVitals, markPerformance, measurePerformance } from '@/lib/utils/performance';

interface PerformanceMonitorProps {
  pageName: string;
  enableLogging?: boolean;
}

/**
 * Performance monitoring component
 * Tracks page load times and Core Web Vitals
 */
export function PerformanceMonitor({
  pageName,
  enableLogging = process.env.NODE_ENV === 'development',
}: PerformanceMonitorProps) {
  useEffect(() => {
    if (!enableLogging) return;

    // Mark page load start
    markPerformance(`${pageName}-start`);

    // Log Core Web Vitals
    logCoreWebVitals();

    // Measure time to interactive
    const measureTTI = () => {
      markPerformance(`${pageName}-interactive`);
      measurePerformance(
        `${pageName}-tti`,
        `${pageName}-start`,
        `${pageName}-interactive`
      );
    };

    // Measure after a short delay to ensure interactivity
    const timeout = setTimeout(measureTTI, 100);

    return () => clearTimeout(timeout);
  }, [pageName, enableLogging]);

  return null;
}

/**
 * Hook for tracking component render performance
 */
export function useRenderPerformance(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const startMark = `${componentName}-render-start`;
    const endMark = `${componentName}-render-end`;

    markPerformance(startMark);

    return () => {
      markPerformance(endMark);
      measurePerformance(`${componentName}-render`, startMark, endMark);
    };
  }, [componentName]);
}

/**
 * Component that logs render count (development only)
 */
export function RenderCounter({ name }: { name: string }) {
  if (process.env.NODE_ENV !== 'development') return null;

  useEffect(() => {
    console.log(`🔄 ${name} rendered`);
  });

  return null;
}
