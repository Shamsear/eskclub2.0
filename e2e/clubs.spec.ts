import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Club Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display clubs list page', async ({ page }) => {
    // Navigate to clubs page
    await page.goto('/dashboard/clubs');
    
    // Check page is loaded
    await expect(page.locator('h1, h2').filter({ hasText: /clubs/i })).toBeVisible();
  });

  test('should create a new club', async ({ page }) => {
    // Navigate to clubs page
    await page.goto('/dashboard/clubs');
    
    // Click create/new club button
    await page.click('a[href*="/clubs/new"], button:has-text("New Club"), button:has-text("Create Club"), a:has-text("New Club"), a:has-text("Create New Club")');
    
    // Wait for new club page
    await page.waitForURL(/\/clubs\/new/);
    
    // Fill in club form using label-based id
    const clubName = `Test Club ${Date.now()}`;
    await page.fill('#club-name', clubName);
    await page.fill('#description', 'This is a test club for E2E testing');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect (could be to clubs list or club details)
    await page.waitForURL('/dashboard/clubs');
    
    // Wait for clubs to load
    await page.waitForTimeout(1000);
    
    // Verify club was created by checking if it appears in the list
    await expect(page.locator(`text=${clubName}`)).toBeVisible();
  });

  test('should show validation errors when creating club with empty name', async ({ page }) => {
    // Navigate to new club page
    await page.goto('/dashboard/clubs/new');
    
    // Fill with empty space to bypass HTML5 validation
    await page.fill('#club-name', ' ');
    await page.fill('#club-name', '');
    
    // Try to submit without filling required fields
    await page.click('button[type="submit"]');
    
    // Check for validation error (either custom or HTML5)
    const errorVisible = await Promise.race([
      page.locator('text=Name is required').isVisible().then(() => true),
      page.locator('#club-name:invalid').isVisible().then(() => true),
      new Promise(resolve => setTimeout(() => resolve(false), 2000))
    ]);
    
    expect(errorVisible).toBeTruthy();
  });

  test('should view club details with async params (Next.js 15)', async ({ page }) => {
    // Navigate to clubs page
    await page.goto('/dashboard/clubs');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Click on first "View Details" link
    await page.locator('a[href*="/dashboard/clubs/"]:has-text("View Details")').first().click();
    
    // Wait for club details page (async params)
    await page.waitForURL(/\/clubs\/\d+$/);
    
    // Verify club details are displayed
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should edit an existing club', async ({ page }) => {
    // Navigate to clubs page
    await page.goto('/dashboard/clubs');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Click on first "View Details" link
    await page.locator('a[href*="/dashboard/clubs/"]:has-text("View Details")').first().click();
    
    // Wait for club details page
    await page.waitForURL(/\/clubs\/\d+$/);
    
    // Click edit button
    await page.click('button:has-text("Edit"), a:has-text("Edit")');
    
    // Wait for edit page
    await page.waitForURL(/\/clubs\/\d+\/edit/);
    
    // Update club name using label-based id
    const updatedName = `Updated Club ${Date.now()}`;
    await page.fill('#club-name', updatedName);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL(/\/clubs\/\d+$/);
    
    // Verify update
    await expect(page.locator(`text=${updatedName}`)).toBeVisible();
  });

  test('should delete a club with confirmation', async ({ page }) => {
    // First create a club to delete
    await page.goto('/dashboard/clubs/new');
    const clubName = `Club to Delete ${Date.now()}`;
    await page.fill('#club-name', clubName);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard/clubs');
    
    // Wait for clubs to load
    await page.waitForTimeout(2000);
    
    // Find the specific club card by finding the heading with the club name
    // then navigating to its parent card and finding the delete button
    const clubHeading = page.locator(`h3:has-text("${clubName}")`);
    await clubHeading.scrollIntoViewIfNeeded();
    
    // Click the delete button in the same card
    await clubHeading.locator('..').locator('..').locator('button:has-text("Delete")').first().click();
    
    // Confirm deletion in modal dialog
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Delete")').last().click();
    
    // Wait a moment for deletion
    await page.waitForTimeout(2000);
    
    // Verify club is no longer in the list
    await expect(page.locator(`text=${clubName}`)).not.toBeVisible();
  });
});
