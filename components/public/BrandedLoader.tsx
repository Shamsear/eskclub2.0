'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/animations/config';

interface BrandedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * BrandedLoader - Animated loading indicator with Eskimos branding
 * Used for data fetching and navigation loading states
 */
export function BrandedLoader({ size = 'md', className = '' }: BrandedLoaderProps) {
  const shouldAnimate = !prefersReducedMotion();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  if (!shouldAnimate) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className={`${sizeClasses[size]} relative`}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${dotSizes[size]} bg-primary-600 rounded-full`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 border-4 border-primary-200 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Spinning arc */}
        <motion.div
          className="absolute inset-0 border-4 border-transparent border-t-primary-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Center pulse */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className={`${dotSizes[size]} bg-primary-600 rounded-full`} />
        </motion.div>
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
}

/**
 * LoadingOverlay - Full-screen loading overlay with branded loader
 * Used for page transitions and major data loading
 */
export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="text-center">
        <BrandedLoader size="lg" />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-gray-600 font-medium"
        >
          {message}
        </motion.p>
      </div>
    </motion.div>
  );
}

interface InlineLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * InlineLoader - Inline loading indicator for content areas
 * Used for section-level loading states
 */
export function InlineLoader({ message, size = 'md' }: InlineLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <BrandedLoader size={size} />
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-gray-600"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
