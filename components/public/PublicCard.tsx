'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { hoverVariants, prefersReducedMotion } from '@/lib/animations';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface PublicCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-gray-200 shadow-md',
  elevated: 'bg-white shadow-lg',
  outlined: 'bg-white border-2 border-gray-300',
  glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg',
};

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function PublicCard({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  onClick,
}: PublicCardProps) {
  const clickableStyles = onClick ? 'cursor-pointer' : '';
  const shouldAnimate = !prefersReducedMotion();

  const Component = hover && shouldAnimate ? motion.div : 'div';
  const animationProps = hover && shouldAnimate ? hoverVariants.lift : {};

  return (
    <Component
      className={`
        rounded-lg overflow-hidden
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${hover && !shouldAnimate ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1' : ''}
        ${hover ? 'cursor-pointer' : ''}
        ${onClick ? 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2' : ''}
        ${clickableStyles}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      {...animationProps}
    >
      {children}
    </Component>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function CardTitle({ children, className = '', as: Component = 'h3' }: CardTitleProps) {
  return (
    <Component className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </Component>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`}>
      {children}
    </div>
  );
}

// 3D Card with depth effects for Club Universe
interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card3D({ children, className = '', onClick }: Card3DProps) {
  const [rotation, setRotation] = React.useState({ x: 0, y: 0 });
  const shouldAnimate = !prefersReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!shouldAnimate) return;
    
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const Component = shouldAnimate ? motion.div : 'div';

  return (
    <Component
      className={`
        relative rounded-lg overflow-hidden
        bg-white border border-gray-200 shadow-lg
        transition-all duration-300 ease-out
        hover:shadow-2xl cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${className}
      `}
      style={{
        transform: shouldAnimate 
          ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${rotation.x || rotation.y ? 1.05 : 1})`
          : undefined,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label="Interactive 3D card"
    >
      {children}
    </Component>
  );
}
