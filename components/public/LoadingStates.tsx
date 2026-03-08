'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BrandedLoader, InlineLoader } from './BrandedLoader';
import { prefersReducedMotion } from '@/lib/animations/config';

interface DataLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * DataLoading - Loading state for data fetching
 * Used when fetching data from API
 */
export function DataLoading({ message = 'Loading data...', size = 'md' }: DataLoadingProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <InlineLoader message={message} size={size} />
    </div>
  );
}

interface ContentLoadingProps {
  lines?: number;
  className?: string;
}

/**
 * ContentLoading - Skeleton loader for content
 * Mimics the structure of the content being loaded
 */
export function ContentLoading({ lines = 3, className = '' }: ContentLoadingProps) {
  const shouldAnimate = !prefersReducedMotion();

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          initial={shouldAnimate ? { opacity: 0.5 } : { opacity: 1 }}
          animate={shouldAnimate ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
          transition={
            shouldAnimate
              ? {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.1,
                }
              : undefined
          }
          className="h-4 bg-gray-200 rounded"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );
}

interface CardLoadingProps {
  count?: number;
  columns?: 1 | 2 | 3 | 4;
}

/**
 * CardLoading - Skeleton loader for card grids
 * Used for tournament, player, and club listings
 */
export function CardLoading({ count = 6, columns = 3 }: CardLoadingProps) {
  const shouldAnimate = !prefersReducedMotion();

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={
            shouldAnimate
              ? {
                  duration: 0.3,
                  delay: i * 0.05,
                }
              : undefined
          }
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
        >
          {/* Image placeholder */}
          <motion.div
            animate={
              shouldAnimate
                ? {
                    opacity: [0.5, 1, 0.5],
                  }
                : undefined
            }
            transition={
              shouldAnimate
                ? {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
                : undefined
            }
            className="w-full h-48 bg-gray-200 rounded-lg"
          />
          
          {/* Title placeholder */}
          <motion.div
            animate={
              shouldAnimate
                ? {
                    opacity: [0.5, 1, 0.5],
                  }
                : undefined
            }
            transition={
              shouldAnimate
                ? {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.1,
                  }
                : undefined
            }
            className="h-6 bg-gray-200 rounded w-3/4"
          />
          
          {/* Description placeholders */}
          <div className="space-y-2">
            <motion.div
              animate={
                shouldAnimate
                  ? {
                      opacity: [0.5, 1, 0.5],
                    }
                  : undefined
              }
              transition={
                shouldAnimate
                  ? {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.2,
                    }
                  : undefined
              }
              className="h-4 bg-gray-200 rounded"
            />
            <motion.div
              animate={
                shouldAnimate
                  ? {
                      opacity: [0.5, 1, 0.5],
                    }
                  : undefined
              }
              transition={
                shouldAnimate
                  ? {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.3,
                    }
                  : undefined
              }
              className="h-4 bg-gray-200 rounded w-5/6"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface TableLoadingProps {
  rows?: number;
  columns?: number;
}

/**
 * TableLoading - Skeleton loader for tables
 * Used for leaderboards and data tables
 */
export function TableLoading({ rows = 5, columns = 5 }: TableLoadingProps) {
  const shouldAnimate = !prefersReducedMotion();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <motion.div
              key={i}
              animate={
                shouldAnimate
                  ? {
                      opacity: [0.5, 1, 0.5],
                    }
                  : undefined
              }
              transition={
                shouldAnimate
                  ? {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.05,
                    }
                  : undefined
              }
              className="h-4 bg-gray-300 rounded"
            />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <motion.div
                  key={colIndex}
                  animate={
                    shouldAnimate
                      ? {
                          opacity: [0.5, 1, 0.5],
                        }
                      : undefined
                  }
                  transition={
                    shouldAnimate
                      ? {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: (rowIndex * columns + colIndex) * 0.02,
                        }
                      : undefined
                  }
                  className="h-4 bg-gray-200 rounded"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * PageLoading - Full page loading state
 * Used for initial page loads
 */
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="text-center">
        <BrandedLoader size="lg" />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-gray-600 font-medium text-lg"
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
}
