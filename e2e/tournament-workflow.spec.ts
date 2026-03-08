import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Complete Tournament Workflow', () => {
  let tournamentName: string;
  let tournamentId: string;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    tournamentName = `E2E Tournament ${Date.now()}`;
  });

  test('should complete full tournament lifecycle', async ({ page }) => {
    // Step 1: Create new tournament
    await test.step('Create new tournament', async () => {
      await page.goto('/dashboard/tournaments');
      await page.waitForLoadState('networkidle');
      
      // Click Create Tournament button
      await page.click('a[href="/dashboard/tournaments/new"], button:has-text("Create Tournament")');
      await page.waitForURL('/dashboard/tournaments/new');
      await page.waitForLoadState('networkidle');
      
      // Fill tournament form using label-based IDs
      await page.fill('#tournament-name', tournamentName);
      await page.fill('#description', 'End-to-end test tournament');
      
      // Set dates (start date: today, end date: 30 days from now)
      const today = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await page.fill('#start-date', today);
      await page.fill('#end-date', endDate);
      
      // Verify default point system values
      await expect(page.locator('#points-per-win')).toHaveValue('3');
      await expect(page.locator('#points-per-draw')).toHaveValue('1');
      await expect(page.locator('#points-per-loss')).toHaveValue('0');
      
      // Listen for console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log('Browser console error:', msg.text());
        }
      });
      
      // Wait for navigation after form submission
      const navigationPromise = page.waitForURL(/\/dashboard\/tournaments\/\d+$/, { timeout: 15000 });
      
      // Submit form
      await page.click('button[type="submit"]:has-text("Create Tournament")');
      
      // Wait for redirect to tournament details
      await navigationPromise;
      
      // Extract tournament ID from URL
      const url = page.url();
      const match = url.match(/\/tournaments\/(\d+)$/);
      expect(match).not.toBeNull();
      tournamentId = match![1];
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Verify tournament was created
      await expect(page.locator('h1, h2').filter({ hasText: tournamentName })).toBeVisible();
      await expect(page.locator('text=End-to-end test tournament')).toBeVisible();
    });

    // Step 2: Add participants from multiple clubs
    await test.step('Add participants from multiple clubs', async () => {
      // Navigate to participants page
      await page.click('a[href*="/participants"], button:has-text("Add Participants")');
      await page.waitForURL(/\/tournaments\/\d+\/participants$/);
      
      // Wait for player list to load
      await page.waitForSelector('input[type="checkbox"]', { timeout: 10000 });
      
      // Select first 4 players (should be from different clubs)
      const checkboxes = page.locator('input[type="checkbox"][name="playerIds"]');
      const count = await checkboxes.count();
      const playersToSelect = Math.min(4, count);
      
      for (let i = 0; i < playersToSelect; i++) {
        await checkboxes.nth(i).check();
      }
      
      // Submit participant selection
      await page.click('button[type="submit"]:has-text("Add"), button:has-text("Add Participants")');
      
      // Wait for success message or redirect
      await page.waitForTimeout(2000);
      
      // Verify participants were added
      await page.goto(`/dashboard/tournaments/${tournamentId}`);
      await page.waitForLoadState('networkidle');
      
      // Check participant count
      const participantText = page.locator('text=/\\d+ Participants?/');
      await expect(participantText).toBeVisible();
    });

    // Step 3: Add multiple match results
    await test.step('Add multiple match results', async () => {
      // Navigate to add match page
      await page.click('a[href*="/matches/new"], button:has-text("Add Match")');
      await page.waitForURL(/\/tournaments\/\d+\/matches\/new$/);
      
      // Fill match date
      const matchDate = new Date().toISOString().split('T')[0];
      await page.fill('input[name="matchDate"]', matchDate);
      
      // Add first player result
      await page.selectOption('select[name="results.0.playerId"]', { index: 1 });
      await page.click('input[name="results.0.outcome"][value="WIN"]');
      await page.fill('input[name="results.0.goalsScored"]', '3');
      await page.fill('input[name="results.0.goalsConceded"]', '1');
      
      // Add second player result
      const addPlayerButton = page.locator('button:has-text("Add Player")');
      if (await addPlayerButton.isVisible()) {
        await addPlayerButton.click();
      }
      
      await page.selectOption('select[name="results.1.playerId"]', { index: 2 });
      await page.click('input[name="results.1.outcome"][value="LOSS"]');
      await page.fill('input[name="results.1.goalsScored"]', '1');
      await page.fill('input[name="results.1.goalsConceded"]', '3');
      
      // Submit match result
      await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Add")');
      
      // Wait for redirect back to tournament details
      await page.waitForURL(/\/tournaments\/\d+$/);
      await page.waitForTimeout(2000);
      
      // Add second match
      await page.click('a[href*="/matches/new"], button:has-text("Add Match")');
      await page.waitForURL(/\/tournaments\/\d+\/matches\/new$/);
      
      await page.fill('input[name="matchDate"]', matchDate);
      
      // Different players for second match
      await page.selectOption('select[name="results.0.playerId"]', { index: 3 });
      await page.click('input[name="results.0.outcome"][value="DRAW"]');
      await page.fill('input[name="results.0.goalsScored"]', '2');
      await page.fill('input[name="results.0.goalsConceded"]', '2');
      
      const addPlayerButton2 = page.locator('button:has-text("Add Player")');
      if (await addPlayerButton2.isVisible()) {
        await addPlayerButton2.click();
      }
      
      await page.selectOption('select[name="results.1.playerId"]', { index: 4 });
      await page.click('input[name="results.1.outcome"][value="DRAW"]');
      await page.fill('input[name="results.1.goalsScored"]', '2');
      await page.fill('input[name="results.1.goalsConceded"]', '2');
      
      await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Add")');
      await page.waitForURL(/\/tournaments\/\d+$/);
      await page.waitForTimeout(2000);
    });

    // Step 4: View and verify leaderboard
    await test.step('View and verify leaderboard', async () => {
      // Navigate to leaderboard tab
      await page.click('button:has-text("Leaderboard"), a:has-text("Leaderboard")');
      await page.waitForTimeout(1000);
      
      // Verify leaderboard table exists
      await expect(page.locator('table, [role="table"]')).toBeVisible();
      
      // Verify leaderboard has data
      const rows = page.locator('tbody tr, [role="row"]');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
      
      // Verify columns exist (rank, player, stats, points)
      await expect(page.locator('text=/Rank|Position/i')).toBeVisible();
      await expect(page.locator('text=/Points?/i')).toBeVisible();
      
      // Verify winner has highest points (3 points for win)
      const firstRowPoints = page.locator('tbody tr, [role="row"]').first().locator('text=/\\d+/').last();
      const pointsText = await firstRowPoints.textContent();
      const points = parseInt(pointsText || '0');
      expect(points).toBeGreaterThanOrEqual(1); // At least 1 point (draw) or 3 (win)
    });

    // Step 5: Edit tournament
    await test.step('Edit tournament', async () => {
      // Navigate to edit page
      await page.click('a[href*="/edit"], button:has-text("Edit Tournament")');
      await page.waitForURL(/\/tournaments\/\d+\/edit$/);
      await page.waitForLoadState('networkidle');
      
      // Update tournament description
      await page.fill('#description', 'Updated description for E2E test');
      
      // Update point system
      await page.fill('#points-per-win', '5');
      await page.fill('#points-per-goal-scored', '1');
      
      // Submit changes
      await page.click('button[type="submit"]:has-text("Update Tournament")');
      
      // Wait for redirect
      await page.waitForURL(/\/tournaments\/\d+$/, { timeout: 10000 });
      await page.waitForTimeout(1000);
      
      // Verify changes
      await expect(page.locator('text=Updated description for E2E test')).toBeVisible();
    });

    // Step 6: Edit match result
    await test.step('Edit match result', async () => {
      // Navigate to matches tab
      await page.click('button:has-text("Matches"), a:has-text("Matches")');
      await page.waitForTimeout(1000);
      
      // Click edit on first match
      await page.locator('a[href*="/matches/"][href*="/edit"], button:has-text("Edit")').first().click();
      await page.waitForURL(/\/matches\/\d+\/edit$/);
      
      // Update goals
      await page.fill('input[name="results.0.goalsScored"]', '4');
      
      // Submit changes
      await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Update")');
      
      // Wait for redirect
      await page.waitForURL(/\/tournaments\/\d+$/);
      await page.waitForTimeout(2000);
      
      // Verify leaderboard updated
      await page.click('button:has-text("Leaderboard"), a:has-text("Leaderboard")');
      await page.waitForTimeout(1000);
      await expect(page.locator('table, [role="table"]')).toBeVisible();
    });

    // Step 7: Delete tournament
    await test.step('Delete tournament', async () => {
      // Navigate back to tournament details if not there
      await page.goto(`/dashboard/tournaments/${tournamentId}`);
      await page.waitForLoadState('networkidle');
      
      // Click delete button
      await page.click('button:has-text("Delete Tournament"), button:has-text("Delete")');
      
      // Wait for confirmation dialog
      await page.waitForSelector('text=/delete|remove/i', { timeout: 5000 });
      
      // Confirm deletion
      await page.click('button:has-text("Delete"), button:has-text("Confirm")');
      
      // Wait for redirect to tournaments list
      await page.waitForURL('/dashboard/tournaments', { timeout: 10000 });
      
      // Verify tournament is no longer in the list
      await page.waitForTimeout(2000);
      const tournamentCard = page.locator(`text=${tournamentName}`);
      await expect(tournamentCard).not.toBeVisible();
    });
  });

  test('should handle tournament with no participants gracefully', async ({ page }) => {
    // Create tournament without participants
    await page.goto('/dashboard/tournaments/new');
    await page.waitForLoadState('networkidle');
    
    const emptyTournamentName = `Empty Tournament ${Date.now()}`;
    await page.fill('#tournament-name', emptyTournamentName);
    
    const today = new Date().toISOString().split('T')[0];
    await page.fill('#start-date', today);
    
    await page.click('button[type="submit"]:has-text("Create Tournament")');
    await page.waitForURL(/\/tournaments\/\d+$/, { timeout: 10000 });
    
    // Verify empty states
    await page.click('button:has-text("Leaderboard"), a:has-text("Leaderboard")');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=/no participants|no data|empty/i')).toBeVisible();
    
    // Clean up
    await page.click('button:has-text("Delete")');
    await page.waitForSelector('text=/delete|remove/i');
    await page.click('button:has-text("Delete"), button:has-text("Confirm")');
    await page.waitForURL('/dashboard/tournaments');
  });

  test('should validate tournament form correctly', async ({ page }) => {
    await page.goto('/dashboard/tournaments/new');
    await page.waitForLoadState('networkidle');
    
    // Try to submit empty form
    await page.click('button[type="submit"]:has-text("Create Tournament")');
    
    // Verify validation errors appear
    await expect(page.locator('text=/required|invalid/i')).toBeVisible();
    
    // Fill name but invalid date range
    await page.fill('#tournament-name', 'Test Tournament');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    await page.fill('#start-date', today);
    await page.fill('#end-date', yesterday);
    
    await page.click('button[type="submit"]:has-text("Create Tournament")');
    
    // Verify date validation error
    await expect(page.locator('text=/end date|after|before/i')).toBeVisible();
  });
})