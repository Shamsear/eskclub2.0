# Accessibility Features

This document outlines the accessibility features implemented in the public sports platform components.

## Overview

The platform follows WCAG 2.1 AA standards and implements comprehensive accessibility features to ensure all users can access and interact with the content, regardless of disabilities or assistive technologies.

## Key Features

### 1. Keyboard Navigation (Requirement 11.1)

#### Skip to Content Links
- **Component**: `SkipToContent`
- **Location**: All public layouts
- **Behavior**: Allows keyboard users to skip navigation and jump directly to main content
- **Implementation**: Hidden by default, visible on focus with proper styling

#### Focus Indicators
- **Visibility**: All interactive elements have visible focus indicators
- **Contrast**: Minimum 3:1 contrast ratio with background
- **Style**: 2px ring with primary color and offset for clarity
- **Implementation**: Applied via `focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`

#### Focus Trapping
- **Component**: `useFocusTrap` hook
- **Usage**: Modal dialogs and overlays
- **Behavior**: 
  - Traps focus within the modal when open
  - Cycles through focusable elements with Tab/Shift+Tab
  - Restores focus to trigger element on close
  - Supports Escape key to close

#### Keyboard Shortcuts
- **Enter/Space**: Activate buttons and interactive cards
- **Escape**: Close modals and overlays
- **Tab/Shift+Tab**: Navigate between interactive elements
- **Arrow Keys**: Navigate within lists and grids (where applicable)

### 2. ARIA Labels (Requirement 11.2)

#### Interactive Elements
All interactive elements include descriptive ARIA labels:

- **Buttons**: `aria-label` for icon-only buttons
- **Links**: Descriptive text or `aria-label` for context
- **Form Controls**: Associated `<label>` elements or `aria-label`
- **Custom Controls**: Appropriate ARIA roles and labels

#### Landmarks
- `role="navigation"` for navigation areas
- `role="main"` for main content (via `<main>` element)
- `role="search"` for search functionality
- `role="region"` for significant sections with `aria-label`

#### Live Regions
- `aria-live="polite"` for dynamic content updates (e.g., stat counters)
- `aria-atomic="true"` for complete announcements
- Status indicators use `role="status"`

#### Modal Dialogs
- `role="dialog"` with `aria-modal="true"`
- `aria-labelledby` pointing to modal title
- `aria-describedby` for additional context (when needed)

### 3. Color-Independent Information (Requirement 11.3)

All information conveyed through color also includes alternative indicators:

#### Outcome Indicators
- **WIN**: Green color + ✓ checkmark icon + "Win" label
- **DRAW**: Yellow color + = equals icon + "Draw" label
- **LOSS**: Red color + ✗ cross icon + "Loss" label

#### Trend Indicators
- **Increasing**: Green color + ↑ up arrow + "Increasing" label
- **Decreasing**: Red color + ↓ down arrow + "Decreasing" label
- **Stable**: Gray color + → right arrow + "Stable" label

#### Status Indicators
- **Active**: Green color + ● filled circle + "Active" label + pulse animation
- **Upcoming**: Blue color + ○ empty circle + "Upcoming" label
- **Completed**: Gray color + ◉ double circle + "Completed" label

#### Stat Categories
Each stat category uses:
- Distinct color coding
- Unique icons
- Clear text labels
- Border patterns for additional distinction

### 4. Touch Target Sizes (Requirement 11.5)

All interactive elements meet minimum touch target requirements:

#### Mobile (Touch Devices)
- **Minimum Size**: 44x44 pixels
- **Implementation**: `min-h-[44px] min-w-[44px]`
- **Applied To**: All buttons, links, form controls, and interactive elements

#### Desktop (Pointer Devices)
- **Minimum Size**: 32x32 pixels (40x40 for primary actions)
- **Implementation**: `lg:min-h-[32px] lg:min-w-[32px]`
- **Applied To**: All interactive elements

#### Components with Touch Optimization
- `TouchOptimizedButton`: Ensures proper sizing across devices
- `TouchOptimizedIconButton`: Icon-only buttons with adequate touch targets
- All navigation links and menu items
- Search and filter controls
- Modal close buttons
- Card click areas

### 5. Reduced Motion Support

The platform respects user preferences for reduced motion:

#### Detection
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

#### Behavior
- **When Enabled**: Animations are disabled or significantly reduced
- **Affected Components**: 
  - Page transitions
  - Card hover effects
  - Stat counter animations
  - Scroll-triggered animations
  - 3D transforms

#### Implementation
- Framer Motion animations check `prefersReducedMotion()`
- CSS transitions use `@media (prefers-reduced-motion: reduce)`
- Fallback to instant state changes when motion is reduced

### 6. Screen Reader Support

#### Semantic HTML
- Proper heading hierarchy (h1 → h2 → h3)
- Semantic elements (`<nav>`, `<main>`, `<article>`, `<section>`)
- Lists for navigation and grouped content
- Tables for tabular data (with proper headers)

#### Hidden Content
- **Visually Hidden**: `.sr-only` class for screen reader-only content
- **Aria Hidden**: `aria-hidden="true"` for decorative elements
- **Tab Index**: `tabindex="-1"` for programmatically focusable elements

#### Descriptive Text
- Alt text for all images
- Descriptive link text (no "click here")
- Form field labels and instructions
- Error messages associated with fields

## Component-Specific Accessibility

### PublicNavigation
- Skip to content link
- Keyboard-accessible menu toggle
- ARIA labels for mobile menu state
- Focus management in mobile menu

### PublicCard
- Keyboard activation (Enter/Space)
- Focus indicators
- Proper role attributes for clickable cards
- ARIA labels for context

### StatCard
- Live region announcements for value changes
- Descriptive labels for trends
- Color-independent indicators
- Proper semantic structure

### SearchBar
- Associated label (visible or sr-only)
- Clear button with proper ARIA label
- Search role for semantic meaning
- Keyboard-accessible clear action

### FilterPanel
- Collapsible sections with ARIA expanded state
- Keyboard navigation through filters
- Clear indication of active filters
- Accessible remove buttons for active filters

### Modal
- Focus trapping within modal
- Escape key to close
- Focus restoration on close
- Proper ARIA attributes

### Badge Components
- Status role for semantic meaning
- Descriptive labels
- Icon + text for redundancy
- Proper color contrast

## Testing Recommendations

### Automated Testing
- Run axe-core on all pages
- Validate WCAG 2.1 AA compliance
- Check color contrast ratios
- Verify ARIA attribute usage

### Manual Testing
- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Readers**: Test with NVDA, JAWS, and VoiceOver
- **Zoom**: Test at 200% browser zoom
- **High Contrast**: Test with high contrast modes
- **Reduced Motion**: Test with prefers-reduced-motion enabled

### Browser Testing
- Chrome with ChromeVox
- Firefox with NVDA
- Safari with VoiceOver
- Edge with Narrator

## Best Practices

1. **Always provide text alternatives** for non-text content
2. **Use semantic HTML** before adding ARIA
3. **Test with keyboard only** before considering accessible
4. **Ensure sufficient color contrast** (4.5:1 for normal text, 3:1 for large text)
5. **Provide multiple ways** to convey information (color + icon + text)
6. **Make focus indicators visible** and high contrast
7. **Respect user preferences** (reduced motion, high contrast)
8. **Test with real assistive technologies** not just automated tools

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
