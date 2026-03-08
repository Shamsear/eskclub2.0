import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateToFirstClub } from './helpers/auth';

test.describe('Team Member Management with Roles', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToFirstClub(page);
  });

  test('should add team member with single role (PLAYER)', async ({ page }) => {
    // Click on players/members link
    await page.click('a[href*="/players"], a:has-text("Players"), a:has-text("Members")');
    
    // Click add new member button
    await page.click('a[href*="/new"], button:has-text("Add"), a:has-text("New")');
    
    // Fill in member details
    const memberName = `Player ${Date.now()}`;
    await page.fill('input[name="name"]', memberName);
    await page.fill('input[name="email"]', `player${Date.now()}@test.com`);
    await page.fill('input[name="phone"]', '+1234567890');
    
    // Ensure PLAYER role is selected (should be default)
    const playerCheckbox = page.locator('input[type="checkbox"][value="PLAYER"]');
    if (!await playerCheckbox.isChecked()) {
      await playerCheckbox.check();
    }
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL(/\/players|\/members/);
    
    // Verify member was created
    await expect(page.locator(`text=${memberName}`)).toBeVisible();
  });

  test('should add team member with multiple roles (CAPTAIN + MENTOR)', async ({ page }) => {
    // Navigate to add member page
    await page.click('a[href*="/players"], a:has-text("Players")');
    await page.click('a[href*="/new"], button:has-text("Add")');
    
    // Fill in member details
    const memberName = `Multi Role ${Date.now()}`;
    await page.fill('input[name="name"]', memberName);
    await page.fill('input[name="email"]', `multirole${Date.now()}@test.com`);
    
    // Select multiple roles
    await page.check('input[type="checkbox"][value="PLAYER"]');
    await page.check('input[type="checkbox"][value="CAPTAIN"]');
    await page.check('input[type="checkbox"][value="MENTOR"]');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL(/\/players|\/members/);
    
    // Verify member was created
    await expect(page.locator(`text=${memberName}`)).toBeVisible();
  });

  test('should add manager with MANAGER role', async ({ page }) => {
    // Navigate to managers section
    await page.click('a[href*="/managers"], a:has-text("Managers")');
    
    // Click add new manager
    await page.click('a[href*="/new"], button:has-text("Add")');
    
    // Fill in manager details
    const managerName = `Manager ${Date.now()}`;
    await page.fill('input[name="name"]', managerName);
    await page.fill('input[name="email"]', `manager${Date.now()}@test.com`);
    
    // Ensure MANAGER role is selected
    await page.check('input[type="checkbox"][value="MANAGER"]');
    await page.check('input[type="checkbox"][value="PLAYER"]');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL(/\/managers/);
    
    // Verify manager was created
    await expect(page.locator(`text=${managerName}`)).toBeVisible();
  });

  test('should show validation error when no roles selected', async ({ page }) => {
    // Navigate to add member page
    await page.click('a[href*="/players"]');
    await page.click('a[href*="/new"]');
    
    // Fill in basic details
    await page.fill('input[name="name"]', 'Test Member');
    await page.fill('input[name="email"]', `test${Date.now()}@test.com`);
    
    // Uncheck all roles if any are checked
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes.nth(i);
      if (await checkbox.isChecked()) {
        await checkbox.uncheck();
      }
    }
    
    // Try to submit
    await page.click('button[type="submit"]');
    
    // Check for validation error
    await expect(page.locator('text=/role.*required/i, text=/select.*role/i').first()).toBeVisible();
  });

  test('should edit team member roles', async ({ page }) => {
    // Navigate to players list
    await page.click('a[href*="/players"]');
    
    // Wait for members to load
    await page.waitForSelector('a[href*="/players/"]', { timeout: 5000 });
    
    // Click on first member
    const firstMemberLink = page.locator('a[href*="/players/"]').first();
    await firstMemberLink.click();
    
    // Wait for member details page (async params)
    await page.waitForURL(/\/players\/\d+/);
    
    // Click edit button
    await page.click('a[href*="/edit"], button:has-text("Edit")');
    
    // Wait for edit page
    await page.waitForURL(/\/players\/\d+\/edit/);
    
    // Add CAPTAIN role if not already present
    const captainCheckbox = page.locator('input[type="checkbox"][value="CAPTAIN"]');
    if (!await captainCheckbox.isChecked()) {
      await captainCheckbox.check();
    }
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL(/\/players\/\d+/);
    
    // Verify CAPTAIN role badge is displayed
    await expect(page.locator('text=CAPTAIN, text=Captain').first()).toBeVisible();
  });

  test('should remove role from team member', async ({ page }) => {
    // First, create a member with multiple roles
    await page.click('a[href*="/players"]');
    await page.click('a[href*="/new"]');
    
    const memberName = `Multi Role Edit ${Date.now()}`;
    await page.fill('input[name="name"]', memberName);
    await page.fill('input[name="email"]', `multiedit${Date.now()}@test.com`);
    
    await page.check('input[type="checkbox"][value="PLAYER"]');
    await page.check('input[type="checkbox"][value="CAPTAIN"]');
    await page.check('input[type="checkbox"][value="MENTOR"]');
    
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/players/);
    
    // Find and edit the member
    await page.click(`text=${memberName}`);
    await page.waitForURL(/\/players\/\d+/);
    await page.click('a[href*="/edit"]');
    await page.waitForURL(/\/edit/);
    
    // Remove MENTOR role
    await page.uncheck('input[type="checkbox"][value="MENTOR"]');
    
    // Submit form
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/players\/\d+/);
    
    // Verify MENTOR role is no longer displayed
    const mentorBadge = page.locator('text=MENTOR').first();
    await expect(mentorBadge).not.toBeVisible();
  });

  test('should delete team member', async ({ page }) => {
    // Create a member to delete
    await page.click('a[href*="/players"]');
    await page.click('a[href*="/new"]');
    
    const memberName = `Delete Member ${Date.now()}`;
    await page.fill('input[name="name"]', memberName);
    await page.fill('input[name="email"]', `delete${Date.now()}@test.com`);
    await page.check('input[type="checkbox"][value="PLAYER"]');
    
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/players/);
    
    // Find and click on the member
    await page.click(`text=${memberName}`);
    await page.waitForURL(/\/players\/\d+/);
    
    // Click delete button
    await page.click('button:has-text("Delete")');
    
    // Confirm deletion
    page.once('dialog', dialog => dialog.accept());
    
    // Wait for redirect to players list
    await page.waitForURL(/\/players/);
    
    // Verify member is no longer in the list
    await expect(page.locator(`text=${memberName}`)).not.toBeVisible();
  });
});
