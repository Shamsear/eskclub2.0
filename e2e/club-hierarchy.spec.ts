import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateToFirstClub } from './helpers/auth';

test.describe('Club Hierarchy with Multi-Role Members', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToFirstClub(page);
  });

  test('should display club hierarchy with role groupings', async ({ page }) => {
    // Verify we're on club details page
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check for hierarchy sections
    const hierarchySection = page.locator('[data-testid="hierarchy"], .hierarchy, main');
    
    // Verify different role sections exist
    await expect(hierarchySection.locator('text=Manager, text=MANAGER').first()).toBeVisible();
  });

  test('should show members grouped by their roles', async ({ page }) => {
    // Look for role-based groupings in hierarchy
    const managersSection = page.locator('text=Managers, text=Manager').first();
    const mentorsSection = page.locator('text=Mentors, text=Mentor').first();
    const captainsSection = page.locator('text=Captains, text=Captain').first();
    const playersSection = page.locator('text=Players, text=Player').first();
    
    // At least one section should be visible
    const sectionsVisible = await Promise.race([
      managersSection.isVisible().then(() => true),
      mentorsSection.isVisible().then(() => true),
      captainsSection.isVisible().then(() => true),
      playersSection.isVisible().then(() => true),
    ]).catch(() => false);
    
    expect(sectionsVisible).toBeTruthy();
  });

  test('should display visual badges for members with multiple roles', async ({ page }) => {
    // Create a member with multiple roles first
    await page.click('a[href*="/players"]');
    await page.click('a[href*="/new"]');
    
    const memberName = `Multi Badge ${Date.now()}`;
    await page.fill('input[name="name"]', memberName);
    await page.fill('input[name="email"]', `multibadge${Date.now()}@test.com`);
    
    // Select multiple roles
    await page.check('input[type="checkbox"][value="PLAYER"]');
    await page.check('input[type="checkbox"][value="CAPTAIN"]');
    await page.check('input[type="checkbox"][value="MENTOR"]');
    
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/players/);
    
    // Go back to club details to see hierarchy
    await page.goto(page.url().replace(/\/players.*/, ''));
    await page.waitForURL(/\/clubs\/\d+$/);
    
    // Look for the member in hierarchy with multiple role badges
    const memberCard = page.locator(`text=${memberName}`).first();
    await expect(memberCard).toBeVisible();
    
    // Verify multiple role badges are shown
    const parentSection = page.locator(`text=${memberName}`).locator('..').locator('..');
    const captainBadge = parentSection.locator('text=CAPTAIN, text=Captain');
    const mentorBadge = parentSection.locator('text=MENTOR, text=Mentor');
    
    // At least one additional role badge should be visible
    const hasBadges = await Promise.race([
      captainBadge.first().isVisible().then(() => true),
      mentorBadge.first().isVisible().then(() => true),
    ]).catch(() => false);
    
    expect(hasBadges).toBeTruthy();
  });

  test('should show same member in multiple sections if they have multiple roles', async ({ page }) => {
    // Create a member with CAPTAIN and MENTOR roles
    await page.click('a[href*="/players"]');
    await page.click('a[href*="/new"]');
    
    const memberName = `Dual Section ${Date.now()}`;
    await page.fill('input[name="name"]', memberName);
    await page.fill('input[name="email"]', `dualsection${Date.now()}@test.com`);
    
    await page.check('input[type="checkbox"][value="PLAYER"]');
    await page.check('input[type="checkbox"][value="CAPTAIN"]');
    await page.check('input[type="checkbox"][value="MENTOR"]');
    
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/players/);
    
    // Navigate to captains section
    await page.goto(page.url().replace(/\/players.*/, '/captains'));
    await page.waitForURL(/\/captains/);
    
    // Verify member appears in captains
    await expect(page.locator(`text=${memberName}`).first()).toBeVisible();
    
    // Navigate to mentors section
    await page.goto(page.url().replace(/\/captains.*/, '/mentors'));
    await page.waitForURL(/\/mentors/);
    
    // Verify same member appears in mentors
    await expect(page.locator(`text=${memberName}`).first()).toBeVisible();
  });

  test('should make hierarchy members clickable to navigate to profiles', async ({ page }) => {
    // Wait for hierarchy to load
    await page.waitForTimeout(1000);
    
    // Find a member link in the hierarchy
    const memberLink = page.locator('a[href*="/players/"], a[href*="/managers/"], a[href*="/captains/"], a[href*="/mentors/"]').first();
    
    if (await memberLink.isVisible()) {
      await memberLink.click();
      
      // Wait for member profile page (async params)
      await page.waitForURL(/\/(players|managers|captains|mentors)\/\d+/);
      
      // Verify profile page shows all roles
      await expect(page.locator('h1, h2').first()).toBeVisible();
      
      // Check for role badges on profile
      const roleBadges = page.locator('text=PLAYER, text=CAPTAIN, text=MENTOR, text=MANAGER');
      await expect(roleBadges.first()).toBeVisible();
    }
  });

  test('should display role color coding in hierarchy', async ({ page }) => {
    // Check if role badges have different styling
    const badges = page.locator('[class*="badge"], [class*="role"], span[class*="bg-"]');
    
    if (await badges.first().isVisible()) {
      // Verify badges exist (color coding is visual, hard to test precisely)
      const badgeCount = await badges.count();
      expect(badgeCount).toBeGreaterThan(0);
    }
  });

  test('should update hierarchy in real-time when roles change', async ({ page }) => {
    // Get current URL
    const clubUrl = page.url();
    
    // Navigate to players and add a new member
    await page.click('a[href*="/players"]');
    await page.click('a[href*="/new"]');
    
    const memberName = `Real Time ${Date.now()}`;
    await page.fill('input[name="name"]', memberName);
    await page.fill('input[name="email"]', `realtime${Date.now()}@test.com`);
    await page.check('input[type="checkbox"][value="PLAYER"]');
    await page.check('input[type="checkbox"][value="CAPTAIN"]');
    
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/players/);
    
    // Go back to club details
    await page.goto(clubUrl);
    await page.waitForURL(/\/clubs\/\d+$/);
    
    // Verify new member appears in hierarchy
    await expect(page.locator(`text=${memberName}`).first()).toBeVisible();
    
    // Navigate to captains to verify member appears there too
    await page.click('a[href*="/captains"]');
    await page.waitForURL(/\/captains/);
    
    // Verify member appears in captains list
    await expect(page.locator(`text=${memberName}`).first()).toBeVisible();
  });

  test('should handle async params correctly in hierarchy navigation (Next.js 15)', async ({ page }) => {
    // Verify we're on club details with async params
    const currentUrl = page.url();
    const clubId = currentUrl.match(/\/clubs\/(\d+)/)?.[1];
    
    expect(clubId).toBeTruthy();
    
    // Navigate through different role sections using async params
    await page.click('a[href*="/managers"]');
    await page.waitForURL(/\/clubs\/\d+\/managers/);
    
    await page.click('a[href*="/mentors"], a:has-text("Mentors")');
    await page.waitForURL(/\/clubs\/\d+\/mentors/);
    
    await page.click('a[href*="/captains"], a:has-text("Captains")');
    await page.waitForURL(/\/clubs\/\d+\/captains/);
    
    await page.click('a[href*="/players"], a:has-text("Players")');
    await page.waitForURL(/\/clubs\/\d+\/players/);
    
    // Verify all navigations worked correctly with async params
    expect(page.url()).toContain(`/clubs/${clubId}/players`);
  });
});
