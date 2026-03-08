/**
 * Performance monitoring utilities
 * Helps track and optimize page load times
 */

/**
 * Mark a performance measurement point
 */
export function markPerformance(name: string) {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(name);
  }
}

/**
 * Measure time between two marks
 */
export function measurePerformance(
  name: string,
  startMark: string,
  endMark: string
) {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${name}: ${measure.duration.toFixed(2)}ms`);
      }
      
      return measure.duration;
    } catch (error) {
      console.error('Performance measurement error:', error);
    }
  }
  return 0;
}

/**
 * Get Core Web Vitals
 */
export function getCoreWebVitals() {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  const fcp = paint.find((entry) => entry.name === 'first-contentful-paint');
  const lcp = performance.getEntriesByType('largest-contentful-paint').pop();

  return {
    // First Contentful Paint
    fcp: fcp ? fcp.startTime : 0,
    
    // Largest Contentful Paint
    lcp: lcp ? (lcp as any).startTime : 0,
    
    // Time to Interactive (approximation)
    tti: navigation ? navigation.domInteractive : 0,
    
    // Total Blocking Time (approximation)
    tbt: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
  };
}

/**
 * Log Core Web Vitals to console (development only)
 */
export function logCoreWebVitals() {
  if (process.env.NODE_ENV !== 'development') return;

  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const vitals = getCoreWebVitals();
        if (vitals) {
          console.group('📊 Core Web Vitals');
          console.log(`FCP: ${vitals.fcp.toFixed(2)}ms (target: < 1500ms)`);
          console.log(`LCP: ${vitals.lcp.toFixed(2)}ms (target: < 2500ms)`);
          console.log(`TTI: ${vitals.tti.toFixed(2)}ms (target: < 3500ms)`);
          console.groupEnd();
        }
      }, 0);
    });
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if connection is slow
 */
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return false;
  }

  const connection = (navigator as any).connection;
  
  // Check for slow connection types
  const slowConnectionTypes = ['slow-2g', '2g', '3g'];
  if (slowConnectionTypes.includes(connection.effectiveType)) {
    return true;
  }

  // Check for save-data mode
  if (connection.saveData) {
    return true;
  }

  return false;
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImages(selector: string = 'img[data-src]') {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return;
  }

  const images = document.querySelectorAll(selector);

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.getAttribute('data-src');
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  });

  images.forEach((img) => imageObserver.observe(img));
}

/**
 * Request idle callback wrapper with fallback
 */
export function requestIdleCallback(callback: () => void, options?: { timeout?: number }) {
  if (typeof window === 'undefined') {
    return;
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, options);
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(callback, 1);
  }
}
