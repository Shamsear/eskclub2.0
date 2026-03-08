'use client';

import React from 'react';
import Image from 'next/image';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * Responsive image component with optimized loading and blur placeholder
 */
export function ResponsiveImage({
  src,
  alt,
  className = '',
  priority = false,
  sizes,
  fill = false,
  width,
  height,
  objectFit = 'cover',
}: ResponsiveImageProps) {
  // Default responsive sizes if not provided
  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  const imageProps = fill
    ? {
        fill: true,
        sizes: defaultSizes,
      }
    : {
        width: width || 400,
        height: height || 300,
        sizes: defaultSizes,
      };

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      priority={priority}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
      style={{ objectFit }}
      {...imageProps}
    />
  );
}

interface ResponsiveAvatarProps {
  src: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackText?: string;
  className?: string;
}

/**
 * Responsive avatar component with fallback
 */
export function ResponsiveAvatar({
  src,
  alt,
  size = 'md',
  fallbackText,
  className = '',
}: ResponsiveAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const fallback = fallbackText || alt.charAt(0).toUpperCase();

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 48px, (max-width: 1024px) 64px, 96px"
        />
      ) : (
        <span className="font-bold text-gray-400">{fallback}</span>
      )}
    </div>
  );
}
