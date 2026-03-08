'use client';

import React from 'react';

/**
 * AccessibleIcon component that provides alternative indicators for color-coded information
 * Implements Requirements 11.3 (alternative indicators for color)
 */

interface AccessibleIconProps {
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export function AccessibleIcon({ icon, label, className = '' }: AccessibleIconProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span aria-hidden="true">{icon}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

// Outcome indicators with both color and icon
interface OutcomeIndicatorProps {
  outcome: 'WIN' | 'DRAW' | 'LOSS';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const outcomeConfig = {
  WIN: {
    icon: '✓',
    label: 'Win',
    color: 'text-green-600 bg-green-100',
    borderColor: 'border-green-300',
  },
  DRAW: {
    icon: '=',
    label: 'Draw',
    color: 'text-yellow-600 bg-yellow-100',
    borderColor: 'border-yellow-300',
  },
  LOSS: {
    icon: '✗',
    label: 'Loss',
    color: 'text-red-600 bg-red-100',
    borderColor: 'border-red-300',
  },
};

const sizeStyles = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
  lg: 'text-base px-3 py-1.5',
};

export function OutcomeIndicator({
  outcome,
  size = 'md',
  showLabel = false,
  className = '',
}: OutcomeIndicatorProps) {
  const config = outcomeConfig[outcome];

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded border ${config.color} ${config.borderColor} ${sizeStyles[size]} ${className}`}
      role="status"
      aria-label={config.label}
    >
      <span aria-hidden="true">{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

// Trend indicators with both color and icon
interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'neutral';
  value?: string | number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const trendConfig = {
  up: {
    icon: '↑',
    label: 'Increasing',
    color: 'text-green-600',
  },
  down: {
    icon: '↓',
    label: 'Decreasing',
    color: 'text-red-600',
  },
  neutral: {
    icon: '→',
    label: 'Stable',
    color: 'text-gray-600',
  },
};

export function TrendIndicator({
  trend,
  value,
  size = 'md',
  className = '',
}: TrendIndicatorProps) {
  const config = trendConfig[trend];

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold ${config.color} ${sizeStyles[size]} ${className}`}
      role="status"
      aria-label={`${config.label}${value ? `: ${value}` : ''}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      {value && <span>{value}</span>}
    </span>
  );
}

// Status indicators with both color and pattern
interface StatusIndicatorProps {
  status: 'active' | 'upcoming' | 'completed';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const statusConfig = {
  active: {
    icon: '●',
    label: 'Active',
    color: 'text-green-600 bg-green-50',
    borderColor: 'border-green-300',
    pattern: 'animate-pulse',
  },
  upcoming: {
    icon: '○',
    label: 'Upcoming',
    color: 'text-blue-600 bg-blue-50',
    borderColor: 'border-blue-300',
    pattern: '',
  },
  completed: {
    icon: '◉',
    label: 'Completed',
    color: 'text-gray-600 bg-gray-50',
    borderColor: 'border-gray-300',
    pattern: '',
  },
};

export function StatusIndicator({
  status,
  size = 'md',
  showLabel = true,
  className = '',
}: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.color} ${config.borderColor} ${sizeStyles[size]} ${config.pattern} ${className}`}
      role="status"
      aria-label={config.label}
    >
      <span aria-hidden="true">{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
