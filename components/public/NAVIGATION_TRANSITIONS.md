# Navigation and Page Transitions System

## Overview

The navigation and page transitions system provides smooth, performant navigation experiences across the public sports platform. It includes optimized route prefetching, branded loading states, scroll position management, and accessible page transitions.

## Components

### NavigationProgress

A top loading bar that appears during route transitions.

**Features:**
- Automatic display during navigation
- Smooth progress animation
- Respects `prefers-reduced-motion`
- Branded gradient styling

**Usage:**
```tsx
import { NavigationProgress } from '@/components/public/NavigationProgress';

export default function Layout({ children }) {
  return (
    <>
      <NavigationProgress />
      {/* rest of layout */}
    </>
  );
}
```

### PageTransitionWrapper

Wraps page content with smooth fade and slide transitions.

**Features:**
- Fade in/out animations
- Subtle vertical slide
- Automatic scroll restoration
- Reduced motion support

**Usage:**
```tsx
import { PageTransitionWrapper } from '@/components/public/PageTransitionWrapper';

export default function Layout({ children }) {
  return (
    <main>
      <PageTransitionWrapper>
        {children}
      </PageTransitionWrapper>
    </main>
  );
}
```

### NavigationManager

Optimizes navigation performance through intelligent prefetching.

**Features:**
- Prefetches common routes on mount
- Hover-based prefetching for links
- Debounced prefetch requests
- Automatic route optimization

**Usage:**
```tsx
import { NavigationManager } from '@/lib/navigation/NavigationManager';

export default function Navigation() {
  return (
    <>
      <NavigationManager />
      {/* navigation links */}
    </>
  );
}
```

### BrandedLoader

Animated loading indicator with Eskimos branding.

**Variants:**
- `BrandedLoader` - Standalone loader
- `LoadingOverlay` - Full-screen overlay
- `InlineLoader` - Inline content loader

**Usage:**
```tsx
import { BrandedLoader, LoadingOverlay, InlineLoader } from '@/components/public/BrandedLoader';

// Standalone
<BrandedLoader size="md" />

// Full-screen overlay
<LoadingOverlay message="Loading tournament..." />

// Inline content
<InlineLoader message="Fetching data..." size="sm" />
```

### Loading States

Comprehensive skeleton loaders for different content types.

**Components:**
- `DataLoading` - Generic data loading state
- `ContentLoading` - Text content skeleton
- `CardLoading` - Card grid skeleton
- `TableLoading` - Table skeleton
- `PageLoading` - Full page loading

**Usage:**
```tsx
import { CardLoading, TableLoading, DataLoading } from '@/components/public/LoadingStates';

// Card grid loading
<CardLoading count={6} columns={3} />

// Table loading
<TableLoading rows={10} columns={5} />

// Generic data loading
<DataLoading message="Loading players..." />
```

## Hooks

### useScrollRestoration

Manages scroll position across navigation.

**Features:**
- Saves scroll position before navigation
- Restores position on back navigation
- Scrolls to top on new navigation
- Automatic cleanup

**Usage:**
```tsx
import { useScrollRestoration } from '@/lib/hooks/useScrollRestoration';

export function MyComponent() {
  useScrollRestoration();
  // Component automatically handles scroll restoration
}
```

### useOptimizedNavigation

Provides optimized navigation with prefetching.

**Features:**
- Automatic route prefetching
- Error handling
- Loading state management
- Fallback navigation

**Usage:**
```tsx
import { useOptimizedNavigation } from '@/lib/navigation/NavigationManager';

export function MyComponent() {
  const { navigate } = useOptimizedNavigation();
  
  const handleClick = () => {
    navigate('/tournaments', { scroll: true });
  };
  
  return <button onClick={handleClick}>View Tournaments</button>;
}
```

## Performance Optimizations

### Route Prefetching

The system implements intelligent route prefetching:

1. **On Mount**: Common routes are prefetched after 1 second
2. **On Hover**: Links are prefetched when hovered (debounced)
3. **Before Navigation**: Routes are prefetched before navigation

### Scroll Management

Scroll position is managed efficiently:

1. **Save**: Position saved on scroll (passive listener)
2. **Restore**: Position restored on back navigation
3. **Reset**: Scroll to top on new navigation
4. **Instant**: Uses instant scroll behavior for restoration

### Animation Performance

Animations are optimized for 60fps:

1. **GPU Acceleration**: Transform and opacity animations
2. **Reduced Motion**: Respects user preferences
3. **Debouncing**: Hover events are debounced
4. **Cleanup**: Timers and listeners properly cleaned up

## Accessibility

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus indicators are visible and high contrast
- Skip-to-content link for screen readers

### Screen Readers

- ARIA labels on all interactive elements
- Loading states announced to screen readers
- Navigation changes announced

### Reduced Motion

- All animations respect `prefers-reduced-motion`
- Instant transitions when motion is reduced
- No animation-dependent functionality

## Integration Guide

### Complete Layout Setup

```tsx
import PublicNavigation from '@/components/public/PublicNavigation';
import PublicFooter from '@/components/public/PublicFooter';
import { SkipToContent } from '@/components/public/SkipToContent';
import { NavigationProgress } from '@/components/public/NavigationProgress';
import { PageTransitionWrapper } from '@/components/public/PageTransitionWrapper';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationProgress />
      <SkipToContent />
      <PublicNavigation />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <PageTransitionWrapper>
          {children}
        </PageTransitionWrapper>
      </main>
      <PublicFooter />
    </div>
  );
}
```

### Data Fetching with Loading States

```tsx
'use client';

import { usePublicData } from '@/lib/hooks/usePublicData';
import { DataLoading, CardLoading } from '@/components/public/LoadingStates';

export function TournamentList() {
  const { data, isLoading, isError } = usePublicData('/api/public/tournaments');
  
  if (isLoading) {
    return <CardLoading count={6} columns={3} />;
  }
  
  if (isError) {
    return <div>Error loading tournaments</div>;
  }
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {data.tournaments.map(tournament => (
        <TournamentCard key={tournament.id} tournament={tournament} />
      ))}
    </div>
  );
}
```

## Requirements Validation

This implementation satisfies the following requirements:

### Requirement 8.1: Page Transition Animations
✅ Smooth page transitions with fade and slide effects
✅ Consistent animation timing across all routes
✅ Respects reduced motion preferences

### Requirement 8.3: Scroll Position Restoration
✅ Scroll position saved on navigation
✅ Position restored on back navigation
✅ Scroll to top on new navigation
✅ Context-aware scroll management

### Requirement 8.5: Branded Loading Animations
✅ Branded loader with Eskimos styling
✅ Multiple loading state variants
✅ Skeleton loaders matching content structure
✅ Smooth loading animations

## Performance Metrics

Expected performance improvements:

- **Route Prefetching**: 50-200ms faster navigation
- **Scroll Restoration**: Instant position restoration
- **Loading States**: Perceived performance improvement
- **Animation Performance**: Consistent 60fps

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with touch optimizations

## Future Enhancements

Potential improvements for future iterations:

1. **Predictive Prefetching**: ML-based route prediction
2. **Progressive Loading**: Streaming content updates
3. **Offline Support**: Service worker integration
4. **Analytics**: Navigation performance tracking
