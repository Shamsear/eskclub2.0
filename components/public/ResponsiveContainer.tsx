import React from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'default' | 'wide' | 'full';
  padding?: boolean;
}

/**
 * Responsive container that handles all breakpoints from 320px to 3840px
 * with proper max-width constraints for ultra-wide displays
 */
export function ResponsiveContainer({
  children,
  className = '',
  maxWidth = 'default',
  padding = true,
}: ResponsiveContainerProps) {
  const maxWidthClass = {
    default: 'max-w-7xl',      // 1280px
    wide: 'max-w-container',   // 1600px for ultra-wide
    full: 'max-w-full',
  }[maxWidth];

  const paddingClass = padding ? 'px-4 sm:px-6 lg:px-8' : '';

  return (
    <div className={`mx-auto ${maxWidthClass} ${paddingClass} ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

/**
 * Responsive grid that adapts column count based on breakpoints
 */
export function ResponsiveGrid({
  children,
  className = '',
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
}: ResponsiveGridProps) {
  const gapClass = {
    sm: 'gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
  }[gap];

  const colClasses = [
    cols.xs && `grid-cols-${cols.xs}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    cols['2xl'] && `2xl:grid-cols-${cols['2xl']}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`grid ${colClasses} ${gapClass} ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'vertical' | 'horizontal-sm' | 'horizontal-md' | 'horizontal-lg';
  gap?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
}

/**
 * Responsive stack that changes direction based on breakpoints
 */
export function ResponsiveStack({
  children,
  className = '',
  direction = 'horizontal-md',
  gap = 'md',
  align = 'start',
}: ResponsiveStackProps) {
  const gapClass = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }[gap];

  const alignClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }[align];

  const directionClass = {
    vertical: 'flex-col',
    'horizontal-sm': 'flex-col sm:flex-row',
    'horizontal-md': 'flex-col md:flex-row',
    'horizontal-lg': 'flex-col lg:flex-row',
  }[direction];

  return (
    <div className={`flex ${directionClass} ${gapClass} ${alignClass} ${className}`}>
      {children}
    </div>
  );
}
