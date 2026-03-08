# Animation System

A comprehensive animation library built on Framer Motion with automatic support for `prefers-reduced-motion` accessibility preferences.

## Features

- 🎨 Predefined animation variants (fade, slide, scale, stagger)
- ♿ Automatic reduced motion support
- 🎯 Scroll-triggered animations
- 📊 Rank change animations for leaderboards
- 🔢 Animated counters
- 📄 Page transitions
- 🎭 Parallax effects
- 3D card effects

## Installation

The animation system is already installed with Framer Motion:

```bash
npm install framer-motion
```

## Basic Usage

### AnimatedContainer

Simple container with predefined animation variants:

```tsx
import { AnimatedContainer } from '@/lib/animations';

<AnimatedContainer variant="fadeIn">
  <h1>Hello World</h1>
</AnimatedContainer>

<AnimatedContainer variant="slideUp" delay={0.2}>
  <p>This appears after a delay</p>
</AnimatedContainer>
```

Available variants:
- `fadeIn` - Fade in
- `slideUp` - Slide up from bottom
- `slideDown` - Slide down from top
- `slideLeft` - Slide from right
- `slideRight` - Slide from left
- `scale` - Scale up
- `scaleUp` - Scale up with spring

### Stagger Animations

Animate children in sequence:

```tsx
import { StaggerContainer, StaggerItem } from '@/lib/animations';

<StaggerContainer speed="fast">
  <StaggerItem>Item 1</StaggerItem>
  <StaggerItem>Item 2</StaggerItem>
  <StaggerItem>Item 3</StaggerItem>
</StaggerContainer>
```

Speed options: `fast`, `normal`, `slow`

### Scroll-Triggered Animations

Reveal content when it enters the viewport:

```tsx
import { ScrollReveal } from '@/lib/animations';

<ScrollReveal delay={0.1}>
  <div>This appears when scrolled into view</div>
</ScrollReveal>
```

### Parallax Effects

Create parallax scrolling effects:

```tsx
import { Parallax } from '@/lib/animations';

<Parallax offset={100}>
  <div>This moves slower than the scroll</div>
</Parallax>
```

### Page Transitions

Smooth transitions between pages:

```tsx
import { PageTransition } from '@/lib/animations';

export default function MyPage() {
  return (
    <PageTransition>
      <h1>Page Content</h1>
    </PageTransition>
  );
}
```

### Rank Animations (Leaderboards)

Animate rank changes with directional indicators:

```tsx
import { RankAnimation } from '@/lib/animations';

<RankAnimation previousRank={5} currentRank={3}>
  <div>Player Card</div>
</RankAnimation>
```

### Animated Counters

Smoothly animate number changes:

```tsx
import { AnimatedCounter } from '@/lib/animations';

<AnimatedCounter 
  value={1234} 
  duration={1000}
  format={(v) => `${Math.round(v)} pts`}
/>
```

## Advanced Usage

### Custom Animations with Motion

Access Framer Motion directly for custom animations:

```tsx
import { motion } from '@/lib/animations';

<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5 }}
>
  Custom Animation
</motion.div>
```

### Using Animation Variants

Import predefined variants for consistency:

```tsx
import { animationVariants, hoverVariants } from '@/lib/animations';

<motion.div
  variants={animationVariants.fadeIn}
  initial="initial"
  animate="animate"
  exit="exit"
>
  Content
</motion.div>

<motion.button
  {...hoverVariants.lift}
>
  Hover Me
</motion.button>
```

## Accessibility

All animations automatically respect the user's `prefers-reduced-motion` setting. When reduced motion is preferred:

- Animations are disabled
- Components render without motion
- Transitions are instant

You can check the preference manually:

```tsx
import { prefersReducedMotion } from '@/lib/animations';

if (prefersReducedMotion()) {
  // User prefers reduced motion
}
```

## Configuration

Animation timing and easing can be customized:

```tsx
import { animationDuration, animationEasing } from '@/lib/animations';

// Duration values (in seconds)
animationDuration.instant  // 0.1
animationDuration.fast     // 0.2
animationDuration.normal   // 0.3
animationDuration.slow     // 0.5
animationDuration.slower   // 0.8

// Easing curves
animationEasing.linear
animationEasing.easeIn
animationEasing.easeOut
animationEasing.easeInOut
animationEasing.spring
```

## Examples

### Match Theater with Scroll Animations

```tsx
import { ScrollReveal, Parallax, StaggerContainer, StaggerItem } from '@/lib/animations';

export function MatchTheater({ data }) {
  return (
    <div>
      <Parallax offset={100}>
        <div className="hero-background" />
      </Parallax>
      
      <ScrollReveal delay={0.1}>
        <h1>Match Details</h1>
      </ScrollReveal>
      
      <ScrollReveal delay={0.2}>
        <StaggerContainer>
          {stats.map(stat => (
            <StaggerItem key={stat.id}>
              <StatCard {...stat} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </ScrollReveal>
    </div>
  );
}
```

### Leaderboard with Rank Animations

```tsx
import { RankAnimation, AnimatedCounter, StaggerContainer, StaggerItem } from '@/lib/animations';

export function Leaderboard({ rankings }) {
  return (
    <StaggerContainer>
      {rankings.map(entry => (
        <StaggerItem key={entry.id}>
          <RankAnimation 
            previousRank={entry.previousRank} 
            currentRank={entry.rank}
          >
            <div className="leaderboard-row">
              <span>#{entry.rank}</span>
              <span>{entry.player.name}</span>
              <AnimatedCounter value={entry.points} />
            </div>
          </RankAnimation>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
```

### Card Grid with Entrance Animations

```tsx
import { StaggerContainer, StaggerItem } from '@/lib/animations';

export function CardGrid({ items }) {
  return (
    <StaggerContainer speed="fast">
      <div className="grid grid-cols-3 gap-4">
        {items.map(item => (
          <StaggerItem key={item.id}>
            <Card {...item} />
          </StaggerItem>
        ))}
      </div>
    </StaggerContainer>
  );
}
```

## Performance Tips

1. Use `AnimatePresence` for exit animations
2. Prefer CSS transforms (x, y, scale) over layout properties
3. Use `will-change` sparingly
4. Implement virtualization for long lists
5. Lazy load heavy animation components

## Browser Support

The animation system works in all modern browsers that support:
- CSS transforms
- RequestAnimationFrame
- IntersectionObserver (for scroll animations)

Fallbacks are provided for older browsers through the reduced motion check.
