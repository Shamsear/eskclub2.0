'use client';

import React, { useEffect, useState, useRef } from 'react';

export type StatColor = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
export type StatFormat = 'number' | 'percentage' | 'decimal';
export type StatTrend = 'up' | 'down' | 'neutral';

interface StatCardProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
  trend?: StatTrend;
  color?: StatColor;
  format?: StatFormat;
  className?: string;
  animationDuration?: number;
}

const colorStyles: Record<StatColor, { bg: string; text: string; border: string }> = {
  primary: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  success: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
  },
  warning: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
  },
  danger: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
  },
  neutral: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
  },
};

const trendStyles: Record<StatTrend, { icon: string; color: string }> = {
  up: {
    icon: '↑',
    color: 'text-green-600',
  },
  down: {
    icon: '↓',
    color: 'text-red-600',
  },
  neutral: {
    icon: '→',
    color: 'text-gray-600',
  },
};

function formatValue(value: number, format: StatFormat): string {
  switch (format) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'decimal':
      return value.toFixed(2);
    case 'number':
    default:
      return Math.round(value).toLocaleString();
  }
}

function useAnimatedCounter(
  targetValue: number,
  duration: number = 1000
): number {
  const [currentValue, setCurrentValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    startTimeRef.current = null;
    
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newValue = targetValue * easeOut;
      
      setCurrentValue(newValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetValue, duration]);

  return currentValue;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  color = 'primary',
  format = 'number',
  className = '',
  animationDuration = 1000,
}: StatCardProps) {
  const animatedValue = useAnimatedCounter(value, animationDuration);
  const colors = colorStyles[color];
  const [isPulsing, setIsPulsing] = useState(false);

  // Pulse animation when value changes
  useEffect(() => {
    setIsPulsing(true);
    const timer = setTimeout(() => setIsPulsing(false), 300);
    return () => clearTimeout(timer);
  }, [value]);

  const trendLabel = trend ? ` (${trend === 'up' ? 'increasing' : trend === 'down' ? 'decreasing' : 'stable'})` : '';
  
  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border-2 p-6
        transition-all duration-300 hover:shadow-lg
        focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2
        ${colors.bg} ${colors.border}
        ${isPulsing ? 'animate-pulse' : ''}
        ${className}
      `}
      role="article"
      aria-label={`${label}: ${formatValue(value, format)}${trendLabel}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2" id={`stat-label-${label.replace(/\s+/g, '-')}`}>
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <p
              className={`text-3xl font-bold ${colors.text}`}
              aria-live="polite"
              aria-atomic="true"
              aria-describedby={`stat-label-${label.replace(/\s+/g, '-')}`}
            >
              {formatValue(animatedValue, format)}
            </p>
            {trend && (
              <span
                className={`text-lg font-semibold ${trendStyles[trend].color}`}
                role="img"
                aria-label={`Trend: ${trend === 'up' ? 'increasing' : trend === 'down' ? 'decreasing' : 'stable'}`}
              >
                {trendStyles[trend].icon}
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className={`text-2xl ${colors.text} opacity-80`} aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
