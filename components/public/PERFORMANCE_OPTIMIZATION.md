# Performance Optimization Guide

This document describes the performance optimizations implemented for the public sports platform.

## Overview

The platform implements multiple layers of performance optimization to ensure fast load times, smooth interactions, and efficient resource usage across all devices and network conditions.

## Implemented Optimizations

### 1. Progressive Image Loading

**Component:** `ProgressiveImage.tsx`

- Blur-up placeholders for smooth loading experience
- Automatic error handling with fallback UI
- Responsive image sizing with srcset
- WebP format support with fallbacks
- Lazy loading for below-the-fold images

**Usage:**
```tsx
import { ProgressiveImage } from '@/components/public/ProgressiveImage';

<ProgressiveImage
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### 2. Virtualized Lists

**Component:** `VirtualizedList.tsx`

- Only renders visible items in viewport
- Dramatically reduces DOM nodes for long lists
- Smooth scrolling performance
- Configurable overscan for smoother experience

**Usage:**
```tsx
import { VirtualizedList } from '@/components/public/VirtualizedList';

<VirtualizedList
  items={players}
  itemHeight={80}
  renderItem={(player, index) => <PlayerCard player={player} />}
  overscan={3}
/>
```

### 3. Code Splitting & Lazy Loading

**Component:** `LazyComponents.tsx`

- Dynamic imports for heavy components
- Automatic code splitting by route
- Loading states for lazy components
- SSR disabled for client-only components (D3.js)

**Available Lazy Components:**
- `LazyPlayerConstellation` - Heavy D3.js visualization
- `LazyPerformanceHeatmap` - Complex chart component
- `LazyMatchTheater` - Rich media component
- `LazyLeaderboardStream` - Large data tables
- `LazyTournamentJourneyMap` - Interactive timeline

**Usage:**
```tsx
import { LazyPlayerConstellation } from '@/components/public/LazyComponents';

<LazyPlayerConstellation data={constellationData} />
```

### 4. Request Deduplication & Caching

**Provider:** `SWRProvider.tsx`
**Hooks:** `usePublicData.ts`
**Utility:** `requestCache.ts`

- Automatic request deduplication
- Client-side caching with TTL
- Optimistic UI updates
- Automatic revalidation
- Error retry with exponential backoff

**Configuration:**
- Deduplication interval: 2 seconds
- Error retry count: 3
- Error retry interval: 5 seconds
- Cache TTL: 5 minutes (configurable)

**Usage:**
```tsx
import { useTournament } from '@/lib/hooks/usePublicData';

function TournamentDetail({ id }: { id: string }) {
  const { data, error, isLoading } = useTournament(id);
  
  if (isLoading) return <Skeleton />;
  if (error) return <Error />;
  
  return <TournamentView data={data} />;
}
```

### 5. Error Boundaries

**Component:** `PublicErrorBoundary.tsx`

- Graceful error handling
- User-friendly fallback UI
- Error logging in development
- Reset functionality
- Compact fallback for small components

**Usage:**
```tsx
import { PublicErrorBoundary } from '@/components/public/PublicErrorBoundary';

<PublicErrorBoundary>
  <ComplexComponent />
</PublicErrorBoundary>
```

### 6. Skeleton Loaders

**Component:** `PublicSkeletons.tsx`

- Content-aware loading states
- Matches final content structure
- Smooth transitions
- Accessible with ARIA labels

**Available Skeletons:**
- `TournamentCardSkeleton`
- `MatchTheaterSkeleton`
- `LeaderboardSkeleton`
- `PlayerProfileSkeleton`
- `ClubCardSkeleton`
- `StatCardSkeleton`
- `TournamentJourneySkeleton`

### 7. Performance Monitoring

**Component:** `PerformanceMonitor.tsx`
**Utility:** `performance.ts`

- Core Web Vitals tracking
- Page load time measurement
- Component render performance
- Development-only logging

**Metrics Tracked:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)

**Usage:**
```tsx
import { PerformanceMonitor } from '@/components/public/PerformanceMonitor';

export default function Page() {
  return (
    <>
      <PerformanceMonitor pageName="tournaments" />
      <PageContent />
    </>
  );
}
```

### 8. Adaptive Loading

**Component:** `OptimizedLoader.tsx`

- Network-aware loading
- Reduced motion support
- Priority-based loading
- Progressive enhancement

**Features:**
- Detects slow connections (2G, 3G, save-data mode)
- Respects prefers-reduced-motion
- Loads high-priority content first
- Defers low-priority content

**Usage:**
```tsx
import { OptimizedLoader, AdaptiveAnimation } from '@/components/public/OptimizedLoader';

<OptimizedLoader fallback={<Skeleton />}>
  <HeavyComponent />
</OptimizedLoader>

<AdaptiveAnimation reducedMotionFallback={<StaticView />}>
  <AnimatedView />
</AdaptiveAnimation>
```

## Performance Utilities

### Debounce & Throttle

```tsx
import { debounce, throttle } from '@/lib/utils/performance';

// Debounce search input
const handleSearch = debounce((query: string) => {
  fetchResults(query);
}, 300);

// Throttle scroll handler
const handleScroll = throttle(() => {
  updateScrollPosition();
}, 100);
```

### Request Caching

```tsx
import { cachedFetch, prefetchData } from '@/lib/utils/requestCache';

// Fetch with automatic caching
const data = await cachedFetch('/api/tournaments', { ttl: 60000 });

// Prefetch for faster navigation
prefetchData('/api/tournaments/123');
```

### Connection Detection

```tsx
import { isSlowConnection, prefersReducedMotion } from '@/lib/utils/performance';

if (isSlowConnection()) {
  // Load simplified version
}

if (prefersReducedMotion()) {
  // Disable animations
}
```

## Best Practices

### 1. Image Optimization

- Always use `ProgressiveImage` or Next.js `Image`
- Specify width and height to prevent layout shift
- Use appropriate `sizes` attribute for responsive images
- Set `priority={true}` for above-the-fold images
- Use WebP format when possible

### 2. Data Fetching

- Use SWR hooks for client-side data fetching
- Implement proper loading and error states
- Use `revalidate` instead of `no-store` when possible
- Prefetch data for anticipated navigation

### 3. Component Loading

- Lazy load heavy components (D3.js, charts, etc.)
- Use code splitting for route-based components
- Implement proper loading states
- Consider network conditions

### 4. List Rendering

- Use virtualization for lists > 100 items
- Implement pagination for very large datasets
- Use proper keys for list items
- Avoid inline function definitions in render

### 5. Error Handling

- Wrap complex components in error boundaries
- Provide user-friendly error messages
- Implement retry functionality
- Log errors for monitoring

### 6. Monitoring

- Add PerformanceMonitor to key pages
- Track Core Web Vitals
- Monitor bundle sizes
- Use Lighthouse for audits

## Performance Targets

### Core Web Vitals

- **FCP (First Contentful Paint):** < 1.5s
- **LCP (Largest Contentful Paint):** < 2.5s
- **TTI (Time to Interactive):** < 3.5s
- **CLS (Cumulative Layout Shift):** < 0.1
- **FID (First Input Delay):** < 100ms

### Bundle Size

- Initial bundle: < 200KB (gzipped)
- Route chunks: < 100KB each
- Total JavaScript: < 500KB

### Network

- API response time: < 500ms
- Image load time: < 2s
- Time to first byte: < 600ms

## Testing Performance

### Development

```bash
# Run Lighthouse audit
npm run lighthouse

# Analyze bundle size
npm run analyze

# Check for performance issues
npm run perf-check
```

### Production

- Use Chrome DevTools Performance panel
- Run Lighthouse audits regularly
- Monitor Core Web Vitals in production
- Use WebPageTest for detailed analysis

## Troubleshooting

### Slow Page Loads

1. Check network tab for slow requests
2. Verify images are optimized
3. Check for render-blocking resources
4. Review bundle size

### High Memory Usage

1. Check for memory leaks in components
2. Verify virtualization is working
3. Review image sizes
4. Check for unnecessary re-renders

### Poor Animation Performance

1. Use CSS transforms instead of position
2. Enable GPU acceleration
3. Reduce animation complexity
4. Respect prefers-reduced-motion

## Resources

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [SWR Documentation](https://swr.vercel.app/)
- [React Performance](https://react.dev/learn/render-and-commit)
