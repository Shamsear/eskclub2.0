import { Page } from '@playwright/test';

/**
 * Helper function to login as admin
 */
export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  
  // Fill in login form
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin123');
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for navigation to dashboard
  await page.waitForURL('/dashboard');
}

/**
 * Helper function to logout
 */
export async function logout(page: Page) {
  // Click logout button (adjust selector based on your implementation)
  await page.click('button:has-text("Logout"), button:has-text("Sign out")');
  
  // Wait for redirect to login page
  await page.waitForURL('/login');
}

/**
 * Helper function to navigate to first club
 */
export async function navigateToFirstClub(page: Page) {
  await page.goto('/dashboard/clubs');
  
  // Wait for page to load
  await page.waitForTimeout(2000);
  
  // Click on first "View Details" link
  await page.locator('a[href*="/dashboard/clubs/"]:has-text("View Details")').first().click();
  
  // Wait for club details page
  await page.waitForURL(/\/clubs\/\d+$/);
}
