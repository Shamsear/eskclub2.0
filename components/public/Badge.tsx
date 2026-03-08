'use client';

import React from 'react';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  className?: string;
}

// All variants use dark-friendly semi-transparent styles
const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  warning: 'bg-[#FFB700]/10 text-[#FFB700] border-[#FFB700]/20',
  danger:  'bg-red-500/10 text-red-400 border-red-500/20',
  neutral: 'bg-white/5 text-[#A0A0A0] border-white/10',
  info:    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-bold rounded-full border
        transition-colors
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      role="status"
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

// ── Role Badge ──
interface RoleBadgeProps {
  role: 'PLAYER' | 'CAPTAIN' | 'MENTOR' | 'MANAGER';
  size?: BadgeSize;
  className?: string;
}

const roleConfig: Record<string, { variant: BadgeVariant; icon: string; label: string }> = {
  PLAYER:  { variant: 'primary', icon: '⚽', label: 'Player' },
  CAPTAIN: { variant: 'warning', icon: '👑', label: 'Captain' },
  MENTOR:  { variant: 'info',    icon: '🎓', label: 'Mentor' },
  MANAGER: { variant: 'success', icon: '📋', label: 'Manager' },
};

export function RoleBadge({ role, size = 'md', className = '' }: RoleBadgeProps) {
  const config = roleConfig[role];
  return (
    <Badge variant={config.variant} size={size} icon={<span>{config.icon}</span>} className={className}>
      {config.label}
    </Badge>
  );
}

// ── Achievement Badge ──
interface AchievementBadgeProps {
  type: 'tournament_win' | 'top_scorer' | 'most_active' | 'custom';
  label: string;
  size?: BadgeSize;
  className?: string;
}

const achievementConfig: Record<string, { variant: BadgeVariant; icon: string }> = {
  tournament_win: { variant: 'warning', icon: '🏆' },
  top_scorer:     { variant: 'warning', icon: '⚡' },
  most_active:    { variant: 'info',    icon: '🌟' },
  custom:         { variant: 'neutral', icon: '🎖️' },
};

export function AchievementBadge({ type, label, size = 'md', className = '' }: AchievementBadgeProps) {
  const config = achievementConfig[type];
  return (
    <Badge variant={config.variant} size={size} icon={<span>{config.icon}</span>} className={className}>
      {label}
    </Badge>
  );
}

// ── Status Badge ──
interface StatusBadgeProps {
  status: 'upcoming' | 'active' | 'completed';
  size?: BadgeSize;
  className?: string;
}

const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
  upcoming:  { variant: 'info',    label: 'Upcoming' },
  active:    { variant: 'success', label: 'Active' },
  completed: { variant: 'neutral', label: 'Completed' },
};

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const dotColor =
    status === 'active'    ? 'bg-green-400' :
    status === 'upcoming'  ? 'bg-cyan-400'  : 'bg-[#555]';
  return (
    <Badge
      variant={config.variant}
      size={size}
      className={className}
      icon={<span className={`inline-block w-1.5 h-1.5 rounded-full ${dotColor}`} />}
    >
      {config.label}
    </Badge>
  );
}
