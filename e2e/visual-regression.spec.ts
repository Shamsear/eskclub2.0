/**
 * Visual Regression Testing
 * 
 * This test suite captures screenshots of key pages and components
 * at different breakpoints to detect visual regressions.
 */

import { test, expect } from '@playwright/test';

const BREAKPOINTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
};

const PUBLIC_PAGES = [
  { path: '/tournaments', name: 'tournaments-list' },
  { path: '/players', name: 'players-list' },
  { path: '/clubs', name: 'clubs-list' },
  { path: '/matches', name: 'matches-list' },
];

test.describe('Visual Regression Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  // Test each page at each breakpoint
  for (const page of PUBLIC_PAGES) {
    for (const [breakpointName, viewport] of Object.entries(BREAKPOINTS)) {
      test(`${page.name} - ${breakpointName}`, async ({ page: browserPage }) => {
        // Set viewport
        await browserPage.setViewportSize(viewport);

        // Navigate to page
        await browserPage.goto(page.path);

        // Wait for content to load
        await browserPage.waitForLoadState('networkidle');

        // Wait for any animations to complete
        await browserPage.waitForTimeout(1000);

        // Take screenshot
        await expect(browserPage).toHaveScreenshot(
          `${page.name}-${breakpointName}.png`,
          {
            fullPage: true,
            animations: 'disabled',
          }
        );
      });
    }
  }

  test.describe('Component States', () => {
    test('tournament card - hover state', async ({ page }) => {
      await page.goto('/tournaments');
      await page.waitForLoadState('networkidle');

      // Find first tournament card
      const card = page.locator('[data-testid="tournament-card"]').first();
      await card.hover();

      // Wait for hover animation
      await page.waitForTimeout(300);

      await expect(card).toHaveScreenshot('tournament-card-hover.png');
    });

    test('stat card - animated counter', async ({ page }) => {
      await page.goto('/tournaments');
      await page.waitForLoadState('networkidle');

      // Wait for counter animation to complete
      await page.waitForTimeout(1500);

      const statCard = page.locator('[data-testid="stat-card"]').first();
      await expect(statCard).toHaveScreenshot('stat-card-complete.png');
    });

    test('badge variants', async ({ page }) => {
      await page.goto('/components-demo');
      await page.waitForLoadState('networkidle');

      const badgeSection = page.locator('[data-testid="badge-showcase"]');
      await expect(badgeSection).toHaveScreenshot('badge-variants.png');
    });
  });

  test.describe('Responsive Layouts', () => {
    test('navigation - mobile menu', async ({ page }) => {
      await page.setViewportSize(BREAKPOINTS.mobile);
      await page.goto('/tournaments');

      // Open mobile menu
      const menuButton = page.locator('[aria-label="Open menu"]');
      await menuButton.click();

      // Wait for menu animation
      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot('mobile-menu-open.png');
    });

    test('leaderboard - responsive table', async ({ page }) => {
      // Test at mobile
      await page.setViewportSize(BREAKPOINTS.mobile);
      await page.goto('/tournaments');
      
      // Navigate to a tournament with leaderboard
      const firstTournament = page.locator('[data-testid="tournament-card"]').first();
      await firstTournament.click();
      
      await page.waitForLoadState('networkidle');
      
      const leaderboardTab = page.locator('button:has-text("Leaderboard")');
      if (await leaderboardTab.isVisible()) {
        await leaderboardTab.click();
        await page.waitForTimeout(500);
        
        await expect(page).toHaveScreenshot('leaderboard-mobile.png', {
          fullPage: true,
        });
      }
    });

    test('card grid - breakpoint transitions', async ({ page }) => {
      const viewports = [
        { width: 375, name: 'mobile' },
        { width: 640, name: 'sm' },
        { width: 768, name: 'md' },
        { width: 1024, name: 'lg' },
        { width: 1280, name: 'xl' },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: 800 });
        await page.goto('/tournaments');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(
          `tournament-grid-${viewport.name}.png`,
          {
            clip: { x: 0, y: 0, width: viewport.width, height: 800 },
          }
        );
      }
    });
  });

  test.describe('Accessibility Features', () => {
    test('focus indicators', async ({ page }) => {
      await page.goto('/tournaments');
      await page.waitForLoadState('networkidle');

      // Tab to first focusable element
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);

      await expect(page).toHaveScreenshot('focus-indicator-1.png');

      // Tab to next element
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);

      await expect(page).toHaveScreenshot('focus-indicator-2.png');
    });

    test('high contrast mode', async ({ page }) => {
      // Emulate high contrast mode
      await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
      
      await page.goto('/tournaments');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('high-contrast-mode.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Loading States', () => {
    test('skeleton loaders', async ({ page }) => {
      // Intercept API calls to delay response
      await page.route('**/api/public/tournaments', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.continue();
      });

      await page.goto('/tournaments');

      // Capture skeleton state
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('skeleton-loaders.png');
    });

    test('empty states', async ({ page }) => {
      // Mock empty response
      await page.route('**/api/public/tournaments', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ tournaments: [], pagination: { total: 0 } }),
        })
      );

      await page.goto('/tournaments');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('empty-state.png');
    });

    test('error states', async ({ page }) => {
      // Mock error response
      await page.route('**/api/public/tournaments', (route) =>
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        })
      );

      await page.goto('/tournaments');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('error-state.png');
    });
  });

  test.describe('Animations', () => {
    test('page transitions', async ({ page }) => {
      await page.goto('/tournaments');
      await page.waitForLoadState('networkidle');

      // Click on first tournament
      const firstTournament = page.locator('[data-testid="tournament-card"]').first();
      await firstTournament.click();

      // Capture mid-transition
      await page.waitForTimeout(150);
      await expect(page).toHaveScreenshot('page-transition-mid.png');

      // Capture complete
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('page-transition-complete.png');
    });

    test('reduced motion', async ({ page }) => {
      // Emulate prefers-reduced-motion
      await page.emulateMedia({ reducedMotion: 'reduce' });

      await page.goto('/tournaments');
      await page.waitForLoadState('networkidle');

      // Animations should be instant
      await expect(page).toHaveScreenshot('reduced-motion.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Dark Mode', () => {
    test('dark mode - tournaments page', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/tournaments');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('dark-mode-tournaments.png', {
        fullPage: true,
      });
    });
  });
});
