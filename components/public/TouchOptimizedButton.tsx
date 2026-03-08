'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/animations';

interface TouchOptimizedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

/**
 * Touch-optimized button that ensures minimum 44x44px touch targets on mobile
 * and 32x32px on desktop with pointer devices
 */
export function TouchOptimizedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  ariaLabel,
}: TouchOptimizedButtonProps) {
  const variantStyles = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md',
    secondary: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  };

  // Touch targets: 44x44px on mobile, 32x32px on desktop
  const sizeStyles = {
    sm: 'min-h-[44px] min-w-[44px] lg:min-h-[32px] lg:min-w-[32px] px-3 py-2 text-sm',
    md: 'min-h-[44px] min-w-[44px] lg:min-h-[40px] lg:min-w-[40px] px-4 py-2.5 text-base',
    lg: 'min-h-[44px] min-w-[44px] lg:min-h-[48px] lg:min-w-[48px] px-6 py-3 text-lg',
  };

  const disabledStyles = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer active:scale-95';

  const shouldAnimate = !prefersReducedMotion();
  const Component = shouldAnimate ? motion.button : 'button';

  const animationProps = shouldAnimate
    ? {
        whileTap: { scale: disabled ? 1 : 0.95 },
        transition: { duration: 0.1 },
      }
    : {};

  return (
    <Component
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        inline-flex items-center justify-center
        rounded-lg font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabledStyles}
        ${className}
      `}
      {...animationProps}
    >
      {children}
    </Component>
  );
}

interface TouchOptimizedIconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  ariaLabel: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  disabled?: boolean;
}

/**
 * Touch-optimized icon button with proper touch target sizing
 */
export function TouchOptimizedIconButton({
  icon,
  onClick,
  ariaLabel,
  variant = 'ghost',
  className = '',
  disabled = false,
}: TouchOptimizedIconButtonProps) {
  const variantStyles = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  };

  const disabledStyles = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer active:scale-95';

  const shouldAnimate = !prefersReducedMotion();
  const Component = shouldAnimate ? motion.button : 'button';

  const animationProps = shouldAnimate
    ? {
        whileTap: { scale: disabled ? 1 : 0.9 },
        transition: { duration: 0.1 },
      }
    : {};

  return (
    <Component
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        inline-flex items-center justify-center
        min-h-[44px] min-w-[44px] lg:min-h-[40px] lg:min-w-[40px]
        rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${variantStyles[variant]}
        ${disabledStyles}
        ${className}
      `}
      {...animationProps}
    >
      {icon}
    </Component>
  );
}
