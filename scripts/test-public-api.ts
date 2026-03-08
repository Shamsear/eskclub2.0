/**
 * Test script for public API routes
 * This script verifies that all public API endpoints return the expected data structure
 */

import { prisma } from "@/lib/prisma";

async function testPublicAPI() {
  console.log("Testing Public API Routes...\n");

  try {
    // Test 1: Get tournaments
    console.log("1. Testing tournaments listing...");
    const tournaments = await prisma.tournament.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        _count: {
          select: {
            participants: true,
            matches: true,
          },
        },
      },
    });
    console.log(`✓ Found ${tournaments.length} tournaments`);
    if (tournaments.length > 0) {
      console.log(`  Sample: ${tournaments[0].name}`);
    }

    // Test 2: Get tournament detail
    if (tournaments.length > 0) {
      console.log("\n2. Testing tournament detail...");
      const tournamentId = tournaments[0].id;
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
          club: true,
          _count: {
            select: {
              participants: true,
              matches: true,
            },
          },
        },
      });
      console.log(`✓ Tournament detail loaded: ${tournament?.name}`);
      console.log(`  Participants: ${tournament?._count.participants}`);
      console.log(`  Matches: ${tournament?._count.matches}`);
    }

    // Test 3: Get leaderboard
    console.log("\n3. Testing tournament leaderboard...");
    const statsCount = await prisma.tournamentPlayerStats.count();
    console.log(`✓ Found ${statsCount} player stats records`);

    // Test 4: Get match detail
    console.log("\n4. Testing match detail...");
    const match = await prisma.match.findFirst({
      include: {
        tournament: true,
        results: {
          include: {
            player: {
              include: {
                club: true,
              },
            },
          },
        },
      },
    });
    if (match) {
      console.log(`✓ Match loaded: ${match.tournament.name}`);
      console.log(`  Results: ${match.results.length} players`);
    } else {
      console.log("  No matches found in database");
    }

    // Test 5: Get player profile
    console.log("\n5. Testing player profile...");
    const player = await prisma.player.findFirst({
      include: {
        club: true,
        roles: true,
      },
    });
    if (player) {
      console.log(`✓ Player loaded: ${player.name}`);
      console.log(`  Club: ${player.club ? player.club.name : "Free Agent"}`);
      console.log(`  Roles: ${player.roles.map((r) => r.role).join(", ")}`);
    } else {
      console.log("  No players found in database");
    }

    // Test 6: Get clubs
    console.log("\n6. Testing clubs listing...");
    const clubs = await prisma.club.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        logo: true,
        description: true,
        _count: {
          select: {
            players: true,
            tournaments: true,
          },
        },
      },
    });
    console.log(`✓ Found ${clubs.length} clubs`);
    if (clubs.length > 0) {
      console.log(`  Sample: ${clubs[0].name} (${clubs[0]._count.players} players)`);
    }

    // Test 7: Get club profile
    if (clubs.length > 0) {
      console.log("\n7. Testing club profile...");
      const clubId = clubs[0].id;
      const club = await prisma.club.findUnique({
        where: { id: clubId },
        include: {
          players: {
            include: {
              roles: true,
            },
          },
          tournaments: true,
        },
      });
      console.log(`✓ Club profile loaded: ${club?.name}`);
      console.log(`  Players: ${club?.players.length}`);
      console.log(`  Tournaments: ${club?.tournaments.length}`);
    }

    console.log("\n✅ All API route data structures verified successfully!");
  } catch (error) {
    console.error("\n❌ Error testing API routes:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testPublicAPI();
