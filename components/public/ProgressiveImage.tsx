'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Generate a tiny blur placeholder data URL
 */
function generateBlurDataURL(width: number = 10, height: number = 10): string {
  // Create a simple gray gradient SVG as blur placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)" />
    </svg>
  `;
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Progressive image component with blur-up effect
 * Provides smooth loading experience with placeholder
 */
export function ProgressiveImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  sizes,
  objectFit = 'cover',
  quality = 75,
  onLoad,
  onError,
}: ProgressiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset loading state when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Error fallback
  if (hasError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={fill ? undefined : { width, height }}
        role="img"
        aria-label={alt}
      >
        <svg
          className="w-1/3 h-1/3 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  const imageProps = fill
    ? {
        fill: true,
        sizes: sizes || '100vw',
      }
    : {
        width: width || 400,
        height: height || 300,
        sizes: sizes,
      };

  return (
    <div className={`relative ${className}`} style={fill ? undefined : { width, height }}>
      <Image
        src={src}
        alt={alt}
        {...imageProps}
        quality={quality}
        priority={priority}
        placeholder="blur"
        blurDataURL={generateBlurDataURL()}
        className={`
          transition-opacity duration-500
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          ${fill ? 'object-cover' : ''}
        `}
        style={fill ? { objectFit } : undefined}
        onLoad={handleLoad}
        onError={handleError}
      />
      {isLoading && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

interface ProgressiveAvatarProps {
  src: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fallbackText?: string;
  className?: string;
  priority?: boolean;
}

/**
 * Progressive avatar component with fallback
 */
export function ProgressiveAvatar({
  src,
  alt,
  size = 'md',
  fallbackText,
  className = '',
  priority = false,
}: ProgressiveAvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
    '2xl': 'w-32 h-32 text-4xl',
  };

  const fallback = fallbackText || alt.charAt(0).toUpperCase();

  return (
    <div
      className={`
        relative rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500
        flex items-center justify-center flex-shrink-0
        ${sizeClasses[size]} ${className}
      `}
    >
      {src ? (
        <ProgressiveImage
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 48px, (max-width: 1024px) 64px, 96px"
          objectFit="cover"
        />
      ) : (
        <span className="font-bold text-white select-none">{fallback}</span>
      )}
    </div>
  );
}

interface ProgressiveBackgroundProps {
  src: string;
  alt: string;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  priority?: boolean;
}

/**
 * Progressive background image component
 */
export function ProgressiveBackground({
  src,
  alt,
  children,
  className = '',
  overlayClassName = 'bg-black/40',
  priority = false,
}: ProgressiveBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <ProgressiveImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        objectFit="cover"
        className="absolute inset-0 z-0"
      />
      <div className={`absolute inset-0 z-10 ${overlayClassName}`} aria-hidden="true" />
      <div className="relative z-20">{children}</div>
    </div>
  );
}
