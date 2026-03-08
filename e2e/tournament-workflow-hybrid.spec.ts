import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

/**
 * Hybrid test that uses API for setup and UI for verification
 * This approach is more reliable and faster than pure UI tests
 */
test.describe('Complete Tournament Workflow (Hybrid)', () => {
  let tournamentId: number;
  let tournamentName: string;
  let playerIds: number[] = [];

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    tournamentName = `E2E Tournament ${Date.now()}`;
  });

  test('should complete full tournament lifecycle', async ({ page, request }) => {
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    // Step 1: Create tournament via API
    await test.step('Create tournament via API', async () => {
      const response = await request.post('http://localhost:3000/api/tournaments', {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieHeader,
        },
        data: {
          name: tournamentName,
          description: 'End-to-end test tournament',
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
      tournamentId = tournament.id;
      
      console.log(`Created tournament ${tournamentId}: ${tournamentName}`);
    });

    // Step 2: Get players and add participants via API
    await test.step('Add participants from multiple clubs', async () => {
      // Get all players
      const playersResponse = await request.get('http://localhost:3000/api/players', {
        headers: { 'Cookie': cookieHeader },
      });
      
      expect(playersResponse.ok()).toBeTruthy();
      const players = await playersResponse.json();
      
      // Select first 4 players
      playerIds = players.slice(0, 4).map((p: any) => p.id);
      expect(playerIds.length).toBeGreaterThanOrEqual(2);
      
      // Add participants
      const participantsResponse = await request.post(
        `http://localhost:3000/api/tournaments/${tournamentId}/participants`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieHeader,
          },
          data: { playerIds },
        }
      );
      
      expect(participantsResponse.ok()).toBeTruthy();
      console.log(`Added ${playerIds.length} participants`);
    });

    // Step 3: Verify tournament in UI
    await test.step('Verify tournament appears in UI', async () => {
      await page.goto('/dashboard/tournaments');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator(`text=${tournamentName}`)).toBeVisible();
      
      // Navigate to tournament details
      await page.goto(`/dashboard/tournaments/${tournamentId}`);
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('h1, h2').filter({ hasText: tournamentName })).toBeVisible();
      await expect(page.locator('text=End-to-end test tournament')).toBeVisible();
    });

    // Step 4: Add match results via API
    await test.step('Add multiple match results', async () => {
      // Match 1: Player 0 wins against Player 1
      const match1Response = await request.post(
        `http://localhost:3000/api/tournaments/${tournamentId}/matches`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieHeader,
          },
          data: {
            matchDate: new Date().toISOString(),
            results: [
              {
                playerId: playerIds[0],
                outcome: 'WIN',
                goalsScored: 3,
                goalsConceded: 1,
              },
              {
                playerId: playerIds[1],
                outcome: 'LOSS',
                goalsScored: 1,
                goalsConceded: 3,
              },
            ],
          },
        }
      );
      
      expect(match1Response.ok()).toBeTruthy();
      
      // Match 2: Player 2 draws with Player 3
      const match2Response = await request.post(
        `http://localhost:3000/api/tournaments/${tournamentId}/matches`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieHeader,
          },
          data: {
            matchDate: new Date().toISOString(),
            results: [
              {
                playerId: playerIds[2],
                outcome: 'DRAW',
                goalsScored: 2,
                goalsConceded: 2,
              },
              {
                playerId: playerIds[3],
                outcome: 'DRAW',
                goalsScored: 2,
                goalsConceded: 2,
              },
            ],
          },
        }
      );
      
      expect(match2Response.ok()).toBeTruthy();
      console.log('Added 2 matches');
    });

    // Step 5: View and verify leaderboard in UI
    await test.step('View and verify leaderboard', async () => {
      await page.goto(`/dashboard/tournaments/${tournamentId}`);
      await page.waitForLoadState('networkidle');
      
      // Click on Leaderboard tab
      const leaderboardTab = page.locator('button:has-text("Leaderboard"), a:has-text("Leaderboard")');
      if (await leaderboardTab.isVisible()) {
        await leaderboardTab.click();
        await page.waitForTimeout(1000);
      }
      
      // Verify leaderboard table exists
      const table = page.locator('table, [role="table"]');
      await expect(table).toBeVisible();
      
      // Verify we have data rows
      const rows = page.locator('tbody tr, [role="row"]');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
      
      // Verify points column exists
      await expect(page.locator('text=/Points?/i')).toBeVisible();
      
      console.log('Leaderboard verified');
    });

    // Step 6: Edit tournament via UI
    await test.step('Edit tournament via UI', async () => {
      await page.goto(`/dashboard/tournaments/${tournamentId}/edit`);
      await page.waitForLoadState('networkidle');
      
      // Update description
      await page.fill('#description', 'Updated description for E2E test');
      
      // Update point system
      await page.fill('#points-per-win', '5');
      
      // Submit
      const navigationPromise = page.waitForURL(`/dashboard/tournaments/${tournamentId}`, { timeout: 15000 });
      await page.click('button[type="submit"]:has-text("Update Tournament")');
      await navigationPromise;
      
      await page.waitForLoadState('networkidle');
      
      // Verify changes
      await expect(page.locator('text=Updated description for E2E test')).toBeVisible();
      
      console.log('Tournament updated');
    });

    // Step 7: Delete tournament via UI
    await test.step('Delete tournament via UI', async () => {
      await page.goto(`/dashboard/tournaments/${tournamentId}`);
      await page.waitForLoadState('networkidle');
      
      // Click delete button
      await page.click('button:has-text("Delete Tournament"), button:has-text("Delete")');
      
      // Wait for confirmation dialog
      await page.waitForSelector('text=/delete|remove/i', { timeout: 5000 });
      
      // Confirm deletion
      await page.click('button:has-text("Delete"), button:has-text("Confirm")');
      
      // Wait for redirect
      await page.waitForURL('/dashboard/tournaments', { timeout: 15000 });
      await page.waitForTimeout(2000);
      
      // Verify tournament is gone
      const tournamentCard = page.locator(`text=${tournamentName}`);
      await expect(tournamentCard).not.toBeVisible();
      
      console.log('Tournament deleted');
    });
  });

  test('should verify all data updates correctly', async ({ page, request }) => {
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    // Create tournament
    const tournamentResponse = await request.post('http://localhost:3000/api/tournaments', {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      data: {
        name: `Data Test ${Date.now()}`,
        description: 'Testing data updates',
        startDate: new Date().toISOString(),
        pointsPerWin: 3,
        pointsPerDraw: 1,
        pointsPerLoss: 0,
        pointsPerGoalScored: 1,
        pointsPerGoalConceded: 0,
      },
    });

    const tournament = await tournamentResponse.json();
    const testTournamentId = tournament.id;

    // Get players
    const playersResponse = await request.get('http://localhost:3000/api/players', {
      headers: { 'Cookie': cookieHeader },
    });
    const players = await playersResponse.json();
    const testPlayerIds = players.slice(0, 2).map((p: any) => p.id);

    // Add participants
    await request.post(`http://localhost:3000/api/tournaments/${testTournamentId}/participants`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      data: { playerIds: testPlayerIds },
    });

    // Add match
    const matchResponse = await request.post(
      `http://localhost:3000/api/tournaments/${testTournamentId}/matches`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieHeader,
        },
        data: {
          matchDate: new Date().toISOString(),
          results: [
            {
              playerId: testPlayerIds[0],
              outcome: 'WIN',
              goalsScored: 2,
              goalsConceded: 0,
            },
            {
              playerId: testPlayerIds[1],
              outcome: 'LOSS',
              goalsScored: 0,
              goalsConceded: 2,
            },
          ],
        },
      }
    );

    const match = await matchResponse.json();

    // Verify leaderboard calculations
    const leaderboardResponse = await request.get(
      `http://localhost:3000/api/tournaments/${testTournamentId}/leaderboard`,
      {
        headers: { 'Cookie': cookieHeader },
      }
    );

    const leaderboard = await leaderboardResponse.json();
    
    // Winner should have 3 points (win) + 2 points (goals) = 5 points
    const winner = leaderboard.find((p: any) => p.playerId === testPlayerIds[0]);
    expect(winner).toBeDefined();
    expect(winner.totalPoints).toBe(5); // 3 for win + 2 for goals
    expect(winner.wins).toBe(1);
    expect(winner.goalsScored).toBe(2);

    // Loser should have 0 points
    const loser = leaderboard.find((p: any) => p.playerId === testPlayerIds[1]);
    expect(loser).toBeDefined();
    expect(loser.totalPoints).toBe(0);
    expect(loser.losses).toBe(1);

    // Clean up
    await request.delete(`http://localhost:3000/api/tournaments/${testTournamentId}`, {
      headers: { 'Cookie': cookieHeader },
    });

    console.log('Data verification complete');
  });
});
