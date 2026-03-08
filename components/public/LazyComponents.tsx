'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from './PageLoader';
import { CompactErrorFallback } from './PublicErrorBoundary';

// Shared branded spinner for all lazy-loaded components
const BrandSpinner = () => <PageLoader />;

/**
 * Lazy-loaded Player Constellation component
 * Heavy D3.js visualization - only load when needed
 */
export const LazyPlayerConstellation = dynamic(
  () => import('./PlayerConstellation'),
  {
    loading: () => <PageLoader label="Loading visualization..." />,
    ssr: false,
  }
);

/**
 * Lazy-loaded Performance Heatmap component
 */
export const LazyPerformanceHeatmap = dynamic(
  () => import('./PerformanceHeatmap'),
  {
    loading: () => <PageLoader label="Loading heatmap..." />,
    ssr: false,
  }
);

/**
 * Lazy-loaded Match Theater component
 */
export const LazyMatchTheater = dynamic(
  () => import('./MatchTheater').then(mod => mod.MatchTheater),
  {
    loading: () => <PageLoader label="Loading match..." />,
  }
);

/**
 * Lazy-loaded Leaderboard Stream component
 */
export const LazyLeaderboardStream = dynamic(
  () => import('./LeaderboardStream'),
  {
    loading: () => <PageLoader label="Loading leaderboard..." />,
  }
);

/**
 * Lazy-loaded Tournament Journey Map component
 */
export const LazyTournamentJourneyMap = dynamic(
  () => import('./TournamentJourneyMap'),
  {
    loading: () => <PageLoader label="Loading tournament..." />,
  }
);

/**
 * Generic lazy component wrapper
 */
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  LoadingComponent?: React.ComponentType
) {
  return dynamic(importFn, {
    loading: LoadingComponent
      ? () => <LoadingComponent />
      : () => <BrandSpinner />,
  });
}

/**
 * Lazy component with error boundary
 */
export function createLazyComponentWithError<P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  LoadingComponent?: React.ComponentType,
  ErrorComponent?: React.ComponentType<{ error?: Error; onReset?: () => void }>
) {
  return dynamic(importFn, {
    loading: LoadingComponent
      ? () => <LoadingComponent />
      : () => <BrandSpinner />,
  });
}
