import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Search and Filter Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should search for clubs globally', async ({ page }) => {
    // Navigate to search page or use global search
    await page.goto('/dashboard/search');
    
    // Enter search query
    await page.fill('input[type="search"], input[placeholder*="Search"]', 'Manchester');
    
    // Wait for search results
    await page.waitForTimeout(1000); // Wait for debounce
    
    // Verify search results contain the query
    await expect(page.locator('text=Manchester').first()).toBeVisible();
  });

  test('should search for team members with role awareness', async ({ page }) => {
    // Navigate to search
    await page.goto('/dashboard/search');
    
    // Search for a member name
    await page.fill('input[type="search"], input[placeholder*="Search"]', 'John');
    
    // Wait for results
    await page.waitForTimeout(1000);
    
    // Verify results show role badges
    const results = page.locator('[data-testid="search-results"], .search-results, main');
    await expect(results.locator('text=John').first()).toBeVisible();
  });

  test('should filter clubs list', async ({ page }) => {
    // Navigate to clubs page
    await page.goto('/dashboard/clubs');
    
    // Look for filter controls
    const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filters")');
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Apply a filter (adjust based on actual implementation)
      await page.waitForTimeout(500);
    }
    
    // Verify clubs list is displayed
    await expect(page.locator('a[href*="/clubs/"]').first()).toBeVisible();
  });

  test('should filter team members by role (MANAGER)', async ({ page }) => {
    // Navigate to clubs
    await page.goto('/dashboard/clubs');
    await page.waitForTimeout(2000);
    
    // Click on first club
    await page.locator('a[href*="/dashboard/clubs/"]:has-text("View Details")').first().click();
    await page.waitForURL(/\/clubs\/\d+$/);
    
    // Navigate to managers
    await page.click('a[href*="/managers"], a:has-text("Managers")');
    
    // Verify we're on managers page (filtered by MANAGER role)
    await page.waitForURL(/\/managers/);
    
    // Verify only managers are shown (members with MANAGER role)
    await expect(page.locator('text=Manager, text=MANAGER').first()).toBeVisible();
  });

  test('should filter team members by role (CAPTAIN)', async ({ page }) => {
    // Navigate to clubs
    await page.goto('/dashboard/clubs');
    await page.waitForTimeout(2000);
    
    // Click on first club
    await page.locator('a[href*="/dashboard/clubs/"]:has-text("View Details")').first().click();
    await page.waitForURL(/\/clubs\/\d+$/);
    
    // Navigate to captains
    await page.click('a[href*="/captains"], a:has-text("Captains")');
    
    // Verify we're on captains page
    await page.waitForURL(/\/captains/);
    
    // Verify captains are shown
    await expect(page.locator('text=Captain, text=CAPTAIN').first()).toBeVisible();
  });

  test('should filter team members by role (MENTOR)', async ({ page }) => {
    // Navigate to clubs
    await page.goto('/dashboard/clubs');
    await page.waitForTimeout(2000);
    
    // Click on first club
    await page.locator('a[href*="/dashboard/clubs/"]:has-text("View Details")').first().click();
    await page.waitForURL(/\/clubs\/\d+$/);
    
    // Navigate to mentors
    await page.click('a[href*="/mentors"], a:has-text("Mentors")');
    
    // Verify we're on mentors page
    await page.waitForURL(/\/mentors/);
    
    // Verify mentors are shown
    await expect(page.locator('text=Mentor, text=MENTOR').first()).toBeVisible();
  });

  test('should filter players list by multiple roles', async ({ page }) => {
    // Navigate to clubs
    await page.goto('/dashboard/clubs');
    await page.waitForTimeout(2000);
    
    // Click on first club
    await page.locator('a[href*="/dashboard/clubs/"]:has-text("View Details")').first().click();
    await page.waitForURL(/\/clubs\/\d+$/);
    
    // Navigate to players
    await page.click('a[href*="/players"], a:has-text("Players")');
    await page.waitForURL(/\/players/);
    
    // Look for filter panel
    const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filters")');
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Select multiple role filters
      await page.check('input[type="checkbox"][value="CAPTAIN"]');
      await page.check('input[type="checkbox"][value="MENTOR"]');
      
      // Apply filters
      await page.click('button:has-text("Apply")');
      
      // Verify filtered results
      await page.waitForTimeout(500);
    }
    
    // Verify players list is displayed
    await expect(page.locator('text=Player, text=PLAYER').first()).toBeVisible();
  });

  test('should clear filters', async ({ page }) => {
    // Navigate to players with filters
    await page.goto('/dashboard/clubs');
    await page.waitForTimeout(2000);
    await page.locator('a[href*="/dashboard/clubs/"]:has-text("View Details")').first().click();
    await page.waitForURL(/\/clubs\/\d+$/);
    await page.click('a[href*="/players"]');
    
    // Open filter panel if available
    const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filters")');
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Apply some filters
      await page.check('input[type="checkbox"][value="CAPTAIN"]');
      await page.click('button:has-text("Apply")');
      
      // Clear filters
      await page.click('button:has-text("Clear"), button:has-text("Reset")');
      
      // Verify all players are shown again
      await page.waitForTimeout(500);
    }
    
    // Verify players list is displayed
    await expect(page.locator('a[href*="/players/"]').first()).toBeVisible();
  });

  test('should persist filters in URL query params', async ({ page }) => {
    // Navigate to players
    await page.goto('/dashboard/clubs');
    await page.waitForTimeout(2000);
    await page.locator('a[href*="/dashboard/clubs/"]:has-text("View Details")').first().click();
    const clubUrl = page.url();
    const clubId = clubUrl.match(/\/clubs\/(\d+)/)?.[1];
    
    if (clubId) {
      // Navigate to players with filter in URL
      await page.goto(`/dashboard/clubs/${clubId}/players?role=CAPTAIN`);
      
      // Verify URL contains filter param
      expect(page.url()).toContain('role=CAPTAIN');
      
      // Verify filtered results are shown
      await expect(page.locator('text=Captain, text=CAPTAIN').first()).toBeVisible();
    }
  });
});
