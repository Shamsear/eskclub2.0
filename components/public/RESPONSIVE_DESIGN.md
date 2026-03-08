# Responsive Design System

This document describes the responsive design implementation for the Public Sports Platform, covering all breakpoints from 320px to 3840px.

## Breakpoints

The platform uses a comprehensive breakpoint system:

| Breakpoint | Min Width | Device Type | Description |
|------------|-----------|-------------|-------------|
| xs | 320px | Small Mobile | iPhone SE, small phones |
| sm | 640px | Mobile | Standard smartphones |
| md | 768px | Tablet | iPads, tablets |
| lg | 1024px | Desktop | Laptops, desktops |
| xl | 1280px | Large Desktop | Large monitors |
| 2xl | 1536px | Extra Large | Wide monitors |
| 3xl | 1920px | Ultra-Wide | Ultra-wide displays |

## Components

### ResponsiveContainer

Wrapper component that handles max-width constraints and padding across breakpoints.

```tsx
import { ResponsiveContainer } from '@/components/public/ResponsiveContainer';

<ResponsiveContainer maxWidth="wide" className="py-8">
  {/* Content */}
</ResponsiveContainer>
```

**Props:**
- `maxWidth`: 'default' (1280px) | 'wide' (1600px) | 'full'
- `padding`: boolean (default: true) - Applies responsive padding
- `className`: Additional CSS classes

### ResponsiveGrid

Grid component that adapts column count based on breakpoints.

```tsx
import { ResponsiveGrid } from '@/components/public/ResponsiveContainer';

<ResponsiveGrid
  cols={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
  gap="md"
>
  {items.map(item => <Card key={item.id} />)}
</ResponsiveGrid>
```

**Props:**
- `cols`: Object defining columns per breakpoint
- `gap`: 'sm' | 'md' | 'lg'
- `className`: Additional CSS classes

### ResponsiveStack

Stack component that changes direction based on breakpoints.

```tsx
import { ResponsiveStack } from '@/components/public/ResponsiveContainer';

<ResponsiveStack direction="horizontal-md" gap="lg" align="center">
  <Avatar />
  <Content />
  <Button />
</ResponsiveStack>
```

**Props:**
- `direction`: 'vertical' | 'horizontal-sm' | 'horizontal-md' | 'horizontal-lg'
- `gap`: 'sm' | 'md' | 'lg'
- `align`: 'start' | 'center' | 'end' | 'stretch'

### TouchOptimizedButton

Button component with proper touch target sizing.

```tsx
import { TouchOptimizedButton } from '@/components/public/TouchOptimizedButton';

<TouchOptimizedButton
  variant="primary"
  size="md"
  onClick={handleClick}
>
  Click Me
</TouchOptimizedButton>
```

**Touch Targets:**
- Mobile (touch): 44x44px minimum
- Desktop (pointer): 32x32px minimum

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `onClick`: Click handler
- `disabled`: boolean
- `ariaLabel`: Accessibility label

### TouchOptimizedIconButton

Icon button with proper touch target sizing.

```tsx
import { TouchOptimizedIconButton } from '@/components/public/TouchOptimizedButton';

<TouchOptimizedIconButton
  icon={<SearchIcon />}
  ariaLabel="Search"
  variant="ghost"
  onClick={handleSearch}
/>
```

### ResponsiveImage

Image component with optimized loading and responsive sizing.

```tsx
import { ResponsiveImage } from '@/components/public/ResponsiveImage';

<ResponsiveImage
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

### ResponsiveAvatar

Avatar component with fallback support.

```tsx
import { ResponsiveAvatar } from '@/components/public/ResponsiveImage';

<ResponsiveAvatar
  src={player.photo}
  alt={player.name}
  size="lg"
  fallbackText={player.name.charAt(0)}
/>
```

## Hooks

### useResponsive

Hook to detect current breakpoint and device characteristics.

```tsx
import { useResponsive } from '@/lib/hooks/useResponsive';

function MyComponent() {
  const {
    breakpoint,      // Current breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
    isMobile,        // width < 768px
    isTablet,        // 768px <= width < 1024px
    isDesktop,       // width >= 1024px
    isUltraWide,     // width >= 1920px
    isTouchDevice,   // Touch capability detected
    isPortrait,      // height > width
    isLandscape,     // width >= height
    width,           // Current viewport width
    height,          // Current viewport height
  } = useResponsive();

  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

### useBreakpoint

Hook to check if current viewport matches a specific breakpoint.

```tsx
import { useBreakpoint } from '@/lib/hooks/useResponsive';

function MyComponent() {
  const isLargeScreen = useBreakpoint('lg');
  
  return isLargeScreen ? <ExpandedView /> : <CompactView />;
}
```

### useIsTouchDevice

Hook to detect touch capability.

```tsx
import { useIsTouchDevice } from '@/lib/hooks/useResponsive';

function MyComponent() {
  const isTouch = useIsTouchDevice();
  
  return (
    <button className={isTouch ? 'min-h-[44px]' : 'min-h-[32px]'}>
      Click Me
    </button>
  );
}
```

## Responsive Patterns

### Mobile-First Approach

Always start with mobile styles and progressively enhance:

```tsx
<div className="
  text-base          // Mobile: 16px
  sm:text-lg         // Tablet: 18px
  lg:text-xl         // Desktop: 20px
">
  Responsive Text
</div>
```

### Grid Layouts

Use responsive grid patterns:

```tsx
<div className="
  grid
  grid-cols-1        // Mobile: 1 column
  sm:grid-cols-2     // Tablet: 2 columns
  lg:grid-cols-3     // Desktop: 3 columns
  xl:grid-cols-4     // Large: 4 columns
  gap-4 sm:gap-6     // Responsive gap
">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### Spacing

Use responsive spacing utilities:

```tsx
<div className="
  p-4 sm:p-6 lg:p-8           // Padding
  mb-4 sm:mb-6 lg:mb-8        // Margin
  space-y-4 sm:space-y-6      // Stack spacing
">
  Content
</div>
```

### Typography

Scale typography across breakpoints:

```tsx
<h1 className="
  text-3xl           // Mobile: 30px
  sm:text-4xl        // Tablet: 36px
  lg:text-5xl        // Desktop: 48px
  xl:text-6xl        // Large: 60px
  font-bold
">
  Heading
</h1>
```

### Visibility

Show/hide content at specific breakpoints:

```tsx
{/* Mobile only */}
<div className="block md:hidden">Mobile Menu</div>

{/* Desktop only */}
<div className="hidden md:block">Desktop Nav</div>

{/* Tablet and up */}
<div className="hidden sm:block">Tablet+ Content</div>
```

## Touch Optimization

### Touch Targets

All interactive elements must meet minimum touch target sizes:

- **Mobile/Touch**: 44x44px minimum (WCAG AAA)
- **Desktop/Pointer**: 32x32px minimum

```tsx
<button className="
  min-h-[44px] min-w-[44px]    // Mobile
  lg:min-h-[32px] lg:min-w-[32px]  // Desktop
">
  Button
</button>
```

### Touch Gestures

Support common touch gestures:

- **Tap**: Primary interaction
- **Swipe**: Navigation, dismissal
- **Pinch**: Zoom (for visualizations)
- **Long Press**: Context menus

### Hover States

Provide hover states only on pointer devices:

```tsx
<div className="
  transition-colors
  hover:bg-gray-100    // Only applies on pointer devices
  active:bg-gray-200   // Applies on all devices
">
  Interactive Element
</div>
```

## Accessibility

### Focus Indicators

All interactive elements have visible focus indicators:

```css
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

### Reduced Motion

Respect user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Readers

Use semantic HTML and ARIA labels:

```tsx
<button
  aria-label="Close menu"
  aria-expanded={isOpen}
>
  <CloseIcon aria-hidden="true" />
</button>
```

## Testing

### Test Responsive Page

Visit `/test-responsive` to see all responsive components in action and verify:

- Breakpoint detection
- Touch target sizing
- Grid layouts
- Typography scaling
- Spacing adjustments
- Visibility toggles

### Manual Testing Checklist

- [ ] Test at 320px (iPhone SE)
- [ ] Test at 375px (iPhone 12)
- [ ] Test at 768px (iPad portrait)
- [ ] Test at 1024px (iPad landscape)
- [ ] Test at 1280px (Desktop)
- [ ] Test at 1920px (Full HD)
- [ ] Test at 2560px (2K)
- [ ] Test at 3840px (4K)
- [ ] Test portrait orientation on tablet
- [ ] Test landscape orientation on tablet
- [ ] Test touch interactions on mobile
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Test with reduced motion enabled

## Performance

### Image Optimization

Use responsive images with proper sizing:

```tsx
<ResponsiveImage
  src="/image.jpg"
  alt="Description"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

### Code Splitting

Lazy load components for different breakpoints:

```tsx
const DesktopView = dynamic(() => import('./DesktopView'), {
  ssr: false,
});

const MobileView = dynamic(() => import('./MobileView'), {
  ssr: false,
});

function MyComponent() {
  const { isDesktop } = useResponsive();
  return isDesktop ? <DesktopView /> : <MobileView />;
}
```

### Layout Shift Prevention

Prevent cumulative layout shift (CLS):

```tsx
<div className="aspect-video bg-gray-200">
  <ResponsiveImage
    src="/image.jpg"
    alt="Description"
    fill
    className="object-cover"
  />
</div>
```

## Best Practices

1. **Mobile-First**: Always start with mobile styles
2. **Touch Targets**: Ensure 44x44px minimum on touch devices
3. **Readable Text**: Maintain 16px minimum font size
4. **Contrast**: Ensure 4.5:1 contrast ratio for text
5. **Spacing**: Use consistent spacing scale
6. **Performance**: Optimize images and lazy load heavy components
7. **Accessibility**: Test with keyboard and screen readers
8. **Testing**: Test on real devices, not just browser DevTools
