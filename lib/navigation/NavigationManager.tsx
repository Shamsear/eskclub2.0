'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * NavigationManager - Optimizes navigation performance
 * Implements prefetching, caching, and smooth transitions
 */
export function NavigationManager() {
  const router = useRouter();
  const pathname = usePathname();

  // Prefetch common routes on mount
  useEffect(() => {
    const commonRoutes = [
      '/tournaments',
      '/matches',
      '/players',
      '/clubs',
    ];

    // Prefetch routes after initial render
    const prefetchTimer = setTimeout(() => {
      commonRoutes.forEach((route) => {
        if (route !== pathname) {
          router.prefetch(route);
        }
      });
    }, 1000);

    return () => clearTimeout(prefetchTimer);
  }, [router, pathname]);

  // Prefetch on hover for links
  useEffect(() => {
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="/"]');
      
      if (link) {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#')) {
          router.prefetch(href);
        }
      }
    };

    // Add hover listeners with debouncing
    let timeoutId: NodeJS.Timeout;
    const debouncedHandler = (e: MouseEvent) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handleMouseEnter(e), 100);
    };

    document.addEventListener('mouseover', debouncedHandler, { passive: true });

    return () => {
      document.removeEventListener('mouseover', debouncedHandler);
      clearTimeout(timeoutId);
    };
  }, [router]);

  return null;
}

/**
 * useOptimizedNavigation - Hook for optimized navigation
 * Provides navigation with loading states and error handling
 */
export function useOptimizedNavigation() {
  const router = useRouter();

  const navigate = useCallback(
    async (href: string, options?: { scroll?: boolean }) => {
      try {
        // Prefetch before navigation
        router.prefetch(href);
        
        // Small delay to ensure prefetch completes
        await new Promise((resolve) => setTimeout(resolve, 50));
        
        // Navigate
        router.push(href, options);
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback to regular navigation
        router.push(href, options);
      }
    },
    [router]
  );

  return { navigate };
}
