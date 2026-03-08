import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Next.js 15 Async Params Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should handle async params in club details route', async ({ page }) => {
    // Navigate to clubs
    await page.goto('/dashboard/clubs');
    
    // Wait for clubs to load
    await page.waitForTimeout(2000);
    
    // Click on first "View Details" link
    await page.locator('a[href*="/dashboard/clubs/"]:has-text("View Details")').first().click();
    
    // Wait for navigation with async params
    await page.waitForURL(/\/clubs\/\d+$/);
    
    // Verify page loaded correctly
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Verify URL matches expected pattern
    expect(page.url()).toMatch(/\/clubs\/\d+$/);
  });

  test('should handle async params in club edit route', async ({ page }) => {
    // Navigate to clubs and select one
    await page.goto('/dashboard/clubs');
    await page.waitForTimeout(2000);
    await page.locator('a[href*="/dashboard/clubs/"]:has-text("View Details")').first().click();
    await page.waitForURL(/\/clubs\/\d+$/);
    
    // Click edit button
    await page.click('button:has-text("Edit"), a:has-text("Edit")');
    
    // Wait for edit page with async params
    await page.waitForURL(/\/clubs\/\d+\/edit/);
    
    // Verify form is loaded
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test('should handle async params in player details route', async ({ page }) => {
    // Navigate to a club's players
    await page.goto('/dashboard/clubs');
    await page.waitForTimeout(2000);
    await page.locator('a[href*="/dashboard/clubs/"]:has-text("View Details")').first().click();
    await page.waitForURL(/\/clubs\/\d+$/);
    
    // Navigate to players
    await page.click('a[href*="/players"]');
    await page.waitForURL(/\/players/);
    
    // Click on first player
    await page.waitForSelector('a[href*="/players/"]', { timeout: 5000 });
    await page.locator('a[href*="/players/"]').first().click();
    
    // Wait for player details with async params
    await page.waitForURL(/\/players\/\d+$/);
    
    // Verify page loaded
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should handle async params in player edit route', async ({ page }) => {
    // Navigate to a player
    await page.goto('/dashboard/clubs');
    await page.waitForTimeout(2000);
    await page.locator('a[href*="/dashboard/clubs/"]:has-text("View Details")').first().click();
    await page.waitForURL(/\/clubs\/\d+$/);
    
    await page.click('a[href*="/players"]');
    await page.waitForURL(/\/players/);
    
    await page.waitForSelector('a[href*="/players/"]', { timeout: 5000 });
    await page.locator('a[href*="/players/"]').first().click();
    await page.waitForURL(/\/players\/\d+$/);
    
    // Click edit
    await page.click('button:has-text("Edit"), a:has-text("Edit")');
    
    // Wait for edit page with async params
    await page.waitForURL(/\/players\/\d+\/edit/);
    
    // Verify form is loaded
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test('should handle async params in manager routes', async ({ page }) => {
    // Navigate to managers
    await page.goto('/dashboard/clubs');
    await page.waitForTimeout(2000);
    await page.locator('a[href*="/dashboard/clubs/"]:has-text("View Details")').first().click();
    await page.waitForURL(/\/clubs\/\d+$/);
    
    await page.click('a[href*="/managers"]');
    await page.waitForURL(/\/managers/);
    
    // Verify managers list loaded with async params
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should handle async params in captain routes', async ({ page }) => {
    // Navigate to captains
    await page.goto('/dashboard/clubs');
    await page.waitForTimeout(2000);
    await page.locator('a[href*="/dashboard/clubs/"]:has-text("View Details")').first().click();
    await page.waitForURL(/\/clubs\/\d+$/);
    
    await page.click('a[href*="/captains"]');
    await page.waitForURL(/\/captains/);
    
    // Verify captains list loaded with async params
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should handle async params in mentor routes', async ({ page }) => {
    // Navigate to mentors
    await page.goto('/dashboard/clubs');
    await page.waitForTimeout(2000);
    await page.locator('a[href*="/dashboard/clubs/"]:has-text("View Details")').first().click();
    await page.waitForURL(/\/clubs\/\d+$/);
    
    await page.click('a[href*="/mentors"]');
    await page.waitForURL(/\/mentors/);
    
    // Verify mentors list loaded with async params
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should handle async params when creating new members', async ({ page }) => {
    // Navigate to new member page
    await page.goto('/dashboard/clubs');
    await page.waitForTimeout(2000);
    await page.locator('a[href*="/dashboard/clubs/"]:has-text("View Details")').first().click();
    await page.waitForURL(/\/clubs\/\d+$/);
    
    await page.click('a[href*="/players"]');
    await page.waitForURL(/\/players/);
    
    await page.click('a[href*="/new"]');
    
    // Wait for new member page with async params
    await page.waitForURL(/\/new/);
    
    // Verify form is loaded
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test('should handle async params in API routes via form submissions', async ({ page }) => {
    // Create a new club (tests POST with async params)
    await page.goto('/dashboard/clubs/new');
    
    const clubName = `Async Test ${Date.now()}`;
    await page.fill('#club-name', clubName);
    await page.click('button[type="submit"]');
    
    // Wait for redirect after API call
    await page.waitForURL('/dashboard/clubs');
    
    // Wait for clubs to load
    await page.waitForTimeout(1000);
    
    // Verify club was created
    await expect(page.locator(`text=${clubName}`)).toBeVisible();
  });

  test('should handle async params when deleting resources', async ({ page }) => {
    // Create a club to delete
    await page.goto('/dashboard/clubs/new');
    const clubName = `Delete Async ${Date.now()}`;
    await page.fill('#club-name', clubName);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard/clubs');
    
    // Wait for clubs to load
    await page.waitForTimeout(2000);
    
    // Find the club card and click delete button
    const clubCard = page.locator(`text=${clubName}`).locator('..').locator('..').locator('..');
    await clubCard.locator('button:has-text("Delete")').click();
    
    // Confirm deletion in modal
    await page.waitForTimeout(500);
    await page.click('button:has-text("Delete"):not(:has-text("Cancel"))');
    
    // Wait for deletion
    await page.waitForTimeout(2000);
    
    // Verify deletion
    await expect(page.locator(`text=${clubName}`)).not.toBeVisible();
  });

  test('should handle async params in nested routes', async ({ page }) => {
    // Test deeply nested route with multiple async params
    await page.goto('/dashboard/clubs');
    await page.waitForTimeout(2000);
    
    // Navigate through nested routes
    await page.locator('a[href*="/dashboard/clubs/"]:has-text("View Details")').first().click();
    await page.waitForURL(/\/clubs\/\d+$/);
    
    const clubUrl = page.url();
    const clubId = clubUrl.match(/\/clubs\/(\d+)/)?.[1];
    
    // Navigate to players
    await page.click('a[href*="/players"]');
    await page.waitForURL(/\/clubs\/\d+\/players/);
    
    // Verify nested route with async params works
    expect(page.url()).toContain(`/clubs/${clubId}/players`);
    
    // Navigate to new player (nested with clubId param)
    await page.click('a[href*="/new"]');
    await page.waitForURL(/\/clubs\/\d+\/players\/new/);
    
    // Verify deeply nested route works
    expect(page.url()).toContain(`/clubs/${clubId}/players/new`);
  });
});
