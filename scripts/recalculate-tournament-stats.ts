import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function recalculateTournamentStats(tournamentId: number) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`RECALCULATING PLAYER STATISTICS FOR TOURNAMENT ID: ${tournamentId}`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    // Get tournament info
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { id: true, name: true },
    });

    if (!tournament) {
      console.log(`❌ Tournament with ID ${tournamentId} not found`);
      return;
    }

    console.log(`Tournament: ${tournament.name}\n`);

    // Get all participants
    const participants = await prisma.tournamentParticipant.findMany({
      where: { tournamentId },
      select: { playerId: true },
    });

    console.log(`Found ${participants.length} participants\n`);

    // Delete existing stats
    await prisma.tournamentPlayerStats.deleteMany({
      where: { tournamentId },
    });

    console.log('✅ Cleared old statistics\n');

    // Recalculate for each player
    let statsCreated = 0;

    for (const participant of participants) {
      const playerId = participant.playerId;

      // Get all match results for this player in this tournament
      const results = await prisma.matchResult.findMany({
        where: {
          playerId,
          match: {
            tournamentId,
          },
        },
        select: {
          outcome: true,
          goalsScored: true,
          goalsConceded: true,
          pointsEarned: true,
          basePoints: true,
          conditionalPoints: true,
        },
      });

      if (results.length === 0) continue;

      // Calculate statistics
      const matchesPlayed = results.length;
      const wins = results.filter(r => r.outcome === 'WIN').length;
      const draws = results.filter(r => r.outcome === 'DRAW').length;
      const losses = results.filter(r => r.outcome === 'LOSS').length;
      const goalsScored = results.reduce((sum, r) => sum + r.goalsScored, 0);
      const goalsConceded = results.reduce((sum, r) => sum + r.goalsConceded, 0);
      const cleanSheets = results.filter(r => r.goalsConceded === 0).length;
      const totalPoints = results.reduce((sum, r) => sum + r.pointsEarned, 0);
      const conditionalPoints = results.reduce((sum, r) => sum + (r.conditionalPoints || 0), 0);

      console.log(`   Player ${playerId}: ${matchesPlayed} matches, ${cleanSheets} clean sheets, ${totalPoints} points`);

      // Create new stats
      await prisma.tournamentPlayerStats.create({
        data: {
          tournamentId,
          playerId,
          matchesPlayed,
          wins,
          draws,
          losses,
          goalsScored,
          goalsConceded,
          cleanSheets,
          totalPoints,
          conditionalPoints,
        },
      });

      statsCreated++;
    }

    console.log(`✅ Created statistics for ${statsCreated} players\n`);
    console.log(`${'='.repeat(80)}`);
    console.log('✅ STATISTICS RECALCULATION COMPLETE');
    console.log(`${'='.repeat(80)}\n`);

  } catch (error) {
    console.error('❌ Error during recalculation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Get tournament ID from command line
const tournamentId = parseInt(process.argv[2]);

if (isNaN(tournamentId)) {
  console.log('Usage: npx tsx scripts/recalculate-tournament-stats.ts <tournamentId>');
  console.log('Example: npx tsx scripts/recalculate-tournament-stats.ts 5');
  process.exit(1);
}

recalculateTournamentStats(tournamentId);
