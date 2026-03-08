'use client';

import React from 'react';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveStack } from '@/components/public/ResponsiveContainer';
import { TouchOptimizedButton, TouchOptimizedIconButton } from '@/components/public/TouchOptimizedButton';
import { PublicCard } from '@/components/public/PublicCard';
import { useResponsive } from '@/lib/hooks/useResponsive';

export default function TestResponsivePage() {
  const responsive = useResponsive();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ResponsiveContainer maxWidth="wide">
        {/* Responsive Info Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Responsive Design Test
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Breakpoint</div>
              <div className="text-lg font-semibold text-primary-600">{responsive.breakpoint}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Width</div>
              <div className="text-lg font-semibold">{responsive.width}px</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Height</div>
              <div className="text-lg font-semibold">{responsive.height}px</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Device Type</div>
              <div className="text-lg font-semibold">
                {responsive.isMobile && 'Mobile'}
                {responsive.isTablet && 'Tablet'}
                {responsive.isDesktop && !responsive.isUltraWide && 'Desktop'}
                {responsive.isUltraWide && 'Ultra-Wide'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Touch Device</div>
              <div className="text-lg font-semibold">
                {responsive.isTouchDevice ? 'Yes' : 'No'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Orientation</div>
              <div className="text-lg font-semibold">
                {responsive.isPortrait ? 'Portrait' : 'Landscape'}
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Grid Test */}
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Responsive Grid (1→2→3→4→5 columns)
          </h2>
          <ResponsiveGrid
            cols={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
            gap="md"
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <PublicCard key={i} padding="md" hover>
                <div className="text-center">
                  <div className="text-4xl mb-2">📦</div>
                  <div className="font-semibold">Card {i + 1}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Responsive grid item
                  </div>
                </div>
              </PublicCard>
            ))}
          </ResponsiveGrid>
        </section>

        {/* Touch Target Test */}
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Touch-Optimized Buttons (44px mobile, 32px+ desktop)
          </h2>
          <ResponsiveStack direction="horizontal-md" gap="md">
            <TouchOptimizedButton variant="primary" size="sm">
              Small Button
            </TouchOptimizedButton>
            <TouchOptimizedButton variant="primary" size="md">
              Medium Button
            </TouchOptimizedButton>
            <TouchOptimizedButton variant="primary" size="lg">
              Large Button
            </TouchOptimizedButton>
            <TouchOptimizedButton variant="secondary" size="md">
              Secondary
            </TouchOptimizedButton>
            <TouchOptimizedButton variant="ghost" size="md">
              Ghost
            </TouchOptimizedButton>
          </ResponsiveStack>

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Icon Buttons</h3>
            <ResponsiveStack direction="horizontal-md" gap="md">
              <TouchOptimizedIconButton
                icon={<span>🔍</span>}
                ariaLabel="Search"
                variant="primary"
              />
              <TouchOptimizedIconButton
                icon={<span>❤️</span>}
                ariaLabel="Like"
                variant="secondary"
              />
              <TouchOptimizedIconButton
                icon={<span>⚙️</span>}
                ariaLabel="Settings"
                variant="ghost"
              />
            </ResponsiveStack>
          </div>
        </section>

        {/* Responsive Stack Test */}
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Responsive Stack (Vertical → Horizontal at md)
          </h2>
          <PublicCard padding="md">
            <ResponsiveStack direction="horizontal-md" gap="lg" align="center">
              <div className="flex-shrink-0 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                👤
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Player Name</h3>
                <p className="text-gray-600">This content stacks vertically on mobile and horizontally on tablet+</p>
              </div>
              <TouchOptimizedButton variant="primary" size="md">
                View Profile
              </TouchOptimizedButton>
            </ResponsiveStack>
          </PublicCard>
        </section>

        {/* Typography Scale Test */}
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Responsive Typography
          </h2>
          <PublicCard padding="lg">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4">
              Heading 1 (Scales with breakpoints)
            </h1>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Heading 2 (Scales with breakpoints)
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-4">
              Body text that scales from base to lg on larger screens for better readability.
            </p>
            <p className="text-sm sm:text-base text-gray-500">
              Small text that becomes base size on larger screens.
            </p>
          </PublicCard>
        </section>

        {/* Spacing Test */}
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Responsive Spacing
          </h2>
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <PublicCard padding="sm">
              <div className="text-center">Small Padding (p-4)</div>
            </PublicCard>
            <PublicCard padding="md">
              <div className="text-center">Medium Padding (p-6)</div>
            </PublicCard>
            <PublicCard padding="lg">
              <div className="text-center">Large Padding (p-8)</div>
            </PublicCard>
          </div>
        </section>

        {/* Breakpoint Visibility Test */}
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Breakpoint Visibility
          </h2>
          <div className="space-y-2">
            <div className="block sm:hidden bg-red-100 text-red-800 p-4 rounded-lg">
              Visible only on XS (below 640px)
            </div>
            <div className="hidden sm:block md:hidden bg-orange-100 text-orange-800 p-4 rounded-lg">
              Visible only on SM (640px - 767px)
            </div>
            <div className="hidden md:block lg:hidden bg-yellow-100 text-yellow-800 p-4 rounded-lg">
              Visible only on MD (768px - 1023px)
            </div>
            <div className="hidden lg:block xl:hidden bg-green-100 text-green-800 p-4 rounded-lg">
              Visible only on LG (1024px - 1279px)
            </div>
            <div className="hidden xl:block 2xl:hidden bg-blue-100 text-blue-800 p-4 rounded-lg">
              Visible only on XL (1280px - 1535px)
            </div>
            <div className="hidden 2xl:block 3xl:hidden bg-indigo-100 text-indigo-800 p-4 rounded-lg">
              Visible only on 2XL (1536px - 1919px)
            </div>
            <div className="hidden 3xl:block bg-purple-100 text-purple-800 p-4 rounded-lg">
              Visible only on 3XL (1920px+)
            </div>
          </div>
        </section>

        {/* Max Width Constraint Test */}
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Ultra-Wide Display Constraint
          </h2>
          <PublicCard padding="lg">
            <p className="text-gray-600">
              This content is constrained to max-w-container (1600px) on ultra-wide displays
              to prevent excessive line lengths and maintain readability. The container centers
              itself with appropriate margins on screens wider than 1920px.
            </p>
          </PublicCard>
        </section>
      </ResponsiveContainer>
    </div>
  );
}
