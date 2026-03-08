'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface ScrollPosition {
  x: number;
  y: number;
}

// Store scroll positions for each route
const scrollPositions = new Map<string, ScrollPosition>();

/**
 * useScrollRestoration - Manages scroll position across navigation
 * Restores scroll position when navigating back, scrolls to top on new navigation
 */
export function useScrollRestoration() {
  const pathname = usePathname();
  const isRestoringRef = useRef(false);

  useEffect(() => {
    // Save current scroll position before navigation
    const saveScrollPosition = () => {
      if (!isRestoringRef.current) {
        scrollPositions.set(pathname, {
          x: window.scrollX,
          y: window.scrollY,
        });
      }
    };

    // Restore scroll position or scroll to top
    const restoreScrollPosition = () => {
      const savedPosition = scrollPositions.get(pathname);
      
      if (savedPosition && window.history.state?.scroll !== false) {
        // Restore previous position (back navigation)
        isRestoringRef.current = true;
        window.scrollTo({
          left: savedPosition.x,
          top: savedPosition.y,
          behavior: 'instant' as ScrollBehavior,
        });
        
        // Reset flag after restoration
        setTimeout(() => {
          isRestoringRef.current = false;
        }, 100);
      } else {
        // Scroll to top (new navigation)
        window.scrollTo({
          left: 0,
          top: 0,
          behavior: 'instant' as ScrollBehavior,
        });
      }
    };

    // Save position on scroll
    window.addEventListener('scroll', saveScrollPosition, { passive: true });

    // Restore position on mount
    restoreScrollPosition();

    return () => {
      window.removeEventListener('scroll', saveScrollPosition);
    };
  }, [pathname]);
}

/**
 * useScrollToTop - Utility to scroll to top smoothly
 */
export function useScrollToTop() {
  return () => {
    window.scrollTo({
      left: 0,
      top: 0,
      behavior: 'smooth',
    });
  };
}

/**
 * useScrollToElement - Utility to scroll to a specific element
 */
export function useScrollToElement() {
  return (elementId: string, offset: number = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        left: 0,
        top,
        behavior: 'smooth',
      });
    }
  };
}
