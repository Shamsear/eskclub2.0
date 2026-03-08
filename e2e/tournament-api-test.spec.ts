import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Tournament API Integration', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should create tournament via API and verify in UI', async ({ page, request }) => {
    // Get session cookie
    const cookies = await page.context().cookies();
    
    // Create tournament via API
    const tournamentName = `API Test Tournament ${Date.now()}`;
    const response = await request.post('http://localhost:3000/api/tournaments', {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; '),
      },
      data: {
        name: tournamentName,
        description: 'Created via API test',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        pointsPerWin: 3,
        pointsPerDraw: 1,
        pointsPerLoss: 0,
        pointsPerGoalScored: 0,
        pointsPerGoalConceded: 0,
      },
    });

    expect(response.ok()).toBeTruthy();
    const tournament = await response.json();
    expect(tournament.id).toBeDefined();
    expect(tournament.name).toBe(tournamentName);

    // Verify tournament appears in UI
    await page.goto('/dashboard/tournaments');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator(`text=${tournamentName}`)).toBeVisible();

    // Navigate to tournament details
    await page.goto(`/dashboard/tournaments/${tournament.id}`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1, h2').filter({ hasText: tournamentName })).toBeVisible();
    await expect(page.locator('text=Created via API test')).toBeVisible();

    // Clean up
    const deleteResponse = await request.delete(`http://localhost:3000/api/tournaments/${tournament.id}`, {
      headers: {
        'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; '),
      },
    });
    expect(deleteResponse.ok()).toBeTruthy();
  });

  test('should verify tournament form is accessible', async ({ page }) => {
    await page.goto('/dashboard/tournaments/new');
    await page.waitForLoadState('networkidle');
    
    // Verify form elements exist
    await expect(page.locator('#tournament-name')).toBeVisible();
    await expect(page.locator('#description')).toBeVisible();
    await expect(page.locator('#start-date')).toBeVisible();
    await expect(page.locator('#end-date')).toBeVisible();
    await expect(page.locator('#points-per-win')).toBeVisible();
    await expect(page.locator('#points-per-draw')).toBeVisible();
    await expect(page.locator('#points-per-loss')).toBeVisible();
    
    // Verify default values
    await expect(page.locator('#points-per-win')).toHaveValue('3');
    await expect(page.locator('#points-per-draw')).toHaveValue('1');
    await expect(page.locator('#points-per-loss')).toHaveValue('0');
    
    // Verify submit button exists
    await expect(page.locator('button[type="submit"]:has-text("Create Tournament")')).toBeVisible();
  });
});
