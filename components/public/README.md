# Public Sports Platform - Design System

This directory contains the shared UI components and design system for the public-facing sports platform.

## Overview

The Public Sports Platform design system follows a "Living Sports Canvas" philosophy where data becomes art, statistics tell stories, and every interaction delights users. All components are built with:

- **Responsive Design**: Mobile-first approach with fluid adaptation
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **Performance**: Optimized animations running at 60fps
- **Motion**: Purposeful animations with reduced-motion support

## Components

### StatCard

An animated component displaying individual statistics with transitions.

```tsx
import { StatCard } from '@/components/public';

<StatCard
  label="Total Matches"
  value={156}
  icon="⚽"
  color="primary"
  trend="up"
  format="number"
/>
```

**Props:**
- `label` (string): The stat label
- `value` (number): The numeric value to display
- `icon` (ReactNode, optional): Icon to display
- `trend` ('up' | 'down' | 'neutral', optional): Trend indicator
- `color` ('primary' | 'success' | 'warning' | 'danger' | 'neutral', optional): Color theme
- `format` ('number' | 'percentage' | 'decimal', optional): Value formatting
- `animationDuration` (number, optional): Animation duration in ms (default: 1000)

**Features:**
- Animated counter with easing
- Pulse animation on value change
- Trend indicators with color semantics
- Hover effects

### Badge

Display status, roles, achievements, and categories.

```tsx
import { Badge, RoleBadge, AchievementBadge, StatusBadge } from '@/components/public';

// Basic badge
<Badge variant="success">Active</Badge>

// Role badge
<RoleBadge role="CAPTAIN" />

// Achievement badge
<AchievementBadge type="tournament_win" label="Champion" />

// Status badge
<StatusBadge status="active" />
```

**Badge Variants:**
- `primary`: Blue theme
- `success`: Green theme
- `warning`: Yellow theme
- `danger`: Red theme
- `neutral`: Gray theme
- `info`: Cyan theme

**Badge Sizes:**
- `sm`: Small (text-xs)
- `md`: Medium (text-sm) - default
- `lg`: Large (text-base)

### PublicCard

Card components with multiple variants and hover effects.

```tsx
import { PublicCard, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/public';

<PublicCard variant="elevated" hover>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</PublicCard>
```

**Card Variants:**
- `default`: Standard card with border and shadow
- `elevated`: Card with enhanced shadow
- `outlined`: Card with prominent border
- `glass`: Glassmorphism effect with backdrop blur

**Card Padding:**
- `none`: No padding
- `sm`: 1rem padding
- `md`: 1.5rem padding (default)
- `lg`: 2rem padding

### Card3D

3D card with depth effects for Club Universe.

```tsx
import { Card3D } from '@/components/public';

<Card3D onClick={() => navigate('/club/1')}>
  <div className="p-6">
    {/* Card content */}
  </div>
</Card3D>
```

**Features:**
- 3D tilt effect following mouse movement
- Smooth transitions
- Keyboard accessible
- Touch-optimized

### Skeleton Loaders

Loading states matching content structures.

```tsx
import {
  TournamentCardSkeleton,
  MatchTheaterSkeleton,
  LeaderboardSkeleton,
  PlayerProfileSkeleton,
  ClubCardSkeleton,
  StatCardSkeleton,
  TournamentJourneySkeleton,
} from '@/components/public';

// Tournament cards loading
<TournamentCardSkeleton count={6} />

// Leaderboard loading
<LeaderboardSkeleton count={10} />

// Player profile loading
<PlayerProfileSkeleton />
```

**Available Skeletons:**
- `TournamentCardSkeleton`: Grid of tournament cards
- `MatchTheaterSkeleton`: Match detail page layout
- `LeaderboardSkeleton`: Leaderboard table
- `PlayerProfileSkeleton`: Player profile page
- `ClubCardSkeleton`: Grid of club cards
- `StatCardSkeleton`: Grid of stat cards
- `TournamentJourneySkeleton`: Tournament stages timeline

## Design Tokens

### Colors

```typescript
// Primary (Blue)
primary-50 to primary-900

// Success (Green)
success-50 to success-700

// Warning (Yellow)
warning-50 to warning-700

// Danger (Red)
danger-50 to danger-700

// Neutral (Gray)
neutral-50 to neutral-900
```

### Typography

```typescript
// Font Families
font-sans: Inter, system-ui, sans-serif
font-mono: JetBrains Mono, monospace

// Font Sizes
text-xs to text-6xl

// Font Weights
font-normal: 400
font-medium: 500
font-semibold: 600
font-bold: 700
```

### Spacing

Based on 8px grid system:
- `1`: 0.25rem (4px)
- `2`: 0.5rem (8px)
- `3`: 0.75rem (12px)
- `4`: 1rem (16px)
- `6`: 1.5rem (24px)
- `8`: 2rem (32px)
- `12`: 3rem (48px)
- `16`: 4rem (64px)
- `24`: 6rem (96px)

### Shadows

```typescript
shadow-sm: Subtle shadow
shadow-md: Medium shadow
shadow-lg: Large shadow
shadow-xl: Extra large shadow
shadow-2xl: Maximum shadow
```

### Animations

```typescript
// Durations
duration-100: 100ms (instant)
duration-200: 200ms (fast)
duration-300: 300ms (normal)
duration-500: 500ms (slow)
duration-800: 800ms (slower)

// Easing
ease-linear
ease-in
ease-out
ease-in-out
ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)
```

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Focus Indicators**: Visible focus states with 3:1 contrast ratio
- **ARIA Labels**: Descriptive labels for screen readers
- **Color Independence**: Information not conveyed by color alone
- **Touch Targets**: Minimum 44x44px on touch devices
- **Reduced Motion**: Respects `prefers-reduced-motion` setting

## Responsive Design

Components use mobile-first responsive design:

- **Mobile**: 320px - 639px (single column, touch-optimized)
- **Tablet**: 640px - 1023px (multi-column, hybrid interactions)
- **Desktop**: 1024px+ (full features, mouse-optimized)

## Performance

- **60fps Animations**: GPU-accelerated transforms
- **Lazy Loading**: Images and heavy components
- **Code Splitting**: Dynamic imports for visualizations
- **Optimized Rendering**: React.memo and useMemo where appropriate

## Usage Example

See the complete component showcase at `/components-demo`:

```tsx
import {
  StatCard,
  Badge,
  RoleBadge,
  PublicCard,
  Card3D,
  TournamentCardSkeleton,
} from '@/components/public';

export default function MyPage() {
  return (
    <div>
      <StatCard
        label="Total Players"
        value={1250}
        icon="👥"
        color="primary"
        trend="up"
      />
      
      <PublicCard variant="elevated" hover>
        <CardContent>
          <h3>Tournament Name</h3>
          <RoleBadge role="CAPTAIN" />
        </CardContent>
      </PublicCard>
    </div>
  );
}
```

## Testing

All components are tested for:
- Rendering with various props
- Accessibility compliance
- Responsive behavior
- Animation performance
- Keyboard navigation

Run tests:
```bash
npm test components/public
```

## Contributing

When adding new components:
1. Follow the existing component patterns
2. Include TypeScript types
3. Add accessibility attributes
4. Support responsive design
5. Include hover/focus states
6. Add to the component showcase
7. Update this README
